import { Clock, ChefHat, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderCardProps {
  id: string;
  tableNumber: number;
  items: OrderItem[];
  status: string;
  createdAt: string;
  onStatusChange: (id: string, status: string) => void;
}

const OrderCard = ({ id, tableNumber, items, status, createdAt, onStatusChange }: OrderCardProps) => {
  const statusConfig: Record<string, { label: string; class: string; icon: React.ReactNode }> = {
    new: { label: 'New', class: 'status-new', icon: <Clock className="h-4 w-4" /> },
    preparing: { label: 'Preparing', class: 'status-preparing', icon: <ChefHat className="h-4 w-4" /> },
    done: { label: 'Done', class: 'status-done', icon: <CheckCircle2 className="h-4 w-4" /> },
  };

  const currentStatus = statusConfig[status] || statusConfig.new;
  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const getNextStatus = () => {
    if (status === 'new') return 'preparing';
    if (status === 'preparing') return 'done';
    return null;
  };

  const nextStatus = getNextStatus();

  return (
    <div className="card-menu p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-xl font-bold text-primary">T{tableNumber}</span>
          </div>
          <div>
            <p className="font-semibold text-foreground">Table {tableNumber}</p>
            <p className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
        <div className={`status-badge ${currentStatus.class}`}>
          {currentStatus.icon}
          <span className="ml-1">{currentStatus.label}</span>
        </div>
      </div>

      <div className="space-y-2 border-t border-border pt-3">
        {items.map((item, idx) => (
          <div key={idx} className="flex justify-between text-sm">
            <span className="text-foreground">
              {item.name} <span className="text-muted-foreground">×{item.quantity}</span>
            </span>
            <span className="text-muted-foreground">₹{item.price * item.quantity}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-border pt-3">
        <span className="font-semibold text-foreground">Total: ₹{totalAmount}</span>
        {nextStatus && (
          <Button
            onClick={() => onStatusChange(id, nextStatus)}
            className={status === 'new' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-success hover:bg-success/90'}
          >
            {status === 'new' ? 'Start Preparing' : 'Mark Done'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default OrderCard;
