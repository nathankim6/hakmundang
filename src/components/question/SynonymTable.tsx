import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileDown } from "lucide-react";
import * as XLSX from 'xlsx';
import { useToast } from "../ui/use-toast";

interface SynonymTableProps {
  isOpen: boolean;
  onClose: () => void;
  questions: { content: string }[];
}

export const SynonymTable = ({ isOpen, onClose, questions }: SynonymTableProps) => {
  const { toast } = useToast();

  const parseContent = (content: string) => {
    const lines = content.split('\n').filter(line => line.trim());
    return lines.map(line => {
      const [word, meaning, synonymsAntonyms] = line.split('\t').map(s => s.trim());
      return { word, meaning, synonymsAntonyms };
    });
  };

  const allWords = questions
    .map(q => parseContent(q.content))
    .flat()
    .filter(item => item.word && item.word !== 'Word');

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(allWords);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Synonyms & Antonyms");
    
    XLSX.writeFile(workbook, "synonyms_antonyms.xlsx");
    
    toast({
      title: "엑셀 파일 저장 완료",
      description: "동의어/반의어 목록이 엑셀 파일로 저장되었습니다.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>동의어/반의어 목록</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={exportToExcel} className="gap-2">
              <FileDown className="w-4 h-4" />
              엑셀 파일로 저장
            </Button>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>단어</TableHead>
                  <TableHead>의미</TableHead>
                  <TableHead>동의어/반의어</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allWords.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.word}</TableCell>
                    <TableCell>{item.meaning}</TableCell>
                    <TableCell>{item.synonymsAntonyms}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};