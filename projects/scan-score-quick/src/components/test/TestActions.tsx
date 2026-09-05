
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import EndTestDialog from './EndTestDialog';
import DeleteTestDialog from './DeleteTestDialog';
import { ArrowUpRight, Lock, FileDown } from 'lucide-react';
import { generateGrammarTestDocx } from '@/utils/generateGrammarTestDocx';
import { generateWritingTestDocx } from '@/utils/generateWritingTestDocx';

interface TestActionsProps {
  testId: string;
  isEnded: boolean;
  onDelete: () => void;
  onEndTest: (accessCode: string) => Promise<boolean>;
  testData: any;
}

const TestActions = ({ testId, isEnded, onDelete, onEndTest, testData }: TestActionsProps) => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(!!sessionStorage.getItem('verifiedAccessCode'));
  }, []);

  const isWritingTest = testData?.writingQuestions && 
    Array.isArray(testData.writingQuestions) && 
    testData.writingQuestions.length > 0;

  const isGrammarTest = testData?.testFormat === 'grammar' || 
    (!testData?.testFormat && testData?.answers && Object.values(testData.answers).some(
      (a: any) => a && typeof a === 'object' && a.grammarCategory
    ));

  const handleParticipate = () => {
    if (isWritingTest) {
      navigate(`/writing/${testId}`);
    } else {
      navigate('/omr', { state: testData });
    }
  };

  const handleDownloadWord = async () => {
    if (isGrammarTest) {
      await generateGrammarTestDocx({
        title: testData.title,
        testId: testData.testId,
        answers: testData.answers,
        questionCount: testData.questionCount,
      });
    } else if (isWritingTest) {
      await generateWritingTestDocx({
        title: testData.title,
        questionCount: testData.writingQuestions.length,
        questions: testData.writingQuestions,
      });
    }
  };

  // PC(md+)에서는 항상 보이고, 모바일에서는 관리자만
  const canDownloadWord = isGrammarTest || isWritingTest;

  return (
    <div className="flex items-center gap-1.5 shrink-0">
      {/* Word download button - PC: always, Mobile: admin only */}
      {canDownloadWord && (
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 px-2.5 text-xs text-muted-foreground hover:text-primary hover:bg-primary/10 ${isAdmin ? '' : 'hidden md:flex'}`}
          onClick={handleDownloadWord}
          title="Word 다운로드"
        >
          <FileDown className="h-3.5 w-3.5 mr-1" />
          <span className="hidden sm:inline">Word</span>
        </Button>
      )}

      {/* Main participate button - prominent */}
      <Button
        variant={isEnded ? "ghost" : "default"}
        onClick={handleParticipate}
        className={`${isEnded 
          ? "h-8 px-3 text-xs text-muted-foreground"
          : isWritingTest
            ? "h-9 sm:h-10 px-4 sm:px-6 text-sm font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-md hover:shadow-lg transition-all"
            : "h-9 sm:h-10 px-4 sm:px-6 text-sm font-semibold bg-gradient-to-r from-primary to-purple hover:from-primary/90 hover:to-purple/90 shadow-md hover:shadow-lg transition-all"
        }`}
        disabled={isEnded}
      >
        {isEnded ? (
          <>
            <Lock className="h-3.5 w-3.5 mr-1.5" />
            종료됨
          </>
        ) : (
          <>
            <ArrowUpRight className="h-4 w-4 mr-1.5" />
            {isWritingTest ? '영작 참여' : '참여하기'}
          </>
        )}
      </Button>
      
      {/* Small icon buttons for secondary actions - hide end button when already ended */}
      {!isEnded && (
        <EndTestDialog 
          disabled={isEnded}
          onEndTest={onEndTest}
          testId={testId}
        />
      )}
      
      <DeleteTestDialog 
        testId={testId}
        onDelete={onDelete} 
      />
    </div>
  );
};

export default TestActions;
