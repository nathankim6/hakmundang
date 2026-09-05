
import { ReactNode, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { GraduationCap } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface ClassGroupProps {
  className: string;
  children: ReactNode;
}

export const ClassGroup = ({
  className,
  children
}: ClassGroupProps) => {
  const [imageError, setImageError] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  
  // Extract school name from class name (e.g., "성남고1" -> "성남고")
  const getSchoolNameFromClass = (className: string) => {
    // 여고를 먼저 매치하도록 순서 변경
    const schoolMatch = className.match(/^([가-힣]+여고|[가-힣]+고)/);
    return schoolMatch ? schoolMatch[1] : null;
  };

  const schoolName = getSchoolNameFromClass(className);
  
  // 직접 로고 URL 결정 로직
  const getLogoUrl = (className: string, schoolName: string | null): string | null => {
    if (!schoolName) return null;
    
    // 숭의여고 관련 클래스들
    if (schoolName === '숭의여고') {
      return '/lovable-uploads/4201708f-ed03-4235-8a93-0bcd3c8ab973.png';
    }
    
    // 수도여고 관련 클래스들  
    if (schoolName === '수도여고') {
      return '/lovable-uploads/6ed011f2-1218-43fc-81f1-b570eac76530.png';
    }
    
    // 성남고 관련 클래스들
    if (schoolName === '성남고') {
      return '/lovable-uploads/9d26c58e-881c-4ae0-8065-4cb027616720.png';
    }
    
    // 영등포고 관련 클래스들
    if (schoolName === '영등포고') {
      return '/lovable-uploads/8ec93e6d-032f-480d-a6fd-b101c069d539.png';
    }
    
    // 당곡고 관련 클래스들
    if (schoolName === '당곡고') {
      return '/lovable-uploads/danggok-logo.png';
    }
    
    // 구암고 관련 클래스들
    if (schoolName === '구암고') {
      return '/lovable-uploads/guam-logo.png';
    }
    
    return null;
  };

  const logoUrl = getLogoUrl(className, schoolName);

  useEffect(() => {
    // Reset image state when logo URL changes
    if (logoUrl) {
      setIsImageLoaded(false);
      setImageError(false);
    }
  }, [logoUrl]);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setIsImageLoaded(true);
    setImageError(false);
  };

  return (
    <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
      <h4 className="font-medium text-[15px] mb-2 pb-1.5 border-b border-gray-100 text-gray-800 flex items-center gap-2">
        <Avatar className="w-6 h-6 ring-2 ring-primary/20 ring-offset-1 overflow-visible">
          {(() => {
            console.log('=== AVATAR RENDER ===');
            console.log('className:', className);
            console.log('logoUrl:', logoUrl);
            console.log('imageError:', imageError);
            console.log('condition (logoUrl && !imageError):', logoUrl && !imageError);
            
            if (logoUrl && !imageError) {
              console.log('✅ Rendering AvatarImage with URL:', logoUrl);
              return (
                <AvatarImage 
                  src={logoUrl} 
                  alt={`${className} 로고`}
                  className="w-full h-full object-contain bg-white p-0.5"
                  width={24}
                  height={24}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  onLoadStart={() => console.log('Image load started for:', className, 'URL:', logoUrl)}
                />
              );
            } else {
              console.log('❌ Rendering AvatarFallback');
              return (
                <AvatarFallback className="bg-primary/10">
                  <GraduationCap className="w-3.5 h-3.5 text-primary" />
                </AvatarFallback>
              );
            }
          })()}
        </Avatar>
        <span className="bg-gradient-to-r from-primary-dark to-primary bg-clip-text text-transparent">{className}</span>
      </h4>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
};
