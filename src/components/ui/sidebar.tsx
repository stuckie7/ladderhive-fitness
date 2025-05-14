
import * as React from "react";
import { cva } from "class-variance-authority";
import { Activity, BarChart3, Book, Clock, Dumbbell, Home, Library, Menu, MessageSquare, Moon, Play, Settings, Share, ShoppingBag, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const sidebarTriggerVariants = cva(
  "flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-transform duration-300",
  {
    variants: {
      variant: {
        default: "hover:text-foreground",
        outline:
          "border border-input hover:bg-accent hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface SidebarTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline";
}

const SidebarContext = React.createContext<{
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}>({
  isOpen: false,
  setIsOpen: () => {},
});

interface SidebarProviderProps {
  children: React.ReactNode;
}

export const SidebarProvider = ({ children }: SidebarProviderProps) => {
  const [isOpen, setIsOpen] = React.useState(true);

  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const SidebarTrigger = ({
  className,
  variant,
  ...props
}: SidebarTriggerProps) => {
  const { isOpen, setIsOpen } = React.useContext(SidebarContext);

  return (
    <button
      className={sidebarTriggerVariants({ variant })}
      onClick={() => setIsOpen(!isOpen)}
      {...props}
    >
      <Menu className="h-4 w-4" />
    </button>
  );
};

interface SidebarProps {
  children?: React.ReactNode;
}

export function Sidebar({ children }: SidebarProps) {
  const { isOpen } = React.useContext(SidebarContext);

  return (
    <aside
      className={`${
        isOpen ? "w-64" : "w-16"
      } h-screen fixed inset-y-0 left-0 z-30 transition-all bg-black/10 dark:bg-white/5 backdrop-blur-lg border-r border-white/10 shadow-xl`}
    >
      <div className={`flex flex-col h-full justify-between`}>
        {children || <DefaultSidebarContent />}
      </div>
    </aside>
  );
}

interface SidebarContentProps {
  children?: React.ReactNode;
}

export function SidebarContent({ children }: SidebarContentProps) {
  return <div className="flex-1 overflow-auto p-4">{children}</div>;
}

interface SidebarHeaderProps {
  children?: React.ReactNode;
}

export function SidebarHeader({ children }: SidebarHeaderProps) {
  const { isOpen } = React.useContext(SidebarContext);

  return (
    <div className="p-4 border-b border-white/10">
      {children || (
        <div className="flex items-center">
          <Dumbbell
            className={`h-6 w-6 text-primary ${
              !isOpen ? "mx-auto" : "mr-2"
            }`}
          />
          {isOpen && <span className="font-bold">LadderHive</span>}
        </div>
      )}
    </div>
  );
}

interface SidebarFooterProps {
  children?: React.ReactNode;
}

export function SidebarFooter({ children }: SidebarFooterProps) {
  const { isOpen } = React.useContext(SidebarContext);

  return (
    <div className="p-4 border-t border-white/10">
      {children || (
        <div className="flex items-center">
          {isOpen ? (
            <span className="text-xs text-muted-foreground">
              © 2024 LadderHive
            </span>
          ) : (
            <Settings className="h-5 w-5 mx-auto text-muted-foreground" />
          )}
        </div>
      )}
    </div>
  );
}

interface SidebarGroupProps {
  children?: React.ReactNode;
}

export function SidebarGroup({ children }: SidebarGroupProps) {
  return <div className="py-2">{children}</div>;
}

interface SidebarGroupLabelProps {
  children: React.ReactNode;
}

export function SidebarGroupLabel({ children }: SidebarGroupLabelProps) {
  const { isOpen } = React.useContext(SidebarContext);

  if (!isOpen) return null;

  return (
    <div className="px-2 py-1 text-xs uppercase font-medium text-muted-foreground">
      {children}
    </div>
  );
}

interface SidebarGroupContentProps {
  children: React.ReactNode;
}

export function SidebarGroupContent({ children }: SidebarGroupContentProps) {
  return <div className="space-y-1">{children}</div>;
}

interface SidebarMenuProps {
  children: React.ReactNode;
}

export function SidebarMenu({ children }: SidebarMenuProps) {
  return <div className="space-y-1">{children}</div>;
}

interface SidebarMenuItemProps {
  children: React.ReactNode;
}

export function SidebarMenuItem({ children }: SidebarMenuItemProps) {
  return <div>{children}</div>;
}

interface SidebarMenuButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  asChild?: boolean;
}

export function SidebarMenuButton({
  children,
  className,
  asChild = false,
  ...props
}: SidebarMenuButtonProps) {
  const { isOpen } = React.useContext(SidebarContext);

  if (asChild) {
    const child = React.Children.only(children) as React.ReactElement;
    return React.cloneElement(child, {
      className: `flex items-center px-2 py-2 rounded-md hover:bg-white/10 transition-colors ${
        !isOpen ? "justify-center" : ""
      } ${child.props.className || ""} ${className || ""}`,
      ...props,
    });
  }

  return (
    <button
      className={`flex items-center px-2 py-2 rounded-md hover:bg-white/10 transition-colors ${
        !isOpen ? "justify-center" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function DefaultSidebarContent() {
  const { isOpen } = React.useContext(SidebarContext);
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: Home },
    { path: "/workouts", label: "Workouts", icon: Dumbbell },
    { path: "/exercises", label: "Exercise Library", icon: Library },
    { path: "/wods", label: "WODs", icon: BarChart3 },
    { path: "/progress", label: "Progress", icon: Activity },
    { path: "/mindfulness", label: "Mindfulness", icon: Moon },
    { path: "/nutrition", label: "Nutrition", icon: ShoppingBag },
    { path: "/profile", label: "Profile", icon: User },
  ];

  return (
    <>
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild>
                    <Link
                      to={item.path}
                      className={`${isActive(item.path) ? "bg-white/10 text-white font-medium" : "text-white/70"}`}
                    >
                      <item.icon
                        className={`h-5 w-5 ${
                          isOpen ? "mr-3" : "mx-auto"
                        }`}
                      />
                      {isOpen && <span>{item.label}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </>
  );
}
