import { TextEntry } from './TextEntry';

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
  onDeletePair 
}: TextPairListProps) => {
  return (
    <>
      {textPairs.map((pair, index) => (
        <div key={pair.id} className="grid grid-cols-2 gap-4">
          <TextEntry
            label={`영어 텍스트 ${index + 1}`}
            value={pair.english}
            onChange={(value) => onUpdateText(pair.id, 'english', value)}
            onEnterPress={onAddNewPair}
            onDelete={() => onDeletePair(pair.id)}
            placeholder="영어 텍스트를 입력하세요..."
          />
          <TextEntry
            label={`한글 텍스트 ${index + 1}`}
            value={pair.korean}
            onChange={(value) => onUpdateText(pair.id, 'korean', value)}
            onDelete={() => onDeletePair(pair.id)}
            placeholder="한글 텍스트를 입력하세요..."
          />
        </div>
      ))}
    </>
  );
};