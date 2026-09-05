import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Image, CheckCircle } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import WritingTestReport from '@/components/WritingTestReport';
import { downloadAsJPG } from '@/utils/resultsUtils';
import brainiacLogo from '@/assets/brainiac-logo.png.asset.json';

const WritingTestResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const reportRef = useRef<HTMLDivElement>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const { score, correct, total, results, testData, studentName, studentClass } = location.state || {};
  
  // Calculate score: 100 points total / number of questions, rounded
  const calculatedScore = total > 0 ? Math.round((correct / total) * 100) : 0;
  
  useEffect(() => {
    // Check admin access
    const adminAccess = !!sessionStorage.getItem('verifiedAccessCode');
    setIsAdmin(adminAccess);
  }, []);
  
  useEffect(() => {
    if (!location.state) {
      navigate('/');
      return;
    }
    
    // Save result to database with calculated score
    const saveResult = async () => {
      try {
        const { error } = await supabase
          .from('test_results')
          .insert({
            test_id: testData.testId,
            student_name: `${studentClass} ${studentName}`,
            score: calculatedScore,
            correct_count: correct,
            total_count: total,
            student_answers: { results, testFormat: 'writing' }
          });
          
        if (error) {
          console.error('Error saving result:', error);
        }
      } catch (err) {
        console.error('Error:', err);
      }
    };
    
    saveResult();
  }, [location.state, navigate]);
  
  const handleDownloadImage = () => {
    if (!reportRef.current) return;
    const fileName = `${testData?.title || '영작테스트'}_${studentClass}_${studentName}`;
    downloadAsJPG(reportRef.current, fileName);
    toast({
      title: "이미지 저장 완료",
      description: "리포트가 이미지로 저장되었습니다."
    });
  };
  
  if (!location.state) {
    return null;
  }

  // Students see only "Thank you" screen
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-12 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          
          <img 
            src={brainiacLogo.url} 
            alt="Brainiac English" 
            className="w-16 h-16 rounded-xl object-cover mx-auto mb-4 border-2 border-emerald-100"
          />
          
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3">
            수고하셨습니다
          </h1>
          
          <p className="text-slate-500 mb-6">
            {testData?.title || '영작 테스트'}가 제출되었습니다.
          </p>
          
          <div className="bg-slate-50 rounded-xl p-4 mb-6">
            <div className="text-sm text-slate-600">
              <span className="font-medium">{studentClass}</span>
              <span className="mx-2 text-slate-300">|</span>
              <span className="font-medium">{studentName}</span>
            </div>
          </div>
          
          <Button
            onClick={() => navigate('/')}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-6 rounded-xl shadow-lg"
          >
            돌아가기
          </Button>
        </div>
        
        <div className="mt-8 text-xs text-slate-400">
          © BRAINIAC ENGLISH. All rights reserved.
        </div>
      </div>
    );
  }

  // Admins see full report
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-emerald-200/60 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="shrink-0">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <img src={brainiacLogo.url} alt="Brainiac English" className="h-8 w-8 rounded-lg object-cover shrink-0" />
                <div>
                  <h1 className="text-sm font-bold text-slate-800 leading-tight">{testData?.title}</h1>
                  <p className="text-xs text-slate-500">영작 테스트 결과</p>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadImage}
              className="gap-2"
            >
              <Image className="h-4 w-4" />
              <span className="hidden sm:inline">이미지 저장</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Report */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div ref={reportRef} className="bg-white rounded-2xl border border-emerald-200 shadow-lg overflow-hidden">
          <WritingTestReport
            studentName={studentName}
            studentClass={studentClass}
            testTitle={testData?.title || '영작 테스트'}
            score={calculatedScore}
            correct={correct}
            total={total}
            results={results}
            testDate={new Date().toISOString()}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-8 text-xs text-slate-400">
        © BRAINIAC ENGLISH. All rights reserved.
      </div>
    </div>
  );
};

export default WritingTestResult;
