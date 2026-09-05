
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { PassageUIOptions, Passage } from './hooks/types';
import { usePassageSearch } from './hooks/usePassageSearch';

// Import refactored components
import PassageSearchBar from './components/PassageSearchBar';
import SelectedPassagesList from './components/SelectedPassagesList';
import ActionsBar from './components/ActionsBar';
import PassageResultsList from './components/PassageResultsList';
import WorkbookDialog from './components/WorkbookDialog';

interface PassageSearchProps {
  onPassageSelect?: (passage: Passage) => void;
  enableMultiSelect?: boolean;
  maxSelections?: number;
  uiOptions?: PassageUIOptions;
}

const PassageSearch: React.FC<PassageSearchProps> = ({
  onPassageSelect,
  enableMultiSelect = true,
  maxSelections = 40,
  uiOptions = {
    showCategoryFilter: false,
    showExportAllButton: false,
    enableWorkbookCreation: true,
    enableMultiSelection: true
  }
}) => {
  const {
    searchQuery,
    setSearchQuery,
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
    handleExportExcel,
    handleKeyDown,
    handleCreateWorkbook,
    handleSaveWorkbook,
    handleSavePassages,
    handlePassageSelection,
    applyFilters,
    hasSearched,
    itemIdQuery,
    setItemIdQuery,
    groupedByHeader
  } = usePassageSearch(maxSelections);
  
  const handleCustomPassageSelection = (passage: Passage) => {
    if (!enableMultiSelect && !uiOptions.enableMultiSelection) {
      if (onPassageSelect) {
        onPassageSelect(passage);
      }
      return;
    }
    handlePassageSelection(passage);
  };
  
  return <>
      <Card>
        <CardHeader>
          <CardTitle>지문찾기</CardTitle>
          <CardDescription>데이터베이스에 등록된 지문에서 원하는 지문을 찾아보세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <PassageSearchBar 
              searchQuery={searchQuery} 
              setSearchQuery={setSearchQuery} 
              filterCategory={filterCategory} 
              setFilterCategory={setFilterCategory} 
              categories={categories} 
              handleSearch={handleSearch} 
              handleKeyDown={handleKeyDown} 
              showCategoryFilter={uiOptions.showCategoryFilter}
              itemIdQuery={itemIdQuery}
              setItemIdQuery={setItemIdQuery}
            />
            
            <SelectedPassagesList 
              accumulatedSelections={accumulatedSelections} 
              maxSelections={maxSelections} 
              showAccumulatedSelections={showAccumulatedSelections} 
              setShowAccumulatedSelections={setShowAccumulatedSelections} 
              clearAccumulatedSelections={clearAccumulatedSelections} 
              removeFromAccumulated={removeAccumulatedPassage} 
              handleApplySelectedPassages={handleSavePassages} 
            />
            
            <ActionsBar 
              resultsCount={results.length} 
              accumulatedCount={accumulatedSelections.length} 
              exporting={exporting} 
              handleExportExcel={handleExportExcel} 
              handleApplySelectedPassages={handleSavePassages} 
              clearAccumulatedSelections={clearAccumulatedSelections} 
              showExportAllButton={uiOptions.showExportAllButton} 
              createWorkbook={handleCreateWorkbook} 
              saveAllPassages={handleSavePassages} 
              enableWorkbookCreation={uiOptions.enableWorkbookCreation} 
            />
            
            <PassageResultsList 
              loading={loading} 
              results={applyFilters()} 
              hasSearched={hasSearched} 
              isPassageAccumulated={isPassageAccumulated} 
              handleCopy={handleCopy} 
              handlePassageSelection={handleCustomPassageSelection}
              groupedByHeader={groupedByHeader}
              itemIdQuery={itemIdQuery}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t bg-muted/50 px-6 py-3">
          <p className="text-xs text-muted-foreground">
            데이터베이스에서 지문을 선택하면 현재 작업에 사용할 수 있습니다.
          </p>
        </CardFooter>
      </Card>

      <WorkbookDialog 
        open={workbookDialogOpen} 
        onOpenChange={setWorkbookDialogOpen} 
        accumulatedSelections={accumulatedSelections} 
        onSave={handleSaveWorkbook} 
        isCreating={isCreatingWorkbook} 
        workbookName={workbookName} 
        setWorkbookName={setWorkbookName} 
      />
    </>;
};

export default PassageSearch;
