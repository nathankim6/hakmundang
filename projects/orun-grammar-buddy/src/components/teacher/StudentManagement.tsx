import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Edit2, Trash2, Mail, Phone, BarChart2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Student {
  id: string;
  name: string;
  grade: string;
  email: string;
  phone: string;
  avgScore: number;
  examsTaken: number;
  status: "active" | "inactive";
}

const mockStudents: Student[] = [
  { id: "1", name: "김민수", grade: "중2", email: "minsu@email.com", phone: "010-1234-5678", avgScore: 85, examsTaken: 12, status: "active" },
  { id: "2", name: "박지영", grade: "중3", email: "jiyoung@email.com", phone: "010-2345-6789", avgScore: 92, examsTaken: 15, status: "active" },
  { id: "3", name: "이승호", grade: "고1", email: "seungho@email.com", phone: "010-3456-7890", avgScore: 78, examsTaken: 8, status: "active" },
  { id: "4", name: "최유진", grade: "중2", email: "yujin@email.com", phone: "010-4567-8901", avgScore: 88, examsTaken: 11, status: "inactive" },
];

const StudentManagement = () => {
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGrade, setFilterGrade] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: "",
    grade: "",
    email: "",
    phone: "",
  });

  const filteredStudents = students.filter((s) => {
    const matchesSearch = s.name.includes(searchTerm) || s.email.includes(searchTerm);
    const matchesGrade = filterGrade === "all" || s.grade === filterGrade;
    return matchesSearch && matchesGrade;
  });

  const handleAddStudent = () => {
    if (newStudent.name && newStudent.grade && newStudent.email) {
      setStudents([
        ...students,
        {
          ...newStudent,
          id: Date.now().toString(),
          avgScore: 0,
          examsTaken: 0,
          status: "active",
        },
      ]);
      setNewStudent({ name: "", grade: "", email: "", phone: "" });
      setIsDialogOpen(false);
    }
  };

  const handleDeleteStudent = (id: string) => {
    setStudents(students.filter((s) => s.id !== id));
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-100";
    if (score >= 80) return "text-blue-600 bg-blue-100";
    if (score >= 70) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-1 gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="학생 이름 또는 이메일 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterGrade} onValueChange={setFilterGrade}>
            <SelectTrigger className="w-32">
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
              학생 추가
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>새 학생 등록</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>이름</Label>
                <Input
                  placeholder="학생 이름"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                />
              </div>
              <div>
                <Label>학년</Label>
                <Select value={newStudent.grade} onValueChange={(v) => setNewStudent({ ...newStudent, grade: v })}>
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
                <Label>이메일</Label>
                <Input
                  type="email"
                  placeholder="student@email.com"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                />
              </div>
              <div>
                <Label>전화번호</Label>
                <Input
                  placeholder="010-0000-0000"
                  value={newStudent.phone}
                  onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                />
              </div>
              <Button onClick={handleAddStudent} className="w-full" variant="hero">
                학생 등록
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-soft">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">전체 학생</p>
                <p className="text-2xl font-bold text-foreground">{students.length}명</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">활성 학생</p>
                <p className="text-2xl font-bold text-foreground">
                  {students.filter((s) => s.status === "active").length}명
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">전체 평균 점수</p>
                <p className="text-2xl font-bold text-foreground">
                  {Math.round(students.reduce((acc, s) => acc + s.avgScore, 0) / students.length)}점
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students List */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>학생 목록 ({filteredStudents.length}명)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredStudents.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/30 hover:bg-accent/30 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-hero flex items-center justify-center text-primary-foreground font-medium text-lg">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{student.name}</p>
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                        {student.grade}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          student.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {student.status === "active" ? "활성" : "비활성"}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {student.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {student.phone}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">응시 횟수</p>
                    <p className="font-semibold text-foreground">{student.examsTaken}회</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">평균 점수</p>
                    <span className={`px-2 py-0.5 rounded font-semibold ${getScoreColor(student.avgScore)}`}>
                      {student.avgScore}점
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" title="성적 보기">
                      <BarChart2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="수정">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteStudent(student.id)} title="삭제">
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentManagement;
