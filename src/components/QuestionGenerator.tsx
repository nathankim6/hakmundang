import { TypeSelector } from "./TypeSelector";
import { LoadingProgress } from "./LoadingProgress";
import { TypeEntry } from "./question/TypeEntry";
import { GeneratedQuestions } from "./question/GeneratedQuestions";
import { ActionButtons } from "./buttons/ActionButtons";
import { QuestionProvider } from "./question/QuestionContext";
import { useQuestionState } from "./question/QuestionState";
import { useQuestionActions } from "./question/QuestionActions";
import { Star } from "lucide-react";
import { useState } from "react";
import { ActionButtons as QuestionActionButtons } from "./question/ActionButtons";

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

  const [showVocabModal, setShowVocabModal] = useState(false);

  const generatedQuestions = selectedTypes.flatMap((typeEntry) => 
    typeEntry.passages
      .map((passage) => ({
        id: passage.id,
        content: passage.result,
        questionNumber: 0,
        originalText: typeEntry.type.id === "weekendClinic" ? passage.text : undefined
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
        {/* Type Selector Frame - Now positioned on the left */}
        <div className="w-80 flex-shrink-0">
          <div className="sticky top-8">
            <div className="bg-gradient-to-r from-white/80 via-gray-50/50 to-white/80 shadow-lg border border-gray-200 backdrop-blur-sm p-4 rounded-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#E5E7EB]/40 to-[#9CA3AF]/30 opacity-70 animate-gradient"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(156,163,175,0.3),transparent_70%)] mix-blend-overlay"></div>
              <div className="relative z-10">
                <TypeSelector 
                  selectedTypes={selectedTypes.map(entry => entry.type)} 
                  onSelect={handleTypeSelect}
                  onRemove={handleRemoveType}
                />
              </div>
            </div>
            
            {/* Action Buttons now positioned below TypeSelector */}
            <div className="mt-4">
              <ActionButtons 
                openVocabModal={() => setShowVocabModal(true)}
              />
            </div>
          </div>
        </div>

        {/* Main Content Area */}
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
                  onRemoveType={handleRemoveType}
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
              </div>

              <QuestionActionButtons
                onGenerate={handleGenerateAll}
                onDownload={handleDownloadDoc}
                isLoading={isLoading}
              />

              <GeneratedQuestions questions={generatedQuestions} />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-[800px] bg-[#F1F0FB]/30 rounded-lg border-2 border-dashed border-[#D6BCFA]/30 p-8 space-y-4">
              <div className="relative">
                <Star 
                  className="w-24 h-24 text-[#FFD700] animate-bounce filter drop-shadow-lg
                    after:content-[''] after:absolute after:inset-0 after:bg-yellow-200/30 
                    after:blur-lg after:animate-pulse"
                  strokeWidth={1.5}
                  fill="#FFD700"
                />
                <div className="absolute inset-0 animate-ping">
                  <Star 
                    className="w-24 h-24 text-[#FFD700] opacity-20"
                    strokeWidth={1.5}
                  />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold text-[#1A1F2C]">문제 유형을 선택해주세요</h3>
                <p className="text-sm text-[#6B7280]">원하는 문제 유형을 선택하면<br />지문 입력 및 문제생성 기능이 활성됩니다.</p>
              </div>
            </div>
          )}
        </div>
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