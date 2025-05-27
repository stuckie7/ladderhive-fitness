import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, User, Dumbbell, Calendar, Save, Trash2, Edit, X } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { format } from 'date-fns';

export function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { userStats, loadUserStats } = useAdmin();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  
  // Mock user data - in a real app, this would come from an API
  const [user, setUser] = useState({
    id: userId || '',
    email: 'user@example.com',
    fullName: 'John Doe',
    role: 'user',
    lastActive: new Date().toISOString(),
    createdAt: '2023-01-15T10:30:00Z',
    workoutCount: 12,
    scheduleCount: 8,
    isActive: true
  });

  const [formData, setFormData] = useState({
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    isActive: user.isActive
  });

  useEffect(() => {
    // In a real app, fetch user details by ID
    loadUserStats();
    
    // Find user in stats
    const userFromStats = userStats.find(u => u.userId === userId);
    if (userFromStats) {
      setUser(prev => ({
        ...prev,
        email: userFromStats.email,
        fullName: userFromStats.fullName || 'No name',
        lastActive: userFromStats.lastActive || new Date().toISOString(),
        workoutCount: userFromStats.workoutCount,
        scheduleCount: userFromStats.scheduleCount
      }));
      setFormData(prev => ({
        ...prev,
        fullName: userFromStats.fullName || 'No name',
        email: userFromStats.email
      }));
    }
  }, [userId, userStats, loadUserStats]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = () => {
    // In a real app, this would update the user via an API call
    setUser(prev => ({
      ...prev,
      ...formData
    }));
    setIsEditing(false);
    
    // Show success message
    // toast({
    //   title: "Success",
    //   description: "User updated successfully",
    // });
  };

  const handleDeleteUser = () => {
    // In a real app, this would delete the user via an API call
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      // Delete user logic here
      navigate('/admin/users');
    }
  };

  // Mock workout history data
  const workoutHistory = [
    { id: '1', name: 'Morning Workout', type: 'Strength', duration: '45 min', date: '2023-06-15T08:30:00Z' },
    { id: '2', name: 'Evening Run', type: 'Cardio', duration: '30 min', date: '2023-06-14T18:15:00Z' },
    { id: '3', name: 'Yoga Session', type: 'Flexibility', duration: '60 min', date: '2023-06-12T07:00:00Z' },
  ];

  // Mock scheduled workouts
  const scheduledWorkouts = [
    { id: 's1', name: 'Full Body Workout', type: 'Strength', scheduledDate: '2023-06-17T09:00:00Z' },
    { id: 's2', name: 'Morning Run', type: 'Cardio', scheduledDate: '2023-06-18T07:00:00Z' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/users')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isEditing ? (
                <Input
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="text-3xl font-bold p-0 border-0 shadow-none focus-visible:ring-0"
                />
              ) : (
                user.fullName
              )}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? (
                <Input
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="p-0 border-0 shadow-none focus-visible:ring-0"
                />
              ) : (
                user.email
              )}
            </p>
          </div>
          <div className="ml-auto flex space-x-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  <X className="h-4 w-4 mr-2" /> Cancel
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" /> Save Changes
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={handleDeleteUser}>
                  <Trash2 className="h-4 w-4 mr-2" /> Delete User
                </Button>
                <Button onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" /> Edit User
                </Button>
              </>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">
              <User className="h-4 w-4 mr-2" /> Overview
            </TabsTrigger>
            <TabsTrigger value="workouts">
              <Dumbbell className="h-4 w-4 mr-2" /> Workouts ({user.workoutCount})
            </TabsTrigger>
            <TabsTrigger value="schedule">
              <Calendar className="h-4 w-4 mr-2" /> Schedule ({user.scheduleCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Member Since</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {format(new Date(user.createdAt), 'MMM yyyy')}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(user.createdAt), 'MMMM d, yyyy')}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Last Active</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {format(new Date(user.lastActive), 'MMM d')}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(user.lastActive), 'h:mm a')}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Workouts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{user.workoutCount}</div>
                  <p className="text-xs text-muted-foreground">
                    Total workouts completed
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Status</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Select 
                      value={formData.role}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant={user.role === 'admin' ? 'default' : 'outline'}>
                      {user.role === 'admin' ? 'Admin' : 'User'}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>User Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    {isEditing ? (
                      <Input
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <div className="text-sm">{user.fullName}</div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <div className="text-sm">{user.email}</div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Account Status</Label>
                  <div className="flex items-center space-x-2">
                    {isEditing ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="isActive"
                          name="isActive"
                          checked={formData.isActive}
                          onChange={handleInputChange}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <Label htmlFor="isActive" className="text-sm font-normal">
                          {formData.isActive ? 'Active' : 'Inactive'}
                        </Label>
                      </div>
                    ) : (
                      <Badge variant={user.isActive ? 'default' : 'outline'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workouts">
            <Card>
              <CardHeader>
                <CardTitle>Workout History</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Workout</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workoutHistory.map((workout) => (
                      <TableRow key={workout.id}>
                        <TableCell className="font-medium">{workout.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{workout.type}</Badge>
                        </TableCell>
                        <TableCell>{workout.duration}</TableCell>
                        <TableCell>{format(new Date(workout.date), 'MMM d, yyyy')}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">View</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule">
            <div className="flex justify-end mb-4">
              <Button onClick={() => navigate(`/admin/users/${userId}/schedule`)}>
                <Plus className="h-4 w-4 mr-2" /> Schedule Workout
              </Button>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Scheduled Workouts</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Workout</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Scheduled For</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scheduledWorkouts.map((workout) => (
                      <TableRow key={workout.id}>
                        <TableCell className="font-medium">{workout.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{workout.type}</Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(workout.scheduledDate), 'MMM d, yyyy h:mm a')}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="ghost" size="sm">Edit</Button>
                          <Button variant="ghost" size="sm" className="text-red-600">Cancel</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
