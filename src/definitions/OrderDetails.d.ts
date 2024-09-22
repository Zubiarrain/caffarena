export type OrderDetails = {
    name: string
    deliveryType: 'pickup' | 'delivery'
    address: {
      street: string
      crossStreets: string
      number: string
      floor: string
    }
  }