"use client";

import * as React from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  label?: string;
  value: string; // YYYY-MM-DD format
  onChange: (dateStr: string) => void;
  placeholder?: string;
  className?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  placeholder = "Pick a date",
  className,
}) => {
  const [open, setOpen] = React.useState(false);

  // Parse initial date or default to current date
  const parsedDate = React.useMemo(() => {
    if (!value) return new Date();
    const [y, m, d] = value.split("-").map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
  }, [value]);

  const [viewDate, setViewDate] = React.useState<Date>(parsedDate);

  React.useEffect(() => {
    if (value) {
      const [y, m, d] = value.split("-").map(Number);
      setViewDate(new Date(y, (m || 1) - 1, d || 1));
    }
  }, [value]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const handleSelectDay = (dayNumber: number) => {
    const formattedMonth = String(month + 1).padStart(2, "0");
    const formattedDay = String(dayNumber).padStart(2, "0");
    const dateStr = `${year}-${formattedMonth}-${formattedDay}`;
    onChange(dateStr);
    setOpen(false);
  };

  const handleSelectToday = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    const dateStr = `${y}-${m}-${d}`;
    onChange(dateStr);
    setViewDate(today);
    setOpen(false);
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return placeholder;
    const [y, m, d] = dateStr.split("-").map(Number);
    if (!y || !m || !d) return dateStr;
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border/40 bg-surface-container-lowest text-on-surface font-body-sm text-xs font-semibold hover:bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-xs transition-all",
            !value && "text-on-surface-variant",
            className
          )}
        >
          <CalendarIcon className="w-3.5 h-3.5 text-primary shrink-0" />
          <span>{value ? formatDisplayDate(value) : placeholder}</span>
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-72 p-3 bg-surface-container-lowest rounded-2xl border border-border/50 shadow-2xl space-y-3 z-[100]"
      >
        {/* Header Month / Year Navigation */}
        <div className="flex items-center justify-between pb-1 border-b border-border/20">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-headline-sm text-xs font-extrabold text-on-surface">
            {monthNames[month]} {year}
          </span>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 text-center font-label-sm text-[10px] uppercase font-bold text-on-surface-variant">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
            <div key={day} className="py-0.5">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days Grid */}
        <div className="grid grid-cols-7 gap-1 text-xs">
          {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
            <div key={`empty-${idx}`} />
          ))}

          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const formattedMonth = String(month + 1).padStart(2, "0");
            const formattedDay = String(dayNum).padStart(2, "0");
            const currentCellStr = `${year}-${formattedMonth}-${formattedDay}`;
            const isSelected = value === currentCellStr;
            const isToday =
              new Date().toISOString().split("T")[0] === currentCellStr;

            return (
              <button
                key={dayNum}
                type="button"
                onClick={() => handleSelectDay(dayNum)}
                className={cn(
                  "h-8 w-8 rounded-lg font-body-sm text-xs font-semibold flex items-center justify-center transition-all",
                  isSelected
                    ? "bg-primary text-on-primary font-bold shadow-xs scale-105"
                    : isToday
                    ? "bg-primary-fixed text-on-primary-fixed font-bold border border-primary/30"
                    : "hover:bg-surface-container text-on-surface"
                )}
              >
                {dayNum}
              </button>
            );
          })}
        </div>

        {/* Quick Select Today Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border/20 text-xs">
          <button
            type="button"
            onClick={handleSelectToday}
            className="px-2.5 py-1 rounded-lg bg-surface-container-low hover:bg-surface-container text-primary font-label-sm text-[11px] font-bold transition-colors"
          >
            Today
          </button>
          {value && (
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="text-on-surface-variant hover:text-error text-[11px] font-medium"
            >
              Clear
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
