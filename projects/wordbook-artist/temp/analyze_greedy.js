function chunkGreedy(groups, maxWords, maxRows) {
  const pages = [];
  let cur = [];
  let curRows = 0;
  for (const g of groups) {
    const gRows = g.rows;
    if (cur.length > 0 && (cur.length >= maxWords || curRows + gRows > maxRows)) {
      pages.push(cur);
      cur = [g];
      curRows = gRows;
    } else {
      cur.push(g);
      curRows += gRows;
    }
  }
  if (cur.length) pages.push(cur);
  return pages;
}
const groups = [3,4,5,3,3,4,3,4,3,3,4,3,3,4,3,4,4,4,4,3,5,4,5,3,4,3,3,4,3,3,4,5,3,4,4,3,3,4,3,3,3,3,5,3,3,3,3,3,4,3,3,3,3,4,5,4,4,3,3,5,4,4,3,3,3,4,4,3,3,3,4,5,3,6,4,4,3,3,4,3,3,3,4,5,3,3,4,4,4,3,3,4,4,5,3,3,4,3,3,3,4,3,3,4,4,3,3,4,3,3,4,4,3,3,4,3,3,4,4,3,3,4,3,4,3,3,4,5,3,4,4,4,3,3,4,3,3,4,5,3,3,4,4,4,3,3,3,3,4,5,3,3,4,5,3,4,3,4,4,3,4,3].map((rows, i) => ({ rows }));
const pages = chunkGreedy(groups, 8, 30);
console.log('Pages:', pages.length);
for (let i = 0; i < pages.length; i++) {
  const totalRows = pages[i].reduce((s, g) => s + g.rows, 0);
  console.log(`Page ${i + 1}: words=${pages[i].length}, rows=${totalRows}, rowsList=${pages[i].map(g => g.rows).join(',')}`);
}
