import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Send, Users, User, Phone } from "lucide-react";
import { getMessageTemplates } from "@/components/notifications/MessageTemplateDialog";

interface StudentInfo {
  id: string;
  name: string;
  studentPhone?: string | null;
  parentPhone?: string | null;
}

interface BulkKakaoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  students: StudentInfo[];
}

export function BulkKakaoDialog({ open, onOpenChange, students }: BulkKakaoDialogProps) {
  const [sending, setSending] = useState(false);
  const [recipientType, setRecipientType] = useState<"student" | "parent">("student");
  const [message, setMessage] = useState("");
  const { session } = useAuth();

  const eligibleStudents = students.filter(s =>
    recipientType === "student" ? !!s.studentPhone : !!s.parentPhone
  );
  const ineligibleCount = students.length - eligibleStudents.length;
  const recipientLabel = recipientType === "student" ? "학생" : "학부모";

  const handleSend = async () => {
    if (eligibleStudents.length === 0 || !message.trim()) return;
    setSending(true);

    try {
      const templates = await getMessageTemplates(session?.accessCodeId);
      let successCount = 0;
      let failCount = 0;

      for (const student of eligibleStudents) {
        try {
          const response = await supabase.functions.invoke("send-kakao-notification", {
            body: {
              studentId: student.id,
              studentName: student.name,
              submissionType: "manual",
              customMessage: message,
              brandPrefix: templates.brandPrefix,
              messageType: "sms",
              recipientType,
              ownerCodeId: session?.accessCodeId,
            },
          });
          if (response.data?.needsApiKey) {
            toast.error("🔑 솔라피 API 키가 설정되지 않았습니다.\n[설정] → [솔라피 API 키 설정]에서 등록해주세요.");
            onOpenChange(false);
            return;
          }
          if (response.data?.insufficientBalance) {
            toast.error("💰 솔라피 잔액이 부족합니다.\n솔라피 콘솔에서 잔액을 충전해주세요.");
            onOpenChange(false);
            return;
          }
          if (response.error || !response.data?.success) {
            failCount++;
          } else {
            successCount++;
          }
        } catch {
          failCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount}명 ${recipientLabel}에게 발송 완료${failCount > 0 ? ` (${failCount}명 실패)` : ""}`);
      } else {
        toast.error("발송에 실패했습니다");
      }
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "발송 중 오류가 발생했습니다");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm p-0 overflow-hidden">
        <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 p-4 text-black">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-black text-sm">
              <Users className="w-4 h-4" />
              전체 카톡 발송 ({students.length}명)
            </DialogTitle>
            <DialogDescription className="text-black/60 text-xs">
              밀린 과제 내역을 일괄 발송합니다
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-4 space-y-4">
          {/* 수신자 선택 */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">수신자</Label>
            <RadioGroup value={recipientType} onValueChange={(v) => setRecipientType(v as "student" | "parent")}>
              <div className="flex gap-3">
                <label className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors flex-1 ${
                  recipientType === "student" ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                }`}>
                  <RadioGroupItem value="student" className="sr-only" />
                  <User className="w-3.5 h-3.5" />
                  <div className="text-xs font-medium">학생</div>
                </label>
                <label className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors flex-1 ${
                  recipientType === "parent" ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                }`}>
                  <RadioGroupItem value="parent" className="sr-only" />
                  <Phone className="w-3.5 h-3.5" />
                  <div className="text-xs font-medium">학부모</div>
                </label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium">메시지</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="메시지를 입력하세요..."
              className="min-h-[80px] text-sm"
            />
            <p className="text-[10px] text-muted-foreground">
              * 메시지 앞에 브랜드명이 자동으로 추가됩니다.
            </p>
          </div>

          <div className="p-2 rounded-lg bg-muted/50 border text-[11px] space-y-1.5">
            <p>발송 대상: <span className="font-medium">{eligibleStudents.length}명 {recipientLabel}</span></p>
            <div className="flex flex-wrap gap-1">
              {eligibleStudents.map(s => (
                <span key={s.id} className="px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-800 text-[10px] font-medium">
                  {s.name}
                </span>
              ))}
            </div>
            {ineligibleCount > 0 && (
              <p className="text-destructive">{recipientLabel} 연락처 미등록 ({ineligibleCount}명): {students.filter(s => recipientType === "student" ? !s.studentPhone : !s.parentPhone).map(s => s.name).join(", ")}</p>
            )}
          </div>


          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button
              size="sm"
              onClick={handleSend}
              disabled={!message.trim() || eligibleStudents.length === 0 || sending}
              className="bg-yellow-400 hover:bg-yellow-500 text-black"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              {sending ? "발송 중..." : `${eligibleStudents.length}명에게 발송`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
