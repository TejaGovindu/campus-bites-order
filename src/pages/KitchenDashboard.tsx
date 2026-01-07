import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChefHat, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import OrderCard from '@/components/OrderCard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  table_number: number;
  items: OrderItem[];
  status: string;
  created_at: string;
}

const KitchenDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .neq('status', 'done')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Parse items from JSON
      const parsedOrders = (data || []).map(order => ({
        ...order,
        items: Array.isArray(order.items) ? order.items : JSON.parse(order.items as string || '[]'),
      })) as Order[];
      
      setOrders(parsedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('Realtime update:', payload);
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      
      toast.success(`Order marked as ${newStatus}`);
      
      // If done, remove from list after animation
      if (newStatus === 'done') {
        setTimeout(() => {
          setOrders(prev => prev.filter(o => o.id !== orderId));
        }, 500);
      } else {
        setOrders(prev =>
          prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
      }
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order');
    }
  };

  const newOrders = orders.filter(o => o.status === 'new');
  const preparingOrders = orders.filter(o => o.status === 'preparing');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 glass-effect border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
              <ChefHat className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Kitchen Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                {orders.length} active order{orders.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={fetchOrders}
            className="border-border text-foreground"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* New Orders */}
        {newOrders.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-primary animate-pulse" />
              New Orders ({newOrders.length})
            </h2>
            <div className="space-y-3">
              {newOrders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <OrderCard
                    id={order.id}
                    tableNumber={order.table_number}
                    items={order.items}
                    status={order.status}
                    createdAt={order.created_at}
                    onStatusChange={handleStatusChange}
                  />
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Preparing Orders */}
        {preparingOrders.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-amber-500" />
              Preparing ({preparingOrders.length})
            </h2>
            <div className="space-y-3">
              {preparingOrders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <OrderCard
                    id={order.id}
                    tableNumber={order.table_number}
                    items={order.items}
                    status={order.status}
                    createdAt={order.created_at}
                    onStatusChange={handleStatusChange}
                  />
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {orders.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <ChefHat className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">No active orders</h2>
            <p className="text-muted-foreground">New orders will appear here automatically</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KitchenDashboard;
