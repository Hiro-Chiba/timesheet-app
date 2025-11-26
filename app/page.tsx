import HomeClient from "@/components/HomeClient";
import { getTodayAttendance } from "@/app/actions";


export const dynamic = 'force-dynamic';

export default async function Home() {
  const attendance = await getTodayAttendance();
  
  let initialStatus: 'working' | 'break' | 'left' = 'left';
  
  if (attendance) {
    if (attendance.status === 'working') initialStatus = 'working';
    else if (attendance.status === 'break') initialStatus = 'break';
    else if (attendance.status === 'left') initialStatus = 'left';
  }

  return <HomeClient initialStatus={initialStatus} />;
}
