
import React from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UserWork } from './MyWorksService';
import { format } from 'date-fns';
import { stepNames } from './constants';

interface WorkDetailModalProps {
  work: UserWork | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WorkDetailModal: React.FC<WorkDetailModalProps> = ({
  work,
  open,
  onOpenChange
}) => {
  if (!work) return null;

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'yyyy-MM-dd HH:mm');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {work.title || `Step ${work.step_number} 결과`}
          </DialogTitle>
          <DialogDescription>
            {stepNames[work.step_number]} | {formatDate(work.created_at)}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 my-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-md">입력:</h3>
            <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded-md border text-sm">
              {work.content}
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold text-md">결과:</h3>
            <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded-md border text-sm">
              {work.result}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            닫기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WorkDetailModal;
