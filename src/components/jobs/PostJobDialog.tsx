
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface PostJobFormData {
  title: string;
  company: string;
  location: string;
  description: string;
  type: string;
  salary: string;
  deadline: string;
  tags: string;
}

export function PostJobDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState<PostJobFormData>({
    title: '',
    company: '',
    location: '',
    description: '',
    type: '',
    salary: '',
    deadline: '',
    tags: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('jobs').insert({
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()),
        employer_id: (await supabase.auth.getUser()).data.user?.id
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Job posting created successfully",
      });
      setIsOpen(false);
      setFormData({
        title: '',
        company: '',
        location: '',
        description: '',
        type: '',
        salary: '',
        deadline: '',
        tags: ''
      });
      window.location.reload(); // Refresh to show new job
    } catch (error) {
      console.error('Error posting job:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create job posting. Please try again.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-ustp-yellow text-black hover:brightness-95">
          + Post Job Opportunity
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Post a New Job Opportunity</DialogTitle>
            <DialogDescription>
              Fill in the details for your job posting. All fields are required.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1">Job Title</label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Web Developer Intern"
                  required
                />
              </div>
              <div>
                <label htmlFor="company" className="block text-sm font-medium mb-1">Company</label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="Your company name"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="location" className="block text-sm font-medium mb-1">Location</label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., Remote, Cagayan de Oro"
                  required
                />
              </div>
              <div>
                <label htmlFor="type" className="block text-sm font-medium mb-1">Job Type</label>
                <Input
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  placeholder="e.g., Internship, Part-time"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Job description and requirements..."
                className="min-h-[100px]"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="salary" className="block text-sm font-medium mb-1">Salary/Compensation</label>
                <Input
                  id="salary"
                  value={formData.salary}
                  onChange={(e) => setFormData(prev => ({ ...prev, salary: e.target.value }))}
                  placeholder="e.g., ₱10,000 per month"
                  required
                />
              </div>
              <div>
                <label htmlFor="deadline" className="block text-sm font-medium mb-1">Application Deadline</label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="tags" className="block text-sm font-medium mb-1">Tags</label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="e.g., IT, Web Development, Design (comma-separated)"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" className="bg-ustp-blue hover:bg-ustp-darkblue">
              Post Job
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
