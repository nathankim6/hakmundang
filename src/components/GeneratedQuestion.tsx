import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { FileDown } from "lucide-react";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Document, Paragraph, Table, TableRow, TableCell, Packer } from "docx";

interface GeneratedQuestionProps {
  content: string;
  questionNumber: number;
  originalText?: string;
}

export const GeneratedQuestion = ({ content, questionNumber, originalText }: GeneratedQuestionProps) => {
  const [editableNumber, setEditableNumber] = useState(questionNumber);
  const parts = content.split('[정답]');
  let questionPart = parts[0].trim();
  const answerPart = parts.length > 1 ? '[정답]' + parts.slice(1).join('').trim() : '';

  questionPart = questionPart.replace('[OUTPUT]', '').trim();
  const isTrueFalse = questionPart.includes('(T/F)');
  const isSynonymAntonym = content.includes('| 표제어 | 표제어뜻 |');

  const handleExportToExcel = () => {
    if (!isSynonymAntonym) return;

    // Parse table data
    const rows = content.split('\n')
      .filter(row => row.includes('|'))
      .map(row => row.split('|').map(cell => cell.trim()).filter(cell => cell));

    const headers = rows[0];
    const data = rows.slice(2); // Skip header and separator row

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `문제 ${editableNumber}`);

    // Generate Excel file
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `동의어_반의어_문제${editableNumber}.xlsx`);
  };

  const handleExportToDoc = () => {
    if (!isSynonymAntonym) return;

    // Parse table data
    const rows = content.split('\n')
      .filter(row => row.includes('|'))
      .map(row => row.split('|').map(cell => cell.trim()).filter(cell => cell));

    const headers = rows[0];
    const data = rows.slice(2); // Skip header and separator row

    // Create document
    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({
            text: `문제 ${editableNumber}`,
            heading: 'Heading1'
          }),
          new Table({
            rows: [
              new TableRow({
                children: headers.map(header => 
                  new TableCell({
                    children: [new Paragraph({ text: header })]
                  })
                )
              }),
              ...data.map(row => 
                new TableRow({
                  children: row.map(cell => 
                    new TableCell({
                      children: [new Paragraph({ text: cell || '' })]
                    })
                  )
                })
              )
            ]
          })
        ]
      }]
    });

    Packer.toBlob(doc).then(blob => {
      saveAs(blob, `동의어_반의어_문제${editableNumber}.docx`);
    });
  };

  // For True/False questions
  if (isTrueFalse) {
    const lines = questionPart.split('\n');
    const title = lines[0];
    const questions = lines.slice(1).join('\n');

    return (
      <div className="mb-8">
        <div className="prose max-w-none">
          <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <span className="bg-gradient-to-r from-[#0EA5E9] to-[#403E43] bg-clip-text text-transparent">
              문제 {questionNumber}
            </span>
          </h3>
          
          <div className="space-y-4">
            <div className="result-text whitespace-pre-wrap leading-relaxed relative bg-[#F8F7FF] p-4 rounded-lg border border-[#0EA5E9]/20">
              <h4 className="font-semibold text-[#403E43] mb-2">다음 글의 내용으로 옳고 그름(T/F)을 고르시오</h4>
              {questions}
            </div>
            
            {answerPart && (
              <div className="result-text whitespace-pre-wrap leading-relaxed relative bg-[#F8F7FF] p-4 rounded-lg border border-[#0EA5E9]/20">
                <h4 className="font-semibold text-[#403E43] mb-2">정답 및 해설</h4>
                {answerPart}
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-6 h-px bg-gradient-to-r from-transparent via-[#0EA5E9]/30 to-transparent" />
      </div>
    );
  }

  // For Synonym/Antonym questions
  if (isSynonymAntonym) {
    return (
      <div className="mb-8">
        <div className="prose max-w-none">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h3 className="text-2xl font-bold flex items-center gap-2 m-0">
                <span className="bg-gradient-to-r from-[#0EA5E9] to-[#403E43] bg-clip-text text-transparent">
                  문제
                </span>
              </h3>
              <Input
                type="number"
                value={editableNumber}
                onChange={(e) => setEditableNumber(Number(e.target.value))}
                className="w-20 text-center"
                min="1"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportToExcel}
                className="flex items-center gap-2"
              >
                <FileDown className="w-4 h-4" />
                Excel 저장
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportToDoc}
                className="flex items-center gap-2"
              >
                <FileDown className="w-4 h-4" />
                Word 저장
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="result-text whitespace-pre-wrap leading-relaxed relative bg-[#F8F7FF] p-4 rounded-lg border border-[#0EA5E9]/20 overflow-x-auto">
              {content}
            </div>
          </div>
        </div>
        
        <div className="mt-6 h-px bg-gradient-to-r from-transparent via-[#0EA5E9]/30 to-transparent" />
      </div>
    );
  }

  // For other question types
  return (
    <div className="mb-8">
      <div className="prose max-w-none">
        <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <span className="bg-gradient-to-r from-[#0EA5E9] to-[#403E43] bg-clip-text text-transparent">
            문제 {questionNumber}
          </span>
        </h3>
        
        <div className="space-y-4">
          {originalText && (
            <div className="result-text whitespace-pre-wrap leading-relaxed relative bg-[#F8F7FF] p-4 rounded-lg border border-[#0EA5E9]/20 mb-4">
              {originalText}
            </div>
          )}
          
          <div className="result-text whitespace-pre-wrap leading-relaxed relative bg-[#F1F0FB] p-4 rounded-lg border border-[#D3E4FD]/30">
            {questionPart}
          </div>
          
          {answerPart && (
            <div className="result-text whitespace-pre-wrap leading-relaxed relative bg-[#F8F7FF] p-4 rounded-lg border border-[#0EA5E9]/20">
              {answerPart}
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-6 h-px bg-gradient-to-r from-transparent via-[#0EA5E9]/30 to-transparent" />
    </div>
  );
};