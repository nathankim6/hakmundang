import React from 'react';

interface QuestionTextRendererProps {
  text: string;
  className?: string;
}

// Markdown 표 파싱
const parseMarkdownTable = (text: string): { beforeTable: string; table: string[][] | null; afterTable: string } => {
  // Markdown 표 패턴: | header | header | 형식
  const markdownTableRegex = /(\|[^\n]+\|\n\|[-:\s|]+\|\n(?:\|[^\n]+\|\n?)+)/;
  const match = text.match(markdownTableRegex);
  
  if (match) {
    const tableText = match[1];
    const tableStartIndex = text.indexOf(tableText);
    const beforeTable = text.substring(0, tableStartIndex).trim();
    const afterTable = text.substring(tableStartIndex + tableText.length).trim();
    
    const rows = tableText.trim().split('\n').filter(row => row.trim());
    const table: string[][] = [];
    
    for (let i = 0; i < rows.length; i++) {
      // 구분선 행 건너뛰기 (|---|---|)
      if (rows[i].match(/^\|[\s-:|]+\|$/)) continue;
      
      const cells = rows[i]
        .split('|')
        .filter((cell, idx, arr) => idx > 0 && idx < arr.length - 1)
        .map(cell => cell.trim());
      
      if (cells.length > 0) {
        table.push(cells);
      }
    }
    
    if (table.length >= 2) {
      return { beforeTable, table, afterTable };
    }
  }
  
  return { beforeTable: text, table: null, afterTable: '' };
};

// 텍스트에서 일반 표를 감지하고 파싱하는 함수
const parseTableFromText = (text: string): { beforeTable: string; table: string[][] | null; afterTable: string } => {
  // 먼저 Markdown 표 시도
  const markdownResult = parseMarkdownTable(text);
  if (markdownResult.table) {
    return markdownResult;
  }
  
  // [표] ... [/표] 형식 파싱
  const boxedTableMatch = text.match(/\[표\]([\s\S]*?)\[\/표\]/);
  if (boxedTableMatch) {
    const tableContent = boxedTableMatch[1].trim();
    const beforeTable = text.substring(0, text.indexOf('[표]')).trim();
    const afterTable = text.substring(text.indexOf('[/표]') + 5).trim();
    
    const lines = tableContent.split('\n').filter(line => line.trim());
    const tableRows: string[][] = [];
    
    for (const line of lines) {
      const cells = line.split(/\t+|\s{2,}/).filter(cell => cell.trim());
      if (cells.length >= 2) {
        tableRows.push(cells);
      }
    }
    
    if (tableRows.length >= 2) {
      return { beforeTable, table: tableRows, afterTable };
    }
  }
  
  const lines = text.split('\n');
  
  // 표 패턴 감지: 연속된 줄이 탭이나 여러 공백으로 구분된 데이터를 포함
  let tableStartIndex = -1;
  let tableEndIndex = -1;
  const tableRows: string[][] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // 탭이나 2개 이상의 연속 공백으로 구분된 데이터 감지
    const cells = line.split(/\t+|\s{2,}/).filter(cell => cell.trim());
    
    // 2개 이상의 셀이 있으면 표 데이터로 간주
    if (cells.length >= 2) {
      if (tableStartIndex === -1) {
        tableStartIndex = i;
      }
      tableEndIndex = i;
      tableRows.push(cells);
    } else if (tableStartIndex !== -1 && tableRows.length >= 2) {
      // 표가 이미 시작되었고 2줄 이상이면 표 종료
      break;
    }
  }
  
  // 표가 2줄 이상이어야 유효한 표로 간주
  if (tableRows.length >= 2) {
    const beforeTable = lines.slice(0, tableStartIndex).join('\n').trim();
    const afterTable = lines.slice(tableEndIndex + 1).join('\n').trim();
    return { beforeTable, table: tableRows, afterTable };
  }
  
  return { beforeTable: text, table: null, afterTable: '' };
};

// 밑줄 표시 감지 및 처리 (빈칸 채우기 문제용)
const renderTextWithUnderlines = (text: string) => {
  // _______ 또는 _____ 패턴을 밑줄로 변환
  const parts = text.split(/(_____+)/g);
  
  return parts.map((part, idx) => {
    if (part.match(/^_____+$/)) {
      return (
        <span 
          key={idx} 
          className="inline-block min-w-[80px] border-b-2 border-primary mx-1 text-center"
        >
          &nbsp;
        </span>
      );
    }
    // (A), (B), (C) 등의 빈칸 마커 강조
    const markedPart = part.replace(/\(([A-Z])\)/g, '<mark class="bg-primary/20 px-1 rounded font-semibold">($1)</mark>');
    if (markedPart !== part) {
      return <span key={idx} dangerouslySetInnerHTML={{ __html: markedPart }} />;
    }
    return <span key={idx}>{part}</span>;
  });
};

// 박스나 특수 표시 렌더링
const renderSpecialFormats = (text: string) => {
  // [보기] 또는 <보기> 감지
  if (text.includes('[보기]') || text.includes('<보기>')) {
    const parts = text.split(/(\[보기\]|\<보기\>)/);
    return parts.map((part, idx) => {
      if (part === '[보기]' || part === '<보기>') {
        return (
          <span key={idx} className="inline-block bg-secondary px-2 py-0.5 rounded font-semibold text-secondary-foreground mx-1">
            보기
          </span>
        );
      }
      return <span key={idx}>{renderTextWithUnderlines(part)}</span>;
    });
  }
  return renderTextWithUnderlines(text);
};

// 최대 열 수 계산
const getMaxColumns = (table: string[][]): number => {
  return Math.max(...table.map(row => row.length));
};

const QuestionTextRenderer: React.FC<QuestionTextRendererProps> = ({ text, className = '' }) => {
  const { beforeTable, table, afterTable } = parseTableFromText(text);
  const maxColumns = table ? getMaxColumns(table) : 0;
  
  return (
    <div className={`space-y-4 ${className}`}>
      {/* 표 앞의 텍스트 */}
      {beforeTable && (
        <p className="text-foreground font-medium leading-relaxed whitespace-pre-wrap">
          {renderSpecialFormats(beforeTable)}
        </p>
      )}
      
      {/* 표 렌더링 */}
      {table && (
        <div className="overflow-x-auto my-4">
          <table className="w-full border-collapse bg-background rounded-lg overflow-hidden shadow-sm">
            <thead>
              <tr className="bg-primary/10">
                {table[0].map((cell, idx) => (
                  <th 
                    key={idx} 
                    className="px-4 py-3 text-left font-semibold text-primary border border-border/50 text-sm"
                  >
                    {cell}
                  </th>
                ))}
                {/* 열 수 맞추기 */}
                {Array(maxColumns - table[0].length).fill(null).map((_, idx) => (
                  <th key={`empty-h-${idx}`} className="px-4 py-3 border border-border/50" />
                ))}
              </tr>
            </thead>
            <tbody>
              {table.slice(1).map((row, rowIdx) => (
                <tr 
                  key={rowIdx} 
                  className={rowIdx % 2 === 0 ? 'bg-muted/30' : 'bg-background'}
                >
                  {row.map((cell, cellIdx) => (
                    <td 
                      key={cellIdx} 
                      className={`px-4 py-3 border border-border/50 text-sm ${
                        cellIdx === 0 ? 'font-medium text-primary' : 'text-foreground'
                      }`}
                    >
                      {renderTextWithUnderlines(cell)}
                    </td>
                  ))}
                  {/* 열 수가 부족한 경우 빈 셀 추가 */}
                  {row.length < maxColumns && 
                    Array(maxColumns - row.length).fill(null).map((_, idx) => (
                      <td key={`empty-${idx}`} className="px-4 py-3 border border-border/50" />
                    ))
                  }
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* 표 뒤의 텍스트 */}
      {afterTable && (
        <p className="text-foreground font-medium leading-relaxed whitespace-pre-wrap">
          {renderSpecialFormats(afterTable)}
        </p>
      )}
    </div>
  );
};

export default QuestionTextRenderer;
