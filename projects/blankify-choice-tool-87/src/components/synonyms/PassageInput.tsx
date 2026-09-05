
import React, { useState, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus, Trash2, Database, Circle } from 'lucide-react';
import { SynonymPassage } from './SynonymsService';
import PassageSelectionDialog from '@/components/shared/PassageSelectionDialog';
import { Passage } from '@/components/passage-database/hooks/types';

interface PassageInputProps {
  passages: SynonymPassage[];
  setPassages: (passages: SynonymPassage[]) => void;
  onGenerateSynonyms: () => void;
  isLoading: boolean;
}

const PassageInput: React.FC<PassageInputProps> = ({
  passages,
  setPassages,
  onGenerateSynonyms,
  isLoading
}) => {
  const [passageDbDialogOpen, setPassageDbDialogOpen] = useState(false);

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

  const handlePassageSelect = (passage: Passage) => {
    const newId = passages.length > 0 
      ? Math.max(...passages.map(p => p.id)) + 1 
      : 1;
      
    setPassages([...passages, { id: newId, content: passage.content }]);
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
          />
        </div>

        {passages.map((passage, index) => (
          <div key={passage.id} className="passage-input-container border border-slate-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
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
        
        <Button
          variant="outline"
          className="w-full border-dashed"
          onClick={addNewPassage}
        >
          <Plus className="h-4 w-4 mr-2" />
          지문 추가하기 (Ctrl+Enter)
        </Button>
      </div>
      
      <div className="flex justify-center">
        <Button 
          onClick={onGenerateSynonyms} 
          disabled={isLoading || passages.every(p => !p.content.trim())}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              동반어 생성 중...
            </>
          ) : "동반어 생성하기"}
        </Button>
      </div>
    </div>
  );
};

export default PassageInput;
