import { ServiceCard } from "./page.client";

export const runtime = "edge";

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 md:space-y-10">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-8 md:py-12">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-shadow-mystical bg-gradient-to-br from-white via-primary-100 to-primary-200 bg-clip-text text-transparent animate-fade-in-up">
            아이(AI)보살 운세
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed animate-fade-in-up">
            인공지능으로 살펴보는 당신의 운명과 인연
          </p>
          <p className="text-sm md:text-base text-primary-200/80 max-w-2xl mx-auto leading-relaxed animate-fade-in-up">
            5천년 동양 철학과 최신 AI 기술이 만나 당신만의 특별한 이야기를
            들려드립니다
          </p>
        </div>
      </section>

      {/* Services Section */}
      <section className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          <ServiceCard
            type="fortune"
            title="오늘의 사주 운세"
            description="전통 사주와 타로의 지혜로 살펴보는 당신의 오늘 운세와 인연의 흐름을 아이보살이 정성스럽게 풀이해드립니다."
            href="/fortune"
          />
          <ServiceCard
            type="face"
            title="전생 관상 풀이"
            description="당신의 얼굴에 담긴 운명의 비밀과 전생의 흔적을 AI의 눈으로 살펴보는 신비로운 관상 분석 서비스입니다."
            href="/face-reading"
          />
        </div>
      </section>

      {/* About Section */}
      <section className="relative">
        <div className="glass-card-elevated rounded-3xl p-8 md:p-12 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary-400/15 rounded-full blur-xl"></div>

          <div className="relative space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-12 bg-gradient-mystical rounded-full"></div>
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white text-shadow-glow-enhanced">
                아이보살의 AI 운세 서비스
              </h3>
            </div>

            <div className="space-y-4 text-white/90 leading-relaxed">
              <p className="text-base md:text-lg">
                5천년 동양 철학과 최신 AI 기술을 결합한 아이(AI)보살이 당신의
                사주와 관상을 정성스럽게 풀이해드립니다.
              </p>
              <p className="text-sm md:text-base text-white/75">
                재미로만 봐주시고, 너무 진지하게 받아들이지 마세요! 인생의 작은
                즐거움과 영감을 얻어가시길 바랍니다.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <div className="flex items-center gap-2 text-primary-200">
                <span className="text-lg">🔮</span>
                <span className="text-sm font-medium">전통 사주</span>
              </div>
              <div className="flex items-center gap-2 text-primary-200">
                <span className="text-lg">🃏</span>
                <span className="text-sm font-medium">타로 카드</span>
              </div>
              <div className="flex items-center gap-2 text-primary-200">
                <span className="text-lg">👁️</span>
                <span className="text-sm font-medium">관상 분석</span>
              </div>
              <div className="flex items-center gap-2 text-primary-200">
                <span className="text-lg">🤖</span>
                <span className="text-sm font-medium">AI 기술</span>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10">
              <p className="text-lg md:text-xl text-primary-200 italic text-shadow-glow-enhanced text-center">
                천년의 지혜를 담은 신비로운 경험을 시작해보세요 ✨
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center py-8 md:py-12">
        <div className="glass-card rounded-2xl p-6 md:p-8 border-gradient-border">
          <h3 className="text-xl md:text-2xl font-bold text-white mb-4 text-shadow-glow-enhanced">
            지금 바로 시작해보세요
          </h3>
          <p className="text-white/80 mb-6 max-w-lg mx-auto">
            무료로 제공되는 신비로운 AI 운세 서비스를 경험해보세요
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/fortune"
              className="btn-mystical px-6 py-3 rounded-xl text-white font-semibold no-underline transition-all duration-300 hover:scale-105"
            >
              사주 운세 보기 🔮
            </a>
            <a
              href="/face-reading"
              className="btn-mystical px-6 py-3 rounded-xl text-white font-semibold no-underline transition-all duration-300 hover:scale-105"
            >
              관상 풀이 시작 👁️
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
