import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, ArrowLeft, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import QuestionForm from "@/components/QuestionForm";
import {
  useQuestions,
  useCreateQuestion,
  useUpdateQuestion,
  useDeleteQuestion,
  Question,
} from "@/hooks/useQuestions";

const Admin = () => {
  const navigate = useNavigate();
  const { data: questions = [], isLoading } = useQuestions();
  const createQuestion = useCreateQuestion();
  const updateQuestion = useUpdateQuestion();
  const deleteQuestion = useDeleteQuestion();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [deletingQuestionId, setDeletingQuestionId] = useState<string | null>(null);

  const handleCreate = (data: any) => {
    createQuestion.mutate(data);
    setIsFormOpen(false);
  };

  const handleEdit = (data: any) => {
    if (editingQuestion) {
      updateQuestion.mutate({ id: editingQuestion.id, ...data });
      setEditingQuestion(null);
    }
  };

  const handleDelete = () => {
    if (deletingQuestionId) {
      deleteQuestion.mutate(deletingQuestionId);
      setDeletingQuestionId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <header className="bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
                className="text-primary-foreground hover:bg-white/20"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold">문제 관리</h1>
                <p className="text-sm opacity-90">문제 등록, 수정, 삭제</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setIsFormOpen(true)}
                className="bg-white text-primary hover:bg-white/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                새 문제 등록
              </Button>
              <Button
                onClick={() => navigate("/schools")}
                variant="outline"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              >
                <Building2 className="w-4 h-4 mr-2" />
                학교 관리
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">로딩 중...</p>
          </div>
        ) : (
          <div className="bg-card rounded-lg shadow-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-20">번호</TableHead>
                  <TableHead className="w-48">학교</TableHead>
                  <TableHead className="w-28">학년</TableHead>
                  <TableHead className="w-40">문제유형</TableHead>
                  <TableHead className="w-24">난이도</TableHead>
                  <TableHead>제목</TableHead>
                  <TableHead className="w-24">출제연도</TableHead>
                  <TableHead className="w-40">학기</TableHead>
                  <TableHead className="w-40 text-center">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.map((question, index) => (
                  <TableRow key={question.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell className="whitespace-nowrap">{question.school}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge variant="outline">{question.grade}</Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge variant="secondary">{question.question_type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{question.difficulty}</Badge>
                    </TableCell>
                    <TableCell className="max-w-md truncate">{question.title}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {question.exam_year}
                    </TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {question.semester}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 justify-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingQuestion(question)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          수정
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setDeletingQuestionId(question.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          삭제
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {questions.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">등록된 문제가 없습니다.</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 등록 다이얼로그 */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>새 문제 등록</DialogTitle>
          </DialogHeader>
          <QuestionForm onSubmit={handleCreate} onCancel={() => setIsFormOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* 수정 다이얼로그 */}
      <Dialog open={!!editingQuestion} onOpenChange={() => setEditingQuestion(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>문제 수정</DialogTitle>
          </DialogHeader>
          {editingQuestion && (
            <QuestionForm
              initialData={editingQuestion}
              onSubmit={handleEdit}
              onCancel={() => setEditingQuestion(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog
        open={!!deletingQuestionId}
        onOpenChange={() => setDeletingQuestionId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없습니다. 문제가 영구적으로 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Admin;
