
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import NavBar from '@/components/layout/NavBar';
import Footer from '@/components/layout/Footer';
import MarketplaceFilters from '@/components/marketplace/MarketplaceFilters';
import ProductsGrid from '@/components/marketplace/ProductsGrid';
import PostItemForm from '@/components/marketplace/PostItemForm';
import { useAuth } from '@/context/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Product } from '@/types/marketplace';
import { useNavigate } from 'react-router-dom';

const Marketplace = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [sortOption, setSortOption] = useState('latest');
  const [postItemOpen, setPostItemOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('marketplace_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const productsWithId = data.map((item) => ({
        id: String(item.id),
        title: item.title,
        description: item.description,
        price: item.price, // Already a number, no need for parseFloat
        seller: item.seller_name,
        seller_id: item.seller_id, // Include seller_id
        category: item.category,
        condition: item.condition,
        images: item.images || [],
        // For backwards compatibility if needed
        image: item.images && item.images.length > 0 ? item.images[0] : "https://images.unsplash.com/photo-1588580000645-f43a65d97800?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        createdAt: item.created_at
      }));

      setProducts(productsWithId);
      setFilteredProducts(productsWithId);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load marketplace items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = [...products];
    
    if (category !== 'all') {
      result = result.filter(product => product.category.toLowerCase() === category.toLowerCase());
    }
    
    if (searchTerm) {
      result = result.filter(product => 
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (sortOption === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortOption === 'latest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    
    setFilteredProducts(result);
  }, [products, searchTerm, category, sortOption]);

  const handlePostItem = () => {
    if (!user) {
      toast.error('You must be logged in to post an item');
      navigate('/auth');
      return;
    }
    
    setPostItemOpen(true);
  };

  const refreshProducts = () => {
    fetchProducts();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-grow bg-gradient-to-br from-white to-ustp-gray">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 animate-fade-in">
            <h1 className="text-4xl font-bold text-ustp-darkblue mb-2">USTP Marketplace</h1>
            <p className="text-gray-600 text-lg">Buy, sell, or trade items with fellow USTP students</p>
          </div>
          
          <MarketplaceFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            category={category}
            setCategory={setCategory}
            sortOption={sortOption}
            setSortOption={setSortOption}
          />
          
          <div className="mb-4 flex justify-end">
            <Button 
              className="bg-ustp-yellow text-black hover:brightness-95 transform transition-all duration-300 hover:scale-105 active:scale-95"
              onClick={handlePostItem}
            >
              + Post Item for Sale
            </Button>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center min-h-[300px]">
              <p className="text-lg text-gray-600">Loading marketplace items...</p>
            </div>
          ) : (
            <ProductsGrid products={filteredProducts} onProductUpdate={refreshProducts} />
          )}
        </div>
      </main>
      <Footer />
      
      <PostItemForm 
        open={postItemOpen} 
        onOpenChange={setPostItemOpen} 
        onSuccess={refreshProducts}
      />
    </div>
  );
};

export default Marketplace;
