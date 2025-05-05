
import { Product } from '@/types/marketplace';
import ProductCard from './ProductCard';
import { SavedItem, useSavedItems } from '@/hooks/useSavedItems';
import { useAuth } from '@/context/AuthProvider';
import { useEffect, useState } from 'react';

interface ProductsGridProps {
  products: Product[];
  onProductUpdate: () => void;
}

const ProductsGrid = ({ products, onProductUpdate }: ProductsGridProps) => {
  const { user } = useAuth();
  const { savedItems, saveItem, unsaveItem, isItemSaved } = useSavedItems();
  const [savedItemsMap, setSavedItemsMap] = useState<Record<string, SavedItem>>({});

  // Populate saved items map on component mount and when savedItems changes
  useEffect(() => {
    const newSavedItemsMap: Record<string, SavedItem> = {};
    savedItems.forEach(item => {
      if (item.itemType === 'marketplace') {
        newSavedItemsMap[item.itemId] = item;
      }
    });
    setSavedItemsMap(newSavedItemsMap);
  }, [savedItems]);

  const handleToggleSave = async (product: Product) => {
    if (!user) return;

    if (savedItemsMap[product.id]) {
      const result = await unsaveItem(savedItemsMap[product.id].id);
      if (result.success) {
        // Item was successfully unsaved
        const newMap = { ...savedItemsMap };
        delete newMap[product.id];
        setSavedItemsMap(newMap);
      }
    } else {
      const result = await saveItem(product.id, 'marketplace');
      if (result.success) {
        // We'll let the useEffect update the savedItemsMap 
        // when savedItems changes
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.length > 0 ? (
        products.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product}
            onProductUpdate={onProductUpdate}
            isSaved={!!savedItemsMap[product.id]}
            onToggleSave={() => handleToggleSave(product)}
          />
        ))
      ) : (
        <div className="col-span-3 text-center py-12 animate-fade-in">
          <h3 className="text-xl font-semibold text-gray-600">No items found</h3>
          <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default ProductsGrid;
