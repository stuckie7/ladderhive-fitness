
import React from 'react';
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  onClick?: (e: React.MouseEvent) => void;
}

interface FabProps {
  className?: string;
  actions: QuickActionProps[];
}

export function Fab({ className, actions }: FabProps) {
  return (
    <div className={cn("md:hidden fixed bottom-20 right-4 z-50", className)}>
      <Drawer>
        <DrawerTrigger asChild>
          <Button className="h-14 w-14 rounded-full shadow-lg">
            <Plus size={24} />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="p-4">
          <div className="grid grid-cols-3 gap-4 mt-8">
            {actions.map((action, index) => (
              <QuickAction 
                key={index}
                icon={action.icon}
                label={action.label}
                href={action.href}
                onClick={action.onClick}
              />
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

function QuickAction({ icon, label, href, onClick }: QuickActionProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick(e);
    }
  };

  if (onClick) {
    return (
      <a 
        href={href}
        onClick={handleClick}
        className="flex flex-col items-center p-4 border rounded-lg"
      >
        {icon}
        <span className="mt-2 text-sm font-medium text-center">{label}</span>
      </a>
    );
  }
  
  return (
    <Link 
      to={href} 
      className="flex flex-col items-center p-4 border rounded-lg"
    >
      {icon}
      <span className="mt-2 text-sm font-medium text-center">{label}</span>
    </Link>
  );
}
