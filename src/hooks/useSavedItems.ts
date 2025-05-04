
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthProvider';

export type SavedItem = {
  id: string;
  itemId: string;
  itemType: 'job' | 'marketplace';
  title: string;
  company?: string;
  salary?: string;
  type?: string;
  price?: number;
  seller?: string;
  category?: string;
  savedAt: string;
};

export function useSavedItems(itemType?: 'job' | 'marketplace') {
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

    const fetchSavedItems = async () => {
      try {
        const { data, error } = await supabase
          .rpc('get_saved_items', { 
            p_user_id: user.id, 
            p_item_type: itemType 
          });

        if (error) throw error;

        if (data) {
          const formattedItems = data.map((item: any) => ({
            id: item.saved_id,
            itemId: item.item_id,
            itemType: item.item_type,
            title: item.title,
            company: item.company,
            salary: item.salary,
            type: item.job_type,
            price: item.price,
            seller: item.seller_name,
            category: item.category,
            savedAt: item.created_at
          }));

          setSavedItems(formattedItems);
        }
      } catch (err: any) {
        console.error('Error fetching saved items:', err);
        setError('Failed to fetch your saved items');
      } finally {
        setLoading(false);
      }
    };

    fetchSavedItems();
  }, [user, itemType]);

  const saveItem = async (itemId: string, type: 'job' | 'marketplace') => {
    if (!user) return { success: false, error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .rpc('save_item', { 
          p_user_id: user.id, 
          p_item_id: itemId, 
          p_item_type: type 
        });

      if (error) throw error;

      // Refresh the list
      const { data: newItem } = await supabase
        .rpc('get_saved_item_details', { 
          p_user_id: user.id, 
          p_item_id: itemId, 
          p_item_type: type 
        });

      if (newItem && newItem.length > 0) {
        const formattedItem = {
          id: newItem[0].saved_id,
          itemId: newItem[0].item_id,
          itemType: newItem[0].item_type,
          title: newItem[0].title,
          company: newItem[0].company,
          salary: newItem[0].salary,
          type: newItem[0].job_type,
          price: newItem[0].price,
          seller: newItem[0].seller_name,
          category: newItem[0].category,
          savedAt: newItem[0].created_at
        };
        
        setSavedItems([...savedItems, formattedItem]);
      }

      return { success: true };
    } catch (err: any) {
      console.error('Error saving item:', err);
      return { success: false, error: err.message };
    }
  };

  const unsaveItem = async (savedItemId: string) => {
    if (!user) return { success: false, error: 'User not authenticated' };

    try {
      const { error } = await supabase
        .rpc('unsave_item', { 
          p_user_id: user.id, 
          p_saved_id: savedItemId 
        });

      if (error) throw error;

      // Update local state
      setSavedItems(savedItems.filter(item => item.id !== savedItemId));
      return { success: true };
    } catch (err: any) {
      console.error('Error removing saved item:', err);
      return { success: false, error: err.message };
    }
  };

  const isItemSaved = async (itemId: string, type: 'job' | 'marketplace') => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .rpc('is_item_saved', { 
          p_user_id: user.id, 
          p_item_id: itemId, 
          p_item_type: type 
        });

      if (error) throw error;

      return data;
    } catch (err) {
      console.error('Error checking if item is saved:', err);
      return false;
    }
  };

  return { savedItems, loading, error, saveItem, unsaveItem, isItemSaved };
}
