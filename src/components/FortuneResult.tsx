"use client";

import { TarotCard } from "@/types";
import React from "react";

interface FortuneResultProps {
  result: {
    content: string;
    overall?: string;
    love?: string;
    career?: string;
    health?: string;
    advice?: string;
  };
  selectedCard?: TarotCard | null;
  onRestart: () => void;
  onReturn?: () => void;
}

const FortuneResult: React.FC<FortuneResultProps> = ({
  result,
  selectedCard,
  onRestart,
  onReturn,
}) => {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white/10 rounded-xl backdrop-blur-soft">
      <h2 className="text-3xl font-bold text-white mb-6 text-center text-shadow-glow">
        🔮 당신의 운세
      </h2>

      {selectedCard && (
        <div className="text-center mb-6">
          <div className="inline-block bg-purple-900/30 rounded-lg p-4 border border-purple-500/30">
            <p className="text-purple-200 text-sm mb-2">선택한 타로 카드</p>
            <h3 className="text-white font-semibold text-lg">
              {selectedCard.name}
            </h3>
            <p className="text-white/80 text-sm">{selectedCard.meaning}</p>
          </div>
        </div>
      )}

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
          다시 보기
        </button>
        {onReturn && (
          <button
            onClick={onReturn}
            className="px-6 py-3 bg-white/20 text-white rounded-lg font-semibold hover:bg-white/30 transition-colors"
          >
            홈으로 돌아가기
          </button>
        )}
      </div>
    </div>
  );
};

export default FortuneResult;
