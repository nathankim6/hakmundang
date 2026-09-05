import { useState, useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { useOwnerFilter } from "@/hooks/useOwnerFilter";
import { Plus, Search, BookOpen, MoreVertical, Play, Clock, Edit, Send, Calendar, ChevronDown, ChevronRight, Layers, Trash2, Sparkles, Loader2, CheckCheck } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RTSubmissionStatus } from "@/components/passages/RTSubmissionStatus";
import { BulkAddPassagesDialog } from "@/components/passages/BulkAddPassagesDialog";
import { supabase } from "@/integrations/supabase/client";
import { cacheBustUrl } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { PageHeader } from "@/components/layout/PageHeader";

export default function Passages() {
  const queryClient = useQueryClient();
  const { ownerCodeId, shouldFilter } = useOwnerFilter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isBulkAddDialogOpen, setIsBulkAddDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedPassage, setSelectedPassage] = useState<any>(null);
  const [selectedGroupPassages, setSelectedGroupPassages] = useState<any[] | null>(null);
  const [viewPassage, setViewPassage] = useState<any>(null);
  const [assignData, setAssignData] = useState({
    schoolId: "",
    gradeIds: [] as string[],
    dueDate: "",
  });
  const [editPassage, setEditPassage] = useState<any>(null);
  const [editContent, setEditContent] = useState("");
  const [editKoreanContent, setEditKoreanContent] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isAiSplitting, setIsAiSplitting] = useState(false);
  const [isBulkConfirmingAll, setIsBulkConfirmingAll] = useState(false);

  // 전체 미검토 제출 일괄 확인처리 (마감일 무관)
  const handleBulkConfirmOverdue = async () => {
    try {
      setIsBulkConfirmingAll(true);

      const { data: allHomework, error: hwError } = await supabase
        .from("homework")
        .select(`
          id,
          homework_submissions(id, status, submitted_at, recording_url)
        `)
        .eq("type", "rt_review");
      if (hwError) throw hwError;

      // 제출됐지만 미검토인 건만 필터
      const unreviewedSubs = (allHomework || []).flatMap(hw =>
        (hw.homework_submissions as any[]).filter(
          (s: any) => s.submitted_at && s.status !== "completed"
        )
      );

      if (unreviewedSubs.length === 0) {
        toast.info("확인처리할 과제가 없습니다.");
        return;
      }

      if (!confirm(`미검토 제출 ${unreviewedSubs.length}건을 전체 확인처리하시겠습니까?\n(문자 발송 없이 확인처리 + 녹음파일 삭제)`)) return;

      const now = new Date().toISOString();
      const subIds = unreviewedSubs.map((s: any) => s.id);

      // 상태 업데이트
      const { error: updateError } = await supabase
        .from("homework_submissions")
        .update({ status: "completed", reviewed_at: now })
        .in("id", subIds);
      if (updateError) throw updateError;

      // 녹음파일은 검토 후 2주간 보관되며, 서버(cleanup-old-recordings)에서 자동 삭제됩니다.


      queryClient.invalidateQueries({ queryKey: ["rt-homework"] });
      toast.success(`${unreviewedSubs.length}건 확인처리 완료`);
    } catch (err) {
      console.error(err);
      toast.error("확인처리 중 오류가 발생했습니다");
    } finally {
      setIsBulkConfirmingAll(false);
    }
  };

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

  // Fetch writing_sentences for korean matching
  const { data: writingSentences = [] } = useQuery({
    queryKey: ["writing_sentences_all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("writing_sentences")
        .select("passage_id, sentence_index, korean_sentence")
        .order("sentence_index");
      if (error) throw error;
      return data;
    },
  });

  // Fetch homework due dates per passage
  const { data: homeworkByPassage = [] } = useQuery({
    queryKey: ["homework-due-dates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("homework")
        .select("passage_id, due_date")
        .not("passage_id", "is", null)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const getDueDateForPassage = (passageId: string): string | null => {
    const hw = homeworkByPassage.find((h: any) => h.passage_id === passageId);
    return hw?.due_date || null;
  };

  // Get grades for selected school
  const getGradesForSchool = (schoolId: string) => {
    return grades.filter((g) => g.school_id === schoolId);
  };

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
    mutationFn: async ({ id, content, koreanContent, sentences }: { id: string; content: string; koreanContent: string; sentences: string[] }) => {
      // 1. Update passage
      const { error } = await supabase
        .from("passages")
        .update({ content, korean_content: koreanContent, sentences })
        .eq("id", id);
      if (error) throw error;

      // 2. Sync writing_sentences: delete old and insert new
      const koreanLines = koreanContent.split("\n").filter((s: string) => s.trim());
      
      await supabase.from("writing_sentences").delete().eq("passage_id", id);
      
      if (sentences.length > 0) {
        const rows = sentences.map((eng, idx) => ({
          passage_id: id,
          sentence_index: idx,
          english_sentence: eng.trim(),
          korean_sentence: koreanLines[idx]?.trim() || "",
          owner_code_id: ownerCodeId,
        }));
        const { error: insError } = await supabase.from("writing_sentences").insert(rows);
        if (insError) throw insError;
      }
    },
    onSuccess: () => {
      toast.success("지문이 수정되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["passages"] });
      queryClient.invalidateQueries({ queryKey: ["writing-sentences-all"] });
      setEditPassage(null);
    },
    onError: () => {
      toast.error("지문 수정에 실패했습니다.");
    },
  });

  const handleOpenEdit = (passage: any) => {
    setEditPassage(passage);
    setEditContent(passage.sentences?.join("\n") || passage.content);
    setEditKoreanContent(passage.korean_content || "");
  };

  const handleSaveEdit = () => {
    if (!editPassage) return;
    const sentences = editContent.split("\n").filter((s: string) => s.trim());
    updatePassage.mutate({
      id: editPassage.id,
      content: sentences.join(" "),
      koreanContent: editKoreanContent,
      sentences,
    });
  };

  const handleAiSplitInEdit = async () => {
    const rawContent = editContent.split("\n").filter((s: string) => s.trim()).join(" ");
    if (!rawContent.trim()) {
      toast.error("영어 문장을 먼저 입력해주세요.");
      return;
    }
    setIsAiSplitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("split-sentences", {
        body: {
          passages: [{
            title: editPassage?.title || "편집 중",
            content: rawContent,
            koreanContent: editKoreanContent || undefined,
          }],
        },
      });
      if (error) throw error;
      const result = data?.results?.[0];
      if (result?.sentences?.length) {
        setEditContent(result.sentences.join("\n"));
        if (result.koreanSentences?.length) {
          setEditKoreanContent(result.koreanSentences.join("\n"));
        }
        toast.success(`AI 문장분리 완료: ${result.sentences.length}개 문장`);
      } else {
        toast.error("AI 문장분리 결과가 없습니다.");
      }
    } catch (err) {
      console.error("AI split error:", err);
      toast.error("AI 문장분리에 실패했습니다.");
    } finally {
      setIsAiSplitting(false);
    }
  };

  // Assign as RT homework mutation (single passage, multiple grades)
  const assignHomework = useMutation({
    mutationFn: async ({ passageId, gradeIds, dueDate, title }: { passageId: string; gradeIds: string[]; dueDate: string; title: string }) => {
      const results = [];
      for (const gradeId of gradeIds) {
        // 같은 마감일/학년/owner의 기존 rt_review 과제가 있으면 같은 group_id 사용
        const { data: existingHw } = await supabase
          .from("homework")
          .select("id, homework_group_id")
          .eq("target_grade_id", gradeId)
          .eq("due_date", dueDate)
          .eq("type", "rt_review")
          .eq("owner_code_id", ownerCodeId)
          .order("created_at", { ascending: false });

        let groupId: string | null = null;
        
        // 기존 과제가 있으면 그룹화
        if (existingHw && existingHw.length > 0) {
          // 이미 group_id가 있는 과제가 있으면 재사용
          const withGroup = existingHw.find(h => h.homework_group_id);
          if (withGroup) {
            groupId = withGroup.homework_group_id;
          } else {
            // 기존 과제는 있지만 group_id가 없음 -> 새 group_id 생성 후 기존 과제도 업데이트
            groupId = crypto.randomUUID();
            await supabase
              .from("homework")
              .update({ homework_group_id: groupId })
              .in("id", existingHw.map(h => h.id));
          }
        }

        const { data: homeworkData, error: homeworkError } = await supabase
          .from("homework")
          .insert({
            title: `리뷰 과제: ${title}`,
            type: "rt_review",
            target_type: "grade",
            target_grade_id: gradeId,
            passage_id: passageId,
            due_date: dueDate,
            owner_code_id: ownerCodeId,
            homework_group_id: groupId,
          })
          .select()
          .single();
        if (homeworkError) throw homeworkError;

        const { data: students, error: studentsError } = await supabase
          .from("students")
          .select("id")
          .eq("grade_id", gradeId);
        if (studentsError) throw studentsError;

        if (students && students.length > 0) {
          const submissions = students.map((student) => ({
            homework_id: homeworkData.id,
            student_id: student.id,
            status: "pending",
          }));
          const { error: submissionsError } = await supabase
            .from("homework_submissions")
            .insert(submissions);
          if (submissionsError) throw submissionsError;
        }
        results.push(homeworkData);
      }
      return results;
    },
    onSuccess: () => {
      toast.success("리뷰 과제가 배정되었습니다!");
      queryClient.invalidateQueries({ queryKey: ["homework"] });
      queryClient.invalidateQueries({ queryKey: ["student-rt-submissions"] });
      setIsAssignDialogOpen(false);
      setAssignData({ schoolId: "", gradeIds: [], dueDate: "" });
      setSelectedPassage(null);
    },
    onError: (error) => {
      console.error("Assignment error:", error);
      toast.error("과제 배정에 실패했습니다.");
    },
  });

  // Assign group of passages as RT homework (all passages share same homework_group_id, multiple grades)
  const assignGroupHomework = useMutation({
    mutationFn: async ({ passages, gradeIds, dueDate }: { passages: any[]; gradeIds: string[]; dueDate: string }) => {
      const allResults = [];
      for (const gradeId of gradeIds) {
        const groupId = crypto.randomUUID();
        
        const homeworkInserts = passages.map((p) => ({
          title: `리뷰 과제: ${p.title}`,
          type: "rt_review",
          target_type: "grade",
          target_grade_id: gradeId,
          passage_id: p.id,
          due_date: dueDate,
          owner_code_id: ownerCodeId,
          homework_group_id: groupId,
        }));

        const { data: homeworkData, error: homeworkError } = await supabase
          .from("homework")
          .insert(homeworkInserts)
          .select();
        if (homeworkError) throw homeworkError;

        const { data: students, error: studentsError } = await supabase
          .from("students")
          .select("id")
          .eq("grade_id", gradeId);
        if (studentsError) throw studentsError;

        if (students && students.length > 0 && homeworkData) {
          const submissions = homeworkData.flatMap((hw) =>
            students.map((student) => ({
              homework_id: hw.id,
              student_id: student.id,
              status: "pending",
            }))
          );
          const { error: submissionsError } = await supabase
            .from("homework_submissions")
            .insert(submissions);
          if (submissionsError) throw submissionsError;
        }
        allResults.push(...(homeworkData || []));
      }
      return allResults;
    },
    onSuccess: () => {
      toast.success("그룹 리뷰 과제가 배정되었습니다!");
      queryClient.invalidateQueries({ queryKey: ["homework"] });
      queryClient.invalidateQueries({ queryKey: ["student-rt-submissions"] });
      setIsAssignDialogOpen(false);
      setAssignData({ schoolId: "", gradeIds: [], dueDate: "" });
      setSelectedPassage(null);
    },
    onError: (error) => {
      console.error("Group assignment error:", error);
      toast.error("그룹 과제 배정에 실패했습니다.");
    },
  });

  const handlePassagesSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["passages"] });
  };

  const handleOpenAssignDialog = (passage: any) => {
    setSelectedPassage(passage);
    setSelectedGroupPassages(null);
    setAssignData({
      schoolId: passage.school_id || "",
      gradeIds: passage.grade_id ? [passage.grade_id] : [],
      dueDate: format(new Date(), "yyyy-MM-dd"),
    });
    setIsAssignDialogOpen(true);
  };

  const handleAssignHomework = () => {
    if (assignData.gradeIds.length === 0 || !assignData.dueDate) {
      toast.error("학년과 마감일을 선택해주세요.");
      return;
    }
    if (selectedGroupPassages && selectedGroupPassages.length > 1) {
      assignGroupHomework.mutate({
        passages: selectedGroupPassages,
        gradeIds: assignData.gradeIds,
        dueDate: assignData.dueDate,
      });
    } else {
      assignHomework.mutate({
        passageId: selectedPassage.id,
        gradeIds: assignData.gradeIds,
        dueDate: assignData.dueDate,
        title: selectedPassage.title,
      });
    }
  };

  const handleOpenGroupAssignDialog = (passagesInGroup: any[]) => {
    const first = passagesInGroup[0];
    setSelectedPassage(first);
    setSelectedGroupPassages(passagesInGroup);
    setAssignData({
      schoolId: first.school_id || "",
      gradeIds: first.grade_id ? [first.grade_id] : [],
      dueDate: format(new Date(), "yyyy-MM-dd"),
    });
    setIsAssignDialogOpen(true);
  };

  const filteredPassages = passages.filter((passage) =>
    passage.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 제목에서 그룹 기본 제목 추출
  // 예) "하루독해6강-5" → "하루독해", "올림포스6강-4" → "올림포스",
  //     "숭의여자고등학교 1학기 기말고사 #1" → "숭의여자고등학교 1학기 기말고사",
  //     "성남고 3월 1주 1차시 #1" → "성남고 3월 1주 1차시"
  const getBaseTitle = (title: string) => {
    let t = (title || "").trim();
    // 후행 #번호 제거
    t = t.replace(/\s*#\d+\s*$/, "");
    // 후행 "N강-M" 또는 "N강 M" 또는 "N강" 제거
    t = t.replace(/\s*\d+\s*강\s*[-–—]?\s*\d*\s*$/, "");
    // 후행 단순 "-숫자" 제거
    t = t.replace(/\s*[-–—]\s*\d+\s*$/, "");
    return t.trim();
  };

  // 지문들을 학교 + exam_label(학년/학기/시험) 기준으로 그룹화
  // exam_label 이 없는 구 데이터는 제목 기반 fallback 사용
  const groupedPassages = useMemo(() => {
    const groups: Record<string, typeof filteredPassages> = {};

    filteredPassages.forEach((passage) => {
      const schoolKey = passage.school_id || "none";
      const examKey = (passage as any).exam_label?.trim()
        ? `exam:${(passage as any).exam_label.trim()}`
        : `title:${getBaseTitle(passage.title)}`;
      const key = `${schoolKey}|${examKey}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(passage);
    });

    // 각 그룹 내에서 제목 끝의 숫자(예: -3, -10) 기준 오름차순 정렬
    const extractTrailingNum = (title: string) => {
      const m = (title || "").match(/(\d+)\s*$/);
      return m ? parseInt(m[1], 10) : Number.MAX_SAFE_INTEGER;
    };
    Object.keys(groups).forEach((key) => {
      groups[key].sort((a, b) => {
        // 1순위: 차시(생성일 날짜) 오름차순
        const dayA = (a.created_at || "").slice(0, 10);
        const dayB = (b.created_at || "").slice(0, 10);
        if (dayA !== dayB) return dayA.localeCompare(dayB);
        // 2순위: 같은 차시 내에서는 추가한 순서(생성 시각) 오름차순
        const tA = new Date(a.created_at || 0).getTime();
        const tB = new Date(b.created_at || 0).getTime();
        if (tA !== tB) return tA - tB;
        // 3순위: id
        return (a.id || "").localeCompare(b.id || "");
      });
    });

    return groups;
  }, [filteredPassages]);

  // 그룹 표시 제목: "{학교명} {exam_label}" 형태로 표시
  const getGroupDisplayTitle = (passagesInGroup: typeof filteredPassages) => {
    const first = passagesInGroup[0] as any;
    const examLabel = first?.exam_label?.trim();
    const schoolName = first?.schools?.name || "";
    if (examLabel) {
      return [schoolName, examLabel].filter(Boolean).join(" ");
    }
    const baseTitle = getBaseTitle(first?.title || "");
    if (baseTitle) return baseTitle;
    const dateKey = first?.created_at ? String(first.created_at).slice(0, 10) : "";
    return dateKey ? `${dateKey} 업로드` : "업로드 묶음";
  };

  // 그룹들을 최신순으로 정렬 (그룹 내 첫 번째 지문의 생성일 기준)
  const sortedGroupKeys = useMemo(() => {
    return Object.keys(groupedPassages).sort((a, b) => {
      const dateA = new Date(groupedPassages[a][0]?.created_at || 0);
      const dateB = new Date(groupedPassages[b][0]?.created_at || 0);
      return dateB.getTime() - dateA.getTime();
    });
  }, [groupedPassages]);

  const getSchoolName = (schoolId: string) => {
    const school = schools.find((s) => s.id === schoolId);
    return school?.name || "";
  };

  const getGradeName = (gradeId: string) => {
    const grade = grades.find((g) => g.id === gradeId);
    return grade?.name || "";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        icon={BookOpen}
        title="녹음리뷰과제"
        description={`읽기 과제용 지문 · 총 ${passages.length}개`}
        showDate={false}
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={() => setIsBulkAddDialogOpen(true)}>
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              지문 추가
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleBulkConfirmOverdue}
              disabled={isBulkConfirmingAll}
              className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
            >
              {isBulkConfirmingAll ? (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              ) : (
                <CheckCheck className="w-3.5 h-3.5 mr-1.5" />
              )}
              과제 전체확인
            </Button>
          </div>
        }
      />

      {/* 검색 */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="지문 제목 검색..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* 지문 목록 - 그룹화된 형태 */}
      <div className="space-y-3">
        {sortedGroupKeys.map((groupKey) => {
          const passagesInGroup = groupedPassages[groupKey];
          const firstPassage = passagesInGroup[0];
          const isSinglePassage = passagesInGroup.length === 1;
          const baseTitle = getGroupDisplayTitle(passagesInGroup);

          if (isSinglePassage) {
            const passage = firstPassage;
            return (
              <Card key={passage.id} className="card-hover">
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <BookOpen className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-sm font-medium truncate">{passage.title}</span>
                    {passage.schools && (
                      <Badge variant="outline" className="text-[10px] shrink-0">{passage.schools.name}</Badge>
                    )}
                    {passage.grades && (
                      <span className="text-[10px] text-muted-foreground shrink-0">{passage.grades.name}</span>
                    )}
                    <span className="text-[10px] text-muted-foreground shrink-0">{passage.sentences?.length || 0}문장</span>
                    <span className="text-[10px] text-muted-foreground shrink-0">{format(new Date(passage.created_at), "yyyy-MM-dd")}</span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 shrink-0">
                        <MoreVertical className="w-3.5 h-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenAssignDialog(passage)}>
                        <Send className="w-4 h-4 mr-2" /> 리뷰 과제 배정
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleOpenEdit(passage)}>
                        <Edit className="w-4 h-4 mr-2" /> 수정
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => setDeleteTargetId(passage.id)}>
                        <Trash2 className="w-4 h-4 mr-2" /> 삭제
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="px-4 pb-3">
                  <RTSubmissionStatus passageId={passage.id} passageTitle={passage.title} gradeId={passage.grade_id} />
                </div>
              </Card>
            );
          }

          return (
            <Collapsible key={groupKey}>
              <Card className="overflow-hidden">
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-2.5">
                      {firstPassage.schools?.logo_url ? (
                        <img src={cacheBustUrl(firstPassage.schools.logo_url)} alt={firstPassage.schools.name} className="w-5 h-5 rounded-full object-cover" />
                      ) : firstPassage.schools?.name ? (
                        <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">{firstPassage.schools.name[0]}</div>
                      ) : (
                        <Layers className="w-4 h-4 text-primary" />
                      )}
                      <span className="text-sm font-semibold">{baseTitle}</span>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{passagesInGroup.length}개</Badge>
                      {firstPassage.schools && (
                        <Badge variant="outline" className="text-[10px]">{firstPassage.schools.name}</Badge>
                      )}
                      {firstPassage.grades && (
                        <span className="text-[10px] text-muted-foreground">{firstPassage.grades.name}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-[10px] text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`"${baseTitle}" 그룹의 지문 ${passagesInGroup.length}개를 모두 삭제하시겠습니까?`)) {
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
                    {passagesInGroup.map((passage, idx) => (
                      <div 
                        key={passage.id} 
                        className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/20 transition-colors border-b last:border-b-0 border-border/40 cursor-pointer"
                        onClick={() => setViewPassage(passage)}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <span className="text-xs font-bold text-primary w-6 text-center shrink-0">
                            #{idx + 1}
                          </span>
                          <span className="text-xs font-medium text-foreground/90 truncate max-w-[200px] shrink-0" title={passage.title}>
                            {passage.title}
                          </span>
                          <span className="text-xs text-muted-foreground truncate max-w-[260px]">
                            {passage.content.substring(0, 60)}...
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <RTSubmissionStatus passageId={passage.id} passageTitle={passage.title} gradeId={passage.grade_id} />
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <MoreVertical className="w-3 h-3" />
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
                    ))}
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}
      </div>

      {sortedGroupKeys.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">등록된 지문이 없습니다.</p>
          <Button variant="outline" className="mt-4" onClick={() => setIsBulkAddDialogOpen(true)}>
            첫 지문 추가하기
          </Button>
        </div>
      )}

      {/* 리뷰 과제 배정 다이얼로그 */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>리뷰 과제 배정</DialogTitle>
            <DialogDescription>
              {selectedGroupPassages && selectedGroupPassages.length > 1
                ? `${selectedGroupPassages.length}개 지문을 그룹 리뷰 과제로 배정합니다.`
                : `${selectedPassage?.title} 지문을 리뷰 과제로 배정합니다.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>학교</Label>
              <Select
                value={assignData.schoolId}
                onValueChange={(value) => setAssignData({ ...assignData, schoolId: value, gradeIds: [] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="학교 선택" />
                </SelectTrigger>
                <SelectContent>
                  {schools.map((school) => (
                    <SelectItem key={school.id} value={school.id}>
                      {school.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>학년 (복수 선택 가능)</Label>
              {!assignData.schoolId ? (
                <p className="text-sm text-muted-foreground">학교를 먼저 선택해주세요.</p>
              ) : (
                <div className="space-y-2 rounded-lg border p-3">
                  {getGradesForSchool(assignData.schoolId).map((grade) => {
                    const isChecked = assignData.gradeIds.includes(grade.id);
                    return (
                      <label key={grade.id} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={(checked) => {
                            setAssignData((prev) => ({
                              ...prev,
                              gradeIds: checked
                                ? [...prev.gradeIds, grade.id]
                                : prev.gradeIds.filter((id) => id !== grade.id),
                            }));
                          }}
                        />
                        <span className="text-sm">{grade.name}</span>
                      </label>
                    );
                  })}
                  {getGradesForSchool(assignData.schoolId).length === 0 && (
                    <p className="text-sm text-muted-foreground">등록된 학년이 없습니다.</p>
                  )}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                마감일
              </Label>
              <Input
                type="date"
                value={assignData.dueDate}
                onChange={(e) => setAssignData({ ...assignData, dueDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleAssignHomework} disabled={assignHomework.isPending || assignGroupHomework.isPending || assignData.gradeIds.length === 0}>
              {(assignHomework.isPending || assignGroupHomework.isPending) ? "배정 중..." : 
                (() => {
                  const gradeLabel = assignData.gradeIds.length > 1 ? `${assignData.gradeIds.length}개 학년` : "과제";
                  return selectedGroupPassages && selectedGroupPassages.length > 1
                    ? `그룹 과제 배정 (${selectedGroupPassages.length}개 지문 × ${assignData.gradeIds.length}개 학년)`
                    : `${gradeLabel} 배정`;
                })()}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 지문 일괄 추가 다이얼로그 */}
      <BulkAddPassagesDialog
        open={isBulkAddDialogOpen}
        onOpenChange={setIsBulkAddDialogOpen}
        schools={schools}
        grades={grades}
        onSuccess={handlePassagesSuccess}
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
          <DialogFooter className="flex-row justify-between sm:justify-between">
            <Button variant="outline" onClick={handleAiSplitInEdit} disabled={isAiSplitting} className="gap-1.5">
              {isAiSplitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {isAiSplitting ? "분리 중..." : "AI 문장분리"}
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditPassage(null)}>취소</Button>
              <Button onClick={handleSaveEdit} disabled={updatePassage.isPending || isAiSplitting}>
                {updatePassage.isPending ? "저장 중..." : "저장"}
              </Button>
            </div>
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
