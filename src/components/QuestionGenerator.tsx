import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { TextInput } from "./TextInput";
import { TypeSelector } from "./TypeSelector";
import { useToast } from "@/components/ui/use-toast";
import { QuestionDisplay } from "./QuestionDisplay";

type QuestionType = "객관식" | "주관식" | "OX퀴즈";

interface GeneratedQuestion {
  question: string;
  options?: string[];
  answer: string;
  explanation?: string;
}

export function QuestionGenerator() {
  const [selectedType, setSelectedType] = useState<QuestionType>("객관식");
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const { toast } = useToast();

  const handleGenerateQuestion = async () => {
    if (!inputText.trim()) {
      toast({
        title: "오류",
        description: "텍스트를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const apiKey = localStorage.getItem("claude_api_key");
      if (!apiKey) {
        throw new Error("API 키가 설정되지 않았습니다.");
      }

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-opus-20240229",
          max_tokens: 4096,
          messages: [
            {
              role: "user",
              content: `다음 지문을 바탕으로 ${selectedType} 문제를 생성해주세요. 문제는 한국어로 작성해주세요:

${inputText}

다음 JSON 형식으로 응답해주세요:
{
  "question": "문제",
  ${selectedType === "객관식" ? '"options": ["보기1", "보기2", "보기3", "보기4"],' : ""}
  "answer": "정답",
  "explanation": "해설"
}`,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error("API 요청 실패");
      }

      const data = await response.json();
      const content = data.content[0].text;
      
      try {
        const parsedQuestion = JSON.parse(content);
        setGeneratedQuestions(prev => [...prev, parsedQuestion]);
        setInputText("");
      } catch (e) {
        console.error("JSON 파싱 오류:", e);
        toast({
          title: "오류",
          description: "응답 처리 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("API 오류:", error);
      toast({
        title: "오류",
        description: "문제 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaste = (values: string[]) => {
    setInputText(values.join("\n"));
  };

  return (
    <div className="space-y-6">
      <TypeSelector
        selectedType={selectedType}
        onTypeSelect={setSelectedType}
      />
      
      <div className="space-y-4">
        <TextInput
          value={inputText}
          onChange={setInputText}
          onEnterPress={handleGenerateQuestion}
          onPaste={handlePaste}
        />
        
        <div className="flex justify-end">
          <Button
            onClick={handleGenerateQuestion}
            disabled={isLoading || !inputText.trim()}
            className="bg-[#0FA0CE] hover:bg-[#1EAEDB] text-white transition-all duration-300 transform hover:scale-105"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                생성 중...
              </>
            ) : (
              "문제생성하기"
            )}
          </Button>
        </div>
      </div>

      {generatedQuestions.length > 0 && (
        <div className="space-y-4">
          {generatedQuestions.map((question, index) => (
            <QuestionDisplay
              key={index}
              question={question}
              type={selectedType}
              onDelete={() => {
                setGeneratedQuestions(prev =>
                  prev.filter((_, i) => i !== index)
                );
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}