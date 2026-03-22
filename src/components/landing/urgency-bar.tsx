"use client";

import { useState, useEffect } from "react";

export function UrgencyBar() {
  const [time, setTime] = useState("23:59:59");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      const d = end.getTime() - now.getTime();
      if (d <= 0) return;
      const h = String(Math.floor(d / 36e5)).padStart(2, "0");
      const m = String(Math.floor((d % 36e5) / 6e4)).padStart(2, "0");
      const s = String(Math.floor((d % 6e4) / 1e3)).padStart(2, "0");
      setTime(`${h}:${m}:${s}`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="sticky top-0 z-[1000] bg-[linear-gradient(90deg,#2AB9B0,#8ED16A,#F28C28,#F8CE30)] text-center py-[11px] px-5 text-[13px] font-bold tracking-[0.5px] text-[var(--navy)]">
      EARLY ACCESS — LAUNCH PRICING ACTIVE &bull; UP TO 50% OFF ALL PLANS{" "}
      <span className="inline-block bg-black/15 text-white px-3 py-[2px] rounded-md font-mono tracking-wider ml-1.5">
        {time}
      </span>
    </div>
  );
}
