import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getReportCards, deleteReportCard, convertDbToAppFormat } from "@/integrations/supabase/reportService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Edit, Trash2, Plus, School, FileText, CalendarDays, Eye, User } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getSchoolThemeColor, getThemeClasses } from "@/utils/themeColorUtils";
import { Badge } from "@/components/ui/badge";

type SavedReport = {
  id: string;
  school: string;
  grade: string;
  examScope: string;
  examInfo?: string;
  teacher: string;
  created_at: string;
  updated_at: string;
};

const SavedReports: React.FC = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchReports = async () => {
    setIsLoading(true);
    const { data, error } = await getReportCards();
    
    if (error) {
      toast.error("리포트를 불러오는데 실패했습니다: " + error.message);
      setIsLoading(false);
      return;
    }
    
    if (data) {
      // Convert the database format to the application format that matches our SavedReport type
      // Use type assertion to help TypeScript understand the structure
      const typedData = data as any[];
      
      const convertedReports = typedData.map(report => ({
        id: report.id,
        school: report.school,
        grade: report.grade,
        examScope: report.exam_scope,
        examInfo: report.exam_info,
        teacher: report.teacher,
        created_at: report.created_at,
        updated_at: report.updated_at
      }));
      
      setReports(convertedReports);
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, []);

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
      return format(new Date(dateString), "yyyy년 MM월 dd일 HH:mm");
    } catch (e) {
      return "날짜 정보 없음";
    }
  };

  // Group reports by school type (high school, middle school, other)
  const groupedReports = {
    highSchool: reports.filter(report => report.school.includes('고등')),
    middleSchool: reports.filter(report => report.school.includes('중학')),
    other: reports.filter(report => !report.school.includes('고등') && !report.school.includes('중학'))
  };

  // Function to further categorize reports by grade
  const categorizeByGrade = (reportList: SavedReport[]) => {
    const gradeCategories: Record<string, SavedReport[]> = {};
    reportList.forEach(report => {
      // Extract the grade information
      let grade = report.grade.trim();

      // If the grade doesn't exist as a key yet, create it
      if (!gradeCategories[grade]) {
        gradeCategories[grade] = [];
      }

      // Add the report to its grade category
      gradeCategories[grade].push(report);
    });
    return gradeCategories;
  };

  // Function to render a section with grade categories
  const renderGradeCategories = (schoolReports: SavedReport[], schoolType: string) => {
    const gradeCategories = categorizeByGrade(schoolReports);
    const grades = Object.keys(gradeCategories).sort();
    if (grades.length === 0) return null;
    let headerConfig = {
      icon: <School />,
      title: schoolType,
      bgColor: "bg-indigo-100/80",
      textColor: "text-indigo-600",
      borderColor: "border-indigo-100",
      gradient: "from-indigo-700 to-blue-700"
    };
    if (schoolType === "중등부") {
      headerConfig = {
        icon: <School />,
        title: "중등부",
        bgColor: "bg-blue-100/80",
        textColor: "text-blue-600",
        borderColor: "border-blue-100",
        gradient: "from-blue-700 to-cyan-600"
      };
    } else if (schoolType === "기타") {
      headerConfig = {
        icon: <FileText />,
        title: "기타",
        bgColor: "bg-gray-100/80",
        textColor: "text-gray-600",
        borderColor: "border-gray-200",
        gradient: "from-gray-700 to-gray-500"
      };
    }
    return <div>
        <div className="flex items-center gap-2 mb-5 pb-3 border-b" style={{
        borderColor: `var(--${headerConfig.borderColor})`
      }}>
          <div className={`${headerConfig.bgColor} backdrop-blur-sm rounded-lg p-2.5`}>
            {headerConfig.icon}
          </div>
          <h2 className="text-4xl text-gray-900">
            {headerConfig.title}
          </h2>
          <div className={`ml-2 px-3 py-1 ${headerConfig.bgColor.replace('/80', '/50')} backdrop-blur-sm rounded-full text-xs ${headerConfig.textColor} font-medium border border-${headerConfig.borderColor}/50`}>
            {schoolReports.length}건
          </div>
        </div>
        
        <div className="space-y-8">
          {grades.map(grade => <div key={grade} className="mb-6">
              <div className="flex items-center gap-2 mb-3 pl-2 border-l-4" style={{
            borderColor: schoolType === "고등부" ? "var(--indigo-400)" : schoolType === "중등부" ? "var(--blue-400)" : "var(--gray-400)"
          }}>
                <h3 className="text-gray-700 font-extrabold text-2xl">{grade}</h3>
                <div className="px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">
                  {gradeCategories[grade].length}건
                </div>
              </div>
              {renderReportCards(gradeCategories[grade])}
            </div>)}
        </div>
      </div>;
  };

  // Function to render report cards with appropriate theme colors
  const renderReportCards = (reportList: SavedReport[]) => {
    return <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportList.map(report => {
        // Get theme color based on school and grade
        const {
          color
        } = getSchoolThemeColor(report.school, report.grade);
        const themeClasses = getThemeClasses(report.school, report.grade);
        return <Card key={report.id} className="overflow-hidden border-0 hover:shadow-xl transition-all duration-300 rounded-xl bg-white/80 backdrop-blur-md">
            <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
              <div className={`relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-${color}-300 to-${color}-600 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]`}></div>
            </div>
            
            <CardHeader className={`p-6 bg-gradient-to-r from-${color}-50/90 to-white/90 backdrop-filter backdrop-blur-lg border-b border-${color}-100/50`}>
              <div className="flex justify-between items-start mb-2">
                <CardTitle className="text-xl text-gray-800 line-clamp-1 flex items-center gap-2 font-light">
                  <div className={`p-1.5 rounded-lg bg-${color}-100/80 text-${color}-600`}>
                    <FileText className="h-5 w-5" />
                  </div>
                  <span>{report.examInfo || "제목 없음"}</span>
                </CardTitle>

                <div className={`flex items-center gap-1.5 bg-gradient-to-r from-${color}-50/80 to-white/80 
                  backdrop-filter backdrop-blur-md px-3 py-1.5 rounded-full text-sm shadow-sm border 
                  animate-fade-in font-medium transition-all duration-300 hover:shadow-md`} style={{
                borderColor: `var(--${color}-200)`,
                boxShadow: `0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px 0 rgba(0,0,0,0.06), 0 0 0 1px var(--${color}-100)`
              }}>
                  <User className={`h-3.5 w-3.5 text-${color}-600`} />
                  <span className={`text-${color}-700`}>{report.teacher} 선생님</span>
                </div>
              </div>
              
              <CardDescription className="text-sm flex flex-col gap-2 mt-1">
                <div className="flex items-center gap-2">
                  <div className={`p-1 rounded-md bg-${color}-50 text-${color}-500`}>
                    <School className="h-4 w-4" />
                  </div>
                  <span className="font-noto text-gray-800 text-base font-semibold">{report.school}, {report.grade}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`p-1 rounded-md bg-${color}-50 text-${color}-500`}>
                    <CalendarDays className="h-4 w-4" />
                  </div>
                  <span className="text-gray-600 font-noto">{formatDate(report.created_at)}</span>
                </div>
              </CardDescription>
            </CardHeader>
            
            <CardFooter className="bg-gray-50/90 backdrop-filter backdrop-blur-sm p-4 flex justify-between border-t border-gray-100">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleView(report.id)} className={`flex items-center gap-1 bg-white hover:bg-${color}-50 transition-all duration-300`} style={{
                color: `var(--${color}-600)`,
                borderColor: `var(--${color}-200)`
              }}>
                  <Eye className="h-4 w-4" />
                  <span>보기</span>
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleEdit(report.id)} className="flex items-center gap-1 text-emerald-600 border-emerald-200 bg-white hover:bg-emerald-50 transition-all duration-300">
                  <Edit className="h-4 w-4" />
                  <span>수정</span>
                </Button>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleDelete(report.id)} className="flex items-center gap-1 text-red-600 border-red-200 bg-white hover:bg-red-50 transition-all duration-300">
                <Trash2 className="h-4 w-4" />
                <span>삭제</span>
              </Button>
            </CardFooter>
          </Card>;
      })}
      </div>;
  };

  return <div className="min-h-screen bg-gradient-to-br from-blue-50/80 via-indigo-50/80 to-purple-50/80 py-8 px-4">
      <div className="absolute top-0 -z-10 h-full w-full">
        <div className="absolute inset-0 bg-white bg-opacity-60 backdrop-blur-xl"></div>
        <div className="absolute bottom-auto left-auto right-0 top-0 h-[500px] w-[500px] -translate-x-[30%] translate-y-[20%] rounded-full bg-gradient-to-r from-indigo-200 to-blue-300 opacity-20 blur-3xl"></div>
        <div className="absolute bottom-auto left-0 right-auto top-0 h-[500px] w-[500px] translate-x-[15%] translate-y-[10%] rounded-full bg-gradient-to-r from-purple-200 to-indigo-300 opacity-20 blur-3xl"></div>
      </div>

      <div className="w-full max-w-6xl mx-auto relative z-10">
        <div className="flex justify-between items-center mb-8">
          <Button variant="outline" onClick={() => navigate("/")} className="flex items-center gap-2 bg-white/70 backdrop-blur-sm hover:bg-white transition-all duration-300 rounded-full px-5 shadow-sm border-white/60">
            <ArrowLeft size={16} className="text-blue-600" />
            <span className="text-blue-600">돌아가기</span>
          </Button>
          
          <Button onClick={() => navigate("/")} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transition-all duration-300 rounded-full px-5 shadow-md">
            <Plus size={16} />
            <span>새 리포트 작성</span>
          </Button>
        </div>
        
        <Card className="bg-white/90 backdrop-filter backdrop-blur-xl shadow-xl border-0 rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50/80 via-indigo-50/80 to-violet-50/80 border-b border-gray-100/80 p-8">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100/80 to-indigo-100/80 backdrop-blur-sm">
                <FileText className="h-8 w-8 text-indigo-600" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center text-gray-800 font-semibold">
              저장된 시험 분석 리포트
            </CardTitle>
            <CardDescription className="text-center text-base mt-2">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">모든 시험 분석 리포트를</span> 한눈에 확인하고 관리하세요
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-8">
            {isLoading ? <div className="flex flex-col items-center justify-center h-40">
                <div className="relative w-16 h-16">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full opacity-75 blur-sm"></div>
                  <div className="absolute inset-0 rounded-full border-t-4 border-blue-600 animate-spin"></div>
                  <div className="absolute inset-2 rounded-full border-t-4 border-indigo-500 animate-spin animation-delay-150"></div>
                  <div className="absolute inset-4 rounded-full border-t-4 border-violet-400 animate-spin animation-delay-300"></div>
                </div>
                <p className="mt-4 text-indigo-900 font-medium">리포트를 불러오는 중...</p>
              </div> : reports.length === 0 ? <div className="bg-gray-50/80 backdrop-blur-sm rounded-xl p-12 text-center">
                <div className="flex justify-center">
                  <div className="p-4 rounded-full bg-gray-100">
                    <FileText className="h-16 w-16 text-gray-400" />
                  </div>
                </div>
                <h3 className="mt-6 text-xl font-medium text-gray-700">저장된 리포트가 없습니다</h3>
                <p className="mt-2 text-gray-500">리포트를 생성하여 저장해보세요.</p>
                <Button onClick={() => navigate("/")} className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-full px-6">
                  새 리포트 작성하기
                </Button>
              </div> : <div className="space-y-12">
                {/* 고등부 Section */}
                {groupedReports.highSchool.length > 0 && renderGradeCategories(groupedReports.highSchool, "고등부")}

                {/* 중등부 Section */}
                {groupedReports.middleSchool.length > 0 && renderGradeCategories(groupedReports.middleSchool, "중등부")}

                {/* 기타 Section - for any reports that don't clearly match high or middle school */}
                {groupedReports.other.length > 0 && renderGradeCategories(groupedReports.other, "기타")}
              </div>}
          </CardContent>
        </Card>
      </div>
    </div>;
};

export default SavedReports;
