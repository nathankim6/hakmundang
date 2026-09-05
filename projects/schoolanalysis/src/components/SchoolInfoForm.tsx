import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";

export interface YearData {
  year: string;
  totalStudents: number;
  maleStudents: number;
  femaleStudents: number;
  koreanAvg: number;
  koreanStdDev: number;
  mathAvg: number;
  mathStdDev: number;
  englishAvg: number;
  englishStdDev: number;
  // 성취도 (A, B, C, D, E 등급별 인원)
  koreanGrades: { A: number; B: number; C: number; D: number; E: number };
  mathGrades: { A: number; B: number; C: number; D: number; E: number };
  englishGrades: { A: number; B: number; C: number; D: number; E: number };
  // 5등급제 기준 인원
  grade5System: { grade1: number; grade2: number; grade3: number; grade4: number; grade5: number };
}

export interface SchoolData {
  schoolName: string;
  schoolLogo?: string;
  yearData: [YearData, YearData, YearData]; // 3개년도
}

interface SchoolInfoFormProps {
  onSubmit: (data: SchoolData) => void;
  initialData?: SchoolData;
  region?: string;
}

export const SchoolInfoForm = ({ onSubmit, initialData, region }: SchoolInfoFormProps) => {
  const currentYear = new Date().getFullYear();
  const baseYear = region === "songpa" ? 2026 : currentYear;
  const [schoolName, setSchoolName] = useState(initialData?.schoolName || "");
  const [schoolLogo, setSchoolLogo] = useState<string>(initialData?.schoolLogo || "");
  
  
  const [yearData, setYearData] = useState<[YearData, YearData, YearData]>(initialData?.yearData || [
    {
      year: (baseYear - 2).toString(),

      totalStudents: 0,
      maleStudents: 0,
      femaleStudents: 0,
      koreanAvg: 0,
      koreanStdDev: 0,
      mathAvg: 0,
      mathStdDev: 0,
      englishAvg: 0,
      englishStdDev: 0,
      koreanGrades: { A: 0, B: 0, C: 0, D: 0, E: 0 },
      mathGrades: { A: 0, B: 0, C: 0, D: 0, E: 0 },
      englishGrades: { A: 0, B: 0, C: 0, D: 0, E: 0 },
      grade5System: { grade1: 0, grade2: 0, grade3: 0, grade4: 0, grade5: 0 },
    },
    {
      year: (baseYear - 1).toString(),
      totalStudents: 0,
      maleStudents: 0,
      femaleStudents: 0,
      koreanAvg: 0,
      koreanStdDev: 0,
      mathAvg: 0,
      mathStdDev: 0,
      englishAvg: 0,
      englishStdDev: 0,
      koreanGrades: { A: 0, B: 0, C: 0, D: 0, E: 0 },
      mathGrades: { A: 0, B: 0, C: 0, D: 0, E: 0 },
      englishGrades: { A: 0, B: 0, C: 0, D: 0, E: 0 },
      grade5System: { grade1: 0, grade2: 0, grade3: 0, grade4: 0, grade5: 0 },
    },
    {
      year: baseYear.toString(),
      totalStudents: 0,
      maleStudents: 0,
      femaleStudents: 0,
      koreanAvg: 0,
      koreanStdDev: 0,
      mathAvg: 0,
      mathStdDev: 0,
      englishAvg: 0,
      englishStdDev: 0,
      koreanGrades: { A: 0, B: 0, C: 0, D: 0, E: 0 },
      mathGrades: { A: 0, B: 0, C: 0, D: 0, E: 0 },
      englishGrades: { A: 0, B: 0, C: 0, D: 0, E: 0 },
      grade5System: { grade1: 0, grade2: 0, grade3: 0, grade4: 0, grade5: 0 },
    },
  ]);

  // initialData가 변경되면 state 업데이트
  useEffect(() => {
    if (initialData) {
      setSchoolName(initialData.schoolName);
      setSchoolLogo(initialData.schoolLogo || "");
      setYearData(initialData.yearData);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ schoolName, schoolLogo, yearData });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSchoolLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 5등급제 자동 계산 (누적 비율 기준)
  const calculate5GradeSystem = (totalStudents: number) => {
    return {
      grade1: Math.round(totalStudents * 0.10), // 10%
      grade2: Math.round(totalStudents * 0.34), // 34%
      grade3: Math.round(totalStudents * 0.66), // 66%
      grade4: Math.round(totalStudents * 0.90), // 90%
      grade5: totalStudents, // 100%
    };
  };

  const updateYearData = (yearIndex: number, field: keyof YearData, value: any) => {
    const newYearData = [...yearData] as [YearData, YearData, YearData];
    newYearData[yearIndex] = {
      ...newYearData[yearIndex],
      [field]: value,
    };
    
    // 총 학생 수 또는 남학생 수가 변경되면 여학생 수 자동 계산
    if (field === 'totalStudents' || field === 'maleStudents') {
      const total = field === 'totalStudents' ? value : newYearData[yearIndex].totalStudents;
      const male = field === 'maleStudents' ? value : newYearData[yearIndex].maleStudents;
      newYearData[yearIndex].femaleStudents = Math.max(0, total - male);
    }
    
    // 총 학생 수가 변경되면 5등급제 자동 계산
    if (field === 'totalStudents') {
      newYearData[yearIndex].grade5System = calculate5GradeSystem(value);
    }
    
    // 평균이 변경되면 표준편차 자동 재계산 (with historical validation for 2025)
    if (field === 'koreanAvg') {
      const calculatedStdDev = calculateStdDev(newYearData[yearIndex].koreanGrades, value, yearIndex);
      newYearData[yearIndex].koreanStdDev = parseFloat(calculatedStdDev.toFixed(2));
    }
    if (field === 'mathAvg') {
      const calculatedStdDev = calculateStdDev(newYearData[yearIndex].mathGrades, value, yearIndex);
      newYearData[yearIndex].mathStdDev = parseFloat(calculatedStdDev.toFixed(2));
    }
    if (field === 'englishAvg') {
      const calculatedStdDev = calculateStdDev(newYearData[yearIndex].englishGrades, value, yearIndex);
      newYearData[yearIndex].englishStdDev = parseFloat(calculatedStdDev.toFixed(2));
    }
    
    setYearData(newYearData);
  };

  const updateGradeData = (yearIndex: number, subject: 'koreanGrades' | 'mathGrades' | 'englishGrades', grade: string, value: number) => {
    const newYearData = [...yearData] as [YearData, YearData, YearData];
    const currentGrades = newYearData[yearIndex][subject];
    
    // Update the specified grade
    const updatedGrades = {
      ...currentGrades,
      [grade]: value,
    };
    
    // Auto-calculate E grade to make total 100
    if (grade !== 'E') {
      const total = updatedGrades.A + updatedGrades.B + updatedGrades.C + updatedGrades.D;
      updatedGrades.E = parseFloat(Math.max(0, 100 - total).toFixed(1));
    }
    
    newYearData[yearIndex] = {
      ...newYearData[yearIndex],
      [subject]: updatedGrades,
    };
    
    // Auto-calculate standard deviation based on achievement distribution and average
    // with historical validation for 2025
    const subjectKey = subject.replace('Grades', '') as 'korean' | 'math' | 'english';
    const avgKey = `${subjectKey}Avg` as keyof YearData;
    const stdDevKey = `${subjectKey}StdDev` as keyof YearData;
    const average = newYearData[yearIndex][avgKey] as number;
    const calculatedStdDev = calculateStdDev(updatedGrades, average, yearIndex);
    (newYearData[yearIndex] as any)[stdDevKey] = parseFloat(calculatedStdDev.toFixed(2));
    
    setYearData(newYearData);
  };

  // Enhanced calculation with historical data validation
  // Uses 2-year historical pattern to predict future standard deviation
  const calculateStdDev = (
    grades: { A: number; B: number; C: number; D: number; E: number },
    average: number,
    yearIndex?: number
  ): number => {
    // Extract historical patterns from 2023-2024 data for better prediction
    let historicalAdjustment = 1.0;
    
    if (yearIndex !== undefined && yearIndex === 2) {
      // For 2025 prediction, analyze 2023-2024 patterns
      const year2023 = yearData[0];
      const year2024 = yearData[1];
      
      // Calculate historical trends for the same subject
      const subject = grades === yearData[2].koreanGrades ? 'korean' :
                     grades === yearData[2].mathGrades ? 'math' : 'english';
      
      const avg2023 = subject === 'korean' ? year2023.koreanAvg : 
                      subject === 'math' ? year2023.mathAvg : year2023.englishAvg;
      const avg2024 = subject === 'korean' ? year2024.koreanAvg :
                      subject === 'math' ? year2024.mathAvg : year2024.englishAvg;
      const stdDev2023 = subject === 'korean' ? year2023.koreanStdDev :
                         subject === 'math' ? year2023.mathStdDev : year2023.englishStdDev;
      const stdDev2024 = subject === 'korean' ? year2024.koreanStdDev :
                         subject === 'math' ? year2024.mathStdDev : year2024.englishStdDev;
      
      const grades2023 = subject === 'korean' ? year2023.koreanGrades :
                         subject === 'math' ? year2023.mathGrades : year2023.englishGrades;
      const grades2024 = subject === 'korean' ? year2024.koreanGrades :
                         subject === 'math' ? year2024.mathGrades : year2024.englishGrades;
      
      // Analyze school characteristic: stability vs volatility
      if (stdDev2023 > 0 && stdDev2024 > 0 && avg2023 > 0 && avg2024 > 0) {
        // 1. Trend analysis: Are scores improving or declining?
        const avgTrend = (avg2024 - avg2023) / avg2023;
        const stdDevTrend = (stdDev2024 - stdDev2023) / stdDev2023;
        
        // 2. Grade distribution stability
        const topStability2023 = grades2023.A + grades2023.B;
        const topStability2024 = grades2024.A + grades2024.B;
        const topChange = Math.abs(topStability2024 - topStability2023);
        
        // 3. Historical standard deviation ratio to apply
        const avgStdDevRatio = ((stdDev2023 / avg2023) + (stdDev2024 / avg2024)) / 2;
        const predictedStdDevFromRatio = average * avgStdDevRatio;
        
        // 4. If school shows consistent patterns (low volatility), weight historical ratio more
        const volatility = Math.abs(stdDevTrend) + (topChange / 100);
        const historicalWeight = Math.max(0.3, 1 - volatility); // 30-100% weight
        
        // Use weighted combination of formula-based and historical-based prediction
        historicalAdjustment = 0.5 + (historicalWeight * 0.5); // 0.5-1.0 range
        
        // Apply trend continuation: if std dev was increasing, predict slight increase
        if (stdDevTrend > 0.05) {
          historicalAdjustment *= 1.02; // +2% for increasing trend
        } else if (stdDevTrend < -0.05) {
          historicalAdjustment *= 0.98; // -2% for decreasing trend
        }
      }
    }
    
    // Adaptive grade score calculation based on average score
    let gradeScores = { A: 94, B: 84.5, C: 74.5, D: 64.5, E: 52 };
    
    // Adjust grade scores based on average (school difficulty characteristic)
    if (average >= 85) {
      gradeScores = { A: 95.5, B: 88, C: 80, D: 72, E: 60 };
    } else if (average >= 80) {
      gradeScores = { A: 94.5, B: 86, C: 77, D: 68, E: 56 };
    } else if (average >= 75) {
      gradeScores = { A: 93.5, B: 84.5, C: 75, D: 65, E: 52 };
    } else if (average >= 70) {
      gradeScores = { A: 92.5, B: 83, C: 73, D: 62, E: 48 };
    } else if (average >= 65) {
      gradeScores = { A: 91, B: 81, C: 71, D: 59, E: 44 };
    } else {
      gradeScores = { A: 89, B: 79, C: 68, D: 56, E: 40 };
    }
    
    // Additional adjustment based on achievement distribution pattern
    const topPercentage = grades.A + grades.B;
    const bottomPercentage = grades.D + grades.E;
    
    if (topPercentage > 60) {
      gradeScores.A += 1;
      gradeScores.B += 0.5;
      gradeScores.E += 3;
    } else if (bottomPercentage > 40) {
      gradeScores.A -= 0.5;
      gradeScores.B -= 0.5;
      gradeScores.E -= 4;
    }
    
    if (grades.A > 40) {
      gradeScores.A = Math.min(gradeScores.A + 1.5, 97);
      gradeScores.B = Math.min(gradeScores.B + 1, 90);
    }
    
    if (grades.E > 20) {
      gradeScores.E -= 5;
      gradeScores.D -= 2;
    }
    
    // Convert percentages to proportions
    const proportions = {
      A: grades.A / 100,
      B: grades.B / 100,
      C: grades.C / 100,
      D: grades.D / 100,
      E: grades.E / 100
    };
    
    // Calculate variance: Σ p_i(x_i - x̄)²
    const variance = 
      proportions.A * Math.pow(gradeScores.A - average, 2) +
      proportions.B * Math.pow(gradeScores.B - average, 2) +
      proportions.C * Math.pow(gradeScores.C - average, 2) +
      proportions.D * Math.pow(gradeScores.D - average, 2) +
      proportions.E * Math.pow(gradeScores.E - average, 2);
    
    let stdDev = Math.sqrt(variance);
    
    // Apply historical adjustment for 2025 predictions
    stdDev *= historicalAdjustment;
    
    // Apply final calibration based on typical ranges
    if (stdDev < 10) stdDev *= 1.15;
    if (stdDev > 25) stdDev *= 0.92;
    
    return stdDev;
  };

  return (
    <Card className="border bg-card">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-semibold">
          학교 정보 입력
        </CardTitle>
        <CardDescription className="text-sm">
          분석할 학교의 3개년도 데이터를 입력해주세요
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="space-y-2">
              <Label htmlFor="schoolName" className="text-sm font-semibold text-foreground">학교명</Label>
              <Input
                id="schoolName"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                required
                className="border-input focus:ring-2 focus:ring-primary/20"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="schoolLogo" className="text-sm font-semibold text-foreground">학교 로고</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="schoolLogo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="border-input focus:ring-2 focus:ring-primary/20"
                />
                {schoolLogo && (
                  <img 
                    src={schoolLogo} 
                    alt="학교 로고 미리보기" 
                    className="w-16 h-16 object-contain border rounded-lg p-1"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {yearData.map((data, yearIndex) => (
              <div key={yearIndex} className="space-y-6 border-l-2 border-primary/30 pl-4">
                <div className="sticky top-0 bg-card py-2">
                  <Label className="text-xs text-muted-foreground">학년도</Label>
                  <Input
                    type="text"
                    value={data.year}
                    onChange={(e) => updateYearData(yearIndex, 'year', e.target.value)}
                    placeholder="2023"
                    required
                    className="text-lg font-bold text-primary"
                  />
                </div>

                {/* 학생 정보 */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-foreground">학생 정보</h4>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">총 학생 수</Label>
                    <Input
                      type="number"
                      value={data.totalStudents ?? ''}
                      onChange={(e) => updateYearData(yearIndex, 'totalStudents', Number(e.target.value))}
                      required
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">남학생 수</Label>
                    <Input
                      type="number"
                      value={data.maleStudents ?? ''}
                      onChange={(e) => updateYearData(yearIndex, 'maleStudents', Number(e.target.value))}
                      required
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">여학생 수 (자동)</Label>
                    <Input
                      type="number"
                      value={data.femaleStudents || 0}
                      disabled
                      className="text-sm bg-muted/50"
                    />
                  </div>
                </div>

                {/* 국어 */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-foreground">국어</h4>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">평균</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={data.koreanAvg ?? ''}
                      onChange={(e) => updateYearData(yearIndex, 'koreanAvg', Number(e.target.value))}
                      required
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">성취도 (A~D)</Label>
                    <div className="grid grid-cols-4 gap-1">
                      {['A', 'B', 'C', 'D'].map((grade) => (
                        <div key={grade} className="space-y-1">
                          <Label className="text-[10px] text-muted-foreground text-center block">{grade}</Label>
                          <Input
                            type="number"
                            value={data.koreanGrades[grade as keyof typeof data.koreanGrades] ?? ''}
                            onChange={(e) => updateGradeData(yearIndex, 'koreanGrades', grade, Number(e.target.value))}
                            required
                            className="text-xs p-1 h-8"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground text-center block">E (자동)</Label>
                      <Input
                        type="number"
                        value={data.koreanGrades.E || 0}
                        disabled
                        className="text-xs p-1 h-8 bg-muted/50"
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      합계: {data.koreanGrades.A + data.koreanGrades.B + data.koreanGrades.C + data.koreanGrades.D + data.koreanGrades.E}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">표준편차 (자동 계산, 수정가능)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={data.koreanStdDev || 0}
                      onChange={(e) => updateYearData(yearIndex, 'koreanStdDev', Number(e.target.value))}
                      className="text-sm"
                    />
                  </div>
                </div>

                {/* 수학 */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-foreground">수학</h4>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">평균</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={data.mathAvg ?? ''}
                      onChange={(e) => updateYearData(yearIndex, 'mathAvg', Number(e.target.value))}
                      required
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">성취도 (A~D)</Label>
                    <div className="grid grid-cols-4 gap-1">
                      {['A', 'B', 'C', 'D'].map((grade) => (
                        <div key={grade} className="space-y-1">
                          <Label className="text-[10px] text-muted-foreground text-center block">{grade}</Label>
                          <Input
                            type="number"
                            value={data.mathGrades[grade as keyof typeof data.mathGrades] ?? ''}
                            onChange={(e) => updateGradeData(yearIndex, 'mathGrades', grade, Number(e.target.value))}
                            required
                            className="text-xs p-1 h-8"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground text-center block">E (자동)</Label>
                      <Input
                        type="number"
                        value={data.mathGrades.E || 0}
                        disabled
                        className="text-xs p-1 h-8 bg-muted/50"
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      합계: {data.mathGrades.A + data.mathGrades.B + data.mathGrades.C + data.mathGrades.D + data.mathGrades.E}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">표준편차 (자동 계산, 수정가능)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={data.mathStdDev || 0}
                      onChange={(e) => updateYearData(yearIndex, 'mathStdDev', Number(e.target.value))}
                      className="text-sm"
                    />
                  </div>
                </div>

                {/* 영어 */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-foreground">영어</h4>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">평균</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={data.englishAvg ?? ''}
                      onChange={(e) => updateYearData(yearIndex, 'englishAvg', Number(e.target.value))}
                      required
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">성취도 (A~D)</Label>
                    <div className="grid grid-cols-4 gap-1">
                      {['A', 'B', 'C', 'D'].map((grade) => (
                        <div key={grade} className="space-y-1">
                          <Label className="text-[10px] text-muted-foreground text-center block">{grade}</Label>
                          <Input
                            type="number"
                            value={data.englishGrades[grade as keyof typeof data.englishGrades] ?? ''}
                            onChange={(e) => updateGradeData(yearIndex, 'englishGrades', grade, Number(e.target.value))}
                            required
                            className="text-xs p-1 h-8"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground text-center block">E (자동)</Label>
                      <Input
                        type="number"
                        value={data.englishGrades.E || 0}
                        disabled
                        className="text-xs p-1 h-8 bg-muted/50"
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      합계: {data.englishGrades.A + data.englishGrades.B + data.englishGrades.C + data.englishGrades.D + data.englishGrades.E}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">표준편차 (자동 계산, 수정가능)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={data.englishStdDev || 0}
                      onChange={(e) => updateYearData(yearIndex, 'englishStdDev', Number(e.target.value))}
                      className="text-sm"
                    />
                  </div>
                </div>

                {/* 5등급제 */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-foreground">5등급제 (자동)</h4>
                  <div className="space-y-1">
                    {[
                      { label: '1등급', key: 'grade1', percent: '10%' },
                      { label: '2등급', key: 'grade2', percent: '34%' },
                      { label: '3등급', key: 'grade3', percent: '66%' },
                      { label: '4등급', key: 'grade4', percent: '90%' },
                      { label: '5등급', key: 'grade5', percent: '100%' },
                    ].map(({ label, key, percent }) => (
                      <div key={label} className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">
                          {label} ({percent})
                        </Label>
                        <Input
                          type="number"
                          value={data.grade5System[key as keyof typeof data.grade5System] || 0}
                          disabled
                          className="bg-muted/50 text-xs p-1 h-8"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center pt-4">
            <Button 
              type="submit" 
              className="px-12 bg-gradient-to-r from-primary to-secondary hover:shadow-[var(--shadow-elegant)] transition-all duration-300"
            >
              분석 리포트 생성
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
