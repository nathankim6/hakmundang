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
          questionsText.push(`문제 ${index + 1}\n${questionTextarea.value.trim()}\n`);
          answersText.push(`문제 ${index + 1}\n${answerTextarea.value.trim()}\n`);
        }
      } else {
        questionsText.push(`문제 ${index + 1}\n${parts[0].trim()}\n`);
        
        let answerPart = parts[1].trim();
        answerPart = answerPart
          .replace(/2\s*정답\s*설명/, '[해설]')
          .replace(/3\.\s*오답\s*설명/, '')
          .replace(/\[해설\].*?\[해설\]/g, '[해설]')
          .trim();
        
        if (!answerPart.startsWith('[정답]')) {
          answerPart = `[정답] ${answerPart}`;
        }
        
        answersText.push(`문제 ${index + 1}\n${answerPart}\n`);
      }
    } else {
      questionsText.push(`문제 ${index + 1}\n${content.trim()}\n`);
    }
  });

  const combinedText = [
    "===== 문제 =====\n",
    questionsText.join('\n'),
    "\n===== 정답 =====\n",
    answersText.join('\n')
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