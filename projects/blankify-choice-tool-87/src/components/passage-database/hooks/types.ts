
export interface Passage {
  id: string;
  content: string;
  translation: string;
  created_at: string;
  updated_at: string;
  tags: string[];
  category: string;
  difficulty: string;
  source: string;
  item_id: string;
}

export interface PassageUIOptions {
  showCategoryFilter: boolean;
  showExportAllButton: boolean;
  enableWorkbookCreation: boolean;
  enableMultiSelection: boolean;
}

export interface PassageEntry {
  id?: string;
  content: string;
  translation: string;
  tags?: string[];
  category?: string;
  difficulty?: string;
  source?: string;
  item_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface WorkbookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accumulatedSelections: Passage[];
  onSave: () => void;
  isCreating: boolean;
  workbookName: string;
  setWorkbookName: (name: string) => void;
}

export interface PassageFormState {
  content: string;
  translation: string;
  tags: string;
  category: string;
  difficulty: string;
  source: string;
  item_id: string;
  selectedPassageId: string | null;
  isUpdateMode: boolean;
}

export interface PassageData {
  content: string;
  translation: string;
  tags: string[];
  category: string;
  difficulty: string;
  source: string;
  item_id: string;
}

export interface PassageFormProps {
  content: string;
  setContent: (content: string) => void;
  translation: string;
  setTranslation: (translation: string) => void;
  tags: string;
  setTags: (tags: string) => void;
  category: string;
  setCategory: (category: string) => void;
  difficulty: string;
  setDifficulty: (difficulty: string) => void;
  source: string;
  setSource: (source: string) => void;
  itemId: string;
  setItemId: (itemId: string) => void;
  isUpdateMode: boolean;
  clearInputFields: () => void;
  handleSubmit: (e: React.FormEvent) => void;
  isSubmitting?: boolean;
  multipleEntries?: PassageEntry[];
  setMultipleEntries?: (entries: PassageEntry[]) => void;
  handleBulkSubmit?: (entries: PassageEntry[]) => Promise<boolean>;
}
