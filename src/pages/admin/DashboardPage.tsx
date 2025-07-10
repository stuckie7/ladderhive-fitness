import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAdmin } from '@/context/AdminContext';
import { Users, Dumbbell, Calendar, Activity, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';

export function DashboardPage() {
  const { stats, loadStats, userStats, loadUserStats, loading } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    loadStats();
    loadUserStats();
  }, [loadStats, loadUserStats]);

  if (loading || !stats) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="flex space-x-2">
            <Button onClick={() => navigate('/admin/users')}>
              <Users className="h-4 w-4 mr-2" />
              Manage Users
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeUsers} active in last 30 days
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Workouts</CardTitle>
              <Dumbbell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalWorkouts}</div>
              <p className="text-xs text-muted-foreground">
                {stats.adminWorkouts} admin-suggested
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled Workouts</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSchedules}</div>
              <p className="text-xs text-muted-foreground">
                Scheduled by users and admins
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Now</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.floor(stats.activeUsers / 3)}+
              </div>
              <p className="text-xs text-muted-foreground">
                Estimated active users now
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.recentAuditLogs.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentAuditLogs.map((log) => (
                    <div key={log.id} className="flex items-start space-x-4">
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {log.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(log.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No recent activity</p>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/admin/users/new')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New User
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/admin/workouts/new')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Workout Template
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/admin/schedules/assign')}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Assign Workout Schedule
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
