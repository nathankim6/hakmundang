import { useState, useEffect, useMemo } from "react";
import heic2any from "heic2any";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { CheckCircle2, ChevronLeft, ChevronRight, Clock, Loader2, MessageCircle, MessageSquare } from "lucide-react";
import { ImageZoomDialog } from "@/components/ui/image-zoom-dialog";
import { getMessageTemplates, formatMessage } from "@/components/notifications/MessageTemplateDialog";
import { useAuth } from "@/contexts/AuthContext";

interface Submission {
  id: string;
  submitted_at: string;
  status: string;
  photo_urls?: string[] | null;
  teacher_note?: string | null;
}

interface Student {
  id: string;
  name: string;
  grade?: {
    name: string;
    school?: {
      name: string;
    };
  };
}

interface DailySubmissionDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
  submission: Submission | null;
}

export function DailySubmissionDetailDialog({
  open,
  onOpenChange,
  student,
  submission,
}: DailySubmissionDetailDialogProps) {
  const [teacherNote, setTeacherNote] = useState("");
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoomIndex, setZoomIndex] = useState(0);
  const queryClient = useQueryClient();
  const { session } = useAuth();

  // 상세 다이얼로그 열릴 때 photo_urls만 별도 조회 (타임아웃 방지)
  const { data: photoData, isLoading: isLoadingPhotos } = useQuery({
    queryKey: ["daily-submission-photos", submission?.id],
    queryFn: async () => {
      if (!submission?.id) return null;
      
      // RPC 함수 대신 직접 조회하되 타임아웃 가능성 있음
      const { data, error } = await supabase
        .from("daily_word_submissions")
        .select("photo_urls")
        .eq("id", submission.id)
        .single();
      
      if (error) {
        console.error("Photo fetch error:", error);
        return null;
      }
      return data;
    },
    enabled: !!submission?.id && open,
    retry: 1, // 타임아웃 시 한 번만 재시도
    staleTime: 60000, // 1분간 캐시
  });

  // ★ submission이 변경될 때마다 teacherNote 상태 동기화
  useEffect(() => {
    if (submission) {
      setTeacherNote(submission.teacher_note || "");
      setCurrentPhotoIndex(0);
    }
  }, [submission?.id]);

  const updateMutation = useMutation({
    mutationFn: async ({ note, status, notificationType }: { note: string; status: string; notificationType?: "sms" | "kakao" }) => {
      if (!submission) throw new Error("제출물이 없습니다.");
      
      // 1. DB 업데이트 먼저 (빠름)
      const { error } = await supabase
        .from("daily_word_submissions")
        .update({
          teacher_note: note,
          status: status,
          reviewed_at: new Date().toISOString(),
          ...(status === "reviewed" ? { photo_urls: [] } : {}),
        })
        .eq("id", submission.id);

      if (error) throw error;

      // 2. 사진 삭제 + 알림은 백그라운드로 처리 (await 하지 않음)
      if (status === "reviewed") {
        // 사진 삭제 (비동기 - 에러 무시) — 원본 URL(rawPhotos)에서 경로 추출
        const originalUrls = photoData?.photo_urls || [];
        if (originalUrls.length > 0) {
          const filesToDelete: string[] = [];
          for (const url of originalUrls) {
            const match = url.match(/daily-word-photos\/(.+)$/);
            if (match) filesToDelete.push(decodeURIComponent(match[1]));
          }
          if (filesToDelete.length > 0) {
            supabase.storage.from("daily-word-photos").remove(filesToDelete)
              .then(({ error: delErr }) => {
                if (delErr) console.error("Failed to delete photos:", delErr);
                else console.log(`Deleted ${filesToDelete.length} photos from storage`);
              });
          }
        }

        // 알림 발송 (비동기)
        if (student && notificationType) {
          (async () => {
            try {
              const templates = await getMessageTemplates(session?.accessCodeId);
              const messageTemplate = formatMessage(templates.dailyWordReview, {
                studentName: student.name,
              });
              const response = await supabase.functions.invoke("send-kakao-notification", {
                body: {
                  studentId: student.id,
                  studentName: student.name,
                  submissionType: "daily_word",
                  teacherNote: note || undefined,
                  messageTemplate,
                  brandPrefix: templates.brandPrefix,
                  ...(notificationType ? { messageType: notificationType } : {}),
                  ownerCodeId: session?.accessCodeId,
                },
              });
              if (response.data?.insufficientBalance) {
                toast.error("💰 솔라피 잔액이 부족합니다.\n솔라피 콘솔에서 잔액을 충전해주세요.");
              }
            } catch (e) {
              console.error("Notification error:", e);
            }
          })();
        }
      }
    },
    onMutate: async () => {
      // 낙관적 업데이트: 즉시 다이얼로그 닫기
      onOpenChange(false);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["daily-submissions-only"] });
      queryClient.invalidateQueries({ queryKey: ["daily-submission-photos"] });
      queryClient.invalidateQueries({ queryKey: ["unreviewed-submissions-all"] });
      if (variables.status === "reviewed") {
        const typeLabel = variables.notificationType === "sms" ? "문자" : variables.notificationType === "kakao" ? "카카오톡" : "";
        toast.success(`검토 완료!${typeLabel ? ` (${typeLabel} 발송)` : ""}`);
      } else {
        toast.success("피드백이 저장되었습니다.");
      }
    },
    onError: () => {
      toast.error("피드백 저장에 실패했습니다.");
    },
  });

  const handleSave = (status: "reviewed" | "submitted", notificationType?: "sms" | "kakao") => {
    updateMutation.mutate({ note: teacherNote, status, notificationType });
  };

  const rawPhotos = photoData?.photo_urls || [];
  const [convertedPhotos, setConvertedPhotos] = useState<string[]>([]);
  const [isConverting, setIsConverting] = useState(false);

  // HEIC 파일을 JPEG로 변환
  useEffect(() => {
    if (rawPhotos.length === 0) {
      setConvertedPhotos([]);
      return;
    }

    const hasHeic = rawPhotos.some(url => /\.heic$/i.test(url));
    if (!hasHeic) {
      setConvertedPhotos(rawPhotos);
      return;
    }

    let cancelled = false;
    setIsConverting(true);

    Promise.all(
      rawPhotos.map(async (url) => {
        if (!/\.heic$/i.test(url)) return url;
        try {
          const res = await fetch(url);
          const blob = await res.blob();
          const jpegBlob = await heic2any({ blob, toType: "image/jpeg", quality: 0.85 });
          const result = Array.isArray(jpegBlob) ? jpegBlob[0] : jpegBlob;
          return URL.createObjectURL(result);
        } catch (e) {
          console.error("HEIC conversion failed:", e);
          return url; // fallback
        }
      })
    ).then((results) => {
      if (!cancelled) {
        setConvertedPhotos(results);
        setIsConverting(false);
      }
    });

    return () => {
      cancelled = true;
      // cleanup object URLs
      convertedPhotos.forEach(url => {
        if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      });
    };
  }, [rawPhotos.join(",")]);

  const photos = convertedPhotos;

  const handlePrevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const handleNextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  };

  // Reset photo index when dialog opens (teacherNote is now synced via useEffect)
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      // 다이얼로그 닫을 때 상태 초기화
      setCurrentPhotoIndex(0);
    }
    onOpenChange(isOpen);
  };

  if (!student || !submission) return null;

  return (
    <>
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            일일 단어과제 확인
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {student.grade?.school?.name} · {student.grade?.name} · {student.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* 제출 정보 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 sm:p-3 bg-muted rounded-lg">
            <div className="text-xs sm:text-sm text-muted-foreground">
              제출: {format(new Date(submission.submitted_at), "M월 d일 HH:mm", { locale: ko })}
            </div>
            <Badge
              variant={submission.status === "reviewed" ? "default" : "secondary"}
              className={submission.status === "reviewed" 
                ? "bg-success/20 text-success border-success/30" 
                : "bg-warning/20 text-warning border-warning/30"
              }
            >
              {submission.status === "reviewed" ? (
                <>
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  검토완료
                </>
              ) : (
                <>
                  <Clock className="w-3 h-3 mr-1" />
                  검토대기
                </>
              )}
            </Badge>
          </div>

          {/* 사진 뷰어 */}
          {(isLoadingPhotos || isConverting) ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">{isConverting ? "사진 변환 중..." : "사진 불러오는 중..."}</span>
            </div>
          ) : photos.length > 0 ? (
            <div className="space-y-3">
              <h4 className="font-medium text-sm flex items-center gap-2">
                제출 사진 ({currentPhotoIndex + 1}/{photos.length})
              </h4>
              <div className="relative bg-muted rounded-lg overflow-hidden">
                <img
                  src={photos[currentPhotoIndex]}
                  alt={`제출 사진 ${currentPhotoIndex + 1}`}
                  className="w-full h-52 sm:h-80 object-contain cursor-zoom-in"
                  onClick={() => { setZoomIndex(currentPhotoIndex); setZoomOpen(true); }}
                />
                {photos.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevPhoto}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={handleNextPhoto}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
              </div>
              {/* 썸네일 */}
              {photos.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {photos.map((url, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentPhotoIndex(idx)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        idx === currentPhotoIndex 
                          ? "border-primary ring-2 ring-primary/30" 
                          : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={url}
                        alt={`썸네일 ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : submission?.status === "reviewed" ? (
            <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-success" />
              <p className="font-medium text-foreground">검토가 완료된 과제입니다</p>
              <p className="text-xs mt-1">사진은 검토 완료 시 서버 용량 절약을 위해 자동 삭제됩니다.</p>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>사진을 불러올 수 없습니다.</p>
              <p className="text-xs mt-1">데이터베이스 연결이 불안정할 수 있습니다.</p>
            </div>
          )}

          {/* 피드백 입력 */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              선생님 피드백
            </label>
            <Textarea
              value={teacherNote}
              onChange={(e) => setTeacherNote(e.target.value)}
              placeholder="학생에게 전달할 피드백을 입력하세요..."
              className="min-h-[100px]"
            />
          </div>

          {/* 버튼 */}
          <div className="grid grid-cols-2 sm:flex gap-2 sm:gap-3 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-xs sm:text-sm"
            >
              닫기
            </Button>
            <Button
              onClick={() => handleSave("reviewed", "sms")}
              disabled={updateMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm"
            >
              <MessageSquare className="w-4 h-4 mr-1 shrink-0" strokeWidth={1.75} />
              문자 검토완료
            </Button>
            <Button
              onClick={() => handleSave("reviewed", "kakao")}
              disabled={updateMutation.isPending}
              className="bg-yellow-500 hover:bg-yellow-600 text-black text-xs sm:text-sm"
            >
              <MessageCircle className="w-4 h-4 mr-1 shrink-0" strokeWidth={1.75} />
              카톡 검토완료
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    <ImageZoomDialog open={zoomOpen} onOpenChange={setZoomOpen} images={photos} initialIndex={zoomIndex} />
    </>
  );
}
