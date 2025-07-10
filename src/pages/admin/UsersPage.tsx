import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, UserPlus, Filter } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { format } from 'date-fns';

export function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string | null>(null);
  const { userStats, loadUserStats, loading } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    loadUserStats();
  }, [loadUserStats]);

  const filteredUsers = userStats
    .filter(user => {
      const matchesSearch = 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = filterRole 
        ? (filterRole === 'admin' ? user.email?.endsWith('@admin.com') : !user.email?.endsWith('@admin.com'))
        : true;
      
      return matchesSearch && matchesRole;
    });

  if (loading && userStats.length === 0) {
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Users</h1>
            <p className="text-muted-foreground">
              Manage all users and their permissions
            </p>
          </div>
          <Button className="mt-4 md:mt-0" onClick={() => navigate('/admin/users/new')}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>

        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={filterRole || ''}
              onChange={(e) => setFilterRole(e.target.value || null)}
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Workouts</TableHead>
                <TableHead>Schedules</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.userId}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{user.fullName || 'No name'}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{user.workoutCount}</TableCell>
                    <TableCell>{user.scheduleCount}</TableCell>
                    <TableCell>
                      {user.lastActive ? format(new Date(user.lastActive), 'MMM d, yyyy') : 'Never'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.email?.endsWith('@admin.com') ? 'default' : 'outline'}>
                        {user.email?.endsWith('@admin.com') ? 'Admin' : 'User'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/admin/users/${user.userId}`)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
