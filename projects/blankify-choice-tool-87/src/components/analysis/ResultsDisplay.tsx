import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AnalysisResult } from './AnalysisService';

interface ResultsDisplayProps {
  results: AnalysisResult[];
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results }) => {
  const { toast } = useToast();

  const copyToClipboard = (resultIndex: number, type: 'lines' | 'keywords') => {
    const result = results[resultIndex];
    if (!result) return;
    let content = '';
    if (type === 'lines') {
      content = result.lines.map((line) => `${line.english}\n${line.korean}\n`).join('\n');
    } else if (type === 'keywords') {
      const keywordPairs = result.keywords || [];
      
      const rows = [];
      for (let i = 0; i < Math.min(12, keywordPairs.length); i++) {
        const keyword = keywordPairs[i];
        const rowIndex = Math.floor(i / 3);
        if (!rows[rowIndex]) rows[rowIndex] = [];
        rows[rowIndex].push(`${keyword.english}\t${keyword.korean}`);
      }
      
      content = rows.map(row => row.join('\t')).join('\n');
    }
    
    navigator.clipboard.writeText(content).then(() => {
      toast({
        description: `지문 ${result.passageNumber}의 ${type === 'lines' ? '분석지' : '주요 단어'} 내용이 클립보드에 복사되었습니다.`
      });
    }).catch(err => {
      console.error('복사 중 오류가 발생했습니다:', err);
      toast({
        variant: "destructive",
        title: "복사 실패",
        description: "내용을 클립보드에 복사하지 못했습니다."
      });
    });
  };

  if (results.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">분석 결과</h2>
      
      <Accordion type="multiple" defaultValue={results.map((_, index) => `item-${index}`)} className="w-full space-y-4">
        {results.map((result, index) => (
          <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg overflow-hidden">
            <AccordionTrigger className="px-4 py-2 hover:bg-gray-50">
              <span className="font-medium">지문 {result.passageNumber} 분석 결과</span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              {result.error ? (
                <div className="p-4 bg-red-50 text-red-700 rounded-md">
                  {result.error}
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                    <h3 className="text-lg font-semibold mb-4 text-blue-800">제목</h3>
                    <p className="text-gray-700">{result.theme}</p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">한 줄 해석</h3>
                      <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={() => copyToClipboard(index, 'lines')}>
                        <Copy className="h-4 w-4" />
                        복사
                      </Button>
                    </div>
                    
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <Textarea 
                        className="min-h-[200px] font-mono text-sm resize-none bg-white"
                        readOnly
                        value={result.lines.map(line => `${line.english}\n${line.korean}\n`).join('\n')}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">주요 단어 및 표현</h3>
                      <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={() => copyToClipboard(index, 'keywords')}>
                        <Copy className="h-4 w-4" />
                        복사
                      </Button>
                    </div>
                    
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableBody>
                          {[0, 1, 2, 3].map(rowIndex => {
                            const startIdx = rowIndex * 3;
                            const keywordsForRow = result.keywords?.slice(startIdx, startIdx + 3) || [];
                            
                            return (
                              <TableRow key={rowIndex}>
                                {keywordsForRow.map((keyword, colIndex) => (
                                  <React.Fragment key={colIndex}>
                                    <TableCell className="font-medium border-r">{keyword.english}</TableCell>
                                    <TableCell>{keyword.korean}</TableCell>
                                  </React.Fragment>
                                ))}
                                
                                {Array.from({ length: 3 - keywordsForRow.length }).map((_, i) => (
                                  <React.Fragment key={`empty-${i}`}>
                                    <TableCell className="border-r"></TableCell>
                                    <TableCell></TableCell>
                                  </React.Fragment>
                                ))}
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default ResultsDisplay;
