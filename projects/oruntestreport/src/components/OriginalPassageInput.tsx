import React, { useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import { parse as parseHwp } from 'hwp.js';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ChevronDown, ClipboardPaste, FileSpreadsheet, FileText, FileUp, Loader2, Trash2, UploadCloud } from 'lucide-react';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

interface OriginalPassageInputProps {
  value: string;
  onChange: (value: string) => void;
}

const ACCEPT =
  '.pdf,.xlsx,.xls,.csv,.doc,.docx,.hwp,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,application/x-hwp';

const getExt = (name: string) => name.split('.').pop()?.toLowerCase() ?? '';

/** PDF에서 텍스트 추출 (워커 실패 시 워커 없이 재시도) */
const readPdfText = async (data: Uint8Array, disableWorker = false): Promise<string> => {
  const pdf = await pdfjsLib.getDocument({
    data,
    isEvalSupported: false,
    useSystemFonts: true,
    ...(disableWorker ? { worker: null as never, disableWorker: true } : {}),
  } as Parameters<typeof pdfjsLib.getDocument>[0]).promise;
  const chunks: string[] = [];
  for (let i = 1; i <= pdf.numPages; i += 1) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    chunks.push(
      (content.items as { str?: string }[])
        .map((item) => item.str ?? '')
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim(),
    );
  }
  await pdf.destroy();
  return chunks.filter(Boolean).join('\n\n');
};

const extractPdf = async (buffer: ArrayBuffer): Promise<string> => {
  try {
    return await readPdfText(new Uint8Array(buffer.slice(0)));
  } catch (err) {
    console.warn('PDF 워커 추출 실패, 워커 없이 재시도합니다:', err);
    return await readPdfText(new Uint8Array(buffer.slice(0)), true);
  }
};


/** 엑셀/CSV에서 텍스트 추출 */
const extractExcel = async (buffer: ArrayBuffer): Promise<string> => {
  const wb = XLSX.read(buffer, { type: 'array' });
  const parts: string[] = [];
  wb.SheetNames.forEach((name) => {
    const rows: string[][] = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, raw: false });
    rows.forEach((row) => {
      const line = row.map((cell) => String(cell ?? '').trim()).filter(Boolean).join(' ');
      if (line) parts.push(line);
    });
  });
  return parts.join('\n');
};

/** DOCX에서 텍스트 추출 */
const extractDocx = async (buffer: ArrayBuffer): Promise<string> => {
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  return result.value.replace(/\n{3,}/g, '\n\n').trim();
};

/** HWP(아래아한글)에서 텍스트 추출 */
const extractHwp = (buffer: ArrayBuffer): string => {
  const doc = parseHwp(new Uint8Array(buffer));
  const lines: string[] = [];
  doc.sections.forEach((section) => {
    section.content.forEach((paragraph) => {
      let line = '';
      paragraph.content.forEach((ch) => {
        if (ch.type === 0 && typeof ch.value === 'number') {
          line += String.fromCharCode(ch.value);
        }
      });
      line = line.replace(/\r/g, '').trim();
      if (line) lines.push(line);
    });
  });
  return lines.join('\n');
};

/** 시험 범위 원문을 파일 첨부 또는 직접 붙여넣기로 입력받는 필드 */
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_FILE_COUNT = 10;

const OriginalPassageInput: React.FC<OriginalPassageInputProps> = ({ value, onChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [extracting, setExtracting] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFiles = async (files: File[]) => {
    if (!files.length) return;
    if (files.length > MAX_FILE_COUNT) {
      toast.error(`한 번에 최대 ${MAX_FILE_COUNT}개까지 첨부할 수 있습니다.`);
      return;
    }
    let latest = value;
    for (const file of files) {
      const ext = getExt(file.name);
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name}: 100MB를 초과해 업로드할 수 없습니다.`);
        continue;
      }
      setExtracting(file.name);
      try {
        const buffer = await file.arrayBuffer();
        let text = '';
        if (ext === 'pdf') {
          text = await extractPdf(buffer);
        } else if (['xlsx', 'xls', 'csv'].includes(ext)) {
          text = await extractExcel(buffer);
        } else if (ext === 'docx') {
          text = await extractDocx(buffer);
        } else if (ext === 'hwp') {
          text = extractHwp(buffer);
        } else if (ext === 'doc') {
          toast.error('구형 .doc 파일은 지원하지 않습니다. .docx로 저장 후 다시 올려주세요.');
          continue;
        } else {
          toast.error('PDF, 엑셀, DOCX, HWP 파일만 업로드할 수 있습니다.');
          continue;
        }

        if (!text.trim()) {
          toast.error(
            ext === 'pdf'
              ? `${file.name}에 텍스트 레이어가 없습니다(스캔·이미지 PDF). 원문을 직접 붙여넣어 주세요.`
              : `${file.name}에서 텍스트를 추출할 수 없습니다. 원문을 직접 붙여넣어 주세요.`,
            { duration: 6000 },
          );
          continue;
        }
        latest = latest.trim() ? `${latest.trim()}\n\n${text.trim()}` : text.trim();
        onChange(latest);
        toast.success(`${file.name}에서 원문 ${text.trim().length.toLocaleString()}자를 불러왔습니다.`);
      } catch (err) {
        console.error('원문 파일 추출 실패:', err);
        const detail = err instanceof Error ? err.message : String(err);
        toast.error(`${file.name} 추출 실패: ${detail}`, { duration: 7000 });
      }

    }
    setExtracting(null);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/50 overflow-hidden">
      {/* Collapsible header */}
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-white/60"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3182F6]/10 text-[#3182F6]">
            <FileText className="w-4.5 h-4.5" />
          </div>
          <div>
            <Label className="text-[13.5px] font-bold text-slate-800 cursor-pointer">시험 범위 원문 (선택사항)</Label>
            <p className="text-[11.5px] text-slate-500 break-keep">
              원문을 넣으면 다음 단계에서 <strong>원문 대조 · 지문 변형 분석</strong> 항목이 함께 생성됩니다.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] text-[hsl(var(--ink-soft))] tabular-nums">
            {value.trim() ? `${value.trim().length.toLocaleString()}자` : '미입력'}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-slate-200 p-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[12px] font-medium text-slate-600">파일 첨부 또는 텍스트 붙여넣기로 원문을 입력하세요.</span>
            {value.trim() && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="rounded-full text-[12px] text-red-500 hover:text-red-600 h-7 px-2.5"
                onClick={() => onChange('')}
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                비우기
              </Button>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* ① 파일 첨부 영역 */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => inputRef.current?.click()}
              onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const files = Array.from(e.dataTransfer.files ?? []);
                if (files.length) handleFiles(files);
              }}
              className={`group relative flex min-h-[180px] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-5 text-center transition-all ${
                dragOver
                  ? 'border-[#3182F6] bg-[#3182F6]/10 scale-[1.01]'
                  : 'border-slate-300 bg-white/60 hover:border-[#3182F6]/60 hover:bg-white/80'
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPT}
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []);
                  if (files.length) handleFiles(files);
                  e.target.value = '';
                }}
              />
              {extracting ? (
                <>
                  <Loader2 className="w-8 h-8 text-[#3182F6] animate-spin" />
                  <p className="text-[13px] font-semibold text-slate-700 break-all">
                    {extracting} 읽는 중…
                  </p>
                </>
              ) : (
                <>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#3182F6]/10 text-[#3182F6] transition-transform group-hover:scale-110">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[13.5px] font-bold text-slate-800">파일로 첨부하기</p>
                    <p className="mt-1 text-[11.5px] text-slate-500 break-keep">
                      클릭하거나 파일을 여기에 끌어놓으세요
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-1.5">
                    {[
                      { label: 'PDF', icon: FileText },
                      { label: 'Excel', icon: FileSpreadsheet },
                      { label: 'DOCX', icon: FileText },
                      { label: 'HWP', icon: FileUp },
                    ].map(({ label, icon: Icon }) => (
                      <span
                        key={label}
                        className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10.5px] font-semibold text-slate-600"
                      >
                        <Icon className="w-3 h-3" />
                        {label}
                      </span>
                    ))}
                  </div>
                  <p className="text-[11.5px] font-medium text-slate-500">
                    최대 10개 · 파일당 100MB
                  </p>
                </>
              )}
            </div>

            {/* ② 텍스트 붙여넣기 영역 */}
            <div className="flex flex-col rounded-2xl border border-slate-200 bg-white/60 p-4">
              <div className="mb-2 flex items-center gap-1.5 text-[13px] font-bold text-slate-800">
                <ClipboardPaste className="w-4 h-4 text-[#3182F6]" />
                텍스트로 붙여넣기
              </div>
              <Textarea
                id="originalPassages"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="교과서·부교재 원문을 그대로 붙여넣으세요. AI가 실제 출제 문장과 대조해 어떤 부분이 어떻게 변형되었는지 분석합니다."
                className="min-h-[140px] flex-1 bg-white text-black leading-6 resize-y"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OriginalPassageInput;
