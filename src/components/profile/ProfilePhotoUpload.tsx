
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { Camera, Trash, Upload, Save, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import AvatarEditor from "react-avatar-editor";

interface ProfilePhotoUploadProps {
  currentPhotoUrl?: string | null;
  onPhotoUpdated: (url: string) => void;
  userName: string;
}

const ProfilePhotoUpload = ({ currentPhotoUrl, onPhotoUpdated, userName }: ProfilePhotoUploadProps) => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [zoom, setZoom] = useState(1.2);
  const editorRef = useRef<AvatarEditor | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setIsEditing(true);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSaveEdit = async () => {
    if (!editorRef.current || !selectedFile || !user) {
      return;
    }

    setIsUploading(true);

    try {
      // Get the edited canvas as a blob
      const canvas = editorRef.current.getImageScaledToCanvas();
      
      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, 'image/jpeg', 0.95);
      });

      // Create a file from the blob
      const fileName = `${user.id}/${Date.now()}.jpg`;
      const file = new File([blob], fileName, { type: 'image/jpeg' });

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('profile_photos')
        .upload(fileName, file, {
          upsert: true,
          contentType: 'image/jpeg',
        });

      if (error) throw error;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile_photos')
        .getPublicUrl(data.path);

      // Update the profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_photo_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      onPhotoUpdated(publicUrl);
      setIsEditing(false);
      setSelectedFile(null);
      
      toast({
        title: "Profile photo updated",
        description: "Your profile photo has been updated successfully.",
      });
    } catch (error: any) {
      console.error("Error uploading photo:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (!user || !currentPhotoUrl) return;

    setIsUploading(true);
    try {
      // Extract the file path from the URL
      const urlParts = currentPhotoUrl.split('/');
      const filePathParts = urlParts.slice(urlParts.indexOf('profile_photos') + 1);
      const filePath = filePathParts.join('/');

      // Delete the file from storage
      const { error: deleteError } = await supabase.storage
        .from('profile_photos')
        .remove([filePath]);

      if (deleteError) throw deleteError;

      // Update the profile to remove the photo URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_photo_url: null })
        .eq('id', user.id);

      if (updateError) throw updateError;

      onPhotoUpdated('');
      
      toast({
        title: "Profile photo removed",
        description: "Your profile photo has been removed.",
      });
    } catch (error: any) {
      console.error("Error deleting photo:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove profile photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
      <div className="relative group">
        <Avatar className="h-24 w-24 cursor-pointer bg-background border" onClick={triggerFileInput}>
          <AvatarImage src={currentPhotoUrl || ""} alt={userName} />
          <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
            {getInitials(userName)}
          </AvatarFallback>
        </Avatar>
        
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 rounded-full">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white" 
            onClick={triggerFileInput}
          >
            <Camera className="h-5 w-5" />
          </Button>
          
          {currentPhotoUrl && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white" 
              onClick={handleDeletePhoto}
            >
              <Trash className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      <Button 
        variant="outline" 
        onClick={triggerFileInput} 
        className="text-sm"
        size="sm"
      >
        <Upload className="mr-2 h-4 w-4" />
        Upload Photo
      </Button>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile Photo</DialogTitle>
            <DialogDescription>
              Adjust your profile photo to get the perfect crop.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center space-y-4 pt-4">
            {selectedFile && (
              <AvatarEditor
                ref={editorRef}
                image={selectedFile}
                width={280}
                height={280}
                border={50}
                borderRadius={140}
                color={[255, 255, 255, 0.6]} // RGBA
                scale={zoom}
                rotate={0}
              />
            )}
            
            <div className="w-full space-y-2">
              <label htmlFor="zoom" className="text-sm font-medium">
                Zoom: {zoom.toFixed(1)}x
              </label>
              <input
                id="zoom"
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
          
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsEditing(false);
                setSelectedFile(null);
              }}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isUploading}
              onClick={handleSaveEdit}
            >
              {isUploading ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePhotoUpload;
