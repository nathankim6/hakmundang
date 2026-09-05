import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { GitCompare, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

interface SavedReport {
  id: string;
  school_name: string;
  school_logo: string | null;
  year_data: any;
}

const Compare = () => {
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from("reports")
        .select("id, school_name, school_logo, year_data")
        .order("school_name");

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("학교 데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSchool = (reportId: string) => {
    setSelectedReports(prev =>
      prev.includes(reportId)
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    );
  };

  const selectedData = reports.filter(r => selectedReports.includes(r.id));

  // 비교 데이터 준비
  const prepareComparisonData = () => {
    if (selectedData.length === 0) return null;

    const year2024Data = selectedData.map(report => {
      const [, year2024] = report.year_data;
      return {
        school: report.school_name,
        국어평균: year2024.koreanAvg,
        영어평균: year2024.englishAvg,
        수학평균: year2024.mathAvg,
        국어표준편차: year2024.koreanStdDev,
        영어표준편차: year2024.englishStdDev,
        수학표준편차: year2024.mathStdDev,
      };
    });

    const volatilityData = selectedData.map(report => {
      const [year2023, year2024] = report.year_data;
      return {
        school: report.school_name,
        국어평균변동: ((year2024.koreanAvg - year2023.koreanAvg) / year2023.koreanAvg * 100).toFixed(1),
        영어평균변동: ((year2024.englishAvg - year2023.englishAvg) / year2023.englishAvg * 100).toFixed(1),
        수학평균변동: ((year2024.mathAvg - year2023.mathAvg) / year2023.mathAvg * 100).toFixed(1),
      };
    });

    const radarData = ['국어', '영어', '수학'].map(subject => {
      const dataPoint: any = { subject };
      selectedData.forEach(report => {
        const [, year2024] = report.year_data;
        if (subject === '국어') dataPoint[report.school_name] = year2024.koreanAvg;
        if (subject === '영어') dataPoint[report.school_name] = year2024.englishAvg;
        if (subject === '수학') dataPoint[report.school_name] = year2024.mathAvg;
      });
      return dataPoint;
    });

    return { year2024Data, volatilityData, radarData };
  };

  const comparisonData = prepareComparisonData();

  const COLORS = [
    'hsl(var(--gold-accent))',
    'hsl(var(--navy))',
    'hsl(var(--navy-light))',
    '#8884d8',
    '#82ca9d',
    '#ffc658',
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground">데이터를 불러오는 중...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[hsl(var(--gold-accent))]/20 to-amber-100/20 flex items-center justify-center">
                <GitCompare className="w-6 h-6 text-[hsl(var(--gold-accent))]" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-[hsl(var(--navy))] via-[hsl(var(--navy-light))] to-[hsl(var(--gold-accent))] bg-clip-text text-transparent">
                학교 비교분석
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              여러 학교의 분석 데이터를 비교하여 인사이트를 얻으세요
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 학교 선택 패널 */}
            <Card className="lg:col-span-1 border-[hsl(var(--gold-accent))]/30">
              <CardHeader>
                <CardTitle>학교 선택</CardTitle>
                <CardDescription>비교할 학교를 선택하세요 (최대 6개)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {reports.map(report => (
                  <div key={report.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <Checkbox
                      id={report.id}
                      checked={selectedReports.includes(report.id)}
                      onCheckedChange={() => toggleSchool(report.id)}
                      disabled={!selectedReports.includes(report.id) && selectedReports.length >= 6}
                    />
                    <label
                      htmlFor={report.id}
                      className="flex-1 flex items-center gap-2 cursor-pointer"
                    >
                      {report.school_logo && (
                        <img src={report.school_logo} alt={report.school_name} className="w-8 h-8 rounded-full object-cover" />
                      )}
                      <span className="text-sm font-medium">{report.school_name}</span>
                    </label>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* 비교 결과 패널 */}
            <div className="lg:col-span-2 space-y-6">
              {!comparisonData || selectedData.length === 0 ? (
                <Card className="border-[hsl(var(--gold-accent))]/30">
                  <CardContent className="py-12 text-center">
                    <GitCompare className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      왼쪽에서 비교할 학교를 선택해주세요
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* 2024년 평균 비교 */}
                  <Card className="border-[hsl(var(--gold-accent))]/30">
                    <CardHeader>
                      <CardTitle>2024년 과목별 평균 비교</CardTitle>
                      <CardDescription>선택된 학교들의 과목별 평균점수</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={comparisonData.year2024Data}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="school" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="국어평균" fill={COLORS[0]} />
                          <Bar dataKey="영어평균" fill={COLORS[1]} />
                          <Bar dataKey="수학평균" fill={COLORS[2]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* 표준편차 비교 */}
                  <Card className="border-[hsl(var(--gold-accent))]/30">
                    <CardHeader>
                      <CardTitle>2024년 과목별 표준편차 비교</CardTitle>
                      <CardDescription>점수 분포의 산포도를 나타냅니다</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={comparisonData.year2024Data}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="school" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="국어표준편차" fill={COLORS[0]} />
                          <Bar dataKey="영어표준편차" fill={COLORS[1]} />
                          <Bar dataKey="수학표준편차" fill={COLORS[2]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* 레이더 차트 */}
                  <Card className="border-[hsl(var(--gold-accent))]/30">
                    <CardHeader>
                      <CardTitle>종합 성적 프로파일</CardTitle>
                      <CardDescription>학교별 과목 평균을 레이더 차트로 비교</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={400}>
                        <RadarChart data={comparisonData.radarData}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="subject" />
                          <PolarRadiusAxis angle={90} domain={[0, 100]} />
                          {selectedData.map((report, index) => (
                            <Radar
                              key={report.id}
                              name={report.school_name}
                              dataKey={report.school_name}
                              stroke={COLORS[index % COLORS.length]}
                              fill={COLORS[index % COLORS.length]}
                              fillOpacity={0.3}
                            />
                          ))}
                          <Tooltip />
                          <Legend />
                        </RadarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* 변동성 비교 */}
                  <Card className="border-[hsl(var(--gold-accent))]/30">
                    <CardHeader>
                      <CardTitle>2023→2024 평균 변동률 비교</CardTitle>
                      <CardDescription>전년 대비 평균 점수 변화율 (%)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={comparisonData.volatilityData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="school" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="국어평균변동" fill={COLORS[0]} />
                          <Bar dataKey="영어평균변동" fill={COLORS[1]} />
                          <Bar dataKey="수학평균변동" fill={COLORS[2]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* 종합 평가 */}
                  <Card className="border-[hsl(var(--gold-accent))]/30">
                    <CardHeader>
                      <CardTitle>종합 인사이트</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedData.map((report, index) => {
                        const [year2023, year2024] = report.year_data;
                        const avgChange = (
                          ((year2024.koreanAvg + year2024.englishAvg + year2024.mathAvg) -
                            (year2023.koreanAvg + year2023.englishAvg + year2023.mathAvg)) /
                          (year2023.koreanAvg + year2023.englishAvg + year2023.mathAvg) * 100
                        ).toFixed(1);

                        return (
                          <div key={report.id} className="flex items-start gap-3 p-4 rounded-lg border" style={{ borderColor: COLORS[index % COLORS.length] + '40' }}>
                            <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                            <div className="flex-1">
                              <h4 className="font-semibold mb-1">{report.school_name}</h4>
                              <p className="text-sm text-muted-foreground">
                                전체 평균 변동: <span className="font-medium">{avgChange}%</span>
                                {parseFloat(avgChange) > 0 ? <TrendingUp className="inline w-4 h-4 ml-1 text-green-500" /> : <TrendingDown className="inline w-4 h-4 ml-1 text-red-500" />}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Compare;
