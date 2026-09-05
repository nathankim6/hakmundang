import React from 'react';

interface MatchedSet {
  setNumber: number;
  sentences: Array<{ english: string; korean: string }>;
}

interface MatchedTableProps {
  matchedSets: MatchedSet[];
}

export const MatchedTable = ({ matchedSets }: MatchedTableProps) => {
  return (
    <div className="mt-6 space-y-8 font-[Gulim]">
      {matchedSets.map((set) => (
        <div key={set.setNumber} className="space-y-4">
          <h3 className="text-lg font-semibold text-[#7E69AB]">문제 {set.setNumber}</h3>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-2 bg-gray-100 w-[60px]">번호</th>
                <th className="border p-2 bg-gray-100 w-1/2">English</th>
                <th className="border p-2 bg-gray-100 w-1/2">한글</th>
              </tr>
            </thead>
            <tbody>
              {set.sentences.map((pair, index) => (
                <tr key={index}>
                  <td className="border p-2 text-center">{index + 1}</td>
                  <td className="border p-2 align-top">{pair.english}</td>
                  <td className="border p-2 align-top">{pair.korean}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};