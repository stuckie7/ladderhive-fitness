
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";

interface ExerciseDetailSkeletonProps {
  onBackClick?: () => void;
}

export default function ExerciseDetailSkeleton({ onBackClick }: ExerciseDetailSkeletonProps) {
  return (
    <div className="container mx-auto px-4 py-6">
      <Button variant="outline" className="mb-6" disabled={!onBackClick} onClick={onBackClick}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Dashboard
      </Button>
      <Skeleton className="h-12 w-3/4 mb-4" />
      <Skeleton className="h-8 w-1/3 mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Skeleton className="h-64 mb-4" />
          <Skeleton className="h-32" />
        </div>
        <div>
          <Skeleton className="h-64 mb-4" />
          <Skeleton className="h-64" />
        </div>
      </div>
    </div>
  );
}
