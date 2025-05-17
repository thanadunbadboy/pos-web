'use client'

import { useEffect, useState } from 'react'

type Report = {
  totalSalesAmount: number
  totalOrders: number
  totalItemsSold: number
}

export default function SalesReportPage() {
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchReport() {
      const res = await fetch('/api/sales/report')
      const data = await res.json()
      setReport(data)
      setLoading(false)
    }
    fetchReport()
  }, [])

  if (loading) return <p className="p-4">กำลังโหลดรายงาน...</p>
  if (!report) return <p className="p-4 text-red-500">เกิดข้อผิดพลาด</p>

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">รายงานยอดขาย</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500">ยอดขายรวม</p>
          <p className="text-xl font-semibold text-green-600">
            {(report.totalSalesAmount / 100).toFixed(2)} บาท
          </p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500">จำนวนออเดอร์</p>
          <p className="text-xl font-semibold">{report.totalOrders}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500">จำนวนสินค้าที่ขาย</p>
          <p className="text-xl font-semibold">{report.totalItemsSold}</p>
        </div>
      </div>
    </div>
  )
}
