
import { createBrowserRouter } from 'react-router-dom';
import { DashboardPage } from '@/pages/admin/DashboardPage';
import { UsersPage } from '@/pages/admin/UsersPage';
import { UserDetailPage } from '@/pages/admin/UserDetailPage';
import { NewUserPage } from '@/pages/admin/users/NewUserPage';
import { NewWorkoutPage } from '@/pages/admin/workouts/NewWorkoutPage';
import { AssignWorkoutPage } from '@/pages/admin/schedules/AssignWorkoutPage';
import { AdminLayout } from '@/components/admin/AdminLayout';
import WorkoutScheduleManager from '@/pages/admin/WorkoutScheduleManager';

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
    path: '/admin/users/new',
    element: <NewUserPage />,
  },
  {
    path: '/admin/users/:userId',
    element: <UserDetailPage />,
  },
  {
    path: '/admin/workouts',
    element: (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Workout Templates</h1>
            <button
              onClick={() => window.location.href = '/admin/workouts/new'}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
            >
              Create New Template
            </button>
          </div>
          <p className="text-muted-foreground">Manage workout templates that can be assigned to users</p>
        </div>
      </AdminLayout>
    ),
  },
  {
    path: '/admin/workouts/new',
    element: <NewWorkoutPage />,
  },
  {
    path: '/admin/schedules',
    element: <WorkoutScheduleManager />,
  },
  {
    path: '/admin/schedules/assign',
    element: <AssignWorkoutPage />,
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
