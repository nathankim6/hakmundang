import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  Award, 
  TrendingUp, 
  BookOpen, 
  Target,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { 
  getAnalysisByScore, 
  getVLevelByScore,
  vocaLevelMapping,
  getElementaryVocabPercentage,
  getSuneungVocabPercentage
} from "@/data/vocaLevelData";

interface ExamSubmission {
  id: string;
  student_name: string;
  score: number;
  correct_count: number;
  total_count: number;
  submitted_at: string;
  answers?: any;
}

interface ExamData {
  id: string;
  title: string;
  card_set_id: string;
  multiple_choice_count: number;
  spelling_count: number;
  definition_count: number;
  example_count: number;
}

export default function StudentExamReport() {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState<ExamSubmission | null>(null);
  const [exam, setExam] = useState<ExamData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, [submissionId]);

  const fetchReportData = async () => {
    try {
      // Fetch submission data
      const { data: submissionData, error: submissionError } = await supabase
        .from("exam_submissions")
        .select("*")
        .eq("id", submissionId)
        .single();

      if (submissionError) throw submissionError;

      // Fetch exam data
      const { data: examData, error: examError } = await supabase
        .from("exams")
        .select("*")
        .eq("id", submissionData.exam_id)
        .single();

      if (examError) throw examError;

      setSubmission(submissionData);
      setExam(examData);
    } catch (error) {
      console.error("Error fetching report data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 flex items-center justify-center">
        <div className="text-lg text-slate-600 dark:text-slate-400">로딩 중...</div>
      </div>
    );
  }

  if (!submission || !exam) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 flex items-center justify-center">
        <div className="text-lg text-slate-600 dark:text-slate-400">데이터를 찾을 수 없습니다.</div>
      </div>
    );
  }

  const analysis = getAnalysisByScore(submission.score);
  const vLevel = getVLevelByScore(submission.score);
  const vLevelInfo = vocaLevelMapping[vLevel as keyof typeof vocaLevelMapping];
  const elementaryPercent = getElementaryVocabPercentage(submission.score);
  const suneungPercent = getSuneungVocabPercentage(submission.score);
  const accuracy = (submission.correct_count / submission.total_count) * 100;

  // V레벨 시각화를 위한 배열
  const allVLevels = ["V00", "V01", "V02", "V03", "V04", "V05", "V06", "V07", "V08", "V09", "V10", "V11", "V12", "V13", "V14"];
  const currentVIndex = allVLevels.indexOf(vLevel);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => navigate("/exam-results")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            돌아가기
          </Button>
        </div>

        {/* Main Report Card */}
        <Card className="border-2 shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 text-white pb-8">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl mb-2">{submission.student_name} 학생 리포트</CardTitle>
                <p className="text-blue-100">{exam.title}</p>
              </div>
              <Award className="w-16 h-16 text-yellow-300" />
            </div>
          </CardHeader>

          <CardContent className="p-8 space-y-8">
            {/* 종합 섹션 */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 border-b-2 border-blue-500 pb-2">
                종합
              </h2>
              
              {/* 응시 시험 난이도 & 내 점수 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 p-6 rounded-xl border-2 border-orange-200 dark:border-orange-800">
                  <div className="text-sm text-orange-700 dark:text-orange-300 mb-2">응시 시험 난이도</div>
                  <div className="text-5xl font-bold text-orange-600 dark:text-orange-400">{vLevel}</div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-6 rounded-xl border-2 border-blue-200 dark:border-blue-800">
                  <div className="text-sm text-blue-700 dark:text-blue-300 mb-2">내 점수(총점)</div>
                  <div className="text-5xl font-bold text-orange-600 dark:text-orange-400">
                    {submission.score.toFixed(1)}점 
                    <span className="text-2xl text-slate-500 dark:text-slate-400 ml-2">/ 100점</span>
                  </div>
                </div>
              </div>

              {/* V레벨 시각화 */}
              <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl">
                <div className="flex justify-between items-center mb-4">
                  {allVLevels.map((level, index) => (
                    <div key={level} className="flex flex-col items-center">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                          index === currentVIndex
                            ? "bg-orange-500 text-white scale-110 shadow-lg"
                            : index < currentVIndex
                            ? "bg-orange-200 dark:bg-orange-800 text-orange-700 dark:text-orange-300"
                            : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        {level.replace("V", "")}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Progress bar */}
                <div className="relative h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="absolute h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-1000"
                    style={{ width: `${((currentVIndex + 1) / allVLevels.length) * 100}%` }}
                  />
                </div>

                {/* 학년 레벨 표시 */}
                <div className="flex justify-between mt-3 text-xs">
                  <span className="text-slate-600 dark:text-slate-400">유치~초2</span>
                  <span className="text-orange-600 dark:text-orange-400 font-bold">초3~4</span>
                  <span className="text-orange-600 dark:text-orange-400 font-bold">초5~6</span>
                  <span className="text-orange-600 dark:text-orange-400 font-bold">중1</span>
                  <span className="text-orange-600 dark:text-orange-400 font-bold">중2</span>
                  <span className="text-slate-500 dark:text-slate-400">중3</span>
                  <span className="text-slate-500 dark:text-slate-400">고1</span>
                  <span className="text-slate-500 dark:text-slate-400">고2</span>
                  <span className="text-slate-500 dark:text-slate-400">고3</span>
                </div>

                <div className="mt-4 p-4 bg-white dark:bg-slate-700 rounded-lg">
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    <span className="font-bold text-orange-600 dark:text-orange-400">{vLevel}</span> 시험은{" "}
                    <span className="font-bold text-orange-600 dark:text-orange-400">{vLevelInfo?.grades}</span>{" "}
                    수준의 문항으로 구성됩니다.
                  </p>
                </div>
              </div>
            </div>

            {/* 평가 결과 */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 border-b-2 border-blue-500 pb-2">
                평가 결과
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Vocabulary Size */}
                <Card className="border-2 border-blue-200 dark:border-blue-800">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3 mb-3">
                      <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1" />
                      <div>
                        <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Vocabulary Size</div>
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                          약 {analysis.vocabularySize.split('-')[0]}단어 수준
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Vocabulary 수준 */}
                <Card className="border-2 border-green-200 dark:border-green-800">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3 mb-3">
                      <Target className="w-6 h-6 text-green-600 dark:text-green-400 mt-1" />
                      <div>
                        <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Vocabulary 수준</div>
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                          {vLevelInfo?.grades} 수준
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 응시자 대비 석차 */}
                <Card className="border-2 border-purple-200 dark:border-purple-800">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3 mb-3">
                      <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400 mt-1" />
                      <div>
                        <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">정답률</div>
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                          {accuracy.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 교육과정 기준 초등 필수 어휘 */}
                <Card className="border-2 border-amber-200 dark:border-amber-800 md:col-span-2">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3 mb-3">
                      <CheckCircle2 className="w-6 h-6 text-amber-600 dark:text-amber-400 mt-1" />
                      <div className="flex-1">
                        <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                          교육과정 기준 초등 필수 어휘 800개 중
                        </div>
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-3">
                          약 {elementaryPercent}% 알고 있음
                        </div>
                        <Progress value={elementaryPercent} className="h-3" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 최근 5개년 수능 기출 어휘 */}
                <Card className="border-2 border-rose-200 dark:border-rose-800">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3 mb-3">
                      <AlertCircle className="w-6 h-6 text-rose-600 dark:text-rose-400 mt-1" />
                      <div className="flex-1">
                        <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                          최근 5개년 수능 기출 어휘 중
                        </div>
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-3">
                          약 {suneungPercent}% 알고 있음
                        </div>
                        <Progress value={suneungPercent} className="h-3" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* 학습 처방 */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 border-b-2 border-blue-500 pb-2">
                학습 처방
              </h2>
              
              <Card className="border-2 border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950 dark:to-blue-950">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                          {analysis.cefr}
                        </Badge>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                          {vLevelInfo?.grades}
                        </Badge>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg">
                        {analysis.report}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 시험 정보 */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 border-b-2 border-blue-500 pb-2">
                시험 상세 정보
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">객관식</div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {exam.multiple_choice_count}문항
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">스펠링</div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {exam.spelling_count}문항
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">정의</div>
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {exam.definition_count}문항
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">예문</div>
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {exam.example_count}문항
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
