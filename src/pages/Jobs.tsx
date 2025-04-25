import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import NavBar from '@/components/layout/NavBar';
import Footer from '@/components/layout/Footer';
import { Badge } from '@/components/ui/badge';
import { PostJobDialog } from '@/components/jobs/PostJobDialog';
import { useUserRole } from '@/hooks/useUserRole';

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  description: string;
  type: string;
  salary: string;
  deadline: string;
  postedDate: string;
  logo: string;
  tags: string[];
}

const mockJobs: Job[] = [
  {
    id: 1,
    title: "Web Developer Intern",
    company: "TechSolutions Inc.",
    location: "Cagayan de Oro",
    description: "Looking for a web developer intern to assist in building responsive websites and applications. Knowledge of HTML, CSS, and JavaScript required.",
    type: "Internship",
    salary: "₱8,000 per month",
    deadline: "2023-05-15",
    postedDate: "2023-04-01",
    logo: "https://images.unsplash.com/photo-1549921296-3b0f9a35af35?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    tags: ["IT", "Web Development", "Internship"]
  },
  {
    id: 2,
    title: "Marketing Assistant",
    company: "Global Marketing PH",
    location: "Remote",
    description: "Part-time marketing assistant needed to help with social media campaigns, content creation, and market research.",
    type: "Part-time",
    salary: "₱100 per hour",
    deadline: "2023-05-20",
    postedDate: "2023-04-05",
    logo: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    tags: ["Marketing", "Social Media", "Part-time"]
  },
  {
    id: 3,
    title: "Research Assistant",
    company: "USTP Research Department",
    location: "USTP Campus",
    description: "Research assistant needed for ongoing environmental science project. Duties include data collection, analysis, and report writing.",
    type: "On-campus",
    salary: "₱5,000 per project",
    deadline: "2023-05-10",
    postedDate: "2023-04-02",
    logo: "https://scontent.fcgy2-2.fna.fbcdn.net/v/t39.30808-1/486852489_985098540486236_8200406653387184104_n.jpg?stp=dst-jpg_s200x200_tt6&_nc_cat=101&ccb=1-7&_nc_sid=e99d92&_nc_eui2=AeE_UqZjgsLY63KFLSbijTT8UVSWjS9EOe1RVJaNL0Q57T4GtM8B5VoIstheiUp1rsFrl02gFQwWVkXjNsulS6fu&_nc_ohc=HhyTmGNHYlwQ7kNvwGjQmSx&_nc_oc=AdnD0QVFjF_9jJ65O6buddzwq4jgcuhYgRr2ChE1dK2c_lUuDTIkcUVW5zS7U7vU62s&_nc_zt=24&_nc_ht=scontent.fcgy2-2.fna&_nc_gid=BYLJ7IiKuc5ZCMDtbd-HcQ&oh=00_AfHYTat4Es7g_MjaDnR-8a08uMPvzJXI8G2Y-ZgAa0NWvQ&oe=680BE4B7",
    tags: ["Research", "On-campus", "Environmental Science"]
  },
  {
    id: 4,
    title: "Graphic Design Freelancer",
    company: "Creative Arts Studio",
    location: "Flexible",
    description: "Freelance graphic designer needed for various projects including logo design, marketing materials, and social media graphics.",
    type: "Freelance",
    salary: "₱5,000 - ₱10,000 per project",
    deadline: "2023-05-25",
    postedDate: "2023-04-08",
    logo: "https://scontent.fcgy2-4.fna.fbcdn.net/v/t39.30808-1/487150399_2090189021402714_2255233814080924158_n.jpg?stp=dst-jpg_s200x200_tt6&_nc_cat=110&ccb=1-7&_nc_sid=e99d92&_nc_eui2=AeEahKB_uYzyFCEfHOsvGPKpnZvdoCmW2Hmdm92gKZbYecTupaRYcGTqSNbNoAu6oBLaf6HoRuJIBrjuL_mz6Ytk&_nc_ohc=1YrjjGgB7w0Q7kNvwHrbzND&_nc_oc=Adnb4YhbWQvkMnDB86OuSDWQvuZs2r-R0bnTl1THBO3VGIlkikaiDCFPJgVh_7ri8jw&_nc_zt=24&_nc_ht=scontent.fcgy2-4.fna&_nc_gid=2kieSCJET9NF4utMLg-TUg&oh=00_AfGZvFJOLV0p8RLdnKmcrW7ju--IpVaybAiAiT32BHXJ1g&oe=680BDFD3",
    tags: ["Design", "Creative", "Freelance"]
  },
  {
    id: 5,
    title: "IT Help Desk Support",
    company: "USTP IT Department",
    location: "USTP Campus",
    description: "Part-time IT help desk support needed to assist students and faculty with technical issues. Knowledge of basic computer troubleshooting required.",
    type: "On-campus",
    salary: "₱90 per hour",
    deadline: "2023-05-12",
    postedDate: "2023-04-03",
    logo: "https://scontent.fcgy2-2.fna.fbcdn.net/v/t39.30808-1/481425921_1360638085371613_6720374098615888538_n.jpg?stp=dst-jpg_s200x200_tt6&_nc_cat=103&ccb=1-7&_nc_sid=1d2534&_nc_eui2=AeHr6C7cOFsBmM8hrRhm45NtrmXxFeEopymuZfEV4SinKWpTU6vnOQc6plNx8o7mxqQkXwy0y-DN-LR7ue_mdBg_&_nc_ohc=vV_Cpqr2-m8Q7kNvwGWaAQ0&_nc_oc=AdkRhyYVxNZi-ORwQ3Xaxv14Nm5uttEcXDDwC-EUjFBQb9Fi7lwO0gzIetuQPm8qhXI&_nc_zt=24&_nc_ht=scontent.fcgy2-2.fna&_nc_gid=GGv1dapZPu8dcLRtjDM-gQ&oh=00_AfEsK12fz-Qc4_ky3xkS7aveqjbLkwnyRGQOhpxLlIngpA&oe=680BD473",
    tags: ["IT", "On-campus", "Technical Support"]
  },
];

const Jobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [jobType, setJobType] = useState('all');
  const [sortOption, setSortOption] = useState('latest');
  const { isEmployer } = useUserRole();

  useEffect(() => {
    setJobs(mockJobs);
    setFilteredJobs(mockJobs);
  }, []);

  useEffect(() => {
    let result = [...jobs];
    
    if (jobType !== 'all') {
      result = result.filter(job => job.type.toLowerCase() === jobType.toLowerCase());
    }
    
    if (searchTerm) {
      result = result.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (sortOption === 'latest') {
      result.sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime());
    } else if (sortOption === 'deadline') {
      result.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    }
    
    setFilteredJobs(result);
  }, [jobs, searchTerm, jobType, sortOption]);

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-grow bg-ustp-lightgray">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-ustp-darkblue mb-2">USTP Job Portal</h1>
            <p className="text-gray-700">Find part-time jobs, internships, and freelance opportunities</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Input
                  placeholder="Search jobs, companies, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <Select value={jobType} onValueChange={setJobType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Job Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="on-campus">On-campus</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={sortOption} onValueChange={setSortOption}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="latest">Latest</SelectItem>
                    <SelectItem value="deadline">Deadline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="mb-4 flex justify-end">
            {isEmployer && <PostJobDialog />}
          </div>
          
          <div className="space-y-4">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <Card key={job.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row">
                    <div className="p-4 md:w-1/4 flex items-center justify-center md:justify-start">
                      <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                        <img 
                          src={job.logo} 
                          alt={job.company} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder.svg";
                          }}
                        />
                      </div>
                    </div>
                    <div className="md:w-3/4">
                      <CardHeader className="p-4 pb-2">
                        <div className="flex flex-wrap justify-between items-start">
                          <div>
                            <CardTitle className="text-xl">{job.title}</CardTitle>
                            <CardDescription className="text-base font-medium">
                              {job.company} • {job.location}
                            </CardDescription>
                          </div>
                          <Badge className="bg-ustp-blue text-white">{job.type}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{job.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {job.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="bg-ustp-lightgray text-gray-700">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 pt-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                        <div>
                          <p className="text-sm font-medium">{job.salary}</p>
                          <div className="text-xs text-gray-500 flex gap-3">
                            <span>Posted: {new Date(job.postedDate).toLocaleDateString()}</span>
                            <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <Button className="bg-ustp-blue text-white hover:bg-ustp-darkblue">
                          Apply Now
                        </Button>
                      </CardFooter>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-600">No jobs found</h3>
                <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Jobs;
