
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface PostJobFormData {
  title: string;
  company: string;
  location: string;
  description: string;
  type: string;
  salary: string;
  deadline: string;
  tags: string;
  logoFiles: File[];
  logoUrls: string[];
}

const MAX_IMAGES = 4;

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
    logoFiles: [],
    logoUrls: []
  });
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Collect all logo URLs (both uploaded files and entered URLs)
      let logoUrls: string[] = [...formData.logoUrls];

      // Upload logo files
      if (formData.logoFiles.length > 0) {
        for (const logoFile of formData.logoFiles) {
          const fileExt = logoFile.name.split('.').pop();
          const fileName = `${uuidv4()}.${fileExt}`;
          const filePath = `${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('job-logos')
            .upload(filePath, logoFile);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('job-logos')
            .getPublicUrl(filePath);

          logoUrls.push(publicUrl);
        }
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
        logos: logoUrls,
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
        logoFiles: [],
        logoUrls: []
      });
      setPreviewUrls([]);
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
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const totalLogoCount = formData.logoFiles.length + formData.logoUrls.length + newFiles.length;
      
      if (totalLogoCount > MAX_IMAGES) {
        toast({
          variant: "destructive",
          title: "Too many images",
          description: `You can only upload up to ${MAX_IMAGES} images in total.`,
        });
        return;
      }
      
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      
      setFormData(prev => ({
        ...prev,
        logoFiles: [...prev.logoFiles, ...newFiles]
      }));
      
      setPreviewUrls(prev => [...prev, ...newPreviews]);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value.trim();
    if (url) {
      const totalLogoCount = formData.logoFiles.length + formData.logoUrls.length;
      
      if (totalLogoCount >= MAX_IMAGES) {
        toast({
          variant: "destructive",
          title: "Too many images",
          description: `You can only have up to ${MAX_IMAGES} images in total.`,
        });
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        logoUrls: [...prev.logoUrls, url]
      }));
      
      // Clear the input
      e.currentTarget.value = '';
    }
  };

  const removeFile = (index: number) => {
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(previewUrls[index]);
    
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      logoFiles: prev.logoFiles.filter((_, i) => i !== index)
    }));
  };

  const removeUrl = (index: number) => {
    setFormData(prev => ({
      ...prev,
      logoUrls: prev.logoUrls.filter((_, i) => i !== index)
    }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black hover:brightness-95 px-6 py-3 rounded-lg shadow-md">
          + Post Job Opportunity
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] bg-gray-50 rounded-lg shadow-lg max-h-[90vh] overflow-y-auto">
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
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Web Developer Intern"
                  className="rounded-lg border-gray-300 focus:ring-yellow-400 focus:border-yellow-400"
                  required
                />
              </div>
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                <Input
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
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
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Remote, Cagayan de Oro"
                  className="rounded-lg border-gray-300 focus:ring-yellow-400 focus:border-yellow-400"
                  required
                />
              </div>
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
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
                name="description"
                value={formData.description}
                onChange={handleInputChange}
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
                  name="salary"
                  value={formData.salary}
                  onChange={handleInputChange}
                  placeholder="e.g., ₱10,000 per month"
                  className="rounded-lg border-gray-300 focus:ring-yellow-400 focus:border-yellow-400"
                  required
                />
              </div>
              <div>
                <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-2">Application Deadline</label>
                <Input
                  id="deadline"
                  name="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={handleInputChange}
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
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="e.g., IT, Web Development, Design (comma-separated)"
                className="rounded-lg border-gray-300 focus:ring-yellow-400 focus:border-yellow-400"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Logos ({formData.logoFiles.length + formData.logoUrls.length} of {MAX_IMAGES})
              </label>
              
              {/* Display existing files */}
              {(previewUrls.length > 0 || formData.logoUrls.length > 0) && (
                <div className="mb-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {/* File previews */}
                    {previewUrls.map((url, index) => (
                      <div key={`file-${index}`} className="relative group">
                        <img 
                          src={url} 
                          alt={`Logo preview ${index + 1}`} 
                          className="w-full h-24 object-cover rounded-md" 
                        />
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    
                    {/* URL previews */}
                    {formData.logoUrls.map((url, index) => (
                      <div key={`url-${index}`} className="relative group">
                        <img 
                          src={url} 
                          alt={`Logo URL ${index + 1}`} 
                          className="w-full h-24 object-cover rounded-md" 
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder.svg";
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => removeUrl(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Upload section */}
              {formData.logoFiles.length + formData.logoUrls.length < MAX_IMAGES && (
                <div className="space-y-4">
                  <Label 
                    htmlFor="logo-files" 
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-gray-500" />
                      <p className="text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Add {MAX_IMAGES - (formData.logoFiles.length + formData.logoUrls.length)} more image(s)
                      </p>
                    </div>
                    <Input
                      id="logo-files"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </Label>
                  
                  <div className="mt-4">
                    <label htmlFor="logo-url" className="block text-sm font-medium text-gray-700 mb-2">
                      Or enter logo URL
                    </label>
                    <div className="flex">
                      <Input
                        id="logo-url"
                        type="text"
                        placeholder="https://example.com/logo.png"
                        className="rounded-l-lg border-gray-300 focus:ring-yellow-400 focus:border-yellow-400"
                      />
                      <Button 
                        type="button" 
                        onClick={(e) => handleUrlChange(e as unknown as React.ChangeEvent<HTMLInputElement>)}
                        className="rounded-l-none bg-gray-200 text-gray-800 hover:bg-gray-300"
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              )}
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
