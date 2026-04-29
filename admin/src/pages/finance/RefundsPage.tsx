import { CheckCircle, DollarSign, Info, RotateCcw, Search, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useAsync } from "../../hooks/useAsync";
import { getAdminReports, getAdminOrders, processAdminRefund } from "../../api/admin";
import { ADMIN_COLORS } from "../../utils/colors";
import LoadingState from "../../components/ui/LoadingState";
import AdminMetricCard from "../../components/ui/AdminMetricCard";

const emptyForm = {
  orderId: "",
  customerId: "",
  amount: "",
  reason: "",
};

export default function RefundsPage() {
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showOrderLookup, setShowOrderLookup] = useState(false);

  const { data, loading, refetch } = useAsync(() => getAdminReports(), {}, []);
  const { data: refundedOrders, loading: loadingRefunds, refetch: refetchRefunds } = useAsync(
    () => getAdminOrders({ status: "refunded", limit: 50 }),
    {},
    []
  );
  const { data: recentOrders, loading: loadingRecent } = useAsync(
    () => getAdminOrders({ limit: 100 }),
    {},
    []
  );

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => { refetch(); refetchRefunds(); }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async () => {
    if (!form.orderId || !form.customerId || !form.amount) {
      setErrorMessage("Order ID, customer ID, and amount are required.");
      return;
    }

    // Validate ObjectId format (24 character hex string)
    if (!/^[0-9a-f]{24}$/i.test(form.orderId)) {
      setErrorMessage("Order ID must be a valid 24-character hex string (MongoDB ObjectId format).");
      return;
    }

    const amount = Number(form.amount);
    if (Number.isNaN(amount) || amount <= 0) {
      setErrorMessage("Enter a valid refund amount.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");

      await processAdminRefund(form.orderId, {
        customerId: form.customerId,
        amount,
        reason: form.reason || undefined,
      });

      setSuccessMessage("Refund processed successfully.");
      setForm(emptyForm);
      refetch();
      refetchRefunds();
    } catch (error: any) {
      setErrorMessage(error?.message || "Failed to process refund.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectOrder = (order: any) => {
    setForm({
      orderId: order._id,
      customerId: order.userId || "",
      amount: String(order.total || 0),
      reason: "",
    });
    setShowOrderLookup(false);
    setSearchQuery("");
  };

  const filteredOrders = ((recentOrders as any)?.orders || []).filter((order: any) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      order._id?.toLowerCase().includes(query) ||
      order.userId?.toLowerCase().includes(query) ||
      order.status?.toLowerCase().includes(query)
    );
  });

  if (loading || loadingRefunds || loadingRecent) {
    return (
      <div className="admin-content-wrapper">
        <LoadingState message="Loading refund data" />
      </div>
    );
  }

  return (
    <div className="admin-content-wrapper">
      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900" style={{ marginBottom: "1.5rem" }}>
        <div className="flex items-start gap-3">
          <Info size={18} className="mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-bold">Backend-aligned refunds</p>
            <p className="mt-1 text-blue-800">
              Backend supports refund processing by order ID, but does not expose a refund queue/list endpoint.
              This page uses the supported refund action directly instead of showing mock approval tables.
            </p>
          </div>
        </div>
      </div>

      <div className="admin-stats-grid" style={{ marginBottom: "1.5rem" }}>
        <AdminMetricCard
          index={0}
          label="Total Revenue"
          value={`₹${Number((data as any)?.totalRevenue || 0).toLocaleString()}`}
          accent={ADMIN_COLORS.primary}
          icon={DollarSign}
          note="All orders"
        />
        <AdminMetricCard
          label="Paid Orders"
          value={`${Number((data as any)?.paidOrders || 0).toLocaleString()}`}
          accent={ADMIN_COLORS.success}
          accentBg={ADMIN_COLORS.successBg}
          icon={CheckCircle}
          note="Payment received"
        />
        <AdminMetricCard
          label="Refunded Orders"
          value={`${Number((data as any)?.refundedOrders || 0).toLocaleString()}`}
          accent={ADMIN_COLORS.warning}
          accentBg={ADMIN_COLORS.warningBg}
          icon={RotateCcw}
          note="Refund processed"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900">Process Refund</h3>
        <p className="text-sm text-gray-500 mt-1">
          Sends refund amount to the customer's wallet via `POST /api/admin/refunds/:orderId`.
        </p>

        {/* Order Lookup Button */}
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={() => setShowOrderLookup(!showOrderLookup)}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition-colors"
          >
            <Search size={14} />
            {showOrderLookup ? "Hide Order Lookup" : "Find Order to Refund"}
          </button>
          {form.orderId && (
            <span className="text-sm text-green-600 font-medium">
              ✓ Order selected: {form.orderId.slice(0, 8)}...
            </span>
          )}
        </div>

        {/* Order Lookup Panel */}
        {showOrderLookup && (
          <div className="mt-4 border border-blue-200 rounded-xl bg-blue-50 p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-gray-900">Select Order</h4>
              <button
                onClick={() => setShowOrderLookup(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>
            
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID, Customer ID, or Status..."
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
            />

            <div className="max-h-80 overflow-y-auto">
              {filteredOrders.length > 0 ? (
                <div className="space-y-2">
                  {filteredOrders.map((order: any) => (
                    <div
                      key={order._id}
                      onClick={() => handleSelectOrder(order)}
                      className="p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-mono text-xs text-gray-900 font-bold">{order._id}</div>
                          <div className="text-sm text-gray-600 mt-1">
                            Customer: <span className="font-medium">{order.userId || "N/A"}</span>
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                              {order.status || "unknown"}
                            </span>
                            <span className="text-xs text-gray-500">
                              {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "—"}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">₹{Number(order.total || 0).toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {searchQuery ? "No orders found matching your search" : "No recent orders available"}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mt-5">
          <label className="block">
            <span className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Order ID</span>
            <input
              value={form.orderId}
              onChange={(event) => setForm((current) => ({ ...current, orderId: event.target.value }))}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none"
              placeholder="65bd50c6699d5bb41c50dd"
            />
          </label>

          <label className="block">
            <span className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Customer ID</span>
            <input
              value={form.customerId}
              onChange={(event) => setForm((current) => ({ ...current, customerId: event.target.value }))}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none"
              placeholder="USER-1001"
            />
          </label>

          <label className="block">
            <span className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Amount</span>
            <input
              type="number"
              min="0"
              value={form.amount}
              onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none"
              placeholder="499"
            />
          </label>

          <label className="block">
            <span className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Reason</span>
            <input
              value={form.reason}
              onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none"
              placeholder="Damaged order / cancellation"
            />
          </label>
        </div>

        {errorMessage ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</div>
        ) : null}

        {successMessage ? (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{successMessage}</div>
        ) : null}

        <div className="mt-5 flex items-center justify-end">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
          >
            <RotateCcw size={14} />
            {submitting ? "Processing..." : "Process Refund"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mt-6">
        <h3 className="text-lg font-bold text-gray-900">Refunded Orders</h3>
        <p className="text-sm text-gray-500 mt-1">
          Recent orders with refund status
        </p>

        {(refundedOrders as any)?.orders?.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-bold text-gray-700">Order ID</th>
                  <th className="text-left py-3 px-4 font-bold text-gray-700">Customer</th>
                  <th className="text-right py-3 px-4 font-bold text-gray-700">Amount</th>
                  <th className="text-left py-3 px-4 font-bold text-gray-700">Refund ID</th>
                  <th className="text-left py-3 px-4 font-bold text-gray-700">Date</th>
                </tr>
              </thead>
              <tbody>
                {(refundedOrders as any).orders.map((order: any) => (
                  <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900 font-mono text-xs">{order._id}</td>
                    <td className="py-3 px-4 text-gray-700">{order.userId || "N/A"}</td>
                    <td className="py-3 px-4 text-right text-gray-900 font-bold">₹{Number(order.total || 0).toLocaleString()}</td>
                    <td className="py-3 px-4 text-gray-600 font-mono text-xs">{order.refundId || "—"}</td>
                    <td className="py-3 px-4 text-gray-600 text-xs">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-4 text-center py-8 text-gray-500">
            No refunded orders found
          </div>
        )}
      </div>
    </div>
  );
}
