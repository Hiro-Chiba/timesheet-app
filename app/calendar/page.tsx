"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useTimeStore } from "@/lib/store";
import { addMonths, eachDayOfInterval, endOfMonth, format, getDay, isSameDay, isSameMonth, startOfMonth, subMonths } from "date-fns";
import { ja } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");

  const { shifts, addShift, deleteShift } = useTimeStore();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Calculate padding days for the grid (start from Sunday)
  const startDayOfWeek = getDay(monthStart);
  const paddingDays = Array.from({ length: startDayOfWeek });

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    // Pre-fill if exists
    const dateStr = format(date, "yyyy-MM-dd");
    const existingShift = shifts.find(s => s.date === dateStr);
    if (existingShift) {
      setStartTime(existingShift.startTime);
      setEndTime(existingShift.endTime);
    } else {
      setStartTime("09:00");
      setEndTime("18:00");
    }
  };

  const handleSaveShift = () => {
    if (!selectedDate) return;
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    addShift(dateStr, startTime, endTime);
    setSelectedDate(null); // Close selection
  };

  const handleDeleteShift = () => {
    if (!selectedDate) return;
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const existingShift = shifts.find(s => s.date === dateStr);
    if (existingShift) {
      deleteShift(existingShift.id);
    }
    setSelectedDate(null);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full">
      {/* Calendar Grid */}
      <Card className="flex-1 border-none shadow-none bg-transparent lg:bg-white lg:border lg:border-gray-200 lg:shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-xl font-bold text-gray-900">
            {format(currentDate, "yyyy年 M月", { locale: ja })}
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {["日", "月", "火", "水", "木", "金", "土"].map((d, i) => (
              <div key={i} className={`text-sm font-medium ${i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : "text-gray-500"}`}>
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {paddingDays.map((_, i) => (
              <div key={`pad-${i}`} className="h-24 bg-gray-50/50 rounded-md" />
            ))}
            {daysInMonth.map((date) => {
              const dateStr = format(date, "yyyy-MM-dd");
              const shift = shifts.find(s => s.date === dateStr);
              const isSelected = selectedDate && isSameDay(date, selectedDate);
              const isToday = isSameDay(date, new Date());

              return (
                <div
                  key={dateStr}
                  onClick={() => handleDateClick(date)}
                  className={`
                    h-24 p-2 rounded-md border cursor-pointer transition-colors relative
                    ${isSelected ? "ring-2 ring-blue-500 border-transparent z-10" : "border-gray-100 hover:border-blue-200"}
                    ${isToday ? "bg-blue-50/30" : "bg-white"}
                  `}
                >
                  <div className={`text-sm font-medium ${getDay(date) === 0 ? "text-red-500" : getDay(date) === 6 ? "text-blue-500" : "text-gray-700"}`}>
                    {format(date, "d")}
                  </div>
                  {shift && (
                    <div className="mt-2 text-xs bg-blue-100 text-blue-700 p-1 rounded text-center">
                      {shift.startTime} - {shift.endTime}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Shift Edit Panel */}
      <div className="lg:w-80">
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle className="text-lg">シフト編集</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDate ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">日付</label>
                  <div className="text-lg font-bold text-gray-900">
                    {format(selectedDate, "yyyy年 M月 d日(EEE)", { locale: ja })}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">開始</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">終了</label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-4">
                  <Button onClick={handleSaveShift} className="w-full">
                    保存
                  </Button>
                  <Button variant="danger" onClick={handleDeleteShift} className="w-full">
                    削除
                  </Button>
                  <Button variant="ghost" onClick={() => setSelectedDate(null)} className="w-full">
                    キャンセル
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>日付を選択して<br/>シフトを入力してください</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
