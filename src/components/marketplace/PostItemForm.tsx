import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

interface PostItemFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const categories = [
  'Books',
  'Electronics',
  'Clothing',
  'School Supplies',
  'Furniture',
  'Other',
];

const conditions = [
  'New',
  'Used - Like New',
  'Used - Good',
  'Used - Fair',
  'Used - Poor',
];

const PostItemForm = ({ open, onOpenChange, onSuccess }: PostItemFormProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: '',
  });
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to post an item');
      navigate('/auth');
      return;
    }
    
    setLoading(true);
    
    try {
      let imageUrl = null;
      
      // Upload image if one was selected
      if (image) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('marketplace')
          .upload(filePath, image);
          
        if (uploadError) throw uploadError;
        
        const { data } = supabase.storage
          .from('marketplace')
          .getPublicUrl(filePath);
          
        imageUrl = data.publicUrl;
      }
      
      // Insert the item into the database
      const { error } = await supabase
        .from('marketplace_items')
        .insert({
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          category: formData.category,
          condition: formData.condition,
          seller_id: user.id,
          seller_name: user.email?.split('@')[0] || 'USTP Student',
          image_url: imageUrl,
        });
        
      if (error) throw error;
      
      toast.success('Item posted successfully!');
      onOpenChange(false);
      
      // Reset the form
      setFormData({
        title: '',
        description: '',
        price: '',
        category: '',
        condition: '',
      });
      setImage(null);
      setImagePreview(null);
      
      // Call onSuccess if provided
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error) {
      toast.error('Error posting item: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-ustp-darkblue">Post Item for Sale</DialogTitle>
          <DialogDescription>
            Fill out the form below to list your item in the USTP Marketplace.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="title">Item Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Calculus Textbook 10th Edition"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your item, including any details about condition, features, etc."
              required
              rows={4}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price (₱)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                placeholder="e.g., 500"
                required
              />
            </div>
            
            <div>
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleSelectChange('category', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Condition</Label>
              <Select
                value={formData.condition}
                onValueChange={(value) => handleSelectChange('condition', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  {conditions.map((condition) => (
                    <SelectItem key={condition} value={condition}>
                      {condition}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="image">Item Image (Optional)</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="cursor-pointer"
              />
            </div>
          </div>
          
          {imagePreview && (
            <div className="mt-2 flex justify-center">
              <img 
                src={imagePreview} 
                alt="Image preview" 
                className="max-h-40 rounded-md object-contain" 
              />
            </div>
          )}
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-ustp-yellow text-black hover:brightness-95"
              disabled={loading}
            >
              {loading ? "Posting..." : "Post Item"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PostItemForm;
