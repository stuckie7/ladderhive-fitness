import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { HealthIntegration } from '@/components/Health/HealthIntegration';
import AppLayout from '@/components/layout/AppLayout';

export default function HealthPage() {
  const router = useRouter();

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Health & Fitness</h1>
        <div className="max-w-4xl mx-auto">
          <HealthIntegration />
        </div>
      </div>
    </AppLayout>
  );
}
