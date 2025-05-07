
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: number | undefined;
  loading: boolean;
  description: string;
}

const StatCard = ({ title, value, loading, description }: StatCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-12 flex items-center">
            <Loader2 className="h-5 w-5 animate-spin text-ustp-blue" />
          </div>
        ) : (
          <>
            <div className="text-3xl font-bold text-ustp-blue">{value}</div>
            <p className="text-sm text-gray-500">{description}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
