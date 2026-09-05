
import React from 'react';
import { Button } from "@/components/ui/button";
import { Download, Save } from "lucide-react";

interface ActionsBarProps {
  resultsCount: number;
  accumulatedCount: number;
  exporting: boolean;
  handleExportExcel: () => void;
  handleApplySelectedPassages: () => void;
  clearAccumulatedSelections: () => void;
  showExportAllButton?: boolean;
  createWorkbook?: () => void;
  saveAllPassages?: () => void;
  enableWorkbookCreation?: boolean;
}

const ActionsBar: React.FC<ActionsBarProps> = ({
  resultsCount,
  accumulatedCount,
  exporting,
  handleExportExcel,
  handleApplySelectedPassages,
  clearAccumulatedSelections,
  showExportAllButton = false,
  createWorkbook,
  saveAllPassages,
  enableWorkbookCreation = true
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between gap-2 p-3 border rounded-lg bg-slate-50">
      <div className="text-sm text-slate-600 flex items-center">
        <span>검색결과: <strong>{resultsCount}개</strong> 지문</span>
        {accumulatedCount > 0 && (
          <span className="ml-3">선택: <strong className="text-indigo-600">{accumulatedCount}개</strong> 지문</span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {accumulatedCount > 0 && (
          <>
            <Button variant="outline" size="sm" onClick={handleApplySelectedPassages} className="flex items-center">
              <Save className="h-4 w-4 mr-1" />
              선택 지문 저장
            </Button>
          </>
        )}
        
        {showExportAllButton && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExportExcel} 
            disabled={exporting || resultsCount === 0} 
            className="flex items-center ml-auto"
          >
            <Download className="h-4 w-4 mr-1" />
            {exporting ? "내보내는 중..." : (accumulatedCount > 0 ? "선택 지문 엑셀로 내보내기" : "모든 지문 엑셀로 내보내기")}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ActionsBar;
