import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { supabase } from "@/lib/supabase";
import { Loader2, Save, User, Smartphone } from "lucide-react";
import ProfilePhotoUpload from "@/components/profile/ProfilePhotoUpload";

const profileFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
  email: z.string().email("Invalid email address").min(1, "Email is required").readonly(),
});

const notificationFormSchema = z.object({
  workoutReminders: z.boolean().default(true),
  progressUpdates: z.boolean().default(true),
  newFeaturesUpdates: z.boolean().default(false),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type NotificationFormValues = z.infer<typeof notificationFormSchema>;

const Settings = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [defaultTab, setDefaultTab] = useState("profile");
  const [profileData, setProfileData] = useState<{
    firstName: string;
    lastName: string;
    profilePhotoUrl: string | null;
  }>({
    firstName: "",
    lastName: "",
    profilePhotoUrl: null
  });

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: async () => {
      if (!user) return { firstName: "", lastName: "", email: "" };
      
      setIsLoading(true);
      try {
        const { data } = await supabase
          .from("profiles")
          .select("first_name, last_name, profile_photo_url")
          .eq("id", user.id)
          .single();
          
        setIsLoading(false);
        
        setProfileData({
          firstName: data?.first_name || "",
          lastName: data?.last_name || "",
          profilePhotoUrl: data?.profile_photo_url || null
        });
        
        return {
          firstName: data?.first_name || "",
          lastName: data?.last_name || "",
          email: user.email || "",
        };
      } catch (error) {
        setIsLoading(false);
        return { firstName: "", lastName: "", email: user.email || "" };
      }
    },
  });

  const notificationForm = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      workoutReminders: true,
      progressUpdates: true,
      newFeaturesUpdates: false,
    },
  });

  const onProfileSubmit = async (data: ProfileFormValues) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: data.firstName,
          last_name: data.lastName,
        })
        .eq("id", user.id);

      if (error) throw error;
      
      // Update the local state
      setProfileData({
        ...profileData,
        firstName: data.firstName,
        lastName: data.lastName
      });
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
      console.error("Error updating profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onNotificationSubmit = (data: NotificationFormValues) => {
    // In a real app, you would save this to the database
    // For now, we'll just show a toast
    toast({
      title: "Notification preferences updated",
      description: "Your notification preferences have been saved.",
    });
  };

  const handlePhotoUpdated = (url: string) => {
    setProfileData({
      ...profileData,
      profilePhotoUrl: url || null
    });
  };

  const userName = `${profileData.firstName} ${profileData.lastName}`.trim() || user?.email || 'User';

  return (
    <AppLayout>
      <div className="container max-w-3xl py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        </div>

        <Tabs defaultValue={defaultTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile" onClick={() => setDefaultTab("profile")}>
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" onClick={() => setDefaultTab("notifications")}>
              Notifications
            </TabsTrigger>
            <TabsTrigger value="account" onClick={() => setDefaultTab("account")}>
              Account
            </TabsTrigger>
            <TabsTrigger value="devices" onClick={() => setDefaultTab("devices")}>
              Devices
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and profile photo.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-center mb-4">
                  <ProfilePhotoUpload 
                    currentPhotoUrl={profileData.profilePhotoUrl} 
                    onPhotoUpdated={handlePhotoUpdated}
                    userName={userName}
                  />
                </div>
                
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                    <FormField
                      control={profileForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your first name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your last name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} disabled />
                          </FormControl>
                          <FormDescription>
                            Email cannot be changed.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" disabled={isLoading} className="mt-4">
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save changes
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Configure how you'd like to receive notifications.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...notificationForm}>
                  <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-4">
                    <FormField
                      control={notificationForm.control}
                      name="workoutReminders"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Workout Reminders</FormLabel>
                            <FormDescription>
                              Receive reminders for scheduled workouts.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={notificationForm.control}
                      name="progressUpdates"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Progress Updates</FormLabel>
                            <FormDescription>
                              Get notifications about your fitness progress.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={notificationForm.control}
                      name="newFeaturesUpdates"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Product Updates</FormLabel>
                            <FormDescription>
                              Receive updates about new features and improvements.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="mt-4">
                      <Save className="mr-2 h-4 w-4" />
                      Save preferences
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Account Management</CardTitle>
                <CardDescription>
                  Manage your account settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Account Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">User ID</p>
                      <p className="text-sm font-mono truncate">{user?.id || 'Not available'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Account Created</p>
                      <p className="text-sm">
                        {user?.created_at 
                          ? new Date(user.created_at).toLocaleDateString() 
                          : 'Not available'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Danger Zone</h3>
                  <div className="rounded-md border border-red-200 p-4 bg-red-50">
                    <h4 className="text-sm font-medium text-red-800">Delete Account</h4>
                    <p className="text-sm text-red-600 mt-1">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <Button variant="destructive" size="sm" className="mt-4">
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="devices" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Connected Devices & Services</CardTitle>
                <CardDescription>
                  Manage your connected fitness trackers and services to sync your activity data.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium flex items-center">
                      <Smartphone className="mr-2 h-5 w-5" /> Fitbit
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Connect your Fitbit account to sync steps, activities, and more.
                    </p>
                    <Button variant="outline" className="mt-2">
                      Connect Fitbit
                    </Button>
                    {/* TODO: Add disconnect button and status if connected */}
                  </div>
                  <hr />
                  <div>
                    <h3 className="text-lg font-medium flex items-center">
                      <Smartphone className="mr-2 h-5 w-5" /> Garmin
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Connect your Garmin account to sync activities, heart rate, and other metrics.
                    </p>
                    <Button variant="outline" className="mt-2">
                      Connect Garmin
                    </Button>
                    {/* TODO: Add disconnect button and status if connected */}
                  </div>
                   {/* Add more services here as needed */}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Settings;
