import { useState, useEffect, useRef } from "react";
import { BarChart3, BookOpen, Calendar, ChevronDown, ChevronRight, ClipboardList, Copy, Edit2, FileText, Image, Key, MessageCircle, MessageSquare, MoreVertical, Plus, School as SchoolIcon, Trash2, Upload, UserPlus, Users } from "lucide-react";
import { useOwnerFilter } from "@/hooks/useOwnerFilter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cacheBustUrl } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "sonner";
import { Loader2, School as SchoolIconLucide2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { QuickMessageDialog } from "@/components/dashboard/QuickMessageDialog";
import { QuickKakaoDialog } from "@/components/dashboard/QuickKakaoDialog";
import MockExamScoreSheet from "@/components/schools/MockExamScoreSheet";
import ExamCorrelationAnalysis from "@/components/schools/ExamCorrelationAnalysis";
import StudentExcelManager from "@/components/schools/StudentExcelManager";
import { BulkAddPassagesDialog } from "@/components/passages/BulkAddPassagesDialog";

interface Student {
  id: string;
  name: string;
  grade_id: string;
  student_phone: string | null;
  parent_phone: string | null;
  parent_email: string | null;
  access_code_id: string | null;
  access_codes: {
    id: string;
    code: string;
    is_active: boolean;
  } | null;
}

export default function Schools() {
  const queryClient = useQueryClient();
  const { ownerCodeId, isAdmin, shouldFilter } = useOwnerFilter();
  const [isAddSchoolDialogOpen, setIsAddSchoolDialogOpen] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState("");
  const [editingSchool, setEditingSchool] = useState<{ id: string; name: string; logo_url?: string | null } | null>(null);
  const [newSchoolLogoFile, setNewSchoolLogoFile] = useState<File | null>(null);
  const [newSchoolLogoPreview, setNewSchoolLogoPreview] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [deleteConfirmSchoolId, setDeleteConfirmSchoolId] = useState<string | null>(null);
  const [deleteConfirmSchoolName, setDeleteConfirmSchoolName] = useState<string>("");
  const [deleteConfirmStudentId, setDeleteConfirmStudentId] = useState<string | null>(null);
  const [deleteConfirmStudentName, setDeleteConfirmStudentName] = useState<string>("");
  const logoInputRef = useRef<HTMLInputElement>(null);

  // 학년 관련 state
  const [isAddGradeDialogOpen, setIsAddGradeDialogOpen] = useState(false);
  const [newGradeName, setNewGradeName] = useState("");
  const [gradeSchoolId, setGradeSchoolId] = useState<string>("");
  const [editingGrade, setEditingGrade] = useState<{ id: string; name: string; school_id: string } | null>(null);

  // 지문 관련 state
  const [isPassageDialogOpen, setIsPassageDialogOpen] = useState(false);
  const [passageTitle, setPassageTitle] = useState("");
  const [passageContent, setPassageContent] = useState("");
  const [passageSchoolId, setPassageSchoolId] = useState<string>("");
  const [passageGradeId, setPassageGradeId] = useState<string>("");
  const [editingPassage, setEditingPassage] = useState<{ id: string; title: string; content: string; school_id: string | null; grade_id: string | null } | null>(null);
  
  // 트리 펼침 상태
  const [expandedSchools, setExpandedSchools] = useState<Set<string>>(new Set());
  const [expandedGrades, setExpandedGrades] = useState<Set<string>>(new Set());

  // 학생 관련 state
  const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false);
  const [studentGradeId, setStudentGradeId] = useState<string>("");
  const [studentGradeName, setStudentGradeName] = useState<string>("");
  const [studentSchoolName, setStudentSchoolName] = useState<string>("");
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentPhone, setNewStudentPhone] = useState("");
  const [newParentPhone, setNewParentPhone] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [newStudentEmail, setNewStudentEmail] = useState("");
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [quickSmsStudent, setQuickSmsStudent] = useState<Student | null>(null);
  const [quickKakaoStudent, setQuickKakaoStudent] = useState<Student | null>(null);
  const [codeSmsStudent, setCodeSmsStudent] = useState<{ id: string; name: string; student_phone: string; code: string } | null>(null);
  
  // D-DAY 설정 state
  const [ddaySchool, setDdaySchool] = useState<{ id: string; name: string; exam_name: string; exam_date: string } | null>(null);
  const [ddayExamName, setDdayExamName] = useState("");
  const [ddayExamDate, setDdayExamDate] = useState("");

  // Fetch schools from DB
  const { data: dbSchools = [], isLoading: schoolsLoading } = useQuery({
    queryKey: ["schools", ownerCodeId, isAdmin],
    queryFn: async () => {
      let query = supabase
        .from("schools")
        .select("*")
        .order("name");
      if (shouldFilter) {
        query = query.eq("owner_code_id", ownerCodeId!);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // 그룹(태그) 목록 조회
  const { data: allTags = [] } = useQuery({
    queryKey: ["student-tags-for-schools", ownerCodeId, isAdmin],
    queryFn: async () => {
      let query = supabase.from("student_tags").select("id, name, color").order("name");
      if (!isAdmin && ownerCodeId) query = query.eq("owner_code_id", ownerCodeId);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // 태그-학생 매핑 조회
  const { data: tagAssignments = [] } = useQuery({
    queryKey: ["student-tag-assignments-for-schools"],
    queryFn: async () => {
      const { data, error } = await supabase.from("student_tag_assignments").select("student_id, tag_id");
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
  const createSchool = useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from("schools")
        .insert({ name, owner_code_id: ownerCodeId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("학교가 추가되었습니다!");
      queryClient.invalidateQueries({ queryKey: ["schools"] });
      setNewSchoolName("");
      setIsAddSchoolDialogOpen(false);
    },
    onError: () => {
      toast.error("학교 추가에 실패했습니다.");
    },
  });

  // Update school mutation
  const updateSchool = useMutation({
    mutationFn: async ({ id, name, logo_url }: { id: string; name: string; logo_url?: string | null }) => {
      const { data, error } = await supabase
        .from("schools")
        .update({ name, logo_url })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("학교가 수정되었습니다!");
      queryClient.invalidateQueries({ queryKey: ["schools"] });
      setEditingSchool(null);
      setNewSchoolName("");
      setNewSchoolLogoFile(null);
      setNewSchoolLogoPreview(null);
      setIsAddSchoolDialogOpen(false);
    },
    onError: () => {
      toast.error("학교 수정에 실패했습니다.");
    },
  });

  // Update school D-DAY mutation
  const updateSchoolDday = useMutation({
    mutationFn: async ({ id, exam_name, exam_date }: { id: string; exam_name: string | null; exam_date: string | null }) => {
      const { error } = await supabase
        .from("schools")
        .update({ exam_name, exam_date })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("D-DAY가 설정되었습니다!");
      queryClient.invalidateQueries({ queryKey: ["schools"] });
      setDdaySchool(null);
    },
    onError: () => {
      toast.error("D-DAY 설정에 실패했습니다.");
    },
  });

  // Delete school mutation
  const deleteSchool = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("schools").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("학교가 삭제되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["schools"] });
      queryClient.invalidateQueries({ queryKey: ["grades"] });
    },
    onError: () => {
      toast.error("학교 삭제에 실패했습니다. 먼저 학년과 지문을 삭제해주세요.");
    },
  });

  // Create grade mutation
  const createGrade = useMutation({
    mutationFn: async ({ name, schoolId }: { name: string; schoolId: string }) => {
      const { data, error } = await supabase
        .from("grades")
        .insert({ name, school_id: schoolId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("학년이 추가되었습니다!");
      queryClient.invalidateQueries({ queryKey: ["grades"] });
      resetGradeForm();
    },
    onError: () => {
      toast.error("학년 추가에 실패했습니다.");
    },
  });

  // Update grade mutation
  const updateGrade = useMutation({
    mutationFn: async ({ id, name, schoolId }: { id: string; name: string; schoolId: string }) => {
      const { data, error } = await supabase
        .from("grades")
        .update({ name, school_id: schoolId })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("학년이 수정되었습니다!");
      queryClient.invalidateQueries({ queryKey: ["grades"] });
      resetGradeForm();
    },
    onError: () => {
      toast.error("학년 수정에 실패했습니다.");
    },
  });

  // Delete grade mutation
  const deleteGrade = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("grades").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("학년이 삭제되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["grades"] });
    },
    onError: () => {
      toast.error("학년 삭제에 실패했습니다. 먼저 학생과 지문을 삭제해주세요.");
    },
  });

  const resetGradeForm = () => {
    setNewGradeName("");
    setGradeSchoolId("");
    setEditingGrade(null);
    setIsAddGradeDialogOpen(false);
  };

  const handleSchoolSubmit = () => {
    if (!newSchoolName.trim()) {
      toast.error("학교명을 입력해주세요.");
      return;
    }
    if (editingSchool) {
      updateSchool.mutate({ id: editingSchool.id, name: newSchoolName });
    } else {
      createSchool.mutate(newSchoolName);
    }
  };

  const handleEditSchool = (school: { id: string; name: string; logo_url?: string | null }) => {
    setEditingSchool(school);
    setNewSchoolName(school.name);
    setNewSchoolLogoPreview(school.logo_url || null);
    setIsAddSchoolDialogOpen(true);
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewSchoolLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewSchoolLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadLogo = async (schoolId: string, file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const fileName = `${schoolId}_${timestamp}.${fileExt}`;
    const filePath = `${fileName}`;

    // 기존 로고 파일 삭제 (캐시 문제 방지)
    const { data: existingFiles } = await supabase.storage
      .from('school-logos')
      .list('', { search: schoolId });
    
    if (existingFiles && existingFiles.length > 0) {
      const filesToRemove = existingFiles
        .filter(f => f.name.startsWith(schoolId))
        .map(f => f.name);
      if (filesToRemove.length > 0) {
        await supabase.storage.from('school-logos').remove(filesToRemove);
      }
    }

    const { error: uploadError } = await supabase.storage
      .from('school-logos')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('school-logos')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSchoolSubmitWithLogo = async () => {
    if (!newSchoolName.trim()) {
      toast.error("학교명을 입력해주세요.");
      return;
    }

    setIsUploadingLogo(true);

    try {
      if (editingSchool) {
        let logoUrl = editingSchool.logo_url;
        
        if (newSchoolLogoFile) {
          logoUrl = await uploadLogo(editingSchool.id, newSchoolLogoFile);
        } else if (newSchoolLogoPreview && newSchoolLogoPreview !== editingSchool.logo_url) {
          // 저장된 로고 선택 (기존 URL 재사용)
          logoUrl = newSchoolLogoPreview;
        }
        
        updateSchool.mutate({ id: editingSchool.id, name: newSchoolName, logo_url: logoUrl });
      } else {
        // 새 학교 생성 후 로고 업로드
        const { data: newSchool, error } = await supabase
          .from("schools")
          .insert({ name: newSchoolName, owner_code_id: ownerCodeId })
          .select()
          .single();
        
        if (error) throw error;

        if (newSchoolLogoFile && newSchool) {
          const logoUrl = await uploadLogo(newSchool.id, newSchoolLogoFile);
          await supabase
            .from("schools")
            .update({ logo_url: logoUrl })
            .eq("id", newSchool.id);
        } else if (newSchoolLogoPreview && newSchool) {
          // 저장된 로고 URL 재사용
          await supabase
            .from("schools")
            .update({ logo_url: newSchoolLogoPreview })
            .eq("id", newSchool.id);
        }

        toast.success("학교가 추가되었습니다!");
        queryClient.invalidateQueries({ queryKey: ["schools"] });
        setNewSchoolName("");
        setNewSchoolLogoFile(null);
        setNewSchoolLogoPreview(null);
        setIsAddSchoolDialogOpen(false);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("학교 저장에 실패했습니다.");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleGradeSubmit = () => {
    if (!newGradeName.trim()) {
      toast.error("학년명을 입력해주세요.");
      return;
    }
    if (!gradeSchoolId) {
      toast.error("학교를 선택해주세요.");
      return;
    }
    if (editingGrade) {
      updateGrade.mutate({ id: editingGrade.id, name: newGradeName, schoolId: gradeSchoolId });
    } else {
      createGrade.mutate({ name: newGradeName, schoolId: gradeSchoolId });
    }
  };

  const handleEditGrade = (grade: { id: string; name: string; school_id: string }) => {
    setEditingGrade(grade);
    setNewGradeName(grade.name);
    setGradeSchoolId(grade.school_id);
    setIsAddGradeDialogOpen(true);
  };

  const handleAddGradeToSchool = (schoolId: string) => {
    setGradeSchoolId(schoolId);
    setEditingGrade(null);
    setNewGradeName("");
    setIsAddGradeDialogOpen(true);
  };

  // Fetch grades from DB
  const { data: dbGrades = [] } = useQuery({
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

  // 학년 데이터 로드 시 모든 학년을 펼친 상태로 초기화
  useEffect(() => {
    if (dbGrades.length > 0) {
      setExpandedGrades(new Set(dbGrades.map(g => g.id)));
    }
  }, [dbGrades]);

  // Fetch students from DB with access codes
  const { data: dbStudents = [] } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select(`
          *,
          access_codes:access_code_id(id, code, is_active)
        `)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  // Get students for a specific grade
  const getStudentsForGrade = (gradeId: string) => {
    return dbStudents.filter(s => s.grade_id === gradeId);
  };

  // 5자리 접속코드 생성 (숫자 + 알파벳)
  const generateAccessCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 혼동되기 쉬운 문자 제외 (0, O, 1, I)
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  // Create student mutation
  const createStudent = useMutation({
    mutationFn: async ({ name, gradeId, studentPhone, parentPhone, parentEmail }: { name: string; gradeId: string; studentPhone: string; parentPhone: string; parentEmail: string }) => {
      // 먼저 접속코드 생성
      const accessCode = generateAccessCode();
      
      // 접속코드 저장
      const { data: codeData, error: codeError } = await supabase
        .from("access_codes")
        .insert({
          name: name,
          code: accessCode,
          role: "student",
          is_admin: false,
          is_active: true,
        })
        .select()
        .single();
      
      if (codeError) throw codeError;

      // 학생 저장 (접속코드 연결)
      const { data, error } = await supabase
        .from("students")
        .insert({ 
          name, 
          grade_id: gradeId,
          student_phone: studentPhone || null,
          parent_phone: parentPhone || null,
          parent_email: parentEmail || null,
          access_code_id: codeData.id
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("학생과 접속코드가 생성되었습니다!");
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["access-codes"] });
      queryClient.invalidateQueries({ queryKey: ["all-students-with-grades"] });
      queryClient.invalidateQueries({ queryKey: ["daily-submissions-status"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      resetStudentForm();
    },
    onError: () => {
      toast.error("학생 추가에 실패했습니다.");
    },
  });

  // Update student mutation
  const updateStudent = useMutation({
    mutationFn: async ({ id, name, studentPhone, parentPhone, parentEmail }: { id: string; name: string; studentPhone: string; parentPhone: string; parentEmail: string }) => {
      const { data, error } = await supabase
        .from("students")
        .update({ 
          name,
          student_phone: studentPhone || null,
          parent_phone: parentPhone || null,
          parent_email: parentEmail || null
        })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("학생 정보가 수정되었습니다!");
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["all-students-with-grades"] });
      queryClient.invalidateQueries({ queryKey: ["daily-submissions-status"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      resetStudentForm();
    },
    onError: () => {
      toast.error("학생 수정에 실패했습니다.");
    },
  });

  // Delete student mutation
  const deleteStudent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("students").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("학생이 삭제되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["access-codes"] });
      queryClient.invalidateQueries({ queryKey: ["all-students-with-grades"] });
      queryClient.invalidateQueries({ queryKey: ["daily-submissions-status"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: () => {
      toast.error("학생 삭제에 실패했습니다. 먼저 제출물을 삭제해주세요.");
    },
  });

  // 기존 학생에게 접속코드 발급
  const generateCodeForStudent = useMutation({
    mutationFn: async ({ studentId, studentName }: { studentId: string; studentName: string }) => {
      // 접속코드 생성
      const accessCode = generateAccessCode();
      
      // 접속코드 저장
      const { data: codeData, error: codeError } = await supabase
        .from("access_codes")
        .insert({
          name: studentName,
          code: accessCode,
          role: "student",
          is_admin: false,
          is_active: true,
        })
        .select()
        .single();
      
      if (codeError) throw codeError;

      // 학생에 접속코드 연결
      const { error } = await supabase
        .from("students")
        .update({ access_code_id: codeData.id })
        .eq("id", studentId);
      
      if (error) throw error;
      return codeData;
    },
    onSuccess: () => {
      toast.success("접속코드가 발급되었습니다!");
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["access-codes"] });
    },
    onError: () => {
      toast.error("접속코드 발급에 실패했습니다.");
    },
  });

  const resetStudentForm = () => {
    setNewStudentName("");
    setNewStudentPhone("");
    setNewParentPhone("");
    setNewStudentEmail("");
    setStudentGradeId("");
    setStudentGradeName("");
    setStudentSchoolName("");
    setEditingStudent(null);
    setSelectedTagIds([]);
    setIsAddStudentDialogOpen(false);
  };

  const handleAddStudentToGrade = (gradeId: string, gradeName: string, schoolName: string) => {
    setStudentGradeId(gradeId);
    setStudentGradeName(gradeName);
    setStudentSchoolName(schoolName);
    setEditingStudent(null);
    setNewStudentName("");
    setNewStudentPhone("");
    setNewParentPhone("");
    setNewStudentEmail("");
    setSelectedTagIds([]);
    setIsAddStudentDialogOpen(true);
  };

  const handleEditStudent = (student: Student, gradeName: string, schoolName: string) => {
    setEditingStudent(student);
    setStudentGradeId(student.grade_id);
    setStudentGradeName(gradeName);
    setStudentSchoolName(schoolName);
    setNewStudentName(student.name);
    setNewStudentPhone(student.student_phone || "");
    setNewParentPhone(student.parent_phone || "");
    setNewStudentEmail(student.parent_email || "");
    // 기존 태그 로드
    const existingTags = tagAssignments.filter((a: any) => a.student_id === student.id).map((a: any) => a.tag_id);
    setSelectedTagIds(existingTags);
    setIsAddStudentDialogOpen(true);
  };

  const saveTagAssignments = async (studentId: string) => {
    // 기존 태그 삭제 후 새로 저장
    await supabase.from("student_tag_assignments").delete().eq("student_id", studentId);
    if (selectedTagIds.length > 0) {
      await supabase.from("student_tag_assignments").insert(
        selectedTagIds.map((tagId) => ({ student_id: studentId, tag_id: tagId }))
      );
    }
    queryClient.invalidateQueries({ queryKey: ["student-tag-assignments"] });
  };

  const handleStudentSubmit = async () => {
    if (!newStudentName.trim()) {
      toast.error("학생 이름을 입력해주세요.");
      return;
    }
    if (editingStudent) {
      updateStudent.mutate({ 
        id: editingStudent.id, 
        name: newStudentName, 
        studentPhone: newStudentPhone,
        parentPhone: newParentPhone,
        parentEmail: newStudentEmail
      }, {
        onSuccess: async () => {
          await saveTagAssignments(editingStudent.id);
        }
      });
    } else {
      createStudent.mutate({ 
        name: newStudentName, 
        gradeId: studentGradeId,
        studentPhone: newStudentPhone,
        parentPhone: newParentPhone,
        parentEmail: newStudentEmail
      }, {
        onSuccess: async (data: any) => {
          if (data?.id) await saveTagAssignments(data.id);
        }
      });
    }
  };

  // Fetch passages with school/grade info
  const { data: passages = [], isLoading: passagesLoading } = useQuery({
    queryKey: ["passages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("passages")
        .select(`
          *,
          schools:school_id(id, name),
          grades:grade_id(id, name)
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Get grades for a specific school
  const getGradesForSchool = (schoolId: string) => {
    return dbGrades.filter(g => g.school_id === schoolId);
  };

  // Get passages for a specific grade
  const getPassagesForGrade = (gradeId: string) => {
    return passages.filter(p => p.grade_id === gradeId);
  };

  // Create passage mutation
  const createPassage = useMutation({
    mutationFn: async ({ title, content, schoolId, gradeId }: { title: string; content: string; schoolId: string; gradeId: string }) => {
      const sentences = content
        .split(/(?<=[.!?])\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const { data, error } = await supabase
        .from("passages")
        .insert({ 
          title, 
          content, 
          sentences,
          school_id: schoolId,
          grade_id: gradeId
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("지문이 등록되었습니다!");
      queryClient.invalidateQueries({ queryKey: ["passages"] });
      resetPassageForm();
    },
    onError: () => {
      toast.error("지문 등록에 실패했습니다.");
    },
  });

  // Update passage mutation
  const updatePassage = useMutation({
    mutationFn: async ({ id, title, content, schoolId, gradeId }: { id: string; title: string; content: string; schoolId: string; gradeId: string }) => {
      const sentences = content
        .split(/(?<=[.!?])\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const { data, error } = await supabase
        .from("passages")
        .update({ 
          title, 
          content, 
          sentences,
          school_id: schoolId,
          grade_id: gradeId
        })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("지문이 수정되었습니다!");
      queryClient.invalidateQueries({ queryKey: ["passages"] });
      resetPassageForm();
    },
    onError: () => {
      toast.error("지문 수정에 실패했습니다.");
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

  const resetPassageForm = () => {
    setPassageTitle("");
    setPassageContent("");
    setPassageSchoolId("");
    setPassageGradeId("");
    setEditingPassage(null);
    setIsPassageDialogOpen(false);
  };

  const handlePassageSubmit = () => {
    if (!passageTitle.trim() || !passageContent.trim()) {
      toast.error("제목과 내용을 모두 입력해주세요.");
      return;
    }
    if (!passageSchoolId || !passageGradeId) {
      toast.error("학교와 학년을 선택해주세요.");
      return;
    }

    if (editingPassage) {
      updatePassage.mutate({ id: editingPassage.id, title: passageTitle, content: passageContent, schoolId: passageSchoolId, gradeId: passageGradeId });
    } else {
      createPassage.mutate({ title: passageTitle, content: passageContent, schoolId: passageSchoolId, gradeId: passageGradeId });
    }
  };

  const handleEditPassage = (passage: typeof passages[0]) => {
    setEditingPassage({ 
      id: passage.id, 
      title: passage.title, 
      content: passage.content,
      school_id: passage.school_id,
      grade_id: passage.grade_id
    });
    setPassageTitle(passage.title);
    setPassageContent(passage.content);
    setPassageSchoolId(passage.school_id || "");
    setPassageGradeId(passage.grade_id || "");
    setIsPassageDialogOpen(true);
  };

  const toggleSchool = (schoolId: string) => {
    const newExpanded = new Set(expandedSchools);
    if (newExpanded.has(schoolId)) {
      newExpanded.delete(schoolId);
    } else {
      newExpanded.add(schoolId);
    }
    setExpandedSchools(newExpanded);
  };

  const toggleGrade = (gradeId: string) => {
    const newExpanded = new Set(expandedGrades);
    if (newExpanded.has(gradeId)) {
      newExpanded.delete(gradeId);
    } else {
      newExpanded.add(gradeId);
    }
    setExpandedGrades(newExpanded);
  };

  // 학년 선택시 학교 자동 선택
  const gradesForSelectedSchool = passageSchoolId 
    ? dbGrades.filter(g => g.school_id === passageSchoolId)
    : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        icon={Users}
        title="학생관리"
        description="학교, 학년, 학생을 관리합니다"
        showDate={false}
      />

      <Tabs defaultValue="schools" className="space-y-5">
        <TabsList className="flex justify-center mx-auto w-fit h-12 items-center gap-1.5 rounded-2xl bg-gradient-to-r from-primary/5 via-muted/80 to-primary/5 p-1.5 backdrop-blur-md border border-primary/15 shadow-lg shadow-primary/5">
          <TabsTrigger value="schools" className="gap-1.5 rounded-xl px-5 py-2.5 text-xs font-bold tracking-wide transition-all duration-200 data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25 data-[state=active]:scale-[1.02] data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-background/60">
            <SchoolIcon className="w-3.5 h-3.5" />
            학교
          </TabsTrigger>
          <TabsTrigger value="mock-exam" className="gap-1.5 rounded-xl px-5 py-2.5 text-xs font-bold tracking-wide transition-all duration-200 data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25 data-[state=active]:scale-[1.02] data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-background/60">
            <ClipboardList className="w-3.5 h-3.5" />
            모의고사 성적
          </TabsTrigger>
          <TabsTrigger value="correlation" className="gap-1.5 rounded-xl px-5 py-2.5 text-xs font-bold tracking-wide transition-all duration-200 data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25 data-[state=active]:scale-[1.02] data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-background/60">
            <BarChart3 className="w-3.5 h-3.5" />
            성적 분석
          </TabsTrigger>
        </TabsList>

        {/* 학교 탭 */}
        <TabsContent value="schools" className="space-y-4">
          <div className="flex justify-between items-center gap-2 flex-wrap">
            <StudentExcelManager ownerCodeId={ownerCodeId} />
            <div className="flex gap-2">
            {/* 학년 추가 다이얼로그 */}
            <Dialog open={isAddGradeDialogOpen} onOpenChange={(open) => {
              setIsAddGradeDialogOpen(open);
              if (!open) resetGradeForm();
            }}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  학년 추가
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingGrade ? "학년 수정" : "새 학년 추가"}</DialogTitle>
                  <DialogDescription>
                    학교에 학년을 추가합니다.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>학교 *</Label>
                    <Select value={gradeSchoolId} onValueChange={setGradeSchoolId}>
                      <SelectTrigger>
                        <SelectValue placeholder="학교 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {dbSchools.map((school) => (
                          <SelectItem key={school.id} value={school.id}>
                            {school.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="grade-name">학년명 *</Label>
                    <Input
                      id="grade-name"
                      placeholder="예: 1학년, 고1, 중2"
                      value={newGradeName}
                      onChange={(e) => setNewGradeName(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={resetGradeForm}>
                    취소
                  </Button>
                  <Button 
                    onClick={handleGradeSubmit}
                    disabled={createGrade.isPending || updateGrade.isPending}
                  >
                    {(createGrade.isPending || updateGrade.isPending) && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    {editingGrade ? "수정" : "추가"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* 학교 추가 다이얼로그 */}
            <Dialog open={isAddSchoolDialogOpen} onOpenChange={(open) => {
              setIsAddSchoolDialogOpen(open);
              if (!open) {
                setEditingSchool(null);
                setNewSchoolName("");
                setNewSchoolLogoFile(null);
                setNewSchoolLogoPreview(null);
              }
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  학교 추가
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingSchool ? "학교 수정" : "새 학교 추가"}</DialogTitle>
                  <DialogDescription>
                    관리할 새로운 학교를 등록합니다.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="school-name">학교명 *</Label>
                    <Input
                      id="school-name"
                      placeholder="예: 서울고등학교"
                      value={newSchoolName}
                      onChange={(e) => setNewSchoolName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>학교 로고</Label>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoFileChange}
                      className="hidden"
                    />
                    <div className="flex items-center gap-4">
                      {newSchoolLogoPreview ? (
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden border">
                          <img 
                            src={newSchoolLogoPreview} 
                            alt="로고 미리보기" 
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setNewSchoolLogoFile(null);
                              setNewSchoolLogoPreview(null);
                            }}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center border border-dashed">
                          <Image className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => logoInputRef.current?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        로고 업로드
                      </Button>
                    </div>
                    {/* 저장된 로고 목록 */}
                    {(() => {
                      const savedLogos = dbSchools
                        .filter(s => s.logo_url && (!editingSchool || s.id !== editingSchool.id))
                        .reduce((acc: { url: string; name: string }[], s) => {
                          if (!acc.some(l => l.url === s.logo_url)) {
                            acc.push({ url: s.logo_url!, name: s.name });
                          }
                          return acc;
                        }, []);
                      if (savedLogos.length === 0) return null;
                      return (
                        <div className="space-y-1.5">
                          <p className="text-xs text-muted-foreground font-medium">저장된 로고에서 선택</p>
                          <div className="flex flex-wrap gap-2">
                            {savedLogos.map((logo) => (
                              <button
                                key={logo.url}
                                type="button"
                                onClick={() => {
                                  setNewSchoolLogoPreview(logo.url);
                                  setNewSchoolLogoFile(null);
                                }}
                                className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                                  newSchoolLogoPreview === logo.url && !newSchoolLogoFile
                                    ? "border-primary ring-2 ring-primary/30"
                                    : "border-border/50 hover:border-primary/50"
                                }`}
                                title={logo.name}
                              >
                                <img src={logo.url} alt={logo.name} className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                    <p className="text-xs text-muted-foreground">
                      권장 크기: 200x200px (정사각형)
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => {
                    setIsAddSchoolDialogOpen(false);
                    setEditingSchool(null);
                    setNewSchoolName("");
                    setNewSchoolLogoFile(null);
                    setNewSchoolLogoPreview(null);
                  }}>
                    취소
                  </Button>
                  <Button 
                    onClick={handleSchoolSubmitWithLogo}
                    disabled={createSchool.isPending || updateSchool.isPending || isUploadingLogo}
                  >
                    {(createSchool.isPending || updateSchool.isPending || isUploadingLogo) && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    {editingSchool ? "수정" : "추가"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          </div>

          {/* 학교 카드 목록 */}
          {schoolsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : dbSchools.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <SchoolIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">등록된 학교가 없습니다</h3>
                  <p className="text-sm text-muted-foreground">
                    위의 "학교 추가" 버튼을 눌러 첫 번째 학교를 등록하세요.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...dbSchools].sort((a, b) => {
                const aCount = getGradesForSchool(a.id).reduce((sum, g) => sum + getStudentsForGrade(g.id).length, 0);
                const bCount = getGradesForSchool(b.id).reduce((sum, g) => sum + getStudentsForGrade(g.id).length, 0);
                return bCount - aCount;
              }).map((school) => {
                const schoolGrades = getGradesForSchool(school.id);
                
                return (
                  <Card key={school.id} className="card-hover">
                    <CardHeader className="flex flex-row items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden">
                          {school.logo_url ? (
                            <img 
                              src={cacheBustUrl(school.logo_url)} 
                              alt={`${school.name} 로고`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <span className={`text-lg font-bold text-primary ${school.logo_url ? 'hidden' : ''}`}>
                            {school.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <CardTitle className="text-lg">{school.name}</CardTitle>
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-muted-foreground">{schoolGrades.length}개 학년</p>
                            {(() => {
                              if (!school.exam_date || !school.exam_name) return null;
                              const examDate = new Date(school.exam_date + "T00:00:00");
                              const now = new Date();
                              const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                              const diffDays = Math.ceil((examDate.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24));
                              const dDayText = diffDays === 0 ? "D-DAY" : diffDays > 0 ? `D-${diffDays}` : `D+${Math.abs(diffDays)}`;
                              const isUrgent = diffDays >= 0 && diffDays <= 7;
                              return (
                                <Badge variant={isUrgent ? "destructive" : "secondary"} className="text-[10px] px-1.5 py-0">
                                  📅 {school.exam_name} {dDayText}
                                </Badge>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditSchool(school)}>
                            <Edit2 className="w-4 h-4 mr-2" />
                            수정
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAddGradeToSchool(school.id)}>
                            <Plus className="w-4 h-4 mr-2" />
                            학년 추가
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setDdaySchool({
                              id: school.id,
                              name: school.name,
                              exam_name: (school as any).exam_name || "",
                              exam_date: (school as any).exam_date || "",
                            });
                            setDdayExamName((school as any).exam_name || "");
                            setDdayExamDate((school as any).exam_date || "");
                          }}>
                            <Calendar className="w-4 h-4 mr-2" />
                            D-DAY 설정
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => {
                              setDeleteConfirmSchoolId(school.id);
                              setDeleteConfirmSchoolName(school.name);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            삭제
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardHeader>
                    <CardContent>
                      {/* 학년별 정보 */}
                      <div className="space-y-3">
                        {schoolGrades.length === 0 ? (
                          <div className="text-center py-4 text-muted-foreground text-sm">
                            등록된 학년이 없습니다
                          </div>
                        ) : (
                          schoolGrades.map((grade) => {
                            const gradeStudents = getStudentsForGrade(grade.id);
                            const isGradeExpanded = expandedGrades.has(grade.id);
                            
                            return (
                              <Collapsible 
                                key={grade.id} 
                                open={isGradeExpanded} 
                                onOpenChange={() => toggleGrade(grade.id)}
                              >
                                <div className="rounded-lg bg-secondary/50 overflow-hidden">
                                  <CollapsibleTrigger asChild>
                                    <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-secondary/70 transition-colors">
                                      <div className="flex items-center gap-2">
                                        {isGradeExpanded ? (
                                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                        ) : (
                                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                        )}
                                        <span className="font-medium">{grade.name}</span>
                                        <Badge variant="outline" className="ml-2">
                                          <Users className="w-3 h-3 mr-1" />
                                          {gradeStudents.length}명
                                        </Badge>
                                      </div>
                                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                        <Button 
                                          variant="ghost" 
                                          size="icon"
                                          className="h-8 w-8"
                                          onClick={() => handleAddStudentToGrade(grade.id, grade.name, school.name)}
                                        >
                                          <UserPlus className="w-4 h-4 text-primary" />
                                        </Button>
                                        <Button 
                                          variant="ghost" 
                                          size="icon"
                                          className="h-8 w-8"
                                          onClick={() => handleEditGrade(grade)}
                                        >
                                          <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button 
                                          variant="ghost" 
                                          size="icon"
                                          className="h-8 w-8"
                                          onClick={() => deleteGrade.mutate(grade.id)}
                                        >
                                          <Trash2 className="w-4 h-4 text-destructive" />
                                        </Button>
                                      </div>
                                    </div>
                                  </CollapsibleTrigger>
                                  <CollapsibleContent>
                                    <div className="px-3 pb-3 border-t border-secondary">
                                      {gradeStudents.length === 0 ? (
                                        <div className="text-center py-4 text-muted-foreground text-sm">
                                          등록된 학생이 없습니다
                                          <Button 
                                            variant="link" 
                                            size="sm" 
                                            className="ml-1 p-0 h-auto"
                                            onClick={() => handleAddStudentToGrade(grade.id, grade.name, school.name)}
                                          >
                                            학생 추가하기
                                          </Button>
                                        </div>
                                      ) : (
                                        <div className="grid grid-cols-2 gap-2 pt-2">
                                          {gradeStudents.map((student) => (
                                            <div 
                                              key={student.id} 
                                              className="flex items-center justify-between p-2 rounded-md bg-card border"
                                            >
                                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                  {(school as any).logo_url ? (
                                                    <img 
                                                      src={cacheBustUrl((school as any).logo_url)} 
                                                      alt={`${school.name} 로고`}
                                                      className="w-full h-full object-cover"
                                                    />
                                                  ) : (
                                                    <span className="text-[10px] font-medium text-primary">
                                                      {school.name.charAt(0)}
                                                    </span>
                                                  )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                  <div className="flex items-center gap-1.5">
                                                    <p className="text-sm font-medium truncate">{student.name}</p>
                                                    {student.access_codes ? (
                                                      <>
                                                        <Badge variant="secondary" className="text-[10px] font-mono px-1 flex-shrink-0">
                                                          {student.access_codes.code}
                                                        </Badge>
                                                        <DropdownMenu>
                                                          <DropdownMenuTrigger asChild>
                                                            <Button
                                                              variant="ghost"
                                                              size="icon"
                                                              className="h-5 w-5 flex-shrink-0"
                                                              onClick={(e) => e.stopPropagation()}
                                                            >
                                                              <Copy className="w-3 h-3" />
                                                            </Button>
                                                          </DropdownMenuTrigger>
                                                          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                                            <DropdownMenuItem onClick={() => {
                                                              navigator.clipboard.writeText(student.access_codes?.code || "");
                                                              toast.success("코드가 복사되었습니다");
                                                            }}>
                                                              <Copy className="w-3.5 h-3.5 mr-2" />
                                                              복사
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => {
                                                              if (!student.student_phone) {
                                                                toast.error("학생 전화번호가 등록되지 않았습니다");
                                                                return;
                                                              }
                                                              setCodeSmsStudent({ ...student, code: student.access_codes?.code || "" });
                                                            }}>
                                                              <MessageSquare className="w-3.5 h-3.5 mr-2" />
                                                              학생문자로 코드 전송
                                                            </DropdownMenuItem>
                                                          </DropdownMenuContent>
                                                        </DropdownMenu>
                                                      </>
                                                    ) : (
                                                      <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-4 text-[10px] px-1.5"
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          generateCodeForStudent.mutate({ studentId: student.id, studentName: student.name });
                                                        }}
                                                        disabled={generateCodeForStudent.isPending}
                                                      >
                                                        <Key className="w-2.5 h-2.5 mr-0.5" />
                                                        코드
                                                      </Button>
                                                    )}
                                                  </div>
                                                  <div className="flex items-center gap-1.5 flex-wrap">
                                                    {student.student_phone && (
                                                      <span className="text-[10px] text-muted-foreground truncate">학생 {student.student_phone}</span>
                                                    )}
                                                    {student.parent_phone && (
                                                      <span className="text-[10px] text-muted-foreground truncate">학부모 {student.parent_phone}</span>
                                                    )}
                                                  </div>
                                                </div>
                                              </div>
                                              <div className="flex items-center gap-0.5 flex-shrink-0">
                                                <Button 
                                                  variant="ghost" 
                                                  size="icon"
                                                  className="h-6 w-6"
                                                  onClick={() => setQuickSmsStudent(student)}
                                                  title="SMS 발송"
                                                >
                                                  <MessageSquare className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
                                                </Button>
                                                <Button 
                                                  variant="ghost" 
                                                  size="icon"
                                                  className="h-6 w-6"
                                                  onClick={() => setQuickKakaoStudent(student)}
                                                  title="카톡 발송"
                                                >
                                                  <MessageCircle className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
                                                </Button>
                                                <Button 
                                                  variant="ghost" 
                                                  size="icon"
                                                  className="h-6 w-6"
                                                  onClick={() => handleEditStudent(student, grade.name, school.name)}
                                                >
                                                  <Edit2 className="w-3 h-3" />
                                                </Button>
                                                <Button 
                                                  variant="ghost" 
                                                  size="icon"
                                                  className="h-6 w-6"
                                                  onClick={() => {
                                                    setDeleteConfirmStudentId(student.id);
                                                    setDeleteConfirmStudentName(student.name);
                                                  }}
                                                >
                                                  <Trash2 className="w-3 h-3 text-destructive" />
                                                </Button>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </CollapsibleContent>
                                </div>
                              </Collapsible>
                            );
                          })
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* 모의고사 성적 탭 */}
        <TabsContent value="mock-exam" className="space-y-4">
          <MockExamScoreSheet />
        </TabsContent>

        {/* 성적 분석 탭 */}
        <TabsContent value="correlation" className="space-y-4">
          <ExamCorrelationAnalysis />
        </TabsContent>
      </Tabs>

      {/* 학생 추가/수정 다이얼로그 */}
      <Dialog open={isAddStudentDialogOpen} onOpenChange={(open) => {
        setIsAddStudentDialogOpen(open);
        if (!open) resetStudentForm();
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              {editingStudent ? "학생 정보 수정" : "학생 추가"}
            </DialogTitle>
            <DialogDescription>
              {studentSchoolName} · {studentGradeName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="student-name">학생 이름 *</Label>
              <Input
                id="student-name"
                placeholder="홍길동"
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                maxLength={50}
              />
            </div>
            {allTags.length > 0 && (
              <div className="space-y-2">
                <Label>그룹</Label>
                <div className="flex flex-wrap gap-1.5">
                  {allTags.map((tag: any) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => setSelectedTagIds((prev) =>
                        prev.includes(tag.id) ? prev.filter((id) => id !== tag.id) : [...prev, tag.id]
                      )}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                        selectedTagIds.includes(tag.id)
                          ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/30"
                          : "border-border bg-secondary/50 text-muted-foreground hover:bg-secondary"
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: tag.color }} />
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="student-phone">학생 연락처</Label>
              <Input
                id="student-phone"
                type="tel"
                placeholder="010-1234-5678"
                value={newStudentPhone}
                onChange={(e) => setNewStudentPhone(e.target.value)}
                maxLength={20}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parent-phone">학부모 연락처</Label>
              <Input
                id="parent-phone"
                type="tel"
                placeholder="010-1234-5678"
                value={newParentPhone}
                onChange={(e) => setNewParentPhone(e.target.value)}
                maxLength={20}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetStudentForm}>
              취소
            </Button>
            <Button 
              onClick={handleStudentSubmit}
              disabled={createStudent.isPending || updateStudent.isPending || !newStudentName.trim()}
            >
              {(createStudent.isPending || updateStudent.isPending) && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {editingStudent ? "수정" : "추가"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={deleteConfirmSchoolId !== null} onOpenChange={(open) => {
        if (!open) {
          setDeleteConfirmSchoolId(null);
          setDeleteConfirmSchoolName("");
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>학교를 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleteConfirmSchoolName}" 학교를 삭제하면 이 학교의 모든 학년과 학생 데이터도 함께 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteConfirmSchoolId) {
                  deleteSchool.mutate(deleteConfirmSchoolId);
                  setDeleteConfirmSchoolId(null);
                  setDeleteConfirmSchoolName("");
                }
              }}
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteConfirmStudentId !== null} onOpenChange={(open) => {
        if (!open) {
          setDeleteConfirmStudentId(null);
          setDeleteConfirmStudentName("");
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>학생을 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleteConfirmStudentName}" 학생을 삭제하면 이 학생의 모든 과제 제출물 및 기록이 함께 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteConfirmStudentId) {
                  deleteStudent.mutate(deleteConfirmStudentId);
                  setDeleteConfirmStudentId(null);
                  setDeleteConfirmStudentName("");
                }
              }}
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {quickSmsStudent && (
        <QuickMessageDialog
          open={!!quickSmsStudent}
          onOpenChange={(open) => !open && setQuickSmsStudent(null)}
          studentId={quickSmsStudent.id}
          studentName={quickSmsStudent.name}
          studentPhone={quickSmsStudent.student_phone}
          parentPhone={quickSmsStudent.parent_phone}
        />
      )}

      {quickKakaoStudent && (
        <QuickKakaoDialog
          open={!!quickKakaoStudent}
          onOpenChange={(open) => !open && setQuickKakaoStudent(null)}
          studentId={quickKakaoStudent.id}
          studentName={quickKakaoStudent.name}
          studentPhone={quickKakaoStudent.student_phone}
          parentPhone={quickKakaoStudent.parent_phone}
        />
      )}

      {codeSmsStudent && (
        <Dialog open={!!codeSmsStudent} onOpenChange={(open) => !open && setCodeSmsStudent(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>접속 코드 문자 전송</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                <strong>{codeSmsStudent.name}</strong> 학생({codeSmsStudent.student_phone})에게 접속 코드를 문자로 전송합니다.
              </p>
              <div className="p-3 bg-muted rounded-lg text-sm whitespace-pre-line">
                [{codeSmsStudent.name}] 접속 코드: <strong>{codeSmsStudent.code}</strong>{"\n"}접속 주소: https://yonglish.co.kr
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setCodeSmsStudent(null)}>취소</Button>
                <Button size="sm" onClick={async () => {
                  try {
                    const msg = `[Pcube] ${codeSmsStudent.name} 학생의 접속 코드는 ${codeSmsStudent.code} 입니다.\n접속 주소: https://yonglish.co.kr`;
                    const response = await supabase.functions.invoke("send-kakao-notification", {
                      body: {
                        studentId: codeSmsStudent.id,
                        studentName: codeSmsStudent.name,
                        submissionType: "code",
                        messageTemplate: msg,
                        brandPrefix: "",
                        messageType: "sms",
                        recipientType: "student",
                        ownerCodeId: ownerCodeId,
                      },
                    });
                    if (response.data?.success) {
                      toast.success("코드가 문자로 전송되었습니다");
                    } else {
                      toast.error("전송에 실패했습니다");
                    }
                  } catch (e) {
                    toast.error("전송 중 오류가 발생했습니다");
                  }
                  setCodeSmsStudent(null);
                }}>
                  <MessageSquare className="w-3.5 h-3.5 mr-1" />
                  전송
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* D-DAY 설정 다이얼로그 */}
      <Dialog open={!!ddaySchool} onOpenChange={(open) => !open && setDdaySchool(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              D-DAY 설정
            </DialogTitle>
            <DialogDescription>
              {ddaySchool?.name}의 시험 D-DAY를 설정합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>시험명</Label>
              <Input
                placeholder="예: 1학기 중간고사"
                value={ddayExamName}
                onChange={(e) => setDdayExamName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>시험 날짜</Label>
              <Input
                type="date"
                value={ddayExamDate}
                onChange={(e) => setDdayExamDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            {(ddaySchool?.exam_name || ddaySchool?.exam_date) && (
              <Button
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={() => {
                  if (ddaySchool) {
                    updateSchoolDday.mutate({ id: ddaySchool.id, exam_name: null, exam_date: null });
                  }
                }}
              >
                초기화
              </Button>
            )}
            <Button
              onClick={() => {
                if (!ddaySchool || !ddayExamName.trim() || !ddayExamDate) {
                  toast.error("시험명과 날짜를 입력해주세요.");
                  return;
                }
                updateSchoolDday.mutate({
                  id: ddaySchool.id,
                  exam_name: ddayExamName.trim(),
                  exam_date: ddayExamDate,
                });
              }}
              disabled={updateSchoolDday.isPending}
            >
              {updateSchoolDday.isPending ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
