
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthProvider';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from '@/hooks/use-toast';
import { Home, User, LogOut, Bell, MessageSquare, MailIcon, ShoppingCart, Briefcase } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

export default function NavbarUser() {
  const { user, signOut } = useAuth();
  const { isStudent, isEmployer } = useUserRole();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    // Fetch unread messages count
    const fetchUnreadMessages = async () => {
      try {
        const { data, error } = await supabase.rpc('get_user_messages', {
          p_user_id: user.id
        });

        if (!error && data) {
          const count = data.reduce((total: number, conv: any) => total + conv.unread_count, 0);
          setUnreadCount(count);
        }
      } catch (err) {
        console.error('Error fetching unread messages:', err);
      }
    };

    fetchUnreadMessages();

    // Setup realtime subscription for messages
    const channel = supabase.channel('messages-badge-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'marketplace_messages'
      }, () => fetchUnreadMessages())
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'job_messages'
      }, () => fetchUnreadMessages())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to log out. Please try again.",
      });
    }
  };

  if (!user) {
    return <Button onClick={() => navigate('/auth')}>Sign In</Button>;
  }

  return (
    <div className="flex items-center gap-4">
      <Button variant="ghost" size="icon" onClick={() => navigate('/messages')} className="relative">
        <MessageSquare className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-red-500 text-xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="cursor-pointer">
            <AvatarImage src="/placeholder.svg" alt="User" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={() => navigate('/')}>
            <Home className="mr-2 h-4 w-4" />
            <span>Home</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/dashboard')}>
            <User className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/messages')}>
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>Messages</span>
            {unreadCount > 0 && (
              <Badge className="ml-auto bg-red-500">{unreadCount}</Badge>
            )}
          </DropdownMenuItem>
          {isStudent && (
            <DropdownMenuItem onClick={() => navigate('/marketplace')}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              <span>Marketplace</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => navigate('/jobs')}>
            <Briefcase className="mr-2 h-4 w-4" />
            <span>Jobs</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
