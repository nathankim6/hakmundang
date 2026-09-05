
import React from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import PassageSearch from '@/components/passage-database/PassageSearch';
import { Passage } from '@/components/passage-database/hooks/types';

interface PassageSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPassageSelect: (passage: Passage) => void;
  enableMultiSelect?: boolean;
  title?: string;
  maxSelections?: number;
}

const PassageSelectionDialog: React.FC<PassageSelectionDialogProps> = ({
  open,
  onOpenChange,
  onPassageSelect,
  enableMultiSelect = true,
  title = "지문 데이터베이스",
  maxSelections = 40
}) => {
  // Force refresh when dialog opens
  const [refreshKey, setRefreshKey] = React.useState(0);
  
  React.useEffect(() => {
    if (open) {
      // When dialog opens, increment key to force refresh
      setRefreshKey(prev => prev + 1);
    }
  }, [open]);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogTitle className="text-xl font-bold mb-4">{title}</DialogTitle>
        <DialogDescription>
          선택한 지문이 STEP 번호에 따라 자동으로 배치됩니다. 원하는 지문을 선택하세요.
        </DialogDescription>
        <PassageSearch 
          key={refreshKey}
          onPassageSelect={onPassageSelect}
          enableMultiSelect={enableMultiSelect}
          maxSelections={maxSelections}
        />
      </DialogContent>
    </Dialog>
  );
};

export default PassageSelectionDialog;
