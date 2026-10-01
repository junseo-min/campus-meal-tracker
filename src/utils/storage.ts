import { MealReview } from '../types/meal';

const STORAGE_KEY = 'campus_meal_reviews_v1';

export const SAMPLE_REVIEWS: MealReview[] = [
  {
    id: 'sample-1',
    cafeteria: '학생회관 식당',
    menuName: '수제 치즈 돈까스 정식',
    price: 6000,
    rating: 9,
    mealTime: '점심',
    date: '2026-09-30',
    comment: '치즈 양도 엄청 많고 밥 리필 가능해서 최고의 가성비! 튀김옷도 바삭함.',
    valueScore: '가성비 최고',
    tags: ['바삭함', '치즈듬뿍', '밥리필'],
    emoji: '🍱',
    createdAt: Date.now() - 1000 * 60 * 60 * 2,
  },
  {
    id: 'sample-2',
    cafeteria: '제1공학관 식당',
    menuName: '매콤 제육볶음 도시락',
    price: 5300,
    rating: 8,
    mealTime: '점심',
    date: '2026-09-29',
    comment: '불맛 살짝 나고 양념이 밥도둑. 양배추 샐러드 드레싱이 잘 어울림.',
    valueScore: '가성비 최고',
    tags: ['불맛', '매콤', '든든함'],
    emoji: '🥩',
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
  },
  {
    id: 'sample-3',
    cafeteria: '기숙사 식당',
    menuName: '해물 순두부찌개 & 계란말이',
    price: 4800,
    rating: 7,
    mealTime: '저녁',
    date: '2026-09-28',
    comment: '국물이 얼큰하고 조개도 꽤 들어있음. 계란말이가 따뜻해서 좋았음.',
    valueScore: '적당함',
    tags: ['얼큰국물', '해장추천'],
    emoji: '🍲',
    createdAt: Date.now() - 1000 * 60 * 60 * 48,
  },
  {
    id: 'sample-4',
    cafeteria: '중앙도서관 라운지 식당',
    menuName: '직화 참치마요 컵밥 + 미니우동',
    price: 4200,
    rating: 8,
    mealTime: '점심',
    date: '2026-09-27',
    comment: '시험기간에 빠르게 먹기 딱 좋음. 김가루와 마요네즈 조합 훌륭함.',
    valueScore: '가성비 최고',
    tags: ['빠른식사', '혼밥최적'],
    emoji: '🍜',
    createdAt: Date.now() - 1000 * 60 * 60 * 72,
  },
  {
    id: 'sample-5',
    cafeteria: '교수회관(일반개방)',
    menuName: '소고기 영양 육개장 정식',
    price: 7500,
    rating: 9,
    mealTime: '점심',
    date: '2026-09-26',
    comment: '학식 치고는 가격대가 있지만 고기 건더기가 풍성하고 밑반찬 4종이 정갈함.',
    valueScore: '적당함',
    tags: ['고급학식', '든든한한끼'],
    emoji: '🥘',
    createdAt: Date.now() - 1000 * 60 * 60 * 96,
  },
  {
    id: 'sample-6',
    cafeteria: '제2학생회관 스낵코너',
    menuName: '치즈라면 & 참치김밥 반줄',
    price: 3800,
    rating: 6,
    mealTime: '아침',
    date: '2026-09-25',
    comment: '면이 살짝 불어서 아쉬웠지만 3800원에 아침 해결하기에는 무난함.',
    valueScore: '가성비 최고',
    tags: ['가벼운식사', '스낵'],
    emoji: '🍜',
    createdAt: Date.now() - 1000 * 60 * 60 * 120,
  },
  {
    id: 'sample-7',
    cafeteria: '제1공학관 식당',
    menuName: '카레라이스 & 돈까스 토핑',
    price: 5500,
    rating: 5,
    mealTime: '저녁',
    date: '2026-09-24',
    comment: '카레가 묽고 돈까스가 미리 튀겨져서 조금 식어있었음. 평타 이하.',
    valueScore: '비싼편',
    tags: ['식은튀김', '아쉬움'],
    emoji: '🍛',
    createdAt: Date.now() - 1000 * 60 * 60 * 144,
  },
  {
    id: 'sample-8',
    cafeteria: '학생회관 식당',
    menuName: '뚝배기 불고기',
    price: 5800,
    rating: 10,
    mealTime: '점심',
    date: '2026-09-23',
    comment: '인생 학식 메뉴! 당면 듬뿍에 뚝배기 바글바글 끓여나옴. 만점 드립니다.',
    valueScore: '가성비 최고',
    tags: ['인생메뉴', '강력추천', '당면듬뿍'],
    emoji: '🍲',
    createdAt: Date.now() - 1000 * 60 * 60 * 168,
  }
];

export const DEFAULT_CAFETERIAS = [
  '학생회관 식당',
  '제1공학관 식당',
  '기숙사 식당',
  '중앙도서관 라운지 식당',
  '교수회관(일반개방)',
  '제2학생회관 스낵코너',
  '사범대 식당',
  '예술관 식당'
];

export function getStoredReviews(): MealReview[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_REVIEWS));
      return SAMPLE_REVIEWS;
    }
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SAMPLE_REVIEWS;
  } catch (err) {
    console.error('Failed to load reviews from localStorage', err);
    return SAMPLE_REVIEWS;
  }
}

export function saveStoredReviews(reviews: MealReview[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
  } catch (err) {
    console.error('Failed to save reviews to localStorage', err);
  }
}
