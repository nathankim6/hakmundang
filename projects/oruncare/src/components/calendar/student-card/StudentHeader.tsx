import { memo, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Trash, Smile, Frown, AlertCircle, HelpCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getResultBadgeStyle } from '../utils/cardStyles';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { GraduationCap } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface StudentHeaderProps {
  id: string;
  name: string;
  result?: 'pass' | 'fail' | 'absent' | 'not-taken';
  onDeleteSchedule: (scheduleId: string) => void;
  isAuthenticated: boolean;
  className?: string;
}

const getResultIcon = (result?: 'pass' | 'fail' | 'absent' | 'not-taken') => {
  switch (result) {
    case 'pass':
      return <Smile className="h-4 w-4 text-blue-500" />;
    case 'fail':
      return <Frown className="h-4 w-4 text-blue-500" />;
    case 'absent':
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    default:
      return <HelpCircle className="h-4 w-4" />;
  }
};

export const StudentHeader = memo(({
  id,
  name,
  result,
  onDeleteSchedule,
  isAuthenticated,
  className
}: StudentHeaderProps) => {
  const [imageError, setImageError] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  
  const { data: logoUrl } = useQuery({
    queryKey: ['school-logo', className],
    queryFn: async () => {
      if (!className) return null;
      
      const schoolMatch = className?.match(/^([가-힣]+고|[가-힣]+여고)/);
      const schoolName = schoolMatch ? `${schoolMatch[1]}등학교` : null;
      
      console.log('Fetching logo for student in school:', schoolName);
      
      // 숭의여고 관련 반 처리 (숭의여고, 숭의여고1, 숭의여고2 등)
      if (className?.startsWith('숭의여고')) {
        console.log('Using custom logo for 숭의여고 student in class:', className);
        return '/lovable-uploads/4201708f-ed03-4235-8a93-0bcd3c8ab973.png';
      }
      
      // 수도여고 관련 반 처리 (수도여고, 수도여고1, 수도여고2 등)
      if (className?.startsWith('수도여고')) {
        console.log('Using custom logo for 수도여고 student in class:', className);
        return '/lovable-uploads/6ed011f2-1218-43fc-81f1-b570eac76530.png';
      }
      
      // 성남고 관련 반 처리 (성남고, 성남고1, 성남고2 등)
      if (className?.startsWith('성남고')) {
        console.log('Using custom logo for 성남고 student in class:', className);
        return '/lovable-uploads/9d26c58e-881c-4ae0-8065-4cb027616720.png';
      }
      
      // 영등포고 관련 반 처리 (영등포고, 영등포고1, 영등포고2 등)
      if (className?.startsWith('영등포고')) {
        console.log('Using custom logo for 영등포고 student in class:', className);
        return '/lovable-uploads/8ec93e6d-032f-480d-a6fd-b101c069d539.png';
      }
      
      // 당곡고 관련 반 처리 (당곡고, 당곡고1, 당곡고2 등)
      if (className?.startsWith('당곡고')) {
        console.log('Using custom logo for 당곡고 student in class:', className);
        return '/lovable-uploads/danggok-logo.png';
      }
      
      // 구암고 관련 반 처리 (구암고, 구암고1, 구암고2 등)
      if (className?.startsWith('구암고')) {
        console.log('Using custom logo for 구암고 student in class:', className);
        return '/lovable-uploads/guam-logo.png';
      }
      
      if (!schoolName) {
        console.log('No school name could be extracted from class name:', className);
        return null;
      }
      
      const { data, error } = await supabase
        .from('school_logos')
        .select('logo_url')
        .eq('school_name', schoolName)
        .maybeSingle();

      if (error) {
        console.error('Error fetching school logo for student:', error);
        return null;
      }

      if (!data?.logo_url) {
        console.log('No logo found for school:', schoolName);
        return null;
      }

      const { data: publicUrl } = supabase
        .storage
        .from('school-logos')
        .getPublicUrl(data.logo_url);

      console.log('Logo public URL for student:', publicUrl.publicUrl);
      return publicUrl.publicUrl;
    },
    enabled: !!className
  });

  useEffect(() => {
    if (logoUrl) {
      setIsImageLoaded(false);
      setImageError(false);
    }
  }, [logoUrl]);

  const handleImageError = () => {
    console.error('Failed to load image for student in class:', className, 'URL:', logoUrl);
    setImageError(true);
  };

  const handleImageLoad = () => {
    console.log('Successfully loaded image for student in class:', className);
    setIsImageLoaded(true);
    setImageError(false);
  };

  return (
    <div className="flex justify-between items-center mb-3 bg-gradient-to-r from-gray-50 to-white p-2 rounded-lg border border-gray-100 shadow-sm hover:shadow transition-all duration-300">
      <div className="flex items-center gap-2.5">
        <Avatar className={cn(
          "w-8 h-8 ring-1 shadow-sm",
          result === 'pass' ? "ring-blue-300" : 
          result === 'fail' ? "ring-red-300" : 
          result === 'absent' ? "ring-yellow-300" : 
          "ring-gray-200"
        )}>
          {logoUrl && !imageError ? (
            <AvatarImage 
              src={logoUrl} 
              alt={`${className || ''} 로고`}
              className="w-full h-full object-contain bg-white p-0.5"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          ) : (
            <AvatarFallback className={cn(
              "text-white",
              result === 'pass' ? "bg-blue-100 text-blue-600" : 
              result === 'fail' ? "bg-red-100 text-red-600" : 
              result === 'absent' ? "bg-yellow-100 text-yellow-600" : 
              "bg-gray-100 text-gray-600"
            )}>
              {getResultIcon(result)}
            </AvatarFallback>
          )}
        </Avatar>
        
        <div>
          <h3 className="text-base font-semibold text-gray-800 tracking-tight">{name}</h3>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {result && (
          <Badge variant="outline" className={cn("text-[10px] h-5 px-2 font-medium", getResultBadgeStyle(result))}>
            {result === 'pass' ? '통과' : 
             result === 'fail' ? '미통과' : 
             result === 'absent' ? '결석' : '미응시'}
          </Badge>
        )}
        
        {isAuthenticated && (
          <AlertDialog>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600/80 hover:text-red-600 hover:bg-red-50 rounded-full">
                      <Trash className="h-3.5 w-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>학생 시험 일정 삭제</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>시험 일정 삭제</AlertDialogTitle>
                <AlertDialogDescription>
                  {name} 학생의 시험 일정을 삭제하시겠습니까?
                  이 작업은 되돌릴 수 없습니다.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>취소</AlertDialogCancel>
                <AlertDialogAction 
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => onDeleteSchedule(id)}
                >
                  삭제
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
});

StudentHeader.displayName = 'StudentHeader';
