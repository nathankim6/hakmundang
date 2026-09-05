import React, { useState, useEffect } from 'react';
import { Camera, X, Pencil, Check, MessageSquarePlus } from 'lucide-react';
import { TeacherPhotoUploader } from '@/components/TeacherPhotoUploader';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useProblemComments } from '@/hooks/useProblemComments';

interface HitQuestionPhotosProps {
 photos?: Array<{
 url: string;
 problemNumber?: number;
 problemName?: string;
 selectedArea?: {
 x: number;
 y: number;
 width: number;
 height: number;
 };
 }>;
 themeColors: any;
 onPhotoUpload?: (photoUrl: string) => void;
 onPhotoDelete?: (photoIndex: number) => void;
 editable?: boolean;
  reportId?: string;
  onPhotoNameChange?: (photoIndex: number, name: string) => void;
}

const HitQuestionPhotos: React.FC<HitQuestionPhotosProps> = ({
 photos,
 themeColors,
 onPhotoUpload,
 onPhotoDelete,
 editable = false,
  reportId,
  onPhotoNameChange,
}) => {
 if (!photos || (photos.length === 0 && !editable)) return null;

  // 사진별 코멘트 — problem_comments 테이블 재활용
  const { comments, upsert } = useProblemComments(reportId);
  const photoCommentId = (photo: { url: string }) => `hit-photo:${photo.url}`;

 return (
 <section className="report-section">
 <div className="flex items-baseline justify-between mb-6">
 <div className="flex items-center gap-3">
 <span className="section-numeral section-numeral-c2">★</span>
 <div>
                 <span className="editorial-kicker block" style={{ color: 'hsl(var(--c2-deep))' }}>Killer</span>
 <h2 className="font-display text-2xl md:text-3xl text-[hsl(var(--ink))] tracking-[-0.025em] font-medium leading-tight">
 대표 킬러 문항
 </h2>
 </div>
 </div>

 {editable && onPhotoUpload ? (
 <TeacherPhotoUploader
 onPhotoUpload={onPhotoUpload}
 buttonText="킬러문항 사진 추가"
 maxUploads={10}
 bucketName="report-photos"
 />
  ) : null}
 </div>

 <div className="space-y-8">
 {photos &&
 photos.map((photo, index) => (
   <figure
  key={index}
  className="relative group overflow-hidden rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-[0_8px_32px_-12px_hsl(var(--ink)/0.08)] transition-all duration-300 hover:shadow-[0_16px_48px_-16px_hsl(var(--ink)/0.14)]"
  >
  {/* Top accent bar */}
  <div className="h-1 w-full bg-[hsl(var(--c2))]" />

  {editable && onPhotoDelete && (
  <Button
  type="button"
  variant="destructive"
  size="icon"
  className="absolute top-2 right-2 z-20 rounded-full opacity-90 hover:opacity-100"
  onClick={() => onPhotoDelete(index)}
  >
  <X className="h-4 w-4" />
  </Button>
  )}

  <div className="aspect-[21/9] relative overflow-hidden bg-[hsl(var(--paper-warm))]">
  {/* Subtle inner frame */}
  <div className="absolute inset-0 border border-[hsl(var(--ink)/0.06)] pointer-events-none z-20" />

  <img
  src={photo.url}
  alt={`킬러문항 ${photo.problemNumber || index + 1}`}
  className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
  />

  {photo.problemNumber && (
  <div
  className="absolute top-3 left-1/2 -translate-x-1/2 z-30 inline-flex items-center justify-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-sm text-center max-w-[90%]"
  style={{
  backgroundColor: themeColors.primary,
  }}
  >
  Q.{photo.problemNumber}
  {photo.problemName && (
  <span className="normal-case tracking-normal font-normal opacity-90 text-center">
  {photo.problemName}
  </span>
  )}
  </div>
  )}

  {photo.selectedArea && (
  <div
  className="absolute border-2 pointer-events-none z-30"
  style={{
  left: `${photo.selectedArea.x}px`,
  top: `${photo.selectedArea.y}px`,
  width: `${photo.selectedArea.width}px`,
  height: `${photo.selectedArea.height}px`,
  borderColor: themeColors.primary,
  backgroundColor: `${themeColors.primary}1A`,
  }}
  />
  )}
  </div>

 {editable && onPhotoNameChange && (
   <div className="px-4 py-3 border-t border-[hsl(var(--ink)/0.08)]">
     <Textarea
       value={photo.problemName || ''}
       onChange={(e) => onPhotoNameChange(index, e.target.value)}
       placeholder="이 킬러문항에 대한 설명을 입력하세요."
       className="min-h-[72px] text-[14px] leading-[1.7] bg-white"
       style={{ wordBreak: 'keep-all' }}
     />
   </div>
 )}

  {reportId && (
    <HitPhotoComment
      key={`comment-${photo.url}`}
      photoId={photoCommentId(photo)}
      initial={comments[photoCommentId(photo)]?.comment || ''}
      onSave={(text) => upsert(photoCommentId(photo), { comment: text })}
      themeColors={themeColors}
    />
  )}
 </figure>
 ))}

 {editable && (!photos || photos.length === 0) && (
 <div
 className="flex items-center justify-center p-12 border border-dashed text-muted-foreground"
 style={{ borderColor: 'hsl(var(--foreground) / 0.2)' }}
 >
 <div className="flex flex-col items-center gap-3">
 <Camera className="h-8 w-8" style={{ color: themeColors.primary }} />
 <p className="editorial-kicker">킬러문항 사진을 추가하세요</p>
 </div>
 </div>
 )}
 </div>

 </section>
 );
};

export default HitQuestionPhotos;

// ─────────────────────────────────────────────────────────────
// 사진별 코멘트 입력/표시 — 인쇄/PDF 시 버튼 자동 숨김
// ─────────────────────────────────────────────────────────────
const HitPhotoComment: React.FC<{
  photoId: string;
  initial: string;
  onSave: (text: string) => Promise<void> | void;
  themeColors: any;
}> = ({ photoId, initial, onSave, themeColors }) => {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(initial);

  useEffect(() => {
    setText(initial);
  }, [initial]);

  const hasContent = (initial?.trim().length || 0) > 0;

  const handleSave = async () => {
    await onSave(text.trim());
    setEditing(false);
  };

  // 빈 상태 — 작은 추가 버튼만 표시 (캡처 시 숨김)
  if (!hasContent && !editing) {
    return (
      <div className="px-4 pt-3 pb-3 print:hidden border-t border-[hsl(var(--ink)/0.06)]">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setEditing(true)}
          className="h-7 px-2 text-[12px] text-[hsl(var(--ink-soft))] hover:text-[hsl(var(--ink))]"
        >
          <MessageSquarePlus className="h-3.5 w-3.5 mr-1.5" />
          이 사진에 코멘트 추가
        </Button>
      </div>
    );
  }

  // 편집 모드
  if (editing) {
    return (
      <div className="px-4 py-4 bg-[hsl(46_85%_88%)] border-t border-[hsl(var(--gold)/0.35)] print:hidden">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="이 킬러 문항에 대한 코멘트를 입력하세요."
          className="min-h-[80px] text-[14px] bg-white leading-[1.7] tracking-[-0.005em] mb-3"
          style={{
            fontFamily:
              "'Noto Sans KR', 'Noto Sans', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', system-ui, sans-serif",
            wordBreak: 'keep-all',
          }}
          autoFocus
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave} className="gap-1">
            <Check className="h-3.5 w-3.5" /> 저장
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setText(initial);
              setEditing(false);
            }}
          >
            취소
          </Button>
        </div>
      </div>
    );
  }

  // 표시 모드
  return (
    <div className="group/photo-comment px-4 py-4 bg-[hsl(46_85%_88%)] border-t border-[hsl(var(--gold)/0.35)] flex items-start justify-between gap-3">
      <p
        className="text-[14px] leading-[1.7] whitespace-pre-wrap flex-1 tracking-[-0.005em] text-justify"
        style={{
          fontFamily:
            "'Noto Sans KR', 'Noto Sans', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', system-ui, sans-serif",
          wordBreak: 'break-word',
          overflowWrap: 'anywhere',
          color: 'hsl(0 0% 0%)',
        }}
      >
        {initial}
      </p>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setEditing(true)}
        className="h-7 w-7 p-0 flex-shrink-0 opacity-0 group-hover/photo-comment:opacity-100 transition-opacity text-[hsl(var(--ink-soft))] hover:text-[hsl(var(--ink))] print:hidden"
        aria-label="코멘트 수정"
      >
        <Pencil className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
};
