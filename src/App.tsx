import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import Landing from "./pages/Landing";
import TableSelection from "./pages/TableSelection";
import Categories from "./pages/Categories";
import MenuItems from "./pages/MenuItems";
import Cart from "./pages/Cart";
import OrderConfirmation from "./pages/OrderConfirmation";
import KitchenDashboard from "./pages/KitchenDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/table" element={<TableSelection />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/menu/:categoryId" element={<MenuItems />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/confirmation" element={<OrderConfirmation />} />
            <Route path="/kitchen" element={<KitchenDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
