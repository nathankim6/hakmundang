import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xquvuwckxspnflxeodlu.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxdXZ1d2NreHNwbmZseGVvZGx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxODIyMDcsImV4cCI6MjA4MTc1ODIwN30.Y_n5OrmgJKkLQP9UCb7vyw-FiRW5l_HsKdF41I_k2HQ';

const supabase = createClient(supabaseUrl, anonKey);
const workbookId = '2ba8fb56-c7b0-4fe5-af65-3f63dcf20a9a';
const targetDays = [14,15,16,17,18,19,20,21,22,23,24,25];

function splitMeanings(meaning) {
  if (!meaning) return [];
  return meaning.replace(/^\([a-z.]+\)\s*/i, '').split(/[,;]/).map(s => s.trim()).filter(Boolean);
}
function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}
async function main() {
  const { data, error } = await supabase.rpc('load_workbook_data', { p_workbook_id: workbookId });
  if (error) { console.error(error); return; }
  const dayGroups = data.day_groups || [];
  const selected = dayGroups.filter(dg => targetDays.includes(parseInt(String(dg.day_name).replace(/\D/g, ''), 10)));
  const headwords = [];
  for (const dg of selected) {
    for (const w of dg.words || []) {
      if (!w.word_type || w.word_type === '표제어') headwords.push({ day: dg.day_name, word: w });
    }
  }
  const poly = headwords.filter(({ word }) => splitMeanings(word.meaning).length >= 3);
  // simulate AI examples have same number of rows as meaning count
  const groups = poly.map(({ word }) => ({ word: word.word, rows: splitMeanings(word.meaning).length }));
  const pages = chunk(groups, 8);
  console.log('Pages:', pages.length);
  for (let i = 0; i < pages.length; i++) {
    const totalRows = pages[i].reduce((s, g) => s + g.rows, 0);
    console.log(`Page ${i + 1}: words=${pages[i].length}, rows=${totalRows}, list=${pages[i].map(g => g.word + '(' + g.rows + ')').join(', ')}`);
  }
}
main();
