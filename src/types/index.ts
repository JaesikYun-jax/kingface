// 사주 정보 타입
export interface BirthInfo {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  calendar: 'solar' | 'lunar';
  gender: 'male' | 'female';
  timeSlot?: string; // 12시신 선택을 위한 속성 추가
}

// 타로 카드 타입
export interface TarotCard {
  id: number;
  name: string;
  image: string;
  meaning: string;
  description: string;
}

// 운세 결과 타입
export interface FortuneResult {
  overall: string;
  love: string;
  career: string;
  health: string;
  advice: string;
  selectedCard?: TarotCard;  // 선택한 타로 카드 정보 (옵션)
}

// 관상 분석 결과 타입
export interface FaceReadingResult {
  personalityTraits: string[];  // 성격 특성 배열
  overallFortune: string;      // 전반적인 운세
  careerSuitability: string;   // 직업 적성
  relationships: string;      // 대인 관계
  advice: string;            // 조언
  imageUrl: string;          // 분석된 이미지 URL
  content?: string;          // 원본 분석 내용 (마크다운 형식)
}

// 서비스 플랜 타입
export enum PlanType {
  FREE = 'FREE',
  PREMIUM = 'PREMIUM'
}

// AI 모델 설정 타입
export interface AIModelConfig {
  fortune: {
    free: string;   // 무료 운세 분석 모델
    premium: string; // 프리미엄 운세 분석 모델
  };
  faceReading: string; // 관상 분석 모델 (프리미엄 전용)
}

// 서비스 플랜 설정 타입
export interface ServicePlanConfig {
  models: AIModelConfig;
  features: {
    free: string[]; // 무료 플랜 기능 목록
    premium: string[]; // 프리미엄 플랜 기능 목록
  };
  prices: {
    premium: number; // 프리미엄 플랜 가격
  };
} 