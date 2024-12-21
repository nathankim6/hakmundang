import { QuestionType } from "@/types/question";
import { getQuestionTypes } from "@/lib/claude";
import { ScrollArea } from "./ui/scroll-area";

interface TypeSelectorProps {
  selectedType: QuestionType | null;
  onSelect: (type: QuestionType) => void;
}

export const TypeSelector = ({ selectedType, onSelect }: TypeSelectorProps) => {
  const types = getQuestionTypes();
  const suneungTypes = types.slice(0, 15);
  const schoolTypes = types.slice(15, 22);
  const descriptiveTypes = types.slice(22);

  const CategoryTitle = ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-lg font-semibold bg-gradient-to-r from-primary/80 to-primary/40 bg-clip-text text-transparent py-2 drop-shadow-[0_0_8px_rgba(155,135,245,0.3)]">
      {children}
    </h3>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold animate-title flex items-center gap-3">
        <span className="text-3xl">✨</span> Question Types
      </h2>
      
      <ScrollArea className="h-[70vh] pr-4">
        <div className="space-y-6">
          <div className="space-y-2">
            <CategoryTitle>수능형</CategoryTitle>
            <div className="grid gap-2">
              {suneungTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => onSelect(type)}
                  className={`metallic-button-type group relative overflow-hidden rounded-lg px-4 py-3 ${
                    selectedType?.id === type.id ? "selected" : ""
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-br from-[#9b87f5]/10 to-[#D946EF]/5 rounded-lg" />
                  <div className="absolute inset-[1px] bg-black/80 rounded-lg backdrop-blur-xl" />
                  <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#9b87f5] to-[#D946EF] font-medium">
                    {type.name}
                  </span>
                  <div className="absolute inset-0 rounded-lg ring-1 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300" />
                  <div className="absolute -inset-[1px] bg-gradient-to-r from-primary/30 to-[#D946EF]/30 rounded-lg opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-300 -z-10" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <CategoryTitle>학교별 시그니처</CategoryTitle>
            <div className="grid gap-2">
              {schoolTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => onSelect(type)}
                  className={`metallic-button-type group relative overflow-hidden rounded-lg px-4 py-3 ${
                    selectedType?.id === type.id ? "selected" : ""
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-br from-[#9b87f5]/10 to-[#D946EF]/5 rounded-lg" />
                  <div className="absolute inset-[1px] bg-black/80 rounded-lg backdrop-blur-xl" />
                  <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#9b87f5] to-[#D946EF] font-medium">
                    {type.name}
                  </span>
                  <div className="absolute inset-0 rounded-lg ring-1 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300" />
                  <div className="absolute -inset-[1px] bg-gradient-to-r from-primary/30 to-[#D946EF]/30 rounded-lg opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-300 -z-10" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <CategoryTitle>서술형</CategoryTitle>
            <div className="grid gap-2">
              {descriptiveTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => onSelect(type)}
                  className={`metallic-button-type group relative overflow-hidden rounded-lg px-4 py-3 ${
                    selectedType?.id === type.id ? "selected" : ""
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-br from-[#9b87f5]/10 to-[#D946EF]/5 rounded-lg" />
                  <div className="absolute inset-[1px] bg-black/80 rounded-lg backdrop-blur-xl" />
                  <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#9b87f5] to-[#D946EF] font-medium">
                    {type.name}
                  </span>
                  <div className="absolute inset-0 rounded-lg ring-1 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300" />
                  <div className="absolute -inset-[1px] bg-gradient-to-r from-primary/30 to-[#D946EF]/30 rounded-lg opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-300 -z-10" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};