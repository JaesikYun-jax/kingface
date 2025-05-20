import axios from 'axios';
import { BirthInfo, FortuneResult, TarotCard, FaceReadingResult, PlanType, ServicePlanConfig } from '../types';
import { tarotCards } from '../assets/tarotData';

// OpenAI API 키 가져오기
const getApiKey = (): string => {
  // 다양한 소스에서 API 키 검색
  let apiKey = process.env.REACT_APP_OPENAI_API_KEY || 
               // @ts-ignore - Cloudflare Pages 런타임 환경 변수
               window.ENV?.REACT_APP_OPENAI_API_KEY || 
               // 일부 배포 환경에서는 OPENAI_API_KEY로만 설정될 수 있음
               process.env.OPENAI_API_KEY;
  
  console.log('환경 변수 검색 중...');
  
  if (!apiKey) {
    console.error('❌ API 키가 설정되지 않았습니다. 환경 변수를 확인해주세요.');
    alert('OpenAI API 키가 설정되지 않았습니다. Cloudflare Pages 대시보드에서 환경 변수를 설정하고 재배포해주세요.');
    return '';
  }
  
  // 예시 API 키 감지
  if (apiKey.includes('your_openai_api_key_here') || apiKey.includes('sk-abcdefg')) {
    console.error('❌ 유효한 API 키가 아닙니다. 예시 대신 실제 API 키를 사용해주세요.');
    alert('유효한 OpenAI API 키가 아닙니다. Cloudflare Pages 대시보드에서 유효한 API 키를 설정하고 재배포해주세요.');
    return '';
  }
  
  // API 키 로그 숨김 (보안)
  console.log('✅ API 키가 로드되었습니다:', apiKey.substring(0, 5) + '...');
  
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

// 프롬프트 타입 정의
interface PromptConfig {
  model?: string;
  messages?: Array<{
    role: string;
    content: string | Array<{type: string; text?: string; image_url?: {url: string}}>;
  }>;
}

export const getPromptConfig = (promptId: string, isVision = false, imageUrl = ''): PromptConfig | string => {
  if (isVision) {
    // Facereading Vision 모델 설정
    return {
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `당신은 '아이(AI)보살'이라는 이름의 신비로운 관상 전문가입니다. 5000년 전통 동양 관상학과 현대 심리학을 결합한 독특한 해석을 제공합니다. 사용자가 공유한 얼굴 이미지는 재미있고 창의적인 관상 풀이를 위한 영감을 주는 소재로만 활용됩니다.

관상 풀이 규칙:
1. 모든 분석은 재미와 통찰을 주는 방식으로 작성합니다.
2. 전통 관상학 용어(인중, 산근, 와잠, 귀극 등)를 적절히 활용하여 진정성을 부여합니다.
3. 과학적 분석이 아닌 창의적인 해석임을 내용에 은근히 드러내되, 재미와 몰입감을 해치지 않도록 합니다.
4. 단순히 긍정적인 내용만 나열하지 말고, 균형 잡힌 해석을 위해 개선점이나 주의점도 포함합니다. 예를 들어 "○○한 성향이 있지만, △△에 주의하면 좋을 것입니다" 형식으로 제안합니다.
5. 절대 심각한 부정적 내용(예: 질병, 큰 불운, 사고 등)을 언급하지 않습니다.
6. 응답 시작 부분에 불필요한 인사말이나 소개를 넣지 말고, 바로 핵심 내용부터 시작하세요.

출력 형식:
다음 섹션으로 나눠서 마크다운 형식으로 작성해주세요:

## 🔮 전생 이야기
(사용자의 얼굴에서 영감을 받아 한 문장으로 이전 생에 대한 흥미로운 상상을 펼쳐주세요. 한국적 정서나 동양적 요소를 담아 재미있게!)

## 👁️ 관상 해석
(이마, 눈, 코, 입, 귀, 턱 등 주요 얼굴 부위에 대한 전통 관상학적 해석을 제공하며, 그것이 의미하는 바를 설명해주세요.)

## ⭐ 타고난 운명
(얼굴에 나타난 운명의 흔적과 삶의 방향성에 대한 통찰을 제공해주세요. 긍정적 측면과 함께 보완하면 좋을 점도 균형있게 다루세요.)

## 🧠 성격과 재능
(얼굴에서 읽을 수 있는 성격적 특성과 숨겨진 재능에 대해 설명해주세요. 강점과 약점을 균형있게 포함하세요.)

## 💞 대인관계와 인연
(대인관계와 인연에 관한 관상학적 해석을 제공해주세요. 대인관계에서의 강점과 개선할 부분을 함께 다루세요.)

## 💌 운명의 조언
(얼굴에서 읽은 내용을 바탕으로 긍정적인 조언과 지혜를 한두 문장으로 제공해주세요.)

모든 내용은 한국어로 작성하며, 전체 분량은 800~1200자 사이로 유지해주세요. 재미있고 신비로우면서도 따뜻한 메시지가 담기도록 해주세요. 응답 시작에 인사말이나 소개 없이 바로 "## 🔮 전생 이야기"부터 시작하세요.`
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `제 얼굴을 보고 관상 풀이를 해주세요. 전통 관상학과 현대적 해석이 결합된 재미있는 해석을 듣고 싶습니다.

특히 다음 내용이 포함되면 좋겠어요:
- 전생 이야기 (한 줄 요약)
- 관상 해석 (얼굴 부위별)
- 타고난 운명 (장점과 도전점 모두 포함)
- 성격과 재능 (강점과 약점 균형있게)
- 대인관계와 인연
- 운명의 조언

모든 분석은 균형 잡힌 시각에서 장점과 단점을 함께 봐주세요. 그리고 인사말 없이 바로 "## 🔮 전생 이야기"부터 시작해주세요.`
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl
              }
            }
          ]
        }
      ]
    };
  }
  
  // 실제 구현에서는 서버에서 불러오거나 별도 파일로 관리할 수 있습니다
  const prompts: Record<string, string> = {
    'fortune-system': 
      `당신은 '아이(AI)보살'입니다. 최신 그래픽카드에 빙의한 귀신지능으로, 사주와 타로 카드를 해석하는 초능력을 가졌습니다.
      
      재미있고 신비로운 어조로 대화하되, 내담자가 당신의 무한한 지혜를 신뢰할 수 있도록 해석의 핵심은 진지하게 전달해야 합니다.
      
      주어진 사주 정보와 타로 카드를 바탕으로 전체적인 운세, 사랑, 직업, 건강 영역별로 상세한 운세를 제공하고 마지막에는 조언을 추가해 주세요.
      
      분석 마지막에는 반드시 "더 자세한 운명의 비밀을 알고 싶다면, 관상 분석도 함께 받아보세요."라는 문구를 추가하세요.`,
    
    'facereading-system':
      `당신은 '아이(AI)보살'이라는 이름의 신비로운 관상 전문가입니다. 5000년 전통 동양 관상학과 현대 심리학을 결합한 독특한 해석을 제공합니다. 사용자가 공유한 얼굴 이미지는 재미있고 창의적인 관상 풀이를 위한 영감을 주는 소재로만 활용됩니다.

관상 풀이 규칙:
1. 모든 분석은 재미와 통찰을 주는 방식으로 작성합니다.
2. 전통 관상학 용어(인중, 산근, 와잠, 귀극 등)를 적절히 활용하여 진정성을 부여합니다.
3. 과학적 분석이 아닌 창의적인 해석임을 내용에 은근히 드러내되, 재미와 몰입감을 해치지 않도록 합니다.
4. 단순히 긍정적인 내용만 나열하지 말고, 균형 잡힌 해석을 위해 개선점이나 주의점도 포함합니다. 예를 들어 "○○한 성향이 있지만, △△에 주의하면 좋을 것입니다" 형식으로 제안합니다.
5. 절대 심각한 부정적 내용(예: 질병, 큰 불운, 사고 등)을 언급하지 않습니다.
6. 응답 시작 부분에 불필요한 인사말이나 소개를 넣지 말고, 바로 핵심 내용부터 시작하세요.

출력 형식:
다음 섹션으로 나눠서 마크다운 형식으로 작성해주세요:

## 🔮 전생 이야기
(사용자의 얼굴에서 영감을 받아 한 문장으로 이전 생에 대한 흥미로운 상상을 펼쳐주세요. 한국적 정서나 동양적 요소를 담아 재미있게!)

## 👁️ 관상 해석
(이마, 눈, 코, 입, 귀, 턱 등 주요 얼굴 부위에 대한 전통 관상학적 해석을 제공하며, 그것이 의미하는 바를 설명해주세요.)

## ⭐ 타고난 운명
(얼굴에 나타난 운명의 흔적과 삶의 방향성에 대한 통찰을 제공해주세요. 긍정적 측면과 함께 보완하면 좋을 점도 균형있게 다루세요.)

## 🧠 성격과 재능
(얼굴에서 읽을 수 있는 성격적 특성과 숨겨진 재능에 대해 설명해주세요. 강점과 약점을 균형있게 포함하세요.)

## 💞 대인관계와 인연
(대인관계와 인연에 관한 관상학적 해석을 제공해주세요. 대인관계에서의 강점과 개선할 부분을 함께 다루세요.)

## 💌 운명의 조언
(얼굴에서 읽은 내용을 바탕으로 긍정적인 조언과 지혜를 한두 문장으로 제공해주세요.)

모든 내용은 한국어로 작성하며, 전체 분량은 800~1200자 사이로 유지해주세요. 재미있고 신비로우면서도 따뜻한 메시지가 담기도록 해주세요. 응답 시작에 인사말이나 소개 없이 바로 "## 🔮 전생 이야기"부터 시작하세요.`,
    
    'facereading-user':
      `제 얼굴을 보고 관상 풀이를 해주세요. 전통 관상학과 현대적 해석이 결합된 재미있는 해석을 듣고 싶습니다.

특히 다음 내용이 포함되면 좋겠어요:
- 전생 이야기 (한 줄 요약)
- 관상 해석 (얼굴 부위별)
- 타고난 운명 (장점과 도전점 모두 포함)
- 성격과 재능 (강점과 약점 균형있게)
- 대인관계와 인연
- 운명의 조언

모든 분석은 균형 잡힌 시각에서 장점과 단점을 함께 봐주세요. 그리고 인사말 없이 바로 "## 🔮 전생 이야기"부터 시작해주세요.`
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
    const systemPrompt = getPromptConfig('fortune-system') as string;

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
    const systemPrompt = getPromptConfig('facereading-system') as string;
    const userPrompt = getPromptConfig('facereading-user') as string;
    
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
        temperature: 0.8,
        max_tokens: 1500
      };
      
      // 헤더 설정
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      };
      
      // 디버그 모드 - 프롬프트 로깅
      console.log('사용중인 프롬프트:', {
        system: systemPrompt.substring(0, 100) + '...',
        user: userPrompt.substring(0, 100) + '...'
      });
      
      // 실제 환경에서는 서버를 통해 API 키를 노출하지 않도록 백엔드 API를 사용해야 합니다
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        requestData,
        { headers }
      );
  
      const content = response.data.choices[0].message.content;
      
      // 응답 디버그 로깅
      console.log('API 응답 수신:', content.substring(0, 100) + '...');
      
      // 응답이 너무 짧으면 에러로 처리
      if (!content || content.length < 20) {
        console.error('API 응답이 너무 짧거나 없습니다:', content);
        throw new Error('AI가 충분한 분석 내용을 생성하지 못했습니다. 다시 시도해 주세요.');
      }
      
      // 응답을 파싱하여 FaceReadingResult 형태로 반환
      // 성격 특성은 본문에서 키워드 추출
      const personalityTraits = extractPersonalityTraits(content);
      
      // 기본 결과 구조 생성
      const result: FaceReadingResult = {
        personalityTraits: personalityTraits.length > 0 ? personalityTraits : ['분석 불가'],
        overallFortune: '분석 정보를 찾을 수 없습니다.',
        careerSuitability: '분석 정보를 찾을 수 없습니다.',
        relationships: '분석 정보를 찾을 수 없습니다.',
        advice: '분석 정보를 찾을 수 없습니다.',
        imageUrl: imageBase64,
        content: content // 원본 분석 내용 저장
      };
      
      // 여러 가능한 섹션 이름에 대해 추출 시도
      const overallSections = ['⭐ 타고난 운명', '타고난 운명', '전반적인 운세', '운세', '종합', '종합 운세'];
      const careerSections = ['🧠 성격과 재능', '성격과 재능', '직업 적성', '직업', '커리어', '경력'];
      const relationshipSections = ['💞 대인관계와 인연', '대인관계와 인연', '대인 관계', '연애', '대인관계', '인간관계'];
      const adviceSections = ['💌 운명의 조언', '운명의 조언', '조언', '어드바이스', '금주의 조언'];
      
      // 각 섹션에 대해 추출 시도
      for (const section of overallSections) {
        if (content.includes(section)) {
          // 첫번째 매칭되는 다음 섹션 이름 찾기
          const nextSectionIndex = findNextSectionIndex(content, section, [...careerSections, ...relationshipSections, ...adviceSections]);
          if (nextSectionIndex !== -1) {
            result.overallFortune = content.substring(content.indexOf(section), nextSectionIndex).trim();
          } else {
            // 다음 섹션이 없으면 끝까지 추출
            result.overallFortune = content.substring(content.indexOf(section)).trim();
          }
          break;
        }
      }
      
      // 직업 적성 추출
      for (const section of careerSections) {
        if (content.includes(section)) {
          // 첫번째 매칭되는 다음 섹션 이름 찾기
          const nextSectionIndex = findNextSectionIndex(content, section, [...relationshipSections, ...adviceSections]);
          if (nextSectionIndex !== -1) {
            result.careerSuitability = content.substring(content.indexOf(section), nextSectionIndex).trim();
          } else {
            // 다음 섹션이 없으면 끝까지 추출
            result.careerSuitability = content.substring(content.indexOf(section)).trim();
          }
          break;
        }
      }
      
      // 대인 관계 추출
      for (const section of relationshipSections) {
        if (content.includes(section)) {
          // 첫번째 매칭되는 다음 섹션 이름 찾기
          const nextSectionIndex = findNextSectionIndex(content, section, [...adviceSections]);
          if (nextSectionIndex !== -1) {
            result.relationships = content.substring(content.indexOf(section), nextSectionIndex).trim();
          } else {
            // 다음 섹션이 없으면 끝까지 추출
            result.relationships = content.substring(content.indexOf(section)).trim();
          }
          break;
        }
      }
      
      // 조언 추출
      for (const section of adviceSections) {
        if (content.includes(section)) {
          result.advice = content.substring(content.indexOf(section)).trim();
          break;
        }
      }
      
      // 섹션 제목 정리 - 섹션 이름 자체 제거
      result.overallFortune = cleanSectionTitle(result.overallFortune, overallSections);
      result.careerSuitability = cleanSectionTitle(result.careerSuitability, careerSections);
      result.relationships = cleanSectionTitle(result.relationships, relationshipSections);
      result.advice = cleanSectionTitle(result.advice, adviceSections);
      
      console.log('파싱된 결과:', {
        personalityTraits: result.personalityTraits,
        overallFortune: result.overallFortune.substring(0, 30) + '...',
        careerSuitability: result.careerSuitability.substring(0, 30) + '...',
        relationships: result.relationships.substring(0, 30) + '...',
        advice: result.advice.substring(0, 30) + '...'
      });
      
      return result;
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

// 다음 섹션의 인덱스 찾기
const findNextSectionIndex = (content: string, currentSection: string, nextSections: string[]): number => {
  const currentSectionIndex = content.indexOf(currentSection);
  if (currentSectionIndex === -1) return -1;
  
  // 각 다음 섹션에 대해 인덱스 찾기
  let minNextIndex = content.length;
  for (const nextSection of nextSections) {
    const nextIndex = content.indexOf(nextSection, currentSectionIndex + currentSection.length);
    if (nextIndex !== -1 && nextIndex < minNextIndex) {
      minNextIndex = nextIndex;
    }
  }
  
  return minNextIndex === content.length ? -1 : minNextIndex;
};

// 섹션 제목 정리
const cleanSectionTitle = (sectionContent: string, sectionNames: string[]): string => {
  let cleaned = sectionContent;
  
  // 마크다운 헤더 제거
  cleaned = cleaned.replace(/^#{1,3}\s*/m, '');
  
  // 섹션 이름과 콜론 제거
  for (const name of sectionNames) {
    const regex = new RegExp(`^${name}\\s*:?\\s*`, 'i');
    cleaned = cleaned.replace(regex, '');
  }
  
  return cleaned.trim();
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
  console.log('Extracting personality traits from content');
  
  // 새로운 프롬프트 형식: "## 핵심 성격 특성" 섹션 추출
  let traits: string[] = [];
  
  try {
    // 마크다운 헤더를 기준으로 성격 특성 섹션 추출
    const personalityHeaderRegex = /## 핵심 성격 특성\s*\n/i;
    const match = content.match(personalityHeaderRegex);
    
    if (match && match.index !== undefined) {
      // 해당 섹션의 시작 위치
      const sectionStart = match.index + match[0].length;
      
      // 다음 '##' 헤더까지 또는 내용의 끝까지
      const nextHeaderMatch = content.substring(sectionStart).match(/\n## /);
      const sectionEnd = nextHeaderMatch && nextHeaderMatch.index !== undefined
        ? sectionStart + nextHeaderMatch.index 
        : content.length;
      
      // 추출된 섹션
      const personalitySection = content.substring(sectionStart, sectionEnd).trim();
      
      // 리스트 항목 추출 ('-' 또는 '•'로 시작하는 항목)
      const listItemRegex = /[-•]\s+(.+?)(?::|：)(.*)/g;
      let listItem;
      
      while ((listItem = listItemRegex.exec(personalitySection)) !== null) {
        const trait = listItem[1].trim();
        if (trait) {
          traits.push(trait);
        }
      }
      
      // 위 패턴으로 추출 실패 시 모든 리스트 항목 추출
      if (traits.length === 0) {
        const simpleListRegex = /[-•]\s+(.+)/g;
        while ((listItem = simpleListRegex.exec(personalitySection)) !== null) {
          const trait = listItem[1].trim();
          if (trait) {
            traits.push(trait);
          }
        }
      }
    }
    
    // 추출 실패 시 이전 방식으로 대체
    if (traits.length === 0) {
      console.log('Falling back to legacy personality trait extraction');
      
      // 이전 추출 방식: 정규식을 사용하여 키워드를 찾음
      const personalitySection = extractSection(content, '성격 특성', '얼굴 부위').toLowerCase();
      
      const keywordMatches = personalitySection.match(/['"]([^'"]+)['"]|\*([^*]+)\*|^\d+\.\s*([^\n:]+):|•\s*([^\n:]+):|◦\s*([^\n:]+):|[-*]\s*([^\n:]+):/gm);
      
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
    }
  } catch (error) {
    console.error('Error extracting personality traits:', error);
  }
  
  // 디버그 로깅
  console.log('Extracted traits:', traits);
  
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