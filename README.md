# 🎵 d6 - DAY6 음원 차트 트래킹 시스템

DAY6 팬덤을 위한 실시간 음원 차트 트래킹 및 스트리밍 지원 애플리케이션

## 📋 목차

- [개요](#개요)
- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [프로젝트 구조](#프로젝트-구조)
- [시작하기](#시작하기)
- [개발 가이드](#개발-가이드)
- [배포](#배포)
- [API 문서](#api-문서)
- [문제 해결](#문제-해결)
- [기여하기](#기여하기)

## 개요

d6는 한국 주요 음원 플랫폼의 차트 데이터를 자동으로 수집하고, DAY6 음원의 순위 변동을 실시간으로 추적하는 시스템입니다. GitHub Actions를 통해 매시간 자동으로 데이터를 수집하며, Next.js 기반의 모던한 UI로 차트 정보를 제공합니다.

### 지원 플랫폼
- 🍈 **멜론** (Melon) - TOP100, HOT100, 일간, 주간, 월간
- 🧞 **지니** (Genie) - TOP200, 실시간
- 🐛 **벅스** (Bugs) - TOP100, 실시간
- 💜 **바이브** (Vibe) - Today Top100, 실시간
- 🌊 **플로** (FLO) - TOP100
- 📺 **유튜브** (YouTube) - 조회수, 좋아요, 댓글 통계

## 주요 기능

### 🎯 차트 트래킹
- **실시간 순위 추적**: 매시간 자동 업데이트
- **순위 변동 감지**: 24시간 기준 순위 변화 표시
- **다중 차트 지원**: 각 플랫폼별 여러 차트 타입 동시 추적
- **타겟 아티스트 필터링**: DAY6 곡만 선별하여 표시

### 📊 데이터 시각화
- **차트 테이블**: 깔끔한 테이블 형태로 순위 표시
- **순위 변동**: 전시간 대비 순위 변화 표시
- **플랫폼별 비교**: 여러 플랫폼 순위 한눈에 비교
- **모바일 최적화**: 반응형 디자인

### 🎨 사용자 경험
- **모바일 우선 디자인**: 스마트폰 사용에 최적화
- **딜링크 지원**: 음원 앱 직접 연결 (Android/iOS/PC)
- **실시간 업데이트**: 자동 데이터 갱신
- **스트리밍 가이드**: 효율적인 스트리밍 방법 안내
- **투표 정보**: 음악방송 투표 일정 및 방법

## 기술 스택

### Backend (크롤러)
- **Python 3.8+**: 메인 프로그래밍 언어
- **BeautifulSoup4**: HTML 파싱
- **Requests**: HTTP 요청 처리

### Frontend
- **Next.js 15**: React 프레임워크 (App Router)
- **React 19**: UI 라이브러리
- **TypeScript**: 타입 안정성
- **Tailwind CSS v4**: 유틸리티 CSS 프레임워크
- **Radix UI**: 헤드리스 컴포넌트 (버튼, 탭 등)
- **TanStack Query v5**: 서버 상태 관리
- **Framer Motion**: 애니메이션
- **Swiper**: 캐로셀 컴포넌트
- **Lucide React**: 아이콘 라이브러리

### 인프라
- **GitHub Actions**: CI/CD 및 스케줄링
- **GitHub Pages**: 정적 데이터 호스팅
- **Vercel**: Frontend 배포

## 시작하기

### 사전 요구사항
- Python 3.8 이상
- Node.js 18 이상
- Git

### 설치

#### 1. 저장소 클론
```bash
git clone https://github.com/yourusername/d6.git
cd d6
```

#### 2. 크롤러 설정
```bash
cd crawlers
pip install -r requirements.txt
```

#### 3. 프론트엔드 설정
```bash
cd frontend
yarn install
```

### 개발 실행

#### 크롤러 실행
```bash
cd crawlers
python main.py  # 모든 크롤러 실행
python test_melon.py  # 특정 크롤러 테스트
```

#### 프론트엔드 실행
```bash
cd frontend
yarn dev  # http://localhost:3000
```

## 프로젝트 구조

```
d6/
├── crawlers/                 # Python 크롤러
│   ├── base_crawler.py      # 크롤러 추상 클래스
│   ├── melon_crawler.py     # 멜론 크롤러
│   ├── genie_crawler.py     # 지니 크롤러
│   ├── bugs_crawler.py      # 벅스 크롤러
│   ├── vibe_crawler.py      # 바이브 크롤러
│   ├── flo_crawler.py       # 플로 크롤러
│   ├── youtube_crawler.py   # 유튜브 크롤러
│   ├── main.py              # 크롤러 오케스트레이터
│   ├── target_songs.py      # 타겟 설정
│   ├── rank_tracker.py      # 순위 변동 추적
│   ├── utils.py             # 유틸리티 함수
│   ├── config.py            # 설정 파일
│   └── requirements.txt     # Python 의존성
│
├── frontend/                 # Next.js 애플리케이션
│   ├── app/                 # App Router 페이지
│   │   ├── page.tsx         # 홈페이지
│   │   ├── charts/          # 차트 페이지
│   │   ├── streaming/       # 스트리밍 가이드
│   │   ├── votes/           # 투표 정보
│   │   ├── guide/           # 사용 가이드
│   │   └── layout.tsx       # 루트 레이아웃
│   ├── components/          # React 컴포넌트
│   │   ├── ui/             # 기본 UI 컴포넌트
│   │   ├── charts/         # 차트 컴포넌트
│   │   ├── home/           # 홈 페이지 컴포넌트
│   │   ├── layout/         # 레이아웃 컴포넌트
│   │   └── streaming/      # 스트리밍 컴포넌트
│   ├── lib/                 # 유틸리티 함수
│   │   ├── api.ts           # API 호출 함수
│   │   └── types.ts         # TypeScript 타입
│   └── package.json        # Node.js 의존성
│
├── .github/
│   └── workflows/          # GitHub Actions 워크플로우
│       └── crawl-music-charts.yml
│
├── docs/                    # 정적 데이터 호스팅
│   └── public-data/        # JSON 데이터 파일
│
└── CLAUDE.md               # AI 코딩 어시스턴트 가이드
```

## 개발 가이드

### 크롤러 개발

#### 새 크롤러 추가하기
1. `base_crawler.py`를 상속받는 새 크롤러 클래스 생성
2. 필수 메서드 구현:
   ```python
   def get_chart_url(self, chart_type)
   def get_song_elements(self, soup, chart_type)
   def parse_song_data(self, element, chart_type)
   ```
3. `main.py`에 크롤러 등록

#### 타겟 아티스트 변경
`crawlers/target_songs.py` 파일 수정:
```python
TARGET_ARTIST = "원하는 아티스트명"
SEARCH_MODE = "artists"  # 또는 "songs", "artist_songs", "all"
```

### 프론트엔드 개발

#### 컴포넌트 추가
shadcn/ui 컴포넌트 사용:
```bash
npx shadcn@latest add [component-name]
```

#### 새 페이지 추가
`frontend/app/` 디렉토리에 새 폴더 생성:
```
app/
└── your-page/
    └── page.tsx
```

**현재 구현된 페이지:**
- `/` - 홈페이지
- `/charts` - 차트 페이지
- `/streaming` - 스트리밍 가이드
- `/votes` - 투표 정보
- `/guide` - 사용 가이드

### 데이터 구조

#### 차트 데이터 형식 (latest.json)
```json
{
  "collectedAtKST": "2025-10-10T15:00:00+09:00",
  "artist": "DAY6",
  "tracks": [],
  "melon_top100": [...],
  "melon_hot100": [...],
  "genie": [...],
  "bugs": [...],
  "vibe": [...],
  "flo": [...],
  "last_updated": "2025-10-10T15:00:00+09:00"
}
```

#### 특정 곡 데이터 형식 (happy.json)
```json
{
  "title": "HAPPY",
  "album": "Fourever", 
  "lastUpdated": "2025-10-10 19:00",
  "platforms": {
    "melon_top100": { "rank": 25, "change": -2, "status": "in_chart" },
    "melon_hot100": { "rank": null, "change": 0, "status": "chart_out" },
    "genie": { "rank": 14, "change": 0, "status": "in_chart" },
    "bugs": { "rank": 20, "change": 0, "status": "in_chart" },
    "vibe": { "rank": 28, "change": 0, "status": "in_chart" },
    "flo": { "rank": 35, "change": 0, "status": "in_chart" }
  }
}
```

## 배포

### GitHub Actions 설정

1. 저장소 Settings → Secrets and variables → Actions
2. 필요한 시크릿 추가:
   - `YOUTUBE_API_KEY` (YouTube 통계 수집용)

### 자동 배포 흐름

1. **데이터 수집** (매시간)
   - GitHub Actions가 크롤러 실행
   - JSON 파일 생성 및 커밋
   - main 브랜치에 자동 푸시

2. **프론트엔드 배포**
   - Vercel과 GitHub 연동
   - main 브랜치 푸시 시 자동 배포

### 수동 실행
GitHub Actions 워크플로우 수동 트리거:
1. Actions 탭 → "Crawl Music Charts"
2. "Run workflow" 버튼 클릭

## API 문서

### 데이터 엔드포인트
모든 데이터는 정적 JSON 파일로 제공:

- **최신 데이터**: `/docs/public-data/latest.json`
- **요약 통계**: `/docs/public-data/summary.json`
- **특정 곡 데이터**: `/docs/public-data/happy.json`
- **차트 페이지**: `/docs/public-data/day6_chart.json`
- **YouTube 통계**: `/docs/public-data/youtube_stats.json`

### 데이터 업데이트 주기
- **차트 데이터**: 매시간 정각 (KST 기준)
- **YouTube 통계**: 일 1회

## 문제 해결

### 크롤러 관련

#### 크롤링 실패
- 네트워크 연결 확인
- 타겟 사이트 구조 변경 확인
- User-Agent 헤더 업데이트

#### 데이터 누락
- `target_songs.py` 설정 확인
- 차트 타입별 선택자 확인

### 프론트엔드 관련

#### 빌드 에러
```bash
yarn clean
yarn install
yarn build
```

#### 데이터 로딩 실패
- CORS 설정 확인
- 데이터 엔드포인트 URL 확인
- 네트워크 탭에서 요청 상태 확인

## 기여하기

### 기여 방법
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### 코드 스타일
- Python: PEP 8
- TypeScript: ESLint + Prettier
- 커밋 메시지: Conventional Commits

## 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 감사의 말

- DAY6와 모든 My Day들에게
- 오픈소스 커뮤니티
- 음원 플랫폼 API 제공자

---

Made with ❤️ for My Days