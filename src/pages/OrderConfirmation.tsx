import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  CheckCircle2,
  Home,
  CreditCard,
  Smartphone,
  Banknote,
  Copy,
  QrCode,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { buildUpiUri, upiAppLinks, type UpiSettings } from '@/lib/upi';
import { toast } from 'sonner';

const RESTAURANT_NAME = 'CAMPUS TALES';

interface ConfirmationState {
  total?: number;
  tableNumber?: number;
}

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { total, tableNumber } = (location.state || {}) as ConfirmationState;

  const [settings, setSettings] = useState<UpiSettings | null>(null);

  useEffect(() => {
    supabase
      .from('restaurant_settings')
      .select('upi_id, payee_name')
      .eq('id', 'default')
      .single()
      .then(({ data }) => {
        if (data) setSettings(data);
      });
  }, []);

  const upiId = settings?.upi_id?.trim() || '';
  const payeeName = settings?.payee_name?.trim() || RESTAURANT_NAME;
  const upiReady = upiId.length > 0;

  const upiUri = upiReady
    ? buildUpiUri({
        payeeVpa: upiId,
        payeeName,
        amount: total ?? null,
        note: tableNumber ? `Campus Tales - Table ${tableNumber}` : 'Campus Tales',
      })
    : '';
  const links = upiReady ? upiAppLinks(upiUri) : null;

  const openApp = (href: string, label: string) => {
    window.location.href = href;
    // If no UPI app handles the link (e.g. desktop), fall back to a hint.
    window.setTimeout(() => {
      if (!document.hidden) {
        toast.info(`${label} — open this page on your phone, or scan the QR with any UPI app.`);
      }
    }, 1500);
  };

  const copyUpiId = async () => {
    try {
      await navigator.clipboard.writeText(upiId);
      toast.success('UPI ID copied');
    } catch {
      toast.error('Could not copy UPI ID');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 py-12">
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

      {/* UPI Payment */}
      {upiReady && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-sm card-menu p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <QrCode className="h-6 w-6 text-primary" />
            <h2 className="font-semibold text-foreground">Pay your bill</h2>
          </div>

          {typeof total === 'number' && (
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground text-sm">Amount to pay</span>
              <span className="text-2xl font-bold text-primary">₹{total}</span>
            </div>
          )}

          {/* Scanner QR — scan with PhonePe / GPay / any UPI app */}
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="bg-white p-3 rounded-xl shadow-sm">
              <QRCodeSVG
                value={upiUri}
                size={180}
                level="M"
                marginSize={0}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Scan this QR with PhonePe, GPay or any UPI app to pay
            </p>
          </div>

          {/* Open the customer's UPI app directly */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <Button
              onClick={() => openApp(links!.phonepe, 'PhonePe')}
              className="btn-hero text-primary-foreground"
            >
              <Smartphone className="h-4 w-4 mr-1" />
              PhonePe
            </Button>
            <Button
              onClick={() => openApp(links!.gpay, 'GPay')}
              className="btn-hero text-primary-foreground"
            >
              <Smartphone className="h-4 w-4 mr-1" />
              GPay
            </Button>
          </div>
          <Button
            variant="outline"
            onClick={() => openApp(links!.generic, 'Your UPI app')}
            className="w-full border-border text-foreground hover:bg-muted mb-4"
          >
            Pay with another UPI app
          </Button>

          <div className="flex items-center justify-between border-t border-border pt-3">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">UPI ID</p>
              <p className="text-sm font-medium text-foreground truncate">{upiId}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={copyUpiId}
              className="h-8 w-8 text-primary hover:bg-primary/20"
              aria-label="Copy UPI ID"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Cash option */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: upiReady ? 0.6 : 0.5 }}
        className="w-full max-w-sm card-menu p-6 mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <Banknote className="h-6 w-6 text-primary" />
          <h2 className="font-semibold text-foreground">Pay by cash</h2>
        </div>
        <p className="text-muted-foreground text-sm">
          Or simply pay <span className="text-primary font-medium">cash at the counter</span>{' '}
          after your meal.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
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

      {!upiReady && (
        <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
          <CreditCard className="h-3.5 w-3.5" />
          UPI payment will appear here once the restaurant adds its payment details.
        </p>
      )}
    </div>
  );
};

export default OrderConfirmation;
