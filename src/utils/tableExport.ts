import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { WordEntry } from '@/types/word';

// Add Korean font support
import NanumGothic from '@/fonts/NanumGothic-Regular.ttf';

export const exportToExcel = (words: WordEntry[], toast: any) => {
  const worksheet = XLSX.utils.json_to_sheet(words);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "동반어 목록");
  
  XLSX.writeFile(workbook, "동반어_목록.xlsx");
  
  toast({
    title: "엑셀 파일 저장 완료",
    description: "동반어 목록이 엑셀 파일로 저장되었습니다.",
  });
};

export const exportToPDF = (words: WordEntry[], toast: any) => {
  const doc = new jsPDF();
  
  // Add Korean font
  doc.addFont(NanumGothic, 'NanumGothic', 'normal');
  doc.setFont('NanumGothic');
  
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
      font: 'NanumGothic',
      fontSize: 10,
    },
    headStyles: {
      fillColor: [155, 135, 245],
      textColor: 255,
      fontSize: 12,
      font: 'NanumGothic',
    },
  });

  doc.save('동반어_목록.pdf');
  
  toast({
    title: "PDF 파일 저장 완료",
    description: "동반어 목록이 PDF 파일로 저장되었습니다.",
  });
};