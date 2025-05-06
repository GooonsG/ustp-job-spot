import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Product } from "@/types/marketplace";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Upload, Plus, Image as ImageIcon } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  category: z.string().min(1, "Category is required"),
  condition: z.string().min(1, "Condition is required"),
});

const categories = [
  "Books",
  "Electronics",
  "Clothing",
  "School Supplies",
  "Furniture",
  "Other",
];

const conditions = [
  "New",
  "Used - Like New",
  "Used - Good",
  "Used - Fair",
  "Used - Poor",
];

const MAX_IMAGES = 4;

interface EditItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
  onSuccess: () => void;
}

export function EditItemDialog({ open, onOpenChange, product, onSuccess }: EditItemDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>(product.images || []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: product.title,
      description: product.description,
      price: product.price,
      category: product.category,
      condition: product.condition,
    },
  });

  // Reset form when product changes
  useEffect(() => {
    form.reset({
      title: product.title,
      description: product.description,
      price: product.price,
      category: product.category,
      condition: product.condition,
    });
    setExistingImages(product.images || []);
    setNewImages([]);
    setNewImagePreviews([]);
  }, [product, form]);

  const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const totalImageCount = existingImages.length + newImages.length + files.length;
      
      if (totalImageCount > MAX_IMAGES) {
        toast.error(`You can only have up to ${MAX_IMAGES} images in total`);
        return;
      }
      
      const filePreviews = files.map(file => URL.createObjectURL(file));
      
      setNewImages(prev => [...prev, ...files]);
      setNewImagePreviews(prev => [...prev, ...filePreviews]);
    }
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(newImagePreviews[index]);
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const updatedImageUrls = [...existingImages];

      // Upload new images if any were selected
      if (newImages.length > 0) {
        for (const image of newImages) {
          const fileExt = image.name.split('.').pop();
          const fileName = `${uuidv4()}.${fileExt}`;
          const filePath = `${product.seller_id}/${fileName}`;
          
          const { error: uploadError } = await supabase.storage
            .from('marketplace')
            .upload(filePath, image);
            
          if (uploadError) throw uploadError;
          
          const { data } = supabase.storage
            .from('marketplace')
            .getPublicUrl(filePath);
            
          updatedImageUrls.push(data.publicUrl);
        }
      }

      // Update the item in the database
      const { error } = await supabase
        .from('marketplace_items')
        .update({
          title: values.title,
          description: values.description,
          price: values.price,
          category: values.category,
          condition: values.condition,
          images: updatedImageUrls,
          updated_at: new Date().toISOString(),
        })
        .eq('id', product.id);

      if (error) throw error;

      toast.success('Item updated successfully');
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Failed to update item');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="condition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condition</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a condition" />
                      </SelectTrigger>
                      <SelectContent>
                        {conditions.map((condition) => (
                          <SelectItem key={condition} value={condition}>
                            {condition}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <p className="text-sm font-medium">Images ({existingImages.length + newImages.length} of {MAX_IMAGES})</p>
              
              {/* Existing images */}
              {existingImages.length > 0 && (
                <div>
                  <h4 className="text-sm text-gray-500 mb-2">Current Images</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {existingImages.map((imgUrl, index) => (
                      <div key={`existing-${index}`} className="relative group">
                        <img 
                          src={imgUrl} 
                          alt={`Item ${index + 1}`} 
                          className="w-full h-24 object-cover rounded-md" 
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder.svg";
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* New images */}
              {newImagePreviews.length > 0 && (
                <div>
                  <h4 className="text-sm text-gray-500 mb-2">New Images</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {newImagePreviews.map((preview, index) => (
                      <div key={`new-${index}`} className="relative group">
                        <img 
                          src={preview} 
                          alt={`New image ${index + 1}`} 
                          className="w-full h-24 object-cover rounded-md" 
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Upload button */}
              {existingImages.length + newImages.length < MAX_IMAGES && (
                <div>
                  <Label 
                    htmlFor="new-images" 
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-gray-500" />
                      <p className="text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Add {MAX_IMAGES - (existingImages.length + newImages.length)} more image(s)
                      </p>
                    </div>
                    <Input
                      id="new-images"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleNewImageChange}
                      className="hidden"
                    />
                  </Label>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update Item'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
