import { useState } from "react";
import {
  User, Mail, Phone, Shield, Calendar, Clock,
  Eye, EyeOff, CheckCircle, AlertTriangle, Save, X
} from "lucide-react";
import { ADMIN_COLORS } from "../../utils/colors";
import { getStoredAdminUser } from "../../api/auth";
import { request } from "../../api/apiClient";

export default function ProfilePage() {
  const user = getStoredAdminUser();

  // Password change state
  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwError, setPwError] = useState("");

  const handleChangePassword = async () => {
    setPwError("");
    setPwSuccess("");

    if (!pwForm.current || !pwForm.newPw || !pwForm.confirm) {
      setPwError("All three fields are required.");
      return;
    }
    if (pwForm.newPw.length < 8) {
      setPwError("New password must be at least 8 characters.");
      return;
    }
    if (pwForm.newPw !== pwForm.confirm) {
      setPwError("New password and confirm password do not match.");
      return;
    }

    try {
      setPwLoading(true);
      await request("/staff/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword: pwForm.current,
          newPassword: pwForm.newPw,
        }),
      });
      setPwSuccess("Password changed successfully.");
      setPwForm({ current: "", newPw: "", confirm: "" });
    } catch (err: any) {
      setPwError(err?.message || "Failed to change password. Please check your current password.");
    } finally {
      setPwLoading(false);
    }
  };

  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  const InfoRow = ({ icon: Icon, label, value }: { icon: any; label: string; value?: string }) => (
    <div className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-slate-50">
        <Icon size={14} className="text-slate-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-semibold text-gray-900 mt-0.5 truncate">{value || "—"}</p>
      </div>
    </div>
  );

  const PasswordField = ({
    label, value, show, onToggle, onChange, placeholder
  }: {
    label: string; value: string; show: boolean;
    onToggle: () => void; onChange: (v: string) => void; placeholder: string;
  }) => (
    <div>
      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Profile Header Card */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)", backgroundSize: "18px 18px" }} />
        <div className="relative flex items-center gap-5">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-black flex-shrink-0 border-2 border-white/30">
            {user?.name ? user.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || "A"}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-black truncate">{user?.name || "Super Admin"}</h2>
            <p className="text-white/70 text-sm mt-0.5 truncate">{user?.email || "admin@speedcopy.com"}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/20 border border-white/30">
                {user?.role || "SuperAdmin"}
              </span>
              {user?.isActive !== false && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/30 border border-emerald-400/40 text-emerald-200">
                  Active
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <User size={16} className="text-gray-500" />
          <h3 className="font-bold text-gray-900 text-sm">Profile Information</h3>
        </div>
        <div className="divide-y divide-gray-50">
          <InfoRow icon={User} label="Full Name" value={user?.name} />
          <InfoRow icon={Mail} label="Email Address" value={user?.email} />
          <InfoRow icon={Phone} label="Phone" value={user?.phone} />
          <InfoRow icon={Shield} label="Role" value={user?.role} />
          <InfoRow icon={Calendar} label="Member Since" value={formatDate(user?.createdAt)} />
          <InfoRow icon={Clock} label="Last Login" value={formatDate(user?.lastLogin)} />
          {user?.staffProfile?.team && (
            <InfoRow icon={User} label="Team" value={user.staffProfile.team} />
          )}
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <Shield size={16} className="text-gray-500" />
          <h3 className="font-bold text-gray-900 text-sm">Change Password</h3>
        </div>

        <div className="space-y-4">
          <PasswordField
            label="Current Password"
            value={pwForm.current}
            show={showCurrent}
            onToggle={() => setShowCurrent(p => !p)}
            onChange={(v) => setPwForm(p => ({ ...p, current: v }))}
            placeholder="Enter your current password"
          />
          <PasswordField
            label="New Password"
            value={pwForm.newPw}
            show={showNew}
            onToggle={() => setShowNew(p => !p)}
            onChange={(v) => setPwForm(p => ({ ...p, newPw: v }))}
            placeholder="Minimum 8 characters"
          />
          <PasswordField
            label="Confirm New Password"
            value={pwForm.confirm}
            show={showConfirm}
            onToggle={() => setShowConfirm(p => !p)}
            onChange={(v) => setPwForm(p => ({ ...p, confirm: v }))}
            placeholder="Re-enter new password"
          />

          {/* Password strength hint */}
          {pwForm.newPw && (
            <div className="flex items-center gap-2">
              {[4, 6, 8, 10].map((len) => (
                <div key={len} className="flex-1 h-1 rounded-full transition-all"
                  style={{ backgroundColor: pwForm.newPw.length >= len ? (pwForm.newPw.length >= 10 ? ADMIN_COLORS.success : ADMIN_COLORS.warning) : "#e2e8f0" }} />
              ))}
              <span className="text-xs font-semibold ml-1"
                style={{ color: pwForm.newPw.length >= 10 ? ADMIN_COLORS.success : pwForm.newPw.length >= 6 ? ADMIN_COLORS.warning : ADMIN_COLORS.error }}>
                {pwForm.newPw.length >= 10 ? "Strong" : pwForm.newPw.length >= 6 ? "Medium" : "Weak"}
              </span>
            </div>
          )}

          {pwError && (
            <div className="flex items-center gap-2 p-3 rounded-xl border"
              style={{ backgroundColor: ADMIN_COLORS.errorBg, borderColor: ADMIN_COLORS.errorBorder }}>
              <AlertTriangle size={14} style={{ color: ADMIN_COLORS.error }} />
              <p className="text-sm font-semibold" style={{ color: ADMIN_COLORS.error }}>{pwError}</p>
            </div>
          )}

          {pwSuccess && (
            <div className="flex items-center gap-2 p-3 rounded-xl border"
              style={{ backgroundColor: ADMIN_COLORS.successBg, borderColor: ADMIN_COLORS.successBorder }}>
              <CheckCircle size={14} style={{ color: ADMIN_COLORS.success }} />
              <p className="text-sm font-semibold" style={{ color: ADMIN_COLORS.success }}>{pwSuccess}</p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              onClick={() => { setPwForm({ current: "", newPw: "", confirm: "" }); setPwError(""); setPwSuccess(""); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
            >
              <X size={14} /> Clear
            </button>
            <button
              onClick={handleChangePassword}
              disabled={pwLoading || !pwForm.current || !pwForm.newPw || !pwForm.confirm}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold transition disabled:opacity-40"
              style={{ backgroundColor: ADMIN_COLORS.primary }}
            >
              {pwLoading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Updating...</>
              ) : (
                <><Save size={14} /> Update Password</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Permissions */}
      {user?.staffProfile?.permissions && user.staffProfile.permissions.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={16} className="text-gray-500" />
            <h3 className="font-bold text-gray-900 text-sm">Permissions</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {user.staffProfile.permissions.map((perm) => (
              <span key={perm} className="text-xs font-semibold px-3 py-1.5 rounded-full"
                style={{ backgroundColor: ADMIN_COLORS.infoBg, color: ADMIN_COLORS.info }}>
                {perm}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
