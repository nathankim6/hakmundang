import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedSchool: string;
  onSchoolChange: (value: string) => void;
  selectedGrade: string;
  onGradeChange: (value: string) => void;
  selectedQuestionType: string;
  onQuestionTypeChange: (value: string) => void;
  selectedDifficulty: string;
  onDifficultyChange: (value: string) => void;
  selectedYear: string;
  onYearChange: (value: string) => void;
  selectedSemester: string;
  onSemesterChange: (value: string) => void;
  availableSchools: string[];
}

const FilterBar = ({
  searchQuery,
  onSearchChange,
  selectedSchool,
  onSchoolChange,
  selectedGrade,
  onGradeChange,
  selectedQuestionType,
  onQuestionTypeChange,
  selectedDifficulty,
  onDifficultyChange,
  selectedYear,
  onYearChange,
  selectedSemester,
  onSemesterChange,
  availableSchools,
}: FilterBarProps) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-900/30 rounded-2xl shadow-lg border border-border/50 p-8 space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            placeholder="문제를 검색하세요..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-12 h-12 text-base font-medium rounded-xl border-2 focus:border-primary transition-colors"
          />
        </div>
        <Button variant="default" className="h-12 px-8 rounded-xl font-semibold text-base shadow-md hover:shadow-lg transition-all">검색</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Select value={selectedSchool} onValueChange={onSchoolChange}>
          <SelectTrigger>
            <SelectValue placeholder="학교 선택" />
          </SelectTrigger>
          <SelectContent className="bg-popover z-50">
            <SelectItem value="all">전체 학교</SelectItem>
            {availableSchools.map((school) => (
              <SelectItem key={school} value={school}>
                {school}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedGrade} onValueChange={onGradeChange}>
          <SelectTrigger>
            <SelectValue placeholder="학년 선택" />
          </SelectTrigger>
          <SelectContent className="bg-popover z-50">
            <SelectItem value="all">전체 학년</SelectItem>
            <SelectItem value="1학년">1학년</SelectItem>
            <SelectItem value="2학년">2학년</SelectItem>
            <SelectItem value="3학년">3학년</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedQuestionType} onValueChange={onQuestionTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="문제유형 선택" />
          </SelectTrigger>
          <SelectContent className="bg-popover z-50">
            <SelectItem value="all">전체 유형</SelectItem>
            <SelectItem value="배열영작">배열영작</SelectItem>
            <SelectItem value="조건영작">조건영작</SelectItem>
            <SelectItem value="요약문(영작)">요약문(영작)</SelectItem>
            <SelectItem value="요약문(어휘)">요약문(어휘)</SelectItem>
            <SelectItem value="어법수정">어법수정</SelectItem>
            <SelectItem value="어휘수정">어휘수정</SelectItem>
            <SelectItem value="요지쓰기">요지쓰기</SelectItem>
            <SelectItem value="Signiture">Signiture</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedDifficulty} onValueChange={onDifficultyChange}>
          <SelectTrigger>
            <SelectValue placeholder="난이도 선택" />
          </SelectTrigger>
          <SelectContent className="bg-popover z-50">
            <SelectItem value="all">전체 난이도</SelectItem>
            <SelectItem value="최상">최상</SelectItem>
            <SelectItem value="상">상</SelectItem>
            <SelectItem value="중">중</SelectItem>
            <SelectItem value="하">하</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedYear} onValueChange={onYearChange}>
          <SelectTrigger>
            <SelectValue placeholder="출제연도" />
          </SelectTrigger>
          <SelectContent className="bg-popover z-50">
            <SelectItem value="all">전체 연도</SelectItem>
            <SelectItem value="2024">2024년</SelectItem>
            <SelectItem value="2023">2023년</SelectItem>
            <SelectItem value="2022">2022년</SelectItem>
            <SelectItem value="2021">2021년</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedSemester} onValueChange={onSemesterChange}>
          <SelectTrigger>
            <SelectValue placeholder="학기 선택" />
          </SelectTrigger>
          <SelectContent className="bg-popover z-50">
            <SelectItem value="all">전체 학기</SelectItem>
            <SelectItem value="1학기 중간">1학기 중간</SelectItem>
            <SelectItem value="1학기 기말">1학기 기말</SelectItem>
            <SelectItem value="2학기 중간">2학기 중간</SelectItem>
            <SelectItem value="2학기 기말">2학기 기말</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default FilterBar;
