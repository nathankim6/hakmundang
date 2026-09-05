import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Send, Search, User, Phone, Building2, Check, MessageSquare } from "lucide-react";
import { getMessageTemplates } from "@/components/notifications/MessageTemplateDialog";
import { useAuth } from "@/contexts/AuthContext";

interface SendMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Student {
  id: string;
  name: string;
  student_phone: string | null;
  parent_phone: string | null;
  grade: {
    name: string;
    school: {
      name: string;
    };
  };
}

export function SendMessageDialog({ open, onOpenChange }: SendMessageDialogProps) {
  const { session } = useAuth();
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [messageType, setMessageType] = useState<"sms" | "kakao">("sms");
  const [recipientType, setRecipientType] = useState<"student" | "parent">("student");
  const queryClient = useQueryClient();

  // Fetch all students with grades
  const { data: students = [], isLoading } = useQuery({
    queryKey: ["students-for-messaging"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select(`
          id,
          name,
          student_phone,
          parent_phone,
          grade:grades(
            name,
            school:schools(name)
          )
        `)
        .order("name");

      if (error) throw error;
      return data as unknown as Student[];
    },
    enabled: open,
  });

  // Filter students by search
  const filteredStudents = useMemo(() => {
    if (!searchTerm) return students;
    const term = searchTerm.toLowerCase();
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        s.grade?.school?.name?.toLowerCase().includes(term) ||
        s.grade?.name?.toLowerCase().includes(term)
    );
  }, [students, searchTerm]);

  // Send messages mutation
  const sendMutation = useMutation({
    mutationFn: async () => {
      const selectedStudentData = students.filter((s) =>
        selectedStudents.includes(s.id)
      );

      // Get brand prefix from templates
      const templates = await getMessageTemplates(session?.accessCodeId);

       const results = await Promise.all(
         selectedStudentData.map(async (student) => {
           const response = await supabase.functions.invoke("send-kakao-notification", {
              body: {
                studentId: student.id,
                studentName: student.name,
                submissionType: "manual",
                customMessage: message,
                brandPrefix: templates.brandPrefix,
                messageType: messageType,
                kakaoChannelId: messageType === "kakao" ? localStorage.getItem("kakao_channel_id") || "" : undefined,
                recipientType: recipientType,
                ownerCodeId: session?.accessCodeId,
              },
            });
           return { student, response };
         })
       );

      const needsKey = results.find((r) => r.response.data?.needsApiKey);
      if (needsKey) {
        throw new Error("🔑 솔라피 API 키가 설정되지 않았습니다.\n[설정] → [솔라피 API 키 설정]에서 등록해주세요.");
      }

      const balanceIssue = results.find((r) => r.response.data?.insufficientBalance);
      if (balanceIssue) {
        throw new Error("💰 솔라피 잔액이 부족합니다.\n솔라피 콘솔에서 잔액을 충전해주세요.");
      }

      const failed = results.filter((r) => r.response.error || !r.response.data?.success);
      if (failed.length > 0) {
        const failedNames = failed.map((f) => f.student.name).join(", ");
        throw new Error(`일부 발송 실패: ${failedNames}`);
      }

      return results;
    },
    onSuccess: () => {
      toast.success(`${selectedStudents.length}명에게 메시지를 발송했습니다.`);
      queryClient.invalidateQueries({ queryKey: ["notifications-history"] });
      setSelectedStudents([]);
      setMessage("");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const toggleStudent = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const selectAll = () => {
    const allIds = filteredStudents.map((s) => s.id);
    setSelectedStudents(allIds);
  };

  const clearAll = () => {
    setSelectedStudents([]);
  };

  const hasPhoneSelected = students
    .filter((s) => selectedStudents.includes(s.id))
    .some((s) => recipientType === "student" ? s.student_phone : s.parent_phone);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            메시지 발송
          </DialogTitle>
          <DialogDescription>
            학생을 선택하고 메시지를 입력하여 학부모에게 발송합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 학생 검색 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="학생 이름, 학교, 학년으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* 선택 컨트롤 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={selectAll}>
                전체 선택
              </Button>
              <Button variant="ghost" size="sm" onClick={clearAll}>
                선택 해제
              </Button>
            </div>
            <Badge variant="secondary">
              {selectedStudents.length}명 선택됨
            </Badge>
          </div>

          {/* 학생 목록 */}
          <ScrollArea className="h-[200px] border rounded-lg">
            <div className="p-2 space-y-1">
              {isLoading ? (
                <div className="text-center py-4 text-muted-foreground">
                  로딩 중...
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  학생이 없습니다.
                </div>
              ) : (
                filteredStudents.map((student) => {
                  const isSelected = selectedStudents.includes(student.id);
                  const studentPhoneExists = !!student.student_phone;
                  const parentPhoneExists = !!student.parent_phone;

                  return (
                    <div
                      key={student.id}
                      onClick={() => toggleStudent(student.id)}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-primary/10 border border-primary/30"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded border flex items-center justify-center ${
                            isSelected
                              ? "bg-primary border-primary text-primary-foreground"
                              : "border-muted-foreground/30"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <User className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="font-medium text-sm">{student.name}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Building2 className="w-3 h-3" />
                            {student.grade?.school?.name} · {student.grade?.name}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-[10px] ${studentPhoneExists ? "bg-blue-500/10 text-blue-600 border-blue-500/30" : "bg-muted/50 text-muted-foreground border-muted-foreground/30"}`}>
                          학생 {studentPhoneExists ? "✓" : "✗"}
                        </Badge>
                        <Badge variant="outline" className={`text-[10px] ${parentPhoneExists ? "bg-success/10 text-success border-success/30" : "bg-muted/50 text-muted-foreground border-muted-foreground/30"}`}>
                          학부모 {parentPhoneExists ? "✓" : "✗"}
                        </Badge>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>


           {/* 수신자 선택 */}
           <div className="space-y-3">
             <Label>수신자 선택</Label>
             <RadioGroup value={recipientType} onValueChange={(value) => setRecipientType(value as "student" | "parent")}>
               <div className="flex items-center space-x-2">
                 <RadioGroupItem value="student" id="recipient-student" />
                 <Label htmlFor="recipient-student" className="font-normal cursor-pointer">
                   학생에게 발송
                 </Label>
               </div>
               <div className="flex items-center space-x-2">
                 <RadioGroupItem value="parent" id="recipient-parent" />
                 <Label htmlFor="recipient-parent" className="font-normal cursor-pointer">
                   학부모에게 발송
                 </Label>
               </div>
             </RadioGroup>
           </div>

           {/* 메시지 타입 선택 */}
           <div className="space-y-3">
             <Label>발송 방식</Label>
             <RadioGroup value={messageType} onValueChange={(value) => setMessageType(value as "sms" | "kakao")}>
               <div className="flex items-center space-x-2">
                 <RadioGroupItem value="sms" id="sms" />
                 <Label htmlFor="sms" className="font-normal cursor-pointer">
                   SMS 발송
                 </Label>
               </div>
               <div className="flex items-center space-x-2">
                 <RadioGroupItem value="kakao" id="kakao" />
                 <Label htmlFor="kakao" className="font-normal cursor-pointer flex items-center gap-2">
                   카카오톡 알림톡
                   {!localStorage.getItem("kakao_channel_id") && (
                     <span className="text-[10px] bg-warning/10 text-warning px-1.5 py-0.5 rounded">채널 ID 미설정</span>
                   )}
                 </Label>
               </div>
             </RadioGroup>
           </div>

           {/* 메시지 입력 */}
           <div className="space-y-2">
             <Label>메시지 내용</Label>
             <Textarea
               value={message}
               onChange={(e) => setMessage(e.target.value)}
               placeholder={recipientType === "student" ? "학생에게 발송할 메시지를 입력하세요..." : "학부모에게 발송할 메시지를 입력하세요..."}
               className="min-h-[100px]"
             />
             <p className="text-xs text-muted-foreground">
               * 메시지 앞에 자동으로 [Pcube]가 추가됩니다.
             </p>
           </div>

          {/* 발송 버튼 */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button
              onClick={() => sendMutation.mutate()}
              disabled={
                selectedStudents.length === 0 ||
                !message.trim() ||
                !hasPhoneSelected ||
                sendMutation.isPending
              }
            >
              <Send className="w-4 h-4 mr-2" />
              {sendMutation.isPending
                ? "발송 중..."
                : `${selectedStudents.length}명에게 발송`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
