import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { QRDataType } from '@/types/test';
import { calculateConsistentScore } from '@/utils/testUtils/scoreCalculation';
import { isSubjectiveAnswerCorrect } from '@/utils/testUtils/answerValidation';
import { saveTestResult } from '@/utils/testStorage/saveTests';

interface Props {
  testData: QRDataType;
}

const questionNumbers = (testData: QRDataType) => {
  const keys = Object.keys(testData.answers || {})
    .map(Number)
    .filter(n => !Number.isNaN(n))
    .sort((a, b) => a - b);
  if (keys.length) return keys;
  return Array.from({ length: testData.questionCount || 0 }, (_, i) => i + 1);
};

const parseCell = (raw: any, type?: string): number[] | string => {
  const v = String(raw ?? '').trim();
  if (type === 'subjective') return v;
  if (!v) return [];
  return v
    .split(/[,\s·]+/)
    .map(s => parseInt(s, 10))
    .filter(n => !Number.isNaN(n));
};

const BulkResultUpload: React.FC<Props> = ({ testData }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const nums = questionNumbers(testData);

  const downloadTemplate = async () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('결과입력');
    ws.addRow(['학생이름', ...nums.map(n => String(n))]);
    ws.getRow(1).font = { bold: true };
    ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
    ws.getColumn(1).width = 18;
    nums.forEach((_, i) => { ws.getColumn(i + 2).width = 10; });

    // 유형 안내 행 (2행) - 삭제하고 사용하세요
    ws.addRow(['(유형)', ...nums.map(n => (testData.answers?.[n]?.type === 'subjective' ? '주관식' : '객관식'))]);
    ws.getRow(2).font = { italic: true, color: { argb: 'FF64748B' } };

    ws.addRow(['홍길동', ...nums.map(n => (testData.answers?.[n]?.type === 'subjective' ? 'answer' : '1'))]);
    ws.views = [{ state: 'frozen', xSplit: 1, ySplit: 1 }];

    const note = wb.addWorksheet('작성방법');
    [
      ['작성 방법'],
      ['1. "결과입력" 시트 1행은 문항 번호입니다. 수정하지 마세요.'],
      ['2. 2행 "(유형)" 안내 행과 예시 행(홍길동)은 삭제 후 사용하세요.'],
      ['3. 객관식: 선택 번호를 입력 (복수정답은 쉼표로 구분, 예: 1,3)'],
      ['4. 주관식: 학생이 쓴 답을 그대로 입력'],
      ['5. 미응답은 빈칸으로 두세요.'],
    ].forEach(r => note.addRow(r));
    note.getColumn(1).width = 70;

    const buf = await wb.xlsx.writeBuffer();
    const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${testData.title || testData.testId}_결과입력양식.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleUpload = async (file: File) => {
    setBusy(true);
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array' });
      const ws = wb.Sheets['결과입력'] || wb.Sheets[wb.SheetNames[0]];
      const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
      if (rows.length < 2) throw new Error('데이터가 없습니다.');

      const header = rows[0].map((h: any) => String(h).trim());
      const colOf = new Map<number, number>();
      header.forEach((h, idx) => {
        const n = parseInt(h, 10);
        if (!Number.isNaN(n) && nums.includes(n)) colOf.set(n, idx);
      });
      if (colOf.size === 0) throw new Error('문항 번호 열을 찾을 수 없습니다. 양식을 사용해주세요.');

      let saved = 0;
      let skipped = 0;

      for (let r = 1; r < rows.length; r++) {
        const row = rows[r];
        const name = String(row[0] ?? '').trim();
        if (!name || name === '(유형)') { continue; }

        const studentAnswers: Record<number, any> = {};
        let hasAny = false;
        nums.forEach(n => {
          const ci = colOf.get(n);
          if (ci === undefined) return;
          const type = testData.answers?.[n]?.type;
          const parsed = parseCell(row[ci], type);
          const empty = Array.isArray(parsed) ? parsed.length === 0 : parsed === '';
          if (!empty) hasAny = true;
          studentAnswers[n] = { answer: parsed, type };
        });

        if (!hasAny) { skipped++; continue; }

        let correctCount = 0;
        nums.forEach(n => {
          const correct = testData.answers?.[n]?.answer;
          const type = testData.answers?.[n]?.type;
          const student = studentAnswers[n]?.answer;
          if (type === 'subjective') {
            if (isSubjectiveAnswerCorrect(String(student ?? ''), String(correct ?? ''))) correctCount++;
          } else {
            const c = (Array.isArray(correct) ? correct : [correct]).map(Number).sort((a, b) => a - b);
            const s = (Array.isArray(student) ? student : [student]).map(Number).sort((a, b) => a - b);
            if (c.length === s.length && c.every((v, i) => v === s[i])) correctCount++;
          }
        });

        const score = calculateConsistentScore(studentAnswers, testData.answers as any, testData.testFormat);
        const ok = await saveTestResult(
          testData.testId,
          studentAnswers,
          Math.round(score),
          correctCount,
          nums.length,
          name
        );
        if (ok) saved++;
      }

      toast({
        title: '일괄 등록 완료',
        description: `${saved}명 등록됨${skipped ? ` · 빈 행 ${skipped}개 건너뜀` : ''}`,
      });
    } catch (e: any) {
      console.error('[BulkResultUpload] failed', e);
      toast({ title: '업로드 실패', description: e?.message || String(e), variant: 'destructive' });
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-2.5 text-xs text-muted-foreground hover:text-emerald-600 hover:bg-emerald-500/10"
        onClick={downloadTemplate}
        title="결과 입력 엑셀 양식 다운로드"
      >
        <FileSpreadsheet className="h-3.5 w-3.5 mr-1" />
        <span className="hidden sm:inline">양식</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-2.5 text-xs text-muted-foreground hover:text-blue-600 hover:bg-blue-500/10"
        onClick={() => fileRef.current?.click()}
        disabled={busy}
        title="엑셀로 결과 일괄 등록"
      >
        <Upload className="h-3.5 w-3.5 mr-1" />
        <span className="hidden sm:inline">{busy ? '등록 중…' : '일괄등록'}</span>
      </Button>
      <input
        ref={fileRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleUpload(f);
        }}
      />
    </>
  );
};

export default BulkResultUpload;