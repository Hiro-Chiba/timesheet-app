"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { eachDayOfInterval, endOfMonth, endOfYear, format, getDay, isSameMonth, startOfMonth, startOfYear } from "date-fns";
import { ja } from "date-fns/locale";
import { useState } from "react";

// Mock Data Generator
const generateMockData = (year: number) => {
  const users = [
    { id: 1, name: "山田 太郎", role: "正社員" },
    { id: 2, name: "鈴木 花子", role: "アルバイト" },
    { id: 3, name: "佐藤 次郎", role: "マネージャー" },
    { id: 4, name: "田中 美咲", role: "アルバイト" },
    { id: 5, name: "伊藤 健太", role: "正社員" },
  ];

  // Generate data for the whole year once
  const startDate = startOfYear(new Date(year, 0, 1));
  const endDate = endOfYear(new Date(year, 0, 1));
  const daysInYear = eachDayOfInterval({ start: startDate, end: endDate });

  return users.map(user => {
    // Randomly generate hours for each day of the year
    const attendance = daysInYear.map((date) => {
      const isWeekend = getDay(date) === 0 || getDay(date) === 6;
      if (Math.random() > 0.8 || isWeekend) return null; // Day off
      return Math.floor(Math.random() * 4 + 4); // 4-8 hours
    });
    return { ...user, attendance };
  });
};

export default function AdminPage() {
  const [currentDate] = useState(new Date());
  const currentYear = currentDate.getFullYear();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth()); // 0-11

  // Generate mock data for the current year (static for demo)
  // In a real app, this would be fetched based on the year/month
  const [mockData] = useState(() => generateMockData(currentYear));

  const months = Array.from({ length: 12 }, (_, i) => i);

  // Calculate days for the selected month
  const monthStart = startOfMonth(new Date(currentYear, selectedMonth, 1));
  const monthEnd = endOfMonth(new Date(currentYear, selectedMonth, 1));
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Calculate day offset for the whole year to map attendance array correctly
  // attendance array starts from Jan 1st.
  // We need to find the index of the first day of the selected month.
  const yearStart = startOfYear(new Date(currentYear, 0, 1));
  const dayOffset = Math.floor((monthStart.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">勤怠管理表 ({currentYear}年)</h2>
      </div>

      {/* Month Tabs */}
      <div className="flex overflow-x-auto pb-2 gap-1 border-b border-gray-200">
        {months.map((month) => (
          <button
            key={month}
            onClick={() => setSelectedMonth(month)}
            className={cn(
              "px-4 py-2 text-sm font-medium whitespace-nowrap rounded-t-lg transition-colors",
              selectedMonth === month
                ? "bg-white text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            )}
          >
            {month + 1}月
          </button>
        ))}
      </div>

      <Card className="flex-1 flex flex-col border-none shadow-none bg-transparent lg:bg-white lg:border lg:border-gray-200 lg:shadow-sm overflow-hidden">
        <CardContent className="flex-1 overflow-auto p-0 relative">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full border-collapse text-sm text-left">
              <thead className="bg-gray-50 sticky top-0 z-20 shadow-sm">
                <tr>
                  <th className="border-b border-gray-200 p-4 font-medium text-gray-500 sticky left-0 bg-gray-50 z-30 min-w-[120px] shadow-[1px_0_0_0_rgba(0,0,0,0.05)]">名前</th>
                  <th className="border-b border-gray-200 p-4 font-medium text-gray-500 sticky left-[120px] bg-gray-50 z-30 min-w-[100px] shadow-[1px_0_0_0_rgba(0,0,0,0.05)]">職種</th>
                  <th className="border-b border-gray-200 p-4 font-medium text-gray-500 sticky left-[220px] bg-gray-50 z-30 min-w-[80px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">合計</th>
                  {daysInMonth.map((date) => (
                    <th key={date.toString()} className={`border-b border-gray-200 p-2 font-medium min-w-[40px] text-center ${
                      getDay(date) === 0 ? "text-red-500 bg-red-50" : getDay(date) === 6 ? "text-blue-500 bg-blue-50" : "text-gray-500"
                    }`}>
                      <div className="text-[10px] text-gray-400">{format(date, "M/d")}</div>
                      <div className="text-[10px]">{format(date, "E", { locale: ja })}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mockData.map((user) => {
                  // Calculate total for this month only
                  let monthlyTotal = 0;
                  const monthlyAttendance = daysInMonth.map((_, i) => {
                    const hours = user.attendance[dayOffset + i];
                    if (hours) monthlyTotal += hours;
                    return hours;
                  });

                  return (
                    <tr key={user.id} className="hover:bg-gray-50/50">
                      <td className="p-4 font-medium text-gray-900 sticky left-0 bg-white z-10 border-r border-gray-100 shadow-[1px_0_0_0_rgba(0,0,0,0.05)]">{user.name}</td>
                      <td className="p-4 text-gray-500 sticky left-[120px] bg-white z-10 border-r border-gray-100 shadow-[1px_0_0_0_rgba(0,0,0,0.05)]">{user.role}</td>
                      <td className="p-4 font-bold text-blue-600 sticky left-[220px] bg-white z-10 border-r border-gray-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] text-right">{monthlyTotal}h</td>
                      {monthlyAttendance.map((hours, i) => {
                        const date = daysInMonth[i];
                        return (
                          <td key={date.toString()} className={`p-2 text-center border-r border-gray-50 ${
                            getDay(date) === 0 ? "bg-red-50/10" : getDay(date) === 6 ? "bg-blue-50/10" : ""
                          }`}>
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
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
