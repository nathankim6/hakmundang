import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

interface APIResponse {
  success: boolean;
  message: string;
}

export function APIConfig() {
  const [apiKey, setApiKey] = useState("");
  const [testResult, setTestResult] = useState<APIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load API key from localStorage on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem("claude_api_key");
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setTestResult({
        success: true,
        message: "저장된 API 키가 있습니다.",
      });
    }
  }, []);

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
      // Simple validation of API key format
      if (apiKey.startsWith("sk-") && apiKey.length > 20) {
        // Store API key in localStorage
        localStorage.setItem("claude_api_key", apiKey);
        
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
      <div className="space-y-2">
        <Label htmlFor="apiKey">Claude API Key</Label>
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
        </div>
      </div>
      
      {testResult && (
        <div
          className={`p-4 rounded-md ${
            testResult.success
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {testResult.message}
        </div>
      )}
    </div>
  );
}