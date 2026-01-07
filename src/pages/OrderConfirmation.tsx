import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Home, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';

const OrderConfirmation = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', duration: 0.6 }}
        className="h-24 w-24 rounded-full bg-success/20 flex items-center justify-center mb-6"
      >
        <CheckCircle2 className="h-14 w-14 text-success" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-3xl font-display font-bold text-foreground mb-2 text-center"
      >
        Order Placed!
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-lg text-muted-foreground text-center mb-8"
      >
        Your order has been sent to the kitchen
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-sm card-menu p-6 mb-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <CreditCard className="h-6 w-6 text-primary" />
          <h2 className="font-semibold text-foreground">Payment</h2>
        </div>
        <p className="text-muted-foreground text-sm">
          Please pay at the counter via <span className="text-primary font-medium">Cash</span> or{' '}
          <span className="text-primary font-medium">UPI</span> after your meal.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex flex-col gap-3 w-full max-w-sm"
      >
        <Button
          onClick={() => navigate('/categories')}
          className="btn-hero text-primary-foreground"
        >
          Order More Items
        </Button>
        <Button
          onClick={() => navigate('/')}
          variant="outline"
          className="border-border text-foreground hover:bg-muted"
        >
          <Home className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
      </motion.div>
    </div>
  );
};

export default OrderConfirmation;
