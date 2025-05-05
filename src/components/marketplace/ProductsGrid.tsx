
import { Product } from '@/types/marketplace';
import ProductCard from './ProductCard';

interface ProductsGridProps {
  products: Product[];
  onProductUpdate: () => void;
}

const ProductsGrid = ({ products, onProductUpdate }: ProductsGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.length > 0 ? (
        products.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product}
            onProductUpdate={onProductUpdate}
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
