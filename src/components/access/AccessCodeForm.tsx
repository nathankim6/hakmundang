import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Key } from "lucide-react";

interface AccessCodeFormProps {
  onSubmit: (code: string) => void;
}

export function AccessCodeForm({ onSubmit }: AccessCodeFormProps) {
  const [code, setCode] = useState("");

  const handleSubmit = () => {
    onSubmit(code);
  };

  return (
    <div className="w-full max-w-md space-y-4">
      <div className="relative">
        <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="엑세스 코드를 입력하세요..."
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="pl-10 pr-4 py-6 text-lg border-2 focus:border-primary/50 transition-all duration-300"
        />
      </div>
      <Button 
        onClick={handleSubmit}
        className="w-full py-6 text-lg font-medium bg-gradient-to-r from-[#403E43] via-[#555555] to-[#403E43] hover:opacity-90 transition-opacity"
      >
        확인
      </Button>
    </div>
  );
}