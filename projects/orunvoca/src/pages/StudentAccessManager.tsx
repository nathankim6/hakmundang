import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Key, User, Trash2, RefreshCw, Users, Search, Plus, BookOpen, Settings, ClipboardList, UserPlus, FolderPlus } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import accessManagerIcon from "@/assets/page-icons/access-manager-icon.png";

interface AccessCode {
  id: string;
  access_code: string;
  is_active: boolean;
  last_accessed: string | null;
  created_at: string;
  expiry_date: string | null;
  exam_code: string | null;
  max_users: number;
  name: string;
  student_id: string | null;
}

interface CardSet {
  id: string;
  title: string;
}

interface Exam {
  id: string;
  title: string;
}

export default function StudentAccessManager() {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [accessCodes, setAccessCodes] = useState<AccessCode[]>([]);
  const [cardSets, setCardSets] = useState<CardSet[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCardSetDialogOpen, setIsCardSetDialogOpen] = useState(false);
  const [isExamDialogOpen, setIsExamDialogOpen] = useState(false);
  const [selectedAccessCode, setSelectedAccessCode] = useState<AccessCode | null>(null);
  const [assignedCardSets, setAssignedCardSets] = useState<string[]>([]);
  const [assignedExams, setAssignedExams] = useState<string[]>([]);
  const [newCodeForm, setNewCodeForm] = useState({
    name: "",
    examCode: "",
    expiryDays: "30",
    maxUsers: "500"
  });

  // 반 생성 관련 상태
  const [isClassDialogOpen, setIsClassDialogOpen] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [studentNames, setStudentNames] = useState("");
  const [expiryDaysForClass, setExpiryDaysForClass] = useState("365");
  const [creatingStudents, setCreatingStudents] = useState(false);

  // 반에 학생 추가 관련 상태
  const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false);
  const [targetClassName, setTargetClassName] = useState("");
  const [newStudentName, setNewStudentName] = useState("");
  const [addingStudent, setAddingStudent] = useState(false);

  // 반별 그룹화된 액세스 코드 가져오기
  const groupedByClass = React.useMemo(() => {
    const groups: Record<string, AccessCode[]> = {};
    const noClass: AccessCode[] = [];

    accessCodes.forEach((code) => {
      // exam_code가 반 이름 역할을 함
      const className = code.exam_code || '';
      if (className) {
        if (!groups[className]) {
          groups[className] = [];
        }
        groups[className].push(code);
      } else {
        noClass.push(code);
      }
    });

    // 반 이름으로 정렬
    const sortedGroups = Object.entries(groups).sort(([a], [b]) => a.localeCompare(b, 'ko'));

    return { groups: sortedGroups, noClass };
  }, [accessCodes]);

  const handleGoBack = () => {
    // 액세스 관리자 로그인 상태 제거
    sessionStorage.removeItem('accessManagerLoggedIn');
    navigate("/dashboard");
  };

  useEffect(() => {
    fetchAccessCodes();
    fetchCardSets();
    fetchExams();

    // 실시간 업데이트 설정
    const channel = supabase.channel('access-codes-changes').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'student_access_codes'
    }, () => {
      fetchAccessCodes();
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchCardSets = async () => {
    try {
      const { data, error } = await supabase.
      from('card_sets').
      select('id, title').
      order('title', { ascending: true });

      if (error) throw error;
      setCardSets(data || []);
    } catch (error) {
      console.error('Error fetching card sets:', error);
    }
  };

  const fetchAssignedCardSets = async (accessCodeId: string) => {
    try {
      const { data, error } = await supabase.
      from('access_code_card_sets').
      select('card_set_id').
      eq('access_code_id', accessCodeId);

      if (error) throw error;
      setAssignedCardSets(data?.map((item) => item.card_set_id) || []);
    } catch (error) {
      console.error('Error fetching assigned card sets:', error);
      setAssignedCardSets([]);
    }
  };

  const handleOpenCardSetDialog = async (code: AccessCode) => {
    setSelectedAccessCode(code);
    await fetchAssignedCardSets(code.id);
    setIsCardSetDialogOpen(true);
  };

  // 시험 관련 함수들
  const fetchExams = async () => {
    try {
      const { data, error } = await supabase.
      from('exams').
      select('id, title').
      eq('is_ended', false).
      order('created_at', { ascending: false });

      if (error) throw error;
      setExams(data || []);
    } catch (error) {
      console.error('Error fetching exams:', error);
    }
  };

  const fetchAssignedExams = async (accessCodeId: string) => {
    try {
      const { data, error } = await supabase.
      from('access_code_exams').
      select('exam_id').
      eq('access_code_id', accessCodeId);

      if (error) throw error;
      setAssignedExams(data?.map((item) => item.exam_id) || []);
    } catch (error) {
      console.error('Error fetching assigned exams:', error);
      setAssignedExams([]);
    }
  };

  const handleOpenExamDialog = async (code: AccessCode) => {
    setSelectedAccessCode(code);
    await fetchAssignedExams(code.id);
    setIsExamDialogOpen(true);
  };

  const handleExamToggle = async (examId: string, isChecked: boolean) => {
    if (!selectedAccessCode) return;

    try {
      if (isChecked) {
        const { error } = await supabase.
        from('access_code_exams').
        insert({
          access_code_id: selectedAccessCode.id,
          exam_id: examId
        });

        if (error) throw error;
        setAssignedExams((prev) => [...prev, examId]);
      } else {
        const { error } = await supabase.
        from('access_code_exams').
        delete().
        eq('access_code_id', selectedAccessCode.id).
        eq('exam_id', examId);

        if (error) throw error;
        setAssignedExams((prev) => prev.filter((id) => id !== examId));
      }
    } catch (error) {
      console.error('Error updating exam assignment:', error);
      toast({
        title: "오류",
        description: "시험 할당 변경 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  const handleSelectAllExams = async () => {
    if (!selectedAccessCode) return;

    try {
      await supabase.
      from('access_code_exams').
      delete().
      eq('access_code_id', selectedAccessCode.id);

      const insertData = exams.map((exam) => ({
        access_code_id: selectedAccessCode.id,
        exam_id: exam.id
      }));

      const { error } = await supabase.
      from('access_code_exams').
      insert(insertData);

      if (error) throw error;
      setAssignedExams(exams.map((e) => e.id));
      toast({
        title: "성공",
        description: "모든 시험이 할당되었습니다."
      });
    } catch (error) {
      console.error('Error selecting all exams:', error);
      toast({
        title: "오류",
        description: "시험 전체 할당 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  const handleClearAllExams = async () => {
    if (!selectedAccessCode) return;

    try {
      const { error } = await supabase.
      from('access_code_exams').
      delete().
      eq('access_code_id', selectedAccessCode.id);

      if (error) throw error;
      setAssignedExams([]);
      toast({
        title: "성공",
        description: "모든 시험 할당이 해제되었습니다. (전체 시험 접근 가능)"
      });
    } catch (error) {
      console.error('Error clearing exams:', error);
      toast({
        title: "오류",
        description: "시험 할당 해제 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  const handleCardSetToggle = async (cardSetId: string, isChecked: boolean) => {
    if (!selectedAccessCode) return;

    try {
      if (isChecked) {
        // 추가
        const { error } = await supabase.
        from('access_code_card_sets').
        insert({
          access_code_id: selectedAccessCode.id,
          card_set_id: cardSetId
        });

        if (error) throw error;
        setAssignedCardSets((prev) => [...prev, cardSetId]);
      } else {
        // 삭제
        const { error } = await supabase.
        from('access_code_card_sets').
        delete().
        eq('access_code_id', selectedAccessCode.id).
        eq('card_set_id', cardSetId);

        if (error) throw error;
        setAssignedCardSets((prev) => prev.filter((id) => id !== cardSetId));
      }
    } catch (error) {
      console.error('Error updating card set assignment:', error);
      toast({
        title: "오류",
        description: "단어장 할당 변경 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  const handleSelectAllCardSets = async () => {
    if (!selectedAccessCode) return;

    try {
      // 먼저 기존 할당 모두 삭제
      await supabase.
      from('access_code_card_sets').
      delete().
      eq('access_code_id', selectedAccessCode.id);

      // 모든 단어장 할당
      const insertData = cardSets.map((cardSet) => ({
        access_code_id: selectedAccessCode.id,
        card_set_id: cardSet.id
      }));

      const { error } = await supabase.
      from('access_code_card_sets').
      insert(insertData);

      if (error) throw error;
      setAssignedCardSets(cardSets.map((cs) => cs.id));
      toast({
        title: "성공",
        description: "모든 단어장이 할당되었습니다."
      });
    } catch (error) {
      console.error('Error selecting all card sets:', error);
      toast({
        title: "오류",
        description: "단어장 전체 할당 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  const handleClearAllCardSets = async () => {
    if (!selectedAccessCode) return;

    try {
      const { error } = await supabase.
      from('access_code_card_sets').
      delete().
      eq('access_code_id', selectedAccessCode.id);

      if (error) throw error;
      setAssignedCardSets([]);
      toast({
        title: "성공",
        description: "모든 단어장 할당이 해제되었습니다. (전체 단어장 접근 가능)"
      });
    } catch (error) {
      console.error('Error clearing card sets:', error);
      toast({
        title: "오류",
        description: "단어장 할당 해제 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };
  const fetchAccessCodes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.
      from('student_access_codes').
      select('*').
      order('created_at', { ascending: false });

      if (error) throw error;
      setAccessCodes(data || []);
    } catch (error) {
      console.error('Error fetching access codes:', error);
      toast({
        title: "오류",
        description: "액세스 코드를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // 숫자 2개 + 알파벳 2개를 셔플해서 4자리 코드 생성
  const generateStudentCode = (): string => {
    const letters = 'abcdefghjkmnpqrstuvwxyz'; // 혼동되는 문자 제외 (i, l, o)
    const numbers = '23456789'; // 혼동되는 숫자 제외 (0, 1)

    // 랜덤 알파벳 2개
    const letter1 = letters.charAt(Math.floor(Math.random() * letters.length));
    const letter2 = letters.charAt(Math.floor(Math.random() * letters.length));

    // 랜덤 숫자 2개
    const number1 = numbers.charAt(Math.floor(Math.random() * numbers.length));
    const number2 = numbers.charAt(Math.floor(Math.random() * numbers.length));

    // 4개를 합쳐서 셔플
    const chars = [letter1, letter2, number1, number2];
    for (let i = chars.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }

    return chars.join('');
  };

  const generateRandomCode = (length: number = 8): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // 반에 학생들 일괄 등록
  const createStudentsInClass = async () => {
    if (!newClassName.trim()) {
      toast({
        title: "오류",
        description: "반 이름을 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    if (!studentNames.trim()) {
      toast({
        title: "오류",
        description: "학생 이름을 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    setCreatingStudents(true);

    try {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + parseInt(expiryDaysForClass));

      // 줄바꿈 또는 쉼표로 학생 이름 분리
      const names = studentNames.
      split(/[\n,]+/).
      map((name) => name.trim()).
      filter((name) => name.length > 0);

      if (names.length === 0) {
        toast({
          title: "오류",
          description: "유효한 학생 이름이 없습니다.",
          variant: "destructive"
        });
        setCreatingStudents(false);
        return;
      }

      // 기존 코드들 가져와서 중복 체크용
      const { data: existingCodes } = await supabase.
      from('student_access_codes').
      select('access_code');

      const existingCodeSet = new Set(existingCodes?.map((c) => c.access_code) || []);

      const studentsToCreate = [];

      for (const name of names) {
        // 중복되지 않는 코드 생성
        let code = generateStudentCode();
        let attempts = 0;
        while (existingCodeSet.has(code) && attempts < 100) {
          code = generateStudentCode();
          attempts++;
        }

        existingCodeSet.add(code);

        studentsToCreate.push({
          access_code: code,
          exam_code: newClassName.trim(), // 반 이름
          name: name,
          expiry_date: expiryDate.toISOString(),
          max_users: 1,
          is_active: true
        });
      }

      const { error } = await supabase.
      from('student_access_codes').
      insert(studentsToCreate);

      if (error) throw error;

      toast({
        title: "성공",
        description: `${newClassName} 반에 ${studentsToCreate.length}명의 학생이 등록되었습니다.`
      });

      setIsClassDialogOpen(false);
      setNewClassName("");
      setStudentNames("");
      setExpiryDaysForClass("365");
      fetchAccessCodes();
    } catch (error) {
      console.error('Error creating students:', error);
      toast({
        title: "오류",
        description: "학생 등록 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setCreatingStudents(false);
    }
  };

  // 기존 반에 학생 추가
  const addStudentToClass = async () => {
    if (!targetClassName.trim()) {
      toast({
        title: "오류",
        description: "반 이름이 없습니다.",
        variant: "destructive"
      });
      return;
    }

    if (!newStudentName.trim()) {
      toast({
        title: "오류",
        description: "학생 이름을 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    setAddingStudent(true);

    try {
      // 해당 반의 유효기간을 가져옴 (가장 최근 생성된 코드의 유효기간 참조)
      const existingCode = accessCodes.find((c) => c.exam_code === targetClassName);
      const expiryDate = existingCode?.expiry_date ?
      new Date(existingCode.expiry_date) :
      new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

      // 줄바꿈 또는 쉼표로 학생 이름 분리 (여러 명 추가 가능)
      const names = newStudentName.
      split(/[\n,]+/).
      map((name) => name.trim()).
      filter((name) => name.length > 0);

      if (names.length === 0) {
        toast({
          title: "오류",
          description: "유효한 학생 이름이 없습니다.",
          variant: "destructive"
        });
        setAddingStudent(false);
        return;
      }

      // 기존 코드들 가져와서 중복 체크용
      const { data: existingCodes } = await supabase.
      from('student_access_codes').
      select('access_code');

      const existingCodeSet = new Set(existingCodes?.map((c) => c.access_code) || []);

      const studentsToCreate = [];

      for (const name of names) {
        // 중복되지 않는 코드 생성
        let code = generateStudentCode();
        let attempts = 0;
        while (existingCodeSet.has(code) && attempts < 100) {
          code = generateStudentCode();
          attempts++;
        }

        existingCodeSet.add(code);

        studentsToCreate.push({
          access_code: code,
          exam_code: targetClassName,
          name: name,
          expiry_date: expiryDate.toISOString(),
          max_users: 1,
          is_active: true
        });
      }

      const { error } = await supabase.
      from('student_access_codes').
      insert(studentsToCreate);

      if (error) throw error;

      toast({
        title: "성공",
        description: `${targetClassName} 반에 ${studentsToCreate.length}명이 추가되었습니다.`
      });

      setIsAddStudentDialogOpen(false);
      setNewStudentName("");
      fetchAccessCodes();
    } catch (error) {
      console.error('Error adding student:', error);
      toast({
        title: "오류",
        description: "학생 추가 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setAddingStudent(false);
    }
  };

  // 학생 추가 다이얼로그 열기
  const openAddStudentDialog = (className: string) => {
    setTargetClassName(className);
    setNewStudentName("");
    setIsAddStudentDialogOpen(true);
  };

  const createAccessCode = async () => {
    if (!newCodeForm.examCode.trim()) {
      toast({
        title: "오류",
        description: "시험코드를 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    try {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + parseInt(newCodeForm.expiryDays));

      // 입력한 시험코드를 액세스 코드로 사용 (대문자로 변환하고 공백 제거)
      const accessCode = newCodeForm.examCode.trim().toUpperCase().replace(/\s+/g, '');

      const { error } = await supabase.
      from('student_access_codes').
      insert({
        access_code: accessCode,
        exam_code: newCodeForm.examCode.trim(),
        name: newCodeForm.name.trim() || '사용자',
        expiry_date: expiryDate.toISOString(),
        max_users: parseInt(newCodeForm.maxUsers),
        is_active: true
      });

      if (error) {
        if (error.code === '23505') {// Unique constraint violation
          toast({
            title: "오류",
            description: "이미 존재하는 시험코드입니다. 다른 이름을 사용해주세요.",
            variant: "destructive"
          });
        } else {
          throw error;
        }
        return;
      }

      toast({
        title: "성공",
        description: `액세스 코드 ${accessCode}가 생성되었습니다.`
      });

      setIsCreateDialogOpen(false);
      setNewCodeForm({ name: "", examCode: "", expiryDays: "30", maxUsers: "500" });
      fetchAccessCodes();
    } catch (error) {
      console.error('Error creating access code:', error);
      toast({
        title: "오류",
        description: "액세스 코드 생성 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };
  const toggleAccessCode = async (id: string, isActive: boolean) => {
    try {
      const {
        error
      } = await supabase.from('student_access_codes').update({
        is_active: !isActive
      }).eq('id', id);
      if (error) throw error;
      toast({
        title: "성공",
        description: `액세스 코드가 ${!isActive ? '활성화' : '비활성화'}되었습니다.`
      });
      fetchAccessCodes();
    } catch (error) {
      console.error('Error toggling access code:', error);
      toast({
        title: "오류",
        description: "액세스 코드 상태 변경 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };
  const deleteAccessCode = async (id: string) => {
    if (!confirm('정말로 이 액세스 코드를 삭제하시겠습니까?')) {
      return;
    }
    try {
      const {
        error
      } = await supabase.from('student_access_codes').delete().eq('id', id);
      if (error) throw error;
      toast({
        title: "성공",
        description: "액세스 코드가 삭제되었습니다."
      });
      fetchAccessCodes();
    } catch (error) {
      console.error('Error deleting access code:', error);
      toast({
        title: "오류",
        description: "액세스 코드 삭제 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  // 반 전체 삭제
  const deleteEntireClass = async (className: string, codes: AccessCode[]) => {
    if (!confirm(`정말로 "${className}" 반의 모든 학생(${codes.length}명)을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }

    try {
      const codeIds = codes.map((c) => c.id);

      const { error } = await supabase.
      from('student_access_codes').
      delete().
      in('id', codeIds);

      if (error) throw error;

      toast({
        title: "성공",
        description: `"${className}" 반의 ${codes.length}명이 삭제되었습니다.`
      });

      fetchAccessCodes();
    } catch (error) {
      console.error('Error deleting class:', error);
      toast({
        title: "오류",
        description: "반 삭제 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 검색 필터링된 액세스 코드
  const filteredAccessCodes = accessCodes.filter((code) =>
  code.exam_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-6">
        {/* Premium Header - Unified Style */}
        <PageHeader
          icon={accessManagerIcon}
          iconAlt="코드 관리"
          title="코드 관리"
          subtitle="​">

          <div className="flex gap-2">
            {/* orun0088 관리자는 코드 생성 버튼 숨김 */}
            {sessionStorage.getItem('accessCode') !== 'orun0088' &&
            <>
                <Button
                onClick={() => setIsClassDialogOpen(true)}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-md hover:shadow-lg transition-all">

                  <UserPlus className="w-4 h-4 mr-2" />
                  반 생성
                </Button>
                <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white shadow-md hover:shadow-lg transition-all">

                  <Plus className="w-4 h-4 mr-2" />
                  시험코드생성
                </Button>
              </>
            }
            <Button variant="outline" size="sm" onClick={handleGoBack} className="gap-2 bg-slate-700/50 border-slate-600 text-slate-200 hover:bg-slate-600/50 backdrop-blur-sm shadow-sm">
              <ArrowLeft className="w-4 h-4" />
              돌아가기
            </Button>
          </div>
        </PageHeader>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* 반 생성 Dialog */}
        <Dialog open={isClassDialogOpen} onOpenChange={setIsClassDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                반 생성 및 학생 등록
              </DialogTitle>
              <DialogDescription>
                반 이름을 입력하고 학생 이름을 줄바꿈 또는 쉼표로 구분하여 입력하세요.
                <br />
                <span className="text-xs text-blue-600">
                  코드는 자동으로 생성됩니다 (숫자 2개 + 알파벳 2개 셔플)
                </span>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="className">반 이름</Label>
                <Input
                  id="className"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="예: IVY반, 신규생반" />

              </div>
              <Button
                onClick={createStudentsInClass}
                className="w-full"
                disabled={creatingStudents}>

                {creatingStudents ?
                <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    생성 중...
                  </> :

                <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    학생 등록
                  </>
                }
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>새 액세스 코드 생성</DialogTitle>
              <DialogDescription>
                시험코드를 입력하면 자동으로 액세스 코드가 생성됩니다.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">이름</Label>
                <Input
                  id="name"
                  value={newCodeForm.name}
                  onChange={(e) => setNewCodeForm({ ...newCodeForm, name: e.target.value })}
                  placeholder="예: 홍길동" />

              </div>
              <div>
                <Label htmlFor="examCode">시험코드</Label>
                <Input
                  id="examCode"
                  value={newCodeForm.examCode}
                  onChange={(e) => setNewCodeForm({ ...newCodeForm, examCode: e.target.value })}
                  placeholder="" />

              </div>
              <div>
                <Label htmlFor="maxUsers">최대 동시 접속자 수</Label>
                <Input
                  id="maxUsers"
                  type="number"
                  value={newCodeForm.maxUsers}
                  onChange={(e) => setNewCodeForm({ ...newCodeForm, maxUsers: e.target.value })}
                  placeholder="500"
                  min="1" />

              </div>
              <div>
                <Label htmlFor="expiryDays">유효기간 (일)</Label>
                <Input
                  id="expiryDays"
                  type="number"
                  value={newCodeForm.expiryDays}
                  onChange={(e) => setNewCodeForm({ ...newCodeForm, expiryDays: e.target.value })}
                  placeholder="30"
                  min="1" />

              </div>
              <Button onClick={createAccessCode} className="w-full">
                생성하기
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* 학생 추가 Dialog */}
        <Dialog open={isAddStudentDialogOpen} onOpenChange={setIsAddStudentDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                {targetClassName} 반에 학생 추가
              </DialogTitle>
              <DialogDescription>
                학생 이름을 입력하세요. 여러 명을 추가하려면 줄바꿈 또는 쉼표로 구분하세요.
                <br />
                <span className="text-xs text-blue-600">
                  코드는 자동으로 생성됩니다 (숫자 2개 + 알파벳 2개 셔플)
                </span>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="newStudentName">학생 이름</Label>
                <Textarea
                  id="newStudentName"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="홍길동&#10;김철수"
                  rows={4}
                  className="resize-none" />

                <p className="text-xs text-muted-foreground mt-1">
                  {newStudentName.split(/[\n,]+/).filter((n) => n.trim()).length}명 입력됨
                </p>
              </div>
              <Button
                onClick={addStudentToClass}
                className="w-full"
                disabled={addingStudent}>

                {addingStudent ?
                <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    추가 중...
                  </> :

                <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    학생 추가
                  </>
                }
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          {/* Total Access — 미니멀 화이트 */}
          <div className="group relative overflow-hidden rounded-2xl bg-white ring-1 ring-slate-900/5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.08)] hover:shadow-[0_2px_4px_rgba(15,23,42,0.04),0_16px_40px_-16px_rgba(15,23,42,0.18)] transition-all duration-500">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-slate-900/0 via-slate-900/30 to-slate-900/0" />
            <div className="px-5 py-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center shadow-[0_8px_20px_-8px_rgba(15,23,42,0.4)] ring-1 ring-white/10">
                <Key className="w-4 h-4 text-amber-300/90" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-[10.5px] font-medium tracking-[0.1em] uppercase text-slate-400">Total Access</p>
                <p className="mt-0.5 text-[26px] font-semibold tabular-nums tracking-[-0.03em] text-slate-900 leading-none">{accessCodes.length}</p>
              </div>
            </div>
          </div>

          {/* Active — 미니멀 화이트 + emerald */}
          <div className="group relative overflow-hidden rounded-2xl bg-white ring-1 ring-slate-900/5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.08)] hover:shadow-[0_2px_4px_rgba(15,23,42,0.04),0_16px_40px_-16px_rgba(15,23,42,0.18)] transition-all duration-500">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-emerald-500/0 via-emerald-500/40 to-emerald-500/0" />
            <div className="px-5 py-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/60 ring-1 ring-emerald-200/60 flex items-center justify-center">
                <Users className="w-4 h-4 text-emerald-600" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-[10.5px] font-medium tracking-[0.1em] uppercase text-slate-400">Active</p>
                <p className="mt-0.5 text-[26px] font-semibold tabular-nums tracking-[-0.03em] text-slate-900 leading-none">
                  {accessCodes.filter((code) => code.is_active).length}
                  <span className="text-[13px] font-medium text-slate-400 ml-1.5">/ {accessCodes.length}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 검색 */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" strokeWidth={1.75} />
            <Input
              type="text"
              placeholder="시험코드로 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 h-11 bg-slate-100/70 hover:bg-slate-100 focus:bg-white border-0 rounded-full shadow-none focus-visible:ring-2 focus-visible:ring-slate-900/10 placeholder:text-slate-400 text-[13px] tracking-[-0.01em] transition"
            />
          </div>
        </div>

        {/* 액세스 코드 목록 - 반별로 그룹화 */}
        {filteredAccessCodes.length === 0 ?
        <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-b from-white via-slate-50/50 to-white ring-1 ring-slate-900/5 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.18)] px-6 py-20 text-center">
            <div className="pointer-events-none absolute inset-x-16 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" />
            <div className="relative mx-auto mb-6 w-16 h-16">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 shadow-[0_16px_32px_-12px_rgba(15,23,42,0.4)]" />
              <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Key className="w-7 h-7 text-amber-300/90" strokeWidth={1.5} />
              </div>
            </div>
            <h3 className="text-[22px] font-semibold tracking-[-0.03em] text-slate-900">
              {searchTerm ? "검색 결과가 없습니다" : "생성된 액세스 코드가 없습니다"}
            </h3>
            <p className="mt-2 text-[14px] text-slate-500 tracking-[-0.01em]">
              {searchTerm ? "다른 검색어를 시도해보세요." : "'반 생성' 버튼을 눌러 학생들을 등록하세요."}
            </p>
          </div> :

        <div className="space-y-5">
            {/* 반별로 그룹화된 목록 */}
            {groupedByClass.groups.map(([className, codes]) => {
            const filteredCodes = codes.filter((code) =>
            code.exam_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            code.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            code.access_code?.toLowerCase().includes(searchTerm.toLowerCase())
            );

            if (filteredCodes.length === 0) return null;

            return (
              <div key={className} className="relative bg-white rounded-[20px] ring-1 ring-slate-900/5 overflow-hidden shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_30px_-18px_rgba(15,23,42,0.15)] hover:shadow-[0_2px_4px_rgba(15,23,42,0.04),0_18px_40px_-18px_rgba(15,23,42,0.22)] transition-all duration-500">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-300/60 to-transparent" />
                  <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-slate-100/80">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 ring-1 ring-white/10 flex items-center justify-center shadow-[0_8px_16px_-8px_rgba(15,23,42,0.4)]">
                        <Users className="w-3.5 h-3.5 text-amber-300/90" strokeWidth={1.75} />
                      </div>
                      <h3 className="text-[16px] font-semibold text-slate-900 tracking-[-0.02em]">{className}</h3>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold tabular-nums">
                        {filteredCodes.length}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openAddStudentDialog(className)}
                        className="h-8 px-3 text-[12px] font-medium text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 rounded-full"
                        title="학생 추가">
                        <Plus className="w-3.5 h-3.5 mr-1" strokeWidth={2} />
                        추가
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteEntireClass(className, codes)}
                        className="h-8 px-3 text-[12px] font-medium text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full"
                        title="반 전체 삭제">
                        <Trash2 className="w-3.5 h-3.5 mr-1" strokeWidth={2} />
                        삭제
                      </Button>
                    </div>
                  </div>
                  <div className="p-3 bg-gradient-to-b from-slate-50/40 via-white to-white">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-2">
                      {filteredCodes.map((code) =>
                    <div key={code.id} className="group relative bg-white rounded-xl p-2 ring-1 ring-slate-200/80 hover:ring-amber-300/60 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:shadow-[0_6px_18px_-8px_rgba(138,110,47,0.32)] transition-all duration-200 hover:-translate-y-[1px] overflow-hidden">
                          {/* 상단 골드 라인 */}
                          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#C5A059]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          {/* 상태 점 */}
                          <div className="absolute top-1.5 right-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${code.is_active ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]' : 'bg-slate-300'}`}></div>
                          </div>

                          <div className="space-y-1 pt-0.5">
                            {/* 액세스 코드 */}
                            <div className="font-mono text-[13px] font-extrabold text-slate-900 tracking-[0.05em] text-center lowercase">
                              {code.access_code}
                            </div>

                            {/* 이름 */}
                            <div className="font-semibold text-slate-700 text-[11px] text-center leading-tight tracking-tight truncate">
                              {code.name || '사용자'}
                            </div>

                            {/* 최대 접속자 수 */}
                            {code.max_users > 1 &&
                              <div className="text-[9.5px] text-slate-500 text-center leading-tight tabular-nums">
                                최대 {code.max_users}명
                              </div>
                            }

                            {/* 유효기간 */}
                            {code.expiry_date ?
                              <div className={`text-[9.5px] text-center leading-tight tabular-nums ${
                                new Date(code.expiry_date) < new Date() ? 'text-red-500 font-semibold' : 'text-slate-400'}`
                              }>
                                {new Date(code.expiry_date).toLocaleDateString('ko-KR', { year: '2-digit', month: 'short', day: 'numeric' })}
                              </div> :
                              <div className="text-[9.5px] text-slate-400 text-center leading-tight">
                                무기한
                              </div>
                            }

                            {/* 액션 버튼 */}
                            <div className="flex justify-center gap-0.5 pt-1 border-t border-slate-100/70">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenCardSetDialog(code)}
                                className="h-6 w-6 p-0 text-blue-600 hover:bg-blue-50 rounded-md"
                                title="단어장 설정">
                                <BookOpen className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenExamDialog(code)}
                                className="h-6 w-6 p-0 text-purple-600 hover:bg-purple-50 rounded-md"
                                title="시험 설정">
                                <ClipboardList className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleAccessCode(code.id, code.is_active)}
                                className={`h-6 px-1.5 text-[9.5px] font-bold rounded-md ${code.is_active ? 'text-emerald-700 bg-emerald-50/60 hover:bg-emerald-100' : 'text-slate-400 hover:bg-slate-100'}`}>
                                {code.is_active ? "ON" : "OFF"}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteAccessCode(code.id)}
                                className="h-6 w-6 p-0 text-red-500/70 hover:text-red-600 hover:bg-red-50 rounded-md">
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                    )}
                    </div>
                  </div>
                </div>);

          })}
            
            {/* 반 없는 코드들 (기존 방식으로 생성된 코드) */}
            {groupedByClass.noClass.length > 0 &&
          <Card className="shadow-lg border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-black font-bold">
                    <Key className="w-5 h-5" />
                    기타 코드
                    <Badge variant="outline" className="ml-2">
                      {groupedByClass.noClass.filter((code) =>
                  code.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  code.access_code?.toLowerCase().includes(searchTerm.toLowerCase())
                  ).length}개
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-2">
                    {groupedByClass.noClass.
                filter((code) =>
                code.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                code.access_code?.toLowerCase().includes(searchTerm.toLowerCase())
                ).
                map((code) =>
                <div key={code.id} className="group relative bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm rounded-lg p-2 border border-white/30 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] hover:from-white/95 hover:to-white/80">
                          {/* 상태 표시 */}
                          <div className="absolute top-1 right-1">
                            <div className={`w-1.5 h-1.5 rounded-full ${code.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                          </div>
                          
                          {/* 메인 콘텐츠 */}
                          <div className="space-y-1">
                            {/* 액세스 코드 */}
                            <div className="font-mono text-sm font-black text-black tracking-wide text-center lowercase">
                              {code.access_code}
                            </div>
                            
                            {/* 이름 */}
                            <div className="font-medium text-black text-xs text-center leading-tight">
                              {code.name || '사용자'}
                            </div>
                            
                            {/* 최대 접속자 수 */}
                            <div className="text-[10px] text-blue-600 text-center leading-tight">
                              최대 {code.max_users}명
                            </div>
                            
                            {/* 유효기간 표시 */}
                            {code.expiry_date ?
                    <div className={`text-[10px] text-center leading-tight ${
                    new Date(code.expiry_date) < new Date() ? 'text-red-600' : 'text-muted-foreground'}`
                    }>
                                만료: {new Date(code.expiry_date).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                              </div> :

                    <div className="text-[10px] text-muted-foreground text-center leading-tight">
                                무기한
                              </div>
                    }
                            
                            {/* 액션 버튼 */}
                            <div className="flex justify-center gap-0.5 pt-1">
                              <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenCardSetDialog(code)}
                        className="text-[10px] h-5 px-1.5 text-blue-600 hover:bg-blue-50"
                        title="단어장 설정">

                                <BookOpen className="w-2.5 h-2.5" />
                              </Button>
                              <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenExamDialog(code)}
                        className="text-[10px] h-5 px-1.5 text-purple-600 hover:bg-purple-50"
                        title="시험 설정">

                                <ClipboardList className="w-2.5 h-2.5" />
                              </Button>
                              <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleAccessCode(code.id, code.is_active)}
                        className={`text-[10px] h-5 px-1.5 ${code.is_active ? 'text-green-600 hover:bg-green-50' : 'text-gray-500 hover:bg-gray-50'}`}>

                                {code.is_active ? "ON" : "OFF"}
                              </Button>
                              <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteAccessCode(code.id)}
                        className="h-5 w-5 p-0 text-red-500/60 hover:text-red-600 hover:bg-red-50">

                                <Trash2 className="w-2.5 h-2.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                )}
                  </div>
                </CardContent>
              </Card>
          }
          </div>
        }

        {/* 단어장 할당 Dialog */}
        <Dialog open={isCardSetDialogOpen} onOpenChange={setIsCardSetDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                단어장 접근 설정
              </DialogTitle>
              <DialogDescription>
                {selectedAccessCode?.access_code} 코드가 접근할 수 있는 단어장을 선택하세요.
                <br />
                <span className="text-xs text-muted-foreground">
                  (선택하지 않으면 모든 단어장에 접근 가능)
                </span>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAllCardSets}
                  className="flex-1">

                  전체 선택
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearAllCardSets}
                  className="flex-1">

                  전체 해제
                </Button>
              </div>
              <ScrollArea className="h-[300px] border rounded-md p-3">
                <div className="space-y-2">
                  {cardSets.map((cardSet) =>
                  <div key={cardSet.id} className="flex items-center space-x-2">
                      <Checkbox
                      id={cardSet.id}
                      checked={assignedCardSets.includes(cardSet.id)}
                      onCheckedChange={(checked) => handleCardSetToggle(cardSet.id, checked as boolean)} />

                      <label
                      htmlFor={cardSet.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">

                        {cardSet.title}
                      </label>
                    </div>
                  )}
                </div>
              </ScrollArea>
              <div className="text-xs text-muted-foreground text-center">
                {assignedCardSets.length > 0 ?
                `${assignedCardSets.length}개 단어장 선택됨` :
                "모든 단어장 접근 가능"}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* 시험 할당 Dialog */}
        <Dialog open={isExamDialogOpen} onOpenChange={setIsExamDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5" />
                시험 접근 설정
              </DialogTitle>
              <DialogDescription>
                {selectedAccessCode?.access_code} 코드가 응시할 수 있는 시험을 선택하세요.
                <br />
                <span className="text-xs text-muted-foreground">
                  (선택하지 않으면 모든 시험에 접근 가능)
                </span>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAllExams}
                  className="flex-1">

                  전체 선택
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearAllExams}
                  className="flex-1">

                  전체 해제
                </Button>
              </div>
              <ScrollArea className="h-[300px] border rounded-md p-3">
                <div className="space-y-2">
                  {exams.length === 0 ?
                  <p className="text-sm text-muted-foreground text-center py-4">
                      진행중인 시험이 없습니다
                    </p> :

                  exams.map((exam) =>
                  <div key={exam.id} className="flex items-center space-x-2">
                        <Checkbox
                      id={`exam-${exam.id}`}
                      checked={assignedExams.includes(exam.id)}
                      onCheckedChange={(checked) => handleExamToggle(exam.id, checked as boolean)} />

                        <label
                      htmlFor={`exam-${exam.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">

                          {exam.title}
                        </label>
                      </div>
                  )
                  }
                </div>
              </ScrollArea>
              <div className="text-xs text-muted-foreground text-center">
                {assignedExams.length > 0 ?
                `${assignedExams.length}개 시험 선택됨` :
                "모든 시험 접근 가능"}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>);

}