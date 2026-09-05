
import React from 'react';
import { QRDataType } from '@/types/test';
import { updateTestTitle, updateTestStatus } from '@/utils/testStorage';
import TestInfo from './test/TestInfo';
import TestActions from './test/TestActions';
import QRCodeModal from './test/QRCodeModal';
import { supabase } from '@/integrations/supabase/client';

interface TestItemProps {
  test: QRDataType;
  onDelete: (testId: string) => void;
  showQR: string | null;
  onToggleQR: (testId: string | null) => void;
  onTitleUpdate?: (testId: string, newTitle: string) => void;
  onTestStatusChange?: (testId: string, isEnded: boolean) => void;
}

const TestItem = ({ test, onDelete, showQR, onToggleQR, onTitleUpdate, onTestStatusChange }: TestItemProps) => {
  const handleTitleUpdate = async (newTitle: string) => {
    const success = await updateTestTitle(test.testId, newTitle);
    if (success) {
      onTitleUpdate?.(test.testId, newTitle);
    }
  };

  const handleEndTest = async (accessCode: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-access-code', {
        body: { code: accessCode },
      });

      if (error || !data?.valid || !data?.isAdmin) return false;

      const success = await updateTestStatus(test.testId, true);
      if (success) {
        onTestStatusChange?.(test.testId, true);
      }
      return success;
    } catch {
      return false;
    }
  };

  const handleDelete = () => {
    onDelete(test.testId);
  };

  return (
    <div 
      className={`group relative overflow-hidden rounded-xl border transition-all duration-200 ${
        test.isEnded 
          ? 'bg-muted/20 border-border/30'
          : 'bg-card hover:bg-accent/5 border-border/40 hover:border-primary/30 hover:shadow-md'
      }`}
    >
      {!test.isEnded && (
        <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-primary via-purple to-primary/50 opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 p-3 sm:p-4">
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
      </div>
      
      <QRCodeModal 
        isOpen={showQR === test.testId}
        onClose={() => onToggleQR(null)}
      />
    </div>
  );
};

export default TestItem;
