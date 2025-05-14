
export interface YogaRoutine {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: "beginner" | "intermediate" | "advanced";
  steps: Array<{
    exercise: string;
    duration: string;
    description?: string;
  }>;
}

const yogaRoutines: YogaRoutine[] = [
  {
    id: "morning-energy-flow",
    title: "Morning Energy Flow",
    description: "Start your day with this energizing sequence to awaken the body and mind. Perfect for beginners and those looking to establish a morning yoga practice.",
    duration: "15 minutes",
    level: "beginner",
    steps: [
      {
        exercise: "Sun Salutation A",
        duration: "3 rounds",
        description: "Begin slowly and gradually increase the pace with each round"
      },
      {
        exercise: "Warrior II Pose",
        duration: "1 minute per side",
        description: "Focus on deep breathing while maintaining the pose"
      },
      {
        exercise: "Standing Forward Fold",
        duration: "30 seconds",
        description: "Allow your head to hang heavy and relax your neck"
      },
      {
        exercise: "Closing Meditation",
        duration: "1 minute",
        description: "Seated with eyes closed, focus on your breath"
      }
    ]
  },
  {
    id: "evening-wind-down",
    title: "Evening Wind-Down",
    description: "Release the tension of the day and prepare your body for restful sleep with this calming sequence. Perfect for evening practice.",
    duration: "20 minutes",
    level: "beginner",
    steps: [
      {
        exercise: "Slow Sun Salutation A",
        duration: "2 rounds",
        description: "Move slowly and deliberately with deep breathing"
      },
      {
        exercise: "Boat Pose",
        duration: "3 sets of 30-second holds",
        description: "Rest for 15 seconds between each set"
      },
      {
        exercise: "Reclined Twist",
        duration: "1 minute per side",
        description: "Allow your spine to relax with each exhale"
      },
      {
        exercise: "Seated Meditation",
        duration: "5 minutes",
        description: "Focus on progressive relaxation of the body"
      }
    ]
  }
];

export default yogaRoutines;
