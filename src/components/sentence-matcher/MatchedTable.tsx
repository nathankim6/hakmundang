import React from 'react';

interface MatchedTableProps {
  sentences: Array<{ english: string; korean: string }>;
}

export const MatchedTable = ({ sentences }: MatchedTableProps) => {
  return (
    <div className="mt-6">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border p-2 bg-gray-100 w-[60px]">번호</th>
            <th className="border p-2 bg-gray-100 w-1/2">English</th>
            <th className="border p-2 bg-gray-100 w-1/2">한글</th>
          </tr>
        </thead>
        <tbody>
          {sentences.map((pair, index) => (
            <tr key={index}>
              <td className="border p-2 text-center">{index + 1}</td>
              <td className="border p-2 align-top">{pair.english}</td>
              <td className="border p-2 align-top">{pair.korean}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};