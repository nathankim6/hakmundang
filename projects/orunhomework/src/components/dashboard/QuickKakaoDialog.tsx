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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Send, User, Phone } from "lucide-react";
import { getMessageTemplates } from "@/components/notifications/MessageTemplateDialog";
import iconKakao from "@/assets/icon-kakao.png";

interface QuickKakaoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  studentName: string;
  studentPhone?: string | null;
  parentPhone?: string | null;
}

export function QuickKakaoDialog({
  open,
  onOpenChange,
  studentId,
  studentName,
  studentPhone,
  parentPhone,
}: QuickKakaoDialogProps) {
  const [recipientType, setRecipientType] = useState<"student" | "parent">("student");
  const [message, setMessage] = useState("");
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
      const label = recipientType === "student" ? "학생" : "학부모";
      toast.success(`${studentName} ${label}에게 카톡 발송 완료!`);
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
        <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 p-4 text-black">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-black text-sm">
              <img src={iconKakao} alt="KakaoTalk" className="w-4 h-4 rounded-sm" />
              {studentName} 카톡 발송
            </DialogTitle>
            <DialogDescription className="text-black/60 text-xs">
              카카오톡으로 메시지를 발송합니다
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
                  <RadioGroupItem value="parent" className="sr-only" />
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

          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button
              size="sm"
              onClick={() => sendMutation.mutate()}
              disabled={!message.trim() || !hasPhone || sendMutation.isPending}
              className="bg-yellow-400 hover:bg-yellow-500 text-black"
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
