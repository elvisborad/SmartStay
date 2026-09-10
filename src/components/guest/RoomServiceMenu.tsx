'use client';

import { useState, useEffect } from 'react';
import { Utensils, ShoppingBag, Plus, Minus, CheckCircle2, Clock } from 'lucide-react';

interface RoomServiceMenuProps {
  roomNumber: string;
  guestName: string;
  guestSessionId: string;
  onOrderPlaced: () => void;
}

export default function RoomServiceMenu({
  roomNumber,
  guestName,
  guestSessionId,
  onOrderPlaced,
}: RoomServiceMenuProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [cart, setCart] = useState<{ [key: string]: { item: any; quantity: number } }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/services');
      const data = await res.json();
      if (data.categories) {
        setCategories(data.categories.filter((c: any) => c.department === 'KITCHEN'));
      }
    } catch (err) {
      console.error('Failed to load menu:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (item: any, delta: number) => {
    setCart((prev) => {
      const currentQty = prev[item.id]?.quantity || 0;
      const newQty = currentQty + delta;
      if (newQty <= 0) {
        const copy = { ...prev };
        delete copy[item.id];
        return copy;
      }
      return {
        ...prev,
        [item.id]: { item, quantity: newQty },
      };
    });
  };

  const cartTotal = Object.values(cart).reduce(
    (sum, entry) => sum + entry.item.price * entry.quantity,
    0
  );

  const handleCheckout = async () => {
    if (Object.keys(cart).length === 0) return;
    setSubmitting(true);
    setSuccessMsg(null);
    try {
      const itemsPayload = Object.values(cart).map((entry) => ({
        serviceItemId: entry.item.id,
        quantity: entry.quantity,
      }));

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomNumber,
          guestName,
          guestSessionId,
          items: itemsPayload,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCart({});
        setSuccessMsg(`Room Service Order ${data.order.orderNumber} sent to Kitchen!`);
        onOrderPlaced();
        setTimeout(() => setSuccessMsg(null), 5000);
      }
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-[#7C756B] font-medium">Loading In-Room Dining Menu...</div>;
  }

  return (
    <div className="space-y-6 font-sans">
      {successMsg && (
        <div className="p-4 rounded-xl bg-[#EAF8EF] border border-[#16A34A]/30 text-[#16A34A] text-sm font-bold flex items-center gap-2 animate-fade-in shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" />
          {successMsg}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#171717] flex items-center gap-2">
            <Utensils className="w-5 h-5 text-[#C6A15B]" />
            Skyline Gourmet Dining Menu
          </h2>
          <p className="text-xs text-[#7C756B] font-medium">Freshly prepared by Chef Antoine & delivered to Room {roomNumber}</p>
        </div>

        {Object.keys(cart).length > 0 && (
          <div className="bg-[#FBF5E8] text-[#C6A15B] text-xs font-bold px-3.5 py-1.5 rounded-full border border-[#C6A15B]/40 flex items-center gap-1.5 shadow-sm">
            <ShoppingBag className="w-4 h-4 text-[#C6A15B]" />
            {Object.values(cart).reduce((sum, e) => sum + e.quantity, 0)} Items (₹{cartTotal.toFixed(2)})
          </div>
        )}
      </div>

      {/* Menu Categories */}
      {categories.map((cat) => (
        <div key={cat.id} className="space-y-3">
          <h3 className="text-sm font-bold text-[#7C756B] uppercase tracking-wider border-b border-[#E2E8F0] pb-2">
            {cat.name}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cat.items.map((item: any) => {
              const qty = cart[item.id]?.quantity || 0;
              return (
                <div
                  key={item.id}
                  className="bg-white border border-[#E2E8F0] hover:border-[#C6A15B] rounded-2xl p-4 shadow-sm transition flex items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <h4 className="font-bold text-[#171717] text-sm">{item.name}</h4>
                    <p className="text-xs text-[#7C756B] mt-0.5 line-clamp-2">{item.description}</p>
                    <div className="mt-2 flex items-center gap-3">
                      <span className="font-bold text-[#C6A15B] text-sm">
                        {item.price > 0 ? `₹${item.price.toFixed(2)}` : 'Free'}
                      </span>
                      <span className="text-[11px] text-[#7C756B] flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3 text-[#C6A15B]" /> ~{item.estimatedMinutes}m prep
                      </span>
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2">
                    {qty > 0 ? (
                      <div className="flex items-center gap-2 bg-[#F8F5EF] p-1 rounded-xl border border-[#CBD5E1]">
                        <button
                          onClick={() => updateQuantity(item, -1)}
                          className="w-7 h-7 rounded-lg bg-white text-[#24211E] flex items-center justify-center hover:bg-[#E2E8F0] shadow-xs"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-bold text-sm w-4 text-center text-[#24211E]">{qty}</span>
                        <button
                          onClick={() => updateQuantity(item, 1)}
                          className="w-7 h-7 rounded-lg bg-[#171717] text-white flex items-center justify-center hover:bg-[#292724] shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5 text-[#C6A15B]" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => updateQuantity(item, 1)}
                        className="bg-[#FBF5E8] hover:bg-[#C6A15B]/20 text-[#C6A15B] border border-[#C6A15B]/40 font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Cart Summary Bar */}
      {Object.keys(cart).length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-2xl mx-auto bg-[#171717] text-white rounded-2xl p-4 shadow-2xl border border-[#C6A15B]/40 flex items-center justify-between z-30 animate-fade-in">
          <div>
            <div className="text-xs text-white/70 font-medium">Total Order Amount</div>
            <div className="font-extrabold text-lg text-[#C6A15B]">₹{cartTotal.toFixed(2)}</div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={submitting}
            className="bg-[#C6A15B] hover:bg-[#A88544] text-white font-bold text-sm px-6 py-3 rounded-xl transition shadow-md flex items-center gap-2 disabled:opacity-50 disabled:bg-[#CBD5E1]"
          >
            <ShoppingBag className="w-4 h-4" />
            {submitting ? 'Placing Order...' : 'Place Order to Room'}
          </button>
        </div>
      )}
    </div>
  );
}
