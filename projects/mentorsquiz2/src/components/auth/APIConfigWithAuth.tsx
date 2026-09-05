import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle, ExternalLink, XCircle, Terminal, Server, Database, Shield, Cpu, User } from "lucide-react";
import { Settings } from "../Settings";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { LoginSection } from "./LoginSection";
interface APIResponse {
  success: boolean;
  message: string;
}
interface APIConfigWithAuthProps {
  showLoginForm: boolean;
  userName: string;
  expiryDate: string;
  accessCode: string;
  setAccessCode: (code: string) => void;
  handleLogin: () => void;
  handleLogout: () => void;
  setShowLoginForm: (show: boolean) => void;
}
export function APIConfigWithAuth({
  showLoginForm,
  userName,
  expiryDate,
  accessCode,
  setAccessCode,
  handleLogin,
  handleLogout,
  setShowLoginForm
}: APIConfigWithAuthProps) {
  const [apiKey, setApiKey] = useState("");
  const [testResult, setTestResult] = useState<APIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAPI, setSelectedAPI] = useState("claude");
  const {
    toast
  } = useToast();
  useEffect(() => {
    const savedApiKey = localStorage.getItem(`${selectedAPI}_api_key`);
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setTestResult({
        success: true,
        message: "저장된 API 키가 있습니다."
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
        message: "API 키를 입력해주세요."
      });
      return;
    }
    setIsLoading(true);
    try {
      const keyPrefix = selectedAPI === "claude" ? "sk-" : selectedAPI === "gpt" ? "sk-" : selectedAPI === "deepseek" ? "sk-" : "";
      if (apiKey.startsWith(keyPrefix) && apiKey.length > 20) {
        localStorage.setItem(`${selectedAPI}_api_key`, apiKey);
        setTestResult({
          success: true,
          message: "API 키가 저장되었습니다."
        });
        toast({
          title: "성공",
          description: "API 키가 성공적으로 저장되었습니다."
        });
      } else {
        setTestResult({
          success: false,
          message: "올바른 API 키 형식이 아닙니다."
        });
        toast({
          title: "오류",
          description: "올바른 API 키 형식이 아닙니다.",
          variant: "destructive"
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: "API 키 저장 중 오류가 발생했습니다."
      });
      toast({
        title: "오류",
        description: "API 키 저장 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  const getModelName = () => {
    switch (selectedAPI) {
      case "claude":
        return "Claude Sonnet 4(권장)";
      case "gpt":
        return "GPT-4o";
      case "deepseek":
        return "Deepseek V3";
      default:
        return "";
    }
  };
  return <div className="api-config-panel relative group overflow-hidden rounded-xl border border-white/20 shadow-xl shadow-indigo-500/20 backdrop-blur-xl">
      {/* Compact terminal header */}
      
      
      {/* Compact background layers */}
      <div className="absolute inset-0 top-[28px] bg-gradient-to-br from-slate-900/98 via-gray-900/95 to-slate-800/98"></div>
      <div className="absolute inset-0 top-[28px] bg-gradient-to-r from-blue-500/8 via-indigo-500/12 to-purple-500/8 opacity-80"></div>
      
      <div className="relative z-10 p-3 space-y-3">
        {/* Ultra-compact layout - everything in one row */}
        <div className="grid grid-cols-3 gap-3 items-start">
          {/* AI Models - Compact */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-blue-300" />
              <Label className="text-xs font-mono font-bold text-transparent bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text tracking-wide uppercase">
                AI MODELS
              </Label>
            </div>
            
            <RadioGroup value={selectedAPI} onValueChange={setSelectedAPI} className="flex flex-col space-y-1">
              <div className="flex items-center space-x-1.5 p-1.5 rounded-md bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-slate-600/30 hover:border-blue-400/50 transition-all duration-200 group">
                <div className="w-4 h-4 rounded bg-gradient-to-br from-slate-700/80 to-slate-800/80 border border-slate-600/50 group-hover:border-blue-400/50 transition-all duration-200 flex items-center justify-center">
                  <img src="/lovable-uploads/019bcf23-a283-4df7-9f86-ab394da9498e.png" alt="Claude" className="w-3 h-3 object-cover" />
                </div>
                <RadioGroupItem value="claude" id="claude" className="border-slate-500 text-blue-400 w-3 h-3" />
                <Label htmlFor="claude" className="text-xs font-medium text-slate-100 group-hover:text-blue-200 transition-colors cursor-pointer">
                  Claude Sonnet 4 <span className="text-blue-300">(권장)</span>
                </Label>
              </div>
              
              <div className="flex items-center space-x-1.5 p-1.5 rounded-md bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-slate-600/30 hover:border-emerald-400/50 transition-all duration-200 group">
                <div className="w-4 h-4 rounded bg-gradient-to-br from-slate-700/80 to-slate-800/80 border border-slate-600/50 group-hover:border-emerald-400/50 transition-all duration-200 flex items-center justify-center">
                  <img src="/lovable-uploads/21d8d048-505b-4e56-ac5b-1c4cb56a5589.png" alt="GPT" className="w-3 h-3 object-cover" />
                </div>
                <RadioGroupItem value="gpt" id="gpt" className="border-slate-500 text-emerald-400 w-3 h-3" />
                <Label htmlFor="gpt" className="text-xs font-medium text-slate-100 group-hover:text-emerald-200 transition-colors cursor-pointer">
                  GPT-4o
                </Label>
              </div>
              
              <div className="flex items-center space-x-1.5 p-1.5 rounded-md bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-slate-600/30 hover:border-purple-400/50 transition-all duration-200 group">
                <div className="w-4 h-4 rounded bg-gradient-to-br from-slate-700/80 to-slate-800/80 border border-slate-600/50 group-hover:border-purple-400/50 transition-all duration-200 flex items-center justify-center">
                  <img src="/lovable-uploads/7ebe203f-9d71-4839-b838-d9039e6aca7d.png" alt="Deepseek" className="w-3 h-3 object-cover" />
                </div>
                <RadioGroupItem value="deepseek" id="deepseek" className="border-slate-500 text-purple-400 w-3 h-3" />
                <Label htmlFor="deepseek" className="text-xs font-medium text-slate-100 group-hover:text-purple-200 transition-colors cursor-pointer">
                  Deepseek V3
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* API Key - Compact */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Database className="w-3 h-3 text-indigo-300" />
                <Label htmlFor="apiKey" className="text-xs font-mono font-bold text-transparent bg-gradient-to-r from-indigo-200 to-pink-200 bg-clip-text tracking-wide uppercase">
                  {selectedAPI === "claude" ? "Anthropic" : selectedAPI === "gpt" ? "OpenAI" : "DeepSeek"} API
                </Label>
              </div>
              {testResult !== null && <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-slate-800/80 to-slate-700/80 border border-slate-600/50">
                  {testResult.success ? <>
                      <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-green-500 animate-pulse"></div>
                      <span className="text-xs text-emerald-200 font-mono font-semibold">Ready</span>
                    </> : <>
                      <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-rose-400 to-red-500"></div>
                      <span className="text-xs text-rose-200 font-mono font-semibold">Disconnected</span>
                    </>}
                </div>}
            </div>
            
            <div className="flex items-center gap-1">
              <Input id="apiKey" type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="sk-..." className="flex-1 h-7 text-xs border-slate-600/50 font-mono text-slate-100 placeholder:text-slate-400 focus:ring-1 focus:ring-indigo-400/50 focus:border-indigo-400/50 bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-sm transition-all duration-200" />
              <Button onClick={handleTestConnection} disabled={isLoading} className="h-7 px-2 text-xs font-medium bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 shadow-md shadow-indigo-500/25 transition-all duration-200">
                {isLoading ? "..." : "Verify"}
              </Button>
              
              {selectedAPI === "claude" ? <Button variant="outline" onClick={() => window.open("https://www.youtube.com/watch?v=4Tzs4qunYJY", "_blank")} className="h-7 px-2 text-xs bg-gradient-to-r from-slate-700/80 to-slate-600/80 border-slate-500/50 hover:border-blue-400/50 text-slate-100 hover:text-blue-200 transition-all duration-200">
                  <ExternalLink className="w-3 h-3" />
                </Button> : selectedAPI === "gpt" ? <Button variant="outline" onClick={() => window.open("https://www.youtube.com/watch?v=8h-OCfC_EU0", "_blank")} className="h-7 px-2 text-xs bg-gradient-to-r from-slate-700/80 to-slate-600/80 border-slate-500/50 hover:border-emerald-400/50 text-slate-100 hover:text-emerald-200 transition-all duration-200">
                  <ExternalLink className="w-3 h-3" />
                </Button> : <Button variant="outline" onClick={() => window.open("https://www.youtube.com/watch?v=h7EbjRZ6Mgk", "_blank")} className="h-7 px-2 text-xs bg-gradient-to-r from-slate-700/80 to-slate-600/80 border-slate-500/50 hover:border-purple-400/50 text-slate-100 hover:text-purple-200 transition-all duration-200">
                  <ExternalLink className="w-3 h-3" />
                </Button>}
              
              <Settings />
            </div>
          </div>

          {/* User Authentication - Compact */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <User className="w-3 h-3 text-emerald-300" />
              <Label className="text-xs font-mono font-bold text-transparent bg-gradient-to-r from-emerald-200 to-cyan-200 bg-clip-text tracking-wide uppercase">
                USER AUTH
              </Label>
            </div>
            
            <div>
              <LoginSection showLoginForm={showLoginForm} userName={userName} expiryDate={expiryDate} accessCode={accessCode} setAccessCode={setAccessCode} handleLogin={handleLogin} handleLogout={handleLogout} setShowLoginForm={setShowLoginForm} />
            </div>
          </div>
        </div>
      </div>
    </div>;
}