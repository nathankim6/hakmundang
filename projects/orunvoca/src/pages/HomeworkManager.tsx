import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, Plus, Calendar, Clock, Users, CheckCircle2, 
  Trophy, BarChart3, Trash2, Eye, AlertCircle, GraduationCap,
  ClipboardList, Target, TrendingUp, Award
} from "lucide-react";
import infographicStudents from "@/assets/infographic-students-icon.png";
import infographicCompletion from "@/assets/infographic-completion-icon.png";
import infographicScore from "@/assets/infographic-score-icon.png";
import infographicTrophy from "@/assets/infographic-trophy-icon.png";
import homeworkTrophyMascot from "@/assets/homework-trophy-mascot.png";
import homeworkStudyMascot from "@/assets/homework-study-mascot.png";
import homeworkCompleteMascot from "@/assets/homework-complete-mascot.png";
import homeworkLeaderboardBanner from "@/assets/homework-leaderboard-banner.png";
import homeworkCrownIcon from "@/assets/homework-crown-icon.png";
import homeworkMarathonBanner from "@/assets/homework-marathon-banner.png";
import homeworkRunnerIcon from "@/assets/homework-runner-icon.png";
import rankGoldMedal from "@/assets/rank-gold-medal.png";
import rankSilverMedal from "@/assets/rank-silver-medal.png";
import rankBronzeMedal from "@/assets/rank-bronze-medal.png";
import PageHeader from "@/components/PageHeader";
import homeworkPageIcon from "@/assets/page-icons/homework-icon.png";
import CumulativeWrongWords from "@/components/CumulativeWrongWords";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface Homework {
  id: string;
  title: string;
  access_code_id: string;
  class_name: string;
  grade: string;
  card_set_id: string;
  selected_days: string[];
  due_date: string;
  homework_types: string[];
  is_active: boolean;
  created_at: string;
}

interface HomeworkSubmission {
  id: string;
  homework_id: string;
  student_name: string;
  student_phone_last4: string;
  student_class: string;
  score: number;
  correct_count: number;
  total_count: number;
  is_completed: boolean;
  retry_count: number;
  wrong_words: any;
  time_spent_seconds: number;
  submitted_at: string;
  completed_at: string;
}

const HOMEWORK_TYPES = [
  { value: "meaning", label: "뜻 맞추기", icon: "📝" },
  { value: "spelling", label: "철자 쓰기", icon: "✍️" },
  { value: "example", label: "예문 완성", icon: "📖" },
  { value: "definition", label: "영영 풀이", icon: "🔤" },
];

const CLASS_OPTIONS = ["신규생", "IVY", "1FO", "1INT", "1AD", "2FO", "2INT", "2AD", "3FO", "3INT", "3AD", "TOP", "고등부"];
const GRADE_OPTIONS = ["초등", "중1", "중2", "중3", "고1", "고2", "고3"];

const HomeworkManager = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("create");
  
  // Create form states
  const [title, setTitle] = useState("");
  const [selectedAccessCodeId, setSelectedAccessCodeId] = useState("");
  const [className, setClassName] = useState("");
  const [grade, setGrade] = useState("");
  const [selectedCardSetId, setSelectedCardSetId] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("23:59");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [questionCounts, setQuestionCounts] = useState<Record<string, number>>({});
  const [creating, setCreating] = useState(false);

  // Data states
  const [accessCodes, setAccessCodes] = useState<any[]>([]);
  const [cardSets, setCardSets] = useState<any[]>([]);
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([]);
  const [selectedHomeworkId, setSelectedHomeworkId] = useState<string | null>(null);
  
  // Filter states
  const [filterGrade, setFilterGrade] = useState("all");
  const [filterClass, setFilterClass] = useState("all");

  useEffect(() => {
    fetchAccessCodes();
    fetchCardSets();
    fetchHomeworks();
  }, []);

  useEffect(() => {
    if (selectedHomeworkId) {
      fetchSubmissions(selectedHomeworkId);
    }
  }, [selectedHomeworkId]);

  useEffect(() => {
    if (selectedCardSetId) {
      const cardSet = cardSets.find(cs => cs.id === selectedCardSetId);
      if (cardSet?.selected_days) {
        setAvailableDays(cardSet.selected_days);
      }
    }
  }, [selectedCardSetId, cardSets]);

  const fetchAccessCodes = async () => {
    const { data } = await supabase.from("student_access_codes").select("*").eq("is_active", true);
    setAccessCodes(data || []);
  };

  const fetchCardSets = async () => {
    const { data } = await supabase.from("card_sets").select("id, title, selected_days, word_data").order("created_at", { ascending: false });
    setCardSets(data || []);
  };

  const fetchHomeworks = async () => {
    const { data } = await supabase.from("homeworks").select("*").order("created_at", { ascending: false });
    setHomeworks((data || []) as Homework[]);
  };

  const fetchSubmissions = async (homeworkId: string) => {
    const { data } = await supabase.from("homework_submissions").select("*").eq("homework_id", homeworkId).order("score", { ascending: false });
    setSubmissions((data || []) as HomeworkSubmission[]);
  };

  const handleDayToggle = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleTypeToggle = (type: string) => {
    setSelectedTypes(prev => {
      if (prev.includes(type)) {
        const newCounts = { ...questionCounts };
        delete newCounts[type];
        setQuestionCounts(newCounts);
        return prev.filter(t => t !== type);
      } else {
        setQuestionCounts(prev2 => ({ ...prev2, [type]: 10 }));
        return [...prev, type];
      }
    });
  };

  const handleQuestionCountChange = (type: string, count: number) => {
    setQuestionCounts(prev => ({ ...prev, [type]: Math.max(1, Math.min(100, count)) }));
  };

  const getTotalQuestionCount = () => {
    return Object.values(questionCounts).reduce((sum, c) => sum + c, 0);
  };

  const handleCreateHomework = async () => {
    if (!title || !selectedAccessCodeId || !selectedCardSetId || selectedDays.length === 0 || !dueDate || selectedTypes.length === 0) {
      toast({ title: "입력 오류", description: "모든 필수 항목을 입력해주세요.", variant: "destructive" });
      return;
    }

    setCreating(true);
    try {
      const dueDatetime = `${dueDate}T${dueTime}:00`;
      const { error } = await supabase.from("homeworks").insert({
        title,
        access_code_id: selectedAccessCodeId,
        class_name: className,
        grade,
        card_set_id: selectedCardSetId,
        selected_days: selectedDays,
        due_date: dueDatetime,
        homework_types: selectedTypes,
        created_by: sessionStorage.getItem("accessCode") || "admin",
      });

      if (error) throw error;

      toast({ title: "✅ 숙제 생성 완료", description: "학생들에게 숙제가 활성화되었습니다." });
      setTitle(""); setSelectedDays([]); setSelectedTypes([]); setQuestionCounts({});
      setDueDate(""); setDueTime("23:59");
      fetchHomeworks();
      setActiveTab("manage");
    } catch (error: any) {
      toast({ title: "오류", description: error.message, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteHomework = async (id: string) => {
    if (!confirm("이 숙제를 삭제하시겠습니까?")) return;
    await supabase.from("homework_submissions").delete().eq("homework_id", id);
    await supabase.from("homeworks").delete().eq("id", id);
    fetchHomeworks();
    toast({ title: "삭제 완료" });
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    await supabase.from("homeworks").update({ is_active: !isActive }).eq("id", id);
    fetchHomeworks();
  };

  const filteredHomeworks = homeworks.filter(h => {
    if (filterGrade !== "all" && h.grade !== filterGrade) return false;
    if (filterClass !== "all" && h.class_name !== filterClass) return false;
    return true;
  });

  const getCompletionRate = () => {
    if (submissions.length === 0) return 0;
    return Math.round((submissions.filter(s => s.is_completed).length / submissions.length) * 100);
  };

  const getAverageScore = () => {
    const completed = submissions.filter(s => s.is_completed);
    if (completed.length === 0) return 0;
    return Math.round(completed.reduce((sum, s) => sum + (s.score || 0), 0) / completed.length);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}분 ${s}초`;
  };

  return (
    <div className="min-h-screen p-4 md:p-6 max-w-7xl mx-auto">
      <PageHeader icon={homeworkPageIcon} iconAlt="숙제 관리" title="숙제 관리" subtitle="Homework Manager" />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="grid w-full grid-cols-4 bg-white rounded-2xl p-1 ring-1 ring-slate-900/5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] h-auto gap-1" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
          <TabsTrigger value="create" className="flex items-center justify-center gap-1.5 rounded-xl py-2 text-[12px] font-semibold tracking-[-0.01em] text-slate-500 data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-[0_4px_12px_-4px_rgba(15,23,42,0.4)] transition-all">
            <Plus className="w-3.5 h-3.5" /> 숙제 생성
          </TabsTrigger>
          <TabsTrigger value="manage" className="flex items-center justify-center gap-1.5 rounded-xl py-2 text-[12px] font-semibold tracking-[-0.01em] text-slate-500 data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-[0_4px_12px_-4px_rgba(15,23,42,0.4)] transition-all">
            <ClipboardList className="w-3.5 h-3.5" /> 숙제 목록
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center justify-center gap-1.5 rounded-xl py-2 text-[12px] font-semibold tracking-[-0.01em] text-slate-500 data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-[0_4px_12px_-4px_rgba(15,23,42,0.4)] transition-all">
            <BarChart3 className="w-3.5 h-3.5" /> 결과 대시보드
          </TabsTrigger>
          <TabsTrigger value="wrong-words" className="flex items-center justify-center gap-1.5 rounded-xl py-2 text-[12px] font-semibold tracking-[-0.01em] text-slate-500 data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-[0_4px_12px_-4px_rgba(15,23,42,0.4)] transition-all">
            <AlertCircle className="w-3.5 h-3.5" /> 오답 누적
          </TabsTrigger>
        </TabsList>

        {/* CREATE TAB */}
        <TabsContent value="create" className="mt-6">
          <div className="relative bg-white rounded-2xl ring-1 ring-slate-900/5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-16px_rgba(15,23,42,0.12)] overflow-hidden" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
            <div className="h-px bg-gradient-to-r from-transparent via-slate-300/60 to-transparent" />
            <div className="px-6 pt-6 pb-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center ring-1 ring-white/10 shadow-[0_8px_20px_-8px_rgba(15,23,42,0.45)]">
                <GraduationCap className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <h2 className="text-[16px] font-semibold tracking-[-0.025em] text-slate-900">새 숙제 생성</h2>
                <p className="text-[11.5px] text-slate-500 tracking-[-0.01em]">Create new homework</p>
              </div>
            </div>
            <div className="px-6 pb-6 space-y-5">
              {/* Title */}
              <div className="space-y-2">
                <Label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">숙제 제목 *</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="예: Unit 5 단어 숙제" className="h-10 rounded-xl border-slate-200 bg-slate-50/60 text-[13px] focus-visible:ring-2 focus-visible:ring-amber-400/25 focus-visible:border-amber-400" />
              </div>

              {/* Access Code & Class */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">접속 코드 *</Label>
                  <Select value={selectedAccessCodeId} onValueChange={setSelectedAccessCodeId}>
                    <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-slate-50/60 text-[13px] focus:ring-2 focus:ring-amber-400/25"><SelectValue placeholder="코드 선택" /></SelectTrigger>
                    <SelectContent>
                      {accessCodes.map(ac => (
                        <SelectItem key={ac.id} value={ac.id}>{ac.access_code} - {ac.class_name || ac.student_name || "미지정"}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">소속 반</Label>
                  <Select value={className} onValueChange={setClassName}>
                    <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-slate-50/60 text-[13px] focus:ring-2 focus:ring-amber-400/25"><SelectValue placeholder="반 선택" /></SelectTrigger>
                    <SelectContent>
                      {CLASS_OPTIONS.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">학년</Label>
                  <Select value={grade} onValueChange={setGrade}>
                    <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-slate-50/60 text-[13px] focus:ring-2 focus:ring-amber-400/25"><SelectValue placeholder="학년 선택" /></SelectTrigger>
                    <SelectContent>
                      {GRADE_OPTIONS.map(g => (
                        <SelectItem key={g} value={g}>{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Card Set Selection */}
              <div className="space-y-2">
                <Label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">단어장 선택 *</Label>
                <Select value={selectedCardSetId} onValueChange={setSelectedCardSetId}>
                  <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-slate-50/60 text-[13px] focus:ring-2 focus:ring-amber-400/25"><SelectValue placeholder="단어장 선택" /></SelectTrigger>
                  <SelectContent>
                    {cardSets.map(cs => (
                      <SelectItem key={cs.id} value={cs.id}>{cs.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Day Range */}
              {availableDays.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">DAY 범위 선택 *</Label>
                  <div className="flex flex-wrap gap-1.5 rounded-xl bg-slate-50/70 ring-1 ring-slate-100 p-2.5">
                    {availableDays.map(day => {
                      const on = selectedDays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => handleDayToggle(day)}
                          className={`h-7 px-2.5 rounded-lg text-[11px] font-semibold tracking-[-0.01em] transition-all ${
                            on
                              ? "bg-gradient-to-b from-slate-800 to-slate-950 text-white shadow-[0_6px_14px_-8px_rgba(15,23,42,0.9)]"
                              : "bg-white text-slate-500 ring-1 ring-slate-200 hover:ring-slate-300 hover:text-slate-800"
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                  {selectedDays.length > 0 && (
                    <p className="text-[11px] text-slate-400">선택됨: {selectedDays.join(", ")}</p>
                  )}
                </div>
              )}

              {/* Due Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">마감 날짜 *</Label>
                  <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="h-10 rounded-xl border-slate-200 bg-slate-50/60 text-[13px] focus-visible:ring-2 focus-visible:ring-amber-400/25 focus-visible:border-amber-400" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">마감 시간</Label>
                  <Input type="time" value={dueTime} onChange={e => setDueTime(e.target.value)} className="h-10 rounded-xl border-slate-200 bg-slate-50/60 text-[13px] focus-visible:ring-2 focus-visible:ring-amber-400/25 focus-visible:border-amber-400" />
                </div>
              </div>

              {/* Homework Types */}
              <div className="space-y-3">
                <Label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">숙제 종류 * (복수 선택 가능)</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {HOMEWORK_TYPES.map(type => {
                    const on = selectedTypes.includes(type.value);
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => handleTypeToggle(type.value)}
                        className={`relative rounded-2xl p-4 text-center transition-all duration-200 ${
                          on
                            ? "bg-gradient-to-b from-slate-900 to-slate-800 text-white ring-1 ring-amber-400/40 shadow-[0_16px_32px_-20px_rgba(15,23,42,0.9)]"
                            : "bg-white text-slate-600 ring-1 ring-slate-200/80 hover:ring-slate-300 hover:shadow-[0_10px_24px_-18px_rgba(15,23,42,0.5)]"
                        }`}
                      >
                        <span className="text-2xl block">{type.icon}</span>
                        <p className={`text-[12px] font-semibold mt-2 tracking-[-0.01em] ${on ? "text-white" : "text-slate-700"}`}>{type.label}</p>
                        {on && <CheckCircle2 className="w-4 h-4 text-amber-400 mx-auto mt-1.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question Count per Type */}
              {selectedTypes.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">종류별 문제 개수 설정</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {selectedTypes.map(typeValue => {
                      const typeInfo = HOMEWORK_TYPES.find(t => t.value === typeValue);
                      return (
                        <div key={typeValue} className="flex items-center gap-3 p-2.5 rounded-xl ring-1 ring-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
                          <span className="text-xl">{typeInfo?.icon}</span>
                          <span className="text-[12.5px] font-semibold text-slate-700 flex-1 tracking-[-0.01em]">{typeInfo?.label}</span>
                          <div className="flex items-center gap-1.5">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 rounded-lg border-slate-200 text-slate-500 hover:text-slate-900"
                              onClick={(e) => { e.stopPropagation(); handleQuestionCountChange(typeValue, (questionCounts[typeValue] || 10) - 5); }}
                            >-</Button>
                            <Input
                              type="number"
                              min={1}
                              max={100}
                              value={questionCounts[typeValue] || 10}
                              onChange={e => handleQuestionCountChange(typeValue, parseInt(e.target.value) || 1)}
                              className="w-16 h-8 text-center text-sm rounded-lg border-slate-200 tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              onClick={e => e.stopPropagation()}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 rounded-lg border-slate-200 text-slate-500 hover:text-slate-900"
                              onClick={(e) => { e.stopPropagation(); handleQuestionCountChange(typeValue, (questionCounts[typeValue] || 10) + 5); }}
                            >+</Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 ring-1 ring-amber-200 text-amber-700 text-[11px] font-bold tabular-nums">
                      <Target className="w-3.5 h-3.5" />
                      총 문제 수: {getTotalQuestionCount()}문제
                    </span>
                  </div>
                </div>
              )}

              <Button 
                onClick={handleCreateHomework} 
                disabled={creating} 
                className="w-full h-12 text-[14px] font-semibold rounded-xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 hover:from-slate-800 hover:to-slate-800 text-white shadow-[0_18px_36px_-20px_rgba(15,23,42,0.9)] transition-all disabled:opacity-40 disabled:shadow-none"
              >
                {creating ? "생성 중..." : "🚀 숙제 생성하기"}
              </Button>
            </div>

          </div>
        </TabsContent>

        {/* MANAGE TAB */}
        <TabsContent value="manage" className="mt-6 space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <Select value={filterGrade} onValueChange={setFilterGrade}>
              <SelectTrigger className="w-32"><SelectValue placeholder="학년" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 학년</SelectItem>
                {GRADE_OPTIONS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterClass} onValueChange={setFilterClass}>
              <SelectTrigger className="w-32"><SelectValue placeholder="반" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 반</SelectItem>
                {CLASS_OPTIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {filteredHomeworks.length === 0 ? (
            <Card className="p-12 text-center">
              <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">생성된 숙제가 없습니다</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredHomeworks.map(hw => {
                const isExpired = new Date(hw.due_date) < new Date();
                const cardSet = cardSets.find(cs => cs.id === hw.card_set_id);
                return (
                  <Card key={hw.id} className={`group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 ${isExpired ? "opacity-75" : ""}`}>
                    {/* Premium header bar */}
                    <div className="relative h-2" style={{
                      background: hw.is_active 
                        ? "linear-gradient(90deg, hsl(220 80% 55%), hsl(250 70% 60%))" 
                        : "linear-gradient(90deg, hsl(var(--muted)), hsl(var(--border)))"
                    }} />
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        {/* Left icon */}
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center shadow-sm" style={{
                          background: hw.is_active 
                            ? "linear-gradient(135deg, hsl(220 80% 55%), hsl(250 70% 60%))"
                            : "hsl(var(--muted))"
                        }}>
                          <ClipboardList className="w-6 h-6 text-white" />
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-base truncate">{hw.title}</h3>
                            {hw.is_active ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white" style={{ background: "linear-gradient(135deg, hsl(142 60% 45%), hsl(160 50% 40%))" }}>
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> 활성
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground">비활성</span>
                            )}
                            {isExpired && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-destructive/10 text-destructive">마감</span>
                            )}
                          </div>
                          
                          {/* Info grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1.5 text-xs mb-3">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                              <span className="truncate font-medium">{cardSet?.title || "..."}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Users className="w-3.5 h-3.5 text-purple-500" />
                              <span className="font-medium">{hw.class_name || "-"} · {hw.grade || "-"}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Calendar className="w-3.5 h-3.5 text-amber-500" />
                              <span className="font-medium">{format(new Date(hw.due_date), "M/dd HH:mm", { locale: ko })}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Target className="w-3.5 h-3.5 text-emerald-500" />
                              <span className="font-medium">
                                {(() => {
                                  if (!cardSet?.word_data) return "0단어";
                                  const words = (cardSet.word_data as any[]) || [];
                                  const filtered = words.filter((w: any) => {
                                    const dayLabel = w.day || w.Day || "";
                                    return hw.selected_days.includes(dayLabel);
                                  });
                                  return `${filtered.length}단어`;
                                })()}
                              </span>
                            </div>
                          </div>

                          {/* DAY range pill */}
                          <div className="flex items-center gap-1.5 mb-3">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-accent/30 text-[11px] font-medium text-foreground/70">
                              📅 {hw.selected_days.length > 3 
                                ? `${hw.selected_days[0]} ~ ${hw.selected_days[hw.selected_days.length - 1]} (${hw.selected_days.length}개)` 
                                : hw.selected_days.join(", ")}
                            </span>
                          </div>

                          {/* Homework type badges */}
                          <div className="flex flex-wrap gap-1.5">
                            {hw.homework_types.map(t => {
                              const type = HOMEWORK_TYPES.find(ht => ht.value === t);
                              return (
                                <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border/50 bg-card text-[11px] font-medium shadow-sm">
                                  {type?.icon} {type?.label}
                                </span>
                              );
                            })}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-wrap gap-1.5 flex-shrink-0 mt-2">
                          <Button size="sm" variant="outline" className="h-7 px-2.5 text-[11px] font-medium rounded-full border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 gap-1" onClick={() => { setSelectedHomeworkId(hw.id); setActiveTab("results"); }}>
                            <Eye className="w-3 h-3" />
                            결과보기
                          </Button>
                          <Button size="sm" variant="outline" className={`h-7 px-2.5 text-[11px] font-medium rounded-full gap-1 ${hw.is_active ? 'border-amber-200 text-amber-600 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-950' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950'}`} onClick={() => handleToggleActive(hw.id, hw.is_active)}>
                            {hw.is_active 
                              ? <><AlertCircle className="w-3 h-3" /> 마감</>
                              : <><CheckCircle2 className="w-3 h-3" /> 재개</>
                            }
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 px-2.5 text-[11px] font-medium rounded-full border-red-200 text-red-500 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950 gap-1" onClick={() => handleDeleteHomework(hw.id)}>
                            <Trash2 className="w-3 h-3" />
                            삭제
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* RESULTS TAB */}
        <TabsContent value="results" className="mt-6 space-y-6">
          {/* Gaming-style header banner */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <img src={homeworkLeaderboardBanner} alt="" className="w-full h-32 md:h-40 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent flex items-center px-6 md:px-10">
              <div className="flex items-center gap-4">
                <img src={homeworkTrophyMascot} alt="Trophy Mascot" className="w-20 h-20 md:w-24 md:h-24 drop-shadow-2xl animate-bounce" style={{ animationDuration: '3s' }} />
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-white tracking-tight drop-shadow-lg">🏆 숙제 결과 대시보드</h2>
                  <p className="text-white/70 text-sm mt-1">학생들의 학습 성과를 한눈에 확인하세요</p>
                </div>
              </div>
            </div>
          </div>

          {/* Homework Selector - gaming style */}
          <div className="relative">
            <Select value={selectedHomeworkId || ""} onValueChange={setSelectedHomeworkId}>
              <SelectTrigger className="border-2 border-amber-500/30 rounded-xl shadow-lg bg-card h-12 text-base font-semibold hover:border-amber-500/60 transition-colors">
                <SelectValue placeholder="🎯 숙제를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {homeworks.map(hw => (
                  <SelectItem key={hw.id} value={hw.id}>📋 {hw.title} ({hw.class_name || "-"})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedHomeworkId ? (
            <>
              {/* Stats Cards - Gaming Infographic Style */}

               {/* Marathon Race Track */}
              <Card className="border-0 shadow-2xl overflow-hidden rounded-2xl">
                {/* Marathon Banner Header */}
                <div className="relative h-36 md:h-44 overflow-hidden">
                  <img src={homeworkMarathonBanner} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
                    <div>
                      <h3 className="text-white font-black text-xl md:text-2xl tracking-tight drop-shadow-lg flex items-center gap-2">
                        🏃 학습 마라톤
                      </h3>
                      <p className="text-white/70 text-xs mt-0.5">{submissions.length}명의 학생이 달리고 있어요!</p>
                    </div>
                    <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm text-xs">{submissions.length}명 참가</Badge>
                  </div>
                </div>

                <CardContent className="p-0">
                  {submissions.length === 0 ? (
                    <div className="text-center py-16">
                      <img src={homeworkStudyMascot} alt="" className="w-24 h-24 mx-auto mb-4 opacity-50" />
                      <p className="text-muted-foreground font-medium">아직 제출된 결과가 없습니다</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">학생들이 숙제를 완료하면 여기에 표시됩니다</p>
                    </div>
                  ) : (
                    <>
                      {/* Marathon Race Track Visual */}
                      <div className="relative bg-gradient-to-b from-violet-50 via-sky-50 to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 px-4 py-6 overflow-x-auto">
                        {/* Road/Track */}
                        <div className="relative min-w-[600px]">
                          {/* Finish line */}
                          <div className="absolute left-4 top-0 bottom-0 w-1 z-10" style={{
                            background: 'repeating-linear-gradient(to bottom, #000 0px, #000 6px, #fff 6px, #fff 12px)'
                          }} />
                          <div className="absolute left-1 top-2 text-[8px] font-black text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded z-20 whitespace-nowrap">🏁 FINISH</div>

                          {/* Track lanes */}
                          <div className="space-y-1.5 pl-10">
                            {submissions.map((sub, idx) => {
                              const maxScore = Math.max(...submissions.map(s => s.score || 0), 1);
                              const progress = ((sub.score || 0) / 100) * 100;
                              const medalImg = idx === 0 ? rankGoldMedal : idx === 1 ? rankSilverMedal : idx === 2 ? rankBronzeMedal : null;
                              const laneColors = [
                                "from-amber-400/30 to-amber-100/10 border-amber-300/50",
                                "from-slate-300/30 to-slate-100/10 border-slate-300/50",
                                "from-orange-300/30 to-orange-100/10 border-orange-300/50",
                                "from-blue-200/30 to-blue-100/10 border-blue-200/50",
                                "from-violet-200/30 to-violet-100/10 border-violet-200/50",
                                "from-emerald-200/30 to-emerald-100/10 border-emerald-200/50",
                                "from-rose-200/30 to-rose-100/10 border-rose-200/50",
                                "from-cyan-200/30 to-cyan-100/10 border-cyan-200/50",
                              ];
                              const laneColor = laneColors[idx % laneColors.length];

                              return (
                                <div key={sub.id} className={`relative flex items-center h-14 md:h-16 rounded-xl bg-gradient-to-r ${laneColor} border overflow-hidden`}>
                                  {/* Lane number & medal */}
                                  <div className="flex-shrink-0 w-10 flex items-center justify-center">
                                    {medalImg ? (
                                      <img src={medalImg} alt={`Rank ${idx + 1}`} className="w-7 h-7 drop-shadow-md" />
                                    ) : (
                                      <span className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-[11px] font-black text-muted-foreground">{idx + 1}</span>
                                    )}
                                  </div>

                                  {/* Track progress bar with runner */}
                                  <div className="flex-1 relative h-full pr-3">
                                    {/* Progress track */}
                                    <div className="absolute inset-y-2 left-0 right-[140px] md:right-[180px] rounded-full bg-muted/30 overflow-hidden">
                                      <div 
                                        className={`h-full rounded-full transition-all duration-[2000ms] ease-out ${
                                          (sub.score || 0) >= 80 
                                            ? "bg-gradient-to-r from-emerald-400 to-emerald-500" 
                                            : (sub.score || 0) >= 50 
                                              ? "bg-gradient-to-r from-amber-400 to-amber-500"
                                              : "bg-gradient-to-r from-red-400 to-red-500"
                                        }`}
                                        style={{ width: `${Math.max(progress, 5)}%` }}
                                      />
                                    </div>

                                    {/* Runner icon at progress position */}
                                    <div 
                                      className="absolute top-1/2 -translate-y-1/2 transition-all duration-[2000ms] ease-out z-10"
                                      style={{ left: `calc(${Math.min(progress, 92)}% * (100% - 180px) / 100%)`, maxWidth: '36px' }}
                                    >
                                      <img 
                                        src={homeworkRunnerIcon} 
                                        alt="" 
                                        className={`w-9 h-9 md:w-10 md:h-10 drop-shadow-lg ${idx === 0 ? 'scale-110' : ''}`}
                                        style={{ filter: idx === 0 ? 'drop-shadow(0 0 6px rgba(234, 179, 8, 0.5))' : undefined }}
                                      />
                                    </div>

                                    {/* Student info overlay */}
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2 min-w-[130px] md:min-w-[170px]">
                                      <div className="text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                          <span className="font-bold text-xs md:text-sm text-foreground">{sub.student_name}</span>
                                          {idx === 0 && <img src={homeworkCrownIcon} alt="" className="w-4 h-4" />}
                                        </div>
                                        <div className="flex items-center justify-end gap-2 mt-0.5">
                                          <span className="text-[9px] text-muted-foreground">{sub.student_class || "-"}</span>
                                          <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                                            <Clock className="w-2.5 h-2.5" />{formatTime(sub.time_spent_seconds || 0)}
                                          </span>
                                          <span className={`text-xs md:text-sm font-black ${
                                            (sub.score || 0) >= 80 ? "text-emerald-600 dark:text-emerald-400"
                                            : (sub.score || 0) >= 50 ? "text-amber-600 dark:text-amber-400"
                                            : "text-red-600 dark:text-red-400"
                                          }`}>{sub.score || 0}점</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Detailed Results Table below */}
                      <div className="divide-y divide-border/30">
                        {submissions.map((sub, idx) => {
                          const wrongWords = Array.isArray(sub.wrong_words) ? sub.wrong_words : [];
                          return (
                            <div key={`detail-${sub.id}`} className="flex items-center gap-3 px-4 py-2.5 text-xs hover:bg-accent/20 transition-colors">
                              <span className="w-6 text-center font-black text-muted-foreground">{idx + 1}</span>
                              <span className="font-bold flex-shrink-0">{sub.student_name}</span>
                              <span className="text-muted-foreground text-[10px] px-1.5 py-0.5 rounded bg-muted">{sub.student_class || "-"}</span>
                              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">🔄 {sub.retry_count}회</span>
                              {sub.is_completed && <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-0.5"><CheckCircle2 className="w-3 h-3" />완료</span>}
                              <div className="ml-auto flex flex-wrap gap-1 max-w-[200px]">
                                {wrongWords.slice(0, 3).map((w: any, i: number) => (
                                  <span key={i} className="inline-flex px-1.5 py-0.5 rounded bg-destructive/10 text-destructive text-[9px] font-semibold">{typeof w === 'string' ? w : w?.word || ''}</span>
                                ))}
                                {wrongWords.length > 3 && (
                                  <span className="inline-flex px-1.5 py-0.5 rounded bg-muted text-muted-foreground text-[9px] font-semibold">+{wrongWords.length - 3}</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center py-20">
              <img src={homeworkStudyMascot} alt="" className="w-32 h-32 mx-auto mb-4 opacity-60" />
              <p className="text-lg font-bold text-muted-foreground">숙제를 선택해주세요</p>
              <p className="text-sm text-muted-foreground/60 mt-1">위 드롭다운에서 숙제를 선택하면 결과를 확인할 수 있습니다</p>
            </div>
          )}
        </TabsContent>

        {/* WRONG WORDS TAB */}
        <TabsContent value="wrong-words" className="mt-6">
          <CumulativeWrongWords />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HomeworkManager;
