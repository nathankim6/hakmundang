
import React from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";

interface FormButtonsProps {
  isEditing: boolean;
  onCancel: () => void;
}

export const FormButtons: React.FC<FormButtonsProps> = ({ isEditing, onCancel }) => {
  return (
    <DialogFooter className="pt-4">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
      >
        <X className="mr-2 h-4 w-4" />
        취소
      </Button>
      <Button type="submit">
        <Check className="mr-2 h-4 w-4" />
        {isEditing ? "업데이트" : "추가"}
      </Button>
    </DialogFooter>
  );
};
