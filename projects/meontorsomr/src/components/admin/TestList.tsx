
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { QRDataType, QuestionAnswer } from "@/types/test";
import { formatDate } from "@/utils/formatDate";
import { Pencil, Trash2, ClipboardCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import QuestionList from './QuestionList';
import { toast } from '@/hooks/use-toast';
import { updateTestAnswers, loadTests } from "@/utils/testStorage";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface TestListProps {
  tests: QRDataType[];
  onDelete: (testId: string) => void;
}

const TestList = ({ tests, onDelete }: TestListProps) => {
  const [editingTest, setEditingTest] = useState<QRDataType | null>(null);
  const [editedAnswers, setEditedAnswers] = useState<Record<number, QuestionAnswer>>({});
  const [showAnswers, setShowAnswers] = useState<string | null>(null);

  const handleAnswerChange = (questionNumber: number, answer: QuestionAnswer) => {
    setEditedAnswers(prev => ({
      ...prev,
      [questionNumber]: answer
    }));
  };

  const handleEditSave = async () => {
    if (!editingTest) return;

    try {
      const success = await updateTestAnswers(editingTest.testId, editedAnswers);
      if (success) {
        toast({
          title: "정답이 수정되었습니다",
          description: "새로운 정답이 저장되었습니다.",
        });
        await loadTests(); // 시험 목록 다시 로드
        setEditingTest(null);
      }
    } catch (error) {
      toast({
        title: "정답 수정 실패",
        description: "정답을 수정하는데 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleEditStart = (test: QRDataType) => {
    setEditingTest(test);
    setEditedAnswers(test.answers);
  };

  const renderAnswerType = (answer: QuestionAnswer) => {
    if (answer.type === 'multiple') {
      return <span className="font-medium">{answer.answer}</span>;
    } else {
      const answers = String(answer.answer).split(',').map(a => a.trim());
      return (
        <div className="space-y-1">
          {answers.map((ans, idx) => (
            <div key={idx} className="text-sm">{ans}</div>
          ))}
        </div>
      );
    }
  };

  if (tests.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        저장된 시험이 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-lg text-emerald-700 mb-4">저장된 시험 목록</h3>
      <div className="space-y-3">
        {tests.map((test) => (
          <div
            key={test.testId}
            className="p-4 rounded-lg border border-emerald-100 bg-white hover:border-emerald-200 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h4 className="font-medium text-emerald-700">{test.title}</h4>
                  <span className="text-sm text-gray-500">#{test.testId}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {formatDate(test.timestamp)} · {test.questionCount}문항
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-blue-600 hover:text-blue-500 hover:bg-blue-50"
                  onClick={() => setShowAnswers(test.testId === showAnswers ? null : test.testId)}
                  title="정답 확인"
                >
                  <ClipboardCheck className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="text-emerald-600 hover:text-emerald-500 hover:bg-emerald-50"
                  onClick={() => handleEditStart(test)}
                  title="정답 수정"
                >
                  <Pencil className="h-4 w-4" />
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>시험 삭제</AlertDialogTitle>
                      <AlertDialogDescription>
                        이 시험을 삭제하시겠습니까? 모든 결과 데이터도 함께 삭제됩니다.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>취소</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(test.testId)}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        삭제
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            {showAnswers === test.testId && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h5 className="font-medium text-emerald-700 mb-2">정답 목록</h5>
                <div className="bg-emerald-50 p-3 rounded-lg max-h-56 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-20">문항</TableHead>
                        <TableHead className="w-24">유형</TableHead>
                        <TableHead>정답</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(test.answers).map(([num, answer]) => (
                        <TableRow key={num}>
                          <TableCell className="font-medium">{num}번</TableCell>
                          <TableCell>{answer.type === 'multiple' ? '객관식' : '주관식'}</TableCell>
                          <TableCell>{renderAnswerType(answer)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <Dialog 
        open={!!editingTest} 
        onOpenChange={(open) => !open && setEditingTest(null)}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>정답 수정 - {editingTest?.title}</DialogTitle>
          </DialogHeader>
          {editingTest && (
            <div className="space-y-4">
              <QuestionList
                questionCount={editingTest.questionCount}
                onQuestionCountChange={() => {}}
                answers={editedAnswers}
                onAnswerChange={handleAnswerChange}
                readOnlyCount={true}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingTest(null)}>
                  취소
                </Button>
                <Button onClick={handleEditSave}>
                  저장
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TestList;
