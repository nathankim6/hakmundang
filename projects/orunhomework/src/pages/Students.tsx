import { useState } from "react";
import { Plus, Search, Filter, MoreVertical, Phone, Mail, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// 데모 학생 데이터
const initialStudents = [
  { id: "1", name: "김민준", school: "성남고등학교", grade: "2학년", parentPhone: "010-1234-5678", parentEmail: "parent1@email.com", completionRate: 92, submittedToday: true },
  { id: "2", name: "이서연", school: "성남고등학교", grade: "1학년", parentPhone: "010-2345-6789", parentEmail: "parent2@email.com", completionRate: 88, submittedToday: true },
  { id: "3", name: "박지훈", school: "괌고등학교", grade: "3학년", parentPhone: "010-3456-7890", parentEmail: "parent3@email.com", completionRate: 75, submittedToday: false },
  { id: "4", name: "최수아", school: "성남고등학교", grade: "2학년", parentPhone: "010-4567-8901", parentEmail: "parent4@email.com", completionRate: 95, submittedToday: true },
  { id: "5", name: "정도윤", school: "괌고등학교", grade: "1학년", parentPhone: "010-5678-9012", parentEmail: "parent5@email.com", completionRate: 60, submittedToday: false },
  { id: "6", name: "강하은", school: "성남고등학교", grade: "3학년", parentPhone: "010-6789-0123", parentEmail: "parent6@email.com", completionRate: 82, submittedToday: true },
];

export default function Students() {
  const [students, setStudents] = useState(initialStudents);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("all");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // 필터링된 학생 목록
  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.name.includes(searchQuery);
    const matchesSchool = selectedSchool === "all" || student.school === selectedSchool;
    const matchesGrade = selectedGrade === "all" || student.grade === selectedGrade;
    return matchesSearch && matchesSchool && matchesGrade;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        icon={Users}
        title="학생관리"
        description={`전체 ${students.length}명의 학생을 관리합니다`}
        showDate={false}
        actions={
          <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            학생 추가
          </Button>
        }
      />

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>새 학생 추가</DialogTitle>
            <DialogDescription>
              학생 정보와 학부모 연락처를 입력하세요.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>학생 이름</Label>
              <Input placeholder="예: 홍길동" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>학교</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="학교 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="성남고등학교">성남고등학교</SelectItem>
                    <SelectItem value="괌고등학교">괌고등학교</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>학년</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="학년 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1학년">1학년</SelectItem>
                    <SelectItem value="2학년">2학년</SelectItem>
                    <SelectItem value="3학년">3학년</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>학부모 전화번호</Label>
              <Input placeholder="010-0000-0000" />
            </div>
            <div className="space-y-2">
              <Label>학부모 이메일</Label>
              <Input type="email" placeholder="parent@email.com" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={() => setIsAddDialogOpen(false)}>추가</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 필터 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="학생 이름 검색..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedSchool} onValueChange={setSelectedSchool}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="학교 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 학교</SelectItem>
                <SelectItem value="성남고등학교">성남고등학교</SelectItem>
                <SelectItem value="괌고등학교">괌고등학교</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedGrade} onValueChange={setSelectedGrade}>
              <SelectTrigger className="w-full md:w-36">
                <SelectValue placeholder="학년 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 학년</SelectItem>
                <SelectItem value="1학년">1학년</SelectItem>
                <SelectItem value="2학년">2학년</SelectItem>
                <SelectItem value="3학년">3학년</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 학생 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.map((student) => (
          <Card key={student.id} className="card-hover">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                    {student.name[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold">{student.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {student.school} · {student.grade}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>상세보기</DropdownMenuItem>
                    <DropdownMenuItem>수정</DropdownMenuItem>
                    <DropdownMenuItem>알림 발송</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">삭제</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* 연락처 */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>{student.parentPhone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{student.parentEmail}</span>
                </div>
              </div>

              {/* 상태 */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">완료율</span>
                  <span className={`font-bold ${student.completionRate >= 80 ? "text-success" : student.completionRate >= 60 ? "text-warning" : "text-destructive"}`}>
                    {student.completionRate}%
                  </span>
                </div>
                <Badge variant={student.submittedToday ? "default" : "secondary"}>
                  {student.submittedToday ? "오늘 제출" : "미제출"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">검색 결과가 없습니다.</p>
        </div>
      )}
    </div>
  );
}
