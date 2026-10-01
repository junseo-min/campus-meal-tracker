import * as XLSX from 'xlsx';

export interface CodeFileSpec {
  category: string;
  filePath: string;
  fileName: string;
  role: string;
  keyFunctions: string;
  lineCount: number;
  codeSnippet: string;
}

export const APP_CODEBASE_SPECS: CodeFileSpec[] = [
  {
    category: '1. 타입 정의',
    filePath: 'src/types/meal.ts',
    fileName: 'meal.ts',
    role: '학식당, 메뉴명, 가격, 1~10점 평점 및 정렬 필터 인터페이스 정의',
    keyFunctions: 'MealReview 인터페이스, FilterState, SortField, SortOrder',
    lineCount: 26,
    codeSnippet: `export interface MealReview {
  id: string;
  cafeteria: string;       // 어느 학식당 (학생회관 식당 등)
  menuName: string;        // 어떤 음식 (돈까스, 제육볶음 등)
  price: number;           // 얼마에 먹었는지 (원)
  rating: number;          // 평점 (최소 1점 ~ 10점 만점)
  mealTime?: '아침' | '점심' | '저녁' | '야식';
  date: string;            // YYYY-MM-DD
  comment?: string;        // 한줄평 / 후기
  valueScore?: '가성비 최고' | '적당함' | '비싼편';
  tags?: string[];
  emoji?: string;
  createdAt: number;
}`,
  },
  {
    category: '2. 엑셀 연동 엔진',
    filePath: 'src/utils/excel.ts',
    fileName: 'excel.ts',
    role: 'SheetJS를 통한 학식 평가 목록, 통계 시트 다중 생성 및 엑셀 파싱/가져오기',
    keyFunctions: 'exportReviewsToExcel(), parseExcelFile()',
    lineCount: 154,
    codeSnippet: `export function exportReviewsToExcel(reviews: MealReview[]): void {
  const wb = XLSX.utils.book_new();
  // 1. 학식평점기록 시트 (번호, 날짜, 식사, 식당, 메뉴, 가격, 평점 등)
  const wsReviews = XLSX.utils.json_to_sheet(reviewsData);
  XLSX.utils.book_append_sheet(wb, wsReviews, '학식평점기록');
  // 2. 식당별 통계 시트 (방문수, 평균평점, 최고/최저메뉴)
  const wsSummary = XLSX.utils.json_to_sheet(cafeteriaSummaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, '식당별_통계분석');
  // 3. 파일 다운로드 실행
  XLSX.writeFile(wb, '학식_평점_정리.xlsx');
}`,
  },
  {
    category: '3. 로컬 스토리지 & 샘플',
    filePath: 'src/utils/storage.ts',
    fileName: 'storage.ts',
    role: '평가 데이터 브라우저 영구 보존 및 초기 대학가 현실 샘플 데이터셋 제공',
    keyFunctions: 'getStoredReviews(), saveStoredReviews(), DEFAULT_CAFETERIAS, SAMPLE_REVIEWS',
    lineCount: 110,
    codeSnippet: `export function getStoredReviews(): MealReview[] {
  const data = localStorage.getItem('campus_meal_reviews_v1');
  return data ? JSON.parse(data) : SAMPLE_REVIEWS;
}
export function saveStoredReviews(reviews: MealReview[]): void {
  localStorage.setItem('campus_meal_reviews_v1', JSON.stringify(reviews));
}`,
  },
  {
    category: '4. 평가 입력 모달',
    filePath: 'src/components/MealFormModal.tsx',
    fileName: 'MealFormModal.tsx',
    role: '어느 학식당, 음식명, 가격, 1~10점 평점 버튼 및 슬라이더 입력 폼',
    keyFunctions: 'handleSubmit(), 1~10 평점 실시간 피드백 뱃지, 빠른 메뉴/식당 칩',
    lineCount: 320,
    codeSnippet: `// 1점부터 10점 만점 선택 버튼
{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
  <button key={num} onClick={() => setRating(num)}>
    {num}
  </button>
))}
<input type="range" min="1" max="10" value={rating} onChange={...} />`,
  },
  {
    category: '5. 엑셀 스프레드시트 뷰',
    filePath: 'src/components/ExcelView.tsx',
    fileName: 'ExcelView.tsx',
    role: '엑셀과 동일한 데이터 그리드, 실시간 검색/정렬/필터 및 SUM/AVERAGE 요약 행',
    keyFunctions: 'Excel Table 렌더링, handleSort(), 엑셀 내보내기 연동, 합계/평균 계산',
    lineCount: 260,
    codeSnippet: `// 엑셀 수식 요약 행 (Excel SUM & AVERAGE)
<tr className="bg-emerald-50">
  <td>합계: {totalPriceSum.toLocaleString()}원</td>
  <td>평균: {avgPrice.toLocaleString()}원</td>
  <td>★ {avgRating}점 / 10점</td>
</tr>`,
  },
  {
    category: '6. 대시보드 & 통계 차트',
    filePath: 'src/components/StatsDashboard.tsx',
    fileName: 'StatsDashboard.tsx',
    role: '학식당별 랭킹 순위, 1~10점 분포 차트, 10점 만점 명예의 전당, 가성비 TOP 3',
    keyFunctions: 'cafeteriaStats, scoreDistribution (1~10점 빈도), topValueMeals',
    lineCount: 250,
    codeSnippet: `// 1점부터 10점까지의 평점 분포 계산
const scoreDistribution = useMemo(() => {
  const dist: Record<number, number> = {};
  for (let i = 1; i <= 10; i++) dist[i] = 0;
  reviews.forEach((r) => dist[r.rating] = (dist[r.rating] || 0) + 1);
  return dist;
}, [reviews]);`,
  },
  {
    category: '7. 피드 카드 리스트',
    filePath: 'src/components/MealCardList.tsx',
    fileName: 'MealCardList.tsx',
    role: '모바일 및 시각적 브라우징을 위한 이모지 카드 피드 뷰',
    keyFunctions: '식당별 필터 칩, 카드형 렌더링, 빠른 수정/삭제',
    lineCount: 160,
    codeSnippet: `// 카드형 학식 피드
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {filteredReviews.map(item => (
    <Card cafeteria={item.cafeteria} menu={item.menuName} price={item.price} rating={item.rating} />
  ))}
</div>`,
  },
  {
    category: '8. 엑셀/CSV 가져오기 모달',
    filePath: 'src/components/ImportModal.tsx',
    fileName: 'ImportModal.tsx',
    role: '사용자의 기존 엑셀(.xlsx) 또는 CSV 파일 업로드 및 자동 파싱/복원',
    keyFunctions: 'handleFileChange(), parseExcelFile() 연동 및 미리보기',
    lineCount: 95,
    codeSnippet: `const handleFileChange = async (e) => {
  const file = e.target.files?.[0];
  const items = await parseExcelFile(file);
  onImportSuccess(items);
};`,
  },
  {
    category: '9. 메인 네비게이션바',
    filePath: 'src/components/Navbar.tsx',
    fileName: 'Navbar.tsx',
    role: '헤더 로고, 뷰 전환 탭(엑셀표/피드/분석/코드엑셀), 엑셀 다운로드 CTA',
    keyFunctions: 'exportReviewsToExcel() 호출, 뷰 스위처, 폭죽 애니메이션',
    lineCount: 130,
    codeSnippet: `// 원클릭 엑셀 내보내기 버튼
<button onClick={() => exportReviewsToExcel(reviews)}>
  <Download /> 엑셀 다운로드 (.xlsx)
</button>`,
  },
  {
    category: '10. 메인 애플리케이션 루트',
    filePath: 'src/App.tsx',
    fileName: 'App.tsx',
    role: '상태 관리(reviews, activeView), CRUD 핸들러, 토스트 알림, 레이아웃',
    keyFunctions: 'handleSaveReview(), handleDeleteReview(), handleImportSuccess()',
    lineCount: 195,
    codeSnippet: `// 전체 앱 상태 총괄
const [reviews, setReviews] = useState<MealReview[]>(getStoredReviews());
const [activeView, setActiveView] = useState<'table' | 'cards' | 'stats' | 'code'>('table');`,
  },
];

/**
 * 소스코드 명세서를 엑셀(.xlsx) 파일로 내보내기
 */
export function exportCodebaseToExcel(): void {
  const wb = XLSX.utils.book_new();

  // Sheet 1: 소스코드 구조 명세서
  const codeSummaryData = APP_CODEBASE_SPECS.map((item, index) => ({
    'No.': index + 1,
    '구분 / 분류': item.category,
    '파일명': item.fileName,
    '파일 경로': item.filePath,
    '주요 역할 및 기능': item.role,
    '주요 함수 / 인터페이스': item.keyFunctions,
    '코드 라인수': `${item.lineCount} lines`,
  }));

  const wsSummary = XLSX.utils.json_to_sheet(codeSummaryData);
  wsSummary['!cols'] = [
    { wch: 6 },
    { wch: 18 },
    { wch: 20 },
    { wch: 28 },
    { wch: 45 },
    { wch: 35 },
    { wch: 14 },
  ];
  XLSX.utils.book_append_sheet(wb, wsSummary, '코드_구조_명세서');

  // Sheet 2: 파일별 핵심 소스코드
  const codeDetailsData = APP_CODEBASE_SPECS.map((item, index) => ({
    'No.': index + 1,
    '파일 경로': item.filePath,
    '역할': item.role,
    '핵심 구현 코드': item.codeSnippet,
  }));

  const wsDetails = XLSX.utils.json_to_sheet(codeDetailsData);
  wsDetails['!cols'] = [
    { wch: 6 },
    { wch: 28 },
    { wch: 40 },
    { wch: 70 },
  ];
  XLSX.utils.book_append_sheet(wb, wsDetails, '핵심_구현_코드');

  XLSX.writeFile(wb, '학식평점앱_소스코드_엑셀정리.xlsx');
}
