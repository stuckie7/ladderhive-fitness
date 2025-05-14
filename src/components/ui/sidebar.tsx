
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  BarChart,
  BookmarkIcon,
  ClipboardCheckIcon,
  Clock,
  DumbbellIcon,
  FlameIcon,
  LayoutDashboard,
  ListChecks,
  UserCircle,
  Workout,
  Menu,
  X,
  Zap
} from "lucide-react";
import { Button } from "./button";
import { ScrollArea } from "./scroll-area";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ className, isOpen, onClose, ...props }: SidebarProps) {
  const location = useLocation();
  const pathname = location.pathname;

  const isActiveRoute = (route: string) => {
    if (route === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(route);
  };

  return (
    <div
      className={cn(
        "pb-12 border-r h-full",
        isOpen ? "flex" : "hidden md:flex",
        className
      )}
      {...props}
    >
      <div className="space-y-4 py-4 w-full relative">
        <div className="flex justify-between items-center px-3 md:px-6 mb-6">
          <div className="flex items-center">
            <Zap className="h-6 w-6 text-primary mr-2" />
            <h2 className="text-xl font-bold">FitApp</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-8rem)] px-3 py-2">
          <div className="space-y-1">
            <Button
              asChild
              variant={isActiveRoute("/") || isActiveRoute("/dashboard") ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <Link to="/dashboard">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </Button>
            <Button
              asChild
              variant={isActiveRoute("/exercises") ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <Link to="/exercises">
                <DumbbellIcon className="mr-2 h-4 w-4" />
                Exercises
              </Link>
            </Button>
            <Button
              asChild
              variant={isActiveRoute("/workouts") ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <Link to="/workouts">
                <Workout className="mr-2 h-4 w-4" />
                Workouts
              </Link>
            </Button>
            <Button
              asChild
              variant={isActiveRoute("/saved-workouts") ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <Link to="/saved-workouts">
                <BookmarkIcon className="mr-2 h-4 w-4" />
                Saved Workouts
              </Link>
            </Button>
            <Button
              asChild
              variant={isActiveRoute("/workout-builder") ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <Link to="/workout-builder">
                <ListChecks className="mr-2 h-4 w-4" />
                Workout Builder
              </Link>
            </Button>
            <Button
              asChild
              variant={isActiveRoute("/wods") ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <Link to="/wods">
                <FlameIcon className="mr-2 h-4 w-4" />
                WODs
              </Link>
            </Button>
            <Button
              asChild
              variant={isActiveRoute("/progress") ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <Link to="/progress">
                <BarChart className="mr-2 h-4 w-4" />
                Progress
              </Link>
            </Button>
            <Button
              asChild
              variant={isActiveRoute("/mindfulness") ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <Link to="/mindfulness">
                <ClipboardCheckIcon className="mr-2 h-4 w-4" />
                Mindfulness
              </Link>
            </Button>
            <Button
              asChild
              variant={isActiveRoute("/yoga") ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <Link to="/yoga">
                <Clock className="mr-2 h-4 w-4" />
                Yoga
              </Link>
            </Button>
            <Button
              asChild
              variant={isActiveRoute("/profile") ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <Link to="/profile">
                <UserCircle className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </Button>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

interface MobileSidebarTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onMenuToggle: () => void;
}

export function MobileSidebarTrigger({
  className,
  onMenuToggle,
  ...props
}: MobileSidebarTriggerProps) {
  return (
    <Button
      variant="outline"
      size="icon"
      className={cn("md:hidden", className)}
      onClick={onMenuToggle}
      {...props}
    >
      <Menu className="h-6 w-6" />
      <span className="sr-only">Toggle Menu</span>
    </Button>
  );
}
