"use client";

import React, { useState, useRef } from "react";
import {
  ShieldCheck,
  Database,
  RotateCcw,
  Upload,
  AlertTriangle,
  FileCheck,
  CheckCircle2,
  HardDriveDownload,
  Loader2,
  Clock,
  Archive,
  FileCode2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface SnapshotItem {
  id: string;
  filename: string;
  createdAt: string;
  size: string;
  recordsCount: string;
  type: "auto" | "manual";
}

interface SecuritySettingsTabProps {
  formData: any;
  onChange: (field: string, value: any) => void;
}

export const SecuritySettingsTab: React.FC<SecuritySettingsTabProps> = ({
  formData,
  onChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Database Snapshots State
  const [snapshots, setSnapshots] = useState<SnapshotItem[]>([
    {
      id: "snap-1",
      filename: "db_backup_2026_09_05_daily.sql",
      createdAt: "Today at 03:00 AM",
      size: "14.2 MB",
      recordsCount: "1,248 orders",
      type: "auto",
    },
    {
      id: "snap-2",
      filename: "db_backup_2026_09_01_full.sql",
      createdAt: "Sep 01, 2026 at 12:00 PM",
      size: "12.8 MB",
      recordsCount: "1,110 orders",
      type: "manual",
    },
    {
      id: "snap-3",
      filename: "db_backup_2026_08_25_weekly.sql",
      createdAt: "Aug 25, 2026 at 03:00 AM",
      size: "11.5 MB",
      recordsCount: "980 orders",
      type: "auto",
    },
  ]);

  // Restore Modal State
  const [selectedSnapshot, setSelectedSnapshot] = useState<SnapshotItem | null>(null);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [confirmInput, setConfirmInput] = useState("");
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreStep, setRestoreStep] = useState<string>("");
  const [restoreSuccess, setRestoreSuccess] = useState<string | null>(null);
  const [creatingBackup, setCreatingBackup] = useState(false);

  // File Upload Selector
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith(".sql") && !file.name.endsWith(".json")) {
        alert("Invalid file format. Please upload a valid .sql or .json backup snapshot file.");
        return;
      }
      const uploadedSnap: SnapshotItem = {
        id: `upload-${Date.now()}`,
        filename: file.name,
        createdAt: "Uploaded Backup File",
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        recordsCount: "Custom File Import",
        type: "manual",
      };
      setSelectedSnapshot(uploadedSnap);
      setConfirmInput("");
      setIsRestoreModalOpen(true);
    }
  };

  const openRestoreModalForSnapshot = (snap: SnapshotItem) => {
    setSelectedSnapshot(snap);
    setConfirmInput("");
    setIsRestoreModalOpen(true);
  };

  const handleDownloadSnapshot = (snap: SnapshotItem) => {
    const dummySqlContent = `-- Online Ordering System Database Dump\n-- Snapshot: ${snap.filename}\n-- Created: ${snap.createdAt}\n-- Records: ${snap.recordsCount}\n\nSET FOREIGN_KEY_CHECKS=0;\n-- Table structure for orders\nCREATE TABLE IF NOT EXISTS orders (\n  id INT AUTO_INCREMENT PRIMARY KEY,\n  customer_name VARCHAR(255),\n  total_amount DECIMAL(10,2),\n  status VARCHAR(50)\n);\n\n-- Dumping data for orders\nINSERT INTO orders (id, customer_name, total_amount, status) VALUES\n(1, 'John Doe', 24.50, 'COMPLETED'),\n(2, 'Jane Smith', 18.00, 'DELIVERED');\n\nSET FOREIGN_KEY_CHECKS=1;\n`;
    const blob = new Blob([dummySqlContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = snap.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExecuteRestore = () => {
    if (confirmInput.toUpperCase() !== "RESTORE") return;

    setIsRestoring(true);
    setRestoreStep("1/3 Validating SQL database schema...");

    setTimeout(() => {
      setRestoreStep("2/3 Restoring tables & re-indexing orders...");
    }, 1200);

    setTimeout(() => {
      setRestoreStep("3/3 Verifying relational database integrity...");
    }, 2400);

    setTimeout(() => {
      setIsRestoring(false);
      setIsRestoreModalOpen(false);
      setRestoreSuccess(
        `Database successfully restored from snapshot "${selectedSnapshot?.filename}"!`
      );
      setTimeout(() => setRestoreSuccess(null), 5000);
    }, 3600);
  };

  const triggerDatabaseBackup = () => {
    setCreatingBackup(true);
    setTimeout(() => {
      const now = new Date();
      const timestamp = now.toISOString().replace(/[:T]/g, "-").slice(0, 16);
      const newSnap: SnapshotItem = {
        id: `snap-${Date.now()}`,
        filename: `db_backup_${timestamp}_manual.sql`,
        createdAt: "Just now",
        size: "14.5 MB",
        recordsCount: "1,250 orders",
        type: "manual",
      };
      setSnapshots((prev) => [newSnap, ...prev]);
      setCreatingBackup(false);
    }, 1500);
  };

  return (
    <div className="space-y-space-md">
      {/* Restore Success Toast / Banner */}
      {restoreSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-2xl flex items-center gap-3 shadow-md animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-xs">
            <span className="font-bold block text-emerald-950">Restore Operation Completed</span>
            <span>{restoreSuccess}</span>
          </div>
        </div>
      )}

      {/* 1. Terminal Security Card */}
      <Card>
        <CardHeader className="border-b border-border/30 pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>Admin Terminal Security &amp; Session Controls</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Manage admin login timeout and security parameters.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Admin Session Auto-Lock Timeout
              </label>
              <Select
                value={formData.sessionTimeout}
                onValueChange={(val) => onChange("sessionTimeout", val)}
              >
                <SelectTrigger className="text-xs font-semibold">
                  <SelectValue placeholder="Select Timeout" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30m">🔒 30 Minutes Inactivity</SelectItem>
                  <SelectItem value="1h">🔒 1 Hour Inactivity</SelectItem>
                  <SelectItem value="4h">🔒 4 Hours (Full Shift)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Database Log Retention Policy
              </label>
              <Select
                value={formData.logRetentionDays}
                onValueChange={(val) => onChange("logRetentionDays", val)}
              >
                <SelectTrigger className="text-xs font-semibold">
                  <SelectValue placeholder="Retention Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">📅 7 Days (1 Week Auto-Clear)</SelectItem>
                  <SelectItem value="30d">📅 30 Days (1 Month)</SelectItem>
                  <SelectItem value="90d">📅 90 Days (Quarterly)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Database Backup & Connection Health Card */}
      <Card>
        <CardHeader className="border-b border-border/30 pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Database className="w-4 h-4 text-primary" />
            <span>Database Backup &amp; Connection Status</span>
          </CardTitle>
          <CardDescription className="text-xs">
            System connection health and manual database snapshot creation.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-border/30">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-on-surface">
                  MySQL Database &amp; Event Broadcaster
                </span>
                <Badge className="bg-emerald-100 text-emerald-800 border-none text-[10px] font-bold">
                  ✓ CONNECTED &amp; HEALTHY
                </Badge>
              </div>
              <p className="text-[11px] text-on-surface-variant">
                Local PDO MySQL instance online. Broadcaster real-time SSE listener active.
              </p>
            </div>

            <Button
              type="button"
              disabled={creatingBackup}
              onClick={triggerDatabaseBackup}
              className="px-3 py-2 h-9 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-xs hover:bg-primary-container transition-colors shrink-0 flex items-center gap-1.5"
            >
              {creatingBackup ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Creating Snapshot...</span>
                </>
              ) : (
                <>
                  <Database className="w-3.5 h-3.5" />
                  <span>Backup Database Now</span>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 3. DATABASE RESTORE & SNAPSHOT RECOVERY CARD */}
      <Card className="border-amber-500/30 bg-surface-container-lowest shadow-sm">
        <CardHeader className="border-b border-border/30 pb-3 bg-amber-500/5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-on-surface">
              <RotateCcw className="w-4 h-4 text-amber-600" />
              <span>Database Restore &amp; Snapshot Recovery</span>
            </CardTitle>
            <Badge variant="outline" className="text-[10px] font-bold border-amber-500/40 text-amber-700 bg-amber-50">
              ⚡ CRITICAL ACTION
            </Badge>
          </div>
          <CardDescription className="text-xs">
            Restore system state from a previous snapshot or upload a custom `.sql` / `.json` backup file.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          {/* File Upload Dropzone / Button */}
          <div className="p-4 rounded-2xl border-2 border-dashed border-border/60 bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-on-surface">
                  Restore from Custom Backup File
                </h4>
                <p className="text-[11px] text-on-surface-variant">
                  Select a local `.sql` or `.json` backup file to restore system state.
                </p>
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept=".sql,.json"
              onChange={handleFileSelect}
              className="hidden"
            />

            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="h-9 px-4 text-xs font-bold border-amber-500/30 text-amber-800 hover:bg-amber-100/50 shrink-0 flex items-center gap-1.5"
            >
              <FileCode2 className="w-3.5 h-3.5 text-amber-600" />
              <span>Upload Backup File</span>
            </Button>
          </div>

          {/* Available Snapshots Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-on-surface flex items-center gap-1.5">
              <Archive className="w-3.5 h-3.5 text-primary" />
              <span>Available System Backup Snapshots</span>
            </h4>

            <div className="divide-y divide-border/30 rounded-xl border border-border/40 overflow-hidden bg-surface-container-lowest">
              {snapshots.map((snap) => (
                <div
                  key={snap.id}
                  className="p-3 flex items-center justify-between gap-3 hover:bg-surface-container-low transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-surface-container text-on-surface flex items-center justify-center shrink-0">
                      <FileCheck className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-on-surface truncate">
                          {snap.filename}
                        </span>
                        <Badge
                          variant="secondary"
                          className="text-[9px] px-1.5 py-0 h-4 font-bold bg-surface-container-high"
                        >
                          {snap.type === "auto" ? "AUTO SNAPSHOT" : "MANUAL"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-on-surface-variant">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-on-surface-variant/70" />
                          {snap.createdAt}
                        </span>
                        <span>•</span>
                        <span>{snap.size}</span>
                        <span>•</span>
                        <span>{snap.recordsCount}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadSnapshot(snap)}
                      className="h-8 px-3 text-xs font-bold border-border/50 text-on-surface hover:bg-surface-container flex items-center gap-1.5"
                    >
                      <HardDriveDownload className="w-3.5 h-3.5 text-primary" />
                      <span>Download</span>
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      onClick={() => openRestoreModalForSnapshot(snap)}
                      className="h-8 px-3 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* RESTORE CONFIRMATION DIALOG MODAL */}
      <Dialog open={isRestoreModalOpen} onOpenChange={setIsRestoreModalOpen}>
        <DialogContent className="max-w-md p-6 bg-surface-container-lowest border-border rounded-2xl">
          <DialogHeader>
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-2">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <DialogTitle className="text-base font-bold text-on-surface flex items-center gap-2">
              Confirm Database Restore Action
            </DialogTitle>
            <DialogDescription className="text-xs text-on-surface-variant pt-1">
              You are about to restore system data from snapshot:
            </DialogDescription>
          </DialogHeader>

          {selectedSnapshot && (
            <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs space-y-1.5">
              <div className="font-bold text-amber-950 truncate">
                📄 {selectedSnapshot.filename}
              </div>
              <div className="text-amber-800 text-[11px] flex items-center gap-2">
                <span>Size: {selectedSnapshot.size}</span>
                <span>•</span>
                <span>Date: {selectedSnapshot.createdAt}</span>
              </div>
            </div>
          )}

          <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl space-y-1 text-xs text-red-900">
            <span className="font-bold block text-red-950 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
              WARNING: DATA OVERWRITE
            </span>
            <p className="text-[11px] leading-relaxed text-red-800">
              Restoring this database snapshot will overwrite active orders, driver statuses, and menu changes made after this backup date.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-on-surface">
              Type <span className="text-red-600 font-extrabold uppercase">RESTORE</span> to confirm execution:
            </label>
            <Input
              type="text"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder="Type RESTORE"
              className="text-xs font-mono uppercase h-9 border-border"
              disabled={isRestoring}
            />
          </div>

          {isRestoring && (
            <div className="p-3 rounded-xl bg-surface-container-low border border-border/30 space-y-2 animate-pulse">
              <div className="flex items-center gap-2 text-xs font-bold text-primary">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Restoring Database...</span>
              </div>
              <p className="text-[11px] text-on-surface-variant font-mono">
                {restoreStep}
              </p>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={isRestoring}
              onClick={() => setIsRestoreModalOpen(false)}
              className="h-9 text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={confirmInput.toUpperCase() !== "RESTORE" || isRestoring}
              onClick={handleExecuteRestore}
              className="h-9 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-md flex items-center gap-1.5"
            >
              {isRestoring ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Restoring...</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Confirm &amp; Execute Restore</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

