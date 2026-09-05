import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import { KaraokeRecorder } from "@/components/recording/KaraokeRecorder";
import { convertToWav } from "@/utils/audioConverter";
import { Progress } from "@/components/ui/progress";
import { Mic, Info } from "lucide-react";
interface SubmitRTDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submission: any;
  onSuccess: () => void;
}
interface Sentence {
  text: string;
  startTime?: number;
  endTime?: number;
}
export function SubmitRTDialog({
  open,
  onOpenChange,
  submission,
  onSuccess
}: SubmitRTDialogProps) {
  const [showKaraoke, setShowKaraoke] = useState(false);
  const [uploadStage, setUploadStage] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [failedMessage, setFailedMessage] = useState<string | null>(null);
  const pendingPayloadRef = useRef<{ audioBlob: Blob; timestamps: Sentence[] } | null>(null);
  // 지문 내용
  const passage = submission?.homework?.passages;
  const sentences = passage?.sentences || [];
  const title = passage?.title || submission?.homework?.title || "녹음 과제";
  const submitMutation = useMutation({
    mutationFn: async (data: {
      audioBlob: Blob;
      timestamps: Sentence[];
    }) => {
      setUploadStage("변환 중...");
      setUploadProgress(10);
      let finalBlob: Blob;
      let ext: string;
      try {
        const wavBlob = await convertToWav(data.audioBlob);
        // WAV가 50MB 이하이면 사용, 초과 시 원본 압축 포맷 사용
        if (wavBlob.size <= 50 * 1024 * 1024) {
          finalBlob = wavBlob;
          ext = "wav";
        } else {
          console.warn("[WAV Convert] WAV too large (" + (wavBlob.size / 1024 / 1024).toFixed(1) + "MB), using compressed format");
          finalBlob = data.audioBlob;
          const mimeType = data.audioBlob.type || "audio/webm";
          ext = mimeType.includes("wav") ? "wav" : mimeType.includes("ogg") ? "ogg" : mimeType.includes("mp4") ? "mp4" : "webm";
        }
      } catch (e) {
        console.warn("[WAV Convert] Client-side conversion failed, uploading raw:", e);
        finalBlob = data.audioBlob;
        const mimeType = data.audioBlob.type || "audio/webm";
        ext = mimeType.includes("wav") ? "wav" : mimeType.includes("ogg") ? "ogg" : mimeType.includes("mp4") ? "mp4" : "webm";
      }

      // 파일 크기 체크 (50MB 제한) — WAV가 크면 원본 압축본으로 대체 시도
      if (finalBlob.size > 50 * 1024 * 1024 && data.audioBlob.size <= 50 * 1024 * 1024) {
        console.warn("[Upload] Converted blob too large, falling back to original compressed blob");
        finalBlob = data.audioBlob;
        const mimeType = data.audioBlob.type || "audio/webm";
        ext = mimeType.includes("wav") ? "wav" : mimeType.includes("ogg") ? "ogg" : mimeType.includes("mp4") ? "mp4" : "webm";
      }
      if (finalBlob.size > 50 * 1024 * 1024) {
        throw new Error("녹음 파일이 너무 큽니다 (50MB 초과). 더 짧게 녹음해주세요.");
      }
      if (finalBlob.size < 1024) {
        throw new Error("녹음 파일이 비어 있습니다. 마이크 권한을 확인하고 다시 녹음해주세요.");
      }

      
      console.log("[Upload] Final blob size:", (finalBlob.size / 1024 / 1024).toFixed(2) + "MB, format:", ext);

      setUploadStage("업로드 중...");
      setUploadProgress(30);

      const fileName = `${submission.id}-${Date.now()}.${ext}`;
      const filePath = `recordings/${fileName}`;
      
      // 업로드 재시도 로직 (최대 3회)
      let uploadError: any = null;
      for (let attempt = 1; attempt <= 3; attempt++) {
        const { error } = await supabase.storage
          .from("rt-recordings")
          .upload(filePath, finalBlob, {
            contentType: ext === "wav" ? "audio/wav" : finalBlob.type || "audio/webm",
            upsert: true,
          });
        
        if (!error) {
          uploadError = null;
          break;
        }
        uploadError = error;
        console.warn(`[Upload] Attempt ${attempt} failed:`, error.message);
        if (attempt < 3) {
          await new Promise(r => setTimeout(r, 1000 * attempt));
        }
      }
      
      if (uploadError) throw new Error(`파일 업로드에 실패했습니다: ${uploadError.message}`);

      setUploadStage("저장 중...");
      setUploadProgress(80);
      
      const { data: urlData } = supabase.storage
        .from("rt-recordings")
        .getPublicUrl(filePath);
      
      const recordingUrl = urlData.publicUrl;
      
      // DB 저장도 최대 3회 재시도 (네트워크 불안정 대비)
      let saveError: any = null;
      for (let attempt = 1; attempt <= 3; attempt++) {
        const { error: upErr } = await supabase.from("homework_submissions").update({
          status: "completed",
          submitted_at: new Date().toISOString(),
          recording_timestamps: data.timestamps as any,
          recording_url: recordingUrl,
        }).eq("id", submission.id);
        if (!upErr) {
          saveError = null;
          break;
        }
        saveError = upErr;
        console.warn(`[Save] Attempt ${attempt} failed:`, upErr.message);
        if (attempt < 3) await new Promise(r => setTimeout(r, 1000 * attempt));
      }
      const error = saveError;

      
      if (error) throw error;

      // 자동 다음 회차 생성 (최대 3회차)
      // 빈 회차(pending)가 있으면 그 회차를 우선 채우고, 없으면 다음 회차 생성
      try {
        const currentHomework = submission.homework;
        const currentRound = (currentHomework as any)?.round || 1;
        
        if (currentRound < 3 && currentHomework?.passage_id) {
          // 이 학생의 같은 지문에 대해 아직 pending인 회차가 있는지 확인
          const { data: pendingSubmissions } = await supabase
            .from("homework_submissions")
            .select("id, homework:homework_id(id, round)")
            .eq("student_id", submission.student_id)
            .eq("status", "pending")
            .eq("homework.passage_id", currentHomework.passage_id)
            .eq("homework.type", "rt_review");
          
          const hasPendingLowerOrEqual = pendingSubmissions?.some((ps: any) => {
            const r = ps.homework?.round;
            return r && r <= 3 && r !== currentRound;
          });
          
          // 이미 pending인 다른 회차가 있으면 새로 만들지 않음
          if (hasPendingLowerOrEqual) {
            // 기존 pending 회차가 있으므로 스킵
          } else {
          const nextRound = currentRound + 1;
          const studentId = submission.student_id;
          
          // 다음 회차 homework가 이미 있는지 확인
          let query = supabase
            .from("homework")
            .select("id")
            .eq("passage_id", currentHomework.passage_id)
            .eq("type", "rt_review")
            .eq("round", nextRound);
          
          if (currentHomework.target_grade_id) {
            query = query.eq("target_grade_id", currentHomework.target_grade_id);
          }
          if (currentHomework.homework_group_id) {
            query = query.eq("homework_group_id", currentHomework.homework_group_id);
          }
          
          const { data: existingNext } = await query.limit(1);
          
          let nextHomeworkId: string;
          
          if (existingNext && existingNext.length > 0) {
            nextHomeworkId = existingNext[0].id;
          } else {
            // 다음 회차 homework 생성
            const { data: newHw, error: hwErr } = await supabase
              .from("homework")
              .insert({
                title: currentHomework.title,
                type: "rt_review",
                target_type: currentHomework.target_type || "grade",
                target_grade_id: currentHomework.target_grade_id,
                passage_id: currentHomework.passage_id,
                due_date: currentHomework.due_date,
                owner_code_id: currentHomework.owner_code_id,
                homework_group_id: currentHomework.homework_group_id,
                round: nextRound,
              })
              .select("id")
              .single();
            if (hwErr) throw hwErr;
            nextHomeworkId = newHw.id;
          }
          
          // 이 학생의 다음 회차 submission이 있는지 확인
          const { data: existingSub } = await supabase
            .from("homework_submissions")
            .select("id")
            .eq("homework_id", nextHomeworkId)
            .eq("student_id", studentId)
            .limit(1);
          
          if (!existingSub || existingSub.length === 0) {
            await supabase.from("homework_submissions").insert({
              homework_id: nextHomeworkId,
              student_id: studentId,
              status: "pending",
            });
          }
          } // end else (no pending lower rounds)
        }
      } catch (nextRoundErr) {
        console.warn("다음 회차 자동 생성 실패 (무시):", nextRoundErr);
      }
      setUploadProgress(100);
      setUploadStage("완료!");
    },
    onSuccess: () => {
      setTimeout(() => {
        setUploadStage(null);
        setUploadProgress(0);
        toast.success("녹음 과제가 제출되었습니다! 🎙️");
        setShowKaraoke(false);
        onSuccess();
      }, 500);
    },
    onError: (error: Error) => {
      setUploadStage(null);
      setUploadProgress(0);
      setFailedMessage(error.message || "제출에 실패했습니다.");
      toast.error(error.message || "제출에 실패했습니다.");
    }
  });
  const handleSave = (audioBlob: Blob, sentenceTimestamps: Sentence[]) => {
    // 실패 시 재시도를 위해 녹음 데이터를 보관 (녹음이 사라지지 않도록)
    pendingPayloadRef.current = { audioBlob, timestamps: sentenceTimestamps };
    setFailedMessage(null);
    submitMutation.mutate({
      audioBlob,
      timestamps: sentenceTimestamps
    });
  };
  const handleRetry = () => {
    const payload = pendingPayloadRef.current;
    if (!payload) return;
    setFailedMessage(null);
    submitMutation.mutate(payload);
  };
  const handleClose = () => {
    setShowKaraoke(false);
    onOpenChange(false);
  };

  // 업로드 진행 / 실패 오버레이 (녹음 화면은 그대로 유지 → 녹음 데이터 보존)
  const overlay = uploadStage ? (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="glass-panel rounded-[28px] p-8 max-w-xs w-full mx-4 text-center space-y-5">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            {uploadProgress >= 100 ? (
              <span className="text-3xl">✅</span>
            ) : (
              <span className="text-3xl animate-pulse">🎙️</span>
            )}
          </div>
          <div>
            <p className="font-semibold text-foreground text-lg">{uploadStage}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {uploadProgress < 30 ? "녹음 파일을 준비하고 있어요" : 
               uploadProgress < 80 ? "서버에 파일을 전송하고 있어요" :
               uploadProgress < 100 ? "과제 정보를 저장하고 있어요" : "제출 완료!"}
            </p>
          </div>
          <Progress value={uploadProgress} className="h-2" />
          <p className="text-xs text-muted-foreground/60">잠시만 기다려주세요</p>
        </div>
      </div>
  ) : failedMessage ? (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="glass-panel rounded-[28px] p-7 max-w-xs w-full mx-4 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <div>
            <p className="font-semibold text-foreground">제출에 실패했어요</p>
            <p className="text-sm text-muted-foreground mt-1 break-all">{failedMessage}</p>
            <p className="text-sm text-muted-foreground mt-2">
              녹음은 그대로 보관되어 있어요. 다시 시도해 주세요.
            </p>
          </div>
          <div className="space-y-2">
            <button
              onClick={handleRetry}
              className="toss-primary-btn w-full h-12 rounded-2xl font-semibold"
            >
              다시 제출하기
            </button>
            <button
              onClick={() => setFailedMessage(null)}
              className="w-full py-2 text-muted-foreground font-medium"
            >
              녹음 화면으로 돌아가기
            </button>
          </div>
        </div>
      </div>
  ) : null;

  // 노래방 모드 표시 (업로드 중에도 유지 → 실패해도 녹음 유실 없음)
  if (showKaraoke && sentences.length > 0) {
    return (
      <>
        <KaraokeRecorder title={title} sentences={sentences} onSave={handleSave} onClose={handleClose} />
        {overlay}
      </>
    );
  }
  if (overlay) return overlay;

  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm p-0 rounded-[32px] border-0 glass-panel max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="px-6 pt-8 pb-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[13px] font-semibold mb-3">
            <Mic className="w-3.5 h-3.5" />
            녹음 과제
          </div>
          <h2 className="text-[22px] font-bold text-foreground leading-tight break-all">
            {submission?.homework?.title}
          </h2>
        </div>

        {/* 컨텐츠 */}
        <div className="px-6">
          {/* 지문 미리보기 */}
          {sentences.length > 0 && (
            <div className="glass-card rounded-2xl p-5">
              <p className="text-[13px] font-semibold text-muted-foreground mb-3 break-all">{title}</p>
              <div className="space-y-4">
                {sentences.slice(0, 3).map((sentence: string, i: number) => (
                  <div key={i} className="flex gap-3">
                    <span className="text-primary font-bold flex-shrink-0 text-[15px]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="text-foreground text-[16px] leading-relaxed font-medium flex-1">
                      {sentence}
                    </p>
                  </div>
                ))}
                {sentences.length > 3 && (
                  <p className="text-[14px] text-muted-foreground pl-8">
                    외 {sentences.length - 3}개 문장
                  </p>
                )}
              </div>
            </div>
          )}

          {/* 안내 */}
          <div className="mt-4 flex items-start gap-2 px-1">
            <Info className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-[14px] text-muted-foreground">
              한 지문당 <span className="text-primary font-semibold">1분 40초 이내</span>로 녹음하세요.
            </p>
          </div>
        </div>

        {/* 버튼 */}
        <div className="p-6 space-y-3">
          <button
            onClick={() => setShowKaraoke(true)}
            className="toss-primary-btn w-full py-4 rounded-2xl font-bold text-[17px] flex items-center justify-center gap-2"
          >
            <Mic className="w-5 h-5" />
            녹음 시작하기
          </button>
          <button
            onClick={() => onOpenChange(false)}
            className="w-full py-3 text-muted-foreground hover:text-foreground font-medium text-[15px] transition-colors"
          >
            다음에 할게요
          </button>
        </div>
      </DialogContent>
    </Dialog>;
}
