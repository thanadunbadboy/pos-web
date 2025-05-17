'use client'

import { useEffect, useState } from 'react'

type Product = {
  id: string
  name: string
  price: number
  stock: number
}

type CartItem = {
  productId: string
  name: string
  price: number
  quantity: number
}

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => setProducts(data))
  }, [])

  const handleAddToCart = (product: Product) => {
    // เช็คว่าใน cart มีอยู่แล้วไหม
    const exists = cart.find((item) => item.productId === product.id)
    if (exists) {
      // ถ้ายังมี stock เหลือ → เพิ่ม
      const stockLeft = product.stock - exists.quantity
      if (stockLeft <= 0) return alert('สต็อกไม่พอแล้ว')

      setCart((prev) =>
        prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      )
    } else {
      if (product.stock <= 0) return alert('สินค้าหมด')
      setCart((prev) => [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
        },
      ])
    }
  }

  // คำนวณจำนวนที่เลือกแล้วแต่ละชิ้น
  const getCartQuantity = (productId: string) => {
    return cart.find((item) => item.productId === productId)?.quantity || 0
  }
  const handleConfirmSale = async () => {
  if (cart.length === 0) {
    alert('กรุณาเพิ่มสินค้าก่อนยืนยันการขาย')
    return
  }

  try {
    // เตรียมข้อมูล saleItems สำหรับส่งไป API
    const saleItems = cart.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.price,
    }))

    const res = await fetch('/api/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: saleItems }),
    })

    if (!res.ok) {
      const data = await res.json()
      alert('ขายไม่สำเร็จ: ' + (data.error || 'เกิดข้อผิดพลาด'))
      return
    }

    alert('ขายสำเร็จ!')

    // เคลียร์ตะกร้า
    setCart([])

    // รีเฟรชสินค้า เพื่ออัปเดต stock ใหม่
    const productsRes = await fetch('/api/products')
    const productsData = await productsRes.json()
    setProducts(productsData)
  } catch (error) {
    alert('เกิดข้อผิดพลาด: ' + error)
  }
}


  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">ขายสินค้า</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => {
          const inCartQty = getCartQuantity(product.id)
          const stockLeft = product.stock - inCartQty

          return (
            <div key={product.id} className="border rounded p-3">
              <p className="font-medium">{product.name}</p>
              <p className="text-sm text-gray-500">
                ราคา: {(product.price / 100).toFixed(2)} บาท
              </p>
              <p
                className={`text-sm ${
                  stockLeft <= 0 ? 'text-red-500' : 'text-green-600'
                }`}
              >
                สต็อก: {stockLeft}
              </p>
              <button
                className="mt-2 bg-blue-500 text-white text-sm px-2 py-1 rounded disabled:opacity-50"
                onClick={() => handleAddToCart(product)}
                disabled={stockLeft <= 0}
              >
                หยิบใส่ตะกร้า
              </button>
            </div>
          )
        })}
      </div>
      <div className="mt-8 border-t pt-4">
  <h2 className="text-xl font-semibold mb-2">ตะกร้า</h2>

  {cart.length === 0 ? (
    <p className="text-gray-500">ยังไม่มีสินค้า</p>
  ) : (
    <ul className="space-y-3">
      {cart.map((item) => (
        <li key={item.productId} className="flex items-center justify-between">
          <div>
            <p className="font-medium">{item.name}</p>
            <p className="text-sm text-gray-500">
              {item.quantity} × {(item.price / 100).toFixed(2)} ={' '}
              {((item.quantity * item.price) / 100).toFixed(2)} บาท
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setCart((prev) =>
                  prev.map((p) =>
                    p.productId === item.productId
                      ? { ...p, quantity: p.quantity + 1 }
                      : p
                  )
                )
              }
              className="bg-green-500 text-white px-2 rounded"
            >
              +
            </button>
            <button
              onClick={() => {
                const found = cart.find((p) => p.productId === item.productId)
                if (!found) return
                if (found.quantity <= 1) {
                  setCart((prev) =>
                    prev.filter((p) => p.productId !== item.productId)
                  )
                } else {
                  setCart((prev) =>
                    prev.map((p) =>
                      p.productId === item.productId
                        ? { ...p, quantity: p.quantity - 1 }
                        : p
                    )
                  )
                }
              }}
              className="bg-yellow-500 text-white px-2 rounded"
            >
              -
            </button>
            <button
              onClick={() =>
                setCart((prev) =>
                  prev.filter((p) => p.productId !== item.productId)
                )
              }
              className="bg-red-500 text-white px-2 rounded"
            >
              ❌
            </button>
          </div>
        </li>
      ))}
    </ul>
  )}
</div>
<button
  onClick={handleConfirmSale}
  disabled={cart.length === 0}
  className="mt-4 bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
>
  ยืนยันการขาย
</button>


      {/* แสดงตะกร้าด้านล่าง */}
      <div className="mt-8 border-t pt-4">
        <h2 className="text-xl font-semibold mb-2">ตะกร้า</h2>
        {cart.length === 0 ? (
          <p className="text-gray-500">ยังไม่มีสินค้า</p>
        ) : (
          <ul className="space-y-2">
            {cart.map((item) => (
              <li key={item.productId}>
                {item.name} × {item.quantity} ={' '}
                {(item.quantity * item.price / 100).toFixed(2)} บาท
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

