import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileSpreadsheet, Upload, ShieldCheck, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { QRDataType } from '@/types/test';
import { downloadResultTemplate, uploadResultsFromFile } from '@/utils/bulkResultExcel';

interface Props {
  tests: QRDataType[];
}

const BulkResultDialog: React.FC<Props> = ({ tests }) => {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [selectedId, setSelectedId] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const selectedTest = tests.find(t => t.testId === selectedId);

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-access-code', { body: { code } });
      if (error) throw error;
      if (data?.valid && data?.isAdmin) {
        sessionStorage.setItem('verifiedAccessCode', code);
        setVerified(true);
      } else {
        toast({ title: '인증 실패', description: '관리자 액세스 코드를 확인해주세요.', variant: 'destructive' });
      }
    } catch (err: any) {
      toast({ title: '오류', description: err?.message || '인증 중 오류가 발생했습니다.', variant: 'destructive' });
    } finally {
      setVerifying(false);
    }
  };

  const handleFile = async (file: File) => {
    if (!selectedTest) return;
    setBusy(true);
    try {
      const { saved, skipped } = await uploadResultsFromFile(selectedTest, file);
      toast({ title: '일괄 등록 완료', description: `${saved}명 등록됨${skipped ? ` · 빈 행 ${skipped}개 건너뜀` : ''}` });
      setOpen(false);
    } catch (e: any) {
      toast({ title: '업로드 실패', description: e?.message || String(e), variant: 'destructive' });
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="shadow-sm border-emerald-200 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50 whitespace-nowrap"
        >
          <FileSpreadsheet className="h-4 w-4" />
          <span className="ml-2">엑셀 결과 입력</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] w-[460px]">
        <DialogHeader>
          <DialogTitle>엑셀로 시험 결과 등록</DialogTitle>
          <DialogDescription>
            {verified ? '시험을 선택한 뒤 양식을 받아 작성하고 업로드하세요.' : '관리자 액세스 코드로 인증이 필요합니다.'}
          </DialogDescription>
        </DialogHeader>

        {!verified ? (
          <form onSubmit={verify} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bulk-access-code">액세스 코드</Label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="bulk-access-code"
                  type="password"
                  autoFocus
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="관리자 코드를 입력하세요"
                  className="pl-9"
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={verifying || !code}>
              {verifying ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />확인 중...</>) : '확인'}
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>시험 선택</Label>
              <Select value={selectedId} onValueChange={setSelectedId}>
                <SelectTrigger>
                  <SelectValue placeholder="시험을 선택하세요" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {tests.map(t => (
                    <SelectItem key={t.testId} value={t.testId}>
                      {t.title || t.testId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                disabled={!selectedTest}
                onClick={() => selectedTest && downloadResultTemplate(selectedTest)}
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                양식 다운로드
              </Button>
              <Button
                className="flex-1"
                disabled={!selectedTest || busy}
                onClick={() => fileRef.current?.click()}
              >
                {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                {busy ? '등록 중…' : '엑셀 업로드'}
              </Button>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BulkResultDialog;
