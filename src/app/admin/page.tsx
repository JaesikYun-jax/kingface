export const runtime = "edge";

export default function Admin() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-2 text-shadow-purple">
          관리자 페이지
        </h1>
        <p className="text-xl text-white/80">시스템 설정 및 프롬프트 관리</p>
      </header>

      <div className="bg-white/10 rounded-xl p-8 backdrop-blur-soft">
        <div className="mb-8">
          <h2 className="text-2xl text-white mb-4 border-b-2 border-purple-600/50 pb-2">
            관리 기능
          </h2>
          <p className="text-white/90">관리자 기능은 개발 중입니다.</p>
        </div>
      </div>
    </div>
  );
}
