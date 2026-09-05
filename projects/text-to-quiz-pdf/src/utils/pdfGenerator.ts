import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Question } from '@/components/ui/question-form';

export const generatePDF = async (questions: Question[], title: string = "문제지") => {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm
    
    // 미리보기 영역의 PDF 페이지만 캡처
    const pages = document.querySelectorAll('.pdf-page');
    
    if (pages.length === 0) {
      throw new Error('PDF로 변환할 페이지를 찾을 수 없습니다.');
    }
    
    for (let i = 0; i < pages.length; i++) {
      if (i > 0) {
        pdf.addPage();
      }
      
      const page = pages[i] as HTMLElement;
      
      // 페이지를 A4 비율에 맞게 캡처
      const canvas = await html2canvas(page, {
        scale: 3, // 고품질을 위해 스케일 증가
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: page.scrollWidth,
        height: page.scrollHeight,
        scrollX: 0,
        scrollY: 0,
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // A4 사이즈에 맞게 이미지 크기 조정
      const imgAspectRatio = canvas.width / canvas.height;
      const pdfAspectRatio = pdfWidth / pdfHeight;
      
      let imgWidth, imgHeight, offsetX = 0, offsetY = 0;
      
      if (imgAspectRatio > pdfAspectRatio) {
        // 이미지가 더 넓은 경우 - 너비를 기준으로 맞춤
        imgWidth = pdfWidth;
        imgHeight = pdfWidth / imgAspectRatio;
        offsetY = (pdfHeight - imgHeight) / 2;
      } else {
        // 이미지가 더 높은 경우 - 높이를 기준으로 맞춤
        imgHeight = pdfHeight;
        imgWidth = pdfHeight * imgAspectRatio;
        offsetX = (pdfWidth - imgWidth) / 2;
      }
      
      // PDF에 이미지 추가 (중앙 정렬)
      pdf.addImage(imgData, 'PNG', offsetX, offsetY, imgWidth, imgHeight);
    }

    // 파일명 생성 (특수문자 제거)
    const cleanTitle = title.replace(/[^\w\s가-힣]/g, '').trim() || '문제지';
    const timestamp = new Date().toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\./g, '').replace(/ /g, '');
    
    const filename = `${cleanTitle}_${timestamp}.pdf`;
    
    // PDF 다운로드
    pdf.save(filename);
    
    return { success: true, filename };
  } catch (error) {
    console.error('PDF 생성 오류:', error);
    throw new Error('PDF 생성에 실패했습니다.');
  }
};