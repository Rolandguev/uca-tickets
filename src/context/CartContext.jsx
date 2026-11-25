import { createContext, useContext, useMemo } from 'react';
import { usePersistentReducer } from '../hooks/usePersistentReducer';
import { addToCart, cartLines, removeFromCart, setQty, totals } from '../utils/cart';
import { useData } from './DataContext';

// Carrito global: lista de { eventId, zoneId, qty }. La lógica vive en utils/cart.js (funciones puras).
const CartContext = createContext(null);

export function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM':
      return addToCart(state, action.item, action.max);
    case 'SET_QTY':
      return setQty(state, action.eventId, action.zoneId, action.qty);
    case 'REMOVE_ITEM':
      return removeFromCart(state, action.eventId, action.zoneId);
    case 'CLEAR':
      return [];
    default:
      throw new Error(`Acción desconocida en cart: ${action.type}`);
  }
}

export function CartProvider({ children }) {
  const [cart, dispatch] = usePersistentReducer('uca.cart', cartReducer, []);

  const value = useMemo(
    () => ({
      cart,
      addItem: (item, max) => dispatch({ type: 'ADD_ITEM', item, max }),
      setQty: (eventId, zoneId, qty) => dispatch({ type: 'SET_QTY', eventId, zoneId, qty }),
      removeItem: (eventId, zoneId) => dispatch({ type: 'REMOVE_ITEM', eventId, zoneId }),
      clear: () => dispatch({ type: 'CLEAR' }),
    }),
    [cart, dispatch],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>');
  return ctx;
}

// Valores derivados del carrito + catálogo: líneas, totales y cantidad de boletos.
// El contador sale de las líneas válidas, así no cuenta eventos que ya no existen.
export function useCartSummary() {
  const { cart } = useCart();
  const { events } = useData();
  return useMemo(() => {
    const lines = cartLines(cart, events);
    return { lines, totals: totals(lines) };
  }, [cart, events]);
}
