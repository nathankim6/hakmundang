import { useState } from "react";
import { Eye, FileText, Trash2, Pencil, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import youngdeungpoLogo from "@/assets/school-logos/youngdeungpo.png";
import seongnamLogo from "@/assets/school-logos/seongnam.png";
import sudoLogo from "@/assets/school-logos/sudo.png";
import danggokLogo from "@/assets/school-logos/danggok.png";
import sunguiLogo from "@/assets/school-logos/sungui.png";
import guamLogo from "@/assets/school-logos/guam.png";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import SolvingModal from "./SolvingModal";
import QuestionForm from "./QuestionForm";
import { Question, useDeleteQuestion, useUpdateQuestion } from "@/hooks/useQuestions";

interface QuestionTableProps {
  questions: Question[];
  selectedQuestionIds: string[];
  onSelectionChange: (ids: string[]) => void;
}

const QuestionTable = ({ questions, selectedQuestionIds, onSelectionChange }: QuestionTableProps) => {
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null);
  const [questionToEdit, setQuestionToEdit] = useState<Question | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const deleteQuestion = useDeleteQuestion();
  const updateQuestion = useUpdateQuestion();

  const handleViewQuestion = (question: Question) => {
    setSelectedQuestion(question);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (question: Question) => {
    setQuestionToDelete(question);
  };

  const handleDeleteConfirm = () => {
    if (questionToDelete) {
      deleteQuestion.mutate(questionToDelete.id);
      setQuestionToDelete(null);
    }
  };

  const handleEditClick = (question: Question) => {
    setQuestionToEdit(question);
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = (data: any) => {
    if (questionToEdit) {
      updateQuestion.mutate(
        { id: questionToEdit.id, ...data },
        {
          onSuccess: () => {
            setIsEditDialogOpen(false);
            setQuestionToEdit(null);
          },
        }
      );
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      배열영작: "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200",
      조건영작: "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200",
      "요약문(영작)": "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200",
      "요약문(어휘)": "bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-200",
      어법수정: "bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900 dark:text-orange-200",
      어휘수정: "bg-pink-100 text-pink-800 hover:bg-pink-200 dark:bg-pink-900 dark:text-pink-200",
      요지쓰기: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-200",
      Signiture: "bg-amber-100 text-amber-900 hover:bg-amber-200 dark:bg-amber-900 dark:text-amber-100 font-semibold",
      서답형: "bg-amber-100 text-amber-900 hover:bg-amber-200 dark:bg-amber-900 dark:text-amber-100 font-semibold",
    };
    return colors[type] || "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-200";
  };

  const getDifficultyColor = (difficulty: string) => {
    return "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300";
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(questions.map(q => q.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectQuestion = (questionId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedQuestionIds, questionId]);
    } else {
      onSelectionChange(selectedQuestionIds.filter(id => id !== questionId));
    }
  };

  const getSchoolLogo = (school: string) => {
    const logoMap: Record<string, string> = {
      영등포고등학교: youngdeungpoLogo,
      성남고등학교: seongnamLogo,
      수도여자고등학교: sudoLogo,
      당곡고등학교: danggokLogo,
      숭의여자고등학교: sunguiLogo,
      구암고등학교: guamLogo,
    };
    return logoMap[school];
  };

  return (
    <>
      <div className="bg-card rounded-lg shadow-lg overflow-hidden border border-border/50">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 border-b-2">
              <TableHead className="w-12 text-center font-semibold">
                <Checkbox
                  checked={selectedQuestionIds.length === questions.length && questions.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="w-16 text-center font-semibold">번호</TableHead>
              <TableHead className="w-36 font-semibold">학교</TableHead>
              <TableHead className="w-24 text-center font-semibold">학년</TableHead>
              <TableHead className="w-32 text-center font-semibold">문제유형</TableHead>
              <TableHead className="w-24 text-center font-semibold">난이도</TableHead>
              <TableHead className="font-semibold">문제 제목</TableHead>
              <TableHead className="w-24 text-center font-semibold">출제연도</TableHead>
              <TableHead className="w-28 text-center font-semibold">학기</TableHead>
              <TableHead className="w-32 text-center font-semibold">문제풀이</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {questions.map((question, index) => (
              <TableRow
                key={question.id}
                className="hover:bg-muted/30 transition-colors"
              >
                <TableCell className="text-center">
                  <Checkbox
                    checked={selectedQuestionIds.includes(question.id)}
                    onCheckedChange={(checked) => handleSelectQuestion(question.id, checked as boolean)}
                  />
                </TableCell>
                <TableCell className="text-center font-medium">
                  {index + 1}
                </TableCell>
                <TableCell className="font-medium whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {getSchoolLogo(question.school) && (
                      <img 
                        src={getSchoolLogo(question.school)} 
                        alt={`${question.school} 로고`}
                        className="w-6 h-6 object-contain flex-shrink-0"
                      />
                    )}
                    <span className="whitespace-nowrap">{question.school}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline">{question.grade}</Badge>
                </TableCell>
                <TableCell className="text-center whitespace-nowrap">
                  <Badge className={getTypeColor(question.question_type)}>
                    {(question.question_type === "Signiture" || question.question_type === "서답형") && (
                      <Award className="w-3.5 h-3.5 mr-1" />
                    )}
                    {question.question_type}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge className={getDifficultyColor(question.difficulty)}>
                    {question.difficulty}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-md truncate">
                  {question.title}
                </TableCell>
                <TableCell className="text-center text-muted-foreground">
                  {question.exam_year}
                </TableCell>
                <TableCell className="text-center text-muted-foreground">
                  {question.semester.includes('학기') ? question.semester : `${question.semester}학기`}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleViewQuestion(question)}
                      className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 hover:border-primary/30 hover:scale-105 transition-all h-8 px-2 text-xs font-medium"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      문제 보기
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditClick(question)}
                      className="h-7 w-7 p-0 hover:scale-105 transition-all"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteClick(question)}
                      className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {questions.length === 0 && (
          <div className="text-center py-16">
            <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <p className="text-lg text-muted-foreground">검색 결과가 없습니다.</p>
            <p className="text-sm text-muted-foreground mt-2">다른 조건으로 검색해보세요</p>
          </div>
        )}
      </div>

      <SolvingModal
        question={selectedQuestion}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>문제 수정</DialogTitle>
          </DialogHeader>
          {questionToEdit && (
            <QuestionForm
              initialData={questionToEdit}
              onSubmit={handleEditSubmit}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setQuestionToEdit(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!questionToDelete} onOpenChange={() => setQuestionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>문제를 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없습니다. 문제가 영구적으로 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>삭제</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default QuestionTable;
