import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileDown, Edit, Save, X, Plus, Trash2 } from "lucide-react";
import * as XLSX from 'xlsx';
import { useToast } from "../ui/use-toast";
import { useState } from "react";
import { Input } from "../ui/input";
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface WordEntry {
  word: string;
  meaning: string;
  synonyms: string;
  antonyms: string;
}

interface SynonymTableProps {
  isOpen: boolean;
  onClose: () => void;
  questions: { content: string }[];
}

export const SynonymTable = ({ isOpen, onClose, questions }: SynonymTableProps) => {
  const { toast } = useToast();
  const [editMode, setEditMode] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingEntry, setEditingEntry] = useState<WordEntry | null>(null);

  const parseContent = (content: string) => {
    const lines = content.split('\n').filter(line => line.trim());
    return lines.map(line => {
      const [word, meaning, synonymsAntonyms] = line.split('\t').map(s => s.trim());
      const [synonyms, antonyms] = (synonymsAntonyms || '').split('/').map(s => s.trim());
      return { word, meaning, synonyms, antonyms };
    });
  };

  const [words, setWords] = useState<WordEntry[]>(() => {
    return questions
      .map(q => parseContent(q.content))
      .flat()
      .filter(item => item.word && item.word !== 'Word');
  });

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditingEntry({ ...words[index] });
  };

  const handleSave = (index: number) => {
    if (editingEntry) {
      const newWords = [...words];
      newWords[index] = editingEntry;
      setWords(newWords);
      setEditingIndex(null);
      setEditingEntry(null);
      
      toast({
        title: "변경사항 저장 완료",
        description: "동반어 정보가 성공적으로 수정되었습니다.",
      });
    }
  };

  const handleDelete = (index: number) => {
    const newWords = words.filter((_, i) => i !== index);
    setWords(newWords);
    
    toast({
      title: "항목 삭제 완료",
      description: "선택한 동반어가 삭제되었습니다.",
    });
  };

  const handleAdd = () => {
    const newEntry: WordEntry = {
      word: "",
      meaning: "",
      synonyms: "",
      antonyms: ""
    };
    setWords([...words, newEntry]);
    handleEdit(words.length);
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(words);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "동반어 목록");
    
    XLSX.writeFile(workbook, "동반어_목록.xlsx");
    
    toast({
      title: "엑셀 파일 저장 완료",
      description: "동반어 목록이 엑셀 파일로 저장되었습니다.",
    });
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // @ts-ignore
    doc.autoTable({
      head: [['단어', '의미', '동의어', '반의어']],
      body: words.map(item => [
        item.word,
        item.meaning,
        item.synonyms,
        item.antonyms
      ]),
      styles: {
        font: 'gulim',
        fontSize: 10,
      },
      headStyles: {
        fillColor: [155, 135, 245],
        textColor: 255,
        fontSize: 12,
      },
    });

    doc.save('동반어_목록.pdf');
    
    toast({
      title: "PDF 파일 저장 완료",
      description: "동반어 목록이 PDF 파일로 저장되었습니다.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>동반어 편집기</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Button onClick={handleAdd} variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              새 항목 추가
            </Button>
            <div className="flex gap-2">
              <Button onClick={exportToExcel} className="gap-2">
                <FileDown className="w-4 h-4" />
                엑셀 파일로 저장
              </Button>
              <Button onClick={exportToPDF} variant="secondary" className="gap-2">
                <FileDown className="w-4 h-4" />
                PDF 파일로 저장
              </Button>
            </div>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>단어</TableHead>
                  <TableHead>의미</TableHead>
                  <TableHead>동의어</TableHead>
                  <TableHead>반의어</TableHead>
                  <TableHead className="w-[100px]">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {words.map((item, index) => (
                  <TableRow key={index}>
                    {editingIndex === index ? (
                      <>
                        <TableCell>
                          <Input
                            value={editingEntry?.word || ''}
                            onChange={(e) => setEditingEntry(prev => ({ ...prev!, word: e.target.value }))}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={editingEntry?.meaning || ''}
                            onChange={(e) => setEditingEntry(prev => ({ ...prev!, meaning: e.target.value }))}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={editingEntry?.synonyms || ''}
                            onChange={(e) => setEditingEntry(prev => ({ ...prev!, synonyms: e.target.value }))}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={editingEntry?.antonyms || ''}
                            onChange={(e) => setEditingEntry(prev => ({ ...prev!, antonyms: e.target.value }))}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleSave(index)}
                            >
                              <Save className="w-4 h-4 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingIndex(null);
                                setEditingEntry(null);
                              }}
                            >
                              <X className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell className="font-medium">{item.word}</TableCell>
                        <TableCell>{item.meaning}</TableCell>
                        <TableCell>{item.synonyms}</TableCell>
                        <TableCell>{item.antonyms}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(index)}
                            >
                              <Edit className="w-4 h-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(index)}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    )}
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