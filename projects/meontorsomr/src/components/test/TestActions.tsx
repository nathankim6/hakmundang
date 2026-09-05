
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import EndTestDialog from './EndTestDialog';
import DeleteTestDialog from './DeleteTestDialog';

interface TestActionsProps {
  testId: string;
  isEnded: boolean;
  onDelete: () => void;
  onEndTest: (accessCode: string) => Promise<boolean>;
  testData: any; // Using any here as we're just passing it through
}

const TestActions = ({ testId, isEnded, onDelete, onEndTest, testData }: TestActionsProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-wrap gap-2 mt-2 md:mt-0 justify-start md:justify-end items-center">
      <Button
        variant="outline"
        onClick={() => navigate('/omr', { state: testData })}
        className="border-[#9F9EA1] text-[#403E43] hover:bg-[#F1F1F1] w-full sm:w-auto"
        disabled={isEnded}
      >
        {isEnded ? '종료됨' : '시험 참여'}
      </Button>
      
      <EndTestDialog 
        disabled={isEnded}
        onEndTest={onEndTest}
        testId={testId}
        onDelete={onDelete}
      />
      
      <DeleteTestDialog onDelete={onDelete} />
    </div>
  );
};

export default TestActions;
