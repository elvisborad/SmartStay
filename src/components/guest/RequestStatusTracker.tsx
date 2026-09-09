'use client';

import { useState, useEffect } from 'react';
import { Clock, User, RefreshCw, ChefHat, Sparkles } from 'lucide-react';

interface RequestStatusTrackerProps {
  roomNumber: string;
}

export default function RequestStatusTracker({ roomNumber }: RequestStatusTrackerProps) {
  const [tickets, setTickets] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 4000);
    return () => clearInterval(interval);
  }, [roomNumber]);

  const fetchStatus = async () => {
    try {
      const [ticketsRes, ordersRes] = await Promise.all([
        fetch(`/api/tickets?roomNumber=${roomNumber}`),
        fetch(`/api/orders?roomNumber=${roomNumber}`),
      ]);
      const ticketsData = await ticketsRes.json();
      const ordersData = await ordersRes.json();

      if (ticketsData.tickets) setTickets(ticketsData.tickets);
      if (ordersData.orders) setOrders(ordersData.orders);
    } catch (err) {
      console.error('Failed to fetch request status:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="bg-[#FFF7E6] text-[#D97706] text-xs font-bold px-3 py-1 rounded-full border border-[#D97706]/30">⏳ Pending Dispatch</span>;
      case 'ASSIGNED':
        return <span className="bg-[#EFF6FF] text-[#2563EB] text-xs font-bold px-3 py-1 rounded-full border border-[#2563EB]/30">👤 Staff Assigned</span>;
      case 'IN_PROGRESS':
        return <span className="bg-[#EFF6FF] text-[#2563EB] text-xs font-bold px-3 py-1 rounded-full border border-[#2563EB]/30 animate-pulse">🚚 Staff En Route</span>;
      case 'COMPLETED':
        return <span className="bg-[#EAF8EF] text-[#16A34A] text-xs font-bold px-3 py-1 rounded-full border border-[#16A34A]/30">✅ Completed</span>;
      case 'CANCELLED':
        return <span className="bg-[#F1F5F9] text-[#64748B] text-xs font-bold px-3 py-1 rounded-full border border-[#CBD5E1]">Cancelled</span>;
      default:
        return <span className="bg-[#F1F5F9] text-[#526174] text-xs font-bold px-3 py-1 rounded-full">{status}</span>;
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-[#526174] font-medium">Fetching live request status...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#172033] flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#0F9F91]" />
            Live Status Tracker
          </h2>
          <p className="text-xs text-[#526174] font-medium">Real-time status of active requests for Room {roomNumber}</p>
        </div>

        <button
          onClick={fetchStatus}
          className="p-2 bg-white hover:bg-[#F1F5F9] border border-[#CBD5E1] text-[#526174] hover:text-[#172033] rounded-xl transition text-xs flex items-center gap-1 shadow-sm font-semibold"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#0F9F91]" /> Refresh
        </button>
      </div>

      {tickets.length === 0 && orders.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 text-center text-[#526174] space-y-2 shadow-sm">
          <Sparkles className="w-8 h-8 text-[#0F9F91] mx-auto opacity-50" />
          <p className="font-semibold text-[#172033]">No Active Service Requests</p>
          <p className="text-xs text-[#526174]">Request towels, amenities, or order room service above.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Active Tickets List */}
          {tickets.map((t) => (
            <div
              key={t.id}
              className="bg-white border border-[#E2E8F0] hover:border-[#0F9F91] rounded-2xl p-5 shadow-sm space-y-3 transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-[#526174] bg-[#F1F5F9] px-2.5 py-0.5 rounded border border-[#CBD5E1]">
                      {t.ticketNumber}
                    </span>
                    <span className="text-xs font-bold text-[#0F9F91] uppercase bg-[#E8F7F5] px-2 py-0.5 rounded border border-[#0F9F91]/20">
                      {t.department}
                    </span>
                  </div>
                  <h3 className="font-bold text-[#172033] text-base">{t.title}</h3>
                  <p className="text-xs text-[#526174] mt-0.5">{t.description}</p>
                </div>
                {getStatusBadge(t.status)}
              </div>

              {/* Staff Assignment & Logs */}
              <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#526174]">
                <span className="flex items-center gap-1.5 font-medium">
                  <User className="w-3.5 h-3.5 text-[#0F9F91]" />
                  {t.assignedStaff ? (
                    <span className="font-bold text-[#172033]">Assigned: {t.assignedStaff.name}</span>
                  ) : (
                    <span className="italic text-[#526174]">Awaiting staff assignment</span>
                  )}
                </span>
                <span className="text-[11px] text-[#8290A3] font-medium">
                  Requested {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {/* Active Room Service Orders List */}
          {orders.map((o) => (
            <div
              key={o.id}
              className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-[#D97706] bg-[#FFF7E6] px-2.5 py-0.5 rounded border border-[#D97706]/30">
                      {o.orderNumber}
                    </span>
                    <span className="text-xs font-bold text-[#526174] bg-[#F1F5F9] px-2 py-0.5 rounded border border-[#CBD5E1]">
                      In-Room Dining
                    </span>
                  </div>
                  <h3 className="font-bold text-[#172033] text-base flex items-center gap-1.5">
                    <ChefHat className="w-4 h-4 text-[#D97706]" /> Total: ${o.totalAmount.toFixed(2)}
                  </h3>
                  <p className="text-xs text-[#526174] mt-1 font-medium">
                    Items: {o.items?.map((i: any) => `${i.quantity}x ${i.itemName}`).join(', ')}
                  </p>
                </div>
                <span className="bg-[#FFF7E6] text-[#D97706] text-xs font-bold px-3 py-1 rounded-full border border-[#D97706]/30">
                  👨‍🍳 Preparing in Kitchen
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
