
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
      title: "원본 유지",
      description: "원문 그대로 사용",
      detail: "제공된 지문을 변경 없이 그대로 사용하여 문제를 생성합니다."
    },
    "2": {
      title: "부분 패러프레이즈",
      description: "50% 변형",
      detail: "지문의 약 50%를 패러프레이즈하여 약간 다른 표현으로 변형합니다."
    },
    "3": {
      title: "전체 패러프레이즈",
      description: "100% 변형",
      detail: "지문 전체를 완전히 다른 표현으로 패러프레이즈하여 변형합니다."
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
              <div className="text-[10px] font-medium mb-2 px-2 py-1 rounded-md bg-[#1E293B] text-white shadow-md">
                {getDifficultyLabel(level)}
              </div>
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer
                  ${Number(localDifficulty) >= Number(level)
                    ? `bg-gradient-to-r ${getGaugeColor(level)} shadow-[0_0_10px_rgba(0,0,0,0.1)]`
                    : "bg-gray-300 hover:bg-gray-400"
                  } 
                  transform hover:scale-105
                  ${Number(localDifficulty) === Number(level) ? "ring-2 ring-white ring-offset-2 ring-offset-[#E6E8EB]" : ""}
                `}
              >
                <span className={`text-sm font-bold
                  ${Number(localDifficulty) >= Number(level) 
                    ? "text-white" 
                    : "text-gray-600"}`}>
                  {level}
                </span>
              </div>
            </div>
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="bg-[#1E293B] border border-gray-700 p-3 max-w-[200px]"
        >
          <div className="space-y-1">
            <p className="text-sm font-semibold text-white">
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
