import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,          // 30s — la agenda no cambia segundo a segundo
      refetchOnWindowFocus: true, // refetch al volver a la pestaña — útil para ver turnos nuevos de otra sesión
      retry: 1,
    },
  },
});
