'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { apiGet, apiPost } from '@/lib/api';
import { MessageSquare, CheckCircle, Package, Truck } from 'lucide-react';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';

interface Order {
  id: string;
  buyer_name: string;
  crop_name: string;
  quantity: number;
  quantity_unit: string;
  total_price: number;
  status: 'pending' | 'confirmed' | 'packed' | 'dispatched';
  created_at: string;
  buyer_phone: string;
}

const statusConfig = {
  pending: { label: 'लंबित', color: 'yellow', icon: 'pending' },
  confirmed: { label: 'पुष्ट', color: 'blue', icon: 'check' },
  packed: { label: 'पैक किया गया', color: 'purple', icon: 'package' },
  dispatched: { label: 'भेज दिया गया', color: 'green', icon: 'truck' },
};

export default function OrdersPage() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await apiGet<{ orders: Order[] }>('/orders');
      setOrders(data.orders || []);
    } catch (err: any) {
      setError('ऑर्डर लोड करने में विफल');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: 'confirmed' | 'packed' | 'dispatched') => {
    try {
      await apiPost(`/orders/${orderId}/status`, { status: newStatus });
      setOrders(
        orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      setError('स्थिति अपडेट करने में विफल');
    }
  };

  const sendSMS = async (orderId: string, buyerPhone: string) => {
    try {
      await apiPost(`/orders/${orderId}/sms`, { phone: buyerPhone });
      alert('SMS भेज दिया गया!');
    } catch (err) {
      setError('SMS भेजने में विफल');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">मेरे ऑर्डर</h1>

      {error && (
        <div className="bg-red-50 border-2 border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6 text-base">
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <div className="text-6xl mb-4">📭</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">कोई ऑर्डर नहीं</h2>
          <p className="text-lg text-muted-foreground">अभी तक आपको कोई ऑर्डर नहीं मिला है</p>
        </div>
      ) : (
        <div className="grid gap-4 md:gap-6">
          {orders.map((order) => {
            const statusInfo = statusConfig[order.status];
            const colorClass = {
              yellow: 'bg-yellow-100 text-yellow-800',
              blue: 'bg-blue-100 text-blue-800',
              purple: 'bg-purple-100 text-purple-800',
              green: 'bg-green-100 text-green-800',
            }[statusInfo.color];

            return (
              <div key={order.id} className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-primary">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-foreground mb-2">{order.crop_name}</h3>
                    <p className="text-lg text-muted-foreground">
                      खरीदार: <span className="font-semibold text-foreground">{order.buyer_name}</span>
                    </p>
                    <p className="text-lg text-muted-foreground">
                      मात्रा: <span className="font-semibold">{order.quantity} {order.quantity_unit}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-primary mb-2">₹{order.total_price}</p>
                    <span className={`inline-block px-4 py-2 text-base font-bold rounded-lg ${colorClass}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  {new Date(order.created_at).toLocaleDateString('hi-IN')}
                </p>

                <div className="flex flex-wrap gap-3">
                  {order.status === 'pending' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'confirmed')}
                      className="flex items-center gap-2 px-4 py-3 bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold rounded-lg transition text-base"
                    >
                      <CheckCircle size={20} />
                      पुष्ट करें
                    </button>
                  )}

                  {(order.status === 'confirmed' || order.status === 'pending') && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'packed')}
                      className="flex items-center gap-2 px-4 py-3 bg-purple-100 hover:bg-purple-200 text-purple-700 font-bold rounded-lg transition text-base"
                    >
                      <Package size={20} />
                      पैक करें
                    </button>
                  )}

                  {(order.status === 'packed' || order.status === 'confirmed') && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'dispatched')}
                      className="flex items-center gap-2 px-4 py-3 bg-green-100 hover:bg-green-200 text-green-700 font-bold rounded-lg transition text-base"
                    >
                      <Truck size={20} />
                      भेज दिया गया
                    </button>
                  )}

                  <button
                    onClick={() => sendSMS(order.id, order.buyer_phone)}
                    className="flex items-center gap-2 px-4 py-3 bg-accent/20 hover:bg-accent/30 text-accent font-bold rounded-lg transition text-base ml-auto"
                  >
                    <MessageSquare size={20} />
                    SMS भेजें
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
