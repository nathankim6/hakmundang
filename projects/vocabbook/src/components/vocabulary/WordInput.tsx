import React, { useState, KeyboardEvent } from 'react';
import { useToast } from "@/hooks/use-toast";
import { processVocabularyWithAPI } from '@/utils/apiUtils';
import { ParsedWordData, WordData } from '@/types/vocabulary';
import { supabase } from "@/integrations/supabase/client";
import { TextInputField } from './TextInputField';
import { ProcessButton } from './ProcessButton';
import { LoadingOverlay } from './LoadingOverlay';
import { VocabularyTitle } from './VocabularyTitle';
import { CopyrightFooter } from './CopyrightFooter';

interface WordInputProps {
  onWordsProcessed?: (data: ParsedWordData) => void;
}

interface InputField {
  id: string;
  value: string;
}

export const WordInput: React.FC<WordInputProps> = ({ onWordsProcessed }) => {
  const [inputFields, setInputFields] = useState<InputField[]>([{ id: '1', value: '' }]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentProcessingIndex, setCurrentProcessingIndex] = useState<number | null>(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const { toast } = useToast();

  const addInputField = () => {
    const newId = String(Date.now());
    setInputFields([...inputFields, { id: newId, value: '' }]);
  };

  const removeInputField = (id: string) => {
    if (inputFields.length > 1) {
      setInputFields(inputFields.filter(field => field.id !== id));
    }
  };

  const handleInputChange = (id: string, value: string) => {
    setInputFields(inputFields.map(field => 
      field.id === id ? { ...field, value } : field
    ));
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>, id: string) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addInputField();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>, id: string) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const rows = pastedText.split(/[\n\r]+/).filter(row => row.trim());
    
    if (rows.length > 1) {
      const newFields = rows.map((row, index) => ({
        id: String(Date.now() + index),
        value: row.trim()
      }));
      setInputFields(newFields);
    } else {
      handleInputChange(id, pastedText.trim());
    }
  };

  const processWords = async () => {
    const nonEmptyFields = inputFields.filter(field => field.value.trim());
    
    if (nonEmptyFields.length === 0) {
      toast({
        title: "오류",
        description: "단어 데이터를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    let accumulatedWords: WordData[] = [];

    try {
      for (let i = 0; i < nonEmptyFields.length; i++) {
        setCurrentProcessingIndex(i);
        setCurrentWordIndex(0);
        const field = nonEmptyFields[i];
        
        try {
          const data = await processVocabularyWithAPI('', field.value);
          
          if (!data || !data.words) {
            throw new Error('API 응답 형식이 올바르지 않습니다.');
          }

          const processedWords = data.words.slice(0, 16);
          if (processedWords.length < 16) {
            toast({
              title: "알림",
              description: `${i + 1}번째 지문에서 ${16 - processedWords.length}개의 단어가 부족합니다. 자동으로 채워집니다.`,
            });
            
            while (processedWords.length < 16) {
              const placeholderWord: WordData = {
                표제어: "placeholder",
                품사: "명사",
                난이도: 1,
                표제어뜻: "추가 단어 필요",
                영영정의: "",
                발음: "",
                동의어: [],
                동의어뜻: [],
                반의어: [],
                반의어뜻: []
              };
              processedWords.push(placeholderWord);
            }
          }

          const wordsWithPronunciation = [];
          for (let j = 0; j < processedWords.length; j++) {
            setCurrentWordIndex(j + 1);
            const word = processedWords[j];
            
            try {
              if (word.표제어 !== "placeholder") {
                const { data: pronData, error } = await supabase.functions.invoke('get-pronunciation', {
                  body: { word: word.표제어 }
                });
                
                wordsWithPronunciation.push({
                  ...word,
                  발음: pronData?.pronunciation || ''
                });
              } else {
                wordsWithPronunciation.push(word);
              }

              const currentResult: ParsedWordData = {
                title: data.title || '',
                words: [...accumulatedWords, ...wordsWithPronunciation]
              };
              
              if (onWordsProcessed) {
                onWordsProcessed(currentResult);
              }
            } catch (error) {
              console.error('Pronunciation error:', error);
              wordsWithPronunciation.push({
                ...word,
                발음: ''
              });
            }
          }

          accumulatedWords = [...accumulatedWords, ...wordsWithPronunciation];

          toast({
            title: "진행 중",
            description: `${i + 1}/${nonEmptyFields.length} 번째 지문 처리 완료`,
          });

        } catch (error) {
          console.error('Processing error for input:', error);
          toast({
            title: "오류",
            description: `${i + 1}번째 지문 처리 중 오류가 발생했습니다.`,
            variant: "destructive",
          });
        }
      }

      toast({
        title: "성공",
        description: `${nonEmptyFields.length}개의 지문이 성공적으로 처리되었습니다.`,
      });

    } catch (error) {
      console.error('API Error:', error);
      toast({
        title: "오류",
        description: error instanceof Error 
          ? `단어 처리 중 오류가 발생했습니다: ${error.message}` 
          : "알 수 없는 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setCurrentProcessingIndex(null);
      setCurrentWordIndex(0);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {isLoading && (
        <LoadingOverlay
          currentText={(currentProcessingIndex || 0) + 1}
          totalTexts={inputFields.filter(field => field.value.trim()).length}
          currentWord={currentWordIndex}
          totalWords={16}
        />
      )}
      <VocabularyTitle />
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            마크다운 형식의 데이터나 영어 지문을 입력하면 출력가능한 단어장이 생성됩니다
          </label>
          {inputFields.map((field, index) => (
            <div key={field.id} className="relative">
              <TextInputField
                id={field.id}
                value={field.value}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                onPaste={handlePaste}
                onAdd={addInputField}
                onRemove={removeInputField}
                isLast={index === inputFields.length - 1}
                showRemove={inputFields.length > 1}
              />
            </div>
          ))}
        </div>
        <ProcessButton
          onClick={processWords}
          isLoading={isLoading}
          disabled={inputFields.every(field => !field.value.trim())}
        />
        <CopyrightFooter />
      </div>
    </div>
  );
};
