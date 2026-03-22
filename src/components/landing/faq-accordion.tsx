"use client";

import { useState } from "react";

interface FaqItem {
  q: string;
  a: string;
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className="max-w-[700px] mx-auto mt-12 text-left">
      {items.map((item, idx) => (
        <div key={idx} className="border-b border-[#e8eaed] overflow-hidden">
          <button
            onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
            className="w-full py-5 text-[15px] font-semibold text-[var(--charcoal)] flex justify-between items-center hover:text-[var(--teal)] transition-colors text-left"
          >
            {item.q}
            <span
              className={`w-[26px] h-[26px] bg-[rgba(42,185,176,0.08)] rounded-[7px] flex items-center justify-center text-[16px] text-[var(--teal)] shrink-0 ml-4 transition-transform duration-300 ${
                openIdx === idx ? "rotate-45" : ""
              }`}
            >
              +
            </span>
          </button>
          <div
            className={`overflow-hidden transition-all duration-400 text-[14px] text-[var(--mid-gray)] leading-[1.7] ${
              openIdx === idx ? "max-h-[300px] pb-5" : "max-h-0"
            }`}
          >
            {item.a}
          </div>
        </div>
      ))}
    </div>
  );
}
