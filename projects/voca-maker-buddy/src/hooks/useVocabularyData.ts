import { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';

export interface WordItem {
  word: string;
  meaning: string;
  day: number;
}

export const useVocabularyData = () => {
  const [words, setWords] = useState<WordItem[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseExcelFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      
      // 첫 번째 행은 헤더로 가정하고 건너뛰기
      const parsedWords: WordItem[] = [];
      
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (row && row.length >= 3) {
          const word = String(row[0] || '').trim();
          const meaning = String(row[1] || '').trim();
          const day = Number(row[2]) || 1;
          
          if (word && meaning) {
            parsedWords.push({ word, meaning, day });
          }
        }
      }
      
      if (parsedWords.length === 0) {
        throw new Error('유효한 단어 데이터가 없습니다. 파일 형식을 확인해주세요.');
      }
      
      setWords(parsedWords);
      setUploadedFile(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : '파일 처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeFile = useCallback(() => {
    setWords([]);
    setUploadedFile(null);
    setError(null);
  }, []);

  const getDayGroups = useCallback(() => {
    return words.reduce((groups, word) => {
      groups[word.day] = (groups[word.day] || 0) + 1;
      return groups;
    }, {} as { [key: number]: number });
  }, [words]);

  const getWordsByDays = useCallback((selectedDays: number[]) => {
    return words.filter(word => selectedDays.includes(word.day));
  }, [words]);

  return {
    words,
    uploadedFile,
    isLoading,
    error,
    parseExcelFile,
    removeFile,
    getDayGroups,
    getWordsByDays
  };
};