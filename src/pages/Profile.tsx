
import AppLayout from "@/components/layout/AppLayout";
import UserProfile from "@/components/profile/UserProfile";
import ProfileSkeleton from "@/components/profile/ProfileSkeleton";
import { useEffect, useState } from "react";

const Profile = () => {
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Get user data from localStorage
    const fetchUserData = async () => {
      try {
        // Simulate network delay for demonstration purposes
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const user = localStorage.getItem("user");
        if (user) {
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
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, []);
  
  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        {isLoading ? (
          <ProfileSkeleton />
        ) : (
          userData && <UserProfile userData={userData} />
        )}
      </div>
    </AppLayout>
  );
};

export default Profile;
