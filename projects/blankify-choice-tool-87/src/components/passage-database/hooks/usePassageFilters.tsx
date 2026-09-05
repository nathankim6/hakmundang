
import { useState, useCallback, useMemo } from 'react';
import { Passage } from './types';

export const usePassageFilters = (passages: Passage[]) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [sortOption, setSortOption] = useState<string>('created_desc');
  const [itemIdQuery, setItemIdQuery] = useState<string>('');

  // Extract unique categories from passages
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(passages.map(passage => passage.category).filter(Boolean) as string[])];
    return uniqueCategories.sort();
  }, [passages]);

  // Function to extract common header part from item_id
  const extractCommonHeader = (itemId: string): string => {
    // Example: "고2 2024년 3월 모의고사 18번" -> "고2 2024년 3월 모의고사"
    if (!itemId) return '';
    
    // Remove the last numeric part with '번' or any range like '43-45번'
    return itemId.replace(/\s+\d+(-\d+)?번$/, '');
  };

  // Apply filters and sorting
  const applyFilters = useCallback(() => {
    let filtered = [...passages];
    
    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(passage => passage.category === filterCategory);
    }
    
    // Apply difficulty filter
    if (filterDifficulty !== 'all') {
      filtered = filtered.filter(passage => passage.difficulty === filterDifficulty);
    }
    
    // Apply item_id filter
    if (itemIdQuery.trim()) {
      filtered = filtered.filter(passage => {
        if (!passage.item_id) return false;
        
        // Extract common header part for comparison
        const commonHeader = extractCommonHeader(passage.item_id);
        return commonHeader.toLowerCase().includes(itemIdQuery.toLowerCase());
      });
    }
    
    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(passage => {
        const content = passage.content.toLowerCase();
        const translation = passage.translation?.toLowerCase() || '';
        const tags = passage.tags?.join(', ').toLowerCase() || '';
        return content.includes(query) || translation.includes(query) || tags.includes(query);
      });
    }
    
    // Apply sorting
    if (sortOption === 'created_asc') {
      filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else if (sortOption === 'created_desc') {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    
    return filtered;
  }, [passages, filterCategory, filterDifficulty, searchQuery, sortOption, itemIdQuery]);

  const filteredPassages = useMemo(() => applyFilters(), [applyFilters]);

  // Group passages by common header part
  const groupedByHeader = useMemo(() => {
    if (!itemIdQuery.trim()) return null;
    
    const groups = new Map<string, Passage[]>();
    
    filteredPassages.forEach(passage => {
      if (!passage.item_id) return;
      
      const header = extractCommonHeader(passage.item_id);
      if (!header) return;
      
      if (!groups.has(header)) {
        groups.set(header, []);
      }
      groups.get(header)?.push(passage);
    });
    
    return groups;
  }, [filteredPassages, itemIdQuery]);

  const handleSearch = useCallback(() => {
    // This function can be used when implementing search button functionality
    // For now, the search is applied automatically through the applyFilters function
    console.log('Search applied with query:', searchQuery);
  }, [searchQuery]);

  return {
    filteredPassages,
    searchQuery,
    setSearchQuery,
    filterCategory,
    setFilterCategory,
    filterDifficulty,
    setFilterDifficulty,
    sortOption,
    setSortOption,
    itemIdQuery,
    setItemIdQuery,
    applyFilters,
    categories,
    handleSearch,
    groupedByHeader,
    extractCommonHeader
  };
};
