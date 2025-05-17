// app/pos/sales-history/page.tsx
'use client'

import { useEffect, useState } from 'react'

type SaleItem = {
  id: string
  quantity: number
  unitPrice: number
  product: {
    name: string
  }
}

type Sale = {
  id: string
  createdAt: string
  totalAmount: number
  items: SaleItem[]
}

export default function SalesHistoryPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSales() {
      const res = await fetch('/api/sales')
      const data = await res.json()
      setSales(data.sales)
      setLoading(false)
    }

    fetchSales()
  }, [])

  if (loading) return <p className="p-4">กำลังโหลด...</p>

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">ประวัติการขาย</h1>
      <div className="space-y-4">
        {sales.map((sale) => (
          <div key={sale.id} className="border rounded p-4 shadow">
            <p className="text-sm text-gray-500">
              วันที่: {new Date(sale.createdAt).toLocaleString()}
            </p>
            <p className="text-lg font-semibold">
              ยอดรวม: {(sale.totalAmount / 100).toFixed(2)} บาท
            </p>
            <ul className="mt-2 text-sm text-gray-700 list-disc pl-5">
              {sale.items.map((item) => (
                <li key={item.id}>
                  {item.product.name} × {item.quantity} ={' '}
                  {(item.unitPrice * item.quantity / 100).toFixed(2)} บาท
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
