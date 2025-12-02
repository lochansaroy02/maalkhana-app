"use client"

import { format } from "date-fns"; // Added for consistent date formatting
import { CalendarIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

// Use date-fns for standard, reliable formatting
function formatDateDisplay(date: Date | undefined) {
    // If date is undefined or null, return an empty string immediately
    if (!date) {
        return ""
    }
    // Check for an invalid date object
    if (isNaN(date.getTime())) {
        return ""
    }
    // Format to match your placeholder style
    return format(date, "MMMM dd, yyyy")
}

function isValidDate(date: Date | undefined) {
    if (!date) {
        return false
    }
    return !isNaN(date.getTime())
}

interface DateProps {
    date: Date | undefined;
    setDate: (date: Date | undefined) => void;
    label: string
}

const DatePicker = ({ date, setDate, label }: DateProps) => {
    const [open, setOpen] = React.useState(false)
    // The calendar view state (month) is now derived from the 'date' prop
    const [month, setMonth] = React.useState<Date | undefined>(date)
    // The text input state
    const [value, setValue] = React.useState(formatDateDisplay(date))

    // 🎯 CRITICAL FIX: Synchronize local state with the external 'date' prop
    React.useEffect(() => {
        // 1. Update the text input value
        setValue(formatDateDisplay(date))

        // 2. Update the calendar month view if a valid date is present
        if (date && isValidDate(date)) {
            setMonth(date)
        } else {
            // If date is cleared (undefined), reset the month view to nothing specific
            // If you want it to default to the current month when cleared, you can set it to new Date() here.
            // For now, let's keep it null/undefined to truly clear the state.
            setMonth(undefined)
        }
    }, [date])

    // Helper to handle both calendar select and manual input updates
    const handleDateChange = (newDate: Date | undefined) => {
        setDate(newDate)
        setValue(formatDateDisplay(newDate))
        setMonth(newDate) // Always update month when the date changes
    }

    return (
        <div className="flex flex-col gap-2 ">
            <Label htmlFor="date" className=" text-wrap text-lg text-blue-100">
                {label}
            </Label>
            <div className="relative flex gap-2">
                <Input
                    id="date"
                    value={value}
                    placeholder="June 01, 2025"
                    className="text-blue-100 placeholder:text-blue-200 pr-10"
                    onChange={(e) => {
                        const inputText = e.target.value
                        setValue(inputText)

                        // Attempt to parse date from text input
                        const parsedDate = new Date(inputText)

                        // If input is empty, treat as clearing the date
                        if (inputText === "") {
                            handleDateChange(undefined)
                        }
                        // If the parsed date is valid, update the parent state
                        else if (isValidDate(parsedDate)) {
                            handleDateChange(parsedDate)
                        }
                        // If input is not empty but not a valid date yet, keep the parent date as is
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "ArrowDown") {
                            e.preventDefault()
                            setOpen(true)
                        }
                    }}
                />
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            id="date-picker"
                            variant="ghost"
                            className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                        >
                            <CalendarIcon className="size-3.5" />
                            <span className="sr-only">Select date</span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        className="w-auto overflow-hidden p-0"
                        align="end"
                        alignOffset={-8}
                        sideOffset={10}
                    >
                        <Calendar
                            mode="single"
                            selected={date} // Uses the external prop directly
                            captionLayout="dropdown"
                            month={month} // Uses the synced month state
                            onMonthChange={setMonth}
                            onSelect={(selectedDate) => {
                                handleDateChange(selectedDate)
                                setOpen(false)
                            }}
                        />
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    )
}
export default DatePicker