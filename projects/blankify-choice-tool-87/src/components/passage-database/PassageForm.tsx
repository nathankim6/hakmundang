import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Trash } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PassageEntry, PassageFormProps } from './hooks/types';

const PassageForm: React.FC<PassageFormProps> = ({
  content,
  setContent,
  translation,
  setTranslation,
  tags,
  setTags,
  category,
  setCategory,
  difficulty,
  setDifficulty,
  source,
  setSource,
  itemId,
  setItemId,
  isUpdateMode,
  clearInputFields,
  handleSubmit,
  isSubmitting = false,
  multipleEntries = [{
    item_id: '',
    content: '',
    translation: ''
  }],
  setMultipleEntries = () => {},
  handleBulkSubmit = () => Promise.resolve(false)
}) => {
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const clipboardData = e.clipboardData;
    const pastedData = clipboardData.getData('text');
    const rows = pastedData.split(/\r?\n/).filter(row => row.trim() !== '');
    if (rows.length > 0) {
      const newEntries: PassageEntry[] = [];
      rows.forEach(row => {
        const columns = row.split('\t');
        if (columns.length >= 1) {
          const entry: PassageEntry = {
            item_id: columns[0] || '',
            content: columns[1] || '',
            translation: columns[2] || '',
            tags: []
          };
          newEntries.push(entry);
        }
      });
      if (newEntries.length > 0) {
        setMultipleEntries(newEntries);
      }
    }
  };
  
  const handleEntryChange = (index: number, field: keyof PassageEntry, value: string) => {
    const updated = [...multipleEntries];
    if (field === 'tags') {
      updated[index][field] = value.split(',').map(tag => tag.trim()) as any;
    } else {
      updated[index][field] = value as any;
    }
    setMultipleEntries(updated);
  };
  
  const addNewEntry = () => {
    setMultipleEntries([...multipleEntries, {
      item_id: '',
      content: '',
      translation: '',
      tags: []
    }]);
  };
  
  const removeEntry = (index: number) => {
    if (multipleEntries.length > 1) {
      const updated = [...multipleEntries];
      updated.splice(index, 1);
      setMultipleEntries(updated);
    }
  };
  
  const onBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that we have at least one entry with content
    const validEntries = multipleEntries.filter(entry => entry.content.trim() !== '');
    if (validEntries.length === 0) {
      alert('지문 내용은 필수 입력 항목입니다. 최소 한 개의 지문 내용을 입력해주세요.');
      return;
    }
    
    await handleBulkSubmit(validEntries);
  };
  
  return <Card className="shadow-lg border-0">
      <CardHeader className="bg-secondary">
        <CardTitle className="text-lg font-bold">지문 {isUpdateMode ? '수정' : '추가'}</CardTitle>
        <CardDescription>지문 데이터베이스에 {isUpdateMode ? '수정' : '추가'}할 내용을 입력하세요.</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {!isUpdateMode ? <form onSubmit={onBulkSubmit} className="space-y-4">
            <div className="bg-muted p-3 rounded-md text-sm text-muted-foreground mb-4">
              <p>엑셀에서 <strong>식별번호, 내용, 해석</strong> 형태의 표를 복사하여 아래에 붙여넣으세요.</p>
              <p>(여러 행을 한 번에 붙여넣을 수 있습니다.)</p>
            </div>
            
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">식별번호</TableHead>
                    <TableHead>내용</TableHead>
                    <TableHead>해석</TableHead>
                    <TableHead className="w-[80px]">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {multipleEntries.map((entry, index) => <TableRow key={index}>
                      <TableCell>
                        <Input value={entry.item_id} onChange={e => handleEntryChange(index, 'item_id', e.target.value)} placeholder="식별번호" className="w-full" />
                      </TableCell>
                      <TableCell>
                        <Textarea value={entry.content} onChange={e => handleEntryChange(index, 'content', e.target.value)} placeholder="지문 내용" className="w-full h-20" onPaste={index === 0 ? handlePaste : undefined} required />
                      </TableCell>
                      <TableCell>
                        <Textarea value={entry.translation} onChange={e => handleEntryChange(index, 'translation', e.target.value)} placeholder="지문 해석" className="w-full h-20" />
                      </TableCell>
                      <TableCell>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeEntry(index)} disabled={multipleEntries.length <= 1}>
                          <Trash className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>)}
                </TableBody>
              </Table>
            </div>
            
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={addNewEntry} className="flex items-center">
                <Plus className="h-4 w-4 mr-1" /> 행 추가
              </Button>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              <Button type="submit" className="bg-primary" disabled={isSubmitting || multipleEntries.every(e => e.content.trim() === '')}>
                {isSubmitting ? <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    처리 중...
                  </> : '추가하기'}
              </Button>
              <Button type="button" variant="outline" onClick={() => {
            setMultipleEntries([{
              item_id: '',
              content: '',
              translation: '',
              tags: []
            }]);
          }} disabled={isSubmitting}>
                초기화
              </Button>
            </div>
          </form> : <form onSubmit={handleSubmit} className="grid gap-4">
            <div>
              <Label htmlFor="item_id">식별번호</Label>
              <Input type="text" id="item_id" placeholder="예: 2026년 수능특강 1강 1번" value={itemId} onChange={e => setItemId(e.target.value)} disabled={isSubmitting} />
              <p className="text-xs text-muted-foreground mt-1">원하는 형식으로 지문 식별자를 입력하세요. (예: 수능특강 1강 1번)</p>
            </div>
            <div>
              <Label htmlFor="content" className="flex items-center">
                내용 <span className="text-red-500 ml-1">*</span>
              </Label>
              <Textarea id="content" placeholder="지문 내용 입력 (필수)" value={content} onChange={e => setContent(e.target.value)} required className="min-h-[150px]" disabled={isSubmitting} />
            </div>
            <div>
              <Label htmlFor="translation">해석</Label>
              <Textarea id="translation" placeholder="지문 해석 입력" value={translation} onChange={e => setTranslation(e.target.value)} className="min-h-[150px]" disabled={isSubmitting} />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 mt-2">
              <Button type="submit" className="bg-primary" disabled={isSubmitting}>
                {isSubmitting ? <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    처리 중...
                  </> : isUpdateMode ? '지문 수정' : '추가하기'}
              </Button>
              {isUpdateMode && <Button type="button" variant="secondary" onClick={clearInputFields} disabled={isSubmitting}>
                  수정 취소
                </Button>}
              <Button type="button" variant="outline" onClick={() => {
            if (!isSubmitting) {
              clearInputFields();
            }
          }} disabled={isSubmitting}>
                폼 초기화
              </Button>
            </div>
          </form>}
      </CardContent>
    </Card>;
};

export default PassageForm;
