import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Product } from '@/types/marketplace';
import { useAuth } from '@/context/AuthProvider';
import { Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { EditItemDialog } from './EditItemDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  index: number;
  onProductUpdate: () => void;
}

const ProductCard = ({ product, index, onProductUpdate }: ProductCardProps) => {
  const { user } = useAuth();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  // Check if the user is the owner of the product
  // If seller_id exists, use it, otherwise fallback to checking if not possible
  const isOwner = user?.id === product.seller_id;

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('marketplace_items')
        .delete()
        .eq('id', product.id);

      if (error) throw error;

      toast.success('Item deleted successfully');
      onProductUpdate();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-fade-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div 
        className="h-48 overflow-hidden group cursor-pointer"
        onClick={() => setDetailsDialogOpen(true)}
      >
        <img 
          src={product.image} 
          alt={product.title} 
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
      </div>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-lg text-ustp-darkblue">{product.title}</CardTitle>
        <CardDescription className="text-ustp-blue font-semibold">
          ₱{product.price.toFixed(2)}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span className="bg-ustp-gray/50 px-2 py-1 rounded-full">{product.category}</span>
          <span className="bg-ustp-gray/50 px-2 py-1 rounded-full">{product.condition}</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <span className="text-xs text-gray-500">Posted by {product.seller}</span>
        {isOwner ? (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setEditDialogOpen(true)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  size="sm"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your listing.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ) : (
          <Button 
            size="sm" 
            className="bg-ustp-blue text-white hover:bg-ustp-darkblue transition-colors duration-300"
            onClick={() => setDetailsDialogOpen(true)}
          >
            View Details
          </Button>
        )}
      </CardFooter>

      <EditItemDialog 
        open={editDialogOpen} 
        onOpenChange={setEditDialogOpen}
        product={product}
        onSuccess={onProductUpdate}
      />

      <ProductDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        product={product}
      />
    </Card>
  );
};

export default ProductCard;
