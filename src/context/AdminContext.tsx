import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AdminStats, UserWorkoutStats, AdminAuditLog } from '@/types/admin';
import { adminService } from '@/services/adminService';
import { useToast } from '@/hooks/use-toast';

interface AdminContextType {
  isAdmin: () => Promise<boolean>;
  loading: boolean;
  stats: AdminStats | null;
  userStats: UserWorkoutStats[];
  auditLogs: AdminAuditLog[];
  loadStats: () => Promise<void>;
  loadUserStats: () => Promise<void>;
  loadAuditLogs: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [adminStatus, setAdminStatus] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [userStats, setUserStats] = useState<UserWorkoutStats[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const { toast } = useToast();

  // Function to check admin status
  const checkAdminStatus = async (): Promise<boolean> => {
    try {
      const isUserAdmin = await adminService.isAdmin();
      setAdminStatus(isUserAdmin);
      return isUserAdmin;
    } catch (error) {
      // Only log unexpected errors, not unauthenticated errors
      if (!(error instanceof Error && error.message === 'Not authenticated')) {
        console.error('Error checking admin status:', error);
      }
      setAdminStatus(false);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Check admin status on mount
  useEffect(() => {
    checkAdminStatus();
  }, []);

  const loadStats = async () => {
    try {
      const statsData = await adminService.getDashboardStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading admin stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load admin statistics',
        variant: 'destructive',
      });
    }
  };

  const loadUserStats = async () => {
    try {
      const statsData = await adminService.getUserWorkoutStats();
      setUserStats(statsData);
    } catch (error) {
      console.error('Error loading user stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load user statistics',
        variant: 'destructive',
      });
    }
  };

  const loadAuditLogs = async () => {
    try {
      const logs = await adminService.getAuditLogs();
      setAuditLogs(logs);
    } catch (error) {
      console.error('Error loading audit logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load audit logs',
        variant: 'destructive',
      });
    }
  };

  return (
    <AdminContext.Provider
      value={{
        isAdmin: checkAdminStatus,
        loading,
        stats,
        userStats,
        auditLogs,
        loadStats,
        loadUserStats,
        loadAuditLogs,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
