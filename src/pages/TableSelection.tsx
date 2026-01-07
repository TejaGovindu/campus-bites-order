import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';

const TableSelection = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setTableNumber } = useCart();
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    const tableParam = searchParams.get('table');
    if (tableParam) {
      const tableNum = parseInt(tableParam, 10);
      if (!isNaN(tableNum) && tableNum > 0 && tableNum <= 20) {
        setSelectedTable(tableNum);
        setIsLocked(true);
      }
    }
  }, [searchParams]);

  const handleProceed = () => {
    if (selectedTable) {
      setTableNumber(selectedTable);
      navigate('/categories');
    }
  };

  const tables = Array.from({ length: 15 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 glass-effect border-b border-border">
        <div className="flex items-center gap-4 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Select Your Table</h1>
            <p className="text-sm text-muted-foreground">Tap on your table number</p>
          </div>
        </div>
      </div>

      <div className="p-4 pb-32">
        {isLocked && selectedTable && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-primary/10 border border-primary/30 flex items-center gap-3"
          >
            <MapPin className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium text-foreground">Table {selectedTable} detected</p>
              <p className="text-sm text-muted-foreground">From QR code scan</p>
            </div>
          </motion.div>
        )}

        {!isLocked && (
          <div className="grid grid-cols-3 gap-3">
            {tables.map((table, index) => (
              <motion.button
                key={table}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => setSelectedTable(table)}
                className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center transition-all duration-200 ${
                  selectedTable === table
                    ? 'border-primary bg-primary/20 shadow-lg shadow-primary/20'
                    : 'border-border bg-card hover:border-primary/50'
                }`}
              >
                <span className="text-2xl font-bold text-foreground">{table}</span>
                <span className="text-xs text-muted-foreground mt-1">Table</span>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 glass-effect border-t border-border">
        <Button
          onClick={handleProceed}
          disabled={!selectedTable}
          className="w-full btn-hero text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {selectedTable ? `Proceed to Menu - Table ${selectedTable}` : 'Select a Table'}
        </Button>
      </div>
    </div>
  );
};

export default TableSelection;
