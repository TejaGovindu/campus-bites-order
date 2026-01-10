import { motion } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart, MenuItem } from '@/contexts/CartContext';

interface MenuItemCardProps {
  item: MenuItem;
  index: number;
}

const MenuItemCard = ({ item, index }: MenuItemCardProps) => {
  const { items, addItem, updateQuantity } = useCart();
  const cartItem = items.find(i => i.id === item.id);
  const quantity = cartItem?.quantity || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="card-menu p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className={item.isVeg ? 'veg-indicator' : 'nonveg-indicator'} />
            <h3 className="font-medium text-foreground truncate">{item.name}</h3>
          </div>
          <p className="text-lg font-semibold text-primary">₹{item.price}</p>
        </div>
        
        <div className="flex items-center gap-2">
          {quantity === 0 ? (
            <Button
              onClick={() => addItem(item)}
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4"
            >
              ADD
            </Button>
          ) : (
            <div className="flex items-center gap-1 bg-primary/10 rounded-lg p-1">
              <Button
                onClick={() => updateQuantity(item.id, quantity - 1)}
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-primary hover:bg-primary/20"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center font-semibold text-primary">{quantity}</span>
              <Button
                onClick={() => updateQuantity(item.id, quantity + 1)}
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-primary hover:bg-primary/20"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MenuItemCard;
