// app/api/sales/report/route.ts

import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const sales = await prisma.sale.findMany({
      include: { items: true },
    })

    const totalSalesAmount = sales.reduce((sum: any, sale: { totalAmount: any }) => sum + sale.totalAmount, 0)
    const totalOrders = sales.length
    const totalItemsSold = sales.reduce(
      (sum: any, sale: { items: any[] }) => sum + sale.items.reduce((sub: any, item: { quantity: any }) => sub + item.quantity, 0),
      0
    )

    return NextResponse.json({
      totalSalesAmount,
      totalOrders,
      totalItemsSold,
    })
  } catch (error) {
    return NextResponse.json({ error: 'ไม่สามารถดึงข้อมูลรายงานได้' }, { status: 500 })
  }
}
