import React, { useState, useEffect } from 'react';
import { BirthInfo } from '../types';
import styled from '@emotion/styled';
import { ko } from 'date-fns/locale';

interface BirthFormProps {
  onSubmit: (birthInfo: BirthInfo) => void;
}

// 12시신 정보
interface TimeSlot {
  id: string;
  name: string;
  label: string;
  hanja: string; // 한자 추가
  hours: [number, number]; // 시작 시간과 끝 시간
}

// 12시신 데이터
const timeSlots: TimeSlot[] = [
  { id: 'rat', name: '🐭 자시', label: '자(子) 23:00-01:00', hanja: '子', hours: [23, 1] },
  { id: 'ox', name: '🐮 축시', label: '축(丑) 01:00-03:00', hanja: '丑', hours: [1, 3] },
  { id: 'tiger', name: '🐯 인시', label: '인(寅) 03:00-05:00', hanja: '寅', hours: [3, 5] },
  { id: 'rabbit', name: '🐰 묘시', label: '묘(卯) 05:00-07:00', hanja: '卯', hours: [5, 7] },
  { id: 'dragon', name: '🐲 진시', label: '진(辰) 07:00-09:00', hanja: '辰', hours: [7, 9] },
  { id: 'snake', name: '🐍 사시', label: '사(巳) 09:00-11:00', hanja: '巳', hours: [9, 11] },
  { id: 'horse', name: '🐴 오시', label: '오(午) 11:00-13:00', hanja: '午', hours: [11, 13] },
  { id: 'sheep', name: '🐑 미시', label: '미(未) 13:00-15:00', hanja: '未', hours: [13, 15] },
  { id: 'monkey', name: '🐵 신시', label: '신(申) 15:00-17:00', hanja: '申', hours: [15, 17] },
  { id: 'rooster', name: '🐔 유시', label: '유(酉) 17:00-19:00', hanja: '酉', hours: [17, 19] },
  { id: 'dog', name: '🐶 술시', label: '술(戌) 19:00-21:00', hanja: '戌', hours: [19, 21] },
  { id: 'pig', name: '🐷 해시', label: '해(亥) 21:00-23:00', hanja: '亥', hours: [21, 23] },
  { id: 'unknown', name: '🤷 모름', label: '시간 모름', hanja: '?', hours: [0, 0] }
];

// 천간지지 데이터
const celestialStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const earthlyBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 천간지지 한글 청음 데이터 추가
const celestialStemsKorean = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
const earthlyBranchesKorean = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];

// 년간지 계산 - 한글과 한자 모두 반환
const getYearPillar = (year: number): { korean: string; hanja: string } => {
  const stemIndex = (year - 4) % 10;
  const branchIndex = (year - 4) % 12;
  return {
    korean: `${celestialStemsKorean[stemIndex]}${earthlyBranchesKorean[branchIndex]}`,
    hanja: `${celestialStems[stemIndex]}${earthlyBranches[branchIndex]}`
  };
};

// 월간지 계산 - 한글과 한자 모두 반환
const getMonthPillar = (month: number, year: number): { korean: string; hanja: string } => {
  // 월지(지지)는 1월=인(寅)부터 시작
  const branchIndex = (month + 1) % 12;
  
  // 월간(천간)은 연간에 따라 달라짐
  const yearStemIndex = (year - 4) % 10;
  // 연간이 갑(甲)이나 기(己)이면 월간은 병(丙)부터 시작
  const baseIndex = (yearStemIndex % 5) * 2;
  const stemIndex = (baseIndex + month - 1) % 10;
  
  return {
    korean: `${celestialStemsKorean[stemIndex]}${earthlyBranchesKorean[branchIndex]}`,
    hanja: `${celestialStems[stemIndex]}${earthlyBranches[branchIndex]}`
  };
};

// 일간지 계산 - 한글과 한자 모두 반환
const getDayPillar = (year: number, month: number, day: number): { korean: string; hanja: string } => {
  // 실제 계산에서는 역법에 따른 정확한 계산이 필요합니다
  // 여기서는 단순화된 공식을 사용합니다
  const baseDate = new Date(1900, 0, 1);
  const targetDate = new Date(year, month - 1, day);
  const daysDiff = Math.floor((targetDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const stemIndex = (daysDiff + 9) % 10;
  const branchIndex = (daysDiff + 3) % 12;
  
  return {
    korean: `${celestialStemsKorean[stemIndex]}${earthlyBranchesKorean[branchIndex]}`,
    hanja: `${celestialStems[stemIndex]}${earthlyBranches[branchIndex]}`
  };
};

// 시간지 계산 - 한글과 한자 모두 반환
const getTimePillar = (hour: number, dayStemnIndex: number): { korean: string; hanja: string } => {
  // 시지(지지)는 자(子)시부터 시작, 2시간 간격
  let branchIndex = Math.floor(hour / 2);
  if (hour === 23) branchIndex = 0; // 23시는 자시(子時)에 포함
  
  // 시간에 해당하는 지지 인덱스 계산
  const adjustedBranchIndex = (branchIndex + 12) % 12;
  
  // 시간에 해당하는 천간 계산, 일간(일주 천간)에 따라 달라짐
  const offset = (dayStemnIndex % 5) * 2;
  const stemIndex = (offset + Math.floor(hour / 2)) % 10;
  
  return {
    korean: `${celestialStemsKorean[stemIndex]}${earthlyBranchesKorean[adjustedBranchIndex]}`,
    hanja: `${celestialStems[stemIndex]}${earthlyBranches[adjustedBranchIndex]}`
  };
};

const BirthForm: React.FC<BirthFormProps> = ({ onSubmit }) => {
  // 오늘 날짜에서 20년 전 날짜 계산
  const getTwentyYearsAgo = (): Date => {
    const today = new Date();
    today.setFullYear(today.getFullYear() - 20);
    return today;
  };
  
  // 상태 관리
  const [birthDate, setBirthDate] = useState<Date>(getTwentyYearsAgo());
  const [birthDateString, setBirthDateString] = useState<string>('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [isLunar, setIsLunar] = useState<boolean>(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [sajuText, setSajuText] = useState<{ korean: string; hanja: string }>({ korean: '', hanja: '' });
  const [showTooltip, setShowTooltip] = useState<boolean>(false);

  // 사주 계산 및 표시
  useEffect(() => {
    const year = birthDate.getFullYear();
    const month = birthDate.getMonth() + 1;
    const day = birthDate.getDate();
    
    let hour = 0;
    // "모름"이 아닌 경우에만 시간 설정
    if (selectedTimeSlot !== "unknown") {
      const timeSlot = timeSlots.find(slot => slot.id === selectedTimeSlot);
      if (timeSlot) {
        // 해당 시간대의 중간 시간으로 설정 (자시는 특별 처리)
        if (timeSlot.id === 'rat') {
          hour = 0; // 자정으로 설정
        } else {
          const startHour = timeSlot.hours[0];
          const endHour = timeSlot.hours[1];
          hour = Math.floor((startHour + endHour) / 2);
        }
      }
    }
    
    const yearPillar = getYearPillar(year);
    const monthPillar = getMonthPillar(month, year);
    const dayPillar = getDayPillar(year, month, day);
    
    // 일간(일주 천간) 인덱스 구하기
    const dayStemnIndex = celestialStems.indexOf(dayPillar.hanja[0]);
    
    // 시간 지정이 없으면 시주는 표시하지 않음
    let timePillar = null;
    if (selectedTimeSlot !== "unknown") {
      timePillar = getTimePillar(hour, dayStemnIndex);
    }
    
    // 사주 정보 객체로 저장
    const sajuInfo = {
      korean: timePillar ? 
        `${yearPillar.korean}년 ${monthPillar.korean}월 ${dayPillar.korean}일 ${timePillar.korean}시` :
        `${yearPillar.korean}년 ${monthPillar.korean}월 ${dayPillar.korean}일`,
      hanja: timePillar ?
        `${yearPillar.hanja}년 ${monthPillar.hanja}월 ${dayPillar.hanja}일 ${timePillar.hanja}시` :
        `${yearPillar.hanja}년 ${monthPillar.hanja}월 ${dayPillar.hanja}일`
    };
    
    setSajuText(sajuInfo);
  }, [birthDate, selectedTimeSlot]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 시간 슬롯에 따른 시간 설정
    let hour = 0;
    let minute = 0;
    
    // "모름"이 아닌 경우에만 시간 설정
    if (selectedTimeSlot !== "unknown") {
      const timeSlot = timeSlots.find(slot => slot.id === selectedTimeSlot);
      if (timeSlot) {
        // 해당 시간대의 중간 시간으로 설정
        const startHour = timeSlot.hours[0];
        const endHour = timeSlot.hours[1];
        
        // 다음날로 넘어가는 경우(자시) 처리
        if (startHour > endHour) {
          hour = 0; // 자정으로 설정
        } else {
          hour = Math.floor((startHour + endHour) / 2);
        }
      }
    }
    
    // Date 객체에서 BirthInfo로 변환
    const birthInfo: BirthInfo = {
      year: birthDate.getFullYear(),
      month: birthDate.getMonth() + 1,
      day: birthDate.getDate(),
      hour,
      minute,
      gender,
      calendar: isLunar ? 'lunar' : 'solar',
      timeSlot: selectedTimeSlot
    };
    
    onSubmit(birthInfo);
  };

  // 시간 슬롯 선택 핸들러 - 버튼 클릭시 바로 submit되지 않도록 수정
  const handleTimeSlotSelect = (slotId: string) => {
    setSelectedTimeSlot(slotId);
  };

  // 생년월일 문자열 입력 핸들러
  const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // 숫자만 허용
    setBirthDateString(value);
    
    // 8자리가 입력되면 Date 객체로 변환
    if (value.length === 8) {
      const year = parseInt(value.substring(0, 4));
      const month = parseInt(value.substring(4, 6)) - 1; // Date 객체는 0부터 시작
      const day = parseInt(value.substring(6, 8));
      
      if (year >= 1900 && year <= new Date().getFullYear() && 
          month >= 0 && month <= 11 && 
          day >= 1 && day <= 31) {
        const newDate = new Date(year, month, day);
        setBirthDate(newDate);
      }
    }
  };

  return (
    <FormContainer onSubmit={handleSubmit}>
      <StepIndicator>1단계</StepIndicator>
      <Title>사주 정보 입력</Title>
      <Description>정확한 사주풀이를 위해 태어난 정보를 입력하세요</Description>
      
      <FormGroup>
        <SectionTitle>📅 생년월일</SectionTitle>
        <BirthDateInput
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="8자리 숫자 입력 (예: 19901225)"
          value={birthDateString}
          onChange={handleBirthDateChange}
          maxLength={8}
        />
        
        <LunarOption>
          <input 
            type="checkbox" 
            id="lunar" 
            checked={isLunar}
            onChange={(e) => setIsLunar(e.target.checked)}
          />
          <LunarLabel htmlFor="lunar">음력 생일입니다</LunarLabel>
        </LunarOption>
      </FormGroup>

      <FormGroup>
        <SectionTitleContainer>
          <SectionTitle>⏰ 태어난 시간</SectionTitle>
          <InfoIconButton 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowTooltip(!showTooltip);
            }}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            type="button"
          >
            ℹ️
            {showTooltip && (
              <Tooltip>
                사주 정보는 가능한 정확히 입력해 주세요.
                시간은 태어난 시간대에 해당하는 시(時)를 선택하세요.
              </Tooltip>
            )}
          </InfoIconButton>
        </SectionTitleContainer>
        <TimeSlotContainer>
          {timeSlots.map((slot) => (
            <TimeSlotOption
              key={slot.id}
              isSelected={selectedTimeSlot === slot.id}
              onClick={() => handleTimeSlotSelect(slot.id)}
              isUnknown={slot.id === 'unknown'}
              type="button" // 버튼 타입을 명시적으로 지정하여 form submit 방지
            >
              <TimeSlotName>{slot.name}</TimeSlotName>
              <TimeSlotLabel>{slot.label}</TimeSlotLabel>
            </TimeSlotOption>
          ))}
        </TimeSlotContainer>
        <TimeNote>정확한 시간을 모르는 경우 '모름'을 선택하세요.</TimeNote>
      </FormGroup>

      <FormGroup>
        <SectionTitle htmlFor="gender">👤 성별</SectionTitle>
        <GenderSelection>
          <GenderOption
            isSelected={gender === 'male'}
            onClick={() => setGender('male')}
            type="button"
          >
            <GenderIcon>👨</GenderIcon>
            <GenderText>남성</GenderText>
          </GenderOption>
          <GenderOption
            isSelected={gender === 'female'}
            onClick={() => setGender('female')}
            type="button"
          >
            <GenderIcon>👩</GenderIcon>
            <GenderText>여성</GenderText>
          </GenderOption>
        </GenderSelection>
      </FormGroup>

      {/* 사주 정보 표시 섹션 개선 */}
      {sajuText && (
        <SajuBox>
          <SajuTitle>🔮 사주 정보</SajuTitle>
          <SajuDisplay>
            <SajuText>{sajuText.korean}</SajuText>
            <SajuHanja>{sajuText.hanja}</SajuHanja>
          </SajuDisplay>
          <SajuDescription>
            위 사주는 입력하신 정보를 기반으로 한 간략한 사주 정보입니다.
            실제 사주 계산에는 더 복잡한 역법과 계산법이 사용됩니다.
          </SajuDescription>
        </SajuBox>
      )}

      <SubmitButton type="submit">다음 단계</SubmitButton>
    </FormContainer>
  );
};

// 사주 정보 표시를 위한 스타일 컴포넌트
const SajuBox = styled.div`
  background-color: rgba(74, 21, 81, 0.1);
  border: 1px solid rgba(107, 70, 193, 0.3);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  text-align: center;
`;
SajuBox.displayName = 'BirthForm_SajuBox';

const SajuTitle = styled.h3`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 1rem;
`;
SajuTitle.displayName = 'BirthForm_SajuTitle';

const SajuDisplay = styled.div`
  background-color: rgba(107, 70, 193, 0.2);
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1rem;
`;
SajuDisplay.displayName = 'BirthForm_SajuDisplay';

const SajuText = styled.p`
  font-size: 1.5rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  letter-spacing: 3px;
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
`;
SajuText.displayName = 'BirthForm_SajuText';

const SajuHanja = styled.p`
  font-size: 0.9rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 2px;
  margin: 0;
  line-height: 1.2;
`;
SajuHanja.displayName = 'BirthForm_SajuHanja';

const SajuDescription = styled.p`
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.4;
  margin: 0;
`;
SajuDescription.displayName = 'BirthForm_SajuDescription';

// 기존 스타일 컴포넌트들
const FormContainer = styled.form`
  max-width: 500px;
  margin: 0 auto;
  padding: 0.5rem;
  background-color: transparent;
  border-radius: 12px;
`;
FormContainer.displayName = 'BirthForm_FormContainer';

const StepIndicator = styled.div`
  background-color: rgba(107, 70, 193, 0.6);
  color: white;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  text-align: center;
  margin-bottom: 1rem;
  width: fit-content;
  margin-left: auto;
  margin-right: auto;
`;
StepIndicator.displayName = 'BirthForm_StepIndicator';

const Title = styled.h2`
  color: white;
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
  text-align: center;
  text-shadow: 0 0 10px rgba(107, 70, 193, 0.5);
`;
Title.displayName = 'BirthForm_Title';

const Description = styled.p`
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  margin-bottom: 1.5rem;
  text-align: center;
`;
Description.displayName = 'BirthForm_Description';

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;
FormGroup.displayName = 'BirthForm_FormGroup';

const SectionTitle = styled.label`
  display: block;
  font-size: 1.1rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 0.5rem;
`;
SectionTitle.displayName = 'BirthForm_SectionTitle';

const BirthDateInput = styled.input`
  width: 100%;
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid rgba(107, 70, 193, 0.5);
  border-radius: 8px;
  outline: none;
  transition: border-color 0.3s;
  cursor: pointer;
  background-color: rgba(0, 0, 0, 0.2);
  color: white;

  &:focus {
    border-color: #9f7aea;
    box-shadow: 0 0 0 2px rgba(159, 122, 234, 0.2);
  }
`;
BirthDateInput.displayName = 'BirthForm_BirthDateInput';

const TimeSlotContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  
  @media (max-width: 600px) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @media (max-width: 400px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;
TimeSlotContainer.displayName = 'BirthForm_TimeSlotContainer';

const TimeSlotOption = styled.button<{ isSelected: boolean; isUnknown: boolean }>`
  padding: 0.4rem 0.2rem;
  background-color: ${props => props.isSelected ? 
    'rgba(107, 70, 193, 0.7)' 
    : 'rgba(0, 0, 0, 0.2)'};
  border: 1px solid ${props => props.isSelected ? 
    '#9f7aea' 
    : 'rgba(107, 70, 193, 0.3)'};
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  color: white;
  
  &:hover {
    background-color: ${props => props.isSelected ? 'rgba(107, 70, 193, 0.8)' : 'rgba(107, 70, 193, 0.3)'};
  }
`;
TimeSlotOption.displayName = 'BirthForm_TimeSlotOption';

const TimeSlotName = styled.span`
  font-weight: 600;
  font-size: 0.95rem;
  margin-bottom: 0.2rem;
`;
TimeSlotName.displayName = 'BirthForm_TimeSlotName';

const TimeSlotLabel = styled.span`
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.8);
`;
TimeSlotLabel.displayName = 'BirthForm_TimeSlotLabel';

const TimeNote = styled.p`
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 0.5rem;
`;
TimeNote.displayName = 'BirthForm_TimeNote';

const GenderSelection = styled.div`
  display: flex;
  gap: 1rem;
`;
GenderSelection.displayName = 'BirthForm_GenderSelection';

const GenderOption = styled.button<{ isSelected: boolean }>`
  flex: 1;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.isSelected ? 'rgba(107, 70, 193, 0.7)' : 'rgba(0, 0, 0, 0.2)'};
  border: 1px solid ${props => props.isSelected ? '#9f7aea' : 'rgba(107, 70, 193, 0.3)'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;

  &:hover {
    background-color: ${props => props.isSelected ? 'rgba(107, 70, 193, 0.8)' : 'rgba(107, 70, 193, 0.3)'};
  }
`;
GenderOption.displayName = 'BirthForm_GenderOption';

const GenderIcon = styled.span`
  font-size: 2rem;
  margin-bottom: 0.5rem;
`;
GenderIcon.displayName = 'BirthForm_GenderIcon';

const GenderText = styled.span`
  font-size: 1rem;
  font-weight: 500;
`;
GenderText.displayName = 'BirthForm_GenderText';

const LunarOption = styled.div`
  display: flex;
  align-items: center;
  margin-top: 0.5rem;
`;
LunarOption.displayName = 'BirthForm_LunarOption';

const LunarLabel = styled.label`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.9);
  margin-left: 0.5rem;
  cursor: pointer;
`;
LunarLabel.displayName = 'BirthForm_LunarLabel';

const SectionTitleContainer = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
`;
SectionTitleContainer.displayName = 'BirthForm_SectionTitleContainer';

const InfoIconButton = styled.button`
  background: none;
  border: none;
  font-size: 1rem;
  opacity: 0.6;
  cursor: pointer;
  position: relative;
  padding: 0;
  margin-bottom: 0.5rem;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 1;
  }
`;
InfoIconButton.displayName = 'BirthForm_InfoIconButton';

const Tooltip = styled.div`
  position: absolute;
  top: -70px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.85rem;
  z-index: 1000;
  line-height: 1.5;
  width: 280px;
  max-width: 90vw;
  text-align: left;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  
  @media (max-width: 768px) {
    width: 250px;
    font-size: 0.8rem;
    padding: 0.6rem;
    top: -65px;
  }
  
  @media (max-width: 480px) {
    width: 220px;
    left: -100px;
    transform: none;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 6px solid transparent;
    border-top-color: rgba(0, 0, 0, 0.9);
    
    @media (max-width: 480px) {
      left: 120px;
    }
  }
`;
Tooltip.displayName = 'BirthForm_Tooltip';

const SubmitButton = styled.button`
  width: 100%;
  padding: 0.5rem;
  background-color: #6b46c1;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #9f7aea;
  }
`;
SubmitButton.displayName = 'BirthForm_SubmitButton';

export default BirthForm; 