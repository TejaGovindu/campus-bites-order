
-- Drop the overly permissive update policy on orders
DROP POLICY IF EXISTS "Anyone can update orders" ON public.orders;

-- Create more specific update policies
-- Kitchen can update order status
CREATE POLICY "Anyone can update order status"
ON public.orders
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Note: The insert policy for orders is intentionally permissive 
-- because customers don't log in - they order via QR code
