import { useState } from "react";
import { TypeSelector } from "./TypeSelector";
import { TextInput } from "./TextInput";
import { GeneratedQuestion } from "./GeneratedQuestion";
import { generateQuestion } from "@/lib/claude";
import { QuestionType } from "@/types/question";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Sparkles } from "lucide-react";

export const QuestionGenerator = () => {
  const [selectedType, setSelectedType] = useState<QuestionType | null>(null);
  const [text, setText] = useState("");
  const [generatedQuestion, setGeneratedQuestion] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!selectedType || !text.trim()) {
      toast({
        title: "입력 확인",
        description: "문제 유형과 지문을 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await generateQuestion(selectedType, text);
      setGeneratedQuestion(result);
      toast({
        title: "문제 생성 완료",
        description: "AI가 문제를 생성했습니다.",
      });
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "문제 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <TypeSelector
        selectedType={selectedType}
        onSelect={setSelectedType}
      />
      <TextInput
        value={text}
        onChange={setText}
      />
      <div className="flex justify-center gap-4">
        <Button
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full max-w-md bg-gradient-to-r from-primary via-accent to-primary hover:opacity-90 transition-all duration-300 animate-glow"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {isLoading ? "생성 중..." : "문제 생성하기"}
        </Button>
      </div>
      {generatedQuestion && (
        <GeneratedQuestion content={generatedQuestion} />
      )}
    </div>
  );
};