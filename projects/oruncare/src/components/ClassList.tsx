import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import { 
  PlusCircle, 
  Trash2, 
  ChevronDown, 
  ChevronRight, 
  UserPlus, 
  Edit2, 
  UserCog, 
  Users, 
  Clock, 
  AlertCircle 
} from "lucide-react";
import { supabase, deleteClassWithRelatedData } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Student {
  id: string;
  name: string;
  wordbook: string;
  total_days: number;
  days_per_test: number;
  test_start_date?: string;
}

interface Class {
  id: string;
  name: string;
  schedule: string;
  students: Student[];
  teacher: string;
}

export const ClassList = () => {
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [newStudentName, setNewStudentName] = useState("");
  const [expandedTeachers, setExpandedTeachers] = useState<string[]>([]);
  const [newTeacherName, setNewTeacherName] = useState("");
  const [editingSchedule, setEditingSchedule] = useState("");
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [editingTeacher, setEditingTeacher] = useState("");
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);
  const [changingTeacherForClass, setChangingTeacherForClass] = useState<{id: string, currentTeacher: string} | null>(null);
  const [editingClassName, setEditingClassName] = useState("");
  const [editingClassNameId, setEditingClassNameId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: classes = [], isLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select('*');

      if (classesError) {
        console.error('Error fetching classes:', classesError);
        return [];
      }

      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*');

      if (studentsError) {
        console.error('Error fetching students:', studentsError);
        return [];
      }

      return classesData.map(cls => ({
        ...cls,
        students: studentsData
          .filter(student => student.class_id === cls.id)
          .sort((a, b) => a.name.localeCompare(b.name))
      }));
    }
  });

  const addClassMutation = useMutation({
    mutationFn: async (newClass: Omit<Class, 'id' | 'students'>) => {
      const { data, error } = await supabase
        .from('classes')
        .insert([{
          ...newClass,
          wordbook: '미정',
          progress: '0/0일차'
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast({
        title: "새 반이 추가되었습니다",
      });
    },
  });

  const updateScheduleMutation = useMutation({
    mutationFn: async ({ classId, schedule }: { classId: string; schedule: string }) => {
      const { data, error } = await supabase
        .from('classes')
        .update({ schedule })
        .eq('id', classId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast({
        title: "수업 일정이 수정되었습니다",
      });
    },
  });

  const addStudentMutation = useMutation({
    mutationFn: async (newStudent: { class_id: string, name: string }) => {
      const { data, error } = await supabase
        .from('students')
        .insert([{
          ...newStudent,
          wordbook: '미정',
          total_days: 50,
          days_per_test: 5
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      setNewStudentName("");
      toast({
        title: "새 학생이 추가되었습니다",
      });
    },
    onError: (error) => {
      console.error("Error adding student:", error);
      toast({
        title: "학생 추가 중 오류가 발생했습니다",
        description: "다시 시도해주세요",
        variant: "destructive",
      });
    },
  });

  const removeStudentMutation = useMutation({
    mutationFn: async (studentId: string) => {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', studentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast({
        title: "학생이 삭제되었습니다",
      });
    },
  });

  const deleteClassMutation = useMutation({
    mutationFn: async (classId: string) => {
      const result = await deleteClassWithRelatedData(classId);
      if (!result.success) throw result.error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast({
        title: "반이 삭제되었습니다",
      });
    },
    onError: (error) => {
      console.error("Error deleting class:", error);
      toast({
        title: "반 삭제 중 오류가 발생했습니다",
        description: "다시 시도해주세요",
        variant: "destructive",
      });
    }
  });

  const updateTeacherMutation = useMutation({
    mutationFn: async ({ classId, teacher }: { classId: string; teacher: string }) => {
      const { data, error } = await supabase
        .from('classes')
        .update({ teacher })
        .eq('id', classId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast({
        title: "선생님 이름이 수정되었습니다",
      });
    },
  });

  const addTeacherMutation = useMutation({
    mutationFn: async (teacherName: string) => {
      const { data, error } = await supabase
        .from('classes')
        .insert([{
          name: "새 반",
          schedule: "시간 미정",
          teacher: teacherName,
          wordbook: '미정',
          progress: '0/0일차'
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      setNewTeacherName("");
      toast({
        title: "새 선생님이 추가되었습니다",
      });
    },
  });

  const updateClassNameMutation = useMutation({
    mutationFn: async ({ classId, name }: { classId: string; name: string }) => {
      const { data, error } = await supabase
        .from('classes')
        .update({ name })
        .eq('id', classId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast({
        title: "반 이름이 수정되었습니다",
      });
    },
  });

  const changeClassTeacherMutation = useMutation({
    mutationFn: async ({ classId, newTeacher }: { classId: string; newTeacher: string }) => {
      const { data, error } = await supabase
        .from('classes')
        .update({ teacher: newTeacher })
        .eq('id', classId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast({
        title: "담임 선생님이 변경되었습니다",
      });
      setChangingTeacherForClass(null);
    },
  });

  const handleAddStudent = (classId: string) => {
    if (!newStudentName.trim()) {
      toast({
        title: "학생 이름을 입력해주세요",
        variant: "destructive",
      });
      return;
    }
    addStudentMutation.mutate({
      class_id: classId,
      name: newStudentName,
    });
  };

  const handleRemoveStudent = (studentId: string) => {
    removeStudentMutation.mutate(studentId);
  };

  const toggleTeacher = (teacher: string) => {
    setExpandedTeachers(prev =>
      prev.includes(teacher)
        ? prev.filter(t => t !== teacher)
        : [...prev, teacher]
    );
  };

  const handleAddNewClass = (teacher: string) => {
    addClassMutation.mutate({
      name: "새 반",
      schedule: "시간 미정",
      teacher: teacher
    });
  };

  const handleDeleteClass = (classId: string) => {
    deleteClassMutation.mutate(classId);
  };

  const handleEditSchedule = (classId: string, currentSchedule: string) => {
    setEditingClassId(classId);
    setEditingSchedule(currentSchedule);
  };

  const handleSaveSchedule = () => {
    if (editingClassId) {
      updateScheduleMutation.mutate({
        classId: editingClassId,
        schedule: editingSchedule,
      });
      setEditingClassId(null);
    }
  };

  const handleEditTeacher = (classId: string, currentTeacher: string) => {
    setEditingTeacherId(classId);
    setEditingTeacher(currentTeacher);
  };

  const handleSaveTeacher = () => {
    if (editingTeacherId && editingTeacher.trim()) {
      const classesToUpdate = classes.filter(c => c.teacher === classes.find(cl => cl.id === editingTeacherId)?.teacher);
      
      classesToUpdate.forEach(cls => {
        updateTeacherMutation.mutate({
          classId: cls.id,
          teacher: editingTeacher.trim()
        });
      });
      
      setEditingTeacherId(null);
      setEditingTeacher("");
    }
  };

  const handleEditClassName = (classId: string, currentName: string) => {
    setEditingClassNameId(classId);
    setEditingClassName(currentName);
  };

  const handleSaveClassName = () => {
    if (editingClassNameId && editingClassName.trim()) {
      updateClassNameMutation.mutate({
        classId: editingClassNameId,
        name: editingClassName.trim(),
      });
      setEditingClassNameId(null);
      setEditingClassName("");
    }
  };

  const handleChangeTeacher = (classId: string, currentTeacher: string) => {
    setChangingTeacherForClass({ id: classId, currentTeacher });
  };

  const handleConfirmTeacherChange = (newTeacher: string) => {
    if (changingTeacherForClass) {
      changeClassTeacherMutation.mutate({
        classId: changingTeacherForClass.id,
        newTeacher
      });
    }
  };

  const classesByTeacher = classes.reduce((acc, cls) => {
    if (!acc[cls.teacher]) {
      acc[cls.teacher] = [];
    }
    acc[cls.teacher].push(cls);
    return acc;
  }, {} as Record<string, Class[]>);

  // 기본적으로 모든 선생님 섹션을 펼쳐놓기
  useEffect(() => {
    if (classes.length > 0 && expandedTeachers.length === 0) {
      const allTeachers = [...new Set(classes.map(cls => cls.teacher))];
      setExpandedTeachers(allTeachers);
    }
  }, [classes]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-gray-500">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (Object.keys(classesByTeacher).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="h-12 w-12 text-gray-400" />
        <p className="text-gray-500">등록된 선생님이 ��습니다.</p>
        <div className="flex gap-2 mt-4">
          <Input
            placeholder="새 선생님 이름"
            value={newTeacherName}
            onChange={(e) => setNewTeacherName(e.target.value)}
            className="border-primary/20 focus-visible:ring-primary/30"
          />
          <Button 
            onClick={() => {
              if (newTeacherName.trim()) {
                addTeacherMutation.mutate(newTeacherName.trim());
              }
            }} 
            className="whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            새 선생님 추가
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex gap-3 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200/60">
        <Input
          placeholder="새 선생님 이름"
          value={newTeacherName}
          onChange={(e) => setNewTeacherName(e.target.value)}
          className="border-slate-300 focus-visible:ring-primary/30 bg-white text-base"
        />
        <Button 
          onClick={() => {
            if (newTeacherName.trim()) {
              addTeacherMutation.mutate(newTeacherName.trim());
            }
          }} 
          className="whitespace-nowrap bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white shadow-lg shadow-slate-400/30 text-base px-6"
        >
          <UserPlus className="w-5 h-5 mr-2" />
          새 선생님 추가
        </Button>
      </div>
      
      {Object.entries(classesByTeacher).map(([teacher, teacherClasses]) => (
        <div key={teacher} className="border border-slate-200 rounded-2xl overflow-hidden shadow-lg shadow-slate-200/40 transition-all duration-300 hover:shadow-xl hover:shadow-slate-300/50 hover:border-slate-300 bg-white">
          <div
            className="relative bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 py-2.5 px-5 flex items-center justify-between cursor-pointer overflow-hidden"
            onClick={() => toggleTeacher(teacher)}
          >
            {/* Decorative pattern overlay */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-full" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }} />
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-20 w-24 h-24 bg-white/5 rounded-full translate-y-1/2" />
            <div className="relative z-10 flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 shadow-inner">
                <Users className="h-6 w-6 text-white" />
              </div>
              {editingTeacherId === teacherClasses[0].id ? (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
                      <Edit2 className="w-4 h-4 mr-2" />
                      선생님 이름 수정
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>선생님 이름 수정</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <Input
                        value={editingTeacher}
                        onChange={(e) => setEditingTeacher(e.target.value)}
                        placeholder="선생님 이름"
                        className="border-primary/20 focus-visible:ring-primary/30"
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setEditingTeacherId(null)}
                        >
                          취소
                        </Button>
                        <Button onClick={handleSaveTeacher}>
                          저장
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ) : (
                <>
                  <h3 className="text-xl font-bold text-white tracking-wide">{teacher}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditTeacher(teacherClasses[0].id, teacher);
                    }}
                    className="text-white/70 hover:text-white hover:bg-white/20"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </>
              )}
              <Button 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddNewClass(teacher);
                }}
                className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:border-white/50"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                새 반 추가
              </Button>
            </div>
            <div className="relative z-10 flex items-center gap-4">
              <span className="text-base text-white/80">총 {teacherClasses.length}개 반</span>
              <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-base font-semibold shadow-inner">
                <Users className="w-4 h-4" />
                {teacherClasses.reduce((total, cls) => total + cls.students.length, 0)}명
              </span>
              {expandedTeachers.includes(teacher) ? (
                <ChevronDown className="h-6 w-6 text-white" />
              ) : (
                <ChevronRight className="h-6 w-6 text-white" />
              )}
            </div>
          </div>
          
          {expandedTeachers.includes(teacher) && (
            <div className="p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[30%]">반 이름</TableHead>
                    <TableHead className="w-[30%]">수업 일정</TableHead>
                    <TableHead className="w-[15%]">학생 수</TableHead>
                    <TableHead className="w-[25%]">관리</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teacherClasses.map((cls) => (
                    <TableRow key={cls.id} className="group hover:bg-gray-50/80">
                      <TableCell className="font-medium">
                        {editingClassNameId === cls.id ? (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="border-primary/20 hover:border-primary/40">
                                <Edit2 className="w-4 h-4 mr-2" />
                                반 이름 수정
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle>반 이름 수정</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <Input
                                  value={editingClassName}
                                  onChange={(e) => setEditingClassName(e.target.value)}
                                  placeholder="반 이름"
                                  className="border-primary/20 focus-visible:ring-primary/30"
                                />
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => setEditingClassNameId(null)}
                                  >
                                    취소
                                  </Button>
                                  <Button onClick={handleSaveClassName}>
                                    저장
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span>{cls.name}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditClassName(cls.id, cls.name)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-primary"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingClassId === cls.id ? (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="border-primary/20 hover:border-primary/40">
                                <Edit2 className="w-4 h-4 mr-2" />
                                수업 일정 수정
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle>수업 일정 수정</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <Input
                                  value={editingSchedule}
                                  onChange={(e) => setEditingSchedule(e.target.value)}
                                  placeholder="예: 월,수,금 17:00"
                                  className="border-primary/20 focus-visible:ring-primary/30"
                                />
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => setEditingClassId(null)}
                                  >
                                    취소
                                  </Button>
                                  <Button onClick={handleSaveSchedule}>
                                    저장
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span>{cls.schedule}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditSchedule(cls.id, cls.schedule)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-primary"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-sm font-medium">
                          <Users className="w-3.5 h-3.5" />
                          {cls.students.length}명
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Dialog open={changingTeacherForClass?.id === cls.id} onOpenChange={(open) => !open && setChangingTeacherForClass(null)}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleChangeTeacher(cls.id, teacher)}
                                className="border-primary/20 hover:border-primary/40"
                              >
                                <UserCog className="w-4 h-4 mr-2" />
                                담임변경
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle>담임 선생님 변경</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <Select onValueChange={handleConfirmTeacherChange}>
                                  <SelectTrigger className="border-primary/20 focus:ring-primary/30">
                                    <SelectValue placeholder="선생님 선택" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Object.keys(classesByTeacher)
                                      .filter(t => t !== teacher)
                                      .map(t => (
                                        <SelectItem key={t} value={t}>
                                          {t}
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>반 삭제</AlertDialogTitle>
                                <AlertDialogDescription>
                                  정말로 이 반을 삭제하시겠습니까? 이 작업은 되돌릴 수 없으며, 해당 반의 모든 학생 정보도 함께 삭제됩니다.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>취소</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteClass(cls.id)}
                                  className="bg-red-500 hover:bg-red-600"
                                >
                                  삭제
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          <Sheet>
                            <SheetTrigger asChild>
                              <Button
                                variant="outline"
                                onClick={() => setSelectedClass(cls)}
                                className="bg-primary/5 border-primary/20 hover:border-primary/40 text-primary hover:text-primary-dark hover:bg-primary/10"
                              >
                                학생 관리
                              </Button>
                            </SheetTrigger>
                            <SheetContent className="w-[90vw] sm:max-w-[800px]">
                              <SheetHeader>
                                <SheetTitle className="text-xl mb-4 flex items-center gap-2">
                                  <Users className="w-5 h-5 text-primary" />
                                  {cls.name} 학생 관리
                                </SheetTitle>
                              </SheetHeader>
                              <div className="flex flex-col h-full">
                                <div className="flex gap-2 mb-4">
                                  <Input
                                    placeholder="새 학생 이름"
                                    value={newStudentName}
                                    onChange={(e) => setNewStudentName(e.target.value)}
                                    className="border-primary/20 focus-visible:ring-primary/30"
                                  />
                                  <Button
                                    onClick={() => handleAddStudent(cls.id)}
                                    disabled={addStudentMutation.isPending}
                                    className="whitespace-nowrap bg-primary hover:bg-primary-dark"
                                  >
                                    <PlusCircle className="w-4 h-4 mr-2" />
                                    {addStudentMutation.isPending ? "추가 중..." : "학생 추가"}
                                  </Button>
                                </div>
                                <ScrollArea className="flex-1">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>이름</TableHead>
                                        <TableHead>관리</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {cls.students.length === 0 ? (
                                        <TableRow>
                                          <TableCell colSpan={2} className="text-center py-8 text-gray-500">
                                            등록된 학생이 없습니다
                                          </TableCell>
                                        </TableRow>
                                      ) : (
                                        cls.students.map((student) => (
                                          <TableRow key={student.id} className="group">
                                            <TableCell className="font-medium">{student.name}</TableCell>
                                            <TableCell>
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => handleRemoveStudent(student.id)}
                                              >
                                                <Trash2 className="w-4 h-4" />
                                              </Button>
                                            </TableCell>
                                          </TableRow>
                                        ))
                                      )}
                                    </TableBody>
                                  </Table>
                                </ScrollArea>
                              </div>
                            </SheetContent>
                          </Sheet>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
