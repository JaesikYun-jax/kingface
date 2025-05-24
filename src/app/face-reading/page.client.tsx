"use client";

import FaceCapture from "@/components/FaceCapture";
import FaceReadingResult from "@/components/FaceReadingResult";
import PlanSelector from "@/components/PlanSelector";
import {
  FaceReadingResult as FaceReadingResultType,
  PlanType,
  ServicePlanConfig,
} from "@/types";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";

import { analyzeFaceReadingAction } from "./actions";

enum Step {
  PLAN_CHECK = "PLAN_CHECK",
  PASSWORD = "PASSWORD",
  CAPTURE = "CAPTURE",
  LOADING = "LOADING",
  RESULT = "RESULT",
}

// 로딩 중 보여줄 위트있는 메시지 배열
const wittyLoadingMessages = [
  "얼굴의 운명선을 분석 중...",
  "이마와 눈의 기운을 읽는 중...",
  "인중과 입술에 담긴 재능을 발견 중...",
  "귀와 턱의 복(福)을 해석 중...",
  "관상학의 고서를 참고하는 중...",
  "전생의 인연을 확인하는 중...",
  "얼굴에 숨겨진 운명의 코드를 해독 중...",
  "눈썹 위치로 인생 운세를 계산 중...",
  "이목구비의 조화를 분석 중...",
  "귀신지능(鬼神智能)의 힘을 빌리는 중...",
  "코와 입술의 재물선을 살피는 중...",
  "천기(天機)와 지기(地機)를 읽는 중...",
];

// 비밀번호 검증 로직 - 직접적인 비밀번호 노출 방지
const verifyPasswordSecurely = (input: string): boolean => {
  // "cat" 문자열을 직접 비교하지 않고 다양한 방법으로 검증
  // 단순히 문자열 비교보다 복잡한 방식 사용
  const hash = btoa(input.toLowerCase()); // 인코딩
  // 'cat'을 base64로 인코딩한 값은 'Y2F0'
  return hash === "Y2F0";
};

export default function FaceReadingClient({
  currentPlan,
  servicePlanConfig,
}: {
  currentPlan: PlanType;
  servicePlanConfig: ServicePlanConfig;
}) {
  const [currentStep, setCurrentStep] = useState<Step>(Step.PLAN_CHECK);
  const [result, setResult] = useState<FaceReadingResultType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [currentLoadingMessage, setCurrentLoadingMessage] = useState<string>(
    wittyLoadingMessages[0],
  );
  const [password, setPassword] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordAttempts, setPasswordAttempts] = useState<number>(0);
  const router = useRouter();
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 컴포넌트 마운트 시 플랜 확인
  useEffect(() => {
    // 관상 분석 기능 사용 가능 여부 확인
    if (currentPlan === PlanType.PREMIUM) {
      // 플랜이 확인되면 바로 캡처 단계가 아닌 비밀번호 단계로 이동
      setCurrentStep(Step.PASSWORD);
    }
  }, [currentPlan, servicePlanConfig]);

  // 로딩 중 메시지 변경 및 프로그레스 바 업데이트를 위한 효과
  useEffect(() => {
    if (currentStep === Step.LOADING) {
      setLoadingProgress(0); // 로딩 시작 시 프로그레스 0으로 초기화
      let currentProgress = 0;
      let phraseIndex = 0;
      setCurrentLoadingMessage(wittyLoadingMessages[phraseIndex]); // 초기 로딩 메시지 설정

      progressIntervalRef.current = setInterval(() => {
        currentProgress += 2; // 진행 속도를 2배로 (50ms 마다 2씩 증가 -> 100%까지 약 2.5초)
        if (currentProgress <= 100) {
          setLoadingProgress(currentProgress);
          // 메시지 변경은 1초 주기로 유지 (20 * 50ms = 1000ms)
          if (currentProgress % 20 === 0 && currentProgress < 100) {
            phraseIndex = (phraseIndex + 1) % wittyLoadingMessages.length;
            setCurrentLoadingMessage(wittyLoadingMessages[phraseIndex]);
          }
        } else {
          // 100% 도달 시 실제로는 API 응답 후 처리되므로 여기서 clear하지 않을 수 있음
          // 단, API가 매우 빠를 경우를 대비해 clearInterval은 유지
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
          }
        }
      }, 50);
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [currentStep]);

  // 플랜 업그레이드 처리
  const handlePlanSelect = (planType: PlanType) => {
    // 관상 분석 기능 사용 가능 여부 다시 확인
    if (planType === PlanType.PREMIUM) {
      // 플랜이 확인되면 바로 캡처 단계가 아닌 비밀번호 단계로 이동
      setCurrentStep(Step.PASSWORD);
    }
  };

  // 비밀번호 검증 처리
  const handlePasswordSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordError(null);

    // 비밀번호 시도 횟수 증가
    const newAttempts = passwordAttempts + 1;
    setPasswordAttempts(newAttempts);

    // 최대 시도 횟수 제한 (5회)
    if (newAttempts > 5) {
      setPasswordError("시도 횟수를 초과했습니다. 나중에 다시 시도해주세요.");
      // 3초 후 홈으로 리다이렉트
      setTimeout(() => router.push("/"), 3000);
      return;
    }

    // 비밀번호 검증
    if (verifyPasswordSecurely(password)) {
      // 검증 성공 시 캡처 단계로 이동
      setCurrentStep(Step.CAPTURE);
      // 시도 횟수 및 비밀번호 초기화
      setPasswordAttempts(0);
      setPassword("");
    } else {
      // 검증 실패 시 에러 메시지 표시
      setPasswordError("비밀번호가 일치하지 않습니다. 다시 시도해주세요.");
    }
  };

  // 이미지 캡처 처리 함수
  const handleCapture = useCallback(
    async (imageSrc: string) => {
      setCurrentStep(Step.LOADING);
      setError(null);

      try {
        if (currentPlan !== PlanType.PREMIUM) {
          if (progressIntervalRef.current)
            clearInterval(progressIntervalRef.current);
          setError("관상 분석은 프리미엄 플랜 전용 기능입니다.");
          setCurrentStep(Step.PLAN_CHECK);
          return;
        }

        const analysisResult = await analyzeFaceReadingAction(imageSrc);

        // API 호출 완료 후 인터벌 정리 및 프로그레스 완료 처리
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
        setLoadingProgress(100);
        setCurrentLoadingMessage(
          "분석 완료! 아이보살이 당신의 운명을 보았습니다.",
        );

        // 결과 표시 전 잠시 대기 (선택 사항, 부드러운 전환을 위해)
        setTimeout(() => {
          setResult(analysisResult);
          setCurrentStep(Step.RESULT);
        }, 500); // 0.5초 후 결과 표시
      } catch (err: any) {
        console.error("Face analysis error:", err);
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
        setLoadingProgress(0); // 오류 시 프로그레스 초기화
        setError(
          err?.message ||
            "관상 분석 중 오류가 발생했습니다. 다시 시도해 주세요.",
        );

        if (err?.message?.includes("프리미엄 플랜")) {
          setCurrentStep(Step.PLAN_CHECK);
        } else {
          setCurrentStep(Step.PASSWORD);
        }
      }
    },
    [router],
  );

  // 결과 공유 기능
  const handleShareResult = useCallback(async () => {
    if (!result) return;

    try {
      // 클립보드에 복사 - 원본 마크다운 내용과 홍보 문구 추가
      const shareText = `${result.content}\n\n------------------\n\n당신의 운명이 궁금하다면? 아이보살이 도와드립니다 💫\n⭐ kingface.difflabs.xyz ⭐`;

      await navigator.clipboard.writeText(shareText);
      alert("분석 결과가 클립보드에 복사되었습니다!");
    } catch (err) {
      console.error("Sharing failed:", err);
      alert("결과 공유에 실패했습니다.");
    }
  }, [result]);

  // 처음으로 돌아가기
  const handleReturn = useCallback(() => {
    router.push("/");
  }, [router]);

  // 다시 시작하기
  const handleRestart = useCallback(() => {
    // 다시 시작 시 비밀번호 단계로 이동
    setCurrentStep(Step.PASSWORD);
    setResult(null);
    setError(null);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-4">
      <header className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 text-shadow-purple">
          AI 관상 분석
        </h1>
        <p className="text-lg md:text-xl text-white/90">
          {currentStep === Step.PLAN_CHECK
            ? "이미지를 실제 분석해서 결과를 내기 때문에 유료 결제가 필요합니다. 믿고 맡겨주시면 열심히 분석해보겠습니다! 전통 관상학과 AI 기술로 당신의 얼굴에 담긴 운명의 비밀을 풀어드립니다."
            : "아이(AI)보살이 보는 당신의 관상과 운명"}
        </p>
      </header>

      {error && (
        <div className="bg-red-900/30 border border-red-500 text-red-200 p-3 rounded-lg text-center mb-6 font-medium">
          {error}
        </div>
      )}

      {currentStep === Step.PLAN_CHECK && (
        <div className="text-center p-8 bg-white/10 rounded-xl shadow-lg backdrop-blur-soft mx-auto border border-white/10">
          <h2 className="text-3xl font-bold text-white mb-4 text-shadow-glow">
            AI 관상 분석 서비스
          </h2>
          <p className="text-lg text-white/90 mb-6 leading-relaxed">
            5000년 전통 동양 관상학의 지혜와 현대 AI 기술을 결합하여 당신의
            얼굴에 담긴 운명과 잠재력을 창의적으로 해석해 드립니다.
          </p>

          <div className="inline-block bg-purple-200/20 text-purple-200 text-sm font-semibold py-2 px-4 rounded-full mb-6 border border-purple-200/30">
            고급 GPT-4o 모델 사용
          </div>

          <div className="flex flex-col items-center mb-8">
            <div className="text-white/90 text-base mb-3">
              ✓ 전생 이야기 해석
            </div>
            <div className="text-white/90 text-base mb-3">
              ✓ 얼굴 부위별 관상 풀이
            </div>
            <div className="text-white/90 text-base mb-3">
              ✓ 타고난 운명과 기질 분석
            </div>
            <div className="text-white/90 text-base mb-3">
              ✓ 인연과 대인관계 해석
            </div>
            <div className="text-white/90 text-base mb-3">
              ✓ 운명의 조언과 지혜
            </div>
          </div>
          <PlanSelector
            servicePlanConfig={servicePlanConfig}
            currentPlanType={currentPlan}
          />
          <button
            onClick={handleReturn}
            className="bg-transparent border-none text-purple-200 text-base underline cursor-pointer mt-6 hover:text-purple-300"
          >
            홈으로 돌아가기
          </button>
        </div>
      )}

      {/* 비밀번호 입력 폼 */}
      {currentStep === Step.PASSWORD && (
        <div className="text-center p-8 bg-white/10 rounded-xl shadow-lg backdrop-blur-soft max-w-md mx-auto border border-white/10">
          <div className="text-5xl mb-4 text-purple-200">🔒</div>
          <h3 className="text-3xl font-bold text-white mb-4 text-shadow-glow">
            보안 인증
          </h3>
          <p className="text-base text-white/90 mb-8 leading-relaxed">
            API 악용 방지를 위해 비밀번호 인증이 필요합니다. 관리자에게 문의하여
            비밀번호를 얻으세요.
          </p>

          <form
            onSubmit={handlePasswordSubmit}
            className="flex flex-col gap-4 mb-6"
          >
            <input
              type="password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
              placeholder="비밀번호를 입력하세요"
              required
              className="px-4 py-3 text-base border border-gray-300 rounded-md outline-none 
                         focus:border-purple-600 focus:shadow-[0_0_0_3px_rgba(107,70,193,0.2)]"
            />
            <button
              type="submit"
              className="bg-purple-600 text-white px-4 py-3 text-base font-semibold border-none 
                         rounded-md cursor-pointer transition-colors hover:bg-purple-700"
            >
              확인
            </button>
          </form>

          {passwordError && (
            <div className="text-red-300 mb-6 text-sm">{passwordError}</div>
          )}

          <button
            onClick={handleReturn}
            className="bg-transparent border-none text-purple-200 text-base underline cursor-pointer hover:text-purple-300"
          >
            홈으로 돌아가기
          </button>
        </div>
      )}

      {currentStep === Step.LOADING && (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <p
            className="text-2xl text-purple-200 mb-6 font-medium"
            style={{ textShadow: "0 0 8px rgba(196, 160, 250, 0.5)" }}
          >
            {currentLoadingMessage}
          </p>

          <div className="w-4/5 max-w-md h-5 bg-white/15 rounded-lg mb-6 overflow-hidden border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-blue-400 to-purple-600 rounded-lg transition-all duration-100 ease-out"
              style={{
                width: `${loadingProgress}%`,
                boxShadow: "0 0 10px rgba(102, 166, 255, 0.5)",
              }}
            />
          </div>

          <p className="text-base text-white/90 max-w-lg leading-relaxed mb-2">
            아이(AI)보살이 당신의 얼굴에서 운명의 흔적을 찾고 있습니다. 잠시만
            기다려주시면, 놀라운 전생의 이야기를 들려드릴게요!
          </p>
        </div>
      )}

      {currentStep === Step.CAPTURE && (
        <>
          <FaceCapture onCapture={handleCapture} isLoading={false} />
          <div className="bg-purple-600/20 rounded-lg p-4 mt-8 max-w-[90%] mx-auto border-l-4 border-purple-600">
            <p className="text-white/90 text-sm leading-relaxed text-left">
              전통 관상학의 지혜를 AI가 창의적으로 해석하기 위해 일반 모델보다
              더 고성능인
              <strong className="text-purple-200 font-semibold">
                {" "}
                GPT-4o 모델
              </strong>
              을 사용합니다. 사진이 명확할수록 더 흥미로운 관상 해석이
              가능합니다.
            </p>
          </div>
        </>
      )}

      {currentStep === Step.RESULT && result && (
        <div className="mt-8 p-2">
          <FaceReadingResult
            result={result}
            onRestart={handleRestart}
            onShare={handleShareResult}
            onReturn={handleReturn}
          />
        </div>
      )}

      {/* 하단 플랜 상태 표시 */}
      {currentStep !== Step.PLAN_CHECK && (
        <div className="flex justify-center mt-8 p-4">
          <div className="inline-flex items-center px-4 py-2 rounded-full font-semibold text-sm bg-blue-50 text-blue-600 border border-blue-200">
            프리미엄 플랜
          </div>
        </div>
      )}

      <div className="mt-12 pt-6 border-t border-white/10">
        <p className="text-sm text-white/60 mb-3 leading-relaxed">
          * 이 서비스는 전통 관상학을 창의적으로 해석한 엔터테인먼트
          콘텐츠입니다. 모든 해석과 이야기는 재미와 영감을 위해 제공되며, 과학적
          분석이나 확정적인 예측으로 받아들이지 마세요.
        </p>
        <p className="text-sm text-white/60 mb-3 leading-relaxed">
          * 촬영 또는 업로드한 이미지는 관상 해석을 위한 영감의 소재로만
          사용되며, 서버에 영구 저장되지 않습니다.
        </p>
      </div>
    </div>
  );
}
