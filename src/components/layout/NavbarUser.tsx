
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthProvider';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { UserCircle, LogOut, Settings } from 'lucide-react';

const NavbarUser = () => {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsOpen(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (!user) {
    return (
      <Link to="/auth">
        <Button variant="outline" className="border-ustp-blue text-ustp-blue hover:bg-ustp-blue hover:text-white">
          Login
        </Button>
      </Link>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative rounded-full w-10 h-10 p-0">
          <UserCircle className="h-6 w-6 text-ustp-blue" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer">
          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium">
              {user.email}
            </span>
            <span className="text-xs text-gray-500">
              USTP Student
            </span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/dashboard" className="cursor-pointer flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-500 focus:text-red-500">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NavbarUser;
