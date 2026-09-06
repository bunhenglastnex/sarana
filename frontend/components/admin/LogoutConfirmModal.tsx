"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { LogOut, ShieldAlert } from "lucide-react";
import { useAuthStore } from "@/lib/store/useAuthStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  isOpen,
  onClose,
}) => {
  const router = useRouter();
  const { name, role, clearSession } = useAuthStore();

  const displayName = name || "Elena Rostova";
  const displayRole = role === "admin" ? "General Manager" : role;

  const handleConfirmLogout = () => {
    clearSession();
    onClose();
    router.push("/admin/login");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md rounded-2xl bg-surface p-space-lg shadow-2xl border border-border/40 selection:bg-primary/20">
        <DialogHeader className="space-y-3 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-error-container/30 text-error flex items-center justify-center mx-auto sm:mx-0 shadow-xs border border-error/20">
            <LogOut className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div className="space-y-1">
            <DialogTitle className="font-headline-sm text-xl font-bold text-on-surface tracking-tight">
              Sign Out of Admin Console?
            </DialogTitle>
            <DialogDescription className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
              You are currently logged in as <strong className="text-on-surface font-semibold">{displayName}</strong> ({displayRole}).
              Signing out will end your active session on this device.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="bg-surface-container-low p-3 rounded-xl border border-border/40 flex items-center gap-3 my-2">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
          <p className="text-[11px] text-on-surface-variant font-medium leading-tight">
            Active order alerts and live kitchen broadcasts will be paused until you sign back in.
          </p>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-2 mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto h-10 font-bold text-xs rounded-xl border-border/50 text-on-surface hover:bg-surface-container-high"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirmLogout}
            className="w-full sm:w-auto h-10 font-bold text-xs rounded-xl bg-error text-on-error hover:bg-error/90 shadow-sm flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Yes, Sign Out</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LogoutConfirmModal;
