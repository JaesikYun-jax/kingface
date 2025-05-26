import FortuneClient from "./page.client";

export default function Fortune() {
  return (
    <div className="max-w-5xl mx-auto py-4 md:py-6 space-y-6">
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-shadow-mystical">
          오늘의 사주 운세
        </h1>
        <p className="text-white/80 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          전통 사주와 타로의 지혜로 당신의 운명을 살펴보세요
        </p>
        <div className="w-16 h-1 bg-gradient-mystical mx-auto rounded-full"></div>
      </div>

      <FortuneClient />
    </div>
  );
}
