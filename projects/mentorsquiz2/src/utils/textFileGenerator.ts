interface QuestionContent {
  id: string;
  content: string;
  questionNumber: number;
}

export const generateTextFile = (questions: QuestionContent[]) => {
  const questionsText: string[] = [];
  const answersText: string[] = [];

  questions.forEach((question, index) => {
    const content = question.content;
    const parts = content.split('[정답]');
    
    if (parts.length > 1) {
      if (content.includes('[29] 어법') || 
          content.includes('어법상 틀린 것은') || 
          content.includes('어법상 알맞은 것을')) {
        const questionTextarea = document.querySelector(`#question-${question.id}`) as HTMLTextAreaElement;
        const answerTextarea = document.querySelector(`#answer-${question.id}`) as HTMLTextAreaElement;
        
        if (questionTextarea && answerTextarea) {
          // Clean up question text - remove [OUTPUT] and normalize line breaks, add space before choices
          let questionText = questionTextarea.value.trim()
            .replace(/\[OUTPUT\]/g, '')
            .replace(/\n{2,}/g, '\n') // Replace multiple line breaks with single line break
            .replace(/\n(①)/g, '\n\n①') // Add line break before first choice
            .trim();
          
          // Clean up answer text - remove [OUTPUT] and normalize line breaks
          let answerText = answerTextarea.value.trim()
            .replace(/\[OUTPUT\]/g, '')
            .replace(/\n{2,}/g, '\n')
            .trim();
          
          questionsText.push(`문제 ${index + 1}\n${questionText}`);
          answersText.push(`문제 ${index + 1}\n${answerText}`);
        }
      } else {
        // Clean up question part - remove [OUTPUT] and normalize line breaks, add space before choices
        let questionPart = parts[0].trim()
          .replace(/\[OUTPUT\]/g, '')
          .replace(/\n{2,}/g, '\n') // Replace multiple line breaks with single line break
          .replace(/\n(①)/g, '\n\n①') // Add line break before first choice
          .trim();
        
        questionsText.push(`문제 ${index + 1}\n${questionPart}`);
        
        let answerPart = parts[1].trim()
          .replace(/\[OUTPUT\]/g, '')
          .replace(/2\s*정답\s*설명/, '[해설]')
          .replace(/3\.\s*오답\s*설명/, '')
          .replace(/\[해설\].*?\[해설\]/g, '[해설]')
          .replace(/\n{2,}/g, '\n')
          .trim();
        
        if (!answerPart.startsWith('[정답]')) {
          answerPart = `[정답] ${answerPart}`;
        }
        
        answersText.push(`문제 ${index + 1}\n${answerPart}`);
      }
    } else {
      // Clean up single content - remove [OUTPUT] and normalize line breaks
      let cleanContent = content.trim()
        .replace(/\[OUTPUT\]/g, '')
        .replace(/\n{2,}/g, '\n')
        .trim();
      
      questionsText.push(`문제 ${index + 1}\n${cleanContent}`);
    }
  });

  const combinedText = [
    "===== 문제 =====\n",
    questionsText.join('\n\n'),
    "\n\n===== 정답 =====\n",
    answersText.join('\n\n')
  ].join('');

  return combinedText;
};

export const downloadTextFile = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};