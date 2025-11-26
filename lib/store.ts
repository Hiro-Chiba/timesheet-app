import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export type AttendanceStatus = 'working' | 'break' | 'left';

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string | null; // ISO string
  endTime: string | null; // ISO string
  breakStartTime: string | null; // ISO string
  breakEndTime: string | null; // ISO string
  status: AttendanceStatus;
  isEdited: boolean;
}

export interface Shift {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

interface TimeStore {
  currentStatus: AttendanceStatus;
  records: AttendanceRecord[];
  shifts: Shift[];
  
  // Actions
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
          // Already has a record for today, maybe resuming? 
          // For simplicity, if clocked out, we might not allow clock in again without edit.
          // But let's assume simple flow: if 'left', can clock in again? 
          // Let's stick to: One record per day for this simple app.
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
          shifts: [...state.shifts.filter(s => s.date !== date), newShift], // Replace existing shift for that day
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
