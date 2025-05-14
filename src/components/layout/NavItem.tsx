
import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";

interface NavItemProps {
  to: string;
  icon: LucideIcon;
  children: React.ReactNode;
}

export const NavItem: React.FC<NavItemProps> = ({ to, icon: Icon, children }) => {
  return (
    <Link
      to={to}
      className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
    >
      <Icon className="mr-3 h-5 w-5" />
      <span>{children}</span>
    </Link>
  );
};
