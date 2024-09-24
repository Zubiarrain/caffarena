"use client"

import React, { useState, useCallback, useEffect } from 'react'
import { Pizza, Coffee, Utensils, ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CartItem } from '@/definitions/CartItem'
import { MenuItem } from '@/definitions/MenuItem'
import { OrderDetails } from '@/definitions/OrderDetails'
import { CldImage } from 'next-cloudinary';

export default function Menu() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>()
  const [isHalfPizzaModalOpen, setIsHalfPizzaModalOpen] = useState(false)
  const [selectedHalfPizza, setSelectedHalfPizza] = useState<MenuItem | null>(null)
  const [selectedSecondHalf, setSelectedSecondHalf] = useState<MenuItem | null>(null)
  const [halfPizzaCookingPreference, setHalfPizzaCookingPreference] = useState<'horneada' | 'para hornear'>('horneada')
  const [isOrderSummaryOpen, setIsOrderSummaryOpen] = useState(false)
  const [isOrderCompletionOpen, setIsOrderCompletionOpen] = useState(false)
  const [orderDetails, setOrderDetails] = useState<OrderDetails>({
    name: '',
    deliveryType: 'pickup',
    address: {
      street: '',
      crossStreets: '',
      number: '',
      floor: ''
    }
  })

  useEffect(() => {
    const fetchMenuItems = async () => {
      const response = await fetch('/api/menu');
      const data: MenuItem[] = await response.json();
      console.log('page',data)
      setMenuItems(data);
    };

    fetchMenuItems();
  }, []);

  const updateCart = useCallback((item: MenuItem, cookingPreference?: 'horneada' | 'para hornear', quantity: number = 1) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(cartItem => 
        cartItem.id === item.id && cartItem.cookingPreference === cookingPreference && !cartItem.isHalf
      )
      if (existingItemIndex > -1) {
        const updatedCart = [...prevCart]
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: Math.max(0, updatedCart[existingItemIndex].quantity + quantity)
        }
        if (updatedCart[existingItemIndex].quantity === 0) {
          return updatedCart.filter((_, index) => index !== existingItemIndex)
        }
        return updatedCart
      }
      if (quantity > 0) {
        const price = cookingPreference === 'horneada' ? item.priceHorneada : 
                      cookingPreference === 'para hornear' ? item.pricePorHornear : 
                      item.price
        return [...prevCart, { ...item, price, quantity, cookingPreference }]
      }
      return prevCart
    })
  }, [])

  const openHalfPizzaModal = useCallback((item: MenuItem) => {
    setSelectedHalfPizza(item)
    setSelectedSecondHalf(null)
    setHalfPizzaCookingPreference('horneada')
    setIsHalfPizzaModalOpen(true)
  }, [])

  const selectSecondHalf = useCallback((secondHalf: MenuItem) => {
    setSelectedSecondHalf(secondHalf)
  }, [])

  const addHalfPizza = useCallback(() => {
    if (selectedHalfPizza && selectedSecondHalf) {
      const price = halfPizzaCookingPreference === 'horneada' 
        ? Math.max(selectedHalfPizza.priceHorneada, selectedSecondHalf.priceHorneada) 
        : Math.max(selectedHalfPizza.pricePorHornear, selectedSecondHalf.pricePorHornear)
      
      setCart(prevCart => [
        ...prevCart,
        { 
          ...selectedHalfPizza, 
          price: price / 2, 
          quantity: 1, 
          isHalf: true, 
          otherHalfId: selectedSecondHalf.id, 
          cookingPreference: halfPizzaCookingPreference 
        },
        { 
          ...selectedSecondHalf, 
          price: price / 2, 
          quantity: 1, 
          isHalf: true, 
          otherHalfId: selectedHalfPizza.id, 
          cookingPreference: halfPizzaCookingPreference 
        }
      ])
      setIsHalfPizzaModalOpen(false)
      setSelectedHalfPizza(null)
      setSelectedSecondHalf(null)
    }
  }, [selectedHalfPizza, selectedSecondHalf, halfPizzaCookingPreference])

  const removeHalfPizza = useCallback((item: CartItem) => {
    setCart(prevCart => prevCart.filter(cartItem => 
      !(cartItem.id === item.id && cartItem.isHalf) && 
      !(cartItem.id === item.otherHalfId && cartItem.isHalf)
    ))
  }, [])

  const getTotalPrice = useCallback(() => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }, [cart])

  const formatWhatsAppMessage = useCallback(() => {
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
          message += `${item.quantity}x Media ${item.name} y Media ${otherHalf.name} (${item.cookingPreference}) - $${(item.price + otherHalf.price).toFixed(2)}\n`
          processedItems.add(item.id)
          processedItems.add(otherHalf.id)
        }
      } else if (!item.isHalf) {
        message += `${item.quantity}x ${item.name} ${item.cookingPreference ? `(${item.cookingPreference})` : ''} - $${(item.price * item.quantity).toFixed(2)}\n`
      }
    })
    message += `\nTotal: $${getTotalPrice().toFixed(2)}`
    return encodeURIComponent(message)
  }, [cart, orderDetails, getTotalPrice])

  const handleCompletePedido = useCallback(() => {
    setIsOrderCompletionOpen(true)
  }, [])

  const sendWhatsAppMessage = useCallback(() => {
    const whatsappNumber = "2216044481" // Reemplaza con el número de WhatsApp real
    const message = formatWhatsAppMessage()
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank')
    setIsOrderCompletionOpen(false)
  }, [formatWhatsAppMessage])

  const renderPizzaItem = useCallback((item: MenuItem) => {
    const halfPizza = cart.find(cartItem => cartItem.id === item.id && cartItem.isHalf)
    const otherHalf = halfPizza ? cart.find(cartItem => cartItem.id === halfPizza.otherHalfId) : null
    const horneadaQuantity = cart.filter(cartItem => 
      cartItem.id === item.id && cartItem.cookingPreference === 'horneada' && !cartItem.isHalf
    ).reduce((total, item) => total + item.quantity, 0)
    const paraHornearQuantity = cart.filter(cartItem => 
      cartItem.id === item.id && cartItem.cookingPreference === 'para hornear' && !cartItem.isHalf
    ).reduce((total, item) => total + item.quantity, 0)

    return (
      <div key={item.id} className="bg-white p-4 rounded-lg shadow flex flex-col">
        <CldImage 
        src={item.image} 
        alt={item.name}
        width="500"
        height="500"
        className="w-full h-32 object-cover rounded-md mb-4" 
        />
        <h3 className="text-lg font-semibold mb-2">{item.name}</h3>
        <p className="text-gray-600 mb-4">Horneada: ${item.priceHorneada.toFixed(2)} | Para hornear: ${item.pricePorHornear.toFixed(2)}</p>
        <div className="flex flex-col gap-2 mt-auto">
          <div className="flex items-center justify-between">
            <span>Agregar Horneada</span>
            <div className="flex items-center">
              <Button
                size="icon"
                variant="outline"
                onClick={() => updateCart(item, 'horneada', -1)}
                disabled={horneadaQuantity === 0}
              >
                <Minus className="h-4 w-4" />
                <span className="sr-only">Quitar {item.name} horneada</span>
              </Button>
              <span className="mx-2">{horneadaQuantity}</span>
              <Button
                size="icon"
                variant="outline"
                onClick={() => updateCart(item, 'horneada', 1)}
              >
                <Plus className="h-4 w-4" />
                <span className="sr-only">Agregar {item.name} horneada</span>
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span>Agregar para hornear</span>
            <div className="flex items-center">
              <Button
                size="icon"
                variant="outline"
                onClick={() => updateCart(item, 'para hornear', -1)}
                disabled={paraHornearQuantity === 0}
              >
                <Minus className="h-4 w-4" />
                <span className="sr-only">Quitar {item.name} para hornear</span>
              </Button>
              <span className="mx-2">{paraHornearQuantity}</span>
              <Button
                size="icon"
                variant="outline"
                onClick={() => updateCart(item, 'para hornear', 1)}
              >
                <Plus className="h-4 w-4" />
                <span className="sr-only">Agregar {item.name} para hornear</span>
              </Button>
            </div>
          </div>
          {!halfPizza ? (
            <Button onClick={() => openHalfPizzaModal(item)} variant="outline" className="w-full">
              Media Pizza
            </Button>
          ) : (
            <div className="flex items-center justify-between bg-gray-100 p-2 rounded">
              <span className="text-sm">
                Media {item.name} + Media {otherHalf?.name}
              </span>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => removeHalfPizza(halfPizza)}
                className="h-8 w-8"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Eliminar media pizza</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }, [cart, openHalfPizzaModal, removeHalfPizza, updateCart])

  const renderOtherItem = useCallback((item: MenuItem) => {
    const quantity = cart.filter(cartItem => 
      cartItem.id === item.id && !cartItem.isHalf
    ).reduce((total, item) => total + item.quantity, 0)

    return (
      <div key={item.id} className="bg-white p-4 rounded-lg shadow flex flex-col">
        <CldImage 
        src={item.image} 
        alt={item.name}
        width="500"
        height="500"
        className="w-full h-32 object-cover rounded-md mb-4" 
        />
        <h3 className="text-lg font-semibold mb-2">{item.name}</h3>
        <p className="text-gray-600 mb-4">${item.price.toFixed(2)}</p>
        <div className="flex items-center justify-between mt-auto">
          <span>Agregar</span>
          <div className="flex items-center">
            <Button
              size="icon"
              variant="outline"
              onClick={() => updateCart(item, undefined, -1)}
              disabled={quantity === 0}
            >
              <Minus className="h-4 w-4" />
              <span className="sr-only">Quitar {item.name}</span>
            </Button>
            <span className="mx-2">{quantity}</span>
            <Button
              size="icon"
              variant="outline"
              onClick={() => updateCart(item, undefined, 1)}
            >
              <Plus className="h-4 w-4" />
              <span className="sr-only">Agregar {item.name}</span>
            </Button>
          </div>
        </div>
      </div>
    )
  }, [cart, updateCart])

  if (!menuItems) {
    return (
      <div>Cargando...</div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Nuestro Menú</h1>
      
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          <Pizza className="mr-2" /> Pizzas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.filter(item => item.category === 'pizza').map(renderPizzaItem)}
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          <Utensils className="mr-2" /> Empanadas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.filter(item => item.category === 'empanada').map(renderOtherItem)}
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          <Coffee className="mr-2" /> Bebidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.filter(item => item.category === 'bebida').map(renderOtherItem)}
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
          <div className="grid gap-4">
            <RadioGroup
              value={halfPizzaCookingPreference}
              onValueChange={(value: 'horneada' | 'para hornear') => setHalfPizzaCookingPreference(value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="horneada" id="horneada" />
                <Label htmlFor="horneada">Horneada</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="para hornear" id="para-hornear" />
                <Label htmlFor="para-hornear">Para hornear</Label>
              </div>
            </RadioGroup>
            <ScrollArea className="h-[200px]">
              {menuItems
                .filter(item => item.category === 'pizza' && item.id !== selectedHalfPizza?.id)
                .map(item => {
                  const combinedPrice = halfPizzaCookingPreference === 'horneada'
                    ? Math.max(selectedHalfPizza?.priceHorneada || 0, item.priceHorneada)
                    : Math.max(selectedHalfPizza?.pricePorHornear || 0, item.pricePorHornear);
                  return (
                    <div key={item.id} className="mb-2">
                      <Button
                        onClick={() => selectSecondHalf(item)}
                        variant={selectedSecondHalf?.id === item.id ? "default" : "outline"}
                        className="w-full justify-between"
                      >
                        <span>{item.name}</span>
                        <span>${combinedPrice.toFixed(2)}</span>
                      </Button>
                    </div>
                  );
                })
              }
            </ScrollArea>
          </div>
          <Button onClick={addHalfPizza} disabled={!selectedSecondHalf} className="w-full mt-4">
            Agregar al carrito
          </Button>
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
                        {item.quantity}x Media {item.name} y Media {otherHalf.name} ({item.cookingPreference})
                      </span>
                      <span>${((item.price + otherHalf.price) * item.quantity).toFixed(2)}</span>
                    </div>
                  )
                }
                return null
              } else if (!item.isHalf) {
                return (
                  <div key={index} className="flex justify-between items-center mb-2">
                    <span>
                      {item.quantity}x {item.name} {item.cookingPreference && `(${item.cookingPreference})`}
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