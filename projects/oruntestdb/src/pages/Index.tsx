import { useState, useMemo } from "react";
import Header from "@/components/Header";
import FilterBar from "@/components/FilterBar";
import QuestionTable from "@/components/QuestionTable";
import ExamUploadSection from "@/components/ExamUploadSection";
import { useQuestions } from "@/hooks/useQuestions";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { exportQuestionsToWord } from "@/utils/wordExport";
import { toast } from "@/hooks/use-toast";
const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("all");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [selectedQuestionType, setSelectedQuestionType] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedSemester, setSelectedSemester] = useState("all");
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const {
    data: allQuestions = [],
    isLoading
  } = useQuestions();
  const availableSchools = useMemo(() => {
    const schools = new Set<string>();
    allQuestions.forEach(q => {
      if (q.school) {
        schools.add(q.school);
      }
    });
    return Array.from(schools).sort();
  }, [allQuestions]);
  const filteredQuestions = useMemo(() => {
    return allQuestions.filter(q => {
      const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase()) || q.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSchool = selectedSchool === "all" || q.school.includes(selectedSchool);
      const matchesGrade = selectedGrade === "all" || q.grade === selectedGrade;
      const matchesQuestionType = selectedQuestionType === "all" || q.question_type === selectedQuestionType;
      const matchesDifficulty = selectedDifficulty === "all" || q.difficulty === selectedDifficulty;
      const matchesYear = selectedYear === "all" || q.exam_year === selectedYear;
      const matchesSemester = selectedSemester === "all" || q.semester === selectedSemester;
      return matchesSearch && matchesSchool && matchesGrade && matchesQuestionType && matchesDifficulty && matchesYear && matchesSemester;
    });
  }, [allQuestions, searchQuery, selectedSchool, selectedGrade, selectedQuestionType, selectedDifficulty, selectedYear, selectedSemester]);

  const handleExportToWord = async () => {
    const selectedQuestions = allQuestions.filter(q => selectedQuestionIds.includes(q.id));
    if (selectedQuestions.length === 0) {
      toast({
        title: "문제를 선택해주세요",
        description: "Word로 저장할 문제를 선택해주세요.",
        variant: "destructive",
      });
      return;
    }
    try {
      await exportQuestionsToWord(selectedQuestions);
      toast({
        title: "저장 완료",
        description: `${selectedQuestions.length}개의 문제가 Word 파일로 저장되었습니다.`,
      });
    } catch (error) {
      toast({
        title: "저장 실패",
        description: "Word 파일 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/30 font-sans">
      <Header />
      
      <main className="container mx-auto px-6 py-8 space-y-6 max-w-[1600px] 2xl:max-w-[1800px]">
        <FilterBar searchQuery={searchQuery} onSearchChange={setSearchQuery} selectedSchool={selectedSchool} onSchoolChange={setSelectedSchool} selectedGrade={selectedGrade} onGradeChange={setSelectedGrade} selectedQuestionType={selectedQuestionType} onQuestionTypeChange={setSelectedQuestionType} selectedDifficulty={selectedDifficulty} onDifficultyChange={setSelectedDifficulty} selectedYear={selectedYear} onYearChange={setSelectedYear} selectedSemester={selectedSemester} onSemesterChange={setSelectedSemester} availableSchools={availableSchools} />

        {isLoading ? <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">문제를 불러오는 중...</p>
          </div> : <div className="bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-sm rounded-2xl p-8 border border-border/50 shadow-lg">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-foreground tracking-tight">학교별 대표문항 &amp; 서답형</h2>
                <p className="text-sm text-muted-foreground mt-2 font-medium">
                  전체 <span className="font-bold text-primary text-base">{filteredQuestions.length}</span>개의 문제
                  {selectedQuestionIds.length > 0 && (
                    <span className="ml-2">
                      / <span className="font-bold text-amber-600">{selectedQuestionIds.length}</span>개 선택됨
                    </span>
                  )}
                </p>
              </div>
              {selectedQuestionIds.length > 0 && (
                <Button
                  onClick={handleExportToWord}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  선택한 문제 Word로 저장
                </Button>
              )}
            </div>
            
            <QuestionTable 
              questions={filteredQuestions} 
              selectedQuestionIds={selectedQuestionIds}
              onSelectionChange={setSelectedQuestionIds}
            />
          </div>}

        <ExamUploadSection availableSchools={availableSchools} />
      </main>

      <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border/50">
        <p>© 2025 ORUN English. All rights reserved.</p>
      </footer>
    </div>;
};
export default Index;