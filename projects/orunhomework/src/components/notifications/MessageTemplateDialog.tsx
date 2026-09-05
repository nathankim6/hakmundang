import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
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
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Settings, Save, RotateCcw, Info, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface MessageTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface MessageTemplates {
  brandPrefix: string;
  dailyWordReview: string;
  reviewTaskReview: string;
}

const DEFAULT_TEMPLATES: MessageTemplates = {
  brandPrefix: "[오런잉글리쉬]",
  dailyWordReview: "{studentName} 학생의 일일 단어과제 검토가 완료되었습니다.",
  reviewTaskReview: "{studentName} 학생의 리뷰 과제 검토가 완료되었습니다.",
};

const SETTINGS_KEY = "message_templates";

export async function getMessageTemplates(ownerCodeId?: string | null): Promise<MessageTemplates> {
  try {
    let query = supabase
      .from("app_settings")
      .select("value")
      .eq("key", SETTINGS_KEY);

    if (ownerCodeId) {
      query = query.eq("owner_code_id", ownerCodeId);
    } else {
      query = query.is("owner_code_id", null);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      console.error("Failed to load templates:", error);
      return DEFAULT_TEMPLATES;
    }

    if (data?.value) {
      return { ...DEFAULT_TEMPLATES, ...JSON.parse(data.value) };
    }
  } catch (e) {
    console.error("Failed to load templates:", e);
  }
  return DEFAULT_TEMPLATES;
}

export async function saveMessageTemplates(templates: MessageTemplates, ownerCodeId?: string | null): Promise<void> {
  let query = supabase
    .from("app_settings")
    .select("id")
    .eq("key", SETTINGS_KEY);

  if (ownerCodeId) {
    query = query.eq("owner_code_id", ownerCodeId);
  } else {
    query = query.is("owner_code_id", null);
  }

  const { data: existing } = await query.maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("app_settings")
      .update({ value: JSON.stringify(templates), updated_at: new Date().toISOString() })
      .eq("id", existing.id);
    if (error) {
      console.error("Failed to update templates:", error);
      throw error;
    }
  } else {
    const insertData: any = { key: SETTINGS_KEY, value: JSON.stringify(templates) };
    if (ownerCodeId) insertData.owner_code_id = ownerCodeId;
    const { error } = await supabase
      .from("app_settings")
      .insert(insertData);
    if (error) {
      console.error("Failed to insert templates:", error);
      throw error;
    }
  }
}

export function formatMessage(template: string, variables: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, "g"), value);
  }
  return result;
}

export function MessageTemplateDialog({ open, onOpenChange }: MessageTemplateDialogProps) {
  const [templates, setTemplates] = useState<MessageTemplates>(DEFAULT_TEMPLATES);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { session } = useAuth();
  const ownerCodeId = session?.accessCodeId;

  useEffect(() => {
    if (open) {
      setIsLoading(true);
      getMessageTemplates(ownerCodeId)
        .then(setTemplates)
        .finally(() => setIsLoading(false));
    }
  }, [open, ownerCodeId]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveMessageTemplates(templates, ownerCodeId);
      toast.success("메시지 템플릿이 저장되었습니다.");
      onOpenChange(false);
    } catch (error) {
      toast.error("템플릿 저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setTemplates(DEFAULT_TEMPLATES);
    toast.info("기본값으로 초기화되었습니다. 저장을 눌러 적용하세요.");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            메시지 템플릿 설정
          </DialogTitle>
          <DialogDescription>
            알림 발송 시 사용되는 기본 메시지 포맷을 수정합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 안내 */}
          <Card className="bg-muted/50 border-dashed">
            <CardContent className="pt-4">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 mt-0.5 text-primary" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">사용 가능한 변수:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li><code className="bg-muted px-1 rounded">{"{studentName}"}</code> - 학생 이름</li>
                  </ul>
                  <p className="text-xs mt-2">
                    * 선생님 피드백이 있으면 메시지 끝에 자동으로 추가됩니다.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 브랜드 접두어 */}
          <div className="space-y-2">
            <Label>메시지 접두어 (브랜드명)</Label>
            <Input
              value={templates.brandPrefix}
              onChange={(e) =>
                setTemplates((prev) => ({ ...prev, brandPrefix: e.target.value }))
              }
              placeholder="예: [오런잉글리쉬]"
            />
            <p className="text-xs text-muted-foreground">
              모든 메시지 앞에 자동으로 추가됩니다.
            </p>
          </div>

          {/* 일일 단어과제 템플릿 */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-primary" />
              일일 단어과제 검토 완료 메시지
            </Label>
            <Textarea
              value={templates.dailyWordReview}
              onChange={(e) =>
                setTemplates((prev) => ({ ...prev, dailyWordReview: e.target.value }))
              }
              placeholder="예: {studentName} 학생의 일일 단어과제 검토가 완료되었습니다."
              className="min-h-[80px]"
            />
            <p className="text-xs text-muted-foreground">
              미리보기: {templates.brandPrefix} {formatMessage(templates.dailyWordReview, { studentName: "홍길동" })}
            </p>
          </div>

          {/* 리뷰 과제 템플릿 */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-accent" />
              리뷰 과제 검토 완료 메시지
            </Label>
            <Textarea
              value={templates.reviewTaskReview}
              onChange={(e) =>
                setTemplates((prev) => ({ ...prev, reviewTaskReview: e.target.value }))
              }
              placeholder="예: {studentName} 학생의 리뷰 과제 검토가 완료되었습니다."
              className="min-h-[80px]"
            />
            <p className="text-xs text-muted-foreground">
              미리보기: {templates.brandPrefix} {formatMessage(templates.reviewTaskReview, { studentName: "홍길동" })}
            </p>
          </div>

          {/* 버튼 */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              기본값으로 초기화
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                취소
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                저장
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
