"use client";

import PlanSelector from "@/components/PlanSelector";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlanType, ServicePlanConfig } from "@/types";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";

// 로테이션할 이모지 배열
const fortuneEmojis = ["🔮", "✨", "🌙", "🌠", "💫", "🪄"];
const faceEmojis = ["👁️", "🧿", "🪬", "🧙", "⚡", "🌟"];
const mysticEmojis = [
  "🔮",
  "✨",
  "🌙",
  "🌠",
  "👁️",
  "🧿",
  "🪬",
  "🧙",
  "💫",
  "⚡",
  "🌟",
  "🪄",
];

export function LotationEmoji({ type }: { type?: "fortune" | "face" }) {
  const emojis = type
    ? type === "fortune"
      ? fortuneEmojis
      : faceEmojis
    : mysticEmojis;

  const [currentEmojiIndex, setCurrentEmojiIndex] = useState(() => {
    return 0;
  });

  useEffect(() => {
    const emojiInterval = setInterval(() => {
      setCurrentEmojiIndex((currentEmojiIndex) => {
        const nextIndex = (currentEmojiIndex + 1) % emojis.length;
        return nextIndex;
      });
    }, 2000);

    return () => clearInterval(emojiInterval);
  }, [emojis, type]);

  return (
    <div className="inline-block relative w-[1em] h-[1em]">
      <AnimatePresence mode="sync">
        <motion.span
          key={currentEmojiIndex}
          initial={{
            opacity: 0,
            scale: 0.9,
            filter: "brightness(0.7)",
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.9, 1.1, 0.9],
            filter: ["brightness(0.7)", "brightness(1.3)", "brightness(0.7)"],
          }}
          exit={{
            opacity: 0,
            scale: 0.9,
            filter: "brightness(0.7)",
          }}
          transition={{
            duration: 2,
            times: [0, 0.5, 1], // 0초, 1.5초, 3초 시점
            ease: "easeInOut",
          }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-shadow-mystical"
        >
          {emojis[currentEmojiIndex]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

export function PricingDialog({
  servicePlanConfig,
  currentPlanType,
}: {
  servicePlanConfig: ServicePlanConfig;
  currentPlanType: PlanType;
}) {
  return (
    <Dialog>
      <DialogTrigger className="btn-mystical px-4 py-2 rounded-lg font-semibold cursor-pointer transition-all duration-300 hover:scale-105 focus-mystical">
        프라이싱
      </DialogTrigger>
      <DialogContent className="max-w-4xl w-[90vw] p-0 border-primary-600/30 glass-card-elevated rounded-2xl">
        <div className="p-8">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-bold text-white text-left text-shadow-glow-enhanced">
              서비스 플랜 선택
            </DialogTitle>
          </DialogHeader>
          <PlanSelector
            servicePlanConfig={servicePlanConfig}
            currentPlanType={currentPlanType}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ServiceCard({
  type,
  title,
  description,
  href,
}: {
  type: "fortune" | "face";
  title: string;
  description: string;
  href: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.2 },
      }}
      whileTap={{ scale: 0.98 }}
      className="group relative"
    >
      <Link href={href} className="block w-full h-full no-underline">
        <div
          className="glass-card-elevated rounded-3xl p-8 md:p-10 flex flex-col items-center text-center 
                       cursor-pointer border border-white/15 shadow-mystical
                       h-[400px] relative overflow-hidden
                       transition-all duration-300 ease-out
                       hover:border-primary-400/30 hover:shadow-mystical-lg
                       group-hover:bg-white/[0.1]"
        >
          {/* Background gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-primary-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          {/* Decorative elements */}
          <div className="absolute top-4 right-4 w-16 h-16 bg-primary-400/10 rounded-full blur-xl group-hover:bg-primary-400/20 transition-colors duration-500"></div>
          <div className="absolute bottom-4 left-4 w-12 h-12 bg-primary-500/10 rounded-full blur-lg group-hover:bg-primary-500/20 transition-colors duration-500"></div>

          <div className="relative z-10 flex flex-col items-center text-center h-full">
            {/* Icon */}
            <div
              className="text-[4rem] md:text-[4.5rem] mb-6 animate-float-enhanced text-primary-200 text-shadow-mystical
                           group-hover:scale-110 transition-transform duration-300"
            >
              <LotationEmoji type={type} />
            </div>

            {/* Title */}
            <h2
              className="text-2xl md:text-3xl lg:text-4xl text-white mb-4 font-bold text-shadow-glow-enhanced
                          group-hover:text-primary-100 transition-colors duration-300"
            >
              {title}
            </h2>

            {/* Description */}
            <p
              className="text-white/80 leading-relaxed text-sm md:text-base lg:text-lg flex-grow
                         group-hover:text-white/90 transition-colors duration-300 w-full px-2
                         break-keep whitespace-pre-line"
            >
              {description}
            </p>

            {/* CTA indicator */}
            <div className="mt-6 flex items-center gap-2 text-primary-300 group-hover:text-primary-200 transition-colors duration-300">
              <span className="text-sm font-medium">시작하기</span>
              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="text-lg"
              >
                →
              </motion.div>
            </div>
          </div>

          {/* Hover shine effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent 
                           translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out"
            ></div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
