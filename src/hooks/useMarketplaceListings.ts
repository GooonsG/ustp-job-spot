
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthProvider';

export type MarketplaceListing = {
  id: string;
  title: string;
  price: number;
  status: 'active' | 'sold';
  postedDate: string;
  views?: number;
  images?: string[];
  seller_id: string;
};

export function useMarketplaceListings() {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setListings([]);
      setLoading(false);
      return;
    }

    const fetchListings = async () => {
      try {
        const { data, error } = await supabase
          .from('marketplace_items')
          .select('*')
          .eq('seller_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform data to match UI expectations
        const transformedData = data.map(item => ({
          id: item.id,
          title: item.title,
          price: Number(item.price),
          status: 'active' as const, // We'd need to add a status field to the database for sold items
          postedDate: item.created_at,
          views: 0, // This would require a views tracking table
          images: item.images || [],
          seller_id: item.seller_id
        }));

        setListings(transformedData);
      } catch (err) {
        console.error('Error fetching marketplace listings:', err);
        setError('Failed to fetch your marketplace listings');
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [user]);

  return { listings, loading, error };
}
