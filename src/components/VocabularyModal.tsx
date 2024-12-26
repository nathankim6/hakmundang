import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Document, Paragraph, Table, TableRow, TableCell, HeadingLevel, Packer } from "docx";
import { saveAs } from "file-saver";
import { VocabularyHeader } from './vocabulary/VocabularyHeader';
import { VocabularyTable } from './vocabulary/VocabularyTable';
import { VocabularyActions } from './vocabulary/VocabularyActions';
import { parseTableContent, type VocabularyEntry } from './vocabulary/VocabularyParser';
import { VocabularyApp } from './vocabulary/VocabularyApp';

interface VocabularyModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  questionNumber?: number;
}

export const VocabularyModal = ({ isOpen, onClose, content, questionNumber }: VocabularyModalProps) => {
  const [vocabularyList, setVocabularyList] = useState<VocabularyEntry[]>(() => parseTableContent(content));
  const [showNewFormat, setShowNewFormat] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  const transformToNewFormat = (entries: VocabularyEntry[]) => {
    return entries.map(entry => ({
      표제어: entry.headword,
      품사: entry.headword.length > 4 ? '동사' : '명사', // Simple logic for demo
      난이도: Math.floor(Math.random() * 3) + 1, // Random difficulty 1-3
      표제어뜻: entry.meaning,
      영영정의: '', // We don't have this in the original data
      동의어: entry.synonyms.split(',').filter(Boolean),
      동의어뜻: entry.synonymMeanings.split(',').filter(Boolean),
      반의어: entry.antonyms.split(',').filter(Boolean),
      반의어뜻: entry.antonymMeanings.split(',').filter(Boolean),
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto font-nanum" ref={contentRef}>
        {showNewFormat ? (
          <VocabularyApp initialData={transformToNewFormat(vocabularyList)} />
        ) : (
          <>
            <VocabularyHeader 
              title="Vocabulary List"
              onTitleChange={() => {}}
            />
            <div className="space-y-4">
              <VocabularyTable
                vocabularyList={vocabularyList}
                onEditEntry={() => {}}
              />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};