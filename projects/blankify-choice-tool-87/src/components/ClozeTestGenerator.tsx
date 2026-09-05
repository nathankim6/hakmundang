
import React, { useState, useEffect } from 'react';
import PassageEditor from './PassageEditor';
import { PlusCircle, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useMyWorksService } from "@/components/my-works/MyWorksService";
import PassageSelectionDialog from '@/components/shared/PassageSelectionDialog';
import { Passage } from '@/components/passage-database/hooks/types';

interface ClozePassage {
  content: string;
}

const ClozeTestGenerator: React.FC = () => {
  const [passages, setPassages] = useState<ClozePassage[]>([{
    content: ''
  }]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { saveWork } = useMyWorksService();
  const [passageDbDialogOpen, setPassageDbDialogOpen] = useState(false);
  
  useEffect(() => {
    const selectedPassageString = sessionStorage.getItem('selectedPassage');
    if (selectedPassageString) {
      try {
        const selectedPassage = JSON.parse(selectedPassageString);
        
        const updatedPassages = [...passages];
        if (updatedPassages.length > 0) {
          if (!updatedPassages[0].content.trim()) {
            updatedPassages[0] = {
              content: selectedPassage.content
            };
            setPassages(updatedPassages);
            
            toast({
              title: '지문 불러오기 성공',
              description: '데이터베이스에서 선택한 지문이 추가되었습니다.'
            });
          } else {
            setPassages([...passages, {
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
  
  const addPassage = () => {
    setPassages([...passages, {
      content: ''
    }]);
  };

  const updatePassage = (index: number, newContent: string) => {
    const newPassages = [...passages];
    newPassages[index] = {
      content: newContent
    };
    setPassages(newPassages);
  };

  const deletePassage = (index: number) => {
    const newPassages = [...passages];
    newPassages.splice(index, 1);
    setPassages(newPassages);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      addPassage();
    }
  };
  
  const handlePassageSelect = (passage: Passage) => {
    if (passages.length > 0 && !passages[0].content.trim()) {
      const updatedPassages = [...passages];
      updatedPassages[0] = {
        content: passage.content
      };
      setPassages(updatedPassages);
      
      toast({
        title: '지문 선택',
        description: '지문이 추가되었습니다.'
      });
    } else {
      setPassages([...passages, {
        content: passage.content
      }]);
      
      toast({
        title: '지문 선택',
        description: '새로운 지문이 추가되었습니다.'
      });
    }
  };
  
  return <div className="flex flex-col w-full max-w-5xl mx-auto p-6 gap-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-lg border border-blue-100 shadow-sm mb-6">
        <p className="font-medium text-slate-700 mb-2">사용 방법:</p>
        <ol className="list-decimal pl-8 space-y-1.5 text-slate-600">
          <li>아래 칸에 영어 지문을 입력하세요.</li>
          <li>빈칸이나 선택문제로 만들 단어나 구문을 드래그하여 선택하세요.</li>
          <li><strong className="text-purple-700">Ctrl+1</strong>을 눌러 선택한 텍스트를 어법/어휘 선택문제로 바꾸세요.</li>
          <li><strong className="text-amber-700">Ctrl+2</strong>를 눌러 선택한 텍스트를 어순배열 문제로 변환하세요.</li>
          <li><strong className="text-blue-700">Ctrl+3</strong>을 눌러 선택한 텍스트를 빈칸으로 변환하세요.</li>
          <li><strong className="text-slate-700">Ctrl+Z</strong>를 눌러 이전 상태로 되돌릴 수 있습니다.</li>
        </ol>
      </div>
      
      {passages.map((passage, index) => <PassageEditor key={index} index={index} passage={passage} onPassageChange={updatePassage} onKeyDown={e => handleKeyDown(e, index)} onDelete={passages.length > 1 ? deletePassage : undefined} />)}
      
      <div className="flex items-center gap-4 justify-center">
        <button onClick={addPassage} className="flex items-center justify-center gap-2 bg-gradient-to-r from-slate-700 to-slate-800 text-white py-2.5 px-5 rounded-lg hover:from-slate-800 hover:to-slate-900 transition-all duration-200 shadow-md group">
          <PlusCircle className="h-5 w-5 transition-transform group-hover:scale-110" />
          <span>새 지문 추가</span>
        </button>
        
        <Button 
          onClick={() => setPassageDbDialogOpen(true)}
          variant="outline" 
          className="flex items-center gap-2"
        >
          <Database className="h-5 w-5" />
          지문 데이터베이스에서 선택
        </Button>
        
        <PassageSelectionDialog
          open={passageDbDialogOpen}
          onOpenChange={setPassageDbDialogOpen}
          onPassageSelect={handlePassageSelect}
          enableMultiSelect={true}
          title="지문 데이터베이스에서 선택"
        />
      </div>
    </div>;
};

export default ClozeTestGenerator;
