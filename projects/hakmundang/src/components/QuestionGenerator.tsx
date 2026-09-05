
import { useState } from "react";
import { QuestionProvider } from "./question/QuestionContext";
import { useQuestionState } from "./question/QuestionState";
import { useQuestionActions } from "./question/QuestionActions";
import { Sidebar } from "./question/Sidebar";
import { MainContent } from "./question/MainContent";

export const QuestionGenerator = () => {
  const {
    selectedTypes,
    isLoading,
    setIsLoading,
    progress,
    setProgress,
    difficulty,
    handleDifficultyChange,
    handleTypeSelect,
    handleRemoveType,
    handleAddPassage,
    handleRemovePassage,
    handleTextChange,
    handlePasteValues,
    handleStopGeneration,
    setAbortController,
    toast
  } = useQuestionState();

  const { handleGenerateAll, handleDownloadDoc } = useQuestionActions({
    selectedTypes,
    setIsLoading,
    setProgress,
    setSelectedTypes: (types) => selectedTypes.splice(0, selectedTypes.length, ...types),
    setAbortController,
    difficulty,
    toast
  });

  const [showVocabModal, setShowVocabModal] = useState(false);

  const handleRefreshQuestion = (questionId: string, newContent: string) => {
    const updatedTypes = selectedTypes.map(typeEntry => ({
      ...typeEntry,
      passages: typeEntry.passages.map(passage => 
        passage.id === questionId 
          ? { ...passage, result: newContent }
          : passage
      )
    }));
    
    selectedTypes.splice(0, selectedTypes.length, ...updatedTypes);
  };

  const generatedQuestions = selectedTypes.flatMap((typeEntry) => 
    typeEntry.passages
      .map((passage) => ({
        id: passage.id,
        content: passage.result,
        questionNumber: 0,
        originalText: passage.text,
        type: typeEntry.type.id
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
        <Sidebar
          selectedTypes={selectedTypes}
          handleTypeSelect={handleTypeSelect}
          handleRemoveType={handleRemoveType}
          handleGenerateAll={handleGenerateAll}
          isLoading={isLoading}
          difficulty={difficulty}
          handleDifficultyChange={handleDifficultyChange}
          handleStopGeneration={handleStopGeneration}
          handleDownloadDoc={handleDownloadDoc}
          openVocabModal={() => setShowVocabModal(true)}
        />

        <MainContent
          selectedTypes={selectedTypes}
          isLoading={isLoading}
          progress={progress}
          handleAddPassage={handleAddPassage}
          handleRemovePassage={handleRemovePassage}
          handleTextChange={handleTextChange}
          handlePasteValues={handlePasteValues}
          handleRemoveType={handleRemoveType}
          handleGenerateAll={handleGenerateAll}
          handleDownloadDoc={handleDownloadDoc}
          difficulty={difficulty}
          handleDifficultyChange={handleDifficultyChange}
          handleStopGeneration={handleStopGeneration}
          generatedQuestions={generatedQuestions}
          onRefreshQuestion={handleRefreshQuestion}
        />
      </div>

      {/* Vocab Modal */}
      {showVocabModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white w-[95vw] h-[95vh] rounded-lg shadow-2xl relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowVocabModal(false)}
            >
              ✕
            </button>
            <iframe
              src="https://vocabulary-voyage.lovable.app/"
              className="w-full h-full rounded-lg"
              title="Vocabulary Generator"
            />
          </div>
        </div>
      )}
    </QuestionProvider>
  );
};
