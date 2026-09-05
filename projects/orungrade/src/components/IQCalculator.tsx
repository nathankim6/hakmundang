import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import NormalDistribution from "./NormalDistribution";
import { Calculator, RotateCcw } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox"; 

// Distribution properties
const MEAN_IQ = 100;
const SD_IQ = 15;

// Function to calculate percentile from z-score
const calculatePercentile = (z: number): number => {
  const b0 = 0.2316419;
  const b1 = 0.319381530;
  const b2 = -0.356563782;
  const b3 = 1.781477937;
  const b4 = -1.821255978;
  const b5 = 1.330274429;
  if (z >= 0) {
    const t = 1 / (1 + b0 * z);
    const pol = t * (b1 + t * (b2 + t * (b3 + t * (b4 + t * b5))));
    const percentile = 100 * (1 - 1 / Math.sqrt(2 * Math.PI) * Math.exp(-0.5 * z * z) * pol);
    return parseFloat(percentile.toFixed(2));
  } else {
    return 100 - calculatePercentile(-z);
  }
};

// Function to calculate student's rank and percentile based on raw score, mean, standard deviation, total students, tied rank option, and tied students count
const calculateRankAndPercentile = (
  rawScore: number, 
  mean: number, 
  stdDev: number, 
  totalStudents: number, 
  useTiedRank: boolean,
  tiedStudentsCount: number = 1
) => {
  // Calculate z-score: how many standard deviations the score is from the mean
  const zScore = (rawScore - mean) / stdDev;

  // Calculate percentile using the z-score
  const percentile = calculatePercentile(zScore);

  // Calculate rank based on tied rank option
  let estimatedRank;

  if (useTiedRank) {
    // With tied rank: Calculate rank based on how many students have scores higher than this student
    // Students with the same score will receive the same rank
    const higherScoresPercent = (100 - percentile) / 100;
    estimatedRank = Math.round(higherScoresPercent * totalStudents) + 1;
    
    // Adjust for specified number of students with same score - no need to modify rank since it's already calculated correctly
    // tiedStudentsCount now includes the student themselves
  } else {
    // Without tied rank: Standard ranking (might have small variations based on equal scores)
    estimatedRank = Math.round((100 - percentile) / 100 * totalStudents);
  }

  return {
    zScore,
    percentile,
    rank: estimatedRank === 0 ? 1 : estimatedRank, // Ensure rank is never 0
    tiedStudentsCount: useTiedRank ? tiedStudentsCount : 0
  };
};

// Function to get descriptive ranking
const getRankingDescription = (percentile: number): string => {
  if (percentile >= 99.9) return "매우 뛰어남 (Exceptionally Gifted)";
  if (percentile >= 99.7) return "상위 0.3% (Exceptionally Gifted)";
  if (percentile >= 99) return "상위 1% (Extremely Gifted)";
  if (percentile >= 98) return "상위 2% (Highly Gifted)";
  if (percentile >= 95) return "상위 5% (Superior)";
  if (percentile >= 90) return "상위 10% (Above Average)";
  if (percentile >= 75) return "상위 25% (Above Average)";
  if (percentile >= 50) return "평균 (Average)";
  if (percentile >= 25) return "하위 25% (Below Average)";
  if (percentile >= 10) return "하위 10% (Below Average)";
  if (percentile >= 5) return "하위 5% (Borderline)";
  if (percentile >= 2) return "하위 2% (Extremely Low)";
  return "하위 1% 미만 (Extremely Low)";
};

// Function to get grade level based on top percentile (상위 %) for 9-grade system
const getGradeLevel9 = (percentile: number): string => {
  // Convert to top percentile (상위 %)
  const topPercentile = 100 - percentile;

  // 1등급: 상위 4% 이내
  if (topPercentile <= 4) return "1등급";
  // 2등급: 상위 11% 이내
  if (topPercentile <= 11) return "2등급";
  // 3등급: 상위 23% 이��
  if (topPercentile <= 23) return "3등급";
  // 4등급: 상위 40% 이내
  if (topPercentile <= 40) return "4등급";
  // 5등급: 상위 60% 이내
  if (topPercentile <= 60) return "5등급";
  // 6등급: 상위 77% 이내
  if (topPercentile <= 77) return "6등급";
  // 7등급: 상위 89% 이내
  if (topPercentile <= 89) return "7등급";
  // 8등급: 상위 96% 이내
  if (topPercentile <= 96) return "8등급";
  // 9등급: ���위 100% 이내 (나머지)
  return "9등급";
};

// Function to get grade level based on top percentile (상위 %) for 5-grade system
const getGradeLevel5 = (percentile: number): string => {
  // Convert to top percentile (상위 %)
  const topPercentile = 100 - percentile;

  // 1등급: 상위 10% 이내
  if (topPercentile <= 10) return "1등급";
  // 2등급: 상위 34% 이내
  if (topPercentile <= 34) return "2등급";
  // 3등급: 상위 66% 이내
  if (topPercentile <= 66) return "3등급";
  // 4등급: 상위 90% 이내
  if (topPercentile <= 90) return "4등급";
  // 5등급: 상위 100% 이내 (나머지)
  return "5등급";
};

// Function to get grade level based on selected grading system
const getGradeLevel = (percentile: number, gradeSystem: "9grade" | "5grade"): string => {
  if (gradeSystem === "9grade") {
    return getGradeLevel9(percentile);
  } else {
    return getGradeLevel5(percentile);
  }
};

interface ScoreInput {
  originalScore: string;
  subjectMean: string;
  standardDeviation: string;
  totalStudents: string;
  tiedStudentsCount: string;
}

const IQCalculator: React.FC = () => {
  const [scores, setScores] = useState<ScoreInput>({
    originalScore: "",
    subjectMean: "",
    standardDeviation: "",
    totalStudents: "",
    tiedStudentsCount: "1"  // Default is now 1 (self)
  });
  const [scoreValue, setScoreValue] = useState<number | null>(null);
  const [gradeSystem, setGradeSystem] = useState<"9grade" | "5grade">("9grade");
  const [useTiedRank, setUseTiedRank] = useState<boolean>(false);
  const [result, setResult] = useState<{
    percentile: number;
    zScore: number;
    rank: number;
    ranking: string;
    description: string;
    gradeLevel: string;
    tiedStudentsCount: number;
  } | null>(null);
  const {
    toast
  } = useToast();
  const handleInputChange = (field: keyof ScoreInput, value: string) => {
    setScores(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleReset = () => {
    setScores({
      originalScore: "",
      subjectMean: "",
      standardDeviation: "",
      totalStudents: "",
      tiedStudentsCount: "1"  // Reset to default of 1 (self)
    });
    setScoreValue(null);
    setResult(null);
  };
  const handleCalculate = () => {
    const rawScore = scores.originalScore ? parseFloat(scores.originalScore) : 0;
    const mean = scores.subjectMean ? parseFloat(scores.subjectMean) : 0;
    const stdDev = scores.standardDeviation ? parseFloat(scores.standardDeviation) : 0;
    const students = scores.totalStudents ? parseFloat(scores.totalStudents) : 0;
    const tiedStudents = scores.tiedStudentsCount ? parseInt(scores.tiedStudentsCount) : 1; // Default to 1 if not specified
    
    if (isNaN(rawScore) || isNaN(mean) || isNaN(stdDev) || isNaN(students) || stdDev <= 0 || students <= 0) {
      toast({
        title: "유효하지 않은 입력값",
        description: "모든 필드에 유효한 값을 입력하세요. 표준편차와 학생 수는 0보다 커야 합니다.",
        variant: "destructive"
      });
      return;
    }

    if (tiedStudents < 1 || tiedStudents > students) {
      toast({
        title: "유효하지 않은 동석차 입력값",
        description: "동석차 학생 수는 1보다 크거나 같고 전체 학생 수보다 작거나 같아야 합니다.",
        variant: "destructive"
      });
      return;
    }

    // Calculate rank and percentile with tied rank option and tied students
    const calculation = calculateRankAndPercentile(rawScore, mean, stdDev, students, useTiedRank, tiedStudents);
    const topPercentile = 100 - calculation.percentile;
    const percentileText = calculation.percentile.toFixed(2);
    const description = getRankingDescription(calculation.percentile);
    const gradeLevel = getGradeLevel(calculation.percentile, gradeSystem);
    setScoreValue(rawScore);
    setResult({
      percentile: calculation.percentile,
      zScore: calculation.zScore,
      rank: calculation.rank,
      ranking: `상위 ${topPercentile.toFixed(2)}%`,
      description,
      gradeLevel,
      tiedStudentsCount: calculation.tiedStudentsCount
    });
    
    // Updated toast message to include tied rank and tied students information
    let rankTypeText = useTiedRank ? " (동석차 적용)" : "";
    let tiedStudentsText = (useTiedRank && tiedStudents > 1) ? `, 동점자 ${tiedStudents}명` : "";
    
    toast({
      title: "계산 완료",
      description: `${rawScore}점은 ${students}명 중 ${calculation.rank}등${rankTypeText}${tiedStudentsText}, 백분위 ${percentileText}%, ${description} 입니다. 예상 등급은 ${gradeLevel} 입니다.`
    });
  };
  return <Card className="w-full max-w-xl mx-auto shadow-lg border-2 border-blue-100">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <CardTitle className="text-2xl font-bold">등수 자동계산기</CardTitle>
        <CardDescription className="text-white/90">
          원점수, 과목평균, 표준편차, 수강 학생수를 기입하여 [Submit]을 누르면 자신의 등수와 전체 분포를 알 수 있습니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 pb-4">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="original-score" className="text-gray-700">원점수</Label>
              <Input id="original-score" placeholder="0" type="number" className="bg-blue-50 focus:bg-white border-blue-200" value={scores.originalScore} onChange={e => handleInputChange("originalScore", e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subject-mean" className="text-gray-700">과목평균</Label>
              <Input id="subject-mean" placeholder="0" type="number" className="bg-blue-50 focus:bg-white border-blue-200" value={scores.subjectMean} onChange={e => handleInputChange("subjectMean", e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="standard-deviation" className="text-gray-700">표준편차</Label>
              <Input id="standard-deviation" placeholder="0" type="number" className="bg-blue-50 focus:bg-white border-blue-200" value={scores.standardDeviation} onChange={e => handleInputChange("standardDeviation", e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="total-students" className="text-gray-700">학생수</Label>
              <Input id="total-students" placeholder="0" type="number" className="bg-blue-50 focus:bg-white border-blue-200" value={scores.totalStudents} onChange={e => handleInputChange("totalStudents", e.target.value)} />
            </div>
            
            {/* Grade system selection */}
            <div className="grid gap-2">
              <Label className="text-gray-700">등급체제 선택</Label>
              <RadioGroup value={gradeSystem} onValueChange={value => setGradeSystem(value as "9grade" | "5grade")} className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="9grade" id="9grade" className="text-blue-600 border-blue-600" />
                  <Label htmlFor="9grade" className="font-medium">9등급체제</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="5grade" id="5grade" className="text-blue-600 border-blue-600" />
                  <Label htmlFor="5grade" className="font-medium">5등급체제</Label>
                </div>
              </RadioGroup>
            </div>
            
            {/* Add tied rank option */}
            <div className="grid gap-2">
              <Label className="text-gray-700">동석차 적용</Label>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="tied-rank" 
                  checked={useTiedRank} 
                  onCheckedChange={(checked) => setUseTiedRank(checked as boolean)}
                  className="text-blue-600 border-blue-600"
                />
                <Label htmlFor="tied-rank" className="font-medium">
                  동석차 적용하기 (같은 점수는 같은 등수)
                </Label>
              </div>
            </div>
            
            {/* Add field for number of students with tied scores */}
            {useTiedRank && (
              <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="tied-students-count" className="text-gray-700">동점자 수 (본인 포함)</Label>
                <Input 
                  id="tied-students-count" 
                  placeholder="1" 
                  type="number" 
                  className="bg-blue-50 focus:bg-white border-blue-200" 
                  value={scores.tiedStudentsCount} 
                  onChange={e => handleInputChange("tiedStudentsCount", e.target.value)} 
                />
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-center pt-2">
            <Button onClick={handleCalculate} className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md">
              <Calculator className="w-4 h-4 mr-2" />
              계산하기[Submit]
            </Button>
            <Button onClick={handleReset} variant="outline" className="border-blue-300 text-blue-700 px-6 py-2 rounded-md hover:bg-blue-50">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>

          {result && <div className="space-y-5 mt-4">
              <div className="grid gap-1">
                <NormalDistribution score={scoreValue || 0} />
              </div>
              
              {/* Sofia's speech bubble with grade prediction */}
              <div className="relative mt-8 mb-12">
                <div className="flex items-end">
                  <div className="w-20 h-32">
                    <img src="/lovable-uploads/ad5b6af5-f996-4fc6-b030-96a726959d85.png" alt="소피아" className="w-full h-full object-contain rounded-lg border-2 border-blue-300" />
                  </div>
                  <div className="relative ml-2 p-4 bg-blue-500 rounded-t-2xl rounded-br-2xl rounded-bl-sm text-white max-w-[calc(100%-5rem)]">
                    <div className="absolute w-4 h-4 bg-blue-500 -bottom-1 -left-1 transform rotate-45"></div>
                    <p className="font-medium"></p>
                    <p className="mt-2 text-xs">
                      {scoreValue}점은 {scores.totalStudents}명 중 {result.rank}등
                      {useTiedRank && result.tiedStudentsCount > 1 ? `, 같은 점수 ${result.tiedStudentsCount}명` : ""}으로{" "}
                      <span className="font-bold text-blue-100">백분위 {result.percentile.toFixed(2)}%</span>입니다.
                    </p>
                    <p className="mt-1 font-bold text-sm">
                      예상 등급은 <span className="bg-white text-blue-600 px-2 py-0.5 rounded-lg">{result.gradeLevel}</span> 입니다.
                    </p>
                    <p className="mt-1 opacity-90 text-xs">
                      ({result.description})
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-white rounded-2xl border border-blue-100 shadow-sm">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 px-[18px]">
                  <div className="p-3 border border-blue-100 rounded-lg text-center bg-blue-50">
                    <div className="text-sm text-gray-500 mb-1">백분위</div>
                    <div className="font-semibold text-lg text-blue-700">{result.percentile.toFixed(2)}%</div>
                  </div>
                  <div className="p-3 border border-blue-100 rounded-lg text-center bg-blue-50">
                    <div className="text-sm text-gray-500 mb-1">등수</div>
                    <div className="font-semibold text-lg text-blue-700">{result.ranking}</div>
                  </div>
                  <div className="p-3 border border-blue-100 rounded-lg text-center bg-blue-50">
                    <div className="text-sm text-gray-500 mb-1">표준편차</div>
                    <div className="font-semibold text-lg text-blue-700">{result.zScore.toFixed(2)} SD</div>
                  </div>
                  <div className="p-3 border border-blue-100 rounded-lg text-center bg-blue-50">
                    <div className="text-sm text-gray-500 mb-1">구분</div>
                    <div className="font-semibold text-lg text-blue-700">{result.description}</div>
                  </div>
                  <div className="p-3 border border-blue-100 rounded-lg text-center bg-blue-50">
                    <div className="text-sm text-gray-500 mb-1">예상등급</div>
                    <div className="font-semibold text-lg text-blue-600">{result.gradeLevel}</div>
                  </div>
                </div>
              </div>
              
              {gradeSystem === "9grade" ? <div className="overflow-hidden bg-white rounded-2xl border border-blue-100 shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-blue-50 text-blue-800">
                          <th className="p-3 text-left border-b border-blue-100">9등급체제</th>
                          <th className="p-3 text-center border-b border-blue-100">구간</th>
                          <th className="p-3 text-center border-b border-blue-100">누적</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className={`hover:bg-blue-50/50 ${result.gradeLevel === "1등급" ? "bg-blue-100/50" : ""}`}>
                          <td className="p-3 text-left border-b border-blue-100">1등급</td>
                          <td className="p-3 text-center border-b border-blue-100">4%</td>
                          <td className="p-3 text-center border-b border-blue-100">4%</td>
                        </tr>
                        <tr className={`hover:bg-blue-50/50 ${result.gradeLevel === "2등급" ? "bg-blue-100/50" : ""}`}>
                          <td className="p-3 text-left border-b border-blue-100">2등급</td>
                          <td className="p-3 text-center border-b border-blue-100">7%</td>
                          <td className="p-3 text-center border-b border-blue-100">11%</td>
                        </tr>
                        <tr className={`hover:bg-blue-50/50 ${result.gradeLevel === "3등급" ? "bg-blue-100/50" : ""}`}>
                          <td className="p-3 text-left border-b border-blue-100">3등급</td>
                          <td className="p-3 text-center border-b border-blue-100">12%</td>
                          <td className="p-3 text-center border-b border-blue-100">23%</td>
                        </tr>
                        <tr className={`hover:bg-blue-50/50 ${result.gradeLevel === "4등급" ? "bg-blue-100/50" : ""}`}>
                          <td className="p-3 text-left border-b border-blue-100">4등급</td>
                          <td className="p-3 text-center border-b border-blue-100">17%</td>
                          <td className="p-3 text-center border-b border-blue-100">40%</td>
                        </tr>
                        <tr className={`hover:bg-blue-50/50 ${result.gradeLevel === "5등급" ? "bg-blue-100/50" : ""}`}>
                          <td className="p-3 text-left border-b border-blue-100">5등급</td>
                          <td className="p-3 text-center border-b border-blue-100">20%</td>
                          <td className="p-3 text-center border-b border-blue-100">60%</td>
                        </tr>
                        <tr className={`hover:bg-blue-50/50 ${result.gradeLevel === "6등급" ? "bg-blue-100/50" : ""}`}>
                          <td className="p-3 text-left border-b border-blue-100">6등급</td>
                          <td className="p-3 text-center border-b border-blue-100">17%</td>
                          <td className="p-3 text-center border-b border-blue-100">77%</td>
                        </tr>
                        <tr className={`hover:bg-blue-50/50 ${result.gradeLevel === "7등급" ? "bg-blue-100/50" : ""}`}>
                          <td className="p-3 text-left border-b border-blue-100">7등급</td>
                          <td className="p-3 text-center border-b border-blue-100">12%</td>
                          <td className="p-3 text-center border-b border-blue-100">89%</td>
                        </tr>
                        <tr className={`hover:bg-blue-50/50 ${result.gradeLevel === "8등급" ? "bg-blue-100/50" : ""}`}>
                          <td className="p-3 text-left border-b border-blue-100">8등급</td>
                          <td className="p-3 text-center border-b border-blue-100">7%</td>
                          <td className="p-3 text-center border-b border-blue-100">96%</td>
                        </tr>
                        <tr className={`hover:bg-blue-50/50 ${result.gradeLevel === "9등급" ? "bg-blue-100/50" : ""}`}>
                          <td className="p-3 text-left">9등급</td>
                          <td className="p-3 text-center">4%</td>
                          <td className="p-3 text-center">100%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div> : <div className="overflow-hidden bg-white rounded-2xl border border-blue-100 shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-blue-50 text-blue-800">
                          <th className="p-3 text-left border-b border-blue-100">5등급체제</th>
                          <th className="p-3 text-center border-b border-blue-100">구간</th>
                          <th className="p-3 text-center border-b border-blue-100">누적</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className={`hover:bg-blue-50/50 ${result.gradeLevel === "1등급" ? "bg-blue-100/50" : ""}`}>
                          <td className="p-3 text-left border-b border-blue-100">1등급</td>
                          <td className="p-3 text-center border-b border-blue-100">10%</td>
                          <td className="p-3 text-center border-b border-blue-100">10%</td>
                        </tr>
                        <tr className={`hover:bg-blue-50/50 ${result.gradeLevel === "2등급" ? "bg-blue-100/50" : ""}`}>
                          <td className="p-3 text-left border-b border-blue-100">2등급</td>
                          <td className="p-3 text-center border-b border-blue-100">24%</td>
                          <td className="p-3 text-center border-b border-blue-100">34%</td>
                        </tr>
                        <tr className={`hover:bg-blue-50/50 ${result.gradeLevel === "3등급" ? "bg-blue-100/50" : ""}`}>
                          <td className="p-3 text-left border-b border-blue-100">3등급</td>
                          <td className="p-3 text-center border-b border-blue-100">32%</td>
                          <td className="p-3 text-center border-b border-blue-100">66%</td>
                        </tr>
                        <tr className={`hover:bg-blue-50/50 ${result.gradeLevel === "4등급" ? "bg-blue-100/50" : ""}`}>
                          <td className="p-3 text-left border-b border-blue-100">4등급</td>
                          <td className="p-3 text-center border-b border-blue-100">24%</td>
                          <td className="p-3 text-center border-b border-blue-100">90%</td>
                        </tr>
                        <tr className={`hover:bg-blue-50/50 ${result.gradeLevel === "5등급" ? "bg-blue-100/50" : ""}`}>
                          <td className="p-3 text-left">5등급</td>
                          <td className="p-3 text-center">10%</td>
                          <td className="p-3 text-center">100%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>}
            </div>}
        </div>
      </CardContent>
    </Card>;
};
export default IQCalculator;
