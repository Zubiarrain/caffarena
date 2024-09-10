import React from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Plus, Minus } from 'lucide-react';
import { MenuItem } from '@/definitions/MenuItem';
import { CartItem } from '@/definitions/CartItem';


type MenuItemProps = {
  item: MenuItem;
  cartItem: CartItem | undefined;
  halfCartItem: CartItem | undefined;
  updateCart: (item: MenuItem, isHalf: boolean, quantity: number) => void;
  openHalfPizzaModal: (item: MenuItem) => void;
};

export const MenuItemComponent: React.FC<MenuItemProps> = ({ item, cartItem, halfCartItem, updateCart, openHalfPizzaModal }) => {
  return (
    <div key={item.id} className="bg-white p-4 rounded-lg shadow flex flex-col">
      <Image src={item.image} alt={item.name} className="w-full rounded-md mb-4" width={600} height={600} />
      <h3 className="text-lg font-semibold mb-2">{item.name}</h3>
      <p className="text-gray-600 mb-2">${item.price.toFixed(2)}</p>
      <div className="mt-auto">
        <div className="flex items-center justify-between mb-2">
          <span>Completa</span>
          <div className="flex items-center">
            <Button size="icon" variant="outline" onClick={() => updateCart(item, false, -1)} disabled={!cartItem || cartItem.quantity === 0}>
              <Minus className="h-4 w-4" />
            </Button>
            <span className="mx-2">{cartItem ? cartItem.quantity : 0}</span>
            <Button size="icon" variant="outline" onClick={() => updateCart(item, false, 1)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {item.category === 'pizza' && (
          <div className="flex items-center justify-between">
            <span>Media</span>
            <div className="flex items-center">
              <Button size="icon" variant="outline" onClick={() => updateCart(item, true, -1)} disabled={!halfCartItem || halfCartItem.quantity === 0}>
                <Minus className="h-4 w-4" />
              </Button>
              <span className="mx-2">{halfCartItem ? halfCartItem.quantity : 0}</span>
              <Button size="icon" variant="outline" onClick={() => openHalfPizzaModal(item)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
