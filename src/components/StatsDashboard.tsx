import React from 'react';
import { Trophy, DollarSign, Utensils, Star, Award, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { MealReview } from '../types/meal';

interface StatsDashboardProps {
  reviews: MealReview[];
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ reviews }) => {
  const totalMeals = reviews.length;
  const totalPrice = reviews.reduce((sum, r) => sum + r.price, 0);
  const avgPrice = totalMeals > 0 ? Math.round(totalPrice / totalMeals) : 0;
  const avgRating = totalMeals > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalMeals).toFixed(1) : '0';

  // Cafeteria Breakdown
  const cafeteriaStats = React.useMemo(() => {
    const map: Record<string, { count: number; totalPrice: number; totalRating: number; highest: { name: string; rating: number } }> = {};

    reviews.forEach((r) => {
      if (!map[r.cafeteria]) {
        map[r.cafeteria] = {
          count: 0,
          totalPrice: 0,
          totalRating: 0,
          highest: { name: r.menuName, rating: r.rating },
        };
      }
      const s = map[r.cafeteria];
      s.count += 1;
      s.totalPrice += r.price;
      s.totalRating += r.rating;
      if (r.rating > s.highest.rating) {
        s.highest = { name: r.menuName, rating: r.rating };
      }
    });

    return Object.entries(map)
      .map(([name, stat]) => ({
        name,
        count: stat.count,
        avgPrice: Math.round(stat.totalPrice / stat.count),
        avgRating: +(stat.totalRating / stat.count).toFixed(1),
        highest: stat.highest,
      }))
      .sort((a, b) => b.avgRating - a.avgRating);
  }, [reviews]);

  // Score distribution 1 to 10
  const scoreDistribution = React.useMemo(() => {
    const dist: Record<number, number> = {};
    for (let i = 1; i <= 10; i++) dist[i] = 0;
    reviews.forEach((r) => {
      dist[r.rating] = (dist[r.rating] || 0) + 1;
    });
    return dist;
  }, [reviews]);

  const maxFreq = Math.max(...Object.values(scoreDistribution), 1);

  // Top Value Meals (High rating, low/reasonable price)
  const topValueMeals = React.useMemo(() => {
    return [...reviews]
      .filter((r) => r.rating >= 8)
      .sort((a, b) => {
        // Value ratio: rating / (price / 1000)
        const ratioA = a.rating / (a.price / 1000);
        const ratioB = b.rating / (b.price / 1000);
        return ratioB - ratioA;
      })
      .slice(0, 3);
  }, [reviews]);

  // Perfect 10 Meals
  const perfectTenMeals = reviews.filter((r) => r.rating === 10);

  return (
    <div className="space-y-6">
      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Meals */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Utensils className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-600">총 평가한 끼니</div>
            <div className="text-2xl font-black text-slate-900">{totalMeals}회</div>
            <div className="text-[11px] text-emerald-600 font-medium">기록 누적 중</div>
          </div>
        </div>

        {/* Total Spent */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-600">총 지출 학식비</div>
            <div className="text-2xl font-black text-slate-900">{totalPrice.toLocaleString()}원</div>
            <div className="text-[11px] text-slate-600">평균 {avgPrice.toLocaleString()}원 / 끼</div>
          </div>
        </div>

        {/* Avg Rating */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
            <Star className="w-6 h-6 fill-amber-400" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-600">전체 평균 평점</div>
            <div className="text-2xl font-black text-slate-900 flex items-baseline gap-1">
              <span>{avgRating}</span>
              <span className="text-xs text-slate-600 font-normal">/ 10점</span>
            </div>
            <div className="text-[11px] text-amber-600 font-medium">10점 만점 기준</div>
          </div>
        </div>

        {/* Top Cafeteria */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div className="truncate">
            <div className="text-xs font-semibold text-slate-600">1위 학식당</div>
            <div className="text-lg font-bold text-slate-900 truncate">
              {cafeteriaStats[0]?.name || '기록 없음'}
            </div>
            <div className="text-[11px] text-purple-600 font-medium">
              ★ {cafeteriaStats[0]?.avgRating || 0}점 / 10점
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cafeteria Ranking Leaderboard (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                학식당별 만족도 랭킹
              </h3>
              <p className="text-xs text-slate-600">
                방문한 학식당들의 10점 만점 평균 평점 순위입니다.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {cafeteriaStats.map((caf, idx) => (
              <div
                key={caf.name}
                className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold ${
                      idx === 0
                        ? 'bg-amber-400 text-amber-950 shadow-xs'
                        : idx === 1
                        ? 'bg-slate-300 text-slate-800'
                        : idx === 2
                        ? 'bg-amber-700 text-amber-100'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{caf.name}</h4>
                    <div className="text-[11px] text-slate-600 flex items-center gap-2">
                      <span>방문 {caf.count}회</span>
                      <span>•</span>
                      <span>평균 {caf.avgPrice.toLocaleString()}원</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-medium">
                        최고메뉴: {caf.highest.name} ({caf.highest.rating}점)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <div className="w-24 bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-2.5 rounded-full"
                      style={{ width: `${(caf.avgRating / 10) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-black text-slate-900 w-12 text-right">
                    ★ {caf.avgRating}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rating Distribution (1~10) Chart (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              1점 ~ 10점 평점 분포
            </h3>
            <p className="text-xs text-slate-600">
              남긴 평가 점수의 분포 빈도입니다.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((score) => {
              const count = scoreDistribution[score] || 0;
              const percent = maxFreq > 0 ? (count / maxFreq) * 100 : 0;

              let barColor = 'bg-emerald-500';
              if (score >= 9) barColor = 'bg-indigo-600';
              else if (score >= 7) barColor = 'bg-emerald-500';
              else if (score >= 5) barColor = 'bg-yellow-500';
              else barColor = 'bg-red-500';

              return (
                <div key={score} className="flex items-center gap-2 text-xs">
                  <span className="w-10 font-bold text-slate-700 text-right">
                    {score}점
                  </span>
                  <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className={`${barColor} h-3 rounded-full transition-all duration-500`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="w-7 text-right font-semibold text-slate-600">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hall of Fame & Top Value Picks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 10 Point Hall of Fame */}
        <div className="bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-white p-5 rounded-2xl border border-amber-200 shadow-xs">
          <h3 className="font-bold text-amber-900 text-base flex items-center gap-2 mb-1">
            <Award className="w-5 h-5 text-amber-600" />
            10점 만점 명예의 전당 (인생 학식)
          </h3>
          <p className="text-xs text-amber-700/80 mb-4">
            단 1점의 흠도 없이 만점을 기록한 최고의 메뉴들입니다.
          </p>

          {perfectTenMeals.length === 0 ? (
            <div className="text-center py-6 text-slate-600 text-xs">
              아직 10점 만점을 기록한 학식 메뉴가 없습니다.
            </div>
          ) : (
            <div className="space-y-2.5">
              {perfectTenMeals.map((meal) => (
                <div
                  key={meal.id}
                  className="bg-white p-3.5 rounded-xl border border-amber-200/80 shadow-xs flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{meal.emoji || '🍱'}</span>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">
                        {meal.menuName}
                      </div>
                      <div className="text-xs text-slate-600">
                        {meal.cafeteria} • {meal.price.toLocaleString()}원
                      </div>
                    </div>
                  </div>
                  <div className="px-2.5 py-1 rounded-lg bg-amber-500 text-white font-black text-xs shadow-xs">
                    10.0 만점
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Value Picks */}
        <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-white p-5 rounded-2xl border border-emerald-200 shadow-xs">
          <h3 className="font-bold text-emerald-900 text-base flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            가성비 최우수 메뉴 TOP 3
          </h3>
          <p className="text-xs text-emerald-700/80 mb-4">
            높은 평점(8점 이상) 대비 가격이 가장 합리적인 메뉴입니다.
          </p>

          <div className="space-y-2.5">
            {topValueMeals.map((meal, index) => (
              <div
                key={meal.id}
                className="bg-white p-3.5 rounded-xl border border-emerald-200/80 shadow-xs flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">
                      {meal.menuName}
                    </div>
                    <div className="text-xs text-slate-600">
                      {meal.cafeteria} • {meal.price.toLocaleString()}원
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-emerald-600">
                    ★ {meal.rating}점
                  </span>
                  <div className="text-[10px] text-emerald-700 font-semibold">
                    {meal.valueScore || '가성비 최고'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
