
import { generateQuestion } from "@/lib/claude";
import { TypeEntry } from "@/types/question";
import { generateDocument } from "@/utils/documentGenerator";

interface QuestionActionsProps {
  selectedTypes: TypeEntry[];
  setIsLoading: (loading: boolean) => void;
  setProgress: (progress: { current: number; total: number }) => void;
  setSelectedTypes: (types: TypeEntry[]) => void;
  setAbortController: (controller: AbortController | null) => void;
  difficulty: string;
  complexity: string;
  toast: any;
}

export const useQuestionActions = ({
  selectedTypes,
  setIsLoading,
  setProgress,
  setSelectedTypes,
  setAbortController,
  difficulty,
  complexity,
  toast
}: QuestionActionsProps) => {
  const handleGenerateAll = async () => {
    const claudeApiKey = localStorage.getItem("claude_api_key");
    const gptApiKey = localStorage.getItem("gpt_api_key");
    const deepseekApiKey = localStorage.getItem("deepseek_api_key");

    if (!claudeApiKey && !gptApiKey && !deepseekApiKey) {
      toast({
        title: "API 키 필요",
        description: "문제 생성을 위해 API 키를 먼저 설정해주세요.",
        variant: "destructive",
      });
      return;
    }

    const nonEmptyTypes = selectedTypes.map(type => ({
      ...type,
      passages: type.passages.filter(passage => passage?.text && passage.text.trim() !== '')
    })).filter(type => type.passages.length > 0);

    if (nonEmptyTypes.length === 0) {
      toast({
        title: "입력 확인",
        description: "생성할 문제가 없습니다.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const totalQuestions = nonEmptyTypes.reduce((sum, type) => sum + type.passages.length, 0);
    setProgress({ current: 0, total: totalQuestions });
    
    const controller = new AbortController();
    setAbortController(controller);
    
    try {
      const updatedTypes = [...selectedTypes];
      let currentQuestion = 0;

      // 선택된 복잡도 로깅
      console.log(`문제 생성 시작 - 선택된 복잡도: ${complexity}, 패러프레이즈 수준: ${difficulty}`);

      // Process each type one at a time
      for (const typeEntry of updatedTypes) {
        const validPassages = typeEntry.passages.filter(p => p?.text && p.text.trim() !== '');
        
        // Process each passage independently with delay between generations
        for (const passage of validPassages) {
          try {
            if (controller.signal.aborted) {
              return;
            }

            console.log(`독립적으로 문제 생성 시작 - 유형: [${typeEntry.type.name}] ${typeEntry.type.id}, 지문 ID: ${passage.id}, 패러프레이즈 수준: ${difficulty}, 복잡도: ${complexity}`);
            
            // 패러프레이즈 수준과 복잡도를 명확히 구분하여 전달
            const result = await generateQuestion(typeEntry.type, passage.text, difficulty, complexity);
            console.log(`문제 생성 완료 - 지문 ID: ${passage.id}, 복잡도: ${complexity}`);
            
            // Update state for this specific passage
            const typeIndex = updatedTypes.findIndex(t => t.type.id === typeEntry.type.id);
            if (typeIndex !== -1) {
              const passageIndex = updatedTypes[typeIndex].passages.findIndex(p => p.id === passage.id);
              if (passageIndex !== -1) {
                updatedTypes[typeIndex].passages[passageIndex].result = result;
                setSelectedTypes([...updatedTypes]);
                currentQuestion++;
                setProgress({ current: currentQuestion, total: totalQuestions });
              }
            }

            // Add delay between passages to ensure independence
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Show success toast for each passage
            toast({
              title: "문제 생성 완료",
              description: `${currentQuestion}번째 문제가 생성되었습니다. (${complexity} 난이도)`,
            });

          } catch (error) {
            if (error.name === 'AbortError') {
              return;
            }
            console.error(`지문 ${passage.id} 문제 생성 중 오류 발생:`, error);
            toast({
              title: "오류 발생",
              description: `문제 생성 중 오류가 발생했습니다: ${error.message}`,
              variant: "destructive",
            });
            
            currentQuestion++;
            setProgress({ current: currentQuestion, total: totalQuestions });
          }
        }
      }
      
      // Only show success toast if at least one question was generated successfully
      const successfulQuestions = updatedTypes.reduce((count, type) => 
        count + type.passages.filter(p => p.result).length, 0
      );
      
      if (successfulQuestions > 0) {
        toast({
          title: "문제 생성 완료",
          description: `${successfulQuestions}개 문제가 생성되었습니다. (${complexity} 난이도)`,
        });
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error("Generation process error:", error);
        toast({
          title: "오류 발생",
          description: "문제 생성 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
      setProgress({ current: 0, total: 0 });
      setAbortController(null);
    }
  };

  const handleDownloadDoc = async () => {
    try {
      // Check if Hancom API key exists
      const hancomApiKey = localStorage.getItem("hancom_api_key");
      
      const questions = selectedTypes
        .flatMap(typeEntry => 
          typeEntry.passages
            .filter(passage => passage.result)
            .map((passage, index) => ({
              content: passage.result,
              questionNumber: index + 1,
              originalText: typeEntry.type.id === "weekendClinic" ? passage.text : undefined
            }))
        )
        .sort((a, b) => a.questionNumber - b.questionNumber);

      if (questions.length === 0) {
        toast({
          title: "다운로드 실패",
          description: "저장할 문제가 없습니다.",
          variant: "destructive",
        });
        return;
      }
      
      // Generate documents and handle possible errors
      const result = await generateDocument(questions, hancomApiKey ? "hwp" : "docx");
      
      if (!result.success) {
        toast({
          title: "저장 알림",
          description: result.error,
          variant: "destructive",
        });
        return;
      }
      
      // Show success message with the correct format
      toast({
        title: "다운로드 완료",
        description: `문제가 ${result.format === "docx" ? "Word(DOCX)" : "한글(HWP)"} 형식으로 저장되었습니다.`,
      });
    } catch (error) {
      console.error("Download document error:", error);
      toast({
        title: "다운로드 실패",
        description: error.message || "문서 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  return {
    handleGenerateAll,
    handleDownloadDoc
  };
};
