
import React from "react";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";

interface FormButtonsProps {
  onCancel: () => void;
  submitText?: string;
}

export const FormButtons: React.FC<FormButtonsProps> = ({ onCancel, submitText = "추가" }) => {
  return (
    <DialogFooter>
      <Button 
        type="button" 
        variant="outline" 
        onClick={onCancel}
      >
        취소
      </Button>
      <Button type="submit">{submitText}</Button>
    </DialogFooter>
  );
};
