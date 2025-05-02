
import AppLayout from "@/components/layout/AppLayout";
import ExercisesFullDataCards from "@/components/exercises/ExercisesFullDataCards";

const ExercisesFullData = () => {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Exercise Database</h1>
        <ExercisesFullDataCards />
      </div>
    </AppLayout>
  );
};

export default ExercisesFullData;
