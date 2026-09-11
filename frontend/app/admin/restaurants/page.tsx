"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Plus,
  Search,
  MapPin,
  Phone,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  RefreshCw,
  Shield,
  Edit2,
  Store,
  ArrowRight,
} from "lucide-react";
import Api, { useApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store/useAuthStore";

export default function RestaurantsManagementPage() {
  const router = useRouter();
  const { role, selectedTenantId, setSelectedTenantId } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  if (role !== "super_admin") {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center text-center p-space-xl animate-fadeIn">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-4 border border-amber-500/20">
          <Building2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-on-surface mb-2">
          Super Admin Access Required
        </h2>
        <p className="text-sm text-on-surface-variant max-w-md leading-relaxed">
          Multi-tenant restaurant setup and platform management is restricted to <strong className="text-on-surface">Super Platform Administrators</strong>. As a Restaurant Admin, you have full control over your restaurant’s orders, menu, staff, and live operations.
        </p>
      </div>
    );
  }

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    address: "",
    lat: "11.5564",
    lng: "104.9282",
    phone: "",
    is_active: 1,
    admin_name: "",
    admin_email: "",
    admin_password: "",
  });

  const { data: response, loading, error, refetch } = useApi<any>("/restaurants.php");
  const rawRestaurants = Array.isArray(response?.data)
    ? response.data
    : Array.isArray(response)
    ? response
    : [];

  const filteredRestaurants = rawRestaurants.filter((r: any) => {
    const q = searchQuery.toLowerCase();
    return (
      r.name?.toLowerCase().includes(q) ||
      r.address?.toLowerCase().includes(q) ||
      r.phone?.includes(q)
    );
  });

  const handleCreateRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError("");
    setFormSuccess("");

    try {
      const res = await Api.post("/restaurants.php", {
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, "-"),
        address: formData.address,
        lat: parseFloat(formData.lat || "11.5564"),
        lng: parseFloat(formData.lng || "104.9282"),
        phone: formData.phone,
        is_active: formData.is_active,
        admin_name: formData.admin_name,
        admin_email: formData.admin_email,
        admin_password: formData.admin_password,
      });

      if (res.data?.success || res.status === 200 || res.status === 201) {
        setFormSuccess("Restaurant and Admin Account created successfully!");
        setTimeout(() => {
          setIsCreateModalOpen(false);
          setFormSuccess("");
          setFormData({
            name: "",
            slug: "",
            address: "",
            lat: "11.5564",
            lng: "104.9282",
            phone: "",
            is_active: 1,
            admin_name: "",
            admin_email: "",
            admin_password: "",
          });
          refetch();
        }, 1200);
      } else {
        setFormError(res.data?.message || "Failed to create restaurant.");
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || "Failed to create restaurant.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (restaurant: any) => {
    const nextStatus = restaurant.is_active ? 0 : 1;
    try {
      await Api.post("/restaurants.php", {
        action: "update",
        id: restaurant.id,
        name: restaurant.name,
        is_active: nextStatus,
      });
      refetch();
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  return (
    <div className="space-y-space-md p-space-lg max-w-7xl mx-auto pb-24">
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm bg-surface-container-lowest p-space-lg rounded-2xl border border-surface-container/60 shadow-xs">
        <div className="flex items-center gap-space-sm">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-2xl text-on-surface">
              Restaurant Tenants
            </h1>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Super Admin Multi-Tenant Platform Directory &amp; Onboarding
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            className="p-2.5 rounded-xl border border-surface-container hover:bg-surface-container-low text-on-surface-variant transition-colors"
            title="Refresh List"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-bold text-xs flex items-center gap-2 shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Onboard New Restaurant</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex items-center gap-space-md bg-surface-container-lowest p-3 rounded-xl border border-surface-container/60 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by restaurant name, phone, address..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-surface-container-low text-on-surface text-xs outline-none focus:ring-2 focus:ring-primary/30 border border-surface-container"
          />
        </div>
      </div>

      {/* Main Grid View */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center text-on-surface-variant gap-2">
          <Loader2 className="w-7 h-7 text-primary animate-spin" />
          <span className="font-bold text-xs">Loading multi-tenant restaurants...</span>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-red-50 text-red-700 border border-red-200 text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
          <h3 className="font-bold text-base">Failed to load restaurants</h3>
          <p className="text-xs mt-1">{String(error)}</p>
        </div>
      ) : filteredRestaurants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
          {filteredRestaurants.map((resto: any) => (
            <div
              key={resto.id}
              className="bg-surface-container-lowest rounded-2xl p-space-md border border-surface-container/80 shadow-sm flex flex-col justify-between hover:border-primary/40 transition-all group"
            >
              <div>
                {/* Header Badge */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-extrabold text-sm border border-primary/20 shrink-0">
                      {resto.logo_url ? (
                        <img
                          src={resto.logo_url}
                          alt={resto.name}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <Store className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-on-surface group-hover:text-primary transition-colors">
                        {resto.name}
                      </h3>
                      <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                        ID #{resto.id} • {resto.slug}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      resto.is_active
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {resto.is_active ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Active</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3 text-red-600" />
                        <span>Suspended</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Details List */}
                <div className="space-y-2 py-3 border-t border-b border-surface-container/60 text-xs text-on-surface-variant my-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span className="leading-snug">{resto.address || "No address specified"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-secondary shrink-0" />
                    <span>{resto.phone || "No phone number"}</span>
                  </div>
                  {resto.admin_name && (
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Admin: <strong>{resto.admin_name}</strong> ({resto.admin_email})</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => handleToggleStatus(resto)}
                  className={`text-xs font-bold py-1.5 px-3 rounded-lg border transition-colors ${
                    resto.is_active
                      ? "border-red-200 text-red-600 hover:bg-red-50"
                      : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                  }`}
                >
                  {resto.is_active ? "Suspend Tenant" : "Activate Tenant"}
                </button>

                <span className="text-[11px] text-on-surface-variant font-medium">
                  {resto.created_at ? new Date(resto.created_at).toLocaleDateString() : ""}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-surface-container-lowest rounded-2xl border border-surface-container p-8">
          <Building2 className="w-12 h-12 text-on-surface-variant/40 mx-auto mb-3" />
          <h3 className="font-extrabold text-base text-on-surface">No Restaurants Found</h3>
          <p className="text-xs text-on-surface-variant mt-1">
            No restaurant matches your filter. Click "Onboard New Restaurant" to add a tenant.
          </p>
        </div>
      )}

      {/* Onboard New Restaurant Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-surface-container max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-surface-container pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                <h3 className="font-extrabold text-lg text-on-surface">Onboard New Restaurant</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 mb-4 rounded-xl bg-red-50 text-red-600 text-xs font-semibold border border-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="p-3 mb-4 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateRestaurant} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-on-surface">Restaurant Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Phnom Penh Noodle House"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-surface-container-low border border-surface-container text-on-surface outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. +855 23 888 999"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-surface-container-low border border-surface-container text-on-surface outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Slug (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. phnom-penh-noodle"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-surface-container-low border border-surface-container text-on-surface outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-on-surface">Address</label>
                <input
                  type="text"
                  placeholder="Street Address, District, City"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-surface-container-low border border-surface-container text-on-surface outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-on-surface">GPS Latitude</label>
                  <input
                    type="text"
                    value={formData.lat}
                    onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-surface-container-low border border-surface-container text-on-surface outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-on-surface">GPS Longitude</label>
                  <input
                    type="text"
                    value={formData.lng}
                    onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-surface-container-low border border-surface-container text-on-surface outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-surface-container">
                <h4 className="font-bold text-xs text-primary mb-2">Initial Admin Account</h4>
                <div className="space-y-3">
                  <div>
                    <label className="font-bold text-on-surface">Admin Full Name</label>
                    <input
                      type="text"
                      placeholder="Admin Name"
                      value={formData.admin_name}
                      onChange={(e) => setFormData({ ...formData, admin_name: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-surface-container-low border border-surface-container text-on-surface outline-none focus:border-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-on-surface">Admin Email *</label>
                      <input
                        type="email"
                        required
                        placeholder="admin@restaurant.com"
                        value={formData.admin_email}
                        onChange={(e) => setFormData({ ...formData, admin_email: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-surface-container-low border border-surface-container text-on-surface outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-on-surface">Admin Password *</label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={formData.admin_password}
                        onChange={(e) => setFormData({ ...formData, admin_password: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-surface-container-low border border-surface-container text-on-surface outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl border border-surface-container text-on-surface font-bold hover:bg-surface-container-low"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="py-2.5 px-5 rounded-xl bg-primary text-on-primary font-bold shadow-sm hover:bg-primary-container flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save &amp; Onboard Tenant</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
