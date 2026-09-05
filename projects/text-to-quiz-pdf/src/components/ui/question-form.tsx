import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Upload, Trash2, Eye, X } from "lucide-react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { parseQuestionsText } from "@/utils/textParser";
import { useState } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 tracking-wide",
  {
    variants: {
      variant: {
        default: "btn-professional",
        outline: "border border-border/50 bg-card hover:bg-muted hover:border-primary/50 shadow-xs hover:shadow-md",
        ghost: "hover:bg-muted/50 hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        success: "bg-gradient-accent text-success-foreground shadow-md hover:shadow-lg hover:scale-[1.02]",
        danger: "bg-destructive text-destructive-foreground shadow-md hover:shadow-lg hover:scale-[1.02]",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-lg px-4",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface Question {
  id: string;
  title: string;
  content: string;
  answer: string;
  explanation: string;
}

interface QuestionFormProps {
  questions: Question[];
  onQuestionsChange: (questions: Question[]) => void;
  title: string;
  onTitleChange: (title: string) => void;
}

export const QuestionForm = ({ questions, onQuestionsChange, title, onTitleChange }: QuestionFormProps) => {
  const [inputText, setInputText] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  const handleParseText = () => {
    if (!inputText.trim()) return;
    
    try {
      const parsedQuestions = parseQuestionsText(inputText);
      onQuestionsChange(parsedQuestions);
    } catch (error) {
      console.error('텍스트 파싱 오류:', error);
    }
  };

  const handleDeleteQuestion = (questionId: string) => {
    const updatedQuestions = questions.filter(q => q.id !== questionId);
    onQuestionsChange(updatedQuestions);
  };

  const handleDeleteAll = () => {
    onQuestionsChange([]);
  };

  const exampleText = `[문제] 다음 글의 내용을 한 문장으로 요약하고자 한다. 빈칸 (A), (B)에 들어갈 말로 가장 적절한 것은?
We all know that tempers are one of the first things lost in many arguments. It's easy to say one should keep cool, but how do you do it? The point to remember is that sometimes in arguments the other person is trying to get you to be angry.
[요약문] In arguments, maintaining (A)__________ rather than falling for provocative remarks is crucial for winning and earning (B)__________ from listeners.

① control ┈ victory
② composure ┈ respect  
③ focus ┈ admiration
④ patience ┈ attention
⑤ silence ┈ support

[정답] ②
[해설] 글에서는 논쟁 상황에서 상대방이 의도적으로 화를 내도록 유도할 때 냉정함을 유지하는 것이 중요하다고 강조한다. 화를 내면 어리석은 말을 하게 되어 논쟁에서 이길 수 없다고 설명하며, 차분한 답변으로 대응하는 것이 가장 효과적이라고 제시한다.`;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gradient-primary mb-2">
            문제 텍스트 입력
          </h2>
          <p className="text-muted-foreground">"문제"라는 단어를 기준으로 자동 분할하여 여러 문제를 한번에 입력하세요</p>
        </div>
        <Button 
          onClick={handleParseText} 
          className={cn(buttonVariants({ variant: "default" }))}
          disabled={!inputText.trim()}
        >
          <Upload className="h-4 w-4" />
          문제 분석하기
        </Button>
      </div>

      {/* 문제지 제목 설정 */}
      <Card className="card-professional group hover:shadow-lg transition-all duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-foreground flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            문제지 제목 설정
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="quiz-title" className="text-sm font-medium text-foreground mb-2 block">
              문제지 제목
            </Label>
            <input
              id="quiz-title"
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="예: 2024년 1학기 중간고사, 영어 독해 연습 문제 등"
              className="input-professional w-full px-4 py-3 text-sm font-medium placeholder:text-muted-foreground/60"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="card-professional group hover:shadow-lg transition-all duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-foreground flex items-center gap-3">
            <div className="p-2 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors">
              <FileText className="h-5 w-5 text-accent" />
            </div>
            문제 텍스트 입력
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="question-text" className="text-sm font-medium text-foreground mb-2 block">
              문제 텍스트
            </Label>
            <Textarea
              id="question-text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="문제 텍스트를 입력하세요..."
              rows={20}
              className="input-professional font-mono text-sm whitespace-pre-wrap resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {questions.length > 0 && (
        <Card className="bg-gradient-card shadow-card border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-foreground">
                파싱된 문제 목록 ({questions.length}개)
              </CardTitle>
              <Button 
                onClick={handleDeleteAll}
                className={cn(buttonVariants({ variant: "danger", size: "sm" }))}
              >
                <Trash2 className="h-4 w-4" />
                전체 삭제
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {questions.map((question, index) => (
                <div key={question.id} className="p-4 bg-background/50 rounded-lg border border-border/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded font-medium">
                        {index + 1}
                      </span>
                      <span className="font-medium text-sm">{question.title}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        onClick={() => setSelectedQuestion(question)}
                        className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteQuestion(question.id)}
                        className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {question.content.substring(0, 100)}...
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 문제 상세보기 모달 */}
      {selectedQuestion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-background w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">문제 상세보기</CardTitle>
                <Button
                  onClick={() => setSelectedQuestion(null)}
                  className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">제목</Label>
                <p className="mt-1 p-2 bg-muted rounded text-sm">{selectedQuestion.title}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">문제 내용</Label>
                <div className="mt-1 p-2 bg-muted rounded text-sm whitespace-pre-wrap">
                  {selectedQuestion.content}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">정답</Label>
                <p className="mt-1 p-2 bg-green-50 rounded text-sm">{selectedQuestion.answer}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">해설</Label>
                <div className="mt-1 p-2 bg-blue-50 rounded text-sm whitespace-pre-wrap">
                  {selectedQuestion.explanation}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {questions.length === 0 && (
        <Card className="bg-gradient-hero border-border/50">
          <CardContent className="text-center py-12">
            <div className="text-muted-foreground">
              <p className="text-lg mb-2">문제 텍스트를 입력해주세요</p>
              <p className="text-sm">
                [문제], [정답], [해설] 형식으로 입력하면 자동으로 문제를 분석합니다
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};