import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Book, Download, Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import { VocabularyPDF } from "./vocabulary/VocabularyPDF";
import { VocabularyEntryType } from "./vocabulary/types";
import { generateQuestion } from "@/lib/claude";

interface VocabularyListModalProps {
  content: string;
}

export const VocabularyListModal = ({ content }: VocabularyListModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [vocabularyList, setVocabularyList] = useState<VocabularyEntryType[]>([]);

  const parseContent = async (text: string) => {
    setIsLoading(true);
    try {
      const entries: VocabularyEntryType[] = [];
      const lines = text.split('\n');
      
      for (const line of lines) {
        if (line.includes('|')) {
          const cells = line.split('|').map(cell => cell.trim()).filter(Boolean);
          if (cells.length >= 2 && !line.includes('표제어')) {
            // Get English definition and part of speech from Claude
            const prompt = `Please provide the part of speech and English dictionary definition for the word "${cells[0]}". Format: "partOfSpeech|definition"`;
            const response = await generateQuestion({ id: "vocabulary", name: "Vocabulary" }, prompt);
            const [partOfSpeech, definition] = response.split('|');

            const entry: VocabularyEntryType = {
              word: cells[0],
              meaning: cells[1],
              partOfSpeech: partOfSpeech || cells[2] || 'n/a',
              definition: definition || '',
              difficulty: Math.floor(Math.random() * 3) + 1,
              synonyms: [],
              antonyms: []
            };

            if (cells[4] && cells[5]) {
              entry.synonyms.push({
                word: cells[4],
                meaning: cells[5]
              });
            }

            if (cells[6] && cells[7]) {
              entry.antonyms.push({
                word: cells[6],
                meaning: cells[7]
              });
            }

            entries.push(entry);
          }
        }
      }
      
      setVocabularyList(entries);
    } catch (error) {
      console.error("Error parsing content:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const blob = await pdf(<VocabularyPDF vocabularyList={vocabularyList} />).toBlob();
      saveAs(blob, 'vocabulary_list.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2 bg-gradient-to-r from-[#9b87f5] to-[#D6BCFA] text-white hover:from-[#8E9196] hover:to-[#D6BCFA] transition-all duration-300"
          onClick={() => parseContent(content)}
        >
          <Book className="w-4 h-4" />
          단어장 보기
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-[#9b87f5] to-[#D6BCFA] bg-clip-text text-transparent">
            Vocabulary List
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex justify-end mb-4">
          <Button
            onClick={generatePDF}
            disabled={isGeneratingPDF || isLoading}
            className="gap-2"
          >
            {isGeneratingPDF ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            PDF 다운로드
          </Button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-8 space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-[#9b87f5]" />
            <p className="text-lg font-medium text-gray-600">단어장 생성 중...</p>
          </div>
        ) : (
          <div className="rounded-lg border border-[#D6BCFA]/30 overflow-hidden">
            <Table>
              <TableHeader className="bg-gradient-to-r from-[#F1F0FB] to-[#E5DEFF] sticky top-0 z-10">
                <TableRow>
                  <TableHead className="font-bold text-[#222222] w-[25%]">단어 / 품사 / 정의</TableHead>
                  <TableHead className="font-bold text-[#222222] w-[25%]">의미</TableHead>
                  <TableHead className="font-bold text-[#222222] w-[25%]">동의어</TableHead>
                  <TableHead className="font-bold text-[#222222] w-[25%]">반의어</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vocabularyList.map((entry, index) => (
                  <TableRow 
                    key={index}
                    className={index % 2 === 0 ? 'bg-white hover:bg-[#F8F7FF] transition-colors' : 'bg-[#F8F7FF] hover:bg-[#F1F0FB] transition-colors'}
                  >
                    <TableCell className="font-medium border-r border-[#D6BCFA]/10">
                      <div className="flex flex-col">
                        <span className="text-lg font-bold text-[#7E69AB]">{entry.word}</span>
                        <span className="text-yellow-500">{'⭐'.repeat(entry.difficulty)}</span>
                        <span className="text-sm text-gray-600">{entry.partOfSpeech}</span>
                        <span className="text-xs text-gray-500 italic">{entry.definition}</span>
                      </div>
                    </TableCell>
                    <TableCell className="border-r border-[#D6BCFA]/10">
                      <div className="text-sm">{entry.meaning}</div>
                    </TableCell>
                    <TableCell className="border-r border-[#D6BCFA]/10">
                      <div className="space-y-2">
                        {entry.synonyms.map((syn, i) => (
                          <div key={i} className="text-[#7E69AB]">
                            <span className="font-medium">{syn.word}</span>
                            <span className="text-sm text-gray-600 ml-2">- {syn.meaning}</span>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        {entry.antonyms.map((ant, i) => (
                          <div key={i} className="text-[#9b87f5]">
                            <span className="font-medium">{ant.word}</span>
                            <span className="text-sm text-gray-600 ml-2">- {ant.meaning}</span>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};