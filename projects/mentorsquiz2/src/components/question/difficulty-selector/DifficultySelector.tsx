
import { Slider } from "@/components/ui/slider";
import { DifficultyLabel } from "./DifficultyLabel";
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DifficultySelectorProps {
  localDifficulty: string;
  onDifficultyChange: (value: number[]) => void;
  complexity?: string;
  onComplexityChange?: (level: string) => void;
}

export const DifficultySelector = ({
  localDifficulty,
  onDifficultyChange,
  complexity = "수능",
  onComplexityChange
}: DifficultySelectorProps) => {
  const [localComplexity, setLocalComplexity] = useState(complexity);
  const [showComplexityTable, setShowComplexityTable] = useState(false);

  // 부모 컴포넌트에서 전달된 complexity 값이 변경될 때 localComplexity도 업데이트
  useEffect(() => {
    setLocalComplexity(complexity);
  }, [complexity]);

  const getGaugeColor = (level: string) => {
    const colors = {
      "1": "from-emerald-400 to-emerald-500",
      "2": "from-amber-400 to-amber-500",
      "3": "from-rose-400 to-rose-500"
    };
    return colors[level as keyof typeof colors] || colors["1"];
  };

  const handleComplexityChange = (value: string) => {
    console.log(`Complexity changed to: ${value}`);
    setLocalComplexity(value);
    if (onComplexityChange) {
      onComplexityChange(value);
    }
  };

  const toggleComplexityTable = () => {
    setShowComplexityTable(!showComplexityTable);
  };

  return (
    <div className="space-y-4">
      {/* Paraphrase Level and Difficulty in same row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Paraphrase Level Control */}
        <div className="bg-gradient-to-r from-[#F0F2F5] to-[#E6E8EB] p-4 rounded-lg border border-[#C8CDD4] shadow-sm">
          <h3 className="text-[#1A1F2C] font-medium text-sm mb-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            패러프레이즈 수준
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="inline-flex items-center justify-center text-blue-500 hover:text-blue-600">
                    <Info size={14} />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-[280px] bg-[#1E293B] text-white text-xs p-3">
                  <p>패러프레이즈 수준은 <strong>원본 지문 자체를 얼마나 변형할지</strong>를 결정합니다. 1단계는 원본 그대로, 2단계는 부분 변형, 3단계는 전체 변형을 의미합니다.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </h3>
          <p className="text-xs text-gray-500 mb-3">지문 자체의 변형 정도를 선택합니다.</p>
          <div className="relative pt-8">
            <Slider 
              defaultValue={[Number(localDifficulty)]} 
              value={[Number(localDifficulty)]} 
              max={3} 
              min={1} 
              step={1} 
              onValueChange={onDifficultyChange} 
              className={`w-full bg-gradient-to-r ${getGaugeColor(localDifficulty)}`} 
            />
            <div className="absolute -top-1 left-0 w-full flex justify-between px-[2px] py-2 rounded-lg">
              {[1, 2, 3].map(level => (
                <DifficultyLabel 
                  key={level} 
                  level={String(level)} 
                  localDifficulty={localDifficulty} 
                  onSelect={value => onDifficultyChange([value])} 
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* Complexity Control */}
        <div className="bg-gradient-to-r from-[#F0F2F5] to-[#E6E8EB] p-4 rounded-lg border border-[#C8CDD4] shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-[#1A1F2C] font-medium text-sm flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              문제 난이도
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="inline-flex items-center justify-center text-blue-500 hover:text-blue-600">
                      <Info size={14} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[280px] bg-[#1E293B] text-white text-xs p-3">
                    <p>문제 난이도는 <strong>지문 내용은 그대로 유지한 채, 선택지와 문제의 난이도</strong>만 조절합니다. 지문 자체는 패러프레이즈 수준에 따라서만 변형됩니다.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </h3>
            <button 
              onClick={toggleComplexityTable} 
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 transition-colors bg-[#E9EEF6] px-2 py-1 rounded-md border border-[#D1D9E6] shadow-sm"
            >
              상세 {showComplexityTable ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
          <p className="text-xs text-gray-500 mb-3">문제와 선택지의 난이도를 조정합니다.</p>
          
          <div className="flex justify-between gap-2 py-2">
            {["수능", "토플", "GRE"].map(level => (
              <ComplexityButton 
                key={level} 
                level={level} 
                isSelected={localComplexity === level} 
                onSelect={() => handleComplexityChange(level)} 
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Complexity Table - Full Width Below */}
      {showComplexityTable && (
        <div className="bg-white rounded-lg border border-[#D1D9E6] shadow-sm overflow-hidden transition-all duration-300 ease-in-out">
          <div className="max-h-[300px] overflow-auto">
            <Table>
              <TableHeader className="bg-[#F5F7FA] sticky top-0 z-10">
                <TableRow className="border-b border-[#E0E4EA]">
                  <TableHead className="w-[180px] text-[#1A1F2C] font-semibold text-xs">체크 항목</TableHead>
                  <TableHead className="text-center text-emerald-700 font-medium text-xs bg-emerald-50/50">
                    <div className="flex flex-col items-center">
                      <span>1단계</span>
                      <span className="text-[11px] text-emerald-600/80 font-normal">(한국 수능영어 수준)</span>
                    </div>
                  </TableHead>
                  <TableHead className="text-center text-amber-700 font-medium text-xs bg-amber-50/50">
                    <div className="flex flex-col items-center">
                      <span>2단계</span>
                      <span className="text-[11px] text-amber-600/80 font-normal">(TOEFL 시험 수준)</span>
                    </div>
                  </TableHead>
                  <TableHead className="text-center text-rose-700 font-medium text-xs bg-rose-50/50">
                    <div className="flex flex-col items-center">
                      <span>3단계</span>
                      <span className="text-[11px] text-rose-600/80 font-normal">(GRE 시험 수준)</span>
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="border-b border-[#E0E4EA] even:bg-gray-50/50">
                  <TableCell className="font-medium bg-[#F9FAFC] text-xs">① 단어 수준이 추상적이고 학술적인가?</TableCell>
                  <TableCell className="text-center text-xs bg-emerald-50/20">○ 고등학교 수준의 명확한 어휘 (CEFR B1)</TableCell>
                  <TableCell className="text-center text-xs bg-amber-50/20">○ 대학교 수준의 학술적 어휘 (CEFR C1)</TableCell>
                  <TableCell className="text-center text-xs bg-rose-50/20">✓ 대학원생도 어려워하는 고급 학술 어휘 (CEFR C2)</TableCell>
                </TableRow>
                <TableRow className="border-b border-[#E0E4EA] even:bg-gray-50/50">
                  <TableCell className="font-medium bg-[#F9FAFC] text-xs">② 질문이 정보 확인이 아닌 논리 추론을 요구하는가?</TableCell>
                  <TableCell className="text-center text-xs bg-emerald-50/20">○ 사실 확인 위주 (세부내용, 지정 등)</TableCell>
                  <TableCell className="text-center text-xs bg-amber-50/20">✓ 암시/의도/함축 추론</TableCell>
                  <TableCell className="text-center text-xs bg-rose-50/20">✓ 복잡한 논리 구조와 함의 분석 요구</TableCell>
                </TableRow>
                <TableRow className="border-b border-[#E0E4EA] even:bg-gray-50/50">
                  <TableCell className="font-medium bg-[#F9FAFC] text-xs">③ 선택지가 모두 plausible해서 혼란을 주는가?</TableCell>
                  <TableCell className="text-center text-xs bg-emerald-50/20">○ 명확한 정답과 명확한 오답</TableCell>
                  <TableCell className="text-center text-xs bg-amber-50/20">✓ 다소 매력적인 오답 포함</TableCell>
                  <TableCell className="text-center text-xs bg-rose-50/20">✓ 모든 선지가 정답처럼 보여 판별이 어려움</TableCell>
                </TableRow>
                <TableRow className="border-b border-[#E0E4EA] even:bg-gray-50/50">
                  <TableCell className="font-medium bg-[#F9FAFC] text-xs">④ 유추와 암시를 기반으로 한 사고를 유도하는가?</TableCell>
                  <TableCell className="text-center text-xs bg-emerald-50/20">○ 직접 정보 기반 질문</TableCell>
                  <TableCell className="text-center text-xs bg-amber-50/20">✓ 간단한 비유/은유 해석</TableCell>
                  <TableCell className="text-center text-xs bg-rose-50/20">✓ 복잡한 비판적 사고와 반론 구성 요구</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
};

interface ComplexityButtonProps {
  level: string;
  isSelected: boolean;
  onSelect: () => void;
}

const ComplexityButton = ({
  level,
  isSelected,
  onSelect
}: ComplexityButtonProps) => {
  const getComplexityColor = (level: string) => {
    const colors = {
      "수능": "from-blue-400 to-blue-500",
      "토플": "from-purple-400 to-purple-500",
      "GRE": "from-orange-400 to-orange-500"
    };
    return colors[level as keyof typeof colors] || colors["수능"];
  };

  const getBgColor = (level: string) => {
    const colors = {
      "수능": "bg-blue-100",
      "토플": "bg-purple-100",
      "GRE": "bg-orange-100"
    };
    return colors[level as keyof typeof colors] || colors["수능"];
  };

  const getBorderColor = (level: string) => {
    const colors = {
      "수능": "border-blue-300",
      "토플": "border-purple-300",
      "GRE": "border-orange-300"
    };
    return colors[level as keyof typeof colors] || colors["수능"];
  };

  const getTextColor = (level: string) => {
    const colors = {
      "수능": "text-blue-800",
      "토플": "text-purple-800",
      "GRE": "text-orange-800"
    };
    return colors[level as keyof typeof colors] || colors["수능"];
  };

  const getComplexityDetails = (level: string) => {
    const details = {
      "수능": {
        description: "한국 수능 영어 수준 (CEFR B1)",
        detail: "고등학교 수준의 어휘와 문법 구조"
      },
      "토플": {
        description: "TOEFL 시험 수준 (CEFR C1)",
        detail: "대학 수준의 학술 어휘와 추론 능력 필요"
      },
      "GRE": {
        description: "GRE 시험 수준 (CEFR C2)",
        detail: "대학원생도 어려워하는 최상급 난이도"
      }
    };
    return details[level as keyof typeof details] || details["수능"];
  };

  return (
    <button 
      onClick={onSelect} 
      className={`relative flex-1 p-3 rounded-lg text-center transition-all duration-300 transform 
        ${isSelected 
          ? `${getBgColor(level)} ${getBorderColor(level)} border-2 shadow-sm` 
          : 'bg-white/90 text-gray-700 border border-gray-200 hover:bg-gray-50'
        }`}
    >
      <div className="flex flex-col items-center gap-1">
        <span className={`text-base font-bold ${isSelected ? getTextColor(level) : 'text-gray-700'}`}>
          {level}
        </span>
        <span className={`text-xs ${isSelected ? `${getTextColor(level)} opacity-80` : 'text-gray-500'} leading-tight`}>
          {getComplexityDetails(level).description.split(' (')[0]}
        </span>
        
        {isSelected && (
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-r from-green-400 to-green-500 flex items-center justify-center border-2 border-white">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
        )}
      </div>
    </button>
  );
};
