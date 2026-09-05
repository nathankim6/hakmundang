
import React, { useEffect, useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Filter, Hash } from 'lucide-react';

interface PassageSearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterCategory: string;
  setFilterCategory: (category: string) => void;
  categories: string[];
  handleSearch: () => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  showCategoryFilter?: boolean;
  itemIdQuery?: string;
  setItemIdQuery?: (query: string) => void;
}

const PassageSearchBar: React.FC<PassageSearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  filterCategory,
  setFilterCategory,
  categories,
  handleSearch,
  handleKeyDown,
  showCategoryFilter = true,
  itemIdQuery = '',
  setItemIdQuery = () => {}
}) => {
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [itemIdTimeout, setItemIdTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Handle real-time search when typing
  const handleChangeWithDebounce = (setter: (value: string) => void, value: string, timeoutSetter: React.Dispatch<React.SetStateAction<NodeJS.Timeout | null>>) => {
    setter(value);
    
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const newTimeout = setTimeout(() => {
      handleSearch();
    }, 500); // 500ms debounce
    
    timeoutSetter(newTimeout);
  };
  
  // Clean up timeouts when component unmounts
  useEffect(() => {
    return () => {
      if (searchTimeout) clearTimeout(searchTimeout);
      if (itemIdTimeout) clearTimeout(itemIdTimeout);
    };
  }, [searchTimeout, itemIdTimeout]);

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="지문의 첫 단어 또는 첫 문장으로 검색..." 
          value={searchQuery} 
          onChange={e => handleChangeWithDebounce(setSearchQuery, e.target.value, setSearchTimeout)} 
          onKeyDown={handleKeyDown} 
          className="pl-9" 
        />
      </div>
      
      <div className="relative">
        <Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="식별번호로 필터링..."
          value={itemIdQuery}
          onChange={e => handleChangeWithDebounce(setItemIdQuery, e.target.value, setItemIdTimeout)}
          onKeyDown={handleKeyDown}
          className="pl-9"
        />
      </div>
      
      {showCategoryFilter && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              <Filter className="mr-2 h-4 w-4" />
              {filterCategory === "all" ? "모든 카테고리" : filterCategory}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => setFilterCategory("all")}>
                모든 카테고리
              </DropdownMenuItem>
              {categories.map(category => (
                <DropdownMenuItem key={category} onClick={() => setFilterCategory(category)}>
                  {category}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      <Button onClick={handleSearch}>검색</Button>
    </div>
  );
};

export default PassageSearchBar;
