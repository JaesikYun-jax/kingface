import React, { useState } from 'react';
import { BirthInfo } from '../types';
import styled from '@emotion/styled';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ko } from 'date-fns/locale';

interface BirthFormProps {
  onSubmit: (birthInfo: BirthInfo) => void;
}

const BirthForm: React.FC<BirthFormProps> = ({ onSubmit }) => {
  // 현재 날짜와 시간 생성
  const now = new Date();
  
  // Date 객체로 관리
  const [birthDate, setBirthDate] = useState<Date>(now);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [isLunar, setIsLunar] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Date 객체에서 BirthInfo로 변환
    const birthInfo: BirthInfo = {
      year: birthDate.getFullYear(),
      month: birthDate.getMonth() + 1,
      day: birthDate.getDate(),
      hour: birthDate.getHours(),
      minute: birthDate.getMinutes(),
      gender,
      calendar: isLunar ? 'lunar' : 'solar'
    };
    
    onSubmit(birthInfo);
  };

  return (
    <FormContainer onSubmit={handleSubmit}>
      <Title>사주 정보 입력</Title>
      <Description>정확한 사주 정보를 입력하세요</Description>
      
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
        <TimePickerWrapper>
          <DatePicker
            selected={birthDate}
            onChange={(date: Date | null) => date && setBirthDate(date)}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={5}
            timeCaption="시간"
            dateFormat="HH:mm"
            locale={ko}
            className="date-picker-input"
          />
          <ClockIcon>🕒</ClockIcon>
        </TimePickerWrapper>
        <TimeNote>24시간제로 입력하세요. (예: 오후 3시는 15:00)</TimeNote>
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
          정확한 운세를 위해 출생 정보를 정확하게 입력해 주세요.
          시간은 가능한 한 정확하게 입력하는 것이 좋습니다.
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

const TimePickerWrapper = styled.div`
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

const ClockIcon = styled.span`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.2rem;
  color: #6b46c1;
  pointer-events: none;
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