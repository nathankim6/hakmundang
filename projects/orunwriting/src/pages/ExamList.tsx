import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Calendar, User, FileText, Play, Trash2, Users, Loader2, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { getExams, deleteExam, getSubmissionsByExamId, Exam, ExamSubmission } from '@/lib/examStorageCloud';
import orunLogo from '@/assets/orun-academy-logo.jpg';

export default function ExamList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [exams, setExams] = useState<Exam[]>([]);
  const [submissionCounts, setSubmissionCounts] = useState<Record<string, number>>({});
  const [deleteTarget, setDeleteTarget] = useState<Exam | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    setIsLoading(true);
    const loadedExams = await getExams();
    setExams(loadedExams);
    
    // 각 시험의 제출 수 조회
    const counts: Record<string, number> = {};
    await Promise.all(
      loadedExams.map(async (exam) => {
        const submissions = await getSubmissionsByExamId(exam.id);
        counts[exam.id] = submissions.length;
      })
    );
    setSubmissionCounts(counts);
    setIsLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    
    setIsDeleting(true);
    const success = await deleteExam(deleteTarget.id);
    setIsDeleting(false);
    
    if (success) {
      await loadExams();
      toast({
        title: '삭제 완료',
        description: `"${deleteTarget.title}" 시험이 삭제되었습니다.`,
      });
    } else {
      toast({
        title: '삭제 실패',
        description: '시험 삭제 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
    
    setDeleteTarget(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
                className="rounded-full hover:bg-muted"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-primary/20 bg-white shadow-lg shadow-primary/5">
                  <img src={orunLogo} alt="ORUN Academy Logo" className="w-10 h-10 object-contain" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold tracking-tight">시험 목록</h1>
                  <p className="text-sm text-muted-foreground">Exam List</p>
                </div>
              </div>
            </div>
            <Button onClick={() => navigate('/exam/create')} className="rounded-xl h-11 shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4 mr-1" />
              새 시험 만들기
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-4xl">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="text-muted-foreground">시험 목록을 불러오는 중...</span>
            </div>
          </div>
        ) : exams.length === 0 ? (
          <Card className="border-0 shadow-lg shadow-primary/5">
            <CardContent className="py-16 text-center">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-xl font-semibold mb-2">생성된 시험이 없습니다</h2>
              <p className="text-muted-foreground mb-6">
                새 시험을 만들어 학생들에게 배포하세요.
              </p>
              <Button onClick={() => navigate('/exam/create')} className="rounded-xl h-11">
                <Plus className="w-4 h-4 mr-1" />
                첫 시험 만들기
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {exams.map((exam) => {
              const submissionCount = submissionCounts[exam.id] || 0;
              
              return (
                <Card key={exam.id} className="border-0 shadow-lg shadow-primary/5 hover:shadow-xl transition-all overflow-hidden group">
                  <div className="h-1 bg-gradient-to-r from-primary/60 via-primary/40 to-primary/20" />
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-3">{exam.title}</h3>
                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-lg">
                            <User className="w-3.5 h-3.5" />
                            {exam.creator}
                          </span>
                          <span className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-lg">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(exam.created_at)}
                          </span>
                          <span className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-lg">
                            <Users className="w-3.5 h-3.5" />
                            {submissionCount}명 참여
                          </span>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        Cloud 저장
                      </Badge>
                    </div>
                    
                    <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border/50">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/exam/${exam.id}/results`)}
                        className="rounded-xl"
                      >
                        <BarChart3 className="w-4 h-4 mr-1" />
                        결과 보기
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteTarget(exam)}
                        className="rounded-xl hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        삭제
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => navigate(`/exam/${exam.id}/take`)}
                        className="rounded-xl shadow-lg shadow-primary/20"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        시험 응시
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>시험을 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleteTarget?.title}" 시험과 모든 응시 기록이 삭제됩니다.
              이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">취소</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={isDeleting}
              className="rounded-xl bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  삭제 중...
                </>
              ) : (
                '삭제'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
