import React, { useState } from 'react';
import { X, Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import { parseExcelFile } from '../utils/excel';
import { MealReview } from '../types/meal';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (importedReviews: MealReview[]) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setErrorMsg(null);
    setSuccessCount(null);

    try {
      const items = await parseExcelFile(file);
      setSuccessCount(items.length);
      setTimeout(() => {
        onImportSuccess(items);
        onClose();
      }, 900);
    } catch (err: any) {
      setErrorMsg(err.message || '엑셀 파일을 처리하지 못했습니다. 형식을 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base">엑셀(.xlsx) 파일 불러오기</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            이 앱에서 내보낸 엑셀 파일이나, <strong>[학식당명], [음식명], [가격], [평점]</strong> 열이 포함된 엑셀(.xlsx, .csv) 파일을 업로드하면 데이터를 그대로 복원하거나 추가할 수 있습니다.
          </p>

          <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50 hover:bg-emerald-50/20 text-center">
            <Upload className="w-8 h-8 text-emerald-600 mb-2" />
            <span className="text-sm font-bold text-slate-800">
              클릭하여 엑셀 파일 선택
            </span>
            <span className="text-xs text-slate-600 mt-1">
              .xlsx, .xls, .csv 형식 지원
            </span>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              disabled={loading}
              className="hidden"
            />
          </label>

          {loading && (
            <div className="text-center py-2 text-xs font-semibold text-emerald-700 animate-pulse">
              엑셀 데이터를 분석하고 있습니다...
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successCount !== null && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>총 {successCount}개의 학식 평가 데이터를 성공적으로 불러왔습니다!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
