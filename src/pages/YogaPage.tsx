
import React from "react";
import AppLayout from "@/components/layout/AppLayout";
import { YogaWorkoutsList } from "@/components/yoga/YogaWorkoutsList";

const YogaPage: React.FC = () => {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        <header className="mb-8">
          <div className="relative mb-8 overflow-hidden rounded-lg bg-gradient-to-r from-purple-500 to-indigo-700 p-8 text-white">
            <div className="absolute inset-0 bg-purple-600 opacity-30 animate-pulse" style={{ animationDuration: '6s' }}></div>
            <div className="relative z-10">
              <h1 className="text-3xl font-bold mb-2">Yoga Practice</h1>
              <p className="max-w-2xl opacity-90">
                Explore a variety of yoga workouts designed to help you improve flexibility, 
                build strength, and find balance in body and mind.
              </p>
            </div>
          </div>
        </header>

        <YogaWorkoutsList />
      </div>
    </AppLayout>
  );
};

export default YogaPage;
