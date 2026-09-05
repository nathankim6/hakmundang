import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getReportCards, deleteReportCard } from "@/integrations/supabase/reportService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, Edit, Trash2, Plus, Eye, FileText, School, User, CalendarDays, Filter } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type SavedReport = {
  id: string;
  school: string;
  grade: string;
  examScope: string;
  examInfo?: string;
  teacher: string;
  teacher_photo?: string;
  created_at: string;
  updated_at: string;
  analysisType?: 'detailed' | 'simple';
};
type GroupedReports = {
  [schoolType: string]: {
    [teacher: string]: SavedReport[];
  };
};

const EXAM_TYPES = [
  { value: "all", label: "전체 시험" },
  { value: "1학기 중간고사", label: "1학기 중간고사" },
  { value: "1학기 기말고사", label: "1학기 기말고사" },
  { value: "2학기 중간고사", label: "2학기 중간고사" },
  { value: "2학기 기말고사", label: "2학기 기말고사" },
];

const SavedReports: React.FC = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [teacherFilter, setTeacherFilter] = useState<string>("all");
  const [examFilter, setExamFilter] = useState<string>("all");

  const fetchReports = async () => {
    setIsLoading(true);
    const {
      data,
      error
    } = await getReportCards();
    if (error) {
      toast.error("리포트를 불러오는데 실패했습니다: " + error.message);
      setIsLoading(false);
      return;
    }
    if (data) {
      const convertedReports = data.map(report => ({
        id: report.id,
        school: report.school,
        grade: report.grade,
        examScope: report.exam_scope,
        examInfo: report.exam_info,
        teacher: report.teacher,
        teacher_photo: report.teacher_photo,
        created_at: report.created_at,
        updated_at: report.updated_at,
        analysisType: report.analysis_type as 'detailed' | 'simple' || 'detailed'
      }));
      setReports(convertedReports);
    }
    setIsLoading(false);
  };
  useEffect(() => {
    fetchReports();
  }, []);

  // Get unique teachers for filter
  const uniqueTeachers = useMemo(() => {
    const teachers = [...new Set(reports.map(r => r.teacher))];
    return teachers.sort();
  }, [reports]);

  // Filter reports
  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const matchesTeacher = teacherFilter === "all" || report.teacher === teacherFilter;
      const matchesExam = examFilter === "all" || (report.examInfo && report.examInfo.includes(examFilter));
      return matchesTeacher && matchesExam;
    });
  }, [reports, teacherFilter, examFilter]);

  const handleDelete = async (id: string) => {
    if (window.confirm("정말로 이 리포트를 삭제하시겠습니까?")) {
      const {
        error
      } = await deleteReportCard(id);
      if (error) {
        toast.error("리포트 삭제에 실패했습니다: " + error.message);
        return;
      }
      toast.success("리포트가 성공적으로 삭제되었습니다.");
      fetchReports();
    }
  };
  const handleView = (id: string) => {
    navigate(`/report/${id}`);
  };
  const handleEdit = (id: string) => {
    navigate(`/edit-report/${id}`);
  };
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "yyyy.MM.dd");
    } catch (e) {
      return "날짜 정보 없음";
    }
  };
  const getSchoolType = (school: string) => {
    const normalizedSchool = school.trim().toLowerCase();
    // Check high school first: 고등학교, 고등, 고교, or ends with "고"
    if (normalizedSchool.includes('고등') || normalizedSchool.includes('고교') || /고$/.test(normalizedSchool)) {
      return '고등부';
    }
    // Check middle school: 중학교, 중학, 중교, or ends with "중"
    if (normalizedSchool.includes('중학') || normalizedSchool.includes('중교') || /중$/.test(normalizedSchool)) {
      return '중등부';
    }
    return '기타';
  };

  // Group reports by school type and teacher
  const groupedReports: GroupedReports = filteredReports.reduce((groups, report) => {
    const schoolType = getSchoolType(report.school);
    const teacher = report.teacher;
    if (!groups[schoolType]) {
      groups[schoolType] = {};
    }
    if (!groups[schoolType][teacher]) {
      groups[schoolType][teacher] = [];
    }
    groups[schoolType][teacher].push(report);
    return groups;
  }, {} as GroupedReports);
  if (isLoading) {
    return <div className="min-h-screen py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-14 w-14 border-4 border-primary/20 border-t-primary mx-auto mb-6"></div>
              <p className="text-muted-foreground text-lg font-medium">리포트를 불러오는 중...</p>
            </div>
          </div>
        </div>
      </div>;
  }
  return <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <Button variant="outline" onClick={() => navigate("/")} className="flex items-center gap-2 border-border/60 hover:bg-accent/50 hover:border-accent transition-all">
            <ArrowLeft size={18} />
            <span className="font-medium">돌아가기</span>
          </Button>
          
          <Button onClick={() => navigate("/")} className="flex items-center gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
            <Plus size={18} />
            <span className="font-semibold">새 리포트 작성</span>
          </Button>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-3">Test Report Archive</h1>
          <p className="text-muted-foreground text-lg">총 <span className="font-semibold text-primary">{reports.length}</span>개의 리포트</p>
        </div>

        {/* Filters */}
        <Card className="mb-8 border-border/60 bg-card/50 backdrop-blur-sm shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Filter className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">필터</h3>
              {(teacherFilter !== "all" || examFilter !== "all") && (
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  {filteredReports.length}개 결과
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">선생님별</label>
                <Select value={teacherFilter} onValueChange={setTeacherFilter}>
                  <SelectTrigger className="w-full border-border/60 bg-background">
                    <SelectValue placeholder="선생님 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 선생님</SelectItem>
                    {uniqueTeachers.map(teacher => (
                      <SelectItem key={teacher} value={teacher}>{teacher} 선생님</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">시험별</label>
                <Select value={examFilter} onValueChange={setExamFilter}>
                  <SelectTrigger className="w-full border-border/60 bg-background">
                    <SelectValue placeholder="시험 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXAM_TYPES.map(exam => (
                      <SelectItem key={exam.value} value={exam.value}>{exam.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Empty State */}
        {reports.length === 0 ? <Card className="p-16 text-center border-border/60 bg-card/50 backdrop-blur-sm shadow-lg">
            <FileText className="h-20 w-20 text-muted-foreground/50 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-foreground mb-3">저장된 리포트가 없습니다</h3>
            <p className="text-muted-foreground text-lg mb-8">리포트를 생성하여 저장해보세요.</p>
            <Button onClick={() => navigate("/")} className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
              새 리포트 작성하기
            </Button>
          </Card> : (/* Reports by School Type */
      <div className="space-y-10">
            {Object.entries(groupedReports).map(([schoolType, teacherGroups]) => <div key={schoolType}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <School className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">{schoolType}</h2>
                  <Badge variant="secondary" className="ml-2 px-3 py-1 bg-primary/10 text-primary border-primary/20">
                    {Object.values(teacherGroups).flat().length}개 리포트
                  </Badge>
                </div>

                <Card className="shadow-xl border-border/60 bg-card/50 backdrop-blur-sm overflow-hidden">
                  <CardContent className="p-8">
                    <Accordion type="multiple" className="w-full" defaultValue={examFilter !== "all" ? Object.keys(teacherGroups) : undefined} key={examFilter}>
                      {Object.entries(teacherGroups).map(([teacher, teacherReports]) => <AccordionItem key={teacher} value={teacher} className="border-b border-border/50 last:border-0">
                          <AccordionTrigger className="hover:no-underline py-6 hover:bg-accent/30 px-4 -mx-4 rounded-lg transition-all">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-14 w-14 rounded-md ring-2 ring-primary/10">
                                <AvatarImage src={teacherReports[0]?.teacher_photo || undefined} alt={teacher} className="object-cover" />
                                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-lg font-semibold rounded-md">
                                  {teacher.substring(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xl font-semibold text-foreground">{teacher} 선생님</span>
                              <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary border-primary/20 px-3 py-1">
                                {teacherReports.length}개
                              </Badge>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pb-6 pt-4">
                            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                              {teacherReports.map(report => <Card key={report.id} className="group border border-border/60 hover:border-primary/30 transition-all hover:shadow-xl bg-card/80 backdrop-blur-sm overflow-hidden">
                                  <CardContent className="p-5">
                                    <div className="space-y-4">
                                      <div>
                                        <div className="flex items-start justify-between mb-2 gap-2">
                                          <h4 className="font-semibold text-foreground line-clamp-2 flex-1 group-hover:text-primary transition-colors">
                                            {report.examInfo || "시험 분석 리포트"}
                                          </h4>
                                          <Badge variant={report.analysisType === 'simple' ? "secondary" : "default"} className={`text-xs px-2.5 py-1 font-medium shrink-0 ${report.analysisType === 'simple' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                            {report.analysisType === 'simple' ? '간단분석' : '상세분석'}
                                          </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground font-medium">{report.examScope}</p>
                                      </div>

                                      <div className="space-y-2.5">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                          <div className="p-1 rounded bg-primary/10">
                                            <School className="h-3.5 w-3.5 text-primary" />
                                          </div>
                                          <span className="font-medium">{report.school} {report.grade}</span>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                          <div className="p-1 rounded bg-primary/10">
                                            <CalendarDays className="h-3.5 w-3.5 text-primary" />
                                          </div>
                                          <span>{formatDate(report.created_at)}</span>
                                        </div>
                                      </div>

                                      <div className="flex gap-2 pt-3 border-t border-border/50">
                                        <Button variant="outline" size="sm" onClick={() => handleView(report.id)} className="flex-1 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 transition-all">
                                          <Eye className="h-3.5 w-3.5 mr-1.5" />
                                          <span className="font-medium">보기</span>
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => handleEdit(report.id)} className="flex-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 transition-all">
                                          <Edit className="h-3.5 w-3.5 mr-1.5" />
                                          <span className="font-medium">수정</span>
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => handleDelete(report.id)} className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all">
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>)}
                            </div>
                          </AccordionContent>
                        </AccordionItem>)}
                    </Accordion>
                  </CardContent>
                </Card>
              </div>)}
          </div>)}
      </div>
    </div>;
};
export default SavedReports;