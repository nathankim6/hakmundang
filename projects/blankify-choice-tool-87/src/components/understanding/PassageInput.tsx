
import React, { useState, KeyboardEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus, Trash2, Database, Circle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PassageSelectionDialog from '@/components/shared/PassageSelectionDialog';
import { Passage } from '@/components/passage-database/hooks/types';

interface PassageInputProps {
  passages: { id: number; content: string }[];
  setPassages: (passages: { id: number; content: string }[]) => void;
  onGenerateUnderstanding: () => void;
  isLoading: boolean;
}

interface PassageWithStep extends Passage {
  stepNumber?: number;
}

const PassageInput: React.FC<PassageInputProps> = ({
  passages,
  setPassages,
  onGenerateUnderstanding,
  isLoading
}) => {
  const { toast } = useToast();
  const [passageDbDialogOpen, setPassageDbDialogOpen] = useState(false);

  useEffect(() => {
    const selectedPassageString = sessionStorage.getItem('selectedPassage');
    const selectedPassagesString = sessionStorage.getItem('selectedPassages');
    
    if (selectedPassagesString) {
      try {
        const selectedPassages = JSON.parse(selectedPassagesString) as PassageWithStep[];
        
        if (selectedPassages && selectedPassages.length > 0) {
          const newPassages = selectedPassages.map((passage, index) => {
            return {
              id: index + 1,
              content: passage.content
            };
          });
          
          if (passages.length === 1 && !passages[0].content.trim()) {
            setPassages(newPassages);
          } else {
            setPassages([...passages, ...newPassages]);
          }
          
          toast({
            title: '지문 불러오기 성공',
            description: `${newPassages.length}개의 지문이 추가되었습니다.`
          });
          
          sessionStorage.removeItem('selectedPassages');
          sessionStorage.removeItem('selectedPassage');
        }
      } catch (error) {
        console.error('Error loading selected passages:', error);
      }
    } else if (selectedPassageString) {
      try {
        const selectedPassage = JSON.parse(selectedPassageString);
        
        const updatedPassages = [...passages];
        if (updatedPassages.length > 0) {
          if (!updatedPassages[0].content.trim()) {
            updatedPassages[0] = {
              ...updatedPassages[0],
              content: selectedPassage.content
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
              content: selectedPassage.content
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

  const handleChange = (index: number, content: string) => {
    const updatedPassages = [...passages];
    updatedPassages[index].content = content;
    setPassages(updatedPassages);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      addNewPassage();
    }
  };

  const addNewPassage = () => {
    const newId = passages.length > 0 
      ? Math.max(...passages.map(p => p.id)) + 1 
      : 1;
      
    setPassages([...passages, { id: newId, content: '' }]);
  };

  const removePassage = (index: number) => {
    if (passages.length > 1) {
      const updatedPassages = [...passages];
      updatedPassages.splice(index, 1);
      setPassages(updatedPassages);
    }
  };

  const handlePassageSelect = (passage: PassageWithStep) => {
    if (passage.stepNumber && passage.stepNumber <= 5) {
      const updatedPassages = [...passages];
      
      while (updatedPassages.length < passage.stepNumber) {
        const newId = updatedPassages.length > 0 
          ? Math.max(...updatedPassages.map(p => p.id)) + 1 
          : 1;
        updatedPassages.push({ id: newId, content: '' });
      }
      
      updatedPassages[passage.stepNumber - 1] = {
        id: updatedPassages[passage.stepNumber - 1].id,
        content: passage.content
      };
      
      setPassages(updatedPassages);
    } else {
      const newId = Math.max(...passages.map(p => p.id)) + 1;
      
      if (passages.length > 0 && !passages[0].content.trim()) {
        const updatedPassages = [...passages];
        updatedPassages[0] = {
          id: passages[0].id,
          content: passage.content
        };
        setPassages(updatedPassages);
      } else {
        setPassages([...passages, {
          id: newId,
          content: passage.content
        }]);
      }
    }
    
    toast({
      title: '지문 불러오기 성공',
      description: '데이터베이스에서 선택한 지문이 추가되었습니다.'
    });
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>, index: number) => {
    const clipboardData = e.clipboardData;
    const pastedData = clipboardData.getData('text');
    
    if (pastedData.includes('\t') || pastedData.includes('\n')) {
      e.preventDefault();
      
      const rows = pastedData.split(/\r?\n/).filter(row => row.trim() !== '');
      
      if (rows.length <= 1) {
        handleChange(index, passages[index].content + pastedData);
        return;
      }
      
      const newPassages = [...passages];
      
      if (index === passages.length - 1 && !passages[index].content.trim()) {
        newPassages.pop();
      }
      
      const highestId = newPassages.length > 0 
        ? Math.max(...newPassages.map(p => p.id)) 
        : 0;
      
      rows.forEach((row, i) => {
        if (row.trim()) {
          newPassages.push({ 
            id: highestId + i + 1, 
            content: row.trim() 
          });
        }
      });
      
      setPassages(newPassages);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-slate-800">지문 입력</h2>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => setPassageDbDialogOpen(true)}
          >
            <Database className="h-4 w-4" />
            지문 데이터베이스에서 선택
          </Button>
          
          <PassageSelectionDialog
            open={passageDbDialogOpen}
            onOpenChange={setPassageDbDialogOpen}
            onPassageSelect={handlePassageSelect}
            enableMultiSelect={true}
            title="지문 데이터베이스"
            maxSelections={40}
          />
        </div>

        {passages.map((passage, index) => (
          <div key={passage.id} className="passage-input-container">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium flex items-center">
                <span className="flex items-center justify-center w-7 h-7 bg-slate-800 text-white rounded-full text-sm mr-2">
                  {index + 1}
                </span>
                <span>지문 {index + 1}</span>
              </label>
              {passages.length > 1 && (
                <button 
                  onClick={() => removePassage(index)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
            <Textarea
              value={passage.content}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={handleKeyDown}
              onPaste={(e) => handlePaste(e, index)}
              placeholder="영어 지문을 입력하세요"
              className="min-h-[150px]"
              data-id={passage.id}
            />
          </div>
        ))}
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="w-full border-dashed"
            onClick={addNewPassage}
          >
            <Plus className="h-4 w-4 mr-2" />
            지문 추가하기 (Ctrl+Enter)
          </Button>
        </div>
      </div>
      
      <div className="flex justify-center">
        <Button 
          onClick={onGenerateUnderstanding} 
          disabled={isLoading || passages.every(p => !p.content.trim())}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              분석 중...
            </>
          ) : "자료 생성하기"}
        </Button>
      </div>
    </div>
  );
};

export default PassageInput;
