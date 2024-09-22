import { MenuItem } from "./MenuItem"

export type CartItem = MenuItem & {
    quantity: number
    cookingPreference?: 'horneada' | 'para hornear'
    isHalf?: boolean
    otherHalfId?: string
  }