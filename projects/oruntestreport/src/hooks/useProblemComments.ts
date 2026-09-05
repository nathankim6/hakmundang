import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type ProblemComment = {
  id?: string;
  report_id: string;
  problem_id: string;
  comment: string;
  photo_urls: string[];
};

type CommentsMap = Record<string, ProblemComment>;

export function useProblemComments(reportId?: string) {
  const [comments, setComments] = useState<CommentsMap>({});
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!reportId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('problem_comments')
      .select('*')
      .eq('report_id', reportId);
    if (error) {
      console.error('Failed to load problem comments', error);
      setLoading(false);
      return;
    }
    const map: CommentsMap = {};
    (data || []).forEach((row: any) => {
      map[row.problem_id] = {
        id: row.id,
        report_id: row.report_id,
        problem_id: row.problem_id,
        comment: row.comment || '',
        photo_urls: row.photo_urls || [],
      };
    });
    setComments(map);
    setLoading(false);
  }, [reportId]);

  useEffect(() => {
    load();
  }, [load]);

  const upsert = useCallback(
    async (problemId: string, patch: Partial<Pick<ProblemComment, 'comment' | 'photo_urls'>>) => {
      if (!reportId) {
        toast.error('리포트 ID가 없어 저장할 수 없습니다.');
        return;
      }
      const existing = comments[problemId];
      const next: ProblemComment = {
        report_id: reportId,
        problem_id: problemId,
        comment: patch.comment ?? existing?.comment ?? '',
        photo_urls: patch.photo_urls ?? existing?.photo_urls ?? [],
      };

      // Optimistic update
      setComments((prev) => ({ ...prev, [problemId]: { ...existing, ...next } }));

      const { data, error } = await supabase
        .from('problem_comments')
        .upsert(
          {
            report_id: next.report_id,
            problem_id: next.problem_id,
            comment: next.comment,
            photo_urls: next.photo_urls,
          },
          { onConflict: 'report_id,problem_id' }
        )
        .select()
        .single();

      if (error) {
        console.error('Failed to save problem comment', error);
        toast.error('코멘트 저장에 실패했습니다.');
        return;
      }
      setComments((prev) => ({
        ...prev,
        [problemId]: {
          id: data.id,
          report_id: data.report_id,
          problem_id: data.problem_id,
          comment: data.comment || '',
          photo_urls: data.photo_urls || [],
        },
      }));
    },
    [reportId, comments]
  );

  const addPhoto = useCallback(
    async (problemId: string, file: File) => {
      if (!reportId) return;
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${reportId}/${problemId}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('problem-comment-photos')
        .upload(path, file, { cacheControl: '3600', upsert: false });
      if (upErr) {
        console.error(upErr);
        toast.error('사진 업로드에 실패했습니다.');
        return;
      }
      const { data: pub } = supabase.storage
        .from('problem-comment-photos')
        .getPublicUrl(path);
      const url = pub.publicUrl;
      const existing = comments[problemId];
      await upsert(problemId, {
        photo_urls: [...(existing?.photo_urls || []), url],
      });
      toast.success('사진이 추가되었습니다.');
    },
    [reportId, comments, upsert]
  );

  const removePhoto = useCallback(
    async (problemId: string, url: string) => {
      const existing = comments[problemId];
      if (!existing) return;
      await upsert(problemId, {
        photo_urls: existing.photo_urls.filter((u) => u !== url),
      });
      // best-effort storage cleanup
      try {
        const marker = '/problem-comment-photos/';
        const idx = url.indexOf(marker);
        if (idx !== -1) {
          const path = url.substring(idx + marker.length);
          await supabase.storage.from('problem-comment-photos').remove([path]);
        }
      } catch (e) {
        console.warn('Photo cleanup failed', e);
      }
    },
    [comments, upsert]
  );

  return { comments, loading, upsert, addPhoto, removePhoto, reload: load };
}