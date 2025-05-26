import {
  getCurrentPlanType,
  getServicePlanConfig,
} from "@/lib/openai/config/service-plans";
import type { Metadata } from "next";
import { Cinzel, Inter, Noto_Serif_KR } from "next/font/google";
import Link from "next/link";

import "./globals.css";
import { LotationEmoji, PricingDialog } from "./page.client";

const inter = Inter({ subsets: ["latin"] });
const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
});
const notoSerifKR = Noto_Serif_KR({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-noto-serif-kr",
  display: "swap",
});

export const metadata: Metadata = {
  title: "아이보살 1.0 - AI 운세 서비스",
  description: "AI 기반 운세 및 관상 분석 서비스",
  keywords: ["AI", "운세", "관상", "타로", "사주"],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const servicePlanConfig = await getServicePlanConfig();
  const currentPlanType = await getCurrentPlanType();
  return (
    <html lang="ko">
      <body
        className={`${inter.className} ${cinzel.variable} ${notoSerifKR.variable} min-h-screen bg-gradient-to-br from-mystical-dark via-mystical-deeper to-mystical-purple`}
      >
        <div className="min-h-screen flex flex-col relative">
          {/* Background decorative elements */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
            <div className="absolute top-60 right-20 w-24 h-24 bg-primary-400/15 rounded-full blur-2xl animate-float-gentle"></div>
            <div className="absolute bottom-40 left-1/4 w-40 h-40 bg-primary-600/8 rounded-full blur-3xl animate-breathe"></div>
            <div className="absolute bottom-20 right-10 w-28 h-28 bg-primary-300/12 rounded-full blur-2xl animate-pulse-slow"></div>
          </div>

          {/* Header */}
          <header className="sticky top-0 z-50 backdrop-blur-mystical border-b border-white/10">
            <div className="absolute inset-0 bg-gradient-to-r from-mystical-dark/80 via-mystical-deeper/90 to-mystical-purple/80"></div>
            <div className="relative flex justify-between items-center px-4 md:px-6 py-4 max-w-7xl mx-auto">
              <div className="flex items-center gap-3">
                <LotationEmoji />
                <Link
                  href="/"
                  className="text-white no-underline transition-all duration-300 hover:text-primary-200 group"
                >
                  <h1 className="text-xl md:text-2xl font-bold text-shadow-mystical">
                    아이보살
                    <span className="text-primary-300 ml-1 text-lg">1.0</span>
                  </h1>
                  <p className="text-xs text-white/70 mt-0.5 group-hover:text-white/90 transition-colors">
                    AI 운세 서비스
                  </p>
                </Link>
              </div>

              <nav className="flex items-center gap-6">
                {/* Navigation links */}
                <div className="hidden md:flex items-center gap-4">
                  <Link
                    href="/fortune"
                    className="text-white/80 hover:text-white transition-colors text-sm font-medium"
                  >
                    사주 운세
                  </Link>
                  <Link
                    href="/face-reading"
                    className="text-white/80 hover:text-white transition-colors text-sm font-medium"
                  >
                    관상 풀이
                  </Link>
                </div>

                <PricingDialog
                  servicePlanConfig={servicePlanConfig}
                  currentPlanType={currentPlanType}
                />
              </nav>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 relative">
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
              {children}
            </div>
          </main>

          {/* Footer */}
          <footer className="relative mt-auto">
            <div className="absolute inset-0 bg-gradient-to-t from-mystical-dark/90 via-mystical-deeper/80 to-transparent backdrop-blur-lg"></div>
            <div className="relative border-t border-white/10 p-6 md:p-8">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-6">
                  <p className="text-white/90 text-sm mb-2 font-medium">
                    &copy; {new Date().getFullYear()} 아이보살 1.0 - AI 운세
                    서비스
                  </p>
                  <p className="text-white/60 text-xs mb-4 max-w-2xl mx-auto leading-relaxed">
                    이 서비스는 오락 목적으로 제공되며, 실제 운세 결과와 다를 수
                    있습니다. 전통 철학과 현대 AI 기술을 결합한 재미있는 경험을
                    제공합니다.
                  </p>
                </div>

                <div className="flex justify-center gap-8 flex-wrap">
                  <Link href="/terms" className="group">
                    <span className="text-primary-200 text-sm hover:text-primary-100 transition-colors cursor-pointer group-hover:underline">
                      이용약관
                    </span>
                  </Link>
                  <Link href="/private" className="group">
                    <span className="text-primary-200 text-sm hover:text-primary-100 transition-colors cursor-pointer group-hover:underline">
                      개인정보 보호정책
                    </span>
                  </Link>
                </div>

                {/* Decorative footer element */}
                <div className="flex justify-center mt-6">
                  <div className="flex items-center gap-2 text-primary-300/60">
                    <div className="w-8 h-px bg-gradient-to-r from-transparent to-primary-300/30"></div>
                    <span className="text-xs">✨</span>
                    <div className="w-8 h-px bg-gradient-to-l from-transparent to-primary-300/30"></div>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
