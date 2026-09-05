
import React, { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Camera } from 'lucide-react';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

      // storage에 파일 업로드
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
            teacher_name: 'ORUN 강사' 
          });

        if (dbError) {
          console.error('Database error:', dbError);
          throw dbError;
        }
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

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={uploadPhoto}
        className="hidden"
        id="teacher-photo-upload"
        disabled={uploading}
      />
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
      <p className="text-xs text-gray-400 mt-1 text-center">
        {maxUploads ? `최대 ${maxUploads}개` : ''}
      </p>
    </div>
  );
};
