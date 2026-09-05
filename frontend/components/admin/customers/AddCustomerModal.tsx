"use client";

import React, { useState } from "react";
import { UserPlus, X, Crown, Star, Sparkles } from "lucide-react";
import { CustomerRecord, CustomerTag } from "@/types/customers";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddCustomerModalProps {
  onClose: () => void;
  onAddCustomer: (customer: CustomerRecord) => void;
}

export const AddCustomerModal: React.FC<AddCustomerModalProps> = ({
  onClose,
  onAddCustomer,
}) => {
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newTag, setNewTag] = useState<CustomerTag>("New");
  const [newAddress, setNewAddress] = useState("");
  const [newNotes, setNewNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    const created: CustomerRecord = {
      id: `CUST-${Math.floor(100 + Math.random() * 900)}`,
      name: newName,
      phone: newPhone,
      email: newEmail || `${newName.toLowerCase().replace(/\s+/g, ".")}@example.com`,
      tag: newTag,
      totalOrders: 0,
      totalSpend: 0.0,
      preferredChannel: "delivery",
      paymentPreference: "KHQR",
      lastOrderDate: "Just Registered",
      address: newAddress,
      notes: newNotes,
      orders: [],
    };

    onAddCustomer(created);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-on-surface/60 backdrop-blur-xs z-50 flex items-center justify-center p-space-md animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-space-md shadow-2xl space-y-space-md border border-border/40"
      >
        <div className="flex items-center justify-between border-b border-border/30 pb-2">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            <h3 className="font-headline-sm text-sm font-bold text-on-surface">
              Add New Customer Profile
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="font-label-sm text-xs font-bold text-on-surface block mb-1">
              Customer Full Name *
            </label>
            <input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Liam Vance"
              className="w-full px-3 py-2 rounded-xl bg-surface-container-low text-on-surface font-body-sm text-xs outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/40 border border-border/40"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-label-sm text-xs font-bold text-on-surface block mb-1">
                Phone Number *
              </label>
              <input
                type="text"
                required
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3 py-2 rounded-xl bg-surface-container-low text-on-surface font-body-sm text-xs outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/40 border border-border/40"
              />
            </div>

            <div>
              <label className="font-label-sm text-xs font-bold text-on-surface block mb-1">
                Customer Tag
              </label>
              <Select
                value={newTag}
                onValueChange={(val) => setNewTag(val as CustomerTag)}
              >
                <SelectTrigger className="w-full h-9 rounded-xl bg-surface-container-low border border-border/40 text-xs text-on-surface focus:ring-2 focus:ring-primary/40">
                  <SelectValue placeholder="Select Tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="New">
                    <span className="font-bold">NEW GUEST</span>
                  </SelectItem>
                  <SelectItem value="Regular">
                    <div className="flex items-center gap-1.5 font-bold">
                      <Star className="w-3.5 h-3.5 text-secondary" />
                      <span>REGULAR</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="VIP">
                    <div className="flex items-center gap-1.5 font-bold">
                      <Crown className="w-3.5 h-3.5 text-amber-500" />
                      <span>VIP DINER</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="High Spend">
                    <div className="flex items-center gap-1.5 font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                      <span>HIGH SPEND</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="font-label-sm text-xs font-bold text-on-surface block mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="liam@example.com"
              className="w-full px-3 py-2 rounded-xl bg-surface-container-low text-on-surface font-body-sm text-xs outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/40 border border-border/40"
            />
          </div>

          <div>
            <label className="font-label-sm text-xs font-bold text-on-surface block mb-1">
              Primary Delivery Address
            </label>
            <input
              type="text"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              placeholder="Street name, Apt #, City"
              className="w-full px-3 py-2 rounded-xl bg-surface-container-low text-on-surface font-body-sm text-xs outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/40 border border-border/40"
            />
          </div>

          <div>
            <label className="font-label-sm text-xs font-bold text-on-surface block mb-1">
              Customer Notes &amp; Dietary Restrictions
            </label>
            <textarea
              rows={2}
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              placeholder="Preferences, allergies, buzzer codes..."
              className="w-full px-3 py-2 rounded-xl bg-surface-container-low text-on-surface font-body-sm text-xs outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/40 border border-border/40 resize-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant font-label-md text-xs font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-2/3 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-lg text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Save Customer</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
