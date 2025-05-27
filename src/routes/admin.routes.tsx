import { createBrowserRouter } from 'react-router-dom';
import { DashboardPage } from '@/pages/admin/DashboardPage';
import { UsersPage } from '@/pages/admin/UsersPage';
import { UserDetailPage } from '@/pages/admin/UserDetailPage';
import { AdminLayout } from '@/components/admin/AdminLayout';

export const adminRoutes = createBrowserRouter([
  {
    path: '/admin',
    element: <DashboardPage />,
  },
  {
    path: '/admin/users',
    element: <UsersPage />,
  },
  {
    path: '/admin/users/:userId',
    element: <UserDetailPage />,
  },
  {
    path: '/admin/workouts',
    element: (
      <AdminLayout>
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-6">Workouts Management</h1>
          <p>Workout management coming soon...</p>
        </div>
      </AdminLayout>
    ),
  },
  {
    path: '/admin/schedules',
    element: (
      <AdminLayout>
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-6">Workout Schedules</h1>
          <p>Schedule management coming soon...</p>
        </div>
      </AdminLayout>
    ),
  },
  {
    path: '/admin/analytics',
    element: (
      <AdminLayout>
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-6">Analytics</h1>
          <p>Analytics dashboard coming soon...</p>
        </div>
      </AdminLayout>
    ),
  },
]);
