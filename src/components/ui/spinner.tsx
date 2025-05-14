
import React from "react";

interface SpinnerProps {
  className?: string;
}

export const Spinner = ({ className = "h-6 w-6" }: SpinnerProps) => {
  return (
    <div className={`animate-spin rounded-full border-4 border-t-blue-600 border-gray-200 ${className}`} />
  );
};
