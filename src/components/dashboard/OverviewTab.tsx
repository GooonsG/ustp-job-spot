
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import StatCard from './StatCard';
import { LoadingIndicator, ErrorMessage } from './LoadingErrorStates';

interface OverviewTabProps {
  marketplaceListings: any[];
  jobApplications: any[];
  savedItems: any[];
  listingsLoading: boolean;
  applicationsLoading: boolean;
  savedItemsLoading: boolean;
  listingsError: string | null;
  applicationsError: string | null;
  handleViewListingDetails: (itemId: string) => void;
  handleViewJobDetails: (applicationId: string) => void;
}

const OverviewTab = ({
  marketplaceListings,
  jobApplications,
  savedItems,
  listingsLoading,
  applicationsLoading,
  savedItemsLoading,
  listingsError,
  applicationsError,
  handleViewListingDetails,
  handleViewJobDetails,
}: OverviewTabProps) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Marketplace Activity" 
          value={marketplaceListings.length} 
          loading={listingsLoading} 
          description="Active Listings"
        />
        <StatCard 
          title="Job Applications" 
          value={jobApplications.length} 
          loading={applicationsLoading} 
          description="Applications Submitted"
        />
        <StatCard 
          title="Saved Items" 
          value={savedItems.length} 
          loading={savedItemsLoading} 
          description="Items Saved"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Marketplace Listings</CardTitle>
            <CardDescription>Your active and recently sold items</CardDescription>
          </CardHeader>
          <CardContent>
            {listingsLoading ? (
              <LoadingIndicator />
            ) : listingsError ? (
              <ErrorMessage message={listingsError} />
            ) : marketplaceListings.length > 0 ? (
              <div className="space-y-4">
                {marketplaceListings.slice(0, 3).map(item => (
                  <div key={item.id} className="flex items-center space-x-4 p-2 hover:bg-gray-50 rounded-md cursor-pointer"
                    onClick={() => handleViewListingDetails(item.id)}>
                    <div className="w-12 h-12 rounded overflow-hidden bg-gray-200">
                      {item.images && item.images.length > 0 ? (
                        <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">No img</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{item.title}</h4>
                      <p className="text-sm text-gray-500">₱{item.price.toFixed(2)}</p>
                    </div>
                    <Badge className={item.status === 'active' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}>
                      {item.status === 'active' ? 'Active' : 'Sold'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-4 text-gray-500">No marketplace listings yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Job Applications</CardTitle>
            <CardDescription>Status of your recent applications</CardDescription>
          </CardHeader>
          <CardContent>
            {applicationsLoading ? (
              <LoadingIndicator />
            ) : applicationsError ? (
              <ErrorMessage message={applicationsError} />
            ) : jobApplications.length > 0 ? (
              <div className="space-y-4">
                {jobApplications.slice(0, 3).map(application => (
                  <div key={application.id} className="p-2 hover:bg-gray-50 rounded-md cursor-pointer"
                    onClick={() => handleViewJobDetails(application.id)}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{application.jobTitle}</h4>
                        <p className="text-sm text-gray-500">{application.company}</p>
                      </div>
                      <Badge className="bg-ustp-blue text-white">{application.type}</Badge>
                    </div>
                    <div className="flex justify-between mt-2 text-sm">
                      <span className="text-gray-500">Applied: {new Date(application.appliedDate).toLocaleDateString()}</span>
                      <span className={application.status === 'Under Review' ? 'text-amber-600' : 'text-green-600'}>
                        {application.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-4 text-gray-500">No job applications yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default OverviewTab;
