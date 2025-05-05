import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthProvider';
import { Loader2 } from 'lucide-react';

interface ApplyJobDialogProps {
  jobId: string;
  jobTitle: string;
  company: string;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface ApplicationFormValues {
  coverLetter: string;
}

export function ApplyJobDialog({ jobId, jobTitle, company, trigger, open: controlledOpen, onOpenChange: setControlledOpen }: ApplyJobDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  
  // Use either controlled or internal state
  const isControlled = controlledOpen !== undefined && setControlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? setControlledOpen : setInternalOpen;

  const form = useForm<ApplicationFormValues>({
    defaultValues: {
      coverLetter: '',
    },
  });

  const onSubmit = async (values: ApplicationFormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to apply for jobs",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Insert directly - this is now allowed because we created the table
      const { error } = await supabase
        .from('job_applications')
        .insert({
          job_id: jobId,
          applicant_id: user.id,
          cover_letter: values.coverLetter,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Application submitted!",
        description: `Your application for ${jobTitle} at ${company} has been submitted successfully.`,
      });
      
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: "Application failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Apply Now</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Apply for {jobTitle}</DialogTitle>
          <DialogDescription>
            Submit your application for {jobTitle} at {company}.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="coverLetter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover Letter</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell us why you're a good fit for this position..." 
                      className="min-h-[200px] resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Application'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
