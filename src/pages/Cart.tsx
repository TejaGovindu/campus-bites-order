import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Cart = () => {
  const navigate = useNavigate();
  const { items, tableNumber, updateQuantity, removeItem, totalAmount, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePlaceOrder = async () => {
    if (!tableNumber || items.length === 0) return;

    setIsSubmitting(true);
    try {
      const orderItems = items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      }));

      const { error } = await supabase.from('orders').insert({
        table_number: tableNumber,
        items: orderItems,
        status: 'new',
      });

      if (error) throw error;

      clearCart();
      navigate('/confirmation', {
        state: { total: totalAmount, tableNumber },
      });
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-40 glass-effect border-b border-border">
          <div className="flex items-center gap-4 p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/categories')}
              className="text-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold text-foreground">Your Order</h1>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <ShoppingBag className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Add some delicious items to get started</p>
          <Button onClick={() => navigate('/categories')} className="btn-hero text-primary-foreground">
            Browse Menu
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="sticky top-0 z-40 glass-effect border-b border-border">
        <div className="flex items-center gap-4 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Your Order</h1>
            <p className="text-sm text-muted-foreground">Table {tableNumber}</p>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="p-4 space-y-3">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="card-menu p-4"
          >
            <div className="flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className={item.isVeg ? 'veg-indicator' : 'nonveg-indicator'} />
                  <h3 className="font-medium text-foreground truncate">{item.name}</h3>
                </div>
                <p className="text-primary font-semibold">₹{item.price * item.quantity}</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-primary/10 rounded-lg p-1">
                  <Button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-primary hover:bg-primary/20"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-semibold text-primary">{item.quantity}</span>
                  <Button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-primary hover:bg-primary/20"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  onClick={() => removeItem(item.id)}
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-destructive hover:bg-destructive/20"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Order Summary */}
      <div className="fixed bottom-0 left-0 right-0 glass-effect border-t border-border p-4 space-y-4">
        <div className="flex items-center justify-between text-lg">
          <span className="font-medium text-foreground">Total Amount</span>
          <span className="font-bold text-primary text-xl">₹{totalAmount}</span>
        </div>
        <Button
          onClick={handlePlaceOrder}
          disabled={isSubmitting}
          className="w-full btn-hero text-primary-foreground"
        >
          {isSubmitting ? 'Placing Order...' : 'Place Order'}
        </Button>
      </div>
    </div>
  );
};

export default Cart;
