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
    return NextResponse.json({ error: "Product not found" }, { status: 404 })
  }
}
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params
  const data = await req.json()

  try {
    const updated = await prisma.product.update({
      where: { id },
      data,
    })
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: "Product not found" }, { status: 404 })
  }
}
