
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthProvider';

export function useUserRole() {
  const { user } = useAuth();
  const [isEmployer, setIsEmployer] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkUserRole() {
      if (!user) {
        setIsEmployer(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setIsEmployer(data.role === 'employer');
      } catch (error) {
        console.error('Error checking user role:', error);
        setIsEmployer(false);
      } finally {
        setLoading(false);
      }
    }

    checkUserRole();
  }, [user]);

  // Add isStudent property that's the opposite of isEmployer
  return { isEmployer, isStudent: !isEmployer, loading };
}
