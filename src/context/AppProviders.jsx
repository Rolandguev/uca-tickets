import { PrefsProvider } from './PrefsContext';
import { SessionProvider } from './SessionContext';
import { DataProvider } from './DataContext';
import { CartProvider } from './CartContext';

// Orden: Data necesita Prefs (modo errores) y Session; Cart necesita Data (para el resumen).
export default function AppProviders({ children }) {
  return (
    <PrefsProvider>
      <SessionProvider>
        <DataProvider>
          <CartProvider>{children}</CartProvider>
        </DataProvider>
      </SessionProvider>
    </PrefsProvider>
  );
}
