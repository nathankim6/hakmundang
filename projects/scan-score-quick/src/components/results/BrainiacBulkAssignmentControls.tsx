import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { Button } from '@/components/ui/button';
import { Download, Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SESSIONS, getSessionOptions } from './BrainiacSpecialClassSection';

interface ResultLite {
  id: string;
  student_name: string;
  special_class_assignments?: (string | null)[] | null;
}

interface Props {
  results: ResultLite[];
}

const HEADERS = ['학생이름', ...SESSIONS];

const normalize = (s: string) => (s || '').replace(/\s+/g, '').trim();

const numToCol = (n: number): string => {
  let s = '';
  while (n > 0) {
    const r = (n - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
};

const BrainiacBulkAssignmentControls: React.FC<Props> = ({ results }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const downloadTemplate = async () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('배정');
    const wsOpts = wb.addWorksheet('옵션목록');

    // Options sheet: each column is one session, holding its valid options.
    // Using named ranges so dropdowns reference real ranges (handles commas/quotes).
    const optionColLetters: string[] = [];
    SESSIONS.forEach((s, i) => {
      const colIdx = i + 1;
      const letter = numToCol(colIdx);
      optionColLetters.push(letter);
      wsOpts.getCell(`${letter}1`).value = s;
      wsOpts.getCell(`${letter}1`).font = { bold: true };
      const opts = getSessionOptions(i);
      opts.forEach((o, j) => {
        wsOpts.getCell(`${letter}${j + 2}`).value = o;
      });
      wsOpts.getColumn(colIdx).width = 28;
      // Defined name for this session's options
      const lastRow = opts.length + 1;
      wb.definedNames.add(`옵션목록!$${letter}$2:$${letter}$${lastRow}`, `OPT_${i + 1}`);
    });

    // Main sheet header
    ws.addRow(HEADERS);
    ws.getRow(1).font = { bold: true };
    ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
    ws.getColumn(1).width = 16;
    SESSIONS.forEach((_, i) => { ws.getColumn(i + 2).width = 28; });

    // Rows
    results.forEach(r => {
      const assigns = Array.isArray(r.special_class_assignments) ? r.special_class_assignments : [];
      ws.addRow([r.student_name, ...SESSIONS.map((_, i) => assigns[i] ?? '')]);
    });

    // Data validations per session column
    const lastRow = Math.max(results.length + 1, 200);
    SESSIONS.forEach((_, i) => {
      const letter = numToCol(i + 2);
      for (let row = 2; row <= lastRow; row++) {
        ws.getCell(`${letter}${row}`).dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: [`=OPT_${i + 1}`],
          showErrorMessage: true,
          errorStyle: 'warning',
          errorTitle: '옵션 외 값',
          error: '드롭다운에서 선택해 주세요.',
        };
      }
    });

    ws.views = [{ state: 'frozen', xSplit: 1, ySplit: 1 }];

    const buf = await wb.xlsx.writeBuffer();
    const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '프렙방학특강_수업배정.xlsx';
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
      const ws = wb.Sheets['배정'] || wb.Sheets[wb.SheetNames[0]];
      const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
      if (!rows.length) throw new Error('빈 파일입니다.');

      const header = rows[0].map(String);
      const nameIdx = header.findIndex(h => normalize(h) === '학생이름');
      if (nameIdx === -1) throw new Error('첫 번째 행에 "학생이름" 컬럼이 있어야 합니다.');

      const sessionColIdx = SESSIONS.map(s => header.findIndex(h => normalize(h) === normalize(s)));

      const nameMap = new Map<string, ResultLite>();
      results.forEach(r => nameMap.set(normalize(r.student_name), r));

      let updated = 0;
      let notFound: string[] = [];
      let invalid: string[] = [];

      for (let r = 1; r < rows.length; r++) {
        const row = rows[r];
        const name = String(row[nameIdx] ?? '').trim();
        if (!name) continue;
        const target = nameMap.get(normalize(name));
        if (!target) { notFound.push(name); continue; }

        const assigns: (string | null)[] = SESSIONS.map((_, i) => {
          const ci = sessionColIdx[i];
          if (ci < 0) return null;
          const v = String(row[ci] ?? '').trim();
          if (!v) return '';
          const opts = getSessionOptions(i);
          const match = opts.find(o => normalize(o) === normalize(v));
          if (!match) { invalid.push(`${name} - ${SESSIONS[i]}: "${v}"`); return ''; }
          return match;
        });

        const { error } = await supabase
          .from('level_test_results')
          .update({ special_class_assignments: assigns } as any)
          .eq('id', target.id);
        if (error) throw error;
        updated++;
      }

      const parts = [`${updated}명 저장됨`];
      if (notFound.length) parts.push(`미일치: ${notFound.length}명`);
      if (invalid.length) parts.push(`옵션불일치: ${invalid.length}건`);
      toast({ title: '일괄 배정 완료', description: parts.join(' · ') });

      if (updated > 0) setTimeout(() => window.location.reload(), 800);
    } catch (e: any) {
      console.error('[BulkAssign] failed', e);
      toast({ title: '업로드 실패', description: e?.message || String(e), variant: 'destructive' });
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-sm"
        onClick={downloadTemplate}
      >
        <Download className="mr-2 h-4 w-4" />특강 양식 다운로드
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="bg-white hover:bg-slate-50 border-violet-200 text-violet-700 shadow-sm"
        onClick={() => fileRef.current?.click()}
        disabled={busy}
      >
        <Upload className="mr-2 h-4 w-4" />{busy ? '업로드 중…' : '특강 일괄 업로드'}
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
    </div>
  );
};

export default BrainiacBulkAssignmentControls;