"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  UserPlus,
  User,
  Phone,
  Mail,
  Shield,
  CheckCircle2,
  Camera,
} from "lucide-react";
import { StaffRecord } from "@/types/staff";

import { Api } from "@/lib/api";

interface CreateStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStaff: (newStaff: StaffRecord) => void;
}

export const CreateStaffModal: React.FC<CreateStaffModalProps> = ({
  isOpen,
  onClose,
  onAddStaff,
}) => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("driver123");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim() || !phone.trim()) {
      setErrorMsg("Please fill in required fields (Name and Phone).");
      return;
    }

    setIsSubmitting(true);

    try {
      // Call backend API to create delivery driver
      const res = await Api.post("/auth.php?action=add-delivery", {
        name: name.trim(),
        phone: phone.trim(),
        password: password || "driver123",
        email: email.trim(),
        role: "delivery",
      });

      if (res.success && res.data) {
        const generatedCode =
          code.trim() ||
          `DRV-${res.data.id || Math.floor(100 + Math.random() * 900)}`;
        const defaultAvatar = `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80`;

        const newStaff: StaffRecord = {
          id: `staff-${res.data.id || Date.now()}`,
          code: generatedCode,
          name: res.data.name || name.trim(),
          phone: res.data.phone || phone.trim(),
          email: res.data.email || undefined,
          avatarUrl: avatarUrl || defaultAvatar,
          role: "delivery",
          roleLabel: "Delivery Driver",
          status: "available",
          statusLabel: "ONLINE (AVAILABLE)",
          vehicleType: "motorbike",
          vehicleLabel: "Honda Click (Motorbike)",
          deliveriesToday: 0,
          codCashCollected: 0,
          tipsToday: 0,
          rating: 5.0,
          joinedDate: new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
        };

        onAddStaff(newStaff);

        // Reset form
        setName("");
        setCode("");
        setPhone("");
        setEmail("");
        setPassword("driver123");
        setAvatarUrl("");
        onClose();
      } else {
        setErrorMsg(res.error || "Failed to create delivery driver account.");
      }
    } catch (err: any) {
      setErrorMsg("Network error: Unable to contact backend server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 w-screen h-screen min-h-screen bg-black/70 backdrop-blur-md z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Background click overlay */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Dialog Content Card */}
      <div className="relative z-10 bg-surface-container-lowest border border-border/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-fadeIn my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-headline-sm text-lg font-black text-on-surface tracking-tight">
                Add New Staff Member
              </h2>
              <p className="font-body-sm text-xs text-on-surface-variant">
                Create a courier or staff profile for terminal dispatch access.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-surface-container text-on-surface-variant transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-300 text-xs font-semibold text-center animate-fadeIn">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Profile Photo Upload */}
          <div className="flex flex-col items-center justify-center space-y-1.5 pb-2">
            <label className="relative group cursor-pointer flex flex-col items-center">
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-primary/40 hover:border-primary bg-surface-container-low flex items-center justify-center overflow-hidden transition-all shadow-sm group-hover:shadow-md">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors">
                    <Camera className="w-6 h-6 mb-0.5" />
                    <span className="text-[10px] font-bold">Upload</span>
                  </div>
                )}

                {avatarUrl && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                    <Camera className="w-5 h-5" />
                  </div>
                )}
              </div>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
            <span className="text-[11px] font-semibold text-on-surface-variant">
              Click to upload photo (JPG, PNG)
            </span>
          </div>

          {/* Full Name & Staff Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-on-surface">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dara Sok"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-surface-container-low border border-border/40 text-on-surface focus:outline-none focus:border-primary font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-on-surface">
                Staff ID / Code
              </label>
              <div className="relative">
                <Shield className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. DRV-805"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-surface-container-low border border-border/40 text-on-surface focus:outline-none focus:border-primary font-medium"
                />
              </div>
            </div>
          </div>

          {/* Phone Number & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-on-surface">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+855 12 345 678"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-surface-container-low border border-border/40 text-on-surface focus:outline-none focus:border-primary font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-on-surface">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="dara@bistro.com"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-surface-container-low border border-border/40 text-on-surface focus:outline-none focus:border-primary font-medium"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/30">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-on-surface-variant hover:text-on-surface bg-surface-container-low hover:bg-surface-container rounded-xl transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-on-primary bg-primary hover:bg-primary-container rounded-xl shadow-md flex items-center gap-1.5 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save &amp; Add Staff</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};
