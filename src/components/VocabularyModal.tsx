import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileDown, Plus, Edit2 } from "lucide-react";
import { Document, Paragraph, Table, TableRow, TableCell, Packer, AlignmentType, BorderStyle } from "docx";
import { saveAs } from "file-saver";

interface VocabularyModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
}

interface VocabularyEntry {
  headword: string;
  meaning: string;
  synonyms: string;
  synonymMeanings: string;
  antonyms: string;
  antonymMeanings: string;
}

export const VocabularyModal = ({ isOpen, onClose, content }: VocabularyModalProps) => {
  const [title, setTitle] = useState("Vocabulary List");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [vocabularyList, setVocabularyList] = useState<VocabularyEntry[]>(() => parseTableContent(content));
  const [newEntry, setNewEntry] = useState<VocabularyEntry>({
    headword: '',
    meaning: '',
    synonyms: '',
    synonymMeanings: '',
    antonyms: '',
    antonymMeanings: ''
  });
  const [isAddingEntry, setIsAddingEntry] = useState(false);

  // Parse the table content from the string
  function parseTableContent(content: string): VocabularyEntry[] {
    const lines = content.split('\n');
    const tableData: VocabularyEntry[] = [];
    
    let isInTable = false;
    lines.forEach(line => {
      if (line.includes('|')) {
        const cells = line.split('|')
          .map(cell => cell.trim())
          .filter(cell => cell !== '');
        if (cells.length >= 6 && !line.includes('표제어')) {
          tableData.push({
            headword: cells[0],
            meaning: cells[1],
            synonyms: cells[2],
            synonymMeanings: cells[3],
            antonyms: cells[4],
            antonymMeanings: cells[5]
          });
        }
      }
    });
    
    return tableData;
  }

  const handleAddEntry = () => {
    if (newEntry.headword && newEntry.meaning) {
      setVocabularyList([...vocabularyList, newEntry]);
      setNewEntry({
        headword: '',
        meaning: '',
        synonyms: '',
        synonymMeanings: '',
        antonyms: '',
        antonymMeanings: ''
      });
      setIsAddingEntry(false);
    }
  };

  const handleEditEntry = (index: number, field: keyof VocabularyEntry, value: string) => {
    const updatedList = [...vocabularyList];
    updatedList[index] = { ...updatedList[index], [field]: value };
    setVocabularyList(updatedList);
  };

  const generateDocx = async () => {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: title,
            heading: "Heading1",
            spacing: { after: 400 },
            alignment: AlignmentType.CENTER,
          }),
          new Table({
            rows: [
              new TableRow({
                children: [
                  "표제어",
                  "표제어뜻",
                  "동의어",
                  "동의어뜻",
                  "반의어",
                  "반의어뜻"
                ].map(header => 
                  new TableCell({
                    children: [new Paragraph({ text: header })],
                    shading: {
                      fill: "9b87f5",
                    },
                  })
                ),
              }),
              ...vocabularyList.map(entry => 
                new TableRow({
                  children: [
                    entry.headword,
                    entry.meaning,
                    entry.synonyms,
                    entry.synonymMeanings,
                    entry.antonyms,
                    entry.antonymMeanings
                  ].map(cell => 
                    new TableCell({
                      children: [new Paragraph({ text: cell || " " })],
                      borders: {
                        top: { style: BorderStyle.SINGLE, size: 1 },
                        bottom: { style: BorderStyle.SINGLE, size: 1 },
                        left: { style: BorderStyle.SINGLE, size: 1 },
                        right: { style: BorderStyle.SINGLE, size: 1 },
                      },
                    })
                  ),
                })
              ),
            ],
          }),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${title}.docx`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#1A1F2C] mb-4 flex items-center justify-between">
            {isEditingTitle ? (
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                autoFocus
                className="max-w-sm"
              />
            ) : (
              <div className="flex items-center gap-2">
                {title}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingTitle(true)}
                  className="ml-2"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-[#9b87f5] to-[#7E69AB] text-white">
                  <th className="p-3 text-left">표제어</th>
                  <th className="p-3 text-left">표제어뜻</th>
                  <th className="p-3 text-left">동의어</th>
                  <th className="p-3 text-left">동의어뜻</th>
                  <th className="p-3 text-left">반의어</th>
                  <th className="p-3 text-left">반의어뜻</th>
                </tr>
              </thead>
              <tbody>
                {vocabularyList.map((entry, index) => (
                  <tr 
                    key={index}
                    className={index % 2 === 0 ? 'bg-[#F1F0FB]' : 'bg-white'}
                  >
                    {Object.entries(entry).map(([key, value], cellIndex) => (
                      <td 
                        key={cellIndex} 
                        className="p-3 border border-[#D6BCFA]/30"
                      >
                        <Input
                          value={value}
                          onChange={(e) => handleEditEntry(index, key as keyof VocabularyEntry, e.target.value)}
                          className="bg-transparent border-none hover:bg-white focus:bg-white"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
                {isAddingEntry && (
                  <tr className="bg-[#F8F7FF]">
                    {Object.entries(newEntry).map(([key, value], cellIndex) => (
                      <td 
                        key={cellIndex} 
                        className="p-3 border border-[#D6BCFA]/30"
                      >
                        <Input
                          value={value}
                          onChange={(e) => setNewEntry({ ...newEntry, [key]: e.target.value })}
                          placeholder={`Enter ${key}`}
                          className="bg-transparent border-none hover:bg-white focus:bg-white"
                        />
                      </td>
                    ))}
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="flex justify-between">
            <Button
              onClick={() => setIsAddingEntry(true)}
              className="bg-[#9b87f5] hover:bg-[#7E69AB]"
              disabled={isAddingEntry}
            >
              <Plus className="w-4 h-4 mr-2" />
              단어 추가
            </Button>
            {isAddingEntry && (
              <div className="space-x-2">
                <Button
                  onClick={handleAddEntry}
                  className="bg-[#9b87f5] hover:bg-[#7E69AB]"
                >
                  저장
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddingEntry(false);
                    setNewEntry({
                      headword: '',
                      meaning: '',
                      synonyms: '',
                      synonymMeanings: '',
                      antonyms: '',
                      antonymMeanings: ''
                    });
                  }}
                >
                  취소
                </Button>
              </div>
            )}
            {!isAddingEntry && (
              <Button
                onClick={generateDocx}
                className="bg-gradient-to-r from-[#9b87f5] to-[#7E69AB] hover:opacity-90"
              >
                <FileDown className="w-4 h-4 mr-2" />
                단어장 저장하기
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};