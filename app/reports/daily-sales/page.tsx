'use client'

import { useEffect, useState } from 'react'

interface SaleSummary {
  date: string
  totalAmount: number
}

export default function DailySalesReport() {
  const [summary, setSummary] = useState<SaleSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSummary() {
      try {
        const res = await fetch('/api/reports/sales-summary')
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'เกิดข้อผิดพลาดในการโหลดข้อมูล')
        setSummary(data.summary)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchSummary()
  }, [])

  if (loading) return <p>กำลังโหลดข้อมูล...</p>
  if (error) return <p className="text-red-500">ผิดพลาด: {error}</p>
  if (summary.length === 0) return <p>ไม่มีข้อมูลยอดขาย</p>

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">รายงานยอดขายรายวัน (7 วันล่าสุด)</h1>
      <table className="w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left p-2 border">วันที่</th>
            <th className="text-right p-2 border">ยอดขาย (บาท)</th>
          </tr>
        </thead>
        <tbody>
          {summary.map(({ date, totalAmount }) => (
            <tr key={date} className="hover:bg-gray-50">
              <td className="p-2 border">{date}</td>
              <td className="p-2 border text-right">
                {(totalAmount / 100).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
