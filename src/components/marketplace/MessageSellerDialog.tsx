
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthProvider';
import { Loader2, MessageSquare } from 'lucide-react';

interface MessageSellerDialogProps {
  productId: string;
  productTitle: string;
  sellerId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
}

interface MessageFormValues {
  message: string;
}

export function MessageSellerDialog({ productId, productTitle, sellerId, open, onOpenChange, trigger }: MessageSellerDialogProps) {
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
      const { error } = await supabase
        .from('marketplace_messages')
        .insert({
          product_id: productId,
          sender_id: user.id,
          receiver_id: sellerId,
          message: values.message
        });

      if (error) throw error;

      toast({
        title: "Message sent!",
        description: `Your message about ${productTitle} has been sent to the seller.`,
      });
      
      form.reset();
      onOpenChange(false);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <span style={{ display: 'none' }}></span>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px] rounded-xl shadow-lg border-gray-200">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-semibold text-ustp-darkblue">Message About {productTitle}</DialogTitle>
          <DialogDescription>
            Send a message to the seller about this item. They'll respond through the messaging system.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Your Message</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Hi, I'm interested in this item. Is it still available?" 
                      className="min-h-[150px] resize-none rounded-lg focus:ring-ustp-blue"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex gap-3 mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="rounded-lg font-medium"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="rounded-lg font-medium bg-ustp-blue hover:bg-ustp-darkblue text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Send Message
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
