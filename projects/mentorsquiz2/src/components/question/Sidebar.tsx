import { TypeSelector } from "../TypeSelector";
import { ActionButtons } from "../buttons/ActionButtons";
import { Book, Feather } from "lucide-react";
import { TypeEntry as TypeEntryType } from "@/types/question";

interface SidebarProps {
  selectedTypes: TypeEntryType[];
  handleTypeSelect: (type: any) => void;
  handleRemoveType: (typeId: string) => void;
  handleGenerateAll: () => void;
  isLoading: boolean;
  difficulty: string;
  complexity: string;
  handleDifficultyChange: (level: string) => void;
  handleComplexityChange: (level: string) => void;
  handleStopGeneration: () => void;
  handleDownloadDoc: () => void;
  openVocabModal: () => void;
}

export const Sidebar = ({
  selectedTypes,
  handleTypeSelect,
  handleRemoveType,
  handleGenerateAll,
  isLoading,
  difficulty,
  complexity,
  handleDifficultyChange,
  handleComplexityChange,
  handleStopGeneration,
  handleDownloadDoc,
  openVocabModal
}: SidebarProps) => {
  return (
    <div className="w-80 flex-shrink-0">
      <div className="sticky top-8 z-50">
        <div className="bg-gradient-to-br from-gray-100 via-[#F5F5F7] to-[#EAEAEC] shadow-lg border border-gray-200/40 backdrop-blur-sm p-4 rounded-lg relative overflow-hidden group">
          <div className="absolute inset-0 opacity-[0.03]">
            <div className="absolute inset-0" 
              style={{
                backgroundImage: `
                  repeating-linear-gradient(
                    45deg,
                    rgba(75, 75, 75, 0.08),
                    rgba(75, 75, 75, 0.08) 2px,
                    transparent 2px,
                    transparent 8px
                  ),
                  repeating-linear-gradient(
                    -45deg,
                    rgba(100, 100, 100, 0.08),
                    rgba(100, 100, 100, 0.08) 2px,
                    transparent 2px,
                    transparent 8px
                  )
                `
              }}
            />
          </div>
          
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(75,75,75,0.05),transparent_70%)] mix-blend-overlay"></div>
          
          <div className="absolute top-0 left-0 w-16 h-16 opacity-15">
            <div className="absolute top-4 left-4 w-8 h-[1px] bg-gray-600 rotate-45"></div>
            <div className="absolute top-6 left-6 w-6 h-[1px] bg-gray-500 -rotate-45"></div>
          </div>
          <div className="absolute bottom-0 right-0 w-16 h-16 opacity-15">
            <div className="absolute bottom-4 right-4 w-8 h-[1px] bg-gray-600 -rotate-45"></div>
            <div className="absolute bottom-6 right-6 w-6 h-[1px] bg-gray-500 rotate-45"></div>
          </div>
          
          <div className="absolute top-4 right-4 w-1.5 h-1.5 bg-gray-600 rounded-full opacity-40 animate-pulse"></div>
          <div className="absolute bottom-4 left-4 w-1.5 h-1.5 bg-gray-500 rounded-full opacity-40 animate-pulse delay-300"></div>
          
          <div className="absolute -right-6 top-1/3 transform -rotate-90 opacity-[0.07]">
            <Book className="w-24 h-24 text-gray-600" />
          </div>
          <div className="absolute -left-6 bottom-1/3 transform rotate-90 opacity-[0.07]">
            <Feather className="w-24 h-24 text-gray-500" />
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          
          <div className="relative z-10">
            <TypeSelector 
              selectedTypes={selectedTypes.map(entry => entry.type)} 
              onSelect={handleTypeSelect}
              onRemove={handleRemoveType}
            />
          </div>
        </div>
        
        <div className="mt-4">
          <ActionButtons 
            onGenerate={handleGenerateAll}
            isLoading={isLoading}
            difficulty={difficulty}
            complexity={complexity}
            onDifficultyChange={handleDifficultyChange}
            onComplexityChange={handleComplexityChange}
            onStopGeneration={handleStopGeneration}
            handleDownloadDoc={handleDownloadDoc}
            openVocabModal={openVocabModal}
          />
        </div>
      </div>
    </div>
  );
};
