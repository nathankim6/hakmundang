import { TextPairInput } from "./TextPairInput";

interface TextPair {
  id: string;
  english: string;
  korean: string;
}

interface TextPairListProps {
  textPairs: TextPair[];
  onUpdateText: (id: string, field: 'english' | 'korean', value: string) => void;
  onAddNewPair: () => void;
  onDeletePair: (id: string) => void;
}

export const TextPairList = ({
  textPairs,
  onUpdateText,
  onAddNewPair,
  onDeletePair,
}: TextPairListProps) => {
  return (
    <div className="space-y-4">
      {textPairs.map((pair) => (
        <TextPairInput
          key={pair.id}
          id={pair.id}
          english={pair.english}
          korean={pair.korean}
          showDelete={textPairs.length > 1}
          onUpdateText={onUpdateText}
          onDeletePair={onDeletePair}
          onAddNewPair={onAddNewPair}
        />
      ))}
    </div>
  );
};