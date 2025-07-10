
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ProfileSkeleton = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-10 w-10 rounded-md" />
          </div>
          <div className="flex items-center gap-4 mb-4 mt-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-32" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="flex flex-col items-center">
                <Skeleton className="h-5 w-5 rounded-full mb-1" />
                <Skeleton className="h-6 w-12 mb-1" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="text-center p-2">
                <Skeleton className="h-4 w-16 mx-auto mb-2" />
                <Skeleton className="h-6 w-12 mx-auto" />
              </div>
            ))}
          </div>
          
          <div>
            <Skeleton className="h-4 w-24 mb-2" />
            <div className="flex flex-wrap gap-2">
              {[...Array(4)].map((_, index) => (
                <Skeleton key={index} className="h-6 w-16 rounded-full" />
              ))}
            </div>
          </div>
          
          <div>
            <Skeleton className="h-4 w-32 mb-2" />
            <div className="flex justify-between">
              {[...Array(7)].map((_, index) => (
                <Skeleton key={index} className="w-8 h-8 rounded-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-36" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full rounded-lg mb-4" />
          <Skeleton className="h-10 w-full rounded-md" />
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSkeleton;
