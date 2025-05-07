
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const LoadingIndicator = () => (
  <div className="flex justify-center items-center py-8">
    <Loader2 className="h-8 w-8 animate-spin text-ustp-blue" />
  </div>
);

export const ErrorMessage = ({ message }: { message: string }) => (
  <div className="text-center py-6">
    <p className="text-red-500">{message}</p>
    <Button 
      variant="outline" 
      className="mt-2"
      onClick={() => window.location.reload()}
    >
      Try Again
    </Button>
  </div>
);
