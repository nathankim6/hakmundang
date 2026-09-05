import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { SchoolData, SCHOOL_ICONS } from "./SchoolForm";
import { Plus, X, Save } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EditReportDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  reportId: string;
  reportTitle: string;
  initialData: SchoolData[];
  onSave: (id: string, title: string, data: SchoolData[]) => Promise<void>;
}

const ICON_KEYS = ["school", "graduationCap", "bookOpen", "library"];

export const EditReportDialog = ({
  isOpen,
  onOpenChange,
  reportId,
  reportTitle: initialTitle,
  initialData,
  onSave,
}: EditReportDialogProps) => {
  const [title, setTitle] = useState(initialTitle);
  const [schoolsData, setSchoolsData] = useState<SchoolData[]>(initialData);
  const [isSaving, setIsSaving] = useState(false);

  const addSchool = () => {
    const newSchool: SchoolData = {
      name: `새 학교 ${schoolsData.length + 1}`,
      icon: ICON_KEYS[schoolsData.length % ICON_KEYS.length],
      averageScore: 0,
      A: 0,
      B: 0,
      C: 0,
      D: 0,
      E: 0,
    };
    setSchoolsData([...schoolsData, newSchool]);
    toast.success("학교가 추가되었습니다");
  };

  const removeSchool = (index: number) => {
    if (schoolsData.length <= 1) {
      toast.error("최소 1개의 학교는 필요합니다");
      return;
    }
    setSchoolsData(schoolsData.filter((_, i) => i !== index));
    toast.success("학교가 삭제되었습니다");
  };

  const handleNameChange = (index: number, value: string) => {
    const newData = [...schoolsData];
    newData[index].name = value;
    setSchoolsData(newData);
  };

  const handleIconChange = (index: number, value: string) => {
    const newData = [...schoolsData];
    newData[index].icon = value;
    setSchoolsData(newData);
  };

  const handleAverageScoreChange = (index: number, value: string) => {
    const newData = [...schoolsData];
    newData[index].averageScore = parseFloat(value) || 0;
    setSchoolsData(newData);
  };

  const handleGradeChange = (
    index: number,
    grade: "A" | "B" | "C" | "D" | "E",
    value: string
  ) => {
    const numValue = parseFloat(value) || 0;
    const newData = [...schoolsData];
    newData[index][grade] = numValue;

    if (grade !== "E") {
      const total =
        newData[index].A +
        newData[index].B +
        newData[index].C +
        newData[index].D;
      newData[index].E = Math.max(0, 100 - total);
    }

    setSchoolsData(newData);
  };

  const handleLogoUpload = (index: number, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const newData = [...schoolsData];
      newData[index].logoUrl = reader.result as string;
      setSchoolsData(newData);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("리포트 제목을 입력해주세요");
      return;
    }

    for (let i = 0; i < schoolsData.length; i++) {
      const school = schoolsData[i];
      const total = school.A + school.B + school.C + school.D + school.E;
      if (Math.abs(total - 100) > 0.1) {
        toast.error(
          `${school.name}의 비율 합계가 100%가 아닙니다 (현재: ${total.toFixed(1)}%)`
        );
        return;
      }
    }

    setIsSaving(true);
    try {
      await onSave(reportId, title, schoolsData);
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-xl border-2 shadow-[var(--shadow-premium)]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tight">
            리포트 편집
          </DialogTitle>
          <DialogDescription className="text-base">
            학교 데이터를 수정하거나 새 학교를 추가하세요
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 리포트 제목 */}
          <div className="space-y-2">
            <Label className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
              리포트 제목
            </Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-2 focus:border-primary/50 font-medium text-base"
              placeholder="리포트 제목"
            />
          </div>

          {/* 학교 추가 버튼 */}
          <div className="flex justify-end">
            <Button
              onClick={addSchool}
              variant="outline"
              className="gap-2 border-2 hover:bg-primary/5 hover:border-primary/30 font-bold"
            >
              <Plus className="w-4 h-4" />
              학교 추가
            </Button>
          </div>

          {/* 학교 목록 */}
          <div className="grid gap-4 md:grid-cols-2">
            {schoolsData.map((school, index) => {
              const IconComponent = SCHOOL_ICONS[school.icon];
              const total = school.A + school.B + school.C + school.D + school.E;
              const isValid = Math.abs(total - 100) < 0.1;

              return (
                <Card
                  key={index}
                  className="relative p-5 bg-gradient-to-br from-card to-muted/20 border-2 border-border/50 hover:border-primary/20 transition-all"
                >
                  <Button
                    onClick={() => removeSchool(index)}
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <X className="w-4 h-4" />
                  </Button>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center overflow-hidden border-2 border-primary/20">
                      {school.logoUrl ? (
                        <img
                          src={school.logoUrl}
                          alt={school.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        IconComponent && <IconComponent className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <Input
                        value={school.name}
                        onChange={(e) => handleNameChange(index, e.target.value)}
                        className="font-bold text-lg border-2 border-input focus:border-primary/50"
                        placeholder="학교 이름"
                      />
                      <div className="flex gap-2">
                        <Select
                          value={school.icon}
                          onValueChange={(v) => handleIconChange(index, v)}
                        >
                          <SelectTrigger className="flex-1 border-2 border-input font-medium text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-popover/95 backdrop-blur-lg border-2 z-50">
                            {Object.entries(SCHOOL_ICONS).map(([key, Icon]) => (
                              <SelectItem key={key} value={key}>
                                <div className="flex items-center gap-2">
                                  <Icon className="w-4 h-4" />
                                  <span className="capitalize">{key}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleLogoUpload(index, file);
                            }}
                          />
                          <div className="px-3 py-2 bg-secondary text-secondary-foreground rounded-lg hover:shadow-md transition-all text-xs font-bold whitespace-nowrap border border-secondary/20">
                            로고
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* 등급 입력 */}
                  <div className="grid grid-cols-5 gap-2">
                    {(["A", "B", "C", "D", "E"] as const).map((grade) => (
                      <div key={grade} className="space-y-1">
                        <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                          {grade}
                        </Label>
                        <div className="relative">
                          <Input
                            type="number"
                            step="0.1"
                            min="0"
                            max="100"
                            value={school[grade] === 0 ? "" : school[grade]}
                            onChange={(e) =>
                              handleGradeChange(index, grade, e.target.value)
                            }
                            className={`pr-5 text-sm border-2 font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                              grade === "E"
                                ? "bg-muted/50 text-muted-foreground border-muted"
                                : "bg-background border-input focus:border-primary/50"
                            }`}
                            placeholder="0"
                            disabled={grade === "E"}
                          />
                          <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                            %
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 평균 점수 */}
                  <div className="mt-3 space-y-1">
                    <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      평균 점수
                    </Label>
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={school.averageScore === 0 ? "" : school.averageScore}
                        onChange={(e) =>
                          handleAverageScoreChange(index, e.target.value)
                        }
                        className="pr-6 border-2 border-input focus:border-primary/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none font-bold text-sm"
                        placeholder="평균 점수"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                        점
                      </span>
                    </div>
                  </div>

                  {/* 합계 표시 */}
                  <div className="mt-3 p-2 bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg border border-border/50">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold text-foreground">합계</span>
                      <span
                        className={`font-black ${
                          isValid ? "text-secondary" : "text-destructive"
                        }`}
                      >
                        {total.toFixed(1)}% {isValid ? "✓" : "⚠️"}
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* 저장 버튼 */}
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-gradient-to-r from-primary to-primary-glow hover:from-primary hover:to-primary shadow-[var(--shadow-elegant)] font-bold text-base py-6 gap-2"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "저장 중..." : "변경사항 저장"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
