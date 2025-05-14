
import React, { useEffect, useState } from "react";

interface BreathingAnimationProps {
  duration?: number; // in seconds
  className?: string;
}

export const BreathingAnimation = ({ 
  duration = 5, 
  className = "w-32 h-32"
}: BreathingAnimationProps) => {
  const [isInhaling, setIsInhaling] = useState(true);
  const [counter, setCounter] = useState(duration);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive) {
      interval = setInterval(() => {
        if (counter > 0) {
          setCounter(counter - 1);
        } else {
          setCounter(duration);
          setIsInhaling(!isInhaling);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [counter, duration, isInhaling, isActive]);

  return (
    <div className={`relative ${className}`}>
      <div 
        className={`absolute inset-0 rounded-full bg-blue-400/30 dark:bg-blue-600/30 transition-all duration-${duration * 1000}ms ease-in-out`} 
        style={{ 
          transform: isInhaling ? 'scale(0.7)' : 'scale(1)',
          opacity: isInhaling ? 0.6 : 0.2,
        }}
      />
      <div 
        className={`absolute inset-4 rounded-full bg-blue-400/40 dark:bg-blue-600/40 transition-all duration-${duration * 1000}ms ease-in-out`} 
        style={{ 
          transform: isInhaling ? 'scale(0.8)' : 'scale(1.1)',
          opacity: isInhaling ? 0.7 : 0.3,
        }}
      />
      <div 
        className={`absolute inset-8 rounded-full bg-blue-400/50 dark:bg-blue-600/50 transition-all duration-${duration * 1000}ms ease-in-out flex items-center justify-center text-blue-800 dark:text-blue-200 font-medium`}
        style={{ 
          transform: isInhaling ? 'scale(0.9)' : 'scale(1.2)',
        }}
      >
        <div className="text-center">
          <div className="text-sm font-medium">
            {isInhaling ? "Breathe In" : "Breathe Out"}
          </div>
          <div className="text-xl">{counter}</div>
        </div>
      </div>
    </div>
  );
};
