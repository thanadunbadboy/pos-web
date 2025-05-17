import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // groupBy productId และรวม quantity ของแต่ละสินค้า
    const topProducts = await prisma.saleItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 10, // สินค้าขายดี 10 อันดับ
      // รวมข้อมูล product
      // Prisma groupBy ยังไม่รองรับ include โดยตรง ดังนั้นเราจะต้อง fetch แยก หรือใช้ raw query
    })

    // เนื่องจาก groupBy ไม่รองรับ include, ดึงข้อมูล product มาแมปทีหลัง
    const productIds = topProducts.map((item: { productId: any }) => item.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    })

    // แมปข้อมูลสินค้าเข้าไปใน topProducts
    const results = topProducts.map((item: { productId: string; _sum: { quantity: any } }) => {
      const product = products.find((p) => p.id === item.productId)
      return {
        productId: item.productId,
        quantitySold: item._sum.quantity,
        product,
      }
    })

    return NextResponse.json({ topProducts: results })
  } catch (error) {
    console.error('Error fetching top products:', error)
    return NextResponse.json(
      { error: 'ไม่สามารถดึงข้อมูลสินค้าขายดีได้' },
      { status: 500 }
    )
  }
}
