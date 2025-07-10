
// Import the addExercises function from add-sample-exercises script
import { addExercises } from './add-sample-exercises';

// Run the addExercises function
const runAddExercises = async () => {
  try {
    await addExercises();
    console.log('Successfully added sample exercises');
  } catch (error) {
    console.error('Error adding sample exercises:', error);
  }
};

runAddExercises();
