
import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Search, Filter, Trash2, Edit, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { CSVUploadModal } from '@/components/admin/CSVUploadModal';

interface ScheduledWorkout {
  id: string;
  user_id: string;
  workout_id: string;
  scheduled_date: string;
  status: string;
  admin_message: string | null;
  created_at: string;
  scheduled_by_admin: string | null;
  profiles: {
    id: string;
    first_name: string | null;
    last_name: string | null;
  } | null;
  prepared_workouts: {
    id: string;
    title: string;
    difficulty: string;
    duration_minutes: number;
  } | null;
}

export default function WorkoutScheduleManager() {
  const [schedules, setSchedules] = useState<ScheduledWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('scheduled_workouts')
        .select(`
          *,
          profiles:user_id (
            id,
            first_name,
            last_name
          ),
          prepared_workouts:workout_id (
            id,
            title,
            difficulty,
            duration_minutes
          )
        `)
        .order('scheduled_date', { ascending: true });

      if (error) throw error;
      setSchedules(data || []);
    } catch (error: any) {
      console.error('Error fetching schedules:', error);
      toast({
        title: 'Error',
        description: 'Failed to load workout schedules',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const deleteSchedule = async (scheduleId: string) => {
    if (!window.confirm('Are you sure you want to delete this scheduled workout?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('scheduled_workouts')
        .delete()
        .eq('id', scheduleId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Scheduled workout deleted successfully',
      });

      fetchSchedules();
    } catch (error: any) {
      console.error('Error deleting schedule:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete scheduled workout',
        variant: 'destructive',
      });
    }
  };

  const updateStatus = async (scheduleId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('scheduled_workouts')
        .update({ status: newStatus })
        .eq('id', scheduleId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Workout status updated to ${newStatus}`,
      });

      fetchSchedules();
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update workout status',
        variant: 'destructive',
      });
    }
  };

  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = searchTerm === '' || 
      schedule.profiles?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.profiles?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.prepared_workouts?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || schedule.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'skipped': return 'destructive';
      case 'scheduled': return 'outline';
      default: return 'outline';
    }
  };

  if (loading) {
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
          <div>
            <h1 className="text-3xl font-bold">Workout Schedules</h1>
            <p className="text-muted-foreground">Manage and monitor scheduled workouts</p>
          </div>
          <div className="flex gap-2">
            <CSVUploadModal onSuccess={fetchSchedules} />
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Schedule
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Scheduled</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{schedules.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {schedules.filter(s => s.status === 'completed').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {schedules.filter(s => s.status === 'scheduled').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Skipped</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {schedules.filter(s => s.status === 'skipped').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by user name or workout title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="skipped">Skipped</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Schedules Table */}
        <Card>
          <CardHeader>
            <CardTitle>Scheduled Workouts ({filteredSchedules.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Workout</TableHead>
                  <TableHead>Scheduled Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Admin Message</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSchedules.map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {schedule.profiles?.first_name} {schedule.profiles?.last_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ID: {schedule.user_id.slice(0, 8)}...
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {schedule.prepared_workouts?.title || 'Deleted Workout'}
                        </div>
                        {schedule.prepared_workouts && (
                          <Badge variant="outline" className="text-xs">
                            {schedule.prepared_workouts.difficulty}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(schedule.scheduled_date), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(schedule.status)}>
                        {schedule.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {schedule.prepared_workouts?.duration_minutes || 0} min
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">
                        {schedule.admin_message || '—'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {schedule.status === 'scheduled' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateStatus(schedule.id, 'completed')}
                            >
                              Mark Complete
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateStatus(schedule.id, 'skipped')}
                            >
                              Mark Skipped
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteSchedule(schedule.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredSchedules.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No scheduled workouts found matching your criteria.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
