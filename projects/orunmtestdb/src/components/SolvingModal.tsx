import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, School, BookOpen, CheckCircle2, XCircle } from "lucide-react";
import { Question } from "@/hooks/useQuestions";

interface SolvingModalProps {
  question: Question | null;
  isOpen: boolean;
  onClose: () => void;
}

const SolvingModal = ({ question, isOpen, onClose }: SolvingModalProps) => {
  const [userAnswer, setUserAnswer] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleClose = () => {
    setUserAnswer("");
    setIsSubmitted(false);
    onClose();
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  if (!question) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            문제 #{question.id.slice(0, 8)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 문제 정보 */}
          <div className="flex flex-wrap gap-3 pb-4 border-b">
            <div className="flex items-center gap-2 text-sm">
              <School className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{question.school}</span>
            </div>
            <Badge variant="outline">{question.grade}</Badge>
            <Badge variant="secondary" className="text-sm">{question.question_type}</Badge>
            <Badge variant="outline">{question.difficulty}</Badge>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              {question.exam_year} {question.semester}
            </div>
          </div>

          {/* 문제 */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-foreground">
              {question.title}
            </h3>
            <div className="bg-background rounded-none p-6 leading-relaxed whitespace-pre-wrap border-2 border-foreground">
              {question.content}
            </div>
          </div>

          {/* 답안 작성 영역 */}
          {!isSubmitted ? (
            <div className="space-y-3">
              <label className="text-sm font-medium">답안 작성</label>
              <Textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="답안을 입력하세요..."
                rows={8}
                className="font-mono resize-none"
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleSubmit}
                  disabled={!userAnswer.trim()}
                  size="lg"
                  className="min-w-32"
                >
                  답안 제출
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* 정답 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold text-lg text-green-700 dark:text-green-400">모범 답안</h4>
                </div>
                <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-6 border border-green-200 dark:border-green-800">
                  <p className="whitespace-pre-wrap text-foreground">{question.answer}</p>
                </div>
              </div>

              {/* 해설 */}
              {question.explanation && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    <h4 className="font-semibold text-lg">해설</h4>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-950/30 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
                    <p className="whitespace-pre-wrap text-foreground">{question.explanation}</p>
                  </div>
                </div>
              )}

              {/* 제출한 답안 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <h4 className="font-semibold text-lg">제출한 답안</h4>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                  <p className="whitespace-pre-wrap">{userAnswer}</p>
                </div>
              </div>

              {/* 다시 풀기 버튼 */}
              <div className="flex gap-3 justify-end pt-4">
                <Button variant="outline" onClick={handleClose}>
                  닫기
                </Button>
                <Button
                  onClick={() => {
                    setUserAnswer("");
                    setIsSubmitted(false);
                  }}
                >
                  다시 풀기
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SolvingModal;
