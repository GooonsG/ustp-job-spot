import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { Upload } from 'lucide-react';

interface PostJobFormData {
  title: string;
  company: string;
  location: string;
  description: string;
  type: string;
  salary: string;
  deadline: string;
  tags: string;
  logo?: File | null;
  logoUrl?: string;
}

export function PostJobDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<PostJobFormData>({
    title: '',
    company: '',
    location: '',
    description: '',
    type: '',
    salary: '',
    deadline: '',
    tags: '',
    logo: null,
    logoUrl: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let logoUrl = formData.logoUrl;

      if (formData.logo) {
        const fileExt = formData.logo.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError, data } = await supabase.storage
          .from('job-logos')
          .upload(filePath, formData.logo);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('job-logos')
          .getPublicUrl(filePath);

        logoUrl = publicUrl;
      }

      const { error } = await supabase.from('jobs').insert({
        title: formData.title,
        company: formData.company,
        location: formData.location,
        description: formData.description,
        type: formData.type,
        salary: formData.salary,
        deadline: formData.deadline,
        tags: formData.tags.split(',').map(tag => tag.trim()),
        logo: logoUrl,
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
        tags: '',
        logo: null,
        logoUrl: ''
      });
    } catch (error) {
      console.error('Error posting job:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create job posting. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, logo: e.target.files![0], logoUrl: '' }));
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, logoUrl: e.target.value, logo: null }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black hover:brightness-95 px-6 py-3 rounded-lg shadow-md">
          + Post Job Opportunity
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] bg-gray-50 rounded-lg shadow-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="text-center">
            <DialogTitle className="text-2xl font-bold text-gray-800">Post a New Job Opportunity</DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              Fill in the details for your job posting. All fields are required.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-6 px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Web Developer Intern"
                  className="rounded-lg border-gray-300 focus:ring-yellow-400 focus:border-yellow-400"
                  required
                />
              </div>
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="Your company name"
                  className="rounded-lg border-gray-300 focus:ring-yellow-400 focus:border-yellow-400"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., Remote, Cagayan de Oro"
                  className="rounded-lg border-gray-300 focus:ring-yellow-400 focus:border-yellow-400"
                  required
                />
              </div>
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="rounded-lg border-gray-300 focus:ring-yellow-400 focus:border-yellow-400 w-full min-h-[40px]"
                  required
                >
                  <option value="" disabled>Select job type</option>
                  <option value="internship">Internship</option>
                  <option value="part-time">Part-time</option>
                  <option value="on-campus">On-campus</option>
                  <option value="freelance">Freelance</option>
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Job description and requirements..."
                className="rounded-lg border-gray-300 focus:ring-yellow-400 focus:border-yellow-400 min-h-[120px]"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="salary" className="block text-sm font-medium text-gray-700 mb-2">Salary/Compensation</label>
                <Input
                  id="salary"
                  value={formData.salary}
                  onChange={(e) => setFormData(prev => ({ ...prev, salary: e.target.value }))}
                  placeholder="e.g., ₱10,000 per month"
                  className="rounded-lg border-gray-300 focus:ring-yellow-400 focus:border-yellow-400"
                  required
                />
              </div>
              <div>
                <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-2">Application Deadline</label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  className="rounded-lg border-gray-300 focus:ring-yellow-400 focus:border-yellow-400"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="e.g., IT, Web Development, Design (comma-separated)"
                className="rounded-lg border-gray-300 focus:ring-yellow-400 focus:border-yellow-400"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
              <div className="space-y-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="cursor-pointer rounded-lg border-gray-300 focus:ring-yellow-400 focus:border-yellow-400"
                />
                <Input
                  type="text"
                  placeholder="Or enter logo URL"
                  value={formData.logoUrl}
                  onChange={handleUrlChange}
                  className="rounded-lg border-gray-300 focus:ring-yellow-400 focus:border-yellow-400"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="flex justify-end">
            <Button
              type="submit"
              className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black hover:brightness-95 px-6 py-3 rounded-lg shadow-md"
              disabled={loading}
            >
              {loading ? "Posting..." : "Post Job"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
