import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { QuestionForm, Question } from "@/components/ui/question-form";
import { QuestionPreview } from "@/components/ui/question-preview";
import { generatePDF } from "@/utils/pdfGenerator";
import { Download, FileText, BookOpen, Sparkles, Zap, Target, Award, TrendingUp } from "lucide-react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 tracking-wide",
  {
    variants: {
      variant: {
        default: "btn-professional",
        outline: "border border-border/50 bg-card hover:bg-muted hover:border-primary/50 shadow-xs hover:shadow-md",
        ghost: "hover:bg-muted/50 hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        success: "bg-gradient-accent text-success-foreground shadow-md hover:shadow-lg hover:scale-[1.02]",
        danger: "bg-destructive text-destructive-foreground shadow-md hover:shadow-lg hover:scale-[1.02]",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-lg px-4",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Index = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [title, setTitle] = useState<string>("문제지");
  const [activeTab, setActiveTab] = useState("create");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGeneratePDF = async () => {
    if (questions.length === 0) {
      toast({
        title: "문제가 없습니다",
        description: "PDF를 생성하려면 최소 1개의 문제를 추가해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      await generatePDF(questions, title);
      toast({
        title: "PDF 생성 완료",
        description: `${questions.length}개 문제가 포함된 PDF가 다운로드되었습니다.`,
      });
    } catch (error) {
      console.error("PDF 생성 실패:", error);
      toast({
        title: "PDF 생성 실패",
        description: "PDF 생성 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Professional Header */}
      <header className="border-b border-border/20 bg-card/80 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-primary rounded-xl shadow-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gradient-primary">QuizCraft Pro</h1>
                <p className="text-sm text-muted-foreground">전문 문제 생성 도구</p>
              </div>
            </div>
            
            {/* Stats */}
            <div className="hidden md:flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">문제 수:</span>
                <span className="font-semibold text-primary">{questions.length}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-success/10 rounded-lg">
                <Award className="h-4 w-4 text-success" />
                <span className="text-success font-medium">Ready</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-4">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
              <span className="text-gradient-primary">New Veritas </span>
              <span className="text-foreground">PDF 변환기</span>
            </h2>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                AI 기반 문제 분석으로 전문적인 PDF 문제지를 
                <span className="text-primary font-semibold"> 몇 초 만에</span> 생성하세요
              </p>
            </div>
            
            {/* Feature Cards */}
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <Card className="card-professional group hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="p-3 bg-primary/10 rounded-xl mx-auto w-fit mb-4 group-hover:scale-110 transition-transform">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">즉시 생성</h3>
                  <p className="text-muted-foreground text-sm">텍스트 입력 후 클릭 한 번으로 전문적인 PDF 완성</p>
                </CardContent>
              </Card>
              
              <Card className="card-professional group hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="p-3 bg-accent/10 rounded-xl mx-auto w-fit mb-4 group-hover:scale-110 transition-transform">
                    <Target className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">스마트 분석</h3>
                  <p className="text-muted-foreground text-sm">문제, 정답, 해설을 자동으로 인식하고 구조화</p>
                </CardContent>
              </Card>
              
              <Card className="card-professional group hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="p-3 bg-warning/10 rounded-xl mx-auto w-fit mb-4 group-hover:scale-110 transition-transform">
                    <TrendingUp className="h-6 w-6 text-warning" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">전문적 디자인</h3>
                  <p className="text-muted-foreground text-sm">깔끔하고 읽기 쉬운 레이아웃으로 자동 포맷팅</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-6 pb-16">
        <div className="max-w-7xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <div className="flex items-center justify-between">
              <TabsList className="bg-card/50 backdrop-blur-sm border border-border/50 shadow-md p-1 h-12">
                <TabsTrigger 
                  value="create" 
                  className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-md h-10 px-6 font-medium transition-all duration-200"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  문제 작성
                </TabsTrigger>
                <TabsTrigger 
                  value="preview" 
                  className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-md h-10 px-6 font-medium transition-all duration-200"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  미리보기
                </TabsTrigger>
              </TabsList>

              {/* Action Button */}
              <Button 
                onClick={handleGeneratePDF}
                disabled={activeTab !== "preview" || questions.length === 0 || isGenerating}
                className={cn(buttonVariants({ variant: "success", size: "lg" }))}
              >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  생성 중...
                </>
              ) : (
                <>
                  <Download className="h-5 w-5" />
                  PDF 저장
                </>
              )}
              </Button>
            </div>

            <div className="animate-fade-in">
              <TabsContent value="create" className="mt-0">
                <QuestionForm
                  questions={questions}
                  onQuestionsChange={setQuestions}
                  title={title}
                  onTitleChange={setTitle}
                />
              </TabsContent>

              <TabsContent value="preview" className="mt-0">
                <QuestionPreview questions={questions} title={title} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Index;