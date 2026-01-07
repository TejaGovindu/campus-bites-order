import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';

const CartBar = () => {
  const { totalItems, totalAmount } = useCart();
  const navigate = useNavigate();

  if (totalItems === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 p-4 z-50"
      >
        <button
          onClick={() => navigate('/cart')}
          className="w-full btn-hero flex items-center justify-between text-primary-foreground"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShoppingBag className="h-6 w-6" />
              <span className="absolute -top-2 -right-2 h-5 w-5 bg-background text-primary text-xs font-bold rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            </div>
            <span className="font-semibold">{totalItems} items</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">₹{totalAmount}</span>
            <ChevronRight className="h-5 w-5" />
          </div>
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

export default CartBar;
