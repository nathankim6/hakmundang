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
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Send, AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface StudentWithCode {
  id: string;
  name: string;
  student_phone: string | null;
  access_codes: {
    code: string;
  } | null;
}

interface BulkAccessCodeSmsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schoolName: string;
  students: StudentWithCode[];
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

export function BulkAccessCodeSmsDialog({
  open,
  onOpenChange,
  schoolName,
  students,
}: BulkAccessCodeSmsDialogProps) {
  const { ownerCodeId } = useOwnerFilter();
  const [isSending, setIsSending] = useState(false);
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE);

  const sendableStudents = students.filter(
    (s) => s.student_phone && s.access_codes?.code
  );
  const noPhoneStudents = students.filter((s) => !s.student_phone);
  const noCodeStudents = students.filter(
    (s) => s.student_phone && !s.access_codes?.code
  );

  const previewMessage = `[옳은영어]\n${buildMessage(template, "(학생이름)", "(개인코드)")}`;

  const handleSend = async () => {
    if (sendableStudents.length === 0) return;

    setIsSending(true);
    let successCount = 0;
    let failCount = 0;

    for (const student of sendableStudents) {
      try {
        const messageBody = buildMessage(template, student.name, student.access_codes!.code);

        const { data, error } = await supabase.functions.invoke(
          "send-kakao-notification",
          {
            body: {
              studentId: student.id,
              studentName: student.name,
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
          successCount++;
        } else if (data?.needsApiKey) {
          toast.error("솔라피 API 키가 설정되지 않았습니다.");
          setIsSending(false);
          return;
        } else if (data?.insufficientBalance) {
          toast.error("솔라피 잔액이 부족합니다.");
          setIsSending(false);
          return;
        } else {
          failCount++;
        }
      } catch {
        failCount++;
      }
    }

    setIsSending(false);
    onOpenChange(false);

    if (successCount > 0) {
      toast.success(`${successCount}명에게 접속코드 문자를 발송했습니다.`);
    }
    if (failCount > 0) {
      toast.error(`${failCount}명에게 발송 실패했습니다.`);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            접속코드 일괄 문자 발송
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                <span className="font-semibold text-foreground">{schoolName}</span>의
                모든 학생에게 사이트 주소와 개인 접속코드를 문자로 발송합니다.
              </p>

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

              <div className="flex flex-wrap gap-2">
                <Badge variant="default">
                  발송 대상: {sendableStudents.length}명
                </Badge>
                {noPhoneStudents.length > 0 && (
                  <Badge variant="destructive">
                    연락처 없음: {noPhoneStudents.length}명
                  </Badge>
                )}
                {noCodeStudents.length > 0 && (
                  <Badge variant="secondary">
                    접속코드 없음: {noCodeStudents.length}명
                  </Badge>
                )}
              </div>

              {(noPhoneStudents.length > 0 || noCodeStudents.length > 0) && (
                <div className="flex items-start gap-2 text-xs text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>
                    연락처 또는 접속코드가 없는 학생은 발송에서 제외됩니다.
                  </span>
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSending}>취소</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSend}
            disabled={isSending || sendableStudents.length === 0}
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                발송 중...
              </>
            ) : (
              `${sendableStudents.length}명에게 발송`
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
