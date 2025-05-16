import React, { useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { ChevronLeft } from 'lucide-react';
import { Button } from './button';

interface BreadcrumbConfig {
  [path: string]: {
    label: string;
    parent?: string;
  };
}

interface DynamicBreadcrumbProps {
  onBack?: () => void;
  showBackButton?: boolean;
  className?: string;
}

export function DynamicBreadcrumb({ 
  onBack, 
  showBackButton = true,
  className 
}: DynamicBreadcrumbProps) {
  const location = useLocation();
  
  // Map of path segments to display names
  const pathConfig: BreadcrumbConfig = useMemo(() => ({
    'dashboard': { label: 'Dashboard' },
    'exercises': { label: 'Exercises', parent: 'dashboard' },
    'enhanced': { label: 'Enhanced Library', parent: 'exercises' },
    'simple': { label: 'Simple Library', parent: 'exercises' },
    'workouts': { label: 'Workouts', parent: 'dashboard' },
    'saved-workouts': { label: 'Saved Workouts', parent: 'workouts' },
    'workout-builder': { label: 'Workout Builder', parent: 'workouts' },
    'progress': { label: 'Progress', parent: 'dashboard' },
    'wods': { label: 'WODs', parent: 'dashboard' },
    'mindful-movement': { label: 'Mindful Movement', parent: 'dashboard' },
    'profile': { label: 'Profile', parent: 'dashboard' },
    'settings': { label: 'Settings', parent: 'dashboard' }
  }), []);

  const breadcrumbs = useMemo(() => {
    const paths = location.pathname.split('/').filter(Boolean);
    if (paths.length === 0) return [{ path: '/', label: 'Home' }];

    const result = [];
    let currentPath = '';

    // Always add dashboard as first item if not already included
    if (paths[0] !== 'dashboard') {
      result.push({ path: '/dashboard', label: 'Dashboard' });
    }

    // Process all path segments
    for (let i = 0; i < paths.length; i++) {
      const segment = paths[i];
      currentPath += `/${segment}`;
      
      // For numeric IDs, try to get a better label
      if (!isNaN(Number(segment)) && i > 0) {
        const parentType = paths[i - 1];
        const singularParent = parentType.endsWith('s') 
          ? parentType.slice(0, -1) 
          : parentType;
          
        result.push({
          path: currentPath,
          label: `${singularParent.charAt(0).toUpperCase() + singularParent.slice(1)} ${segment}`,
        });
      } 
      // Otherwise use our path config
      else if (pathConfig[segment]) {
        result.push({
          path: currentPath,
          label: pathConfig[segment].label,
        });
      } 
      // Fallback for unknown paths
      else {
        result.push({
          path: currentPath,
          label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
        });
      }
    }

    return result;
  }, [location.pathname, pathConfig]);

  if (breadcrumbs.length <= 1) return null;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (breadcrumbs.length > 1) {
      // Default back behavior - go to parent breadcrumb
      window.history.back();
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showBackButton && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-1" 
          onClick={handleBack}
        >
          <ChevronLeft size={16} />
        </Button>
      )}
      
      <Breadcrumb className="hidden md:block">
        <BreadcrumbList>
          {breadcrumbs.map((crumb, i) => {
            const isLast = i === breadcrumbs.length - 1;
            
            return (
              <React.Fragment key={i}>
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link to={crumb.path}>{crumb.label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator />}
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
