"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Shield,
  Users,
  CreditCard,
  BarChart3,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Trash2,
  X,
  Loader2,
  Check,
  AlertTriangle,
  Crown,
  Gem,
  Zap,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────

interface AdminUser {
  id: string;
  email: string | null;
  company_name: string | null;
  industry: string | null;
  role: string;
  onboarding_completed: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  entitlements: {
    entitlement: string;
    status: string;
    expires_at: string | null;
    source_product_id: string | null;
  }[];
  credits: {
    credits_remaining: number;
    credits_total: number;
    credits_used: number;
    unlimited: boolean;
  };
  tierName: string;
}

interface UserDetail extends AdminUser {
  company_website: string | null;
  team_size: number | null;
  role_in_company: string | null;
  bio: string | null;
  country: string | null;
  timezone: string | null;
  phone: string | null;
  preferred_language: string | null;
  avatar_url: string | null;
  first_login_at: string | null;
  activeEntitlements: {
    id: string;
    entitlement: string;
    status: string;
    expires_at: string | null;
    source_product_id: string | null;
    granted_by: string | null;
    notes: string | null;
    created_at: string;
  }[];
  purchases: {
    id: string;
    product_id: string;
    amount_cents: number;
    currency: string;
    status: string;
    created_at: string;
  }[];
  subscription: {
    plan: string;
    status: string;
    stripe_customer_id: string;
    current_period_end: string | null;
  } | null;
  strategyCount: number;
}

interface Stats {
  totalUsers: number;
  totalPurchases: number;
  totalStrategies: number;
  totalRevenue: number;
}

type ModalMode = "none" | "view" | "edit" | "create" | "delete";

// ─── Component ───────────────────────────────────────────────────

export function AdminDashboard({ stats }: { stats: Stats }) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [tierFilter, setTierFilter] = useState("");
  const limit = 20;

  // Modal state
  const [modalMode, setModalMode] = useState<ModalMode>("none");
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Create user form state
  const [createForm, setCreateForm] = useState({
    email: "",
    password: "",
    company_name: "",
    industry: "",
    role: "user",
  });

  // Edit form state
  const [editForm, setEditForm] = useState<Record<string, string | boolean | number | null>>({});

  // ─── Fetch users ───────────────────────────────────────────────

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search) params.set("search", search);
      if (roleFilter) params.set("role", roleFilter);
      if (tierFilter) params.set("tier", tierFilter);

      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users);
        setTotal(data.total);
      }
    } catch {
      console.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, tierFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Debounced search
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // ─── User detail ──────────────────────────────────────────────

  const fetchUserDetail = async (id: string) => {
    setModalLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`);
      const data = await res.json();
      if (res.ok) {
        setSelectedUser(data.user);
      }
    } catch {
      console.error("Failed to fetch user detail");
    } finally {
      setModalLoading(false);
    }
  };

  const openView = (id: string) => {
    setModalMode("view");
    fetchUserDetail(id);
  };

  const openEdit = (user: AdminUser) => {
    setModalMode("edit");
    fetchUserDetail(user.id);
    setEditForm({
      company_name: user.company_name || "",
      industry: user.industry || "",
      role: user.role,
    });
  };

  const openCreate = () => {
    setModalMode("create");
    setCreateForm({
      email: "",
      password: "",
      company_name: "",
      industry: "",
      role: "user",
    });
  };

  const openDelete = (user: AdminUser) => {
    setModalMode("delete");
    fetchUserDetail(user.id);
  };

  const closeModal = () => {
    setModalMode("none");
    setSelectedUser(null);
    setActionMessage(null);
  };

  // ─── CRUD actions ─────────────────────────────────────────────

  const handleCreate = async () => {
    if (!createForm.email || !createForm.password) {
      setActionMessage({ type: "error", text: "Email and password are required" });
      return;
    }
    setModalLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage({ type: "success", text: "User created successfully" });
        setTimeout(() => {
          closeModal();
          fetchUsers();
        }, 1500);
      } else {
        setActionMessage({ type: "error", text: data.error || "Failed to create user" });
      }
    } catch {
      setActionMessage({ type: "error", text: "Failed to create user" });
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedUser) return;
    setModalLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage({ type: "success", text: "User updated successfully" });
        setTimeout(() => {
          closeModal();
          fetchUsers();
        }, 1500);
      } else {
        setActionMessage({ type: "error", text: data.error || "Failed to update user" });
      }
    } catch {
      setActionMessage({ type: "error", text: "Failed to update user" });
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (hard: boolean) => {
    if (!selectedUser) return;
    setModalLoading(true);
    try {
      const url = `/api/admin/users/${selectedUser.id}${hard ? "?hard=true" : ""}`;
      const res = await fetch(url, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setActionMessage({
          type: "success",
          text: hard ? "User permanently deleted" : "User access revoked",
        });
        setTimeout(() => {
          closeModal();
          fetchUsers();
        }, 1500);
      } else {
        setActionMessage({ type: "error", text: data.error || "Failed to delete user" });
      }
    } catch {
      setActionMessage({ type: "error", text: "Failed to delete user" });
    } finally {
      setModalLoading(false);
    }
  };

  // ─── Entitlement management ───────────────────────────────────

  const grantEntitlement = async (entitlement: string) => {
    if (!selectedUser) return;
    setModalLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}/entitlements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entitlement }),
      });
      if (res.ok) {
        setActionMessage({ type: "success", text: `Granted ${entitlement}` });
        fetchUserDetail(selectedUser.id);
      } else {
        const data = await res.json();
        setActionMessage({ type: "error", text: data.error });
      }
    } catch {
      setActionMessage({ type: "error", text: "Failed to grant entitlement" });
    } finally {
      setModalLoading(false);
    }
  };

  const revokeEntitlement = async (entitlement: string) => {
    if (!selectedUser) return;
    setModalLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}/entitlements`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entitlement }),
      });
      if (res.ok) {
        setActionMessage({ type: "success", text: `Revoked ${entitlement}` });
        fetchUserDetail(selectedUser.id);
      } else {
        const data = await res.json();
        setActionMessage({ type: "error", text: data.error });
      }
    } catch {
      setActionMessage({ type: "error", text: "Failed to revoke entitlement" });
    } finally {
      setModalLoading(false);
    }
  };

  const adjustCredits = async (amount: number) => {
    if (!selectedUser) return;
    setModalLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}/credits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, reason: "admin_grant" }),
      });
      if (res.ok) {
        setActionMessage({ type: "success", text: `Credits adjusted by ${amount}` });
        fetchUserDetail(selectedUser.id);
      } else {
        const data = await res.json();
        setActionMessage({ type: "error", text: data.error });
      }
    } catch {
      setActionMessage({ type: "error", text: "Failed to adjust credits" });
    } finally {
      setModalLoading(false);
    }
  };

  const toggleUnlimited = async (unlimited: boolean) => {
    if (!selectedUser) return;
    setModalLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}/credits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unlimited }),
      });
      if (res.ok) {
        setActionMessage({
          type: "success",
          text: unlimited ? "Set to unlimited credits" : "Unlimited credits removed",
        });
        fetchUserDetail(selectedUser.id);
      } else {
        const data = await res.json();
        setActionMessage({ type: "error", text: data.error });
      }
    } catch {
      setActionMessage({ type: "error", text: "Failed to toggle unlimited" });
    } finally {
      setModalLoading(false);
    }
  };

  // ─── Helpers ──────────────────────────────────────────────────

  const formatDate = (d: string | null) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const tierIcon = (tier: string) => {
    if (tier.includes("Agency")) return <Crown className="h-3.5 w-3.5 text-amber-500" />;
    if (tier.includes("Professional")) return <Gem className="h-3.5 w-3.5 text-purple-500" />;
    if (tier.includes("Essentials") || tier.includes("Templates"))
      return <Zap className="h-3.5 w-3.5 text-blue-500" />;
    if (tier.includes("Admin")) return <Shield className="h-3.5 w-3.5 text-[var(--teal)]" />;
    return null;
  };

  const tierBadgeColor = (tier: string) => {
    if (tier.includes("Agency")) return "bg-amber-50 text-amber-700 border-amber-200";
    if (tier.includes("Professional")) return "bg-purple-50 text-purple-700 border-purple-200";
    if (tier.includes("Essentials") || tier.includes("Templates"))
      return "bg-blue-50 text-blue-700 border-blue-200";
    if (tier.includes("Admin")) return "bg-teal-50 text-teal-700 border-teal-200";
    return "bg-gray-50 text-gray-600 border-gray-200";
  };

  const roleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-50 text-red-700 border-red-200";
      case "moderator":
        return "bg-orange-50 text-orange-700 border-orange-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  const totalPages = Math.ceil(total / limit);

  const ALL_ENTITLEMENTS = [
    "templates",
    "strategy_builder",
    "circle",
    "agency",
    "consulting",
  ];

  // ─── Render ───────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Shield className="h-6 w-6 text-[var(--teal)]" />
        <h1 className="font-[family-name:var(--font-oswald)] text-2xl font-bold text-[var(--navy)] uppercase">
          Super Admin Dashboard
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<Users className="h-5 w-5 text-[var(--teal)]" />}
          value={stats.totalUsers}
          label="Total Users"
        />
        <StatCard
          icon={<CreditCard className="h-5 w-5 text-[var(--teal)]" />}
          value={stats.totalPurchases}
          label="Purchases"
        />
        <StatCard
          icon={<BarChart3 className="h-5 w-5 text-[var(--teal)]" />}
          value={stats.totalStrategies}
          label="Strategies Created"
        />
        <StatCard
          icon={<CreditCard className="h-5 w-5 text-emerald-500" />}
          value={`€${stats.totalRevenue.toFixed(0)}`}
          label="Revenue"
          valueColor="text-emerald-600"
        />
      </div>

      {/* User Management */}
      <div className="rounded-xl border border-[#e8eaed] bg-white">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 border-b border-[#e8eaed]">
          <h2 className="font-[family-name:var(--font-oswald)] text-lg font-bold text-[var(--charcoal)] uppercase">
            User Management
          </h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--mid-gray)]" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full sm:w-64 rounded-lg border border-[#e8eaed] bg-white py-2 pl-9 pr-3 text-sm text-[var(--charcoal)] placeholder:text-[var(--mid-gray)] focus:border-[var(--teal)] focus:outline-none focus:ring-1 focus:ring-[var(--teal)]"
              />
            </div>
            {/* Role filter */}
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-[#e8eaed] bg-white py-2 px-3 text-sm text-[var(--charcoal)] focus:border-[var(--teal)] focus:outline-none"
            >
              <option value="">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
            </select>
            {/* Tier filter */}
            <select
              value={tierFilter}
              onChange={(e) => {
                setTierFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-[#e8eaed] bg-white py-2 px-3 text-sm text-[var(--charcoal)] focus:border-[var(--teal)] focus:outline-none"
            >
              <option value="">All Plans</option>
              <option value="free">Free</option>
              <option value="essentials">Essentials</option>
              <option value="professional">Professional</option>
              <option value="agency">Agency</option>
            </select>
            {/* Create button */}
            <button
              onClick={openCreate}
              className="flex items-center gap-2 rounded-lg bg-[var(--teal)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
            >
              <Plus className="h-4 w-4" />
              Add User
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e8eaed] bg-gray-50/50">
                <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--mid-gray)] uppercase tracking-wider">
                  User
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--mid-gray)] uppercase tracking-wider">
                  Role
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--mid-gray)] uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--mid-gray)] uppercase tracking-wider">
                  Credits
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--mid-gray)] uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--mid-gray)] uppercase tracking-wider">
                  Last Active
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-[var(--mid-gray)] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8eaed]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <Loader2 className="h-6 w-6 animate-spin text-[var(--teal)] mx-auto" />
                    <p className="text-sm text-[var(--mid-gray)] mt-2">Loading users...</p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-[var(--mid-gray)]">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="font-medium text-[var(--charcoal)]">
                          {user.company_name || "—"}
                        </p>
                        <p className="text-xs text-[var(--mid-gray)] truncate max-w-[200px]">
                          {user.id.slice(0, 8)}...
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${roleBadge(user.role)}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${tierBadgeColor(user.tierName)}`}
                      >
                        {tierIcon(user.tierName)}
                        {user.tierName}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[var(--charcoal)]">
                      {user.credits.unlimited ? (
                        <span className="text-xs font-medium text-amber-600">Unlimited</span>
                      ) : (
                        <span className="text-xs">
                          {user.credits.credits_remaining} / {user.credits.credits_total}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[var(--mid-gray)]">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[var(--mid-gray)]">
                      {formatDate(user.last_login_at)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openView(user.id)}
                          className="rounded-lg p-1.5 text-[var(--mid-gray)] hover:bg-gray-100 hover:text-[var(--charcoal)] transition-colors"
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEdit(user)}
                          className="rounded-lg p-1.5 text-[var(--mid-gray)] hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          title="Edit user"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openDelete(user)}
                          className="rounded-lg p-1.5 text-[var(--mid-gray)] hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Delete user"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-[#e8eaed]">
            <p className="text-xs text-[var(--mid-gray)]">
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-[#e8eaed] p-1.5 text-[var(--mid-gray)] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs text-[var(--charcoal)] font-medium">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-[#e8eaed] p-1.5 text-[var(--mid-gray)] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── MODALS ──────────────────────────────────────────────── */}
      {modalMode !== "none" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[#e8eaed] bg-white shadow-xl">
            {/* Close */}
            <button
              onClick={closeModal}
              className="absolute right-4 top-4 rounded-lg p-1 text-[var(--mid-gray)] hover:bg-gray-100 z-10"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Message banner */}
            {actionMessage && (
              <div
                className={`mx-6 mt-6 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium ${
                  actionMessage.type === "success"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {actionMessage.type === "success" ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )}
                {actionMessage.text}
              </div>
            )}

            {/* ─── VIEW MODE ─────────────────────────────────────── */}
            {modalMode === "view" && (
              <div className="p-6">
                <h3 className="font-[family-name:var(--font-oswald)] text-xl font-bold text-[var(--navy)] uppercase mb-6">
                  User Details
                </h3>
                {modalLoading && !selectedUser ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-[var(--teal)]" />
                  </div>
                ) : selectedUser ? (
                  <div className="space-y-6">
                    {/* Profile info */}
                    <Section title="Profile">
                      <InfoRow label="User ID" value={selectedUser.id} mono />
                      <InfoRow label="Company" value={selectedUser.company_name} />
                      <InfoRow label="Industry" value={selectedUser.industry} />
                      <InfoRow label="Website" value={selectedUser.company_website} />
                      <InfoRow label="Country" value={selectedUser.country} />
                      <InfoRow label="Phone" value={selectedUser.phone} />
                      <InfoRow label="Role" value={selectedUser.role} />
                      <InfoRow label="Onboarding" value={selectedUser.onboarding_completed ? "Completed" : "Pending"} />
                    </Section>

                    {/* Plan & Entitlements */}
                    <Section title="Plan & Entitlements">
                      <InfoRow label="Current Tier" value={selectedUser.tierName} />
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-[var(--mid-gray)] uppercase mb-2">
                          Active Entitlements
                        </p>
                        {selectedUser.activeEntitlements.length === 0 ? (
                          <p className="text-sm text-[var(--mid-gray)]">None</p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {selectedUser.activeEntitlements.map((e) => (
                              <span
                                key={e.id}
                                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
                              >
                                <Check className="h-3 w-3" />
                                {e.entitlement}
                                {e.expires_at && (
                                  <span className="text-emerald-500">
                                    (exp {formatDate(e.expires_at)})
                                  </span>
                                )}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      {/* Grant/revoke */}
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-[var(--mid-gray)] uppercase mb-2">
                          Manage Entitlements
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {ALL_ENTITLEMENTS.map((ent) => {
                            const hasIt = selectedUser.activeEntitlements.some(
                              (e) => e.entitlement === ent
                            );
                            return (
                              <button
                                key={ent}
                                onClick={() =>
                                  hasIt
                                    ? revokeEntitlement(ent)
                                    : grantEntitlement(ent)
                                }
                                disabled={modalLoading}
                                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
                                  hasIt
                                    ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                                    : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                }`}
                              >
                                {hasIt ? `Revoke ${ent}` : `Grant ${ent}`}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </Section>

                    {/* Credits */}
                    <Section title="Strategy Credits">
                      <InfoRow
                        label="Balance"
                        value={
                          selectedUser.credits.unlimited
                            ? "Unlimited"
                            : `${selectedUser.credits.credits_remaining} remaining / ${selectedUser.credits.credits_total} total`
                        }
                      />
                      <InfoRow
                        label="Used"
                        value={String(selectedUser.credits.credits_used)}
                      />
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          onClick={() => adjustCredits(5)}
                          disabled={modalLoading}
                          className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                        >
                          +5 Credits
                        </button>
                        <button
                          onClick={() => adjustCredits(10)}
                          disabled={modalLoading}
                          className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                        >
                          +10 Credits
                        </button>
                        <button
                          onClick={() =>
                            toggleUnlimited(!selectedUser.credits.unlimited)
                          }
                          disabled={modalLoading}
                          className={`rounded-lg border px-3 py-1.5 text-xs font-medium disabled:opacity-50 ${
                            selectedUser.credits.unlimited
                              ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                              : "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                          }`}
                        >
                          {selectedUser.credits.unlimited
                            ? "Remove Unlimited"
                            : "Set Unlimited"}
                        </button>
                      </div>
                    </Section>

                    {/* Purchases */}
                    <Section title={`Purchases (${selectedUser.purchases.length})`}>
                      {selectedUser.purchases.length === 0 ? (
                        <p className="text-sm text-[var(--mid-gray)]">No purchases</p>
                      ) : (
                        <div className="space-y-2">
                          {selectedUser.purchases.map((p) => (
                            <div
                              key={p.id}
                              className="flex items-center justify-between rounded-lg border border-[#e8eaed] px-3 py-2"
                            >
                              <div>
                                <p className="text-xs font-medium text-[var(--charcoal)]">
                                  {p.product_id}
                                </p>
                                <p className="text-xs text-[var(--mid-gray)]">
                                  {formatDate(p.created_at)}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-medium text-[var(--charcoal)]">
                                  €{((p.amount_cents || 0) / 100).toFixed(2)}
                                </p>
                                <p className="text-xs text-[var(--mid-gray)]">{p.status}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </Section>

                    {/* Timestamps */}
                    <Section title="Activity">
                      <InfoRow label="Joined" value={formatDate(selectedUser.created_at)} />
                      <InfoRow label="First Login" value={formatDate(selectedUser.first_login_at)} />
                      <InfoRow label="Last Active" value={formatDate(selectedUser.last_login_at)} />
                      <InfoRow label="Strategies Created" value={String(selectedUser.strategyCount)} />
                    </Section>
                  </div>
                ) : null}
              </div>
            )}

            {/* ─── CREATE MODE ───────────────────────────────────── */}
            {modalMode === "create" && (
              <div className="p-6">
                <h3 className="font-[family-name:var(--font-oswald)] text-xl font-bold text-[var(--navy)] uppercase mb-6">
                  Create User
                </h3>
                <div className="space-y-4">
                  <FormField
                    label="Email *"
                    type="email"
                    value={createForm.email}
                    onChange={(v) => setCreateForm((f) => ({ ...f, email: v }))}
                    placeholder="user@example.com"
                  />
                  <FormField
                    label="Password *"
                    type="password"
                    value={createForm.password}
                    onChange={(v) => setCreateForm((f) => ({ ...f, password: v }))}
                    placeholder="Min 6 characters"
                  />
                  <FormField
                    label="Company Name"
                    value={createForm.company_name}
                    onChange={(v) => setCreateForm((f) => ({ ...f, company_name: v }))}
                    placeholder="Acme Corp"
                  />
                  <FormField
                    label="Industry"
                    value={createForm.industry}
                    onChange={(v) => setCreateForm((f) => ({ ...f, industry: v }))}
                    placeholder="Technology / SaaS"
                  />
                  <div>
                    <label className="block text-xs font-semibold text-[var(--charcoal)] mb-1.5">
                      Role
                    </label>
                    <select
                      value={createForm.role}
                      onChange={(e) =>
                        setCreateForm((f) => ({ ...f, role: e.target.value }))
                      }
                      className="w-full rounded-lg border border-[#e8eaed] bg-white py-2 px-3 text-sm text-[var(--charcoal)] focus:border-[var(--teal)] focus:outline-none"
                    >
                      <option value="user">User</option>
                      <option value="moderator">Moderator</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      onClick={closeModal}
                      className="rounded-lg border border-[#e8eaed] px-4 py-2 text-sm font-medium text-[var(--charcoal)] hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreate}
                      disabled={modalLoading}
                      className="flex items-center gap-2 rounded-lg bg-[var(--teal)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                    >
                      {modalLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                      Create User
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ─── EDIT MODE ─────────────────────────────────────── */}
            {modalMode === "edit" && (
              <div className="p-6">
                <h3 className="font-[family-name:var(--font-oswald)] text-xl font-bold text-[var(--navy)] uppercase mb-6">
                  Edit User
                </h3>
                {modalLoading && !selectedUser ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-[var(--teal)]" />
                  </div>
                ) : selectedUser ? (
                  <div className="space-y-4">
                    <div className="rounded-lg bg-gray-50 p-3 text-xs text-[var(--mid-gray)]">
                      User ID: {selectedUser.id}
                    </div>
                    <FormField
                      label="Company Name"
                      value={String(editForm.company_name || "")}
                      onChange={(v) => setEditForm((f) => ({ ...f, company_name: v }))}
                    />
                    <FormField
                      label="Industry"
                      value={String(editForm.industry || "")}
                      onChange={(v) => setEditForm((f) => ({ ...f, industry: v }))}
                    />
                    <FormField
                      label="Country"
                      value={String(editForm.country || selectedUser.country || "")}
                      onChange={(v) => setEditForm((f) => ({ ...f, country: v }))}
                    />
                    <FormField
                      label="Phone"
                      value={String(editForm.phone || selectedUser.phone || "")}
                      onChange={(v) => setEditForm((f) => ({ ...f, phone: v }))}
                    />
                    <FormField
                      label="Website"
                      value={String(editForm.company_website || selectedUser.company_website || "")}
                      onChange={(v) => setEditForm((f) => ({ ...f, company_website: v }))}
                    />
                    <div>
                      <label className="block text-xs font-semibold text-[var(--charcoal)] mb-1.5">
                        Role
                      </label>
                      <select
                        value={String(editForm.role || selectedUser.role)}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, role: e.target.value }))
                        }
                        className="w-full rounded-lg border border-[#e8eaed] bg-white py-2 px-3 text-sm text-[var(--charcoal)] focus:border-[var(--teal)] focus:outline-none"
                      >
                        <option value="user">User</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        onClick={closeModal}
                        className="rounded-lg border border-[#e8eaed] px-4 py-2 text-sm font-medium text-[var(--charcoal)] hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUpdate}
                        disabled={modalLoading}
                        className="flex items-center gap-2 rounded-lg bg-[var(--teal)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                      >
                        {modalLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {/* ─── DELETE MODE ────────────────────────────────────── */}
            {modalMode === "delete" && (
              <div className="p-6">
                <h3 className="font-[family-name:var(--font-oswald)] text-xl font-bold text-red-600 uppercase mb-4">
                  Delete User
                </h3>
                {modalLoading && !selectedUser ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-[var(--teal)]" />
                  </div>
                ) : selectedUser ? (
                  <div className="space-y-4">
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-red-800">
                            Are you sure you want to remove this user?
                          </p>
                          <p className="text-xs text-red-600 mt-1">
                            <strong>Company:</strong>{" "}
                            {selectedUser.company_name || "N/A"}
                          </p>
                          <p className="text-xs text-red-600">
                            <strong>Tier:</strong> {selectedUser.tierName}
                          </p>
                          <p className="text-xs text-red-600">
                            <strong>Purchases:</strong>{" "}
                            {selectedUser.purchases?.length ?? 0}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 pt-2">
                      <button
                        onClick={() => handleDelete(false)}
                        disabled={modalLoading}
                        className="flex items-center justify-center gap-2 rounded-lg border border-orange-300 bg-orange-50 px-4 py-2.5 text-sm font-medium text-orange-700 hover:bg-orange-100 disabled:opacity-50"
                      >
                        {modalLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                        Deactivate (Revoke Access)
                      </button>
                      <button
                        onClick={() => handleDelete(true)}
                        disabled={modalLoading}
                        className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                      >
                        {modalLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                        Permanently Delete
                      </button>
                      <button
                        onClick={closeModal}
                        className="rounded-lg border border-[#e8eaed] px-4 py-2.5 text-sm font-medium text-[var(--charcoal)] hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────

function StatCard({
  icon,
  value,
  label,
  valueColor,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  valueColor?: string;
}) {
  return (
    <div className="rounded-xl border border-[#e8eaed] bg-white p-5">
      {icon}
      <div
        className={`font-[family-name:var(--font-oswald)] text-3xl font-bold mt-2 ${valueColor || "text-[var(--charcoal)]"}`}
      >
        {value}
      </div>
      <p className="text-xs text-[var(--mid-gray)]">{label}</p>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[#e8eaed] p-4">
      <h4 className="font-[family-name:var(--font-oswald)] text-sm font-bold text-[var(--charcoal)] uppercase mb-3">
        {title}
      </h4>
      {children}
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string | null | undefined;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between py-1.5 border-b border-[#e8eaed] last:border-0">
      <span className="text-xs text-[var(--mid-gray)]">{label}</span>
      <span
        className={`text-xs font-medium text-[var(--charcoal)] text-right max-w-[60%] break-all ${mono ? "font-mono text-[10px]" : ""}`}
      >
        {value || "—"}
      </span>
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[var(--charcoal)] mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-[#e8eaed] bg-white py-2 px-3 text-sm text-[var(--charcoal)] placeholder:text-[var(--mid-gray)] focus:border-[var(--teal)] focus:outline-none focus:ring-1 focus:ring-[var(--teal)]"
      />
    </div>
  );
}
