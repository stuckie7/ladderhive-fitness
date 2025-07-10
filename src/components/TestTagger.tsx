
import React, { useEffect } from 'react';

// This component integrates with the lovable-tagger for component tagging
export const TestTagger: React.FC = () => {
  useEffect(() => {
    console.log('TestTagger component initialized');
  }, []);

  return null; // This component doesn't render anything visible
};
