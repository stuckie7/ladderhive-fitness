
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const ExerciseTableNotFoundError = () => {
  const navigate = useNavigate();
  
  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
      <h1 className="text-2xl font-bold mb-4 text-red-700 dark:text-red-400">
        Table Not Found
      </h1>
      <p className="mb-6 text-red-600 dark:text-red-300">
        The exercises_full table does not exist in your Supabase database.
        Please create the table and import exercise data before using this feature.
      </p>
      <div className="flex flex-col md:flex-row gap-4 justify-center">
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
        <Button variant="default" onClick={() => navigate('/dashboard')}>
          Go to Dashboard
        </Button>
      </div>
      <div className="mt-8 p-4 bg-white dark:bg-gray-800 rounded border text-left">
        <h3 className="font-medium mb-2">Expected Table Structure:</h3>
        <pre className="text-sm bg-gray-50 dark:bg-gray-900 p-3 rounded overflow-x-auto">
          {`CREATE TABLE exercises_full (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  prime_mover_muscle TEXT,
  primary_equipment TEXT,
  difficulty TEXT,
  short_youtube_demo TEXT,
  in_depth_youtube_exp TEXT,
  -- Additional fields...
);`}
        </pre>
      </div>
    </div>
  );
};

export default ExerciseTableNotFoundError;
