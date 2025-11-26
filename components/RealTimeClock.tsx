"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

export function RealTimeClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!now) return <div className="h-32 animate-pulse bg-gray-100 rounded-lg" />;

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="text-xl text-gray-500 mb-2">
        {format(now, "yyyy年 M月 d日(EEE)", { locale: ja })}
      </div>
      <div className="text-7xl font-bold text-gray-900 tracking-tight tabular-nums">
        {format(now, "HH:mm")}
        <span className="text-4xl text-gray-400 ml-2">{format(now, "ss")}</span>
      </div>
    </div>
  );
}
