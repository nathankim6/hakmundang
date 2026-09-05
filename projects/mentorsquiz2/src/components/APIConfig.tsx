import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle, ExternalLink, XCircle, Terminal, Server, Database, Shield, Cpu } from "lucide-react";
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
        return "Deep Seek 3.5";
      default:
        return "";
    }
  };
  return <div className="api-config-panel space-y-3 relative group overflow-hidden rounded-2xl border border-white/20 shadow-2xl shadow-indigo-500/20 backdrop-blur-xl">
      {/* Enhanced terminal header with premium effects */}
      <div className="api-terminal-header relative flex items-center gap-1.5 px-5 py-3 bg-gradient-to-r from-slate-900/95 via-gray-800/95 to-slate-900/95 border-b border-white/10">
        {/* Traffic light buttons with glow */}
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-lg shadow-red-500/30 animate-pulse"></div>
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 shadow-lg shadow-yellow-500/30 animate-pulse delay-100"></div>
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 shadow-lg shadow-green-500/30 animate-pulse delay-200"></div>
        </div>
        
        {/* Title section with enhanced styling */}
        <div className="flex items-center gap-2 ml-4">
          <div className="relative">
            <Cpu className="w-4 h-4 text-indigo-300 drop-shadow-sm" />
            <div className="absolute inset-0 w-4 h-4 bg-indigo-400/30 blur-sm rounded-full animate-pulse"></div>
          </div>
          <span className="text-xs font-mono font-semibold text-transparent bg-gradient-to-r from-blue-300 via-indigo-300 to-purple-300 bg-clip-text tracking-wider">
            API CONFIGURATION
          </span>
        </div>
        
        <div className="flex-1"></div>
        
        {/* Terminal icon with glow effect */}
        <div className="relative">
          <Terminal className="w-4 h-4 text-slate-400 drop-shadow-sm" />
          <div className="absolute inset-0 w-4 h-4 bg-blue-400/20 blur-sm rounded-full group-hover:bg-blue-400/40 transition-all duration-300"></div>
        </div>
        
        {/* Header accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent"></div>
      </div>
      
      {/* Enhanced background with multiple layers */}
      <div className="absolute inset-0 top-[44px] bg-gradient-to-br from-slate-900/98 via-gray-900/95 to-slate-800/98"></div>
      
      {/* Animated gradient overlays */}
      <div className="absolute inset-0 top-[44px] bg-gradient-to-r from-blue-500/8 via-indigo-500/12 to-purple-500/8 opacity-80 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Floating orbs for premium effect */}
      <div className="absolute top-12 right-8 w-20 h-20 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-full blur-xl animate-pulse opacity-60"></div>
      <div className="absolute bottom-8 left-6 w-16 h-16 bg-gradient-to-br from-blue-400/15 to-cyan-500/15 rounded-full blur-lg animate-pulse delay-700 opacity-40"></div>
      
      {/* Radial gradient accent */}
      <div className="absolute inset-0 top-[44px] bg-[radial-gradient(ellipse_at_center_top,rgba(99,102,241,0.18),transparent_60%)] mix-blend-overlay"></div>
      
      <div className="relative z-10 space-y-6 p-6 pt-5">
        <div className="flex flex-col space-y-5">
          {/* AI Models Section with enhanced styling */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="relative">
                <Shield className="w-5 h-5 text-blue-300 drop-shadow-sm" />
                <div className="absolute inset-0 w-5 h-5 bg-blue-400/30 blur-sm rounded-full animate-pulse"></div>
              </div>
              <Label className="text-sm font-mono font-bold text-transparent bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200 bg-clip-text tracking-wider uppercase">
                AI MODELS
              </Label>
            </div>
            
            <RadioGroup value={selectedAPI} onValueChange={setSelectedAPI} className="flex space-x-6">
              <div className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-slate-600/30 hover:border-blue-400/50 transition-all duration-300 group">
                <div className="api-model-icon claude relative bg-gradient-to-br from-slate-700/80 to-slate-800/80 border border-slate-600/50 group-hover:border-blue-400/50 transition-all duration-300">
                  <img src="/lovable-uploads/019bcf23-a283-4df7-9f86-ab394da9498e.png" alt="Claude Logo" className="w-5 h-5 object-cover" />
                  <div className="absolute inset-0 bg-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                </div>
                <RadioGroupItem value="claude" id="claude" className="border-slate-500 text-blue-400" />
                <Label htmlFor="claude" className="text-sm font-medium text-slate-100 group-hover:text-blue-200 transition-colors duration-300 cursor-pointer">
                  Claude Sonnet 4<span className="text-blue-300 ml-1">(권장)</span>
                </Label>
              </div>
              
              <div className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-slate-600/30 hover:border-emerald-400/50 transition-all duration-300 group">
                <div className="api-model-icon gpt relative bg-gradient-to-br from-slate-700/80 to-slate-800/80 border border-slate-600/50 group-hover:border-emerald-400/50 transition-all duration-300">
                  <img src="/lovable-uploads/21d8d048-505b-4e56-ac5b-1c4cb56a5589.png" alt="GPT Logo" className="w-5 h-5 object-cover" />
                  <div className="absolute inset-0 bg-emerald-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                </div>
                <RadioGroupItem value="gpt" id="gpt" className="border-slate-500 text-emerald-400" />
                <Label htmlFor="gpt" className="text-sm font-medium text-slate-100 group-hover:text-emerald-200 transition-colors duration-300 cursor-pointer">
                  GPT-4o
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* API Key Section with enhanced styling */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Database className="w-5 h-5 text-indigo-300 drop-shadow-sm" />
                  <div className="absolute inset-0 w-5 h-5 bg-indigo-400/30 blur-sm rounded-full animate-pulse"></div>
                </div>
                <Label htmlFor="apiKey" className="text-sm font-mono font-bold text-transparent bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 bg-clip-text tracking-wider uppercase">
                  {selectedAPI === "claude" ? "Claude" : selectedAPI === "gpt" ? "OpenAI" : "Deep Seek 3.5"} API Key
                </Label>
              </div>
              {testResult !== null && (
                <div className="api-status-indicator flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-slate-800/80 to-slate-700/80 border border-slate-600/50">
                  {testResult.success ? (
                    <>
                      <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-green-500 animate-pulse shadow-lg shadow-emerald-500/50"></div>
                      <span className="text-xs text-emerald-200 font-mono font-semibold tracking-wide">{getModelName()} Ready</span>
                    </>
                  ) : (
                    <>
                      <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-rose-400 to-red-500 shadow-lg shadow-rose-500/50"></div>
                      <span className="text-xs text-rose-200 font-mono font-semibold tracking-wide">API Not Connected</span>
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Input 
                id="apiKey" 
                type="password" 
                value={apiKey} 
                onChange={e => setApiKey(e.target.value)} 
                placeholder="sk-..." 
                className="flex-1 h-10 text-sm border-slate-600/50 font-mono text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400/50 bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-sm transition-all duration-300 hover:border-slate-500/60" 
              />
              <Button 
                onClick={handleTestConnection} 
                disabled={isLoading} 
                className="h-10 px-5 text-sm font-medium bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300 disabled:opacity-60"
              >
                {isLoading ? "Verifying..." : "Verify"}
              </Button>
              
              {selectedAPI === "claude" ? (
                <Button 
                  variant="outline" 
                  onClick={() => window.open("https://www.youtube.com/watch?v=4Tzs4qunYJY", "_blank")} 
                  className="h-10 px-4 text-sm whitespace-nowrap bg-gradient-to-r from-slate-700/80 to-slate-600/80 border-slate-500/50 hover:border-blue-400/50 text-slate-100 hover:text-blue-200 transition-all duration-300"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  <span className="font-medium">Claude API 발급 방법</span>
                </Button>
              ) : selectedAPI === "gpt" ? (
                <Button 
                  variant="outline" 
                  onClick={() => window.open("https://www.youtube.com/watch?v=8h-OCfC_EU0", "_blank")} 
                  className="h-10 px-4 text-sm whitespace-nowrap bg-gradient-to-r from-slate-700/80 to-slate-600/80 border-slate-500/50 hover:border-emerald-400/50 text-slate-100 hover:text-emerald-200 transition-all duration-300"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  <span className="font-medium">GPT API 발급 방법</span>
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={() => window.open("https://www.youtube.com/watch?v=h7EbjRZ6Mgk", "_blank")} 
                  className="h-10 px-4 text-sm whitespace-nowrap bg-gradient-to-r from-slate-700/80 to-slate-600/80 border-slate-500/50 hover:border-purple-400/50 text-slate-100 hover:text-purple-200 transition-all duration-300"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  <span className="font-medium">Deep Seek 3.5 API 발급 방법</span>
                </Button>
              )}
              
              <Settings />
            </div>
          </div>
        </div>
      </div>
    </div>;
}