
import { useState, useEffect } from 'react';
import { X, ArrowLeft, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Product, Job } from '@/types/marketplace';
import { AspectRatio } from '@/components/ui/aspect-ratio';

// Generic type for the ViewDetails component
interface ViewDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: Product | Job;
  itemType: 'product' | 'job';
  onContactClick?: () => void;
}

const ViewDetails = ({
  open,
  onOpenChange,
  item,
  itemType,
  onContactClick
}: ViewDetailsProps) => {
  const [images, setImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Set up images when component mounts or item changes
  useEffect(() => {
    if (itemType === 'product') {
      // For products, use the images from the product
      const product = item as Product;
      const productImages = product.images && product.images.length > 0 
        ? product.images 
        : [product.image || "https://images.unsplash.com/photo-1588580000645-f43a65d97800?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"];
      setImages(productImages);
    } else {
      // For jobs, use the logos
      const job = item as Job;
      const jobImages = job.logos && job.logos.length > 0 
        ? job.logos 
        : [job.logo || "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"];
      setImages(jobImages);
    }
  }, [item, itemType]);

  // Render specific content based on item type
  const renderDetails = () => {
    if (itemType === 'product') {
      const product = item as Product;
      return <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold">{product.title}</h2>
            <p className="text-xl font-semibold text-green-600">${product.price.toFixed(2)}</p>
          </div>
          
          <div>
            <Badge className="bg-blue-100 text-blue-800 mr-2">{product.category}</Badge>
            <Badge className="bg-gray-100 text-gray-800">{product.condition}</Badge>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold">Description</h3>
            <p className="text-gray-700">{product.description}</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold">Seller</h3>
            <p className="text-gray-700">{product.seller}</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold">Posted</h3>
            <p className="text-gray-700">{new Date(product.createdAt).toLocaleDateString()}</p>
          </div>
        </div>;
    } else {
      const job = item as Job;
      return <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold">{job.title}</h2>
            <p className="text-lg text-gray-700">{job.company} • {job.location}</p>
          </div>
          
          <div>
            <Badge className="bg-ustp-blue text-white mr-2">{job.type}</Badge>
            <span className="text-lg font-medium">{job.salary}</span>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {job.tags.map((tag, index) => <Badge key={index} variant="outline" className="bg-ustp-lightgray text-gray-700">
                {tag}
              </Badge>)}
          </div>
          
          <div>
            <h3 className="text-lg font-semibold">Description</h3>
            <p className="text-gray-700">{job.description}</p>
          </div>
          
          <div className="flex justify-between">
            <div>
              <h3 className="text-sm font-semibold">Posted</h3>
              <p className="text-gray-700">{new Date(job.posted_date).toLocaleDateString()}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Deadline</h3>
              <p className="text-gray-700">{new Date(job.deadline).toLocaleDateString()}</p>
            </div>
          </div>
        </div>;
    }
  };

  const renderPlaceholder = () => (
    <div className="flex flex-col items-center justify-center h-full bg-gray-100 text-gray-400">
      <ImageIcon size={48} />
      <p className="mt-2">No image available</p>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full p-0 h-[90vh] flex flex-col">
        <Button variant="ghost" size="icon" className="absolute right-4 top-4 z-50 rounded-full bg-black/30 text-white hover:bg-black/50" onClick={() => onOpenChange(false)}>
          <X className="h-4 w-4" />
        </Button>
        
        {/* Image Carousel */}
        <div className="bg-black h-1/2">
          <Carousel className="w-full h-full">
            <CarouselContent className="h-full">
              {images.length > 0 ? (
                images.map((img, index) => (
                  <CarouselItem key={index} className="h-full">
                    <AspectRatio ratio={16 / 9} className="h-full">
                      <img 
                        src={img} 
                        alt={`Image ${index + 1}`} 
                        onError={e => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }} 
                        className="w-full h-full object-contain bg-white" 
                      />
                    </AspectRatio>
                  </CarouselItem>
                ))
              ) : (
                <CarouselItem className="h-full">
                  {renderPlaceholder()}
                </CarouselItem>
              )}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>
        </div>
        
        {/* Details Section */}
        <div className="flex-1 overflow-y-auto p-6 py-[65px] mx-[33px] rounded-xl my-0">
          {renderDetails()}
          
          {/* Contact Button */}
          {onContactClick && <div className="pt-4">
              <Button className="w-full bg-ustp-blue text-white hover:bg-ustp-darkblue" onClick={onContactClick}>
                {itemType === 'product' ? 'Message Seller' : 'Apply for Job'}
              </Button>
            </div>}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewDetails;
