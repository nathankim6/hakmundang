import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Upload, Download, Trash2, FileText, ChevronDown, ChevronRight, School, Calendar, GraduationCap, FolderOpen } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useExamFiles, useUploadExamFile, useDeleteExamFile } from "@/hooks/useExamFiles";
import { useSchools } from "@/hooks/useSchools";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";

interface ExamUploadSectionProps {
  availableSchools: string[];
}

const ExamUploadSection = ({ availableSchools }: ExamUploadSectionProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [school, setSchool] = useState("");
  const [grade, setGrade] = useState("");
  const [examYear, setExamYear] = useState("");
  const [semester, setSemester] = useState("");
  const [deleteId, setDeleteId] = useState<{ id: string; file_path: string } | null>(null);
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set());
  const [expandedSchools, setExpandedSchools] = useState<Set<string>>(new Set());
  const [expandedGrades, setExpandedGrades] = useState<Set<string>>(new Set());
  const [showUpload, setShowUpload] = useState(false);

  const { toast } = useToast();

  const { data: examFiles = [], isLoading } = useExamFiles();
  const uploadMutation = useUploadExamFile();
  const deleteMutation = useDeleteExamFile();
  const { schools } = useSchools();

  const examSchools = useMemo(() => {
    return schools.map(s => s.name).sort();
  }, [schools]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !school || !grade || !examYear || !semester) {
      return;
    }

    uploadMutation.mutate(
      { file: selectedFile, school, grade, exam_year: examYear, semester },
      {
        onSuccess: () => {
          setSelectedFile(null);
          setSchool("");
          setGrade("");
          setExamYear("");
          setSemester("");
          const fileInput = document.getElementById("file-upload") as HTMLInputElement;
          if (fileInput) fileInput.value = "";
        },
      }
    );
  };

  const handleDownload = async (filePath: string, fileName: string) => {
    const { data } = await supabase.storage.from("past_exams").download(filePath);
    if (data) {
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleDelete = (id: string, file_path: string) => {
    setDeleteId({ id, file_path });
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
      setDeleteId(null);
    }
  };

  const toggleFileSelection = (fileId: string) => {
    setSelectedFileIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  };

  const handleDownloadMultiple = async (files: typeof examFiles) => {
    if (files.length === 0) return;

    toast({
      title: "다운로드 시작",
      description: `${files.length}개의 파일을 다운로드합니다...`,
    });

    for (const file of files) {
      await handleDownload(file.file_path, file.file_name);
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    toast({
      title: "다운로드 완료",
      description: `${files.length}개의 파일이 다운로드되었습니다.`,
    });
  };

  const handleDownloadSelected = async () => {
    const selectedFiles = examFiles.filter((file) => selectedFileIds.has(file.id));
    await handleDownloadMultiple(selectedFiles);
    setSelectedFileIds(new Set());
  };

  const years = Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() - i).toString());

  const getSchoolLogo = (school: string) => {
    const schoolData = schools.find(s => s.name === school);
    return schoolData?.logo_path || undefined;
  };

  const getSemesterColor = (semester: string) => {
    const colorMap: Record<string, string> = {
      "1학기 중간": "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      "1학기 기말": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      "2학기 중간": "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      "2학기 기말": "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    };
    return colorMap[semester] || "bg-secondary text-secondary-foreground";
  };

  const getGradeBadgeColor = (grade: string) => {
    const colorMap: Record<string, string> = {
      "1학년": "bg-blue-500 hover:bg-blue-600",
      "2학년": "bg-emerald-500 hover:bg-emerald-600",
      "3학년": "bg-violet-500 hover:bg-violet-600",
    };
    return colorMap[grade] || "bg-primary";
  };

  const toggleSchool = (schoolName: string) => {
    setExpandedSchools((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(schoolName)) {
        newSet.delete(schoolName);
      } else {
        newSet.add(schoolName);
      }
      return newSet;
    });
  };

  const toggleGrade = (key: string) => {
    setExpandedGrades((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  // Group files by school
  const filesBySchool = useMemo(() => {
    const grouped: Record<string, typeof examFiles> = {};
    examFiles.forEach((file) => {
      if (!grouped[file.school]) grouped[file.school] = [];
      grouped[file.school].push(file);
    });
    return grouped;
  }, [examFiles]);

  // Group files by school and grade
  const filesBySchoolAndGrade = useMemo(() => {
    const grouped: Record<string, typeof examFiles> = {};
    examFiles.forEach((file) => {
      const key = `${file.school}-${file.grade}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(file);
    });
    // Sort files within each group
    Object.keys(grouped).forEach((key) => {
      grouped[key].sort((a, b) => {
        // Sort by year desc, then semester order
        const yearDiff = parseInt(b.exam_year) - parseInt(a.exam_year);
        if (yearDiff !== 0) return yearDiff;
        const semesterOrder: Record<string, number> = {
          "1학기 중간": 1,
          "1학기 기말": 2,
          "2학기 중간": 3,
          "2학기 기말": 4,
        };
        return (semesterOrder[a.semester] || 0) - (semesterOrder[b.semester] || 0);
      });
    });
    return grouped;
  }, [examFiles]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
              <FolderOpen className="h-7 w-7 text-primary" />
            </div>
            기출문제 자료실
          </h2>
          <p className="text-muted-foreground mt-2">학교를 선택하여 기출문제를 다운로드하세요</p>
        </div>
        <div className="flex gap-3">
          {selectedFileIds.size > 0 && (
            <Button onClick={handleDownloadSelected} size="lg" className="gap-2 shadow-lg">
              <Download className="h-5 w-5" />
              선택 다운로드 ({selectedFileIds.size})
            </Button>
          )}
          <Button 
            onClick={() => setShowUpload(!showUpload)} 
            variant={showUpload ? "secondary" : "outline"}
            size="lg"
            className="gap-2"
          >
            <Upload className="h-5 w-5" />
            {showUpload ? "닫기" : "업로드"}
          </Button>
        </div>
      </div>

      {/* Upload Section - Collapsible */}
      <Collapsible open={showUpload} onOpenChange={setShowUpload}>
        <CollapsibleContent>
          <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Upload className="h-5 w-5 text-primary" />
                기출문제 업로드
              </CardTitle>
              <CardDescription>학교, 학년, 연도, 학기를 선택하고 파일을 업로드하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="school-select">학교</Label>
                    <Select value={school} onValueChange={setSchool}>
                      <SelectTrigger id="school-select">
                        <SelectValue placeholder="학교 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {examSchools.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="grade-select">학년</Label>
                    <Select value={grade} onValueChange={setGrade}>
                      <SelectTrigger id="grade-select">
                        <SelectValue placeholder="학년 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1학년">1학년</SelectItem>
                        <SelectItem value="2학년">2학년</SelectItem>
                        <SelectItem value="3학년">3학년</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="year-select">연도</Label>
                    <Select value={examYear} onValueChange={setExamYear}>
                      <SelectTrigger id="year-select">
                        <SelectValue placeholder="연도 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}년
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="semester-select">학기</Label>
                    <Select value={semester} onValueChange={setSemester}>
                      <SelectTrigger id="semester-select">
                        <SelectValue placeholder="학기 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1학기 중간">1학기 중간</SelectItem>
                        <SelectItem value="1학기 기말">1학기 기말</SelectItem>
                        <SelectItem value="2학기 중간">2학기 중간</SelectItem>
                        <SelectItem value="2학기 기말">2학기 기말</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-4 items-end">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="file-upload">파일</Label>
                    <Input id="file-upload" type="file" onChange={handleFileChange} accept=".pdf,.doc,.docx" />
                  </div>
                  <Button
                    onClick={handleUpload}
                    disabled={!selectedFile || !school || !grade || !examYear || !semester || uploadMutation.isPending}
                    className="px-8"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {uploadMutation.isPending ? "업로드 중..." : "업로드"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* School Cards Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground">로딩 중...</p>
          </div>
        </div>
      ) : examSchools.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <School className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-xl font-semibold text-muted-foreground">등록된 학교가 없습니다</h3>
          <p className="text-muted-foreground mt-2">학교 관리에서 학교를 추가해주세요</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {examSchools.map((schoolName) => {
            const schoolFiles = filesBySchool[schoolName] || [];
            const fileCount = schoolFiles.length;
            const isExpanded = expandedSchools.has(schoolName);
            const logo = getSchoolLogo(schoolName);
            const gradeGroups = ["1학년", "2학년", "3학년"].map(grade => ({
              grade,
              files: filesBySchoolAndGrade[`${schoolName}-${grade}`] || []
            })).filter(g => g.files.length > 0);

            return (
              <Card 
                key={schoolName} 
                className={`group relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                  isExpanded ? 'ring-2 ring-primary shadow-xl' : 'hover:ring-1 hover:ring-primary/50'
                }`}
              >
                {/* Card Header - Always Visible */}
                <div 
                  className="cursor-pointer"
                  onClick={() => toggleSchool(schoolName)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-4">
                      {/* School Logo */}
                      <div className="relative">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center overflow-hidden border border-border/50">
                          {logo ? (
                            <img 
                              src={logo} 
                              alt={`${schoolName} 로고`}
                              className="w-12 h-12 object-contain"
                            />
                          ) : (
                            <School className="h-8 w-8 text-primary/60" />
                          )}
                        </div>
                        {fileCount > 0 && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
                            {fileCount}
                          </div>
                        )}
                      </div>
                      
                      {/* School Info */}
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-bold truncate">{schoolName}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <FileText className="h-3.5 w-3.5" />
                          {fileCount > 0 ? `${fileCount}개의 기출문제` : '기출문제 없음'}
                        </CardDescription>
                      </div>

                      {/* Expand Icon */}
                      <div className={`p-2 rounded-lg transition-all ${isExpanded ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5" />
                        ) : (
                          <ChevronRight className="h-5 w-5" />
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  {/* Grade Summary - Preview */}
                  {!isExpanded && gradeGroups.length > 0 && (
                    <CardContent className="pt-0 pb-4">
                      <div className="flex flex-wrap gap-2">
                        {gradeGroups.map(({ grade, files }) => (
                          <Badge 
                            key={grade} 
                            variant="secondary" 
                            className={`${getGradeBadgeColor(grade)} text-white`}
                          >
                            <GraduationCap className="h-3 w-3 mr-1" />
                            {grade} ({files.length})
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </div>

                {/* Expanded Content */}
                <Collapsible open={isExpanded}>
                  <CollapsibleContent>
                    <CardContent className="pt-0 border-t border-border/50">
                      {fileCount === 0 ? (
                        <div className="py-8 text-center text-muted-foreground">
                          <FileText className="h-10 w-10 mx-auto mb-2 opacity-30" />
                          <p className="text-sm">아직 업로드된 기출문제가 없습니다</p>
                        </div>
                      ) : (
                        <div className="space-y-3 pt-4">
                          {/* Quick Download All Button */}
                          <Button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadMultiple(schoolFiles);
                            }}
                            className="w-full gap-2"
                            variant="secondary"
                          >
                            <Download className="h-4 w-4" />
                            전체 다운로드 ({fileCount}개)
                          </Button>

                          {/* Grade Sections */}
                          {["1학년", "2학년", "3학년"].map((gradeName) => {
                            const key = `${schoolName}-${gradeName}`;
                            const gradeFiles = filesBySchoolAndGrade[key] || [];
                            if (gradeFiles.length === 0) return null;
                            
                            const isGradeExpanded = expandedGrades.has(key);

                            return (
                              <div key={gradeName} className="rounded-lg border border-border/50 overflow-hidden">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleGrade(key);
                                  }}
                                  className={`w-full flex items-center justify-between p-3 transition-colors ${
                                    isGradeExpanded ? 'bg-secondary' : 'hover:bg-secondary/50'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <Badge className={`${getGradeBadgeColor(gradeName)} text-white`}>
                                      {gradeName}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                      {gradeFiles.length}개 파일
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDownloadMultiple(gradeFiles);
                                      }}
                                      className="h-8 gap-1.5"
                                    >
                                      <Download className="h-3.5 w-3.5" />
                                      전체
                                    </Button>
                                    {isGradeExpanded ? (
                                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    )}
                                  </div>
                                </button>

                                <Collapsible open={isGradeExpanded}>
                                  <CollapsibleContent>
                                    <div className="p-3 pt-0 space-y-2">
                                      {gradeFiles.map((file) => (
                                        <div
                                          key={file.id}
                                          className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border/30 hover:border-primary/30 transition-colors group/file"
                                        >
                                          <Checkbox
                                            checked={selectedFileIds.has(file.id)}
                                            onCheckedChange={() => toggleFileSelection(file.id)}
                                            onClick={(e) => e.stopPropagation()}
                                          />
                                          <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                              <span className="font-semibold text-sm">{file.exam_year}년</span>
                                              <Badge variant="outline" className={`text-xs ${getSemesterColor(file.semester)}`}>
                                                {file.semester}
                                              </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                                              {file.file_name} · {(file.file_size / 1024 / 1024).toFixed(1)}MB
                                            </p>
                                          </div>
                                          <div className="flex gap-1 opacity-0 group-hover/file:opacity-100 transition-opacity">
                                            <Button
                                              size="icon"
                                              variant="ghost"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleDownload(file.file_path, file.file_name);
                                              }}
                                              className="h-8 w-8"
                                            >
                                              <Download className="h-4 w-4" />
                                            </Button>
                                            <Button
                                              size="icon"
                                              variant="ghost"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(file.id, file.file_path);
                                              }}
                                              className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </CollapsibleContent>
                                </Collapsible>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>기출문제 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              이 기출문제를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>삭제</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ExamUploadSection;
