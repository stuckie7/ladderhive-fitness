import { Metadata } from 'next';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import { HealthIntegration } from '@/components/Health/HealthIntegration';

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Manage your account settings and preferences.',
};

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="container max-w-4xl py-6 lg:py-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-8">
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Health & Fitness</h2>
          <HealthIntegration />
        </div>
      </div>
    </div>
  );
}
