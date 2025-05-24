"use client";

import React, { useEffect, useState } from "react";

import { BirthInfo } from "../types";

interface BirthFormProps {
  onSubmit: (birthInfo: BirthInfo) => void;
}

// 12시신 정보
interface TimeSlot {
  id: string;
  name: string;
  label: string;
  hanja: string;
  hours: [number, number];
}

// 12시신 데이터
const timeSlots: TimeSlot[] = [
  {
    id: "rat",
    name: "🐭 자시",
    label: "자(子) 23:00-01:00",
    hanja: "子",
    hours: [23, 1],
  },
  {
    id: "ox",
    name: "🐮 축시",
    label: "축(丑) 01:00-03:00",
    hanja: "丑",
    hours: [1, 3],
  },
  {
    id: "tiger",
    name: "🐯 인시",
    label: "인(寅) 03:00-05:00",
    hanja: "寅",
    hours: [3, 5],
  },
  {
    id: "rabbit",
    name: "🐰 묘시",
    label: "묘(卯) 05:00-07:00",
    hanja: "卯",
    hours: [5, 7],
  },
  {
    id: "dragon",
    name: "🐲 진시",
    label: "진(辰) 07:00-09:00",
    hanja: "辰",
    hours: [7, 9],
  },
  {
    id: "snake",
    name: "🐍 사시",
    label: "사(巳) 09:00-11:00",
    hanja: "巳",
    hours: [9, 11],
  },
  {
    id: "horse",
    name: "🐴 오시",
    label: "오(午) 11:00-13:00",
    hanja: "午",
    hours: [11, 13],
  },
  {
    id: "sheep",
    name: "🐑 미시",
    label: "미(未) 13:00-15:00",
    hanja: "未",
    hours: [13, 15],
  },
  {
    id: "monkey",
    name: "🐵 신시",
    label: "신(申) 15:00-17:00",
    hanja: "申",
    hours: [15, 17],
  },
  {
    id: "rooster",
    name: "🐔 유시",
    label: "유(酉) 17:00-19:00",
    hanja: "酉",
    hours: [17, 19],
  },
  {
    id: "dog",
    name: "🐶 술시",
    label: "술(戌) 19:00-21:00",
    hanja: "戌",
    hours: [19, 21],
  },
  {
    id: "pig",
    name: "🐷 해시",
    label: "해(亥) 21:00-23:00",
    hanja: "亥",
    hours: [21, 23],
  },
  {
    id: "unknown",
    name: "🤷 모름",
    label: "시간 모름",
    hanja: "?",
    hours: [0, 0],
  },
];

// 천간지지 데이터
const celestialStems = [
  "甲",
  "乙",
  "丙",
  "丁",
  "戊",
  "己",
  "庚",
  "辛",
  "壬",
  "癸",
];
const earthlyBranches = [
  "子",
  "丑",
  "寅",
  "卯",
  "辰",
  "巳",
  "午",
  "未",
  "申",
  "酉",
  "戌",
  "亥",
];

// 천간지지 한글 청음 데이터 추가
const celestialStemsKorean = [
  "갑",
  "을",
  "병",
  "정",
  "무",
  "기",
  "경",
  "신",
  "임",
  "계",
];
const earthlyBranchesKorean = [
  "자",
  "축",
  "인",
  "묘",
  "진",
  "사",
  "오",
  "미",
  "신",
  "유",
  "술",
  "해",
];

// 년간지 계산 - 한글과 한자 모두 반환
const getYearPillar = (year: number): { korean: string; hanja: string } => {
  const stemIndex = (year - 4) % 10;
  const branchIndex = (year - 4) % 12;
  return {
    korean: `${celestialStemsKorean[stemIndex]}${earthlyBranchesKorean[branchIndex]}`,
    hanja: `${celestialStems[stemIndex]}${earthlyBranches[branchIndex]}`,
  };
};

// 월간지 계산 - 한글과 한자 모두 반환
const getMonthPillar = (
  month: number,
  year: number,
): { korean: string; hanja: string } => {
  // 월지(지지)는 1월=인(寅)부터 시작
  const branchIndex = (month + 1) % 12;

  // 월간(천간)은 연간에 따라 달라짐
  const yearStemIndex = (year - 4) % 10;
  // 연간이 갑(甲)이나 기(己)이면 월간은 병(丙)부터 시작
  const baseIndex = (yearStemIndex % 5) * 2;
  const stemIndex = (baseIndex + month - 1) % 10;

  return {
    korean: `${celestialStemsKorean[stemIndex]}${earthlyBranchesKorean[branchIndex]}`,
    hanja: `${celestialStems[stemIndex]}${earthlyBranches[branchIndex]}`,
  };
};

// 일간지 계산 - 한글과 한자 모두 반환
const getDayPillar = (
  year: number,
  month: number,
  day: number,
): { korean: string; hanja: string } => {
  // 실제 계산에서는 역법에 따른 정확한 계산이 필요합니다
  // 여기서는 단순화된 공식을 사용합니다
  const baseDate = new Date(1900, 0, 1);
  const targetDate = new Date(year, month - 1, day);
  const daysDiff = Math.floor(
    (targetDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  const stemIndex = (daysDiff + 9) % 10;
  const branchIndex = (daysDiff + 3) % 12;

  return {
    korean: `${celestialStemsKorean[stemIndex]}${earthlyBranchesKorean[branchIndex]}`,
    hanja: `${celestialStems[stemIndex]}${earthlyBranches[branchIndex]}`,
  };
};

// 시간지 계산 - 한글과 한자 모두 반환
const getTimePillar = (
  hour: number,
  dayStemnIndex: number,
): { korean: string; hanja: string } => {
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
    hanja: `${celestialStems[stemIndex]}${earthlyBranches[adjustedBranchIndex]}`,
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
  const [birthDateString, setBirthDateString] = useState<string>("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [isLunar, setIsLunar] = useState<boolean>(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [sajuText, setSajuText] = useState<{ korean: string; hanja: string }>({
    korean: "",
    hanja: "",
  });
  const [showTooltip, setShowTooltip] = useState<boolean>(false);

  // 사주 계산 및 표시
  useEffect(() => {
    const year = birthDate.getFullYear();
    const month = birthDate.getMonth() + 1;
    const day = birthDate.getDate();

    let hour = 0;
    // "모름"이 아닌 경우에만 시간 설정
    if (selectedTimeSlot !== "unknown") {
      const timeSlot = timeSlots.find((slot) => slot.id === selectedTimeSlot);
      if (timeSlot) {
        // 해당 시간대의 중간 시간으로 설정 (자시는 특별 처리)
        if (timeSlot.id === "rat") {
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
      korean: timePillar
        ? `${yearPillar.korean}년 ${monthPillar.korean}월 ${dayPillar.korean}일 ${timePillar.korean}시`
        : `${yearPillar.korean}년 ${monthPillar.korean}월 ${dayPillar.korean}일`,
      hanja: timePillar
        ? `${yearPillar.hanja}년 ${monthPillar.hanja}월 ${dayPillar.hanja}일 ${timePillar.hanja}시`
        : `${yearPillar.hanja}년 ${monthPillar.hanja}월 ${dayPillar.hanja}일`,
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
      const timeSlot = timeSlots.find((slot) => slot.id === selectedTimeSlot);
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
      calendar: isLunar ? "lunar" : "solar",
      timeSlot: selectedTimeSlot,
    };

    onSubmit(birthInfo);
  };

  // 시간 슬롯 선택 핸들러 - 버튼 클릭시 바로 submit되지 않도록 수정
  const handleTimeSlotSelect = (slotId: string) => {
    setSelectedTimeSlot(slotId);
  };

  // 생년월일 문자열 입력 핸들러
  const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // 숫자만 허용
    setBirthDateString(value);

    // 8자리가 입력되면 Date 객체로 변환
    if (value.length === 8) {
      const year = parseInt(value.substring(0, 4));
      const month = parseInt(value.substring(4, 6)) - 1; // Date 객체는 0부터 시작
      const day = parseInt(value.substring(6, 8));

      if (
        year >= 1900 &&
        year <= new Date().getFullYear() &&
        month >= 0 &&
        month <= 11 &&
        day >= 1 &&
        day <= 31
      ) {
        const newDate = new Date(year, month, day);
        setBirthDate(newDate);
      }
    }
  };

  return (
    <div className="max-w-lg mx-auto p-2 xs:p-6 bg-transparent rounded-xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 단계 표시 */}
        <div className="bg-purple-600/60 text-white text-sm font-semibold py-1.5 px-3 rounded-2xl text-center w-fit mx-auto">
          1단계
        </div>

        {/* 제목 및 설명 */}
        <div className="text-center">
          <h2
            className="text-3xl font-bold text-white mb-2"
            style={{ textShadow: "0 0 10px rgba(107, 70, 193, 0.5)" }}
          >
            사주 정보 입력
          </h2>
          <p className="text-white/90 text-base">
            정확한 사주풀이를 위해 태어난 정보를 입력하세요
          </p>
        </div>

        {/* 생년월일 입력 */}
        <div className="space-y-3">
          <label className="block text-lg font-bold text-white/90">
            📅 생년월일
          </label>
          <input
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="8자리 숫자 입력 (예: 19901225)"
            value={birthDateString}
            onChange={handleBirthDateChange}
            maxLength={8}
            className="w-full p-2 text-base border border-purple-500/50 rounded-lg outline-none transition-all duration-300 bg-black/20 text-white focus:border-purple-400 focus:shadow-[0_0_0_2px_rgba(159,122,234,0.2)]"
          />

          <div className="flex items-center mt-2">
            <input
              type="checkbox"
              id="lunar"
              checked={isLunar}
              onChange={(e) => setIsLunar(e.target.checked)}
              className="mr-2"
            />
            <label
              htmlFor="lunar"
              className="text-sm text-white/90 cursor-pointer"
            >
              음력 생일입니다
            </label>
          </div>
        </div>

        {/* 태어난 시간 */}
        <div className="space-y-3">
          <div className="flex items-end gap-2">
            <label className="block text-lg font-bold text-white/90">
              ⏰ 태어난 시간
            </label>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowTooltip(!showTooltip);
              }}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              type="button"
              className="text-base opacity-60 hover:opacity-100 transition-opacity relative pb-2"
            >
              ℹ️
              {showTooltip && (
                <div className="absolute top-[-70px] left-1/2 transform -translate-x-1/2 bg-black/90 text-white p-3 rounded-lg text-xs z-50 leading-relaxed w-72 max-w-[90vw] text-left shadow-lg md:w-64 md:text-xs md:p-2.5 md:top-[-65px] sm:w-56 sm:left-[-100px] sm:transform-none after:content-[''] after:absolute after:top-full after:left-1/2 after:transform after:-translate-x-1/2 after:border-6 after:border-transparent after:border-t-black/90 sm:after:left-[120px]">
                  사주 정보는 가능한 정확히 입력해 주세요. 시간은 태어난
                  시간대에 해당하는 시(時)를 선택하세요.
                </div>
              )}
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2 md:grid-cols-3 sm:grid-cols-2">
            {timeSlots.map((slot) => (
              <button
                key={slot.id}
                type="button"
                onClick={() => handleTimeSlotSelect(slot.id)}
                className={`p-2 border rounded-md cursor-pointer transition-all duration-200 flex flex-col items-center w-full text-white ${
                  selectedTimeSlot === slot.id
                    ? "bg-purple-600/70 border-purple-400"
                    : "bg-black/20 border-purple-600/30 hover:bg-purple-600/30"
                }`}
              >
                <span className="font-semibold text-sm mb-1">{slot.name}</span>
                <span className="text-xs text-white/80">{slot.label}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-white/70 mt-2">
            정확한 시간을 모르는 경우 '모름'을 선택하세요.
          </p>
        </div>

        {/* 성별 선택 */}
        <div className="space-y-3">
          <label className="block text-lg font-bold text-white/90">
            👤 성별
          </label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setGender("male")}
              className={`flex-1 p-2 flex flex-col items-center justify-center border rounded-lg cursor-pointer transition-all duration-300 text-white ${
                gender === "male"
                  ? "bg-purple-600/70 border-purple-400"
                  : "bg-black/20 border-purple-600/30 hover:bg-purple-600/30"
              }`}
            >
              <span className="text-2xl mb-2">👨</span>
              <span className="text-base font-medium">남성</span>
            </button>
            <button
              type="button"
              onClick={() => setGender("female")}
              className={`flex-1 p-2 flex flex-col items-center justify-center border rounded-lg cursor-pointer transition-all duration-300 text-white ${
                gender === "female"
                  ? "bg-purple-600/70 border-purple-400"
                  : "bg-black/20 border-purple-600/30 hover:bg-purple-600/30"
              }`}
            >
              <span className="text-2xl mb-2">👩</span>
              <span className="text-base font-medium">여성</span>
            </button>
          </div>
        </div>

        {/* 사주 정보 표시 */}
        {sajuText.korean && (
          <div className="bg-purple-900/10 border border-purple-600/30 rounded-lg p-4 text-center">
            <h3 className="text-lg text-white/90 mb-4">🔮 사주 정보</h3>
            <div className="bg-purple-600/20 rounded-md p-4 mb-4">
              <p className="text-xl font-semibold text-white/95 tracking-widest mb-2 leading-relaxed">
                {sajuText.korean}
              </p>
              <p className="text-sm font-normal text-white/70 tracking-wider leading-tight">
                {sajuText.hanja}
              </p>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              위 사주는 입력하신 정보를 기반으로 한 간략한 사주 정보입니다. 실제
              사주 계산에는 더 복잡한 역법과 계산법이 사용됩니다.
            </p>
          </div>
        )}

        {/* 제출 버튼 */}
        <button
          type="submit"
          className="w-full bg-purple-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors text-base"
        >
          다음 단계
        </button>
      </form>
    </div>
  );
};

export default BirthForm;
