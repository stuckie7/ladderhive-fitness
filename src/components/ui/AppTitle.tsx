import React from 'react';

export function AppTitle() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center shadow-md">
        <img 
          src="/fittrackpro-logo.jpg" 
          alt="FitTrack Pro Logo" 
          className="h-8 w-8 rounded-lg object-cover" 
        />
      </div>
      <h1 className="text-3xl font-bold gradient-heading" data-lovable-title>
        FitTrack Pro v.beta
      </h1>
    </div>
  );
}
