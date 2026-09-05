
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { IllustrationResult } from './IllustrationService';

interface ResultsDisplayProps {
  results: IllustrationResult[] | null;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results }) => {
  const { toast } = useToast();

  const downloadImage = async (imageUrl: string, passageId: number) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `illustration-${passageId}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast({
        description: `지문 ${passageId}의 삽화가 다운로드되었습니다.`
      });
    } catch (error) {
      console.error('다운로드 중 오류가 발생했습니다:', error);
      toast({
        variant: "destructive",
        title: "다운로드 실패",
        description: "이미지를 다운로드하지 못했습니다."
      });
    }
  };

  if (!results || results.length === 0) return null;

  return (
    <div className="space-y-4 mt-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">삽화 결과</h2>
      
      <Accordion type="multiple" defaultValue={results.map((_, index) => `item-${index}`)} className="w-full space-y-4">
        {results.map((result, index) => (
          <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg overflow-hidden">
            <AccordionTrigger className="px-4 py-2 hover:bg-gray-50">
              <span className="font-medium">지문 {result.id} 삽화 결과</span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              {result.error ? (
                <div className="p-4 bg-red-50 text-red-700 rounded-md">
                  {result.error}
                </div>
              ) : (
                <div className="space-y-6">
                  {result.imageUrl ? (
                    <div className="flex flex-col items-center">
                      <div className="relative w-full max-w-3xl border border-gray-200 rounded-lg overflow-hidden shadow-md mb-4">
                        <img 
                          src={result.imageUrl} 
                          alt={`지문 ${result.id}의 삽화`}
                          className="w-full h-auto object-contain"
                          loading="lazy"
                        />
                      </div>
                      <Button 
                        variant="outline" 
                        className="flex items-center gap-2"
                        onClick={() => result.imageUrl && downloadImage(result.imageUrl, result.id)}
                      >
                        <Download className="h-4 w-4" />
                        이미지 다운로드
                      </Button>
                    </div>
                  ) : (
                    <div className="flex justify-center">
                      <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
                    </div>
                  )}
                  
                  {result.analysis && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <h3 className="text-lg font-semibold mb-2 text-blue-800">지문 분석</h3>
                      <p className="text-gray-700 whitespace-pre-line">{result.analysis}</p>
                    </div>
                  )}
                  
                  {result.prompt && (
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                      <h3 className="text-lg font-semibold mb-2 text-purple-800">이미지 프롬프트</h3>
                      <p className="text-gray-700 whitespace-pre-line">{result.prompt}</p>
                    </div>
                  )}
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
