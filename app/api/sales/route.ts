import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { items } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'รายการสินค้าไม่ถูกต้อง' },
        { status: 400 }
      )
    }

    // คำนวณ totalAmount
    const totalAmount = items.reduce(
      (sum: number, item: any) => sum + item.unitPrice * item.quantity,
      0
    )

    // สร้าง Transaction ขายพร้อมรายการสินค้า
    const sale = await prisma.sale.create({
      data: {
        totalAmount,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
    })

    // อัปเดต stock สินค้าแต่ละชิ้น (ลดจำนวนตามที่ขาย)
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      })
    }

    return NextResponse.json({ sale })
  } catch (error) {
    console.error('Error in /api/sales:', error)
    return NextResponse.json(
      { error: 'ไม่สามารถบันทึกการขายได้' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const topProducts = await prisma.saleItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 10,
      include: {
        product: true,
      },
    })

    return NextResponse.json({ topProducts })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'ไม่สามารถดึงข้อมูลได้' }, { status: 500 })
  }
}