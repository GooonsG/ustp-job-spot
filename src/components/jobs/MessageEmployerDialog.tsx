
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, MessageSquare } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthProvider';

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

export function MessageEmployerDialog({ 
  jobId, 
  jobTitle, 
  employerId, 
  applicationId,
  trigger 
}: MessageEmployerDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const form = useForm<MessageFormValues>({
    defaultValues: {
      message: '',
    },
  });

  const onSubmit = async (values: MessageFormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to send messages",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // If we have an application ID, we can send a message directly
      if (applicationId) {
        const { error } = await supabase
          .from('job_messages')
          .insert({
            application_id: applicationId,
            sender_id: user.id,
            message: values.message
          });

        if (error) throw error;
      } else {
        // No application ID, we need to check if there's an existing application
        const { data: applications, error: applicationError } = await supabase
          .from('job_applications')
          .select('id')
          .eq('job_id', jobId)
          .eq('applicant_id', user.id)
          .limit(1);

        if (applicationError) throw applicationError;

        if (applications && applications.length > 0) {
          // We found an application, use it to send a message
          const { error } = await supabase
            .from('job_messages')
            .insert({
              application_id: applications[0].id,
              sender_id: user.id,
              message: values.message
            });

          if (error) throw error;
        } else {
          // No application found, create one first
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
      }

      toast({
        title: "Message sent!",
        description: `Your message about ${jobTitle} has been sent.`,
      });
      
      form.reset();
      setOpen(false);
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
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Send Message About {jobTitle}</DialogTitle>
          <DialogDescription>
            Send a message to the employer about this job opportunity.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Textarea
            {...form.register('message')}
            placeholder="Write your message here..."
            className="min-h-[150px] resize-none"
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Message'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
