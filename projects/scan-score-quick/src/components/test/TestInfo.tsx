
import React from 'react';
import { QRDataType } from '@/types/test';
import EditableTitle from './EditableTitle';
import { formatDate } from '@/utils/formatDate';
import { Clock, Hash, FileText, XCircle } from 'lucide-react';

interface TestInfoProps {
  test: QRDataType;
  onTitleUpdate: (newTitle: string) => void;
}

const TestInfo = ({ test, onTitleUpdate }: TestInfoProps) => {
  return (
    <div className="flex flex-col gap-2 flex-1 min-w-0">
      {/* Title - always visible */}
      <EditableTitle 
        title={test.title} 
        onTitleUpdate={onTitleUpdate} 
      />
      
      {/* Metadata badges - responsive layout */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-medium bg-muted text-muted-foreground">
          <Hash className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
          <span className="max-w-[60px] sm:max-w-none truncate">{test.testId}</span>
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-medium bg-muted text-muted-foreground">
          <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
          <span className="hidden xs:inline">{formatDate(test.timestamp)}</span>
          <span className="xs:hidden">{formatDate(test.timestamp).split(' ')[0]}</span>
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-semibold bg-primary/10 text-primary">
          <FileText className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
          {test.questionCount}문항
        </span>
        {test.isEnded && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-medium bg-destructive/10 text-destructive">
            <XCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            종료
          </span>
        )}
      </div>
    </div>
  );
};

export default TestInfo;
