interface VocabularyEntryType {
  headword: string;
  meaning: string;
  synonyms: string;
  synonymMeanings: string;
  antonyms: string;
  antonymMeanings: string;
  questionNumber?: number;
}

interface VocabularyEntryProps {
  entry: VocabularyEntryType;
  index: number;
  onEditEntry: (index: number, field: keyof VocabularyEntryType, value: string) => void;
}

export const VocabularyEntry = ({ entry, index, onEditEntry }: VocabularyEntryProps) => {
  const formatMultipleEntries = (text: string) => {
    return text.split(',').join('\n');
  };

  return (
    <>
      {Object.entries(entry).map(([key, value], cellIndex) => {
        if (key === 'questionNumber') return null;
        return (
          <td key={cellIndex} className="p-3 border border-[#D6BCFA]/30">
            <textarea
              value={formatMultipleEntries(value)}
              onChange={(e) => onEditEntry(index, key as keyof VocabularyEntryType, e.target.value)}
              className="w-full bg-transparent border-none hover:bg-white focus:bg-white font-nanum min-h-[60px] resize-y p-1 text-base"
              style={{ whiteSpace: 'pre-wrap' }}
            />
          </td>
        );
      })}
    </>
  );
};