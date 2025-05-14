
import React from "react";

interface BreathingAnimationProps {
  className?: string;
}

export const BreathingAnimation = ({ className = "w-24 h-24" }: BreathingAnimationProps) => {
  return (
    <div className={`relative ${className}`}>
      {/* Outer circle with pulsing animation */}
      <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/30 rounded-full animate-pulse" 
          style={{ animationDuration: '6s' }}>
      </div>
      
      {/* Middle circle with slower pulsing animation */}
      <div className="absolute inset-[15%] bg-blue-200 dark:bg-blue-800/50 rounded-full animate-pulse"
          style={{ animationDuration: '4s', animationDelay: '1s' }}>
      </div>
      
      {/* Inner circle with slow pulsing animation */}
      <div className="absolute inset-[30%] bg-blue-300 dark:bg-blue-700/70 rounded-full animate-pulse"
          style={{ animationDuration: '3s', animationDelay: '2s' }}>
      </div>
      
      {/* Center dot */}
      <div className="absolute inset-[45%] bg-blue-500 dark:bg-blue-400 rounded-full"></div>
    </div>
  );
};
