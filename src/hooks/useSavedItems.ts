
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthProvider';

export type SavedItem = {
  id: string;
  type: 'job' | 'marketplace';
  title: string;
  company?: string;
  price?: number;
  seller?: string;
  savedDate: string;
};

export function useSavedItems() {
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setSavedItems([]);
      setLoading(false);
      return;
    }

    // This is a placeholder for a real implementation
    // In a real app, you would have a saved_items table
    const fetchSavedItems = async () => {
      try {
        // Since we don't have a saved_items table yet,
        // we'll create example data based on existing marketplace items and jobs
        
        // Fetch some marketplace items
        const { data: marketplaceItems, error: marketplaceError } = await supabase
          .from('marketplace_items')
          .select('id, title, price, seller_name, created_at')
          .limit(1);

        if (marketplaceError) throw marketplaceError;

        // Fetch some jobs
        const { data: jobs, error: jobsError } = await supabase
          .from('jobs')
          .select('id, title, company, posted_date')
          .limit(1);

        if (jobsError) throw jobsError;

        // Transform to saved items format
        const mockSavedItems: SavedItem[] = [
          ...marketplaceItems.map(item => ({
            id: item.id,
            type: 'marketplace' as const,
            title: item.title,
            price: Number(item.price),
            seller: item.seller_name,
            savedDate: new Date().toISOString()
          })),
          ...jobs.map(job => ({
            id: job.id,
            type: 'job' as const,
            title: job.title,
            company: job.company,
            savedDate: new Date().toISOString()
          }))
        ];

        setSavedItems(mockSavedItems);
      } catch (err) {
        console.error('Error fetching saved items:', err);
        setError('Failed to fetch your saved items');
      } finally {
        setLoading(false);
      }
    };

    fetchSavedItems();
  }, [user]);

  return { savedItems, loading, error };
}
