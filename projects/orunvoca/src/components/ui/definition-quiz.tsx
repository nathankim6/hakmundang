import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle, XCircle, RefreshCw, Volume2, RotateCcw } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { supabase } from '@/integrations/supabase/client';
import { playCorrectSound, playIncorrectSound, initializeAudioContext } from '@/utils/sound-effects';
import { toast } from 'sonner';
import { isAdminUser } from '@/utils/admin-check';
import { showAnswerToast } from '@/utils/answer-toast';

// 선지 표시용 정리 함수 - 괄호 내용 제거 (답을 유추하는 힌트가 될 수 있음)
const cleanChoiceForDisplay = (text: string): string => {
  if (!text || text.trim().length === 0) return text;
  
  let cleaned = text.trim();
  
  // 1. 품사 마커 제거 [명], [동], [형], [부]
  cleaned = cleaned.replace(/\[([명동형부])\]\s*/g, '');
  cleaned = cleaned.replace(/\s*\[([명동형부])\]\s*/g, ' ');
  
  // 2. 소괄호와 그 내용 제거 (예: "(상품의) 소매점" -> "소매점")
  cleaned = cleaned.replace(/\([^)]*\)/g, '');
  
  // 3. 대괄호와 그 내용 제거 (예: "신입 사원[회원]" -> "신입 사원")
  cleaned = cleaned.replace(/\[[^\]]*\]/g, '');
  
  // 4. 연속된 공백 정리 및 앞뒤 공백 제거
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  return cleaned;
};

interface DefinitionQuizProps {
  word: string;
  meaning: string;
  onAnswer: (isCorrect: boolean) => void;
  showResult?: boolean;
  isCorrect?: boolean;
  currentQuestion?: number;
  totalQuestions?: number;
  englishDefinition?: string;
}
export function DefinitionQuiz({
  word,
  meaning,
  onAnswer,
  showResult = false,
  isCorrect = false,
  currentQuestion = 1,
  totalQuestions = 1,
  englishDefinition: csvDefinition
}: DefinitionQuizProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [definition, setDefinition] = useState<string>('');
  const [choices, setChoices] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [hasAnswered, setHasAnswered] = useState(false);
  const [showResultState, setShowResultState] = useState(false);
  const [isCorrectState, setIsCorrectState] = useState(false);
  const [correctChoice, setCorrectChoice] = useState<string>('');

  // 영영사전 정의와 선택지를 가져오는 함수
  const fetchDefinitionAndChoices = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Checking cache for word:', word, 'meaning:', meaning);

      // 0. CSV에서 영영정의가 제공된 경우 우선 사용
      if (csvDefinition && csvDefinition.trim()) {
        console.log('Using CSV english definition for word:', word);
        setDefinition(csvDefinition.trim());

        // 캐시에서 오답 선지 확인
        const { data: cachedData } = await supabase.from('word_quiz_cache').select('*').eq('word', word.toLowerCase()).eq('meaning', meaning).maybeSingle();
        if (cachedData && cachedData.wrong_choices) {
          const isEnglishChoices = cachedData.wrong_choices.every((choice: string) => /^[a-zA-Z\s-]+$/.test(choice) && choice.length > 1);
          if (isEnglishChoices) {
            setupChoices([word, ...cachedData.wrong_choices]);
            return;
          }
        }

        // 캐시에 오답이 없으면 AI로 오답만 생성
        const partOfSpeech = extractPartOfSpeech(meaning);
        const { data: choicesData, error: choicesError } = await supabase.functions.invoke('generate-english-wrong-choices', {
          body: {
            correctWord: word.toLowerCase(),
            englishDefinition: csvDefinition.trim(),
            partOfSpeech: partOfSpeech,
            numberOfChoices: 4
          }
        });
        let wrongChoices: string[];
        if (choicesError) {
          wrongChoices = generateFallbackChoices(word, partOfSpeech);
        } else {
          wrongChoices = choicesData?.wrongChoices || generateFallbackChoices(word, partOfSpeech);
        }

        // 캐시에 저장
        try {
          await supabase.from('word_quiz_cache').upsert({
            word: word.toLowerCase(),
            meaning,
            english_definition: csvDefinition.trim(),
            part_of_speech: partOfSpeech,
            wrong_choices: wrongChoices
          }, { onConflict: 'word,meaning,quiz_type' });
        } catch (e) { console.error('Cache upsert error:', e); }

        setupChoices([word, ...wrongChoices]);
        return;
      }

      // 1. 먼저 캐시에서 데이터 확인
      const {
        data: cachedData,
        error: cacheError
      } = await supabase.from('word_quiz_cache').select('*').eq('word', word.toLowerCase()).eq('meaning', meaning).maybeSingle();
      if (cacheError) {
        console.error('Cache query error:', cacheError);
      }
      if (cachedData) {
        console.log('Using cached data for word:', word);
        const isEnglishChoices = cachedData.wrong_choices.every((choice: string) => /^[a-zA-Z\s-]+$/.test(choice) && choice.length > 1);
        if (isEnglishChoices) {
          setDefinition(cachedData.english_definition);
          const allChoices = [word, ...cachedData.wrong_choices];
          setupChoices(allChoices);
          return;
        } else {
          console.log('Cached data contains non-English choices, regenerating...');
        }
      }
      console.log('No cached data found, generating new quiz data...');

      // 2. 영영사전 정의 가져오기
      const {
        data: defData,
        error: defError
      } = await supabase.functions.invoke('generate-english-definition', {
        body: {
          word: word.toLowerCase()
        }
      });
      if (defError) throw defError;
      const englishDefinition = defData?.definition || `A word that means: ${meaning}`;
      setDefinition(englishDefinition);

      // 3. 품사 추출 (간단한 휴리스틱 사용)
      const partOfSpeech = extractPartOfSpeech(meaning);

      // 4. GPT를 통해 CEFR B1~C1 수준의 영어 오답 선택지 생성
      const {
        data: choicesData,
        error: choicesError
      } = await supabase.functions.invoke('generate-english-wrong-choices', {
        body: {
          correctWord: word.toLowerCase(),
          englishDefinition: englishDefinition,
          partOfSpeech: partOfSpeech,
          numberOfChoices: 4
        }
      });
      let wrongChoices: string[];
      if (choicesError) {
        console.error('Error generating English choices:', choicesError);
        // Fallback CEFR B1~C1 영어 오답들
        wrongChoices = generateFallbackChoices(word, partOfSpeech);
      } else {
        wrongChoices = choicesData?.wrongChoices || generateFallbackChoices(word, partOfSpeech);
      }

      // 5. 캐시에 저장 (향후 사용을 위해)
      try {
        const {
          error: insertError
        } = await supabase.from('word_quiz_cache').insert({
          word: word.toLowerCase(),
          meaning,
          english_definition: englishDefinition,
          part_of_speech: partOfSpeech,
          wrong_choices: wrongChoices
        });
        if (insertError) {
          console.error('Failed to cache quiz data:', insertError);
          // 계속 진행 (최적화용이므로)
        } else {
          console.log('Quiz data cached successfully');
        }
      } catch (cacheInsertError) {
        console.error('Cache insert error:', cacheInsertError);
        // 계속 진행
      }
      setupChoices([word, ...wrongChoices]);
    } catch (err) {
      console.error('Error fetching definition and choices:', err);
      setError('문제를 생성하는 중 오류가 발생했습니다.');
      // 최소한의 fallback (영어 단어 선택지)
      setDefinition(`A word that means: ${meaning}`);
      setupChoices([word, "option", "choice", "answer", "word"]);
    } finally {
      setLoading(false);
    }
  };

  // 품사 추출 함수 (간단한 휴리스틱)
  const extractPartOfSpeech = (meaning: string): string => {
    if (meaning.includes('하다') || meaning.includes('되다') || meaning.includes('시키다')) {
      return '동사';
    } else if (meaning.includes('의') || meaning.includes('것') || meaning.includes('사람') || meaning.includes('물건')) {
      return '명사';
    } else if (meaning.includes('한') || meaning.includes('적인') || meaning.includes('스러운')) {
      return '형용사';
    } else {
      return '명사'; // 기본값
    }
  };

  // Fallback 영어 오답 생성 (CEFR B1~C1 수준, 품사별로 구분)
  const generateFallbackChoices = (correctWord: string, partOfSpeech: string): string[] => {
    const fallbacks = {
      '동사': ['establish', 'implement', 'analyze', 'evaluate', 'constitute', 'demonstrate', 'investigate', 'incorporate', 'eliminate', 'enhance', 'achieve', 'maintain', 'acquire', 'perceive', 'contribute', 'facilitate', 'undertake', 'comprehend', 'regulate', 'manipulate', 'distribute', 'accumulate', 'advocate', 'anticipate', 'compensate', 'coordinate', 'derive', 'differentiate', 'emphasize', 'exploit', 'formulate', 'generate', 'illustrate', 'initiate', 'interpret', 'participate', 'predominate', 'substitute', 'transform', 'utilize'],
      '명사': ['concept', 'procedure', 'authority', 'significance', 'component', 'principle', 'institution', 'phenomenon', 'perspective', 'framework', 'strategy', 'mechanism', 'criteria', 'hypothesis', 'paradigm', 'synthesis', 'dimension', 'capacity', 'infrastructure', 'methodology', 'administrator', 'circumstance', 'consequence', 'environment', 'foundation', 'illustration', 'maintenance', 'orientation', 'proportion', 'regulation', 'structure', 'technique', 'variable', 'alternative', 'circumstance', 'distribution', 'evaluation', 'interpretation', 'legislation', 'participation', 'requirement', 'transformation'],
      '형용사': ['significant', 'fundamental', 'comprehensive', 'sophisticated', 'contemporary', 'substantial', 'arbitrary', 'inevitable', 'adequate', 'relevant', 'crucial', 'explicit', 'inherent', 'coherent', 'empirical', 'intensive', 'beneficial', 'consistent', 'apparent', 'appropriate', 'compatible', 'consecutive', 'dominant', 'equivalent', 'finite', 'flexible', 'identical', 'intermediate', 'marginal', 'minimal', 'nuclear', 'overseas', 'parallel', 'precise', 'primary', 'random', 'rational', 'subsequent', 'sufficient', 'underlying'],
      '부사': ['primarily', 'consequently', 'furthermore', 'nevertheless', 'specifically', 'ultimately', 'considerably', 'presumably', 'precisely', 'subsequently', 'approximately', 'essentially', 'predominantly', 'respectively', 'accordingly', 'adequately', 'simultaneously', 'explicitly', 'automatically', 'economically', 'fundamentally', 'individually', 'initially', 'internally', 'automatically', 'definitely', 'eventually', 'literally', 'normally', 'obviously', 'potentially', 'previously', 'significantly', 'theoretically']
    };

    // 품사 매핑 개선
    let posKey = '명사'; // 기본값
    if (partOfSpeech.includes('동사') || partOfSpeech.includes('verb')) posKey = '동사';else if (partOfSpeech.includes('형용사') || partOfSpeech.includes('adjective')) posKey = '형용사';else if (partOfSpeech.includes('부사') || partOfSpeech.includes('adverb')) posKey = '부사';
    const wordPool = fallbacks[posKey as keyof typeof fallbacks];
    // 정답 단어와 다른 4개의 단어를 선택
    const filtered = wordPool.filter(word => word.toLowerCase() !== correctWord.toLowerCase());

    // 무작위로 섞어서 4개 선택
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 4);
  };

  // 선택지 설정 및 섞기
  const setupChoices = (allChoices: string[]) => {
    // 5개 선택지로 맞추기 (정답 1개 + 오답 4개)
    const finalChoices = allChoices.slice(0, 5);

    // 정답 저장 (영어 단어)
    setCorrectChoice(word);

    // 선택지 무작위 섞기
    const shuffled = [...finalChoices].sort(() => Math.random() - 0.5);
    setChoices(shuffled);
  };

  // 새로운 문제가 시작될 때마다 상태 리셋
  useEffect(() => {
    if (word) {
      setSelectedAnswer('');
      setHasAnswered(false);
      setShowResultState(false);
      setIsCorrectState(false);
      setChoices([]);
      setCorrectChoice('');
      fetchDefinitionAndChoices();
    }
  }, [word]);
  useEffect(() => {
    if (showResult) {
      setHasAnswered(true);
    }
  }, [showResult]);

  // 첫 번째 사용자 상호작용 시 오디오 컨텍스트 초기화
  useEffect(() => {
    const initAudio = () => {
      initializeAudioContext();
      document.removeEventListener('click', initAudio);
      document.removeEventListener('touchstart', initAudio);
    };
    document.addEventListener('click', initAudio);
    document.addEventListener('touchstart', initAudio);
    return () => {
      document.removeEventListener('click', initAudio);
      document.removeEventListener('touchstart', initAudio);
    };
  }, []);
  const handleChoiceSelect = (choice: string) => {
    if (hasAnswered) return;
    setSelectedAnswer(choice);
    setHasAnswered(true);
    setShowResultState(true);
    const isAnswerCorrect = choice === correctChoice;
    setIsCorrectState(isAnswerCorrect);
    showAnswerToast(isAnswerCorrect, correctChoice);

    // 효과음 재생
    if (isAnswerCorrect) {
      playCorrectSound();
      // 맞췄으면 1.5초 후 자동으로 다음 문제로
      setTimeout(() => {
        onAnswer(isAnswerCorrect);
      }, 1500);
    } else {
      playIncorrectSound();
    }
  };

  // 틀렸을 때 다음 문제로 이동하는 함수
  const handleNextQuestion = () => {
    onAnswer(false);
  };
  const handleRetry = () => {
    fetchDefinitionAndChoices();
  };

  // 재출제 함수 - 캐시를 무시하고 새로운 문제 생성
  const handleRegenerate = async () => {
    try {
      setLoading(true);
      setError('');
      setSelectedAnswer('');
      setHasAnswered(false);
      setShowResultState(false);
      setIsCorrectState(false);
      setChoices([]);
      setCorrectChoice('');
      console.log('Regenerating quiz for word:', word, 'meaning:', meaning);

      // 1. 먼저 기존 캐시 삭제
      await supabase.from('word_quiz_cache').delete().eq('word', word.toLowerCase()).eq('meaning', meaning);

      // 2. 영영사전 정의 가져오기
      const {
        data: defData,
        error: defError
      } = await supabase.functions.invoke('generate-english-definition', {
        body: {
          word: word.toLowerCase()
        }
      });
      if (defError) throw defError;
      const englishDefinition = defData?.definition || `A word that means: ${meaning}`;
      setDefinition(englishDefinition);

      // 3. 품사 추출
      const partOfSpeech = extractPartOfSpeech(meaning);

      // 4. GPT를 통해 새로운 영어 오답 선택지 생성
      const {
        data: choicesData,
        error: choicesError
      } = await supabase.functions.invoke('generate-english-wrong-choices', {
        body: {
          correctWord: word.toLowerCase(),
          englishDefinition: englishDefinition,
          partOfSpeech: partOfSpeech,
          numberOfChoices: 4
        }
      });
      let wrongChoices: string[];
      if (choicesError) {
        console.error('Error generating English choices:', choicesError);
        wrongChoices = generateFallbackChoices(word, partOfSpeech);
      } else {
        wrongChoices = choicesData?.wrongChoices || generateFallbackChoices(word, partOfSpeech);
      }

      // 5. 새로운 데이터를 캐시에 저장
      try {
        const {
          error: insertError
        } = await supabase.from('word_quiz_cache').insert({
          word: word.toLowerCase(),
          meaning,
          english_definition: englishDefinition,
          part_of_speech: partOfSpeech,
          wrong_choices: wrongChoices
        });
        if (insertError) {
          console.error('Failed to cache regenerated quiz data:', insertError);
        } else {
          console.log('Regenerated quiz data cached successfully');
        }
      } catch (cacheInsertError) {
        console.error('Cache insert error for regenerated data:', cacheInsertError);
      }
      setupChoices([word, ...wrongChoices]);
    } catch (err) {
      console.error('Error regenerating quiz:', err);
      setError('문제를 재출제하는 중 오류가 발생했습니다.');
      setDefinition(`A word that means: ${meaning}`);
      setupChoices([word, "option", "choice", "answer", "word"]);
    } finally {
      setLoading(false);
    }
  };

  // 음성 재생 함수
  const playAudio = () => {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    speechSynthesis.speak(utterance);
  };


  if (loading) {
    return <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8">
          <LoadingSpinner message={csvDefinition ? "선지를 준비하고 있습니다..." : "영영사전 정의를 생성하고 있습니다..."} size="md" />
        </CardContent>
      </Card>;
  }
  return <div className="w-full max-w-sm mx-auto space-y-3 pb-4">
      {/* Editorial card */}
      <div className="editorial-card p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="editorial-eyebrow">Definition</span>
          <div className="flex items-center gap-1.5">
            <span className="editorial-qbadge">{currentQuestion} / {totalQuestions}</span>
            {isAdminUser() && (
              <Button variant="ghost" size="sm" onClick={() => handleRegenerate()} className="h-6 px-2 rounded-full bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900 text-[10.5px]">
                <RefreshCw className="w-3 h-3 mr-1" /> 재출제
              </Button>
            )}
          </div>
        </div>

        <div className="editorial-rule" />

        {error && <div className="flex items-center justify-center gap-2 p-2 rounded-xl bg-amber-50 border border-amber-200">
            <span className="text-[11px] text-amber-800">{error}</span>
            <Button variant="ghost" size="sm" onClick={handleRetry} className="h-5 px-1">
              <RefreshCw className="w-3 h-3" />
            </Button>
          </div>}

        {/* Definition prompt */}
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
          <div className="editorial-eyebrow mb-2">Meaning</div>
          <p className="text-[14.5px] leading-relaxed text-neutral-800 font-serif" style={{ fontFamily: "'Instrument Serif', ui-serif, Georgia, serif", fontSize: '17px', lineHeight: '1.45' }}>
            {definition}
          </p>
        </div>

        {/* Choices */}
        <div className="space-y-2">
          {choices.map((choice, index) => {
            const isSelected = selectedAnswer === choice;
            const isCorrect = choice === correctChoice;
            const showCorrect = hasAnswered && showResultState && isCorrect;
            const showIncorrect = hasAnswered && showResultState && isSelected && !isCorrect;
            return <button key={index} onClick={() => handleChoiceSelect(choice)} disabled={hasAnswered}
              className={`w-full p-3 text-left rounded-2xl border transition-all duration-200 active:scale-[0.99] ${
                showCorrect ? 'bg-amber-50 border-amber-300 shadow-[0_4px_14px_-4px_rgba(245,158,11,0.35)]'
                : showIncorrect ? 'bg-neutral-100 border-neutral-400'
                : isSelected ? 'bg-neutral-50 border-neutral-400'
                : 'bg-white border-neutral-200 hover:border-neutral-400'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11.5px] font-semibold flex-shrink-0 ${
                    showCorrect ? 'bg-amber-500 text-white'
                    : showIncorrect ? 'bg-neutral-900 text-white'
                    : isSelected ? 'bg-neutral-950 text-white'
                    : 'bg-neutral-100 text-neutral-500 border border-neutral-200'}`}>
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className={`flex-1 text-[14px] font-medium tracking-tight ${
                    showCorrect ? 'text-amber-900'
                    : showIncorrect ? 'text-neutral-900'
                    : 'text-neutral-800'}`}>
                    {cleanChoiceForDisplay(choice)}
                  </span>
                  {showCorrect && <CheckCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />}
                  {showIncorrect && <XCircle className="w-4 h-4 text-neutral-700 flex-shrink-0" />}
                </div>
              </button>;
          })}
        </div>
      </div>


      {/* Result Modal - Mobile Optimized */}
      <Dialog open={hasAnswered && showResultState} onOpenChange={() => {}}>
        <DialogContent className="w-[95vw] max-w-lg mx-auto max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-3xl animate-scale-in">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex flex-col items-center gap-4 text-center">
              {/* Status Icon */}
              <div className={`p-4 rounded-full animate-scale-in ${isCorrectState ? 'bg-amber-100' : 'bg-neutral-100'}`}>
                {isCorrectState ? (
                  <CheckCircle className="w-10 h-10 text-amber-600" />
                ) : (
                  <XCircle className="w-10 h-10 text-neutral-500" />
                )}
              </div>
              
              {/* Status Text */}
              <div className="space-y-1">
                <span className={`text-3xl font-semibold tracking-tight ${isCorrectState ? 'text-amber-700' : 'text-neutral-800'}`}>
                  {isCorrectState ? 'Correct!' : 'Incorrect!'}
                </span>
                <div className="text-sm text-muted-foreground">
                  {isCorrectState ? '정답입니다! 🎉' : '다시 한번 시도해보세요'}
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Answer Cards */}
            <div className="space-y-3">
              {/* Correct Answer Card */}
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 rounded-2xl p-4 border border-primary/20">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-xs font-bold text-primary tracking-wider uppercase">Correct Answer</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-2xl font-black text-primary flex-1">{word}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={playAudio} 
                    className="h-12 w-12 p-0 rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/30 transition-all hover:scale-105"
                  >
                    <Volume2 className="w-5 h-5 text-primary" />
                  </Button>
                </div>
              </div>
              
              {/* Korean Meaning Card */}
              <div className="bg-muted/50 rounded-2xl p-4 border">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                  <span className="text-xs font-bold text-muted-foreground tracking-wider uppercase">Korean Meaning</span>
                </div>
                <div className="text-lg font-semibold text-foreground">{meaning}</div>
              </div>
            </div>


            {/* Action Buttons for Incorrect Answers */}
            {!isCorrectState && (
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button 
                  onClick={handleNextQuestion} 
                  className="flex-1 h-12 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-700 hover:from-amber-600 hover:to-yellow-800 text-white font-semibold rounded-xl shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl"
                >
                  Next Question
                </Button>
                <Button 
                  onClick={() => window.location.href = '/'} 
                  variant="outline" 
                  className="flex-1 editorial-btn-ghost"
                >
                  시험중단
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>;
}