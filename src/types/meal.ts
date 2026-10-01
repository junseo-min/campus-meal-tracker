export interface MealReview {
  id: string;
  cafeteria: string;       // 어느 학식당 (예: 학생회관 식당, 제1공학관 식당)
  menuName: string;        // 어떤 음식 (예: 돈까스, 제육볶음)
  price: number;           // 얼마에 먹었는지 (원)
  rating: number;          // 평점 (1 ~ 10점 만점)
  mealTime?: '아침' | '점심' | '저녁' | '야식';
  date: string;            // YYYY-MM-DD
  comment?: string;        // 한줄평 / 후기
  valueScore?: '가성비 최고' | '적당함' | '비싼편';
  tags?: string[];
  emoji?: string;
  createdAt: number;
}

export type SortField = 'date' | 'rating' | 'price' | 'menuName';
export type SortOrder = 'asc' | 'desc';

export interface FilterState {
  cafeteria: string;
  minRating: number;
  maxRating: number;
  maxPrice: number;
  searchQuery: string;
  mealTime: string;
  sortBy: SortField;
  sortOrder: SortOrder;
}
