
import { getYouTubeThumbnail } from "@/utils/wodHelpers";

export interface YogaExercise {
  id: string;
  title: string;
  description: string;
  shortDemoUrl: string;
  fullTutorialUrl: string;
  thumbnailUrl?: string;
  duration?: string;
  benefits: string[];
}

const yogaExercises: YogaExercise[] = [
  {
    id: "sun-salutation-a",
    title: "Sun Salutation A",
    description: "A sequence of 12 gracefully performed postures where each movement is coordinated with the breath. This flow warms up the entire body and brings awareness to the breath.",
    shortDemoUrl: "https://www.youtube.com/watch?v=1xRX1MuoImw",
    fullTutorialUrl: "https://www.youtube.com/watch?v=FPjppcOquE4",
    thumbnailUrl: getYouTubeThumbnail("https://www.youtube.com/watch?v=1xRX1MuoImw"),
    duration: "5-10 minutes per round",
    benefits: [
      "Improves blood circulation",
      "Stretches and strengthens the entire body",
      "Calms the mind and reduces stress",
      "Enhances focus and awareness"
    ]
  },
  {
    id: "warrior-ii",
    title: "Warrior II Pose",
    description: "An empowering standing pose that builds strength and stability. This pose helps open the hips and chest while strengthening the legs and core.",
    shortDemoUrl: "https://www.youtube.com/watch?v=4Ejz7IgODlU",
    fullTutorialUrl: "https://www.youtube.com/watch?v=Mn6RSIRCV3w",
    thumbnailUrl: getYouTubeThumbnail("https://www.youtube.com/watch?v=4Ejz7IgODlU"),
    duration: "30-60 seconds per side",
    benefits: [
      "Strengthens the legs, ankles, and feet",
      "Opens the chest and shoulders",
      "Improves focus and concentration",
      "Builds physical and mental endurance"
    ]
  },
  {
    id: "boat-pose",
    title: "Boat Pose",
    description: "A core-strengthening pose that helps improve balance and digestion. This pose engages the entire core, including the deep abdominal muscles.",
    shortDemoUrl: "https://www.youtube.com/watch?v=gWEey6tp7-c",
    fullTutorialUrl: "https://www.youtube.com/watch?v=QVEINjrYUPU",
    thumbnailUrl: getYouTubeThumbnail("https://www.youtube.com/watch?v=gWEey6tp7-c"),
    duration: "30-60 seconds per hold",
    benefits: [
      "Strengthens the abdomen, hip flexors, and spine",
      "Improves digestion and relieves stress",
      "Stimulates the kidneys, thyroid, and prostate glands",
      "Improves balance and focus"
    ]
  }
];

export default yogaExercises;
