import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Calendar, Users, Clock, Play, Pause, CheckCircle, Search, Settings } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

interface Exam {
  id: string;
  name: string;
  grade: string;
  grammarTopics: string[];
  questionCount: number;
  duration: number;
  scheduledDate: string;
  assignedStudents: number;
  status: "draft" | "scheduled" | "active" | "completed";
}

const mockExams: Exam[] = [
  { id: "1", name: "중2 1학기 정기고사", grade: "중2", grammarTopics: ["관계대명사", "현재완료"], questionCount: 25, duration: 45, scheduledDate: "2026-01-10", assignedStudents: 42, status: "scheduled" },
  { id: "2", name: "중3 문법 종합", grade: "중3", grammarTopics: ["가정법", "분사구문"], questionCount: 30, duration: 50, scheduledDate: "2026-01-12", assignedStudents: 38, status: "scheduled" },
  { id: "3", name: "고1 심화 테스트", grade: "고1", grammarTopics: ["도치", "강조"], questionCount: 20, duration: 40, scheduledDate: "2026-01-05", assignedStudents: 35, status: "completed" },
];

const grammarOptions = [
  "관계대명사",
  "현재완료",
  "과거완료",
  "가정법",
  "분사구문",
  "수동태",
  "도치",
  "강조",
  "비교급",
  "최상급",
];

const ExamManagement = () => {
  const [exams, setExams] = useState<Exam[]>(mockExams);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newExam, setNewExam] = useState({
    name: "",
    grade: "",
    grammarTopics: [] as string[],
    questionCount: 20,
    duration: 45,
    scheduledDate: "",
  });

  const filteredExams = exams.filter((e) =>
    e.name.includes(searchTerm) || e.grade.includes(searchTerm)
  );

  const handleAddExam = () => {
    if (newExam.name && newExam.grade && newExam.grammarTopics.length > 0) {
      setExams([
        ...exams,
        {
          ...newExam,
          id: Date.now().toString(),
          assignedStudents: 0,
          status: "draft",
        },
      ]);
      setNewExam({
        name: "",
        grade: "",
        grammarTopics: [],
        questionCount: 20,
        duration: 45,
        scheduledDate: "",
      });
      setIsDialogOpen(false);
    }
  };

  const toggleGrammarTopic = (topic: string) => {
    setNewExam({
      ...newExam,
      grammarTopics: newExam.grammarTopics.includes(topic)
        ? newExam.grammarTopics.filter((t) => t !== topic)
        : [...newExam.grammarTopics, topic],
    });
  };

  const getStatusBadge = (status: Exam["status"]) => {
    const styles = {
      draft: "bg-muted text-muted-foreground",
      scheduled: "bg-blue-100 text-blue-700",
      active: "bg-green-100 text-green-700",
      completed: "bg-primary/10 text-primary",
    };
    const labels = {
      draft: "초안",
      scheduled: "예정",
      active: "진행중",
      completed: "완료",
    };
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getStatusIcon = (status: Exam["status"]) => {
    switch (status) {
      case "draft":
        return <Settings className="w-4 h-4" />;
      case "scheduled":
        return <Calendar className="w-4 h-4" />;
      case "active":
        return <Play className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="시험명 또는 학년 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="hero" className="gap-2">
              <Plus className="w-4 h-4" />
              시험 출제
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>새 시험 출제</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>시험명</Label>
                <Input
                  placeholder="예: 중2 1학기 정기고사"
                  value={newExam.name}
                  onChange={(e) => setNewExam({ ...newExam, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>대상 학년</Label>
                  <Select value={newExam.grade} onValueChange={(v) => setNewExam({ ...newExam, grade: v })}>
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
                  <Label>시험 일시</Label>
                  <Input
                    type="date"
                    value={newExam.scheduledDate}
                    onChange={(e) => setNewExam({ ...newExam, scheduledDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>문제 수</Label>
                  <Input
                    type="number"
                    min={5}
                    max={50}
                    value={newExam.questionCount}
                    onChange={(e) => setNewExam({ ...newExam, questionCount: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>시험 시간 (분)</Label>
                  <Input
                    type="number"
                    min={10}
                    max={120}
                    value={newExam.duration}
                    onChange={(e) => setNewExam({ ...newExam, duration: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <Label className="mb-3 block">출제 범위 (문법 주제 선택)</Label>
                <div className="grid grid-cols-2 gap-2">
                  {grammarOptions.map((topic) => (
                    <div key={topic} className="flex items-center space-x-2">
                      <Checkbox
                        id={topic}
                        checked={newExam.grammarTopics.includes(topic)}
                        onCheckedChange={() => toggleGrammarTopic(topic)}
                      />
                      <label
                        htmlFor={topic}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {topic}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <Button onClick={handleAddExam} className="w-full" variant="hero">
                시험 생성
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-soft">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              <Settings className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">초안</p>
              <p className="text-xl font-bold text-foreground">
                {exams.filter((e) => e.status === "draft").length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">예정</p>
              <p className="text-xl font-bold text-foreground">
                {exams.filter((e) => e.status === "scheduled").length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Play className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">진행중</p>
              <p className="text-xl font-bold text-foreground">
                {exams.filter((e) => e.status === "active").length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">완료</p>
              <p className="text-xl font-bold text-foreground">
                {exams.filter((e) => e.status === "completed").length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exams List */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>시험 목록 ({filteredExams.length}개)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredExams.map((exam) => (
              <div
                key={exam.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/30 hover:bg-accent/30 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
                    {getStatusIcon(exam.status)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-foreground">{exam.name}</p>
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                        {exam.grade}
                      </span>
                      {getStatusBadge(exam.status)}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {exam.grammarTopics.map((topic) => (
                        <span
                          key={topic}
                          className="px-2 py-0.5 rounded text-xs bg-secondary/20 text-secondary-foreground"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {exam.scheduledDate}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {exam.duration}분
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    {exam.assignedStudents}명
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">문제</p>
                    <p className="font-semibold text-foreground">{exam.questionCount}개</p>
                  </div>
                  <Button variant="outline" size="sm">
                    관리
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

export default ExamManagement;
