import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Brain, Sparkles, CalendarDays, Crown, Flame, Rocket, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FullPageLoading } from "@/components/ui/loading-spinner";

type ScheduleKey = "mwf" | "tt";
type DayKey = "mon" | "wed" | "fri" | "tue" | "thu";
type ClassKey = "honors" | "ivy" | "top" | "bc_s" | "bc_a" | "bc_b";
type TestType =
  | "meaning"
  | "meaning_pos"
  | "spelling"
  | "mixed"
  | "synonym_antonym"
  | "example_completion"
  | "english_definition"
  | "polysemy";

interface CardSetOpt {
  id: string;
  title: string;
  selected_days: string[];
  word_data: any;
}

interface DaySlot {
  day: DayKey;
  label: string;       // "월", "수", ...
  rangeLabel: string;  // "1-2", "1-4 누적", "1-14 누적 1차"
  startDay: number;
  endDay: number;
}

interface WeekPlan {
  week: number;
  slots: DaySlot[];
}

// 주3회: 월수금 4주 스케줄 (사용자 사양 그대로) — labels in English
const MWF_SCHEDULE: WeekPlan[] = [
  { week: 1, slots: [
    { day: "mon", label: "Mon", rangeLabel: "Day 1-2", startDay: 1, endDay: 2 },
    { day: "wed", label: "Wed", rangeLabel: "Day 3-4", startDay: 3, endDay: 4 },
    { day: "fri", label: "Fri", rangeLabel: "Day 1-4 Cumulative", startDay: 1, endDay: 4 },
  ]},
  { week: 2, slots: [
    { day: "mon", label: "Mon", rangeLabel: "Day 5-6", startDay: 5, endDay: 6 },
    { day: "wed", label: "Wed", rangeLabel: "Day 7-8", startDay: 7, endDay: 8 },
    { day: "fri", label: "Fri", rangeLabel: "Day 5-8 Cumulative", startDay: 5, endDay: 8 },
  ]},
  { week: 3, slots: [
    { day: "mon", label: "Mon", rangeLabel: "Day 9-10", startDay: 9, endDay: 10 },
    { day: "wed", label: "Wed", rangeLabel: "Day 11-12", startDay: 11, endDay: 12 },
    { day: "fri", label: "Fri", rangeLabel: "Day 9-12 Cumulative", startDay: 9, endDay: 12 },
  ]},
  { week: 4, slots: [
    { day: "mon", label: "Mon", rangeLabel: "Day 13-14", startDay: 13, endDay: 14 },
    { day: "wed", label: "Wed", rangeLabel: "Day 1-14 Cumulative (1st)", startDay: 1, endDay: 14 },
    { day: "fri", label: "Fri", rangeLabel: "Day 1-14 Cumulative (2nd)", startDay: 1, endDay: 14 },
  ]},
];

// 주2회: 화목 4주 스케줄
const TT_SCHEDULE: WeekPlan[] = [
  { week: 1, slots: [
    { day: "tue", label: "Tue", rangeLabel: "Day 1-4", startDay: 1, endDay: 4 },
    { day: "thu", label: "Thu", rangeLabel: "Day 5-6", startDay: 5, endDay: 6 },
  ]},
  { week: 2, slots: [
    { day: "tue", label: "Tue", rangeLabel: "Day 1-6 Cumulative", startDay: 1, endDay: 6 },
    { day: "thu", label: "Thu", rangeLabel: "Day 7-8", startDay: 7, endDay: 8 },
  ]},
  { week: 3, slots: [
    { day: "tue", label: "Tue", rangeLabel: "Day 9-12", startDay: 9, endDay: 12 },
    { day: "thu", label: "Thu", rangeLabel: "Day 13-14", startDay: 13, endDay: 14 },
  ]},
  { week: 4, slots: [
    { day: "tue", label: "Tue", rangeLabel: "Day 1-14 Cumulative (1st)", startDay: 1, endDay: 14 },
    { day: "thu", label: "Thu", rangeLabel: "Day 1-14 Cumulative (2nd)", startDay: 1, endDay: 14 },
  ]},
];

const TEST_TYPE_OPTIONS: { value: TestType; label: string }[] = [
  { value: "mixed", label: "한영+영한 50:50 (mixed)" },
  { value: "spelling", label: "한영 (spelling)" },
  { value: "meaning", label: "영한 (meaning)" },
  { value: "meaning_pos", label: "영한 + 품사 표기 (meaning + POS)" },
  { value: "synonym_antonym", label: "동반어" },
  { value: "english_definition", label: "영영풀이" },
  { value: "example_completion", label: "예문" },
  { value: "polysemy", label: "다의어" },
];

// 반별 프리셋: 진도일/누적일 기본 시험 유형 + 노트
// 진도일 = 월/수 또는 화, 누적일 = 금 또는 목
interface ClassPreset {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  progressType: TestType; // 월/수/화
  reviewType: TestType;   // 금/목
  notes: string[];
}

const CLASS_PRESETS: Record<ClassKey, ClassPreset> = {
  honors: {
    label: "Honors",
    icon: Crown,
    progressType: "mixed",          // 한영+영한 50:50
    reviewType: "synonym_antonym",  // 동/반의어 포함
    notes: [],
  },
  ivy: {
    label: "IVY",
    icon: Sparkles,
    progressType: "mixed",
    reviewType: "synonym_antonym",
    notes: ["1학기: 옳은보카 5 / 2학기: 옳은보카 6"],
  },
  top: {
    label: "Top",
    icon: Crown,
    progressType: "mixed",
    reviewType: "synonym_antonym",
    notes: ["1학기: 옳은보카 7 / 2학기: 옳은보카 8"],
  },
  bc_s: {
    label: "BC S",
    icon: Flame,
    progressType: "meaning_pos",
    reviewType: "synonym_antonym",
    notes: ["1회독: 영한 시 품사 반드시 표기"],
  },
  bc_a: {
    label: "BC A",
    icon: Rocket,
    progressType: "meaning_pos",
    reviewType: "mixed",
    notes: ["1회독: 영한 시 품사 반드시 표기"],
  },
  bc_b: {
    label: "BC B",
    icon: Sparkles,
    progressType: "meaning_pos",
    reviewType: "mixed",
    notes: ["1회독: 영한 시 품사 반드시 표기"],
  },
};

// 누적일 판정: rangeLabel에 "Cumulative" 포함
const isReviewSlot = (rangeLabel: string) => /Cumulative/i.test(rangeLabel);
// 차수 추출: "(1st)" / "(2nd)" → "1st" / "2nd"
const extractCumulativeOrdinal = (rangeLabel: string): string | null => {
  const m = rangeLabel.match(/\((\d+(?:st|nd|rd|th))\)/i);
  return m ? m[1] : null;
};

const Brainiac = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [cardSets, setCardSets] = useState<CardSetOpt[]>([]);
  const [selectedCardSet, setSelectedCardSet] = useState<string>("");
  const [schedule, setSchedule] = useState<ScheduleKey>("mwf");
  const [selectedClass, setSelectedClass] = useState<ClassKey>("honors");

  // 각 요일별 시험 유형 — 반 프리셋에 따라 초기화
  const initialPreset = CLASS_PRESETS.honors;
  const [dayTypes, setDayTypes] = useState<Record<DayKey, TestType>>({
    mon: initialPreset.progressType,
    wed: initialPreset.progressType,
    fri: initialPreset.reviewType,
    tue: initialPreset.progressType,
    thu: initialPreset.reviewType,
  });

  // 반 선택 시 요일별 시험 유형 자동 적용
  const applyClassPreset = (key: ClassKey) => {
    setSelectedClass(key);
    const p = CLASS_PRESETS[key];
    setDayTypes({
      mon: p.progressType,
      wed: p.progressType,
      fri: p.reviewType,
      tue: p.progressType,
      thu: p.reviewType,
    });
  };

  // 주차 선택: "all" 또는 1~4
  const [weekFilter, setWeekFilter] = useState<string>("all");

  // 시작 Day 오프셋 (기본 1 = Day 1~14, 15 = Day 15~28, ...)
  const [startDayOffset, setStartDayOffset] = useState<number>(1);

  // 단어장 실제 Day 개수 기반 범위 제한
  const getMaxAvailableDay = (): number => {
    const selected = cardSets.find((cs) => cs.id === selectedCardSet);
    if (!selected) return 0;
    const extractNum = (str: string): number => {
      const m = str?.toString().match(/(\d+)/);
      return m ? parseInt(m[1], 10) : 0;
    };
    let days: string[] = selected.selected_days || [];
    if (days.length === 0 && Array.isArray(selected.word_data)) {
      const set = new Set<string>();
      selected.word_data.forEach((w: any) => {
        if (w?.day) set.add(String(w.day));
      });
      days = Array.from(set);
    }
    if (days.length === 0) return 0;
    return Math.max(...days.map(extractNum));
  };

  const maxAvailableDay = getMaxAvailableDay();
  const hasDayLimit = maxAvailableDay > 0;


  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("card_sets")
        .select("id, title, selected_days, word_data")
        .order("created_at", { ascending: false });
      if (error) {
        toast({ title: "단어장 불러오기 실패", variant: "destructive" });
      } else {
        const sorted = (data || []).sort((a, b) => {
          const order = (t: string) => {
            if (t.includes("Ultimate")) return 100;
            const m = t.match(/ORUN VOCA\s*(\d+)/i);
            return m ? parseInt(m[1], 10) : 50;
          };
          return order(a.title) - order(b.title);
        });
        setCardSets(sorted);
      }
      setLoading(false);
    })();
  }, [toast]);

  if (loading) return <FullPageLoading />;

  const fullPlan = schedule === "mwf" ? MWF_SCHEDULE : TT_SCHEDULE;
  const offset = Math.max(0, (Number(startDayOffset) || 1) - 1);
  const offsettedPlan: WeekPlan[] = fullPlan.map((w) => ({
    ...w,
    slots: w.slots.map((s) => {
      const ns = s.startDay + offset;
      const ne = s.endDay + offset;
      const clampedStart = ns;
      const clampedEnd = hasDayLimit && maxAvailableDay > 0 ? Math.min(ne, maxAvailableDay) : ne;
      const valid = clampedStart <= clampedEnd;
      const newRange = valid
        ? s.rangeLabel.replace(/Day\s*\d+-\d+/, `Day ${clampedStart}-${clampedEnd}`)
        : "Out of range";
      return { ...s, startDay: clampedStart, endDay: clampedEnd, rangeLabel: newRange };
    }),
  }));
  const filteredPlan =
    weekFilter === "all"
      ? offsettedPlan
      : offsettedPlan.filter((w) => String(w.week) === weekFilter);


  const activeDays: DayKey[] = schedule === "mwf" ? ["mon", "wed", "fri"] : ["tue", "thu"];
  const dayLabelMap: Record<DayKey, string> = {
    mon: "Mon", wed: "Wed", fri: "Fri", tue: "Tue", thu: "Thu",
  };
  const dayFullEn: Record<DayKey, string> = {
    mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday",
  };

  const invalidSlots = filteredPlan.flatMap((w) => w.slots.filter((s) => s.startDay > s.endDay));

  const handleGenerate = () => {
    if (!selectedCardSet) {
      toast({ title: "단어장 선택 필요", variant: "destructive" });
      return;
    }
    const validSlots = filteredPlan.flatMap((week) =>
      week.slots
        .filter((slot) => slot.startDay <= slot.endDay)
        .map((slot) => ({ ...slot, week: week.week }))
    );
    if (validSlots.length === 0) {
      toast({ title: "생성 가능한 시험 범위가 없습니다", description: "시작 Day를 조정하거나 단어장을 확인해 주세요.", variant: "destructive" });
      return;
    }
    const classLabel = CLASS_PRESETS[selectedClass].label;
    const classRequiresPos = CLASS_PRESETS[selectedClass].notes.some((n) => n.includes("품사"));
    const multiRanges = validSlots.map((slot) => {
      const slotType = dayTypes[slot.day];
      const isSynAnt = slotType === "synonym_antonym";
      const isMeaningPos = slotType === "meaning_pos";
      const isCumulative = isReviewSlot(slot.rangeLabel);
      const ordinal = extractCumulativeOrdinal(slot.rangeLabel);
      // 누적시험은 80문제 랜덤, 그 외는 전체
      const questionCount = isCumulative ? "80" : "all";
      // 헤더 제목 (영문)
      const cumulativeTag = isCumulative
        ? ` · ${ordinal ? `${ordinal} ` : ""}Cumulative`
        : "";
      const customTitle = `BRAINIAC ${classLabel} · Week ${slot.week} · ${dayFullEn[slot.day]}${cumulativeTag}`;
      // 실제 출제는 meaning_pos → meaning, synonym_antonym → mixed로 매핑
      const underlyingType = isSynAnt ? "mixed" : (isMeaningPos ? "meaning" : slotType);
      return {
        id: crypto.randomUUID(),
        part: "",
        startDay: slot.startDay,
        endDay: slot.endDay,
        questionCount,
        orderType: "random",
        testType: underlyingType,
        appendSynAnt: isSynAnt,
        customTitle,
      };
    });

    const cfg = {
      cardSetId: selectedCardSet,
      testTitle: `BRAINIAC ${classLabel} ${weekFilter === "all" ? "Weeks 1-4" : `Week ${weekFilter}`}`,
      mixedSelectedTypes: ["meaning", "spelling"],
      multiRanges,
    };
    sessionStorage.setItem("brainiacConfig", JSON.stringify(cfg));
    navigate("/create-test-paper");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-400 flex items-center justify-center shadow-md">
            <Brain className="w-6 h-6 text-slate-900" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-wide">BRAINIAC</h1>
            <p className="text-sm text-muted-foreground">주3회·주2회 × 4주 시험지를 한 번에 생성합니다.</p>
          </div>
        </div>

        {/* 반 구조 선택 */}
        <Card>
          <CardContent className="p-5 space-y-4">
            <Label className="text-sm font-semibold">반 구조</Label>
            <div className="grid grid-cols-2 gap-3">
              {([
                { key: "mwf" as ScheduleKey, title: "주3회반", sub: "월 · 수 · 금" },
                { key: "tt" as ScheduleKey, title: "주2회반", sub: "화 · 목" },
              ]).map((opt) => {
                const active = schedule === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setSchedule(opt.key)}
                    className={`flex flex-col items-center justify-center gap-1.5 px-4 py-5 rounded-xl border-2 transition-all ${
                      active
                        ? "border-amber-500 bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/40 dark:to-amber-800/20 shadow-md"
                        : "border-border bg-card hover:border-amber-300"
                    }`}
                  >
                    <CalendarDays className={`w-5 h-5 ${active ? "text-amber-700 dark:text-amber-300" : "text-muted-foreground"}`} />
                    <span className="font-bold tracking-wide">{opt.title}</span>
                    <span className="text-xs text-muted-foreground">{opt.sub}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 반 선택 (Honors / BC S / BC A / BC B) */}
        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-baseline justify-between">
              <Label className="text-sm font-semibold">반 선택</Label>
              <span className="text-[11px] text-muted-foreground">
                선택 시 요일별 기본 시험 유형이 자동 적용됩니다 (이후 수동 변경 가능)
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {(Object.keys(CLASS_PRESETS) as ClassKey[]).map((key) => {
                const preset = CLASS_PRESETS[key];
                const Icon = preset.icon;
                const active = selectedClass === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => applyClassPreset(key)}
                    className={`flex flex-col items-center justify-center gap-1.5 px-3 py-4 rounded-xl border-2 transition-all ${
                      active
                        ? "border-amber-500 bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/40 dark:to-amber-800/20 shadow-md"
                        : "border-border bg-card hover:border-amber-300"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${active ? "text-amber-700 dark:text-amber-300" : "text-muted-foreground"}`} />
                    <span className="font-bold tracking-wide">{preset.label}</span>
                  </button>
                );
              })}
            </div>
            {CLASS_PRESETS[selectedClass].notes.length > 0 && (
              <div className="rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 px-3 py-2">
                <ul className="text-xs text-amber-800 dark:text-amber-200 space-y-0.5">
                  {CLASS_PRESETS[selectedClass].notes.map((n, i) => (
                    <li key={i}>※ {n}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 단어장 + 주차 */}
        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-semibold">단어장</Label>
                <Select value={selectedCardSet} onValueChange={setSelectedCardSet}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="단어장 선택" /></SelectTrigger>
                  <SelectContent>
                    {cardSets.map((cs) => (
                      <SelectItem key={cs.id} value={cs.id}>{cs.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-semibold">시작 Day</Label>
                <Input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  value={startDayOffset}
                  onFocus={(e) => e.currentTarget.select()}
                  onChange={(e) => setStartDayOffset(Number(e.target.value) || 1)}
                  className="mt-1.5"
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  {hasDayLimit
                    ? `Day ${startDayOffset} ~ ${Math.min(startDayOffset + 13, maxAvailableDay)} (단어장 최대 Day ${maxAvailableDay})`
                    : `Day ${startDayOffset} ~ ${startDayOffset + 13} (14일치 4주 스케줄)`}
                </p>
              </div>
              <div>
                <Label className="text-sm font-semibold">생성 주차</Label>
                <Select value={weekFilter} onValueChange={setWeekFilter}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 4주</SelectItem>
                    <SelectItem value="1">1주차만</SelectItem>
                    <SelectItem value="2">2주차만</SelectItem>
                    <SelectItem value="3">3주차만</SelectItem>
                    <SelectItem value="4">4주차만</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* 요일별 시험 유형 */}
        <Card>
          <CardContent className="p-5 space-y-4">
            <Label className="text-sm font-semibold">요일별 시험 유형</Label>
            <div className={`grid gap-3 ${schedule === "mwf" ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
              {activeDays.map((d) => (
                <div key={d}>
                  <div className="text-xs font-bold text-amber-700 dark:text-amber-300 mb-1.5">
                    {dayFullEn[d]}
                  </div>
                  <Select
                    value={dayTypes[d]}
                    onValueChange={(v) =>
                      setDayTypes((prev) => ({ ...prev, [d]: v as TestType }))
                    }
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TEST_TYPE_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 스케줄 미리보기 */}
        <Card>
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">스케줄 미리보기</Label>
              {invalidSlots.length > 0 && (
                <div className="flex items-center gap-1 text-[11px] text-red-600 dark:text-red-300 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {invalidSlots.length}개 슬롯이 단어장 범위를 초과했습니다
                </div>
              )}
            </div>
            <div className="space-y-3">
              {filteredPlan.map((week) => (
                <div key={week.week} className="rounded-lg border border-border bg-card p-3">
                  <div className="text-xs font-bold text-amber-700 dark:text-amber-300 mb-2">
                    Week {week.week}
                  </div>
                  <div className={`grid gap-2 ${schedule === "mwf" ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
                    {week.slots.map((slot) => {
                      const tt = TEST_TYPE_OPTIONS.find((o) => o.value === dayTypes[slot.day])?.label ?? "";
                      const valid = slot.startDay <= slot.endDay;
                      return (
                        <div key={slot.day} className={`rounded-md px-3 py-2 ${valid ? "bg-muted/40" : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40"}`}>
                          <div className={`text-[13px] font-semibold ${!valid ? "text-red-700 dark:text-red-300" : ""}`}>
                            {dayFullEn[slot.day]} · {slot.rangeLabel}
                          </div>
                          <div className={`text-[11px] mt-0.5 ${valid ? "text-muted-foreground" : "text-red-600 dark:text-red-300"}`}>
                            {valid ? tt : "단어장에 해당 Day가 없습니다"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            size="lg"
            onClick={handleGenerate}
            disabled={!selectedCardSet}
            className="bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-900 hover:from-amber-600 hover:to-yellow-500 font-bold"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            시험지 일괄 생성
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Brainiac;
