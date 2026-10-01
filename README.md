# 🍱 학식 노트 & 엑셀 평가기 (Campus Meal Tracker)

대학 캠퍼스 라이프를 위한 스마트 학식 기록, 별점 평가 및 엑셀(Excel) 연동 분석 웹 애플리케이션입니다.

---

## ✨ 주요 기능

- 📝 **학식 기록 및 관리**: 식당 위치, 메뉴명, 가격, 사이즈/옵션, 별점, 상세 리뷰, 음식 사진 기록
- 📊 **통계 대시보드**: 누적 지출 금액, 방문 식당별 분석, 평점 분포 및 주간/월간 통계
- 📁 **엑셀(XLSX) 완전 호환**:
  - 원클릭 엑셀 내보내기 (서식 및 함수 포함)
  - 기존 엑셀 파일 불러오기 및 데이터 병합
- 💻 **인터랙티브 뷰어**:
  - 카드 뷰 / 표(스프레드시트) 뷰 전환
  - 수식 및 코드 변환 뷰
- 📱 **반응형 웹 디자인**: 모바일, 태블릿, 데스크톱 모두에 최적화된 모던 UI

---

## 🛠️ 기술 스택

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS v4, Lucide React (아이콘)
- **Data & Excel**: SheetJS (`xlsx`)
- **Build Tool**: Vite
- **Deployment**: Vercel

---

## 🚀 로컬 실행 방법

### 1. 패키지 설치
```bash
npm install
```

### 2. 개발 서버 실행
```bash
npm run dev
```
기본적으로 `http://localhost:3000`에서 실행됩니다.

### 3. 프로덕션 빌드
```bash
npm run build
```

---

## 🌐 Vercel 배포 가이드

1. GitHub 저장소를 Vercel에 연결합니다.
2. 프레임워크 프리셋으로 **Vite**를 선택합니다.
3. 빌드 명령어: `npm run build` (또는 `vite build`)
4. 출력 디렉터리: `dist`
5. **Deploy** 버튼을 누르면 즉시 배포가 완료됩니다!
