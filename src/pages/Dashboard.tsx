
import { useState } from 'react';
import NavBar from '@/components/layout/NavBar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const marketplaceListings = [
    {
      id: 1,
      title: "Engineering Mechanics Textbook",
      price: 400,
      status: "active",
      postedDate: "2023-04-01",
      views: 24,
      image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    },
    {
      id: 2,
      title: "Lab Safety Goggles",
      price: 150,
      status: "sold",
      postedDate: "2023-03-15",
      views: 37,
      image: "https://images.unsplash.com/photo-1583394745820-53627dcd92f8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    }
  ];

  const jobApplications = [
    {
      id: 1,
      jobTitle: "Research Assistant",
      company: "USTP Research Department",
      appliedDate: "2023-04-05",
      status: "Under Review",
      type: "On-campus"
    },
    {
      id: 2,
      jobTitle: "Web Developer Intern",
      company: "TechSolutions Inc.",
      appliedDate: "2023-04-02",
      status: "Interview Scheduled",
      type: "Internship"
    }
  ];

  const savedItems = [
    {
      id: 1,
      type: "job",
      title: "Graphic Design Freelancer",
      company: "Creative Arts Studio",
      savedDate: "2023-04-08"
    },
    {
      id: 2,
      type: "marketplace",
      title: "Scientific Calculator FX-991EX",
      price: 850,
      seller: "Maria Garcia",
      savedDate: "2023-04-03"
    }
  ];

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
              <Button className="bg-ustp-yellow text-white hover:brightness-50">
                New Listing
              </Button>
              <Button className="bg-ustp-darkblue text-white hover:brightness-50">
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
              <TabsTrigger value="settings">Account Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Marketplace Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-ustp-blue">{marketplaceListings.length}</div>
                    <p className="text-sm text-gray-500">Active Listings</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Job Applications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-ustp-blue">{jobApplications.length}</div>
                    <p className="text-sm text-gray-500">Applications Submitted</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Saved Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-ustp-blue">{savedItems.length}</div>
                    <p className="text-sm text-gray-500">Items Saved</p>
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
                    {marketplaceListings.length > 0 ? (
                      <div className="space-y-4">
                        {marketplaceListings.map(item => (
                          <div key={item.id} className="flex items-center space-x-4 p-2 hover:bg-gray-50 rounded-md">
                            <div className="w-12 h-12 rounded overflow-hidden">
                              <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
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
                    {jobApplications.length > 0 ? (
                      <div className="space-y-4">
                        {jobApplications.map(application => (
                          <div key={application.id} className="p-2 hover:bg-gray-50 rounded-md">
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
                  {marketplaceListings.length > 0 ? (
                    <div className="space-y-4">
                      {marketplaceListings.map(item => (
                        <div key={item.id} className="flex items-center space-x-4 p-3 border rounded-md">
                          <div className="w-16 h-16 rounded overflow-hidden">
                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{item.title}</h4>
                            <p className="text-sm text-gray-500">₱{item.price.toFixed(2)}</p>
                            <div className="flex text-xs text-gray-500 mt-1">
                              <span>Posted: {new Date(item.postedDate).toLocaleDateString()}</span>
                              <span className="mx-2">•</span>
                              <span>Views: {item.views}</span>
                            </div>
                          </div>
                          <div className="flex flex-col space-y-2">
                            <Badge className={item.status === 'active' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}>
                              {item.status === 'active' ? 'Active' : 'Sold'}
                            </Badge>
                            <div className="flex space-x-1">
                              <Button size="sm" variant="outline" className="h-8 px-2">Edit</Button>
                              {item.status === 'active' && (
                                <Button size="sm" variant="outline" className="h-8 px-2 text-red-500 border-red-200 hover:bg-red-50">
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
                      <Button className="bg-ustp-yellow text-black hover:brightness-95">
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
                  {jobApplications.length > 0 ? (
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
                            <Button variant="outline" size="sm">View Details</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">You haven't applied to any jobs yet</p>
                      <Button className="bg-ustp-blue text-white hover:bg-ustp-darkblue">
                        Browse Job Opportunities
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="saved" className="animate-fade-in">
              <Card>
                <CardHeader>
                  <CardTitle>Saved Items</CardTitle>
                  <CardDescription>Jobs and marketplace items you've saved</CardDescription>
                </CardHeader>
                <CardContent>
                  {savedItems.length > 0 ? (
                    <div className="space-y-4">
                      {savedItems.map(item => (
                        <div key={item.id} className="p-4 border rounded-md">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{item.title}</h4>
                              {item.type === 'job' ? (
                                <p className="text-gray-600">{item.company}</p>
                              ) : (
                                <p className="text-gray-600">₱{item.price} • Seller: {item.seller}</p>
                              )}
                            </div>
                            <Badge className={item.type === 'job' ? 'bg-ustp-blue text-white' : 'bg-ustp-yellow text-white'}>
                              {item.type === 'job' ? 'Job' : 'Marketplace'}
                            </Badge>
                          </div>
                          <div className="flex justify-between mt-3 items-center">
                            <p className="text-sm text-gray-500">
                              Saved on: {new Date(item.savedDate).toLocaleDateString()}
                            </p>
                            <div className="flex space-x-2">
                              <Button size="sm" className="bg-ustp-blue text-white hover:bg-ustp-darkblue">
                                View Details
                              </Button>
                              <Button size="sm" variant="outline" className="text-red-500 border-red-200 hover:bg-red-50">
                                Remove
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">You haven't saved any items yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="animate-fade-in">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Manage your profile and preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Profile Information</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                            <input type="text" defaultValue="Recmar" className="ustp-input" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                            <input type="text" defaultValue="Maloys" className="ustp-input" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                          <input type="email" defaultValue="rec.maloys@ustp.edu.ph" className="ustp-input" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                          <input type="text" defaultValue="2023300767" className="ustp-input" readOnly />
                        </div>
                      </div>
                    </div>


                    <div>
                      <h3 className="text-lg font-medium mb-4">Change Password</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                          <input type="password" className="ustp-input" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                          <input type="password" className="ustp-input" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                          <input type="password" className="ustp-input" />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button variant="outline">Cancel</Button>
                      <Button className="bg-ustp-blue text-white hover:bg-ustp-darkblue">Save Changes</Button>
                    </div>
                  </div>
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
