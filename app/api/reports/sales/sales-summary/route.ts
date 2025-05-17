import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { startOfDay, endOfDay, subDays } from 'date-fns'

export async function GET() {
  try {
    // ดึงยอดขายย้อนหลัง 7 วัน
    const today = new Date()
    const sevenDaysAgo = subDays(today, 6) // รวมวันนี้ = 7 วัน

    const sales = await prisma.sale.findMany({
      where: {
        createdAt: {
          gte: startOfDay(sevenDaysAgo),
          lte: endOfDay(today),
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    // สรุปยอดขายรวมตามวันที่
    const summary: Record<string, number> = {}

    for (const sale of sales) {
      const dateStr = sale.createdAt.toISOString().split('T')[0] // YYYY-MM-DD
      summary[dateStr] = (summary[dateStr] || 0) + sale.totalAmount
    }

    // คืนค่ารูปแบบที่ใช้งานง่าย
    const result = Object.entries(summary).map(([date, totalAmount]) => ({
      date,
      totalAmount,
    }))

    return NextResponse.json({ summary: result })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
