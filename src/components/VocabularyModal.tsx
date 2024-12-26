import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { VocabularyHeader } from './vocabulary/VocabularyHeader';
import { VocabularyTable } from './vocabulary/VocabularyTable';
import { VocabularyActions } from './vocabulary/VocabularyActions';

interface VocabularyModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  questionNumber?: number;
}

interface VocabularyEntry {
  headword: string;
  meaning: string;
  synonyms: string;
  synonymMeanings: string;
  antonyms: string;
  antonymMeanings: string;
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

  function parseTableContent(content: string): VocabularyEntry[] {
    console.log('Parsing content:', content);
    
    if (!content.trim()) {
      console.log('Content is empty');
      return [];
    }

    const sections = content.split(/문제 \d+/);
    const tableData: VocabularyEntry[] = [];
    let currentQuestionNumber = 1;

    sections.forEach((section, sectionIndex) => {
      if (!section.trim()) return;

      const lines = section.split('\n');
      lines.forEach(line => {
        if (line.includes('|')) {
          const cells = line.split('|')
            .map(cell => cell.trim())
            .filter(cell => cell !== '');
          
          console.log('Parsed cells:', cells);
          
          if (cells.length >= 6 && !line.includes('표제어')) {
            tableData.push({
              headword: cells[0],
              meaning: cells[1],
              synonyms: cells[2],
              synonymMeanings: cells[3],
              antonyms: cells[4],
              antonymMeanings: cells[5],
              questionNumber: currentQuestionNumber
            });
          }
        }
      });
      currentQuestionNumber++;
    });
    
    console.log('Parsed table data:', tableData);
    return tableData;
  }

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

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;

    try {
      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${title}.pdf`);
    } catch (error) {
      console.error('PDF generation error:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto" ref={contentRef}>
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
            onDownloadPDF={handleDownloadPDF}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};