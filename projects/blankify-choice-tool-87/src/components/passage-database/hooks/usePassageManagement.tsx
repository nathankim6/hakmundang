
import { useState, useEffect, useCallback } from 'react';
import { usePassageForm } from './usePassageForm';
import { usePassageOperations } from './usePassageOperations';
import { usePassageSelection } from './usePassageSelection';
import { usePassageFilters } from './usePassageFilters';
import { Passage } from './types';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const usePassageManagement = () => {
  const [passages, setPassages] = useState<Passage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const formHook = usePassageForm();

  const {
    filteredPassages,
    searchQuery,
    filterCategory,
    filterDifficulty,
    sortOption,
    setSearchQuery,
    setFilterCategory,
    setFilterDifficulty,
    setSortOption,
    applyFilters,
    categories,
    handleSearch
  } = usePassageFilters(passages);

  const {
    selectedPassages,
    handleSelectPassage,
    handleSelectAllPassages,
    clearSelectedPassages
  } = usePassageSelection(filteredPassages);

  const {
    isSubmitting,
    fetchPassages: fetchPassagesOperation,
    handleCreatePassage,
    handleUpdatePassage,
    handleDeletePassage,
    handleDeleteSelectedPassages,
    handleDeleteAllPassages,
    handleCopy,
    handleSubmit,
    handleCreateMultiplePassages
  } = usePassageOperations({
    form: formHook.form,
    resetForm: formHook.resetForm,
    passages,
    refreshPassages: () => setRefreshTrigger(prev => prev + 1),
    selectedPassages,
    clearSelectedPassages
  });

  const fetchPassages = useCallback(async () => {
    try {
      setLoading(true);

      const timestamp = new Date().getTime();

      const { data, error } = await supabase
        .from('passages')
        .select('*')
        .order('created_at', { ascending: false })
        .returns<Passage[]>();

      if (error) {
        throw new Error(`API call failed with status: ${error.code}`);
      }

      const enrichedData = data?.map(passage => ({
        ...passage,
        updated_at: passage.updated_at || passage.created_at
      })) || [];

      setPassages(enrichedData);
    } catch (error) {
      console.error('Error fetching passages:', error);
      toast({
        title: "오류",
        description: "지문을 불러오는데 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPassages();

    const channel = supabase
      .channel('passages-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'passages' }, 
        (payload) => {
          console.log('Realtime update received:', payload);
          fetchPassages();
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [refreshTrigger, fetchPassages]);

  return {
    passages,
    loading,
    fetchPassages,

    ...formHook,

    filteredPassages,
    searchQuery,
    filterCategory,
    filterDifficulty,
    sortOption,
    setSearchQuery,
    setFilterCategory,
    setFilterDifficulty,
    setSortOption,
    applyFilters,
    categories,
    handleSearch,

    selectedPassages,
    handleSelectPassage,
    handleSelectAllPassages,
    clearSelectedPassages,

    isSubmitting,
    handleCreatePassage,
    handleUpdatePassage,
    handleDeletePassage,
    handleSubmit,
    handleCopy,
    handleDeleteSelectedPassages,
    handleDeleteAllPassages,
    handleCreateMultiplePassages
  };
};
