"use client";
import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";

const DateFilter: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(Array.from(searchParams.entries()));

    if (startDate)
      params.set("startDate", startDate.toISOString().slice(0, 10));
    else params.delete("startDate");

    if (endDate) params.set("endDate", endDate.toISOString().slice(0, 10));
    else params.delete("endDate");

    router.replace(`?${params.toString()}`);
  };

  return (
    <form className="flex gap-4 items-end" onSubmit={handleSubmit}>
      {/* Start Date Picker */}
      <div>
        <label className="block text-xs mb-1">Fecha inicial</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-44 justify-start font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? startDate.toLocaleDateString() : "Seleccionar..."}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={startDate ?? undefined}
              onSelect={setStartDate}
              captionLayout="dropdown"
              required
            />
          </PopoverContent>
        </Popover>
      </div>
      {/* End Date Picker */}
      <div>
        <label className="block text-xs mb-1">Fecha final</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-44 justify-start font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? endDate.toLocaleDateString() : "Seleccionar..."}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={endDate ?? undefined}
              onSelect={setEndDate}
              captionLayout="dropdown"
              required
            />
          </PopoverContent>
        </Popover>
      </div>
      {/* Submit Button */}
      <Button type="submit" variant="default">
        Aplicar rango
      </Button>
      <Button
        type="submit"
        onClick={() => {
          setStartDate(null);
          setEndDate(null);
        }}
      >
        Borrar rango
      </Button>
    </form>
  );
};

export default DateFilter;
