
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { LoadingIndicator, ErrorMessage } from './LoadingErrorStates';
import { MessageEmployerDialog } from '../jobs/MessageEmployerDialog';
import { useAuth } from '@/context/AuthProvider';

interface JobsTabProps {
  jobApplications: any[];
  applicationsLoading: boolean;
  applicationsError: string | null;
  handleViewJobDetails: (applicationId: string) => void;
  handleFindOpportunities: () => void;
}

const JobsTab = ({
  jobApplications,
  applicationsLoading,
  applicationsError,
  handleViewJobDetails,
  handleFindOpportunities,
}: JobsTabProps) => {
  const { user } = useAuth();
  
  return (
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
                  <div className="flex space-x-2">
                    <MessageEmployerDialog 
                      jobId={application.jobId}
                      jobTitle={application.jobTitle}
                      employerId={application.employerId || ''}
                      applicationId={application.id}
                      trigger={
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Messages
                        </Button>
                      }
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewJobDetails(application.id)}
                    >
                      View Details
                    </Button>
                  </div>
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
  );
};

export default JobsTab;
