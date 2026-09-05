
import { useState } from "react";
import { QuestionType, TypeEntry, PassageEntry } from "@/types/question";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";

export const useQuestionState = () => {
  const [selectedTypes, setSelectedTypes] = useState<TypeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [difficulty, setDifficulty] = useState("1");
  const [complexity, setComplexity] = useState("수능");
  const { toast } = useToast();
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const handleTypeSelect = (type: QuestionType) => {
    try {
      if (selectedTypes.some((entry) => entry.type.id === type.id)) {
        toast({
          title: "중복 선택",
          description: "이미 선택된 문제 유형입니다.",
          variant: "destructive",
        });
        return;
      }

      setSelectedTypes((prev) => [
        ...prev,
        {
          type,
          passages: [{ id: uuidv4(), text: "", result: "" }],
        },
      ]);

      console.log(`Added type: ${type.id}`);
    } catch (error) {
      console.error("Error adding type:", error);
      toast({
        title: "오류 발생",
        description: "문제 유형을 추가하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveType = (typeId: string) => {
    try {
      setSelectedTypes((prev) => {
        const newTypes = prev.filter((entry) => entry.type.id !== typeId);
        console.log(`Removed type: ${typeId}. New types:`, newTypes);
        return newTypes;
      });
    } catch (error) {
      console.error("Error removing type:", error);
      toast({
        title: "오류 발생",
        description: "문제 유형을 제거하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveAllTypes = () => {
    try {
      setSelectedTypes([]);
      console.log("Removed all types");
      toast({
        title: "모든 유형 제거",
        description: "선택된 모든 문제 유형이 제거되었습니다.",
      });
    } catch (error) {
      console.error("Error removing all types:", error);
      toast({
        title: "오류 발생",
        description: "모든 유형을 제거하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleAddPassage = (typeId: string) => {
    setSelectedTypes(
      selectedTypes.map((entry) =>
        entry.type.id === typeId
          ? {
              ...entry,
              passages: [
                ...entry.passages,
                { id: uuidv4(), text: "", result: "" },
              ],
            }
          : entry
      )
    );
  };

  const handleRemovePassage = (typeId: string, passageId: string) => {
    setSelectedTypes(
      selectedTypes.map((entry) =>
        entry.type.id === typeId
          ? {
              ...entry,
              passages: entry.passages.filter((p) => p.id !== passageId),
            }
          : entry
      )
    );
  };

  const handleTextChange = (
    typeId: string,
    passageId: string,
    newText: string
  ) => {
    setSelectedTypes(
      selectedTypes.map((entry) =>
        entry.type.id === typeId
          ? {
              ...entry,
              passages: entry.passages.map((passage) =>
                passage.id === passageId
                  ? { ...passage, text: newText }
                  : passage
              ),
            }
          : entry
      )
    );
  };

  const handlePasteValues = (
    typeId: string,
    passageId: string,
    values: string[]
  ) => {
    if (values.length === 0) return;
    
    const updatedTypes = [...selectedTypes];
    const typeIndex = updatedTypes.findIndex((t) => t.type.id === typeId);
    
    if (typeIndex === -1) return;
    
    // Find current passages for this type
    const currentPassages = [...updatedTypes[typeIndex].passages];
    
    // Find the index of the passage where the paste operation started
    const startPassageIndex = currentPassages.findIndex(p => p.id === passageId);
    if (startPassageIndex === -1) return;
    
    // Update the first passage with the first value
    currentPassages[startPassageIndex].text = values[0];
    
    // For each additional value, either update existing passage or add new one
    for (let i = 1; i < values.length; i++) {
      const targetIndex = startPassageIndex + i;
      
      if (targetIndex < currentPassages.length) {
        // Update existing passage
        currentPassages[targetIndex].text = values[i];
      } else {
        // Add new passage
        currentPassages.push({
          id: uuidv4(),
          text: values[i],
          result: ""
        });
      }
    }
    
    // Update the state with the new passages
    updatedTypes[typeIndex].passages = currentPassages;
    setSelectedTypes(updatedTypes);
    
    console.log(`Pasted ${values.length} values into type ${typeId}, resulting in ${currentPassages.length} passages`);
  };

  const handleStopGeneration = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsLoading(false);
      setProgress({ current: 0, total: 0 });
      toast({
        title: "생성 중단",
        description: "문제 생성이 중단되었습니다.",
      });
    }
  };

  const handleDifficultyChange = (level: string) => {
    setDifficulty(level);
  };

  const handleComplexityChange = (level: string) => {
    setComplexity(level);
  };

  return {
    selectedTypes,
    isLoading,
    setIsLoading,
    progress,
    setProgress,
    difficulty,
    complexity,
    handleDifficultyChange,
    handleComplexityChange,
    handleTypeSelect,
    handleRemoveType,
    handleRemoveAllTypes,
    handleAddPassage,
    handleRemovePassage,
    handleTextChange,
    handlePasteValues,
    handleStopGeneration,
    setAbortController,
    toast,
  };
};
