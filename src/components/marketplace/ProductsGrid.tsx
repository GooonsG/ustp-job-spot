
import { Product } from '@/types/marketplace';
import ProductCard from './ProductCard';

interface ProductsGridProps {
  products: Product[];
  onProductUpdate: () => void;
}

const ProductsGrid = ({ products, onProductUpdate }: ProductsGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {products.length > 0 ? (
        products.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product}
            onProductUpdate={onProductUpdate}
          />
        ))
      ) : (
        <div className="col-span-full text-center py-16 bg-white/50 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 animate-fade-in">
          <h3 className="text-xl font-medium text-gray-600 mb-2">No items found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default ProductsGrid;
