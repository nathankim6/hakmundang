import { Slider } from "@/components/ui/slider";
import { DifficultyLabel } from "./DifficultyLabel";

interface DifficultySelectorProps {
  localDifficulty: string;
  onDifficultyChange: (value: number[]) => void;
}

export const DifficultySelector = ({ localDifficulty, onDifficultyChange }: DifficultySelectorProps) => {
  const getGaugeColor = (level: string) => {
    const colors = {
      "1": "from-emerald-400 to-emerald-500",
      "2": "from-amber-400 to-amber-500",
      "3": "from-rose-400 to-rose-500"
    };
    return colors[level as keyof typeof colors] || colors["1"];
  };

  return (
    <div className="space-y-6">
      <div className="relative pt-10">
        <Slider
          defaultValue={[Number(localDifficulty)]}
          value={[Number(localDifficulty)]}
          max={3}
          min={1}
          step={1}
          onValueChange={onDifficultyChange}
          className={`w-full bg-gradient-to-r ${getGaugeColor(localDifficulty)}`}
        />
        <div className="absolute -top-1 left-0 w-full flex justify-between px-[2px]">
          {[1, 2, 3].map((level) => (
            <DifficultyLabel
              key={level}
              level={String(level)}
              localDifficulty={localDifficulty}
              onSelect={(value) => onDifficultyChange([value])}
            />
          ))}
        </div>
      </div>
    </div>
  );
};