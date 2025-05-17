// app/api/products/[id]/route.ts
import { PrismaClient } from "@prisma/client"
import { NextResponse } from "next/server"

const prisma = new PrismaClient()

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params

  try {
    const deleted = await prisma.product.delete({
      where: { id },
    })
    return NextResponse.json(deleted)
  } catch (error) {
  console.error(error);
  // handle error
}
}
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params
  const { name, price, stock } = await req.json()
  if (!name || price == null || stock == null) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  try {
    const updated = await prisma.product.update({
      where: { id },
      data: { name, price, stock },
    })
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: "Product not found" }, { status: 404 })
  }
}
// app/api/products/route.ts


export async function GET() {
  const products = await prisma.product.findMany({
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(products)
}
