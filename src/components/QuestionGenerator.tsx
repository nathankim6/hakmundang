import { TypeSelector } from "./TypeSelector";
import { LoadingProgress } from "./LoadingProgress";
import { TypeEntry } from "./question/TypeEntry";
import { GeneratedQuestions } from "./question/GeneratedQuestions";
import { ActionButtons } from "./question/ActionButtons";
import { QuestionProvider } from "./question/QuestionContext";
import { useQuestionState } from "./question/QuestionState";
import { useQuestionActions } from "./question/QuestionActions";

export const QuestionGenerator = () => {
  const {
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
    toast
  } = useQuestionState();

  const { handleGenerateAll, handleDownloadDoc } = useQuestionActions({
    selectedTypes,
    setIsLoading,
    setProgress,
    setSelectedTypes: (types) => selectedTypes.splice(0, selectedTypes.length, ...types),
    toast
  });

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

  const contextValue = {
    selectedTypes,
    isLoading,
    progress,
    onTypeSelect: handleTypeSelect,
    onRemoveType: handleRemoveType,
    onAddPassage: handleAddPassage,
    onRemovePassage: handleRemovePassage,
    onTextChange: handleTextChange,
    onPasteValues: handlePasteValues,
  };

  return (
    <QuestionProvider value={contextValue}>
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
    </QuestionProvider>
  );
};