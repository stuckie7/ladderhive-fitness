# Ladderhive Fitness - Admin Guide

This guide explains how to set up and use the admin functionality in the Ladderhive Fitness application.

## Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Supabase project with the required tables and RLS policies

## Setting Up Admin Users

1. **Database Setup**
   - Run the SQL migration script in `supabase/migrations/20240526220000_admin_setup.sql` to set up the required tables and RLS policies.
   - This will create:
     - Admin audit logs table
     - Required RLS policies for admin access
     - Helper functions for admin operations

2. **Make a User an Admin**
   - In the Supabase dashboard, go to the Authentication > Users section
   - Find the user you want to make an admin
   - Edit the user's metadata to include `"role": "admin"`
   - Example metadata:
     ```json
     {
       "full_name": "Admin User",
       "role": "admin"
     }
     ```

## Accessing the Admin Dashboard

1. **Web Interface**
   - Log in as an admin user
   - The admin dashboard is accessible at `/admin`
   - You should see an "Admin" link in the bottom navigation (only visible to admin users)

2. **Features**
   - **Dashboard**: Overview of users, workouts, and activity
   - **Users**: Manage users, view details, and assign roles
   - **Workouts**: Create and manage workout templates
   - **Schedules**: Assign and manage workout schedules for users
   - **Analytics**: View usage statistics and metrics

## Admin Capabilities

1. **User Management**
   - View all users
   - Edit user details
   - Assign admin roles
   - View user activity and workout history

2. **Workout Management**
   - Create and edit workout templates
   - Assign workouts to users
   - Track workout completion

3. **Scheduling**
   - Create workout schedules for users
   - Assign recurring workouts
   - Monitor scheduled workouts

## Security Considerations

- Admin routes are protected by both authentication and role-based access control
- All admin actions are logged in the `admin_audit_logs` table
- Sensitive operations require admin privileges
- Always follow the principle of least privilege when assigning admin roles

## Troubleshooting

1. **Admin Access Not Working**
   - Ensure the user has the `role: "admin"` in their user metadata
   - Check the browser console for any errors
   - Verify that the RLS policies are correctly set up in Supabase

2. **Missing Admin Navigation**
   - The admin link only appears for users with admin privileges
   - Log out and log back in if you've recently been granted admin access

3. **Permission Errors**
   - Ensure the Supabase RLS policies are correctly configured
   - Check that the `is_admin()` function is working as expected

## Development

To add new admin features:

1. Create new routes in `src/routes/admin.routes.tsx`
2. Add corresponding page components in `src/pages/admin/`
3. Use the `AdminLayout` component for consistent styling
4. Implement required services in `src/services/adminService.ts`
5. Update the admin context in `src/context/AdminContext.tsx` as needed

## Deployment

When deploying to production:

1. Ensure all RLS policies are properly configured
2. Set up proper authentication and authorization rules
3. Monitor the `admin_audit_logs` table for suspicious activity
4. Regularly back up the database

## Support

For additional support or questions about the admin functionality, please contact the development team.
