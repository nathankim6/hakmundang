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
    toast
  });

  const generatedQuestions = selectedTypes.flatMap((typeEntry) => 
    typeEntry.passages
      .map((passage) => ({
        id: passage.id,
        content: passage.result,
        questionNumber: 0
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
        <div className="w-80 flex-shrink-0 bg-[#F1F0FB]/50 p-4 rounded-lg border border-[#D6BCFA]/30">
          <TypeSelector 
            selectedTypes={selectedTypes.map(entry => entry.type)} 
            onSelect={handleTypeSelect}
            onRemove={handleRemoveType}
          />
        </div>
        <div className="flex-1 space-y-8">
          {selectedTypes.length > 0 ? (
            <>
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

              <div className="flex flex-col gap-4">
                {isLoading && progress.total > 0 && (
                  <LoadingProgress 
                    current={progress.current} 
                    total={progress.total}
                    onStop={handleStopGeneration}
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
          ) : (
            <div className="flex flex-col items-center justify-center h-[400px] bg-[#F1F0FB]/30 rounded-lg border-2 border-dashed border-[#D6BCFA]/30 p-8 space-y-4">
              <img 
                src="/lovable-uploads/352a49ca-b123-4f07-992a-cf59e4b7058a.png" 
                alt="ORUN ACADEMY Logo" 
                className="w-24 h-24 object-contain opacity-50"
              />
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold text-[#1A1F2C]">문제 유형을 선택해주세요</h3>
                <p className="text-sm text-[#6B7280]">왼쪽 메뉴에서 원하는 문제 유형을 선택하면<br />지문 입력 및 문제생성 기능이 활성됩니다.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </QuestionProvider>
  );
};