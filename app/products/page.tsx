'use client'

import { useEffect, useState } from 'react'

type Product = {
  id: string
  name: string
  price: number
  stock: number
}

export default function ProductPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [name, setName] = useState('')
  const [price, setPrice] = useState(0)
  const [stock, setStock] = useState(0)

  const fetchProducts = async () => {
    const res = await fetch('/api/products')
    const data = await res.json()
    setProducts(data)
  }

  const addProduct = async () => {
    await fetch('/api/products', {
      method: 'POST',
      body: JSON.stringify({ name, price, stock }),
      headers: { 'Content-Type': 'application/json' },
    })
    setName('')
    setPrice(0)
    setStock(0)
    fetchProducts()
  }

  const deleteProduct = async (id: string) => {
    await fetch(`/api/products/${id}`, { method: 'DELETE' })
    fetchProducts()
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">จัดการสินค้า</h1>

      <div className="mb-6 flex gap-2">
        <input
          className="border p-2 rounded w-40"
          placeholder="ชื่อสินค้า"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <input
          type="number"
          className="border p-2 rounded w-28"
          placeholder="ราคา (สตางค์)"
          value={price}
          onChange={e => setPrice(Number(e.target.value))}
        />
        <input
          type="number"
          className="border p-2 rounded w-20"
          placeholder="สต็อก"
          value={stock}
          onChange={e => setStock(Number(e.target.value))}
        />
        <button
          onClick={addProduct}
          className="bg-blue-500 text-white px-4 rounded hover:bg-blue-600"
        >
          เพิ่มสินค้า
        </button>
      </div>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">ชื่อสินค้า</th>
            <th className="border p-2">ราคา</th>
            <th className="border p-2">สต็อก</th>
            <th className="border p-2">ลบ</th>
          </tr>
        </thead>
        <tbody>
          {products.map(prod => (
            <tr key={prod.id}>
              <td className="border p-2">{prod.name}</td>
              <td className="border p-2">{prod.price / 100} บาท</td>
              <td className="border p-2">{prod.stock}</td>
              <td className="border p-2 text-center">
                <button
                  onClick={() => deleteProduct(prod.id)}
                  className="text-red-500 hover:underline"
                >
                  ลบ
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
