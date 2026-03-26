"use client";

import { useState, useCallback } from "react";
import {
  Search,
  ArrowUpDown,
  Download,
  Plus,
  Building2,
  ChevronLeft,
  ChevronRight,
  Trash2,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Company {
  id: string;
  name: string;
  owner_id: string | null;
  phone: string | null;
  city: string | null;
  country: string | null;
  lifecycle_stage: string;
  last_activity_at: string | null;
  created_at: string;
}

interface Props {
  initialCompanies: Company[];
  initialCount: number;
  currentUserId: string;
  currentUserName: string;
}

export default function CompaniesClient({
  initialCompanies,
  initialCount,
  currentUserId,
  currentUserName,
}: Props) {
  const [companies, setCompanies] = useState<Company[]>(initialCompanies);
  const [totalCount, setTotalCount] = useState(initialCount);
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState<"all" | "my">("all");
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const perPage = 25;

  const fetchCompanies = useCallback(
    async (params: {
      page: number;
      tab: string;
      search: string;
      sortField: string;
      sortDir: string;
    }) => {
      setLoading(true);
      try {
        const qs = new URLSearchParams({
          page: String(params.page),
          per_page: String(perPage),
          tab: params.tab,
          search: params.search,
          sort_field: params.sortField,
          sort_dir: params.sortDir,
        });
        const res = await fetch(`/api/companies?${qs}`);
        const json = await res.json();
        if (json.data) {
          setCompanies(json.data);
          setTotalCount(json.total_count);
        }
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleTabChange = (newTab: "all" | "my") => {
    setTab(newTab);
    setPage(1);
    setSelected(new Set());
    fetchCompanies({ page: 1, tab: newTab, search, sortField, sortDir });
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
    fetchCompanies({ page: 1, tab, search: value, sortField, sortDir });
  };

  const handleSort = (field: string) => {
    const newDir = sortField === field && sortDir === "desc" ? "asc" : "desc";
    setSortField(field);
    setSortDir(newDir);
    fetchCompanies({ page: 1, tab, search, sortField: field, sortDir: newDir });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setSelected(new Set());
    fetchCompanies({ page: newPage, tab, search, sortField, sortDir });
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === companies.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(companies.map((c) => c.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} companies?`)) return;

    const supabase = createClient();
    await supabase
      .from("companies")
      .delete()
      .in("id", Array.from(selected));

    setSelected(new Set());
    fetchCompanies({ page, tab, search, sortField, sortDir });
  };

  const handleExport = async () => {
    const res = await fetch("/api/companies/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tab, format: "csv" }),
    });
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `companies_${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleAddCompany = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const supabase = createClient();
    const { error } = await supabase.from("companies").insert({
      user_id: currentUserId,
      name: formData.get("name") as string,
      phone: (formData.get("phone") as string) || null,
      city: (formData.get("city") as string) || null,
      country: (formData.get("country") as string) || null,
    });
    if (!error) {
      setShowAddModal(false);
      fetchCompanies({ page: 1, tab, search, sortField, sortDir });
    }
  };

  const totalPages = Math.ceil(totalCount / perPage);

  const formatDate = (d: string | null) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const SortHeader = ({ field, label }: { field: string; label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-gray-500 hover:text-gray-900"
    >
      {label}
      <ArrowUpDown className="h-3 w-3" />
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-[family-name:var(--font-oswald)] text-3xl font-bold text-[var(--navy)]">
              Companies
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your business relationships
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--coral)] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Add company
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-4 flex items-center gap-1 border-b border-gray-200">
          <button
            onClick={() => handleTabChange("all")}
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === "all"
                ? "border-b-2 border-[var(--coral)] text-[var(--coral)]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            All companies
            <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
              {tab === "all" ? totalCount : ""}
            </span>
          </button>
          <button
            onClick={() => handleTabChange("my")}
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === "my"
                ? "border-b-2 border-[var(--coral)] text-[var(--coral)]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            My companies
          </button>
        </div>

        {/* Toolbar */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search companies..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-gray-400 focus:border-[var(--coral)] focus:ring-2 focus:ring-[var(--coral)]/20"
            />
          </div>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          {selected.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete ({selected.size})
            </button>
          )}
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="w-10 p-3">
                    <input
                      type="checkbox"
                      checked={selected.size === companies.length && companies.length > 0}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </th>
                  <th className="p-3 text-left">
                    <SortHeader field="name" label="Company name" />
                  </th>
                  <th className="p-3 text-left">
                    <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Company owner
                    </span>
                  </th>
                  <th className="p-3 text-left">
                    <SortHeader field="created_at" label="Create date" />
                  </th>
                  <th className="p-3 text-left">
                    <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Phone number
                    </span>
                  </th>
                  <th className="p-3 text-left">
                    <SortHeader field="last_activity_at" label="Last activity" />
                  </th>
                  <th className="p-3 text-left">
                    <SortHeader field="city" label="City" />
                  </th>
                  <th className="p-3 text-left">
                    <SortHeader field="country" label="Country" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center">
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-[var(--coral)]" />
                        Loading...
                      </div>
                    </td>
                  </tr>
                ) : companies.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center">
                      <Building2 className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                      <p className="text-sm font-medium text-gray-500">No companies yet</p>
                      <p className="mt-1 text-sm text-gray-400">
                        Add your first company to get started.
                      </p>
                    </td>
                  </tr>
                ) : (
                  companies.map((company) => (
                    <tr
                      key={company.id}
                      className={`transition-colors hover:bg-gray-50 ${
                        selected.has(company.id) ? "bg-blue-50/50" : ""
                      }`}
                    >
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selected.has(company.id)}
                          onChange={() => toggleSelect(company.id)}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </td>
                      <td className="p-3">
                        <span className="text-sm font-medium text-gray-900">
                          {company.name}
                        </span>
                      </td>
                      <td className="p-3">
                        {company.owner_id === currentUserId ? (
                          <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--coral)]/10 text-xs font-medium text-[var(--coral)]">
                              {currentUserName[0]?.toUpperCase()}
                            </div>
                            <span className="text-sm text-gray-700">{currentUserName}</span>
                          </div>
                        ) : company.owner_id ? (
                          <span className="text-sm text-gray-500">Assigned</span>
                        ) : (
                          <span className="text-sm text-gray-400">No owner</span>
                        )}
                      </td>
                      <td className="p-3 text-sm text-gray-500">
                        {formatDate(company.created_at)}
                      </td>
                      <td className="p-3 text-sm text-gray-500">
                        {company.phone || "—"}
                      </td>
                      <td className="p-3 text-sm text-gray-500">
                        {formatDate(company.last_activity_at)}
                      </td>
                      <td className="p-3 text-sm text-gray-500">
                        {company.city || "—"}
                      </td>
                      <td className="p-3 text-sm text-gray-500">
                        {company.country || "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
              <p className="text-sm text-gray-500">
                Showing {(page - 1) * perPage + 1}–
                {Math.min(page * perPage, totalCount)} of {totalCount}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const p = i + 1;
                  return (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`h-8 w-8 rounded-lg text-sm font-medium ${
                        page === p
                          ? "bg-[var(--coral)] text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 disabled:opacity-30"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Company Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-[family-name:var(--font-oswald)] text-xl font-bold text-[var(--navy)]">
                Add company
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddCompany} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Company name *
                </label>
                <input
                  name="name"
                  required
                  className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[var(--coral)] focus:ring-2 focus:ring-[var(--coral)]/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  name="phone"
                  className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[var(--coral)] focus:ring-2 focus:ring-[var(--coral)]/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    City
                  </label>
                  <input
                    name="city"
                    className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[var(--coral)] focus:ring-2 focus:ring-[var(--coral)]/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Country
                  </label>
                  <input
                    name="country"
                    className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[var(--coral)] focus:ring-2 focus:ring-[var(--coral)]/20"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[var(--coral)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                >
                  Add company
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
