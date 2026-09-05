import React, { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera, Upload, X, Move, CropIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageUploaderProps {
  onImageSelected: (croppedImage: string) => void;
}

const ImageUploader = ({ onImageSelected }: ImageUploaderProps) => {
  const [open, setOpen] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>({ unit: '%', width: 50, height: 50, x: 25, y: 25 });
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedImage(event.target.result as string);
        }
      };
      
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleConfirmCrop = () => {
    if (!completedCrop || !imageRef.current) {
      toast({
        title: "오류",
        description: "이미지 영역을 선택해주세요.",
        variant: "destructive"
      });
      return;
    }

    const canvas = document.createElement('canvas');
    const scaleX = imageRef.current.naturalWidth / imageRef.current.width;
    const scaleY = imageRef.current.naturalHeight / imageRef.current.height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      toast({
        title: "오류",
        description: "이미지 처리 중 문제가 발생했습니다.",
        variant: "destructive"
      });
      return;
    }

    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;

    ctx.drawImage(
      imageRef.current,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    const base64Image = canvas.toDataURL('image/jpeg', 0.95);
    onImageSelected(base64Image);
    setOpen(false);
    setUploadedImage(null);
    setCrop({ unit: '%', width: 50, height: 50, x: 25, y: 25 });
    setCompletedCrop(null);

    toast({
      title: "이미지 업로드 성공",
      description: "선택하신 영역이 추가되었습니다."
    });
  };

  const handleCameraCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = "image/*";
      fileInputRef.current.capture = "environment";
      fileInputRef.current.click();
    }
    
    toast({
      title: "카메라 사용",
      description: "카메라로 사진을 찍을 수 있습니다.",
    });
  };

  const handleCancel = () => {
    setOpen(false);
    setUploadedImage(null);
    setCrop({ unit: '%', width: 50, height: 50, x: 25, y: 25 });
    setCompletedCrop(null);
  };

  return (
    <>
      <Button 
        onClick={() => setOpen(true)}
        type="button" 
        variant="ghost"
        className="p-2 rounded-full group hover:bg-toss-blue/10 transition-all duration-300 ease-in-out"
      >
        <Camera 
          className="h-5 w-5 text-toss-textSecondary group-hover:text-toss-blue group-hover:scale-110 transition-all" 
        />
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-white border-toss-border shadow-lg max-w-md w-[90vw] max-h-[80vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-toss-text font-medium">이미지 업로드 및 영역 선택</DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col gap-4">
            {!uploadedImage ? (
              <>
                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-toss-border rounded-xl bg-toss-secondary/30">
                  <p className="text-toss-textSecondary mb-4">이미지를 선택해주세요</p>
                  <div className="flex gap-2">
                    <Button 
                      onClick={triggerFileInput} 
                      variant="default"
                      className="bg-toss-blue hover:bg-toss-lightBlue text-white transition-colors"
                    >
                      <Upload size={16} className="mr-2" /> 파일 업로드
                    </Button>
                    <Button 
                      onClick={handleCameraCapture} 
                      variant="secondary"
                      className="bg-toss-secondary hover:bg-toss-focus text-toss-gray transition-colors"
                    >
                      <Camera size={16} className="mr-2" /> 카메라
                    </Button>
                  </div>
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  ref={fileInputRef}
                />
              </>
            ) : (
              <>
                <div className="relative overflow-auto max-h-[50vh] bg-toss-background p-2 rounded-xl border border-toss-border/20">
                  <ReactCrop
                    crop={crop}
                    onChange={(c) => setCrop(c)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={undefined}
                  >
                    <img
                      ref={imageRef}
                      src={uploadedImage}
                      alt="선택할 이미지"
                      className="max-w-full rounded-lg"
                    />
                  </ReactCrop>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-toss-textSecondary flex items-center">
                    <Move size={16} className="mr-1" /> 드래그하여 영역을 선택하세요
                  </p>
                  <div className="flex justify-between gap-2">
                    <Button 
                      onClick={handleCancel} 
                      variant="secondary"
                      className="flex-1 bg-toss-secondary hover:bg-toss-focus text-toss-gray transition-colors"
                    >
                      <X size={16} className="mr-2" /> 취소
                    </Button>
                    <Button 
                      onClick={handleConfirmCrop} 
                      className="flex-1 bg-toss-blue hover:bg-toss-lightBlue text-white transition-colors"
                    >
                      <CropIcon size={16} className="mr-2" /> 적용하기
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ImageUploader;
