
import { useState } from "react";
import { Button } from "@/components/ui/button";

// This is a placeholder component - if you want to implement Excel import functionality,
// you would need to use a library like xlsx to parse Excel files
const ExcelImport = () => {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        This feature allows you to import exercises from an Excel file.
      </p>
      <Button disabled>Import Exercises</Button>
    </div>
  );
};

export default ExcelImport;
