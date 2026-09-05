
import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
interface ResultsDisplayProps {
  results: {
    id: number;
    content: string;
    result: string;
  }[] | null;
}
const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  results
}) => {
  if (!results || results.length === 0) return null;
  return <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">내용이해</h2>
      
      <Accordion type="multiple" defaultValue={results.map((_, index) => `item-${index}`)} className="w-full space-y-4">
        {results.map((result, index) => <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg overflow-hidden">
            <AccordionTrigger className="px-4 py-2 hover:bg-gray-50">
              <span className="font-medium">지문 {result.id} 내용이해</span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              {result.result.includes('오류:') ? <div className="p-4 bg-red-50 text-red-700 rounded-md">
                  {result.result}
                </div> : <div className="whitespace-pre-wrap font-sans text-gray-800 prose max-w-none">
                  {result.result}
                </div>}
            </AccordionContent>
          </AccordionItem>)}
      </Accordion>
    </div>;
};
export default ResultsDisplay;
