import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle, ExternalLink } from "lucide-react";
import { Settings } from "./Settings";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface APIResponse {
  success: boolean;
  message: string;
}

export function APIConfig() {
  const [apiKey, setApiKey] = useState("");
  const [testResult, setTestResult] = useState<APIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAPI, setSelectedAPI] = useState("claude"); // Default to Claude
  const { toast } = useToast();

  useEffect(() => {
    const savedApiKey = localStorage.getItem(`${selectedAPI}_api_key`);
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setTestResult({
        success: true,
        message: "저장된 API 키가 있습니다.",
      });
    } else {
      setApiKey("");
      setTestResult(null);
    }
  }, [selectedAPI]);

  const handleTestConnection = async () => {
    if (!apiKey) {
      setTestResult({
        success: false,
        message: "API 키를 입력해주세요.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const keyPrefix = selectedAPI === "claude" ? "sk-" : selectedAPI === "gpt" ? "sk-" : "";
      if (apiKey.startsWith(keyPrefix) && apiKey.length > 20) {
        localStorage.setItem(`${selectedAPI}_api_key`, apiKey);
        
        setTestResult({
          success: true,
          message: "API 키가 저장되었습니다.",
        });
        
        toast({
          title: "성공",
          description: "API 키가 성공적으로 저장되었습니다.",
        });
      } else {
        setTestResult({
          success: false,
          message: "올바른 API 키 형식이 아닙니다.",
        });
        
        toast({
          title: "오류",
          description: "올바른 API 키 형식이 아닙니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: "API 키 저장 중 오류가 발생했습니다.",
      });
      
      toast({
        title: "오류",
        description: "API 키 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="flex flex-col space-y-2">
          <Label>AI 모델 선택</Label>
          <RadioGroup
            value={selectedAPI}
            onValueChange={setSelectedAPI}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="claude" id="claude" />
              <Label htmlFor="claude">Claude Sonnet 3.5</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="gpt" id="gpt" />
              <Label htmlFor="gpt">GPT-4o</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="apiKey">
              {selectedAPI === "claude" ? "Claude" : "OpenAI"} API Key
            </Label>
            {testResult?.success && (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600">API 연결됨</span>
              </div>
            )}
          </div>
          <div className="flex space-x-2">
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="flex-1"
              placeholder="sk-..."
            />
            <Button onClick={handleTestConnection} disabled={isLoading}>
              {isLoading ? "확인 중..." : "확인"}
            </Button>
            {selectedAPI === "claude" ? (
              <Button
                variant="outline"
                onClick={() => window.open("https://www.youtube.com/watch?v=5yf-8Wz1CDM", "_blank")}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Claude API 발급 방법
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => window.open("https://www.youtube.com/watch?v=8h-OCfC_EU0", "_blank")}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                GPT API 발급 방법
              </Button>
            )}
            <Settings />
          </div>
        </div>
      </div>
    </div>
  );
}