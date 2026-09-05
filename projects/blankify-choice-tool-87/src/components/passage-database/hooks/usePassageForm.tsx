
import { useState } from 'react';
import { Passage, PassageFormState } from './types';

const initialFormState: PassageFormState = {
  content: '',
  translation: '',
  tags: '',
  category: '',
  difficulty: '',
  source: '',
  item_id: '',
  selectedPassageId: null,
  isUpdateMode: false
};

export const usePassageForm = () => {
  const [form, setForm] = useState<PassageFormState>(initialFormState);

  const setContent = (content: string) => setForm(prev => ({ ...prev, content }));
  const setTranslation = (translation: string) => setForm(prev => ({ ...prev, translation }));
  const setTags = (tags: string) => setForm(prev => ({ ...prev, tags }));
  const setCategory = (category: string) => setForm(prev => ({ ...prev, category }));
  const setDifficulty = (difficulty: string) => setForm(prev => ({ ...prev, difficulty }));
  const setSource = (source: string) => setForm(prev => ({ ...prev, source }));
  const setItemId = (itemId: string) => setForm(prev => ({ ...prev, item_id: itemId }));

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(initialFormState);
  };

  const setFormValues = (values: Partial<PassageFormState>) => {
    setForm(prev => ({ ...prev, ...values }));
  };

  const validateForm = () => {
    if (!form.content || form.content.trim() === '') {
      return false;
    }
    return true;
  };

  const clearInputFields = () => {
    setForm(initialFormState);
  };

  const handleEdit = (passage: Passage) => {
    // Make sure all required fields are properly set
    setForm({
      content: passage.content || '',
      translation: passage.translation || '',
      tags: passage.tags ? passage.tags.join(', ') : '',
      category: passage.category || '',
      difficulty: passage.difficulty || '',
      source: passage.source || '',
      item_id: passage.item_id || '',
      selectedPassageId: passage.id,
      isUpdateMode: true
    });
    
    // Scroll to the form
    setTimeout(() => {
      const formElement = document.querySelector('form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const preparePassageData = () => {
    return {
      content: form.content,
      translation: form.translation,
      tags: form.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
      category: form.category,
      difficulty: form.difficulty,
      source: form.source,
      item_id: form.item_id
    };
  };

  return {
    form,
    content: form.content,
    translation: form.translation,
    tags: form.tags,
    category: form.category,
    difficulty: form.difficulty,
    source: form.source,
    itemId: form.item_id,
    isUpdateMode: form.isUpdateMode,
    selectedPassageId: form.selectedPassageId,
    setContent,
    setTranslation,
    setTags,
    setCategory,
    setDifficulty,
    setSource,
    setItemId,
    resetForm,
    handleFormChange,
    setFormValues,
    validateForm,
    clearInputFields,
    handleEdit,
    preparePassageData
  };
};
