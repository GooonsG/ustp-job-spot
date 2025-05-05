
import { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Product } from '@/types/marketplace';
import { MessageSellerDialog } from '@/components/marketplace/MessageSellerDialog';
import { EditItemDialog } from '@/components/marketplace/EditItemDialog';
import { useAuth } from '@/context/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ViewDetails from '@/components/shared/ViewDetails';

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
  
  const isOwner = user && product.seller_id === user.id;
  
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

  return (
    <>
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <div 
          className="h-48 overflow-hidden cursor-pointer"
          onClick={() => setDetailsOpen(true)}
        >
          <img
            src={product.image || "https://images.unsplash.com/photo-1588580000645-f43a65d97800?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"}
            alt={product.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg";
            }}
          />
        </div>
        <CardContent 
          className="p-4 cursor-pointer"
          onClick={() => setDetailsOpen(true)}
        >
          <h3 className="text-lg font-semibold line-clamp-1">{product.title}</h3>
          <p className="text-green-600 font-semibold">${product.price.toFixed(2)}</p>
          <p className="text-sm text-gray-600 line-clamp-2 mt-1">{product.description}</p>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>{product.condition}</span>
            <span>{product.category}</span>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between">
          {isOwner ? (
            <div className="flex gap-2 w-full">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setEditOpen(true)}
              >
                Edit
              </Button>
              <Button 
                variant="destructive" 
                className="flex-1"
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          ) : (
            <Button 
              className="w-full bg-ustp-blue text-white hover:bg-ustp-darkblue"
              onClick={() => setMessageOpen(true)}
            >
              Contact Seller
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
          trigger={
            <span style={{ display: 'none' }}></span>
          }
        />
      )}
    </>
  );
};

export default ProductCard;
