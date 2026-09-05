
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase, SUPABASE_PUBLIC_URL } from '@/integrations/supabase/client';
import { Passage } from '../types';

export const useSearchResults = () => {
  const { toast } = useToast();
  const [results, setResults] = useState<Passage[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [groupedByHeader, setGroupedByHeader] = useState<Map<string, Passage[]> | null>(null);
  const [allPassages, setAllPassages] = useState<Passage[]>([]);
  const [lastQueryTime, setLastQueryTime] = useState<number>(0);

  // Load all passages initially for client-side filtering
  useEffect(() => {
    const fetchAllPassages = async () => {
      try {
        const { data, error } = await supabase
          .from('passages')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Add updated_at fallback
        const passagesWithUpdatedAt = data.map((passage: Passage) => ({
          ...passage,
          updated_at: passage.updated_at || passage.created_at
        }));
        
        setAllPassages(passagesWithUpdatedAt);
      } catch (error) {
        console.error('Error fetching all passages:', error);
      }
    };
    
    fetchAllPassages();
  }, []);

  const filterPassages = (searchQuery: string, itemIdQuery: string) => {
    let filtered = [...allPassages];
    
    // Apply search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((passage: Passage) => {
        if (!passage.content) return false;
        
        const content = passage.content.toLowerCase();
        
        // Check if content starts with query or has query after a space
        return content.startsWith(query) || 
               content.includes(` ${query}`) || 
               (passage.translation && passage.translation.toLowerCase().includes(query));
      });
    }
    
    // Apply item_id filter
    if (itemIdQuery.trim()) {
      filtered = filtered.filter((passage: Passage) => {
        if (!passage.item_id) return false;
        return passage.item_id.toLowerCase().includes(itemIdQuery.toLowerCase());
      });
    }
    
    return filtered;
  };

  // Helper function to extract number from item_id for sorting
  const extractNumber = (itemId: string): number => {
    if (!itemId) return 0;
    
    // Extract the numeric part at the end of the item_id
    // Examples: "고1 2024년 3월 모의고사 18번" -> 18
    //          "고1 2024년 3월 모의고사 43-45번" -> 43
    const match = itemId.match(/(\d+)(?:-\d+)?(?:번|호|문항|지문)/);
    return match ? parseInt(match[1], 10) : 0;
  };

  // Function to group by header from item_id
  const groupByItemIdHeader = (passages: Passage[], itemIdQuery: string) => {
    if (!itemIdQuery.trim()) return null;
    
    const grouped = new Map<string, Passage[]>();
    
    passages.forEach((passage: Passage) => {
      if (!passage.item_id) return;
      
      const match = passage.item_id.match(/^(.*?)(?:\s*[\d\-\–]+(?:번|호|문항|지문))?$/);
      const header = match ? match[1].trim() : passage.item_id;
      
      if (!grouped.has(header)) {
        grouped.set(header, []);
      }
      grouped.get(header)?.push(passage);
    });
    
    // Sort passages within each group by the numeric part of their item_id
    grouped.forEach((passageList, header) => {
      passageList.sort((a, b) => {
        const numA = extractNumber(a.item_id || '');
        const numB = extractNumber(b.item_id || '');
        return numA - numB;  // Ascending order by number
      });
    });
    
    return grouped;
  };

  // Debounced search handler for better performance
  const handleSearch = async (searchQuery: string, itemIdQuery: string) => {
    if (!searchQuery.trim() && !itemIdQuery.trim() && allPassages.length === 0) {
      toast({
        variant: "destructive",
        description: "검색어 또는 식별번호를 입력해주세요."
      });
      return;
    }
    
    setLoading(true);
    setHasSearched(true);
    
    try {
      console.log('Searching with query:', searchQuery, 'item_id:', itemIdQuery);
      
      // Try to fetch from server first (for most up-to-date results)
      if (navigator.onLine) {
        try {
          // Set a timestamp to track this query
          const queryTimestamp = Date.now();
          setLastQueryTime(queryTimestamp);
          
          // Use the correct URL construction for the edge function
          const response = await fetch(`${SUPABASE_PUBLIC_URL}/functions/v1/search-passages`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || ''}`
            },
            body: JSON.stringify({
              query: searchQuery,
              item_id: itemIdQuery
            })
          });
          
          // Only process if this is still the latest query
          if (queryTimestamp === lastQueryTime) {
            if (response.ok) {
              const passages = await response.json();
              
              const passagesWithUpdatedAt = passages.map((passage: Passage) => ({
                ...passage,
                updated_at: passage.updated_at || passage.created_at
              }));
              
              // If searching by item_id, sort results by the numeric part of item_id
              if (itemIdQuery.trim()) {
                passagesWithUpdatedAt.sort((a: Passage, b: Passage) => {
                  const numA = extractNumber(a.item_id || '');
                  const numB = extractNumber(b.item_id || '');
                  return numA - numB;  // Ascending order by number
                });
              }
              
              setResults(passagesWithUpdatedAt);
              
              // Update groups
              const grouped = groupByItemIdHeader(passagesWithUpdatedAt, itemIdQuery);
              setGroupedByHeader(grouped);
              
              // Also update the local cache
              if (passages.length > 0) {
                setAllPassages(prev => {
                  // Merge new results with existing ones
                  const merged = [...prev];
                  passages.forEach(newPassage => {
                    const existingIndex = merged.findIndex(p => p.id === newPassage.id);
                    if (existingIndex >= 0) {
                      merged[existingIndex] = newPassage;
                    } else {
                      merged.push(newPassage);
                    }
                  });
                  return merged;
                });
              }
              
              return; // Exit if server-side worked
            }
          }
        } catch (error) {
          console.error('Error with server-side search, falling back to client-side:', error);
        }
      }
      
      // Fall back to client-side filtering if server request fails
      let filteredPassages = filterPassages(searchQuery, itemIdQuery);
      
      // If searching by item_id, sort results by the numeric part of item_id
      if (itemIdQuery.trim()) {
        filteredPassages.sort((a, b) => {
          const numA = extractNumber(a.item_id || '');
          const numB = extractNumber(b.item_id || '');
          return numA - numB;  // Ascending order by number
        });
      }
      
      setResults(filteredPassages);
      
      // Update groups
      const grouped = groupByItemIdHeader(filteredPassages, itemIdQuery);
      setGroupedByHeader(grouped);
      
    } catch (error) {
      console.error('Error searching passages:', error);
      toast({
        variant: "destructive",
        description: "지문 검색 중 오류가 발생했습니다."
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    results,
    loading,
    hasSearched,
    groupedByHeader,
    setResults,
    handleSearch,
    allPassages
  };
};
