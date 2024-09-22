export type MenuItem = {
  id: string
  name: string
  price: number
  priceHorneada: number
  pricePorHornear: number
  category: 'pizza' | 'empanada' | 'bebida'
  image: string
}