# 사주 & 타로 & 관상 AI 운세 서비스

사주, 타로, 관상을 접목시킨 AI 기반 운세 서비스입니다. 사용자의 생년월일시(사주) 정보를 입력받아 운세를 제공하고, 타로 카드를 선택하거나 얼굴 사진을 분석하여 더 깊은 운세 분석을 제공합니다.

## 서비스 플랜

- **무료 서비스**: 사주 정보(생년월일시)에 기반한 기본 운세 제공
- **프리미엄 서비스**: 사주 기반 운세, 타로 카드 분석, 얼굴 사진 분석(관상)을 모두 제공

## 주요 기능

- 사주 정보(생년월일시) 입력으로 기본 운세 생성
- 직관에 따른 타로 카드 선택으로 심층 운세 분석
- 얼굴 사진 업로드 또는 카메라로 촬영 후 AI 관상 분석
- 전체, 사랑, 직업, 건강 영역별 운세 제공
- 반응형 UI 지원
- 관리자 페이지를 통한 AI 프롬프트 관리
- 무료/프리미엄 서비스 플랜 선택 기능

## 기술 스택

- React.js 18
- TypeScript
- React Router
- Emotion (styled-components)
- React Webcam
- OpenAI API (GPT-3.5-Turbo/GPT-4o 지원)
- 반응형 웹 디자인

## 실행 방법

### 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음과 같이 설정합니다:

```
REACT_APP_OPENAI_API_KEY=여기에_당신의_OpenAI_API_키를_입력하세요
```

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (자동으로 브라우저가 열립니다)
npm run dev
또는
npm start

# 배포용 빌드
npm run build
```

## 프로젝트 구조

```
src/
├── assets/         # 이미지 및 데이터 파일
│   ├── BirthForm.tsx              # 생년월일 입력 폼
│   ├── FaceCapture.tsx            # 얼굴 촬영 컴포넌트
│   ├── FaceReadingResult.tsx      # 관상 분석 결과 컴포넌트
│   ├── FortuneResult.tsx          # 운세 결과 컴포넌트
│   ├── PlanSelector.tsx           # 서비스 플랜 선택 컴포넌트
│   ├── TarotCardSelector.tsx      # 타로 카드 선택 컴포넌트
│   └── TarotSelection.tsx         # 타로 선택 컴포넌트
├── pages/          # 페이지 컴포넌트
│   ├── AdminPage.tsx              # 관리자 페이지
│   ├── FaceReadingPage.tsx        # 관상 분석 페이지
│   ├── FortunePage.tsx            # 운세 페이지
│   └── HomePage.tsx               # 홈페이지
├── services/       # API 서비스
│   └── api.ts                     # OpenAI API 연동 서비스
├── types/          # TypeScript 타입 정의
│   └── index.ts                   # 공통 타입 정의
└── App.tsx                        # 앱 메인 컴포넌트
```

## 사용 방법

1. 홈페이지에서 서비스 플랜(무료/프리미엄)을 선택합니다.
2. 무료 서비스: 생년월일과 시간을 입력하여 기본적인 운세를 확인합니다.
3. 프리미엄 서비스:
   - 생년월일 기반 운세 확인
   - 타로 카드 중 하나를 직관에 따라 선택하여 심층 분석
   - 얼굴 사진을 업로드하거나 카메라로 촬영하여 관상 분석
4. AI가 생성한 당신만의 개인화된 운세와 분석 결과를 확인합니다.

## 관리자 기능

- 홈페이지 하단의 'Admin' 링크를 통해 관리자 페이지에 접근
- 운세 생성 및 관상 분석에 사용되는 AI 프롬프트 수정
- 무료/프리미엄 서비스에 사용할 OpenAI 모델 설정 (GPT-3.5-Turbo/GPT-4o)

## 주의사항

- 이 서비스는 오락 목적으로 제공되며, 실제 운세 결과와 다를 수 있습니다.
- 관상 분석에 사용된 사진은 서버에 저장되지 않고 분석 후 즉시 폐기됩니다.
- OpenAI API 키는 실제 배포 환경에서는 백엔드를 통해 안전하게 관리해야 합니다.
- 현재 버전은 프론트엔드만 구현된 POC(Proof of Concept) 버전으로, 실제 결제 처리는 구현되어 있지 않습니다.

## 개발 참고사항 및 트러블슈팅

### 1. React 버전 호환성 이슈

- **문제**: 초기에 React 19.1.0을 사용했으나 빌드 환경에서 호환성 문제 발생
- **해결**: React 18.2.0 (안정 버전)으로 다운그레이드
- **참고**: React 19는 2024년 5월 기준 실험적 버전으로, CI/CD 환경 및 Cloudflare Pages와 호환성 문제가 있음
- **조치사항**: package.json의 React 관련 모든 패키지 버전을 18.x로 유지

### 2. Node.js 버전 제한

- **설정**: package.json에 `"engines": { "node": ">=18.0.0 <19.0.0" }` 추가
- **목적**: GitHub Actions 및 Cloudflare Pages에서 안정적인 Node.js LTS 버전 사용 보장
- **참고**: 로컬 개발 환경과 배포 환경의 Node.js 버전 차이로 인한 문제 방지

### 3. GitHub Actions 워크플로우 설정

- **파일위치**: `.github/workflows/main.yml`
- **주요 설정**:
  - Node.js 18.x 버전 사용
  - `actions/checkout@v4`, `actions/setup-node@v4`, `actions/upload-artifact@v4` 최신 버전 사용
  - `CI=false npm run build`: 빌드 시 경고를 오류로 처리하지 않도록 설정
- **문제해결**: GitHub Actions에서 발생하는 "missing download info" 오류는 actions 버전을 v4로 업데이트하여 해결

### 4. API 키 보안

- **문제**: GitHub 저장소에 실제 OpenAI API 키가 노출되는 문제
- **해결**: 
  - `.gitignore`에 `.env` 파일 추가
  - GitHub Actions 워크플로우에서 빌드 시 더미 환경 변수 생성
  - 실제 환경 변수는 Cloudflare Pages 설정에서 별도 관리
- **권장사항**: API 키는 항상 환경 변수로 관리하고, 소스 코드에 직접 포함하지 않음

### 5. OpenAI 모델 설정

- **사용 모델**: 
  - 일반 운세: 경제적인 `gpt-3.5-turbo` 모델 사용
  - 관상 분석: 이미지 처리 가능한 `gpt-4o` 모델 사용
- **참고**: OpenAI 모델은 지속적으로 업데이트되므로, API 응답에서 발생하는 오류 확인 필요
- **대체 방안**: 관상 분석에서 `gpt-4o`가 지원되지 않을 경우, `gpt-4-turbo`로 폴백하는 로직 구현

### 6. Cloudflare Pages 배포 설정

- **빌드 명령어**: `CI=false npm run build`
- **환경 변수**: 
  - `REACT_APP_OPENAI_API_KEY`: OpenAI API 키 (Cloudflare Pages 환경 변수에 설정)
  - `NODE_VERSION`: 18 (Node.js 버전 명시)
- **주의사항**: 배포 후 처음 몇 분간 사이트가 느리게 로드될 수 있음 (Cloudflare 캐시 워밍업 중)

## 라이선스

MIT
