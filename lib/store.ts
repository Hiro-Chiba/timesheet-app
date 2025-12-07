import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export type AttendanceStatus = 'working' | 'break' | 'left';

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD 形式
  startTime: string | null; // ISO 文字列
  endTime: string | null; // ISO 文字列
  breakStartTime: string | null; // ISO 文字列
  breakEndTime: string | null; // ISO 文字列
  status: AttendanceStatus;
  isEdited: boolean;
}

export interface Shift {
  id: string;
  date: string; // YYYY-MM-DD 形式
  startTime: string; // HH:mm 形式
  endTime: string; // HH:mm 形式
}

interface TimeStore {
  currentStatus: AttendanceStatus;
  records: AttendanceRecord[];
  shifts: Shift[];

  // アクション
  clockIn: () => void;
  clockOut: () => void;
  startBreak: () => void;
  endBreak: () => void;
  updateRecord: (id: string, updates: Partial<AttendanceRecord>) => void;
  getTodayRecord: () => AttendanceRecord | undefined;
  addShift: (date: string, startTime: string, endTime: string) => void;
  deleteShift: (id: string) => void;
}

export const useTimeStore = create<TimeStore>()(
  persist(
    (set, get) => ({
      currentStatus: 'left',
      records: [],
      shifts: [],

      clockIn: () => {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const existing = get().records.find(r => r.date === todayStr);

        if (existing) {
          // 既に当日の記録がある場合は新規作成しない
          // 本来は再入室を許可するなどの分岐が必要だが、シンプルに1日1件に制限
          return;
        }

        const newRecord: AttendanceRecord = {
          id: uuidv4(),
          date: todayStr,
          startTime: now.toISOString(),
          endTime: null,
          breakStartTime: null,
          breakEndTime: null,
          status: 'working',
          isEdited: false,
        };

        set(state => ({
          currentStatus: 'working',
          records: [newRecord, ...state.records],
        }));
      },

      clockOut: () => {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        
        set(state => {
          const records = state.records.map(r => {
            if (r.date === todayStr && !r.endTime) {
              return { ...r, endTime: now.toISOString(), status: 'left' as AttendanceStatus };
            }
            return r;
          });
          return { currentStatus: 'left', records };
        });
      },

      startBreak: () => {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        set(state => {
          const records = state.records.map(r => {
            if (r.date === todayStr && r.status === 'working') {
              return { ...r, breakStartTime: now.toISOString(), status: 'break' as AttendanceStatus };
            }
            return r;
          });
          return { currentStatus: 'break', records };
        });
      },

      endBreak: () => {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        set(state => {
          const records = state.records.map(r => {
            if (r.date === todayStr && r.status === 'break') {
              return { ...r, breakEndTime: now.toISOString(), status: 'working' as AttendanceStatus };
            }
            return r;
          });
          return { currentStatus: 'working', records };
        });
      },

      updateRecord: (id, updates) => {
        set(state => ({
          records: state.records.map(r => 
            r.id === id ? { ...r, ...updates, isEdited: true } : r
          ),
        }));
      },

      getTodayRecord: () => {
        const todayStr = new Date().toISOString().split('T')[0];
        return get().records.find(r => r.date === todayStr);
      },

      addShift: (date, startTime, endTime) => {
        const newShift: Shift = {
          id: uuidv4(),
          date,
          startTime,
          endTime,
        };
        set(state => ({
          shifts: [...state.shifts.filter(s => s.date !== date), newShift], // 同じ日のシフトは置き換え
        }));
      },

      deleteShift: (id) => {
        set(state => ({
          shifts: state.shifts.filter(s => s.id !== id),
        }));
      },
    }),
    {
      name: 'time-tracking-storage',
    }
  )
);
