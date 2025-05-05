
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '@/types/marketplace';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSellerDialog } from './MessageSellerDialog';
import { EditItemDialog } from './EditItemDialog';
import { useAuth } from '@/context/AuthProvider';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from '@/hooks/use-toast';
import { BookmarkCheck, Bookmark } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onProductUpdate: () => void;
  isSaved?: boolean;
  onToggleSave?: () => void;
}

const ProductCard = ({ product, onProductUpdate, isSaved = false, onToggleSave }: ProductCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isStudent } = useUserRole();
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const isOwner = user && product.seller_id === user.id;

  const handleMessageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to message sellers",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }
    setMessageDialogOpen(true);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditDialogOpen(true);
  };

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save items",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }
    if (onToggleSave) {
      onToggleSave();
    }
  };

  return (
    <>
      <Card 
        className="overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer h-full flex flex-col"
        onClick={() => navigate(`/marketplace/${product.id}`)}
      >
        <div className="relative h-48 overflow-hidden bg-gray-100">
          {(product.image_url || product.image) ? (
            <img 
              src={product.image_url || product.image} 
              alt={product.title} 
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-200 text-gray-500">
              No image available
            </div>
          )}
          <div className="absolute top-2 right-2 flex flex-col gap-2">
            {user && (
              <Button 
                variant="secondary" 
                size="icon" 
                className="rounded-full bg-white/80 hover:bg-white"
                onClick={handleSaveToggle}
              >
                {isSaved ? (
                  <BookmarkCheck className="h-5 w-5 text-green-600" />
                ) : (
                  <Bookmark className="h-5 w-5" />
                )}
              </Button>
            )}
          </div>
        </div>
        
        <CardContent className="flex-grow pt-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg line-clamp-2">{product.title}</h3>
            <Badge variant="secondary" className="ml-2 shrink-0">
              ₱{product.price.toFixed(2)}
            </Badge>
          </div>
          <p className="text-sm text-gray-500 line-clamp-2 mb-1">{product.description}</p>
          <div className="flex items-center text-xs text-gray-500 mt-1">
            <Badge variant="outline" className="mr-2">
              {product.condition}
            </Badge>
            <span>{product.category}</span>
          </div>
        </CardContent>
        
        <CardFooter className="border-t pt-3 pb-3 bg-gray-50">
          <div className="flex w-full justify-between">
            {isOwner ? (
              <Button variant="outline" size="sm" onClick={handleEditClick}>
                Edit
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={handleMessageClick}>
                Message Seller
              </Button>
            )}
            <div className="text-xs text-gray-500 flex items-center">
              {(product.seller_name || product.seller)?.substring(0, 15)}
            </div>
          </div>
        </CardFooter>
      </Card>

      {!isOwner && messageDialogOpen && (
        <MessageSellerDialog
          productId={product.id}
          productTitle={product.title}
          sellerId={product.seller_id || ''}
          open={messageDialogOpen}
          onOpenChange={setMessageDialogOpen}
        />
      )}

      {isOwner && editDialogOpen && (
        <EditItemDialog
          product={product}
          onSuccess={onProductUpdate}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        />
      )}
    </>
  );
};

export default ProductCard;
