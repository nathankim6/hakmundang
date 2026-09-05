import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { 
  Search, 
  Award, 
  BookOpen, 
  Target,
  CheckCircle2,
  ArrowLeft,
  FileText,
  GraduationCap,
  Star,
  Zap,
  Trophy,
  Lightbulb,
  ChevronRight,
  AlertTriangle,
  XCircle,
  Volume2
} from "lucide-react";
import orunLogo from "@/assets/orun-academy-logo.jpg";
import orunBearLogo from "@/assets/orun-academy-bear-logo.jpg";
import { 
  getAnalysisByScore, 
  getVLevelByScore,
  vocaLevelMapping,
  getElementaryVocabPercentage,
  getSuneungVocabPercentage
} from "@/data/vocaLevelData";

interface Answer {
  question_number: number;
  question_type: string;
  word: string;
  meaning: string;
  correct_answer: string | string[];
  student_answer: string | string[];
  is_correct: boolean;
  partial_score?: number; // 부분 점수 (0~1)
}

interface ExamSubmission {
  id: string;
  exam_id: string;
  student_name: string;
  score: number;
  correct_count: number;
  total_count: number;
  submitted_at: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  answers?: any;
  exam?: {
    id: string;
    title: string;
    multiple_choice_count: number;
    spelling_count: number;
    definition_count: number;
    example_count: number;
  };
}

export default function StudentResultLookup() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [studentName, setStudentName] = useState("");
  const [submissions, setSubmissions] = useState<ExamSubmission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<ExamSubmission | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!studentName.trim()) {
      toast({
        title: "이름을 입력해주세요",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setSearched(true);
    setSelectedSubmission(null);

    try {
      const { data, error } = await supabase
        .from("exam_submissions")
        .select(`
          *,
          exam:exams (
            id,
            title,
            multiple_choice_count,
            spelling_count,
            definition_count,
            example_count
          )
        `)
        .eq("student_name", studentName.trim())
        .order("submitted_at", { ascending: false });

      if (error) throw error;

      setSubmissions(data || []);
      
      if (!data || data.length === 0) {
        toast({
          title: "결과 없음",
          description: "해당 이름으로 응시한 시험 기록이 없습니다.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error searching submissions:", error);
      toast({
        title: "오류",
        description: "시험 결과를 검색하는데 실패했습니다.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // V레벨 시각화를 위한 배열
  const allVLevels = ["V00", "V01", "V02", "V03", "V04", "V05", "V06", "V07", "V08", "V09", "V10", "V11", "V12", "V13", "V14"];

  // 점수에 따른 색상
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-slate-800";
    if (score >= 80) return "text-emerald-600";
    if (score >= 70) return "text-blue-600";
    if (score >= 60) return "text-purple-600";
    return "text-slate-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return "bg-slate-50 border-slate-300";
    if (score >= 80) return "bg-emerald-50 border-emerald-200";
    if (score >= 70) return "bg-blue-50 border-blue-200";
    if (score >= 60) return "bg-purple-50 border-purple-200";
    return "bg-slate-50 border-slate-200";
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 95) return "🏆";
    if (score >= 90) return "🥇";
    if (score >= 80) return "🥈";
    if (score >= 70) return "🥉";
    if (score >= 60) return "⭐";
    return "📚";
  };

  // 틀린 단어 추출 (부분 정답 포함)
  const getWrongAnswers = (answers: Answer[] | undefined): Answer[] => {
    if (!answers) return [];
    // is_correct가 false이거나 partial_score가 0~1 사이인 경우
    return answers.filter(a => !a.is_correct || (a.partial_score !== undefined && a.partial_score > 0 && a.partial_score < 1));
  };

  // 부분 정답인지 확인 (partial_score가 0보다 크고 1 미만)
  const isPartialCorrect = (answer: Answer): boolean => {
    return answer.partial_score !== undefined && answer.partial_score > 0 && answer.partial_score < 1;
  };

  // 단어 번호 제거
  const cleanWord = (word: string): string => {
    return word.replace(/^\d+\.\s*/, '');
  };

  const renderReport = (submission: ExamSubmission) => {
    const analysis = getAnalysisByScore(submission.score);
    const vLevel = getVLevelByScore(submission.score);
    const vLevelInfo = vocaLevelMapping[vLevel as keyof typeof vocaLevelMapping];
    const elementaryPercent = getElementaryVocabPercentage(submission.score);
    const suneungPercent = getSuneungVocabPercentage(submission.score);
    const accuracy = (submission.correct_count / submission.total_count) * 100;
    const currentVIndex = allVLevels.indexOf(vLevel);
    const wrongAnswers = getWrongAnswers(submission.answers as Answer[] | undefined);

    return (
      <Card className="border-2 shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white pb-6 md:pb-8 px-4 md:px-6">
          {/* 모바일: 세로 레이아웃 / 데스크톱: 가로 레이아웃 */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* 로고 + 정보 */}
            <div className="flex items-center gap-3 md:gap-4">
              <img 
                src={orunBearLogo} 
                alt="Orun Academy Logo" 
                className="w-14 h-14 md:w-20 md:h-20 rounded-lg object-cover bg-white p-1 flex-shrink-0"
              />
              <div className="min-w-0">
                <CardTitle className="text-xl md:text-3xl mb-1 md:mb-2 text-white truncate">{submission.student_name.slice(0, -4)} 학생 리포트</CardTitle>
                <p className="text-blue-100 text-sm md:text-base truncate">{submission.exam?.title}</p>
                <p className="text-blue-200 text-xs md:text-sm mt-1">
                  응시일: {new Date(submission.submitted_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
            {/* 점수 영역 */}
            <div className="flex items-center justify-between md:flex-col md:items-end gap-3 bg-white/10 md:bg-transparent rounded-xl p-3 md:p-0">
              <div className="flex items-center gap-2 md:flex-col md:items-end">
                <Award className="w-10 h-10 md:w-16 md:h-16 text-yellow-300" />
              </div>
              <div className="text-right">
                <div className="text-3xl md:text-4xl font-bold">{submission.score.toFixed(1)}점</div>
                <div className="text-blue-200 text-xs md:text-sm">/ 100점</div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 md:p-8 space-y-6 md:space-y-8">
          {/* 종합 섹션 */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 border-b-2 border-blue-500 pb-2">
              종합
            </h2>
            
            {/* 응시 시험 난이도 & 내 점수 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6 rounded-xl border-2 border-slate-300">
                <div className="text-xs md:text-sm text-slate-600 mb-1 md:mb-2">응시 시험 난이도</div>
                <div className="text-3xl md:text-5xl font-bold text-slate-800">{vLevel}</div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 md:p-6 rounded-xl border-2 border-blue-200">
                <div className="text-xs md:text-sm text-blue-700 mb-1 md:mb-2">내 점수(총점)</div>
                <div className="text-3xl md:text-5xl font-bold text-slate-800">
                  {submission.score.toFixed(1)}점 
                  <span className="text-lg md:text-2xl text-slate-500 ml-1 md:ml-2">/ 100점</span>
                </div>
              </div>
            </div>

            {/* V레벨 시각화 */}
            <div className="bg-slate-50 p-4 md:p-6 rounded-xl">
              {/* 모바일: 간소화된 뷰 */}
              <div className="md:hidden">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-slate-600">V0</span>
                  <span className="text-lg font-bold text-white bg-slate-800 px-3 py-1 rounded-full">{vLevel}</span>
                  <span className="text-sm text-slate-600">V14</span>
                </div>
                <div className="relative h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="absolute h-full bg-gradient-to-r from-slate-500 to-slate-700 transition-all duration-1000 rounded-full"
                    style={{ width: `${((currentVIndex + 1) / allVLevels.length) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-slate-500">
                  <span>유치~초2</span>
                  <span>고3</span>
                </div>
              </div>

              {/* 데스크톱: 전체 뷰 */}
              <div className="hidden md:block">
                <div className="flex justify-between items-center mb-4">
                  {allVLevels.map((level, index) => (
                    <div key={level} className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                          index === currentVIndex
                            ? "bg-slate-800 text-white scale-110 shadow-lg"
                            : index < currentVIndex
                            ? "bg-slate-300 text-slate-700"
                            : "bg-slate-200 text-slate-500"
                        }`}
                      >
                        {level.replace("V", "")}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Progress bar */}
                <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="absolute h-full bg-gradient-to-r from-slate-500 to-slate-700 transition-all duration-1000"
                    style={{ width: `${((currentVIndex + 1) / allVLevels.length) * 100}%` }}
                  />
                </div>

                {/* 학년 레벨 표시 */}
                <div className="flex justify-between mt-3 text-xs">
                  <span className="text-slate-600">유치~초2</span>
                  <span className="text-slate-800 font-bold">초3~4</span>
                  <span className="text-slate-800 font-bold">초5~6</span>
                  <span className="text-slate-800 font-bold">중1</span>
                  <span className="text-slate-800 font-bold">중2</span>
                  <span className="text-slate-500">중3</span>
                  <span className="text-slate-500">고1</span>
                  <span className="text-slate-500">고2</span>
                  <span className="text-slate-500">고3</span>
                </div>
              </div>

              <div className="mt-4 p-3 md:p-4 bg-white rounded-lg">
                <p className="text-sm text-slate-700">
                  <span className="font-bold text-slate-800">{vLevel}</span> 시험은{" "}
                  <span className="font-bold text-slate-800">{vLevelInfo?.grades}</span>{" "}
                  수준의 문항으로 구성됩니다.
                </p>
              </div>
            </div>
          </div>

          {/* 평가 결과 */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 border-b-2 border-blue-500 pb-2">
              평가 결과
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Vocabulary Size */}
              <Card className="border-2 border-blue-200">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-start gap-2 md:gap-3">
                    <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <div className="text-xs md:text-sm text-slate-600 mb-1">Vocabulary Size</div>
                      <div className="text-lg md:text-2xl font-bold text-slate-800">
                        약 {analysis.vocabularySize.split('-')[0]}단어 수준
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Vocabulary 수준 */}
              <Card className="border-2 border-green-200">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-start gap-2 md:gap-3">
                    <Target className="w-5 h-5 md:w-6 md:h-6 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <div className="text-xs md:text-sm text-slate-600 mb-1">Vocabulary 수준</div>
                      <div className="text-lg md:text-2xl font-bold text-slate-800">
                        {vLevelInfo?.grades} 수준
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 정답률 */}
              <Card className="border-2 border-purple-200">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-start gap-2 md:gap-3">
                    <Target className="w-5 h-5 md:w-6 md:h-6 text-purple-600 mt-1 flex-shrink-0" />
                    <div>
                      <div className="text-xs md:text-sm text-slate-600 mb-1">정답률</div>
                      <div className="text-lg md:text-2xl font-bold text-slate-800">
                        {accuracy.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 교육과정 기준 초등 필수 어휘 */}
              <Card className="border-2 border-slate-300 md:col-span-2">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-start gap-2 md:gap-3">
                    <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-slate-600 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-xs md:text-sm text-slate-600 mb-1 md:mb-2">
                        교육과정 기준 초등 필수 어휘 800개 중
                      </div>
                      <div className="text-lg md:text-2xl font-bold text-slate-800 mb-2 md:mb-3">
                        약 {elementaryPercent}% 알고 있음
                      </div>
                      <div className="relative h-3 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="absolute h-full bg-gradient-to-r from-slate-500 to-slate-700 rounded-full"
                          style={{ width: `${elementaryPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 최근 5개년 수능 기출 어휘 */}
              <Card className="border-2 border-rose-200">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-start gap-2 md:gap-3">
                    <Trophy className="w-5 h-5 md:w-6 md:h-6 text-rose-600 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-xs md:text-sm text-slate-600 mb-1 md:mb-2">
                        최근 5개년 수능 기출 어휘 중
                      </div>
                      <div className="text-lg md:text-2xl font-bold text-slate-800 mb-2 md:mb-3">
                        약 {suneungPercent}% 알고 있음
                      </div>
                      <div className="relative h-3 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="absolute h-full bg-gradient-to-r from-rose-400 to-rose-600 rounded-full"
                          style={{ width: `${suneungPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 오답 노트 */}
          {wrongAnswers.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-800 border-b-2 border-red-500 pb-2 flex items-center gap-2">
                <XCircle className="w-6 h-6 text-red-500" />
                오답 노트
                <Badge className="ml-2 bg-red-100 text-red-700 border-red-200">
                  {wrongAnswers.length}개
                </Badge>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {wrongAnswers.map((answer, index) => {
                  const isPartial = isPartialCorrect(answer);
                  return (
                  <Card key={index} className={`border-2 ${isPartial ? 'border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50' : 'border-red-100 bg-gradient-to-br from-red-50 to-orange-50'}`}>
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-full ${isPartial ? 'bg-orange-500' : 'bg-red-500'} text-white flex items-center justify-center font-bold flex-shrink-0`}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xl font-bold text-slate-800">{cleanWord(answer.word)}</span>
                            <Badge variant="outline" className="text-xs bg-white text-slate-600">
                              {answer.question_type === 'spelling' ? '스펠링' : 
                               answer.question_type === 'multiple_choice' ? '객관식' :
                               answer.question_type === 'definition' ? '정의' : '예문'}
                            </Badge>
                            {isPartial && (
                              <Badge className="text-xs bg-orange-100 text-orange-700 border-orange-300">
                                부분정답 ({Math.round((answer.partial_score || 0) * 100)}%)
                              </Badge>
                            )}
                          </div>
                          <p className="text-slate-600 mb-2">{answer.meaning}</p>
                          {answer.question_type === 'spelling' && (
                            <div className="flex items-center gap-3 text-sm bg-white p-2 rounded-lg">
                              <span className="text-red-500">
                                <XCircle className="w-4 h-4 inline mr-1" />
                                {answer.student_answer}
                              </span>
                              <ChevronRight className="w-4 h-4 text-slate-400" />
                              <span className="text-green-600 font-medium">
                                <CheckCircle2 className="w-4 h-4 inline mr-1" />
                                {cleanWord(String(answer.correct_answer))}
                              </span>
                            </div>
                          )}
                          {(answer.question_type === 'example' || answer.question_type === 'definition') && (
                            <div className="space-y-2 text-sm bg-white p-3 rounded-lg">
                              {answer.question_type === 'example' && (answer as any).example_sentence && (
                                <div className="text-slate-600 text-xs italic mb-2 p-2 bg-slate-50 rounded">
                                  📝 {(answer as any).example_sentence}
                                </div>
                              )}
                              {answer.question_type === 'definition' && (answer as any).english_definition && (
                                <div className="text-slate-600 text-xs mb-2 p-2 bg-slate-50 rounded">
                                  📖 {(answer as any).english_definition}
                                </div>
                              )}
                              <div className="flex items-center gap-3">
                                <span className="text-red-500 flex items-center gap-1">
                                  <XCircle className="w-4 h-4" />
                                  {answer.student_answer || '(무응답)'}
                                </span>
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                                <span className="text-green-600 font-medium flex items-center gap-1">
                                  <CheckCircle2 className="w-4 h-4" />
                                  {cleanWord(String(answer.correct_answer))}
                                </span>
                              </div>
                            </div>
                          )}
                          {answer.question_type === 'multiple_choice' && (
                            <div className="space-y-2 text-sm bg-white p-3 rounded-lg">
                              {/* 학생이 선택한 오답 표시 */}
                              {(() => {
                                const studentAnswers = Array.isArray(answer.student_answer) 
                                  ? answer.student_answer 
                                  : answer.student_answer ? [answer.student_answer] : [];
                                let correctAnswers: string[] = [];
                                try {
                                  const parsed = Array.isArray(answer.correct_answer) 
                                    ? answer.correct_answer 
                                    : JSON.parse(String(answer.correct_answer));
                                  correctAnswers = Array.isArray(parsed) ? parsed : [String(parsed)];
                                } catch {
                                  correctAnswers = [String(answer.correct_answer)];
                                }
                                
                                // 정규화 함수 (비교용)
                                const normalize = (text: string) => 
                                  text?.trim().replace(/\s+/g, ' ').replace(/^\d+\.\s*/, '').replace(/\[([명동형부])\]\s*/g, '').toLowerCase() || '';
                                
                                // 표시용 클린 함수 - 숫자 접두사와 품사 마커 제거
                                const cleanForDisplay = (text: string) => 
                                  text?.trim()
                                    .replace(/^\d+\.\s*/, '')
                                    .replace(/\[([명동형부])\]\s*/g, '')
                                    .trim() || '';
                                
                                // 정답 배열 그대로 사용 (이미 시험 생성 시 분리되어 저장됨)
                                const uniqueCleanedCorrect = correctAnswers.map(ca => cleanForDisplay(ca));
                                
                                const normalizedCorrect = uniqueCleanedCorrect.map(normalize);
                                
                                // 학생이 선택했지만 오답인 것들
                                const wrongSelections = studentAnswers.filter(sa => 
                                  !normalizedCorrect.includes(normalize(String(sa)))
                                );
                                
                                // 학생이 선택하지 않은 정답들
                                const missedCorrect = uniqueCleanedCorrect.filter(ca => 
                                  !studentAnswers.some(sa => normalize(String(sa)) === normalize(ca))
                                );

                                return (
                                  <>
                                    {wrongSelections.length > 0 && (
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-red-500 font-medium flex items-center gap-1">
                                          <XCircle className="w-4 h-4" />
                                          잘못 선택:
                                        </span>
                                        {wrongSelections.map((ws, i) => (
                                          <Badge key={i} variant="outline" className="bg-red-50 text-red-600 border-red-200">
                                            {cleanForDisplay(String(ws))}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                    {missedCorrect.length > 0 && (
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-amber-600 font-medium flex items-center gap-1">
                                          <AlertTriangle className="w-4 h-4" />
                                          미선택 정답:
                                        </span>
                                        {missedCorrect.map((mc, i) => (
                                          <Badge key={i} variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                            {mc}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                    <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200">
                                      <span className="text-green-600 font-medium flex items-center gap-1">
                                        <CheckCircle2 className="w-4 h-4" />
                                        정답:
                                      </span>
                                      {uniqueCleanedCorrect.map((ca, i) => (
                                        <Badge key={i} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                          {ca}
                                        </Badge>
                                      ))}
                                    </div>
                                  </>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  );
                })}
              </div>
              
              <div className="p-4 bg-slate-100 rounded-xl border-2 border-slate-300 flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-slate-600 flex-shrink-0" />
                <div>
                  <p className="font-bold text-slate-800">복습 권장</p>
                  <p className="text-sm text-slate-700 mt-1">
                    위 단어들을 오답노트에 정리하고, 매일 3회 이상 복습하면 기억에 오래 남습니다.
                  </p>
                </div>
              </div>
            </div>
          )}


          {/* 시험 정보 */}
          {submission.exam && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-800 border-b-2 border-blue-500 pb-2">
                시험 상세 정보
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-sm text-slate-600 mb-1">객관식</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {submission.exam.multiple_choice_count}문항
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-sm text-slate-600 mb-1">스펠링</div>
                    <div className="text-2xl font-bold text-green-600">
                      {submission.exam.spelling_count}문항
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-sm text-slate-600 mb-1">정의</div>
                    <div className="text-2xl font-bold text-purple-600">
                      {submission.exam.definition_count}문항
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-sm text-slate-600 mb-1">예문</div>
                    <div className="text-2xl font-bold text-slate-800">
                      {submission.exam.example_count}문항
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-6 md:py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard")}
            className="gap-2 bg-white border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            돌아가기
          </Button>
        </div>

        {/* Search Card */}
        <Card className="border shadow-xl bg-white overflow-hidden">
          <CardHeader className="text-center pb-4 bg-gradient-to-b from-slate-50 to-white">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-1 shadow-xl">
                  <img 
                    src={orunLogo} 
                    alt="오른 로고" 
                    className="w-full h-full rounded-xl object-cover"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg border border-slate-100">
                  <Search className="w-4 h-4 text-blue-600" />
                </div>
              </div>
            </div>
            <CardTitle className="text-2xl md:text-3xl text-slate-800">시험 결과 조회</CardTitle>
            <p className="text-slate-500 mt-2">
              시험 응시 시 입력했던 이름을 입력해주세요
            </p>
          </CardHeader>
          <CardContent className="space-y-4 pb-8">
            <div className="flex gap-2 max-w-md mx-auto">
              <Input
                placeholder="이름+휴대폰번호 뒷4자리"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
              />
              <Button 
                onClick={handleSearch} 
                disabled={loading} 
                className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-md"
              >
                <Search className="w-4 h-4" />
                {loading ? "검색 중..." : "조회"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results List */}
        {searched && submissions.length > 0 && !selectedSubmission && (
          <Card className="border shadow-sm bg-white">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-xl text-slate-800 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-slate-700" />
                {studentName}님의 시험 기록
                <Badge className="ml-2 bg-blue-100 text-blue-700 border-blue-200">{submissions.length}건</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {submissions.map((sub) => (
                  <div
                    key={sub.id}
                    className={`group flex items-center justify-between p-4 rounded-xl border ${getScoreBgColor(sub.score)} hover:shadow-md transition-all cursor-pointer`}
                    onClick={() => setSelectedSubmission(sub)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center">
                        <FileText className="w-6 h-6 text-blue-500" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-800 group-hover:text-blue-600 transition-colors">
                          {sub.exam?.title || "시험"}
                        </div>
                        <div className="text-sm text-slate-500">
                          {new Date(sub.submitted_at).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getScoreColor(sub.score)}`}>
                          {sub.score.toFixed(0)}점
                        </div>
                        <div className="text-sm text-slate-500">
                          {sub.correct_count}/{sub.total_count}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Selected Report */}
        {selectedSubmission && (
          <>
            <Button
              variant="outline"
              onClick={() => setSelectedSubmission(null)}
              className="gap-2 bg-white border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              목록으로
            </Button>
            {renderReport(selectedSubmission)}
          </>
        )}

        {/* No Results */}
        {searched && submissions.length === 0 && !loading && (
          <Card className="border shadow-sm bg-white text-center py-16">
            <CardContent>
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-slate-100 flex items-center justify-center">
                <Search className="w-10 h-10 text-slate-400" />
              </div>
              <p className="text-xl text-slate-700 font-medium">
                해당 이름으로 응시한 시험 기록이 없습니다.
              </p>
              <p className="text-slate-500 mt-2">
                시험 응시 시 입력했던 이름과 정확히 일치하는지 확인해주세요.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
