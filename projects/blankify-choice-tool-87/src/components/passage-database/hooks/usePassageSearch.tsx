
import { useState, useEffect } from 'react';
import { usePassageFilters } from './usePassageFilters';
import { useSearchUtils } from './search/useSearchUtils';
import { useExportPassages } from './search/useExportPassages';
import { usePassageSelections } from './search/usePassageSelections';
import { useWorkbookManagement } from './search/useWorkbookManagement';
import { useSearchResults } from './search/useSearchResults';
import { usePassageApplication } from './search/usePassageApplication';

export const usePassageSearch = (maxSelections = 40) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [itemIdQuery, setItemIdQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  
  // Import all the modular functionality
  const { fetchCategories, handleCopy } = useSearchUtils();
  const { exporting, handleExportExcel } = useExportPassages();
  const { 
    results, 
    loading, 
    hasSearched, 
    groupedByHeader, 
    handleSearch: executeSearch 
  } = useSearchResults();
  
  const { 
    accumulatedSelections, 
    showAccumulatedSelections, 
    setShowAccumulatedSelections,
    isPassageAccumulated, 
    removeAccumulatedPassage, 
    clearAccumulatedSelections, 
    handlePassageSelection 
  } = usePassageSelections(maxSelections);
  
  const { 
    workbookDialogOpen, 
    setWorkbookDialogOpen, 
    workbookName, 
    setWorkbookName, 
    isCreatingWorkbook, 
    handleCreateWorkbook, 
    handleSaveWorkbook 
  } = useWorkbookManagement(accumulatedSelections, clearAccumulatedSelections);
  
  const { handleSavePassages } = usePassageApplication(accumulatedSelections);
  const { applyFilters } = usePassageFilters(results);
  
  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      const categoriesList = await fetchCategories();
      setCategories(categoriesList);
    };
    
    loadCategories();
  }, []);
  
  // Handle search with current queries
  const handleSearch = () => {
    executeSearch(searchQuery, itemIdQuery);
  };
  
  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  // Handle Excel export
  const handleExportExcelWrapper = () => {
    const passagesToExport = accumulatedSelections.length > 0 ? accumulatedSelections : results;
    handleExportExcel(passagesToExport);
  };
  
  return {
    searchQuery,
    setSearchQuery,
    itemIdQuery,
    setItemIdQuery,
    filterCategory,
    setFilterCategory,
    results,
    loading,
    exporting,
    categories,
    showAccumulatedSelections,
    setShowAccumulatedSelections,
    workbookDialogOpen,
    setWorkbookDialogOpen,
    workbookName,
    setWorkbookName,
    isCreatingWorkbook,
    accumulatedSelections,
    clearAccumulatedSelections,
    isPassageAccumulated,
    removeAccumulatedPassage,
    handleSearch,
    handleCopy,
    handleExportExcel: handleExportExcelWrapper,
    handleKeyDown,
    handleCreateWorkbook,
    handleSaveWorkbook,
    handleSavePassages,
    handlePassageSelection,
    applyFilters,
    hasSearched,
    groupedByHeader
  };
};
