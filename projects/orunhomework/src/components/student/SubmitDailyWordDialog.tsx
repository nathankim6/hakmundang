import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import heic2any from "heic2any";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Camera, 
  X, 
  Loader2, 
  Image as ImageIcon, 
  CheckCircle2, 
  Plus, 
  Sparkles,
  CalendarIcon,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";

interface SubmitDailyWordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  alreadySubmitted: boolean;
  onSuccess: () => void;
  defaultDate?: Date;
}

export function SubmitDailyWordDialog({ 
  open, 
  onOpenChange, 
  studentId,
  alreadySubmitted,
  onSuccess,
  defaultDate
}: SubmitDailyWordDialogProps) {
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [showDateConfirm, setShowDateConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 자정~오전 7시 사이인지 확인 (이 시간대에는 전날 과제 제출 가능성 높음)
  const isLateNightHours = () => {
    const now = new Date();
    const hour = now.getHours();
    return hour >= 0 && hour < 7;
  };

  // 전날 날짜 계산
  const getYesterday = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday;
  };

  // 다이얼로그가 열릴 때 시간대에 따라 날짜 설정
  useEffect(() => {
    if (open) {
      // defaultDate가 제공된 경우 해당 날짜 사용
      if (defaultDate) {
        setSelectedDate(defaultDate);
        setShowDateConfirm(false);
      } else if (isLateNightHours()) {
        // 자정~오전 7시 사이라면 전날 날짜를 기본값으로, 확인 UI 표시
        setSelectedDate(getYesterday());
        setShowDateConfirm(true);
      } else {
        setSelectedDate(new Date());
        setShowDateConfirm(false);
      }
      setPhotos([]);
      setPreviews([]);
    }
  }, [open, defaultDate]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const isLateSubmission = selectedDate < today;
  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");

  // 선택한 날짜에 이미 제출했는지 확인
  const { data: existingSubmission, isLoading: checkingSubmission } = useQuery({
    queryKey: ["daily-word-submission-check", studentId, selectedDateStr],
    queryFn: async () => {
      if (!studentId) return null;
      
      const { data, error } = await supabase
        .from("daily_word_submissions")
        .select("id")
        .eq("student_id", studentId)
        .eq("submission_date", selectedDateStr)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!studentId && open,
  });

  const hasSubmittedForDate = !!existingSubmission;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + photos.length > 10) {
      toast.error("최대 10장까지 업로드할 수 있습니다.");
      return;
    }

    const newPhotos = [...photos, ...files];
    setPhotos(newPhotos);

    // 미리보기 생성
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!studentId) {
        throw new Error("학생 정보를 찾을 수 없습니다. 다시 로그인해주세요.");
      }

      if (photos.length === 0) {
        throw new Error("사진을 선택해주세요.");
      }

      // 기존 제출이 있으면 삭제 (재제출)
      if (existingSubmission) {
        // 기존 사진 Storage에서 삭제
        const { data: oldSubmission } = await supabase
          .from("daily_word_submissions")
          .select("photo_urls")
          .eq("id", existingSubmission.id)
          .maybeSingle();

        if (oldSubmission?.photo_urls) {
          const oldPaths = oldSubmission.photo_urls
            .map((url: string) => {
              const match = url.match(/daily-word-photos\/(.+)$/);
              return match ? match[1] : null;
            })
            .filter(Boolean) as string[];
          if (oldPaths.length > 0) {
            await supabase.storage.from('daily-word-photos').remove(oldPaths);
          }
        }

        await supabase
          .from("daily_word_submissions")
          .delete()
          .eq("id", existingSubmission.id);
      }

      // Storage에 이미지 업로드
      const uploadedUrls: string[] = [];
      
      for (let i = 0; i < photos.length; i++) {
        let file = photos[i];
        let fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        
        // HEIC/HEIF 파일을 JPEG로 변환
        if (fileExt === 'heic' || fileExt === 'heif' || file.type === 'image/heic' || file.type === 'image/heif') {
          try {
            const convertedBlob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.85 });
            const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
            file = new File([blob], file.name.replace(/\.heic$/i, '.jpg').replace(/\.heif$/i, '.jpg'), { type: 'image/jpeg' });
            fileExt = 'jpg';
          } catch (convErr) {
            console.error('HEIC conversion error:', convErr);
          }
        }
        
        const fileName = `${studentId}/${selectedDateStr}/${Date.now()}_${i}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('daily-word-photos')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw new Error(`사진 업로드 실패: ${uploadError.message}`);
        }

        const { data: urlData } = supabase.storage
          .from('daily-word-photos')
          .getPublicUrl(fileName);
        
        uploadedUrls.push(urlData.publicUrl);
      }

      // 선택한 날짜로 제출
      const { error } = await supabase
        .from("daily_word_submissions")
        .insert({
          student_id: studentId,
          submission_date: selectedDateStr,
          photo_urls: uploadedUrls,
          status: "submitted",
        });

      if (error) throw error;

      // 취소된 과제가 있으면 dismissed 레코드 삭제 (재제출)
      await supabase
        .from("dismissed_daily_words")
        .delete()
        .eq("student_id", studentId)
        .eq("dismissed_date", selectedDateStr);
    },
    onSuccess: () => {
      const message = isLateSubmission 
        ? "밀린 과제가 제출되었습니다! 📸" 
        : "일일 단어과제가 제출되었습니다! 📸";
      toast.success(message);
      setPhotos([]);
      setPreviews([]);
      onSuccess();
    },
    onError: (error: Error) => {
      toast.error(error.message || "제출에 실패했습니다.");
    },
  });

  const handleSubmit = () => {
    submitMutation.mutate();
  };

  // 오늘 이미 제출한 경우 (기존 로직)
  if (alreadySubmitted && format(selectedDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-sm p-0 overflow-hidden rounded-3xl border-0 shadow-2xl">
          <div className="bg-gradient-to-br from-emerald-400 to-emerald-500 p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">오늘 제출 완료!</h2>
            <p className="text-white/80">밀린 과제가 있다면 날짜를 선택해주세요</p>
          </div>
          <div className="p-6 space-y-3">
            {/* 날짜 선택 버튼 */}
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline"
                  className="w-full h-14 text-base font-medium rounded-2xl border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50/50"
                >
                  <CalendarIcon className="w-5 h-5 mr-2 text-slate-400" />
                  밀린 과제 제출하기
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) {
                      setSelectedDate(date);
                      setDatePickerOpen(false);
                    }
                  }}
                  disabled={(date) => date > new Date()}
                  locale={ko}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            <Button 
              onClick={() => onOpenChange(false)}
              className="w-full h-14 text-base font-semibold rounded-2xl bg-slate-900 hover:bg-slate-800"
            >
              확인
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm p-0 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        {/* 헤더 - 세련된 그라데이션 */}
        <div className={cn(
          "relative p-5 pb-6 overflow-hidden",
          isLateSubmission 
            ? "bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500" 
            : "bg-gradient-to-br from-primary via-blue-500 to-indigo-600"
        )}>
          {/* 배경 장식 */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white/5 rounded-full blur-xl" />
          
          <div className="relative flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                {isLateSubmission ? (
                  <AlertTriangle className="w-4.5 h-4.5 text-white" />
                ) : (
                  <Camera className="w-4.5 h-4.5 text-white" />
                )}
              </div>
              <div>
                <span className="font-bold text-white text-sm">
                  {isLateSubmission ? "밀린 과제 제출" : "일일 단어과제"}
                </span>
                {isLateSubmission && (
                  <p className="text-[10px] text-white/70 font-medium">기한이 지난 과제입니다</p>
                )}
              </div>
            </div>
            <button 
              onClick={() => onOpenChange(false)}
              className="w-8 h-8 bg-white/15 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/25 transition-all"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* 자정~오전 7시 사이 날짜 확인 배너 */}
          {showDateConfirm && (
            <div className="relative mb-3 bg-white/15 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <p className="text-white text-xs font-semibold mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                어떤 날짜의 과제인가요?
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setSelectedDate(getYesterday());
                    setShowDateConfirm(false);
                  }}
                  className={cn(
                    "py-2.5 px-3 rounded-xl text-sm font-semibold transition-all",
                    selectedDate.toDateString() === getYesterday().toDateString()
                      ? "bg-white text-amber-600 shadow-lg"
                      : "bg-white/20 text-white hover:bg-white/30"
                  )}
                >
                  어제 ({format(getYesterday(), "M/d")})
                </button>
                <button
                  onClick={() => {
                    setSelectedDate(new Date());
                    setShowDateConfirm(false);
                  }}
                  className={cn(
                    "py-2.5 px-3 rounded-xl text-sm font-semibold transition-all",
                    selectedDate.toDateString() === new Date().toDateString()
                      ? "bg-white text-primary shadow-lg"
                      : "bg-white/20 text-white hover:bg-white/30"
                  )}
                >
                  오늘 ({format(new Date(), "M/d")})
                </button>
              </div>
            </div>
          )}
          
          {/* 날짜 선택 */}
          <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
            <PopoverTrigger asChild>
              <button className="relative w-full flex items-center justify-between bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3 hover:bg-white/25 transition-all border border-white/10">
                <div className="flex items-center gap-2.5">
                  <CalendarIcon className="w-4 h-4 text-white/80" />
                  <span className="text-white font-semibold text-sm">
                    {format(selectedDate, "M월 d일 (EEE)", { locale: ko })}
                  </span>
                </div>
                {isLateSubmission && (
                  <span className="text-[10px] bg-white/25 text-white px-2 py-1 rounded-full font-bold">
                    밀린 과제
                  </span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (date) {
                    setSelectedDate(date);
                    setDatePickerOpen(false);
                    setShowDateConfirm(false);
                  }
                }}
                disabled={(date) => date > new Date()}
                locale={ko}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* 컨텐츠 */}
        <div className="p-5 -mt-3">
          {/* 이미 제출한 날짜 선택 시 */}
          {hasSubmittedForDate ? (
            <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl p-4 text-center border border-amber-200 dark:border-amber-800/50 mb-3">
              <div className="flex items-center justify-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <p className="font-bold text-foreground text-sm">이미 제출한 날짜예요</p>
              </div>
              <p className="text-xs text-muted-foreground">
                다시 제출하면 기존 제출이 교체됩니다
              </p>
            </div>
          ) : null}
          {hasSubmittedForDate ? null : checkingSubmission ? (
            <div className="bg-muted/50 rounded-xl p-6 flex items-center justify-center border border-border/50">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
              {/* 사진 미리보기 그리드 */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                {previews.map((preview, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted group border border-border/30">
                    <img 
                      src={preview} 
                      alt={`사진 ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                
                {photos.length < 10 && photos.length > 0 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center hover:border-primary/50 hover:bg-primary/5 transition-all"
                  >
                    <Plus className="w-5 h-5 text-muted-foreground" />
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />

              {/* 카메라 촬영용 input */}
              <input
                id="camera-input"
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileSelect}
              />

              {photos.length === 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {/* 카메라 촬영 버튼 */}
                  <button 
                    onClick={() => document.getElementById('camera-input')?.click()}
                    className={cn(
                      "py-5 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all group",
                      isLateSubmission 
                        ? "border-amber-200 bg-amber-50/30 hover:border-amber-400 hover:bg-amber-100/50"
                        : "border-primary/20 bg-primary/5 hover:border-primary/40 hover:bg-primary/10"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center mb-2 transition-colors",
                      isLateSubmission 
                        ? "bg-amber-100 group-hover:bg-amber-200"
                        : "bg-primary/15 group-hover:bg-primary/25"
                    )}>
                      <Camera className={cn(
                        "w-6 h-6 transition-colors",
                        isLateSubmission ? "text-amber-600" : "text-primary"
                      )} />
                    </div>
                    <p className={cn(
                      "font-semibold text-sm",
                      isLateSubmission ? "text-amber-700" : "text-primary"
                    )}>직접 촬영</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">카메라 열기</p>
                  </button>

                  {/* 앨범에서 선택 버튼 */}
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="py-5 rounded-xl border-2 border-dashed border-border bg-muted/30 flex flex-col items-center justify-center hover:border-muted-foreground/30 hover:bg-muted/50 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-muted group-hover:bg-muted-foreground/10 flex items-center justify-center mb-2 transition-colors">
                      <ImageIcon className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                    <p className="text-foreground font-semibold text-sm">앨범에서 선택</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">최대 10장</p>
                  </button>
                </div>
              )}

              {photos.length > 0 && (
                <p className="text-center text-xs text-muted-foreground font-medium">{photos.length}/10장 선택됨</p>
              )}
            </div>
          )}

          {/* 제출 버튼 */}
          {!checkingSubmission && (
            <div className="mt-5 space-y-2">
              <Button 
                onClick={handleSubmit}
                disabled={photos.length === 0 || submitMutation.isPending}
                className={cn(
                  "w-full h-12 text-sm font-bold rounded-xl transition-all shadow-lg disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none",
                  isLateSubmission 
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-amber-500/25" 
                    : "bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 shadow-primary/25"
                )}
              >
                {submitMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    제출 중...
                  </>
                ) : (
                  <>
                    
                    {hasSubmittedForDate ? "다시 제출하기" : isLateSubmission ? "밀린 과제 제출하기" : "제출하기"}
                  </>
                )}
              </Button>
              <button 
                onClick={() => onOpenChange(false)}
                className="w-full py-2.5 text-muted-foreground text-sm font-medium hover:text-foreground transition-colors"
              >
                {hasSubmittedForDate ? "닫기" : "다음에 할게요"}
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
