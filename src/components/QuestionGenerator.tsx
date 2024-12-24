import { useState } from "react";
import { TypeSelector } from "./TypeSelector";
import { TextInput } from "./TextInput";
import { GeneratedQuestion } from "./GeneratedQuestion";
import { LoadingProgress } from "./LoadingProgress";
import { generateQuestion } from "@/lib/claude";
import { generateDocument } from "@/utils/documentGenerator";
import { QuestionType } from "@/types/question";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Plus, Trash2, FileDown } from "lucide-react";

interface PassageEntry {
  id: string;
  text: string;
  result: string;
}

interface TypeEntry {
  type: QuestionType;
  passages: PassageEntry[];
}

export const QuestionGenerator = () => {
  const [selectedTypes, setSelectedTypes] = useState<TypeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const { toast } = useToast();

  const handleTypeSelect = (type: QuestionType) => {
    if (!selectedTypes.find(entry => entry.type.id === type.id)) {
      setSelectedTypes(prev => [...prev, { type, passages: [{ id: crypto.randomUUID(), text: "", result: "" }] }]);
    }
  };

  const handleRemoveType = (typeId: string) => {
    setSelectedTypes(prev => prev.filter(entry => entry.type.id !== typeId));
  };

  const handleAddPassage = (typeId: string) => {
    setSelectedTypes(prev => prev.map(entry => 
      entry.type.id === typeId 
        ? { ...entry, passages: [...entry.passages, { id: crypto.randomUUID(), text: "", result: "" }] }
        : entry
    ));
  };

  const handleRemovePassage = (typeId: string, passageId: string) => {
    setSelectedTypes(prev => prev.map(entry => 
      entry.type.id === typeId 
        ? { ...entry, passages: entry.passages.filter(p => p.id !== passageId) }
        : entry
    ));
  };

  const handleTextChange = (typeId: string, passageId: string, newText: string) => {
    setSelectedTypes(prev => prev.map(entry => 
      entry.type.id === typeId 
        ? {
            ...entry,
            passages: entry.passages.map(p => 
              p.id === passageId ? { ...p, text: newText } : p
            )
          }
        : entry
    ));
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
    try {
      let currentQuestion = 0;
      const totalQuestions = nonEmptyTypes.reduce((sum, type) => sum + type.passages.length, 0);
      setProgress({ current: 0, total: totalQuestions });
      
      const updatedTypes = [...selectedTypes];
      
      for (let typeIndex = 0; typeIndex < updatedTypes.length; typeIndex++) {
        const typeEntry = updatedTypes[typeIndex];
        const validPassages = typeEntry.passages.filter(p => p.text.trim() !== '');
        
        for (let passageIndex = 0; passageIndex < validPassages.length; passageIndex++) {
          const passage = validPassages[passageIndex];
          try {
            currentQuestion++;
            setProgress({ current: currentQuestion, total: totalQuestions });
            
            const result = await generateQuestion(typeEntry.type, passage.text);
            if (typeof result === 'string') {
              const originalPassageIndex = typeEntry.passages.findIndex(p => p.id === passage.id);
              if (originalPassageIndex !== -1) {
                updatedTypes[typeIndex].passages[originalPassageIndex].result = result;
              }
            }
          } catch (error) {
            console.error(`Error generating question for passage ${passageIndex + 1}:`, error);
            toast({
              title: "오류 발생",
              description: `${passageIndex + 1}번 지문 처리 중 오류가 발생했습니다.`,
              variant: "destructive",
            });
          }
        }
      }
      
      setSelectedTypes(updatedTypes);
      
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

  const handlePasteValues = (typeId: string, passageId: string, values: string[]) => {
    setSelectedTypes(prev => {
      const updatedTypes = [...prev];
      const typeIndex = updatedTypes.findIndex(t => t.type.id === typeId);
      
      if (typeIndex === -1) return prev;
      
      const passageIndex = updatedTypes[typeIndex].passages.findIndex(p => p.id === passageId);
      if (passageIndex === -1) return prev;
      
      updatedTypes[typeIndex].passages[passageIndex].text = values[0];
      
      const remainingValues = values.slice(1);
      const newPassages = remainingValues.map(value => ({
        id: crypto.randomUUID(),
        text: value,
        result: ""
      }));
      
      updatedTypes[typeIndex].passages.splice(passageIndex + 1, 0, ...newPassages);
      
      return updatedTypes;
    });
  };

  // Calculate question numbers once during render
  const generatedQuestions = selectedTypes.flatMap((typeEntry, typeIndex) => 
    typeEntry.passages
      .map((passage, passageIndex) => ({
        id: passage.id,
        content: passage.result,
        questionNumber: typeIndex * 100 + passageIndex + 1 // Ensures unique numbers across types
      }))
      .filter(q => q.content) // Only include questions with results
  ).sort((a, b) => a.questionNumber - b.questionNumber);

  return (
    <div className="flex gap-8">
      <div className="w-72 flex-shrink-0 bg-[#F1F0FB]/50 p-4 rounded-lg border border-[#D6BCFA]/30">
        <TypeSelector 
          selectedTypes={selectedTypes.map(entry => entry.type)} 
          onSelect={handleTypeSelect}
          onRemove={handleRemoveType}
        />
      </div>
      <div className="flex-1 space-y-8">
        {selectedTypes.map((typeEntry) => (
          <div 
            key={typeEntry.type.id} 
            className="space-y-6 p-6 rounded-lg border-2 border-[#9b87f5]/20 relative bg-[#F8F7FF]"
          >
            <h3 className="text-xl font-bold text-[#7E69AB]">{typeEntry.type.name}</h3>
            
            <div className="space-y-4">
              {typeEntry.passages.map((passage, index) => (
                <div key={passage.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold">지문 {index + 1}</h4>
                    {typeEntry.passages.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemovePassage(typeEntry.type.id, passage.id)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  <TextInput 
                    value={passage.text} 
                    onChange={(text) => handleTextChange(typeEntry.type.id, passage.id, text)}
                    onEnterPress={() => handleAddPassage(typeEntry.type.id)}
                    onPaste={(values) => handlePasteValues(typeEntry.type.id, passage.id, values)}
                  />
                </div>
              ))}
            </div>
            
            <Button
              variant="outline"
              onClick={() => handleAddPassage(typeEntry.type.id)}
              className="w-full mt-4"
            >
              <Plus className="w-4 h-4 mr-2" />
              지문 추가하기
            </Button>
          </div>
        ))}

        {selectedTypes.length > 0 && (
          <>
            <div className="flex flex-col gap-4">
              {isLoading && progress.total > 0 && (
                <LoadingProgress 
                  current={progress.current} 
                  total={progress.total}
                />
              )}
              
              <div className="flex justify-center w-full gap-4">
                <Button
                  onClick={handleGenerateAll}
                  disabled={isLoading}
                  className="max-w-md w-full bg-gradient-to-r from-[#9b87f5] to-[#7E69AB] relative group overflow-hidden transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <div className="relative flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                    <span className="font-semibold tracking-wide">
                      {isLoading ? "문제 생성 중..." : "문제 생성하기"}
                    </span>
                  </div>
                </Button>

                <Button
                  onClick={handleDownloadDoc}
                  disabled={isLoading}
                  variant="outline"
                  className="max-w-md w-full relative group overflow-hidden transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl border-[#9b87f5]/30 hover:border-[#9b87f5]/50"
                >
                  <div className="relative flex items-center justify-center gap-2">
                    <FileDown className="w-5 h-5" />
                    <span className="font-semibold tracking-wide">
                      문제 저장하기
                    </span>
                  </div>
                </Button>
              </div>
            </div>

            <div className="space-y-0 bg-[#F8F7FF] p-6 rounded-lg border border-[#D6BCFA]/30">
              {generatedQuestions.map((question) => (
                <GeneratedQuestion 
                  key={question.id}
                  content={question.content}
                  questionNumber={question.questionNumber}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
