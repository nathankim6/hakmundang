import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Edit, Trash2, Plus, Users } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ClassData {
  id: string;
  name: string;
  schedule: string;
  wordbook: string;
  progress: string;
  teacher: string;
  description?: string;
  start_date?: string;
  end_date?: string;
}

const ClassManagement = () => {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassData | null>(null);
  const [formData, setFormData] = useState<Partial<ClassData>>({
    name: '',
    schedule: '',
    wordbook: '',
    progress: '',
    teacher: '',
    description: '',
    start_date: '',
    end_date: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast({
        title: "오류",
        description: "반 목록을 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.schedule || !formData.teacher) {
      toast({
        title: "입력 오류",
        description: "반 이름, 수업 시간, 담당 교사는 필수 입력 항목입니다.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingClass) {
        // 수정
        const { error } = await supabase
          .from('classes')
          .update(formData)
          .eq('id', editingClass.id);

        if (error) throw error;

        toast({
          title: "성공",
          description: "반 정보가 수정되었습니다.",
        });
      } else {
        // 추가 - 필수 필드만 포함
        const classInsertData = {
          name: formData.name!,
          schedule: formData.schedule!,
          wordbook: formData.wordbook || '',
          progress: formData.progress || '',
          teacher: formData.teacher!,
          description: formData.description || null,
          start_date: formData.start_date || null,
          end_date: formData.end_date || null
        };

        const { error } = await supabase
          .from('classes')
          .insert([classInsertData]);

        if (error) throw error;

        toast({
          title: "성공",
          description: "새 반이 추가되었습니다.",
        });
      }

      setIsDialogOpen(false);
      setEditingClass(null);
      setFormData({
        name: '',
        schedule: '',
        wordbook: '',
        progress: '',
        teacher: '',
        description: '',
        start_date: '',
        end_date: ''
      });
      fetchClasses();
    } catch (error) {
      console.error('Error saving class:', error);
      toast({
        title: "오류",
        description: "반 정보를 저장하는데 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (classData: ClassData) => {
    setEditingClass(classData);
    setFormData(classData);
    setIsDialogOpen(true);
  };

  const handleDelete = async (classId: string, className: string) => {
    try {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', classId);

      if (error) throw error;

      toast({
        title: "성공",
        description: `${className} 반이 삭제되었습니다.`,
      });
      fetchClasses();
    } catch (error) {
      console.error('Error deleting class:', error);
      toast({
        title: "오류",
        description: "반을 삭제하는데 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setEditingClass(null);
    setFormData({
      name: '',
      schedule: '',
      wordbook: '',
      progress: '',
      teacher: '',
      description: '',
      start_date: '',
      end_date: ''
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">반 관리</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="h-4 w-4 mr-2" />
              새 반 추가
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingClass ? '반 정보 수정' : '새 반 추가'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">반 이름 *</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="예: 중1A반"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="schedule">수업 시간 *</Label>
                <Input
                  id="schedule"
                  value={formData.schedule || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, schedule: e.target.value }))}
                  placeholder="예: 월수금 17:00-19:00"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="teacher">담당 교사 *</Label>
                <Input
                  id="teacher"
                  value={formData.teacher || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, teacher: e.target.value }))}
                  placeholder="예: 김선생님"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="wordbook">교재</Label>
                <Input
                  id="wordbook"
                  value={formData.wordbook || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, wordbook: e.target.value }))}
                  placeholder="예: 워드마스터 중급"
                />
              </div>
              
              <div>
                <Label htmlFor="progress">진도</Label>
                <Input
                  id="progress"
                  value={formData.progress || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, progress: e.target.value }))}
                  placeholder="예: 1-500번"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingClass ? '수정' : '추가'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  취소
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {classes.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>등록된 반이 없습니다.</p>
              <p className="text-sm mt-1">새 반을 추가해보세요.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {classes.map((classData) => (
            <Card key={classData.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{classData.name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{classData.schedule}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(classData)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>반 삭제 확인</AlertDialogTitle>
                          <AlertDialogDescription>
                            '{classData.name}' 반을 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>취소</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(classData.id, classData.name)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            삭제
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">담당 교사:</span>
                    <p>{classData.teacher}</p>
                  </div>
                  {classData.wordbook && (
                    <div>
                      <span className="font-medium text-gray-600">교재:</span>
                      <p>{classData.wordbook}</p>
                    </div>
                  )}
                  {classData.progress && (
                    <div>
                      <span className="font-medium text-gray-600">진도:</span>
                      <p>{classData.progress}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClassManagement;