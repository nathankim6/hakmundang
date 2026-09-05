import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Search,
  Trash2,
  Eye,
  Plus,
  FileUp
} from "lucide-react";
import QuestionTextRenderer from "@/components/QuestionTextRenderer";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

// PDF.js를 CDN에서 동적으로 로드
const loadPdfJs = async () => {
  if ((window as any).pdfjsLib) {
    return (window as any).pdfjsLib;
  }
  
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      const pdfjsLib = (window as any).pdfjsLib;
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      resolve(pdfjsLib);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

interface Question {
  id: string;
  grade: string;
  grammar_type: string;
  difficulty: string;
  question_text: string;
  question_type: string | null;
  options: string[] | null;
  answer: string;
  explanation: string | null;
  pattern_name: string | null;
  source_file: string | null;
  created_at: string;
}

const grammarTypes = [
  "감탄문",
  "시제",
  "조동사",
  "수동태",
  "to부정사",
  "동명사",
  "분사",
  "관계사",
  "접속사",
  "가정법",
  "비교급",
  "일치/화법",
  "특수구문",
  "기타",
];

const grades = ["중1", "중2", "중3", "고1", "고2", "고3"];

const QuestionsPage = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "analyzing" | "complete" | "error">("idle");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [filterGrade, setFilterGrade] = useState<string>("all");
  const [filterGrammar, setFilterGrammar] = useState<string>("all");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [analyzedCount, setAnalyzedCount] = useState(0);

  const [newQuestion, setNewQuestion] = useState({
    grade: "",
    grammarType: "",
    difficulty: "" as "상" | "중" | "하" | "",
    question: "",
    options: ["", "", "", ""],
    answer: "",
    explanation: "",
  });

  // Fetch questions from database
  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from("questions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Transform data to match our interface
      const transformedData: Question[] = (data || []).map((item) => ({
        id: item.id,
        grade: item.grade,
        grammar_type: item.grammar_type,
        difficulty: item.difficulty,
        question_text: item.question_text,
        question_type: item.question_type || null,
        options: Array.isArray(item.options) ? item.options as string[] : null,
        answer: item.answer,
        explanation: item.explanation,
        pattern_name: item.pattern_name,
        source_file: item.source_file,
        created_at: item.created_at,
      }));
      
      setQuestions(transformedData);
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error("문제 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const allowedExtensions = [".pdf", ".doc", ".docx", ".txt", ".hwp"];
      const validFiles: File[] = [];
      const invalidFiles: string[] = [];

      Array.from(files).slice(0, 30).forEach((file) => {
        const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
        if (allowedExtensions.includes(fileExtension)) {
          validFiles.push(file);
        } else {
          invalidFiles.push(file.name);
        }
      });

      if (invalidFiles.length > 0) {
        toast.error(`지원하지 않는 파일: ${invalidFiles.slice(0, 3).join(", ")}${invalidFiles.length > 3 ? ` 외 ${invalidFiles.length - 3}개` : ""}`);
      }

      if (validFiles.length > 0) {
        setSelectedFiles(validFiles);
        setUploadStatus("idle");
        setCurrentFileIndex(0);
        toast.success(`${validFiles.length}개 파일이 선택되었습니다.`);
      }
    }
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    // For plain text files
    if (file.type === "text/plain" || file.name.endsWith(".txt")) {
      const text = await file.text();
      return text.slice(0, 100000);
    }
    
    // For PDF files - use pdf.js loaded from CDN
    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      try {
        const pdfjsLib = await loadPdfJs() as any;
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        
        let fullText = "";
        const totalPages = pdf.numPages;
        
        toast.info(`PDF 텍스트 추출 중... (총 ${totalPages}페이지)`);
        
        for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(" ");
          fullText += `\n[페이지 ${pageNum}]\n${pageText}\n`;
        }
        
        console.log(`PDF 텍스트 추출 완료: ${fullText.length} 글자`);
        return fullText.slice(0, 100000);
      } catch (pdfError) {
        console.error("PDF 파싱 오류:", pdfError);
        toast.error("PDF 파일을 읽을 수 없습니다.");
        return "";
      }
    }
    
    // For other document types, try basic text extraction
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const decoder = new TextDecoder("utf-8", { fatal: false });
    let text = decoder.decode(uint8Array);
    
    // Clean up the text - keep Korean, English, numbers, and common punctuation
    text = text.replace(/[^\x20-\x7E\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F\n\r\t.,?!@#$%^&*()_+\-=\[\]{};':"\\|<>\/~`]/g, " ");
    text = text.replace(/\s+/g, " ").trim();
    
    return text.slice(0, 100000);
  };

  const handleAnalyzeFile = async () => {
    if (selectedFiles.length === 0) {
      toast.error("파일을 선택해주세요.");
      return;
    }

    if (!selectedGrade) {
      toast.error("학년을 선택해주세요.");
      return;
    }

    setUploadStatus("uploading");
    let totalAnalyzed = 0;
    let failedFiles: string[] = [];
    
    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        setCurrentFileIndex(i);
        
        // Extract text from file
        const fileText = await extractTextFromFile(file);
        
        if (fileText.length < 50) {
          failedFiles.push(file.name);
          continue;
        }

        setUploadStatus("analyzing");
        toast.info(`AI가 문제를 분석하고 있습니다... (${i + 1}/${selectedFiles.length})`);

        // Call the edge function
        const { data, error } = await supabase.functions.invoke("analyze-questions", {
          body: {
            pdfText: fileText,
            grade: selectedGrade,
            sourceFile: file.name,
          },
        });

        if (error) {
          console.error("Edge function error:", error);
          failedFiles.push(file.name);
          continue;
        }

        if (!data.success) {
          failedFiles.push(file.name);
          continue;
        }

        totalAnalyzed += data.count || 0;
      }
      
      setAnalyzedCount(totalAnalyzed);
      setUploadStatus("complete");
      
      if (failedFiles.length > 0) {
        toast.warning(`${totalAnalyzed}개 문제 추출 완료. ${failedFiles.length}개 파일 실패.`);
      } else {
        toast.success(`총 ${totalAnalyzed}개의 문제가 ${selectedFiles.length}개 파일에서 추출되었습니다!`);
      }
      
      // Refresh the questions list
      await fetchQuestions();
      
      // Reset file selection
      setSelectedFiles([]);
      setSelectedGrade("");
      setCurrentFileIndex(0);

    } catch (error) {
      console.error("Analysis error:", error);
      setUploadStatus("error");
      toast.error(error instanceof Error ? error.message : "분석 중 오류가 발생했습니다.");
    }
  };

  const handleAddQuestion = async () => {
    if (!newQuestion.grade || !newQuestion.grammarType || !newQuestion.difficulty || !newQuestion.question || !newQuestion.answer) {
      toast.error("필수 항목을 모두 입력해주세요.");
      return;
    }

    try {
      const { error } = await supabase.from("questions").insert({
        grade: newQuestion.grade,
        grammar_type: newQuestion.grammarType,
        difficulty: newQuestion.difficulty,
        question_text: newQuestion.question,
        options: newQuestion.options.filter((o) => o.trim() !== ""),
        answer: newQuestion.answer,
        explanation: newQuestion.explanation || null,
      });

      if (error) throw error;

      setNewQuestion({
        grade: "",
        grammarType: "",
        difficulty: "",
        question: "",
        options: ["", "", "", ""],
        answer: "",
        explanation: "",
      });
      setIsAddDialogOpen(false);
      toast.success("문제가 추가되었습니다!");
      await fetchQuestions();
    } catch (error) {
      console.error("Error adding question:", error);
      toast.error("문제 추가에 실패했습니다.");
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    try {
      const { error } = await supabase.from("questions").delete().eq("id", id);
      if (error) throw error;
      
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      toast.success("문제가 삭제되었습니다.");
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error("문제 삭제에 실패했습니다.");
    }
  };

  const filteredQuestions = questions.filter((q) => {
    if (filterGrade !== "all" && q.grade !== filterGrade) return false;
    if (filterGrammar !== "all" && q.grammar_type !== filterGrammar) return false;
    if (filterDifficulty !== "all" && q.difficulty !== filterDifficulty) return false;
    if (searchTerm && !q.question_text.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "상": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "중": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "하": return "bg-green-500/20 text-green-400 border-green-500/30";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">문제관리</h1>
          <p className="text-muted-foreground">
            학년별, 문법유형별 문제를 업로드하고 관리하세요. AI가 자동으로 분류합니다.
          </p>
        </div>

        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="upload" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Upload className="w-4 h-4 mr-2" />
              파일 업로드
            </TabsTrigger>
            <TabsTrigger value="manage" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <FileText className="w-4 h-4 mr-2" />
              문제 목록 ({questions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileUp className="w-5 h-5 text-primary" />
                  PDF/문서 파일로 문제 추가하기
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Grade Selection */}
                <div className="flex flex-col gap-2">
                  <Label className="text-foreground font-medium">1. 학년 선택 *</Label>
                  <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                    <SelectTrigger className="w-[200px] bg-background">
                      <SelectValue placeholder="학년을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {grades.map((grade) => (
                        <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-foreground font-medium">2. 파일 업로드</Label>
                  <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.hwp,.txt"
                      onChange={handleFileUpload}
                      multiple
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                        <Upload className="w-8 h-8 text-primary" />
                      </div>
                      <p className="text-lg font-medium text-foreground mb-2">
                        파일을 드래그하거나 클릭하여 업로드
                      </p>
                      <p className="text-sm text-muted-foreground">
                        PDF, DOC, DOCX, HWP, TXT 파일 지원 (최대 30개, 각 20MB)
                      </p>
                    </label>
                  </div>
                </div>

                {selectedFiles.length > 0 && (
                  <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-8 h-8 text-primary" />
                        <div>
                          <p className="font-medium text-foreground">
                            {selectedFiles.length}개 파일 선택됨
                          </p>
                          <p className="text-sm text-muted-foreground">
                            총 {(selectedFiles.reduce((acc, f) => acc + f.size, 0) / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <Button 
                        onClick={handleAnalyzeFile} 
                        disabled={uploadStatus === "uploading" || uploadStatus === "analyzing" || !selectedGrade || selectedFiles.length === 0}
                      >
                        {uploadStatus === "uploading" && (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            업로드 중...
                          </>
                        )}
                        {uploadStatus === "analyzing" && (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            분석 중 ({currentFileIndex + 1}/{selectedFiles.length})
                          </>
                        )}
                        {(uploadStatus === "idle" || uploadStatus === "complete" || uploadStatus === "error") && (
                          <>AI 분석 시작</>
                        )}
                      </Button>
                    </div>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {selectedFiles.map((file, idx) => (
                        <div key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          <span className="truncate">{file.name}</span>
                          <span className="text-xs">({(file.size / 1024).toFixed(1)} KB)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {uploadStatus === "complete" && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <p className="text-green-400">
                      {analyzedCount}개의 문제가 분석되어 저장되었습니다! 문제 목록 탭에서 확인하세요.
                    </p>
                  </div>
                )}

                {uploadStatus === "error" && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <p className="text-red-400">분석 중 오류가 발생했습니다. 다시 시도해주세요.</p>
                  </div>
                )}

                <div className="grid md:grid-cols-3 gap-4 pt-4 border-t border-border">
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <p className="text-2xl font-bold text-primary">{questions.length}</p>
                    <p className="text-sm text-muted-foreground">총 문제 수</p>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <p className="text-2xl font-bold text-primary">
                      {new Set(questions.map((q) => q.grammar_type)).size}
                    </p>
                    <p className="text-sm text-muted-foreground">문법 유형</p>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <p className="text-2xl font-bold text-primary">
                      {new Set(questions.map((q) => q.grade)).size}
                    </p>
                    <p className="text-sm text-muted-foreground">학년</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">AI 분석 프로세스</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">1</div>
                    <div>
                      <p className="font-medium text-foreground">학년 선택</p>
                      <p className="text-sm text-muted-foreground">문제의 학년 지정</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">2</div>
                    <div>
                      <p className="font-medium text-foreground">파일 업로드</p>
                      <p className="text-sm text-muted-foreground">PDF/DOC 파일 첨부</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">3</div>
                    <div>
                      <p className="font-medium text-foreground">Gemini AI 분석</p>
                      <p className="text-sm text-muted-foreground">문법유형, 난이도 자동 분류</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">4</div>
                    <div>
                      <p className="font-medium text-foreground">자동 저장</p>
                      <p className="text-sm text-muted-foreground">문제+정답 세트 저장</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage" className="space-y-6">
            {/* Filters */}
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="문제 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-background"
                      />
                    </div>
                  </div>
                  <Select value={filterGrade} onValueChange={setFilterGrade}>
                    <SelectTrigger className="w-[130px] bg-background">
                      <SelectValue placeholder="학년" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체 학년</SelectItem>
                      {grades.map((grade) => (
                        <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterGrammar} onValueChange={setFilterGrammar}>
                    <SelectTrigger className="w-[150px] bg-background">
                      <SelectValue placeholder="문법 유형" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체 유형</SelectItem>
                      {grammarTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                    <SelectTrigger className="w-[120px] bg-background">
                      <SelectValue placeholder="난이도" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체</SelectItem>
                      <SelectItem value="상">상</SelectItem>
                      <SelectItem value="중">중</SelectItem>
                      <SelectItem value="하">하</SelectItem>
                    </SelectContent>
                  </Select>
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        직접 추가
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>문제 직접 추가</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label>학년 *</Label>
                            <Select value={newQuestion.grade} onValueChange={(v) => setNewQuestion({ ...newQuestion, grade: v })}>
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="선택" />
                              </SelectTrigger>
                              <SelectContent>
                                {grades.map((grade) => (
                                  <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>문법 유형 *</Label>
                            <Select value={newQuestion.grammarType} onValueChange={(v) => setNewQuestion({ ...newQuestion, grammarType: v })}>
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="선택" />
                              </SelectTrigger>
                              <SelectContent>
                                {grammarTypes.map((type) => (
                                  <SelectItem key={type} value={type}>{type}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>난이도 *</Label>
                            <Select value={newQuestion.difficulty} onValueChange={(v) => setNewQuestion({ ...newQuestion, difficulty: v as "상" | "중" | "하" })}>
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="선택" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="상">상</SelectItem>
                                <SelectItem value="중">중</SelectItem>
                                <SelectItem value="하">하</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label>문제 *</Label>
                          <Textarea
                            value={newQuestion.question}
                            onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                            placeholder="문제를 입력하세요..."
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>보기 (선택)</Label>
                          <div className="grid grid-cols-2 gap-2 mt-1">
                            {newQuestion.options.map((opt, idx) => (
                              <Input
                                key={idx}
                                value={opt}
                                onChange={(e) => {
                                  const newOptions = [...newQuestion.options];
                                  newOptions[idx] = e.target.value;
                                  setNewQuestion({ ...newQuestion, options: newOptions });
                                }}
                                placeholder={`보기 ${idx + 1}`}
                              />
                            ))}
                          </div>
                        </div>
                        <div>
                          <Label>정답 *</Label>
                          <Input
                            value={newQuestion.answer}
                            onChange={(e) => setNewQuestion({ ...newQuestion, answer: e.target.value })}
                            placeholder="정답을 입력하세요"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>해설</Label>
                          <Textarea
                            value={newQuestion.explanation}
                            onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                            placeholder="해설을 입력하세요..."
                            className="mt-1"
                          />
                        </div>
                        <Button onClick={handleAddQuestion} className="w-full">
                          문제 추가
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

            {/* Question List */}
            <div className="space-y-4">
              {loading ? (
                <Card className="bg-card border-border">
                  <CardContent className="py-12 text-center">
                    <Loader2 className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
                    <p className="text-muted-foreground">문제를 불러오는 중...</p>
                  </CardContent>
                </Card>
              ) : filteredQuestions.length === 0 ? (
                <Card className="bg-card border-border">
                  <CardContent className="py-12 text-center">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium text-foreground">문제가 없습니다</p>
                    <p className="text-muted-foreground">파일을 업로드하거나 직접 문제를 추가해주세요.</p>
                  </CardContent>
                </Card>
              ) : (
                filteredQuestions.map((q, qIdx) => (
                  <Card key={q.id} className="bg-card border-border hover:border-primary/30 transition-colors group">
                    <CardContent className="py-5 px-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-4">
                          {/* Header with badges */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-lg font-bold text-primary mr-2">Q{qIdx + 1}</span>
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 font-medium">
                              {q.grade}
                            </Badge>
                            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
                              {q.grammar_type}
                            </Badge>
                            <Badge variant="outline" className={getDifficultyColor(q.difficulty)}>
                              {q.difficulty}
                            </Badge>
                            {q.question_type && (
                              <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30">
                                {q.question_type}
                              </Badge>
                            )}
                            {q.pattern_name && (
                              <Badge variant="outline" className="bg-muted text-muted-foreground">
                                📁 {q.pattern_name}
                              </Badge>
                            )}
                          </div>

                          {/* Question text with proper formatting */}
                          <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                            <QuestionTextRenderer text={q.question_text} />
                          </div>

                          {/* Options displayed as a proper list */}
                          {q.options && q.options.length > 0 && (
                            <div className="grid gap-2">
                              {q.options.map((opt, idx) => {
                                const isCorrect = opt === q.answer || 
                                  q.answer === String(idx + 1) || 
                                  q.answer === `${idx + 1}` ||
                                  q.answer.includes(`${idx + 1}.`) ||
                                  q.answer.toLowerCase() === ['①','②','③','④','⑤'][idx];
                                const circleNumbers = ['①', '②', '③', '④', '⑤'];
                                return (
                                  <div
                                    key={idx}
                                    className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                                      isCorrect
                                        ? "bg-green-500/10 border-green-500/30 text-green-400"
                                        : "bg-background/50 border-border/50 text-foreground hover:bg-muted/30"
                                    }`}
                                  >
                                    <span className={`font-bold min-w-[24px] ${isCorrect ? "text-green-400" : "text-muted-foreground"}`}>
                                      {circleNumbers[idx] || `${idx + 1}.`}
                                    </span>
                                    <span className="flex-1">{opt}</span>
                                    {isCorrect && (
                                      <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Answer section */}
                          <div className="flex items-center gap-3 pt-2 border-t border-border/30">
                            <span className="text-sm font-medium text-muted-foreground">정답:</span>
                            <span className="text-green-400 font-semibold bg-green-500/10 px-3 py-1 rounded-full">
                              {q.answer}
                            </span>
                            {q.explanation && (
                              <span className="text-sm text-muted-foreground ml-auto">
                                💡 해설 있음
                              </span>
                            )}
                          </div>

                          {/* Source file */}
                          {q.source_file && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              출처: {q.source_file}
                            </p>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-col items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="hover:bg-primary/10"
                                onClick={() => setSelectedQuestion(q)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-3">
                                  <span className="text-2xl">📝</span>
                                  문제 상세
                                </DialogTitle>
                              </DialogHeader>
                              {selectedQuestion && (
                                <div className="space-y-5 py-4">
                                  {/* Badges */}
                                  <div className="flex flex-wrap gap-2">
                                    <Badge className="bg-primary/20 text-primary">{selectedQuestion.grade}</Badge>
                                    <Badge className="bg-blue-500/20 text-blue-400">{selectedQuestion.grammar_type}</Badge>
                                    <Badge className={getDifficultyColor(selectedQuestion.difficulty)}>
                                      난이도: {selectedQuestion.difficulty}
                                    </Badge>
                                    {selectedQuestion.pattern_name && (
                                      <Badge variant="outline">{selectedQuestion.pattern_name}</Badge>
                                    )}
                                  </div>

                                  {/* Question */}
                                  <div className="bg-muted/30 rounded-xl p-5 border border-border/50">
                                    <Label className="text-muted-foreground text-sm mb-2 block">문제</Label>
                                    <QuestionTextRenderer text={selectedQuestion.question_text} className="text-lg" />
                                  </div>

                                  {/* Options */}
                                  {selectedQuestion.options && selectedQuestion.options.length > 0 && (
                                    <div className="space-y-2">
                                      <Label className="text-muted-foreground text-sm">보기</Label>
                                      <div className="grid gap-2">
                                        {selectedQuestion.options.map((opt, idx) => {
                                          const circleNumbers = ['①', '②', '③', '④', '⑤'];
                                          const isCorrect = opt === selectedQuestion.answer || 
                                            selectedQuestion.answer === String(idx + 1);
                                          return (
                                            <div
                                              key={idx}
                                              className={`flex items-center gap-3 p-4 rounded-lg border ${
                                                isCorrect
                                                  ? "bg-green-500/15 border-green-500/40 text-green-400"
                                                  : "bg-background/50 border-border"
                                              }`}
                                            >
                                              <span className="font-bold text-lg">{circleNumbers[idx]}</span>
                                              <span className="flex-1">{opt}</span>
                                              {isCorrect && <CheckCircle2 className="w-5 h-5 text-green-400" />}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}

                                  {/* Answer */}
                                  <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/30">
                                    <Label className="text-green-400 text-sm mb-1 block">✅ 정답</Label>
                                    <p className="text-green-400 font-bold text-xl">{selectedQuestion.answer}</p>
                                  </div>

                                  {/* Explanation */}
                                  {selectedQuestion.explanation && (
                                    <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/30">
                                      <Label className="text-yellow-400 text-sm mb-1 block">💡 해설</Label>
                                      <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                                        {selectedQuestion.explanation}
                                      </p>
                                    </div>
                                  )}

                                  {/* Meta info */}
                                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/30">
                                    <span>등록일: {new Date(selectedQuestion.created_at).toLocaleDateString("ko-KR")}</span>
                                    {selectedQuestion.source_file && (
                                      <span>출처: {selectedQuestion.source_file}</span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default QuestionsPage;
