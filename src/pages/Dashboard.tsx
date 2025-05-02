
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '@/components/layout/NavBar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { useMarketplaceListings } from '@/hooks/useMarketplaceListings';
import { useJobApplications } from '@/hooks/useJobApplications';
import { useSavedItems } from '@/hooks/useSavedItems';
import { Loader2 } from 'lucide-react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();
  
  // Fetch data using our new hooks
  const { listings: marketplaceListings, loading: listingsLoading, error: listingsError } = useMarketplaceListings();
  const { applications: jobApplications, loading: applicationsLoading, error: applicationsError } = useJobApplications();
  const { savedItems, loading: savedItemsLoading, error: savedItemsError } = useSavedItems();

  // Navigation functions
  const handleNewListing = () => {
    navigate('/marketplace');
    toast({
      title: "New Listing",
      description: "Redirecting to create a new marketplace listing",
    });
  };

  const handleFindOpportunities = () => {
    navigate('/jobs');
    toast({
      title: "Find Opportunities",
      description: "Redirecting to job opportunities page",
    });
  };

  // Marketplace listing functions
  const handleViewListingDetails = (itemId: string) => {
    toast({
      title: "View Listing",
      description: `Viewing details for listing #${itemId}`,
    });
  };

  const handleEditListing = (itemId: string) => {
    toast({
      title: "Edit Listing",
      description: `Editing listing #${itemId}`,
    });
  };

  const handleDeleteListing = (itemId: string) => {
    // Add confirmation dialog
    if (confirm("Are you sure you want to delete this listing?")) {
      toast({
        title: "Delete Listing",
        description: `Listing #${itemId} has been deleted`,
        variant: "destructive",
      });
    }
  };

  // Job application functions
  const handleViewJobDetails = (applicationId: string) => {
    toast({
      title: "Job Application",
      description: `Viewing details for application #${applicationId}`,
    });
  };

  // Loading indicator component
  const LoadingIndicator = () => (
    <div className="flex justify-center items-center py-8">
      <Loader2 className="h-8 w-8 animate-spin text-ustp-blue" />
    </div>
  );

  // Error message component
  const ErrorMessage = ({ message }: { message: string }) => (
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

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-grow bg-ustp-lightgray">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-ustp-darkblue">My Dashboard</h1>
              <p className="text-gray-600 ">Manage your listings and applications</p>
            </div>
            <div className="flex gap-2">
              <Button 
                className="bg-ustp-yellow text-white hover:brightness-50"
                onClick={handleNewListing}
              >
                New Listing
              </Button>
              <Button 
                className="bg-ustp-darkblue text-white hover:brightness-50"
                onClick={handleFindOpportunities}
              >
                Find Opportunities
              </Button>
            </div>
          </div>

          <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="mb-6 bg-white">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="marketplace">My Marketplace</TabsTrigger>
              <TabsTrigger value="jobs">Job Applications</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Marketplace Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {listingsLoading ? (
                      <div className="h-12 flex items-center">
                        <Loader2 className="h-5 w-5 animate-spin text-ustp-blue" />
                      </div>
                    ) : (
                      <>
                        <div className="text-3xl font-bold text-ustp-blue">{marketplaceListings.length}</div>
                        <p className="text-sm text-gray-500">Active Listings</p>
                      </>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Job Applications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {applicationsLoading ? (
                      <div className="h-12 flex items-center">
                        <Loader2 className="h-5 w-5 animate-spin text-ustp-blue" />
                      </div>
                    ) : (
                      <>
                        <div className="text-3xl font-bold text-ustp-blue">{jobApplications.length}</div>
                        <p className="text-sm text-gray-500">Applications Submitted</p>
                      </>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Saved Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {savedItemsLoading ? (
                      <div className="h-12 flex items-center">
                        <Loader2 className="h-5 w-5 animate-spin text-ustp-blue" />
                      </div>
                    ) : (
                      <>
                        <div className="text-3xl font-bold text-ustp-blue">{savedItems.length}</div>
                        <p className="text-sm text-gray-500">Items Saved</p>
                      </>
                    )}
                  </CardContent>
                </Card>
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
                        {marketplaceListings.map(item => (
                          <div key={item.id} className="flex items-center space-x-4 p-2 hover:bg-gray-50 rounded-md cursor-pointer"
                            onClick={() => handleViewListingDetails(item.id)}>
                            <div className="w-12 h-12 rounded overflow-hidden bg-gray-200">
                              {item.image_url ? (
                                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
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
                        {jobApplications.map(application => (
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
            </TabsContent>

            <TabsContent value="marketplace" className="animate-fade-in">
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
                            {item.image_url ? (
                              <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
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
            </TabsContent>

            <TabsContent value="jobs" className="animate-fade-in">
              <Card>
                <CardHeader>
                  <CardTitle>My Job Applications</CardTitle>
                  <CardDescription>Track and manage your job applications</CardDescription>
                </CardHeader>
                <CardContent>
                  {applicationsLoading ? (
                    <LoadingIndicator />
                  ) : applicationsError ? (
                    <ErrorMessage message={applicationsError} />
                  ) : jobApplications.length > 0 ? (
                    <div className="space-y-4">
                      {jobApplications.map(application => (
                        <div key={application.id} className="p-4 border rounded-md">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-lg">{application.jobTitle}</h4>
                              <p className="text-gray-600">{application.company}</p>
                            </div>
                            <Badge className="bg-ustp-blue text-white">{application.type}</Badge>
                          </div>
                          <div className="flex justify-between mt-4 items-center">
                            <div>
                              <p className="text-sm text-gray-500">
                                Applied: {new Date(application.appliedDate).toLocaleDateString()}
                              </p>
                              <p className={`text-sm font-medium ${
                                application.status === 'Under Review' ? 'text-amber-600' : 'text-green-600'
                              }`}>
                                Status: {application.status}
                              </p>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewJobDetails(application.id)}
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">You haven't applied to any jobs yet</p>
                      <Button 
                        className="bg-ustp-blue text-white hover:bg-ustp-darkblue"
                        onClick={handleFindOpportunities}
                      >
                        Browse Job Opportunities
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
