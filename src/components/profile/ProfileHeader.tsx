
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProfileHeaderProps {
  name: string;
  email: string;
  fitnessLevel?: string;
}

const ProfileHeader = ({ name, email, fitnessLevel }: ProfileHeaderProps) => {
  const navigate = useNavigate();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const formatFitnessLevel = (level: string) => {
    return level.charAt(0).toUpperCase() + level.slice(1);
  };

  return (
    <>
      <div className="flex justify-between items-start">
        <div>
          <CardTitle className="text-2xl font-bold">{name}</CardTitle>
          <CardDescription>{email}</CardDescription>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate('/settings')}
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>
      <div className="flex items-center gap-4 mb-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src="" alt={name} />
          <AvatarFallback className="bg-fitness-primary text-white text-lg">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>
        {fitnessLevel && (
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Fitness Level</p>
            <p className="font-medium">{formatFitnessLevel(fitnessLevel)}</p>
          </div>
        )}
      </div>
    </>
  );
};

export default ProfileHeader;
