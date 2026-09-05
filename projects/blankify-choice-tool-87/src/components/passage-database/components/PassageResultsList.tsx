
import React from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Passage } from '../hooks/types';
import PassageCard from './PassageCard';
import { Separator } from "@/components/ui/separator";

interface PassageResultsListProps {
  loading: boolean;
  results: Passage[];
  hasSearched: boolean;
  isPassageAccumulated: (passageId: string) => boolean;
  handleCopy: (text: string) => void;
  handlePassageSelection: (passage: Passage) => void;
  groupedByHeader?: Map<string, Passage[]> | null;
  itemIdQuery?: string;
}

const PassageResultsList: React.FC<PassageResultsListProps> = ({
  loading,
  results,
  hasSearched,
  isPassageAccumulated,
  handleCopy,
  handlePassageSelection,
  groupedByHeader = null,
  itemIdQuery = ''
}) => {
  if (loading) {
    return <div className="flex items-center justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2">검색창에 단어를 입력하면 이 곳에 지문이 나타납니다.</span>
      </div>;
  }
  
  if (!hasSearched) {
    return <div className="flex flex-col items-center justify-center h-[400px] border rounded">
        <Search className="h-10 w-10 text-muted-foreground mb-2" />
        <p className="text-muted-foreground">검색어를 입력하고 검색 버튼을 클릭하세요.</p>
      </div>;
  }
  
  if (results.length === 0) {
    return <div className="flex flex-col items-center justify-center h-[400px] p-4 border rounded">
        <Search className="h-10 w-10 text-muted-foreground mb-2" />
        <p className="text-muted-foreground">검색 결과가 없습니다.</p>
      </div>;
  }

  // If we're using item_id filtering and have grouped results
  if (itemIdQuery && groupedByHeader && groupedByHeader.size > 0) {
    return (
      <div className="border rounded">
        <div className="p-4 space-y-6">
          {Array.from(groupedByHeader.entries()).map(([header, passages]) => (
            <div key={header} className="space-y-4">
              <div className="sticky top-0 bg-white z-10 pt-2">
                <h3 className="text-lg font-medium text-indigo-700">{header}</h3>
                <Separator className="my-2" />
              </div>
              
              <div className="space-y-4">
                {passages.map(passage => (
                  <PassageCard 
                    key={passage.id} 
                    passage={passage} 
                    isSelected={isPassageAccumulated(passage.id)} 
                    onSelect={(passageId, _) => handlePassageSelection(passage)}
                    onEdit={() => handlePassageSelection(passage)}
                    onCopy={handleCopy}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default view (no grouping)
  return (
    <div className="border rounded">
      <div className="p-4 space-y-4">
        {results.map(passage => (
          <PassageCard 
            key={passage.id} 
            passage={passage} 
            isSelected={isPassageAccumulated(passage.id)} 
            onSelect={(passageId, _) => handlePassageSelection(passage)}
            onEdit={() => handlePassageSelection(passage)}
            onCopy={handleCopy}
          />
        ))}
      </div>
    </div>
  );
};

export default PassageResultsList;
