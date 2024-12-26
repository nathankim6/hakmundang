export const VocabularyTableHeader = () => {
  return (
    <thead>
      <tr className="bg-gradient-to-r from-[#9b87f5] to-[#7E69AB] text-white">
        <th className="p-3 text-left text-lg font-nanum">표제어</th>
        <th className="p-3 text-left text-lg font-nanum">표제어뜻</th>
        <th className="p-3 text-left text-lg font-nanum">동의어</th>
        <th className="p-3 text-left text-lg font-nanum">동의어뜻</th>
        <th className="p-3 text-left text-lg font-nanum">반의어</th>
        <th className="p-3 text-left text-lg font-nanum">반의어뜻</th>
      </tr>
    </thead>
  );
};