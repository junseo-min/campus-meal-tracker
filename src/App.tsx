import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';

// ==========================================
// [1. 학식 메뉴 목록 데이터 정의]
// ==========================================
interface MealMenu {
  id: string;
  name: string;
  category: string;
  price: number;
  emoji: string;
}

const MEAL_LIST: MealMenu[] = [
  { id: 'kimchi-stew', name: '돼지고기 듬뿍 김치찌개', category: '찌개/탕', price: 5000, emoji: '🍲' },
  { id: 'bibimbap', name: '전주식 오색 산채비빔밥', category: '비빔밥', price: 5000, emoji: '🥗' },
  { id: 'donkatsu', name: '수제 바삭 등심돈까스', category: '양식/일품', price: 6000, emoji: '🍱' },
  { id: 'jeyuk', name: '직화 불맛 매콤제육볶음', category: '덮밥/정식', price: 5500, emoji: '🥩' },
  { id: 'sundubu', name: '해물 얼큰 순두부찌개', category: '찌개/탕', price: 4800, emoji: '🥘' },
  { id: 'bulgogi', name: '뚝배기 소불고기 정식', category: '특식/정식', price: 6500, emoji: '🍲' },
  { id: 'ramen-set', name: '치즈라면 & 공깃밥 세트', category: '분식/스낵', price: 4000, emoji: '🍜' },
];

// ==========================================
// [2. 식사량 / 옵션 데이터 정의 (기존 사이즈 대응)]
// ==========================================
interface PortionOption {
  id: string;
  label: string;
  name: string;
  price: number;
}

const PORTION_LIST: PortionOption[] = [
  { id: 'portion-regular', label: '보통', name: '보통(기본)', price: 0 },
  { id: 'portion-large', label: '곱빼기 (밥 많이)', name: '곱빼기(밥 많이)', price: 500 }, // 기본 선택 (+500원)
  { id: 'portion-extra', label: '고기/토핑 듬뿍', name: '고기/토핑 듬뿍', price: 1500 },
];

// ==========================================
// [3. 추가 옵션 데이터 정의]
// ==========================================
interface ExtraOption {
  id: string;
  name: string;
  price: number;
}

const EXTRA_LIST: ExtraOption[] = [
  { id: 'opt-egg', name: '계란후라이 추가', price: 500 },
  { id: 'opt-rice', name: '공깃밥 추가', price: 1000 },
  { id: 'opt-cheese', name: '치즈사리 추가', price: 500 },
  { id: 'opt-drink', name: '캔음료(콜라/사이다)', price: 1000 },
  { id: 'opt-side', name: '김치/단무지 많이', price: 0 },
];

// ==========================================
// [4. 학식당 위치 구분]
// ==========================================
const CAFETERIA_LOCATIONS = [
  '학생회관 3층',
  '도담식당',
  '기숙사 식당',
  '교직원 식당',
];

// ==========================================
// [5. 주문 레코드 인터페이스 (게시판 및 엑셀용)]
// ==========================================
interface MealOrderRecord {
  id: string;
  ticketNumber: number;      // 식권 번호 (예: #101)
  customerName: string;      // 주문자 이름
  studentOrPhone: string;    // 학번 또는 연락처
  cafeteria: string;         // 수령 학식당
  diningOption: string;      // 매장 식사 / 포장
  mealName: string;          // 학식 메뉴명
  portionName: string;       // 식사량 구분
  selectedOptions: string[]; // 추가 옵션 목록
  quantity: number;          // 수량 (인분)
  totalPrice: number;        // 결제 총 금액
  requests: string;          // 요청사항
  orderDate: string;         // 접수 일자
  orderTime: string;         // 접수 시각
}

// 초기 샘플 학식 주문 데이터
const INITIAL_MEAL_ORDERS: MealOrderRecord[] = [
  {
    id: 'meal-order-1',
    ticketNumber: 101,
    customerName: '김민수',
    studentOrPhone: '20231234',
    cafeteria: '학생회관 3층',
    diningOption: '매장 식사',
    mealName: '돼지고기 듬뿍 김치찌개',
    portionName: '보통(기본)',
    selectedOptions: ['계란후라이 추가'],
    quantity: 1,
    totalPrice: 5500,
    requests: '국물 넉넉하게 부탁드립니다!',
    orderDate: '2026-09-30',
    orderTime: '12:15:30',
  },
  {
    id: 'meal-order-2',
    ticketNumber: 102,
    customerName: '이수진',
    studentOrPhone: '010-5678-1234',
    cafeteria: '도담식당',
    diningOption: '포장(도시락)',
    mealName: '전주식 오색 산채비빔밥',
    portionName: '곱빼기(밥 많이)',
    selectedOptions: ['계란후라이 추가', '캔음료(콜라/사이다)'],
    quantity: 1,
    totalPrice: 7000,
    requests: '고추장 따로 담아주세요.',
    orderDate: '2026-09-30',
    orderTime: '12:22:15',
  },
  {
    id: 'meal-order-3',
    ticketNumber: 103,
    customerName: '박준혁',
    studentOrPhone: '20245678',
    cafeteria: '교직원 식당',
    diningOption: '매장 식사',
    mealName: '직화 불맛 매콤제육볶음',
    portionName: '곱빼기(밥 많이)',
    selectedOptions: ['치즈사리 추가'],
    quantity: 2,
    totalPrice: 13000,
    requests: '불맛 많이 내주세요~',
    orderDate: '2026-09-30',
    orderTime: '12:35:40',
  },
];

export default function App() {
  // ------------------------------------------
  // 1. 주문서 입력 상태값(State) 관리
  // ------------------------------------------
  const [customerName, setCustomerName] = useState<string>(''); // 이름 (필수)
  const [studentOrPhone, setStudentOrPhone] = useState<string>(''); // 학번 또는 연락처
  const [cafeteria, setCafeteria] = useState<string>('학생회관 3층'); // 학식당 위치
  const [diningOption, setDiningOption] = useState<'매장 식사' | '포장(도시락)'>('매장 식사'); // 식사 방식
  const [selectedMealId, setSelectedMealId] = useState<string>(''); // 선택된 학식 메뉴 ID
  const [selectedPortionId, setSelectedPortionId] = useState<string>('portion-regular'); // 식사량 (보통 기본)
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]); // 선택된 추가 옵션 ID 목록
  const [quantity, setQuantity] = useState<number>(1); // 수량 (기본 1인분)
  const [requests, setRequests] = useState<string>(''); // 요청사항

  // ------------------------------------------
  // 2. 알림 및 주문 확인 상태
  // ------------------------------------------
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [orderConfirmation, setOrderConfirmation] = useState<string | null>(null);
  const [orderBoardList, setOrderBoardList] = useState<MealOrderRecord[]>(INITIAL_MEAL_ORDERS);
  const [latestOrder, setLatestOrder] = useState<MealOrderRecord | null>(null);

  // ------------------------------------------
  // 3. 실시간 "예상 금액" 계산 로직
  // ------------------------------------------
  const estimatedPrice = useMemo(() => {
    // 1) 기본 학식 가격 조회
    const currentMeal = MEAL_LIST.find((m) => m.id === selectedMealId);
    const mealBasePrice = currentMeal ? currentMeal.price : 0;

    // 학식을 선택하지 않은 경우 0원
    if (!currentMeal) return 0;

    // 2) 식사량 / 곱빼기 추가금
    const currentPortion = PORTION_LIST.find((p) => p.id === selectedPortionId);
    const portionExtraPrice = currentPortion ? currentPortion.price : 0;

    // 3) 추가 옵션 합계
    const optionsExtraPrice = selectedOptionIds.reduce((sum, optId) => {
      const optItem = EXTRA_LIST.find((item) => item.id === optId);
      return sum + (optItem ? optItem.price : 0);
    }, 0);

    // 4) 1인분 단가 = 기본학식 + 곱빼기/양 + 추가옵션
    const unitPrice = mealBasePrice + portionExtraPrice + optionsExtraPrice;

    // 5) 총 금액 = 단가 * 수량
    const validQty = Math.max(1, Math.min(10, quantity || 1));
    return unitPrice * validQty;
  }, [selectedMealId, selectedPortionId, selectedOptionIds, quantity]);

  // ------------------------------------------
  // 4. 추가 옵션 체크박스 핸들러
  // ------------------------------------------
  const handleOptionToggle = (optionId: string) => {
    setSelectedOptionIds((prev) =>
      prev.includes(optionId)
        ? prev.filter((id) => id !== optionId)
        : [...prev, optionId]
    );
  };

  // ------------------------------------------
  // 5. 다시 작성 (초기화) 버튼 핸들러
  // ------------------------------------------
  const handleReset = () => {
    setCustomerName('');
    setStudentOrPhone('');
    setCafeteria('학생회관 3층');
    setDiningOption('매장 식사');
    setSelectedMealId('');
    setSelectedPortionId('portion-regular');
    setSelectedOptionIds([]);
    setQuantity(1);
    setRequests('');
    setErrorMessage(null);
    setOrderConfirmation(null);
    setLatestOrder(null);
  };

  // ------------------------------------------
  // 6. 학식 주문하기 버튼 클릭 핸들러
  // ------------------------------------------
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1) 이름 유효성 검사
    if (!customerName.trim()) {
      alert('이름을 입력해주세요');
      setErrorMessage('이름을 입력해주세요');
      document.getElementById('customerName')?.focus();
      return;
    }

    // 2) 학식 메뉴 선택 유효성 검사
    if (!selectedMealId) {
      alert('학식 메뉴를 선택해주세요');
      setErrorMessage('학식 메뉴를 선택해주세요');
      document.getElementById('mealSelect')?.focus();
      return;
    }

    setErrorMessage(null);

    const mealObj = MEAL_LIST.find((m) => m.id === selectedMealId)!;
    const portionObj = PORTION_LIST.find((p) => p.id === selectedPortionId)!;
    const optionNames = selectedOptionIds
      .map((id) => EXTRA_LIST.find((item) => item.id === id)?.name)
      .filter(Boolean) as string[];

    const optionText = optionNames.length > 0 ? ` (${optionNames.join(', ')})` : '';
    const formattedPrice = estimatedPrice.toLocaleString();
    const nextTicketNumber = 100 + orderBoardList.length + 1;

    // 주문 확인 메시지 텍스트
    const confirmationText = `${customerName.trim()}님, ${mealObj.name} ${portionObj.name}${optionText} ${quantity}인분, 총 ${formattedPrice}원 주문이 접수되었습니다! [식권번호: #${nextTicketNumber}]`;
    setOrderConfirmation(confirmationText);

    // 새 주문 기록 생성
    const now = new Date();
    const newRecord: MealOrderRecord = {
      id: `meal-${Date.now()}`,
      ticketNumber: nextTicketNumber,
      customerName: customerName.trim(),
      studentOrPhone: studentOrPhone.trim() || '미기재',
      cafeteria,
      diningOption,
      mealName: mealObj.name,
      portionName: portionObj.name,
      selectedOptions: optionNames,
      quantity,
      totalPrice: estimatedPrice,
      requests: requests.trim(),
      orderDate: now.toISOString().slice(0, 10),
      orderTime: now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    setLatestOrder(newRecord);
    setOrderBoardList((prev) => [newRecord, ...prev]);

    setTimeout(() => {
      document.getElementById('order-confirmation-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // ------------------------------------------
  // 7. 학식 주문 내역 엑셀(.xlsx) 저장 기능 (SheetJS)
  // ------------------------------------------
  const handleExportToExcel = (targetOrders: MealOrderRecord[] = orderBoardList) => {
    if (targetOrders.length === 0) {
      alert('엑셀로 저장할 학식 주문 내역이 없습니다.');
      return;
    }

    const wb = XLSX.utils.book_new();

    // [시트 1] 학식 주문 접수 내역
    const ordersData = targetOrders.map((order) => ({
      '식권번호': `#${order.ticketNumber}`,
      '접수일자': order.orderDate,
      '접수시각': order.orderTime,
      '주문학생/고객명': order.customerName,
      '학번/연락처': order.studentOrPhone,
      '수령식당': order.cafeteria,
      '식사구분': order.diningOption,
      '학식메뉴명': order.mealName,
      '식사량구분': order.portionName,
      '추가옵션': order.selectedOptions.length > 0 ? order.selectedOptions.join(', ') : '없음',
      '수량(인분)': order.quantity,
      '결제금액(원)': order.totalPrice,
      '요청사항': order.requests || '없음',
    }));

    const wsOrders = XLSX.utils.json_to_sheet(ordersData);
    wsOrders['!cols'] = [
      { wch: 10 }, // 식권번호
      { wch: 12 }, // 일자
      { wch: 12 }, // 시각
      { wch: 14 }, // 이름
      { wch: 16 }, // 학번/연락처
      { wch: 20 }, // 식당
      { wch: 12 }, // 매장/포장
      { wch: 24 }, // 메뉴명
      { wch: 14 }, // 식사량
      { wch: 24 }, // 옵션
      { wch: 10 }, // 수량
      { wch: 14 }, // 금액
      { wch: 30 }, // 요청
    ];
    XLSX.utils.book_append_sheet(wb, wsOrders, '학식_주문접수내역');

    // [시트 2] 학식 메뉴별 판매 통계 요약
    const mealSalesStats: Record<string, { count: number; totalPortions: number; totalRevenue: number }> = {};
    targetOrders.forEach((o) => {
      if (!mealSalesStats[o.mealName]) {
        mealSalesStats[o.mealName] = { count: 0, totalPortions: 0, totalRevenue: 0 };
      }
      mealSalesStats[o.mealName].count += 1;
      mealSalesStats[o.mealName].totalPortions += o.quantity;
      mealSalesStats[o.mealName].totalRevenue += o.totalPrice;
    });

    const summaryData = Object.entries(mealSalesStats).map(([name, stat]) => ({
      '학식 메뉴명': name,
      '주문 횟수': `${stat.count}회`,
      '총 판매량': `${stat.totalPortions}인분`,
      '총 매출액(원)': stat.totalRevenue,
    }));

    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    wsSummary['!cols'] = [
      { wch: 24 },
      { wch: 12 },
      { wch: 14 },
      { wch: 16 },
    ];
    XLSX.utils.book_append_sheet(wb, wsSummary, '메뉴별_매출통계');

    // [시트 3] 캠퍼스 학식 메뉴판
    const menuData = MEAL_LIST.map((m) => ({
      '구분': m.category,
      '메뉴명': m.name,
      '기본가격(원)': m.price,
      '곱빼기 추가': '+500원',
      '고기/토핑 추가': '+1,500원',
    }));
    const wsMenu = XLSX.utils.json_to_sheet(menuData);
    XLSX.utils.book_append_sheet(wb, wsMenu, '학식_공식메뉴판');

    // 엑셀 파일 저장 실행
    const today = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `학식_주문내역_${today}.xlsx`);
  };

  return (
    <div className="min-h-screen py-10 px-4 flex flex-col items-center justify-start" style={{ backgroundColor: '#faf6f0' }}>
      {/* 
        [전체 디자인 규격]
        - 최대 너비: 520px
        - 가운데 정렬
        - 둥근 모서리, 부드러운 그림자
      */}
      <div className="w-full max-w-[520px] bg-white rounded-2xl shadow-md border border-[#ede5db] p-6 sm:p-8 space-y-6">

        {/* ------------------------------------------
            [페이지 상단: 학식 로고, 제목 "학식 주문", 부제]
        ------------------------------------------ */}
        <header className="text-center pb-5 border-b border-[#ede5db]">
          <div className="text-5xl mb-2 select-none" role="img" aria-label="학식 로고">
            🍱
          </div>
          {/* 제목: 학식 주문 */}
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#6b4226' }}>
            학식 주문
          </h1>
          {/* 부제 */}
          <p className="text-sm mt-1 text-[#8d6e63]">
            오늘의 든든하고 따뜻한 한 끼를 간편하게 주문하세요
          </p>

          {/* 상단 엑셀 저장 퀵 버튼 */}
          <div className="mt-3 flex justify-center">
            <button
              type="button"
              onClick={() => handleExportToExcel(orderBoardList)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-white shadow-xs transition-transform active:scale-95 cursor-pointer"
              style={{ backgroundColor: '#2e7d32' }}
              title="지금까지의 모든 학식 주문 내역을 엑셀(.xlsx) 파일로 저장합니다"
            >
              <span>📊 학식 주문 목록 엑셀로 저장</span>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded">.XLSX</span>
            </button>
          </div>
        </header>

        {/* ------------------------------------------
            [학식 주문서 입력 양식 폼]
        ------------------------------------------ */}
        <form onSubmit={handleSubmit} className="space-y-5 text-sm text-[#3e2723]">

          {/* 1. 이름 (필수, text) */}
          <div className="space-y-1.5">
            <label htmlFor="customerName" className="block font-semibold text-[#4e342e]">
              주문자 이름 <span className="text-red-500 font-bold">*</span>
            </label>
            <input
              type="text"
              id="customerName"
              className="cafe-input"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="주문하시는 분의 성함을 입력하세요 (예: 홍길동)"
            />
          </div>

          {/* 2. 학번 또는 연락처 (tel/text) */}
          <div className="space-y-1.5">
            <label htmlFor="studentOrPhone" className="block font-semibold text-[#4e342e]">
              학번 또는 전화번호
            </label>
            <input
              type="text"
              id="studentOrPhone"
              className="cafe-input"
              value={studentOrPhone}
              onChange={(e) => setStudentOrPhone(e.target.value)}
              placeholder="예: 20241234 또는 010-1234-5678"
            />
          </div>

          {/* 3. 학식당 선택 & 식사 구분 (매장 식사 / 포장) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="cafeteriaSelect" className="block font-semibold text-[#4e342e]">
                수령 학식당
              </label>
              <select
                id="cafeteriaSelect"
                className="cafe-input cursor-pointer"
                value={cafeteria}
                onChange={(e) => setCafeteria(e.target.value)}
              >
                {CAFETERIA_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <span className="block font-semibold text-[#4e342e]">
                식사 장소
              </span>
              <div className="flex items-center gap-3 pt-2">
                {(['매장 식사', '포장(도시락)'] as const).map((opt) => (
                  <div key={opt} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      id={`dining-${opt}`}
                      name="diningOption"
                      value={opt}
                      checked={diningOption === opt}
                      onChange={() => setDiningOption(opt)}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <label htmlFor={`dining-${opt}`} className="cursor-pointer text-xs font-medium text-[#4e342e]">
                      {opt}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 4. 학식 선택 (드롭다운) - 김치찌개, 비빔밥 등 */}
          <div className="space-y-1.5">
            <label htmlFor="mealSelect" className="block font-semibold text-[#4e342e]">
              학식 선택 <span className="text-red-500 font-bold">*</span>
            </label>
            <select
              id="mealSelect"
              className="cafe-input cursor-pointer font-medium"
              value={selectedMealId}
              onChange={(e) => setSelectedMealId(e.target.value)}
            >
              <option value="">-- 오늘 드실 학식 메뉴를 선택해주세요 --</option>
              {MEAL_LIST.map((meal) => (
                <option key={meal.id} value={meal.id}>
                  {meal.emoji} [{meal.category}] {meal.name} - {meal.price.toLocaleString()}원
                </option>
              ))}
            </select>
          </div>

          {/* 5. 식사량 / 밥 양 (라디오 버튼, 가로 배치) */}
          <div className="space-y-2">
            <span className="block font-semibold text-[#4e342e]">
              식사량 선택
            </span>
            <div className="flex flex-row flex-wrap items-center gap-3 pt-1">
              {PORTION_LIST.map((portion) => (
                <div key={portion.id} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    id={portion.id}
                    name="meal-portion"
                    value={portion.id}
                    checked={selectedPortionId === portion.id}
                    onChange={() => setSelectedPortionId(portion.id)}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor={portion.id} className="cursor-pointer text-sm font-medium text-[#4e342e]">
                    {portion.label} {portion.price === 0 ? '+0원' : `+${portion.price.toLocaleString()}원`}
                    {portion.id === 'portion-regular' && (
                      <span className="text-xs text-[#8d6e63] ml-1">(기본)</span>
                    )}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* 6. 추가 옵션 (체크박스, 가로 배치) */}
          <div className="space-y-2">
            <span className="block font-semibold text-[#4e342e]">
              추가 옵션 & 토핑
            </span>
            <div className="flex flex-row flex-wrap items-center gap-3 pt-1">
              {EXTRA_LIST.map((opt) => (
                <div key={opt.id} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    id={opt.id}
                    checked={selectedOptionIds.includes(opt.id)}
                    onChange={() => handleOptionToggle(opt.id)}
                    className="w-4 h-4 rounded cursor-pointer"
                  />
                  <label htmlFor={opt.id} className="cursor-pointer text-xs font-medium text-[#4e342e]">
                    {opt.name} {opt.price === 0 ? '+0원' : `+${opt.price.toLocaleString()}원`}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* 7. 수량 (number 타입, 최소 1, 최대 10, 기본값 1) */}
          <div className="space-y-1.5">
            <label htmlFor="quantity" className="block font-semibold text-[#4e342e]">
              수량 (최소 1인분 ~ 최대 10인분)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                id="quantity"
                className="cafe-input max-w-[140px]"
                min={1}
                max={10}
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (isNaN(val)) setQuantity(1);
                  else setQuantity(Math.max(1, Math.min(10, val)));
                }}
              />
              <span className="text-sm font-medium text-[#6d4c41]">인분(그릇)</span>
            </div>
          </div>

          {/* 8. 요청사항 (textarea) */}
          <div className="space-y-1.5">
            <label htmlFor="requests" className="block font-semibold text-[#4e342e]">
              조리 및 배식 요청사항
            </label>
            <textarea
              id="requests"
              rows={3}
              className="cafe-input resize-none"
              value={requests}
              onChange={(e) => setRequests(e.target.value)}
              placeholder="예: 국물 넉넉하게 주세요, 파 빼주세요, 덜 맵게 해주세요"
            />
          </div>

          {/* 인라인 에러 메시지 알림 영역 */}
          {errorMessage && (
            <div className="p-2.5 rounded-lg bg-red-50 text-red-700 text-xs font-semibold border border-red-200">
              ⚠️ {errorMessage}
            </div>
          )}

          {/* ------------------------------------------
              [예상 금액 표시 영역: 큰 글씨(24px), 갈색, 굵게, 가운데 정렬]
              주문하기 버튼 바로 위에 배치
          ------------------------------------------ */}
          <div className="pt-3 pb-1 border-t border-[#ede5db] text-center">
            <div
              className="text-[24px] font-bold tracking-tight select-none"
              style={{ color: '#6b4226' }}
            >
              예상 금액: {estimatedPrice.toLocaleString()}원
            </div>
            {selectedMealId === '' && (
              <p className="text-xs text-[#a1887f] mt-1">
                * 학식 메뉴를 선택하시면 실시간 예상 금액이 자동 계산됩니다.
              </p>
            )}
          </div>

          {/* ------------------------------------------
              [버튼 영역: 학식 주문하기 버튼 / 다시 작성 버튼]
          ------------------------------------------ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* 주문하기 버튼: 갈색 배경(#6b4226), 흰색 글씨, hover시 약간 밝게 */}
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-lg font-bold text-white text-base shadow-sm transition-all duration-200 cursor-pointer text-center"
              style={{ backgroundColor: '#6b4226' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#7d4e2d')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#6b4226')}
            >
              학식 주문하기
            </button>

            {/* 다시 작성 버튼: 모든 입력과 금액 초기화 */}
            <button
              type="button"
              onClick={handleReset}
              className="w-full py-3 px-4 rounded-lg font-semibold text-[#5d4037] bg-[#f5ede4] hover:bg-[#ebdcd0] border border-[#d7ccc8] text-base transition-colors duration-200 cursor-pointer text-center"
            >
              다시 작성
            </button>
          </div>
        </form>

        {/* ------------------------------------------
            [주문 확인 메시지 영역]
            - 연두색 배경, 초록 글씨, 둥근 모서리
        ------------------------------------------ */}
        {orderConfirmation && (
          <section
            id="order-confirmation-section"
            className="p-4 rounded-xl border border-[#a5d6a7] transition-all animate-in fade-in duration-300 space-y-3"
            style={{ backgroundColor: '#e8f5e9' }}
          >
            <div className="flex items-start gap-2.5">
              <span className="text-xl" role="img" aria-label="체크">
                ✅
              </span>
              <div>
                <h4 className="font-bold text-sm mb-1" style={{ color: '#1b5e20' }}>
                  학식 주문이 성공적으로 접수되었습니다!
                </h4>
                <p
                  className="text-sm font-medium leading-relaxed"
                  style={{ color: '#2e7d32' }}
                >
                  {orderConfirmation}
                </p>
                <div className="mt-1 text-xs text-[#2e7d32]">
                  식당 퇴식구/배식대에서 식권 번호를 불러드립니다.
                </div>
              </div>
            </div>

            {/* 주문 영수증 즉시 엑셀 저장 버튼 */}
            {latestOrder && (
              <div className="pt-2 border-t border-[#c8e6c9] flex justify-end">
                <button
                  type="button"
                  onClick={() => handleExportToExcel([latestOrder])}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
                  style={{ backgroundColor: '#2e7d32' }}
                >
                  <span>📥 이 주문 엑셀로 저장하기</span>
                </button>
              </div>
            )}
          </section>
        )}

        {/* ------------------------------------------
            ['학식 주문' 실시간 접수 게시판 / 식권 목록]
        ------------------------------------------ */}
        <section className="pt-4 border-t border-[#ede5db] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#5d4037] flex items-center gap-1.5">
              <span>📋</span>
              <span>실시간 학식 주문 접수 현황</span>
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#8d6e63]">
                총 {orderBoardList.length}건 접수됨
              </span>
              <button
                type="button"
                onClick={() => handleExportToExcel(orderBoardList)}
                className="text-[11px] font-bold text-[#2e7d32] hover:underline"
              >
                [전체 엑셀 다운로드]
              </button>
            </div>
          </div>

          {orderBoardList.length === 0 ? (
            <div className="py-6 text-center text-xs text-[#a1887f] bg-[#faf6f0] rounded-xl border border-dashed border-[#d7ccc8]">
              아직 접수된 학식 주문이 없습니다. 첫 주문을 남겨보세요!
            </div>
          ) : (
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {orderBoardList.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-[#faf6f0] rounded-xl border border-[#ebdcd0] text-xs space-y-1 shadow-xs"
                >
                  <div className="flex items-center justify-between font-bold text-[#4e342e]">
                    <span className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-[#6b4226] text-white text-[10px]">
                        식권 #{item.ticketNumber}
                      </span>
                      <span>{item.customerName}님</span>
                      <span className="text-[10px] text-[#8d6e63] font-normal">({item.studentOrPhone})</span>
                    </span>
                    <span className="font-mono text-[#6b4226] text-sm">
                      {item.totalPrice.toLocaleString()}원
                    </span>
                  </div>

                  <div className="text-[#6d4c41] font-medium">
                    {item.mealName} • {item.portionName}
                    {item.selectedOptions.length > 0 && ` (${item.selectedOptions.join(', ')})`}
                    {' '}• {item.quantity}인분
                  </div>

                  <div className="text-[11px] text-[#8d6e63] flex items-center justify-between">
                    <span>수령처: {item.cafeteria} [{item.diningOption}]</span>
                  </div>

                  {item.requests && (
                    <div className="text-[#8d6e63] italic bg-white/60 px-2 py-0.5 rounded text-[11px]">
                      요청: "{item.requests}"
                    </div>
                  )}

                  <div className="text-[10px] text-[#a1887f] flex items-center justify-between pt-1">
                    <span>접수시각: {item.orderDate} {item.orderTime}</span>
                    <button
                      type="button"
                      onClick={() => handleExportToExcel([item])}
                      className="text-[#2e7d32] hover:underline font-semibold"
                    >
                      엑셀저장
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 하단 푸터 */}
        <footer className="text-center pt-2 text-[11px] text-[#a1887f] flex flex-col items-center gap-1">
          <span>© 캠퍼스 학식 주문 시스템 • 매일 따뜻하고 든든한 식사를 제공합니다</span>
          <button
            type="button"
            onClick={() => handleExportToExcel(orderBoardList)}
            className="text-xs text-[#2e7d32] font-bold hover:underline"
          >
            📊 전체 학식 주문 내역 엑셀(.xlsx) 파일 받기
          </button>
        </footer>
      </div>
    </div>
  );
}
