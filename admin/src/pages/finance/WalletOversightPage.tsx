import { RotateCcw, Store, Wallet } from "lucide-react";
import { useAsync } from "../../hooks/useAsync";
import { getAdminReports, getAdminOrders } from "../../api/admin";
import { ADMIN_COLORS } from "../../utils/colors";
import LoadingState from "../../components/ui/LoadingState";
import AdminMetricCard from "../../components/ui/AdminMetricCard";

export default function WalletOversightPage() {
  const { data, loading } = useAsync(() => getAdminReports(), {}, []);
  const { data: allOrdersData, loading: loadingOrders } = useAsync(
    () => getAdminOrders({ limit: 100 }),
    {},
    []
  );

  const totalRevenue = Number((data as any)?.totalRevenue || 0);
  const totalOrders = Number((data as any)?.totalOrders || 0);
  const paidOrders = Number((data as any)?.paidOrders || 0);
  
  // Filter orders by paymentStatus: 'paid'
  const allOrders = (allOrdersData as any)?.orders || [];
  const paidOrdersList = allOrders.filter((order: any) => order.paymentStatus === 'paid');

  if (loading || loadingOrders) {
    return (
      <div className="admin-content-wrapper">
        <LoadingState message="Loading finance summary" />
      </div>
    );
  }

  return (
    <div className="admin-content-wrapper">
      <div className="grid grid-cols-3 gap-4" style={{ marginBottom: "1.5rem" }}>
        <AdminMetricCard
          index={0}
          label="Total Revenue"
          value={`₹${totalRevenue.toLocaleString()}`}
          accent="#334155"
          icon={Wallet}
          note="All orders"
        />
        <AdminMetricCard
          label="Total Orders"
          value={`${totalOrders.toLocaleString()}`}
          accent={ADMIN_COLORS.primary}
          accentBg="#f0f4ff"
          icon={Store}
          note="All orders"
        />
        <AdminMetricCard
          label="Paid Orders"
          value={`${paidOrders.toLocaleString()}`}
          accent={ADMIN_COLORS.success}
          accentBg={ADMIN_COLORS.successBg}
          icon={RotateCcw}
          note="Payment received"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900">Paid Orders</h3>
        <p className="text-sm text-gray-500 mt-1">
          Recent orders with payment received
        </p>

        {paidOrdersList.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-bold text-gray-700">Order ID</th>
                  <th className="text-left py-3 px-4 font-bold text-gray-700">Customer</th>
                  <th className="text-left py-3 px-4 font-bold text-gray-700">Vendor</th>
                  <th className="text-right py-3 px-4 font-bold text-gray-700">Amount</th>
                  <th className="text-left py-3 px-4 font-bold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-bold text-gray-700">Date</th>
                </tr>
              </thead>
              <tbody>
                {paidOrdersList.map((order: any) => (
                  <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900 font-mono text-xs">{order._id}</td>
                    <td className="py-3 px-4 text-gray-700">
                      {order.customerName || order.userName || order.user?.name || (order.userId ? <span className="font-mono text-xs text-gray-400">{String(order.userId).slice(-8)}</span> : <span className="text-gray-400 italic text-xs">No Name</span>)}
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {order.vendorName || order.vendor?.name || order.vendor?.businessName || (order.vendorId ? <span className="font-mono text-xs text-gray-400">{String(order.vendorId).slice(-8)}</span> : <span className="text-gray-400 italic text-xs">No Vendor</span>)}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-900 font-bold">₹{Number(order.total || 0).toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: ADMIN_COLORS.successBg, color: ADMIN_COLORS.success }}>
                        {order.paymentStatus || "paid"}
                      </span>
                    </td>
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
            No paid orders found
          </div>
        )}
      </div>
    </div>
  );
}
