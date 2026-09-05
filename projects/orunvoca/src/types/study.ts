export interface FlashCard {
  id: string;
  front: string;
  back: string;
  difficulty: "easy" | "medium" | "hard";
  lastReviewed?: Date;
  correctCount: number;
  incorrectCount: number;
}

export interface CardSet {
  id: string;
  title: string;
  description: string;
  cards: FlashCard[];
  createdAt: Date;
  updatedAt: Date;
  totalStudyTime: number; // in minutes
  imageUrl?: string | null;
  selectedDays?: string[];
}

export interface StudySession {
  id: string;
  cardSetId: string;
  startTime: Date;
  endTime?: Date;
  cardsStudied: number;
  correctAnswers: number;
  incorrectAnswers: number;
}

export interface StudyProgress {
  cardSetId: string;
  totalCards: number;
  masteredCards: number;
  inProgressCards: number;
  newCards: number;
  accuracyRate: number;
  totalStudyTime: number;
}