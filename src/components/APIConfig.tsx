import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Settings, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Anthropic from '@anthropic-ai/sdk';

export const APIConfig = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  const testConnection = async () => {
    try {
      if (!apiKey.trim().startsWith('sk-')) {
        toast({
          title: "API 키 형식 오류",
          description: "올바른 Claude API 키를 입력해주세요. (sk-로 시작)",
          variant: "destructive",
        });
        return;
      }

      const anthropic = new Anthropic({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
      });

      const response = await anthropic.messages.create({
        model: "claude-3-opus-20240229",
        max_tokens: 1,
        messages: [{ role: "user", content: "test" }]
      });

      console.log("API Response:", response);

      if (response) {
        setIsConnected(true);
        localStorage.setItem("CLAUDE_API_KEY", apiKey);
        toast({
          title: "연결 성공",
          description: "Claude API가 성공적으로 연동되었습니다.",
        });
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Claude API Error:", error);
      setIsConnected(false);
      
      let errorMessage = "API 키를 확인해주세요.";
      if (error instanceof Error) {
        if (error.message.includes("401")) {
          errorMessage = "잘못된 API 키입니다. 다시 확인해주세요.";
        } else if (error.message.includes("403")) {
          errorMessage = "API 키의 권한이 없습니다.";
        } else if (error.message.includes("429")) {
          errorMessage = "너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.";
        }
      }

      toast({
        title: "연결 실패",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Claude API 설정</DialogTitle>
            <DialogDescription>
              API 키를 입력하여 Claude API를 연동하세요.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="API 키를 입력하세요"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <Button onClick={testConnection}>연결 테스트</Button>
          </div>
        </DialogContent>
      </Dialog>
      {isConnected ? (
        <CheckCircle className="h-5 w-5 text-green-500" />
      ) : (
        <XCircle className="h-5 w-5 text-red-500" />
      )}
    </div>
  );
};