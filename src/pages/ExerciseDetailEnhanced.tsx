
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ExerciseFull } from '@/types/exercise';
import AppLayout from '@/components/layout/AppLayout';
import { getExerciseFullById } from '@/hooks/exercise-library/services/exercise-detail-service';

// Components
import ExerciseDetailHeader from '@/components/exercises/exercise-detail/ExerciseDetailHeader';
import ExerciseDetailSkeleton from '@/components/exercises/exercise-detail/ExerciseDetailSkeleton';
import ExerciseNotFound from '@/components/exercises/exercise-detail/ExerciseNotFound';
import ExerciseMainDetails from '@/components/exercises/exercise-detail/ExerciseMainDetails';
import ExerciseSidebarInfo from '@/components/exercises/exercise-detail/ExerciseSidebarInfo';

export default function ExerciseDetailEnhanced() {
  const [exercise, setExercise] = useState<ExerciseFull | null>(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExerciseDetails = async () => {
      if (!id) return;
      
      setLoading(true);
      
      try {
        // Handle both numeric and string IDs
        const exerciseId = typeof id === 'string' && !isNaN(parseInt(id)) 
          ? parseInt(id, 10) 
          : id;
          
        console.log(`Fetching exercise with ID: ${exerciseId}`);
        
        const exerciseData = await getExerciseFullById(exerciseId);
        console.log("Exercise data fetched:", exerciseData);
        
        setExercise(exerciseData);
      } catch (error) {
        console.error('Error fetching exercise:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExerciseDetails();
  }, [id]);

  const handleBackClick = () => {
    navigate('/exercise-library-enhanced');
  };

  if (loading) {
    return (
      <AppLayout>
        <ExerciseDetailSkeleton onBackClick={handleBackClick} />
      </AppLayout>
    );
  }

  if (!exercise) {
    return (
      <AppLayout>
        <ExerciseNotFound onBackClick={handleBackClick} />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        <ExerciseDetailHeader 
          exercise={exercise} 
          onBackClick={handleBackClick} 
        />
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2">
            <ExerciseMainDetails exercise={exercise} />
          </div>
          
          {/* Right Column - Sidebar Information */}
          <div>
            <ExerciseSidebarInfo exercise={exercise} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
