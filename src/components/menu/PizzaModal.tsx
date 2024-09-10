import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MenuItem } from '@/definitions/MenuItem';

type PizzaModalProps = {
  isOpen: boolean;
  selectedHalfPizza: MenuItem | null;
  availablePizzas: MenuItem[];
  onAddHalfPizza: (item: MenuItem) => void;
  onClose: () => void;
};

export const PizzaModal: React.FC<PizzaModalProps> = ({ isOpen, selectedHalfPizza, availablePizzas, onAddHalfPizza, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Selecciona la otra mitad</DialogTitle>
          <DialogDescription>Elige la pizza para la otra mitad de tu {selectedHalfPizza?.name}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          {availablePizzas.map(item => (
            <Button key={item.id} onClick={() => onAddHalfPizza(item)} variant="outline">
              {item.name}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

