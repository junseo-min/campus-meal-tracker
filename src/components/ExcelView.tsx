import React, { useState, useMemo } from 'react';
import { 
  Download, Search, ArrowUpDown, ArrowUp, ArrowDown, Edit3, Trash2, 
  Filter, FileSpreadsheet, Plus, CheckCircle, Tag
} from 'lucide-react';
import { MealReview, SortField, SortOrder } from '../types/meal';
import { exportReviewsToExcel } from '../utils/excel';

interface ExcelViewProps {
  reviews: MealReview[];
  onEdit: (meal: MealReview) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
}

export const ExcelView: React.FC<ExcelViewProps> = ({
  reviews,
  onEdit,
  onDelete,
  onAddNew,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCafeteria, setSelectedCafeteria] = useState('전체');
  const [ratingFilter, setRatingFilter] = useState<'all' | '9plus' | '7plus' | '5minus'>('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Distinct cafeterias list
  const cafeterias = useMemo(() => {
    const set = new Set<string>();
    reviews.forEach(r => set.add(r.cafeteria));
    return ['전체', ...Array.from(set)];
  }, [reviews]);

  // Handle Sort Toggle
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Filtered & Sorted Reviews
  const processedReviews = useMemo(() => {
    return reviews
      .filter(item => {
        // Cafeteria filter
        if (selectedCafeteria !== '전체' && item.cafeteria !== selectedCafeteria) {
          return false;
        }
        // Rating filter
        if (ratingFilter === '9plus' && item.rating < 9) return false;
        if (ratingFilter === '7plus' && item.rating < 7) return false;
        if (ratingFilter === '5minus' && item.rating > 5) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchCafeteria = item.cafeteria.toLowerCase().includes(q);
          const matchMenu = item.menuName.toLowerCase().includes(q);
          const matchComment = (item.comment || '').toLowerCase().includes(q);
          const matchTags = item.tags?.some(t => t.toLowerCase().includes(q));
          if (!matchCafeteria && !matchMenu && !matchComment && !matchTags) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        let valA: any = a[sortField];
        let valB: any = b[sortField];

        if (sortField === 'date') {
          valA = new Date(a.date).getTime();
          valB = new Date(b.date).getTime();
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [reviews, selectedCafeteria, ratingFilter, searchQuery, sortField, sortOrder]);

  // Aggregate Calculations for Excel Footer
  const totalCount = processedReviews.length;
  const totalPriceSum = processedReviews.reduce((sum, r) => sum + r.price, 0);
  const avgPrice = totalCount > 0 ? Math.round(totalPriceSum / totalCount) : 0;
  const avgRating = totalCount > 0 ? (processedReviews.reduce((sum, r) => sum + r.rating, 0) / totalCount).toFixed(1) : '0';

  // Badge for rating
  const renderRatingBadge = (rating: number) => {
    let colorClass = 'bg-slate-100 text-slate-700';
    if (rating >= 9) colorClass = 'bg-indigo-100 text-indigo-800 font-extrabold ring-1 ring-indigo-300';
    else if (rating >= 7) colorClass = 'bg-emerald-100 text-emerald-800 font-bold';
    else if (rating >= 5) colorClass = 'bg-yellow-100 text-yellow-800 font-medium';
    else colorClass = 'bg-red-100 text-red-700 font-semibold';

    return (
      <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-md text-xs sm:text-sm ${colorClass}`}>
        ★ {rating}점
        <span className="text-[10px] text-slate-500 ml-0.5">/10</span>
      </span>
    );
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-3.5 h-3.5 text-slate-600 inline ml-1" />;
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-emerald-600 inline ml-1 font-bold" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-emerald-600 inline ml-1 font-bold" />
    );
  };

  return (
    <div className="space-y-4">
      {/* Excel Toolbar / Controls Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-600 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="메뉴명, 학식당, 후기 내용, 태그 검색..."
              className="w-full pl-9 pr-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-600"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-slate-600 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Filter pills */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center text-xs font-semibold text-slate-600 mr-1">
              <Filter className="w-3.5 h-3.5 mr-1" />
              식당 필터:
            </div>
            <select
              value={selectedCafeteria}
              onChange={(e) => setSelectedCafeteria(e.target.value)}
              className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none text-slate-700"
            >
              {cafeterias.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value as any)}
              className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none text-slate-700"
            >
              <option value="all">모든 평점 (1~10점)</option>
              <option value="9plus">🏆 9~10점 (최고/인생학식)</option>
              <option value="7plus">😋 7점 이상 (만족/추천)</option>
              <option value="5minus">😫 5점 이하 (아쉬움/비추)</option>
            </select>

            <button
              onClick={() => exportReviewsToExcel(reviews)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition-colors cursor-pointer ml-auto sm:ml-0"
              title="현재 표를 엑셀 시트(.xlsx) 파일로 내보냅니다"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              엑셀로 내보내기 (.xlsx)
            </button>
          </div>
        </div>

        {/* Status line */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <div>
            총 <strong className="text-slate-800">{totalCount}개</strong>의 식사 기록이 정리되어 있습니다.
            {selectedCafeteria !== '전체' && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                [{selectedCafeteria}] 필터링됨
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span>컬럼명을 클릭하면 정렬됩니다</span>
          </div>
        </div>
      </div>

      {/* Spreadsheet / Data Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            {/* Excel Column Headers */}
            <thead>
              <tr className="bg-slate-50/90 text-slate-600 font-semibold text-xs border-b border-slate-200 select-none">
                <th className="py-3 px-3 w-12 text-center text-slate-600">No.</th>
                
                <th 
                  onClick={() => handleSort('date')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
                >
                  방문 일자 {getSortIcon('date')}
                </th>

                <th className="py-3 px-3 whitespace-nowrap">식사구분</th>

                <th 
                  onClick={() => handleSort('cafeteria' as any)}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap min-w-[130px]"
                >
                  어느 학식당 {getSortIcon('cafeteria' as any)}
                </th>

                <th 
                  onClick={() => handleSort('menuName')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap min-w-[160px]"
                >
                  어떤 음식 (메뉴명) {getSortIcon('menuName')}
                </th>

                <th 
                  onClick={() => handleSort('price')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap text-right"
                >
                  얼마 (가격) {getSortIcon('price')}
                </th>

                <th 
                  onClick={() => handleSort('rating')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap text-center"
                >
                  평점 (1~10) {getSortIcon('rating')}
                </th>

                <th className="py-3 px-3 whitespace-nowrap text-center">가성비</th>

                <th className="py-3 px-4 min-w-[200px]">한줄평 및 태그</th>

                <th className="py-3 px-3 text-center w-20 whitespace-nowrap">관리</th>
              </tr>
            </thead>

            {/* Table Rows */}
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {processedReviews.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-600">
                    <p className="text-base font-semibold text-slate-600 mb-1">
                      검색 조건에 맞는 학식 평가가 없습니다.
                    </p>
                    <p className="text-xs text-slate-600 mb-4">
                      검색어를 바꾸거나 새로운 학식 평점을 추가해보세요!
                    </p>
                    <button
                      onClick={onAddNew}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      새 평점 남기기
                    </button>
                  </td>
                </tr>
              ) : (
                processedReviews.map((item, index) => (
                  <tr
                    key={item.id}
                    className="hover:bg-emerald-50/40 transition-colors group"
                  >
                    {/* Index */}
                    <td className="py-3 px-3 text-center text-xs font-mono text-slate-600">
                      {index + 1}
                    </td>

                    {/* Date */}
                    <td className="py-3 px-3 whitespace-nowrap text-xs text-slate-600 font-medium">
                      {item.date}
                    </td>

                    {/* Meal Time */}
                    <td className="py-3 px-3 whitespace-nowrap text-xs">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px] font-medium">
                        {item.mealTime || '점심'}
                      </span>
                    </td>

                    {/* Cafeteria */}
                    <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        {item.cafeteria}
                      </span>
                    </td>

                    {/* Menu Name */}
                    <td className="py-3 px-4 font-medium text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">{item.emoji || '🍽️'}</span>
                        <span className="font-bold text-slate-800">{item.menuName}</span>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-3 px-3 whitespace-nowrap text-right font-semibold text-slate-900 font-mono">
                      {item.price.toLocaleString()}원
                    </td>

                    {/* Rating (1~10) */}
                    <td className="py-3 px-3 whitespace-nowrap text-center">
                      {renderRatingBadge(item.rating)}
                    </td>

                    {/* Value Score */}
                    <td className="py-3 px-3 whitespace-nowrap text-center">
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                          item.valueScore === '가성비 최고'
                            ? 'bg-green-100 text-green-800'
                            : item.valueScore === '비싼편'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {item.valueScore || '적당함'}
                      </span>
                    </td>

                    {/* Comment & Tags */}
                    <td className="py-3 px-4">
                      {item.comment && (
                        <p className="text-xs text-slate-700 line-clamp-2 mb-1">
                          "{item.comment}"
                        </p>
                      )}
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.tags.map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 inline-flex items-center gap-0.5"
                            >
                              <Tag className="w-2.5 h-2.5 text-slate-600" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* Action buttons */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEdit(item)}
                          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-emerald-700 transition-colors"
                          title="수정하기"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete(item.id)}
                          className="p-1.5 rounded-md hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-colors"
                          title="삭제하기"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>

            {/* Excel Formula Summary Footer */}
            {processedReviews.length > 0 && (
              <tfoot>
                <tr className="bg-emerald-50/80 border-t-2 border-emerald-300 font-bold text-slate-900 text-xs">
                  <td className="py-3 px-3 text-center text-emerald-800 font-mono">
                    ∑
                  </td>
                  <td colSpan={4} className="py-3 px-3 text-emerald-900">
                    <span className="font-extrabold text-emerald-950">엑셀 합계 & 평균 요약</span>
                    <span className="text-emerald-700 font-normal ml-2">
                      (총 {totalCount}끼니 기록)
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-emerald-900 font-bold whitespace-nowrap">
                    <div>합계: {totalPriceSum.toLocaleString()}원</div>
                    <div className="text-[10px] text-emerald-700 font-normal">
                      평균: {avgPrice.toLocaleString()}원
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-emerald-900 whitespace-nowrap">
                    <div className="text-sm font-extrabold text-emerald-700">★ {avgRating}점</div>
                    <div className="text-[10px] text-emerald-700 font-normal">평균 평점</div>
                  </td>
                  <td colSpan={3} className="py-3 px-3 text-slate-600 font-normal text-[11px]">
                    ※ 위 표의 모든 수치는 엑셀(.xlsx) 파일 생성 시 동일하게 다중 시트로 분리 계산되어 저장됩니다.
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};
