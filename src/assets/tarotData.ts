import { TarotCard } from '../types';

// 타로 카드 이미지 경로 생성 함수
// .png 파일이 있는지 먼저 확인하고, 없으면 .jpg를 시도합니다.
const getCardImagePath = (id: number): string => {
  // 실제 앱에서는 .png 파일이 public 폴더에 있어야 합니다.
  // 여기서는 경로만 생성합니다.
  return `/assets/images/tarot/card-${id}.png`; // .png 우선
};

// 카드 뒷면 이미지 경로
export const cardBackImagePath = '/assets/images/tarot/card-back.png'; // .png 우선

export const tarotCards: TarotCard[] = [
  
    { id: 0, name: '광대', image: getCardImagePath(0), meaning: '유쾌함, 풍자, 가벼운 마음, 삶의 즐거움', description: '삶을 즐기는 유쾌한 자세, 유머와 풍자' },
    { id: 1, name: '마법사', image: getCardImagePath(1), meaning: '창의성, 마법적 능력, 변화의 힘, 능숙한 표현', description: '현실을 바꾸는 창의적인 능력' },
    { id: 2, name: '여사제', image: getCardImagePath(2), meaning: '직관, 신비한 지혜, 내면의 목소리, 비밀스러움', description: '직관적이고 신비로운 내면의 지혜' },
    { id: 3, name: '여제', image: getCardImagePath(3), meaning: '풍요, 창조력, 사랑, 어머니의 마음', description: '모성적 사랑과 창조적 힘' },
    { id: 4, name: '황제', image: getCardImagePath(4), meaning: '권위, 리더십, 질서, 안정성', description: '엄격한 질서와 확고한 리더십' },
    { id: 5, name: '교황', image: getCardImagePath(5), meaning: '전통, 지혜의 전달, 가르침, 도덕적 안내자', description: '지혜와 도덕적 가치를 전하는 안내자' },
    { id: 6, name: '연인', image: getCardImagePath(6), meaning: '사랑, 감정적 결합, 관계의 중요성, 정서적 연결', description: '깊은 감정적 유대와 파트너십' },
    { id: 7, name: '전차', image: getCardImagePath(7), meaning: '추진력, 전진, 승리, 결단력', description: '힘찬 전진과 목표 달성' },
    { id: 8, name: '힘', image: getCardImagePath(8), meaning: '내적 강인함, 용기, 자제력, 인내', description: '내면의 강력한 힘과 용기' },
    { id: 9, name: '은둔자', image: getCardImagePath(9), meaning: '고독, 내적 성찰, 자기 탐구, 심오한 깨달음', description: '고독 속의 심오한 자기 성찰' },
    { id: 10, name: '운명의 수레바퀴', image: getCardImagePath(10), meaning: '운명의 전환, 삶의 변화, 예기치 않은 사건', description: '삶의 예측할 수 없는 변화' },
    { id: 11, name: '정의', image: getCardImagePath(11), meaning: '공정함, 균형, 진실의 판결, 정의로운 결과', description: '진실을 기반으로 한 균형과 판단' },
    { id: 12, name: '매달린 사람', image: getCardImagePath(12), meaning: '희생, 관점의 전환, 자기 희생, 인내', description: '새로운 관점을 얻기 위한 희생과 기다림' },
    { id: 13, name: '죽음', image: getCardImagePath(13), meaning: '종말, 새로운 시작, 변혁, 전환', description: '끝을 통한 새로운 시작' },
    { id: 14, name: '절제', image: getCardImagePath(14), meaning: '균형, 절제력, 내적 평화, 중용', description: '내면의 조화와 균형 잡힌 삶' },
    { id: 15, name: '악마', image: getCardImagePath(15), meaning: '유혹, 집착, 속박, 내적 갈등', description: '어둠과 유혹 속의 내면적 갈등' },
    { id: 16, name: '탑', image: getCardImagePath(16), meaning: '파괴적 변화, 혼란, 예기치 못한 충격', description: '급격한 변화와 혼란의 순간' },
    { id: 17, name: '별', image: getCardImagePath(17), meaning: '희망, 꿈, 영감, 미래에 대한 낙관', description: '긍정적인 미래와 희망' },
    { id: 18, name: '달', image: getCardImagePath(18), meaning: '환상, 꿈, 무의식의 세계, 불확실성', description: '꿈과 환상의 불확실한 세계' },
    { id: 19, name: '태양', image: getCardImagePath(19), meaning: '행복, 성공, 활력, 긍정적인 에너지', description: '밝고 행복한 에너지와 성공' },
    { id: 20, name: '심판', image: getCardImagePath(20), meaning: '깨달음, 재생, 중요한 선택, 자기 평가', description: '새로운 깨달음을 통한 재탄생' },
    { id: 21, name: '세계', image: getCardImagePath(21), meaning: '완성, 전체성, 성취, 여행의 끝', description: '모든 것이 조화롭게 완성된 상태' },
    { id: 22, name: '거울', image: getCardImagePath(22), meaning: '자기 인식, 진실과 직면, 자기 반성', description: '진실한 자신의 모습을 마주하는 순간' },
    { id: 23, name: '나비', image: getCardImagePath(23), meaning: '변신, 자유, 새로운 출발, 성장', description: '자유롭고 아름다운 변신' },
    { id: 24, name: '등대', image: getCardImagePath(24), meaning: '안내, 희망의 빛, 길잡이', description: '어둠 속에서 길을 밝히는 희망' },
    { id: 25, name: '책', image: getCardImagePath(25), meaning: '지식, 배움, 지혜, 진실의 발견', description: '깊은 지혜와 숨겨진 진실' },
    { id: 26, name: '열쇠', image: getCardImagePath(26), meaning: '비밀, 해답, 기회의 문', description: '숨겨진 진실과 새로운 기회' },
    { id: 27, name: '미로', image: getCardImagePath(27), meaning: '혼란, 탐색, 도전, 자기 발견', description: '자기 자신을 찾기 위한 도전적 탐험' },
    { id: 28, name: '모래시계', image: getCardImagePath(28), meaning: '시간, 유한성, 기다림, 흐름', description: '시간의 흐름과 삶의 유한성' },
    { id: 29, name: '다리', image: getCardImagePath(29), meaning: '연결, 전환, 새로운 단계, 관계의 다리', description: '새로운 단계로 넘어가는 연결' }
  
]; 