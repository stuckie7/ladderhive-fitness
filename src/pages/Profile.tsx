
import AppLayout from "@/components/layout/AppLayout";
import UserProfile from "@/components/profile/UserProfile";
import { useEffect, useState } from "react";

const Profile = () => {
  const [userData, setUserData] = useState<any>(null);
  
  useEffect(() => {
    // Get user data from localStorage
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        
        // Add some mock stats for the profile
        setUserData({
          ...parsedUser,
          stats: {
            workoutsCompleted: 3,
            totalMinutes: 135,
            streakDays: 2,
            caloriesBurned: 450
          }
        });
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);
  
  if (!userData) {
    return <AppLayout>Loading...</AppLayout>;
  }
  
  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <UserProfile userData={userData} />
      </div>
    </AppLayout>
  );
};

export default Profile;
