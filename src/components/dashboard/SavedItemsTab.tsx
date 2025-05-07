
import { Bookmark, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingIndicator, ErrorMessage } from './LoadingErrorStates';

interface SavedItemsTabProps {
  savedItems: any[];
  savedItemsLoading: boolean;
  savedItemsError: string | null;
  handleViewSavedItem: (item: any) => void;
  handleUnsaveItem: (savedItemId: string) => void;
  navigate: (path: string) => void;
}

const SavedItemsTab = ({
  savedItems,
  savedItemsLoading,
  savedItemsError,
  handleViewSavedItem,
  handleUnsaveItem,
  navigate,
}: SavedItemsTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Saved Items</CardTitle>
        <CardDescription>Items you've bookmarked for later</CardDescription>
      </CardHeader>
      <CardContent>
        {savedItemsLoading ? (
          <LoadingIndicator />
        ) : savedItemsError ? (
          <ErrorMessage message={savedItemsError} />
        ) : savedItems.length > 0 ? (
          <div className="space-y-4">
            {savedItems.map(item => (
              <div key={item.id} className="flex items-center space-x-4 p-3 border rounded-md hover:bg-gray-50">
                <div className="flex-shrink-0">
                  <Badge className={`${item.itemType === 'job' ? 'bg-ustp-blue' : 'bg-ustp-yellow text-black'}`}>
                    {item.itemType === 'job' ? 'Job' : 'Marketplace'}
                  </Badge>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{item.title}</h4>
                  <div className="flex text-sm text-gray-500 mt-1">
                    {item.itemType === 'job' ? (
                      <>
                        <span>{item.company}</span>
                        {item.salary && (
                          <>
                            <span className="mx-2">•</span>
                            <span>{item.salary}</span>
                          </>
                        )}
                        {item.type && (
                          <>
                            <span className="mx-2">•</span>
                            <span>{item.type}</span>
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        {item.price && (
                          <span>${item.price.toFixed(2)}</span>
                        )}
                        {item.seller && (
                          <>
                            <span className="mx-2">•</span>
                            <span>Seller: {item.seller}</span>
                          </>
                        )}
                        {item.category && (
                          <>
                            <span className="mx-2">•</span>
                            <span>{item.category}</span>
                          </>
                        )}
                      </>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Saved on: {new Date(item.savedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-9 px-3"
                    onClick={() => handleViewSavedItem(item)}
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="h-9 px-3 text-red-500 border-red-200 hover:bg-red-50"
                    onClick={() => handleUnsaveItem(item.id)}
                  >
                    <Bookmark className="w-4 h-4 mr-1" />
                    Unsave
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Bookmark className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">You haven't saved any items yet</p>
            <div className="flex space-x-3 justify-center">
              <Button 
                className="bg-ustp-blue text-white hover:bg-ustp-darkblue"
                onClick={() => navigate('/jobs')}
              >
                Browse Jobs
              </Button>
              <Button 
                className="bg-ustp-yellow text-black hover:brightness-95"
                onClick={() => navigate('/marketplace')}
              >
                Browse Marketplace
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SavedItemsTab;
