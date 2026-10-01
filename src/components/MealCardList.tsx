import React, { useState } from 'react';
import { Star, Clock, Calendar, Edit3, Trash2, Tag, DollarSign, MapPin } from 'lucide-react';
import { MealReview } from '../types/meal';

interface MealCardListProps {
  reviews: MealReview[];
  onEdit: (meal: MealReview) => void;
  onDelete: (id: string) => void;
}

export const MealCardList: React.FC<MealCardListProps> = ({
  reviews,
  onEdit,
  onDelete,
}) => {
  const [selectedCafeteria, setSelectedCafeteria] = useState('전체');

  const cafeterias = ['전체', ...Array.from(new Set(reviews.map((r) => r.cafeteria)))];

  const filteredReviews = reviews.filter(
    (r) => selectedCafeteria === '전체' || r.cafeteria === selectedCafeteria
  );

  const getScoreColor = (score: number) => {
    if (score >= 9) return 'from-indigo-500 to-purple-600 text-white';
    if (score >= 7) return 'from-emerald-500 to-teal-600 text-white';
    if (score >= 5) return 'from-amber-400 to-yellow-500 text-slate-900';
    return 'from-rose-500 to-red-600 text-white';
  };

  return (
    <div className="space-y-4">
      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {cafeterias.map((caf) => (
          <button
            key={caf}
            onClick={() => setSelectedCafeteria(caf)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCafeteria === caf
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {caf}
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReviews.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between"
          >
            <div>
              {/* Header with cafeteria and rating badge */}
              <div className="p-4 border-b border-slate-100 flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-2xl shrink-0">
                    {item.emoji || '🍱'}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-0.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{item.cafeteria}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-1">
                      {item.menuName}
                    </h3>
                  </div>
                </div>

                {/* Rating Badge */}
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getScoreColor(
                    item.rating
                  )} flex flex-col items-center justify-center shadow-xs shrink-0`}
                >
                  <span className="text-xs font-bold leading-none">★</span>
                  <span className="text-lg font-black leading-none">{item.rating}</span>
                </div>
              </div>

              {/* Price & Meta */}
              <div className="px-4 py-3 bg-slate-50/50 flex items-center justify-between text-xs border-b border-slate-100">
                <div className="flex items-center gap-1 font-mono font-bold text-emerald-700 text-sm">
                  <DollarSign className="w-3.5 h-3.5" />
                  {item.price.toLocaleString()}원
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-600" />
                    {item.mealTime || '점심'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-600" />
                    {item.date}
                  </span>
                </div>
              </div>

              {/* Comment & Review body */}
              <div className="p-4 space-y-2.5">
                {item.comment ? (
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic bg-emerald-50/40 p-2.5 rounded-lg border border-emerald-100/50">
                    "{item.comment}"
                  </p>
                ) : (
                  <p className="text-xs text-slate-600 italic">작성된 한줄평이 없습니다.</p>
                )}

                {/* Tags & Value */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${
                      item.valueScore === '가성비 최고'
                        ? 'bg-green-100 text-green-800'
                        : item.valueScore === '비싼편'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {item.valueScore || '적당함'}
                  </span>

                  {item.tags?.map((t, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 inline-flex items-center gap-0.5"
                    >
                      <Tag className="w-2.5 h-2.5 text-slate-600" />
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Card Footer Actions */}
            <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => onEdit(item)}
                className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-emerald-700 px-2 py-1 rounded hover:bg-slate-200/60 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                수정
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-rose-600 px-2 py-1 rounded hover:bg-rose-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
