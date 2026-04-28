import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  DollarSign, TrendingUp, Store,
  RefreshCw, Eye,
  Activity
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { ADMIN_COLORS } from "../../utils/colors";
import { useAsync } from "../../hooks/useAsync";
import LoadingState from "../../components/ui/LoadingState";
import AdminMetricCard from "../../components/ui/AdminMetricCard";
import { getAdminReports } from "../../api/admin";

export default function FinancePage() {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('month');

  // Fetch financial data from backend
  const { data: reportsData, loading: reportsLoading } = useAsync(
    () => getAdminReports(),
    {},
    []
  );

  // Use real data from backend - ONLY fields that exist
  const revenueByDay = (reportsData as any)?.revenueByDay || [];
  const ordersByStatus = (reportsData as any)?.ordersByStatus || [];
  const ordersByFlow = (reportsData as any)?.ordersByFlow || [];

  // Calculate metrics from actual data
  const totalGross = revenueByDay.reduce((sum: number, day: any) => sum + (day.revenue || 0), 0);
  const totalNet = totalGross * 0.85;
  const totalCommission = totalGross - totalNet;

  const revenueTrend = revenueByDay.map((day: any) => ({
    date: day._id,
    revenue: day.revenue || 0,
    orders: day.count || 0,
  }));

  if (reportsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingState message="Loading financial data" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 p-1">
            {(['today', 'week', 'month'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                  timeRange === range
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          <button
            onClick={() => navigate("/ledger")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:border-gray-900 transition text-sm font-semibold"
          >
            <Eye size={14} />
            View Ledger
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:border-gray-900 transition text-sm font-semibold"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <AdminMetricCard index={0} label="Gross Revenue" value={`₹${(totalGross / 1000).toFixed(1)}K`} accent={ADMIN_COLORS.primary} icon={DollarSign} note="Total" />
        <AdminMetricCard label="Net Revenue" value={`₹${(totalNet / 1000).toFixed(1)}K`} accent={ADMIN_COLORS.success} accentBg={ADMIN_COLORS.successBg} icon={TrendingUp} note="After 15% fee" />
        <AdminMetricCard label="Commission" value={`₹${(totalCommission / 1000).toFixed(1)}K`} accent={ADMIN_COLORS.info} accentBg={ADMIN_COLORS.infoBg} icon={Activity} note="Platform fee" />
        <AdminMetricCard label="Total Orders" value={ordersByStatus.reduce((sum: number, status: any) => sum + (status.count || 0), 0).toString()} accent={ADMIN_COLORS.warning} accentBg={ADMIN_COLORS.warningBg} icon={Store} note="All orders" />
      </div>

      {/* Revenue Trend Chart */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Revenue Trend</h3>
            <p className="text-sm text-gray-500">Daily revenue and order count</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ADMIN_COLORS.primary }}></div>
              <span>Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ADMIN_COLORS.success }}></div>
              <span>Orders</span>
            </div>
          </div>
        </div>
        {revenueTrend.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={revenueTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke={ADMIN_COLORS.primary} strokeWidth={2} />
              <Line type="monotone" dataKey="orders" stroke={ADMIN_COLORS.success} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[200px] flex items-center justify-center">
            <p className="text-sm text-gray-500">No revenue data available</p>
          </div>
        )}
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-2 gap-6">
        
        {/* Revenue by Flow Type */}
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <p className="text-sm font-bold text-gray-900">Revenue by Type</p>
            <p className="text-xs text-gray-400 mt-0.5">Breakdown by printing, gifting, shopping</p>
          </div>
          {ordersByFlow.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wide px-4 py-2">Type</th>
                    <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wide px-4 py-2">Orders</th>
                    <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wide px-4 py-2">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {ordersByFlow.map((flow: any, i: number) => (
                    <tr key={flow._id} className="hover:bg-gray-50 transition"
                      style={{ borderBottom: i < ordersByFlow.length - 1 ? "1px solid #f8fafc" : "none" }}>
                      <td className="px-4 py-2.5 text-sm font-bold text-gray-900 capitalize">{flow._id}</td>
                      <td className="px-4 py-2.5 text-xs text-gray-600">{flow.count}</td>
                      <td className="px-4 py-2.5 text-sm font-bold text-gray-900">₹{Number(flow.revenue || 0).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-sm text-gray-500">No revenue data available</p>
            </div>
          )}
        </div>

        {/* Order Status Breakdown */}
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <p className="text-sm font-bold text-gray-900">Orders by Status</p>
            <p className="text-xs text-gray-400 mt-0.5">Current order distribution</p>
          </div>
          {ordersByStatus.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wide px-4 py-2">Status</th>
                    <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wide px-4 py-2">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {ordersByStatus.map((status: any, i: number) => (
                    <tr key={status._id} className="hover:bg-gray-50 transition"
                      style={{ borderBottom: i < ordersByStatus.length - 1 ? "1px solid #f8fafc" : "none" }}>
                      <td className="px-4 py-2.5 text-sm font-bold text-gray-900 capitalize">{status._id.replace(/_/g, ' ')}</td>
                      <td className="px-4 py-2.5 text-xs text-gray-600">{status.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-sm text-gray-500">No order data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
