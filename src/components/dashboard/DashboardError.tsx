
import React from 'react';
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/layout/AppLayout";

interface DashboardErrorProps {
  errorMessage: string;
}

const DashboardError: React.FC<DashboardErrorProps> = ({ errorMessage }) => {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-10">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Error Loading Dashboard</h2>
          <p className="mb-4">{errorMessage}</p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default DashboardError;
