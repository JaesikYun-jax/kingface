"use client";

import React from "react";

import { TarotCard } from "../types";

interface TarotCardSelectorProps {
  cards: TarotCard[];
  onSelect: (card: TarotCard) => void;
}

const TarotCardSelector: React.FC<TarotCardSelectorProps> = ({
  cards,
  onSelect,
}) => {
  return (
    <div className="flex justify-center flex-wrap gap-8 my-8 md:gap-4">
      {cards.map((card) => (
        <div
          key={card.id}
          onClick={() => onSelect(card)}
          className="w-[200px] cursor-pointer transition-transform duration-300 hover:-translate-y-2 md:w-[150px]"
        >
          <div className="relative rounded-xl overflow-hidden shadow-[0_4px_8px_rgba(0,0,0,0.2)] aspect-[3/5] mb-4">
            <img
              src={card.image}
              alt={card.name}
              className="w-full h-full object-cover transition-transform duration-300"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 transition-opacity duration-300">
              <div className="text-white font-semibold text-lg text-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                {card.name}
              </div>
            </div>
          </div>
          <div className="text-gray-600 text-sm text-center">
            {card.meaning}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TarotCardSelector;
