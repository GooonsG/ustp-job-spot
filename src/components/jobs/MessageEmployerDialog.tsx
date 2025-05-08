
import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthProvider';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { Send, MessageSquare } from 'lucide-react';

interface MessageEmployerDialogProps {
  jobId: string;
  jobTitle: string;
  employerId: string;
  applicationId: string;
  trigger: React.ReactNode;
}

interface Message {
  id: string;
  senderId: string;
  senderEmail: string;
  message: string;
  createdAt: string;
  isSender: boolean;
}

export function MessageEmployerDialog({ 
  jobId, 
  jobTitle, 
  employerId, 
  applicationId, 
  trigger 
}: MessageEmployerDialogProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const fetchMessages = async () => {
    if (!user || !applicationId) return;
    
    setLoading(true);
    
    try {
      console.log("Fetching job application messages for:", applicationId);
      const { data, error } = await supabase
        .rpc('get_conversation_messages', {
          p_user_id: user.id,
          p_conversation_id: applicationId,
          p_conversation_type: 'job'
        });

      if (error) throw error;

      if (data) {
        console.log("Job application messages:", data);
        const formattedMessages = data.map((msg: any) => ({
          id: msg.id,
          senderId: msg.sender_id,
          senderEmail: msg.sender_email,
          message: msg.message,
          createdAt: msg.created_at,
          isSender: msg.is_sender
        }));

        setMessages(formattedMessages);
      }
    } catch (err: any) {
      console.error('Error fetching job application messages:', err);
      toast({
        title: "Error loading messages",
        description: "There was a problem loading the conversation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !applicationId) return;
    
    try {
      console.log("Sending job application message:", {
        p_sender_id: user.id,
        p_conversation_id: applicationId,
        p_conversation_type: 'job',
        p_message: newMessage
      });
      
      const { error } = await supabase
        .rpc('send_message', {
          p_sender_id: user.id,
          p_conversation_id: applicationId,
          p_conversation_type: 'job',
          p_message: newMessage
        });

      if (error) throw error;
      
      setNewMessage('');
      await fetchMessages();
    } catch (err: any) {
      console.error('Error sending message:', err);
      toast({
        title: "Failed to send message",
        description: err.message,
        variant: "destructive",
      });
    }
  };
  
  useEffect(() => {
    if (open) {
      fetchMessages();
      
      const channel = supabase.channel('job-message-updates')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'marketplace_messages',
          filter: `conversation_item_id=eq.${applicationId}`
        }, () => {
          fetchMessages();
        })
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [open, applicationId, user]);
  
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  const getInitials = (email: string) => {
    if (!email) return '?';
    const name = email.split('@')[0];
    return name.charAt(0).toUpperCase();
  };
  
  const formatTimeAgo = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return 'some time ago';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] h-[80vh] flex flex-col max-h-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Messages about {jobTitle}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 pr-4 my-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <MessageSquare className="h-12 w-12 text-gray-300 mb-2" />
              <p className="text-gray-500">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex ${message.isSender ? 'justify-end' : 'justify-start'}`}
                >
                  {!message.isSender && (
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarFallback>{getInitials(message.senderEmail)}</AvatarFallback>
                    </Avatar>
                  )}
                  <div>
                    <div 
                      className={`px-3 py-2 rounded-lg max-w-xs ${
                        message.isSender 
                          ? 'bg-ustp-blue text-white ml-auto rounded-br-none' 
                          : 'bg-gray-200 text-gray-800 rounded-bl-none'
                      }`}
                    >
                      <p className="break-words">{message.message}</p>
                    </div>
                    <p className={`text-xs mt-1 ${message.isSender ? 'text-right' : 'text-left'} text-gray-500`}>
                      {formatTimeAgo(message.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>
        
        <div className="mt-auto">
          <div className="flex space-x-2 items-center">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 rounded-full bg-gray-100 border-0 focus-visible:ring-ustp-blue px-4"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <Button 
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="rounded-full bg-ustp-blue hover:bg-ustp-darkblue"
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
