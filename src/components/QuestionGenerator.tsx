import { useState } from "react";
import { TypeSelector } from "./TypeSelector";
import { LoadingProgress } from "./LoadingProgress";
import { generateQuestion } from "@/lib/claude";
import { generateDocument } from "@/utils/documentGenerator";
import { QuestionType } from "@/types/question";
import { useToast } from "@/hooks/use-toast";
import { TypeEntry } from "./question/TypeEntry";
import { GeneratedQuestions } from "./question/GeneratedQuestions";
import { ActionButtons } from "./question/ActionButtons";

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
    const totalQuestions = nonEmptyTypes.reduce((sum, type) => sum + type.passages.length, 0);
    setProgress({ current: 0, total: totalQuestions });
    
    try {
      const updatedTypes = [...selectedTypes];
      let currentQuestion = 0;

      for (const typeEntry of updatedTypes) {
        const validPassages = typeEntry.passages.filter(p => p.text.trim() !== '');
        
        for (const passage of validPassages) {
          try {
            // Process one passage at a time
            const result = await generateQuestion(typeEntry.type, passage.text);
            
            // Update the result in the state
            const typeIndex = updatedTypes.findIndex(t => t.type.id === typeEntry.type.id);
            const passageIndex = updatedTypes[typeIndex].passages.findIndex(p => p.id === passage.id);
            
            if (typeIndex !== -1 && passageIndex !== -1) {
              updatedTypes[typeIndex].passages[passageIndex].result = result;
            }

            // Update progress
            currentQuestion++;
            setProgress({ current: currentQuestion, total: totalQuestions });
            
            // Update state after each passage is processed
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

  // Generate questions array with sequential numbers
  const generatedQuestions = selectedTypes.flatMap((typeEntry) => 
    typeEntry.passages
      .map((passage) => ({
        id: passage.id,
        content: passage.result,
        questionNumber: 0 // This will be assigned sequentially in GeneratedQuestions
      }))
      .filter(q => q.content)
  );

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
          <TypeEntry
            key={typeEntry.type.id}
            type={typeEntry.type}
            passages={typeEntry.passages}
            onAddPassage={handleAddPassage}
            onRemovePassage={handleRemovePassage}
            onTextChange={handleTextChange}
            onPasteValues={handlePasteValues}
          />
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
              
              <ActionButtons
                onGenerate={handleGenerateAll}
                onDownload={handleDownloadDoc}
                isLoading={isLoading}
              />
            </div>

            <GeneratedQuestions questions={generatedQuestions} />
          </>
        )}
      </div>
    </div>
  );
};