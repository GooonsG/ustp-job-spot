
import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Product } from '@/types/marketplace';
import { MessageSellerDialog } from '@/components/marketplace/MessageSellerDialog';
import { EditItemDialog } from '@/components/marketplace/EditItemDialog';
import { useAuth } from '@/context/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ViewDetails from '@/components/shared/ViewDetails';
import { MessageSquare, Edit, Trash2, Bookmark, BookmarkCheck } from 'lucide-react';
import { useSavedItems } from '@/hooks/useSavedItems';

interface ProductCardProps {
  product: Product;
  onProductUpdate: () => void;
}

const ProductCard = ({ product, onProductUpdate }: ProductCardProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { isItemSaved, saveItem, unsaveItem } = useSavedItems();
  const [saveLoading, setSaveLoading] = useState(false);
  
  const isOwner = user && product.seller_id === user.id;

  // Check if product is saved by current user
  useEffect(() => {
    if (!user) return;
    
    const checkSavedStatus = async () => {
      const saved = await isItemSaved(product.id, 'marketplace');
      setIsSaved(saved);
    };
    
    checkSavedStatus();
  }, [user, product.id, isItemSaved]);
  
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('marketplace_items')
        .delete()
        .eq('id', product.id);
        
      if (error) throw error;
      toast.success('Item deleted successfully');
      onProductUpdate();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete the item');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSave = async () => {
    if (!user) {
      toast.error('Please sign in to save items');
      return;
    }
    
    setSaveLoading(true);
    try {
      if (isSaved) {
        // Need to find the saved item id
        const { data } = await supabase
          .from('saved_items')
          .select('id')
          .eq('user_id', user.id)
          .eq('item_id', product.id)
          .eq('item_type', 'marketplace')
          .single();
          
        if (data) {
          const result = await unsaveItem(data.id);
          if (result.success) {
            setIsSaved(false);
            toast.success('Item removed from saved items');
          } else {
            throw new Error(result.error || 'Failed to unsave item');
          }
        }
      } else {
        const result = await saveItem(product.id, 'marketplace');
        if (result.success) {
          setIsSaved(true);
          toast.success('Item saved to your dashboard');
        } else {
          throw new Error(result.error || 'Failed to save item');
        }
      }
    } catch (error) {
      console.error('Error toggling save status:', error);
      toast.error('Failed to update saved status');
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 rounded-xl border border-gray-100 flex flex-col h-full">
        <div 
          className="h-56 overflow-hidden cursor-pointer relative"
          onClick={() => setDetailsOpen(true)}
        >
          <img
            src={product.image || (product.images && product.images.length > 0 ? product.images[0] : "/placeholder.svg")}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg";
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 px-4 py-2 bg-gradient-to-t from-black/50 to-transparent">
            <p className="text-white font-medium text-xl">${product.price.toFixed(2)}</p>
          </div>
          {/* Save button */}
          {user && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full h-8 w-8 p-0 shadow-md"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleSave();
              }}
              disabled={saveLoading}
            >
              {isSaved ? (
                <BookmarkCheck className="h-5 w-5 text-ustp-blue fill-ustp-blue" />
              ) : (
                <Bookmark className="h-5 w-5 text-gray-600 hover:text-ustp-blue" />
              )}
            </Button>
          )}
        </div>
        <CardContent 
          className="p-5 cursor-pointer flex-grow"
          onClick={() => setDetailsOpen(true)}
        >
          <h3 className="text-lg font-semibold line-clamp-1 mb-1">{product.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">{product.description}</p>
          <div className="flex justify-between text-xs font-medium">
            <span className="px-2 py-1 bg-gray-100 rounded-full text-gray-600">{product.condition}</span>
            <span className="px-2 py-1 bg-gray-100 rounded-full text-gray-600">{product.category}</span>
          </div>
        </CardContent>
        <CardFooter className="p-5 pt-0 flex justify-between border-t border-gray-100 mt-auto">
          {isOwner ? (
            <div className="flex gap-2 w-full">
              <Button 
                variant="outline" 
                className="flex-1 rounded-lg font-medium"
                onClick={() => setEditOpen(true)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button 
                variant="destructive" 
                className="flex-1 rounded-lg font-medium"
                onClick={handleDelete}
                disabled={loading}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {loading ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          ) : (
            <Button 
              className="w-full bg-ustp-blue hover:bg-ustp-darkblue text-white font-medium rounded-lg shadow-sm transition-all duration-300"
              onClick={() => setMessageOpen(true)}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Message Seller
            </Button>
          )}
        </CardFooter>
      </Card>
      
      {/* Product Details Modal */}
      <ViewDetails 
        open={detailsOpen} 
        onOpenChange={setDetailsOpen} 
        item={product} 
        itemType="product" 
        onContactClick={() => {
          setDetailsOpen(false);
          setMessageOpen(true);
        }}
      />
      
      {/* Edit Item Dialog */}
      {isOwner && (
        <EditItemDialog 
          open={editOpen}
          onOpenChange={setEditOpen}
          product={product}
          onSuccess={onProductUpdate}
        />
      )}
      
      {/* Message Seller Dialog */}
      {!isOwner && (
        <MessageSellerDialog 
          productId={product.id}
          productTitle={product.title}
          sellerId={product.seller_id || ""}
          open={messageOpen}
          onOpenChange={setMessageOpen}
        />
      )}
    </>
  );
};

export default ProductCard;
