
import React from "react";

interface WorkoutDetailLayoutProps {
  header: React.ReactNode;
  stats: React.ReactNode;
  content: React.ReactNode;
  workoutId?: string;
}

const WorkoutDetailLayout = ({ header, stats, content }: WorkoutDetailLayoutProps) => {
  return (
    <div className="container mx-auto px-4 py-6">
      {header}
      {stats}
      {content}
    </div>
  );
};

export default WorkoutDetailLayout;
