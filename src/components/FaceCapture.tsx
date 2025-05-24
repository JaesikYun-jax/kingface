"use client";

import React, { useRef, useState } from "react";

interface FaceCaptureProps {
  onCapture: (imageSrc: string) => void;
  isLoading: boolean;
}

const FaceCapture: React.FC<FaceCaptureProps> = ({ onCapture, isLoading }) => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageSrc = e.target?.result as string;
        setCapturedImage(imageSrc);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white/10 rounded-xl backdrop-blur-soft">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">
        얼굴 사진 업로드
      </h2>

      <div className="space-y-6">
        {!capturedImage ? (
          <div className="text-center">
            <div className="border-2 border-dashed border-white/30 rounded-lg p-8 mb-4">
              <div className="text-6xl mb-4">📷</div>
              <p className="text-white/80 mb-4">
                관상 분석을 위한 얼굴 사진을 업로드해주세요
              </p>
              <button
                onClick={handleUploadClick}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                사진 선택
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            <p className="text-white/60 text-sm">
              * 정면을 바라보는 선명한 사진을 업로드해주세요
            </p>
          </div>
        ) : (
          <div className="text-center">
            <div className="mb-4">
              <img
                src={capturedImage}
                alt="업로드된 사진"
                className="max-w-full max-h-80 mx-auto rounded-lg border-2 border-purple-500"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleUploadClick}
                className="px-6 py-3 bg-white/20 text-white rounded-lg font-semibold hover:bg-white/30 transition-colors"
              >
                다른 사진 선택
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  isLoading
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : "bg-purple-600 text-white hover:bg-purple-700"
                }`}
              >
                {isLoading ? "분석 중..." : "관상 분석 시작"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FaceCapture;
