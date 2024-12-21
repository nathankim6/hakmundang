import { Textarea } from "@/components/ui/textarea";

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const TextInput = ({ value, onChange }: TextInputProps) => {
  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold text-primary/80">
        Input Text
      </h2>
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 via-primary/25 to-primary/50 rounded-lg blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50" />
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter your text here..."
          className="h-[80px] w-full max-w-[500px] bg-secondary/50 border-2 border-primary/20 focus:border-primary transition-all duration-300 rounded-lg text-foreground placeholder:text-muted-foreground resize-none relative backdrop-blur-sm"
        />
      </div>
    </div>
  );
};