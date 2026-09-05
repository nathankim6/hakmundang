import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOwnerFilter } from "@/hooks/useOwnerFilter";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Users,
  Tag,
  MoreVertical,
  Edit2,
  Trash2,
  UserPlus,
  X,
  Check,
  School,
  ChevronDown,
  ChevronRight,
  Search,
  MessageSquare,
  Send,
  Loader2,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const TAG_COLORS = [
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6",
  "#ec4899", "#06b6d4", "#f97316", "#14b8a6", "#6366f1",
];

interface StudentTag {
  id: string;
  name: string;
  color: string;
  owner_code_id: string | null;
}

interface StudentWithInfo {
  id: string;
  name: string;
  student_phone: string | null;
  parent_phone: string | null;
  access_code: { code: string } | null;
  grade: {
    id: string;
    name: string;
    school: { id: string; name: string; logo_url: string | null } | null;
  } | null;
}

export default function Groups() {
  const queryClient = useQueryClient();
  const { ownerCodeId, shouldFilter } = useOwnerFilter();
  const isSessionReady = !!ownerCodeId;

  const [isCreateTagOpen, setIsCreateTagOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);
  const [editingTag, setEditingTag] = useState<StudentTag | null>(null);
  const [deleteTagId, setDeleteTagId] = useState<string | null>(null);
  const [manageTagId, setManageTagId] = useState<string | null>(null);
  const [studentSearch, setStudentSearch] = useState("");
  const [expandedTags, setExpandedTags] = useState<Set<string>>(new Set());
  const [bulkSmsTagId, setBulkSmsTagId] = useState<string | null>(null);
  const [bulkSmsMessage, setBulkSmsMessage] = useState("");
  const [isSendingBulkSms, setIsSendingBulkSms] = useState(false);
  const [localSelected, setLocalSelected] = useState<Set<string> | null>(null);
  const [isSavingStudents, setIsSavingStudents] = useState(false);
  // Fetch tags
  const { data: tags = [], isLoading: tagsLoading } = useQuery({
    queryKey: ["student-tags", ownerCodeId],
    enabled: isSessionReady,
    queryFn: async () => {
      let query = supabase.from("student_tags").select("*").order("name");
      if (shouldFilter) query = query.eq("owner_code_id", ownerCodeId!);
      const { data, error } = await query;
      if (error) throw error;
      return data as StudentTag[];
    },
  });

  // Fetch tag assignments
  const { data: tagAssignments = [] } = useQuery({
    queryKey: ["student-tag-assignments"],
    enabled: isSessionReady,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("student_tag_assignments")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  // Fetch all students (owner filtered)
  const { data: allStudents = [] } = useQuery({
    queryKey: ["all-students-for-groups", ownerCodeId, shouldFilter],
    enabled: isSessionReady,
    queryFn: async () => {
      let gradeIds: string[] | null = null;
      if (shouldFilter) {
        const { data: ownedSchools } = await supabase
          .from("schools").select("id").eq("owner_code_id", ownerCodeId!);
        const schoolIds = ownedSchools?.map(s => s.id) || [];
        if (schoolIds.length === 0) return [];
        const { data: ownedGrades } = await supabase
          .from("grades").select("id").in("school_id", schoolIds);
        gradeIds = ownedGrades?.map(g => g.id) || [];
        if (gradeIds.length === 0) return [];
      }

      let query = supabase
        .from("students")
        .select(`
          id, name, student_phone, parent_phone,
          access_code:access_code_id(code),
          grade:grade_id(id, name, school:school_id(id, name, logo_url))
        `)
        .order("name");

      if (shouldFilter && gradeIds && gradeIds.length > 0) {
        query = query.in("grade_id", gradeIds);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as StudentWithInfo[];
    },
  });

  // Group assignments by tag
  const assignmentsByTag = useMemo(() => {
    const map: Record<string, Set<string>> = {};
    tagAssignments.forEach((a) => {
      if (!map[a.tag_id]) map[a.tag_id] = new Set();
      map[a.tag_id].add(a.student_id);
    });
    return map;
  }, [tagAssignments]);

  // Group assignments by student
  const tagsByStudent = useMemo(() => {
    const map: Record<string, string[]> = {};
    tagAssignments.forEach((a) => {
      if (!map[a.student_id]) map[a.student_id] = [];
      map[a.student_id].push(a.tag_id);
    });
    return map;
  }, [tagAssignments]);

  // Create tag
  const createTag = useMutation({
    mutationFn: async ({ name, color }: { name: string; color: string }) => {
      const { error } = await supabase
        .from("student_tags")
        .insert({ name, color, owner_code_id: ownerCodeId });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("그룹이 생성되었습니다");
      queryClient.invalidateQueries({ queryKey: ["student-tags"] });
      setIsCreateTagOpen(false);
      setNewTagName("");
      setNewTagColor(TAG_COLORS[0]);
    },
    onError: () => toast.error("그룹 생성 실패"),
  });

  // Update tag
  const updateTag = useMutation({
    mutationFn: async ({ id, name, color }: { id: string; name: string; color: string }) => {
      const { error } = await supabase
        .from("student_tags")
        .update({ name, color })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("그룹이 수정되었습니다");
      queryClient.invalidateQueries({ queryKey: ["student-tags"] });
      setEditingTag(null);
      setIsCreateTagOpen(false);
    },
    onError: () => toast.error("그룹 수정 실패"),
  });

  // Delete tag
  const deleteTag = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("student_tags").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("그룹이 삭제되었습니다");
      queryClient.invalidateQueries({ queryKey: ["student-tags"] });
      queryClient.invalidateQueries({ queryKey: ["student-tag-assignments"] });
      setDeleteTagId(null);
    },
    onError: () => toast.error("그룹 삭제 실패"),
  });

  // Assign student to tag
  const assignStudent = useMutation({
    mutationFn: async ({ studentId, tagId }: { studentId: string; tagId: string }) => {
      const { error } = await supabase
        .from("student_tag_assignments")
        .insert({ student_id: studentId, tag_id: tagId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-tag-assignments"] });
    },
    onError: () => toast.error("학생 추가 실패"),
  });

  // Remove student from tag
  const removeStudent = useMutation({
    mutationFn: async ({ studentId, tagId }: { studentId: string; tagId: string }) => {
      const { error } = await supabase
        .from("student_tag_assignments")
        .delete()
        .eq("student_id", studentId)
        .eq("tag_id", tagId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-tag-assignments"] });
    },
    onError: () => toast.error("학생 제거 실패"),
  });

  // 드래그앤드랍으로 그룹 이동
  const [draggingStudent, setDraggingStudent] = useState<{ id: string; name: string; fromTagId: string } | null>(null);
  const [dragOverTagId, setDragOverTagId] = useState<string | null>(null);

  const moveStudent = useMutation({
    mutationFn: async ({ studentId, fromTagId, toTagId }: { studentId: string; fromTagId: string; toTagId: string }) => {
      const { error: insertError } = await supabase
        .from("student_tag_assignments")
        .insert({ student_id: studentId, tag_id: toTagId });
      if (insertError && insertError.code !== "23505") throw insertError;
      const { error: deleteError } = await supabase
        .from("student_tag_assignments")
        .delete()
        .eq("student_id", studentId)
        .eq("tag_id", fromTagId);
      if (deleteError) throw deleteError;
    },
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: ["student-tag-assignments"] });
      const toName = tags.find((t) => t.id === vars.toTagId)?.name || "그룹";
      toast.success(`${toName}(으)로 이동했습니다`);
    },
    onError: () => toast.error("그룹 이동 실패"),
  });

  const handleDropOnTag = (toTagId: string) => {
    setDragOverTagId(null);
    const dragged = draggingStudent;
    setDraggingStudent(null);
    if (!dragged || dragged.fromTagId === toTagId) return;
    moveStudent.mutate({ studentId: dragged.id, fromTagId: dragged.fromTagId, toTagId });
  };

  const toggleTag = (tagId: string) => {
    setExpandedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tagId)) next.delete(tagId);
      else next.add(tagId);
      return next;
    });
  };

  const handleOpenCreate = (tag?: StudentTag) => {
    if (tag) {
      setEditingTag(tag);
      setNewTagName(tag.name);
      setNewTagColor(tag.color);
    } else {
      setEditingTag(null);
      setNewTagName("");
      setNewTagColor(TAG_COLORS[0]);
    }
    setIsCreateTagOpen(true);
  };

  const handleSaveTag = () => {
    if (!newTagName.trim()) {
      toast.error("그룹 이름을 입력해주세요");
      return;
    }
    if (editingTag) {
      updateTag.mutate({ id: editingTag.id, name: newTagName.trim(), color: newTagColor });
    } else {
      createTag.mutate({ name: newTagName.trim(), color: newTagColor });
    }
  };

  // Students for manage dialog
  const manageTag = tags.find((t) => t.id === manageTagId);
  const assignedStudentIds = manageTagId ? assignmentsByTag[manageTagId] || new Set<string>() : new Set<string>();
  const currentSelected: Set<string> = localSelected ?? assignedStudentIds;

  // Initialize localSelected when dialog opens
  useEffect(() => {
    if (manageTagId) {
      setLocalSelected(new Set(assignmentsByTag[manageTagId] || []));
    }
  }, [manageTagId]);

  const filteredStudents = allStudents.filter((s) => {
    if (!studentSearch.trim()) return true;
    const q = studentSearch.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      (s.grade?.school?.name || "").toLowerCase().includes(q) ||
      (s.grade?.name || "").toLowerCase().includes(q)
    );
  });

  // Group students by school then grade for manage dialog
  const studentsBySchoolAndGrade = useMemo(() => {
    const map: Record<string, Record<string, StudentWithInfo[]>> = {};
    filteredStudents.forEach((s) => {
      const schoolName = s.grade?.school?.name || "기타";
      const gradeName = s.grade?.name || "기타";
      if (!map[schoolName]) map[schoolName] = {};
      if (!map[schoolName][gradeName]) map[schoolName][gradeName] = [];
      map[schoolName][gradeName].push(s);
    });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([school, grades]) => ({
        school,
        grades: Object.entries(grades)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([grade, students]) => ({ grade, students })),
      }));
  }, [filteredStudents]);

  const handleToggleStudent = (studentId: string) => {
    if (!manageTagId) return;
    if (assignedStudentIds.has(studentId)) {
      removeStudent.mutate({ studentId, tagId: manageTagId });
    } else {
      assignStudent.mutate({ studentId, tagId: manageTagId });
    }
  };

  const handleSaveStudentChanges = async () => {
    if (!manageTagId || !localSelected) return;
    setIsSavingStudents(true);
    try {
      const toAdd = [...localSelected].filter(id => !assignedStudentIds.has(id));
      const toRemove = [...assignedStudentIds].filter(id => !localSelected.has(id));
      
      for (const studentId of toRemove) {
        await supabase
          .from("student_tag_assignments")
          .delete()
          .eq("student_id", studentId)
          .eq("tag_id", manageTagId);
      }
      
      if (toAdd.length > 0) {
        await supabase
          .from("student_tag_assignments")
          .insert(toAdd.map(studentId => ({ student_id: studentId, tag_id: manageTagId })));
      }
      
      queryClient.invalidateQueries({ queryKey: ["student-tag-assignments"] });
      toast.success(`학생 ${toAdd.length}명 추가, ${toRemove.length}명 제거`);
      setManageTagId(null);
      setLocalSelected(null);
      setStudentSearch("");
    } catch {
      toast.error("저장에 실패했습니다");
    } finally {
      setIsSavingStudents(false);
    }
  };

  const handleOpenBulkSms = (tagId: string) => {
    const studentIds = assignmentsByTag[tagId] || new Set();
    const students = allStudents.filter((s) => studentIds.has(s.id));
    const hasStudents = students.some((s) => s.student_phone && s.access_code?.code);
    if (!hasStudents) {
      toast.error("전화번호와 접속코드가 등록된 학생이 없습니다");
      return;
    }
    setBulkSmsTagId(tagId);
    setBulkSmsMessage(
      `[Pcube] 접속 안내\n{학생이름} 학생의 접속 코드는 {접속코드} 입니다.\n접속 주소: https://yonglish.co.kr`
    );
  };

  const handleSendBulkSms = async () => {
    if (!bulkSmsTagId || !bulkSmsMessage.trim()) return;
    const studentIds = assignmentsByTag[bulkSmsTagId] || new Set();
    const students = allStudents.filter(
      (s) => studentIds.has(s.id) && s.student_phone && s.access_code?.code
    );
    if (students.length === 0) {
      toast.error("발송 가능한 학생이 없습니다");
      return;
    }

    setIsSendingBulkSms(true);
    let successCount = 0;
    let failCount = 0;

    for (const student of students) {
      const msg = bulkSmsMessage
        .replace(/\{학생이름\}/g, student.name)
        .replace(/\{접속코드\}/g, student.access_code?.code || "");
      try {
        const response = await supabase.functions.invoke("send-kakao-notification", {
          body: {
            studentId: student.id,
            studentName: student.name,
            submissionType: "code",
            messageTemplate: msg,
            brandPrefix: "",
            messageType: "sms",
            recipientType: "student",
            ownerCodeId: ownerCodeId,
          },
        });
        if (response.data?.success) successCount++;
        else failCount++;
      } catch {
        failCount++;
      }
    }

    setIsSendingBulkSms(false);
    setBulkSmsTagId(null);

    if (failCount === 0) {
      toast.success(`${successCount}명에게 문자를 발송했습니다`);
    } else {
      toast.warning(`성공 ${successCount}명, 실패 ${failCount}명`);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="그룹 관리"
        description="학교가 달라도 태그로 학생들을 그룹화하여 관리합니다"
        icon={Tag}
      />

      <div className="flex justify-end">
        <Button onClick={() => handleOpenCreate()}>
          <Plus className="w-4 h-4 mr-2" />
          그룹 추가
        </Button>
      </div>

      {tagsLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
        </div>
      ) : tags.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Tag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">등록된 그룹이 없습니다</h3>
              <p className="text-sm text-muted-foreground mb-4">
                "그룹 추가" 버튼을 눌러 첫 번째 그룹을 만들어보세요.
              </p>
              <Button onClick={() => handleOpenCreate()}>
                <Plus className="w-4 h-4 mr-2" />
                그룹 추가
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {tags.map((tag) => {
            const studentIds = assignmentsByTag[tag.id] || new Set();
            const students = allStudents.filter((s) => studentIds.has(s.id));
            const isExpanded = expandedTags.has(tag.id);

            return (
              <Card
                key={tag.id}
                onDragOver={(e) => {
                  if (!draggingStudent || draggingStudent.fromTagId === tag.id) return;
                  e.preventDefault();
                  setDragOverTagId(tag.id);
                }}
                onDragLeave={() => setDragOverTagId((prev) => (prev === tag.id ? null : prev))}
                onDrop={(e) => { e.preventDefault(); handleDropOnTag(tag.id); }}
                className={cn(
                  "overflow-hidden rounded-2xl border-border/50 shadow-sm hover:shadow-md transition-all duration-300",
                  dragOverTagId === tag.id && "ring-2 ring-primary/60 bg-primary/5 shadow-md"
                )}
              >
                {/* 헤더: 태그 컬러 인디케이터 바 */}
                <div className="h-1" style={{ background: `linear-gradient(90deg, ${tag.color}, ${tag.color}80)` }} />
                <CardHeader className="pb-2 pt-4">
                  <div className="flex items-center justify-between">
                    <div
                      className="flex items-center gap-3 cursor-pointer flex-1 group"
                      onClick={() => toggleTag(tag.id)}
                    >
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105"
                        style={{ backgroundColor: tag.color + '15' }}
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" style={{ color: tag.color }} />
                        ) : (
                          <ChevronRight className="w-4 h-4" style={{ color: tag.color }} />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-[15px] tracking-tight">{tag.name}</CardTitle>
                        <span className="text-[11px] text-muted-foreground/70">{students.length}명</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-xl hover:bg-primary/5"
                        onClick={() => setManageTagId(tag.id)}
                        title="학생 관리"
                      >
                        <UserPlus className="w-4 h-4 text-primary/70" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-muted/60">
                            <MoreVertical className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenBulkSms(tag.id)}>
                            <MessageSquare className="w-4 h-4 mr-2" />
                            접속코드 단체 문자
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenCreate(tag)}>
                            <Edit2 className="w-4 h-4 mr-2" />
                            수정
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteTagId(tag.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            삭제
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  {/* 미니 학생 태그 (접힌 상태) */}
                  {!isExpanded && students.length > 0 && (() => {
                    const bySchool: Record<string, typeof students> = {};
                    students.forEach((s) => {
                      const schoolName = s.grade?.school?.name || "미지정";
                      if (!bySchool[schoolName]) bySchool[schoolName] = [];
                      bySchool[schoolName].push(s);
                    });
                    return (
                      <div className="mt-2.5 ml-11 space-y-1.5">
                        {Object.entries(bySchool).sort(([a], [b]) => a.localeCompare(b)).map(([schoolName, schoolStudents]) => (
                          <div key={schoolName} className="flex flex-wrap items-center gap-1">
                            {schoolStudents[0]?.grade?.school?.logo_url ? (
                              <img src={schoolStudents[0].grade.school.logo_url} alt="" className="w-3.5 h-3.5 rounded-full object-cover ring-1 ring-border/30" />
                            ) : (
                              <div className="w-3.5 h-3.5 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-[7px] font-bold text-primary/60">{schoolName[0]}</span>
                              </div>
                            )}
                            <span className="text-[10px] font-medium text-muted-foreground/60 mr-0.5">{schoolName}</span>
                            {schoolStudents.slice(0, 6).map((s) => (
                              <span
                                key={s.id}
                                draggable
                                onDragStart={() => setDraggingStudent({ id: s.id, name: s.name, fromTagId: tag.id })}
                                onDragEnd={() => { setDraggingStudent(null); setDragOverTagId(null); }}
                                className={cn(
                                  "inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-md bg-muted/40 text-foreground/70 cursor-grab active:cursor-grabbing",
                                  draggingStudent?.id === s.id && draggingStudent?.fromTagId === tag.id && "opacity-40"
                                )}
                                title="드래그해서 다른 그룹으로 이동"
                              >
                                <span className="opacity-40">{s.grade?.name}</span>
                                <span className="font-medium">{s.name}</span>
                              </span>
                            ))}
                            {schoolStudents.length > 6 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted/40 text-muted-foreground">
                                +{schoolStudents.length - 6}명
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </CardHeader>
                {isExpanded && (
                  <CardContent className="pt-1 pb-4">
                    {students.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground/70 text-sm">
                        배정된 학생이 없습니다
                        <Button
                          variant="link"
                          size="sm"
                          className="ml-1 p-0 h-auto text-primary/70"
                          onClick={() => setManageTagId(tag.id)}
                        >
                          학생 추가하기
                        </Button>
                      </div>
                    ) : (() => {
                      const bySchool: Record<string, typeof students> = {};
                      students.forEach((s) => {
                        const schoolName = s.grade?.school?.name || "미지정";
                        if (!bySchool[schoolName]) bySchool[schoolName] = [];
                        bySchool[schoolName].push(s);
                      });
                      return (
                        <div className="space-y-3 ml-2">
                          {Object.entries(bySchool).sort(([a], [b]) => a.localeCompare(b)).map(([schoolName, schoolStudents]) => (
                            <div key={schoolName}>
                              <div className="flex items-center gap-2 mb-2">
                                {schoolStudents[0]?.grade?.school?.logo_url ? (
                                  <img src={schoolStudents[0].grade.school.logo_url} alt="" className="w-4 h-4 rounded-full object-cover ring-1 ring-border/30" />
                                ) : (
                                  <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="text-[8px] font-semibold text-primary/70">{schoolName.charAt(0)}</span>
                                  </div>
                                )}
                                <span className="text-xs font-medium text-foreground/70">{schoolName}</span>
                                <div className="flex-1 h-px bg-border/30" />
                                <span className="text-[10px] text-muted-foreground/50">{schoolStudents.length}명</span>
                              </div>
                              <div className="grid grid-cols-2 gap-1.5 ml-6">
                                {schoolStudents
                                  .sort((a, b) => a.name.localeCompare(b.name))
                                  .map((s) => (
                                    <div
                                      key={s.id}
                                      draggable
                                      onDragStart={() => setDraggingStudent({ id: s.id, name: s.name, fromTagId: tag.id })}
                                      onDragEnd={() => { setDraggingStudent(null); setDragOverTagId(null); }}
                                      title="드래그해서 다른 그룹으로 이동"
                                      className={cn(
                                        "flex items-center justify-between px-3 py-2 rounded-xl bg-muted/20 border border-border/30 hover:bg-muted/40 transition-colors group/student cursor-grab active:cursor-grabbing",
                                        draggingStudent?.id === s.id && draggingStudent?.fromTagId === tag.id && "opacity-40"
                                      )}
                                    >
                                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                        <p className="text-sm font-medium truncate flex items-center gap-1.5">
                                          <span className="text-[9px] text-muted-foreground/50 font-normal">{s.grade?.name}</span>
                                          {s.name}
                                        </p>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 flex-shrink-0 opacity-0 group-hover/student:opacity-100 transition-opacity rounded-lg"
                                        onClick={() =>
                                          removeStudent.mutate({ studentId: s.id, tagId: tag.id })
                                        }
                                      >
                                        <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                                      </Button>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* 그룹 생성/수정 다이얼로그 */}
      <Dialog open={isCreateTagOpen} onOpenChange={setIsCreateTagOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editingTag ? "그룹 수정" : "새 그룹 추가"}</DialogTitle>
            <DialogDescription>
              학교가 달라도 학생들을 하나의 그룹으로 묶을 수 있습니다
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>그룹 이름</Label>
              <Input
                placeholder="예: 수능반, A반, 월수금반"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveTag()}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label>색상</Label>
              <div className="flex gap-2 flex-wrap">
                {TAG_COLORS.map((c) => (
                  <button
                    key={c}
                    className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center"
                    style={{
                      backgroundColor: c,
                      borderColor: newTagColor === c ? "hsl(var(--foreground))" : "transparent",
                    }}
                    onClick={() => setNewTagColor(c)}
                  >
                    {newTagColor === c && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateTagOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSaveTag} disabled={createTag.isPending || updateTag.isPending}>
              {editingTag ? "수정" : "추가"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 학생 관리 다이얼로그 */}
      <Dialog open={!!manageTagId} onOpenChange={(open) => {
        if (!open) {
          setManageTagId(null);
          setLocalSelected(null);
          setStudentSearch("");
        }
      }}>
        <DialogContent className="max-w-lg max-h-[85vh] flex flex-col gap-3">
          <DialogHeader className="pb-0">
            <DialogTitle className="flex items-center gap-2 text-base">
              {manageTag && (
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: manageTag.color }}
                />
              )}
              {manageTag?.name} - 학생 관리
            </DialogTitle>
            <DialogDescription className="text-xs">
              학생을 선택한 후 확인 버튼을 눌러 저장하세요
            </DialogDescription>
          </DialogHeader>

          {/* 검색 + 요약 바 */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="학생이름, 학교명으로 검색..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs font-normal gap-1">
                  <Check className="w-3 h-3" />
                  {currentSelected.size}명 선택
                </Badge>
                {localSelected && currentSelected.size !== assignedStudentIds.size && (
                  <Badge variant="outline" className="text-xs text-orange-600 border-orange-300">
                    변경사항 있음
                  </Badge>
                )}
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs px-2"
                  onClick={() => {
                    const all = new Set(filteredStudents.map(s => s.id));
                    setLocalSelected(all);
                  }}
                >
                  전체선택
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs px-2"
                  onClick={() => setLocalSelected(new Set())}
                >
                  전체해제
                </Button>
              </div>
            </div>
          </div>

          {/* 학생 목록 */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-0 border rounded-lg p-2">
            {studentsBySchoolAndGrade.map(({ school, grades }) => (
              <div key={school}>
                <div className="flex items-center justify-between mb-1.5 sticky top-0 bg-background/95 backdrop-blur py-1 z-10">
                  <div className="flex items-center gap-1.5">
                    <School className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs font-semibold text-foreground">
                      {school}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[10px] px-1.5 text-muted-foreground"
                    onClick={() => {
                      const schoolStudentIds = grades.flatMap(g => g.students.map(s => s.id));
                      const allSelected = schoolStudentIds.every(id => currentSelected.has(id));
                      const next = new Set(currentSelected);
                      schoolStudentIds.forEach(id => {
                        if (allSelected) next.delete(id); else next.add(id);
                      });
                      setLocalSelected(next);
                    }}
                  >
                    {grades.flatMap(g => g.students.map(s => s.id)).every(id => currentSelected.has(id))
                      ? "전체해제" : "전체선택"}
                  </Button>
                </div>
                <div className="space-y-1.5 ml-1">
                  {grades.map(({ grade, students }) => (
                    <div key={grade}>
                      <div className="flex items-center justify-between mb-0.5 sticky top-7 bg-background/90 backdrop-blur py-0.5 z-[5]">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-medium text-muted-foreground">
                            {grade}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            ({students.filter(s => currentSelected.has(s.id)).length}/{students.length}명)
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 text-[10px] px-1 text-muted-foreground"
                          onClick={() => {
                            const gradeIds = students.map(s => s.id);
                            const allSelected = gradeIds.every(id => currentSelected.has(id));
                            const next = new Set(currentSelected);
                            gradeIds.forEach(id => {
                              if (allSelected) next.delete(id); else next.add(id);
                            });
                            setLocalSelected(next);
                          }}
                        >
                          {students.every(s => currentSelected.has(s.id)) ? "해제" : "선택"}
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-0.5">
                        {students.map((s) => {
                          const isSelected = currentSelected.has(s.id);
                          return (
                            <label
                              key={s.id}
                              className={`flex items-center gap-2 p-1.5 rounded-md cursor-pointer transition-colors text-sm ${
                                isSelected
                                  ? "bg-primary/10 border border-primary/20"
                                  : "hover:bg-secondary/50 border border-transparent"
                              }`}
                            >
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => {
                                  const next = new Set(currentSelected);
                                  if (isSelected) next.delete(s.id); else next.add(s.id);
                                  setLocalSelected(next);
                                }}
                              />
                              <span className={`text-sm truncate ${isSelected ? "font-medium" : ""}`}>
                                {s.name}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {studentsBySchoolAndGrade.length === 0 && (
              <div className="text-center py-8 text-sm text-muted-foreground">
                검색 결과가 없습니다
              </div>
            )}
          </div>

          {/* 확인/취소 버튼 */}
          <DialogFooter className="pt-0">
            <Button
              variant="outline"
              onClick={() => {
                setManageTagId(null);
                setLocalSelected(null);
                setStudentSearch("");
              }}
            >
              취소
            </Button>
            <Button
              onClick={handleSaveStudentChanges}
              disabled={!localSelected || isSavingStudents}
            >
              {isSavingStudents ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  저장 중...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  확인
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 */}
      <AlertDialog open={!!deleteTagId} onOpenChange={(open) => !open && setDeleteTagId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>그룹을 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 그룹에 배정된 학생들의 태그가 모두 해제됩니다. 학생 데이터는 삭제되지 않습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteTagId && deleteTag.mutate(deleteTagId)}
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 단체 문자 발송 다이얼로그 */}
      <Dialog open={!!bulkSmsTagId} onOpenChange={(open) => !open && setBulkSmsTagId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              접속코드 단체 문자 발송
            </DialogTitle>
            <DialogDescription>
              {bulkSmsTagId && (() => {
                const tag = tags.find((t) => t.id === bulkSmsTagId);
                const studentIds = assignmentsByTag[bulkSmsTagId] || new Set();
                const eligible = allStudents.filter(
                  (s) => studentIds.has(s.id) && s.student_phone && s.access_code?.code
                );
                const noPhone = allStudents.filter(
                  (s) => studentIds.has(s.id) && (!s.student_phone || !s.access_code?.code)
                );
                return (
                  <>
                    <strong>{tag?.name}</strong> 그룹의 학생 {eligible.length}명에게 문자를 발송합니다.
                    {noPhone.length > 0 && (
                      <span className="text-destructive"> (전화번호 또는 코드 미등록 {noPhone.length}명 제외)</span>
                    )}
                  </>
                );
              })()}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">
                메시지 내용 (<code className="text-[10px]">{"{학생이름}"}</code>, <code className="text-[10px]">{"{접속코드}"}</code> 자동 치환)
              </Label>
              <Textarea
                value={bulkSmsMessage}
                onChange={(e) => setBulkSmsMessage(e.target.value)}
                rows={5}
                className="text-sm"
              />
            </div>
            <div className="p-3 bg-muted rounded-lg text-xs space-y-1">
              <p className="font-medium text-muted-foreground">미리보기 (첫 번째 학생)</p>
              <p className="whitespace-pre-line text-foreground">
                {bulkSmsTagId && (() => {
                  const studentIds = assignmentsByTag[bulkSmsTagId] || new Set();
                  const first = allStudents.find(
                    (s) => studentIds.has(s.id) && s.student_phone && s.access_code?.code
                  );
                  if (!first) return "발송 가능한 학생이 없습니다";
                  return bulkSmsMessage
                    .replace(/\{학생이름\}/g, first.name)
                    .replace(/\{접속코드\}/g, first.access_code?.code || "");
                })()}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkSmsTagId(null)} disabled={isSendingBulkSms}>
              취소
            </Button>
            <Button onClick={handleSendBulkSms} disabled={isSendingBulkSms}>
              {isSendingBulkSms ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  발송 중...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-1" />
                  전체 발송
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
