'use client'

import { useEffect, useState } from 'react'

type Product = {
  id: string
  name: string
  price: number
  stock: number
}

type CartItem = {
  product: Product
  quantity: number
}

export default function SalePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])

  const fetchProducts = async () => {
    const res = await fetch('/api/products')
    const data = await res.json()
    setProducts(data)
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id)
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        return [...prev, { product, quantity: 1 }]
      }
    })
  }

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId))
  }

  const updateQuantity = (productId: string, qty: number) => {
    if (qty < 1) return
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity: qty } : item
      )
    )
  }

  const total = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )

  const checkout = async () => {
    const res = await fetch('/api/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cart.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      }),
    })
    if (res.ok) {
      alert('ขายสำเร็จ!')
      setCart([])
      fetchProducts()
    } else {
      alert('เกิดข้อผิดพลาด')
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">ขายสินค้า</h1>
      <div className="grid grid-cols-3 gap-4 mb-8">
        {products.map(prod => (
          <div
            key={prod.id}
            className="border p-4 rounded shadow hover:bg-gray-100 cursor-pointer"
            onClick={() => addToCart(prod)}
          >
            <h2 className="font-semibold">{prod.name}</h2>
            <p>{(prod.price / 100).toFixed(2)} บาท</p>
            <p className="text-sm text-gray-500">คงเหลือ: {prod.stock}</p>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-bold mb-2">ตะกร้าสินค้า</h2>
      {cart.length === 0 ? (
        <p className="text-gray-500">ยังไม่มีสินค้าในตะกร้า</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">สินค้า</th>
              <th className="border p-2">จำนวน</th>
              <th className="border p-2">ราคารวม</th>
              <th className="border p-2">ลบ</th>
            </tr>
          </thead>
          <tbody>
            {cart.map(item => (
              <tr key={item.product.id}>
                <td className="border p-2">{item.product.name}</td>
                <td className="border p-2">
                  <input
                    type="number"
                    className="w-16 border p-1 rounded"
                    value={item.quantity}
                    onChange={e => updateQuantity(item.product.id, Number(e.target.value))}
                  />
                </td>
                <td className="border p-2">
                  {((item.product.price * item.quantity) / 100).toFixed(2)} บาท
                </td>
                <td className="border p-2 text-center">
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-red-500 hover:underline"
                  >
                    ลบ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {cart.length > 0 && (
        <div className="mt-4 flex justify-between items-center">
          <h3 className="text-lg font-bold">รวมทั้งหมด: {(total / 100).toFixed(2)} บาท</h3>
          <button
            onClick={checkout}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            ชำระเงิน
          </button>
        </div>
      )}
    </div>
  )
}
