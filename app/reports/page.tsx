'use client'

import { useEffect, useState } from 'react'

interface Product {
  id: string
  name: string
  price: number
  stock: number
}

interface TopProduct {
  productId: string
  quantitySold: number
  product: Product
}

export default function TopProductsReport() {
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTopProducts() {
      try {
        const res = await fetch('/api/reports/top-products')
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Error fetching data')
        setTopProducts(data.topProducts)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchTopProducts()
  }, [])

  if (loading) return <p>กำลังโหลดข้อมูล...</p>
  if (error) return <p>เกิดข้อผิดพลาด: {error}</p>
  if (topProducts.length === 0) return <p>ไม่มีข้อมูลสินค้าขายดี</p>

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">รายงานสินค้าขายดี 10 อันดับ</h1>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2 text-left">ชื่อสินค้า</th>
            <th className="border border-gray-300 p-2 text-right">จำนวนที่ขายได้</th>
            <th className="border border-gray-300 p-2 text-right">ราคา (บาท)</th>
            <th className="border border-gray-300 p-2 text-right">สต็อกคงเหลือ</th>
          </tr>
        </thead>
        <tbody>
          {topProducts.map(({ product, quantitySold }) => (
            <tr key={product.id} className="hover:bg-gray-50">
              <td className="border border-gray-300 p-2">{product.name}</td>
              <td className="border border-gray-300 p-2 text-right">{quantitySold}</td>
              <td className="border border-gray-300 p-2 text-right">{(product.price / 100).toFixed(2)}</td>
              <td className="border border-gray-300 p-2 text-right">{product.stock}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
