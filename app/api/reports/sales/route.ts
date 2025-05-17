import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const period = url.searchParams.get('period') || 'daily'

    if (period === 'daily') {
      // ดึงยอดขายรายวัน (ตัดเวลาออก เหลือแค่วันที่)
      const salesDaily = await prisma.$queryRaw<
        { date: string; totalAmount: number }[]
      >`
        SELECT
          date_trunc('day', "createdAt")::date AS date,
          SUM("totalAmount") AS "totalAmount"
        FROM "Sale"
        GROUP BY date
        ORDER BY date DESC
      `
      return NextResponse.json({ data: salesDaily })
    } else if (period === 'monthly') {
      // ดึงยอดขายรายเดือน
      const salesMonthly = await prisma.$queryRaw<
        { month: string; totalAmount: number }[]
      >`
        SELECT
          to_char(date_trunc('month', "createdAt"), 'YYYY-MM') AS month,
          SUM("totalAmount") AS "totalAmount"
        FROM "Sale"
        GROUP BY month
        ORDER BY month DESC
      `
      return NextResponse.json({ data: salesMonthly })
    } else {
      return NextResponse.json(
        { error: 'Invalid period. Use daily or monthly.' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error fetching sales report:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sales report' },
      { status: 500 }
    )
  }
}
