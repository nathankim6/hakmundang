import { useState, useEffect, useRef } from "react";
import { Plus, MoreVertical, Users, School as SchoolIcon, FileText, Trash2, Edit2, ChevronDown, ChevronRight, UserPlus, Key, Upload, Image, Copy, CalendarIcon } from "lucide-react";
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
import { Loader2, School as SchoolIconLucide2, MessageSquare, Send } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { QuickMessageDialog } from "@/components/dashboard/QuickMessageDialog";
import { QuickKakaoDialog } from "@/components/dashboard/QuickKakaoDialog";
import { BulkAccessCodeSmsDialog } from "@/components/schools/BulkAccessCodeSmsDialog";
import { IndividualAccessCodeSmsDialog } from "@/components/schools/IndividualAccessCodeSmsDialog";
import iconSms from "@/assets/icon-sms.png";
import iconKakao from "@/assets/icon-kakao.png";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

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
  const [newStudentEmail, setNewStudentEmail] = useState("");
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [quickSmsStudent, setQuickSmsStudent] = useState<Student | null>(null);
  const [quickKakaoStudent, setQuickKakaoStudent] = useState<Student | null>(null);
  const [bulkSmsSchool, setBulkSmsSchool] = useState<{ id: string; name: string } | null>(null);
  const [individualCodeSmsStudent, setIndividualCodeSmsStudent] = useState<Student | null>(null);
  const [examDatePopoverSchoolId, setExamDatePopoverSchoolId] = useState<string | null>(null);

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

  // Create school mutation
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

  // 실시간 동기화: schools, grades, students 변경 시 자동 갱신
  useEffect(() => {
    const channel = supabase
      .channel('schools-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'schools' }, () => {
        queryClient.invalidateQueries({ queryKey: ["schools"] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'grades' }, () => {
        queryClient.invalidateQueries({ queryKey: ["grades"] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, () => {
        queryClient.invalidateQueries({ queryKey: ["students"] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'access_codes' }, () => {
        queryClient.invalidateQueries({ queryKey: ["students"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Get students for a specific grade
  const getStudentsForGrade = (gradeId: string) => {
    return dbStudents.filter(s => s.grade_id === gradeId);
  };

  // 드래그앤드롭으로 학생 소속(학교/반) 이동
  const [draggingStudentId, setDraggingStudentId] = useState<string | null>(null);
  const [dragOverGradeId, setDragOverGradeId] = useState<string | null>(null);

  const moveStudentGrade = useMutation({
    mutationFn: async ({ studentId, gradeId }: { studentId: string; gradeId: string }) => {
      const { error } = await supabase
        .from("students")
        .update({ grade_id: gradeId })
        .eq("id", studentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["all-students-with-grades"] });
      toast.success("학생 소속이 변경되었습니다");
    },
    onError: (e: any) => toast.error(`이동 실패: ${e.message}`),
  });

  const handleDropOnGrade = (gradeId: string) => {
    const studentId = draggingStudentId;
    setDraggingStudentId(null);
    setDragOverGradeId(null);
    if (!studentId) return;
    const student = dbStudents.find(s => s.id === studentId);
    if (!student || student.grade_id === gradeId) return;
    moveStudentGrade.mutate({ studentId, gradeId });
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
    mutationFn: async ({ id, name, studentPhone, parentPhone, parentEmail, gradeId }: { id: string; name: string; studentPhone: string; parentPhone: string; parentEmail: string; gradeId: string }) => {
      const { data, error } = await supabase
        .from("students")
        .update({ 
          name,
          grade_id: gradeId,
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
    setIsAddStudentDialogOpen(true);
  };

  const handleStudentSubmit = () => {
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
        parentEmail: newStudentEmail,
        gradeId: studentGradeId,
      });
    } else {
      createStudent.mutate({ 
        name: newStudentName, 
        gradeId: studentGradeId,
        studentPhone: newStudentPhone,
        parentPhone: newParentPhone,
        parentEmail: newStudentEmail
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

      <Tabs defaultValue="schools" className="space-y-4">
        <TabsList>
          <TabsTrigger value="schools">학교</TabsTrigger>
          <TabsTrigger value="passages">지문</TabsTrigger>
        </TabsList>

        {/* 학교 탭 */}
        <TabsContent value="schools" className="space-y-4">
          <div className="flex justify-end gap-2">
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
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-sm text-muted-foreground">{schoolGrades.length}개 학년</p>
                            {(school as any).exam_date && (() => {
                              const examDate = new Date((school as any).exam_date + "T00:00:00+09:00");
                              const nowKST = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
                              nowKST.setHours(0,0,0,0);
                              const diffDays = Math.ceil((examDate.getTime() - nowKST.getTime()) / (1000 * 60 * 60 * 24));
                              return (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-sm">
                                  <span className="font-medium opacity-80">시험까지</span>
                                  <span className="font-extrabold">{diffDays === 0 ? "D-DAY" : diffDays > 0 ? `D-${diffDays}` : `D+${Math.abs(diffDays)}`}</span>
                                </span>
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
                          <DropdownMenuItem onClick={() => setBulkSmsSchool({ id: school.id, name: school.name })}>
                            <Send className="w-4 h-4 mr-2" />
                            접속코드 일괄 문자 발송
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
                      {/* 시험 날짜 설정 */}
                      <div className="flex flex-wrap items-center gap-2 mb-3 pb-3 border-b border-border/50">
                        <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground">시험일</span>
                        <Popover open={examDatePopoverSchoolId === school.id} onOpenChange={(open) => setExamDatePopoverSchoolId(open ? school.id : null)}>
                          <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className={cn("h-9 sm:h-7 text-xs px-3 sm:px-2.5", !(school as any).exam_date && "text-muted-foreground")}>
                              {(school as any).exam_date ? format(new Date((school as any).exam_date + "T00:00:00"), "yyyy.MM.dd") : "날짜 선택"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[320px] p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={(school as any).exam_date ? new Date((school as any).exam_date + "T00:00:00") : undefined}
                              onSelect={async (date) => {
                                if (!date) return;
                                const dateStr = format(date, "yyyy-MM-dd");
                                const { error } = await supabase.from("schools").update({ exam_date: dateStr } as any).eq("id", school.id);
                                if (error) { toast.error("시험일 저장 실패"); return; }
                                queryClient.invalidateQueries({ queryKey: ["schools"] });
                                toast.success("시험일이 설정되었습니다.");
                                setExamDatePopoverSchoolId(null);
                              }}
                              locale={ko}
                              formatters={{
                                formatCaption: (date) => `${date.getFullYear()}년 ${date.getMonth() + 1}월`,
                              }}
                              className={cn("p-3 pointer-events-auto w-full")}
                              fullWidth
                            />
                          </PopoverContent>
                        </Popover>
                        {(school as any).exam_date && (
                          <Button variant="ghost" size="sm" className="h-9 w-9 sm:h-7 sm:w-auto text-xs px-2 sm:px-1.5 text-muted-foreground hover:text-destructive" onClick={async () => {
                            const { error } = await supabase.from("schools").update({ exam_date: null } as any).eq("id", school.id);
                            if (error) { toast.error("시험일 삭제 실패"); return; }
                            queryClient.invalidateQueries({ queryKey: ["schools"] });
                            toast.success("시험일이 삭제되었습니다.");
                          }}>
                            ✕
                          </Button>
                        )}
                      </div>
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
                                 <div
                                   className={`rounded-lg bg-secondary/50 overflow-hidden transition-all ${dragOverGradeId === grade.id ? "ring-2 ring-primary ring-offset-1 bg-primary/10" : ""}`}
                                   onDragOver={(e) => {
                                     if (!draggingStudentId) return;
                                     e.preventDefault();
                                     e.dataTransfer.dropEffect = "move";
                                     if (dragOverGradeId !== grade.id) setDragOverGradeId(grade.id);
                                   }}
                                   onDragLeave={(e) => {
                                     if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                                       setDragOverGradeId((prev) => (prev === grade.id ? null : prev));
                                     }
                                   }}
                                   onDrop={(e) => {
                                     e.preventDefault();
                                     handleDropOnGrade(grade.id);
                                   }}
                                 >
                                  <CollapsibleTrigger asChild>
                                    <div className="flex items-center justify-between gap-2 p-3 cursor-pointer hover:bg-secondary/70 active:bg-secondary transition-colors min-h-[52px]">
                                      <div className="flex items-center gap-2 min-w-0">
                                        {isGradeExpanded ? (
                                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                        ) : (
                                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                        )}
                                        <span className="font-medium truncate">{grade.name}</span>
                                        <Badge variant="outline" className="ml-1 sm:ml-2 shrink-0">
                                          <Users className="w-3 h-3 mr-1" />
                                          {gradeStudents.length}명
                                        </Badge>
                                      </div>
                                      <div className="flex items-center gap-0.5 sm:gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
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
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                                          {gradeStudents.map((student) => (
                                             <div 
                                               key={student.id} 
                                               draggable
                                               onDragStart={(e) => {
                                                 setDraggingStudentId(student.id);
                                                 e.dataTransfer.effectAllowed = "move";
                                                 e.dataTransfer.setData("text/plain", student.id);
                                               }}
                                               onDragEnd={() => {
                                                 setDraggingStudentId(null);
                                                 setDragOverGradeId(null);
                                               }}
                                               title="드래그해서 다른 반/학교로 이동"
                                               className={`flex flex-wrap items-center justify-between gap-2 p-2.5 sm:p-2 rounded-lg sm:rounded-md bg-card border cursor-grab active:cursor-grabbing ${draggingStudentId === student.id ? "opacity-50" : ""}`}
                                             >
                                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                                <div className="w-7 h-7 sm:w-6 sm:h-6 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden flex-shrink-0">
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
                                                  <div className="flex items-center gap-1 sm:gap-1.5 min-w-0 flex-wrap">
                                                    <p className="text-sm font-medium whitespace-nowrap">{student.name}</p>
                                                    {student.access_codes ? (
                                                      <>
                                                        <Badge variant="secondary" className="text-[10px] font-mono px-1 flex-shrink-0">
                                                          {student.access_codes.code}
                                                        </Badge>
                                                        <Button
                                                          variant="ghost"
                                                          size="icon"
                                                          className="h-7 w-7 sm:h-5 sm:w-5 flex-shrink-0"
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigator.clipboard.writeText(student.access_codes?.code || "");
                                                            toast.success("코드가 복사되었습니다");
                                                          }}
                                                        >
                                                         <Copy className="w-3 h-3" />
                                                        </Button>
                                                        <Button
                                                          variant="ghost"
                                                          size="icon"
                                                          className="h-7 w-7 sm:h-5 sm:w-5 flex-shrink-0"
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            setIndividualCodeSmsStudent(student);
                                                          }}
                                                          title="접속코드 문자 발송"
                                                        >
                                                          <Send className="w-3 h-3" />
                                                        </Button>
                                                      </>
                                                    ) : (
                                                      <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-7 sm:h-4 text-[11px] sm:text-[10px] px-2 sm:px-1.5 flex-shrink-0"
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
                                                  <div className="flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-1.5 sm:flex-wrap">
                                                    {student.student_phone && (
                                                      <span className="text-[11px] sm:text-[10px] text-muted-foreground whitespace-nowrap">학생 {student.student_phone}</span>
                                                    )}
                                                    {student.parent_phone && (
                                                      <span className="text-[11px] sm:text-[10px] text-muted-foreground whitespace-nowrap">학부모 {student.parent_phone}</span>
                                                    )}
                                                  </div>
                                                </div>
                                              </div>
                                              <div className="flex items-center gap-0.5 flex-shrink-0 ml-auto">
                                                <Button 
                                                  variant="ghost" 
                                                  size="icon"
                                                  className="h-8 w-8 sm:h-6 sm:w-6"
                                                  onClick={() => setQuickSmsStudent(student)}
                                                  title="SMS 발송"
                                                >
                                                  <img src={iconSms} alt="SMS" className="w-3.5 h-3.5" />
                                                </Button>
                                                <Button 
                                                  variant="ghost" 
                                                  size="icon"
                                                  className="h-8 w-8 sm:h-6 sm:w-6"
                                                  onClick={() => setQuickKakaoStudent(student)}
                                                  title="카톡 발송"
                                                >
                                                  <img src={iconKakao} alt="KakaoTalk" className="w-3.5 h-3.5 rounded-sm" />
                                                </Button>
                                                <Button 
                                                  variant="ghost" 
                                                  size="icon"
                                                  className="h-8 w-8 sm:h-6 sm:w-6"
                                                  onClick={() => handleEditStudent(student, grade.name, school.name)}
                                                >
                                                  <Edit2 className="w-3 h-3" />
                                                </Button>
                                                <Button 
                                                  variant="ghost" 
                                                  size="icon"
                                                  className="h-8 w-8 sm:h-6 sm:w-6"
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

        {/* 지문 탭 */}
        <TabsContent value="passages" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isPassageDialogOpen} onOpenChange={(open) => {
              setIsPassageDialogOpen(open);
              if (!open) resetPassageForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  지문 추가
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingPassage ? "지문 수정" : "새 지문 추가"}</DialogTitle>
                  <DialogDescription>
                    학생들이 읽을 영어 지문을 등록합니다. 문장 끝에 마침표(.)가 있으면 자동으로 문장 단위로 분리됩니다.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {/* 학교/학년 선택 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>학교 *</Label>
                      <Select value={passageSchoolId} onValueChange={(v) => { setPassageSchoolId(v); setPassageGradeId(""); }}>
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
                      <Label>학년 *</Label>
                      <Select 
                        value={passageGradeId} 
                        onValueChange={setPassageGradeId}
                        disabled={!passageSchoolId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="학년 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {gradesForSelectedSchool.map((grade) => (
                            <SelectItem key={grade.id} value={grade.id}>
                              {grade.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="passage-title">제목</Label>
                    <Input
                      id="passage-title"
                      placeholder="예: The Little Prince - Chapter 1"
                      value={passageTitle}
                      onChange={(e) => setPassageTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passage-content">내용</Label>
                    <Textarea
                      id="passage-content"
                      placeholder="영어 지문을 입력하세요. 문장 끝에 마침표가 있으면 자동으로 분리됩니다."
                      value={passageContent}
                      onChange={(e) => setPassageContent(e.target.value)}
                      rows={8}
                    />
                  </div>
                  {passageContent && (
                    <div className="space-y-2">
                      <Label>미리보기 (문장 분리)</Label>
                      <div className="p-3 rounded-lg bg-secondary/50 space-y-2 max-h-48 overflow-y-auto">
                        {passageContent
                          .split(/(?<=[.!?])\s+/)
                          .map((s) => s.trim())
                          .filter((s) => s.length > 0)
                          .map((sentence, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <span className="text-xs text-muted-foreground mt-1">{i + 1}.</span>
                              <span className="text-sm">{sentence}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={resetPassageForm}>
                    취소
                  </Button>
                  <Button 
                    onClick={handlePassageSubmit}
                    disabled={createPassage.isPending || updatePassage.isPending}
                  >
                    {(createPassage.isPending || updatePassage.isPending) && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    {editingPassage ? "수정" : "추가"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* 지문 목록 - 학교/학년별 트리 구조 */}
          {passagesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : dbSchools.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <SchoolIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">먼저 학교를 등록해주세요</h3>
                  <p className="text-sm text-muted-foreground">
                    지문을 추가하려면 학교와 학년이 필요합니다.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {dbSchools.map((school) => {
                const schoolGrades = getGradesForSchool(school.id);
                const isSchoolExpanded = expandedSchools.has(school.id);
                const totalPassages = schoolGrades.reduce((sum, g) => sum + getPassagesForGrade(g.id).length, 0);

                return (
                  <Card key={school.id}>
                    <Collapsible open={isSchoolExpanded} onOpenChange={() => toggleSchool(school.id)}>
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-secondary/30 transition-colors py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {isSchoolExpanded ? (
                                <ChevronDown className="w-5 h-5 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="w-5 h-5 text-muted-foreground" />
                              )}
                              <SchoolIcon className="w-5 h-5 text-primary" />
                              <span className="font-semibold">{school.name}</span>
                            </div>
                            <Badge variant="secondary">{totalPassages}개 지문</Badge>
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CardContent className="pt-0 pl-8 space-y-2">
                          {schoolGrades.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-2">등록된 학년이 없습니다.</p>
                          ) : (
                            schoolGrades.map((grade) => {
                              const gradePassages = getPassagesForGrade(grade.id);
                              const isGradeExpanded = expandedGrades.has(grade.id);

                              return (
                                <Collapsible key={grade.id} open={isGradeExpanded} onOpenChange={() => toggleGrade(grade.id)}>
                                  <CollapsibleTrigger asChild>
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 cursor-pointer hover:bg-secondary/50 transition-colors">
                                      <div className="flex items-center gap-2">
                                        {isGradeExpanded ? (
                                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                        ) : (
                                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                        )}
                                        <span className="font-medium">{grade.name}</span>
                                      </div>
                                      <Badge variant="outline">{gradePassages.length}개</Badge>
                                    </div>
                                  </CollapsibleTrigger>
                                  <CollapsibleContent>
                                    <div className="pl-6 py-2 space-y-2">
                                      {gradePassages.length === 0 ? (
                                        <p className="text-sm text-muted-foreground py-2">등록된 지문이 없습니다.</p>
                                      ) : (
                                        gradePassages.map((passage) => (
                                          <div 
                                            key={passage.id} 
                                            className="flex items-center justify-between p-3 rounded-lg bg-card border"
                                          >
                                            <div className="flex items-center gap-3">
                                              <FileText className="w-4 h-4 text-accent-foreground" />
                                              <div>
                                                <p className="font-medium text-sm">{passage.title}</p>
                                                <p className="text-xs text-muted-foreground">
                                                  {passage.sentences?.length || 0}개 문장
                                                </p>
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                              <Button 
                                                variant="ghost" 
                                                size="icon"
                                                onClick={(e) => { e.stopPropagation(); handleEditPassage(passage); }}
                                              >
                                                <Edit2 className="w-4 h-4" />
                                              </Button>
                                              <Button 
                                                variant="ghost" 
                                                size="icon"
                                                onClick={(e) => { e.stopPropagation(); deletePassage.mutate(passage.id); }}
                                              >
                                                <Trash2 className="w-4 h-4 text-destructive" />
                                              </Button>
                                            </div>
                                          </div>
                                        ))
                                      )}
                                    </div>
                                  </CollapsibleContent>
                                </Collapsible>
                              );
                            })
                          )}
                        </CardContent>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                );
              })}
            </div>
          )}
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
            {editingStudent && (
              <div className="space-y-2">
                <Label htmlFor="student-grade">소속 반 이동</Label>
                <Select
                  value={studentGradeId}
                  onValueChange={(val) => {
                    setStudentGradeId(val);
                    const g = dbGrades.find((gr) => gr.id === val);
                    const s = dbSchools.find((sc) => sc.id === g?.school_id);
                    setStudentGradeName(g?.name || "");
                    setStudentSchoolName(s?.name || "");
                  }}
                >
                  <SelectTrigger id="student-grade">
                    <SelectValue placeholder="반 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {dbSchools.map((school) => {
                      const gradesOfSchool = dbGrades.filter((g) => g.school_id === school.id);
                      if (gradesOfSchool.length === 0) return null;
                      return gradesOfSchool.map((g) => (
                        <SelectItem key={g.id} value={g.id}>
                          {school.name} · {g.name}
                        </SelectItem>
                      ));
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}
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

      {bulkSmsSchool && (
        <BulkAccessCodeSmsDialog
          open={!!bulkSmsSchool}
          onOpenChange={(open) => !open && setBulkSmsSchool(null)}
          schoolName={bulkSmsSchool.name}
          students={getGradesForSchool(bulkSmsSchool.id).flatMap((g) =>
            getStudentsForGrade(g.id)
          )}
        />
      )}

      {individualCodeSmsStudent && individualCodeSmsStudent.access_codes && (
        <IndividualAccessCodeSmsDialog
          open={!!individualCodeSmsStudent}
          onOpenChange={(open) => !open && setIndividualCodeSmsStudent(null)}
          studentName={individualCodeSmsStudent.name}
          studentId={individualCodeSmsStudent.id}
          studentPhone={individualCodeSmsStudent.student_phone}
          accessCode={individualCodeSmsStudent.access_codes.code}
        />
      )}
    </div>
  );
}
