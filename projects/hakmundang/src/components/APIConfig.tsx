import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle, ExternalLink, XCircle } from "lucide-react";
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
  const [selectedAPI, setSelectedAPI] = useState("claude");
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
      const keyPrefix = 
        selectedAPI === "claude" ? "sk-" : 
        selectedAPI === "gpt" ? "sk-" :
        selectedAPI === "deepseek" ? "sk-" : "";
        
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

  const getModelName = () => {
    switch (selectedAPI) {
      case "claude":
        return "Claude Sonnet 3.5";
      case "gpt":
        return "GPT-4o";
      case "deepseek":
        return "Deep Seek 3.5";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-3 bg-gradient-to-r from-[#1A1F2C] via-[#222222] to-[#403E43] p-4 rounded-lg border border-slate-800/20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#9b87f5]/10 to-[#D6BCFA]/5 opacity-40 animate-gradient"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(155,135,245,0.1),transparent_70%)] mix-blend-overlay"></div>
      <div className="relative z-10 space-y-3">
        <div className="flex items-center space-x-4">
          <Label className="text-sm font-medium text-gray-200 whitespace-nowrap">AI 모델 선택</Label>
          <RadioGroup
            value={selectedAPI}
            onValueChange={setSelectedAPI}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-transparent border border-slate-700/50 shadow-lg">
                <img 
                  src="/lovable-uploads/019bcf23-a283-4df7-9f86-ab394da9498e.png" 
                  alt="Claude Logo" 
                  className="w-7 h-7 object-cover mix-blend-luminosity opacity-85 saturate-150 hover:opacity-100 transition-opacity"
                />
              </div>
              <RadioGroupItem value="claude" id="claude" />
              <Label htmlFor="claude" className="text-sm text-gray-200">Claude Sonnet 3.5</Label>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-transparent border border-slate-700/50 shadow-lg">
                <img 
                  src="/lovable-uploads/21d8d048-505b-4e56-ac5b-1c4cb56a5589.png" 
                  alt="GPT Logo" 
                  className="w-7 h-7 object-cover mix-blend-luminosity opacity-85 saturate-150 hover:opacity-100 transition-opacity"
                />
              </div>
              <RadioGroupItem value="gpt" id="gpt" />
              <Label htmlFor="gpt" className="text-sm text-gray-200">GPT-4o</Label>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-transparent border border-slate-700/50 shadow-lg">
                <img 
                  src="/lovable-uploads/da3c3f19-335e-412e-85f4-85daeda799c1.png" 
                  alt="Deep Seek Logo" 
                  className="w-7 h-7 object-cover mix-blend-luminosity opacity-85 saturate-150 hover:opacity-100 transition-opacity"
                />
              </div>
              <RadioGroupItem value="deepseek" id="deepseek" />
              <Label htmlFor="deepseek" className="text-sm text-gray-200">Deep Seek 3.5</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="apiKey" className="text-sm font-medium text-gray-200">
              {selectedAPI === "claude" ? "Claude" : 
               selectedAPI === "gpt" ? "OpenAI" : "Deep Seek 3.5"} API Key
            </Label>
            {testResult !== null && (
              <div className="flex items-center gap-1">
                {testResult.success ? (
                  <>
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-400">{getModelName()} API 연결됨</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3 text-red-500" />
                    <span className="text-xs text-red-400">API 연결 안 됨</span>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="flex-1 h-9 text-sm bg-white border-slate-700"
              placeholder="sk-..."
            />
            <Button 
              onClick={handleTestConnection} 
              disabled={isLoading}
              className="h-9 px-3 text-sm"
            >
              {isLoading ? "확인 중..." : "확인"}
            </Button>
            {selectedAPI === "claude" ? (
              <Button
                variant="outline"
                onClick={() => window.open("https://www.youtube.com/watch?v=4Tzs4qunYJY", "_blank")}
                className="h-9 px-3 text-sm whitespace-nowrap"
              >
                <ExternalLink className="mr-2 h-3 w-3" />
                Claude API 발급 방법
              </Button>
            ) : selectedAPI === "gpt" ? (
              <Button
                variant="outline"
                onClick={() => window.open("https://www.youtube.com/watch?v=8h-OCfC_EU0", "_blank")}
                className="h-9 px-3 text-sm whitespace-nowrap"
              >
                <ExternalLink className="mr-2 h-3 w-3" />
                GPT API 발급 방법
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => window.open("https://www.youtube.com/watch?v=h7EbjRZ6Mgk", "_blank")}
                className="h-9 px-3 text-sm whitespace-nowrap"
              >
                <ExternalLink className="mr-2 h-3 w-3" />
                Deep Seek 3.5 API 발급 방법
              </Button>
            )}
            <Settings />
          </div>
        </div>
      </div>
    </div>
  );
}