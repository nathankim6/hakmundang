import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, ArrowLeft, Plus, Trash2, Save, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { parseCSV, shuffleWords, saveExam } from '@/lib/examStorageCloud';
import orunLogo from '@/assets/orun-academy-logo.jpg';

export default function ExamCreate() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [title, setTitle] = useState('');
  const [creator, setCreator] = useState('');
  const [problems, setProblems] = useState<{ korean: string; english: string }[]>([]);
  const [isPreview, setIsPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: '파일 형식 오류',
        description: 'CSV 파일만 업로드 가능합니다.',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseCSV(text);
      
      if (parsed.length === 0) {
        toast({
          title: '파싱 오류',
          description: 'CSV 파일에서 문제를 찾을 수 없습니다. 형식: 영어,한국어',
          variant: 'destructive',
        });
        return;
      }

      setProblems(parsed);
      toast({
        title: '업로드 완료',
        description: `${parsed.length}개의 문제가 로드되었습니다.`,
      });
    };
    reader.readAsText(file);
  };

  const addProblem = () => {
    setProblems([...problems, { korean: '', english: '' }]);
  };

  const updateProblem = (index: number, field: 'korean' | 'english', value: string) => {
    const updated = [...problems];
    updated[index][field] = value;
    setProblems(updated);
  };

  const removeProblem = (index: number) => {
    setProblems(problems.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({
        title: '제목 필요',
        description: '시험 제목을 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }

    if (!creator.trim()) {
      toast({
        title: '출제자 필요',
        description: '출제자 이름을 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }

    const validProblems = problems.filter(p => p.korean.trim() && p.english.trim());
    if (validProblems.length === 0) {
      toast({
        title: '문제 필요',
        description: '최소 1개 이상의 문제를 추가해주세요.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    const problemsToSave = validProblems.map(p => ({
      korean: p.korean,
      english: p.english,
      shuffledWords: shuffleWords(p.english),
    }));

    const examId = await saveExam(title.trim(), creator.trim(), problemsToSave);

    setIsSubmitting(false);

    if (examId) {
      toast({
        title: '시험 생성 완료',
        description: `"${title}" 시험이 생성되었습니다.`,
      });
      navigate('/exam/list');
    } else {
      toast({
        title: '오류 발생',
        description: '시험 생성 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
                className="rounded-full hover:bg-muted"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-primary/20 bg-white shadow-lg shadow-primary/5">
                  <img src={orunLogo} alt="ORUN Academy Logo" className="w-10 h-10 object-contain" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold tracking-tight">시험 생성</h1>
                  <p className="text-sm text-muted-foreground">Create New Exam</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-4xl">
        {!isPreview ? (
          <>
            {/* 기본 정보 */}
            <Card className="mb-6 border-0 shadow-lg shadow-primary/5">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  시험 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">시험 제목</Label>
                    <Input
                      id="title"
                      placeholder="예: 1학기 중간고사 영작 테스트"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="creator">출제자</Label>
                    <Input
                      id="creator"
                      placeholder="예: 홍길동 선생님"
                      value={creator}
                      onChange={(e) => setCreator(e.target.value)}
                      className="h-11 rounded-xl"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CSV 업로드 */}
            <Card className="mb-6 border-0 shadow-lg shadow-primary/5">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Upload className="w-4 h-4 text-primary" />
                  </div>
                  CSV 파일 업로드
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-border/60 rounded-2xl p-8 text-center hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".csv"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-muted-foreground mb-2">
                    CSV 파일을 업로드하세요
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    형식: 영어 문장, 한국어 문장 (각 줄마다)
                  </p>
                  <Button onClick={() => fileInputRef.current?.click()} className="rounded-xl">
                    파일 선택
                  </Button>
                </div>
                <div className="mt-4 p-4 bg-muted/50 rounded-xl">
                  <p className="text-sm font-medium mb-2">CSV 형식 예시:</p>
                  <pre className="text-xs text-muted-foreground font-mono">
{`I exercise every morning.,나는 매일 아침 운동을 한다.
She is good at English.,그녀는 영어를 잘 한다.
We studied together.,우리는 함께 공부했다.`}
                  </pre>
                </div>
              </CardContent>
            </Card>

            {/* 문제 목록 */}
            <Card className="mb-6 border-0 shadow-lg shadow-primary/5">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <span className="text-lg">문제 목록 ({problems.length}개)</span>
                  <Button variant="outline" size="sm" onClick={addProblem} className="rounded-xl">
                    <Plus className="w-4 h-4 mr-1" />
                    문제 추가
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {problems.length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">
                      CSV 파일을 업로드하거나 문제를 직접 추가해주세요.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {problems.map((problem, index) => (
                      <div key={index} className="p-4 bg-muted/30 rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium flex items-center gap-2">
                            <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                              {index + 1}
                            </span>
                            문제
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeProblem(index)}
                            className="rounded-full hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <Label>한국어</Label>
                          <Textarea
                            placeholder="한국어 문장 입력"
                            value={problem.korean}
                            onChange={(e) => updateProblem(index, 'korean', e.target.value)}
                            className="rounded-xl resize-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>영어</Label>
                          <Textarea
                            placeholder="영어 문장 입력"
                            value={problem.english}
                            onChange={(e) => updateProblem(index, 'english', e.target.value)}
                            className="rounded-xl resize-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 액션 버튼 */}
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsPreview(true)}
                disabled={problems.length === 0}
                className="rounded-xl h-11"
              >
                <Eye className="w-4 h-4 mr-1" />
                미리보기
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className="rounded-xl h-11 px-6"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    생성 중...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-1" />
                    시험 생성
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          /* 미리보기 */
          <Card className="border-0 shadow-lg shadow-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>시험 미리보기</span>
                <Button variant="outline" onClick={() => setIsPreview(false)} className="rounded-xl">
                  편집으로 돌아가기
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6 p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl">
                <h2 className="text-xl font-bold">{title || '(제목 없음)'}</h2>
                <p className="text-muted-foreground">출제자: {creator || '(미입력)'}</p>
              </div>
              <div className="space-y-4">
                {problems.map((problem, index) => (
                  <div key={index} className="p-4 bg-muted/30 rounded-xl">
                    <p className="font-medium mb-3 flex items-start gap-3">
                      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                        {index + 1}
                      </span>
                      <span className="pt-0.5">{problem.korean}</span>
                    </p>
                    <div className="flex flex-wrap gap-2 ml-10">
                      {shuffleWords(problem.english).map((word, wIndex) => (
                        <span
                          key={wIndex}
                          className="px-3 py-1.5 bg-primary/10 rounded-lg text-sm font-medium"
                        >
                          {word}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <Button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting}
                  className="rounded-xl h-11 px-6"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      생성 중...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-1" />
                      시험 생성
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
