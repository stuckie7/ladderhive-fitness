
import React from "react";
import { motion } from "framer-motion";

interface BreathingAnimationProps {
  className?: string;
}

export const BreathingAnimation = ({ className = "" }: BreathingAnimationProps) => {
  return (
    <div className={`relative ${className}`}>
      <svg 
        viewBox="0 0 100 100" 
        className="w-full h-full"
      >
        <motion.circle
          cx="50"
          cy="50"
          r="20"
          initial={{ r: 20 }}
          animate={{ 
            r: [20, 35, 20],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          className="text-white"
        />
        <motion.circle
          cx="50"
          cy="50"
          r="35"
          initial={{ r: 35 }}
          animate={{ 
            r: [35, 45, 35],
            opacity: [0.5, 0.7, 0.5],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
          className="text-white"
        />
      </svg>
    </div>
  );
};
