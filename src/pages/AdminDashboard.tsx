import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  LogOut, 
  Menu as MenuIcon, 
  ClipboardList, 
  BarChart3,
  ChevronRight,
  Check,
  X,
  Calendar,
  IndianRupee,
  TrendingUp,
  Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format, startOfDay, endOfDay, subDays, parseISO, isWithinInterval } from 'date-fns';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  sub_category: string | null;
  is_available: boolean;
}

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
  payment_status: string;
  created_at: string;
}

const AdminDashboard = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<'today' | 'yesterday' | 'week' | 'all'>('today');

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const fetchMenuItems = async () => {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('category', { ascending: true });

    if (error) {
      console.error('Error fetching menu items:', error);
      toast.error('Failed to fetch menu items');
      return;
    }

    setMenuItems(data || []);
  };

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
      return;
    }

    const parsedOrders = (data || []).map(order => ({
      ...order,
      items: Array.isArray(order.items) ? order.items : JSON.parse(order.items as string || '[]'),
    })) as Order[];

    setOrders(parsedOrders);
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchMenuItems(), fetchOrders()]);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const toggleAvailability = async (itemId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('menu_items')
      .update({ is_available: !currentStatus })
      .eq('id', itemId);

    if (error) {
      console.error('Error updating availability:', error);
      toast.error('Failed to update availability');
      return;
    }

    setMenuItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, is_available: !currentStatus } : item
      )
    );
    toast.success(`Item ${!currentStatus ? 'available' : 'unavailable'}`);
  };

  const togglePaymentStatus = async (orderId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'paid' ? 'unpaid' : 'paid';
    const { error } = await supabase
      .from('orders')
      .update({ payment_status: newStatus })
      .eq('id', orderId);

    if (error) {
      console.error('Error updating payment status:', error);
      toast.error('Failed to update payment status');
      return;
    }

    setOrders(prev =>
      prev.map(order =>
        order.id === orderId ? { ...order, payment_status: newStatus } : order
      )
    );
    toast.success(`Payment marked as ${newStatus}`);
  };

  // Filter orders by date
  const filteredOrders = orders.filter(order => {
    const orderDate = parseISO(order.created_at);
    const today = new Date();

    switch (dateFilter) {
      case 'today':
        return isWithinInterval(orderDate, {
          start: startOfDay(today),
          end: endOfDay(today),
        });
      case 'yesterday':
        const yesterday = subDays(today, 1);
        return isWithinInterval(orderDate, {
          start: startOfDay(yesterday),
          end: endOfDay(yesterday),
        });
      case 'week':
        return isWithinInterval(orderDate, {
          start: startOfDay(subDays(today, 7)),
          end: endOfDay(today),
        });
      default:
        return true;
    }
  });

  // Analytics calculations
  const todayOrders = orders.filter(order => {
    const orderDate = parseISO(order.created_at);
    return isWithinInterval(orderDate, {
      start: startOfDay(new Date()),
      end: endOfDay(new Date()),
    });
  });

  const todayRevenue = todayOrders.reduce((sum, order) => {
    const orderTotal = order.items.reduce((t, item) => t + item.price * item.quantity, 0);
    return sum + orderTotal;
  }, 0);

  const todayPaidOrders = todayOrders.filter(o => o.payment_status === 'paid').length;

  // Most ordered items
  const itemCounts: { [key: string]: { name: string; count: number } } = {};
  orders.forEach(order => {
    order.items.forEach(item => {
      if (itemCounts[item.name]) {
        itemCounts[item.name].count += item.quantity;
      } else {
        itemCounts[item.name] = { name: item.name, count: item.quantity };
      }
    });
  });
  const topItems = Object.values(itemCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Group menu items by category
  const categorizedMenu = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as { [key: string]: MenuItem[] });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 glass-effect border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Admin Panel</h1>
              <p className="text-sm text-muted-foreground truncate max-w-[150px]">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleSignOut}
            className="border-border text-foreground"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-4">
        <Tabs defaultValue="menu" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-card/50 mb-6">
            <TabsTrigger value="menu" className="flex items-center gap-2">
              <MenuIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Menu</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              <span className="hidden sm:inline">Orders</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
          </TabsList>

          {/* Menu Management Tab */}
          <TabsContent value="menu" className="space-y-6">
            {Object.entries(categorizedMenu).map(([category, items]) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-primary" />
                  {category}
                </h2>
                <div className="space-y-2">
                  {items.map(item => (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        item.is_available
                          ? 'bg-card border-border'
                          : 'bg-muted/50 border-muted'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium truncate ${
                          item.is_available ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {item.name}
                        </p>
                        <p className="text-sm text-muted-foreground">₹{item.price}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={item.is_available ? 'default' : 'secondary'}>
                          {item.is_available ? 'Available' : 'Unavailable'}
                        </Badge>
                        <Switch
                          checked={item.is_available}
                          onCheckedChange={() => toggleAvailability(item.id, item.is_available)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            {/* Date Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {(['today', 'yesterday', 'week', 'all'] as const).map(filter => (
                <Button
                  key={filter}
                  variant={dateFilter === filter ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDateFilter(filter)}
                  className="whitespace-nowrap"
                >
                  <Calendar className="h-3 w-3 mr-1" />
                  {filter === 'today' && 'Today'}
                  {filter === 'yesterday' && 'Yesterday'}
                  {filter === 'week' && 'Last 7 Days'}
                  {filter === 'all' && 'All Time'}
                </Button>
              ))}
            </div>

            <p className="text-sm text-muted-foreground">
              Showing {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
            </p>

            <div className="space-y-3">
              {filteredOrders.map(order => {
                const orderTotal = order.items.reduce(
                  (sum, item) => sum + item.price * item.quantity,
                  0
                );
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl border border-border bg-card"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-foreground">Table {order.table_number}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(parseISO(order.created_at), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          order.status === 'done' ? 'default' : 
                          order.status === 'preparing' ? 'secondary' : 'outline'
                        }>
                          {order.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-1 mb-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {item.name} × {item.quantity}
                          </span>
                          <span className="text-foreground">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <p className="font-semibold text-foreground">Total: ₹{orderTotal}</p>
                      <Button
                        variant={order.payment_status === 'paid' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => togglePaymentStatus(order.id, order.payment_status)}
                        className="gap-1"
                      >
                        {order.payment_status === 'paid' ? (
                          <>
                            <Check className="h-3 w-3" />
                            Paid
                          </>
                        ) : (
                          <>
                            <X className="h-3 w-3" />
                            Unpaid
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                );
              })}

              {filteredOrders.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No orders found for this period</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20"
              >
                <div className="flex items-center gap-2 mb-2">
                  <IndianRupee className="h-4 w-4 text-primary" />
                  <p className="text-sm text-muted-foreground">Today's Revenue</p>
                </div>
                <p className="text-2xl font-bold text-foreground">₹{todayRevenue}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="p-4 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/20"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-4 w-4 text-green-500" />
                  <p className="text-sm text-muted-foreground">Today's Orders</p>
                </div>
                <p className="text-2xl font-bold text-foreground">{todayOrders.length}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="p-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/20"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Check className="h-4 w-4 text-blue-500" />
                  <p className="text-sm text-muted-foreground">Paid Orders</p>
                </div>
                <p className="text-2xl font-bold text-foreground">{todayPaidOrders}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="p-4 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/20"
              >
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-amber-500" />
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                </div>
                <p className="text-2xl font-bold text-foreground">{orders.length}</p>
              </motion.div>
            </div>

            {/* Top Items */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Most Ordered Items
              </h3>
              <div className="space-y-2">
                {topItems.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-card border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <span className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
                        {index + 1}
                      </span>
                      <span className="text-foreground">{item.name}</span>
                    </div>
                    <Badge variant="secondary">{item.count} orders</Badge>
                  </motion.div>
                ))}

                {topItems.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No order data available yet
                  </p>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
