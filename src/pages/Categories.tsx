import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CategoryCard from '@/components/CategoryCard';
import CartBar from '@/components/CartBar';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';

interface CategoryInfo {
  id: string;
  name: string;
  icon: string;
  color: string;
}

// Map database categories to display info
const categoryConfig: Record<string, { icon: string; color: string }> = {
  'Biryanis': { icon: '🍛', color: 'primary' },
  'Starters-Veg': { icon: '🥗', color: 'veg' },
  'Starters-Non-Veg': { icon: '🍗', color: 'nonveg' },
  'Main Course-Veg': { icon: '🥘', color: 'veg' },
  'Main Course-Non-Veg': { icon: '🍖', color: 'nonveg' },
  'Breads': { icon: '🫓', color: 'primary' },
  'Chinese': { icon: '🥡', color: 'primary' },
  'Evening Nibbles': { icon: '☕', color: 'primary' },
};

const Categories = () => {
  const navigate = useNavigate();
  const { tableNumber } = useCart();
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!tableNumber) {
      navigate('/table');
    }
  }, [tableNumber, navigate]);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      
      // Fetch distinct category/subcategory combinations that have available items
      const { data, error } = await supabase
        .from('menu_items')
        .select('category, sub_category')
        .eq('is_available', true);

      if (error) {
        console.error('Error fetching categories:', error);
        setIsLoading(false);
        return;
      }

      // Build unique category list
      const categorySet = new Set<string>();
      (data || []).forEach(item => {
        if (item.sub_category) {
          categorySet.add(`${item.category}-${item.sub_category}`);
        } else {
          categorySet.add(item.category);
        }
      });

      // Convert to category array with display info
      const categoryList: CategoryInfo[] = Array.from(categorySet).map(key => {
        const config = categoryConfig[key] || { icon: '🍽️', color: 'primary' };
        const displayName = key.replace('-', ' ');
        return {
          id: key.toLowerCase().replace(/ /g, '-'),
          name: displayName,
          icon: config.icon,
          color: config.color,
        };
      });

      // Sort categories in logical order
      const order = ['Biryanis', 'Starters-Veg', 'Starters-Non-Veg', 'Main Course-Veg', 'Main Course-Non-Veg', 'Breads', 'Chinese', 'Evening Nibbles'];
      categoryList.sort((a, b) => {
        const aKey = a.name.replace(' ', '-');
        const bKey = b.name.replace(' ', '-');
        return order.indexOf(aKey) - order.indexOf(bKey);
      });

      setCategories(categoryList);
      setIsLoading(false);
    };

    fetchCategories();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('menu-items-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'menu_items' },
        () => {
          fetchCategories();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 glass-effect border-b border-border">
        <div className="flex items-center gap-4 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/table')}
            className="text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-foreground">Our Menu</h1>
            <p className="text-sm text-muted-foreground">Table {tableNumber}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
            <UtensilsCrossed className="h-5 w-5 text-primary" />
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="p-6">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl font-display font-semibold text-foreground mb-6"
        >
          What are you craving?
        </motion.h2>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No items available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4 justify-items-center">
            {categories.map((category, index) => (
              <CategoryCard
                key={category.id}
                id={category.id}
                name={category.name}
                icon={category.icon}
                color={category.color}
                index={index}
              />
            ))}
          </div>
        )}
      </div>

      <CartBar />
    </div>
  );
};

export default Categories;
