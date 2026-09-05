
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Images, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getSchoolThemeColor } from "@/utils/themeColorUtils";

type TeacherPhoto = {
  id: string;
  photo_url: string;
  teacher_name?: string;
  is_hit_question?: boolean; // Add this field to identify hit question photos
};

interface TeacherPhotoDialogProps {
  teacherPhotos: TeacherPhoto[];
  onPhotoSelect: (photoUrl: string) => void;
  school?: string;
  grade?: string;
}

const TeacherPhotoDialog: React.FC<TeacherPhotoDialogProps> = ({
  teacherPhotos,
  onPhotoSelect,
  school = "",
  grade = "",
}) => {
  const [open, setOpen] = React.useState(false);
  
  // Filter out hit question photos
  const filteredTeacherPhotos = React.useMemo(() => {
    return teacherPhotos.filter(photo => !photo.is_hit_question);
  }, [teacherPhotos]);

  const handlePhotoSelect = (photoUrl: string) => {
    onPhotoSelect(photoUrl);
    setOpen(false);
  };

  const handleDeletePhoto = async (photo: TeacherPhoto) => {
    try {
      const fileName = photo.photo_url.split('/').pop();
      if (!fileName) throw new Error("Invalid file URL");

      const { error: storageError } = await supabase.storage
        .from('teacher-photos')
        .remove([fileName]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('teacher_photos')
        .delete()
        .eq('id', photo.id);

      if (dbError) throw dbError;

      toast.success('사진이 삭제되었습니다.');
      window.location.reload();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('사진 삭제 중 오류가 발생했습니다.');
    }
  };

  // Get theme colors based on school and grade if provided
  const themeColor = React.useMemo(() => {
    if (school && grade) {
      return getSchoolThemeColor(school, grade);
    }
    return { borderColor: 'border-blue-100' };
  }, [school, grade]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2 border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary"
        >
          <Images className="h-4 w-4" />
          기존 사진 선택
        </Button>
      </DialogTrigger>
      <DialogContent className={`max-w-5xl w-[80vw] bg-white/95 backdrop-blur-xl border ${themeColor.borderColor}`}>
        <DialogHeader>
          <DialogTitle>강사 사진 선택</DialogTitle>
          <DialogDescription>사용할 사진을 클릭하세요</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 p-6">
          {filteredTeacherPhotos.length > 0 ? (
            filteredTeacherPhotos.map((photo) => (
              <div key={photo.id} className="relative group">
                <img
                  src={photo.photo_url}
                  alt="강사 사진"
                  className="w-full h-[150px] object-contain cursor-pointer hover:ring-2 hover:ring-primary transition-all rounded-lg shadow-sm hover:shadow-md bg-white"
                  onClick={() => handlePhotoSelect(photo.photo_url)}
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePhoto(photo);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          ) : (
            <div className="col-span-5 text-center py-10 text-gray-500">
              표시할 사진이 없습니다
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TeacherPhotoDialog;
