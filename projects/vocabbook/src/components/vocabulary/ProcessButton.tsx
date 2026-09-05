import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ProcessButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled: boolean;
}

export const ProcessButton: React.FC<ProcessButtonProps> = ({
  onClick,
  isLoading,
  disabled,
}) => {
  return (
    <Button 
      onClick={onClick} 
      disabled={isLoading || disabled}
      className="w-full"
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isLoading ? '단어장 생성중...' : '단어장 생성하기'}
    </Button>
  );
};