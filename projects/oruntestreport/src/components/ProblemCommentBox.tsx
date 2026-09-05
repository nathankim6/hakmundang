import React, { useEffect, useRef, useState } from 'react';
import { Camera, Trash2, X, Pencil, Check, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { ProblemComment } from '@/hooks/useProblemComments';

type Props = {
  problemId: string;
  comment?: ProblemComment;
  onSave: (problemId: string, text: string) => Promise<void> | void;
  onAddPhoto: (problemId: string, file: File) => Promise<void> | void;
  onRemovePhoto: (problemId: string, url: string) => Promise<void> | void;
};

const ProblemCommentBox: React.FC<Props> = ({
  problemId,
  comment,
  onSave,
  onAddPhoto,
  onRemovePhoto,
}) => {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(comment?.comment || '');
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [actionsOpen, setActionsOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setText(comment?.comment || '');
  }, [comment?.comment]);

  const photos = comment?.photo_urls || [];
  const hasContent = (comment?.comment?.trim().length || 0) > 0 || photos.length > 0;

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await onAddPhoto(problemId, file);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleSave = async () => {
    await onSave(problemId, text.trim());
    setEditing(false);
  };

  // 코멘트/사진 없음 → 행 높이를 차지하지 않는 hover 액션 (인쇄 시 숨김)
  if (!editing && !hasContent) {
    return (
      <div className="pointer-events-none absolute right-2 top-1 z-10 h-0 print:hidden">
        <div className="pointer-events-auto flex -translate-y-px items-center gap-0.5 rounded-full border border-[hsl(var(--ink)/0.1)] bg-[hsl(var(--paper))] px-0.5 opacity-0 shadow-sm transition-opacity group-hover/row:opacity-100">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setEditing(true)}
            className="h-5 px-1.5 text-[10px] text-[hsl(var(--ink-soft))] hover:text-[hsl(var(--ink))]"
          >
            <Pencil className="mr-1 h-3 w-3" />
            코멘트
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="h-5 px-1.5 text-[10px] text-[hsl(var(--ink-soft))] hover:text-[hsl(var(--ink))]"
          >
            <Camera className="mr-1 h-3 w-3" />
            {uploading ? '업로드…' : '사진'}
          </Button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group/comment px-3 pt-1 ${
        editing || hasContent ? 'pb-4 bg-[hsl(46_85%_88%)] rounded-md' : 'pb-1'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Left rule — 코멘트/사진/편집 중일 때만 표시 */}
        {(editing || hasContent) && (
          <div className="hidden md:block w-1 self-stretch bg-[hsl(var(--gold)/0.5)] rounded-sm flex-shrink-0 mt-1" />
        )}

        {/* Photos — 왼쪽 (섹션의 절반) */}
        {photos.length > 0 && (
          <div className="flex flex-wrap gap-2 w-1/2 flex-shrink-0">
            {photos.map((url) => (
              <div
                key={url}
                className="relative group border border-[hsl(var(--ink)/0.12)] bg-white w-full"
                style={{ borderRadius: '2px' }}
              >
                <img
                  src={url}
                  alt="첨부 사진"
                  className="w-full h-auto object-cover cursor-zoom-in my-0"
                  onClick={() => setPreview(url)}
                />
                <button
                  type="button"
                  onClick={() => onRemovePhoto(problemId, url)}
                  className="absolute -top-2 -right-2 bg-white border border-[hsl(var(--ink)/0.2)] rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow print:hidden"
                  aria-label="사진 삭제"
                >
                  <Trash2 className="h-3 w-3 text-[hsl(0_65%_48%)]" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Comment + actions — 오른쪽 (섹션의 절반) */}
        <div className={`${photos.length > 0 ? 'w-1/2' : 'flex-1'} min-w-0 space-y-3`}>
          {/* Comment block */}
          {editing ? (
            <div className="space-y-2">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="이 문제에 대한 코멘트를 입력하세요."
                className="min-h-[72px] text-[14px] bg-white leading-[1.7] tracking-[-0.005em]"
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
                    setText(comment?.comment || '');
                    setEditing(false);
                  }}
                >
                  취소
                </Button>
              </div>
            </div>
          ) : hasContent ? (
            <div className="flex items-start justify-between gap-3">
              {comment?.comment ? (
                <p
                  className="text-[14px] leading-[1.7] whitespace-pre-wrap flex-1 tracking-[-0.005em] text-justify"
                  style={{
                    fontFamily:
                      "'Noto Sans KR', 'Noto Sans', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', system-ui, sans-serif",
                    wordBreak: 'break-word',
                    overflowWrap: 'anywhere',
                    textJustify: 'inter-character',
                    minWidth: 0,
                    color: 'hsl(0 0% 0%)',
                  }}
                >
                  {comment.comment}
                </p>
              ) : (
                <div className="flex-1" />
              )}
              <div
                data-comment-actions
                className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover/comment:opacity-100 transition-opacity print:hidden"
              >
                {actionsOpen && (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditing(true);
                        setActionsOpen(false);
                      }}
                      className="h-7 px-2 text-[hsl(var(--ink-soft))] hover:text-[hsl(var(--ink))]"
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1" />
                      {comment?.comment ? '수정' : '코멘트 추가'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        fileRef.current?.click();
                        setActionsOpen(false);
                      }}
                      disabled={uploading}
                      className="h-7 px-2 text-[hsl(var(--ink-soft))] hover:text-[hsl(var(--ink))]"
                    >
                      <Camera className="h-3.5 w-3.5 mr-1" />
                      {uploading ? '업로드…' : '사진'}
                    </Button>
                  </>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setActionsOpen((v) => !v)}
                  aria-expanded={actionsOpen}
                  aria-label={actionsOpen ? '메뉴 닫기' : '메뉴 열기'}
                  className={`h-7 w-7 p-0 rounded-full transition-colors ${
                    actionsOpen
                      ? 'bg-[hsl(var(--ink)/0.08)] text-[hsl(var(--ink))]'
                      : 'text-[hsl(var(--ink-soft))] hover:text-[hsl(var(--ink))]'
                  }`}
                >
                  {actionsOpen ? (
                    <X className="h-3.5 w-3.5" />
                  ) : (
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  )}
                </Button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFile}
                />
              </div>
            </div>
          ) : (
            // 코멘트/사진 모두 없음 → 항상 노출 (PDF/인쇄 시에는 숨김)
            <div
              data-comment-empty-actions
              className="flex justify-end print:hidden"
            >
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setEditing(true)}
                className="h-6 px-2 text-[11px] text-[hsl(var(--ink-soft))] hover:text-[hsl(var(--ink))]"
              >
                <Pencil className="h-3 w-3 mr-1" />
                코멘트 추가
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="h-6 px-2 text-[11px] text-[hsl(var(--ink-soft))] hover:text-[hsl(var(--ink))]"
              >
                <Camera className="h-3 w-3 mr-1" />
                {uploading ? '업로드…' : '사진'}
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFile}
              />
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {preview && (
        <div
          className="fixed inset-0 z-[10000] bg-black/80 flex items-center justify-center p-6"
          onClick={() => setPreview(null)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 text-white/90 hover:text-white"
            onClick={() => setPreview(null)}
            aria-label="닫기"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={preview}
            alt="첨부 사진 확대"
            className="max-h-full max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default ProblemCommentBox;