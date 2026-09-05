import { Question } from './parseQuestions';

const MIN_MATCHING_WORDS = 9;

function getNGrams(sentence: string, n: number): string[] {
  const words = sentence.toLowerCase().trim().replace(/\s+/g, ' ').split(' ');
  if (words.length < n) return [];
  const ngrams: string[] = [];
  for (let i = 0; i <= words.length - n; i++) {
    ngrams.push(words.slice(i, i + n).join(' '));
  }
  return ngrams;
}

/**
 * Remove duplicate sentences using 9-word n-gram matching.
 * Keeps the first occurrence and removes subsequent duplicates.
 * Returns the filtered list of questions (IDs unchanged).
 */
export function deduplicateSentences(questions: Question[]): { deduplicated: Question[]; removedIds: Set<number> } {
  const ngramMap = new Map<string, Set<number>>();

  for (const q of questions) {
    const ngrams = getNGrams(q.sentence, MIN_MATCHING_WORDS);
    for (const ngram of ngrams) {
      const existing = ngramMap.get(ngram) || new Set();
      existing.add(q.id);
      ngramMap.set(ngram, existing);
    }
  }

  // Build groups of duplicate IDs
  const idToGroup = new Map<number, Set<number>>();
  for (const [, idSet] of ngramMap.entries()) {
    if (idSet.size > 1) {
      const ids = Array.from(idSet);
      let mergedGroup = new Set(ids);
      for (const id of ids) {
        if (idToGroup.has(id)) {
          for (const existingId of idToGroup.get(id)!) {
            mergedGroup.add(existingId);
          }
        }
      }
      for (const id of mergedGroup) {
        idToGroup.set(id, mergedGroup);
      }
    }
  }

  // Keep first in each group, remove rest
  const removedIds = new Set<number>();
  const processed = new Set<number>();
  for (const [id, group] of idToGroup.entries()) {
    if (processed.has(id)) continue;
    const sorted = Array.from(group).sort((a, b) => a - b);
    for (let i = 1; i < sorted.length; i++) {
      removedIds.add(sorted[i]);
    }
    for (const gid of group) processed.add(gid);
  }

  const deduplicated = questions.filter(q => !removedIds.has(q.id));
  return { deduplicated, removedIds };
}
