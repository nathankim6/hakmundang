
import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Camera, Images, Trash2, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TeacherPhoto } from '@/types/supabaseExtensions';

type TeacherPhotoUploaderProps = {
  onPhotoUpload: (photoUrl: string) => void;
  maxUploads?: number; // Optional max uploads limit
  buttonText?: string; // Customizable button text
  bucketName?: string; // Optional bucket name for different photo types
};

export const TeacherPhotoUploader: React.FC<TeacherPhotoUploaderProps> = ({ 
  onPhotoUpload, 
  maxUploads,
  buttonText = '새 사진 업로드',
  bucketName = 'teacher-photos' // Default to teacher-photos bucket
}) => {
  const [uploading, setUploading] = useState(false);
  const [existingPhotos, setExistingPhotos] = useState<TeacherPhoto[]>([]);
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch existing photos when the component loads
  useEffect(() => {
    if (bucketName === 'teacher-photos') {
      fetchExistingPhotos();
    }
  }, [bucketName]);

  const fetchExistingPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('teacher_photos')
        .select('*')
        .order('created_at', { ascending: false })
        .filter('is_hit_question', 'eq', false);
      
      if (error) throw error;
      
      if (data) {
        setExistingPhotos(data);
      }
    } catch (error) {
      console.error('Error fetching existing photos:', error);
    }
  };

  const handleButtonClick = () => {
    // 파일 선택 다이얼로그를 직접 트리거
    fileInputRef.current?.click();
  };

  const uploadPhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      setUploading(true);
      
      // 콘솔에 파일 업로드 시작 로그 추가
      console.log('Photo upload started', { fileName: file.name, fileSize: file.size, bucketName });
      
      const fileExt = file.name.split('.').pop();
      // Set appropriate prefix based on bucket name
      const prefix = bucketName === 'report-photos' ? 'hit-question' : 'teacher';
      const fileName = `${prefix}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // storage에 파일 업로드 - 버킷이름 명시적으로 지정
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Storage upload error:', error);
        throw error;
      }

      console.log('Storage upload successful', data);

      // 업로드된 파일의 공개 URL 가져오기
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      console.log('Public URL generated:', publicUrl);

      // 이미지 URL을 부모 컴포넌트로 전달
      onPhotoUpload(publicUrl);
      
      // 적중 문항 사진이나 다른 용도로 사용 중일 때는 DB 저장을 건너뛸 수 있도록 
      // bucketName으로 구분 (티처 포토 외에는 DB에 저장하지 않음)
      if (bucketName === 'teacher-photos') {
        // 데이터베이스에 사진 정보 저장
        const { error: dbError } = await supabase
          .from('teacher_photos')
          .insert({ 
            photo_url: publicUrl, 
            teacher_name: '미정',
            is_hit_question: false
          });

        if (dbError) {
          console.error('Database error:', dbError);
          throw dbError;
        }
        
        // 새로운 사진이 추가됐으니 목록 업데이트
        fetchExistingPhotos();
      }
      
      toast.success('사진이 성공적으로 업로드되었습니다.');
    } catch (error) {
      console.error('Photo upload error:', error);
      toast.error('사진 업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
      // 파일 선택 입력을 초기화하여 같은 파일을 다시 선택할 수 있게 함
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const selectExistingPhoto = (photoUrl: string) => {
    onPhotoUpload(photoUrl);
    toast.success('기존 사진이 선택되었습니다.');
  };

  // 새로 추가: 사진 삭제 기능
  const deletePhoto = async (photoId: string, photoUrl: string) => {
    try {
      setDeletingPhotoId(photoId);
      
      // 1. Extract the file path from the public URL
      const photoPath = photoUrl.split('/').pop();
      
      if (!photoPath) {
        throw new Error('Invalid photo URL');
      }
      
      console.log('Deleting photo from storage:', photoPath);
      
      // 2. Delete the file from storage
      const { error: storageError } = await supabase.storage
        .from(bucketName)
        .remove([photoPath]);
      
      if (storageError) {
        console.error('Storage delete error:', storageError);
        throw storageError;
      }
      
      // 3. Delete the record from the database
      const { error: dbError } = await supabase
        .from('teacher_photos')
        .delete()
        .eq('id', photoId);
      
      if (dbError) {
        console.error('Database delete error:', dbError);
        throw dbError;
      }
      
      // 4. Update the list
      fetchExistingPhotos();
      
      toast.success('사진이 삭제되었습니다.');
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error('사진 삭제 중 오류가 발생했습니다.');
    } finally {
      setDeletingPhotoId(null);
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={uploadPhoto}
        className="hidden"
        id="teacher-photo-upload"
        disabled={uploading}
      />
      <div className="flex gap-2">
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          disabled={uploading}
          className="flex items-center gap-2 border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary"
          onClick={handleButtonClick}
        >
          {uploading ? '업로드 중...' : (
            <>
              <Camera className="h-4 w-4" />
              {buttonText}
            </>
          )}
        </Button>

        {bucketName === 'teacher-photos' && existingPhotos.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary"
              >
                <Images className="h-4 w-4" />
                기존사진 선택
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 max-h-80 overflow-auto grid grid-cols-2 gap-2 p-2">
              {existingPhotos.map((photo) => (
                <DropdownMenuItem
                  key={photo.id}
                  className="flex items-center justify-center cursor-pointer p-1 h-auto relative group"
                >
                  <div className="relative">
                    <img
                      src={photo.photo_url}
                      alt="사진 미리보기"
                      className="h-24 w-24 object-cover rounded"
                      onClick={() => selectExistingPhoto(photo.photo_url)}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation(); // 이벤트 버블링 방지
                        deletePhoto(photo.id, photo.photo_url);
                      }}
                      disabled={deletingPhotoId === photo.id}
                    >
                      {deletingPhotoId === photo.id ? (
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-t-transparent" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      
      <p className="text-xs text-gray-400 mt-1 text-center">
        {maxUploads ? `최대 ${maxUploads}개` : ''}
      </p>
    </div>
  );
};
