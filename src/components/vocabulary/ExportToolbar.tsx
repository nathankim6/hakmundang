import React from 'react';
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, FileText } from "lucide-react";
import { QuestionData } from './types';

interface ExportToolbarProps {
  onExportExcel: () => void;
  onExportDoc: () => void;
}

export const ExportToolbar = ({ onExportExcel, onExportDoc }: ExportToolbarProps) => {
  return (
    <div className="flex justify-end gap-2">
      <Button onClick={onExportExcel} variant="outline" className="hover:bg-blue-50">
        <FileSpreadsheet className="w-4 h-4 mr-2" />
        Excel로 저장
      </Button>
      <Button onClick={onExportDoc} variant="outline" className="hover:bg-blue-50">
        <FileText className="w-4 h-4 mr-2" />
        Word로 저장
      </Button>
    </div>
  );
};