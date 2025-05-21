import React, { useState } from 'react';
import { BirthInfo } from '../types';
import styled from '@emotion/styled';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ko } from 'date-fns/locale';

interface BirthFormProps {
  onSubmit: (birthInfo: BirthInfo) => void;
}

// 12시신 정보
interface TimeSlot {
  id: string;
  name: string;
  label: string;
  hours: [number, number]; // 시작 시간과 끝 시간
}

// 12시신 데이터
const timeSlots: TimeSlot[] = [
  { id: 'rat', name: '자시', label: '자(子) 23:00-01:00', hours: [23, 1] },
  { id: 'ox', name: '축시', label: '축(丑) 01:00-03:00', hours: [1, 3] },
  { id: 'tiger', name: '인시', label: '인(寅) 03:00-05:00', hours: [3, 5] },
  { id: 'rabbit', name: '묘시', label: '묘(卯) 05:00-07:00', hours: [5, 7] },
  { id: 'dragon', name: '진시', label: '진(辰) 07:00-09:00', hours: [7, 9] },
  { id: 'snake', name: '사시', label: '사(巳) 09:00-11:00', hours: [9, 11] },
  { id: 'horse', name: '오시', label: '오(午) 11:00-13:00', hours: [11, 13] },
  { id: 'sheep', name: '미시', label: '미(未) 13:00-15:00', hours: [13, 15] },
  { id: 'monkey', name: '신시', label: '신(申) 15:00-17:00', hours: [15, 17] },
  { id: 'rooster', name: '유시', label: '유(酉) 17:00-19:00', hours: [17, 19] },
  { id: 'dog', name: '술시', label: '술(戌) 19:00-21:00', hours: [19, 21] },
  { id: 'pig', name: '해시', label: '해(亥) 21:00-23:00', hours: [21, 23] },
  { id: 'unknown', name: '모름', label: '시간 모름', hours: [0, 0] }
];

const BirthForm: React.FC<BirthFormProps> = ({ onSubmit }) => {
  // 현재 날짜와 시간 생성
  const now = new Date();
  
  // 상태 관리
  const [birthDate, setBirthDate] = useState<Date>(now);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [isLunar, setIsLunar] = useState<boolean>(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("unknown");

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

  return (
    <FormContainer onSubmit={handleSubmit}>
      <Title>사주 정보 입력</Title>
      <Description>정확한 사주풀이를 위해 태어난 정보를 입력하세요</Description>
      
      <FormGroup>
        <Label>생년월일</Label>
        <DatePickerWrapper>
          <DatePicker
            selected={birthDate}
            onChange={(date: Date | null) => date && setBirthDate(date)}
            dateFormat="yyyy년 MM월 dd일"
            locale={ko}
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            yearDropdownItemNumber={100}
            scrollableYearDropdown
            className="date-picker-input"
          />
          <CalendarIcon>📅</CalendarIcon>
        </DatePickerWrapper>
      </FormGroup>

      <FormGroup>
        <Label>태어난 시간</Label>
        <TimeSlotContainer>
          {timeSlots.map((slot) => (
            <TimeSlotOption
              key={slot.id}
              isSelected={selectedTimeSlot === slot.id}
              onClick={() => setSelectedTimeSlot(slot.id)}
              isUnknown={slot.id === 'unknown'}
            >
              <TimeSlotName>{slot.name}</TimeSlotName>
              <TimeSlotLabel>{slot.label}</TimeSlotLabel>
            </TimeSlotOption>
          ))}
        </TimeSlotContainer>
        <TimeNote>정확한 시간을 모르는 경우 '모름'을 선택하세요.</TimeNote>
      </FormGroup>

      <FormGroup>
        <Label htmlFor="gender">성별</Label>
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

      <FormGroup>
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

      <InfoBox>
        <InfoIcon>ℹ️</InfoIcon>
        <InfoText>
          사주 정보는 가능한 정확히 입력해 주세요.
          시간은 태어난 시간대에 해당하는 시(時)를 선택하세요.
        </InfoText>
      </InfoBox>

      <SubmitButton type="submit">다음 단계</SubmitButton>
    </FormContainer>
  );
};

const FormContainer = styled.form`
  max-width: 500px;
  margin: 0 auto;
  padding: 2rem;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  color: #333;
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
  text-align: center;
`;

const Description = styled.p`
  color: #666;
  font-size: 1rem;
  margin-bottom: 2rem;
  text-align: center;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-size: 1rem;
  color: #333;
  margin-bottom: 0.5rem;
`;

const DatePickerWrapper = styled.div`
  position: relative;
  width: 100%;

  .date-picker-input {
    width: 100%;
    padding: 0.8rem;
    font-size: 1rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    outline: none;
    transition: border-color 0.3s;
    cursor: pointer;
    background-color: white;
    padding-right: 2.5rem;

    &:focus {
      border-color: #6b46c1;
    }
  }
`;

const CalendarIcon = styled.span`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.2rem;
  color: #6b46c1;
  pointer-events: none;
`;

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

const TimeSlotOption = styled.button<{ isSelected: boolean; isUnknown: boolean }>`
  padding: 0.6rem 0.2rem;
  background-color: ${props => props.isSelected ? 
    (props.isUnknown ? '#f3e8ff' : '#f3e8ff') 
    : '#f8f9fa'};
  border: 2px solid ${props => props.isSelected ? 
    (props.isUnknown ? '#6b46c1' : '#6b46c1') 
    : '#e2e8f0'};
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  
  &:hover {
    background-color: ${props => props.isSelected ? '#f3e8ff' : '#edf2f7'};
  }
`;

const TimeSlotName = styled.span`
  font-weight: 600;
  font-size: 0.95rem;
  margin-bottom: 0.2rem;
`;

const TimeSlotLabel = styled.span`
  font-size: 0.7rem;
  color: #4a5568;
`;

const TimeNote = styled.p`
  font-size: 0.8rem;
  color: #666;
  margin-top: 0.5rem;
`;

const GenderSelection = styled.div`
  display: flex;
  gap: 1rem;
`;

const GenderOption = styled.button<{ isSelected: boolean }>`
  flex: 1;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.isSelected ? '#f3e8ff' : '#f8f9fa'};
  border: 2px solid ${props => props.isSelected ? '#6b46c1' : '#e2e8f0'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: ${props => props.isSelected ? '#f3e8ff' : '#edf2f7'};
  }
`;

const GenderIcon = styled.span`
  font-size: 2rem;
  margin-bottom: 0.5rem;
`;

const GenderText = styled.span`
  font-size: 1rem;
  font-weight: 500;
`;

const LunarOption = styled.div`
  display: flex;
  align-items: center;
  margin-top: 0.5rem;
`;

const LunarLabel = styled.label`
  font-size: 0.9rem;
  color: #4a5568;
  margin-left: 0.5rem;
  cursor: pointer;
`;

const InfoBox = styled.div`
  background-color: #f3f4f6;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: flex-start;
`;

const InfoIcon = styled.span`
  font-size: 1.2rem;
  margin-right: 0.5rem;
  margin-top: 0.1rem;
`;

const InfoText = styled.p`
  font-size: 0.9rem;
  color: #4a5568;
  line-height: 1.5;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 1rem;
  background-color: #6b46c1;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #553c9a;
  }
`;

export default BirthForm; 