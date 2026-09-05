import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useOwnerFilter } from "@/hooks/useOwnerFilter";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Send, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface IndividualAccessCodeSmsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentName: string;
  studentId: string;
  studentPhone: string | null;
  accessCode: string;
}

const SITE_URL = "https://orunhomework.com";

const DEFAULT_TEMPLATE = `안녕하세요, {학생이름} 학생!

숙제 사이트 주소: ${SITE_URL}
접속코드: {접속코드}

위 사이트에 접속하여 접속코드를 입력하면 로그인할 수 있습니다.`;

function buildMessage(template: string, studentName: string, accessCode: string): string {
  return template
    .replace(/\{학생이름\}/g, studentName)
    .replace(/\{접속코드\}/g, accessCode);
}

export function IndividualAccessCodeSmsDialog({
  open,
  onOpenChange,
  studentName,
  studentId,
  studentPhone,
  accessCode,
}: IndividualAccessCodeSmsDialogProps) {
  const { ownerCodeId } = useOwnerFilter();
  const [isSending, setIsSending] = useState(false);
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE);

  const previewMessage = `[옳은영어]\n${buildMessage(template, studentName, accessCode)}`;

  const handleSend = async () => {
    if (!studentPhone) return;

    setIsSending(true);
    try {
      const messageBody = buildMessage(template, studentName, accessCode);

      const { data, error } = await supabase.functions.invoke(
        "send-kakao-notification",
        {
          body: {
            studentId,
            studentName,
            submissionType: "manual",
            customMessage: messageBody,
            brandPrefix: "[옳은영어]",
            messageType: "sms",
            recipientType: "student",
            ownerCodeId,
          },
        }
      );

      if (error) throw error;

      if (data?.success) {
        toast.success(`${studentName} 학생에게 접속코드 문자를 발송했습니다.`);
        onOpenChange(false);
      } else if (data?.needsApiKey) {
        toast.error("솔라피 API 키가 설정되지 않았습니다.");
      } else if (data?.insufficientBalance) {
        toast.error("솔라피 잔액이 부족합니다.");
      } else {
        toast.error("발송에 실패했습니다.");
      }
    } catch {
      toast.error("발송 중 오류가 발생했습니다.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            접속코드 문자 발송
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                <span className="font-semibold text-foreground">{studentName}</span> 학생에게
                사이트 주소와 접속코드를 문자로 발송합니다.
              </p>

              {!studentPhone && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                  학생 연락처가 등록되어 있지 않습니다. 학생 정보를 수정하여 연락처를 등록해주세요.
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-foreground">
                    메시지 템플릿
                    <span className="ml-1.5 text-muted-foreground font-normal">
                      ({"{학생이름}"}, {"{접속코드}"} 자동 치환)
                    </span>
                  </Label>
                  {template !== DEFAULT_TEMPLATE && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs px-2"
                      onClick={() => setTemplate(DEFAULT_TEMPLATE)}
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      초기화
                    </Button>
                  )}
                </div>
                <Textarea
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  rows={6}
                  className="text-sm resize-none"
                />
              </div>

              <div className="rounded-lg border p-3 bg-muted/50 text-sm space-y-1">
                <p className="font-medium text-foreground text-xs">발송 미리보기:</p>
                <p className="text-muted-foreground whitespace-pre-line text-xs">
                  {previewMessage}
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSending}>취소</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSend}
            disabled={isSending || !studentPhone}
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                발송 중...
              </>
            ) : (
              "문자 발송"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
