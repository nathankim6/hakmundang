import { Textarea } from "@/components/ui/textarea";

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const TextInput = ({ value, onChange }: TextInputProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-primary animate-title">Input Text</h2>
      <div className="relative">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter your text here..."
          className="min-h-[200px] bg-secondary/50 border-2 border-primary/20 focus:border-primary transition-colors duration-300 rounded-lg text-foreground placeholder:text-muted-foreground resize-none"
        />
        <div className="absolute inset-0 pointer-events-none border-2 border-primary/10 rounded-lg" 
             style={{
               boxShadow: '0 0 20px rgba(155, 135, 245, 0.1)',
               animation: 'glow 3s infinite'
             }}
        />
      </div>
    </div>
  );
};