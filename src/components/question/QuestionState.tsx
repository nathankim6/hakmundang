import { useState } from "react";
import { QuestionType, TypeEntry, PassageEntry } from "@/types/question";
import { useToast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from "uuid";

export const useQuestionState = () => {
  const [selectedTypes, setSelectedTypes] = useState<TypeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const { toast } = useToast();
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const handleTypeSelect = (type: QuestionType) => {
    if (selectedTypes.some((entry) => entry.type.id === type.id)) {
      toast({
        title: "중복 선택",
        description: "이미 선택된 문제 유형입니다.",
        variant: "destructive",
      });
      return;
    }

    setSelectedTypes([
      ...selectedTypes,
      {
        type,
        passages: [{ id: uuidv4(), text: "", result: "" }],
      },
    ]);
  };

  const handleRemoveType = (typeId: string) => {
    setSelectedTypes(selectedTypes.filter((entry) => entry.type.id !== typeId));
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
    const updatedTypes = [...selectedTypes];
    const typeIndex = updatedTypes.findIndex((t) => t.type.id === typeId);

    if (typeIndex === -1) return;

    const passageIndex = updatedTypes[typeIndex].passages.findIndex(
      (p) => p.id === passageId
    );

    if (passageIndex === -1) return;

    // Update the first passage with the first value
    updatedTypes[typeIndex].passages[passageIndex].text = values[0];

    // Add new passages for the remaining values
    const newPassages: PassageEntry[] = values.slice(1).map((text) => ({
      id: uuidv4(),
      text,
      result: "",
    }));

    updatedTypes[typeIndex].passages.push(...newPassages);
    setSelectedTypes(updatedTypes);
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

  return {
    selectedTypes,
    isLoading,
    setIsLoading,
    progress,
    setProgress,
    handleTypeSelect,
    handleRemoveType,
    handleAddPassage,
    handleRemovePassage,
    handleTextChange,
    handlePasteValues,
    handleStopGeneration,
    setAbortController,
    toast,
  };
};