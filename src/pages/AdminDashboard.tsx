import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  LogOut, 
  Menu as MenuIcon, 
  ClipboardList, 
  BarChart3,
  Check,
  X,
  Calendar,
  IndianRupee,
  TrendingUp,
  Package,
  Plus,
  Pencil,
  Trash2,
  QrCode,
  Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

const CATEGORIES = [
  'Veg Starters',
  'Non-Veg Starters',
  'Biryanis',
  'Veg Main Course',
  'Non-Veg Main Course',
  'Chinese',
  'Breads',
  'Evening Nibbles',
];

interface MenuItemForm {
  name: string;
  price: string;
  category: string;
  sub_category: string;
}

const emptyForm: MenuItemForm = {
  name: '',
  price: '',
  category: '',
  sub_category: '',
};

const AdminDashboard = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<'today' | 'yesterday' | 'week' | 'all'>('today');
  
  // CRUD state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState<MenuItemForm>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

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

  // Add new menu item
  const handleAddItem = async () => {
    if (!formData.name.trim() || !formData.price || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    setIsSaving(true);
    const { data, error } = await supabase
      .from('menu_items')
      .insert({
        name: formData.name.trim(),
        price: price,
        category: formData.category,
        sub_category: formData.sub_category.trim() || null,
        is_available: true,
      })
      .select()
      .single();

    setIsSaving(false);

    if (error) {
      console.error('Error adding menu item:', error);
      toast.error('Failed to add menu item');
      return;
    }

    setMenuItems(prev => [...prev, data]);
    setFormData(emptyForm);
    setIsAddDialogOpen(false);
    toast.success('Menu item added successfully');
  };

  // Edit menu item
  const openEditDialog = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      price: item.price.toString(),
      category: item.category,
      sub_category: item.sub_category || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleEditItem = async () => {
    if (!editingItem) return;
    
    if (!formData.name.trim() || !formData.price || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    setIsSaving(true);
    const { error } = await supabase
      .from('menu_items')
      .update({
        name: formData.name.trim(),
        price: price,
        category: formData.category,
        sub_category: formData.sub_category.trim() || null,
      })
      .eq('id', editingItem.id);

    setIsSaving(false);

    if (error) {
      console.error('Error updating menu item:', error);
      toast.error('Failed to update menu item');
      return;
    }

    setMenuItems(prev =>
      prev.map(item =>
        item.id === editingItem.id
          ? {
              ...item,
              name: formData.name.trim(),
              price: price,
              category: formData.category,
              sub_category: formData.sub_category.trim() || null,
            }
          : item
      )
    );
    setEditingItem(null);
    setFormData(emptyForm);
    setIsEditDialogOpen(false);
    toast.success('Menu item updated successfully');
  };

  // Delete menu item
  const handleDeleteItem = async (itemId: string) => {
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      console.error('Error deleting menu item:', error);
      toast.error('Failed to delete menu item');
      return;
    }

    setMenuItems(prev => prev.filter(item => item.id !== itemId));
    toast.success('Menu item deleted successfully');
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
            {/* Add Item Button */}
            <div className="flex justify-end">
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Menu Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Menu Item</DialogTitle>
                    <DialogDescription>
                      Add a new item to your restaurant menu.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Item Name *</Label>
                      <Input
                        id="name"
                        placeholder="e.g., Paneer Tikka"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Price (₹) *</Label>
                      <Input
                        id="price"
                        type="number"
                        placeholder="e.g., 250"
                        value={formData.price}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sub_category">Subcategory (optional)</Label>
                      <Input
                        id="sub_category"
                        placeholder="e.g., Chef's Special"
                        value={formData.sub_category}
                        onChange={(e) => setFormData(prev => ({ ...prev, sub_category: e.target.value }))}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); setFormData(emptyForm); }}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddItem} disabled={isSaving}>
                      {isSaving ? 'Adding...' : 'Add Item'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={(open) => { setIsEditDialogOpen(open); if (!open) { setEditingItem(null); setFormData(emptyForm); } }}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Edit Menu Item</DialogTitle>
                  <DialogDescription>
                    Update the details of this menu item.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Item Name *</Label>
                    <Input
                      id="edit-name"
                      placeholder="e.g., Paneer Tikka"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-price">Price (₹) *</Label>
                    <Input
                      id="edit-price"
                      type="number"
                      placeholder="e.g., 250"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-sub_category">Subcategory (optional)</Label>
                    <Input
                      id="edit-sub_category"
                      placeholder="e.g., Chef's Special"
                      value={formData.sub_category}
                      onChange={(e) => setFormData(prev => ({ ...prev, sub_category: e.target.value }))}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => { setIsEditDialogOpen(false); setEditingItem(null); setFormData(emptyForm); }}>
                    Cancel
                  </Button>
                  <Button onClick={handleEditItem} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <div className="rounded-lg border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium text-foreground">Item Name</th>
                      <th className="text-left p-3 text-sm font-medium text-foreground">Price</th>
                      <th className="text-left p-3 text-sm font-medium text-foreground hidden sm:table-cell">Category</th>
                      <th className="text-center p-3 text-sm font-medium text-foreground">Status</th>
                      <th className="text-center p-3 text-sm font-medium text-foreground">Toggle</th>
                      <th className="text-center p-3 text-sm font-medium text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {menuItems.map(item => (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={item.is_available ? 'bg-card' : 'bg-muted/30'}
                      >
                        <td className="p-3">
                          <p className={`font-medium ${item.is_available ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {item.name}
                          </p>
                          <p className="text-xs text-muted-foreground sm:hidden">
                            {item.category}{item.sub_category ? ` / ${item.sub_category}` : ''}
                          </p>
                        </td>
                        <td className="p-3 text-foreground">₹{item.price}</td>
                        <td className="p-3 hidden sm:table-cell">
                          <div className="text-sm text-muted-foreground">
                            {item.category}
                            {item.sub_category && (
                              <span className="text-xs"> / {item.sub_category}</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <Badge variant={item.is_available ? 'default' : 'secondary'}>
                            {item.is_available ? 'Available' : 'Unavailable'}
                          </Badge>
                        </td>
                        <td className="p-3 text-center">
                          <Switch
                            checked={item.is_available}
                            onCheckedChange={() => toggleAvailability(item.id, item.is_available)}
                          />
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openEditDialog(item)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Menu Item</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{item.name}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteItem(item.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {menuItems.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <MenuIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No menu items found</p>
                <Button className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Item
                </Button>
              </div>
            )}
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
