import axios from 'axios';
import { BirthInfo, FortuneResult, TarotCard, FaceReadingResult, PlanType, ServicePlanConfig } from '../types';
import { tarotCards } from '../assets/tarotData';

// OpenAI API 키 가져오기
const getApiKey = (): string => {
  const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
  if (!apiKey) {
    console.error('API 키가 설정되지 않았습니다. 환경 변수를 확인해주세요.');
    return '';
  }
  // API 키에서 불필요한 공백이나 특수문자 제거
  return apiKey.trim();
};

// 기본 서비스 플랜 설정
const defaultServicePlan: ServicePlanConfig = {
  models: {
    fortune: {
      free: '4o-mini',  // 무료 플랜은 4o-mini 사용
      premium: '4o-mini'  // 프리미엄도 사진 없는 경우 4o-mini 사용
    },
    faceReading: 'gpt-4o'  // GPT-4o 모델 사용 (이미지 입력 지원)
  },
  features: {
    free: ['사주 기반 운세'],
    premium: ['사주 기반 운세', '타로 카드 해석', '관상 분석']
  },
  prices: {
    premium: 5000  // 5,000원
  }
};

// 프롬프트 설정을 불러오는 함수
const getPromptConfig = (promptId: string): string => {
  // 실제 구현에서는 서버에서 불러오거나 별도 파일로 관리할 수 있습니다
  const prompts: Record<string, string> = {
    'fortune-system': 
      `당신은 사주와 타로 카드를 분석하는 전문 운세사입니다. 
      주어진 사주 정보와 타로 카드를 바탕으로 전체적인 운세, 사랑, 직업, 건강 영역별로 상세한 운세를 제공하고 마지막에는 조언을 추가해 주세요.
      각 영역은 200-300자 정도로 작성해주세요.
      한국어로 친절하고 현실적인 조언을 제공하되, 지나치게 부정적이거나 지나치게 긍정적인 내용은 피해주세요.`,
    
    'facereading-system':
      `당신은 관상학을 기반으로 얼굴을 분석하는 전문가입니다.
      제공된 얼굴 이미지를 분석하여 성격 특성, 전반적인 운세, 직업 적성, 대인 관계에 대한 분석과 조언을 제공해주세요.
      학술적 근거와 전통적인 관상학의 원리를 참고하되, 현대적인 해석을 추가해 주세요.
      한국어로 친절하고 현실적인 조언을 제공하되, 지나치게 부정적이거나 지나치게 긍정적인 내용은 피해주세요.`,
    
    'facereading-user':
      `이 사진을 바탕으로 관상을 분석해주세요. 다음 항목들을 포함해주세요:
      1. 핵심 성격 특성 (5개의 키워드와 설명)
      2. 전반적인 운세
      3. 직업 적성 및 재능
      4. 대인 관계 및 연애 성향
      5. 조언
      각 항목은 200-300자 정도로 상세히 작성해주세요.`
  };
  
  return prompts[promptId] || '프롬프트 설정을 찾을 수 없습니다.';
};

// 서비스 플랜 관련 함수
/**
 * 현재 설정된 서비스 플랜 정보 가져오기
 */
export const getServicePlanConfig = (): ServicePlanConfig => {
  const savedConfig = localStorage.getItem('servicePlanConfig');
  if (savedConfig) {
    return JSON.parse(savedConfig);
  }
  return defaultServicePlan;
};

/**
 * 현재 사용자의 서비스 플랜 타입 가져오기
 */
export const getCurrentPlanType = (): PlanType => {
  const planType = localStorage.getItem('currentPlanType');
  return planType === 'PREMIUM' ? PlanType.PREMIUM : PlanType.FREE;
};

/**
 * 서비스 플랜 타입 설정하기
 */
export const setCurrentPlanType = (planType: PlanType): void => {
  localStorage.setItem('currentPlanType', planType);
};

/**
 * 사용자 플랜에 따른 기능 사용 가능 여부 확인
 */
export const isFeatureAvailable = (feature: string): boolean => {
  const currentPlan = getCurrentPlanType();
  const config = getServicePlanConfig();
  
  if (currentPlan === PlanType.PREMIUM) {
    return config.features.premium.includes(feature);
  } else {
    return config.features.free.includes(feature);
  }
};

// 사주와 타로카드 정보로 운세 결과 생성
export const generateFortune = async (
  birthInfo: BirthInfo,
  selectedCard?: TarotCard | null
): Promise<FortuneResult> => {
  try {
    // API 키 확인
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error('API 키가 설정되지 않았습니다. 환경 변수를 확인해주세요.');
    }
    
    // 플랜에 따른 모델 선택
    const currentPlan = getCurrentPlanType();
    const config = getServicePlanConfig();
    const model = currentPlan === PlanType.PREMIUM ? 
      config.models.fortune.premium : 
      config.models.fortune.free;
    
    // 4o-mini 모델이 OpenAI에서 지원되지 않는 경우를 대비해 fallback 설정
    const useModel = model === '4o-mini' ? '4o-mini' : 'gpt-3.5-turbo';
    
    // 시스템 프롬프트 가져오기
    const systemPrompt = getPromptConfig('fortune-system');

    // 타로 카드 관련 내용을 조건부로 구성
    const tarotContent = selectedCard ? 
      `선택한 타로 카드: ${selectedCard.name}
      카드 의미: ${selectedCard.description}` 
      : '타로 카드를 선택하지 않았습니다.';

    // 실제 환경에서는 서버를 통해 API 키를 노출하지 않도록 백엔드 API를 사용해야 합니다
    try {
      // 요청 설정
      const requestData = {
        model: useModel,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `
              사주 정보: ${birthInfo.year}년 ${birthInfo.month}월 ${birthInfo.day}일 ${birthInfo.hour}시 ${birthInfo.minute}분
              성별: ${birthInfo.gender === 'male' ? '남성' : '여성'}
              음력/양력: ${birthInfo.calendar === 'lunar' ? '음력' : '양력'}
              
              ${tarotContent}
              
              이 정보를 바탕으로 오늘의 운세를 전체적인 운세, 사랑, 직업, 건강 영역으로 나누어 상세하게 알려주고, 마지막에 조언을 추가해주세요.
            `
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      };
      
      // 헤더 설정 - ASCII 문자만 포함하도록 주의
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      };
      
      console.log(`운세 분석 사용 모델: ${useModel}`);
      
      // 실제 환경에서는 서버에서 API 호출을 처리해야 함
      // 클라이언트 측에서는 직접 OpenAI API를 호출하지 않고 자체 백엔드를 통해 호출해야 함
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        requestData,
        { headers }
      );
  
      const content = response.data.choices[0].message.content;
      
      // 응답을 파싱하여 FortuneResult 형태로 반환
      return {
        overall: content.includes('전체적인 운세') ? extractSection(content, '전체적인 운세', '사랑') : '정보를 불러올 수 없습니다.',
        love: content.includes('사랑') ? extractSection(content, '사랑', '직업') : '정보를 불러올 수 없습니다.',
        career: content.includes('직업') ? extractSection(content, '직업', '건강') : '정보를 불러올 수 없습니다.',
        health: content.includes('건강') ? extractSection(content, '건강', '조언') : '정보를 불러올 수 없습니다.',
        advice: content.includes('조언') ? content.substring(content.indexOf('조언')) : '정보를 불러올 수 없습니다.',
        selectedCard: selectedCard || undefined
      };
    } catch (error: any) {
      console.error('API 호출 오류:', error);
      
      // 모델 오류인 경우 fallback 모델로 재시도
      if (error.response && error.response.status === 404 && useModel === '4o-mini') {
        console.log('4o-mini 모델을 찾을 수 없어 gpt-3.5-turbo로 대체합니다');
        
        // 설정 업데이트
        const updatedConfig = {...config};
        updatedConfig.models.fortune.free = 'gpt-3.5-turbo';
        updatedConfig.models.fortune.premium = 'gpt-3.5-turbo';
        localStorage.setItem('servicePlanConfig', JSON.stringify(updatedConfig));
        
        // 재귀적으로 다시 호출
        return generateFortune(birthInfo, selectedCard);
      }
      
      // API 호출 오류 상세 처리
      if (error.response) {
        console.error('API 응답 오류:', error.response.data);
        throw new Error(`API 호출 실패: ${error.response.status} - ${error.response.data.error?.message || '알 수 없는 오류'}`);
      } else if (error.request) {
        throw new Error('서버로부터 응답이 없습니다. 인터넷 연결을 확인하세요.');
      } else {
        // 헤더 관련 오류인 경우 대체 메시지 제공
        if (error.message.includes('setRequestHeader') || error.message.includes('ISO-8859-1')) {
          throw new Error('API 키에 유효하지 않은 문자가 포함되어 있습니다. API 키를 확인해주세요.');
        }
        throw new Error(`요청 설정 중 오류: ${error.message}`);
      }
    }
  } catch (error: any) {
    console.error('운세 생성 오류:', error);
    throw error;
  }
};

// 얼굴 이미지로 관상 분석 결과 생성
export const analyzeFaceReading = async (imageBase64: string): Promise<FaceReadingResult> => {
  try {
    // API 키 확인
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error('API 키가 설정되지 않았습니다. 환경 변수를 확인해주세요.');
    }
    
    // 프리미엄 플랜 확인
    const currentPlan = getCurrentPlanType();
    if (currentPlan !== PlanType.PREMIUM) {
      throw new Error('관상 분석은 프리미엄 플랜 전용 기능입니다.');
    }
    
    // 모델 설정 가져오기 - 항상 고급 모델 사용
    const config = getServicePlanConfig();
    const model = config.models.faceReading;
    
    console.log(`관상 분석 사용 모델: ${model}`);
    
    // 시스템 및 사용자 프롬프트 가져오기
    const systemPrompt = getPromptConfig('facereading-system');
    const userPrompt = getPromptConfig('facereading-user');
    
    // 이미지 데이터에서 base64 본문만 추출 (data:image/jpeg;base64, 부분 제거)
    const base64Data = imageBase64.split(',')[1];
    
    try {
      // 요청 데이터 설정
      const requestData = {
        model: model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: userPrompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Data}`
                }
              }
            ]
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      };
      
      // 헤더 설정
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      };
      
      // 실제 환경에서는 서버를 통해 API 키를 노출하지 않도록 백엔드 API를 사용해야 합니다
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        requestData,
        { headers }
      );
  
      const content = response.data.choices[0].message.content;
      
      // 응답을 파싱하여 FaceReadingResult 형태로 반환
      // 성격 특성은 본문에서 키워드 추출
      const personalityTraits = extractPersonalityTraits(content);
      
      return {
        personalityTraits,
        overallFortune: content.includes('전반적인 운세') ? 
          extractSection(content, '전반적인 운세', '직업 적성') : 
          extractSection(content, '운세', '직업'),
        careerSuitability: content.includes('직업 적성') ? 
          extractSection(content, '직업 적성', '대인 관계') : 
          extractSection(content, '직업', '대인 관계'),
        relationships: content.includes('대인 관계') ? 
          extractSection(content, '대인 관계', '조언') : 
          extractSection(content, '연애', '조언'),
        advice: content.includes('조언') ? 
          content.substring(content.indexOf('조언')) : 
          '조언을 찾을 수 없습니다.',
        imageUrl: imageBase64
      };
    } catch (error: any) {
      console.error('API 호출 오류:', error);
      
      // 모델 오류인 경우 대체 모델 시도
      if (error.response && error.response.status === 404 && (error.response.data.error?.message?.includes('deprecated') || error.response.data.error?.message?.includes('not found'))) {
        console.log('모델이 변경되었거나 지원되지 않습니다. 대체 모델로 시도합니다.');
        
        // 설정 업데이트
        const updatedConfig = {...config};
        // gpt-4o가 안되면 gpt-4-turbo, 그것도 안되면 gpt-4로 시도
        if (model === 'gpt-4o') {
          updatedConfig.models.faceReading = 'gpt-4-turbo';
        } else if (model === 'gpt-4-turbo') {
          updatedConfig.models.faceReading = 'gpt-4';
        } else if (model === 'gpt-4-vision-preview') {
          updatedConfig.models.faceReading = 'gpt-4o';
        }
        
        localStorage.setItem('servicePlanConfig', JSON.stringify(updatedConfig));
        
        // 재귀적으로 다시 호출
        return analyzeFaceReading(imageBase64);
      }
      
      // API 호출 오류 상세 처리
      if (error.response) {
        console.error('API 응답 오류:', error.response.data);
        throw new Error(`API 호출 실패: ${error.response.status} - ${error.response.data.error?.message || '알 수 없는 오류'}`);
      } else if (error.request) {
        throw new Error('서버로부터 응답이 없습니다. 인터넷 연결을 확인하세요.');
      } else {
        // 헤더 관련 오류인 경우 대체 메시지 제공
        if (error.message.includes('setRequestHeader') || error.message.includes('ISO-8859-1')) {
          throw new Error('API 키에 유효하지 않은 문자가 포함되어 있습니다. API 키를 확인해주세요.');
        }
        throw new Error(`요청 설정 중 오류: ${error.message}`);
      }
    }
  } catch (error: any) {
    console.error('관상 분석 오류:', error);
    throw error;
  }
};

// 응답에서 섹션을 추출하는 헬퍼 함수
const extractSection = (content: string, startSection: string, endSection: string): string => {
  const startIndex = content.toLowerCase().indexOf(startSection.toLowerCase());
  const endIndex = content.toLowerCase().indexOf(endSection.toLowerCase());
  
  if (startIndex === -1) return '정보를 불러올 수 없습니다.';
  if (endIndex === -1) return content.substring(startIndex);
  
  return content.substring(startIndex, endIndex).trim();
};

// 성격 특성 키워드를 추출하는 헬퍼 함수
const extractPersonalityTraits = (content: string): string[] => {
  // 성격 특성 섹션 추출
  const personalitySection = extractSection(content, '성격 특성', '전반적인 운세').toLowerCase();
  
  // 정규식을 사용하여 키워드를 찾음 (볼드, 숫자+점, 따옴표 등으로 표시된 부분)
  const keywordMatches = personalitySection.match(/['"]([^'"]+)['"]|\*([^*]+)\*|^\d+\.\s*([^\n:]+):|•\s*([^\n:]+):|◦\s*([^\n:]+):|[-*]\s*([^\n:]+):/gm);
  
  let traits: string[] = [];
  
  if (keywordMatches) {
    traits = keywordMatches.map(match => {
      // 특수 문자 및 구분자 제거
      return match.replace(/['"\*\d+\.\s\-•◦:]/g, '').trim();
    }).filter(trait => trait.length > 0);
  }
  
  // 키워드가 추출되지 않았을 경우 전체 섹션에서 짧은 구문 추출 시도
  if (traits.length === 0) {
    const words = personalitySection.split(/[,\n]/);
    traits = words.filter(word => {
      const trimmed = word.trim();
      return trimmed.length > 2 && trimmed.length < 20;
    }).slice(0, 5);
  }
  
  // 최대 5개로 제한
  return traits.slice(0, 5);
};

// 랜덤 타로 카드 3장 선택
export const getRandomTarotCards = (): TarotCard[] => {
  const shuffled = [...tarotCards].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3);
};

const apiExports = {
  generateFortune,
  analyzeFaceReading,
  getRandomTarotCards,
  getCurrentPlanType,
  setCurrentPlanType,
  getServicePlanConfig,
  isFeatureAvailable
};

export default apiExports; 