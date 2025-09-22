"use client"

import * as React from "react"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export interface TimePickerProps {
  value?: string
  onChange?: (time: string | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  id?: string
}

export function TimePicker({
  value,
  onChange,
  placeholder = "Select time",
  disabled = false,
  className,
  id,
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false)

  // Parse time value (HH:MM format)
  const [hours, setHours] = React.useState(() => {
    if (value) {
      const [h] = value.split(':')
      return h || '00'
    }
    return '00'
  })

  const [minutes, setMinutes] = React.useState(() => {
    if (value) {
      const [, m] = value.split(':')
      return m || '00'
    }
    return '00'
  })

  // Generate time options
  const hoursOptions = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, '0')
  )

  const minutesOptions = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, '0')
  )

  const handleTimeChange = (newHours: string, newMinutes: string) => {
    setHours(newHours)
    setMinutes(newMinutes)
    const timeString = `${newHours}:${newMinutes}`
    onChange?.(timeString)
  }

  const formatTime = (h: string, m: string) => {
    const hour = parseInt(h, 10)
    const minute = parseInt(m, 10)
    const period = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${displayHour}:${m} ${period}`
  }

  const displayValue = value ? formatTime(hours, minutes) : placeholder

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <Clock className="mr-2 h-4 w-4" />
          {displayValue}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <div className="flex items-center space-x-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Hour</label>
            <Select value={hours} onValueChange={(value) => handleTimeChange(value, minutes)}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-48">
                {hoursOptions.map((hour) => (
                  <SelectItem key={hour} value={hour}>
                    {hour}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Minute</label>
            <Select value={minutes} onValueChange={(value) => handleTimeChange(hours, value)}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-48">
                {minutesOptions.map((minute) => (
                  <SelectItem key={minute} value={minute}>
                    {minute}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpen(false)}
          >
            Done
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
