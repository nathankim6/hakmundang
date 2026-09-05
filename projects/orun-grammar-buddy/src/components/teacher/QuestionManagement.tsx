import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Edit2, Trash2, Filter, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Question {
  id: string;
  grade: string;
  grammar: string;
  question: string;
  options: string[];
  answer: number;
  difficulty: string;
}

const mockQuestions: Question[] = [
  { id: "1", grade: "중2", grammar: "관계대명사", question: "다음 빈칸에 알맞은 것은?", options: ["who", "which", "that", "what"], answer: 0, difficulty: "중" },
  { id: "2", grade: "중3", grammar: "현재완료", question: "다음 문장의 시제가 올바른 것은?", options: ["has gone", "have gone", "went", "going"], answer: 1, difficulty: "상" },
  { id: "3", grade: "고1", grammar: "가정법", question: "가정법 과거의 올바른 형태는?", options: ["If I were", "If I was", "If I am", "If I be"], answer: 0, difficulty: "상" },
];

const QuestionManagement = () => {
  const [questions, setQuestions] = useState<Question[]>(mockQuestions);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGrade, setFilterGrade] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    grade: "",
    grammar: "",
    question: "",
    options: ["", "", "", ""],
    answer: 0,
    difficulty: "",
  });

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = q.question.includes(searchTerm) || q.grammar.includes(searchTerm);
    const matchesGrade = filterGrade === "all" || q.grade === filterGrade;
    return matchesSearch && matchesGrade;
  });

  const handleAddQuestion = () => {
    if (newQuestion.grade && newQuestion.grammar && newQuestion.question) {
      setQuestions([
        ...questions,
        { ...newQuestion, id: Date.now().toString() },
      ]);
      setNewQuestion({
        grade: "",
        grammar: "",
        question: "",
        options: ["", "", "", ""],
        answer: 0,
        difficulty: "",
      });
      setIsDialogOpen(false);
    }
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-1 gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="문제 또는 문법 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterGrade} onValueChange={setFilterGrade}>
            <SelectTrigger className="w-32">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="학년" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="중1">중1</SelectItem>
              <SelectItem value="중2">중2</SelectItem>
              <SelectItem value="중3">중3</SelectItem>
              <SelectItem value="고1">고1</SelectItem>
              <SelectItem value="고2">고2</SelectItem>
              <SelectItem value="고3">고3</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="hero" className="gap-2">
              <Plus className="w-4 h-4" />
              문제 추가
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>새 문제 등록</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>학년</Label>
                  <Select value={newQuestion.grade} onValueChange={(v) => setNewQuestion({ ...newQuestion, grade: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="학년 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="중1">중1</SelectItem>
                      <SelectItem value="중2">중2</SelectItem>
                      <SelectItem value="중3">중3</SelectItem>
                      <SelectItem value="고1">고1</SelectItem>
                      <SelectItem value="고2">고2</SelectItem>
                      <SelectItem value="고3">고3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>문법 유형</Label>
                  <Input
                    placeholder="예: 관계대명사"
                    value={newQuestion.grammar}
                    onChange={(e) => setNewQuestion({ ...newQuestion, grammar: e.target.value })}
                  />
                </div>
                <div>
                  <Label>난이도</Label>
                  <Select value={newQuestion.difficulty} onValueChange={(v) => setNewQuestion({ ...newQuestion, difficulty: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="난이도" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="하">하</SelectItem>
                      <SelectItem value="중">중</SelectItem>
                      <SelectItem value="상">상</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>문제</Label>
                <Textarea
                  placeholder="문제를 입력하세요..."
                  value={newQuestion.question}
                  onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label>선택지</Label>
                <div className="space-y-2 mt-2">
                  {newQuestion.options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-sm font-medium">
                        {idx + 1}
                      </span>
                      <Input
                        placeholder={`선택지 ${idx + 1}`}
                        value={opt}
                        onChange={(e) => {
                          const opts = [...newQuestion.options];
                          opts[idx] = e.target.value;
                          setNewQuestion({ ...newQuestion, options: opts });
                        }}
                        className="flex-1"
                      />
                      <input
                        type="radio"
                        name="answer"
                        checked={newQuestion.answer === idx}
                        onChange={() => setNewQuestion({ ...newQuestion, answer: idx })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-muted-foreground">정답</span>
                    </div>
                  ))}
                </div>
              </div>
              <Button onClick={handleAddQuestion} className="w-full" variant="hero">
                문제 등록
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {["중1", "중2", "중3", "고1"].map((grade) => (
          <Card key={grade} className="shadow-soft">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{grade} 문제</p>
                  <p className="text-2xl font-bold text-foreground">
                    {questions.filter((q) => q.grade === grade).length}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-primary/30" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Questions List */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>문제 목록 ({filteredQuestions.length}개)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredQuestions.map((q) => (
              <div
                key={q.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/30 hover:bg-accent/30 transition-all"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                      {q.grade}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-secondary/20 text-secondary-foreground">
                      {q.grammar}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
                      난이도: {q.difficulty}
                    </span>
                  </div>
                  <p className="text-foreground">{q.question}</p>
                  <div className="flex gap-2 mt-2">
                    {q.options.map((opt, idx) => (
                      <span
                        key={idx}
                        className={`text-sm px-2 py-0.5 rounded ${
                          idx === q.answer
                            ? "bg-green-100 text-green-700"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {idx + 1}. {opt}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button variant="ghost" size="icon">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteQuestion(q.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuestionManagement;
