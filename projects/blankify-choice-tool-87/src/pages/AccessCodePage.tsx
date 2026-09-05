import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { AccessCodeContext } from '@/contexts/AccessCodeContext';
import Footer from '@/components/Footer';
import { LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";

const AccessCodePage: React.FC = () => {
  const [accessCode, setAccessCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const context = useContext(AccessCodeContext);
  const navigate = useNavigate();
  const { toast } = useToast();
  const videoUrl = "https://jpanpwbdlhsxnyaldddm.supabase.co/storage/v1/object/public/media_assets//20250323_0315_New%20Veritas%20Unveiled_simple_compose_01jpzh2xk6eme97m26a7nfgdxa.mp4";

  const standaloneVerifyCode = async (code: string): Promise<boolean> => {
    const ADMIN_CODE = "101100";
    if (code === ADMIN_CODE) {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('isAdmin', 'true');
      localStorage.setItem('accessCode', code);
      return true;
    }
    try {
      const { data, error } = await supabase
        .from('veritas_access_codes')
        .select('code')
        .eq('code', code)
        .single();
      
      if (error) {
        console.error('Error checking access code:', error);
        return false;
      }
      
      if (data) {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('isAdmin', 'false');
        localStorage.setItem('accessCode', code);
        
        await supabase
          .from('veritas_access_codes')
          .update({ last_accessed: new Date().toISOString() })
          .eq('code', code);
          
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error in standaloneVerifyCode:', error);
      return false;
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!accessCode.trim()) {
      toast({
        title: "접속 실패",
        description: "액세스 코드를 입력해주세요.",
        variant: "destructive"
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const isValid = context ? await context.verifyCode(accessCode) : await standaloneVerifyCode(accessCode);
      if (isValid) {
        navigate('/');
      } else {
        toast({
          title: "접속 실패",
          description: "유효하지 않은 액세스 코드입니다.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error verifying access code:', error);
      toast({
        title: "접속 실패",
        description: "액세스 코드 확인 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <video autoPlay loop muted playsInline className={`object-cover w-full h-full transition-opacity duration-1000 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`} onLoadedData={() => setVideoLoaded(true)}>
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-blue-900 -z-10" />
      <div className="flex-grow flex flex-col items-center justify-end pb-20 p-4 relative z-20">
        <div className="w-full max-w-md mb-8">
          <Card className="overflow-hidden border-0 shadow-2xl bg-white/80 backdrop-blur-sm hover:shadow-purple-500/20 transition-all duration-300">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Input type="password" placeholder="접속 코드를 입력하세요" value={accessCode} onChange={e => setAccessCode(e.target.value)} className="h-12 text-center text-lg border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-300" />
                </div>
                <Button type="submit" className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg" disabled={isSubmitting}>
                  {isSubmitting ? <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      처리 중...
                    </span> : <>
                      <LogIn className="h-4 w-4 mr-2" />
                      접속하기
                    </>}
                </Button>
              </form>
            </CardContent>
            <CardHeader className="bg-transparent backdrop-blur-sm p-4 text-center">
              <div className="flex items-center justify-center">
                <img src="/lovable-uploads/f08fc629-8567-41bf-8759-c7a5bc8f3843.png" alt="Orun Academy Logo" className="h-8 w-auto drop-shadow-lg mr-3" />
                <p className="text-slate-900 font-medium text-lg">옳은영어 워크북 생성 프로그램 NEW VERITAS</p>
              </div>
            </CardHeader>
          </Card>
        </div>
      </div>
      <div className="w-full bg-gradient-to-r from-slate-800 to-gray-900 text-white relative z-20">
        <Footer />
      </div>
    </div>;
};

export default AccessCodePage;
