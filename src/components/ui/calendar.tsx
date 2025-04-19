import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  onSelect,
  ...props
}: CalendarProps) {
  const handleSelect = (date: Date | undefined) => {
    if (onSelect) {
      onSelect(date);
      // Close the calendar after selection
      const popoverTrigger = document.querySelector('[role="combobox"]');
      if (popoverTrigger) {
        (popoverTrigger as HTMLElement).click();
      }
    }
  };

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "p-3 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800",
        "border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg",
        "animate-in fade-in-0 zoom-in-95",
        className
      )}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium text-slate-900 dark:text-slate-100",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-slate-500 dark:text-slate-400 rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: cn(
          "h-9 w-9 text-center text-sm p-0 relative",
          "[&:has([aria-selected].day-range-end)]:rounded-r-md",
          "[&:has([aria-selected].day-outside)]:bg-slate-100 dark:bg-slate-800",
          "[&:has([aria-selected])]:bg-slate-100 dark:bg-slate-800",
          "first:[&:has([aria-selected])]:rounded-l-md",
          "last:[&:has([aria-selected])]:rounded-r-md",
          "focus-within:relative focus-within:z-20",
          "transition-colors duration-200"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal",
          "aria-selected:opacity-100",
          "hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100",
          "transition-colors duration-200"
        ),
        day_range_end: "day-range-end",
        day_selected: cn(
          "bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900",
          "hover:bg-slate-800 dark:hover:bg-slate-200",
          "focus:bg-slate-800 dark:focus:bg-slate-200",
          "transition-colors duration-200"
        ),
        day_today: cn(
          "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100",
          "hover:bg-slate-300 dark:hover:bg-slate-600",
          "transition-colors duration-200"
        ),
        day_outside: cn(
          "day-outside text-slate-500 dark:text-slate-400 opacity-50",
          "aria-selected:bg-slate-100 dark:aria-selected:bg-slate-800",
          "aria-selected:text-slate-500 dark:aria-selected:text-slate-400",
          "aria-selected:opacity-30",
          "transition-colors duration-200"
        ),
        day_disabled: "text-slate-500 dark:text-slate-400 opacity-50",
        day_range_middle: cn(
          "aria-selected:bg-slate-100 dark:aria-selected:bg-slate-800",
          "aria-selected:text-slate-900 dark:aria-selected:text-slate-100",
          "transition-colors duration-200"
        ),
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
      }}
      onSelect={handleSelect}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
