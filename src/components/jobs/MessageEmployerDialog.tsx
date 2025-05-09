
import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, MessageSquare, Send } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthProvider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { NoMessagesState, LoadingIndicator, ErrorMessage } from '../dashboard/LoadingErrorStates';

interface MessageEmployerDialogProps {
  jobId: string;
  jobTitle: string;
  employerId: string;
  trigger?: React.ReactNode;
  applicationId?: string;
}

interface MessageFormValues {
  message: string;
}

interface Message {
  id: string;
  senderId: string;
  senderEmail: string;
  message: string;
  createdAt: string;
  isSender: boolean;
}

// Type for the database response to better handle the conversion
interface MessageResponse {
  id: string;
  sender_id: string;
  sender_email: string;
  message: string;
  created_at: string;
  is_sender: boolean;
}

export function MessageEmployerDialog({ 
  jobId, 
  jobTitle, 
  employerId, 
  applicationId,
  trigger 
}: MessageEmployerDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentApplicationId, setCurrentApplicationId] = useState<string | undefined>(applicationId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const form = useForm<MessageFormValues>({
    defaultValues: {
      message: '',
    },
  });

  // Fetch messages when dialog opens
  useEffect(() => {
    if (open && user) {
      fetchMessages();
    }
    
    // Setup real-time subscription when dialog is open
    if (open && currentApplicationId) {
      const channel = supabase.channel('job-messages-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'job_messages',
          filter: `application_id=eq.${currentApplicationId}`,
        }, () => {
          fetchMessages();
        })
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [open, currentApplicationId, user]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current && messages.length > 0) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const fetchMessages = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      if (currentApplicationId) {
        // If we already have an application ID, fetch messages directly
        const { data, error: messagesError } = await supabase
          .rpc('get_conversation_messages', {
            p_user_id: user.id,
            p_conversation_id: currentApplicationId,
            p_conversation_type: 'job'
          });

        if (messagesError) throw messagesError;
        
        if (data) {
          // Transform the data from snake_case to camelCase
          const formattedMessages: Message[] = (data as MessageResponse[]).map(msg => ({
            id: msg.id,
            senderId: msg.sender_id,
            senderEmail: msg.sender_email,
            message: msg.message,
            createdAt: msg.created_at,
            isSender: msg.is_sender
          }));
          
          setMessages(formattedMessages);
        }
      } else {
        // Check if there's an existing application
        const { data: applications, error: applicationError } = await supabase
          .from('job_applications')
          .select('id')
          .eq('job_id', jobId)
          .eq('applicant_id', user.id)
          .limit(1);

        if (applicationError) throw applicationError;

        if (applications && applications.length > 0) {
          setCurrentApplicationId(applications[0].id);
          
          // Now fetch messages for this application
          const { data, error: messagesError } = await supabase
            .rpc('get_conversation_messages', {
              p_user_id: user.id,
              p_conversation_id: applications[0].id,
              p_conversation_type: 'job'
            });

          if (messagesError) throw messagesError;
          
          if (data) {
            // Transform the data from snake_case to camelCase
            const formattedMessages: Message[] = (data as MessageResponse[]).map(msg => ({
              id: msg.id,
              senderId: msg.sender_id,
              senderEmail: msg.sender_email,
              message: msg.message,
              createdAt: msg.created_at,
              isSender: msg.is_sender
            }));
            
            setMessages(formattedMessages);
          }
        }
      }
    } catch (err: any) {
      console.error('Error fetching messages:', err);
      setError('Could not load messages. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: MessageFormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to send messages",
        variant: "destructive",
      });
      return;
    }

    if (!values.message.trim()) return;

    setIsSubmitting(true);
    
    try {
      // If we have an application ID, we can send a message directly
      if (currentApplicationId) {
        const { error } = await supabase
          .from('job_messages')
          .insert({
            application_id: currentApplicationId,
            sender_id: user.id,
            message: values.message
          });

        if (error) throw error;
      } else {
        // No application ID, we need to create an application first
        const { data: newApplication, error: newApplicationError } = await supabase
          .from('job_applications')
          .insert({
            job_id: jobId,
            applicant_id: user.id,
            status: 'inquiry'
          })
          .select();

        if (newApplicationError) throw newApplicationError;

        if (newApplication && newApplication.length > 0) {
          // Set the current application ID
          setCurrentApplicationId(newApplication[0].id);
          
          // Now send the message
          const { error } = await supabase
            .from('job_messages')
            .insert({
              application_id: newApplication[0].id,
              sender_id: user.id,
              message: values.message
            });

          if (error) throw error;
        }
      }

      // Clear the form
      form.reset();
      
      // Fetch the updated messages
      fetchMessages();
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format message time
  const formatMessageTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();
      
      if (isToday) {
        return format(date, 'h:mm a');
      } else {
        return format(date, 'MMM d, h:mm a');
      }
    } catch (error) {
      return '';
    }
  };

  // Get the first character of email for avatar
  const getAvatarFallback = (email: string | null | undefined) => {
    if (!email) return '?';
    return email.charAt(0).toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <MessageSquare className="h-4 w-4 mr-2" />
            Message
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px] sm:max-h-[80vh] h-[550px] flex flex-col">
        <DialogHeader>
          <DialogTitle>Messages about {jobTitle}</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden mt-2">
          <ScrollArea className="h-[350px] pr-4">
            {loading && messages.length === 0 ? (
              <LoadingIndicator />
            ) : error ? (
              <ErrorMessage message={error} />
            ) : messages.length > 0 ? (
              <div className="space-y-4 py-2">
                {messages.map((message, index) => {
                  const showAvatar = index === 0 || 
                    (messages[index - 1] && messages[index - 1].senderId !== message.senderId);
                  
                  return (
                    <div 
                      key={message.id} 
                      className={`flex ${message.isSender ? 'justify-end' : 'justify-start'}`}
                    >
                      {!message.isSender && showAvatar && (
                        <Avatar className="h-8 w-8 mr-2 mt-1 flex-shrink-0">
                          <AvatarFallback>{getAvatarFallback(message.senderEmail)}</AvatarFallback>
                        </Avatar>
                      )}
                      {!message.isSender && !showAvatar && (
                        <div className="w-8 mr-2" />
                      )}
                      <div 
                        className={`max-w-[80%] p-3 ${
                          message.isSender 
                            ? 'bg-ustp-blue text-white rounded-t-lg rounded-bl-lg' 
                            : 'bg-gray-200 text-gray-800 rounded-t-lg rounded-br-lg'
                        }`}
                      >
                        <p className="text-sm">{message.message}</p>
                        <div className={`text-xs mt-1 text-right ${message.isSender ? 'text-blue-100' : 'text-gray-500'}`}>
                          {formatMessageTime(message.createdAt)}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            ) : (
              <NoMessagesState message="No messages yet. Start the conversation!" />
            )}
          </ScrollArea>
        </div>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4">
          <div className="flex gap-2">
            <Textarea
              {...form.register('message')}
              placeholder="Type your message..."
              className="min-h-[80px] resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  form.handleSubmit(onSubmit)();
                }
              }}
            />
          </div>
          
          <div className="flex justify-end mt-4">
            <Button type="submit" disabled={isSubmitting} className="bg-ustp-blue hover:bg-ustp-darkblue">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
