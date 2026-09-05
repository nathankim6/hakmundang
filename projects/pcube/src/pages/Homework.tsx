import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cacheBustUrl } from "@/lib/utils";
import { useOwnerFilter } from "@/hooks/useOwnerFilter";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Check, CheckCircle2, ChevronDown, ChevronRight, Download, FileText, GraduationCap, Loader2, PenLine, School, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { generateExamDocx } from "@/utils/generateExamDocx";
import { FileDown } from "lucide-react";

interface Passage {
  id: string;
  title: string;
  sentences: string[];
  korean_content: string | null;
  grade_id: string | null;
  school_id: string | null;
  grade?: { id: string; name: string; school?: { id: string; name: string; logo_url?: string | null } | null } | null;
}

interface WritingSentence {
  id: string;
  passage_id: string;
  sentence_index: number;
  english_sentence: string;
  korean_sentence: string;
}

// Partial text overrides for a sentence
interface PartialOverride {
  english?: string;
  korean?: string;
}

export default function Homework() {
  const queryClient = useQueryClient();
  const { ownerCodeId, shouldFilter } = useOwnerFilter();
  const [expandedSchools, setExpandedSchools] = useState<Set<string>>(new Set());
  const [expandedGrades, setExpandedGrades] = useState<Set<string>>(new Set());
  const [expandedPassages, setExpandedPassages] = useState<Set<string>>(new Set());
  const [savingPassageId, setSavingPassageId] = useState<string | null>(null);
  const [localSelections, setLocalSelections] = useState<Record<string, Set<number>>>({});
  const [focusedSentence, setFocusedSentence] = useState<{ passageId: string; idx: number; passage: Passage } | null>(null);
  const focusedRef = useRef(focusedSentence);
  focusedRef.current = focusedSentence;

  // Track partial text overrides: { [passageId]: { [sentenceIdx]: { english?, korean? } } }
  const [partialOverrides, setPartialOverrides] = useState<Record<string, Record<number, PartialOverride>>>({});

  const isSessionReady = !!ownerCodeId;

  // Fetch active RT review homework passage IDs
  const { data: activeRtPassageIds = [] } = useQuery({
    queryKey: ["active-rt-homework-passage-ids", ownerCodeId, shouldFilter],
    enabled: isSessionReady,
    queryFn: async () => {
      let query = supabase
        .from("homework")
        .select("passage_id")
        .eq("type", "rt_review")
        .not("passage_id", "is", null);

      if (shouldFilter) query = query.eq("owner_code_id", ownerCodeId!);
      const { data, error } = await query;
      if (error) throw error;
      return [...new Set((data || []).map((h) => h.passage_id).filter(Boolean))] as string[];
    },
  });

  // Realtime sync: refresh when homework, passages, or writing_sentences change
  useEffect(() => {
    const channel = supabase
      .channel("homework-writing-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "homework" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["active-rt-homework-passage-ids"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "passages" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["passages-for-writing"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "writing_sentences" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["writing-sentences-all"] });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  // Fetch passages with grade/school info — only those with active RT homework
  const { data: passages = [], isLoading: isLoadingPassages } = useQuery({
    queryKey: ["passages-for-writing", ownerCodeId, shouldFilter, activeRtPassageIds],
    queryFn: async () => {
      if (activeRtPassageIds.length === 0) return [];

      let query = supabase
        .from("passages")
        .select(`
          id, title, sentences, korean_content, grade_id, school_id,
          grade:grade_id(id, name, school:school_id(id, name, logo_url))
        `)
        .in("id", activeRtPassageIds)
        .order("title");

      if (shouldFilter) query = query.eq("owner_code_id", ownerCodeId!);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as Passage[];
    },
    enabled: activeRtPassageIds.length > 0,
  });

  // Fetch existing writing_sentences
  const { data: writingSentences = [] } = useQuery({
    queryKey: ["writing-sentences-all", ownerCodeId, shouldFilter],
    enabled: isSessionReady,
    queryFn: async () => {
      let query = supabase
        .from("writing_sentences")
        .select("id, passage_id, sentence_index, english_sentence, korean_sentence");

      if (shouldFilter) query = query.eq("owner_code_id", ownerCodeId!);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as WritingSentence[];
    },
  });

  // Initialize partial overrides from DB (detect if stored sentence differs from full sentence)
  useEffect(() => {
    if (!passages.length || !writingSentences.length) return;
    const overrides: Record<string, Record<number, PartialOverride>> = {};
    
    writingSentences.forEach((ws) => {
      const passage = passages.find((p) => p.id === ws.passage_id);
      if (!passage) return;
      
      const fullEnglish = passage.sentences[ws.sentence_index] || "";
      const koreanLines = getKoreanLines(passage);
      const fullKorean = koreanLines[ws.sentence_index] || "";
      
      const isPartialEnglish = ws.english_sentence && ws.english_sentence !== fullEnglish;
      const isPartialKorean = ws.korean_sentence && ws.korean_sentence !== fullKorean && ws.korean_sentence !== `(해석 ${ws.sentence_index + 1})`;
      
      if (isPartialEnglish || isPartialKorean) {
        if (!overrides[ws.passage_id]) overrides[ws.passage_id] = {};
        overrides[ws.passage_id][ws.sentence_index] = {};
        if (isPartialEnglish) overrides[ws.passage_id][ws.sentence_index].english = ws.english_sentence;
        if (isPartialKorean) overrides[ws.passage_id][ws.sentence_index].korean = ws.korean_sentence;
      }
    });
    
    setPartialOverrides((prev) => {
      // Only set if there are DB-loaded overrides and no local overrides exist yet
      const merged = { ...overrides };
      Object.keys(prev).forEach((pid) => {
        merged[pid] = { ...merged[pid], ...prev[pid] };
      });
      return merged;
    });
  }, [passages, writingSentences]);

  // Group writing sentences by passage_id
  const sentencesByPassage = useMemo(() => {
    const map = new Map<string, WritingSentence[]>();
    writingSentences.forEach((ws) => {
      const list = map.get(ws.passage_id) || [];
      list.push(ws);
      map.set(ws.passage_id, list);
    });
    return map;
  }, [writingSentences]);

  // Group passages by school > grade
  const groupedData = useMemo(() => {
    const schools = new Map<string, {
      name: string;
      logo_url?: string | null;
      grades: Map<string, { name: string; passages: Passage[] }>;
    }>();

    passages.forEach((p) => {
      const schoolId = p.grade?.school?.id || "unknown";
      const schoolName = p.grade?.school?.name || "미지정";
      const gradeId = p.grade?.id || "unknown";
      const gradeName = p.grade?.name || "미지정";

      if (!schools.has(schoolId)) {
        schools.set(schoolId, { name: schoolName, logo_url: p.grade?.school?.logo_url, grades: new Map() });
      }
      const school = schools.get(schoolId)!;
      if (!school.grades.has(gradeId)) {
        school.grades.set(gradeId, { name: gradeName, passages: [] });
      }
      school.grades.get(gradeId)!.passages.push(p);
    });

    // 각 학년 내 지문 정렬: 과 번호순, Further Reading 등은 해당 과 마지막으로
    const suffixPatterns = /further\s*reading|futher\s*reading|read\s*more|dive\s*into\s*culture/i;
    const getLessonNum = (title: string) => {
      const m = title.match(/(\d+)\s*과/);
      return m ? parseInt(m[1], 10) : 9999;
    };
    schools.forEach((school) => {
      school.grades.forEach((grade) => {
        grade.passages.sort((a, b) => {
          const lessonDiff = getLessonNum(a.title) - getLessonNum(b.title);
          if (lessonDiff !== 0) return lessonDiff;
          const aIsSuffix = suffixPatterns.test(a.title) ? 1 : 0;
          const bIsSuffix = suffixPatterns.test(b.title) ? 1 : 0;
          if (aIsSuffix !== bIsSuffix) return aIsSuffix - bIsSuffix;
          return a.title.localeCompare(b.title, 'ko', { numeric: true });
        });
      });
    });

    return schools;
  }, [passages]);

  // 학교와 학년을 기본으로 펼쳐놓기
  useEffect(() => {
    if (groupedData.size > 0) {
      setExpandedSchools((prev) => {
        if (prev.size > 0) return prev;
        return new Set(groupedData.keys());
      });
      // Grades stay collapsed by default
    }
  }, [groupedData]);

  const getSelectedIndices = useCallback((passageId: string): Set<number> => {
    if (localSelections[passageId]) return localSelections[passageId];
    const existing = sentencesByPassage.get(passageId) || [];
    return new Set(existing.map((ws) => ws.sentence_index));
  }, [localSelections, sentencesByPassage]);

  const toggleSentence = (passageId: string, index: number) => {
    setLocalSelections((prev) => {
      const current = new Set(getSelectedIndices(passageId));
      if (current.has(index)) {
        current.delete(index);
        // Clear partial overrides when deselecting
        setPartialOverrides((po) => {
          const copy = { ...po };
          if (copy[passageId]) {
            const inner = { ...copy[passageId] };
            delete inner[index];
            copy[passageId] = inner;
          }
          return copy;
        });
      } else {
        current.add(index);
      }
      return { ...prev, [passageId]: current };
    });
    triggerAutoSave(passageId);
  };

  const selectAllSentences = (passageId: string, totalCount: number) => {
    setLocalSelections((prev) => ({
      ...prev,
      [passageId]: new Set(Array.from({ length: totalCount }, (_, i) => i)),
    }));
    triggerAutoSave(passageId);
  };

  const deselectAllSentences = (passageId: string) => {
    setLocalSelections((prev) => ({
      ...prev,
      [passageId]: new Set<number>(),
    }));
    // Clear all partial overrides for this passage
    setPartialOverrides((po) => {
      const copy = { ...po };
      delete copy[passageId];
      return copy;
    });
    triggerAutoSave(passageId);
  };

  const getKoreanLines = (passage: Passage): string[] => {
    if (!passage.korean_content) return [];
    const content = passage.korean_content.trim();
    const byNewline = content.split("\n").filter((l) => l.trim());
    if (byNewline.length >= passage.sentences.length) {
      return byNewline;
    }
    const sentenceRegex = /[^.]*?[.]/g;
    const matches = content.match(sentenceRegex);
    if (matches && matches.length > 0) {
      return matches.map(s => s.trim()).filter(s => s.length > 0);
    }
    return [content];
  };

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async ({ passage, selectedIndices, overrides }: { passage: Passage; selectedIndices: Set<number>; overrides?: Record<number, PartialOverride> }) => {
      setSavingPassageId(passage.id);
      const koreanLines = getKoreanLines(passage);

      const { error: delError } = await supabase
        .from("writing_sentences")
        .delete()
        .eq("passage_id", passage.id);
      if (delError) throw delError;

      if (selectedIndices.size > 0) {
        const rows = Array.from(selectedIndices).map((idx) => {
          const partial = overrides?.[idx];
          return {
            passage_id: passage.id,
            sentence_index: idx,
            english_sentence: partial?.english || passage.sentences[idx] || "",
            korean_sentence: partial?.korean || koreanLines[idx] || `(해석 ${idx + 1})`,
            owner_code_id: ownerCodeId || null,
          };
        });

        const { error: insError } = await supabase
          .from("writing_sentences")
          .insert(rows);
        if (insError) throw insError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["writing-sentences-all"] });
      setSavingPassageId(null);
    },
    onError: () => {
      toast.error("저장에 실패했습니다.");
      setSavingPassageId(null);
    },
  });

  // Auto-save: debounce per passage
  const autoSaveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const passagesRef = useRef(passages);
  passagesRef.current = passages;
  const localSelectionsRef = useRef(localSelections);
  localSelectionsRef.current = localSelections;
  const partialOverridesRef = useRef(partialOverrides);
  partialOverridesRef.current = partialOverrides;

  const triggerAutoSave = useCallback((passageId: string) => {
    if (autoSaveTimers.current[passageId]) {
      clearTimeout(autoSaveTimers.current[passageId]);
    }
    autoSaveTimers.current[passageId] = setTimeout(() => {
      const passage = passagesRef.current.find(p => p.id === passageId);
      if (!passage) return;
      const selectedIndices = localSelectionsRef.current[passageId] || new Set<number>();
      const overrides = partialOverridesRef.current[passageId];
      saveMutation.mutate({ passage, selectedIndices, overrides });
    }, 800);
  }, [saveMutation]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(autoSaveTimers.current).forEach(clearTimeout);
    };
  }, []);

  // Ctrl+1: toggle focused sentence / apply partial text selection
  const handleQuickToggle = useCallback(() => {
    const focused = focusedRef.current;
    if (!focused) return;
    const { passageId, idx, passage } = focused;

    // Check if user has text selected (highlighted)
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();

    if (selectedText && selection && selection.rangeCount > 0) {
      // Find which element the selection is in
      const anchorNode = selection.anchorNode;
      let container = anchorNode instanceof HTMLElement ? anchorNode : anchorNode?.parentElement;
      
      // Walk up to find the data-lang attribute
      let lang: string | null = null;
      let sentenceIdx: string | null = null;
      while (container) {
        lang = container.getAttribute?.("data-lang");
        sentenceIdx = container.getAttribute?.("data-sentence-idx");
        if (lang && sentenceIdx) break;
        container = container.parentElement;
      }

      if (lang && sentenceIdx !== null) {
        const sIdx = parseInt(sentenceIdx);
        
        // Ensure sentence is selected
        setLocalSelections((prev) => {
          const current = new Set(getSelectedIndices(passageId));
          current.add(sIdx);
          return { ...prev, [passageId]: current };
        });

        // Set partial override
        setPartialOverrides((prev) => {
          const passageOverrides = { ...prev[passageId] };
          const existing = passageOverrides[sIdx] || {};
          if (lang === "en") {
            passageOverrides[sIdx] = { ...existing, english: selectedText };
          } else if (lang === "ko") {
            passageOverrides[sIdx] = { ...existing, korean: selectedText };
          }
          return { ...prev, [passageId]: passageOverrides };
        });

        // Clear selection
        selection.removeAllRanges();

        // Auto-save
        setTimeout(() => {
          const currentSelected = getSelectedIndices(passageId);
          currentSelected.add(sIdx);
          const overridesForSave = { ...partialOverrides[passageId] };
          if (lang === "en") {
            overridesForSave[sIdx] = { ...overridesForSave[sIdx], english: selectedText };
          } else if (lang === "ko") {
            overridesForSave[sIdx] = { ...overridesForSave[sIdx], korean: selectedText };
          }
          saveMutation.mutate({ passage, selectedIndices: currentSelected, overrides: overridesForSave });
        }, 50);

        toast.success(`${lang === "en" ? "영어" : "한글"} 부분 출제 설정 완료`);
        return;
      }
    }

    // No text selected: toggle entire sentence (existing behavior)
    setLocalSelections((prev) => {
      const current = new Set(getSelectedIndices(passageId));
      if (current.has(idx)) {
        current.delete(idx);
        // Clear partial overrides
        setPartialOverrides((po) => {
          const copy = { ...po };
          if (copy[passageId]) {
            const inner = { ...copy[passageId] };
            delete inner[idx];
            copy[passageId] = inner;
          }
          return copy;
        });
      } else {
        current.add(idx);
      }
      const updated = { ...prev, [passageId]: current };
      setTimeout(() => {
        saveMutation.mutate({ passage, selectedIndices: current, overrides: partialOverrides[passageId] });
      }, 0);
      return updated;
    });
  }, [getSelectedIndices, saveMutation, partialOverrides]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "1") {
        e.preventDefault();
        handleQuickToggle();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleQuickToggle]);

  const toggleSchool = (id: string) => {
    setExpandedSchools((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleGrade = (id: string) => {
    setExpandedGrades((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const togglePassage = (id: string) => {
    setExpandedPassages((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const totalAssigned = writingSentences.length;
  const passagesWithSentences = new Set(writingSentences.map((ws) => ws.passage_id)).size;

  const hasChanges = (passageId: string): boolean => {
    if (!localSelections[passageId]) return false;
    const dbSet = new Set((sentencesByPassage.get(passageId) || []).map((ws) => ws.sentence_index));
    const localSet = localSelections[passageId];
    if (dbSet.size !== localSet.size) return true;
    for (const idx of localSet) {
      if (!dbSet.has(idx)) return true;
    }
    // Check if partial overrides changed
    if (partialOverrides[passageId]) {
      for (const idx of localSet) {
        const override = partialOverrides[passageId]?.[idx];
        if (override) return true;
      }
    }
    return false;
  };

  // Helper: render text with partial highlight
  const renderTextWithHighlight = (fullText: string, partialText: string | undefined) => {
    if (!partialText || partialText === fullText) {
      return <span>{fullText}</span>;
    }
    const startIdx = fullText.indexOf(partialText);
    if (startIdx === -1) {
      return (
        <span>
          <span className="bg-primary/15 text-primary font-medium rounded px-0.5">{partialText}</span>
          <span className="text-muted-foreground/40 line-through ml-1 text-xs">(일부 출제)</span>
        </span>
      );
    }
    const before = fullText.substring(0, startIdx);
    const after = fullText.substring(startIdx + partialText.length);
    return (
      <span>
        {before && <span className="text-muted-foreground/50">{before}</span>}
        <span className="bg-primary/15 text-primary font-medium rounded px-0.5">{partialText}</span>
        {after && <span className="text-muted-foreground/50">{after}</span>}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        icon={PenLine}
        title="서술형 연습"
        description={`${passagesWithSentences}개 지문에서 ${totalAssigned}개 문장 출제 중`}
        showDate={false}
      />

      <div className="flex items-start gap-2 px-4 py-3 rounded-lg bg-primary/5 border border-primary/10 text-xs text-muted-foreground leading-relaxed">
        <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <p>
          <span className="font-semibold text-foreground">💡 부분 출제 팁:</span>{" "}
          문장에서 원하는 부분(영어 또는 한글)을 <span className="font-medium text-foreground">드래그로 블록 지정</span>한 후{" "}
          <kbd className="inline-flex items-center px-1.5 py-0.5 rounded bg-muted border border-border text-[11px] font-mono font-semibold text-foreground">Ctrl+1</kbd>을 누르면 해당 부분만 출제할 수 있습니다.
        </p>
      </div>


      {isLoadingPassages ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : passages.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <BookOpen className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
            <h3 className="font-semibold text-lg mb-1">등록된 지문이 없습니다</h3>
            <p className="text-sm text-muted-foreground">
              지문관리에서 먼저 지문을 추가해주세요.<br />
              추가된 지문의 문장을 영작과제로 출제할 수 있습니다.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {Array.from(groupedData.entries()).map(([schoolId, school], schoolIndex) => {
            const isSchoolExpanded = expandedSchools.has(schoolId);
            const schoolPassageCount = Array.from(school.grades.values()).reduce(
              (acc, g) => acc + g.passages.length, 0
            );
            const schoolAssignedCount = Array.from(school.grades.values()).reduce(
              (acc, g) => acc + g.passages.filter((p) => sentencesByPassage.has(p.id)).length, 0
            );


            return (
              <div key={schoolId} className="rounded-xl border bg-card shadow-sm overflow-hidden">
                {/* School Header */}
                <button
                  onClick={() => toggleSchool(schoolId)}
                  className="w-full flex items-center justify-between px-5 py-3 bg-muted/30 hover:bg-muted/50 border-b transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isSchoolExpanded ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                    {school.logo_url ? (
                      <img src={cacheBustUrl(school.logo_url)} alt={school.name} className="w-5 h-5 rounded-full object-cover" />
                    ) : (
                      <School className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className="font-semibold text-foreground">{school.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs text-muted-foreground border-border">
                      {schoolPassageCount}개 지문
                    </Badge>
                    {schoolAssignedCount > 0 && (
                      <Badge variant="outline" className="text-xs text-primary border-primary/30 bg-primary/5">
                        <CheckCircle2 className="w-3 h-3 mr-1 shrink-0" strokeWidth={1.75} />
                        {schoolAssignedCount}개 출제 중
                      </Badge>
                    )}
                    {schoolAssignedCount > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-3 text-xs font-semibold rounded-md"
                        onClick={(e) => {
                          e.stopPropagation();
                          const examGrades = Array.from(school.grades.entries())
                            .map(([, grade]) => ({
                              name: grade.name,
                              passages: grade.passages
                                .filter((p) => sentencesByPassage.has(p.id))
                                .map((p) => {
                                  const ws = sentencesByPassage.get(p.id) || [];
                                  return {
                                    title: p.title,
                                    sentences: ws
                                      .sort((a, b) => a.sentence_index - b.sentence_index)
                                      .map((s) => ({
                                        index: s.sentence_index,
                                        korean: s.korean_sentence,
                                        english: s.english_sentence,
                                        fullEnglish: p.sentences[s.sentence_index] || s.english_sentence,
                                      })),
                                  };
                                })
                                .filter((p) => p.sentences.length > 0),
                            }))
                            .filter((g) => g.passages.length > 0);
                          generateExamDocx(school.name, examGrades, school.logo_url || undefined);
                          toast.success("시험지 다운로드를 시작합니다!");
                        }}
                      >
                        <Download className="w-4 h-4 mr-1 shrink-0" strokeWidth={1.75} />
                        시험지 다운로드
                      </Button>
                    )}
                  </div>
                </button>

                {isSchoolExpanded && (
                  <div className="divide-y">
                    {Array.from(school.grades.entries()).map(([gradeId, grade]) => {
                      const isGradeExpanded = expandedGrades.has(gradeId);
                      const gradeAssigned = grade.passages.filter((p) => sentencesByPassage.has(p.id)).length;

                      return (
                        <div key={gradeId}>
                          {/* Grade Header */}
                          <button
                            onClick={() => toggleGrade(gradeId)}
                            className="w-full flex items-center justify-between px-5 py-3 bg-muted/30 hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              {isGradeExpanded ? (
                                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                              )}
                              <GraduationCap className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium text-sm">{grade.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">{grade.passages.length}개 지문</span>
                              {gradeAssigned > 0 && (
                                <Badge variant="outline" className="text-xs text-primary border-primary/30">
                                  {gradeAssigned}개 출제
                                </Badge>
                              )}
                            </div>
                          </button>

                          {isGradeExpanded && (
                            <div className="px-4 py-3 space-y-3">
                              {grade.passages.map((passage, passageIdx) => {
                                const isPassageExpanded = expandedPassages.has(passage.id);
                                const existingCount = (sentencesByPassage.get(passage.id) || []).length;
                                const selectedIndices = getSelectedIndices(passage.id);
                                const koreanLines = getKoreanLines(passage);
                                const changed = hasChanges(passage.id);
                                const passageOverrides = partialOverrides[passage.id] || {};

                                return (
                                  <div
                                    key={passage.id}
                                    className={`rounded-lg border transition-colors ${
                                      existingCount > 0 ? "border-primary/20 bg-primary/[0.02]" : "bg-card"
                                    }`}
                                  >
                                    {/* Passage Header */}
                                    <button
                                      onClick={() => togglePassage(passage.id)}
                                      className="w-full flex items-center justify-between px-4 py-3 bg-muted/60 hover:bg-muted/80 rounded-lg transition-colors"
                                    >
                                      <div className="flex items-center gap-2.5">
                                        {isPassageExpanded ? (
                                          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                                        ) : (
                                          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                                        )}
                                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                                          {passageIdx + 1}
                                        </span>
                                        <span className="font-medium text-sm">{passage.title}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">
                                          {passage.sentences.length}문장
                                        </span>
                                        {existingCount > 0 && (
                                          <Badge className={`text-[10px] border-0 ${
                                            existingCount >= passage.sentences.length
                                              ? "bg-green-100 text-green-700"
                                              : "bg-primary/10 text-primary"
                                          }`}>
                                            <Check className="w-3 h-3 mr-0.5" />
                                            {existingCount}개 출제
                                          </Badge>
                                        )}
                                      </div>
                                    </button>

                                    {/* Passage Sentences */}
                                    {isPassageExpanded && (
                                      <div className="px-4 pb-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-7 text-xs"
                                              onClick={() => selectAllSentences(passage.id, passage.sentences.length)}
                                            >
                                              전체 선택
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-7 text-xs"
                                              onClick={() => deselectAllSentences(passage.id)}
                                            >
                                              전체 해제
                                            </Button>
                                            <span className="text-xs text-muted-foreground">
                                              {selectedIndices.size}/{passage.sentences.length} 선택
                                            </span>
                                          </div>
                                          {savingPassageId === passage.id ? (
                                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                              <Loader2 className="w-3 h-3 animate-spin" />
                                              저장 중...
                                            </span>
                                          ) : changed ? (
                                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                              <Loader2 className="w-3 h-3 animate-spin opacity-50" />
                                              자동 저장 대기
                                            </span>
                                          ) : null}
                                        </div>

                                        {/* Sentence List */}
                                        <div className="space-y-1.5">
                                          {passage.sentences.map((sentence, idx) => {
                                            const isSelected = selectedIndices.has(idx);
                                            const korean = koreanLines[idx] || "";
                                            const override = passageOverrides[idx];
                                            const hasPartial = override && (override.english || override.korean);

                                            return (
                                              <label
                                                key={idx}
                                                onClick={() => setFocusedSentence({ passageId: passage.id, idx, passage })}
                                                className={`flex items-start gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-colors ${
                                                  isSelected
                                                    ? "bg-primary/5 border border-primary/20"
                                                    : "hover:bg-muted/50 border border-transparent"
                                                } ${
                                                  focusedSentence?.passageId === passage.id && focusedSentence?.idx === idx
                                                    ? "ring-2 ring-primary/40"
                                                    : ""
                                                }`}
                                              >
                                                <Checkbox
                                                  checked={isSelected}
                                                  onCheckedChange={() => toggleSentence(passage.id, idx)}
                                                  className="mt-0.5"
                                                />
                                                <div className="flex-1 min-w-0">
                                                  <p
                                                    className="text-sm leading-relaxed select-text cursor-default"
                                                    data-lang="en"
                                                    data-sentence-idx={idx}
                                                  >
                                                    {isSelected && override?.english
                                                      ? renderTextWithHighlight(sentence, override.english)
                                                      : sentence}
                                                  </p>
                                                  {korean && (
                                                    <p
                                                      className="text-xs text-muted-foreground mt-0.5 select-text cursor-default"
                                                      data-lang="ko"
                                                      data-sentence-idx={idx}
                                                    >
                                                      {isSelected && override?.korean
                                                        ? renderTextWithHighlight(korean, override.korean)
                                                        : korean}
                                                    </p>
                                                  )}
                                                </div>
                                                <div className="flex flex-col items-end gap-0.5 flex-shrink-0 mt-1">
                                                  <span className="text-[10px] text-muted-foreground/50">
                                                    #{idx + 1}
                                                  </span>
                                                  {hasPartial && isSelected && (
                                                    <Badge variant="outline" className="text-[8px] px-1 py-0 border-primary/30 text-primary">
                                                      일부
                                                    </Badge>
                                                  )}
                                                  {focusedSentence?.passageId === passage.id && focusedSentence?.idx === idx && (
                                                    <span className="text-[8px] px-1 py-0.5 rounded bg-muted text-muted-foreground whitespace-nowrap">
                                                      Ctrl+1
                                                    </span>
                                                  )}
                                                </div>
                                              </label>
                                            );
                                          })}
                                        </div>

                                        {!koreanLines.length && (
                                          <p className="text-xs text-amber-600 bg-amber-50 rounded-md px-3 py-2">
                                            ⚠️ 한글 해석이 없습니다. 지문관리에서 한글 해석을 추가하면 학생에게 한글→영어 퀴즈가 제공됩니다.
                                          </p>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
