import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  Plus, 
  CalendarIcon,
  CheckCircle2,
  BookOpen,
  FileText,
  Headphones,
  ClipboardList,
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

// 스토리지 경로에 사용할 안전한 폴더명 매핑
const STORAGE_FOLDER_MAP: Record<string, string> = {
  "사진(단어)": "word",
  "사진(단어 재시험)": "word-retest",
  "사진(복습노트)": "review-note",
  "모의고사": "mock-exam",
};

const ASSIGNMENT_TYPES = [
  { key: "사진(단어)", label: "일일단어", icon: BookOpen, color: "from-blue-500 to-indigo-500", bgLight: "bg-blue-50", textColor: "text-blue-600", borderColor: "border-blue-200" },
  { key: "사진(단어 재시험)", label: "단어재시험", icon: FileText, color: "from-violet-500 to-purple-500", bgLight: "bg-violet-50", textColor: "text-violet-600", borderColor: "border-violet-200" },
  { key: "사진(복습노트)", label: "복습노트", icon: ClipboardList, color: "from-emerald-500 to-teal-500", bgLight: "bg-emerald-50", textColor: "text-emerald-600", borderColor: "border-emerald-200" },
  { key: "모의고사", label: "모의고사", icon: FileText, color: "from-rose-500 to-pink-500", bgLight: "bg-rose-50", textColor: "text-rose-600", borderColor: "border-rose-200" },
];

export function SubmitDailyWordDialog({ 
  open, 
  onOpenChange, 
  studentId,
  alreadySubmitted,
  onSuccess,
  defaultDate
}: SubmitDailyWordDialogProps) {
  const queryClient = useQueryClient();
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setSelectedDate(defaultDate || new Date());
      setPhotos([]);
      setPreviews([]);
      setSelectedType("");
    }
  }, [open, defaultDate]);

  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");

  // 선택한 날짜 + 유형에 이미 제출했는지 확인
  const { data: existingSubmissions = [], isLoading: checkingSubmission } = useQuery({
    queryKey: ["daily-word-submissions-for-date", studentId, selectedDateStr],
    queryFn: async () => {
      if (!studentId) return [];
      const { data, error } = await supabase
        .from("daily_word_submissions")
        .select("id, assignment_type")
        .eq("student_id", studentId)
        .eq("submission_date", selectedDateStr);
      if (error) throw error;
      return data || [];
    },
    enabled: !!studentId && open,
  });

  const submittedTypes = new Set(existingSubmissions.map((s: any) => s.assignment_type));
  const existingForType = existingSubmissions.find((s: any) => s.assignment_type === selectedType);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + photos.length > 10) {
      toast.error("최대 10장까지 업로드할 수 있습니다.");
      return;
    }
    const newPhotos = [...photos, ...files];
    setPhotos(newPhotos);
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
      if (!studentId) throw new Error("학생 정보를 찾을 수 없습니다.");
      if (!selectedType) throw new Error("과제 유형을 선택해주세요.");
      if (photos.length === 0) throw new Error("사진을 선택해주세요.");

      // 기존 제출이 있으면 삭제 (재제출)
      if (existingForType) {
        const { data: oldSubmission } = await supabase
          .from("daily_word_submissions")
          .select("photo_urls")
          .eq("id", existingForType.id)
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
        await supabase.from("daily_word_submissions").delete().eq("id", existingForType.id);
      }

      // Upload photos
      const uploadedUrls: string[] = [];
      for (let i = 0; i < photos.length; i++) {
        let file = photos[i];
        let fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        
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
        
        const storageFolder = STORAGE_FOLDER_MAP[selectedType] || "etc";
        const fileName = `${studentId}/${selectedDateStr}/${storageFolder}/${Date.now()}_${i}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('daily-word-photos')
          .upload(fileName, file, { cacheControl: '3600', upsert: false });
        if (uploadError) throw new Error(`사진 업로드 실패: ${uploadError.message}`);
        const { data: urlData } = supabase.storage.from('daily-word-photos').getPublicUrl(fileName);
        uploadedUrls.push(urlData.publicUrl);
      }

      const { error } = await supabase
        .from("daily_word_submissions")
        .insert({
          student_id: studentId,
          submission_date: selectedDateStr,
          photo_urls: uploadedUrls,
          status: "submitted",
          assignment_type: selectedType,
        });
      if (error) throw error;

      await supabase
        .from("dismissed_daily_words")
        .delete()
        .eq("student_id", studentId)
        .eq("dismissed_date", selectedDateStr);
    },
    onSuccess: () => {
      const typeInfo = ASSIGNMENT_TYPES.find(t => t.key === selectedType);
      toast.success(`${typeInfo?.label || "사진과제"} 제출 완료! 📸`);
      setPhotos([]);
      setPreviews([]);
      setSelectedType("");
      queryClient.invalidateQueries({ queryKey: ["daily-word-submissions-for-date", studentId, selectedDateStr] });
      onSuccess();
    },
    onError: (error: Error) => {
      toast.error(error.message || "제출에 실패했습니다.");
    },
  });

  const activeTypeInfo = ASSIGNMENT_TYPES.find(t => t.key === selectedType);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px] p-0 overflow-hidden rounded-2xl border-0 bg-card shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="relative px-6 pt-6 pb-5 bg-gradient-to-br from-primary via-blue-500 to-indigo-600 overflow-hidden">
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-white/8 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-white/5 rounded-full blur-xl" />
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-white text-base tracking-tight">사진과제 제출</h2>
                <p className="text-[11px] text-white/70 mt-0.5">
                  {format(selectedDate, "M월 d일 (EEEE)", { locale: ko })}
                </p>
              </div>
            </div>
            <button 
              onClick={() => onOpenChange(false)}
              className="w-8 h-8 bg-white/15 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/25 transition-all"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* 날짜 선택 */}
          <div className="relative mt-4">
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/15 backdrop-blur-sm border border-white/10 hover:bg-white/25 transition-all text-white text-xs font-medium">
                  <CalendarIcon className="w-3.5 h-3.5" />
                  {format(selectedDate, "yyyy.MM.dd (EEE)", { locale: ko })}
                  <span className="text-white/50 text-[10px]">변경</span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) { setSelectedDate(date); setDatePickerOpen(false); setSelectedType(""); setPhotos([]); setPreviews([]); }
                  }}
                  locale={ko}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* 제출 현황 요약 */}
          {!checkingSubmission && submittedTypes.size > 0 && (
            <div className="relative mt-3 flex items-center gap-1.5">
              <span className="text-[10px] text-white/60">제출완료:</span>
              {ASSIGNMENT_TYPES.filter(t => submittedTypes.has(t.key)).map(t => (
                <span key={t.key} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-white/20 text-[9px] font-semibold text-white">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  {t.label}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 과제 유형 선택 */}
        <div className="px-5 pt-4 pb-2">
          <p className="text-xs font-bold text-foreground mb-3 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-[10px] font-black">1</span>
            과제 유형 선택
          </p>
          <div className="flex justify-center gap-1.5 flex-wrap">
            {ASSIGNMENT_TYPES.map((type) => {
              const Icon = type.icon;
              const isSubmitted = submittedTypes.has(type.key);
              const isSelected = selectedType === type.key;
              return (
                <button
                  key={type.key}
                  onClick={() => {
                    setSelectedType(type.key);
                    setPhotos([]);
                    setPreviews([]);
                  }}
                  className={cn(
                    "relative flex flex-col items-center gap-1 py-3 px-1 rounded-xl transition-all duration-200 border",
                    isSelected
                      ? `${type.bgLight} ${type.borderColor} ${type.textColor} shadow-sm scale-[1.02]`
                      : isSubmitted
                        ? "bg-muted/50 border-border/50 opacity-60"
                        : "bg-card border-border/30 hover:border-border hover:bg-muted/30"
                  )}
                >
                  {isSubmitted && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm">
                      <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                    isSelected ? `bg-gradient-to-br ${type.color} text-white shadow-md` : "bg-muted"
                  )}>
                    <Icon className={cn("w-4 h-4", isSelected ? "text-white" : "text-muted-foreground")} />
                  </div>
                  <span className={cn(
                    "text-[10px] font-semibold leading-tight text-center",
                    isSelected ? type.textColor : "text-muted-foreground"
                  )}>
                    {type.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 사진 업로드 영역 */}
        {selectedType && (
          <div className="px-5 pb-2 animate-fade-in">
            <p className="text-xs font-bold text-foreground mb-3 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-[10px] font-black">2</span>
              사진 업로드
              {existingForType && (
                <span className="ml-auto text-[10px] text-amber-500 font-medium">⚠️ 재제출 시 기존 사진 교체</span>
              )}
            </p>

            <div className={cn("rounded-xl p-3 border transition-colors", activeTypeInfo ? `${activeTypeInfo.bgLight} ${activeTypeInfo.borderColor}` : "bg-muted/30 border-border/50")}>
              {/* 사진 미리보기 그리드 */}
              {previews.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {previews.map((preview, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted group border border-border/30 shadow-sm">
                      <img src={preview} alt={`사진 ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => removePhoto(index)}
                        className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {photos.length < 10 && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-lg border-2 border-dashed border-border flex items-center justify-center hover:border-primary/50 hover:bg-primary/5 transition-all"
                    >
                      <Plus className="w-5 h-5 text-muted-foreground" />
                    </button>
                  )}
                </div>
              )}

              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />
              <input id="camera-input-dialog" type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelect} />

              {photos.length === 0 && (
                <div className="grid grid-cols-2 gap-2.5">
                  <button 
                    onClick={() => document.getElementById('camera-input-dialog')?.click()}
                    className={cn(
                      "py-4 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all group",
                      activeTypeInfo ? `${activeTypeInfo.borderColor} hover:bg-white/60` : "border-primary/20 hover:bg-primary/5"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center mb-1.5 transition-colors",
                      activeTypeInfo ? `bg-gradient-to-br ${activeTypeInfo.color} text-white shadow-md` : "bg-primary/15"
                    )}>
                      <Camera className={cn("w-5 h-5", activeTypeInfo ? "text-white" : "text-primary")} />
                    </div>
                    <p className={cn("font-semibold text-xs", activeTypeInfo ? activeTypeInfo.textColor : "text-primary")}>직접 촬영</p>
                  </button>

                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="py-4 rounded-xl border-2 border-dashed border-border bg-white/50 flex flex-col items-center justify-center hover:bg-muted/50 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-muted group-hover:bg-muted-foreground/10 flex items-center justify-center mb-1.5 transition-colors">
                      <ImageIcon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <p className="text-foreground font-semibold text-xs">앨범 선택</p>
                  </button>
                </div>
              )}

              {photos.length > 0 && (
                <p className="text-center text-[11px] text-muted-foreground font-medium mt-1">{photos.length}/10장</p>
              )}
            </div>
          </div>
        )}

        {/* 제출 버튼 */}
        <div className="px-5 pb-5 pt-2">
          <Button 
            onClick={() => submitMutation.mutate()}
            disabled={!selectedType || photos.length === 0 || submitMutation.isPending}
            className={cn(
              "w-full h-12 text-sm font-bold rounded-xl transition-all shadow-lg disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none",
              activeTypeInfo
                ? `bg-gradient-to-r ${activeTypeInfo.color} hover:opacity-90 shadow-primary/20`
                : "bg-gradient-to-r from-primary to-blue-600 shadow-primary/25"
            )}
          >
            {submitMutation.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />제출 중...</>
            ) : (
              <>{existingForType ? "다시 제출하기" : "제출하기"}</>
            )}
          </Button>
          <button 
            onClick={() => onOpenChange(false)}
            className="w-full py-2 text-muted-foreground text-xs font-medium hover:text-foreground transition-colors mt-1"
          >
            닫기
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
