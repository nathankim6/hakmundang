import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Save } from 'lucide-react';
import { format } from 'date-fns';

interface TeacherCommentsProps {
  selectedDate: Date;
  teachers: string[];
}

interface TAComment {
  id: string;
  teacher_name: string;
  comment: string;
  date: string;
  created_at: string;
  updated_at: string;
}

export const TeacherComments = ({ selectedDate, teachers }: TeacherCommentsProps) => {
  const { toast } = useToast();
  const [comments, setComments] = useState<Record<string, string>>({});
  const [savedComments, setSavedComments] = useState<Record<string, TAComment>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  const dateString = format(selectedDate, 'yyyy-MM-dd');

  useEffect(() => {
    loadComments();
  }, [selectedDate, teachers]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ta_comments')
        .select('*')
        .eq('date', dateString)
        .in('teacher_name', teachers);

      if (error) throw error;

      const commentsMap: Record<string, TAComment> = {};
      const currentComments: Record<string, string> = {};

      data?.forEach((comment: TAComment) => {
        commentsMap[comment.teacher_name] = comment;
        currentComments[comment.teacher_name] = comment.comment;
      });

      setSavedComments(commentsMap);
      setComments(currentComments);
    } catch (error) {
      console.error('Error loading comments:', error);
      toast({
        title: "코멘트 불러오기 실패",
        description: "코멘트를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveComment = async (teacherName: string) => {
    const comment = comments[teacherName]?.trim();
    if (!comment) return;

    try {
      setSaving(prev => ({ ...prev, [teacherName]: true }));

      const existingComment = savedComments[teacherName];

      if (existingComment) {
        // Update existing comment
        const { error } = await supabase
          .from('ta_comments')
          .update({ comment })
          .eq('id', existingComment.id);

        if (error) throw error;
      } else {
        // Create new comment
        const { data, error } = await supabase
          .from('ta_comments')
          .insert({
            teacher_name: teacherName,
            comment,
            date: dateString
          })
          .select()
          .single();

        if (error) throw error;

        setSavedComments(prev => ({ ...prev, [teacherName]: data }));
      }

      toast({
        title: "코멘트 저장 완료",
        description: `${teacherName} 선생님의 코멘트가 저장되었습니다.`,
      });

      // Refresh comments to get updated data
      await loadComments();
    } catch (error) {
      console.error('Error saving comment:', error);
      toast({
        title: "코멘트 저장 실패",
        description: "코멘트 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setSaving(prev => ({ ...prev, [teacherName]: false }));
    }
  };

  const handleCommentChange = (teacherName: string, value: string) => {
    setComments(prev => ({ ...prev, [teacherName]: value }));
  };

  if (loading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            조교에게 남길 코멘트
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">로딩 중...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
          <MessageSquare className="h-6 w-6 text-primary drop-shadow-sm" />
          조교에게 남길 코멘트 ({format(selectedDate, 'yyyy년 MM월 dd일')})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {teachers.map((teacher) => {
            const hasChanges = comments[teacher] !== (savedComments[teacher]?.comment || '');
            
            return (
              <div key={teacher} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">
                    {teacher} 선생님
                  </label>
                  {savedComments[teacher] && (
                    <span className="text-xs text-muted-foreground">
                      마지막 수정: {format(new Date(savedComments[teacher].updated_at), 'HH:mm')}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Textarea
                    value={comments[teacher] || ''}
                    onChange={(e) => handleCommentChange(teacher, e.target.value)}
                    placeholder="코멘트를 입력하세요"
                    className="flex-1"
                    rows={2}
                  />
                  <Button
                    onClick={() => saveComment(teacher)}
                    disabled={saving[teacher] || !hasChanges || !comments[teacher]?.trim()}
                    size="sm"
                    className="self-start"
                  >
                    <Save className="h-4 w-4" />
                    {saving[teacher] ? '저장 중...' : '저장'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};