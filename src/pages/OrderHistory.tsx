import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { History, ArrowLeft, TrendingUp, ShoppingBag, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { format, isToday, startOfDay, endOfDay } from 'date-fns';

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

const OrderHistory = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCompletedOrders = async () => {
      setIsLoading(true);
      try {
        const today = new Date();
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('status', 'done')
          .gte('created_at', startOfDay(today).toISOString())
          .lte('created_at', endOfDay(today).toISOString())
          .order('created_at', { ascending: false });

        if (error) throw error;

        const parsedOrders = (data || []).map(order => ({
          ...order,
          items: Array.isArray(order.items) ? order.items : JSON.parse(order.items as string || '[]'),
        })) as Order[];

        setOrders(parsedOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompletedOrders();
  }, []);

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, order) => {
      const orderTotal = order.items.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0);
      return sum + orderTotal;
    }, 0);

    const totalItems = orders.reduce((sum, order) => {
      return sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
    }, 0);

    return {
      totalOrders: orders.length,
      totalRevenue,
      totalItems,
    };
  }, [orders]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 glass-effect border-b border-border">
        <div className="flex items-center gap-3 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/kitchen')}
            className="text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
              <History className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Order History</h1>
              <p className="text-sm text-muted-foreground">Today's completed orders</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Daily Summary Cards */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Today's Summary</h2>
          <div className="grid grid-cols-3 gap-3">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-menu p-4 text-center"
            >
              <div className="h-10 w-10 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-2">
                <IndianRupee className="h-5 w-5 text-success" />
              </div>
              <p className="text-xl font-bold text-foreground">₹{stats.totalRevenue}</p>
              <p className="text-xs text-muted-foreground">Revenue</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card-menu p-4 text-center"
            >
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
              </div>
              <p className="text-xl font-bold text-foreground">{stats.totalOrders}</p>
              <p className="text-xs text-muted-foreground">Orders</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card-menu p-4 text-center"
            >
              <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="h-5 w-5 text-amber-500" />
              </div>
              <p className="text-xl font-bold text-foreground">{stats.totalItems}</p>
              <p className="text-xs text-muted-foreground">Items Sold</p>
            </motion.div>
          </div>
        </section>

        {/* Completed Orders List */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">
            Completed Orders ({orders.length})
          </h2>
          
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="card-menu p-4 animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/3 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : orders.length > 0 ? (
            <div className="space-y-3">
              {orders.map((order, index) => {
                const orderTotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="card-menu p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-success/20 flex items-center justify-center">
                          <span className="text-sm font-bold text-success">T{order.table_number}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">Table {order.table_number}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(order.created_at), 'h:mm a')}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-success">₹{orderTotal}</span>
                    </div>

                    <div className="space-y-1 border-t border-border pt-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {item.name} <span className="opacity-60">×{item.quantity}</span>
                          </span>
                          <span className="text-muted-foreground">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <History className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">No completed orders</h3>
              <p className="text-sm text-muted-foreground">Completed orders will appear here</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default OrderHistory;
