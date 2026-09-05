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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";

interface Grade {
  id: string;
  name: string;
  school?: {
    id: string;
    name: string;
  };
}

interface AddStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  grade: Grade | null;
}

export function AddStudentDialog({
  open,
  onOpenChange,
  grade,
}: AddStudentDialogProps) {
  const [name, setName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: async () => {
      if (!grade) throw new Error("학년 정보가 없습니다.");
      if (!name.trim()) throw new Error("학생 이름을 입력해주세요.");

      const { error } = await supabase
        .from("students")
        .insert({
          name: name.trim(),
          grade_id: grade.id,
          parent_phone: parentPhone.trim() || null,
          parent_email: parentEmail.trim() || null,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-submissions-status"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["all-students-with-grades"] });
      toast.success("학생이 추가되었습니다.");
      resetForm();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "학생 추가에 실패했습니다.");
    },
  });

  const resetForm = () => {
    setName("");
    setParentPhone("");
    setParentEmail("");
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      resetForm();
    }
    onOpenChange(isOpen);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMutation.mutate();
  };

  if (!grade) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            학생 추가
          </DialogTitle>
          <DialogDescription>
            {grade.school?.name} · {grade.name}에 새 학생을 추가합니다.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">학생 이름 *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="홍길동"
              required
              maxLength={50}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parentPhone">학생 연락처</Label>
            <Input
              id="parentPhone"
              type="tel"
              value={parentPhone}
              onChange={(e) => setParentPhone(e.target.value)}
              placeholder="010-1234-5678"
              maxLength={20}
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={addMutation.isPending || !name.trim()}
            >
              {addMutation.isPending ? "추가 중..." : "학생 추가"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
