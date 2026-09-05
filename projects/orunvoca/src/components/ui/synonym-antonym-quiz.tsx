import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from './button';
import { Check, X, Volume2, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { playCorrectSound, playIncorrectSound, initializeAudioContext } from '@/utils/sound-effects';
import { isIOS, playBase64AudioWebAudio } from '@/utils/audio';
import orunPenguinLogo from '@/assets/orun-penguin-logo.png';
import { showAnswerToast } from '@/utils/answer-toast';

interface SynonymAntonymQuizProps {
  word: string;
  meaning: string;
  synonyms?: Array<{ word: string; meaning: string }>;
  antonyms?: Array<{ word: string; meaning: string }>;
  onAnswer: (isCorrect: boolean) => void;
  onSkipPrevious?: () => void;
  onSkipNext?: () => void;
  className?: string;
  isLastQuestion?: boolean;
  currentQuestion?: number;
  totalQuestions?: number;
}

interface ChoiceItem {
  word: string;
  meaning: string;
  type: 'synonym' | 'antonym' | 'unrelated';
}

// 배열 셔플 함수
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export function SynonymAntonymQuiz({
  word,
  meaning,
  synonyms = [],
  antonyms = [],
  onAnswer,
  onSkipPrevious,
  onSkipNext,
  className = '',
  isLastQuestion = false,
  currentQuestion = 1,
  totalQuestions = 1
}: SynonymAntonymQuizProps) {
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingUnrelated, setIsLoadingUnrelated] = useState(true);
  const [unrelatedWord, setUnrelatedWord] = useState<{ word: string; meaning: string } | null>(null);
  const [choices, setChoices] = useState<ChoiceItem[]>([]);
  const { toast } = useToast();

  // 안전하게 단어와 의미 추출하는 헬퍼 함수
  const safeGetWordData = (item: { word?: string; meaning?: string } | string | undefined | null): { word: string; meaning: string } => {
    if (!item) return { word: '', meaning: '' };
    if (typeof item === 'string') return { word: item, meaning: '' };
    return { word: item.word || '', meaning: item.meaning || '' };
  };

  // 캐시에서 로드하거나 GPT로 생성
  useEffect(() => {
    const loadOrGenerateUnrelatedWord = async () => {
      if (!word) return;
      
      setIsLoadingUnrelated(true);
      
      try {
        // 1. 캐시에서 먼저 확인 - word와 quiz_type만으로 조회
        const { data: cachedData, error: cacheError } = await supabase
          .from('word_quiz_cache')
          .select('choices')
          .eq('word', word.toLowerCase())
          .eq('quiz_type', 'synonym_antonym')
          .maybeSingle();

        // 캐시된 데이터가 있고, choices가 유효한 객체인지 확인
        if (!cacheError && cachedData?.choices && typeof cachedData.choices === 'object' && 'word' in cachedData.choices) {
          // 캐시된 데이터가 있으면 바로 사용
          const cached = cachedData.choices as { word: string; meaning: string };
          console.log('Loaded from cache:', cached);
          setUnrelatedWord(cached);
          setIsLoadingUnrelated(false);
          return;
        }

        // 2. 캐시에 없으면 GPT로 생성
        try {
          const { data, error } = await supabase.functions.invoke('generate-unrelated-word', {
            body: { 
              word: word || '',
              meaning: meaning || '',
              synonyms: synonyms || [],
              antonyms: antonyms || []
            }
          });

          // 에러가 있거나 data.error가 있으면 fallback 사용
          if (error || data?.error || !data?.word) {
            console.error('Failed to generate unrelated word:', error || data?.error);
            setUnrelatedWord({ word: 'tangible', meaning: '만질 수 있는' });
          } else {
            const newUnrelatedWord = { word: data.word, meaning: data.meaning || '' };
            setUnrelatedWord(newUnrelatedWord);
            console.log('Generated new unrelated word:', newUnrelatedWord);
            
            // 3. 생성된 데이터를 캐시에 저장 - meaning은 빈 문자열로 고정하여 word+quiz_type으로 조회 가능하게
            const { error: saveError } = await supabase.from('word_quiz_cache').upsert({
              word: word.toLowerCase(),
              meaning: '',  // synonym_antonym은 word만으로 캐시 식별
              english_definition: meaning || '',
              part_of_speech: '',
              wrong_choices: [],
              choices: newUnrelatedWord as unknown as import('@/integrations/supabase/types').Json,
              quiz_type: 'synonym_antonym'
            }, {
              onConflict: 'word,meaning,quiz_type'
            });
            
            if (saveError) {
              console.error('Failed to save to cache:', saveError);
            } else {
              console.log('Saved to cache successfully');
            }
          }
        } catch (funcError) {
          console.error('Edge function error:', funcError);
          setUnrelatedWord({ word: 'tangible', meaning: '만질 수 있는' });
        }
      } catch (err) {
        console.error('Error loading/generating unrelated word:', err);
        setUnrelatedWord({ word: 'tangible', meaning: '만질 수 있는' });
      } finally {
        setIsLoadingUnrelated(false);
      }
    };

    loadOrGenerateUnrelatedWord();
  }, [word, meaning, synonyms, antonyms]);

  // 선택지 생성: 동의어 3개 + 반의어 3개 + 관련없는 단어 1개 = 7개
  useEffect(() => {
    if (!unrelatedWord) return;

    const validSynonyms = (synonyms || []).filter(s => safeGetWordData(s).word).slice(0, 3);
    const validAntonyms = (antonyms || []).filter(a => safeGetWordData(a).word).slice(0, 3);
    
    const synonymChoices: ChoiceItem[] = validSynonyms.map(s => {
      const data = safeGetWordData(s);
      return { word: data.word, meaning: data.meaning, type: 'synonym' as const };
    });
    
    const antonymChoices: ChoiceItem[] = validAntonyms.map(a => {
      const data = safeGetWordData(a);
      return { word: data.word, meaning: data.meaning, type: 'antonym' as const };
    });
    
    const unrelatedChoice: ChoiceItem = { 
      word: unrelatedWord.word, 
      meaning: unrelatedWord.meaning, 
      type: 'unrelated' as const 
    };
    
    const allChoices = [...synonymChoices, ...antonymChoices, unrelatedChoice];
    setChoices(shuffleArray(allChoices));
  }, [synonyms, antonyms, unrelatedWord]);

  // 정답 (관련없는 단어)
  const correctAnswer = unrelatedWord?.word || '';

  // TTS 재생
  const playTTS = async (text: string) => {
    if (isPlaying) return;
    setIsPlaying(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text, accent: 'us' }
      });
      
      if (error) throw error;
      
      if (data?.audioContent) {
        if (isIOS) {
          await playBase64AudioWebAudio(data.audioContent);
        } else {
          const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
          await audio.play();
        }
      }
    } catch (err) {
      console.error('TTS error:', err);
    } finally {
      setIsPlaying(false);
    }
  };

  // 선택지 클릭 핸들러
  const handleChoiceClick = async (choiceWord: string) => {
    if (isAnswered) return;
    
    await initializeAudioContext();
    
    setSelectedChoice(choiceWord);
    setIsAnswered(true);
    
    const correct = choiceWord.toLowerCase() === correctAnswer.toLowerCase();
    setIsCorrect(correct);
    showAnswerToast(correct, correctAnswer);
    
    if (correct) {
      playCorrectSound();
    } else {
      playIncorrectSound();
    }
  };

  // 다음 문제로 이동
  const handleNext = () => {
    onAnswer(isCorrect);
  };

  // 문제 초기화
  useEffect(() => {
    setSelectedChoice(null);
    setIsAnswered(false);
    setIsCorrect(false);
  }, [word, currentQuestion]);

  // 동의어/반의어가 부족한 경우 경고
  const hasSufficientData = synonyms.length > 0 || antonyms.length > 0;

  const progressPercent = (currentQuestion / totalQuestions) * 100;

  return (
    <div className={`editorial-card w-full h-[calc(100vh-120px)] flex flex-col overflow-hidden ${className}`}>
      {/* 프리미엄 헤더 - 컴팩트 */}
      <div className="relative flex-shrink-0 bg-gradient-to-br from-stone-900 via-stone-800 to-amber-950 text-white px-3 py-3 sm:px-4 sm:py-4 overflow-hidden">
        {/* 배경 장식 */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/15 via-transparent to-transparent" />
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/25 to-transparent rounded-full blur-2xl" />
        
        <div className="relative z-10">
          {/* 진행률 바 */}
          <div className="mb-2">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm shadow-lg shadow-amber-500/40 overflow-hidden">
                  <img src={orunPenguinLogo} alt="ORUN" className="w-6 h-6 object-contain" />
                </div>
                <span className="text-[10px] font-medium text-white/70 uppercase tracking-wider">동/반의어 찾기</span>
              </div>
              <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm px-2 py-0.5 rounded-full">
                <span className="text-sm font-bold text-white">{currentQuestion}</span>
                <span className="text-white/50 text-xs">/</span>
                <span className="text-xs text-white/70">{totalQuestions}</span>
              </div>
            </div>
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-200 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* 표제어 - 컴팩트 */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight bg-gradient-to-r from-white via-white to-amber-100 bg-clip-text text-transparent drop-shadow-lg">
                {word}
              </h2>
              <button
                onClick={() => playTTS(word)}
                disabled={isPlaying}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-all duration-200 hover:scale-110 active:scale-95"
              >
                <Volume2 className={`w-4 h-4 ${isPlaying ? 'text-amber-200 animate-pulse' : 'text-white/80'}`} />
              </button>
            </div>
            <p className="text-sm text-white/70 font-medium mt-0.5">{meaning}</p>
          </div>
        </div>
      </div>

      {/* 질문 안내 - 인라인 컴팩트 */}
      <div className="flex-shrink-0 bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 border-b border-amber-200/80 px-3 py-2">
        <div className="flex items-center justify-center gap-2">
          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm">
            <span className="text-white text-[10px] font-bold">?</span>
          </div>
          <p className="text-xs font-bold text-amber-900">관련 없는 단어를 찾으세요</p>
          <p className="text-[10px] text-amber-600/80">(동의어, 반의어가 아닌 단어)</p>
        </div>
      </div>

      {/* 메인 콘텐츠 영역 - 스크롤 없이 꽉 채움 */}
      <div className="flex-1 flex flex-col px-3 py-2 bg-gradient-to-b from-[#faf8f3] to-[#fdfcf7] overflow-hidden">
        {/* 로딩 중 */}
        {isLoadingUnrelated && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-amber-200 border-t-amber-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <img src={orunPenguinLogo} alt="Loading" className="w-8 h-8 object-contain" />
              </div>
            </div>
            <p className="text-sm text-slate-500 font-medium">문제 생성 중...</p>
          </div>
        )}

        {/* 선택지가 부족할 경우 경고 */}
        {!isLoadingUnrelated && !hasSufficientData && (
          <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl p-6 text-center shadow-sm">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-100 flex items-center justify-center">
              <X className="w-6 h-6 text-red-500" />
            </div>
            <p className="text-sm font-medium text-red-700">
              이 단어에는 동의어/반의어 데이터가 없습니다.
            </p>
          </div>
        )}

        {/* 선택지 그리드 - 컴팩트 */}
        {!isLoadingUnrelated && hasSufficientData && (
          <div className="flex-1 flex flex-col gap-1.5 overflow-hidden">
            {choices.map((choice, index) => {
              const isSelected = selectedChoice === choice.word;
              const isCorrectAnswer = choice.type === 'unrelated';
              const showCorrect = isAnswered && isCorrectAnswer;
              const showIncorrect = isAnswered && isSelected && !isCorrectAnswer;
              
              return (
                <button
                  key={`${choice.word}-${index}`}
                  onClick={() => handleChoiceClick(choice.word)}
                  disabled={isAnswered}
                  className={`
                    relative px-3 py-1.5 rounded-lg text-left transition-all duration-200 flex-shrink-0
                    ${!isAnswered ? 'hover:scale-[1.01] hover:shadow-md active:scale-[0.99] cursor-pointer' : 'cursor-default'}
                    ${isSelected && !isAnswered ? 'ring-2 ring-amber-400 bg-amber-50 shadow-md' : ''}
                    ${showCorrect ? 'bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-400 shadow-md' : ''}
                    ${showIncorrect ? 'bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-400 shadow-md' : ''}
                    ${!isAnswered && !isSelected ? 'bg-white border border-amber-200/70 shadow-sm hover:border-amber-400' : ''}
                    ${isAnswered && !showCorrect && !showIncorrect ? 'bg-slate-50 border border-slate-200/60 opacity-40' : ''}
                  `}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                      showCorrect ? 'bg-emerald-500 text-white' :
                      showIncorrect ? 'bg-red-500 text-white' :
                      'bg-slate-600 text-white'
                    }`}>
                      {index + 1}
                    </span>
                    <span className={`text-sm font-bold ${
                      showCorrect ? 'text-emerald-700' : 
                      showIncorrect ? 'text-red-700' : 
                      'text-slate-800'
                    }`}>
                      {choice.word}
                    </span>
                    {isAnswered && choice.meaning && (
                      <span className="text-xs text-slate-500 ml-1">({choice.meaning})</span>
                    )}
                    {isAnswered && (
                      <span className={`ml-auto px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                        choice.type === 'synonym' ? 'bg-amber-100 text-amber-800' : 
                        choice.type === 'antonym' ? 'bg-orange-100 text-orange-700' : 
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {choice.type === 'synonym' && '동의어'}
                        {choice.type === 'antonym' && '반의어'}
                        {choice.type === 'unrelated' && '정답'}
                      </span>
                    )}
                    {showCorrect && <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
                    {showIncorrect && <X className="w-4 h-4 text-red-500 flex-shrink-0" />}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* 정답/오답 결과 및 다음 버튼 - 컴팩트 */}
        {isAnswered && (
          <div className="mt-2 flex-shrink-0 animate-in fade-in duration-200">
            <div className={`rounded-xl px-3 py-2 flex items-center justify-between ${
              isCorrect 
                ? 'bg-gradient-to-r from-emerald-500 to-green-500' 
                : 'bg-gradient-to-r from-slate-700 to-slate-800'
            }`}>
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                  isCorrect ? 'bg-white/20' : 'bg-white/10'
                }`}>
                  {isCorrect ? <Check className="w-4 h-4 text-white" /> : <X className="w-4 h-4 text-white" />}
                </div>
                <span className="text-sm font-bold text-white">
                  {isCorrect ? '정답!' : '오답'}
                </span>
              </div>
              
              <Button
                onClick={handleNext}
                size="sm"
                className={`h-8 px-4 text-xs font-bold rounded-lg transition-all ${
                  isCorrect 
                    ? 'bg-amber-100 hover:bg-amber-200 text-slate-900 border border-amber-300' 
                    : 'bg-red-100 hover:bg-red-200 text-slate-900 border border-red-200'
                }`}
              >
                {isLastQuestion ? '결과 보기' : '다음 →'}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 하단 네비게이션 - 컴팩트 */}
      <div className="flex-shrink-0 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 px-3 py-2">
        <div className="flex items-center justify-between">
          <button
            onClick={onSkipPrevious}
            disabled={!onSkipPrevious}
            className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
              onSkipPrevious 
                ? 'text-slate-600 hover:text-slate-800 hover:bg-slate-100 active:scale-95' 
                : 'text-slate-300 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            이전
          </button>
          
          <div className="flex items-center gap-1">
            {[...Array(Math.min(5, totalQuestions))].map((_, i) => {
              const dotIndex = Math.max(0, currentQuestion - 3) + i;
              if (dotIndex >= totalQuestions) return null;
              const isCurrent = dotIndex === currentQuestion - 1;
              return (
                <div 
                  key={i}
                  className={`rounded-full transition-all duration-200 ${
                    isCurrent 
                      ? 'w-5 h-1.5 bg-gradient-to-r from-amber-500 to-yellow-500' 
                      : 'w-1.5 h-1.5 bg-slate-300'
                  }`}
                />
              );
            })}
          </div>

          <button
            onClick={onSkipNext}
            disabled={!onSkipNext}
            className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
              onSkipNext 
                ? 'text-slate-600 hover:text-slate-800 hover:bg-slate-100 active:scale-95' 
                : 'text-slate-300 cursor-not-allowed'
            }`}
          >
            다음
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
