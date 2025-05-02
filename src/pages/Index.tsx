import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import NavBar from '@/components/layout/NavBar';
import Footer from '@/components/layout/Footer';
import itlogo from '../image/ustpit.jpg';
import uni from '../image/shades.jpg';
const Index = () => {
  const [featuredMarketplaceItems] = useState([{
    id: 1,
    title: "Matrix sunglasses - Unlisex",
    price: 36.69,
    image: uni
  }, {
    id: 2,
    title: "American Staffordshire Terrier FX-991EX",
    price: 150.69,
    image: "https://scontent.fcgy2-1.fna.fbcdn.net/v/t1.15752-9/462559138_1272896083891707_1208583185716722979_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=0024fc&_nc_eui2=AeFxs6z7CUJmwJPt7Va1g96Mxww_ZBxofO3HDD9kHGh87dgp1bB4lHyFeRyOhM9iIODoIE1JWrLP73dK_HJh5xMN&_nc_ohc=aRT0m4TS0SQQ7kNvwFGoHEi&_nc_oc=Adn5tM0RuJ9bipErk7x2gkgqqBuzMzSBdWGpCK3HNMxQ27yjVN73aVEpqFAoXA_6jwk&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent.fcgy2-1.fna&oh=03_Q7cD2AHHC_Ah28dpZAU1trEQCOELORJKX9FmA3wI1p5X-6NKng&oe=682F1439  "
  }, {
    id: 3,
    title: "Roasted Pig Bundle (2 Whole Bembs)",
    price: 96.69,
    image: "https://scontent.fcgy2-1.fna.fbcdn.net/v/t1.15752-9/458770168_1060395554971973_7282637934674241599_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=0024fc&_nc_eui2=AeG4JwiGIh_Cp8VoshvkeZyZ5L-b1zQ7gUrkv5vXNDuBSmG5lOHbxPjA1T4yPRE0AF2eTSfNRVbazvh_CT0WpU1i&_nc_ohc=F7aOnFy7TDQQ7kNvwHF_EiJ&_nc_oc=Adm8tioqZN5n_FNCA3G1N2KNC9L3l9-YUEelaNjykZ8ZtCebbgtSsZbX7Jaw5vjXK0c&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent.fcgy2-1.fna&oh=03_Q7cD2AG8VrXWHz_GMjRdlS38uXnYm3ekmdSoBkOxfAOyJm6EJw&oe=682F0710"
  }]);
  const [featuredJobs] = useState([{
    id: 1,
    title: "Client Services Associate",
    company: "3Js Computer Café.",
    type: "Internship",
    location: "Cagayan de Oro"
  }, {
    id: 2,
    title: "Customer Experience Specialist",
    company: "Nanay`s Store",
    type: "Part-time",
    location: "Lawesbra, Lapasan, Cagayan de Oro"
  }, {
    id: 3,
    title: "Web System Assistant",
    company: "USTP Tech Department",
    type: "On-campus",
    location: "USTP CDO Campus"
  }]);
  return <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-grow">
        {/* Hero Section with Modern Gradient */}
        <section className="modern-gradient text-white py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6 animate-fade-in">
                <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                  USTP Student Opportunity System
                </h1>
                <p className="text-xl text-white/80">
                  Connect with marketplace opportunities and job listings tailored for USTP students.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/marketplace">
                    <Button className="modern-button bg-gradient-to-r from-ustp-darkblue to-text-indigo-800 text-white font-semibold hover:brightness-95 px-6 py-3 rounded-lg shadow-md">
                      Explore Marketplace
                    </Button>
                  </Link>
                  <Link to="/jobs">
                    <Button variant="secondary" className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-semibold hover:brightness-95 px-6 py-3 rounded-lg shadow-md">
                      Browse Jobs
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="hidden md:block">
                <img src={itlogo} alt="USTP Opportunity System" className="max-h-96 object-cover w-full" style={{
                boxShadow: '0px 5px 20px  #1F1B4F',
                borderRadius: '2px'
              }} />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl text-center mb-12 text-ustp-darkblue font-extrabold">
              What We Offer
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-ustp-lightgray p-6 rounded-xl text-center hover:shadow-md transition-shadow">
                <div className="w-16 h-16 mx-auto mb-4 bg-ustp-yellow rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">Student Marketplace</h3>
                <p className="text-gray-600">
                  Buy, sell, or trade items with fellow USTP students. From textbooks to tech gadgets, find what you need at student-friendly prices.
                </p>
              </div>
              
              <div className="bg-ustp-lightgray p-6 rounded-xl text-center hover:shadow-md transition-shadow">
                <div className="w-16 h-16 mx-auto mb-4 bg-ustp-darkblue text-white rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">Job Portal</h3>
                <p className="text-gray-600">
                  Discover part-time jobs, internships, and freelance opportunities both on and off campus that fit your schedule and career goals.
                </p>
              </div>
              
              <div className="bg-ustp-lightgray p-6 rounded-xl text-center hover:shadow-md transition-shadow">
                <div className="w-16 h-16 mx-auto mb-4 bg-ustp-yellow rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">Secure Platform</h3>
                <p className="text-gray-600">
                  Authenticate with your USTP credentials for a secure experience. Connect with verified members of the USTP community.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Listings Section */}
        <section className="py-16 bg-ustp-lightgray">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-ustp-blue">Featured Marketplace Items</h2>
              <Link to="/marketplace">
                <Button variant="outline" className="mt-4 md:mt-0 border-ustp-blue text-ustp-blue hover:bg-ustp-blue hover:text-white">
                  View All Items
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredMarketplaceItems.map(item => <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-48 overflow-hidden">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-ustp-blue text-sm font-semibold">₱{item.price.toFixed(2)}</p>
                  </CardContent>
                </Card>)}
            </div>
          </div>
        </section>

        {/* Featured Jobs Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-ustp-blue">Featured Job Opportunities</h2>
              <Link to="/jobs">
                <Button variant="outline" className="mt-4 md:mt-0 border-ustp-blue text-ustp-blue hover:bg-ustp-blue hover:text-white">
                  View All Jobs
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredJobs.map(job => <Card key={job.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{job.title}</h3>
                    <p className="text-gray-600">{job.company}</p>
                    <div className="flex justify-between mt-3 text-sm">
                      <span className="text-gray-500">{job.location}</span>
                      <span className="text-ustp-blue font-medium">{job.type}</span>
                    </div>
                  </CardContent>
                </Card>)}
            </div>
          </div>
        </section>

        {/* Call to Action */}
      </main>
      <Footer />
    </div>;
};
export default Index;