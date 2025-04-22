
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Product } from "@/types/marketplace";
import { useState } from "react";
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MessageSquare } from "lucide-react";

interface ProductDetailsDialogProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductDetailsDialog({ product, open, onOpenChange }: ProductDetailsDialogProps) {
  const [message, setMessage] = useState("");
  const [isSending, setSending] = useState(false);
  const { user } = useAuth();

  const handleSendMessage = async () => {
    if (!user) {
      toast.error("Please log in to send messages");
      return;
    }

    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    try {
      setSending(true);
      const { error } = await supabase.from("marketplace_messages").insert({
        sender_id: user.id,
        receiver_id: product.seller_id,
        product_id: product.id,
        message: message.trim()
      });

      if (error) throw error;

      toast.success("Message sent successfully!");
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-ustp-darkblue">
            {product.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="aspect-video overflow-hidden rounded-lg">
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg text-ustp-blue">₱{product.price.toFixed(2)}</h3>
              <p className="text-sm text-gray-500">Posted by {product.seller}</p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-gray-600">{product.description}</p>
            </div>

            <div className="flex gap-2">
              <span className="bg-ustp-gray/50 px-3 py-1 rounded-full text-sm">
                {product.category}
              </span>
              <span className="bg-ustp-gray/50 px-3 py-1 rounded-full text-sm">
                {product.condition}
              </span>
            </div>

            {user && user.id !== product.seller_id && (
              <div className="space-y-2">
                <h4 className="font-medium">Message the Seller</h4>
                <Textarea
                  placeholder="Write your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[100px]"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isSending}
                  className="w-full"
                >
                  <MessageSquare className="mr-2" />
                  {isSending ? "Sending..." : "Send Message"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
