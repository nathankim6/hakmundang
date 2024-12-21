import { Textarea } from "@/components/ui/textarea";

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const TextInput = ({ value, onChange }: TextInputProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-primary animate-sparkle">지문 입력</h2>
      <div className="relative">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="문제로 만들 지문을 입력하세요"
          className="min-h-[200px] bg-card border-2 border-muted focus:border-primary transition-colors duration-300 metallic-border"
        />
        <div className="absolute inset-0 pointer-events-none border-2 border-primary/20 rounded-md animate-glow" />
      </div>
    </div>
  );
};