import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CategoryCard from '@/components/CategoryCard';
import CartBar from '@/components/CartBar';
import { categories } from '@/data/menuData';
import { useCart } from '@/contexts/CartContext';

const Categories = () => {
  const navigate = useNavigate();
  const { tableNumber } = useCart();

  useEffect(() => {
    if (!tableNumber) {
      navigate('/table');
    }
  }, [tableNumber, navigate]);

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
      </div>

      <CartBar />
    </div>
  );
};

export default Categories;
