import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MenuItemCard from '@/components/MenuItemCard';
import CartBar from '@/components/CartBar';
import { categories } from '@/data/menuData';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';

interface DbMenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  sub_category: string | null;
  is_available: boolean;
}

const categoryMap: Record<string, string> = {
  'veg-starters': 'Veg Starters',
  'non-veg-starters': 'Non-Veg Starters',
  'biryanis': 'Biryanis',
  'veg-main': 'Veg Main Course',
  'non-veg-main': 'Non-Veg Main Course',
  'chinese': 'Chinese',
  'breads': 'Breads',
  'evening': 'Evening Nibbles',
};

const MenuItems = () => {
  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId: string }>();
  const { tableNumber } = useCart();
  const [items, setItems] = useState<DbMenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!tableNumber) {
      navigate('/table');
    }
  }, [tableNumber, navigate]);

  useEffect(() => {
    const fetchItems = async () => {
      if (!categoryId) return;
      
      const categoryName = categoryMap[categoryId];
      if (!categoryName) return;

      setIsLoading(true);
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('category', categoryName)
        .eq('is_available', true)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching menu items:', error);
      } else {
        setItems(data || []);
      }
      setIsLoading(false);
    };

    fetchItems();
  }, [categoryId]);

  const category = categories.find(c => c.id === categoryId);

  if (!category) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Category not found</p>
      </div>
    );
  }

  // Transform DB items to match MenuItemCard expected format
  const transformedItems = items.map(item => ({
    id: item.id,
    name: item.name,
    price: item.price,
    category: item.category,
    subCategory: item.sub_category || undefined,
    isVeg: item.category.toLowerCase().includes('veg') && !item.category.toLowerCase().includes('non-veg'),
  }));

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
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
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-foreground">{category.name}</h1>
            <p className="text-sm text-muted-foreground">
              {isLoading ? 'Loading...' : `${items.length} items`}
            </p>
          </div>
          <span className="text-3xl">{category.icon}</span>
        </div>
      </div>

      {/* Items List */}
      <div className="p-4 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : transformedItems.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No items available in this category</p>
          </div>
        ) : (
          transformedItems.map((item, index) => (
            <MenuItemCard key={item.id} item={item} index={index} />
          ))
        )}
      </div>

      <CartBar />
    </div>
  );
};

export default MenuItems;
