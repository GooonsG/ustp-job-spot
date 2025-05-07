
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '@/components/layout/NavBar';
import Footer from '@/components/layout/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { toast as sonnerToast } from 'sonner';
import { useMarketplaceListings } from '@/hooks/useMarketplaceListings';
import { useJobApplications } from '@/hooks/useJobApplications';
import { useSavedItems } from '@/hooks/useSavedItems';

// Import our newly created components
import OverviewTab from '@/components/dashboard/OverviewTab';
import MarketplaceTab from '@/components/dashboard/MarketplaceTab';
import JobsTab from '@/components/dashboard/JobsTab';
import SavedItemsTab from '@/components/dashboard/SavedItemsTab';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Fetch data using our hooks
  const { listings: marketplaceListings, loading: listingsLoading, error: listingsError } = useMarketplaceListings();
  const { applications: jobApplications, loading: applicationsLoading, error: applicationsError } = useJobApplications();
  const { savedItems, loading: savedItemsLoading, error: savedItemsError, unsaveItem } = useSavedItems();

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

  // Handle unsave item
  const handleUnsaveItem = async (savedItemId: string) => {
    if (confirm("Remove this item from your saved items?")) {
      const result = await unsaveItem(savedItemId);
      if (result.success) {
        sonnerToast.success("Item removed from saved items");
      } else {
        sonnerToast.error("Failed to remove item");
      }
    }
  };

  // Navigate to view item in marketplace or jobs
  const handleViewSavedItem = (item: any) => {
    if (item.itemType === 'marketplace') {
      navigate('/marketplace');
    } else if (item.itemType === 'job') {
      navigate('/jobs');
    }
  };

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
                className="text-white hover:brightness-50 bg-gradient-to-r from-yellow-400 to-yellow-500"
                onClick={handleNewListing}
              >
                New Listing
              </Button>
              <Button 
                className="bg-gradient-to-r from-ustp-darkblue to-text-indigo-800 text-white hover:brightness-50"
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
              <TabsTrigger value="saved">Saved Items</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="animate-fade-in">
              <OverviewTab 
                marketplaceListings={marketplaceListings}
                jobApplications={jobApplications}
                savedItems={savedItems}
                listingsLoading={listingsLoading}
                applicationsLoading={applicationsLoading}
                savedItemsLoading={savedItemsLoading}
                listingsError={listingsError}
                applicationsError={applicationsError}
                handleViewListingDetails={handleViewListingDetails}
                handleViewJobDetails={handleViewJobDetails}
              />
            </TabsContent>

            <TabsContent value="marketplace" className="animate-fade-in">
              <MarketplaceTab 
                marketplaceListings={marketplaceListings}
                listingsLoading={listingsLoading}
                listingsError={listingsError}
                handleEditListing={handleEditListing}
                handleDeleteListing={handleDeleteListing}
                handleNewListing={handleNewListing}
              />
            </TabsContent>

            <TabsContent value="jobs" className="animate-fade-in">
              <JobsTab 
                jobApplications={jobApplications}
                applicationsLoading={applicationsLoading}
                applicationsError={applicationsError}
                handleViewJobDetails={handleViewJobDetails}
                handleFindOpportunities={handleFindOpportunities}
              />
            </TabsContent>

            <TabsContent value="saved" className="animate-fade-in">
              <SavedItemsTab 
                savedItems={savedItems}
                savedItemsLoading={savedItemsLoading}
                savedItemsError={savedItemsError}
                handleViewSavedItem={handleViewSavedItem}
                handleUnsaveItem={handleUnsaveItem}
                navigate={navigate}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
