import { generateQuestion } from "@/lib/claude";
import { generateDocument } from "@/utils/documentGenerator";
import { TypeEntry } from "@/types/question";

interface QuestionActionsProps {
  selectedTypes: TypeEntry[];
  setIsLoading: (loading: boolean) => void;
  setProgress: (progress: { current: number; total: number }) => void;
  setSelectedTypes: (types: TypeEntry[]) => void;
  toast: any;
}

export const useQuestionActions = ({
  selectedTypes,
  setIsLoading,
  setProgress,
  setSelectedTypes,
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
    
    try {
      const updatedTypes = [...selectedTypes];
      let currentQuestion = 0;

      for (const typeEntry of updatedTypes) {
        const validPassages = typeEntry.passages.filter(p => p.text.trim() !== '');
        
        for (const passage of validPassages) {
          try {
            const result = await generateQuestion(typeEntry.type, passage.text);
            
            const typeIndex = updatedTypes.findIndex(t => t.type.id === typeEntry.type.id);
            const passageIndex = updatedTypes[typeIndex].passages.findIndex(p => p.id === passage.id);
            
            if (typeIndex !== -1 && passageIndex !== -1) {
              updatedTypes[typeIndex].passages[passageIndex].result = result;
            }

            currentQuestion++;
            setProgress({ current: currentQuestion, total: totalQuestions });
            setSelectedTypes([...updatedTypes]);
          } catch (error) {
            console.error(`Error generating question:`, error);
            toast({
              title: "오류 발생",
              description: "문제 생성 중 오류가 발생했습니다.",
              variant: "destructive",
            });
          }
        }
      }
      
      toast({
        title: "문제 생성 완료",
        description: "모든 문제가 생성되었습니다.",
      });
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "문제 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  const handleDownloadDoc = () => {
    const questions = selectedTypes
      .flatMap(typeEntry => 
        typeEntry.passages
          .filter(passage => passage.result)
          .map((passage, index) => ({
            content: passage.result,
            questionNumber: index + 1
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