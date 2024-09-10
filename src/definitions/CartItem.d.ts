export type CartItem = MenuItem & {
    quantity: number
    isHalf?: boolean
    otherHalfId?: string
}