import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Key } from "lucide-react";

interface LoginFormProps {
  code: string;
  onCodeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  isLoading?: boolean;
}

export function LoginForm({ code, onCodeChange, onSubmit, isLoading }: LoginFormProps) {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSubmit();
    }
  };

  return (
    <div className="w-full max-w-sm space-y-4">
      <div className="relative">
        <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="엑세스 코드를 입력하세요..."
          value={code}
          onChange={onCodeChange}
          onKeyPress={handleKeyPress}
          className="pl-10"
          disabled={isLoading}
        />
      </div>
      <Button 
        onClick={onSubmit} 
        className="w-full" 
        disabled={isLoading}
      >
        {isLoading ? "확인 중..." : "접속하기"}
      </Button>
    </div>
  );
}