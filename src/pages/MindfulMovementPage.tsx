
import React, { useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { YogaWithBreathing } from "@/components/mindfulness/YogaWithBreathing";
import { useYogaMindfulMovements } from "@/hooks/use-yoga-mindful-movements";

const MindfulMovementPage = () => {
  const {
    workouts,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
  } = useYogaMindfulMovements();

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-6">Mindful Movement</h1>
          
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search practices..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </header>

        <div className="w-full">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Spinner className="h-8 w-8" />
            </div>
          ) : error ? (
            <Card className="p-4 bg-red-50 dark:bg-red-900/20 text-center">
              <p className="text-red-700 dark:text-red-300">
                Error loading mindful movement practices. Please try again.
              </p>
            </Card>
          ) : workouts.length === 0 ? (
            <Card className="p-8 text-center bg-blue-50 dark:bg-blue-900/10">
              <h3 className="text-lg font-medium mb-2">No practices found</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search query to find mindful movement practices.
              </p>
              <Button 
                className="mt-4" 
                onClick={() => setSearchQuery("")}
              >
                Clear Search
              </Button>
            </Card>
          ) : (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Featured Mindful Movements</h2>
              
              <div className="space-y-6">
                {workouts.slice(0, 10).map((workout) => (
                  <YogaWithBreathing key={workout.id} workout={workout} />
                ))}
              </div>
              
              {workouts.length > 10 && (
                <div className="text-center mt-8">
                  <Button>
                    Load More Practices
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default MindfulMovementPage;
