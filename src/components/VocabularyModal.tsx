import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Document, Paragraph, Table, TableRow, TableCell, Packer } from "docx";
import { saveAs } from "file-saver";
import { VocabularyHeader } from './vocabulary/VocabularyHeader';
import { VocabularyTable } from './vocabulary/VocabularyTable';
import { VocabularyActions } from './vocabulary/VocabularyActions';
import { parseTableContent, type VocabularyEntry } from './vocabulary/VocabularyParser';

interface VocabularyModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  questionNumber?: number;
}

export const VocabularyModal = ({ isOpen, onClose, content, questionNumber }: VocabularyModalProps) => {
  const [title, setTitle] = useState("Vocabulary List");
  const [vocabularyList, setVocabularyList] = useState<VocabularyEntry[]>(() => parseTableContent(content));
  const [newEntry, setNewEntry] = useState<VocabularyEntry>({
    headword: '',
    meaning: '',
    synonyms: '',
    synonymMeanings: '',
    antonyms: '',
    antonymMeanings: '',
    questionNumber
  });
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleAddEntry = () => {
    setIsAddingEntry(true);
  };

  const handleSaveNewEntry = () => {
    if (newEntry.headword && newEntry.meaning) {
      setVocabularyList([...vocabularyList, newEntry]);
      setNewEntry({
        headword: '',
        meaning: '',
        synonyms: '',
        synonymMeanings: '',
        antonyms: '',
        antonymMeanings: '',
        questionNumber
      });
      setIsAddingEntry(false);
    }
  };

  const handleCancelNewEntry = () => {
    setIsAddingEntry(false);
    setNewEntry({
      headword: '',
      meaning: '',
      synonyms: '',
      synonymMeanings: '',
      antonyms: '',
      antonymMeanings: '',
      questionNumber
    });
  };

  const handleEditEntry = (index: number, field: keyof VocabularyEntry, value: string) => {
    const updatedList = [...vocabularyList];
    updatedList[index] = { ...updatedList[index], [field]: value };
    setVocabularyList(updatedList);
  };

  const handleDownloadDoc = async () => {
    // Create table rows for the document
    const rows = vocabularyList.map(entry => {
      return new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ text: entry.headword })] }),
          new TableCell({ children: [new Paragraph({ text: entry.meaning })] }),
          new TableCell({ children: [new Paragraph({ text: entry.synonyms })] }),
          new TableCell({ children: [new Paragraph({ text: entry.synonymMeanings })] }),
          new TableCell({ children: [new Paragraph({ text: entry.antonyms })] }),
          new TableCell({ children: [new Paragraph({ text: entry.antonymMeanings })] }),
        ],
      });
    });

    // Create header row
    const headerRow = new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ text: "표제어" })] }),
        new TableCell({ children: [new Paragraph({ text: "표제어뜻" })] }),
        new TableCell({ children: [new Paragraph({ text: "동의어" })] }),
        new TableCell({ children: [new Paragraph({ text: "동의어뜻" })] }),
        new TableCell({ children: [new Paragraph({ text: "반의어" })] }),
        new TableCell({ children: [new Paragraph({ text: "반의어뜻" })] }),
      ],
    });

    // Create the document
    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({ text: title, heading: 1 }),
          new Table({
            rows: [headerRow, ...rows],
          }),
        ],
      }],
    });

    // Generate and save the document
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${title}.docx`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto font-nanum" ref={contentRef}>
        <VocabularyHeader 
          title={title}
          onTitleChange={setTitle}
        />
        
        <div className="space-y-4">
          <VocabularyTable
            vocabularyList={vocabularyList}
            onEditEntry={handleEditEntry}
          />
          
          {isAddingEntry && (
            <div className="mt-4">
              <VocabularyTable
                vocabularyList={[newEntry]}
                onEditEntry={(_, field, value) => 
                  setNewEntry(prev => ({ ...prev, [field]: value }))
                }
              />
            </div>
          )}
          
          <VocabularyActions
            onAddEntry={handleAddEntry}
            isAddingEntry={isAddingEntry}
            onSaveNewEntry={handleSaveNewEntry}
            onCancelNewEntry={handleCancelNewEntry}
            onDownloadPDF={handleDownloadDoc}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};