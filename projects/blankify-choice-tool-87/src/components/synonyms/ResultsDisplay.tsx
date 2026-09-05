
import React, { useRef } from 'react';
import { SynonymResult, WordData } from './SynonymsService';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ResultsDisplayProps {
  results: SynonymResult[] | null;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results }) => {
  const { toast } = useToast();
  const tableRef = useRef<HTMLTableElement>(null);

  if (!results || results.length === 0) {
    return null;
  }

  // Helper function to safely convert to array of strings
  const safelyConvertToArray = (value: any): string[] => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') return value.split(',').map(s => s.trim());
    return [];
  };

  const handleCopyToClipboard = (result: SynonymResult) => {
    if (!result.words || result.words.length === 0) {
      toast({
        title: "복사 실패",
        description: "복사할 데이터가 없습니다.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Create a temporary table element for proper formatting
      const tempTable = document.createElement('table');
      tempTable.style.borderCollapse = 'collapse';
      tempTable.style.width = '100%';
      
      // Create header
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      ['표제어', '표제어 뜻', '동의어 1', '동의어 1 뜻', '동의어 2', '동의어 2 뜻', '동의어 3', '동의어 3 뜻', 
       '반의어 1', '반의어 1 뜻', '반의어 2', '반의어 2 뜻', '반의어 3', '반의어 3 뜻'].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        th.style.border = '1px solid #dddddd';
        th.style.padding = '8px';
        th.style.backgroundColor = '#f2f2f2';
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
      tempTable.appendChild(thead);
      
      // Create body
      const tbody = document.createElement('tbody');
      
      result.words.forEach(word => {
        const row = document.createElement('tr');
        
        // Keyword and Korean meaning
        const tdKeyword = document.createElement('td');
        tdKeyword.textContent = word.keyword;
        tdKeyword.style.border = '1px solid #dddddd';
        tdKeyword.style.padding = '8px';
        row.appendChild(tdKeyword);
        
        const tdKeywordKorean = document.createElement('td');
        tdKeywordKorean.textContent = word.keywordKorean;
        tdKeywordKorean.style.border = '1px solid #dddddd';
        tdKeywordKorean.style.padding = '8px';
        row.appendChild(tdKeywordKorean);
        
        // Split synonyms - using our safe function
        const synonymsArray = Array.isArray(word.synonyms) ? word.synonyms : [];
        const synonymsMeanings = safelyConvertToArray(word.synonymsKorean);
        
        // Add each synonym and its meaning
        for (let i = 0; i < 3; i++) {
          const tdSynonym = document.createElement('td');
          tdSynonym.textContent = i < synonymsArray.length ? synonymsArray[i] : '';
          tdSynonym.style.border = '1px solid #dddddd';
          tdSynonym.style.padding = '8px';
          row.appendChild(tdSynonym);
          
          const tdSynonymKorean = document.createElement('td');
          tdSynonymKorean.textContent = i < synonymsMeanings.length ? synonymsMeanings[i] : '';
          tdSynonymKorean.style.border = '1px solid #dddddd';
          tdSynonymKorean.style.padding = '8px';
          row.appendChild(tdSynonymKorean);
        }
        
        // Split antonyms - using our safe function
        const antonymsArray = Array.isArray(word.antonyms) ? word.antonyms : [];
        const antonymsMeanings = safelyConvertToArray(word.antonymsKorean);
        
        // Add each antonym and its meaning
        for (let i = 0; i < 3; i++) {
          const tdAntonym = document.createElement('td');
          tdAntonym.textContent = i < antonymsArray.length ? antonymsArray[i] : '';
          tdAntonym.style.border = '1px solid #dddddd';
          tdAntonym.style.padding = '8px';
          row.appendChild(tdAntonym);
          
          const tdAntonymKorean = document.createElement('td');
          tdAntonymKorean.textContent = i < antonymsMeanings.length ? antonymsMeanings[i] : '';
          tdAntonymKorean.style.border = '1px solid #dddddd';
          tdAntonymKorean.style.padding = '8px';
          row.appendChild(tdAntonymKorean);
        }
        
        tbody.appendChild(row);
      });
      
      tempTable.appendChild(tbody);
      
      // Append the table to the document temporarily
      document.body.appendChild(tempTable);
      
      // Select the table
      const range = document.createRange();
      range.selectNode(tempTable);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      
      // Copy to clipboard
      document.execCommand('copy');
      
      // Clean up
      selection?.removeAllRanges();
      document.body.removeChild(tempTable);
      
      toast({
        title: "복사 완료",
        description: "표가 클립보드에 복사되었습니다. 워드에 붙여넣기할 수 있습니다.",
      });
    } catch (err) {
      console.error("Failed to copy table:", err);
      toast({
        title: "복사 실패",
        description: "표를 클립보드에 복사하는데 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const renderSynonymTable = (result: SynonymResult) => {
    if (!result.words || result.words.length === 0) {
      return (
        <div className="p-4 bg-red-50 text-red-600 rounded-md">
          오류: {result.error || "단어를 추출할 수 없습니다."}
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-blue-600">
            {result.words.length}개 단어 추출됨
          </h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleCopyToClipboard(result)}
            className="flex items-center gap-1"
          >
            <Copy className="h-3.5 w-3.5" />
            <span>표 복사하기</span>
          </Button>
        </div>
        
        <div className="rounded-lg border overflow-hidden">
          <table ref={tableRef} className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-blue-50">
                <th rowSpan={2} className="border border-slate-300 px-4 py-2 text-slate-700 font-medium">표제어</th>
                <th rowSpan={2} className="border border-slate-300 px-4 py-2 text-slate-700 font-medium">표제어 뜻</th>
                <th colSpan={6} className="border border-slate-300 px-4 py-2 text-slate-700 font-medium bg-green-50">동의어</th>
                <th colSpan={6} className="border border-slate-300 px-4 py-2 text-slate-700 font-medium bg-red-50">반의어</th>
              </tr>
              <tr className="bg-blue-50">
                {/* 동의어 열 헤더 */}
                <th className="border border-slate-300 px-4 py-2 text-slate-700 font-medium bg-green-50/80">영어 1</th>
                <th className="border border-slate-300 px-4 py-2 text-slate-700 font-medium bg-green-50/80">한글 1</th>
                <th className="border border-slate-300 px-4 py-2 text-slate-700 font-medium bg-green-50/80">영어 2</th>
                <th className="border border-slate-300 px-4 py-2 text-slate-700 font-medium bg-green-50/80">한글 2</th>
                <th className="border border-slate-300 px-4 py-2 text-slate-700 font-medium bg-green-50/80">영어 3</th>
                <th className="border border-slate-300 px-4 py-2 text-slate-700 font-medium bg-green-50/80">한글 3</th>
                
                {/* 반의어 열 헤더 */}
                <th className="border border-slate-300 px-4 py-2 text-slate-700 font-medium bg-red-50/80">영어 1</th>
                <th className="border border-slate-300 px-4 py-2 text-slate-700 font-medium bg-red-50/80">한글 1</th>
                <th className="border border-slate-300 px-4 py-2 text-slate-700 font-medium bg-red-50/80">영어 2</th>
                <th className="border border-slate-300 px-4 py-2 text-slate-700 font-medium bg-red-50/80">한글 2</th>
                <th className="border border-slate-300 px-4 py-2 text-slate-700 font-medium bg-red-50/80">영어 3</th>
                <th className="border border-slate-300 px-4 py-2 text-slate-700 font-medium bg-red-50/80">한글 3</th>
              </tr>
            </thead>
            <tbody>
              {result.words.map((word, idx) => {
                // Prepare data arrays safely using our helper function
                const synonymsArray = Array.isArray(word.synonyms) ? word.synonyms : [];
                const synonymsMeanings = safelyConvertToArray(word.synonymsKorean);
                const antonymsArray = Array.isArray(word.antonyms) ? word.antonyms : [];
                const antonymsMeanings = safelyConvertToArray(word.antonymsKorean);
                
                return (
                  <tr key={idx} className={idx % 2 === 0 ? "bg-blue-50/30" : "bg-white"}>
                    {/* Keyword and meaning */}
                    <td className="border border-slate-300 px-4 py-2 text-blue-700 font-medium">
                      {word.keyword}
                    </td>
                    <td className="border border-slate-300 px-4 py-2">
                      {word.keywordKorean}
                    </td>
                    
                    {/* Synonyms - 3 columns with their Korean meanings */}
                    {[0, 1, 2].map(i => (
                      <React.Fragment key={`syn-${i}`}>
                        <td className="border border-slate-300 px-4 py-2 bg-green-50/40">
                          {i < synonymsArray.length ? synonymsArray[i] : ''}
                        </td>
                        <td className="border border-slate-300 px-4 py-2 bg-green-50/40">
                          {i < synonymsMeanings.length ? synonymsMeanings[i] : ''}
                        </td>
                      </React.Fragment>
                    ))}
                    
                    {/* Antonyms - 3 columns with their Korean meanings */}
                    {[0, 1, 2].map(i => (
                      <React.Fragment key={`ant-${i}`}>
                        <td className="border border-slate-300 px-4 py-2 bg-red-50/40">
                          {i < antonymsArray.length ? antonymsArray[i] : ''}
                        </td>
                        <td className="border border-slate-300 px-4 py-2 bg-red-50/40">
                          {i < antonymsMeanings.length ? antonymsMeanings[i] : ''}
                        </td>
                      </React.Fragment>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">동의어/반의어 결과</h2>
      
      <div className="flex justify-center mb-6">
        <div className="text-center py-2 px-4 bg-blue-50 rounded-lg border border-blue-100 inline-flex items-center gap-2">
          <span className="text-yellow-600 text-lg">⭐</span>
          <span className="text-sm text-slate-700">모든 표는 복사하여 워드에 붙여넣기할 수 있습니다.</span>
        </div>
      </div>
      
      {results.length > 1 ? (
        <Accordion type="single" collapsible className="w-full">
          {results.map((result) => (
            <AccordionItem key={result.id} value={`passage-${result.id}`}>
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-7 h-7 bg-slate-800 text-white rounded-full text-sm">
                    {result.id}
                  </span>
                  <span className="font-medium text-slate-700">
                    {result.content.length > 60 ? `${result.content.substring(0, 60)}...` : result.content}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                {renderSynonymTable(result)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        renderSynonymTable(results[0])
      )}
    </div>
  );
};

export default ResultsDisplay;
