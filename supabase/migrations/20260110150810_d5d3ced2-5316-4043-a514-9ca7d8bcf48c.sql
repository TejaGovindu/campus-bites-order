-- Enable realtime for menu_items table so customer menu updates instantly
ALTER PUBLICATION supabase_realtime ADD TABLE public.menu_items;