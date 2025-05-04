
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthProvider';

export type JobApplication = {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  appliedDate: string;
  status: string;
  type: string;
  coverLetter: string | null;
};

export function useJobApplications() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setApplications([]);
      setLoading(false);
      return;
    }

    const fetchApplications = async () => {
      try {
        // Use RPC to call the database function
        const { data, error } = await supabase
          .rpc('get_user_applications', { user_id: user.id });

        if (error) throw error;

        if (data) {
          const formattedApplications = data.map((app: any) => ({
            id: app.id,
            jobId: app.job_id,
            jobTitle: app.title,
            company: app.company,
            appliedDate: app.created_at,
            status: app.status,
            type: app.type,
            coverLetter: app.cover_letter
          }));

          setApplications(formattedApplications);
        }
      } catch (err: any) {
        console.error('Error fetching job applications:', err);
        setError('Failed to fetch your job applications');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [user]);

  const withdrawApplication = async (applicationId: string) => {
    if (!user) return { success: false, error: 'User not authenticated' };

    try {
      // Use RPC to call the database function
      const { error } = await supabase
        .rpc('delete_application', { app_id: applicationId, user_id: user.id });

      if (error) throw error;

      // Update local state
      setApplications(applications.filter(app => app.id !== applicationId));
      return { success: true };
    } catch (err: any) {
      console.error('Error withdrawing application:', err);
      return { success: false, error: err.message };
    }
  };

  return { applications, loading, error, withdrawApplication };
}
