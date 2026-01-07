import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface CategoryCardProps {
  id: string;
  name: string;
  icon: string;
  color: string;
  index: number;
}

const CategoryCard = ({ id, name, icon, color, index }: CategoryCardProps) => {
  const navigate = useNavigate();

  const colorClasses: Record<string, string> = {
    veg: 'border-veg hover:shadow-[0_0_20px_hsl(142_70%_45%/0.3)]',
    nonveg: 'border-nonveg hover:shadow-[0_0_20px_hsl(0_70%_55%/0.3)]',
    primary: 'border-primary hover:shadow-[0_0_20px_hsl(28_85%_55%/0.3)]',
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      onClick={() => navigate(`/menu/${id}`)}
      className="flex flex-col items-center gap-3 p-2"
    >
      <div className={`category-circle ${colorClasses[color] || colorClasses.primary}`}>
        <span className="text-3xl">{icon}</span>
      </div>
      <span className="text-sm font-medium text-center text-foreground/90 max-w-[100px] leading-tight">
        {name}
      </span>
    </motion.button>
  );
};

export default CategoryCard;
