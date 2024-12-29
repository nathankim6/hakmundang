import { generateQuestion } from "@/lib/claude";
import { generateDocument } from "@/utils/documentGenerator";
import { TypeEntry } from "@/types/question";

interface QuestionActionsProps {
  selectedTypes: TypeEntry[];
  setIsLoading: (loading: boolean) => void;
  setProgress: (progress: { current: number; total: number }) => void;
  setSelectedTypes: (types: TypeEntry[]) => void;
  setAbortController: (controller: AbortController | null) => void;
  toast: any;
}

export const useQuestionActions = ({
  selectedTypes,
  setIsLoading,
  setProgress,
  setSelectedTypes,
  setAbortController,
  toast
}: QuestionActionsProps) => {
  const handleGenerateAll = async () => {
    const nonEmptyTypes = selectedTypes.map(type => ({
      ...type,
      passages: type.passages.filter(passage => passage.text.trim() !== '')
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

      // Process one type at a time
      for (const typeEntry of updatedTypes) {
        const validPassages = typeEntry.passages.filter(p => p.text.trim() !== '');
        
        // Process one passage at a time
        for (const passage of validPassages) {
          try {
            if (controller.signal.aborted) {
              return;
            }

            // Generate question for a single passage
            console.log(`Generating question for type: ${typeEntry.type.name}, passage ID: ${passage.id}`);
            const result = await generateQuestion(typeEntry.type, passage.text);
            console.log(`Question generated successfully for passage ID: ${passage.id}`);
            
            // Update the result for this specific passage
            const typeIndex = updatedTypes.findIndex(t => t.type.id === typeEntry.type.id);
            const passageIndex = updatedTypes[typeIndex].passages.findIndex(p => p.id === passage.id);
            
            if (typeIndex !== -1 && passageIndex !== -1) {
              updatedTypes[typeIndex].passages[passageIndex].result = result;
              
              // Update state after each successful generation
              setSelectedTypes([...updatedTypes]);
              
              currentQuestion++;
              setProgress({ current: currentQuestion, total: totalQuestions });
              
              // Add a small delay between requests to prevent rate limiting
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          } catch (error) {
            if (error.name === 'AbortError') {
              return;
            }
            console.error(`Error generating question for passage ${passage.id}:`, error);
            toast({
              title: "오류 발생",
              description: `문제 생성 중 오류가 발생했습니다: ${error.message}`,
              variant: "destructive",
            });
            
            // Continue with next passage even if current one fails
            currentQuestion++;
            setProgress({ current: currentQuestion, total: totalQuestions });
          }
        }
      }
      
      toast({
        title: "문제 생성 완료",
        description: "모든 문제가 생성되었습니다.",
      });
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

  const handleDownloadDoc = () => {
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

    generateDocument(questions);
    
    toast({
      title: "다운로드 완료",
      description: "문제가 성공적으로 저장되었습니다.",
    });
  };

  return {
    handleGenerateAll,
    handleDownloadDoc
  };
};