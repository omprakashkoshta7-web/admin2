import { useState, useEffect } from "react";
import { TrendingUp, Gift, Plus } from "lucide-react";
import { useAsync } from "../../hooks/useAsync";
import { getCoupons, createCoupon } from "../../api/admin";

const CS = { border: "1px solid #f1f5f9", boxShadow: "0 1px 4px rgba(15,23,42,0.06)" };

export default function GrowthPage() {
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ code: "", discount: "", limit: "" });
  const [couponError, setCouponError] = useState("");
  const [couponSaving, setCouponSaving] = useState(false);

  // Fetch real coupons from backend
  const { data: couponsData, refetch: refetchCoupons } = useAsync(() => getCoupons({ limit: 50 }), {}, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => { refetchCoupons(); }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Use real data from backend
  const backendCoupons: any[] = (couponsData as any)?.coupons || [];
  const activeCouponsCount = backendCoupons.filter((c: any) => c.isActive).length;
  const totalCoupons = backendCoupons.length;
  const totalUsed = backendCoupons.reduce((sum: number, c: any) => sum + (c.usedCount || 0), 0);

  const addCoupon = async () => {
    if (!form.code || !form.discount) return;
    setCouponSaving(true);
    setCouponError("");
    try {
      await createCoupon({
        code: form.code.toUpperCase(),
        discountType: 'percentage',
        discountValue: parseFloat(form.discount),
        usageLimit: parseInt(form.limit) || 100,
      });
      setShowNew(false);
      setForm({ code: "", discount: "", limit: "" });
      refetchCoupons();
    } catch (error: any) {
      setCouponError(error?.message || 'Failed to create coupon. Please try again.');
    } finally {
      setCouponSaving(false);
    }
  };

  return (
    <div className="space-y-5">

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Coupons", value: totalCoupons.toString(), change: "All", icon: TrendingUp, color: "#334155", bg: "#f1f5f9" },
          { label: "Active Coupons", value: activeCouponsCount.toString(), change: "Running", icon: Gift, color: "#334155", bg: "#f1f5f9" },
          { label: "Total Used", value: totalUsed.toString(), change: "Redeemed", icon: TrendingUp, color: "#334155", bg: "#f1f5f9" },
        ].map((c, idx) => (
          <div key={c.label} className="rounded-xl p-3.5 transition"
            style={idx === 0
              ? { background: "linear-gradient(135deg, #1e293b, #0f172a)", boxShadow: "0 12px 28px rgba(15,23,42,0.3)", position: "relative", overflow: "hidden" }
              : { border: "1px solid #f1f5f9", boxShadow: "0 1px 4px rgba(15,23,42,0.06)", backgroundColor: "#fff" }}>
            {idx === 0 && <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)", backgroundSize: "14px 14px" }} />}
            <div className="relative flex items-start justify-between mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: idx === 0 ? "rgba(255,255,255,0.15)" : c.bg }}>
                <c.icon size={15} style={{ color: idx === 0 ? "#fff" : c.color }} />
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: idx === 0 ? "rgba(255,255,255,0.15)" : c.bg, color: idx === 0 ? "#fff" : c.color }}>{c.change}</span>
            </div>
            <p className={`relative text-xl font-black ${idx === 0 ? "text-white" : "text-gray-900"}`}>{c.value}</p>
            <p className={`relative text-xs mt-0.5 ${idx === 0 ? "text-white/60" : "text-gray-400"}`}>{c.label}</p>
          </div>
        ))}
      </div>

      {/* Coupon Management Table */}
      <div className="bg-white rounded-xl overflow-hidden" style={CS}>
        <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid #f1f5f9", backgroundColor: "#fafbfc" }}>
          <p className="text-sm font-bold text-gray-900">Coupon Management</p>
          <button onClick={() => setShowNew(s => !s)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-bold rounded-lg"
            style={{ backgroundColor: "#334155" }}>
            <Plus size={12} /> New Coupon
          </button>
        </div>

        {showNew && (
          <div className="px-4 py-3 border-b border-gray-50" style={{ backgroundColor: "#fafbfc" }}>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {[{ label: "Code", key: "code" }, { label: "Discount %", key: "discount" }, { label: "Max Uses", key: "limit" }].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">{f.label}</label>
                  <input value={form[f.key as keyof typeof form]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none" />
                </div>
              ))}
            </div>
            {couponError && <p className="text-xs text-red-600 mb-2 font-semibold">⚠ {couponError}</p>}
            <div className="flex justify-end gap-2">
              <button onClick={() => { setShowNew(false); setCouponError(""); }} className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600">Cancel</button>
              <button onClick={addCoupon} disabled={couponSaving} className="px-3 py-1.5 text-white text-xs font-bold rounded-lg disabled:opacity-60" style={{ backgroundColor: "#334155" }}>
                {couponSaving ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        )}

        <table className="w-full admin-responsive-table min-w-[700px] lg:min-w-0">
          <thead>
            <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
              {["Code", "Discount", "Usage", "Limit", "Status"].map(h => (
                <th key={h} className="text-left text-xs font-bold text-gray-400 uppercase tracking-wide px-4 py-2">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {backendCoupons.length > 0 ? (
              backendCoupons.map((c: any, i: number) => (
                <tr key={c.code || c._id} className="hover-row" style={{ borderBottom: i < backendCoupons.length - 1 ? "1px solid #f8fafc" : "none" }}>
                  <td className="px-4 py-2.5 text-sm font-black text-gray-900 font-mono">{c.code}</td>
                  <td className="px-4 py-2.5 text-sm font-bold text-gray-900">{c.discountValue} {c.discountType === 'percentage' ? '%' : '₹'} off</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 rounded-full bg-gray-100 w-20 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${Math.min(((c.usedCount ?? 0)/(c.usageLimit ?? 100))*100,100)}%`, backgroundColor: "#334155" }} />
                      </div>
                      <span className="text-xs text-gray-500">{c.usedCount ?? 0}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-gray-500">{c.usageLimit}</td>
                  <td className="px-4 py-2.5">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: c.isActive ? "#f0fdf4" : "#f1f5f9", color: c.isActive ? "#10b981" : "#94a3b8" }}>
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                  No coupons available. Create your first coupon to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
