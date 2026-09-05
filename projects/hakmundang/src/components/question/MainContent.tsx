
import { Star } from "lucide-react";
import { TypeEntry } from "./TypeEntry";
import { LoadingProgress } from "../LoadingProgress";
import { ActionButtons } from "./ActionButtons";
import { GeneratedQuestions } from "./GeneratedQuestions";

interface MainContentProps {
  selectedTypes: any[];
  isLoading: boolean;
  progress: { current: number; total: number };
  handleAddPassage: (typeId: string) => void;
  handleRemovePassage: (typeId: string, passageId: string) => void;
  handleTextChange: (typeId: string, passageId: string, text: string) => void;
  handlePasteValues: (typeId: string, passageId: string, values: string[]) => void;
  handleRemoveType: (typeId: string) => void;
  handleGenerateAll: () => void;
  handleDownloadDoc: () => void;
  difficulty: string;
  handleDifficultyChange: (level: string) => void;
  handleStopGeneration: () => void;
  generatedQuestions: any[];
  onRefreshQuestion: (questionId: string, newContent: string) => void;
}

export const MainContent = ({
  selectedTypes,
  isLoading,
  progress,
  handleAddPassage,
  handleRemovePassage,
  handleTextChange,
  handlePasteValues,
  handleRemoveType,
  handleGenerateAll,
  handleDownloadDoc,
  difficulty,
  handleDifficultyChange,
  handleStopGeneration,
  generatedQuestions,
  onRefreshQuestion
}: MainContentProps) => {
  return (
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

          <ActionButtons
            onGenerate={handleGenerateAll}
            handleDownloadDoc={handleDownloadDoc}
            isLoading={isLoading}
            difficulty={difficulty}
            onDifficultyChange={handleDifficultyChange}
            onStopGeneration={handleStopGeneration}
          />

          <GeneratedQuestions questions={generatedQuestions} onRefresh={onRefreshQuestion} />
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
  );
};
