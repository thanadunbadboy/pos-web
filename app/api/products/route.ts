// app/api/products/route.ts
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(products)
}
export async function POST(req: Request) {
  const body = await req.json()
  const { name, price, stock } = body

  if (!name || price == null || stock == null) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const product = await prisma.product.create({
    data: {
      name,
      price,
      stock,
    },
  })

  return NextResponse.json(product)
}
