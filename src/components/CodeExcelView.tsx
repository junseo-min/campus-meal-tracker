import React, { useState } from 'react';
import { FileCode, Download, Copy, Check, Search, Terminal, Layers } from 'lucide-react';
import { APP_CODEBASE_SPECS, exportCodebaseToExcel, CodeFileSpec } from '../utils/codeExport';

export const CodeExcelView: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedFile, setSelectedFile] = useState<CodeFileSpec>(APP_CODEBASE_SPECS[0]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredSpecs = APP_CODEBASE_SPECS.filter((item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      item.fileName.toLowerCase().includes(q) ||
      item.role.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.filePath.toLowerCase().includes(q)
    );
  });

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const totalLines = APP_CODEBASE_SPECS.reduce((sum, item) => sum + item.lineCount, 0);

  return (
    <div className="space-y-5">
      {/* Header bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span>학식 평점 앱 전체 소스코드 엑셀 정리표</span>
          </div>
          <h3 className="text-lg font-black text-slate-900">
            앱 소스코드 구조 명세서 & 엑셀 내보내기
          </h3>
          <p className="text-xs text-slate-500">
            총 <strong>{APP_CODEBASE_SPECS.length}개</strong> 모듈 파일 ({totalLines} 라인)의 아키텍처와 핵심 로직이 엑셀 표로 정리되어 있습니다.
          </p>
        </div>

        <button
          onClick={exportCodebaseToExcel}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>코드 명세서 엑셀(.xlsx) 받기</span>
        </button>
      </div>

      {/* Excel Table representation */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Search */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="파일명, 역할, 함수명 검색..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>
          <span className="text-xs text-slate-400 shrink-0">
            {filteredSpecs.length}개 파일 매칭됨
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <th className="py-3 px-3 text-center w-12">No.</th>
                <th className="py-3 px-3 whitespace-nowrap">분류</th>
                <th className="py-3 px-4 whitespace-nowrap">파일명 (경로)</th>
                <th className="py-3 px-4 min-w-[220px]">주요 역할 및 기능</th>
                <th className="py-3 px-4 min-w-[180px]">주요 함수 / 인터페이스</th>
                <th className="py-3 px-3 text-center whitespace-nowrap">라인 수</th>
                <th className="py-3 px-3 text-center w-28 whitespace-nowrap">코드 보기</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSpecs.map((item, idx) => {
                const isSelected = selectedFile.filePath === item.filePath;
                return (
                  <tr
                    key={item.filePath}
                    className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                      isSelected ? 'bg-indigo-50/60 font-semibold' : ''
                    }`}
                    onClick={() => setSelectedFile(item)}
                  >
                    <td className="py-3 px-3 text-center font-mono text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-200/70 text-slate-700 font-medium text-[11px]">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <FileCode className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{item.fileName}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {item.filePath}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {item.role}
                    </td>
                    <td className="py-3 px-4 font-mono text-emerald-800 text-[11px]">
                      {item.keyFunctions}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-slate-600 font-bold">
                      {item.lineCount}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(item);
                        }}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 font-semibold transition-colors"
                      >
                        선택 보기
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-bold text-slate-800 border-t-2 border-slate-300">
                <td className="py-3 px-3 text-center">∑</td>
                <td colSpan={4} className="py-3 px-3">
                  합계: 총 {APP_CODEBASE_SPECS.length}개 파일 모듈 구성
                </td>
                <td className="py-3 px-3 text-center font-mono text-indigo-700">
                  {totalLines} lines
                </td>
                <td className="py-3 px-3 text-center">
                  <button
                    onClick={exportCodebaseToExcel}
                    className="text-emerald-700 hover:underline font-bold"
                  >
                    엑셀 다운로드
                  </button>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Code Snippet Detail Box */}
      {selectedFile && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 text-slate-100 overflow-hidden shadow-lg">
          <div className="px-5 py-3.5 bg-slate-800/80 border-b border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-sm text-white font-mono">
                {selectedFile.filePath}
              </span>
              <span className="text-xs text-slate-400">
                — {selectedFile.role}
              </span>
            </div>
            <button
              onClick={() => handleCopy(selectedFile.codeSnippet, selectedFile.filePath)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-slate-200 transition-colors"
            >
              {copiedId === selectedFile.filePath ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>복사됨!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>코드 복사</span>
                </>
              )}
            </button>
          </div>
          <div className="p-5 font-mono text-xs overflow-x-auto leading-relaxed text-emerald-300">
            <pre>{selectedFile.codeSnippet}</pre>
          </div>
        </div>
      )}
    </div>
  );
};
