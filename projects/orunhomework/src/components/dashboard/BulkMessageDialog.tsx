import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Send, User, Phone, Users } from "lucide-react";
import { getMessageTemplates } from "@/components/notifications/MessageTemplateDialog";

interface StudentInfo {
  id: string;
  name: string;
  studentPhone?: string | null;
  parentPhone?: string | null;
}

interface BulkMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  students: StudentInfo[];
}

export function BulkMessageDialog({ open, onOpenChange, students }: BulkMessageDialogProps) {
  const [message, setMessage] = useState("");
  const [recipientType, setRecipientType] = useState<"student" | "parent">("student");
  const queryClient = useQueryClient();
  const { session } = useAuth();

  const eligibleStudents = students.filter(s => 
    recipientType === "student" ? !!s.studentPhone : !!s.parentPhone
  );
  const ineligibleCount = students.length - eligibleStudents.length;

  const handleSend = async () => {
    if (!message.trim() || eligibleStudents.length === 0) return;

    const count = eligibleStudents.length;
    const savedMessage = message;
    const savedRecipientType = recipientType;
    const savedStudents = [...eligibleStudents];

    // 즉시 UI 닫기
    toast.success(`${count}명에게 메시지 발송 중...`);
    setMessage("");
    onOpenChange(false);

    // 백그라운드에서 발송 처리
    (async () => {
      try {
        const templates = await getMessageTemplates(session?.accessCodeId);
        let successCount = 0;
        let failCount = 0;

        for (const student of savedStudents) {
          try {
            const response = await supabase.functions.invoke("send-kakao-notification", {
              body: {
                studentId: student.id,
                studentName: student.name,
                submissionType: "manual",
                customMessage: savedMessage,
                brandPrefix: templates.brandPrefix,
                messageType: "sms",
                recipientType: savedRecipientType,
                ownerCodeId: session?.accessCodeId,
              },
            });
            if (response.data?.needsApiKey) {
              toast.error("🔑 솔라피 API 키가 설정되지 않았습니다.");
              return;
            }
            if (response.data?.insufficientBalance) {
              toast.error("💰 솔라피 잔액이 부족합니다.");
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

        if (failCount > 0) {
          toast.warning(`발송 완료: ${successCount}명 성공, ${failCount}명 실패`);
        } else {
          toast.success(`${successCount}명에게 메시지 발송 완료!`);
        }
        queryClient.invalidateQueries({ queryKey: ["notifications-history"] });
      } catch (error: any) {
        toast.error(error.message || "발송 중 오류가 발생했습니다");
      }
    })();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm p-0 overflow-hidden">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white text-sm">
              <Users className="w-4 h-4" />
              전체 학생에게 메시지 발송 ({students.length}명)
            </DialogTitle>
            <DialogDescription className="text-white/70 text-xs">
              밀린 과제가 있는 학생들에게 일괄 SMS 발송
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-medium">수신자</Label>
            <RadioGroup value={recipientType} onValueChange={(v) => setRecipientType(v as "student" | "parent")}>
              <div className="flex gap-3">
                <label className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors flex-1 ${
                  recipientType === "student" ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                }`}>
                  <RadioGroupItem value="student" className="sr-only" />
                  <User className="w-3.5 h-3.5" />
                  <div className="text-xs">
                    <div className="font-medium">학생</div>
                  </div>
                </label>
                <label className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors flex-1 ${
                  recipientType === "parent" ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                }`}>
                  <RadioGroupItem value="parent" className="sr-only" />
                  <Phone className="w-3.5 h-3.5" />
                  <div className="text-xs">
                    <div className="font-medium">학부모</div>
                  </div>
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
            <p>발송 대상: <span className="font-medium">{eligibleStudents.length}명</span></p>
            <div className="flex flex-wrap gap-1">
              {eligibleStudents.map(s => (
                <span key={s.id} className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-medium">
                  {s.name}
                </span>
              ))}
            </div>
            {ineligibleCount > 0 && (
              <p className="text-destructive">전화번호 미등록 ({ineligibleCount}명): {students.filter(s => recipientType === "student" ? !s.studentPhone : !s.parentPhone).map(s => s.name).join(", ")}</p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button
              size="sm"
              onClick={handleSend}
              disabled={!message.trim() || eligibleStudents.length === 0}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              {`${eligibleStudents.length}명에게 발송`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
