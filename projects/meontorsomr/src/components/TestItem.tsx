
import React from 'react';
import { QRDataType } from '@/types/test';
import { updateTestTitle, updateTestStatus } from '@/utils/testStorage';
import TestInfo from './test/TestInfo';
import TestActions from './test/TestActions';
import QRCodeModal from './test/QRCodeModal';

interface TestItemProps {
  test: QRDataType;
  onDelete: (testId: string) => void;
  showQR: string | null;
  onToggleQR: (testId: string | null) => void;
  onTitleUpdate?: (testId: string, newTitle: string) => void;
}

const TestItem = ({ test, onDelete, showQR, onToggleQR, onTitleUpdate }: TestItemProps) => {
  const handleTitleUpdate = async (newTitle: string) => {
    const success = await updateTestTitle(test.testId, newTitle);
    if (success) {
      onTitleUpdate?.(test.testId, newTitle);
    }
  };

  const handleEndTest = async (accessCode: string) => {
    if (accessCode === '101100') {
      return await updateTestStatus(test.testId, true);
    }
    return false;
  };

  const handleDelete = () => {
    onDelete(test.testId);
  };

  return (
    <div className="flex flex-col md:flex-row justify-between p-4 bg-white/80 border border-[#9F9EA1]/20 rounded-lg hover:bg-white/90 transition-all shadow-md gap-4">
      <TestInfo 
        test={test} 
        onTitleUpdate={handleTitleUpdate} 
      />
      
      <TestActions 
        testId={test.testId}
        isEnded={!!test.isEnded}
        onDelete={handleDelete}
        onEndTest={handleEndTest}
        testData={test}
      />
      
      <QRCodeModal 
        isOpen={showQR === test.testId}
        onClose={() => onToggleQR(null)}
      />
    </div>
  );
};

export default TestItem;
