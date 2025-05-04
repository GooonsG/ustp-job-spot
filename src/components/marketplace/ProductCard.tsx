
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSellerDialog } from '@/components/marketplace/MessageSellerDialog';
import { toast } from '@/hooks/use-toast';
import { useSavedItems } from '@/hooks/useSavedItems';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { Bookmark, Heart, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  condition: string;
  category: string;
  imageUrl: string | null;
  sellerName: string;
  sellerId: string;
  date: string;
}

export function ProductCard({
  id,
  title,
  price,
  condition,
  category,
  imageUrl,
  sellerName,
  sellerId,
  date
}: ProductCardProps) {
  const { saveItem, unsaveItem, isItemSaved } = useSavedItems();
  const [isSaved, setIsSaved] = useState(false);
  const { user } = useAuth();
  
  useEffect(() => {
    const checkIfSaved = async () => {
      if (user) {
        const saved = await isItemSaved(id, 'marketplace');
        setIsSaved(saved);
      }
    };
    
    checkIfSaved();
  }, [id, user]);
  
  const handleSaveItem = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save items",
        variant: "destructive",
      });
      return;
    }
    
    try {
      if (isSaved) {
        // Find the saved item id and unsave it
        const { data, error } = await supabase
          .from('saved_items')
          .select('id')
          .eq('user_id', user.id)
          .eq('item_id', id)
          .eq('item_type', 'marketplace')
          .single();
          
        if (error) throw error;
        
        const result = await unsaveItem(data.id);
        if (!result.success) throw new Error(result.error);
        
        setIsSaved(false);
        toast({
          title: "Item unsaved",
          description: "Item has been removed from your saved items",
        });
      } else {
        const result = await saveItem(id, 'marketplace');
        if (!result.success) throw new Error(result.error);
        
        setIsSaved(true);
        toast({
          title: "Item saved",
          description: "Item has been added to your saved items",
        });
      }
    } catch (error: any) {
      console.error('Error saving/unsaving item:', error);
      toast({
        title: "Operation failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  // Check if the current user is the seller
  const isCurrentUserSeller = user && user.id === sellerId;
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-w-16 aspect-h-9 bg-gray-100">
        <img
          src={imageUrl || '/placeholder.svg'}
          alt={title}
          className="object-cover w-full h-40"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder.svg';
          }}
        />
      </div>
      <CardContent className="p-4">
        <div className="mb-2 flex justify-between items-start">
          <h3 className="font-medium text-lg line-clamp-1">{title}</h3>
          {user && !isCurrentUserSeller && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-1 h-auto" 
              onClick={handleSaveItem}
            >
              <Bookmark className={`h-5 w-5 ${isSaved ? "fill-red-500 text-red-500" : ""}`} />
            </Button>
          )}
        </div>
        <p className="text-lg font-bold text-blue-700 mb-2">₱{price.toLocaleString()}</p>
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <span>{sellerName}</span>
          <span className="mx-2">•</span>
          <span>{new Date(date).toLocaleDateString()}</span>
        </div>
        <div className="flex flex-wrap gap-1 mb-2">
          <Badge variant="outline" className="text-xs">{condition}</Badge>
          <Badge variant="outline" className="text-xs">{category}</Badge>
        </div>
      </CardContent>
      <CardFooter className="px-4 py-3 border-t flex justify-between">
        {!isCurrentUserSeller && (
          <div className="flex gap-2">
            <MessageSellerDialog
              itemId={id}
              itemTitle={title}
              sellerId={sellerId}
              trigger={
                <Button variant="outline" size="sm" className="w-full">
                  <MessageSquare className="mr-2 h-4 w-4" /> Message
                </Button>
              }
            />
          </div>
        )}
        {isCurrentUserSeller && (
          <p className="text-sm text-gray-500 font-medium italic">Your listing</p>
        )}
      </CardFooter>
    </Card>
  );
}

// Also export as default for backward compatibility
export default ProductCard;
