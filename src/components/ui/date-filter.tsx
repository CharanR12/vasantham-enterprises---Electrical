"use client"

import * as React from "react"
import { format, isToday, parseISO } from "date-fns"
import { Calendar as CalendarIcon, Check } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

type DateFilterType = 'all' | 'today' | 'custom'

interface DateFilterProps {
    label: string
    icon: React.ReactNode
    value: DateFilterType
    onChange: (val: DateFilterType) => void
    dateRange: { start: string; end: string }
    onDateRangeChange: (range: { start: string; end: string }) => void
    className?: string
}

export function DateFilter({
    label,
    icon,
    value,
    onChange,
    dateRange,
    onDateRangeChange,
    className
}: DateFilterProps) {
    // Convert parent string state to DateRange for the Calendar component
    const selectedRange: DateRange | undefined = React.useMemo(() => {
        if (value !== 'custom' || !dateRange.start) return undefined
        return {
            from: parseISO(dateRange.start),
            to: dateRange.end ? parseISO(dateRange.end) : undefined
        }
    }, [value, dateRange])

    const handleRangeSelect = (range: DateRange | undefined) => {
        if (range?.from) {
            onChange('custom')
            onDateRangeChange({
                start: format(range.from, 'yyyy-MM-dd'),
                end: range.to ? format(range.to, 'yyyy-MM-dd') : format(range.from, 'yyyy-MM-dd')
            })
        }
    }

    const getButtonLabel = () => {
        if (value === 'today') return "Today"
        if (value === 'all') return "All Time"
        if (value === 'custom' && dateRange.start) {
            const from = parseISO(dateRange.start)
            const to = dateRange.end ? parseISO(dateRange.end) : from
            if (format(from, 'yyyy-MM-dd') === format(to, 'yyyy-MM-dd')) {
                return format(from, 'MMM dd, yyyy')
            }
            return `${format(from, 'MMM dd')} - ${format(to, 'MMM dd, yy')}`
        }
        return "Select filter"
    }

    return (
        <div className={cn("grid gap-2", className)}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn(
                            "h-11 justify-start text-left font-bold rounded-xl border-slate-200 bg-white hover:bg-slate-50 transition-all duration-300 px-4",
                            value !== 'all' ? "text-brand-600 border-brand-200 bg-brand-50/30" : "text-slate-600"
                        )}
                    >
                        <div className={cn(
                            "mr-2.5 p-1.5 rounded-lg transition-colors",
                            value !== 'all' ? "bg-brand-100 text-brand-600" : "bg-slate-100 text-slate-500"
                        )}>
                            {icon}
                        </div>
                        <div className="flex flex-col items-start leading-tight">
                            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-black">{label}</span>
                            <span className="text-sm truncate max-w-[150px]">{getButtonLabel()}</span>
                        </div>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-2xl border-slate-200 shadow-2xl overflow-hidden" align="start">
                    <div className="p-3 border-b border-slate-100 bg-slate-50/50 flex gap-2">
                        <Button
                            variant={value === 'all' ? 'default' : 'ghost'}
                            size="sm"
                            className={cn("flex-1 rounded-lg text-xs font-bold h-9", value === 'all' && "bg-brand-600 hover:bg-brand-700")}
                            onClick={() => onChange('all')}
                        >
                            All Time
                        </Button>
                        <Button
                            variant={value === 'today' ? 'default' : 'ghost'}
                            size="sm"
                            className={cn("flex-1 rounded-lg text-xs font-bold h-9", value === 'today' && "bg-brand-600 hover:bg-brand-700")}
                            onClick={() => onChange('today')}
                        >
                            Today
                        </Button>
                    </div>
                    <div className="p-1">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={selectedRange?.from}
                            selected={selectedRange}
                            onSelect={handleRangeSelect}
                            numberOfMonths={1}
                            className="rounded-xl"
                        />
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}
