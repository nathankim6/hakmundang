
import React from 'react';
import { QRDataType } from '@/types/test';
import EditableTitle from './EditableTitle';
import { formatDate } from '@/utils/formatDate';

interface TestInfoProps {
  test: QRDataType;
  onTitleUpdate: (newTitle: string) => void;
}

const TestInfo = ({ test, onTitleUpdate }: TestInfoProps) => {
  return (
    <div className="flex flex-col space-y-1">
      <EditableTitle 
        title={test.title} 
        onTitleUpdate={onTitleUpdate} 
      />
      <p className="text-sm text-[#6E6D70]">시험 ID: {test.testId}</p>
      <p className="text-sm text-[#6E6D70]">
        {formatDate(test.timestamp)}
      </p>
      {test.isEnded && (
        <p className="text-sm text-red-500 mt-1">종료된 시험</p>
      )}
    </div>
  );
};

export default TestInfo;
