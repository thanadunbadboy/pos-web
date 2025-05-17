import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
} else {
  // @ts-ignore
  if (!global.prisma) {
    // สร้าง client ใหม่ใน dev mode ถ้ายังไม่มี
    global.prisma = new PrismaClient()
  }
  // ใช้ตัวเดิมถ้ามีแล้ว
  prisma = global.prisma
}

export { prisma }
