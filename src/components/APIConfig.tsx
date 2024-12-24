import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle, ExternalLink, LogOut, User, Calendar } from "lucide-react";
import { Settings } from "./Settings";

interface APIResponse {
  success: boolean;
  message: string;
}

export function APIConfig() {
  const [apiKey, setApiKey] = useState("");
  const [testResult, setTestResult] = useState<APIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    const savedApiKey = localStorage.getItem("claude_api_key");
    const storedName = localStorage.getItem("userName");
    const storedExpiry = localStorage.getItem("subscriptionExpiry");

    if (savedApiKey) {
      setApiKey(savedApiKey);
      setTestResult({
        success: true,
        message: "저장된 API 키가 있습니다.",
      });
    }

    if (storedName) {
      setUserName(storedName);
    }

    if (storedExpiry) {
      const formattedDate = new Date(storedExpiry).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      setExpiryDate(formattedDate);
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
      if (apiKey.startsWith("sk-") && apiKey.length > 20) {
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

  const handleLogout = () => {
    localStorage.removeItem("hasAccess");
    localStorage.removeItem("subscriptionExpiry");
    localStorage.removeItem("userName");
    localStorage.removeItem("isAdmin");
    
    toast({
      title: "로그아웃 성공",
      description: "성공적으로 로그아웃되었습니다.",
    });
    
    window.location.reload();
  };

  return (
    <div className="space-y-4">
      {(userName || expiryDate) && (
        <div className="flex items-center justify-between bg-white/80 rounded-lg p-3 border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-4">
            {userName && (
              <div className="flex items-center text-gray-700">
                <User className="w-4 h-4 mr-2" />
                <span>{userName}</span>
              </div>
            )}
            {expiryDate && (
              <div className="flex items-center text-gray-700">
                <Calendar className="w-4 h-4 mr-2" />
                <span>만료일: {expiryDate}</span>
              </div>
            )}
          </div>
          <Button 
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 mr-1" />
            로그아웃
          </Button>
        </div>
      )}
      
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="apiKey">Claude API Key</Label>
          {testResult?.success && (
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 text-blue-500 animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping absolute" />
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
          <Button
            variant="outline"
            onClick={() => window.open("https://www.youtube.com/watch?v=5yf-8Wz1CDM", "_blank")}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            API 발급 방법
          </Button>
          <Settings />
        </div>
      </div>
    </div>
  );
}