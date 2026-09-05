export interface Workbook {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  totalQuestions: number;
  totalPages: number;
  coverImage?: string;
  createdAt: string;
  category: string;
}
