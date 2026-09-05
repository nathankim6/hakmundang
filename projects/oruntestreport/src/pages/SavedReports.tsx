import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getReportCards, deleteReportCard } from "@/integrations/supabase/reportService";
import { getReportCardById, convertDbToAppFormat, ProblemType } from "@/integrations/supabase/reportService";
import StudentSubmissionsDialog from "@/components/StudentSubmissionsDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Edit, Trash2, Plus, Eye, FileText, School, User, CalendarDays, Filter, ChevronRight, Users } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSchoolLogo } from "@/lib/schoolLogos";


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

export type ReportMeta = Pick<SavedReport, 'school' | 'grade' | 'examScope' | 'examInfo' | 'teacher' | 'created_at'>;

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
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [submissionsReportId, setSubmissionsReportId] = useState<string | undefined>(undefined);
  const [submissionsReportMeta, setSubmissionsReportMeta] = useState<ReportMeta | undefined>(undefined);
  const [submissionsProblems, setSubmissionsProblems] = useState<ProblemType[]>([]);
  const [submissionsOpen, setSubmissionsOpen] = useState<boolean>(false);

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

  // Get unique years (작성연도) from reports
  const uniqueYears = useMemo(() => {
    const years = [...new Set(reports.map(r => new Date(r.created_at).getFullYear().toString()))];
    return years.sort((a, b) => Number(b) - Number(a));
  }, [reports]);

  // Filter reports
  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const matchesTeacher = teacherFilter === "all" || report.teacher === teacherFilter;
      const matchesExam = examFilter === "all" || (report.examInfo && report.examInfo.includes(examFilter));
      const matchesYear = yearFilter === "all" || new Date(report.created_at).getFullYear().toString() === yearFilter;
      return matchesTeacher && matchesExam && matchesYear;
    });
  }, [reports, teacherFilter, examFilter, yearFilter]);

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
  const handleStudentSubmit = async (id: string) => {
    setSubmissionsReportId(id);
    setSubmissionsReportMeta(undefined);
    setSubmissionsProblems([]);
    setSubmissionsOpen(true);
    const { data, error } = await getReportCardById(id);
    if (error || !data) {
      toast.error("리포트를 불러오지 못했습니다");
      return;
    }
    const converted = convertDbToAppFormat(data);
    setSubmissionsReportMeta({
      school: converted.school,
      grade: converted.grade,
      examScope: converted.examScope,
      examInfo: converted.examInfo,
      teacher: converted.teacher,
      created_at: data.created_at,
    });

    setSubmissionsProblems((converted.problemTypes as ProblemType[]) || []);
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

  // Teacher summary grouped by school type (for category view when no teacher is selected)
  const teacherSummariesBySchoolType = useMemo(() => {
    const groups: Record<string, Map<string, { teacher: string; photo?: string; count: number; latest: string }>> = {
      '고등부': new Map(),
      '중등부': new Map(),
    };
    reports.forEach(r => {
      const schoolType = getSchoolType(r.school);
      if (!groups[schoolType]) return;
      const existing = groups[schoolType].get(r.teacher);
      if (existing) {
        existing.count += 1;
        if (new Date(r.created_at) > new Date(existing.latest)) existing.latest = r.created_at;
      } else {
        groups[schoolType].set(r.teacher, {
          teacher: r.teacher,
          photo: r.teacher_photo,
          count: 1,
          latest: r.created_at,
        });
      }
    });
    return {
      '고등부': Array.from(groups['고등부'].values()).sort((a, b) => b.count - a.count),
      '중등부': Array.from(groups['중등부'].values()).sort((a, b) => b.count - a.count),
    };
  }, [reports]);

  const showTeacherCategories = teacherFilter === "all";
  if (isLoading) {
    return (
      <div className="orun-stage relative overflow-hidden flex items-center justify-center" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-[#F5C64F]/25 border-t-[#F5C64F] mx-auto mb-6"></div>
          <p className="text-slate-500 text-lg font-medium">리포트를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="orun-stage relative overflow-hidden" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
            {/* faint grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
        }}
      />
      {/* gold glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-32 w-[520px] h-[520px] rounded-full blur-3xl opacity-40"
        style={{
          background: "radial-gradient(circle, rgba(245,198,79,0.35), transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-32 w-[480px] h-[480px] rounded-full blur-3xl opacity-30"
        style={{
          background: "radial-gradient(circle, rgba(120,150,190,0.30), transparent 70%)",
        }}
      />
      {/* trim corners */}
      <span aria-hidden className="absolute top-20 left-6 w-5 h-5 border-l border-t border-slate-900/20" />
      <span aria-hidden className="absolute top-20 right-6 w-5 h-5 border-r border-t border-slate-900/20" />
      <span aria-hidden className="absolute bottom-6 left-6 w-5 h-5 border-l border-b border-slate-900/20" />
      <span aria-hidden className="absolute bottom-6 right-6 w-5 h-5 border-r border-b border-slate-900/20" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 py-16">
        {/* Header */}
        <div className="flex justify-between items-start mb-16">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-900/5 -ml-4 rounded-2xl"
          >
            <ArrowLeft size={18} />
            <span className="font-medium tracking-tight">돌아가기</span>
          </Button>

          <Button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 bg-[#F5C64F] hover:bg-[#FFD666] text-[#2B3642] shadow-lg shadow-[#F5C64F]/25 transition-all rounded-2xl px-6"
          >
            <Plus size={18} />
            <span className="font-semibold tracking-tight">새 리포트 작성</span>
          </Button>
        </div>

        {/* Title */}
        <div className="text-center mb-12">
          <p className="text-[11px] tracking-[0.25em] font-semibold text-[#F5C64F] mb-3">저장된 리포트</p>
          <h1
            className="text-3xl md:text-5xl font-black tracking-[0.04em] text-slate-900 mb-4"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            Report Repository
          </h1>
          <p className="text-slate-500 text-base">
            총 <span className="font-bold text-[#F5C64F]">{reports.length}</span>개의 리포트
          </p>
        </div>

        {/* Filters */}
        <div className="mb-14 rounded-3xl bg-white/70 border border-slate-900/10 p-6 md:p-8 backdrop-blur-xl shadow-[0_8px_32px_-16px_hsl(var(--ink)/0.08)]">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-full bg-[#F5C64F]/10">
              <Filter className="h-5 w-5 text-[#F5C64F]" />
            </div>
            <h3 className="text-sm font-semibold tracking-[0.2em] text-slate-600">필터</h3>
            {(teacherFilter !== "all" || examFilter !== "all" || yearFilter !== "all") && (
              <Badge className="bg-[#F5C64F]/10 text-slate-900 border border-[#F5C64F]/25">
                {filteredReports.length}개 결과
              </Badge>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-500">작성연도</label>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="w-full border-slate-900/10 bg-white/80 text-slate-900 backdrop-blur-md hover:border-[#F5C64F] transition-colors rounded-2xl">
                  <SelectValue placeholder="연도 선택" />
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-xl border-slate-900/10 text-slate-900 rounded-2xl [&_*]:text-slate-700">
                  <SelectItem value="all">전체 연도</SelectItem>
                  {uniqueYears.map(year => (
                    <SelectItem key={year} value={year}>{year}년</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-500">선생님별</label>
              <Select value={teacherFilter} onValueChange={setTeacherFilter}>
                <SelectTrigger className="w-full border-slate-900/10 bg-white/80 text-slate-900 backdrop-blur-md hover:border-[#F5C64F] transition-colors rounded-2xl">
                  <SelectValue placeholder="선생님 선택" />
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-xl border-slate-900/10 text-slate-900 rounded-2xl [&_*]:text-slate-700">
                  <SelectItem value="all">전체 선생님</SelectItem>
                  {uniqueTeachers.map(teacher => (
                    <SelectItem key={teacher} value={teacher}>{teacher} 선생님</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-500">시험별</label>
              <Select value={examFilter} onValueChange={setExamFilter}>
                <SelectTrigger className="w-full border-slate-900/10 bg-white/80 text-slate-900 backdrop-blur-md hover:border-[#F5C64F] transition-colors rounded-2xl">
                  <SelectValue placeholder="시험 선택" />
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-xl border-slate-900/10 text-slate-900 rounded-2xl [&_*]:text-slate-700">
                  {EXAM_TYPES.map(exam => (
                    <SelectItem key={exam.value} value={exam.value}>{exam.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {reports.length === 0 ? (
          <Card className="p-16 text-center border-slate-900/10 bg-white/80 backdrop-blur-xl rounded-2xl">
            <FileText className="h-20 w-20 text-[#F5C64F]/40 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-slate-900 mb-3">저장된 리포트가 없습니다</h3>
            <p className="text-slate-500 text-lg mb-8">리포트를 생성하여 저장해보세요.</p>
            <Button
              onClick={() => navigate("/")}
              className="bg-[#F5C64F] hover:bg-[#FFD666] text-[#2B3642] shadow-lg shadow-[#F5C64F]/25 rounded-2xl px-8"
            >
              새 리포트 작성하기
            </Button>
          </Card>
        ) : filteredReports.length === 0 ? (
          <Card className="p-16 text-center border-slate-900/10 bg-white/80 backdrop-blur-xl rounded-2xl">
            <Filter className="h-20 w-20 text-[#F5C64F]/40 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-slate-900 mb-3">필터에 맞는 리포트가 없습니다</h3>
            <p className="text-slate-500 text-lg mb-8">다른 조건으로 검색해보세요.</p>
            <Button
              variant="outline"
              onClick={() => { setTeacherFilter("all"); setExamFilter("all"); setYearFilter("all"); }}
              className="border-[#F5C64F]/30 text-[#F5C64F] hover:bg-[#F5C64F]/10 rounded-2xl px-8"
            >
              필터 초기화
            </Button>
          </Card>
        ) : showTeacherCategories ? (
          /* Teacher Categories View by School Type */
          <div className="space-y-12">
            {['고등부', '중등부'].map((schoolType) => {
              const teachers = teacherSummariesBySchoolType[schoolType] || [];
              if (teachers.length === 0) return null;
              return (
                <div key={schoolType}>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-2.5 rounded-full bg-[#F5C64F]/10">
                      <User className="h-6 w-6 text-[#F5C64F]" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
                      {schoolType} 리포트
                    </h2>
                    <Badge className="bg-[#F5C64F]/10 text-[#F5C64F] border border-[#F5C64F]/25 px-3 py-1">
                      {teachers.length}명
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {teachers.map((t) => (
                      <button
                        key={t.teacher}
                        onClick={() => setTeacherFilter(t.teacher)}
                        className="group relative border border-slate-900/10 bg-white/80 backdrop-blur-xl overflow-hidden hover:border-slate-900/20  transition-all duration-300 rounded-2xl text-left"
                      >
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#F5C64F] via-[#FFE9A8] to-[#F5C64F] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="p-6 flex items-center gap-4">
                          <Avatar className="h-16 w-16 rounded-full ring-2 ring-white/15">
                            <AvatarImage src={t.photo || undefined} alt={t.teacher} className="object-cover" />
                            <AvatarFallback className="bg-slate-900/5 text-[#F5C64F] text-lg font-bold rounded-full">
                              {t.teacher.substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-900 text-lg mb-1 truncate">
                              {t.teacher} 선생님
                            </h4>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge className="bg-[#F5C64F]/10 text-[#F5C64F] border border-[#F5C64F]/25 text-xs">
                                {t.count}개 리포트
                              </Badge>
                              <span className="text-xs text-slate-500">{schoolType}</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1.5">
                              최근 {formatDate(t.latest)}
                            </p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-slate-900/30 group-hover:text-[#F5C64F] transition-colors" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Reports by School Type */
          <div className="space-y-16">
            <div className="flex items-center justify-between mb-2">
              <Button
                variant="ghost"
                onClick={() => setTeacherFilter("all")}
                className="flex items-center gap-2 text-slate-600 hover:text-[#F5C64F] hover:bg-[#F5C64F]/10 -ml-3 rounded-2xl"
              >
                <ArrowLeft size={16} />
                <span className="font-medium">선생님 목록으로</span>
              </Button>
            </div>
            {Object.entries(groupedReports).map(([schoolType, teacherGroups]) => {
              const schoolReports = Object.values(teacherGroups).flat();
              return (
                <section key={schoolType}>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-2.5 rounded-full bg-[#F5C64F]/10">
                      <School className="h-6 w-6 text-[#F5C64F]" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
                      {schoolType}
                    </h2>
                    <Badge className="bg-[#F5C64F]/10 text-slate-900 border border-[#F5C64F]/25 px-3 py-1">
                      {schoolReports.length}개 리포트
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {schoolReports.map(report => (
                      <Card
                        key={report.id}
                        className="group relative border border-slate-900/10 bg-white/80 backdrop-blur-xl overflow-hidden hover:border-slate-900/20  transition-all duration-300 rounded-2xl"
                      >
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#F5C64F] via-[#FFE9A8] to-[#F5C64F] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4 mb-4">
                            <Avatar className="h-14 w-14 rounded-full ring-2 ring-white/15">
                              <AvatarImage src={report.teacher_photo || undefined} alt={report.teacher} className="object-cover" />
                              <AvatarFallback className="bg-slate-900/5 text-[#F5C64F] text-base font-bold rounded-full">
                                {report.teacher.substring(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-slate-900 text-base mb-1 truncate">
                                {report.teacher} 선생님
                              </h4>
                            </div>
                            <Badge
                              className={`text-xs px-2.5 py-1 font-medium border ${
                                report.analysisType === 'simple'
                                  ? 'bg-slate-900/5 text-[#0F1B33] border-slate-900/10'
                                  : 'bg-[#F5C64F]/10 text-[#0F1B33] border-[#F5C64F]/25'
                              }`}
                            >
                              {report.analysisType === 'simple' ? '간단분석' : '상세분석'}
                            </Badge>
                          </div>

                          <div className="relative mb-5 flex items-stretch gap-3">
                            {getSchoolLogo(report.school) && (
                              <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-slate-900/5 border border-slate-900/10 p-2 flex items-center justify-center self-center">
                                <img
                                  src={getSchoolLogo(report.school)!}
                                  alt={`${report.school} 로고`}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            )}
                            <div className="flex flex-col justify-center gap-1.5">
                              <Badge className="w-fit inline-flex items-center gap-1 bg-[#F5C64F]/10 text-[#0F1B33] border border-[#F5C64F]/25 px-2 py-1 text-xs font-bold tracking-tight">
                                {getSchoolLogo(report.school) && (
                                  <img
                                    src={getSchoolLogo(report.school)!}
                                    alt={`${report.school} 로고`}
                                    className="h-3.5 w-3.5 object-contain flex-shrink-0"
                                  />
                                )}
                                {report.school}{report.grade}
                              </Badge>
                              <p className="font-semibold text-slate-900 leading-snug line-clamp-2">
                                {report.examInfo || "시험 분석 리포트"}
                              </p>
                            </div>
                            <div className="ml-auto flex flex-col items-end justify-center gap-1 text-sm text-slate-500">
                              <CalendarDays className="h-3.5 w-3.5 text-[#F5C64F]" />
                              <span>{formatDate(report.created_at)}</span>
                            </div>
                          </div>

                          <div className="flex gap-2 pt-4 border-t border-slate-900/10">
                            <Button
                              onClick={() => handleView(report.id)}
                              className="btn-premium flex-1 h-12 text-[15px] rounded-2xl"
                            >
                              <Eye className="h-4 w-4 mr-1.5 relative z-10" />
                              <span className="font-semibold relative z-10">분석지 확인</span>
                            </Button>
                            <Button
                              onClick={() => handleEdit(report.id)}
                              className="btn-premium flex-1 h-12 text-[15px] rounded-2xl"
                            >
                              <Edit className="h-4 w-4 mr-1.5 relative z-10" />
                              <span className="font-semibold relative z-10">수정</span>
                            </Button>

                            <Button
                              variant="outline"
                              onClick={() => handleDelete(report.id)}
                              className="h-12 w-12 bg-white/90 text-slate-900 border-white hover:bg-white hover:text-red-600 rounded-2xl shadow-sm"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>

                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStudentSubmit(report.id)}
                            className="w-full mt-2 h-8 text-xs bg-[#F5C64F] text-slate-900 border-[#F5C64F] hover:bg-[#e6b73f] hover:text-slate-900 hover:border-[#e6b73f] rounded-xl shadow-md shadow-[#F5C64F]/20"
                          >
                            <Users className="h-3 w-3 mr-1" />
                              <span className="font-medium">학생 성적 제출</span>
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
      <StudentSubmissionsDialog
        open={submissionsOpen}
        onOpenChange={setSubmissionsOpen}
        reportId={submissionsReportId}
        reportMeta={submissionsReportMeta}
        problems={submissionsProblems}
      />
    </div>
  );
};
export default SavedReports;