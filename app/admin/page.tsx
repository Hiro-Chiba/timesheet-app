"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { eachDayOfInterval, endOfMonth, format, getDay, startOfMonth, differenceInHours, differenceInMinutes } from "date-fns";
import { ja } from "date-fns/locale";
import { useState, useEffect } from "react";
import { getAllAttendance } from "@/app/actions";

// Type definition for the data we display
interface DisplayUser {
  id: string;
  name: string | null;
  role: string;
  attendances: {
    date: string;
    hours: number;
  }[];
}

export default function AdminPage() {
  const [currentDate] = useState(new Date());
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth()); // 0-11
  const [users, setUsers] = useState<DisplayUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const months = Array.from({ length: 12 }, (_, i) => i);

  // Calculate days for the selected month in the selected year
  const monthStart = startOfMonth(new Date(currentYear, selectedMonth, 1));
  const monthEnd = endOfMonth(new Date(currentYear, selectedMonth, 1));
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await getAllAttendance(currentYear, selectedMonth);
        
        // Transform data for display
        const transformedUsers: DisplayUser[] = data.map((user: any) => {
          const attendances = user.attendances.map((record: any) => {
            let hours = 0;
            if (record.startTime && record.endTime) {
              const diff = differenceInMinutes(new Date(record.endTime), new Date(record.startTime));
              // Subtract break time if we had it, but for now simple diff
              // If we want to be precise we should subtract break duration
              // Let's assume simple duration for now
              hours = Math.round((diff / 60) * 10) / 10; // Round to 1 decimal
            }
            return {
              date: record.date,
              hours,
            };
          });

          return {
            id: user.id,
            name: user.name,
            role: user.role,
            attendances,
          };
        });
        
        setUsers(transformedUsers);
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentYear, selectedMonth]);

  const handlePrevYear = () => setCurrentYear(prev => prev - 1);
  const handleNextYear = () => setCurrentYear(prev => prev + 1);

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">勤怠管理表 ({currentYear}年)</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrevYear}>&lt; 前年</Button>
            <Button variant="outline" size="sm" onClick={handleNextYear}>翌年 &gt;</Button>
          </div>
        </div>
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
                {isLoading ? (
                  <tr>
                    <td colSpan={3 + daysInMonth.length} className="p-8 text-center text-gray-500">
                      読み込み中...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                   <tr>
                    <td colSpan={3 + daysInMonth.length} className="p-8 text-center text-gray-500">
                      データがありません
                    </td>
                  </tr>
                ) : (
                  users.map((user) => {
                    // Calculate total for this month only
                    let monthlyTotal = 0;
                    const monthlyAttendance = daysInMonth.map((date) => {
                      const dateStr = format(date, 'yyyy-MM-dd');
                      const record = user.attendances.find(a => a.date === dateStr);
                      const hours = record ? record.hours : 0;
                      monthlyTotal += hours;
                      return hours;
                    });

                    // Round total
                    monthlyTotal = Math.round(monthlyTotal * 10) / 10;

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
                              {hours > 0 ? (
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
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
