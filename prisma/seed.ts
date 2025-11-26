import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'admin@example.com'
  const password = 'password123'
  const hashedPassword = await bcrypt.hash(password, 10)

  // 1. Upsert User
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: '管理者 太郎',
      password: hashedPassword,
      role: 'admin',
    },
  })

  console.log({ user })

  // 2. Create Attendance Records (Last 5 days)
  const today = new Date()
  for (let i = 0; i < 5; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]

    // Skip if already exists
    const existing = await prisma.attendance.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: dateStr,
        },
      },
    })

    if (!existing) {
      // 9:00 - 18:00
      const startTime = new Date(date)
      startTime.setHours(9, 0, 0, 0)
      const endTime = new Date(date)
      endTime.setHours(18, 0, 0, 0)
      const breakStart = new Date(date)
      breakStart.setHours(12, 0, 0, 0)
      const breakEnd = new Date(date)
      breakEnd.setHours(13, 0, 0, 0)

      await prisma.attendance.create({
        data: {
          userId: user.id,
          date: dateStr,
          startTime,
          endTime,
          breakStartTime: breakStart,
          breakEndTime: breakEnd,
          status: 'left',
        },
      })
      console.log(`Created attendance for ${dateStr}`)
    }
  }

  // 3. Create Shift Records (Next 5 days)
  for (let i = 1; i <= 5; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]

    const existing = await prisma.shift.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: dateStr,
        },
      },
    })

    if (!existing) {
      await prisma.shift.create({
        data: {
          userId: user.id,
          date: dateStr,
          startTime: '09:00',
          endTime: '18:00',
        },
      })
      console.log(`Created shift for ${dateStr}`)
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
