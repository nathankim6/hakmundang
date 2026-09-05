import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { generateTextFile, downloadTextFile } from "@/utils/textFileGenerator";

interface Question {
  id: string;
  content: string;
  questionNumber: number;
}

interface DownloadButtonProps {
  questions: Question[];
}

export const DownloadButton = ({ questions }: DownloadButtonProps) => {
  const handleSaveToTxt = () => {
    const content = generateTextFile(questions);
    downloadTextFile(content, '문제와정답.txt');
  };

  return (
    <div className="flex justify-center mt-8">
      <Button
        onClick={handleSaveToTxt}
        variant="outline"
        className="max-w-md w-full relative group overflow-hidden transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl border-[#9b87f5]/30 hover:border-[#9b87f5]/50"
      >
        <div className="relative flex items-center justify-center gap-2">
          <FileDown className="w-5 h-5" />
          <span className="font-semibold tracking-wide">
            문제 저장하기
          </span>
        </div>
      </Button>
    </div>
  );
};