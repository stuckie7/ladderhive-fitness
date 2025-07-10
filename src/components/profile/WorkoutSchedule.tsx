
interface WorkoutScheduleProps {
  workoutDays: string[];
}

const WorkoutSchedule = ({ workoutDays }: WorkoutScheduleProps) => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  
  return (
    <div>
      <p className="text-sm font-medium mb-2">Workout Schedule</p>
      <div className="flex justify-between">
        {days.map((day) => (
          <div 
            key={day} 
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
              workoutDays.includes(day.toLowerCase())
                ? "bg-fitness-primary text-white"
                : "bg-gray-100 dark:bg-gray-800 text-muted-foreground"
            }`}
          >
            {day.charAt(0)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkoutSchedule;
