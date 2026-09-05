import React from 'react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { FileSpreadsheet, Download, Upload, Loader2 } from 'lucide-react';
import { QRDataType } from '@/types/test';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { calculateConsistentScore } from '@/utils/testUtils/scoreCalculation';
import { isSubjectiveAnswerCorrect } from '@/utils/testUtils/answerValidation';

interface BulkResultUploadProps {
  tests: QRDataType[];
  onUploaded?: () => void;
  size?: 'sm' | 'default';
}

const NAME_KEYS = ['학생이름', '이름', 'name', '학생명', 'student_name'];
const CLASS_KEYS = ['소속반', '반', '소속', 'class'];

const normalizeKey = (key: string) => String(key).replace(/\s|\u00A0/g, '').toLowerCase();

const parseStudentAnswer = (raw: any, type: string) => {
  if (raw === undefined || raw === null || String(raw).trim() === '') return null;
  const value = String(raw).trim();
  if (type === 'subjective') return value;
  const nums = value
    .split(/[,\s/·]+/)
    .map(v => parseInt(v.replace(/[^0-9]/g, ''), 10))
    .filter(n => !Number.isNaN(n));
  if (nums.length === 0) return null;
  return nums;
};

const isCorrect = (studentAnswer: any, correct: any) => {
  if (studentAnswer === null || studentAnswer === undefined) return false;
  if (correct?.type === 'subjective') {
    return isSubjectiveAnswerCorrect(String(studentAnswer), String(correct.answer));
  }
  const correctArr = (Array.isArray(correct?.answer) ? correct.answer : [correct?.answer]).map(Number).sort((a, b) => a - b);
  const studentArr = (Array.isArray(studentAnswer) ? studentAnswer : [studentAnswer]).map(Number).sort((a, b) => a - b);
  return correctArr.length === studentArr.length && correctArr.every((v, i) => v === studentArr[i]);
};

const BulkResultUpload = ({ tests, onUploaded, size = 'default' }: BulkResultUploadProps) => {
  const [open, setOpen] = React.useState(false);
  const [selectedTestId, setSelectedTestId] = React.useState<string>('');
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const uploadableTests = tests.filter(t => !t.writingQuestions || t.writingQuestions.length === 0);
  const selectedTest = uploadableTests.find(t => t.testId === selectedTestId) || null;

  const openDialog = () => {
    if (uploadableTests.length === 0) {
      toast({
        title: '등록 가능한 시험이 없습니다',
        description: '먼저 객관식/주관식 시험을 생성해주세요.',
        variant: 'destructive',
      });
      return;
    }
    if (!selectedTestId) setSelectedTestId(uploadableTests[0].testId);
    setOpen(true);
  };

  const handleDownloadSample = () => {
    const test = selectedTest;
    if (!test) return;

    const questionNumbers = Object.keys(test.answers)
      .map(Number)
      .filter(n => !Number.isNaN(n))
      .sort((a, b) => a - b);

    const header = ['학생이름', '소속반', ...questionNumbers.map(n => String(n))];
    const answerTypeRow = [
      '(정답유형 참고행 - 업로드 시 삭제)',
      '',
      ...questionNumbers.map(n => (test.answers[n]?.type === 'subjective' ? '주관식' : '객관식')),
    ];
    const exampleRow = [
      '김토르',
      'A반',
      ...questionNumbers.map(n => (test.answers[n]?.type === 'subjective' ? 'answer' : '1')),
    ];

    const ws = XLSX.utils.aoa_to_sheet([header, answerTypeRow, exampleRow]);
    ws['!cols'] = header.map((_, i) => ({ wch: i === 0 ? 16 : i === 1 ? 14 : 6 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '결과입력');
    XLSX.writeFile(wb, `${test.title}_결과등록양식.xlsx`);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    const test = selectedTest;
    if (!file || !test) return;

    setIsUploading(true);
    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: '' });

      const questionNumbers = Object.keys(test.answers)
        .map(Number)
        .filter(n => !Number.isNaN(n))
        .sort((a, b) => a - b);

      const payload: any[] = [];
      let skipped = 0;

      for (const row of rows) {
        const map: Record<string, any> = {};
        Object.entries(row).forEach(([k, v]) => { map[normalizeKey(k)] = v; });

        const nameRaw = NAME_KEYS.map(k => map[normalizeKey(k)]).find(v => v !== undefined && String(v).trim() !== '');
        const name = nameRaw ? String(nameRaw).trim() : '';
        if (!name || name.startsWith('(')) { skipped++; continue; }

        const classRaw = CLASS_KEYS.map(k => map[normalizeKey(k)]).find(v => v !== undefined && String(v).trim() !== '');
        const className = classRaw ? String(classRaw).trim() : '';

        const studentAnswers: Record<number, any> = {};
        let correctCount = 0;
        let answered = 0;

        questionNumbers.forEach(n => {
          const cell = map[normalizeKey(String(n))];
          const parsed = parseStudentAnswer(cell, test.answers[n]?.type);
          if (parsed === null) return;
          answered++;
          studentAnswers[n] = { answer: parsed };
          if (isCorrect(parsed, test.answers[n])) correctCount++;
        });

        if (answered === 0) { skipped++; continue; }

        const score = calculateConsistentScore(studentAnswers, test.answers as any, test.testFormat);

        payload.push({
          test_id: test.testId,
          student_name: className ? `${className} ${name}` : name,
          student_answers: studentAnswers as any,
          score,
          correct_count: correctCount,
          total_count: questionNumbers.length,
        });
      }

      if (payload.length === 0) {
        toast({
          title: '등록할 데이터가 없습니다',
          description: '샘플 양식을 확인하고 학생 이름과 답안을 입력해주세요.',
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase.from('test_results').insert(payload);
      if (error) throw error;

      toast({
        title: '일괄 등록 완료',
        description: `${payload.length}명의 결과가 등록되었습니다.${skipped > 0 ? ` (${skipped}행 건너뜀)` : ''}`,
      });
      setOpen(false);
      onUploaded?.();
    } catch (err) {
      console.error('Bulk result upload failed:', err);
      toast({
        title: '일괄 등록 실패',
        description: '엑셀 파일을 확인하고 다시 시도해주세요.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size={size}
            className="shadow-sm border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all whitespace-nowrap"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span className="ml-2">결과 일괄 등록</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-52 bg-popover">
          <DropdownMenuItem onSelect={() => setTimeout(openDialog, 0)}>
            <Upload className="h-4 w-4 mr-2" />
            엑셀로 결과 등록
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setTimeout(openDialog, 0)}>
            <Download className="h-4 w-4 mr-2" />
            샘플 양식 다운로드
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>시험 결과 일괄 등록</DialogTitle>
            <DialogDescription>
              시험을 선택하고 샘플 양식을 내려받아 학생 답안을 채운 뒤 업로드하세요. 점수는 자동으로 채점됩니다.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">시험 선택</Label>
              <Select value={selectedTestId} onValueChange={setSelectedTestId}>
                <SelectTrigger>
                  <SelectValue placeholder="시험을 선택하세요" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {uploadableTests.map(t => (
                    <SelectItem key={t.testId} value={t.testId}>
                      {t.title} ({t.questionCount}문항)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" className="flex-1" onClick={handleDownloadSample} disabled={!selectedTest}>
                <Download className="h-4 w-4 mr-2" />
                샘플 양식 다운로드
              </Button>
              <Button
                className="flex-1"
                onClick={() => fileInputRef.current?.click()}
                disabled={!selectedTest || isUploading}
              >
                {isUploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                엑셀 업로드
              </Button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              · 첫 행은 머리글(학생이름, 소속반, 문항번호)입니다.<br />
              · 객관식은 번호(복수정답은 1,3 처럼 쉼표), 주관식은 답 텍스트를 입력하세요.<br />
              · 빈 칸은 미응답으로 처리됩니다.
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleFile}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BulkResultUpload;
