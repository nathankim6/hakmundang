import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DifficultyLabelProps {
  level: string;
  localDifficulty: string;
  onSelect: (level: number) => void;
}

export const DifficultyLabel = ({ level, localDifficulty, onSelect }: DifficultyLabelProps) => {
  const getDifficultyLabel = (level: string) => {
    switch(level) {
      case "1": return "원본";
      case "2": return "50% 변형";
      case "3": return "100% 변형";
      default: return "";
    }
  };

  const getGaugeColor = (level: string) => {
    const colors = {
      "1": "from-emerald-400 to-emerald-500",
      "2": "from-amber-400 to-amber-500",
      "3": "from-rose-400 to-rose-500"
    };
    return colors[level as keyof typeof colors] || colors["1"];
  };

  const difficultyLabels = {
    "1": {
      title: "1단계",
      description: "부분적 패러프레이즈",
      detail: "제공된 지문을 변경 없이 그대로 사용하여 문제를 생성합니다."
    },
    "2": {
      title: "2단계",
      description: "부분적 패러프레이즈",
      detail: "일부 문장과 단어를 패러프레이즈하여 문제를 생성합니다."
    },
    "3": {
      title: "3단계",
      description: "전체 패러프레이즈",
      detail: "전체 지문을 완전히 패러프레이즈하여 문제를 생성합니다."
    },
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => onSelect(Number(level))}
            className="focus:outline-none group/level"
          >
            <div className="relative flex flex-col items-center">
              <div className="text-xs font-medium text-gray-300 mb-2">
                {getDifficultyLabel(level)}
              </div>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer
                  ${Number(localDifficulty) >= Number(level)
                    ? `bg-gradient-to-r ${getGaugeColor(level)} shadow-[0_0_15px_rgba(155,135,245,0.5)]`
                    : "bg-gray-600 hover:bg-gray-500"
                  } 
                  transform hover:scale-110 hover:shadow-[0_0_20px_rgba(155,135,245,0.6)]
                  ${Number(localDifficulty) === Number(level) ? "ring-2 ring-[#9b87f5] ring-offset-2 ring-offset-[#1A1F2C]" : ""}
                `}
              >
                <span className={`text-sm font-bold
                  ${Number(localDifficulty) >= Number(level) 
                    ? "text-white animate-pulse" 
                    : "text-gray-300"}`}>
                  {level}
                </span>
              </div>
            </div>
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="bg-[#1A1F2C] border border-[#9b87f5]/30 p-3 max-w-[200px]"
        >
          <div className="space-y-1">
            <p className="text-sm font-semibold text-[#9b87f5]">
              {difficultyLabels[level as keyof typeof difficultyLabels].title}
            </p>
            <p className="text-xs text-gray-300">
              {difficultyLabels[level as keyof typeof difficultyLabels].detail}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};