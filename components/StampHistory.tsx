"use client";

import { useTimeStore } from "@/lib/store";
import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";
import { Button } from "./ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";

export function StampHistory() {
  const records = useTimeStore((state) => state.records);

  // Show only last 3 days or so for the "Recent" view
  const recentRecords = records.slice(0, 5);

  return (
    <Card className="h-full border-none shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-lg text-gray-600">打刻履歴 (直近)</CardTitle>
      </CardHeader>
      <CardContent className="px-0 space-y-6">
        {recentRecords.length === 0 ? (
          <div className="text-gray-400 text-sm">履歴はありません</div>
        ) : (
          recentRecords.map((record) => (
            <div key={record.id} className="border-b border-gray-100 pb-4 last:border-0">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium text-gray-900">
                  {format(parseISO(record.date), "yyyy年MM月dd日(EEE)", { locale: ja })}
                </div>
                <div className="flex gap-2">
                  {record.isEdited && (
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                      編集済
                    </span>
                  )}
                  <Button variant="outline" size="sm" className="h-7 text-xs px-2">
                    編集
                  </Button>
                  <Button variant="outline" size="sm" className="h-7 text-xs px-2">
                    申請
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">出勤</span>
                  <span className="font-mono text-gray-900">
                    {record.startTime ? format(parseISO(record.startTime), "HH:mm") : "--:--"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">退勤</span>
                  <span className="font-mono text-gray-900">
                    {record.endTime ? format(parseISO(record.endTime), "HH:mm") : "--:--"}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
