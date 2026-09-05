
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Trash2, Plus, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import PassageSelectionDialog from '@/components/shared/PassageSelectionDialog';
import { Passage as DbPassage } from '@/components/passage-database/hooks/types';

export type AnalysisPassage = {
  id: number;
  englishText: string;
  koreanText: string;
};

// Export the type so it can be imported by other components
export type Passage = AnalysisPassage;

interface PassageInputProps {
  passages: AnalysisPassage[];
  setPassages: (passages: AnalysisPassage[]) => void;
  analyzing: boolean;
  onAnalyze: () => void;
}

const PassageInput: React.FC<PassageInputProps> = ({
  passages,
  setPassages,
  analyzing,
  onAnalyze
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [passageDbDialogOpen, setPassageDbDialogOpen] = useState(false);
  
  useEffect(() => {
    // Check for step-specific passages first (current route is STEP1)
    const stepPassageString = sessionStorage.getItem('selectedPassage_step1');
    const selectedPassageString = sessionStorage.getItem('selectedPassage');
    
    if (stepPassageString) {
      try {
        const selectedPassage = JSON.parse(stepPassageString);
        const updatedPassages = [...passages];
        if (updatedPassages.length > 0) {
          if (!updatedPassages[0].englishText.trim()) {
            updatedPassages[0] = {
              ...updatedPassages[0],
              englishText: selectedPassage.content,
              koreanText: selectedPassage.translation || ''
            };
            setPassages(updatedPassages);
            toast({
              title: '지문 불러오기 성공',
              description: 'STEP1에 지정된 지문이 추가되었습니다.'
            });
          } else {
            const newId = Math.max(...passages.map(p => p.id)) + 1;
            setPassages([...passages, {
              id: newId,
              englishText: selectedPassage.content,
              koreanText: selectedPassage.translation || ''
            }]);
            toast({
              title: '지문 불러오기 성공',
              description: 'STEP1에 지정된 지문이 새로 추가되었습니다.'
            });
          }
        }
        sessionStorage.removeItem('selectedPassage_step1');
      } catch (error) {
        console.error('Error loading step passage:', error);
      }
    } else if (selectedPassageString) {
      // Fall back to the legacy method if no step-specific passage exists
      try {
        const selectedPassage = JSON.parse(selectedPassageString);
        const updatedPassages = [...passages];
        if (updatedPassages.length > 0) {
          if (!updatedPassages[0].englishText.trim()) {
            updatedPassages[0] = {
              ...updatedPassages[0],
              englishText: selectedPassage.content,
              koreanText: selectedPassage.translation || ''
            };
            setPassages(updatedPassages);
            toast({
              title: '지문 불러오기 성공',
              description: '데이터베이스에서 선택한 지문이 추가되었습니다.'
            });
          } else {
            const newId = Math.max(...passages.map(p => p.id)) + 1;
            setPassages([...passages, {
              id: newId,
              englishText: selectedPassage.content,
              koreanText: selectedPassage.translation || ''
            }]);
            toast({
              title: '지문 불러오기 성공',
              description: '데이터베이스에서 선택한 지문이 새로 추가되었습니다.'
            });
          }
        }
        sessionStorage.removeItem('selectedPassage');
      } catch (error) {
        console.error('Error loading selected passage:', error);
      }
    }
  }, []);
  
  const handleAddPassage = () => {
    const newId = passages.length > 0 ? Math.max(...passages.map(p => p.id)) + 1 : 1;
    setPassages([...passages, {
      id: newId,
      englishText: '',
      koreanText: ''
    }]);
  };

  // Fix the parameter type to match the database passage type
  const handlePassageSelect = (passage: DbPassage) => {
    const newId = passages.length > 0 ? Math.max(...passages.map(p => p.id)) + 1 : 1;
    setPassages([...passages, {
      id: newId,
      englishText: passage.content,
      koreanText: passage.translation || ''
    }]);
  };
  
  const handleRemovePassage = (id: number) => {
    if (passages.length <= 1) {
      toast({
        variant: "destructive",
        description: "최소 하나의 지문은 유지해야 합니다."
      });
      return;
    }
    const updatedPassages = passages.filter(p => p.id !== id);
    setPassages(updatedPassages);
  };
  
  const handlePassageChange = (id: number, field: 'englishText' | 'koreanText', value: string) => {
    setPassages(passages.map(p => p.id === id ? {
      ...p,
      [field]: value
    } : p));
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, id: number, field: 'englishText' | 'koreanText') => {
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      handleAddPassage();
    }
  };
  
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>, field: 'englishText' | 'koreanText') => {
    e.preventDefault();
    const clipboardData = e.clipboardData;
    const pastedText = clipboardData.getData('text');
    if (pastedText.includes('\t') || pastedText.includes('\n')) {
      const rows = pastedText.split(/\r?\n/).filter(row => row.trim() !== '');
      if (rows.length > 0) {
        const isTwoColumnData = rows.some(row => row.includes('\t'));
        if (isTwoColumnData) {
          const newPassages: AnalysisPassage[] = [];
          let nextId = Math.max(...passages.map(p => p.id)) + 1;
          rows.forEach(row => {
            const columns = row.split('\t');
            if (columns.length >= 2) {
              newPassages.push({
                id: nextId++,
                englishText: columns[0]?.trim() || '',
                koreanText: columns[1]?.trim() || ''
              });
            }
          });
          if (newPassages.length > 0) {
            if (passages.length === 1 && !passages[0].englishText && !passages[0].koreanText) {
              setPassages(newPassages);
            } else {
              setPassages([...passages, ...newPassages]);
            }
            toast({
              description: `${newPassages.length}개의 지문이 생성되었습니다.`
            });
            return;
          }
        } else {
          const currentField = field;
          const currentId = passages[passages.length - 1].id;
          handlePassageChange(currentId, currentField, pastedText);
          return;
        }
      }
    }
    const textArea = e.currentTarget as HTMLTextAreaElement;
    const cursorPos = textArea.selectionStart;
    const textBefore = textArea.value.substring(0, cursorPos);
    const textAfter = textArea.value.substring(textArea.selectionEnd);
    const currentId = Number(textArea.getAttribute('data-id'));
    const currentField = field;
    const newText = textBefore + pastedText + textAfter;
    handlePassageChange(currentId, currentField, newText);
  };

  return <div>
      <div className="space-y-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-slate-800">지문 입력</h2>
          <Button variant="outline" className="flex items-center gap-2" onClick={() => setPassageDbDialogOpen(true)}>
            <Database className="h-4 w-4" />
            지문 데이터베이스에서 선택
          </Button>
          
          <PassageSelectionDialog 
            open={passageDbDialogOpen} 
            onOpenChange={setPassageDbDialogOpen} 
            onPassageSelect={handlePassageSelect} 
            enableMultiSelect={true} 
            title="지문 데이터베이스" 
          />
        </div>

        {passages.map((passage, index) => <div key={passage.id} className="border border-slate-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow duration-200 my-[17px] px-[14px] mx-0 py-[24px]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <span className="flex items-center justify-center w-7 h-7 bg-slate-800 text-white rounded-full text-sm">
                  {index + 1}
                </span>
                <span>지문 {index + 1}</span>
              </h2>
              {passages.length > 1 && <Button variant="ghost" size="sm" onClick={() => handleRemovePassage(passage.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                  <Trash2 className="h-4 w-4 mr-1" />
                  삭제
                </Button>}
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">영어 지문</label>
                <Textarea placeholder={`분석할 영어 지문 ${index + 1}을 입력하세요.`} className="h-30 text-base" value={passage.englishText} onChange={e => handlePassageChange(passage.id, 'englishText', e.target.value)} onKeyDown={e => handleKeyDown(e, passage.id, 'englishText')} onPaste={e => handlePaste(e, 'englishText')} data-id={passage.id} />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">한글 번역</label>
                <Textarea placeholder={`한글 번역 ${index + 1}을 입력하세요.`} className="h-30 text-base" value={passage.koreanText} onChange={e => handlePassageChange(passage.id, 'koreanText', e.target.value)} onKeyDown={e => handleKeyDown(e, passage.id, 'koreanText')} onPaste={e => handlePaste(e, 'koreanText')} data-id={passage.id} />
              </div>
            </div>
          </div>)}
      </div>

      <div className="flex justify-center gap-4 mb-8">
        <Button onClick={handleAddPassage} variant="outline" className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          새 지문 추가
        </Button>
        
        <Button 
          onClick={onAnalyze} 
          disabled={analyzing || passages.some(p => !p.englishText || !p.koreanText)} 
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {analyzing ? <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              분석 중...
            </> : `지문 분석하기 (${passages.length}개)`}
        </Button>
      </div>
    </div>;
};

export default PassageInput;
