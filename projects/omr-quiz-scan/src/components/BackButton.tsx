import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  fallbackPath?: string;
}

const BackButton = ({ 
  className = "", 
  variant = "outline", 
  size = "sm",
  fallbackPath = "/"
}: BackButtonProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    // 메인페이지로 이동
    navigate("/");
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleBack}
      className={`inline-flex items-center gap-2 ${className}`}
      aria-label="뒤로가기"
    >
      <ArrowLeft className="h-4 w-4" />
      뒤로가기
    </Button>
  );
};

export default BackButton;