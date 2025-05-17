'use client'

import { useEffect, useState } from 'react'

type SaleItem = {
  id: string
  quantity: number
  unitPrice: number
  product: {
    id: string
    name: string
  }
}

type Sale = {
  id: string
  createdAt: string
  totalAmount: number
  items: SaleItem[]
}

export default function SalesReportPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/sales-report')
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error)
        else setSales(data.sales)
      })
      .catch(() => setError('ไม่สามารถโหลดข้อมูลได้'))
      .finally(() => setLoading(false))
  }, [])

  const totalSalesAmount = sales.reduce((sum, sale) => sum + sale.totalAmount, 0)

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-6">รายงานยอดขาย</h1>

      {loading && <p>กำลังโหลดข้อมูล...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && sales.length === 0 && <p>ยังไม่มีข้อมูลการขาย</p>}

      {!loading && !error && sales.length > 0 && (
        <>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2">วันที่ขาย</th>
                <th className="border border-gray-300 p-2">เลขที่บิล</th>
                <th className="border border-gray-300 p-2">รายการสินค้า</th>
                <th className="border border-gray-300 p-2">จำนวน</th>
                <th className="border border-gray-300 p-2">ราคาต่อหน่วย (บาท)</th>
                <th className="border border-gray-300 p-2">ยอดรวม (บาท)</th>
              </tr>
            </thead>
            <tbody>
              {sales.map(sale =>
                sale.items.map(item => (
                  <tr key={item.id} className="text-center">
                    {/** แสดงวันที่และเลขบิลแค่แถวแรกของแต่ละบิล */}
                    <td className="border border-gray-300 p-2" rowSpan={sale.items.length}>
                      {new Date(sale.createdAt).toLocaleString()}
                    </td>
                    <td className="border border-gray-300 p-2" rowSpan={sale.items.length}>
                      {sale.id}
                    </td>
                    <td className="border border-gray-300 p-2">{item.product.name}</td>
                    <td className="border border-gray-300 p-2">{item.quantity}</td>
                    <td className="border border-gray-300 p-2">{(item.unitPrice / 100).toFixed(2)}</td>
                    <td className="border border-gray-300 p-2">{((item.unitPrice * item.quantity) / 100).toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <p className="text-right font-semibold mt-4">
            ยอดขายรวมทั้งหมด: {(totalSalesAmount / 100).toFixed(2)} บาท
          </p>
        </>
      )}
    </main>
  )
}
