import React from 'react';
import ExerciseVideoHandler from './ExerciseVideoHandler';
import { Exercise } from './exercise';

interface ExerciseDetailProps {
  exercise: Exercise;
}

const ExerciseDetail: React.FC<ExerciseDetailProps> = ({ exercise }) => {
  return (
    <div className="exercise-detail">
      <h2 className="text-2xl font-bold mb-4">{exercise.name}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Left column */}
        <div>
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Target Muscles</h3>
            <p>Primary: {exercise.prime_mover_muscle || exercise.target_muscle_group || 'Not specified'}</p>
            <p>Secondary: {exercise.secondary_muscle || 'None'}</p>
            <p>Tertiary: {exercise.tertiary_muscle || 'None'}</p>
          </div>
          
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Equipment</h3>
            <p>Primary: {exercise.primary_equipment || exercise.equipment || 'Not specified'}</p>
            <p>Secondary: {exercise.secondary_equipment || 'None'}</p>
          </div>
          
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Classification</h3>
            <p>Difficulty: {exercise.difficulty || exercise.difficulty_level || 'Not specified'}</p>
            <p>Mechanics: {exercise.mechanics || 'Not specified'}</p>
            <p>Force Type: {exercise.force_type || 'Not specified'}</p>
          </div>
        </div>
        
        {/* Right column */}
        <div>
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Movement Patterns</h3>
            {exercise.movement_pattern_1 && <p>{exercise.movement_pattern_1}</p>}
            {exercise.movement_pattern_2 && <p>{exercise.movement_pattern_2}</p>}
            {exercise.movement_pattern_3 && <p>{exercise.movement_pattern_3}</p>}
          </div>
          
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Planes of Motion</h3>
            {exercise.plane_of_motion_1 && <p>{exercise.plane_of_motion_1}</p>}
            {exercise.plane_of_motion_2 && <p>{exercise.plane_of_motion_2}</p>}
            {exercise.plane_of_motion_3 && <p>{exercise.plane_of_motion_3}</p>}
          </div>
          
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Additional Info</h3>
            <p>Body Region: {exercise.body_region || 'Not specified'}</p>
            <p>Posture: {exercise.posture || 'Not specified'}</p>
            <p>Laterality: {exercise.laterality || 'Not specified'}</p>
          </div>
        </div>
      </div>
      
      {/* Videos section */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-4">Videos</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <h4 className="font-medium mb-2">Demonstration</h4>
            <ExerciseVideoHandler
              exercise={exercise}
              type="demo"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              linkProps={{ children: "Watch Demo Video" }}
            />
          </div>
          
          <div className="flex-1">
            <h4 className="font-medium mb-2">In-Depth Explanation</h4>
            <ExerciseVideoHandler
              exercise={exercise}
              type="explanation"
              className="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              linkProps={{ children: "Watch Explanation" }}
            />
          </div>
        </div>
      </div>
      
      {/* Instructions section (if available) */}
      {exercise.instructions && exercise.instructions.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-4">Instructions</h3>
          <ol className="list-decimal pl-5">
            {exercise.instructions.map((instruction, index) => (
              <li key={index} className="mb-2">{instruction}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};

export default ExerciseDetail;
