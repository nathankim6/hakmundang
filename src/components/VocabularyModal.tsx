import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { Document, Paragraph, Table, TableRow, TableCell, Packer, AlignmentType, BorderStyle } from "docx";
import { saveAs } from "file-saver";

interface VocabularyModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
}

export const VocabularyModal = ({ isOpen, onClose, content }: VocabularyModalProps) => {
  // Parse the table content from the string
  const parseTableContent = () => {
    const lines = content.split('\n');
    const tableData: string[][] = [];
    
    let isInTable = false;
    lines.forEach(line => {
      if (line.includes('|')) {
        const cells = line.split('|')
          .map(cell => cell.trim())
          .filter(cell => cell !== '');
        if (cells.length > 0) {
          tableData.push(cells);
        }
      }
    });
    
    return tableData.slice(1); // Remove header row
  };

  const generatePDF = async () => {
    const tableData = parseTableContent();
    
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: "Vocabulary List",
            heading: "Heading1",
            spacing: { after: 400 },
            alignment: AlignmentType.CENTER,
          }),
          new Table({
            rows: [
              new TableRow({
                children: [
                  "표제어",
                  "표제어뜻",
                  "동의어",
                  "동의어뜻",
                  "반의어",
                  "반의어뜻"
                ].map(header => 
                  new TableCell({
                    children: [new Paragraph({ text: header })],
                    shading: {
                      fill: "9b87f5",
                    },
                  })
                ),
              }),
              ...tableData.map(row => 
                new TableRow({
                  children: row.map(cell => 
                    new TableCell({
                      children: [new Paragraph({ text: cell || " " })],
                      borders: {
                        top: { style: BorderStyle.SINGLE, size: 1 },
                        bottom: { style: BorderStyle.SINGLE, size: 1 },
                        left: { style: BorderStyle.SINGLE, size: 1 },
                        right: { style: BorderStyle.SINGLE, size: 1 },
                      },
                    })
                  ),
                })
              ),
            ],
          }),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, "vocabulary_list.docx");
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#1A1F2C] mb-4">
            단어장
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-[#9b87f5] to-[#7E69AB] text-white">
                  <th className="p-3 text-left">표제어</th>
                  <th className="p-3 text-left">표제어뜻</th>
                  <th className="p-3 text-left">동의어</th>
                  <th className="p-3 text-left">동의어뜻</th>
                  <th className="p-3 text-left">반의어</th>
                  <th className="p-3 text-left">반의어뜻</th>
                </tr>
              </thead>
              <tbody>
                {parseTableContent().map((row, index) => (
                  <tr 
                    key={index}
                    className={index % 2 === 0 ? 'bg-[#F1F0FB]' : 'bg-white'}
                  >
                    {row.map((cell, cellIndex) => (
                      <td 
                        key={cellIndex} 
                        className="p-3 border border-[#D6BCFA]/30"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="flex justify-end">
            <Button
              onClick={generatePDF}
              className="bg-gradient-to-r from-[#9b87f5] to-[#7E69AB] hover:opacity-90"
            >
              <FileDown className="w-4 h-4 mr-2" />
              단어장 저장하기
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};