-- exam_submissions.exam_id를 SET NULL로 변경하여 시험 삭제 시 결과 보존
ALTER TABLE public.exam_submissions
  ALTER COLUMN exam_id DROP NOT NULL;

ALTER TABLE public.exam_submissions
  DROP CONSTRAINT exam_submissions_exam_id_fkey,
  ADD CONSTRAINT exam_submissions_exam_id_fkey
    FOREIGN KEY (exam_id) REFERENCES public.exams(id)
    ON DELETE SET NULL;