import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SchoolData } from "./SchoolForm";
import { Save, FolderOpen, Trash2, RefreshCw, Pencil } from "lucide-react";
import { EditReportDialog } from "./EditReportDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Report {
  id: string;
  title: string;
  schools: SchoolData[];
  created_at: string;
  updated_at: string;
}

interface ReportManagerProps {
  currentData: SchoolData[] | null;
  onLoadReport: (data: SchoolData[]) => void;
  currentReportId?: string;
  onReportSaved?: (id: string) => void;
}

export const ReportManager = ({ currentData, onLoadReport, currentReportId, onReportSaved }: ReportManagerProps) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [reportTitle, setReportTitle] = useState("");
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isLoadDialogOpen, setIsLoadDialogOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<Report | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReports((data || []).map(report => ({
        ...report,
        schools: report.schools as unknown as SchoolData[]
      })));
    } catch (error) {
      console.error("Error loading reports:", error);
      toast.error("리포트를 불러오는데 실패했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  const saveReport = async () => {
    if (!currentData) {
      toast.error("저장할 데이터가 없습니다");
      return;
    }

    if (!reportTitle.trim()) {
      toast.error("리포트 제목을 입력해주세요");
      return;
    }

    setIsLoading(true);
    try {
      if (currentReportId) {
        // 기존 리포트 업데이트
        const { error } = await supabase
          .from("reports")
          .update({
            title: reportTitle,
            schools: currentData as any,
          })
          .eq("id", currentReportId);

        if (error) throw error;
        toast.success("리포트가 수정되었습니다");
      } else {
        // 새 리포트 저장
        const { data, error } = await supabase
          .from("reports")
          .insert({
            title: reportTitle,
            schools: currentData as any,
          })
          .select()
          .single();

        if (error) throw error;
        if (data && onReportSaved) {
          onReportSaved(data.id);
        }
        toast.success("리포트가 저장되었습니다");
      }

      setReportTitle("");
      setIsSaveDialogOpen(false);
      loadReports();
    } catch (error) {
      console.error("Error saving report:", error);
      toast.error("리포트 저장에 실패했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  const loadReport = (report: Report) => {
    onLoadReport(report.schools);
    if (onReportSaved) {
      onReportSaved(report.id);
    }
    setReportTitle(report.title);
    setIsLoadDialogOpen(false);
    toast.success(`"${report.title}" 리포트를 불러왔습니다`);
  };

  const deleteReport = async (id: string, title: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("reports")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success(`"${title}" 리포트가 삭제되었습니다`);
      loadReports();
    } catch (error) {
      console.error("Error deleting report:", error);
      toast.error("리포트 삭제에 실패했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSave = async (id: string, title: string, data: SchoolData[]) => {
    try {
      const { error } = await supabase
        .from("reports")
        .update({
          title,
          schools: data as any,
        })
        .eq("id", id);

      if (error) throw error;
      toast.success("리포트가 수정되었습니다");
      loadReports();
      onLoadReport(data);
      if (onReportSaved) {
        onReportSaved(id);
      }
    } catch (error) {
      console.error("Error updating report:", error);
      toast.error("리포트 수정에 실패했습니다");
      throw error;
    }
  };

  return (
    <div className="flex gap-3">
      {/* 저장 버튼 */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="default"
            className="gap-2 bg-white/15 backdrop-blur-sm hover:bg-white/25 text-black border-2 border-white/20 hover:border-white/30 font-bold transition-all duration-300 shadow-lg"
            disabled={!currentData || isLoading}
          >
            <Save className="w-4 h-4" />
            {currentReportId ? "수정하기" : "저장하기"}
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-card/95 backdrop-blur-xl border-2 shadow-[var(--shadow-premium)]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tight">리포트 {currentReportId ? "수정" : "저장"}</DialogTitle>
            <DialogDescription className="text-base">
              리포트의 제목을 입력하고 저장하세요
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-6">
            <div className="space-y-3">
              <Label htmlFor="title" className="text-sm font-bold uppercase tracking-wide text-muted-foreground">리포트 제목</Label>
              <Input
                id="title"
                placeholder="예: 2024년 3월 성취도 분석"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                className="border-2 focus:border-primary/50 font-medium text-base"
              />
            </div>
            <Button onClick={saveReport} disabled={isLoading} className="w-full bg-gradient-to-r from-primary to-primary-glow hover:from-primary hover:to-primary shadow-[var(--shadow-elegant)] font-bold text-base py-6">
              {isLoading ? "저장 중..." : "저장"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 불러오기 버튼 */}
      <Dialog open={isLoadDialogOpen} onOpenChange={setIsLoadDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            className="gap-2 bg-white/15 backdrop-blur-sm hover:bg-white/25 text-black border-2 border-white/20 hover:border-white/30 font-bold transition-all duration-300 shadow-lg" 
            disabled={isLoading}
          >
            <FolderOpen className="w-4 h-4" />
            저장된 자료
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-card/95 backdrop-blur-xl border-2 shadow-[var(--shadow-premium)]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tight">저장된 리포트</DialogTitle>
            <DialogDescription className="text-base">
              불러올 리포트를 선택하세요
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-6">
            {isLoading ? (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-primary" />
                <p className="text-muted-foreground font-medium">불러오는 중...</p>
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-2xl flex items-center justify-center">
                  <FolderOpen className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-medium">저장된 리포트가 없습니다</p>
              </div>
            ) : (
              reports.map((report) => (
                <Card key={report.id} className="p-5 bg-gradient-to-br from-card to-muted/20 border-2 hover:border-primary/20 hover:shadow-[var(--shadow-elegant)] transition-all duration-300 group">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors truncate">{report.title}</h4>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground font-medium">
                          생성: {new Date(report.created_at).toLocaleDateString("ko-KR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        {report.updated_at !== report.created_at && (
                          <p className="text-xs text-muted-foreground">
                            수정: {new Date(report.updated_at).toLocaleDateString("ko-KR", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        onClick={() => loadReport(report)}
                        disabled={isLoading}
                        className="bg-gradient-to-r from-primary to-primary-glow hover:from-primary hover:to-primary font-bold px-5"
                      >
                        불러오기
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setEditingReport(report);
                        }}
                        disabled={isLoading}
                        className="font-bold px-4 gap-1"
                      >
                        <Pencil className="w-3 h-3" />
                        편집
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={isLoading}
                            className="font-bold px-4"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-card/95 backdrop-blur-xl border-2 shadow-[var(--shadow-premium)]">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-2xl font-black tracking-tight">리포트 삭제</AlertDialogTitle>
                            <AlertDialogDescription className="text-base">
                              &quot;{report.title}&quot; 리포트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="font-bold">취소</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteReport(report.id, report.title)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold"
                            >
                              삭제
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* 편집 다이얼로그 */}
      {editingReport && (
        <EditReportDialog
          isOpen={!!editingReport}
          onOpenChange={(open) => !open && setEditingReport(null)}
          reportId={editingReport.id}
          reportTitle={editingReport.title}
          initialData={editingReport.schools}
          onSave={handleEditSave}
        />
      )}
    </div>
  );
};
