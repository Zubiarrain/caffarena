import React from 'react';
import { Button } from "@/components/ui/button";
import { ShoppingCart } from 'lucide-react';
import { CartItem } from '@/definitions/CartItem';

type CartSummaryProps = {
  cart: CartItem[];
  totalPrice: number;
  onViewOrder: () => void;
  onCompleteOrder: () => void;
};

export const CartSummary: React.FC<CartSummaryProps> = ({ cart, totalPrice, onViewOrder, onCompleteOrder }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-md p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold mb-2">Tu Pedido</h3>
          <p>Total: ${totalPrice.toFixed(2)}</p>
        </div>
        <div className="flex gap-4">
          <Button onClick={onViewOrder}>Ver Pedido</Button>
          <Button onClick={onCompleteOrder} className="bg-green-500 hover:bg-green-400">
            <ShoppingCart className="mr-2" />
            Completar Pedido
          </Button>
        </div>
      </div>
    </div>
  );
};
