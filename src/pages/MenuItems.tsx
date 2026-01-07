import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MenuItemCard from '@/components/MenuItemCard';
import CartBar from '@/components/CartBar';
import { categories, getCategoryItems } from '@/data/menuData';
import { useCart } from '@/contexts/CartContext';

const MenuItems = () => {
  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId: string }>();
  const { tableNumber } = useCart();

  useEffect(() => {
    if (!tableNumber) {
      navigate('/table');
    }
  }, [tableNumber, navigate]);

  const category = categories.find(c => c.id === categoryId);
  const items = categoryId ? getCategoryItems(categoryId) : [];

  if (!category) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Category not found</p>
      </div>
    );
  }

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
            <p className="text-sm text-muted-foreground">{items.length} items</p>
          </div>
          <span className="text-3xl">{category.icon}</span>
        </div>
      </div>

      {/* Items List */}
      <div className="p-4 space-y-3">
        {items.map((item, index) => (
          <MenuItemCard key={item.id} item={item} index={index} />
        ))}
      </div>

      <CartBar />
    </div>
  );
};

export default MenuItems;
