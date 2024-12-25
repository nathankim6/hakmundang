import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Save, X, Trash2 } from "lucide-react";
import { useToast } from "../ui/use-toast";
import { useState } from "react";
import { Input } from "../ui/input";
import { WordEntry } from "@/types/word";
import { SynonymTableActions } from "./SynonymTableActions";

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

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>동반어 편집기</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <SynonymTableActions words={words} onAdd={handleAdd} />

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