import React, { useState, useEffect } from 'react';
import { X, Star, Sparkles, DollarSign, MapPin, Utensils, Calendar, Clock, Smile } from 'lucide-react';
import confetti from 'canvas-confetti';
import { MealReview } from '../types/meal';
import { DEFAULT_CAFETERIAS } from '../utils/storage';

interface MealFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (meal: Omit<MealReview, 'id' | 'createdAt'>, id?: string) => void;
  editingMeal?: MealReview | null;
}

const POPULAR_MENUS = [
  '치즈 돈까스 정식',
  '매콤 제육볶음 덮밥',
  '해물 순두부찌개',
  '차돌 된장찌개',
  '직화 참치마요 컵밥',
  '뚝배기 불고기',
  '치즈라면 & 공깃밥',
  '산채 비빔밥',
  '카레라이스 & 돈까스',
  '닭갈비 덮밥',
];

const EMOJI_OPTIONS = ['🍱', '🍲', '🥩', '🍜', '🍛', '🥘', '🍗', '🥟', '🥪', '🥗', '🍔', '🍕'];

export const MealFormModal: React.FC<MealFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingMeal,
}) => {
  const [cafeteria, setCafeteria] = useState('');
  const [menuName, setMenuName] = useState('');
  const [price, setPrice] = useState<number>(5500);
  const [rating, setRating] = useState<number>(8);
  const [mealTime, setMealTime] = useState<'아침' | '점심' | '저녁' | '야식'>('점심');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [comment, setComment] = useState('');
  const [valueScore, setValueScore] = useState<'가성비 최고' | '적당함' | '비싼편'>('가성비 최고');
  const [emoji, setEmoji] = useState('🍱');
  const [tagsInput, setTagsInput] = useState('');

  // Editing mode populate
  useEffect(() => {
    if (editingMeal) {
      setCafeteria(editingMeal.cafeteria);
      setMenuName(editingMeal.menuName);
      setPrice(editingMeal.price);
      setRating(editingMeal.rating);
      setMealTime(editingMeal.mealTime || '점심');
      setDate(editingMeal.date || new Date().toISOString().slice(0, 10));
      setComment(editingMeal.comment || '');
      setValueScore(editingMeal.valueScore || '적당함');
      setEmoji(editingMeal.emoji || '🍱');
      setTagsInput(editingMeal.tags ? editingMeal.tags.join(', ') : '');
    } else {
      // Default reset
      setCafeteria('학생회관 식당');
      setMenuName('');
      setPrice(5500);
      setRating(8);
      setMealTime('점심');
      setDate(new Date().toISOString().slice(0, 10));
      setComment('');
      setValueScore('가성비 최고');
      setEmoji('🍱');
      setTagsInput('');
    }
  }, [editingMeal, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!cafeteria.trim()) {
      alert('어느 학식당인지 입력해주세요!');
      return;
    }
    if (!menuName.trim()) {
      alert('어떤 음식(메뉴명)을 드셨는지 입력해주세요!');
      return;
    }
    if (!price || price < 0) {
      alert('가격을 올바르게 입력해주세요!');
      return;
    }

    // Process tags
    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    onSave(
      {
        cafeteria: cafeteria.trim(),
        menuName: menuName.trim(),
        price: Number(price),
        rating: Number(rating),
        mealTime,
        date,
        comment: comment.trim(),
        valueScore,
        tags,
        emoji,
      },
      editingMeal?.id
    );

    try {
      if (rating >= 9) {
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.5 },
        });
      }
    } catch {
      // Ignore
    }

    onClose();
  };

  const getRatingFeedback = (val: number) => {
    if (val >= 10) return { label: '🏆 10점 만점! 인생 학식', color: 'text-amber-500 font-extrabold', bg: 'bg-amber-50 border-amber-300' };
    if (val >= 9) return { label: '😍 9점! 강력 추천 대박 맛집', color: 'text-indigo-600 font-bold', bg: 'bg-indigo-50 border-indigo-200' };
    if (val >= 7) return { label: '😋 7~8점! 맛있고 만족스러움', color: 'text-emerald-600 font-semibold', bg: 'bg-emerald-50 border-emerald-200' };
    if (val >= 5) return { label: '😐 5~6점! 무난한 보통 학식', color: 'text-yellow-600 font-medium', bg: 'bg-yellow-50 border-yellow-200' };
    if (val >= 3) return { label: '😕 3~4점! 조금 아쉬움', color: 'text-orange-600 font-medium', bg: 'bg-orange-50 border-orange-200' };
    return { label: '😫 1~2점! 다시는 안 먹을 지뢰 메뉴', color: 'text-red-600 font-semibold', bg: 'bg-red-50 border-red-200' };
  };

  const currentFeedback = getRatingFeedback(rating);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all my-8 animate-in fade-in duration-200"
        role="dialog"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{emoji}</span>
            <div>
              <h2 className="text-lg font-bold">
                {editingMeal ? '학식 평가 수정' : '오늘 먹은 학식 평점 남기기'}
              </h2>
              <p className="text-xs text-emerald-100">
                식당, 메뉴명, 가격, 1~10점 평점을 입력하면 엑셀로 자동 정리됩니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-100 hover:text-white hover:bg-emerald-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-sm">
          {/* 1. 어느 학식당 (Cafeteria) */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" />
              어느 학식당에서 드셨나요? <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={cafeteria}
              onChange={(e) => setCafeteria(e.target.value)}
              placeholder="예: 학생회관 식당, 제1공학관 식당, 기숙사 식당"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-600 transition-all font-medium text-slate-900"
            />
            {/* Quick Selection Chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-xs text-slate-600 self-center mr-1">빠른 선택:</span>
              {DEFAULT_CAFETERIAS.slice(0, 5).map((place) => (
                <button
                  type="button"
                  key={place}
                  onClick={() => setCafeteria(place)}
                  className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                    cafeteria === place
                      ? 'bg-emerald-600 text-white font-medium'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {place}
                </button>
              ))}
            </div>
          </div>

          {/* 2. 어떤 음식 (Food/Menu) */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
              <Utensils className="w-4 h-4 text-emerald-600" />
              어떤 음식을 드셨나요? (메뉴명) <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  required
                  value={menuName}
                  onChange={(e) => setMenuName(e.target.value)}
                  placeholder="예: 수제 치즈 돈까스, 매콤 제육덮밥, 해물 순두부찌개"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-600 transition-all font-medium text-slate-900"
                />
              </div>
              {/* Emoji Selector */}
              <div className="relative group shrink-0">
                <button
                  type="button"
                  className="h-full px-3 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-lg flex items-center justify-center"
                  title="아이콘 이모지 변경"
                >
                  {emoji}
                </button>
                <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg p-2 shadow-lg hidden group-hover:grid grid-cols-4 gap-1 z-20 w-44">
                  {EMOJI_OPTIONS.map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setEmoji(em)}
                      className="p-1.5 text-xl hover:bg-slate-100 rounded text-center transition-colors"
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {/* Quick Menu Suggestions */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-xs text-slate-600 self-center mr-1">인기 메뉴:</span>
              {POPULAR_MENUS.slice(0, 5).map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setMenuName(m)}
                  className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                    menuName === m
                      ? 'bg-emerald-600 text-white font-medium'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* 3. 얼마에 먹었는지 (Price) & 식사 시간 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                얼마에 드셨나요? (가격) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="100"
                  required
                  value={price || ''}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  placeholder="5500"
                  className="w-full pl-3.5 pr-8 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-600 font-semibold text-slate-900"
                />
                <span className="absolute right-3 top-2.5 text-slate-600 font-medium">원</span>
              </div>
              {/* Quick price adjusters */}
              <div className="flex gap-1.5 mt-2">
                {[4500, 5500, 6500].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPrice(p)}
                    className="text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  >
                    {p.toLocaleString()}원
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPrice((prev) => (prev || 0) + 500)}
                  className="text-xs px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium"
                >
                  +500원
                </button>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-600" />
                식사 시간 구분
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['아침', '점심', '저녁', '야식'] as const).map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => setMealTime(t)}
                    className={`py-2 rounded-lg text-xs font-semibold border transition-all ${
                      mealTime === t
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-slate-600" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="text-xs text-slate-700 border border-slate-200 rounded px-2 py-1 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 4. 평점 (최소 1점 ~ 10점 만점!) */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                평점 선택 (1점 ~ 10점 만점) <span className="text-red-500">*</span>
              </label>
              <div className="text-right">
                <span className="text-2xl font-black text-emerald-600 tracking-tight">
                  {rating}
                </span>
                <span className="text-xs text-slate-600 font-bold ml-0.5">/ 10 점</span>
              </div>
            </div>

            {/* 1 ~ 10 Grid Buttons */}
            <div className="grid grid-cols-10 gap-1 sm:gap-1.5">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                const isSelected = rating === num;
                let bgActive = 'bg-emerald-600 text-white';
                if (num <= 3) bgActive = 'bg-red-500 text-white';
                else if (num <= 6) bgActive = 'bg-yellow-500 text-white';
                else if (num >= 9) bgActive = 'bg-indigo-600 text-white ring-2 ring-indigo-400 shadow-md';

                return (
                  <button
                    type="button"
                    key={num}
                    onClick={() => setRating(num)}
                    className={`py-2 rounded-lg text-sm font-bold transition-all flex flex-col items-center justify-center ${
                      isSelected
                        ? `${bgActive} scale-105 shadow-xs`
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <span>{num}</span>
                    {num === 10 && <span className="text-[9px] -mt-1">만점</span>}
                  </button>
                );
              })}
            </div>

            {/* Slider bar for smooth adjustments */}
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />

            {/* Live Verbal Feedback Badge */}
            <div className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${currentFeedback.bg}`}>
              <span className={currentFeedback.color}>{currentFeedback.label}</span>
              {rating === 10 && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-200/80 px-2 py-0.5 rounded">
                  <Sparkles className="w-3 h-3 text-amber-600 animate-spin" />
                  명예의 전당 등극!
                </span>
              )}
            </div>
          </div>

          {/* 5. 가성비 평가 & 태그 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-800 mb-1 flex items-center gap-1">
                <Smile className="w-4 h-4 text-emerald-600" />
                가성비 체감
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['가성비 최고', '적당함', '비싼편'] as const).map((v) => (
                  <button
                    type="button"
                    key={v}
                    onClick={() => setValueScore(v)}
                    className={`py-2 px-1 rounded-lg text-xs font-semibold border transition-all text-center ${
                      valueScore === v
                        ? 'bg-slate-800 text-white border-slate-800'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                특징 태그 (쉼표로 구분)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="예: 밥리필, 바삭함, 양많음"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-xs"
              />
            </div>
          </div>

          {/* 6. 한줄평 / 후기 */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              한줄평 & 후기 (선택)
            </label>
            <textarea
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="고기 두께, 양, 국물 맛, 재방문 의사 등 자유롭게 남겨보세요!"
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-slate-900 text-xs sm:text-sm"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>{editingMeal ? '수정 완료' : '평점 저장 & 엑셀에 추가'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
