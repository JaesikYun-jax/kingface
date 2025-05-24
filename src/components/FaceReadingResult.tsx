"use client";

import React from "react";

interface FaceReadingResultProps {
  result: {
    content: string;
    personalityTraits?: string[];
    overallFortune?: string;
    careerSuitability?: string;
    relationships?: string;
    advice?: string;
    imageUrl?: string;
  };
  onRestart: () => void;
  onShare: () => void;
  onReturn: () => void;
}

const FaceReadingResult: React.FC<FaceReadingResultProps> = ({
  result,
  onRestart,
  onShare,
  onReturn,
}) => {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white/10 rounded-xl backdrop-blur-soft">
      <h2 className="text-3xl font-bold text-white mb-6 text-center text-shadow-glow">
        🔮 AI 관상 분석 결과
      </h2>

      <div className="bg-purple-900/30 rounded-lg p-6 mb-6 border border-purple-500/30">
        <div className="prose prose-invert max-w-none">
          <div
            className="text-white/90 leading-relaxed whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: result.content }}
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onRestart}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
        >
          다시 분석하기
        </button>
        <button
          onClick={onShare}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          결과 공유하기
        </button>
        <button
          onClick={onReturn}
          className="px-6 py-3 bg-white/20 text-white rounded-lg font-semibold hover:bg-white/30 transition-colors"
        >
          홈으로 돌아가기
        </button>
      </div>

      <div className="mt-8 pt-6 border-t border-white/10">
        <p className="text-white/60 text-sm text-center">
          * 이 분석 결과는 AI에 의해 생성된 창의적 해석으로, 참고용으로만
          활용해주세요.
        </p>
      </div>
    </div>
  );
};

export default FaceReadingResult;
