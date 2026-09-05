import jsPDF from 'jspdf';
import { WordItem } from '@/hooks/useVocabularyData';

export const generateTestPDF = (words: WordItem[], selectedDays: number[]) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const lineHeight = 8;
  
  // 제목 설정
  pdf.setFontSize(20);
  pdf.text('영단어 시험지', pageWidth / 2, 30, { align: 'center' });
  
  pdf.setFontSize(12);
  pdf.text(`Day ${selectedDays.join(', ')} | 총 ${words.length}문제`, pageWidth / 2, 45, { align: 'center' });
  
  let yPosition = 65;
  let questionNumber = 1;
  
  words.forEach((word, index) => {
    // 페이지 넘김 확인
    if (yPosition > pageHeight - 50) {
      pdf.addPage();
      yPosition = 30;
    }
    
    // 문제 출력
    pdf.setFontSize(11);
    pdf.text(`${questionNumber}. ${word.word}`, margin, yPosition);
    
    yPosition += lineHeight * 2;
    
    // 보기 출력 (실제 구현에서는 더 복잡한 로직 필요)
    const choices = generateChoices(word, words);
    choices.forEach((choice, choiceIndex) => {
      const choiceLetter = String.fromCharCode(65 + choiceIndex); // A, B, C, D
      pdf.text(`${choiceLetter}. ${choice}`, margin + 10, yPosition);
      yPosition += lineHeight;
    });
    
    yPosition += lineHeight;
    questionNumber++;
  });
  
  // 답안지 페이지 추가
  pdf.addPage();
  pdf.setFontSize(20);
  pdf.text('정답', pageWidth / 2, 30, { align: 'center' });
  
  yPosition = 50;
  words.forEach((word, index) => {
    if (yPosition > pageHeight - 30) {
      pdf.addPage();
      yPosition = 30;
    }
    
    pdf.setFontSize(11);
    pdf.text(`${index + 1}. ${word.word} - ${word.meaning}`, margin, yPosition);
    yPosition += lineHeight;
  });
  
  // PDF 다운로드
  const fileName = `영단어시험지_Day${selectedDays.join(',')}_${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(fileName);
};

// 간단한 보기 생성 함수 (실제로는 더 정교한 로직 필요)
const generateChoices = (correctWord: WordItem, allWords: WordItem[]): string[] => {
  const choices = [correctWord.meaning];
  
  // 다른 단어들에서 랜덤하게 3개 선택
  const otherWords = allWords.filter(w => w.word !== correctWord.word);
  const shuffled = otherWords.sort(() => 0.5 - Math.random());
  
  for (let i = 0; i < 3 && i < shuffled.length; i++) {
    choices.push(shuffled[i].meaning);
  }
  
  // 선택지 섞기
  return choices.sort(() => 0.5 - Math.random()).slice(0, 4);
};