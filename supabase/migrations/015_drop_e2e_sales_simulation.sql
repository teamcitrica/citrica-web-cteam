-- Limpieza de la simulación E2E de sales-analytics (proyecto de prueba ya eliminado).
-- Estos objetos existían en la DB citrica solo para simular la DB externa de un cliente.
DROP FUNCTION IF EXISTS public.get_sales_data_for_export(date, date);
DROP FUNCTION IF EXISTS public.get_sales_summary(date, date);
DROP TABLE IF EXISTS public.sales_analytics;
