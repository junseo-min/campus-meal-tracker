import React from 'react';
import { Download, Upload, PlusCircle, RotateCcw, Utensils } from 'lucide-react';
import confetti from 'canvas-confetti';
import { exportReviewsToExcel } from '../utils/excel';
import { MealReview } from '../types/meal';

interface NavbarProps {
  reviews: MealReview[];
  onOpenNewModal: () => void;
  onOpenImportModal: () => void;
  onResetSample: () => void;
  activeView: 'table' | 'cards' | 'stats' | 'code';
  setActiveView: (view: 'table' | 'cards' | 'stats' | 'code') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  reviews,
  onOpenNewModal,
  onOpenImportModal,
  onResetSample,
  activeView,
  setActiveView,
}) => {
  const handleExport = () => {
    if (reviews.length === 0) {
      alert('내보낼 학식 평가 데이터가 없습니다. 먼저 평가를 기록해 보세요!');
      return;
    }
    exportReviewsToExcel(reviews);
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.2 },
      });
    } catch {
      // Ignore if not supported
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Logo & Title */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-green-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
              <Utensils className="w-5 h-5" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight truncate">
                  학식 평점 노트
                </h1>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
                  1~10점 만점 엑셀 정리
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block truncate">
                어느 식당, 무슨 음식, 얼마에 먹었는지 평점 남기고 엑셀로 자동 정리!
              </p>
            </div>
          </div>

          {/* Navigation View Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveView('table')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeView === 'table'
                  ? 'bg-white text-emerald-700 font-semibold shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              📊 엑셀 표
            </button>
            <button
              onClick={() => setActiveView('cards')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeView === 'cards'
                  ? 'bg-white text-emerald-700 font-semibold shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              🍱 피드형
            </button>
            <button
              onClick={() => setActiveView('stats')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeView === 'stats'
                  ? 'bg-white text-emerald-700 font-semibold shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              📈 분석 차트
            </button>
            <button
              onClick={() => setActiveView('code')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeView === 'code'
                  ? 'bg-white text-indigo-700 font-semibold shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              💻 코드 엑셀
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExport}
              title="현재 데이터를 엑셀(.xlsx) 파일로 다운로드합니다"
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">엑셀 다운로드</span>
              <span className="sm:hidden">.XLSX</span>
            </button>

            <button
              onClick={onOpenNewModal}
              title="새로운 학식 평점을 작성합니다"
              className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-bold rounded-lg bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>평점 남기기</span>
            </button>

            <div className="relative group">
              <button
                className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                title="데이터 관리 및 초기화"
              >
                ⋯
              </button>
              <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 hidden group-hover:block group-focus-within:block z-50">
                <button
                  onClick={onOpenImportModal}
                  className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  엑셀/CSV 불러오기
                </button>
                <button
                  onClick={onResetSample}
                  className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  샘플 데이터 복원
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
