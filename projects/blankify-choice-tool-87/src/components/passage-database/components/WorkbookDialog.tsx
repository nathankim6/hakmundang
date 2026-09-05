
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { WorkbookDialogProps } from '../hooks/types';

const WorkbookDialog: React.FC<WorkbookDialogProps> = ({
  open,
  onOpenChange,
  accumulatedSelections,
  onSave,
  isCreating,
  workbookName,
  setWorkbookName
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>워크북 만들기</DialogTitle>
          <DialogDescription>
            선택한 지문으로 새 워크북을 만들어보세요.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="workbook-name" className="text-right">
              워크북 이름
            </Label>
            <Input
              id="workbook-name"
              value={workbookName}
              onChange={(e) => setWorkbookName(e.target.value)}
              className="col-span-3"
              placeholder="새 워크북 이름을 입력하세요"
            />
          </div>
          <div className="px-4">
            <p className="text-sm text-muted-foreground">
              선택된 지문 {accumulatedSelections.length}개가 이 워크북에 포함됩니다.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={onSave} disabled={isCreating}>
            {isCreating ? "생성중..." : "워크북 만들기"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WorkbookDialog;
