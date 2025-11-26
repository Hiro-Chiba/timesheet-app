"use client";

import { RealTimeClock } from "@/components/RealTimeClock";
import { StampHistory } from "@/components/StampHistory";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useTimeStore } from "@/lib/store";
import { Briefcase, Coffee, LogOut } from "lucide-react";

export default function Home() {
  const { currentStatus, clockIn, clockOut, startBreak, endBreak } = useTimeStore();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
      {/* Left Column: History */}
      <div className="lg:col-span-1">
        <StampHistory />
      </div>

      {/* Right Column: Clock & Actions */}
      <div className="lg:col-span-2 flex flex-col justify-center items-center p-4 lg:p-12">
        <div className="mb-8 flex items-center gap-2">
          <span className="text-gray-500">現在のステータス:</span>
          <span className={`font-bold px-3 py-1 rounded-full text-sm ${
            currentStatus === 'working' ? 'bg-blue-100 text-blue-700' :
            currentStatus === 'break' ? 'bg-orange-100 text-orange-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {currentStatus === 'working' ? '勤務中' :
             currentStatus === 'break' ? '休憩中' :
             '勤務外'}
          </span>
        </div>

        <RealTimeClock />

        <div className="flex flex-wrap justify-center gap-4 mt-12 w-full max-w-2xl">
          {currentStatus === 'left' && (
            <Button 
              size="lg" 
              className="h-16 text-lg px-12 bg-blue-600 hover:bg-blue-700 shadow-sm"
              onClick={clockIn}
            >
              <Briefcase className="mr-2 h-5 w-5" />
              出勤
            </Button>
          )}

          {currentStatus === 'working' && (
            <>
              <Button 
                size="lg" 
                variant="outline"
                className="h-16 text-lg px-8 border-blue-200 text-blue-700 hover:bg-blue-50 bg-white shadow-sm"
                onClick={startBreak}
              >
                <Coffee className="mr-2 h-5 w-5" />
                休憩開始
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="h-16 text-lg px-8 border-red-200 text-red-700 hover:bg-red-50 bg-white shadow-sm"
                onClick={clockOut}
              >
                <LogOut className="mr-2 h-5 w-5" />
                退勤
              </Button>
            </>
          )}

          {currentStatus === 'break' && (
            <Button 
              size="lg" 
              variant="outline"
              className="h-16 text-lg px-8 border-blue-200 text-blue-700 hover:bg-blue-50 bg-white shadow-sm"
              onClick={endBreak}
            >
              <Coffee className="mr-2 h-5 w-5" />
              休憩終了
            </Button>
          )}
        </div>
        
        {currentStatus === 'left' && (
           <p className="mt-8 text-sm text-gray-400">
             今日も一日お疲れ様でした。
           </p>
        )}
      </div>
    </div>
  );
}
