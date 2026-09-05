import { supabase } from "@/integrations/supabase/client";
import { DayGroup } from "@/types/vocabulary";
import { WorkbookConfig } from "@/components/WorkbookSettings";

export interface SavedWorkbook {
  id: string;
  title: string;
  themeColor: string;
  secondaryColor: string;
  difficultyLevel: string;
  includeExamples: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function saveWorkbook(
  dayGroups: DayGroup[],
  config: WorkbookConfig,
  onProgress?: (progress: number) => void
): Promise<string> {
  // Create workbook
  const { data: workbook, error: workbookError } = await supabase
    .from('workbooks')
    .insert({
      title: config.title,
      theme_color: config.themeColor,
      secondary_color: config.secondaryColor,
      difficulty_level: config.difficultyLevel,
      include_examples: config.includeExamples,
      cover_subtitle: config.coverSubtitle || '',
    })
    .select()
    .single();

  if (workbookError) {
    throw new Error(`Failed to save workbook: ${workbookError.message}`);
  }

  // Create day groups
  for (let i = 0; i < dayGroups.length; i++) {
    const group = dayGroups[i];
    
    const { data: dayGroup, error: dayGroupError } = await supabase
      .from('day_groups')
      .insert({
        workbook_id: workbook.id,
        day_name: group.day,
        sort_order: i,
      })
      .select()
      .single();

    if (dayGroupError) {
      throw new Error(`Failed to save day group: ${dayGroupError.message}`);
    }

    // Batch insert words for this day group
    const wordsData = group.words.map((word, j) => ({
      day_group_id: dayGroup.id,
      word: word.word,
      meaning: word.meaning,
      pronunciation: word.pronunciation || null,
      part_of_speech: word.partOfSpeech || null,
      sort_order: j,
      synonyms: word.synonyms || [],
      antonyms: word.antonyms || [],
      synonyms_korean: word.synonymsKorean || [],
      antonyms_korean: word.antonymsKorean || [],
      word_type: word.wordType || null,
    } as any));

    // Insert in batches of 100
    const BATCH_SIZE = 100;
    const savedWordIds: string[] = [];
    for (let b = 0; b < wordsData.length; b += BATCH_SIZE) {
      const batch = wordsData.slice(b, b + BATCH_SIZE);
      const { data: savedWords, error: wordError } = await supabase
        .from('words')
        .insert(batch)
        .select('id');

      if (wordError) {
        throw new Error(`Failed to save words: ${wordError.message}`);
      }
      if (savedWords) {
        savedWordIds.push(...savedWords.map(w => w.id));
      }
    }

    // Batch insert examples
    const allExamples: any[] = [];
    group.words.forEach((word, j) => {
      if (word.examples && word.examples.length > 0 && savedWordIds[j]) {
        word.examples.forEach((example, idx) => {
          allExamples.push({
            word_id: savedWordIds[j],
            english: example.english,
            korean: example.korean || null,
            sort_order: idx,
          });
        });
      }
    });

    if (allExamples.length > 0) {
      for (let b = 0; b < allExamples.length; b += BATCH_SIZE) {
        const batch = allExamples.slice(b, b + BATCH_SIZE);
        const { error: examplesError } = await supabase
          .from('word_examples')
          .insert(batch);
        if (examplesError) {
          throw new Error(`Failed to save examples: ${examplesError.message}`);
        }
      }
    }

    if (onProgress) {
      onProgress(Math.round(((i + 1) / dayGroups.length) * 100));
    }
  }

  return workbook.id;
}

export async function loadWorkbook(workbookId: string): Promise<{
  dayGroups: DayGroup[];
  config: WorkbookConfig;
}> {
  // Single RPC call to load all data at once (workbook + day_groups + words + examples)
  const { data, error } = await supabase.rpc('load_workbook_data', {
    p_workbook_id: workbookId,
  });

  if (error) throw new Error(`Failed to load workbook: ${error.message}`);
  
  const result = data as any;
  if (!result || !result.workbook) throw new Error('Workbook not found');

  const workbook = result.workbook;
  const dayGroupsData = result.day_groups || [];

  const dayGroups: DayGroup[] = dayGroupsData.map((dayGroup: any) => ({
    day: dayGroup.day_name,
    words: (dayGroup.words || []).map((word: any) => ({
      id: word.id,
      day: dayGroup.day_name,
      word: word.word,
      meaning: word.meaning,
      pronunciation: word.pronunciation || undefined,
      partOfSpeech: word.part_of_speech || undefined,
      synonyms: word.synonyms || [],
      antonyms: word.antonyms || [],
      synonymsKorean: word.synonyms_korean || [],
      antonymsKorean: word.antonyms_korean || [],
      englishDefinition: word.english_definition || undefined,
      etymology: word.etymology || undefined,
      imageUrl: word.image_url || undefined,
      wordType: word.word_type || undefined,
      examples: (word.examples || []).map((ex: any) => ({
        english: ex.english,
        korean: ex.korean || undefined,
      })),
    })),
  }));

  return {
    dayGroups,
    config: {
      title: workbook.title,
      themeColor: workbook.theme_color,
      secondaryColor: workbook.secondary_color,
      difficultyLevel: workbook.difficulty_level as 'elementary' | 'middle' | 'high',
      includeExamples: workbook.include_examples,
      coverStyle: 'premium' as const,
      coverSubtitle: workbook.cover_subtitle || '',
    },
  };
}

export async function listWorkbooks(): Promise<SavedWorkbook[]> {
  const { data, error } = await supabase
    .from('workbooks')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to list workbooks: ${error.message}`);
  }

  return data.map(wb => ({
    id: wb.id,
    title: wb.title,
    themeColor: wb.theme_color,
    secondaryColor: wb.secondary_color,
    difficultyLevel: wb.difficulty_level,
    includeExamples: wb.include_examples,
    createdAt: wb.created_at,
    updatedAt: wb.updated_at,
  }));
}

export async function deleteWorkbook(workbookId: string): Promise<void> {
  const { error } = await supabase
    .from('workbooks')
    .delete()
    .eq('id', workbookId);

  if (error) {
    throw new Error(`Failed to delete workbook: ${error.message}`);
  }
}
