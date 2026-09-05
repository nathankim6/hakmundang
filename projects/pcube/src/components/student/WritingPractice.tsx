import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, RotateCcw, PenLine, X, ChevronLeft, ChevronRight, Sparkles, Hash, Trophy } from "lucide-react";

interface WritingPracticeProps {
  gradeId: string;
  onClose: () => void;
}

const ABBREVIATIONS = /^(mr|ms|mrs|dr|st|mt|jr|sr|ave|blvd|etc|a\.m|p\.m|u\.s|u\.k|i\.e|e\.g)\.?$/i;

function stripPunctuation(word: string): string {
  if (ABBREVIATIONS.test(word)) return word;
  let result = word.replace(/^["""''`,;:!?.()\[\]{}]+/, "");
  result = result.replace(/["""''`,;:!?()\[\]{}]+$/, "");
  if (result.endsWith(".") && !ABBREVIATIONS.test(result)) {
    result = result.replace(/\.+$/, "");
  }
  return result || word;
}

function renderHighlightedText(fullText: string, partialText: string, type: "english" | "korean") {
  const trimmedPartial = partialText.trim();
  const startIdx = fullText.indexOf(trimmedPartial);
  if (startIdx === -1) return fullText;
  
  const prefix = fullText.substring(0, startIdx);
  const highlighted = fullText.substring(startIdx, startIdx + trimmedPartial.length);
  const suffix = fullText.substring(startIdx + trimmedPartial.length);
  
  return (
    <>
      {prefix && <span className="text-muted-foreground/40">{prefix}</span>}
      <span className="text-primary font-semibold bg-primary/5 px-0.5 rounded">{highlighted}</span>
      {suffix && <span className="text-muted-foreground/40">{suffix}</span>}
    </>
  );
}

export function WritingPractice({ gradeId, onClose }: WritingPracticeProps) {
  const { data: writingSentences = [], isLoading } = useQuery({
    queryKey: ["writing-practice-sentences", gradeId],
    queryFn: async () => {
      const { data: passages, error: pErr } = await supabase
        .from("passages")
        .select("id, title, sentences, korean_content")
        .eq("grade_id", gradeId);
      if (pErr) throw pErr;
      if (!passages?.length) return [];

      const sortedPassages = [...passages].sort((a, b) => {
        const numA = parseInt(a.title.match(/#(\d+)$/)?.[1] || "0");
        const numB = parseInt(b.title.match(/#(\d+)$/)?.[1] || "0");
        return numA - numB;
      });

      const { data, error } = await supabase
        .from("writing_sentences")
        .select("*")
        .in("passage_id", sortedPassages.map((p) => p.id))
        .order("sentence_index", { ascending: true });
      if (error) throw error;

      const passageOrder = new Map(sortedPassages.map((p, i) => [p.id, i]));
      const sorted = [...(data || [])].sort((a, b) => {
        const orderA = passageOrder.get(a.passage_id) ?? 999;
        const orderB = passageOrder.get(b.passage_id) ?? 999;
        if (orderA !== orderB) return orderA - orderB;
        return a.sentence_index - b.sentence_index;
      });

      return sorted.map((ws) => {
        const passage = sortedPassages.find((p) => p.id === ws.passage_id);
        const fullEnglish = passage?.sentences?.[ws.sentence_index] || ws.english_sentence;
        const koreanLines = passage?.korean_content?.split("\n").map((s: string) => s.trim()).filter(Boolean) || [];
        const fullKorean = koreanLines[ws.sentence_index] || ws.korean_sentence || "";
        const korean = ws.korean_sentence?.trim() || fullKorean;
        const isPartial = ws.english_sentence.trim() !== fullEnglish.trim() && fullEnglish.includes(ws.english_sentence.trim());
        const isPartialKorean = korean !== fullKorean && fullKorean.includes(korean);
        return {
          ...ws,
          korean_sentence: korean,
          full_english: fullEnglish,
          full_korean: fullKorean,
          is_partial: isPartial,
          is_partial_korean: isPartialKorean,
        };
      });
    },
    enabled: !!gradeId,
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);
  const [wrongIndex, setWrongIndex] = useState<number | null>(null);
  const [confirmedCorrect, setConfirmedCorrect] = useState<Set<number>>(new Set());

  const currentSentence = writingSentences[currentIndex];
  const correctWords = useMemo(
    () => currentSentence?.english_sentence?.split(" ").map(stripPunctuation) || [],
    [currentSentence?.id]
  );

  useEffect(() => {
    if (!currentSentence) return;
    const words = currentSentence.english_sentence.split(" ").map(stripPunctuation);
    const remaining = words.slice(1);
    const shuffled = [...remaining].sort(() => Math.random() - 0.5);
    setAvailableWords(shuffled);
    setSelectedWords([]);
    setIsCorrect(false);
    setWrongIndex(null);
    setConfirmedCorrect(new Set());
  }, [currentSentence?.id]);

  const handleWordClick = (word: string, index: number) => {
    const nextSelected = [...selectedWords, word];
    const posIndex = nextSelected.length;

    if (correctWords[posIndex] === word) {
      const nextAvailable = availableWords.filter((_, i) => i !== index);
      setSelectedWords(nextSelected);
      setAvailableWords(nextAvailable);
      setWrongIndex(null);
      setConfirmedCorrect((prev) => new Set([...prev, posIndex]));

      if (nextSelected.length + 1 === correctWords.length) {
        setIsCorrect(true);
        setCorrectCount((c) => c + 1);
      }
    } else {
      setWrongIndex(posIndex);
      setSelectedWords(nextSelected);
      setTimeout(() => {
        setSelectedWords((prev) => prev.slice(0, -1));
        setWrongIndex(null);
      }, 600);
    }
  };

  const handleSelectedWordClick = (word: string, index: number) => {
    if (isCorrect) return;
    if (index !== selectedWords.length - 1) return;
    setAvailableWords([...availableWords, word]);
    setSelectedWords(selectedWords.filter((_, i) => i !== index));
    setConfirmedCorrect((prev) => {
      const next = new Set(prev);
      next.delete(index + 1);
      return next;
    });
  };

  const handleReset = () => {
    if (!currentSentence) return;
    const words = currentSentence.english_sentence.split(" ").map(stripPunctuation);
    const remaining = words.slice(1);
    const shuffled = [...remaining].sort(() => Math.random() - 0.5);
    setAvailableWords(shuffled);
    setSelectedWords([]);
    setIsCorrect(false);
    setWrongIndex(null);
    setConfirmedCorrect(new Set());
  };

  const goToPrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const goToNext = () => {
    if (currentIndex < writingSentences.length - 1) setCurrentIndex(currentIndex + 1);
  };

  if (isLoading) {
    return (
      <div className="text-center py-16">
        <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-muted-foreground font-medium">문장을 불러오는 중...</p>
      </div>
    );
  }

  if (writingSentences.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-12 h-12 rounded-xl bg-muted/30 flex items-center justify-center mx-auto mb-3">
          <PenLine className="w-6 h-6 text-muted-foreground/30" />
        </div>
        <p className="text-muted-foreground text-xs font-medium">배정된 연습 문장이 없습니다.</p>
      </div>
    );
  }

  const progress = Math.round((correctCount / writingSentences.length) * 100);

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <PenLine className="w-3.5 h-3.5 text-primary" />
          </div>
          <div className="leading-none">
            <span className="text-[13px] font-bold text-foreground">서술형 연습</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs tabular-nums font-semibold text-muted-foreground bg-muted/40 rounded-md px-2 py-1 border border-border/40">
            <Trophy className="w-3 h-3 text-amber-500" />
            <span className="text-foreground">{correctCount}</span>
            <span className="text-muted-foreground/50">/</span>
            <span>{writingSentences.length}</span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted/60 transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="mx-1 h-1 bg-muted/40 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary/70 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-1.5 px-1">
        <Button
          variant="outline"
          size="icon"
          onClick={goToPrev}
          disabled={currentIndex === 0}
          className="h-8 w-8 rounded-lg border-border/40 shrink-0"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </Button>

        <Select
          value={String(currentIndex)}
          onValueChange={(val) => setCurrentIndex(Number(val))}
        >
          <SelectTrigger className="flex-1 min-w-0 bg-card border-border/40 rounded-lg h-8 text-xs font-medium">
            <span className="truncate block text-left">{currentIndex + 1}. {currentSentence?.korean_sentence || currentSentence?.english_sentence || "문장 선택"}</span>
          </SelectTrigger>
          <SelectContent className="bg-popover z-50 max-h-[280px] rounded-lg border-border/40 w-[min(90vw,400px)]">
            {writingSentences.map((ws, idx) => (
              <SelectItem key={ws.id} value={String(idx)} className="rounded-md text-xs">
                <span className="whitespace-normal break-words leading-snug">
                  {idx + 1}. {ws.is_partial ? `⚡ ` : ""}{ws.korean_sentence || ws.english_sentence}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="icon"
          onClick={goToNext}
          disabled={currentIndex >= writingSentences.length - 1}
          className="h-8 w-8 rounded-lg border-border/40 shrink-0"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </Button>
      </div>

      {currentSentence && (
        <div className={`rounded-xl border overflow-hidden transition-all duration-300 ${
          isCorrect
            ? "border-emerald-200 dark:border-emerald-800/50 ring-1 ring-emerald-100 dark:ring-emerald-900/30"
            : "border-border/50"
        }`}>
          {/* Question */}
          <div className={`px-5 py-4 transition-colors duration-300 ${
            isCorrect ? "bg-emerald-50/40 dark:bg-emerald-950/15" : "bg-gradient-to-br from-primary/[0.03] to-transparent"
          }`}>
            <div className="flex items-center gap-2 mb-2.5">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                {currentIndex + 1}
              </span>
              <span className="text-[11px] text-muted-foreground/40 font-medium">/ {writingSentences.length}</span>
            </div>
            <p className="text-[15px] font-medium text-foreground leading-[1.8] break-words tracking-tight">
              {currentSentence.is_partial_korean && currentSentence.full_korean ? (
                renderHighlightedText(currentSentence.full_korean, currentSentence.korean_sentence, "korean")
              ) : (
                currentSentence.korean_sentence || "(한글 해석 없음)"
              )}
            </p>
          </div>

          {/* Answer Area */}
          <div className={`px-5 py-4 border-t transition-colors duration-300 ${
            isCorrect
              ? "bg-emerald-50/20 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/30"
              : "bg-card border-border/20"
          }`}>
            <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.15em] mb-3 block">Answer</span>
            <div className="min-h-[44px] flex flex-wrap gap-x-2 gap-y-2 items-baseline break-words">
              {/* Full sentence context: prefix (gray) + quiz area + suffix (gray) */}
              {currentSentence.is_partial && currentSentence.full_english ? (
                <>
                  {(() => {
                    const full = currentSentence.full_english;
                    const partial = currentSentence.english_sentence.trim();
                    const startIdx = full.indexOf(partial);
                    const prefix = startIdx > 0 ? full.substring(0, startIdx).trim() : "";
                    const suffix = full.substring(startIdx + partial.length).trim();
                    return (
                      <>
                        {prefix && (
                          <span className="text-[15px] text-muted-foreground/50 font-medium">{prefix}</span>
                        )}
                        {/* Hint word */}
                        {correctWords[0] && (
                          <span className={`text-[15px] font-bold transition-colors duration-300 ${
                            isCorrect ? "text-emerald-600 dark:text-emerald-400" : "text-primary"
                          }`}>
                            {correctWords[0]}
                          </span>
                        )}
                        {selectedWords.length === 0 && !isCorrect ? (
                          <span className="text-xs text-muted-foreground/30 italic ml-1">나머지를 완성하세요</span>
                        ) : (
                          selectedWords.map((word, idx) => {
                            const isWrong = wrongIndex === idx + 1;
                            const isConfirmed = confirmedCorrect.has(idx + 1);
                            return (
                              <button
                                key={`sel-${idx}`}
                                onClick={() => handleSelectedWordClick(word, idx)}
                                disabled={isCorrect}
                                className={`text-[15px] font-medium transition-all duration-200 ${
                                  isWrong
                                    ? "text-red-500 line-through animate-shake scale-95"
                                    : isCorrect
                                      ? "text-emerald-600 dark:text-emerald-400"
                                      : isConfirmed
                                        ? "text-emerald-600 dark:text-emerald-400"
                                        : "text-foreground underline decoration-primary/20 decoration-dashed underline-offset-4 hover:decoration-primary/50 cursor-pointer"
                                }`}
                              >
                                {word}
                              </button>
                            );
                          })
                        )}
                        {!isCorrect && selectedWords.length > 0 && availableWords.length > 0 && (
                          <span className="text-sm text-muted-foreground/15">___</span>
                        )}
                        {suffix && (
                          <span className="text-[15px] text-muted-foreground/50 font-medium">{suffix}</span>
                        )}
                      </>
                    );
                  })()}
                </>
              ) : (
                <>
                  {/* Original non-partial behavior */}
                  {correctWords[0] && (
                    <span className={`text-[15px] font-bold transition-colors duration-300 ${
                      isCorrect ? "text-emerald-600 dark:text-emerald-400" : "text-primary"
                    }`}>
                      {correctWords[0]}
                    </span>
                  )}
                  {selectedWords.length === 0 && !isCorrect ? (
                    <span className="text-xs text-muted-foreground/30 italic ml-1">나머지를 완성하세요</span>
                  ) : (
                    selectedWords.map((word, idx) => {
                      const isWrong = wrongIndex === idx + 1;
                      const isConfirmed = confirmedCorrect.has(idx + 1);
                      return (
                        <button
                          key={`sel-${idx}`}
                          onClick={() => handleSelectedWordClick(word, idx)}
                          disabled={isCorrect}
                          className={`text-[15px] font-medium transition-all duration-200 ${
                            isWrong
                              ? "text-red-500 line-through animate-shake scale-95"
                              : isCorrect
                                ? "text-emerald-600 dark:text-emerald-400"
                                : isConfirmed
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-foreground underline decoration-primary/20 decoration-dashed underline-offset-4 hover:decoration-primary/50 cursor-pointer"
                          }`}
                        >
                          {word}
                        </button>
                      );
                    })
                  )}
                  {!isCorrect && selectedWords.length > 0 && availableWords.length > 0 && (
                    <span className="text-sm text-muted-foreground/15">___</span>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Word Bank */}
          {!isCorrect && availableWords.length > 0 && (
            <div className="px-5 py-4 bg-gradient-to-b from-muted/10 to-muted/5 border-t border-border/15">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.15em]">Word Bank</span>
                <div className="h-px flex-1 bg-border/15" />
                <span className="text-[10px] text-muted-foreground/35">첫단어 <span className="font-semibold text-primary/60">{correctWords[0]}</span></span>
              </div>
              <div className="flex flex-wrap gap-2">
                {availableWords.map((word, idx) => (
                  <button
                    key={`avail-${idx}`}
                    onClick={() => handleWordClick(word, idx)}
                    disabled={wrongIndex !== null}
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-card text-foreground border border-border/40
                      shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_3px_8px_rgba(0,0,0,0.08)] hover:border-primary/30 hover:-translate-y-0.5
                      active:scale-[0.96] transition-all duration-150 cursor-pointer
                      disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0"
                  >
                    {word}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Success */}
          {isCorrect && (
            <div className="px-5 py-4 bg-gradient-to-r from-emerald-50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/10 border-t border-emerald-200/50 dark:border-emerald-800/30 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_2px_8px_rgba(16,185,129,0.3)]">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">정답!</span>
                    <span className="text-[10px] text-emerald-500/60 dark:text-emerald-400/50 ml-2">Well done 🎉</span>
                  </div>
                </div>
                {currentIndex < writingSentences.length - 1 && (
                  <Button
                    size="sm"
                    onClick={goToNext}
                    className="rounded-xl h-8 px-4 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_2px_8px_rgba(16,185,129,0.25)] hover:shadow-[0_4px_12px_rgba(16,185,129,0.35)] transition-all duration-200"
                  >
                    다음
                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Bottom Bar */}
          <div className="px-3 py-2 bg-muted/5 border-t border-border/20 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={goToPrev}
              disabled={currentIndex === 0}
              className="rounded-lg text-[11px] font-medium h-7 px-2 text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="w-3 h-3 mr-0.5" />
              이전
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="rounded-lg text-[11px] font-medium h-7 px-2 text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="w-2.5 h-2.5 mr-1" />
              초기화
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={goToNext}
              disabled={currentIndex >= writingSentences.length - 1}
              className="rounded-lg text-[11px] font-medium h-7 px-2 text-muted-foreground hover:text-foreground"
            >
              다음
              <ChevronRight className="w-3 h-3 ml-0.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
