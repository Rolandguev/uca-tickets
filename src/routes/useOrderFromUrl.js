import { useParams } from 'react-router';
import { useData } from '../context/DataContext';

// Orden indicada por :orderId en la URL (o undefined si no existe)
export function useOrderFromUrl() {
  const { orderId } = useParams();
  const { orders } = useData();
  return orders.find((o) => o.id === orderId);
}
