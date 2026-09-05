import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Search, FileText, Calendar, Trophy, ChevronRight, Loader2, Sparkles, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import brainiacLogo from '@/assets/brainiac-logo.png.asset.json';

import { recalculateResult } from '@/utils/levelTestScoring';

interface TestResultItem {
  id: string;
  type: 'test' | 'level_test';
  title: string;
  score: number;
  total_score: number;
  created_at: string;
  level?: string;
  test_type?: string;
}

const MyReport = () => {
  const [studentId, setStudentId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<TestResultItem[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!studentId.trim()) {
      toast({
        title: '입력 오류',
        description: '이름+휴대폰번호 뒷4자리를 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const allResults: TestResultItem[] = [];

      // 1. Fetch regular test results - using ilike for partial match
      const searchTerm = studentId.trim();
      const { data: testResults, error: testError } = await supabase
        .from('test_results')
        .select(`
          id,
          student_name,
          score,
          total_count,
          created_at,
          test_id,
          tests!inner(title)
        `)
        .ilike('student_name', `%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (testError) {
        console.error('Test results error:', testError);
      } else if (testResults) {
        testResults.forEach((result: any) => {
          allResults.push({
            id: result.id,
            type: 'test',
            title: result.tests?.title || '시험',
            score: result.score,
            total_score: 100,
            created_at: result.created_at,
            test_type: 'regular',
          });
        });
      }

      // 2. Fetch level test results (middle school) - using ilike for partial match
      const { data: levelTestResults, error: levelTestError } = await supabase
        .from('level_test_results')
        .select('*')
        .ilike('student_name', `%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (levelTestError) {
        console.error('Level test results error:', levelTestError);
      } else if (levelTestResults) {
        levelTestResults.forEach((result: any) => {
          // Determine test type based on level field and sub_category_scores structure
          let testType = '중등부';
          let totalScore = 260;
          let displayScore = result.total_score;
          
          // Check level field first for Prep tests
          if (result.level?.startsWith('prep-')) {
            testType = '초등부';
            totalScore = 268;
          } else {
            // Check sub_category_scores structure
            const subCat = result.sub_category_scores as Record<string, any[]> | null;
            if (subCat) {
              if ('practical' in subCat) {
                testType = '고등부';
                totalScore = 100;
              } else if ('sentence' in subCat) {
                // 중등부 - 점수 재계산
                testType = '중등부';
                totalScore = 260;
                if (result.answers && Object.keys(result.answers).length > 0) {
                  const recalculated = recalculateResult({ answers: result.answers });
                  displayScore = recalculated.total_score;
                }
              }
            } else if (result.total_score <= 100) {
              testType = '고등부';
              totalScore = 100;
            }
          }

          allResults.push({
            id: result.id,
            type: 'level_test',
            title: `${testType} BEAT`,
            score: displayScore,
            total_score: totalScore,
            created_at: result.created_at,
            level: result.level,
            test_type: testType,
          });
        });
      }

      // Sort all results by date
      allResults.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setResults(allResults);

      if (allResults.length === 0) {
        toast({
          title: '결과 없음',
          description: '해당 정보로 등록된 시험 결과가 없습니다.',
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: '오류 발생',
        description: '결과를 불러오는 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleViewReport = (result: TestResultItem) => {
    if (result.type === 'level_test') {
      navigate(`/level-test/result/${result.id}`);
    } else {
      navigate(`/test-result/${result.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Decorative Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Geometric Patterns */}
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-900"/>
              </pattern>
              <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" className="fill-slate-900"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)"/>
          </svg>
        </div>
        
        {/* Gradient Orbs */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-32 w-80 h-80 bg-gradient-to-tr from-slate-300/20 to-blue-300/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-gradient-to-tl from-indigo-300/15 to-slate-200/10 rounded-full blur-3xl" />
        
        {/* Decorative Lines */}
        <div className="absolute top-20 left-10 w-32 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
        <div className="absolute top-40 right-20 w-24 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent" />
        <div className="absolute bottom-32 left-1/4 w-40 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      </div>

      {/* Header */}
      <header className="relative bg-white/70 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-50/50 via-white/80 to-blue-50/50" />
        <div className="relative max-w-2xl mx-auto px-3 sm:px-4 py-3 sm:py-5">
          <div className="flex items-center justify-center gap-2 sm:gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl sm:rounded-2xl blur-lg opacity-30" />
              <img src={brainiacLogo.url} alt="Brainiac English" className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl object-cover shadow-lg ring-2 ring-white" />
            </div>
            <div className="text-center">
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-clip-text text-transparent tracking-tight">
                BRAINIAC ENGLISH
              </h1>
              <div className="flex items-center justify-center gap-1 sm:gap-1.5 mt-0.5">
                <div className="w-4 sm:w-6 h-px bg-gradient-to-r from-transparent to-slate-300" />
                <p className="text-[10px] sm:text-xs font-medium text-slate-500 tracking-widest uppercase">Score Report</p>
                <div className="w-4 sm:w-6 h-px bg-gradient-to-l from-transparent to-slate-300" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-2xl mx-auto px-3 sm:px-4 py-6 sm:py-10">
        {/* Search Card */}
        <Card className="mb-6 sm:mb-10 border-0 shadow-2xl shadow-slate-200/50 bg-white/80 backdrop-blur-xl overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600" />
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-blue-50 to-transparent opacity-60" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-slate-50 to-transparent opacity-60" />
          
          <CardHeader className="relative text-center pb-2 pt-5 sm:pt-8">
            <div className="mx-auto mb-3 sm:mb-4 w-14 h-14 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-white flex items-center justify-center shadow-lg overflow-hidden">
              <img src={brainiacLogo.url} alt="ORUN Exam" className="w-full h-full object-contain p-1" />
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">성적 조회</CardTitle>
            <CardDescription className="text-slate-500 mt-1.5 sm:mt-2 text-sm">
              시험 응시 시 입력한 정보를 입력해주세요
            </CardDescription>
          </CardHeader>
          
          <CardContent className="relative space-y-4 sm:space-y-5 pb-6 sm:pb-8 px-4 sm:px-6">
            <div className="space-y-2 sm:space-y-3">
              <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                이름 + 휴대폰번호 뒷4자리
              </label>
              <div className="flex gap-2 sm:gap-3">
                <div className="relative flex-1">
                  <Input
                    placeholder="예: 김옳은5554"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="h-12 sm:h-14 text-sm sm:text-base pl-4 sm:pl-5 pr-3 sm:pr-4 border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-lg sm:rounded-xl transition-all duration-200"
                  />
                </div>
                <Button 
                  onClick={handleSearch} 
                  disabled={isLoading}
                  className="h-12 sm:h-14 px-4 sm:px-7 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 rounded-lg sm:rounded-xl transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </Button>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 pl-1">
                시험 응시 시 입력한 이름과 휴대폰번호 뒷4자리를 붙여서 입력하세요
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Results List */}
        {hasSearched && (
          <div className="space-y-4 sm:space-y-5">
            {results.length > 0 ? (
              <>
                <div className="flex items-center gap-2 sm:gap-3 px-1">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25">
                    <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-800">시험 결과</h2>
                    <p className="text-[10px] sm:text-xs text-slate-500">{results.length}건의 결과가 있습니다</p>
                  </div>
                </div>
                
                <div className="space-y-3 sm:space-y-4">
                  {results.map((result, index) => (
                    <Card 
                      key={result.id} 
                      className="border-0 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-300/50 transition-all duration-300 cursor-pointer bg-white/90 backdrop-blur group overflow-hidden hover:-translate-y-1"
                      onClick={() => handleViewReport(result)}
                    >
                      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      <CardContent className="p-3 sm:p-5">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                              {index === 0 && (
                                <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/25 tracking-wide uppercase">
                                  <svg className="h-2.5 w-2.5 sm:h-3 sm:w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="currentColor" />
                                  </svg>
                                  Latest
                                </span>
                              )}
                              {result.test_type && result.type === 'level_test' && (
                                <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-slate-100 text-slate-600">
                                  {result.test_type}
                                </span>
                              )}
                              {result.level && (
                                <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/50">
                                  {result.level}
                                </span>
                              )}
                            </div>
                            <h3 className="font-bold text-slate-800 truncate mb-1.5 sm:mb-2 text-sm sm:text-lg">
                              {result.title}
                            </h3>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-5 text-xs sm:text-sm">
                              <span className="flex items-center gap-1 sm:gap-1.5 text-slate-500">
                                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                                {formatDate(result.created_at)}
                              </span>
                              <span className="flex items-center gap-1 sm:gap-1.5 font-bold text-blue-600">
                                <Award className="h-3 w-3 sm:h-4 sm:w-4" />
                                {result.score}점 / {result.total_score}점
                              </span>
                            </div>
                          </div>
                          <div className="ml-2 sm:ml-4 w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-slate-100 group-hover:bg-blue-500 flex items-center justify-center transition-all duration-300 flex-shrink-0">
                            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white/90 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200" />
                <CardContent className="py-10 sm:py-16 text-center">
                  <div className="w-14 h-14 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-5 rounded-xl sm:rounded-2xl bg-slate-100 flex items-center justify-center">
                    <FileText className="h-7 w-7 sm:h-10 sm:w-10 text-slate-400" />
                  </div>
                  <h3 className="font-bold text-slate-700 mb-2 text-base sm:text-lg">결과가 없습니다</h3>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto leading-relaxed px-4">
                    입력하신 정보와 일치하는 시험 결과가 없습니다.<br />
                    정보를 다시 확인해주세요.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Initial State */}
        {!hasSearched && (
          <div className="text-center py-10 sm:py-16">
            <div className="relative mx-auto mb-6 sm:mb-8">
              <div className="absolute inset-0 w-20 h-20 sm:w-28 sm:h-28 mx-auto bg-gradient-to-br from-blue-400/30 to-indigo-500/20 rounded-2xl sm:rounded-3xl blur-xl" />
              <div className="relative w-16 h-16 sm:w-24 sm:h-24 mx-auto rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200/50 flex items-center justify-center shadow-lg">
                <Search className="h-7 w-7 sm:h-10 sm:w-10 text-slate-400" />
              </div>
            </div>
            <h3 className="font-bold text-slate-700 mb-2 sm:mb-3 text-lg sm:text-xl">성적을 조회해보세요</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed px-4">
              시험 응시 시 입력한 이름과 휴대폰번호 뒷4자리를 입력하면
              응시한 모든 시험 결과를 확인할 수 있습니다.
            </p>
            
            {/* Decorative Elements */}
            <div className="flex items-center justify-center gap-2 mt-6 sm:mt-8">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-slate-200" />
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-slate-300" />
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-slate-200" />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative text-center py-6 sm:py-10">
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-3">
          <div className="w-8 sm:w-12 h-px bg-gradient-to-r from-transparent to-slate-300" />
          <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-slate-300" />
          <div className="w-8 sm:w-12 h-px bg-gradient-to-l from-transparent to-slate-300" />
        </div>
        <p className="text-[10px] sm:text-xs text-slate-400 font-medium tracking-wide">
          © BRAINIAC ENGLISH. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default MyReport;
