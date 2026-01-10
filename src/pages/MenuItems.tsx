import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MenuItemCard from '@/components/MenuItemCard';
import CartBar from '@/components/CartBar';
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

// Map URL slugs to database category/subcategory
const categoryMap: Record<string, { category: string; subCategory?: string }> = {
  'biryanis': { category: 'Biryanis' },
  'starters-veg': { category: 'Starters', subCategory: 'Veg' },
  'starters-non-veg': { category: 'Starters', subCategory: 'Non-Veg' },
  'main-course-veg': { category: 'Main Course', subCategory: 'Veg' },
  'main-course-non-veg': { category: 'Main Course', subCategory: 'Non-Veg' },
  'breads': { category: 'Breads' },
  'chinese': { category: 'Chinese' },
  'evening-nibbles': { category: 'Evening Nibbles' },
};

// Display info for categories
const categoryDisplayInfo: Record<string, { name: string; icon: string }> = {
  'biryanis': { name: 'Biryanis', icon: '🍛' },
  'starters-veg': { name: 'Veg Starters', icon: '🥗' },
  'starters-non-veg': { name: 'Non-Veg Starters', icon: '🍗' },
  'main-course-veg': { name: 'Veg Main Course', icon: '🥘' },
  'main-course-non-veg': { name: 'Non-Veg Main Course', icon: '🍖' },
  'breads': { name: 'Breads', icon: '🫓' },
  'chinese': { name: 'Chinese', icon: '🥡' },
  'evening-nibbles': { name: 'Evening Nibbles', icon: '☕' },
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

  const fetchItems = async () => {
    if (!categoryId) return;
    
    const mapping = categoryMap[categoryId];
    if (!mapping) return;

    setIsLoading(true);
    
    let query = supabase
      .from('menu_items')
      .select('*')
      .eq('category', mapping.category)
      .eq('is_available', true)
      .order('name', { ascending: true });

    // Add subcategory filter if applicable
    if (mapping.subCategory) {
      query = query.eq('sub_category', mapping.subCategory);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching menu items:', error);
    } else {
      setItems(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchItems();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('menu-items-list-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'menu_items' },
        () => {
          fetchItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [categoryId]);

  const displayInfo = categoryId ? categoryDisplayInfo[categoryId] : null;

  if (!displayInfo) {
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
    isVeg: item.sub_category === 'Veg' || (!item.sub_category && !item.category.toLowerCase().includes('non-veg')),
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
            <h1 className="text-lg font-semibold text-foreground">{displayInfo.name}</h1>
            <p className="text-sm text-muted-foreground">
              {isLoading ? 'Loading...' : `${items.length} items`}
            </p>
          </div>
          <span className="text-3xl">{displayInfo.icon}</span>
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
            <p>No items available at the moment.</p>
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
