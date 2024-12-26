export const maskWord = (word: string, mode = 'default') => {
  if (mode === '뜻쓰기') {
    return '_'.repeat(word.length);
  }
  if (word.length <= 1) return word;
  return word[0] + '_'.repeat(word.length - 1);
};