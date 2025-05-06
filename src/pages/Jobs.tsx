import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import NavBar from '@/components/layout/NavBar';
import Footer from '@/components/layout/Footer';
import { Badge } from '@/components/ui/badge';
import { PostJobDialog } from '@/components/jobs/PostJobDialog';
import { ApplyJobDialog } from '@/components/jobs/ApplyJobDialog';
import { MessageEmployerDialog } from '@/components/jobs/MessageEmployerDialog';
import { Toaster } from '@/components/ui/toaster';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/context/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useSavedItems } from '@/hooks/useSavedItems';
import { Bookmark, MessageSquare } from 'lucide-react';
import ViewDetails from '@/components/shared/ViewDetails';
import { Job } from '@/types/marketplace';
const Jobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [jobType, setJobType] = useState('all');
  const [sortOption, setSortOption] = useState('latest');
  const {
    isEmployer
  } = useUserRole();
  const {
    user
  } = useAuth();
  const {
    saveItem,
    unsaveItem,
    isItemSaved
  } = useSavedItems();
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  useEffect(() => {
    fetchJobs();
    subscribeToJobs();
  }, []);
  useEffect(() => {
    if (user && jobs.length > 0) {
      checkSavedJobs();
    }
  }, [user, jobs]);
  const fetchJobs = async () => {
    const {
      data,
      error
    } = await supabase.from('jobs').select('*').order('posted_date', {
      ascending: false
    });
    if (error) {
      console.error('Error fetching jobs:', error);
      return;
    }

    // Transform data to match the Job interface
    const jobsWithLogo = data?.map(job => ({
      ...job,
      logo: job.logos && job.logos.length > 0 ? job.logos[0] : undefined
    })) || [];
    setJobs(jobsWithLogo);
    setFilteredJobs(jobsWithLogo);
  };
  const checkSavedJobs = async () => {
    const savedIds = new Set<string>();
    for (const job of jobs) {
      const isSaved = await isItemSaved(job.id, 'job');
      if (isSaved) {
        savedIds.add(job.id);
      }
    }
    setSavedJobIds(savedIds);
  };
  const subscribeToJobs = () => {
    const channel = supabase.channel('jobs-changes').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'jobs'
    }, payload => {
      console.log('Change received!', payload);
      fetchJobs(); // Refresh the jobs list
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  };
  const handleSaveJob = async (jobId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save jobs",
        variant: "destructive"
      });
      return;
    }
    try {
      const isSaved = savedJobIds.has(jobId);
      if (isSaved) {
        // Find the saved item id for this job and unsave it
        const {
          data,
          error
        } = await supabase.from('saved_items').select('id').eq('user_id', user.id).eq('item_id', jobId).eq('item_type', 'job').single();
        if (error) throw error;
        const result = await unsaveItem(data.id);
        if (!result.success) throw new Error(result.error);

        // Update local state
        setSavedJobIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(jobId);
          return newSet;
        });
        toast({
          title: "Job unsaved",
          description: "Job has been removed from your saved items"
        });
      } else {
        // Save the job
        const result = await saveItem(jobId, 'job');
        if (!result.success) throw new Error(result.error);

        // Update local state
        setSavedJobIds(prev => {
          const newSet = new Set(prev);
          newSet.add(jobId);
          return newSet;
        });
        toast({
          title: "Job saved",
          description: "Job has been added to your saved items"
        });
      }
    } catch (error: any) {
      console.error('Error saving/unsaving job:', error);
      toast({
        title: "Operation failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  useEffect(() => {
    let result = [...jobs];
    if (jobType !== 'all') {
      result = result.filter(job => job.type.toLowerCase() === jobType.toLowerCase());
    }
    if (searchTerm) {
      result = result.filter(job => job.title.toLowerCase().includes(searchTerm.toLowerCase()) || job.company.toLowerCase().includes(searchTerm.toLowerCase()) || job.description.toLowerCase().includes(searchTerm.toLowerCase()) || job.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    }
    if (sortOption === 'latest') {
      result.sort((a, b) => new Date(b.posted_date).getTime() - new Date(a.posted_date).getTime());
    } else if (sortOption === 'deadline') {
      result.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    }
    setFilteredJobs(result);
  }, [jobs, searchTerm, jobType, sortOption]);
  return <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-grow bg-ustp-lightgray">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-ustp-darkblue mb-2">USTP Job Portal</h1>
            <p className="text-gray-700">Find part-time jobs, internships, and freelance opportunities</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Input placeholder="Search jobs, companies, or skills..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full" />
              </div>
              <div>
                <Select value={jobType} onValueChange={setJobType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Job Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="on-campus">On-campus</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={sortOption} onValueChange={setSortOption}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="latest">Latest</SelectItem>
                    <SelectItem value="deadline">Deadline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="mb-4 flex justify-end">
            {isEmployer && <PostJobDialog />}
          </div>
          
          <div className="space-y-4">
            {filteredJobs.length > 0 ? filteredJobs.map(job => <Card key={job.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={() => {
            setSelectedJob(job);
            setDetailsOpen(true);
          }}>
                <div className="flex flex-col md:flex-row">
                  <div className="p-4 md:w-1/4 flex items-center justify-center md:justify-start mx-0">
                    <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                      <img src={job.logo || (job.logos && job.logos.length > 0 ? job.logos[0] : "/placeholder.svg")} alt={job.company} onError={e => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                  }} className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div className="md:w-3/4">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex flex-wrap justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">{job.title}</CardTitle>
                          <CardDescription className="text-base font-medium">
                            {job.company} • {job.location}
                          </CardDescription>
                        </div>
                        <Badge className="bg-ustp-blue text-white">{job.type}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{job.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {job.tags.map((tag, index) => <Badge key={index} variant="outline" className="bg-ustp-lightgray text-gray-700">
                            {tag}
                          </Badge>)}
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                      <div>
                        <p className="text-sm font-medium">{job.salary}</p>
                        <div className="text-xs text-gray-500 flex gap-3">
                          <span>Posted: {new Date(job.posted_date).toLocaleDateString()}</span>
                          <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                        {user && !isEmployer && <>
                            <Button variant="outline" size="sm" onClick={() => handleSaveJob(job.id)} className={savedJobIds.has(job.id) ? "bg-blue-50" : ""}>
                              <Bookmark className={`h-4 w-4 mr-2 ${savedJobIds.has(job.id) ? "fill-blue-500 text-blue-500" : ""}`} />
                              {savedJobIds.has(job.id) ? "Saved" : "Save"}
                            </Button>
                            
                            <MessageEmployerDialog jobId={job.id} jobTitle={job.title} employerId={job.employer_id} trigger={<Button variant="outline" size="sm">
                                  <MessageSquare className="h-4 w-4 mr-2" />
                                  Message
                                </Button>} />
                            
                            <ApplyJobDialog jobId={job.id} jobTitle={job.title} company={job.company} trigger={<Button className="bg-ustp-blue text-white hover:bg-ustp-darkblue bg-gradient-to-r from-blue-900 to-blue-700 hover:brightness-95 px-6 py-2 rounded-lg shadow-md">
                                  Apply Now
                                </Button>} />
                          </>}
                        
                        {(isEmployer || !user) && <Button className="bg-ustp-blue text-white hover:bg-ustp-darkblue bg-gradient-to-r from-blue-900 to-blue-700 hover:brightness-95 px-6 py-2 rounded-lg shadow-md" onClick={e => {
                      e.stopPropagation();
                      if (!user) {
                        toast({
                          title: "Authentication required",
                          description: "Please sign in to apply for jobs",
                          variant: "destructive"
                        });
                      } else if (isEmployer) {
                        toast({
                          title: "Employer account",
                          description: "Employers cannot apply for jobs",
                          variant: "destructive"
                        });
                      }
                    }}>
                            Apply Now
                          </Button>}
                      </div>
                    </CardFooter>
                  </div>
                </div>
              </Card>) : <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-600">No jobs found</h3>
                <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
              </div>}
          </div>
        </div>
      </main>
      <Footer />
      <Toaster />
      
      {/* Job Details Modal */}
      {selectedJob && <ViewDetails open={detailsOpen} onOpenChange={setDetailsOpen} item={{
      ...selectedJob,
      logos: selectedJob.logos || []
    }} itemType="job" onContactClick={() => {
      if (user && !isEmployer) {
        setDetailsOpen(false);
        setApplyOpen(true);
      } else if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to apply for jobs",
          variant: "destructive"
        });
      } else if (isEmployer) {
        toast({
          title: "Employer account",
          description: "Employers cannot apply for jobs",
          variant: "destructive"
        });
      }
    }} />}
      
      {/* Apply Job Dialog */}
      {selectedJob && user && !isEmployer && <ApplyJobDialog jobId={selectedJob.id} jobTitle={selectedJob.title} company={selectedJob.company} trigger={<span style={{
      display: 'none'
    }}></span>} />}
    </div>;
};
export default Jobs;