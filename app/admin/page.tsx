"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { eachDayOfInterval, endOfYear, format, getDay, isSameMonth, startOfYear } from "date-fns";
import { ja } from "date-fns/locale";
import { useState } from "react";

// Mock Data Generator
const generateMockData = (daysInYear: Date[]) => {
  const users = [
    { id: 1, name: "山田 太郎", role: "正社員" },
    { id: 2, name: "鈴木 花子", role: "アルバイト" },
    { id: 3, name: "佐藤 次郎", role: "マネージャー" },
    { id: 4, name: "田中 美咲", role: "アルバイト" },
    { id: 5, name: "伊藤 健太", role: "正社員" },
  ];

  return users.map(user => {
    let totalHours = 0;
    // Randomly generate hours for each day
    const attendance = daysInYear.map((date, i) => {
      const isWeekend = getDay(date) === 0 || getDay(date) === 6;
      if (Math.random() > 0.8 || isWeekend) return null; // Day off
      const hours = Math.floor(Math.random() * 4 + 4); // 4-8 hours
      totalHours += hours;
      return hours;
    });
    return { ...user, attendance, totalHours };
  });
};

export default function AdminPage() {
  const [currentDate] = useState(new Date());
  const yearStart = startOfYear(currentDate);
  const yearEnd = endOfYear(currentDate);
  const daysInYear = eachDayOfInterval({ start: yearStart, end: yearEnd });

  const mockData = generateMockData(daysInYear);

  return (
    <div className="h-full flex flex-col">
      <Card className="flex-1 flex flex-col border-none shadow-none bg-transparent lg:bg-white lg:border lg:border-gray-200 lg:shadow-sm overflow-hidden">
        <CardHeader>
          <CardTitle>勤怠管理表 ({format(currentDate, "yyyy年")})</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto p-0 relative">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full border-collapse text-sm text-left">
              <thead className="bg-gray-50 sticky top-0 z-20 shadow-sm">
                <tr>
                  <th className="border-b border-gray-200 p-4 font-medium text-gray-500 sticky left-0 bg-gray-50 z-30 min-w-[120px] shadow-[1px_0_0_0_rgba(0,0,0,0.05)]">名前</th>
                  <th className="border-b border-gray-200 p-4 font-medium text-gray-500 sticky left-[120px] bg-gray-50 z-30 min-w-[100px] shadow-[1px_0_0_0_rgba(0,0,0,0.05)]">職種</th>
                  <th className="border-b border-gray-200 p-4 font-medium text-gray-500 sticky left-[220px] bg-gray-50 z-30 min-w-[80px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">合計</th>
                  {daysInYear.map((date) => (
                    <th key={date.toString()} className={`border-b border-gray-200 p-2 font-medium min-w-[40px] text-center ${
                      getDay(date) === 0 ? "text-red-500 bg-red-50" : getDay(date) === 6 ? "text-blue-500 bg-blue-50" : "text-gray-500"
                    } ${!isSameMonth(date, currentDate) ? "opacity-50" : ""}`}>
                      <div className="text-[10px] text-gray-400">{format(date, "M/d")}</div>
                      <div className="text-[10px]">{format(date, "E", { locale: ja })}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mockData.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50">
                    <td className="p-4 font-medium text-gray-900 sticky left-0 bg-white z-10 border-r border-gray-100 shadow-[1px_0_0_0_rgba(0,0,0,0.05)]">{user.name}</td>
                    <td className="p-4 text-gray-500 sticky left-[120px] bg-white z-10 border-r border-gray-100 shadow-[1px_0_0_0_rgba(0,0,0,0.05)]">{user.role}</td>
                    <td className="p-4 font-bold text-blue-600 sticky left-[220px] bg-white z-10 border-r border-gray-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] text-right">{user.totalHours}h</td>
                    {daysInYear.map((date, i) => {
                      const hours = user.attendance[i];
                      return (
                        <td key={date.toString()} className={`p-2 text-center border-r border-gray-50 ${
                          getDay(date) === 0 ? "bg-red-50/10" : getDay(date) === 6 ? "bg-blue-50/10" : ""
                        } ${!isSameMonth(date, currentDate) ? "bg-gray-50/30" : ""}`}>
                          {hours ? (
                            <span className="inline-block px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                              {hours}h
                            </span>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
