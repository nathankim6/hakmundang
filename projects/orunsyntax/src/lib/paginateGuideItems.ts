/**
 * Dynamically paginate guide items so that pages with long analyses
 * get only 2 items instead of 3, preventing overflow.
 */

const ITEMS_PER_PAGE = 2;

export interface GuideItem {
  question: { id: number; sentence: string; translation?: string | undefined };
  analysis: string;
}

export function paginateGuideItems(items: GuideItem[]): GuideItem[][] {
  const pages: GuideItem[][] = [];
  for (let i = 0; i < items.length; i += ITEMS_PER_PAGE) {
    pages.push(items.slice(i, i + ITEMS_PER_PAGE));
  }
  return pages;
}

export function countGuidePages(items: GuideItem[]): number {
  return paginateGuideItems(items).length;
}
