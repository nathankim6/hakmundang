import React, { useState, useRef, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useIsMobile } from '@/hooks/use-mobile';
import { Image, ChevronRight, AlertCircle, Check, ArrowRight, HelpCircle, Send, Camera, Upload, X, CropIcon, Loader2, ArrowLeft, Sparkles, Award, Brain, Calculator } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import AnimatedCard from '@/components/AnimatedCard';
import AnimatedButton from '@/components/AnimatedButton';
import AnimatedSection from '@/components/AnimatedSection';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";

type Step = {
  id: number;
  type: 'welcome' | 'options' | 'input' | 'image-upload' | 'grade-prediction' | 'results';
  title: string;
  description?: string;
};

const Index = () => {
  const isMobile = useIsMobile();
  const [currentStepId, setCurrentStepId] = useState(1);
  const [userInput, setUserInput] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [imageUploaded, setImageUploaded] = useState<boolean>(false);
  const [uploadedImageData, setUploadedImageData] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleBack = () => {
    if (currentStepId > 1) {
      setCurrentStepId(prev => prev - 1);
      if (currentStepId === 3) {
        setUserInput('');
      } else if (currentStepId === 4) {
        setImageUploaded(false);
        setUploadedImageData(null);
      }
    }
  };

  const steps: Step[] = [{
    id: 1,
    type: 'welcome',
    title: '안녕하세요!',
    description: '옳은영어 AI 조교 Sophia가 영어 학습을 도와드립니다.'
  }, {
    id: 2,
    type: 'options',
    title: '무엇을 도와드릴까요?',
    description: '원하시는 옵션을 선택해주세요.'
  }, {
    id: 3,
    type: 'input',
    title: '질문을 입력해주세요',
    description: '궁금한 내용을 상세하게 적어주세요.'
  }, {
    id: 4,
    type: 'image-upload',
    title: '이미지 업로드',
    description: '문제 이미지를 업로드하시면 분석해드립니다.'
  }, {
    id: 5,
    type: 'grade-prediction',
    title: '내신등급 예측',
    description: '시험 점수로 내신등급을 예측해드립니다.'
  }, {
    id: 6,
    type: 'results',
    title: '답변 결과'
  }];

  const currentStep = steps.find(step => step.id === currentStepId) || steps[0];

  const handleNext = () => {
    console.log('Next button clicked');
    setCurrentStepId(prev => Math.min(prev + 1, steps.length));
  };

  const handleOptionSelect = (option: string) => {
    console.log('Option selected:', option);
    setSelectedOption(option);
    if (option === '직접 질문하기') {
      setCurrentStepId(3);
    } else if (option === '문제 이미지 분석') {
      setCurrentStepId(4);
    } else if (option === '내신등급 예측') {
      setCurrentStepId(5);
    }
  };

  const handleSubmitInput = () => {
    console.log('Submit input button clicked');
    if (userInput.trim()) {
      setCurrentStepId(6);
    }
  };

  const handleImageUpload = (base64Image: string) => {
    console.log('Image upload processed');
    setImageUploaded(true);
    setUploadedImageData(base64Image);
    localStorage.setItem('uploadedImage', base64Image);
    setTimeout(() => {
      setCurrentStepId(6);
    }, 500);
  };

  const handleStartNewQuestion = () => {
    console.log('Starting new question');
    setCurrentStepId(1);
    setUserInput('');
    setSelectedOption(null);
    setImageUploaded(false);
    setUploadedImageData(null);
  };

  const formatAIResponse = (text: string): React.ReactNode => {
    // 1) 섹션(1.~4.)이 있으면 학생 친화적 아코디언으로 렌더링
    const sectionRegex = /(?:^|\n)([1-4])\.\s*(.+)\n([\s\S]*?)(?=(?:\n[1-4]\.\s)|$)/g;
    const sections: { title: string; body: string }[] = [];
    let match: RegExpExecArray | null;
    const titleMap: Record<string, string> = {
      '1': '📌 핵심 개념',
      '2': '🧪 쉬운 예시',
      '3': '✅ 학습 포인트',
      '4': '🌟 응원 한마디',
    };

    while ((match = sectionRegex.exec(text)) !== null) {
      const num = match[1];
      const body = match[3]?.trim() || '';
      sections.push({ title: titleMap[num] || match[2], body });
    }

    // JSON 강조 표시 유틸
    const escapeHtml = (str: string) => str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    const highlightJsonHtml = (jsonPretty: string) => {
      const escaped = escapeHtml(jsonPretty);
      const colored = escaped
        .replace(/"([^\"]+)"\s*:/g, '<span class="text-oracle-gold">"$1"</span>:')
        .replace(/"(.*?)"/g, '<span class="text-oracle-lightGreen">"$1"</span>')
        .replace(/\b(true|false)\b/g, '<span class="text-oracle-lightBlue">$1</span>')
        .replace(/\b(null)\b/g, '<span class="text-oracle-cream\/60">$1</span>')
        .replace(/(-?\d+(?:\.\d+)?)/g, '<span class="text-oracle-cream">$1</span>');
      return colored.split('\n');
    };

    const renderJsonBlock = (jsonObj: unknown, key: string) => {
      const pretty = JSON.stringify(jsonObj, null, 2);
      const lines = highlightJsonHtml(pretty);
      const handleCopy = () => navigator.clipboard?.writeText(pretty).catch(() => {});
      return (
        <motion.div
          key={key}
          className="relative bg-oracle-navy rounded-lg p-4 border border-oracle-lightBlue/20"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="absolute top-2 right-2 flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="text-[11px] px-2 py-1 rounded-md bg-oracle-lightBlue/10 hover:bg-oracle-lightBlue/20 text-oracle-lightBlue transition-colors"
              aria-label="JSON 복사"
            >
              복사
            </button>
            <div className="flex space-x-1">
              <div className="w-2 h-2 rounded-full bg-oracle-gold"></div>
              <div className="w-2 h-2 rounded-full bg-oracle-green"></div>
              <div className="w-2 h-2 rounded-full bg-oracle-lightBlue"></div>
            </div>
          </div>
          <pre className="font-mono text-sm overflow-x-auto">
            {lines.map((html, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                className="whitespace-pre"
              >
                <span className="text-oracle-gold/50 select-none mr-4">{String(i + 1).padStart(2, '0')}</span>
                <span className="[&>span]:align-middle" dangerouslySetInnerHTML={{ __html: html }} />
              </motion.div>
            ))}
          </pre>
        </motion.div>
      );
    };

    const renderChunk = (chunk: string) => {
      const lines = chunk.split('\n');
      return (
        <div className="space-y-1">
          {lines.map((part, idx) => {
            if (part.startsWith('# ')) {
              return (
                <motion.h3
                  key={`h1-${idx}`}
                  className="text-lg font-bold text-oracle-gold border-b border-oracle-lightGray/20 pb-2 flex items-center gap-2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Sparkles className="h-4 w-4 text-oracle-gold" />
                  <span>{part.substring(2)}</span>
                </motion.h3>
              );
            }
            if (part.startsWith('## ')) {
              return (
                <motion.h4
                  key={`h2-${idx}`}
                  className="text-base font-semibold text-oracle-lightGreen flex items-center gap-2 mt-4"
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="w-1 h-4 bg-oracle-lightGreen rounded-full"></div>
                  {part.substring(3)}
                </motion.h4>
              );
            }
            if (part.startsWith('- ') || part.startsWith('* ')) {
              return (
                <motion.div
                  key={`li-${idx}`}
                  className="flex items-start gap-2 pl-4 group"
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-oracle-green mt-2"></div>
                  <p className="text-sm text-white/80 group-hover:text-white transition-colors flex-1">
                    {part.substring(2)}
                  </p>
                </motion.div>
              );
            }
            // JSON 라인은 교사 설명식 간결 요약으로 변환
            try {
              const jsonObj = JSON.parse(part) as Record<string, any>;
              const entries = Object.entries(jsonObj).slice(0, 6);
              return (
                <motion.ul
                  key={`jsonlist-${idx}`}
                  className="text-sm space-y-1 pl-4 list-disc text-white/85"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {entries.map(([k, v], i2) => (
                    <li key={i2}>
                      <span className="text-oracle-gold">{k}</span>:{" "}
                      {String(typeof v === "object" ? JSON.stringify(v) : v).slice(0, 120)}
                    </li>
                  ))}
                </motion.ul>
              );
            } catch (_) {
              // not json line
            }
            if (part.trim().length > 0) {
              return (
                <motion.p
                  key={`p-${idx}`}
                  className="text-sm leading-relaxed text-white/80"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {part}
                </motion.p>
              );
            }
            return <div key={`sp-${idx}`} className="h-1" />;
          })}
        </div>
      );
    };

    if (sections.length) {
      return (
        <Accordion type="single" collapsible defaultValue={'0'} className="bg-oracle-navy/20 rounded-lg border border-oracle-lightBlue/20">
          {sections.map((sec, idx) => (
            <AccordionItem key={idx} value={String(idx)} className="border-oracle-lightBlue/20">
              <AccordionTrigger className="text-oracle-cream text-sm md:text-base">{sec.title}</AccordionTrigger>
              <AccordionContent className="px-2 pb-3">
                {renderChunk(sec.body)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      );
    }

    // 섹션이 없으면 기본 렌더링
    return renderChunk(text);
  };

  return <div className="min-h-screen flex flex-col bg-toss-background pb-16">
    <Header />
    
    <main className="flex-grow">
      <div className="bg-white border-b border-toss-border/10">
        <div className="w-full">
          <div className="flex space-x-1">
            {steps.map(step => <motion.div key={step.id} className={cn("h-1 rounded-full flex-grow", currentStepId >= step.id ? "bg-toss-blue" : "bg-toss-border")} initial={{
              width: 0
            }} animate={{
              width: "100%"
            }} transition={{
              duration: 0.5,
              ease: "easeInOut"
            }} />)}
          </div>
        </div>
      </div>
      
      <AnimatePresence mode="wait">
        <motion.div key={currentStepId} 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="px-4"
        >
          {currentStepId > 1 && <motion.button onClick={handleBack} className="mb-4 px-4 py-2 text-toss-text hover:text-toss-blue flex items-center gap-2 rounded-lg transition-colors" initial={{
            opacity: 0
          }} animate={{
            opacity: 1
          }} whileHover={{
            scale: 1.02
          }} whileTap={{
            scale: 0.98
          }}>
              <ArrowLeft className="h-4 w-4" />
              <span>이전 단계로</span>
            </motion.button>}
          
          {currentStep.type === 'welcome' && <WelcomeStep onNext={handleNext} />}
          
          {currentStep.type === 'options' && <OptionsStep selectedOption={selectedOption} onOptionSelect={handleOptionSelect} />}
          
          {currentStep.type === 'input' && <InputStep value={userInput} onChange={e => setUserInput(e.target.value)} onSubmit={handleSubmitInput} />}
          
          {currentStep.type === 'image-upload' && <ImageUploadStep isUploaded={imageUploaded} onUpload={handleImageUpload} />}
          
          {currentStep.type === 'grade-prediction' && <GradePredictionStep />}
          
          {currentStep.type === 'results' && <ResultsStep 
            userInput={userInput} 
            hasImage={imageUploaded} 
            uploadedImageData={uploadedImageData}
            formatAIResponse={formatAIResponse}
          />}
        </motion.div>
      </AnimatePresence>
    </main>
    
    <Footer />
  </div>;
};

const WelcomeStep = ({
  onNext
}: {
  onNext: () => void;
}) => <div className="space-y-6">
  <AnimatedCard className="p-5">
    <motion.div className="flex justify-center mb-4" initial={{
      scale: 0.8,
      opacity: 0
    }} animate={{
      scale: 1,
      opacity: 1
    }} transition={{
      type: "spring",
      duration: 0.5,
      delay: 0.2
    }}>
      <div className="w-20 h-20 rounded-full overflow-hidden bg-toss-secondary flex items-center justify-center">
        <img src="/lovable-uploads/86db7b2e-e4c1-4e11-9802-fa40a209b553.png" alt="Sophia" className="w-16 h-16 object-contain animate-bounce-subtle" />
      </div>
    </motion.div>
    <AnimatedSection animation="slideUp" delay={0.4}>
      <h1 className="text-xl font-bold text-center mb-2">안녕하세요!</h1>
      <p className="text-toss-textSecondary text-center mb-4">AI 조교 Sophia가 영어 학습을 도와드립니다.</p>
      <p className="text-toss-textSecondary text-center mb-6 text-xs">학습 중 궁금한 점을 물어보세요. 사진으로도 질문할 수 있습니다.</p>
    </AnimatedSection>
    <AnimatedButton onClick={onNext} fullWidth withArrow className="mt-4">
      시작하기
    </AnimatedButton>
  </AnimatedCard>
  
  <AnimatedCard className="p-4" delay={0.6}>
    <div className="flex items-center gap-3">
      <motion.div className="bg-toss-secondary p-2 rounded-lg" whileHover={{
        rotate: 5
      }} animate={{
        scale: [1, 1.1, 1],
        rotate: [0, 2, -2, 0]
      }} transition={{
        duration: 1.5,
        repeat: Infinity,
        repeatDelay: 3
      }}>
        <AlertCircle className="h-5 w-5 text-toss-textSecondary" />
      </motion.div>
      <div>
        <h3 className="font-medium text-sm">학습 팁</h3>
        <p className="text-toss-textSecondary text-xs">
          구체적인 질문을 하면 더 정확한 답변을 받을 수 있습니다.
        </p>
      </div>
    </div>
  </AnimatedCard>
</div>;

const OptionsStep = ({
  selectedOption,
  onOptionSelect
}: {
  selectedOption: string | null;
  onOptionSelect: (option: string) => void;
}) => {
  const options = [{
    title: '직접 질문하기',
    description: '영어 관련 질문을 직접 입력하세요',
    icon: <HelpCircle className="h-5 w-5 text-toss-blue" />
  }, {
    title: '문제 이미지 분석',
    description: '문제지나 교재 사진을 업로드하세요',
    icon: <Image className="h-5 w-5 text-toss-blue" />
  }, {
    title: '내신등급 예측',
    description: '시험 점수로 내신등급을 예측합니다',
    icon: <Award className="h-5 w-5 text-toss-blue" />
  }];
  return <div className="space-y-4">
    <AnimatedSection animation="slideDown" delay={0.1}>
      <h2 className="text-lg font-bold mb-2">무엇을 도와드릴까요?</h2>
      <p className="text-toss-textSecondary text-sm mb-4">원하시는 옵션을 선택해주세요.</p>
    </AnimatedSection>
    
    <div className="space-y-3">
      {options.map((option, index) => <motion.button key={option.title} type="button" className={cn("w-full p-4 rounded-xl border transition-all flex items-center justify-between touch-target touch-feedback", selectedOption === option.title ? "border-toss-blue bg-toss-blue/5" : "border-toss-border/30 bg-white")} onClick={() => onOptionSelect(option.title)} initial={{
        opacity: 0,
        y: 10
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: index * 0.2 + 0.3
      }} whileHover={{
        scale: 1.01
      }} whileTap={{
        scale: 0.99
      }}>
        <div className="flex items-center gap-3">
          <motion.div className={cn("p-2 rounded-lg", selectedOption === option.title ? "bg-toss-blue/10" : "bg-toss-secondary")} whileHover={{
            rotate: 5
          }} animate={selectedOption === option.title ? {
            scale: [1, 1.1, 1]
          } : {}} transition={{
            duration: 0.5
          }}>
            {option.icon}
          </motion.div>
          <div className="text-left">
            <h3 className="font-medium">{option.title}</h3>
            <p className="text-xs text-toss-textSecondary">{option.description}</p>
          </div>
        </div>
        
        <div className={cn("w-6 h-6 rounded-full flex items-center justify-center", selectedOption === option.title ? "bg-toss-blue text-white" : "border border-toss-border")}>
          {selectedOption === option.title && <motion.div initial={{
            scale: 0
          }} animate={{
            scale: 1
          }} transition={{
            type: "spring",
            damping: 10,
            stiffness: 300
          }}>
              <Check className="h-4 w-4" />
            </motion.div>}
        </div>
      </motion.button>)}
    </div>
  </div>;
};

const InputStep = ({
  value,
  onChange,
  onSubmit
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
}) => <div className="space-y-4">
  <AnimatedSection animation="slideDown" delay={0.1}>
    <h2 className="text-lg font-bold mb-2">질문을 입력해주세요</h2>
    <p className="text-toss-textSecondary text-sm mb-4">궁금한 내용을 상세하게 적어주세요.</p>
  </AnimatedSection>
  
  <motion.div className="bg-white rounded-xl border border-toss-border/30 overflow-hidden" initial={{
    opacity: 0,
    y: 10
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    delay: 0.3
  }}>
    <textarea value={value} onChange={onChange} placeholder="예시: Can you explain the difference between 'affect' and 'effect'?" className="w-full p-4 min-h-[200px] text-toss-text resize-none focus:outline-none" rows={6} />
    <div className="border-t border-toss-border/20 p-3 flex justify-end">
      <AnimatedButton onClick={onSubmit} disabled={!value.trim()} variant={value.trim() ? 'primary' : 'secondary'} icon={<Send className="h-4 w-4" />}>
        제출하기
      </AnimatedButton>
    </div>
  </motion.div>
</div>;

const ImageUploadStep = ({
  isUploaded,
  onUpload
}: {
  isUploaded: boolean;
  onUpload: (base64Image: string) => void;
}) => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 50,
    height: 50,
    x: 25,
    y: 25
  });
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    toast
  } = useToast();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = event => {
        if (event.target?.result) {
          setUploadedImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  const handleCameraCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = "image/*";
      fileInputRef.current.capture = "environment";
      fileInputRef.current.click();
    }
    toast({
      title: "카메라 사용",
      description: "카메라로 사진을 찍을 수 있습니다."
    });
  };
  const handleConfirmCrop = () => {
    if (!completedCrop || !imageRef.current) {
      toast({
        title: "오류",
        description: "이미지 영역을 선택해주어야 합니다.",
        variant: "destructive"
      });
      return;
    }
    const canvas = document.createElement('canvas');
    const scaleX = imageRef.current.naturalWidth / imageRef.current.width;
    const scaleY = imageRef.current.naturalHeight / imageRef.current.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      toast({
        title: "오류",
        description: "이미지 처리 중 문제가 발생했습니다.",
        variant: "destructive"
      });
      return;
    }
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    ctx.drawImage(imageRef.current, completedCrop.x * scaleX, completedCrop.y * scaleY, completedCrop.width * scaleX, completedCrop.height * scaleY, 0, 0, completedCrop.width, completedCrop.height);
    const base64Image = canvas.toDataURL('image/jpeg', 0.95);
    
    onUpload(base64Image);
    
    toast({
      title: "이미지 업로드 성공",
      description: "선택하신 영역이 추가되었습니다."
    });
  };
  return <div className="space-y-4">
    <AnimatedSection animation="slideDown" delay={0.1}>
      <h2 className="text-lg font-bold mb-2">이미지 업로드</h2>
      <p className="text-toss-textSecondary text-sm mb-4">문제 이미지를 업로드하시면 분석해드립니다.</p>
    </AnimatedSection>
    
    <motion.div className="bg-white rounded-xl border border-toss-border/30 overflow-hidden p-6" initial={{
      opacity: 0,
      y: 10
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: 0.3
    }}>
      {!uploadedImage ? <motion.div role="button" tabIndex={0} className="border-2 border-dashed border-toss-border/50 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-toss-secondary/30 transition-colors touch-target touch-feedback" onClick={triggerFileInput} onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          triggerFileInput();
        }
      }} whileHover={{
        scale: 1.01
      }} whileTap={{
        scale: 0.99
      }}>
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*" />
          <div className="flex flex-col items-center">
            <motion.div className="w-16 h-16 rounded-full bg-toss-secondary flex items-center justify-center mb-4" animate={{
            y: [0, -5, 0]
          }} transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}>
              <Image className="h-8 w-8 text-toss-textSecondary" />
            </motion.div>
            <p className="font-medium">이미지를 업로드하세요</p>
            <p className="text-toss-textSecondary text-sm mt-1">클릭하여 파일 선택</p>
            
            <div className="flex gap-4 mt-6">
              <motion.button type="button" className="flex items-center gap-2 px-4 py-2 rounded-full bg-toss-secondary text-toss-text hover:bg-toss-secondary/80 transition-colors" onClick={e => {
              e.stopPropagation();
              triggerFileInput();
            }} whileHover={{
              scale: 1.05
            }} whileTap={{
              scale: 0.95
            }}>
                <Upload className="h-4 w-4" />
                <span>갤러리</span>
              </motion.button>
              
              <motion.button type="button" className="flex items-center gap-2 px-4 py-2 rounded-full bg-toss-blue text-white hover:bg-toss-blue/90 transition-colors" onClick={e => {
              e.stopPropagation();
              handleCameraCapture();
            }} whileHover={{
              scale: 1.05
            }} whileTap={{
              scale: 0.95
            }}>
                <Camera className="h-4 w-4" />
                <span>카메라</span>
              </motion.button>
            </div>
          </div>
        </motion.div> : <div className="space-y-4">
          <div className="relative max-h-[400px] bg-toss-gray p-1 rounded-md overflow-auto">
            <ReactCrop crop={crop} onChange={c => setCrop(c)} onComplete={c => setCompletedCrop(c)} aspect={undefined}>
              <img ref={imageRef} src={uploadedImage} alt="선택할 이미지" className="max-w-full" />
            </ReactCrop>
          </div>
          <p className="text-sm text-toss-textSecondary flex items-center">
            <Camera size={16} className="mr-1" /> 드래그하여 영역을 선택하세요
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <button onClick={() => setUploadedImage(null)} className="flex-1 flex items-center justify-center gap-2 py-2 border border-toss-border rounded-lg hover:bg-toss-secondary transition-colors">
              <X size={16} /> 취소
            </button>
            <button onClick={handleConfirmCrop} className="flex-1 flex items-center justify-center gap-2 py-2 bg-toss-blue text-white rounded-lg hover:bg-toss-blue/90 transition-colors">
              <CropIcon size={16} /> 적용하기
            </button>
          </div>
        </div>}
    </motion.div>
  </div>;
};

const GradePredictionStep = () => {
  return (
    <div className="w-full max-w-full mx-auto">
      <AnimatedSection animation="slideDown" delay={0.1}>
        <h2 className="text-2xl font-bold text-center mb-4">내신등급 예측</h2>
        <p className="text-toss-textSecondary text-center text-sm mb-6">시험 점수로 내신등급을 예측해드립니다.</p>
      </AnimatedSection>

      <AnimatedCard className="p-0 overflow-hidden border-0 shadow-none">
        <div className="relative w-full h-[calc(100vh-220px)] min-h-[450px] iframe-container">
          <iframe 
            src="https://iqtest-rank-mastermind.lovable.app" 
            title="내신등급 예측"
            className="w-full h-full border-0 absolute inset-0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            loading="lazy"
            style={{
              overflow: 'hidden'
            }}
          />
        </div>
      </AnimatedCard>
    </div>
  );
};

const ResultsStep = ({
  userInput,
  hasImage,
  uploadedImageData,
  formatAIResponse
}: {
  userInput: string;
  hasImage: boolean;
  uploadedImageData: string | null;
  formatAIResponse: (text: string) => React.ReactNode;
}) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchAiResponse = async () => {
      setIsLoading(true);
      try {
        const message = hasImage 
          ? uploadedImageData || localStorage.getItem('uploadedImage')
          : userInput;
          
        if (!message) {
          throw new Error("메시지 또는 이미지가 없습니다.");
        }
        
        const { data, error } = await supabase.functions.invoke('chat', {
          body: {
            message: message,
            history: []
          }
        });
        
        if (error) throw error;
        if (data?.message) {
          setAiResponse(data.message);
        }
      } catch (error) {
        console.error('AI Response Error:', error);
        toast({
          title: "오류 발생",
          description: "AI 답변을 가져오는 데 실패했습니다.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAiResponse();
  }, [userInput, hasImage, uploadedImageData, toast]);
  
  const handleNewQuestion = () => {
    navigate('/chat');
  };
  
  const handleAskFollowUp = async () => {
    if (!followUpQuestion.trim()) return;
    
    setIsLoading(true);
    try {
      const historyMessages = [
        { role: 'assistant', content: aiResponse || '' }
      ];
      
      const {
        data,
        error
      } = await supabase.functions.invoke('chat', {
        body: {
          message: followUpQuestion,
          history: historyMessages
        }
      });
      
      if (error) throw error;
      if (data?.message) {
        setAiResponse(data.message);
        setFollowUpQuestion('');
      }
    } catch (error) {
      console.error('Follow-up Question Error:', error);
      toast({
        title: "오류 발생",
        description: "추가 질문 처리 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <AnimatedSection animation="slideDown" delay={0.1}>
        <h2 className="text-lg font-bold mb-4 text-oracle-gold">학습 결과 분석</h2>
      </AnimatedSection>
      
      <AnimatedCard className="overflow-hidden rounded-none sm:rounded-xl" pressable={false} delay={0.3}>
        <div className="flex flex-col bg-gradient-to-br from-oracle-navy to-oracle-dark">
          <div className="p-4 space-y-4">
            <div className="flex items-start gap-3 justify-end">
              <div className="flex-1">
                <motion.div 
                  className="bg-[#E9F2FF] p-3 rounded-2xl text-[#1A1F2C] ml-auto" 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, type: "spring", damping: 20 }}
                >
                  <p className="text-sm">{hasImage ? "이 문제를 풀이해주세요." : userInput || "영어 문법에 대해 질문드립니다."}</p>
                </motion.div>
              </div>
            </div>

            <div className="flex flex-col w-full">
              <div className="flex items-start gap-3 mb-4">
                <Avatar className="h-10 w-10 flex-shrink-0 ring-2 ring-oracle-gold p-0.5">
                  <img src="/lovable-uploads/4bdbca69-6a79-43bb-a58f-fc20cc3b97d9.png" alt="Sophia" className="object-contain" />
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-oracle-gold font-medium">Sophia 선생님</span>
                  <span className="text-xs text-oracle-cream/70">영어 전문 AI 교사</span>
                </div>
              </div>
              
              <div className="w-full space-y-4">
                <div className="w-full rounded-xl overflow-hidden border border-oracle-lightBlue/20">
                  {hasImage && uploadedImageData && (
                    <div className="aspect-auto w-full bg-oracle-navy/50 flex items-center justify-center p-4">
                      <img 
                        src={uploadedImageData || localStorage.getItem('uploadedImage') || ''} 
                        alt="Uploaded content" 
                        className="w-full h-full object-contain rounded-lg"
                      />
                    </div>
                  )}
                  
                  <div className="p-4 bg-oracle-navy/30">
                    {isLoading ? (
                      <div className="flex flex-col items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 text-oracle-gold animate-spin mb-2" />
                        <p className="text-oracle-cream/70 text-sm">답변을 생성하는 중입니다...</p>
                      </div>
                    ) : aiResponse ? (
                      <div className="space-y-4">
                        {formatAIResponse(aiResponse)}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8">
                        <AlertCircle className="h-8 w-8 text-oracle-cream/50 mb-2" />
                        <p className="text-oracle-cream/70 text-sm">답변을 불러오지 못했습니다.</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <div className="flex gap-2 items-center">
                    <div className="flex-1 relative">
                      <input 
                        type="text" 
                        value={followUpQuestion}
                        onChange={(e) => setFollowUpQuestion(e.target.value)}
                        placeholder="추가 질문이 있으신가요?"
                        className="w-full bg-oracle-navy/20 border border-oracle-lightBlue/20 rounded-full px-4 py-2 pr-10 text-sm text-oracle-cream placeholder-oracle-cream/50 focus:outline-none focus:ring-1 focus:ring-oracle-gold"
                      />
                      <button 
                        disabled={!followUpQuestion.trim() || isLoading}
                        onClick={handleAskFollowUp}
                        className="absolute right-1 top-1 p-1 rounded-full bg-oracle-gold/80 hover:bg-oracle-gold disabled:bg-oracle-gray/30 disabled:cursor-not-allowed transition-colors"
                      >
                        <Send className="h-4 w-4 text-oracle-dark" />
                      </button>
                    </div>
                    
                    <button 
                      onClick={handleNewQuestion}
                      className="flex items-center gap-1 bg-oracle-lightBlue/10 hover:bg-oracle-lightBlue/20 text-oracle-lightBlue px-3 py-2 rounded-full text-xs transition-colors"
                    >
                      <ArrowRight className="h-3 w-3" />
                      <span>새 질문</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AnimatedCard>
    </div>
  );
};

export default Index;
