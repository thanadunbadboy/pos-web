'use client'
import React, { useState, useEffect } from 'react'

interface Product {
  id: string
  name: string
  price: number   // เก็บเป็นสตางค์
  stock: number
}

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}

interface SaleResponse {
  sale: {
    id: string
    createdAt: string
    totalAmount: number
    items: {
      id: string
      productId: string
      quantity: number
      unitPrice: number
    }[]
  }
}

const POS: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [receipt, setReceipt] = useState<SaleResponse['sale'] | null>(null)

 useEffect(() => {
  fetch('/api/products')
    .then(async (res) => {
      if (!res.ok) throw new Error('ไม่สามารถโหลดสินค้าได้')
      const data = await res.json()
      // ถ้า API คืนค่าเป็น array ตรง ๆ
      setProducts(data)  
      // ถ้าคืนค่าใน object ใช้ data.products ตามเดิม
    })
    .catch(() => alert('ไม่สามารถโหลดสินค้าได้'))
}, [])

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const exist = prev.find((item) => item.id === product.id)
      if (exist) {
        if (exist.quantity < product.stock) {
          return prev.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          )
        } else {
          alert('สินค้าหมดสต็อกแล้ว')
          return prev
        }
      } else {
        if (product.stock > 0) {
          return [...prev, { id: product.id, name: product.name, price: product.price, quantity: 1 }]
        } else {
          alert('สินค้าหมดสต็อกแล้ว')
          return prev
        }
      }
    })
  }

  const decreaseQuantity = (id: string) => {
    setCart((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0)
    )
  }

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handleConfirmSale = async () => {
    if (cart.length === 0) {
      alert('ตะกร้าว่าง')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map((item) => ({
            productId: item.id,       // ตาม schema ของคุณ
            quantity: item.quantity,
            unitPrice: item.price,
          })),
        }),
      })
      if (!res.ok) throw new Error('ขายไม่สำเร็จ')
      const data: SaleResponse = await res.json()
      setReceipt(data.sale)
      setCart([])
    } catch (error) {
      alert('ขายไม่สำเร็จ')
    } finally {
      setLoading(false)
    }
  }

  if (receipt) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <h2 className="text-xl font-bold mb-2">ใบเสร็จ</h2>
        <div>รหัสขาย: {receipt.id}</div>
        <div>วันที่: {new Date(receipt.createdAt).toLocaleString()}</div>
        <div>ยอดรวม: {(receipt.totalAmount / 100).toFixed(2)} ฿</div>
        <h3 className="mt-4 font-semibold">รายการสินค้า</h3>
        <ul>
         {receipt.items && receipt.items.length > 0 ? (
  receipt.items.map((item) => (
    <li key={item.id}>
      สินค้า ID: {item.productId} | จำนวน: {item.quantity} | ราคาต่อหน่วย: {(item.unitPrice / 100).toFixed(2)} ฿
    </li>
  ))
) : (
  <li>ไม่มีรายการสินค้า</li>
)}  
        </ul>
        <button
          onClick={() => setReceipt(null)}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        >
          ขายสินค้าใหม่
        </button>
      </div>
    )
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">POS - ขายสินค้า</h1>

      <div className="grid grid-cols-2 gap-8">
        {/* สินค้า */}
        <div>
          <h2 className="text-xl font-semibold mb-2">สินค้า</h2>
          <ul>
            <ul>
      {products.map((product) => (
        <li
          key={product.id}
          className="flex justify-between items-center p-2 border mb-2 rounded"
        >
          <div>
            <div className="font-medium">{product.name}</div>
            <div className="text-sm text-gray-600">
              {(product.price / 100).toFixed(2)} ฿ - สต็อก {product.stock}
            </div>
          </div>
          <button
            onClick={() => addToCart(product)}
            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
            disabled={product.stock === 0}
          >
            หยิบใส่ตะกร้า
          </button>
        </li>
      ))}
    </ul>
          </ul>
        </div>

        {/* ตะกร้าสินค้า */}
        <div>
          <h2 className="text-xl font-semibold mb-2">ตะกร้าสินค้า</h2>
          {cart.length === 0 ? (
            <p>ตะกร้าว่าง</p>
          ) : (
            <ul>
              {cart.map((item) => (
                <li
                  key={item.id}
                  className="flex justify-between items-center p-2 border mb-2 rounded"
                >
                  <div>
                    <div>{item.name}</div>
                    <div className="text-sm text-gray-600">
                      {(item.price / 100).toFixed(2)} ฿ x {item.quantity}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => decreaseQuantity(item.id)}
                      className="px-2 py-0.5 bg-yellow-400 rounded"
                    >
                      -
                    </button>
                    <button
                      onClick={() => {
                        const product = products.find((p) => p.id === item.id)
                        if (product) addToCart(product)
                      }}
                      className="px-2 py-0.5 bg-yellow-400 rounded"
                      disabled={
                        products.find((p) => p.id === item.id)?.stock === item.quantity
                      }
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="px-2 py-0.5 bg-red-600 text-white rounded"
                    >
                      ลบ
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 font-bold">
            ราคารวม: {(totalPrice / 100).toFixed(2)} ฿
          </div>
          <button
            onClick={handleConfirmSale}
            disabled={loading || cart.length === 0}
            className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            {loading ? 'กำลังบันทึก...' : 'ยืนยันการขาย'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default POS
