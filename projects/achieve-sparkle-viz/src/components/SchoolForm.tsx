import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { School, GraduationCap, BookOpen, Library, LucideIcon, Plus, X, Download, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface SchoolData {
  name: string;
  icon: string;
  logoUrl?: string;
  averageScore?: number;
  A: number;
  B: number;
  C: number;
  D: number;
  E: number;
}

export const SCHOOL_ICONS: { [key: string]: LucideIcon } = {
  school: School,
  graduationCap: GraduationCap,
  bookOpen: BookOpen,
  library: Library,
};

interface SchoolFormProps {
  onSubmit: (data: SchoolData[]) => void;
}

const ICON_KEYS = ["school", "graduationCap", "bookOpen", "library"];
const INITIAL_SCHOOLS: SchoolData[] = [
  { name: "대방중", averageScore: 85.8, A: 59.3, B: 14.2, C: 11.1, D: 6.2, E: 9.3 },
  { name: "장승중", averageScore: 82.0, A: 52.4, B: 20.1, C: 7.9, D: 6.3, E: 13.2 },
  { name: "동양중", averageScore: 81.7, A: 52.7, B: 18.2, C: 10.0, D: 4.5, E: 14.5 },
  { name: "숭의여중", averageScore: 79.0, A: 25.0, B: 33.1, C: 20.3, D: 10.8, E: 10.8 },
  { name: "중대부중", averageScore: 78.9, A: 42.2, B: 22.8, C: 10.2, D: 5.8, E: 18.9 },
  { name: "상도중", averageScore: 78.0, A: 39.5, B: 21.7, C: 11.2, D: 5.9, E: 21.7 },
  { name: "상현중", averageScore: 77.4, A: 37.4, B: 27.2, C: 8.2, D: 6.1, E: 21.1 },
  { name: "사당중", averageScore: 75.0, A: 39.0, B: 19.5, C: 10.1, D: 6.9, E: 24.5 },
  { name: "성남중", averageScore: 74.5, A: 31.3, B: 20.1, C: 12.5, D: 9.7, E: 26.4 },
  { name: "강현중", averageScore: 73.6, A: 36.1, B: 18.6, C: 9.3, D: 14.4, E: 21.6 },
  { name: "영등포중", averageScore: 71.8, A: 31.6, B: 16.5, C: 13.9, D: 11.4, E: 26.6 },
  { name: "동작중", averageScore: 70.5, A: 26.2, B: 27.7, C: 8.5, D: 9.2, E: 28.5 },
  { name: "국사봉중", averageScore: 69.4, A: 29.9, B: 18.6, C: 11.3, D: 8.2, E: 32.0 },
  { name: "남성중", averageScore: 66.1, A: 26.4, B: 17.9, C: 7.5, D: 11.3, E: 36.9 },
  { name: "문창중", averageScore: 65.7, A: 17.1, B: 9.8, C: 22.0, D: 10.6, E: 40.5 },
  { name: "강남중", averageScore: 65.3, A: 27.8, B: 13.3, C: 5.6, D: 7.8, E: 45.6 },
].map((s, i) => ({ ...s, icon: ICON_KEYS[i % ICON_KEYS.length] }));


export const SchoolForm = ({ onSubmit }: SchoolFormProps) => {
  const [schoolsData, setSchoolsData] = useState<SchoolData[]>(INITIAL_SCHOOLS);
  const [fetchYear, setFetchYear] = useState("2025");
  const [fetchGrade, setFetchGrade] = useState("2");
  const [fetchTerm, setFetchTerm] = useState("1");
  const [fetchSubject, setFetchSubject] = useState("영어");
  const [isFetching, setIsFetching] = useState(false);

  const [songpaYear, setSongpaYear] = useState("2025");
  const [songpaGrade, setSongpaGrade] = useState("2");
  const [songpaTerm, setSongpaTerm] = useState("1");
  const [songpaSubject, setSongpaSubject] = useState("영어");
  const [isFetchingSongpa, setIsFetchingSongpa] = useState(false);

  const SONGPA_SCHOOLS = [
    "해누리중","방이중","세륜중","오주중","정신여중","가락중",
    "송파중","잠실중","방산중","가원중","한산중","잠실여중","오륜중",
  ];

  const fetchFromApt2meSongpa = async () => {
    setIsFetchingSongpa(true);
    try {
      const { data, error } = await supabase.functions.invoke("fetch-apt2me-grades", {
        body: {
          area: "11710",
          year: songpaYear,
          grade: songpaGrade,
          term: songpaTerm,
          subject: songpaSubject,
        },
      });
      if (error) throw error;
      if (!data?.success || !Array.isArray(data.schools) || data.schools.length === 0) {
        throw new Error(data?.error || "데이터를 가져오지 못했습니다");
      }
      const fetched: SchoolData[] = data.schools
        .filter((s: any) => SONGPA_SCHOOLS.includes(s.name))
        .map((s: any, i: number) => {
          const E = Math.round((100 - s.A - s.B - s.C - s.D) * 10) / 10;
          return {
            name: s.name,
            icon: ICON_KEYS[i % ICON_KEYS.length],
            averageScore: s.averageScore,
            A: s.A, B: s.B, C: s.C, D: s.D, E: Math.max(0, E),
          };
        });

      if (fetched.length === 0) throw new Error("송파구 대상 학교 데이터를 찾지 못했습니다");
      setSchoolsData(fetched);
      toast.success(`apt2.me에서 송파구 ${fetched.length}개 학교 데이터를 불러왔습니다`);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "apt2.me 데이터 로드 실패");
    } finally {
      setIsFetchingSongpa(false);
    }
  };

  const fetchFromApt2me = async () => {
    setIsFetching(true);
    try {
      const { data, error } = await supabase.functions.invoke("fetch-apt2me-grades", {
        body: {
          area: "11590",
          year: fetchYear,
          grade: fetchGrade,
          term: fetchTerm,
          subject: fetchSubject,
        },
      });
      if (error) throw error;
      if (!data?.success || !Array.isArray(data.schools) || data.schools.length === 0) {
        throw new Error(data?.error || "데이터를 가져오지 못했습니다");
      }
      const fetched: SchoolData[] = data.schools
        .filter((s: any) => s.name !== "신길중")
        .map((s: any, i: number) => {
          const E = Math.round((100 - s.A - s.B - s.C - s.D) * 10) / 10;
          return {
            name: s.name,
            icon: ICON_KEYS[i % ICON_KEYS.length],
            averageScore: s.averageScore,
            A: s.A, B: s.B, C: s.C, D: s.D, E: Math.max(0, E),
          };
        });

      setSchoolsData(fetched);
      toast.success(`apt2.me에서 ${fetched.length}개 학교 데이터를 불러왔습니다`);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "apt2.me 데이터 로드 실패");
    } finally {
      setIsFetching(false);
    }
  };


  const addSchool = () => {
    const newSchool: SchoolData = {
      name: `새 학교 ${schoolsData.length + 1}`,
      icon: ICON_KEYS[schoolsData.length % ICON_KEYS.length],
      averageScore: 0,
      A: 0,
      B: 0,
      C: 0,
      D: 0,
      E: 0,
    };
    setSchoolsData([...schoolsData, newSchool]);
    toast.success("학교가 추가되었습니다");
  };

  const removeSchool = (schoolIndex: number) => {
    if (schoolsData.length <= 1) {
      toast.error("최소 1개의 학교는 필요합니다");
      return;
    }
    const newData = schoolsData.filter((_, index) => index !== schoolIndex);
    setSchoolsData(newData);
    toast.success("학교가 삭제되었습니다");
  };

  const handleNameChange = (schoolIndex: number, value: string) => {
    const newData = [...schoolsData];
    newData[schoolIndex].name = value;
    setSchoolsData(newData);
  };

  const handleIconChange = (schoolIndex: number, value: string) => {
    const newData = [...schoolsData];
    newData[schoolIndex].icon = value;
    setSchoolsData(newData);
  };

  const handleAverageScoreChange = (schoolIndex: number, value: string) => {
    const newData = [...schoolsData];
    newData[schoolIndex].averageScore = parseFloat(value) || 0;
    setSchoolsData(newData);
  };

  const handleLogoUpload = (schoolIndex: number, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const newData = [...schoolsData];
      newData[schoolIndex].logoUrl = reader.result as string;
      setSchoolsData(newData);
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (schoolIndex: number, grade: keyof Omit<SchoolData, "name" | "icon" | "logoUrl">, value: string) => {
    const numValue = parseFloat(value) || 0;
    const newData = [...schoolsData];
    newData[schoolIndex][grade] = numValue;
    
    // E 등급 자동 계산 (A, B, C, D를 입력할 때)
    if (grade !== "E") {
      const total = newData[schoolIndex].A + newData[schoolIndex].B + newData[schoolIndex].C + newData[schoolIndex].D;
      newData[schoolIndex].E = Math.max(0, 100 - total);
    }
    
    setSchoolsData(newData);
  };

  const validateAndSubmit = () => {
    for (let i = 0; i < schoolsData.length; i++) {
      const school = schoolsData[i];
      const total = school.A + school.B + school.C + school.D + school.E;
      
      if (Math.abs(total - 100) > 0.1) {
        toast.error(`${school.name}의 비율 합계가 100%가 아닙니다 (현재: ${total.toFixed(1)}%)`);
        return;
      }
    }
    
    onSubmit(schoolsData);
    toast.success("데이터가 업데이트되었습니다!");
  };

  return (
    <Card className="relative overflow-hidden p-8 bg-gradient-to-br from-card via-card to-muted/10 shadow-[var(--shadow-elegant)] border-2 border-border/50 hover:shadow-[var(--shadow-premium)] transition-all duration-500">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="inline-block px-3 py-1 mb-3 text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary rounded-full border border-primary/20">
              Data Input
            </div>
            <h2 className="text-3xl font-black text-foreground tracking-tight">중학교 성취도 입력</h2>
            <p className="text-muted-foreground mt-1 text-sm font-medium">학교별 등급 분포와 평균 점수를 입력하세요</p>
          </div>
          <Button
            onClick={addSchool}
            variant="outline"
            className="gap-2 border-2 hover:bg-primary/5 hover:border-primary/30 transition-all duration-300 font-bold"
          >
            <Plus className="w-4 h-4" />
            학교 추가
          </Button>
        </div>

        {/* apt2.me 자동 불러오기 패널 */}
        <Card className="mb-6 p-5 bg-gradient-to-br from-amber-50/40 via-card to-card border-2 border-amber-200/40">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[200px]">
              <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-amber-700/70 mb-1">
                Auto-Sync · apt2.me
              </div>
              <h3 className="text-sm font-bold text-foreground">동작구 중학교 성취도 자동 불러오기</h3>
              <p className="text-xs text-muted-foreground mt-0.5">apt2.me 공시 데이터 기반 자동 채우기</p>
            </div>
            <div className="flex flex-wrap gap-2 items-end">
              <div>
                <Label className="text-[10px] text-muted-foreground">연도</Label>
                <Select value={fetchYear} onValueChange={setFetchYear}>
                  <SelectTrigger className="w-[90px] h-9"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    {["2025","2024","2023","2022","2021"].map(y => <SelectItem key={y} value={y}>{y}년</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground">학년</Label>
                <Select value={fetchGrade} onValueChange={setFetchGrade}>
                  <SelectTrigger className="w-[80px] h-9"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="2">2학년</SelectItem>
                    <SelectItem value="3">3학년</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground">학기</Label>
                <Select value={fetchTerm} onValueChange={setFetchTerm}>
                  <SelectTrigger className="w-[80px] h-9"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="1">1학기</SelectItem>
                    <SelectItem value="2">2학기</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground">과목</Label>
                <Select value={fetchSubject} onValueChange={setFetchSubject}>
                  <SelectTrigger className="w-[90px] h-9"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="국어">국어</SelectItem>
                    <SelectItem value="영어">영어</SelectItem>
                    <SelectItem value="수학">수학</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={fetchFromApt2me}
                disabled={isFetching}
                className="h-9 gap-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-bold"
              >
                {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {isFetching ? "불러오는 중…" : "자동 불러오기"}
              </Button>
            </div>
          </div>
        </Card>

        {/* apt2.me 송파구 자동 불러오기 패널 */}
        <Card className="mb-6 p-5 bg-gradient-to-br from-sky-50/40 via-card to-card border-2 border-sky-200/40">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[200px]">
              <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-sky-700/70 mb-1">
                Auto-Sync · apt2.me
              </div>
              <h3 className="text-sm font-bold text-foreground">송파구 중학교 성취도 자동 불러오기</h3>
              <p className="text-xs text-muted-foreground mt-0.5">apt2.me 공시 데이터 기반 자동 채우기 (지정 13개교)</p>
            </div>
            <div className="flex flex-wrap gap-2 items-end">
              <div>
                <Label className="text-[10px] text-muted-foreground">연도</Label>
                <Select value={songpaYear} onValueChange={setSongpaYear}>
                  <SelectTrigger className="w-[90px] h-9"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    {["2025","2024","2023","2022","2021"].map(y => <SelectItem key={y} value={y}>{y}년</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground">학년</Label>
                <Select value={songpaGrade} onValueChange={setSongpaGrade}>
                  <SelectTrigger className="w-[80px] h-9"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="2">2학년</SelectItem>
                    <SelectItem value="3">3학년</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground">학기</Label>
                <Select value={songpaTerm} onValueChange={setSongpaTerm}>
                  <SelectTrigger className="w-[80px] h-9"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="1">1학기</SelectItem>
                    <SelectItem value="2">2학기</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground">과목</Label>
                <Select value={songpaSubject} onValueChange={setSongpaSubject}>
                  <SelectTrigger className="w-[90px] h-9"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="국어">국어</SelectItem>
                    <SelectItem value="영어">영어</SelectItem>
                    <SelectItem value="수학">수학</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={fetchFromApt2meSongpa}
                disabled={isFetchingSongpa}
                className="h-9 gap-2 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-700 hover:to-sky-600 text-white font-bold"
              >
                {isFetchingSongpa ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {isFetchingSongpa ? "불러오는 중…" : "자동 불러오기"}
              </Button>
            </div>
          </div>
        </Card>

      

      
        <div className="grid gap-6 md:grid-cols-2">
          {schoolsData.map((school, schoolIndex) => {
            const IconComponent = SCHOOL_ICONS[school.icon];
            return (
              <Card key={schoolIndex} className="relative p-6 bg-gradient-to-br from-card to-muted/20 border-2 border-border/50 hover:border-primary/20 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-elegant)] transition-all duration-300 group">
                <Button
                  onClick={() => removeSchool(schoolIndex)}
                  variant="ghost"
                  size="icon"
                  className="absolute top-3 right-3 h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
                >
                  <X className="w-4 h-4" />
                </Button>
                <div className="flex items-center gap-4 mb-5">
                  <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center overflow-hidden border-2 border-primary/20 shadow-md group-hover:scale-105 group-hover:shadow-lg transition-all duration-300">
                    {school.logoUrl ? (
                      <img src={school.logoUrl} alt={school.name} className="w-full h-full object-cover" />
                    ) : (
                      <IconComponent className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <Input
                      value={school.name}
                      onChange={(e) => handleNameChange(schoolIndex, e.target.value)}
                      className="font-bold text-xl bg-background border-2 border-input focus:border-primary/50 transition-colors"
                      placeholder="학교 이름"
                    />
                    <div className="flex gap-2">
                      <Select value={school.icon} onValueChange={(value) => handleIconChange(schoolIndex, value)}>
                        <SelectTrigger className="flex-1 bg-background border-2 border-input font-medium">
                          <SelectValue placeholder="아이콘 선택" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover/95 backdrop-blur-lg border-2 z-50">
                          {Object.entries(SCHOOL_ICONS).map(([key, Icon]) => (
                            <SelectItem key={key} value={key} className="font-medium">
                              <div className="flex items-center gap-2">
                                <Icon className="w-4 h-4" />
                                <span className="capitalize">{key}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleLogoUpload(schoolIndex, file);
                            }
                          }}
                        />
                        <div className="px-4 py-2 bg-gradient-to-r from-secondary to-secondary/90 text-secondary-foreground rounded-lg hover:shadow-md transition-all duration-200 text-sm font-bold whitespace-nowrap border border-secondary/20">
                          로고 업로드
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-3">
                  {(["A", "B", "C", "D", "E"] as const).map((grade) => (
                    <div key={grade} className="space-y-2">
                      <Label htmlFor={`${school.name}-${grade}`} className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                        {grade}등급
                      </Label>
                      <div className="relative">
                        <Input
                          id={`${school.name}-${grade}`}
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={school[grade] === 0 ? "" : school[grade]}
                          onChange={(e) => handleInputChange(schoolIndex, grade, e.target.value)}
                          className={`pr-6 border-2 font-bold text-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all ${grade === "E" ? "bg-muted/50 text-muted-foreground border-muted" : "bg-background border-input focus:border-primary/50"}`}
                          placeholder="0"
                          disabled={grade === "E"}
                          readOnly={grade === "E"}
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">%</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 평균 점수 입력 */}
                <div className="mt-5 space-y-2">
                  <Label htmlFor={`${school.name}-average`} className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    평균 점수
                  </Label>
                  <div className="relative">
                    <Input
                      id={`${school.name}-average`}
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={school.averageScore === 0 ? "" : school.averageScore}
                      onChange={(e) => handleAverageScoreChange(schoolIndex, e.target.value)}
                      className="pr-8 border-2 border-input focus:border-primary/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-background font-bold text-base transition-all"
                      placeholder="평균 점수 입력"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">점</span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-gradient-to-r from-muted/50 to-muted/30 rounded-xl border-2 border-border/50">
                  {(() => {
                    const total = school.A + school.B + school.C + school.D + school.E;
                    const isValid = Math.abs(total - 100) < 0.1;
                    return (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-foreground">등급 합계</span>
                        <span className={`text-base font-black ${isValid ? "text-secondary" : "text-destructive"}`}>
                          {total.toFixed(1)}% {isValid ? "✓" : "⚠️"}
                        </span>
                      </div>
                    );
                  })()}
                </div>
              </Card>
            );
          })}
        </div>

        <Button 
          onClick={validateAndSubmit}
          className="mt-8 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white font-black py-7 text-xl shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 transition-all duration-300 tracking-tight"
        >
          그래프 생성
        </Button>
      </div>
    </Card>
  );
};
