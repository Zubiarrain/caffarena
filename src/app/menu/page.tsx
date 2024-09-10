"use client"

import React, { useState } from 'react'
import { Pizza, Coffee, Utensils, ShoppingCart, Plus, Minus } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import Image from 'next/image'
import { MenuItem } from '@/definitions/MenuItem'
import { CartItem } from '@/definitions/CartItem'

const menuItems: MenuItem[] = [
  { id: 'p1', name: 'Margherita', price: 10, category: 'pizza', image: '/pizza.jpg' },
  { id: 'p2', name: 'Pepperoni', price: 12, category: 'pizza', image: '/pizza.jpg' },
  { id: 'p3', name: 'Vegetariana', price: 11, category: 'pizza', image: '/pizza.jpg' },
  { id: 'e1', name: 'Carne', price: 2, category: 'empanada', image: '/pizza.jpg' },
  { id: 'e2', name: 'Pollo', price: 2, category: 'empanada', image: '/pizza.jpg' },
  { id: 'b1', name: 'Coca-Cola', price: 2, category: 'bebida', image: '/pizza.jpg' },
  { id: 'b2', name: 'Agua', price: 1, category: 'bebida', image: '/pizza.jpg' },
]

export default function Component() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isHalfPizzaModalOpen, setIsHalfPizzaModalOpen] = useState(false)
  const [selectedHalfPizza, setSelectedHalfPizza] = useState<MenuItem | null>(null)
  const [isOrderSummaryOpen, setIsOrderSummaryOpen] = useState(false)
  const [isOrderCompletionOpen, setIsOrderCompletionOpen] = useState(false)
  const [orderDetails, setOrderDetails] = useState({
    name: '',
    deliveryType: 'pickup',
    address: {
      street: '',
      crossStreets: '',
      number: '',
      floor: ''
    }
  })

  const updateCart = (item: MenuItem, isHalf: boolean = false, quantity: number) => {
    setCart(prevCart => {
      let updatedCart = [...prevCart]
      const existingItemIndex = updatedCart.findIndex(cartItem => 
        cartItem.id === item.id && cartItem.isHalf === isHalf
      )

      if (existingItemIndex > -1) {
        updatedCart[existingItemIndex].quantity += quantity
        if (updatedCart[existingItemIndex].quantity <= 0) {
          if (isHalf) {
            updatedCart = updatedCart.filter(cartItem => 
              !(cartItem.isHalf && (cartItem.id === item.id || cartItem.otherHalfId === item.id))
            )
          } else {
            updatedCart.splice(existingItemIndex, 1)
          }
        }
      } else if (quantity > 0) {
        updatedCart.push({ ...item, quantity, isHalf })
      }

      return updatedCart
    })
  }

  const openHalfPizzaModal = (item: MenuItem) => {
    setSelectedHalfPizza(item)
    setIsHalfPizzaModalOpen(true)
  }

  const addHalfPizza = (secondHalf: MenuItem) => {
    if (selectedHalfPizza) {
      setCart(prevCart => [
        ...prevCart,
        { ...selectedHalfPizza, quantity: 1, isHalf: true, otherHalfId: secondHalf.id },
        { ...secondHalf, quantity: 1, isHalf: true, otherHalfId: selectedHalfPizza.id }
      ])
      setIsHalfPizzaModalOpen(false)
      setSelectedHalfPizza(null)
    }
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => {
      const itemPrice = item.isHalf ? item.price / 2 : item.price
      return total + itemPrice * item.quantity
    }, 0)
  }

  const formatWhatsAppMessage = () => {
    let message = `Hola, me gustaría hacer el siguiente pedido:\n\n`
    message += `Nombre: ${orderDetails.name}\n`
    message += `Tipo de entrega: ${orderDetails.deliveryType === 'pickup' ? 'Retiro en local' : 'Envío a domicilio'}\n\n`
    
    if (orderDetails.deliveryType === 'delivery') {
      message += `Dirección de entrega:\n`
      message += `Calle: ${orderDetails.address.street}\n`
      message += `Entre calles: ${orderDetails.address.crossStreets}\n`
      message += `Número: ${orderDetails.address.number}\n`
      message += `Piso: ${orderDetails.address.floor}\n\n`
    }

    message += `Pedido:\n`
    const processedItems = new Set()
    cart.forEach(item => {
      if (item.isHalf && !processedItems.has(item.id)) {
        const otherHalf = cart.find(i => i.id === item.otherHalfId)
        if (otherHalf) {
          message += `${item.quantity}x Media ${item.name} y Media ${otherHalf.name} - $${item.price}\n`
          processedItems.add(item.id)
          processedItems.add(otherHalf.id)
        }
      } else if (!item.isHalf) {
        message += `${item.quantity}x ${item.name} - $${item.price * item.quantity}\n`
      }
    })
    message += `\nTotal: $${getTotalPrice().toFixed(2)}`
    return encodeURIComponent(message)
  }

  const handleCompletePedido = () => {
    setIsOrderCompletionOpen(true)
  }

  const sendWhatsAppMessage = () => {
    const whatsappNumber = "5492216044481" // Reemplaza con el número de WhatsApp real
    const message = formatWhatsAppMessage()
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank')
    setIsOrderCompletionOpen(false)
  }

  const renderMenuItem = (item: MenuItem) => {
    const cartItem = cart.find(i => i.id === item.id && !i.isHalf)
    const halfCartItem = cart.find(i => i.id === item.id && i.isHalf)

    return (
      <div key={item.id} className="bg-white p-4 rounded-lg shadow flex flex-col">
        <Image 
        src={item.image} 
        alt={item.name} 
        className="w-full rounded-md mb-4" 
        width={600}
        height={600}
        />
        <h3 className="text-lg font-semibold mb-2">{item.name}</h3>
        <p className="text-gray-600 mb-2">${item.price.toFixed(2)}</p>
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-2">
            <span>Completa</span>
            <div className="flex items-center">
              <Button 
                size="icon"
                variant="outline"
                onClick={() => updateCart(item, false, -1)}
                disabled={!cartItem || cartItem.quantity === 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="mx-2">{cartItem ? cartItem.quantity : 0}</span>
              <Button 
                size="icon"
                variant="outline"
                onClick={() => updateCart(item, false, 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {item.category === 'pizza' && (
            <div className="flex items-center justify-between">
              <span>Media</span>
              <div className="flex items-center">
                <Button 
                  size="icon"
                  variant="outline"
                  onClick={() => updateCart(item, true, -1)}
                  disabled={!halfCartItem || halfCartItem.quantity === 0}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="mx-2">{halfCartItem ? halfCartItem.quantity : 0}</span>
                <Button 
                  size="icon"
                  variant="outline"
                  onClick={() => openHalfPizzaModal(item)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-8 text-center">Nuestro Menú</h2>
      
      <div className="mb-12">
        <h3 className="text-2xl font-semibold mb-4 flex items-center">
          <Pizza className="mr-2" /> Pizzas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.filter(item => item.category === 'pizza').map(renderMenuItem)}
        </div>
      </div>

      <div className="mb-12">
        <h3 className="text-2xl font-semibold mb-4 flex items-center">
          <Utensils className="mr-2" /> Empanadas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.filter(item => item.category === 'empanada').map(renderMenuItem)}
        </div>
      </div>

      <div className="mb-12">
        <h3 className="text-2xl font-semibold mb-4 flex items-center">
          <Coffee className="mr-2" /> Bebidas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.filter(item => item.category === 'bebida').map(renderMenuItem)}
        </div>
      </div>

      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-md p-4">
          <div className="container mx-auto flex justify-between items-center">
            <div>
              <h3 className="text-xl font-semibold mb-2">Tu Pedido</h3>
              <p>Total: ${getTotalPrice().toFixed(2)}</p>
            </div>
            <div className="flex gap-4">
              <Button onClick={() => setIsOrderSummaryOpen(true)}>
                Ver Pedido
              </Button>
              <Button onClick={handleCompletePedido} className="bg-green-500 hover:bg-green-400">
                <ShoppingCart className="mr-2" />
                Completar Pedido
              </Button>
            </div>
          </div>
        </div>
      )}

      <Dialog open={isHalfPizzaModalOpen} onOpenChange={setIsHalfPizzaModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Selecciona la otra mitad</DialogTitle>
            <DialogDescription>
              Elige la pizza para la otra mitad de tu {selectedHalfPizza?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            {menuItems
              .filter(item => item.category === 'pizza' && item.id !== selectedHalfPizza?.id)
              .map(item => (
                <Button key={item.id} onClick={() => addHalfPizza(item)} variant="outline">
                  {item.name}
                </Button>
              ))
            }
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isOrderSummaryOpen} onOpenChange={setIsOrderSummaryOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Resumen del Pedido</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[300px] w-full pr-4">
            {cart.map((item, index) => {
              if (item.isHalf && item.otherHalfId) {
                const otherHalf = cart.find(i => i.id === item.otherHalfId)
                if (otherHalf && item.id < otherHalf.id) {
                  return (
                    <div key={index} className="flex justify-between items-center mb-2">
                      <span>
                        {item.quantity}x Media {item.name} y Media {otherHalf.name}
                      </span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  )
                }
                return null
              } else if (!item.isHalf) {
                return (
                  <div key={index} className="flex justify-between items-center mb-2">
                    <span>
                      {item.quantity}x {item.name}
                    </span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                )
              }
              return null
            })}
          </ScrollArea>
          <div className="mt-4 flex justify-between items-center font-bold">
            <span>Total:</span>
            <span>${getTotalPrice().toFixed(2)}</span>
          </div>
          <Button onClick={handleCompletePedido} className="w-full mt-4 bg-green-500 hover:bg-green-400">
            <ShoppingCart className="mr-2" />
            Completar Pedido
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={isOrderCompletionOpen} onOpenChange={setIsOrderCompletionOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Completar Pedido</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={orderDetails.name}
                onChange={(e) => setOrderDetails({...orderDetails, name: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label>Tipo de entrega</Label>
              <RadioGroup
                value={orderDetails.deliveryType}
                onValueChange={(value: 'pickup' | 'delivery') => setOrderDetails({...orderDetails, deliveryType: value})}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pickup" id="pickup" />
                  <Label htmlFor="pickup">Retiro en local</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="delivery" id="delivery" />
                  <Label htmlFor="delivery">Envío a domicilio</Label>
                </div>
              </RadioGroup>
            </div>
            {orderDetails.deliveryType === 'delivery' && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="street">Calle</Label>
                  <Input
                    id="street"
                    value={orderDetails.address.street}
                    onChange={(e) => setOrderDetails({...orderDetails, address: {...orderDetails.address, street: e.target.value}})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="crossStreets">Entre calles</Label>
                  <Input
                    id="crossStreets"
                    value={orderDetails.address.crossStreets}
                    onChange={(e) => setOrderDetails({...orderDetails, address: {...orderDetails.address, crossStreets: e.target.value}})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="number">Número</Label>
                  <Input
                    id="number"
                    value={orderDetails.address.number}
                    onChange={(e) => setOrderDetails({...orderDetails, address: {...orderDetails.address, number: e.target.value}})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="floor">Piso</Label>
                  <Input
                    id="floor"
                    value={orderDetails.address.floor}
                    onChange={(e) => setOrderDetails({...orderDetails, address: {...orderDetails.address, floor: e.target.value}})}
                  />
                </div>
              </>
            )}
          </div>
          <Button onClick={sendWhatsAppMessage} className="w-full bg-green-500 hover:bg-green-400">
            <ShoppingCart className="mr-2" />
            Enviar Pedido
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}