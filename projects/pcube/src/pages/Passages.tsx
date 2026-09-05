import { useState, useMemo, useCallback } from "react"; // v3
import { useOwnerFilter } from "@/hooks/useOwnerFilter";
import { Plus, Search, BookOpen, MoreVertical, Edit, ChevronDown, Trash2, Languages, Loader2, RefreshCw, CheckCheck } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RTSubmissionStatus } from "@/components/passages/RTSubmissionStatus";
import { BulkAddPassagesDialog } from "@/components/passages/BulkAddPassagesDialog";
import { supabase } from "@/integrations/supabase/client";
import { cacheBustUrl } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { format } from "date-fns";
import { PageHeader } from "@/components/layout/PageHeader";

export default function Passages() {
  const queryClient = useQueryClient();
  const { ownerCodeId, shouldFilter } = useOwnerFilter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isBulkAddDialogOpen, setIsBulkAddDialogOpen] = useState(false);
  const [viewPassage, setViewPassage] = useState<any>(null);
  const [editPassage, setEditPassage] = useState<any>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editKoreanContent, setEditKoreanContent] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translateProgress, setTranslateProgress] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [isRetranslating, setIsRetranslating] = useState(false);
  const [retranslateProgress, setRetranslateProgress] = useState("");

  const handleRetranslateKoreanTone = useCallback(async () => {
    setIsRetranslating(true);
    setRetranslateProgress("어조 변환 시작...");
    try {
      let offset = 0;
      let totalUpdated = 0;
      let done = false;

      while (!done) {
        setRetranslateProgress(`처리 중... (${totalUpdated}개 수정됨)`);
        const { data, error } = await supabase.functions.invoke("retranslate-korean-tone", {
          body: { batchSize: 20, offset },
        });

        if (error) throw error;
        if (data.error) throw new Error(data.error);

        totalUpdated += data.updated || 0;
        done = data.done;
        offset = data.nextOffset || offset + 20;

        if (!done) {
          await new Promise(r => setTimeout(r, 500));
        }
      }

      toast.success(`${totalUpdated}개 문장의 어조가 "~했다/~이다" 체로 수정되었습니다.`);
      queryClient.invalidateQueries({ queryKey: ["writing_sentences_all"] });
      queryClient.invalidateQueries({ queryKey: ["writing-sentences-all"] });
      queryClient.invalidateQueries({ queryKey: ["passages"] });
    } catch (err: any) {
      console.error("Retranslate tone error:", err);
      toast.error("어조 변환 중 오류: " + (err.message || "알 수 없는 오류"));
    } finally {
      setIsRetranslating(false);
      setRetranslateProgress("");
    }
  }, [queryClient]);

  const handleSyncWritingSentences = useCallback(async () => {
    setIsSyncing(true);
    try {
      const { data: allPassages } = await supabase
        .from("passages")
        .select("id, sentences, korean_content, owner_code_id")
        .not("korean_content", "is", null)
        .neq("korean_content", "");

      if (!allPassages || allPassages.length === 0) {
        toast.info("번역된 지문이 없습니다.");
        return;
      }

      let synced = 0;
      for (const p of allPassages) {
        const sentences = (p.sentences as string[]) || [];
        const koreanLines = (p.korean_content || "").split("\n");
        if (sentences.length === 0) continue;

        await supabase.from("writing_sentences").delete().eq("passage_id", p.id);

        const rows = sentences.map((eng, idx) => ({
          passage_id: p.id,
          sentence_index: idx,
          english_sentence: eng.trim(),
          korean_sentence: (koreanLines[idx] || "").trim(),
          owner_code_id: p.owner_code_id,
        }));

        await supabase.from("writing_sentences").insert(rows);
        synced++;
      }

      toast.success(`${synced}개 지문의 서술형 연습 데이터가 동기화되었습니다.`);
      queryClient.invalidateQueries({ queryKey: ["writing_sentences_all"] });
      queryClient.invalidateQueries({ queryKey: ["writing-sentences-all"] });
    } catch (err: any) {
      console.error("sync error:", err);
      toast.error("동기화 중 오류가 발생했습니다.");
    } finally {
      setIsSyncing(false);
    }
  }, [queryClient]);

  const handleBulkTranslate = useCallback(async () => {
    setIsTranslating(true);
    setTranslateProgress("번역 시작 중...");
    let offset = 0;
    const batchSize = 3;
    let totalTranslated = 0;

    try {
      while (true) {
        setTranslateProgress(`번역 중... (${totalTranslated}개 완료)`);
        const response = await supabase.functions.invoke("translate-passages", {
          body: { batchSize, offset },
        });

        if (response.error) throw new Error(response.error.message);
        const result = response.data;

        if (result.error) throw new Error(result.error);

        totalTranslated += result.translated || 0;

        if (result.done) {
          toast.success(`번역 완료! 총 ${totalTranslated}개 지문이 번역되었습니다.`);
          break;
        }

        if (result.translated === 0 && result.remaining > 0) {
          setTranslateProgress(`속도 제한 감지. 10초 후 재시도... (${totalTranslated}개 완료)`);
          await new Promise(r => setTimeout(r, 10000));
        }

        offset = result.nextOffset || offset + batchSize;
        await new Promise(r => setTimeout(r, 2000));
      }

      // Sync korean translations to writing_sentences
      if (totalTranslated > 0) {
        setTranslateProgress("서술형 연습 데이터 동기화 중...");
        try {
          const { data: allPassages } = await supabase
            .from("passages")
            .select("id, sentences, korean_content, owner_code_id")
            .not("korean_content", "is", null)
            .neq("korean_content", "");

          if (allPassages && allPassages.length > 0) {
            for (const p of allPassages) {
              const sentences = (p.sentences as string[]) || [];
              const koreanLines = (p.korean_content || "").split("\n");
              if (sentences.length === 0) continue;

              // Delete existing writing_sentences for this passage
              await supabase.from("writing_sentences").delete().eq("passage_id", p.id);

              // Insert new ones
              const rows = sentences.map((eng, idx) => ({
                passage_id: p.id,
                sentence_index: idx,
                english_sentence: eng.trim(),
                korean_sentence: (koreanLines[idx] || "").trim(),
                owner_code_id: p.owner_code_id,
              }));

              await supabase.from("writing_sentences").insert(rows);
            }
            toast.success("서술형 연습 데이터도 동기화되었습니다.");
          }
        } catch (syncErr: any) {
          console.error("writing_sentences sync error:", syncErr);
          toast.error("서술형 연습 동기화 중 오류가 발생했습니다.");
        }
      }
    } catch (err: any) {
      toast.error(`번역 중 오류: ${err.message}`);
    } finally {
      setIsTranslating(false);
      setTranslateProgress("");
      queryClient.invalidateQueries({ queryKey: ["passages"] });
      queryClient.invalidateQueries({ queryKey: ["writing_sentences_all"] });
      queryClient.invalidateQueries({ queryKey: ["writing-sentences-all"] });
    }
  }, [queryClient]);

  // Fetch schools
  const { data: schools = [] } = useQuery({
    queryKey: ["schools", ownerCodeId, shouldFilter],
    queryFn: async () => {
      let query = supabase.from("schools").select("*").order("name");
      if (shouldFilter) query = query.eq("owner_code_id", ownerCodeId!);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Fetch grades
  const { data: grades = [] } = useQuery({
    queryKey: ["grades"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("grades")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  // Fetch passages
  const { data: passages = [], isLoading } = useQuery({
    queryKey: ["passages", ownerCodeId, shouldFilter],
    queryFn: async () => {
      let query = supabase
        .from("passages")
        .select(`
          *,
          schools:school_id(id, name, logo_url),
          grades:grade_id(id, name)
        `)
        .order("created_at", { ascending: false });
      if (shouldFilter) query = query.eq("owner_code_id", ownerCodeId!);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Fetch writing_sentences for korean matching (owner filtered)
  const { data: writingSentences = [] } = useQuery({
    queryKey: ["writing_sentences_all", ownerCodeId, shouldFilter],
    queryFn: async () => {
      let query = supabase
        .from("writing_sentences")
        .select("passage_id, sentence_index, korean_sentence")
        .order("sentence_index");
      if (shouldFilter) query = query.eq("owner_code_id", ownerCodeId!);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });


  // Delete passage mutation
  const deletePassage = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("passages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("지문이 삭제되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["passages"] });
    },
    onError: () => {
      toast.error("지문 삭제에 실패했습니다.");
    },
  });

  // Edit passage mutation
  const updatePassage = useMutation({
    mutationFn: async ({ id, title, content, koreanContent, sentences }: { id: string; title: string; content: string; koreanContent: string; sentences: string[] }) => {
      const { error } = await supabase
        .from("passages")
        .update({ title, content, korean_content: koreanContent, sentences })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("지문이 수정되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["passages"] });
      setEditPassage(null);
    },
    onError: () => {
      toast.error("지문 수정에 실패했습니다.");
    },
  });

  const handleOpenEdit = (passage: any) => {
    setEditPassage(passage);
    setEditTitle(passage.title || "");
    setEditContent(passage.sentences?.join("\n") || passage.content);
    setEditKoreanContent(passage.korean_content || "");
  };

  const handleSaveEdit = () => {
    if (!editPassage) return;
    const sentences = editContent.split("\n").filter((s: string) => s.trim());
    updatePassage.mutate({
      id: editPassage.id,
      title: editTitle.trim() || editPassage.title,
      content: sentences.join(" "),
      koreanContent: editKoreanContent,
      sentences,
    });
  };


  const filteredPassages = passages.filter((passage) =>
    passage.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 제목에서 기본 제목 추출 (예: "성남고 3월 1주 1차시 #1" → "성남고 3월 1주 1차시")
  const getBaseTitle = (title: string) => {
    return title.replace(/\s*#\d+$/, "").trim();
  };

  // 지문들을 학교+학년별로 그룹화
  const groupedBySchoolGrade = useMemo(() => {
    const groups: Record<string, typeof filteredPassages> = {};
    
    filteredPassages.forEach((passage) => {
      const schoolName = passage.schools?.name || "기타";
      const gradeName = passage.grades?.name || "기타";
      const key = `${schoolName}__${gradeName}__${passage.schools?.id || "none"}__${passage.grades?.id || "none"}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(passage);
    });

    // 과 번호 추출 → 같은 과 내에서 Further Reading 등은 마지막으로
    const suffixPatterns = /further\s*reading|futher\s*reading|read\s*more|dive\s*into\s*culture/i;
    const getLessonNum = (title: string) => {
      const m = title.match(/(\d+)\s*과/);
      return m ? parseInt(m[1], 10) : 9999;
    };
    Object.keys(groups).forEach((key) => {
      groups[key].sort((a, b) => {
        // 1차: 과 번호순
        const lessonDiff = getLessonNum(a.title) - getLessonNum(b.title);
        if (lessonDiff !== 0) return lessonDiff;
        // 2차: 같은 과 내에서 suffix 지문은 뒤로
        const aIsSuffix = suffixPatterns.test(a.title) ? 1 : 0;
        const bIsSuffix = suffixPatterns.test(b.title) ? 1 : 0;
        if (aIsSuffix !== bIsSuffix) return aIsSuffix - bIsSuffix;
        // 3차: 제목 자연순
        return a.title.localeCompare(b.title, 'ko', { numeric: true });
      });
    });

    return groups;
  }, [filteredPassages]);

  // 그룹들을 학교명 > 학년명 순으로 정렬
  const sortedSchoolGradeKeys = useMemo(() => {
    return Object.keys(groupedBySchoolGrade).sort((a, b) => {
      const [schoolA, gradeA] = a.split("__");
      const [schoolB, gradeB] = b.split("__");
      if (schoolA !== schoolB) return schoolA.localeCompare(schoolB);
      return gradeA.localeCompare(gradeB);
    });
  }, [groupedBySchoolGrade]);

  // 전체 지문의 미확인 녹음 제출물 일괄 확인처리 (알림 발송 없음)
  const [isConfirmingAll, setIsConfirmingAll] = useState(false);
  const handleConfirmAllPassages = async () => {
    const passageIds = filteredPassages.map((p: any) => p.id);
    if (passageIds.length === 0) {
      toast.error("확인처리할 지문이 없습니다.");
      return;
    }
    if (!confirm(`지문 ${passageIds.length}개의 제출된 녹음과제를 모두 확인처리하시겠습니까?\n(알림은 발송되지 않습니다)`)) return;

    setIsConfirmingAll(true);
    try {
      const { data: hw, error: hwError } = await supabase
        .from("homework")
        .select("id")
        .in("passage_id", passageIds);
      if (hwError) throw hwError;
      const hwIds = (hw || []).map((h) => h.id);
      if (hwIds.length === 0) {
        toast.info("확인처리할 제출물이 없습니다.");
        return;
      }

      const { data: subs, error: subError } = await supabase
        .from("homework_submissions")
        .select("id")
        .in("homework_id", hwIds)
        .not("submitted_at", "is", null)
        .is("reviewed_at", null);
      if (subError) throw subError;
      const subIds = (subs || []).map((s) => s.id);
      if (subIds.length === 0) {
        toast.info("확인처리할 제출물이 없습니다.");
        return;
      }

      // 1000건 단위로 나눠 업데이트
      for (let i = 0; i < subIds.length; i += 500) {
        const chunk = subIds.slice(i, i + 500);
        const { error } = await supabase
          .from("homework_submissions")
          .update({ status: "completed", reviewed_at: new Date().toISOString() })
          .in("id", chunk);
        if (error) throw error;
      }

      toast.success(`${subIds.length}건 확인처리 완료!`);
      queryClient.invalidateQueries({ queryKey: ["rt-homework"] });
      queryClient.invalidateQueries({ queryKey: ["passages"] });
    } catch (e: any) {
      toast.error(e?.message || "확인처리에 실패했습니다.");
    } finally {
      setIsConfirmingAll(false);
    }
  };


  return (
    <div className="w-full min-w-0 max-w-full space-y-4 overflow-x-hidden animate-fade-in sm:space-y-6">
      <PageHeader
        icon={BookOpen}
        title="녹음과제"
        description={`읽기 과제용 지문 · 총 ${passages.length}개`}
        showDate={false}
        actions={
          <div className="grid w-full min-w-0 grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center [&>button]:min-w-0">

            <Button
              size="sm"
              variant="outline"
              onClick={handleConfirmAllPassages}
              disabled={isConfirmingAll}
            >
              {isConfirmingAll ? (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              ) : (
                <CheckCheck className="w-3.5 h-3.5 mr-1.5" />
              )}
              전체 확인처리
            </Button>
            <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={() => setIsBulkAddDialogOpen(true)}>
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              지문 추가
            </Button>
          </div>
        }

      />

      {/* 검색 */}
      <div className="relative w-full max-w-full sm:max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="지문 제목 검색..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* 지문 목록 - 학교+학년별 그룹화 */}
      <div className="space-y-4">
        {sortedSchoolGradeKeys.map((groupKey) => {
          const passagesInGroup = groupedBySchoolGrade[groupKey];
          const [schoolName, gradeName, schoolId, gradeId] = groupKey.split("__");
          const firstPassage = passagesInGroup[0];
          const schoolLogo = firstPassage.schools?.logo_url;

          return (
            <Collapsible key={groupKey}>
              <Card className="w-full min-w-0 max-w-full overflow-hidden">
                <CollapsibleTrigger asChild>
                  <div className="flex min-w-0 items-center justify-between gap-1.5 px-3 py-2.5 cursor-pointer hover:bg-muted/30 transition-colors sm:gap-2 sm:px-4">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {schoolLogo ? (
                        <img src={cacheBustUrl(schoolLogo)} alt={schoolName} className="w-7 h-7 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="w-7 h-7 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[11px] font-bold">{schoolName[0]}</div>
                      )}
                      <span className="min-w-0 truncate text-sm font-bold">{schoolName}</span>
                      <Badge variant="outline" className="text-[10px] shrink-0">{gradeName}</Badge>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">{passagesInGroup.length}개</Badge>
                    </div>

                    <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-1.5 text-[10px] text-destructive hover:text-destructive hover:bg-destructive/10 sm:px-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`${schoolName} ${gradeName}의 지문 ${passagesInGroup.length}개를 모두 삭제하시겠습니까?`)) {
                            Promise.all(passagesInGroup.map(p => supabase.from("passages").delete().eq("id", p.id)))
                              .then(() => {
                                toast.success(`${passagesInGroup.length}개 지문이 삭제되었습니다.`);
                                queryClient.invalidateQueries({ queryKey: ["passages"] });
                              })
                              .catch(() => toast.error("삭제에 실패했습니다."));
                          }
                        }}
                      >
                        전체 삭제
                      </Button>
                      <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform duration-200" />
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="border-t">
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
                       {(() => {
                         // 왼쪽 열부터 위→아래로 넘버링: 열 우선(column-major) 순서로 재배열
                         const total = passagesInGroup.length;
                         const leftCount = Math.ceil(total / 2);
                         const reordered: { passage: typeof passagesInGroup[0]; colIdx: number }[] = [];
                         // 왼쪽 열
                         for (let i = 0; i < leftCount; i++) {
                           reordered.push({ passage: passagesInGroup[i], colIdx: 0 });
                         }
                         // 오른쪽 열
                         for (let i = leftCount; i < total; i++) {
                           reordered.push({ passage: passagesInGroup[i], colIdx: 1 });
                         }
                         // 행 순서로 인터리브 (grid에 맞게)
                         const rightCount = total - leftCount;
                         const rows: { passage: typeof passagesInGroup[0]; globalIdx: number }[] = [];
                         for (let r = 0; r < leftCount; r++) {
                           rows.push({ passage: passagesInGroup[r], globalIdx: r });
                           if (r < rightCount) {
                             rows.push({ passage: passagesInGroup[leftCount + r], globalIdx: leftCount + r });
                           }
                         }
                         return rows.map(({ passage, globalIdx }, renderIdx) => (
                           <div
                             key={passage.id}
                             className="flex min-w-0 max-w-full flex-col gap-1.5 overflow-hidden px-3 py-2.5 hover:bg-muted/30 transition-colors border-b border-border/30 cursor-pointer sm:flex-row sm:items-center sm:gap-2 sm:py-1.5 sm:[&:nth-child(2n)]:border-l sm:[&:nth-child(2n)]:border-l-border/30"
                             onClick={() => setViewPassage(passage)}
                           >
                             <div className="flex items-center gap-2 w-full min-w-0 sm:flex-1">
                               <span className="text-[11px] font-bold text-primary shrink-0 w-5 text-right">#{globalIdx + 1}</span>
                               <span className="text-[13px] sm:text-[11px] font-medium text-foreground truncate flex-1 min-w-0">{passage.title}</span>
                               <span className="text-[10px] text-muted-foreground shrink-0 tabular-nums">{passage.sentences?.length || 0}문장</span>
                             </div>

                             <div className="flex w-full min-w-0 max-w-full items-center gap-0.5 overflow-hidden sm:w-auto sm:shrink-0" onClick={(e) => e.stopPropagation()}>
                               <div className="min-w-0 max-w-full flex-1 overflow-hidden">
                                <RTSubmissionStatus passageId={passage.id} passageTitle={passage.title} gradeId={passage.grade_id} />
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 sm:h-5 sm:w-5 p-0 shrink-0">
                                    <MoreVertical className="w-4 h-4 sm:w-3 sm:h-3" />
                                  </Button>

                                </DropdownMenuTrigger>
                                 <DropdownMenuContent align="end">
                                   <DropdownMenuItem onClick={() => handleOpenEdit(passage)}>
                                     <Edit className="w-4 h-4 mr-2" /> 수정
                                   </DropdownMenuItem>
                                  <DropdownMenuItem className="text-destructive" onClick={() => setDeleteTargetId(passage.id)}>
                                    <Trash2 className="w-4 h-4 mr-2" /> 삭제
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>

                         ));
                       })()}
                     </div>
                   </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}
      </div>

      {sortedSchoolGradeKeys.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">등록된 지문이 없습니다.</p>
          <Button variant="outline" className="mt-4" onClick={() => setIsBulkAddDialogOpen(true)}>
            첫 지문 추가하기
          </Button>
        </div>
      )}

      {/* 지문 일괄 추가 다이얼로그 */}
      <BulkAddPassagesDialog
        open={isBulkAddDialogOpen}
        onOpenChange={setIsBulkAddDialogOpen}
        schools={schools}
        grades={grades}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["passages"] })}
      />

      {/* 지문 상세 보기 다이얼로그 */}
      <Dialog open={!!viewPassage} onOpenChange={(open) => !open && setViewPassage(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              {viewPassage?.title}
            </DialogTitle>
            <DialogDescription>
              {viewPassage?.sentences?.length || 0}문장
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {viewPassage?.sentences?.map((sentence: string, idx: number) => {
              // Prefer writing_sentences data for accurate per-sentence Korean matching
              const wsForPassage = writingSentences.filter((ws: any) => ws.passage_id === viewPassage.id);
              const wsMatch = wsForPassage.find((ws: any) => ws.sentence_index === idx);
              let korean = wsMatch?.korean_sentence || "";
              if (!korean) {
                const koreanLines = viewPassage.korean_content?.split("\n").filter((l: string) => l.trim()) || [];
                korean = koreanLines[idx] || "";
              }
              return (
                <div key={idx} className="p-3 rounded-lg border border-border/50 bg-muted/20 space-y-1">
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-bold text-primary bg-primary/10 rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="space-y-1 min-w-0">
                      <p className="text-sm leading-relaxed text-foreground">{sentence}</p>
                      {korean && (
                        <p className="text-xs text-muted-foreground leading-relaxed">{korean}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* 지문 수정 다이얼로그 */}
      <Dialog open={!!editPassage} onOpenChange={(open) => !open && setEditPassage(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-primary" />
              지문 수정: {editPassage?.title}
            </DialogTitle>
            <DialogDescription>
              영어 문장을 줄바꿈으로 구분하여 입력하세요.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            <div className="space-y-2">
              <Label>지문 제목</Label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="지문 제목을 입력하세요"
              />
            </div>
            <div className="space-y-2">
              <Label>영어 문장 (줄바꿈으로 구분)</Label>
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
                placeholder="각 문장을 줄바꿈으로 구분하세요..."
              />
            </div>
            <div className="space-y-2">
              <Label>한국어 번역 (줄바꿈으로 구분, 선택)</Label>
              <Textarea
                value={editKoreanContent}
                onChange={(e) => setEditKoreanContent(e.target.value)}
                className="min-h-[150px] font-mono text-sm"
                placeholder="각 번역을 줄바꿈으로 구분하세요..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditPassage(null)}>취소</Button>
            <Button onClick={handleSaveEdit} disabled={updatePassage.isPending}>
              {updatePassage.isPending ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={!!deleteTargetId} onOpenChange={(open) => !open && setDeleteTargetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>지문을 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 지문과 관련된 모든 과제 및 제출 데이터가 함께 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => {
                if (deleteTargetId) {
                  deletePassage.mutate(deleteTargetId);
                  setDeleteTargetId(null);
                }
              }}
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
