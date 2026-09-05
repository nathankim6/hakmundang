import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Send, User, Phone } from "lucide-react";
import { getMessageTemplates } from "@/components/notifications/MessageTemplateDialog";
import { useAuth } from "@/contexts/AuthContext";

interface QuickMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  studentName: string;
  studentPhone?: string | null;
  parentPhone?: string | null;
}

export function QuickMessageDialog({ 
  open, 
  onOpenChange, 
  studentId, 
  studentName,
  studentPhone,
  parentPhone,
}: QuickMessageDialogProps) {
  const [message, setMessage] = useState("");
  const [recipientType, setRecipientType] = useState<"student" | "parent">("student");
  const queryClient = useQueryClient();
  const { session } = useAuth();

  const phoneNumber = recipientType === "student" ? studentPhone : parentPhone;
  const hasPhone = !!phoneNumber;

  const sendMutation = useMutation({
    mutationFn: async () => {
      const templates = await getMessageTemplates(session?.accessCodeId);

      const response = await supabase.functions.invoke("send-kakao-notification", {
        body: {
          studentId,
          studentName,
          submissionType: "manual",
          customMessage: message,
          brandPrefix: templates.brandPrefix,
          messageType: "sms",
          recipientType,
          ownerCodeId: session?.accessCodeId,
        },
      });

      if (response.data?.needsApiKey) {
        throw new Error("🔑 솔라피 API 키가 설정되지 않았습니다.\n[설정] → [솔라피 API 키 설정]에서 등록해주세요.");
      }
      if (response.data?.insufficientBalance) {
        throw new Error("💰 솔라피 잔액이 부족합니다.\n솔라피 콘솔에서 잔액을 충전해주세요.");
      }
      if (response.error || !response.data?.success) {
        throw new Error(response.error?.message || response.data?.error || "발송에 실패했습니다");
      }
      return response;
    },
    onSuccess: () => {
      toast.success(`${studentName}에게 메시지를 발송했습니다`);
      queryClient.invalidateQueries({ queryKey: ["notifications-history"] });
      setMessage("");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm p-0 overflow-hidden">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white text-sm">
              <Send className="w-4 h-4" />
              {studentName}에게 메시지 발송
            </DialogTitle>
            <DialogDescription className="text-white/70 text-xs">
              SMS로 메시지를 발송합니다
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
                  <RadioGroupItem value="student" id="q-student" className="sr-only" />
                  <User className="w-3.5 h-3.5" />
                  <div className="text-xs">
                    <div className="font-medium">학생</div>
                    {studentPhone ? (
                      <span className="text-muted-foreground">{studentPhone}</span>
                    ) : (
                      <span className="text-destructive">미등록</span>
                    )}
                  </div>
                </label>
                <label className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors flex-1 ${
                  recipientType === "parent" ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                }`}>
                  <RadioGroupItem value="parent" id="q-parent" className="sr-only" />
                  <Phone className="w-3.5 h-3.5" />
                  <div className="text-xs">
                    <div className="font-medium">학부모</div>
                    {parentPhone ? (
                      <span className="text-muted-foreground">{parentPhone}</span>
                    ) : (
                      <span className="text-destructive">미등록</span>
                    )}
                  </div>
                </label>
              </div>
            </RadioGroup>
          </div>

          {/* 메시지 입력 */}
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

          {!hasPhone && (
            <div className="p-2 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-[11px] text-destructive">
                선택한 수신자의 전화번호가 등록되어 있지 않습니다.
              </p>
            </div>
          )}

          {/* 발송 버튼 */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button
              size="sm"
              onClick={() => sendMutation.mutate()}
              disabled={!message.trim() || !hasPhone || sendMutation.isPending}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              {sendMutation.isPending ? "발송 중..." : "발송"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
