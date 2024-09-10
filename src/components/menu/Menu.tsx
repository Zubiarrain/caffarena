"use client"

import React, { useState } from 'react';
import {CartSummary} from './CartSummary';
import {PizzaModal} from './PizzaModal';
import {MenuItemComponent} from './MenuItemComponent';
import { MenuItem } from '@/definitions/MenuItem';
import { CartItem } from '@/definitions/CartItem';

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
  
    const onCompleteOrder = () => {
      setIsOrderCompletionOpen(true)
    }
  
    const sendWhatsAppMessage = () => {
      const whatsappNumber = "5492216044481" // Reemplaza con el número de WhatsApp real
      const message = formatWhatsAppMessage()
      window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank')
      setIsOrderCompletionOpen(false)
    }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-8 text-center">Nuestro Menú</h2>

      {/* Renderizado del menú */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map(item => (
          <MenuItemComponent
            key={item.id}
            item={item}
            cartItem={cart.find(i => i.id === item.id && !i.isHalf)}
            halfCartItem={cart.find(i => i.id === item.id && i.isHalf)}
            updateCart={updateCart}
            openHalfPizzaModal={openHalfPizzaModal}
          />
        ))}
      </div>

      {/* Resumen del carrito */}
      {cart.length > 0 && (
        <CartSummary
          cart={cart}
          totalPrice={getTotalPrice()}
          onViewOrder={() => setIsOrderSummaryOpen(true)}
          onCompleteOrder={() => onCompleteOrder()}
        />
      )}

      {/* Modal de selección de mitad de pizza */}
      <PizzaModal
        isOpen={isHalfPizzaModalOpen}
        selectedHalfPizza={selectedHalfPizza}
        availablePizzas={menuItems.filter(item => item.category === 'pizza' && item.id !== selectedHalfPizza?.id)}
        onAddHalfPizza={addHalfPizza}
        onClose={() => setIsHalfPizzaModalOpen(false)}
      />
    </div>
  );
}
