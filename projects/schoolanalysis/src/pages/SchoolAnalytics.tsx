import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Save, CheckCircle } from "lucide-react";
import { LineChart, Line, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { YearData } from "@/components/SchoolInfoForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LocationState {
  schoolName: string;
  schoolLogo?: string;
  yearData: [YearData, YearData, YearData];
  reportId?: string;
}

const SchoolAnalytics = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  // 2025 실제값 입력 상태
  const [actual2025, setActual2025] = useState({
    korean: "",
    english: "",
    math: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackSaved, setFeedbackSaved] = useState(false);

  // 학습된 예측 모델 가져오기
  const [learnedModel, setLearnedModel] = useState<any>(null);

  useEffect(() => {
    if (state?.reportId) {
      loadLearnedModel();
    }
  }, [state?.reportId]);

  const loadLearnedModel = async () => {
    if (!state?.reportId) return;

    try {
      const { data, error } = await supabase
        .from("prediction_feedback")
        .select("*")
        .eq("report_id", state.reportId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data && data.length > 0) {
        setLearnedModel(data);
        setFeedbackSaved(true);
        
        // 저장된 실제값을 입력 필드에도 반영
        const latestFeedback = data.slice(0, 3); // 최신 3개 (국영수)
        latestFeedback.forEach((feedback: any) => {
          const actualStdDev = feedback.actual_std_dev.toString();
          if (feedback.predicted_std_dev === predictStdDev2025('korean')) {
            setActual2025(prev => ({ ...prev, korean: actualStdDev }));
          } else if (feedback.predicted_std_dev === predictStdDev2025('english')) {
            setActual2025(prev => ({ ...prev, english: actualStdDev }));
          } else {
            setActual2025(prev => ({ ...prev, math: actualStdDev }));
          }
        });
      }
    } catch (error) {
      console.error("Error loading learned model:", error);
    }
  };

  if (!state || !state.yearData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-white">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <p className="text-lg text-slate-500 font-medium">학교 데이터를 찾을 수 없습니다.</p>
            <Button onClick={() => navigate("/repository")} className="mt-4">
              목록으로 돌아가기
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const { schoolName, schoolLogo, yearData } = state;
  const [year2023, year2024, year2025] = yearData;

  // 과거 2개년 트렌드 데이터 준비
  const trendData = [
    {
      year: year2023.year,
      국어평균: year2023.koreanAvg,
      국어표준편차: year2023.koreanStdDev,
      영어평균: year2023.englishAvg,
      영어표준편차: year2023.englishStdDev,
      수학평균: year2023.mathAvg,
      수학표준편차: year2023.mathStdDev,
    },
    {
      year: year2024.year,
      국어평균: year2024.koreanAvg,
      국어표준편차: year2024.koreanStdDev,
      영어평균: year2024.englishAvg,
      영어표준편차: year2024.englishStdDev,
      수학평균: year2024.mathAvg,
      수학표준편차: year2024.mathStdDev,
    },
  ];

  // 변동성 계산
  const calculateVolatility = (val2023: number, val2024: number) => {
    return ((val2024 - val2023) / val2023 * 100).toFixed(2);
  };

  const volatilityData = {
    국어평균: calculateVolatility(year2023.koreanAvg, year2024.koreanAvg),
    국어표준편차: calculateVolatility(year2023.koreanStdDev, year2024.koreanStdDev),
    영어평균: calculateVolatility(year2023.englishAvg, year2024.englishAvg),
    영어표준편차: calculateVolatility(year2023.englishStdDev, year2024.englishStdDev),
    수학평균: calculateVolatility(year2023.mathAvg, year2024.mathAvg),
    수학표준편차: calculateVolatility(year2023.mathStdDev, year2024.mathStdDev),
  };

  // 성취도 안정성 계산 (각 등급별 변화의 절댓값 합)
  const calculateGradeStability = (grades2023: any, grades2024: any) => {
    const changes = ['A', 'B', 'C', 'D', 'E'].map(grade => 
      Math.abs(grades2024[grade] - grades2023[grade])
    );
    return changes.reduce((sum, change) => sum + change, 0).toFixed(1);
  };

  const stabilityData = [
    {
      subject: "국어",
      변동폭: parseFloat(calculateGradeStability(year2023.koreanGrades, year2024.koreanGrades)),
      안정성: 100 - parseFloat(calculateGradeStability(year2023.koreanGrades, year2024.koreanGrades)),
    },
    {
      subject: "영어",
      변동폭: parseFloat(calculateGradeStability(year2023.englishGrades, year2024.englishGrades)),
      안정성: 100 - parseFloat(calculateGradeStability(year2023.englishGrades, year2024.englishGrades)),
    },
    {
      subject: "수학",
      변동폭: parseFloat(calculateGradeStability(year2023.mathGrades, year2024.mathGrades)),
      안정성: 100 - parseFloat(calculateGradeStability(year2023.mathGrades, year2024.mathGrades)),
    },
  ];

  // 표준편차 예측 (학습 모델 반영)
  const predictStdDev2024 = (stdDev2023: number, avg2023: number, avg2024: number) => {
    const avgChangeRatio = avg2024 / avg2023;
    return stdDev2023 * avgChangeRatio;
  };

  // 개선된 2025년 예측 (학습 데이터 반영)
  const predictStdDev2025 = (subject: 'korean' | 'english' | 'math') => {
    const year2024 = yearData[1];
    const year2023 = yearData[0];

    let baseStdDev, baseAvg, targetAvg;
    if (subject === 'korean') {
      baseStdDev = year2024.koreanStdDev;
      baseAvg = year2024.koreanAvg;
      targetAvg = year2025.koreanAvg;
    } else if (subject === 'english') {
      baseStdDev = year2024.englishStdDev;
      baseAvg = year2024.englishAvg;
      targetAvg = year2025.englishAvg;
    } else {
      baseStdDev = year2024.mathStdDev;
      baseAvg = year2024.mathAvg;
      targetAvg = year2025.mathAvg;
    }

    // 기본 예측
    let prediction = predictStdDev2024(baseStdDev, baseAvg, targetAvg);

    // 학습 데이터가 있으면 조정
    if (learnedModel && learnedModel.length > 0) {
      const avgErrorRate = learnedModel.reduce((sum: number, feedback: any) => sum + parseFloat(feedback.error_rate), 0) / learnedModel.length;
      // 오차율을 반영하여 예측값 조정 (간단한 보정)
      prediction = prediction * (1 + avgErrorRate / 100);
    }

    return prediction;
  };

  // 2025년 예측 데이터
  const prediction2025Data = [
    {
      과목: "국어",
      "2025 예측": parseFloat(predictStdDev2025('korean').toFixed(2)),
      "2025 실제": actual2025.korean ? parseFloat(actual2025.korean) : null,
    },
    {
      과목: "영어",
      "2025 예측": parseFloat(predictStdDev2025('english').toFixed(2)),
      "2025 실제": actual2025.english ? parseFloat(actual2025.english) : null,
    },
    {
      과목: "수학",
      "2025 예측": parseFloat(predictStdDev2025('math').toFixed(2)),
      "2025 실제": actual2025.math ? parseFloat(actual2025.math) : null,
    },
  ];

  const handleSaveFeedback = async () => {
    if (!state?.reportId || !actual2025.korean || !actual2025.english || !actual2025.math) {
      toast.error("모든 과목의 실제 표준편차를 입력해주세요.");
      return;
    }

    setIsSaving(true);

    try {
      const feedbackData = [
        {
          report_id: state.reportId,
          school_name: schoolName,
          year: 2025,
          predicted_std_dev: predictStdDev2025('korean'),
          actual_std_dev: parseFloat(actual2025.korean),
          error_rate: ((parseFloat(actual2025.korean) - predictStdDev2025('korean')) / parseFloat(actual2025.korean) * 100),
        },
        {
          report_id: state.reportId,
          school_name: schoolName,
          year: 2025,
          predicted_std_dev: predictStdDev2025('english'),
          actual_std_dev: parseFloat(actual2025.english),
          error_rate: ((parseFloat(actual2025.english) - predictStdDev2025('english')) / parseFloat(actual2025.english) * 100),
        },
        {
          report_id: state.reportId,
          school_name: schoolName,
          year: 2025,
          predicted_std_dev: predictStdDev2025('math'),
          actual_std_dev: parseFloat(actual2025.math),
          error_rate: ((parseFloat(actual2025.math) - predictStdDev2025('math')) / parseFloat(actual2025.math) * 100),
        },
      ];

      const { error } = await supabase
        .from("prediction_feedback")
        .insert(feedbackData);

      if (error) throw error;

      toast.success("피드백이 저장되어 예측 모델이 개선되었습니다!");
      setFeedbackSaved(true);
      await loadLearnedModel();
    } catch (error) {
      console.error("Error saving feedback:", error);
      toast.error("피드백 저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const predictionData = [
    {
      과목: "국어",
      "2024 실제": year2024.koreanStdDev,
      "2024 예측": parseFloat(predictStdDev2024(year2023.koreanStdDev, year2023.koreanAvg, year2024.koreanAvg).toFixed(2)),
      오차: Math.abs(year2024.koreanStdDev - predictStdDev2024(year2023.koreanStdDev, year2023.koreanAvg, year2024.koreanAvg)).toFixed(2),
    },
    {
      과목: "영어",
      "2024 실제": year2024.englishStdDev,
      "2024 예측": parseFloat(predictStdDev2024(year2023.englishStdDev, year2023.englishAvg, year2024.englishAvg).toFixed(2)),
      오차: Math.abs(year2024.englishStdDev - predictStdDev2024(year2023.englishStdDev, year2023.englishAvg, year2024.englishAvg)).toFixed(2),
    },
    {
      과목: "수학",
      "2024 실제": year2024.mathStdDev,
      "2024 예측": parseFloat(predictStdDev2024(year2023.mathStdDev, year2023.mathAvg, year2024.mathAvg).toFixed(2)),
      오차: Math.abs(year2024.mathStdDev - predictStdDev2024(year2023.mathStdDev, year2023.mathAvg, year2024.mathAvg)).toFixed(2),
    },
  ];

  const getTrendIcon = (value: string) => {
    const num = parseFloat(value);
    if (num > 2) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (num < -2) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* 헤더 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button onClick={() => navigate("/repository")} variant="outline" className="border-[hsl(var(--gold-accent))]/30">
                <ArrowLeft className="w-4 h-4 mr-2" />
                목록으로
              </Button>
              {schoolLogo && (
                <img src={schoolLogo} alt={`${schoolName} 로고`} className="w-12 h-12 object-contain border rounded-lg p-1" />
              )}
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[hsl(var(--navy))] to-[hsl(var(--gold-accent))] bg-clip-text text-transparent">
                {schoolName} 분석
              </h1>
            </div>
          </div>

          {/* 2개년 트렌드 차트 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[hsl(var(--navy))]">과거 2개년 트렌드 분석</CardTitle>
              <CardDescription>2023-2024년 과목별 평균 및 표준편차 변화</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 평균 트렌드 */}
                <div>
                  <h3 className="text-sm font-semibold mb-4 text-[hsl(var(--navy))]">과목별 평균 점수 트렌드</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--gold-accent))" opacity={0.2} />
                      <XAxis dataKey="year" stroke="hsl(var(--navy))" />
                      <YAxis domain={[60, 100]} stroke="hsl(var(--navy))" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'white', border: '1px solid hsl(var(--gold-accent))' }}
                        labelStyle={{ color: 'hsl(var(--navy))' }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="국어평균" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="영어평균" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="수학평균" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* 표준편차 트렌드 */}
                <div>
                  <h3 className="text-sm font-semibold mb-4 text-[hsl(var(--navy))]">과목별 표준편차 트렌드</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--gold-accent))" opacity={0.2} />
                      <XAxis dataKey="year" stroke="hsl(var(--navy))" />
                      <YAxis domain={[10, 25]} stroke="hsl(var(--navy))" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'white', border: '1px solid hsl(var(--gold-accent))' }}
                        labelStyle={{ color: 'hsl(var(--navy))' }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="국어표준편차" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="영어표준편차" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="수학표준편차" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 변동성 지표 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[hsl(var(--navy))]">변동성 지표</CardTitle>
              <CardDescription>2023년 대비 2024년 변화율 (%)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(volatilityData).map(([key, value]) => (
                  <Card key={key} className="border-[hsl(var(--gold-accent))]/20">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-slate-600">{key}</p>
                        {getTrendIcon(value)}
                      </div>
                      <p className={`text-2xl font-bold ${parseFloat(value) > 0 ? 'text-green-600' : parseFloat(value) < 0 ? 'text-red-600' : 'text-slate-600'}`}>
                        {value}%
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 안정성 지표 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[hsl(var(--navy))]">성취도 분포 안정성</CardTitle>
              <CardDescription>등급 분포 변화가 적을수록 안정적 (100점 만점)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stabilityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--gold-accent))" opacity={0.2} />
                  <XAxis dataKey="subject" stroke="hsl(var(--navy))" />
                  <YAxis stroke="hsl(var(--navy))" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'white', border: '1px solid hsl(var(--gold-accent))' }}
                    labelStyle={{ color: 'hsl(var(--navy))' }}
                  />
                  <Legend />
                  <Bar dataKey="안정성" fill="hsl(var(--gold-accent))" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="변동폭" fill="#ef4444" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 표준편차 예측 검증 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[hsl(var(--navy))]">표준편차 예측 정확도 검증</CardTitle>
              <CardDescription>2023년 데이터 기반 2024년 예측값 vs 실제값 비교</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={predictionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--gold-accent))" opacity={0.2} />
                    <XAxis dataKey="과목" stroke="hsl(var(--navy))" />
                    <YAxis stroke="hsl(var(--navy))" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'white', border: '1px solid hsl(var(--gold-accent))' }}
                      labelStyle={{ color: 'hsl(var(--navy))' }}
                    />
                    <Legend />
                    <Bar dataKey="2024 실제" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="2024 예측" fill="hsl(var(--gold-accent))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {predictionData.map((item) => (
                    <Card key={item.과목} className="border-[hsl(var(--gold-accent))]/20">
                      <CardContent className="pt-6">
                        <h4 className="font-semibold text-[hsl(var(--navy))] mb-3">{item.과목}</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-600">2024 실제:</span>
                            <span className="font-medium text-[hsl(var(--navy))]">{item["2024 실제"]}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">2024 예측:</span>
                            <span className="font-medium text-[hsl(var(--navy))]">{item["2024 예측"]}</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-[hsl(var(--gold-accent))]/20">
                            <span className="text-slate-600">예측 오차:</span>
                            <span className={`font-bold ${parseFloat(item.오차) < 1 ? 'text-green-600' : parseFloat(item.오차) < 2 ? 'text-amber-600' : 'text-red-600'}`}>
                              {item.오차}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500">
                            정확도: {(100 - (parseFloat(item.오차) / item["2024 실제"]) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2025년 예측 및 학습 시스템 */}
          <Card className="border-[hsl(var(--gold-accent))]/30 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-[hsl(var(--gold-accent))]" />
                2025년 표준편차 예측 & 피드백 학습
              </CardTitle>
              <CardDescription>
                실제 2025년 데이터를 입력하여 예측 모델을 개선하세요
                {feedbackSaved && <span className="ml-2 text-green-600 font-semibold">✓ 피드백 저장됨</span>}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={prediction2025Data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--gold-accent))" opacity={0.2} />
                  <XAxis dataKey="과목" stroke="hsl(var(--navy))" />
                  <YAxis stroke="hsl(var(--navy))" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'white', border: '1px solid hsl(var(--gold-accent))' }}
                    labelStyle={{ color: 'hsl(var(--navy))' }}
                  />
                  <Legend />
                  <Bar dataKey="2025 예측" fill="hsl(var(--gold-accent))" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="2025 실제" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-6 space-y-4">
                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <h4 className="font-semibold text-sm text-[hsl(var(--navy))] mb-2">📚 학습 기반 예측</h4>
                  <p className="text-sm text-muted-foreground">
                    {learnedModel && learnedModel.length > 0 
                      ? `이 학교의 과거 예측 데이터 ${learnedModel.length}건을 학습하여 예측 정확도를 개선했습니다.`
                      : "아직 학습 데이터가 없습니다. 실제 2025년 표준편차를 입력하여 모델을 학습시키세요."}
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-[hsl(var(--navy))]">2025년 실제 표준편차 입력</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="korean-actual">국어 표준편차</Label>
                      <Input
                        id="korean-actual"
                        type="number"
                        step="0.01"
                        placeholder="예: 15.5"
                        value={actual2025.korean}
                        onChange={(e) => setActual2025(prev => ({ ...prev, korean: e.target.value }))}
                        disabled={feedbackSaved}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="english-actual">영어 표준편차</Label>
                      <Input
                        id="english-actual"
                        type="number"
                        step="0.01"
                        placeholder="예: 18.2"
                        value={actual2025.english}
                        onChange={(e) => setActual2025(prev => ({ ...prev, english: e.target.value }))}
                        disabled={feedbackSaved}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="math-actual">수학 표준편차</Label>
                      <Input
                        id="math-actual"
                        type="number"
                        step="0.01"
                        placeholder="예: 20.8"
                        value={actual2025.math}
                        onChange={(e) => setActual2025(prev => ({ ...prev, math: e.target.value }))}
                        disabled={feedbackSaved}
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={handleSaveFeedback} 
                    disabled={isSaving || feedbackSaved}
                    className="w-full bg-gradient-to-r from-[hsl(var(--navy))] to-[hsl(var(--gold-accent))]"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? "저장 중..." : feedbackSaved ? "피드백 저장 완료" : "피드백 저장 및 모델 학습"}
                  </Button>

                  {actual2025.korean && actual2025.english && actual2025.math && (
                    <div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-2">
                      <h4 className="font-semibold text-sm">예측 vs 실제 비교</h4>
                      {prediction2025Data.map((item) => {
                        if (!item["2025 실제"]) return null;
                        const error = Math.abs(item["2025 예측"] - item["2025 실제"]);
                        const errorRate = (error / item["2025 실제"] * 100).toFixed(1);
                        return (
                          <div key={item.과목} className="flex justify-between text-sm">
                            <span>{item.과목}</span>
                            <span>
                              오차: {error.toFixed(2)} ({errorRate}%)
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 종합 평가 */}
          <Card className="border-[hsl(var(--gold-accent))]/30 bg-gradient-to-br from-white to-amber-50/20">
            <CardHeader>
              <CardTitle className="text-[hsl(var(--navy))]">종합 평가</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[hsl(var(--gold-accent))] mt-1.5"></div>
                  <p className="text-slate-700">
                    <span className="font-semibold">변동성:</span> 평균 변동률이 ±5% 이내이면 안정적, ±10% 이상이면 변동성이 큰 학교입니다.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[hsl(var(--gold-accent))] mt-1.5"></div>
                  <p className="text-slate-700">
                    <span className="font-semibold">안정성:</span> 성취도 안정성이 90점 이상이면 매우 안정적인 분포를 유지하는 학교입니다.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[hsl(var(--gold-accent))] mt-1.5"></div>
                  <p className="text-slate-700">
                    <span className="font-semibold">예측 정확도:</span> 예측 오차가 1.0 미만이면 매우 정확, 2.0 이상이면 개선이 필요합니다.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default SchoolAnalytics;
