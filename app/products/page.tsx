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

  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editName, setEditName] = useState('')
  const [editPrice, setEditPrice] = useState(0)
  const [editStock, setEditStock] = useState(0)

  const fetchProducts = async () => {
    const res = await fetch('/api/products')
    const data = await res.json()
    setProducts(data)
  }

  const addProduct = async () => {
    if (!name) return
    await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, price, stock }),
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

  const startEdit = (prod: Product) => {
    setEditingProduct(prod)
    setEditName(prod.name)
    setEditPrice(prod.price)
    setEditStock(prod.stock)
  }

  const cancelEdit = () => {
    setEditingProduct(null)
  }

  const saveEdit = async () => {
    if (!editingProduct) return
    await fetch(`/api/products/${editingProduct.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName, price: editPrice, stock: editStock }),
    })
    setEditingProduct(null)
    fetchProducts()
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">จัดการสินค้า</h1>

      {/* Form เพิ่มสินค้า */}
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

      {/* ตารางสินค้า */}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">ชื่อสินค้า</th>
            <th className="border p-2">ราคา</th>
            <th className="border p-2">สต็อก</th>
            <th className="border p-2">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {products.map(prod => (
            <tr key={prod.id} className="hover:bg-gray-50">
              {editingProduct?.id === prod.id ? (
                // Row edit mode
                <>
                  <td className="border p-2">
                    <input
                      className="border p-1 rounded w-full"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="number"
                      className="border p-1 rounded w-full"
                      value={editPrice}
                      onChange={e => setEditPrice(Number(e.target.value))}
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="number"
                      className="border p-1 rounded w-full"
                      value={editStock}
                      onChange={e => setEditStock(Number(e.target.value))}
                    />
                  </td>
                  <td className="border p-2 flex gap-2">
                    <button
                      onClick={saveEdit}
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                    >
                      บันทึก
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
                    >
                      ยกเลิก
                    </button>
                  </td>
                </>
              ) : (
                // Normal row
                <>
                  <td className="border p-2">{prod.name}</td>
                  <td className="border p-2">{(prod.price / 100).toFixed(2)} บาท</td>
                  <td className="border p-2">{prod.stock}</td>
                  <td className="border p-2 flex gap-2">
                    <button
                      onClick={() => startEdit(prod)}
                      className="text-blue-500 hover:underline"
                    >
                      แก้ไข
                    </button>
                    <button
                      onClick={() => deleteProduct(prod.id)}
                      className="text-red-500 hover:underline"
                    >
                      ลบ
                    </button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
