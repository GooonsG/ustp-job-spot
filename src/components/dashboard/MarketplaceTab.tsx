
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingIndicator, ErrorMessage } from './LoadingErrorStates';

interface MarketplaceTabProps {
  marketplaceListings: any[];
  listingsLoading: boolean;
  listingsError: string | null;
  handleEditListing: (itemId: string) => void;
  handleDeleteListing: (itemId: string) => void;
  handleNewListing: () => void;
}

const MarketplaceTab = ({
  marketplaceListings,
  listingsLoading,
  listingsError,
  handleEditListing,
  handleDeleteListing,
  handleNewListing,
}: MarketplaceTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Marketplace Listings</CardTitle>
        <CardDescription>Manage your buy and sell items</CardDescription>
      </CardHeader>
      <CardContent>
        {listingsLoading ? (
          <LoadingIndicator />
        ) : listingsError ? (
          <ErrorMessage message={listingsError} />
        ) : marketplaceListings.length > 0 ? (
          <div className="space-y-4">
            {marketplaceListings.map(item => (
              <div key={item.id} className="flex items-center space-x-4 p-3 border rounded-md">
                <div className="w-16 h-16 rounded overflow-hidden bg-gray-200">
                  {item.images && item.images.length > 0 ? (
                    <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{item.title}</h4>
                  <p className="text-sm text-gray-500">₱{item.price.toFixed(2)}</p>
                  <div className="flex text-xs text-gray-500 mt-1">
                    <span>Posted: {new Date(item.postedDate).toLocaleDateString()}</span>
                    <span className="mx-2">•</span>
                    <span>Views: {item.views || 0}</span>
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <Badge className={item.status === 'active' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}>
                    {item.status === 'active' ? 'Active' : 'Sold'}
                  </Badge>
                  <div className="flex space-x-1">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-8 px-2"
                      onClick={() => handleEditListing(item.id)}
                    >
                      Edit
                    </Button>
                    {item.status === 'active' && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 px-2 text-red-500 border-red-200 hover:bg-red-50"
                        onClick={() => handleDeleteListing(item.id)}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">You haven't posted any items for sale yet</p>
            <Button 
              className="bg-ustp-yellow text-black hover:brightness-95"
              onClick={handleNewListing}
            >
              + Post New Item
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MarketplaceTab;
