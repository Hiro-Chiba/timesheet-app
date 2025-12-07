"use client";

import { RealTimeClock } from "@/components/RealTimeClock";
import { StampHistory } from "@/components/StampHistory";
import { Button } from "@/components/ui/Button";
import { Briefcase, Coffee, LogOut } from "lucide-react";
import { clockIn, clockOut, startBreak, endBreak } from "@/app/actions";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface HomeClientProps {
  initialStatus: 'working' | 'break' | 'left';
}

export default function HomeClient({ initialStatus }: HomeClientProps) {
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState(initialStatus);
  const [isLoading, setIsLoading] = useState(false);

  // 初期ステータスが変わった場合に同期する（router.refresh() 後など）
  useEffect(() => {
    setCurrentStatus(initialStatus);
  }, [initialStatus]);

  const handleAction = async (action: () => Promise<void>, newStatus: 'working' | 'break' | 'left') => {
    setIsLoading(true);
    try {
      await action();
      setCurrentStatus(newStatus);
      router.refresh(); // サーバーの最新データを反映
    } catch (error) {
      console.error("Action failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
      {/* 左カラム：履歴 */}
      <div className="lg:col-span-1">
        <StampHistory />
      </div>

      {/* 右カラム：時計と操作ボタン */}
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
              onClick={() => handleAction(clockIn, 'working')}
              disabled={isLoading}
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
                onClick={() => handleAction(startBreak, 'break')}
                disabled={isLoading}
              >
                <Coffee className="mr-2 h-5 w-5" />
                休憩開始
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="h-16 text-lg px-8 border-red-200 text-red-700 hover:bg-red-50 bg-white shadow-sm"
                onClick={() => handleAction(clockOut, 'left')}
                disabled={isLoading}
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
              onClick={() => handleAction(endBreak, 'working')}
              disabled={isLoading}
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
