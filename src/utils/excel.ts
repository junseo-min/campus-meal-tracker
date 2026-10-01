import * as XLSX from 'xlsx';
import { MealReview } from '../types/meal';

/**
 * 엑셀 (.xlsx) 파일로 내보내기
 */
export function exportReviewsToExcel(reviews: MealReview[]): void {
  const wb = XLSX.utils.book_new();

  // 1. 전체 학식 평가 목록 시트
  const reviewsData = reviews.map((item, index) => ({
    '번호': index + 1,
    '날짜': item.date,
    '식사구분': item.mealTime || '점심',
    '학식당명': item.cafeteria,
    '음식/메뉴명': item.menuName,
    '가격(원)': item.price,
    '평점(1~10점)': item.rating,
    '가성비평가': item.valueScore || '적당함',
    '한줄평 / 후기': item.comment || '',
    '태그': item.tags ? item.tags.join(', ') : '',
  }));

  const wsReviews = XLSX.utils.json_to_sheet(reviewsData);

  // 열 너비 지정
  wsReviews['!cols'] = [
    { wch: 6 },  // 번호
    { wch: 12 }, // 날짜
    { wch: 10 }, // 식사구분
    { wch: 18 }, // 학식당명
    { wch: 22 }, // 메뉴명
    { wch: 12 }, // 가격
    { wch: 14 }, // 평점
    { wch: 14 }, // 가성비
    { wch: 35 }, // 한줄평
    { wch: 20 }, // 태그
  ];

  XLSX.utils.book_append_sheet(wb, wsReviews, '학식평점기록');

  // 2. 학식당별 통계 요약 시트
  const cafeteriaMap: Record<string, {
    count: number;
    totalPrice: number;
    totalRating: number;
    highestRatedMenu: { name: string; rating: number };
    lowestRatedMenu: { name: string; rating: number };
  }> = {};

  reviews.forEach(r => {
    if (!cafeteriaMap[r.cafeteria]) {
      cafeteriaMap[r.cafeteria] = {
        count: 0,
        totalPrice: 0,
        totalRating: 0,
        highestRatedMenu: { name: r.menuName, rating: r.rating },
        lowestRatedMenu: { name: r.menuName, rating: r.rating },
      };
    }
    const stat = cafeteriaMap[r.cafeteria];
    stat.count += 1;
    stat.totalPrice += r.price;
    stat.totalRating += r.rating;

    if (r.rating > stat.highestRatedMenu.rating) {
      stat.highestRatedMenu = { name: r.menuName, rating: r.rating };
    }
    if (r.rating < stat.lowestRatedMenu.rating) {
      stat.lowestRatedMenu = { name: r.menuName, rating: r.rating };
    }
  });

  const cafeteriaSummaryData = Object.entries(cafeteriaMap)
    .sort((a, b) => (b[1].totalRating / b[1].count) - (a[1].totalRating / a[1].count))
    .map(([cafeteria, stat], idx) => ({
      '순위': `${idx + 1}위`,
      '학식당명': cafeteria,
      '방문 횟수': `${stat.count}회`,
      '평균 평점(10점만점)': +(stat.totalRating / stat.count).toFixed(1),
      '평균 식사비용(원)': Math.round(stat.totalPrice / stat.count),
      '총 지출액(원)': stat.totalPrice,
      '최고 평점 메뉴': `${stat.highestRatedMenu.name} (${stat.highestRatedMenu.rating}점)`,
      '최저 평점 메뉴': `${stat.lowestRatedMenu.name} (${stat.lowestRatedMenu.rating}점)`,
    }));

  const wsSummary = XLSX.utils.json_to_sheet(cafeteriaSummaryData);
  wsSummary['!cols'] = [
    { wch: 8 },
    { wch: 20 },
    { wch: 12 },
    { wch: 18 },
    { wch: 16 },
    { wch: 14 },
    { wch: 25 },
    { wch: 25 },
  ];
  XLSX.utils.book_append_sheet(wb, wsSummary, '식당별_통계분석');

  // 3. 종합 대시보드 시트
  const totalMeals = reviews.length;
  const totalSpent = reviews.reduce((sum, r) => sum + r.price, 0);
  const avgRating = totalMeals > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalMeals).toFixed(2) : '0';
  const avgPrice = totalMeals > 0 ? Math.round(totalSpent / totalMeals) : 0;

  const dashboardData = [
    { '항목': '총 평가한 식사 수', '값': `${totalMeals} 회` },
    { '항목': '총 지출 식비', '값': `${totalSpent.toLocaleString()} 원` },
    { '항목': '한 끼 평균 식비', '값': `${avgPrice.toLocaleString()} 원` },
    { '항목': '학식 전체 평균 평점', '값': `${avgRating} / 10.0 점` },
    { '항목': '최고 평점 기록 (10점 만점)', '값': reviews.filter(r => r.rating === 10).map(r => `${r.cafeteria} - ${r.menuName}`).join(', ') || '없음' },
    { '항목': '파일 생성 시각', '값': new Date().toLocaleString('ko-KR') },
  ];

  const wsDashboard = XLSX.utils.json_to_sheet(dashboardData);
  wsDashboard['!cols'] = [
    { wch: 25 },
    { wch: 50 },
  ];
  XLSX.utils.book_append_sheet(wb, wsDashboard, '학식_요약_브리핑');

  // 파일 다운로드 실행
  const todayStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `학식_평점_정리_${todayStr}.xlsx`);
}

/**
 * 엑셀 (.xlsx, .xls, .csv) 파일 업로드 및 파싱
 */
export async function parseExcelFile(file: File): Promise<MealReview[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rows: any[] = XLSX.utils.sheet_to_json(worksheet);

        if (!rows || rows.length === 0) {
          throw new Error('엑셀 파일에 유효한 데이터가 없습니다.');
        }

        const parsedReviews: MealReview[] = [];

        rows.forEach((row, i) => {
          // 컬럼 매핑 (다양한 한국어 헤더 지원)
          const cafeteria = row['학식당명'] || row['학식당'] || row['식당'] || row['식당명'] || row['cafeteria'] || '기타 식당';
          const menuName = row['음식/메뉴명'] || row['음식명'] || row['메뉴명'] || row['음식'] || row['menuName'] || row['메뉴'] || `메뉴 ${i + 1}`;
          
          let rawPrice = row['가격(원)'] ?? row['가격'] ?? row['얼마'] ?? row['price'] ?? 5000;
          if (typeof rawPrice === 'string') {
            rawPrice = parseInt(rawPrice.replace(/[^0-9]/g, ''), 10) || 5000;
          }
          const price = Number(rawPrice) || 5000;

          let rawRating = row['평점(1~10점)'] ?? row['평점'] ?? row['점수'] ?? row['rating'] ?? 7;
          if (typeof rawRating === 'string') {
            rawRating = parseFloat(rawRating.replace(/[^0-9.]/g, '')) || 7;
          }
          // 1 ~ 10 점 제한
          const rating = Math.max(1, Math.min(10, Math.round(Number(rawRating) || 7)));

          const date = row['날짜'] || row['일자'] || row['date'] || new Date().toISOString().slice(0, 10);
          const mealTime = row['식사구분'] || row['식사시간'] || '점심';
          const comment = row['한줄평 / 후기'] || row['한줄평'] || row['후기'] || row['메모'] || row['comment'] || '';
          const valueScore = row['가성비평가'] || row['가성비'] || (rating >= 8 && price <= 5500 ? '가성비 최고' : '적당함');

          parsedReviews.push({
            id: `imported-${Date.now()}-${i}`,
            cafeteria: String(cafeteria).trim(),
            menuName: String(menuName).trim(),
            price,
            rating,
            mealTime: ['아침', '점심', '저녁', '야식'].includes(mealTime) ? mealTime : '점심',
            date: String(date).slice(0, 10),
            comment: String(comment),
            valueScore: ['가성비 최고', '적당함', '비싼편'].includes(valueScore) ? valueScore : '적당함',
            tags: ['엑셀가져오기'],
            emoji: '🍽️',
            createdAt: Date.now() - (rows.length - i) * 60000,
          });
        });

        resolve(parsedReviews);
      } catch (err: any) {
        reject(err);
      }
    };

    reader.onerror = () => reject(new Error('파일을 읽는 중 오류가 발생했습니다.'));
    reader.readAsArrayBuffer(file);
  });
}
