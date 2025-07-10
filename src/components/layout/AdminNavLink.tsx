import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdmin } from '@/context/AdminContext';

export function AdminNavLink() {
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { isAdmin: checkAdmin } = useAdmin();

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const adminStatus = await checkAdmin();
        setIsAdmin(adminStatus);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };
    verifyAdmin();
  }, [checkAdmin]);

  if (isLoading || !isAdmin) {
    return null;
  }

  const isActive = location.pathname.startsWith('/admin');

  return (
    <Link 
      to="/admin" 
      className={cn(
        'flex flex-col items-center py-1 px-3 space-y-1',
        isActive ? 'text-primary' : 'text-muted-foreground'
      )}
    >
      <Shield size={20} />
      <span className="text-xs font-medium">Admin</span>
    </Link>
  );
}
