import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Question } from "./question-form";
import templateImage from '@/assets/question-template.jpg';

interface QuestionPreviewProps {
  questions: Question[];
  title: string;
}

export const QuestionPreview = ({ questions, title }: QuestionPreviewProps) => {
  if (questions.length === 0) {
    return (
      <Card className="bg-gradient-hero border-border/50">
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground">미리보기할 문제가 없습니다</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold bg-gradient-primary bg-clip-text text-transparent">
        미리보기
      </h2>
      
      {/* PDF 생성용 컨테이너 */}
      <div id="pdf-content" className="bg-white">

        {/* 문제 페이지들 - 한 페이지당 3문제 */}
        {Array.from({ length: Math.ceil(questions.length / 3) }, (_, pageIndex) => (
          <div 
            key={`question-page-${pageIndex}`} 
            className="pdf-page min-h-[297mm] relative overflow-hidden"
            style={{
              backgroundImage: `url(${templateImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            {/* 문제 영역 - 템플릿의 흰색 영역에 맞춤 */}
            <div className="absolute top-[120px] left-[40px] right-[40px] bottom-[40px]">
              <div className="grid grid-cols-1 gap-4 h-full">
                {questions.slice(pageIndex * 3, (pageIndex + 1) * 3).map((question, index) => {
                  const questionNumber = pageIndex * 3 + index + 1;
                  const questionLength = question.content.length;
                  
                  // 문제 길이에 따른 동적 스타일 조정 (3문제 기준)
                  const getFontSize = () => {
                    if (questionLength > 1000) return 'text-xs';
                    if (questionLength > 600) return 'text-sm';
                    if (questionLength > 400) return 'text-sm';
                    return 'text-sm';
                  };
                  
                  const getPadding = () => {
                    if (questionLength > 1000) return 'p-2';
                    if (questionLength > 600) return 'p-3';
                    return 'p-4';
                  };
                  
                  const getLineHeight = () => {
                    if (questionLength > 1000) return 'leading-tight';
                    if (questionLength > 600) return 'leading-snug';
                    return 'leading-normal';
                  };

                  return (
                    <div key={`q-${question.id}`} className={`question-item bg-white/95 backdrop-blur-sm rounded-lg border border-gray-200 shadow-sm flex-1 overflow-hidden ${getPadding()}`}>
                      <div className="flex items-start gap-3 h-full">
                        <Badge variant="outline" className="mt-1 bg-blue-50 text-blue-700 border-blue-200 text-sm px-3 py-2 flex-shrink-0 font-semibold">
                          {questionNumber}
                        </Badge>
                        <div className="flex-1 min-w-0 overflow-hidden">
                          {question.title && (
                            <h3 className={`font-semibold text-gray-800 mb-3 ${getFontSize()}`}>{question.title}</h3>
                          )}
                          <div className={`text-gray-700 whitespace-pre-wrap ${getFontSize()} ${getLineHeight()} overflow-hidden`}>
                            {(() => {
                              const lines = question.content.split('\n');
                              const result = [];
                              let i = 0;
                              
                               while (i < lines.length) {
                                const line = lines[i];
                                
                                // 한글이 포함된 문제 부분을 볼드 처리
                                const isQuestionLine = line.includes('문제') || 
                                                      line.includes('다음') || 
                                                      line.includes('빈칸') || 
                                                      line.includes('내용') ||
                                                      (i > 0 && (lines[i-1].includes('문제') || lines[i-1].includes('다음')) && 
                                                       !line.match(/^[①②③④⑤가나다라마바사아자차카타파하]/) && 
                                                       !line.includes('보기') && 
                                                       /[가-힣]/.test(line));
                                
                                // 보기 시작 감지
                                if (line.includes('보기') || line.includes('<보기>')) {
                                  const boxContent = [line];
                                  i++;
                                  
                                  // 보기 내용 수집 ((A)가 나올 때까지)
                                  while (i < lines.length && !lines[i].match(/^\(A\)/)) {
                                    if (lines[i].trim() !== '') {
                                      boxContent.push(lines[i]);
                                    }
                                    i++;
                                  }
                                  
                                  result.push(
                                    <div key={`box-${i}`} className="border border-gray-400 p-2 my-2 rounded text-xs">
                                      {boxContent.map((boxLine, boxIndex) => (
                                        <div key={boxIndex} className={boxLine.includes('보기') ? 'font-bold' : ''}>
                                          {boxLine}
                                        </div>
                                      ))}
                                    </div>
                                  );
                                  continue;
                                }
                                
                                // (A), (B), (C) 등으로 시작하는 선지 앞에 간격 추가
                                const isChoiceABC = line.match(/^\([A-Z]\)/);
                                if (isChoiceABC) {
                                  result.push(<div key={`space-${i}`} className="h-2"></div>);
                                }
                                
                                // 일반 보기(①②③④⑤) 앞에 간격 추가
                                const isChoice = line.match(/^[①②③④⑤가나다라마바사아자차카타파하]/);
                                const prevLine = i > 0 ? lines[i-1] : '';
                                const shouldAddSpace = isChoice && !prevLine.match(/^[①②③④⑤가나다라마바사아자차카타파하]/);
                                
                                result.push(
                                  <div key={i}>
                                    {shouldAddSpace && <div className="h-1"></div>}
                                    <div className={isQuestionLine ? 'font-bold' : ''}>
                                      {line}
                                    </div>
                                  </div>
                                );
                                
                                i++;
                              }
                              
                              return result;
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}

        {/* 정답 및 해설 페이지 */}
        <div className="pdf-page min-h-[297mm] p-6">
          <div className="border-b border-gray-200 pb-3 mb-4">
            <h2 className="text-xl font-bold text-gray-800">정답 및 해설</h2>
          </div>
          
          <div className="space-y-3">
            {questions.map((question, index) => {
              const explanationLength = (question.answer + question.explanation).length;
              
              // 해설 길이에 따른 동적 스타일
              const getExplanationFontSize = () => {
                if (explanationLength > 300) return 'text-xs';
                return 'text-sm';
              };
              
              const getExplanationSpacing = () => {
                if (explanationLength > 300) return 'space-y-1';
                return 'space-y-2';
              };
              
              return (
                <div key={`a-${question.id}`} className={`answer-item pb-3 border-b border-gray-100 last:border-b-0 ${getExplanationSpacing()}`}>
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-0.5 bg-green-50 text-green-700 border-green-200 text-xs px-2 py-1 flex-shrink-0">
                      {index + 1}
                    </Badge>
                    <div className={`flex-1 ${getExplanationSpacing()}`}>
                      {question.title && (
                        <h3 className={`font-semibold text-gray-800 ${getExplanationFontSize()}`}>{question.title}</h3>
                      )}
                      <div className="bg-green-50 p-2 rounded">
                        <span className={`font-semibold text-green-800 ${getExplanationFontSize()}`}>정답: </span>
                        <span className={`text-gray-800 ${getExplanationFontSize()}`}>{question.answer || "정답 없음"}</span>
                      </div>
                      {question.explanation && (
                        <div className="bg-blue-50 p-2 rounded">
                          <span className={`font-semibold text-blue-800 ${getExplanationFontSize()}`}>해설: </span>
                          <div className={`text-gray-700 whitespace-pre-wrap leading-tight ${getExplanationFontSize()} mt-1`}>
                            {question.explanation}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};