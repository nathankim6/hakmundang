import { Question } from "@/components/ui/question-form";

export const parseQuestionsText = (text: string): Question[] => {
  const questions: Question[] = [];
  
  // 더 정확한 문제 분리: "[문제]"나 "문제 숫자" 패턴으로 분리
  const questionBlocks = text.split(/(?=\[문제\]|(?:^|\n)\s*문제\s*\d+)/g).filter(block => 
    block.trim().length > 10
  );
  
  questionBlocks.forEach((block, index) => {
    const lines = block.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    let questionContent = '';
    let answerContent = '';
    let explanationContent = '';
    let title = '';
    
    let currentSection = 'question';
    
    for (const line of lines) {
      // 기존 태그 형식 우선 처리
      if (line.startsWith("[문제]")) {
        currentSection = "question";
        questionContent += line.replace("[문제]", "").trim() + "\n";
        continue;
      } else if (line.startsWith("[정답]")) {
        currentSection = "answer";
        answerContent = line.replace("[정답]", "").trim();
        continue;
      } else if (line.startsWith("[해설]")) {
        currentSection = "explanation";
        const explanationText = line.replace("[해설]", "").trim();
        if (explanationText) {
          explanationContent += explanationText + "\n";
        }
        continue;
      }
      
      // 정답 패턴 인식 (태그가 없는 경우에만)
      if (currentSection === "question" && line.match(/^(정답|답|해답|정답은|답은)[\s:：]*.*/i)) {
        currentSection = "answer";
        const answerMatch = line.match(/(?:정답|답|해답|정답은|답은)[\s:：]*(.+)/i);
        if (answerMatch) {
          answerContent = answerMatch[1].trim();
        }
        continue;
      }
      
      // 해설 패턴 인식 (태그가 없는 경우에만)
      if (currentSection !== "explanation" && line.match(/^(해설|풀이|설명|해답|풀이과정|해결과정)[\s:：]*.*/i)) {
        currentSection = "explanation";
        const explanationMatch = line.match(/^(?:해설|풀이|설명|해답|풀이과정|해결과정)[\s:：]*(.*)$/i);
        if (explanationMatch && explanationMatch[1]) {
          explanationContent += explanationMatch[1].trim() + "\n";
        }
        continue;
      }
      
      // 문제 제목/번호 인식
      if (currentSection === "question" && (line.match(/^\d+[\.\)]/) || line.match(/^문제\s*\d+/) || line.match(/^\d+강-\d+/))) {
        title = line;
        questionContent += line + "\n";
        continue;
      }
      
      // 선택지 패턴 (문제 내용에 포함)
      if (line.match(/^[①②③④⑤⑥⑦⑧⑨⑩]/) || line.match(/^[1-5][\.\)]/) || 
          line.match(/^[ㄱ-ㅎ][\.\)]/) || line.match(/^[가-마][\.\)]/)) {
        if (currentSection === 'question') {
          questionContent += line + "\n";
        } else if (currentSection === 'explanation') {
          explanationContent += line + "\n";
        }
        continue;
      }
      
      // 현재 섹션에 따라 내용 추가
      if (currentSection === "question") {
        questionContent += line + "\n";
      } else if (currentSection === "answer") {
        answerContent += " " + line;
      } else if (currentSection === "explanation") {
        explanationContent += line + "\n";
      }
    }
    
    // 제목이 없으면 자동 생성
    if (!title) {
      const titleMatch = questionContent.match(/(\d+강-\d+)|(\d+번)|(문제\s*\d+)|^\d+[\.\)]/);
      if (titleMatch) {
        title = titleMatch[0];
      } else {
        title = `문제 ${index + 1}`;
      }
    }
    
    // 문제 내용이 있으면 추가
    if (questionContent.trim()) {
      questions.push({
        id: `parsed-${Date.now()}-${index}`,
        title: title.trim(),
        content: questionContent.trim(),
        answer: answerContent.trim(),
        explanation: explanationContent.trim(),
      });
    }
  });
  
  // 분리되지 않은 경우를 위한 fallback - 전체 텍스트를 하나의 문제로 처리
  if (questions.length === 0 && text.trim().length > 0) {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    let questionContent = '';
    let answerContent = '';
    let explanationContent = '';
    let currentSection = 'question';
    
    for (const line of lines) {
      if (line.match(/^(정답|답|해답)[\s:：]*.*/i)) {
        currentSection = "answer";
        const answerMatch = line.match(/^(?:정답|답|해답)[\s:：]*(.+)$/i);
        if (answerMatch) {
          answerContent = answerMatch[1].trim();
        }
      } else if (line.match(/^(해설|풀이|설명)[\s:：]*.*/i)) {
        currentSection = "explanation";
        const explanationMatch = line.match(/^(?:해설|풀이|설명)[\s:：]*(.*)$/i);
        if (explanationMatch && explanationMatch[1]) {
          explanationContent += explanationMatch[1].trim() + "\n";
        }
      } else {
        if (currentSection === "question") {
          questionContent += line + "\n";
        } else if (currentSection === "explanation") {
          explanationContent += line + "\n";
        }
      }
    }
    
    if (questionContent.trim()) {
      questions.push({
        id: `parsed-${Date.now()}-0`,
        title: "문제 1",
        content: questionContent.trim(),
        answer: answerContent.trim(),
        explanation: explanationContent.trim(),
      });
    }
  }
  
  return questions;
};