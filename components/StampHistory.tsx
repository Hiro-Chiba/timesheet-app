"use client";

import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";
import { Button } from "./ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { getRecentAttendance, updateAttendance } from "@/app/actions";
import { useRouter } from "next/navigation";

type AttendanceRecord = {
  id: string;
  date: string;
  startTime: Date | null;
  endTime: Date | null;
  breakStartTime: Date | null;
  breakEndTime: Date | null;
  status: string;
};

export function StampHistory() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchRecords = async () => {
      const data = await getRecentAttendance();
      // 受け取った日付文字列を Date に戻す（Prisma では DateTime を返すが、サーバーアクション経由で文字列になる場合がある）
      const parsedData = data.map((r: any) => ({
        ...r,
        startTime: r.startTime ? new Date(r.startTime) : null,
        endTime: r.endTime ? new Date(r.endTime) : null,
        breakStartTime: r.breakStartTime ? new Date(r.breakStartTime) : null,
        breakEndTime: r.breakEndTime ? new Date(r.breakEndTime) : null,
      }));
      setRecords(parsedData);
    };
    fetchRecords();
  }, []);

  const handleEditClick = (record: AttendanceRecord) => {
    setEditingRecord(record);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingRecord(null);
    setIsModalOpen(false);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingRecord) return;

    const formData = new FormData(e.currentTarget);
    const startTime = formData.get("startTime") as string;
    const endTime = formData.get("endTime") as string;
    const breakStartTime = formData.get("breakStartTime") as string;
    const breakEndTime = formData.get("breakEndTime") as string;

    try {
      await updateAttendance(
        editingRecord.date,
        startTime || null,
        endTime || null,
        breakStartTime || null,
        breakEndTime || null
      );

      // 保存後にローカル状態を更新
      const updatedRecords = await getRecentAttendance();
      const parsedData = updatedRecords.map((r: any) => ({
        ...r,
        startTime: r.startTime ? new Date(r.startTime) : null,
        endTime: r.endTime ? new Date(r.endTime) : null,
        breakStartTime: r.breakStartTime ? new Date(r.breakStartTime) : null,
        breakEndTime: r.breakEndTime ? new Date(r.breakEndTime) : null,
      }));
      setRecords(parsedData);
      
      handleCloseModal();
      router.refresh();
    } catch (error) {
      console.error("Failed to update attendance", error);
      alert("更新に失敗しました");
    }
  };

  // 入力用に Date を HH:mm 形式へ変換するヘルパー
  const toTimeInput = (date: Date | null) => {
    if (!date) return "";
    return format(date, "HH:mm");
  };

  return (
    <>
      <Card className="h-full border-none shadow-none bg-transparent">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-lg text-gray-600">打刻履歴 (直近3日)</CardTitle>
        </CardHeader>
        <CardContent className="px-0 space-y-6">
          {records.length === 0 ? (
            <div className="text-gray-400 text-sm">履歴はありません</div>
          ) : (
            records.map((record) => (
              <div key={record.id} className="border-b border-gray-100 pb-4 last:border-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-gray-900">
                    {format(parseISO(record.date), "yyyy年MM月dd日(EEE)", { locale: ja })}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-7 text-xs px-2"
                      onClick={() => handleEditClick(record)}
                    >
                      編集
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">出勤</span>
                    <span className="font-mono text-gray-900">
                      {record.startTime ? format(record.startTime, "HH:mm") : "--:--"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">退勤</span>
                    <span className="font-mono text-gray-900">
                      {record.endTime ? format(record.endTime, "HH:mm") : "--:--"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">休憩開始</span>
                    <span className="font-mono text-gray-900">
                      {record.breakStartTime ? format(record.breakStartTime, "HH:mm") : "--:--"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">休憩終了</span>
                    <span className="font-mono text-gray-900">
                      {record.breakEndTime ? format(record.breakEndTime, "HH:mm") : "--:--"}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {isModalOpen && editingRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold mb-4">
              {format(parseISO(editingRecord.date), "yyyy年MM月dd日", { locale: ja })} の打刻編集
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">出勤</label>
                  <input
                    type="time"
                    name="startTime"
                    defaultValue={toTimeInput(editingRecord.startTime)}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">退勤</label>
                  <input
                    type="time"
                    name="endTime"
                    defaultValue={toTimeInput(editingRecord.endTime)}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">休憩開始</label>
                  <input
                    type="time"
                    name="breakStartTime"
                    defaultValue={toTimeInput(editingRecord.breakStartTime)}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">休憩終了</label>
                  <input
                    type="time"
                    name="breakEndTime"
                    defaultValue={toTimeInput(editingRecord.breakEndTime)}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="ghost" onClick={handleCloseModal}>
                  キャンセル
                </Button>
                <Button type="submit">保存</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
