"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";

// Number helpers
function formatNumber(n: string) {
  if (!n) return "";
  const cleaned = n.replace(/[^0-9.]/g, "");
  const [int, dec] = cleaned.split(".");
  let intFormatted = int ? Number(int).toLocaleString("en-US") : "";
  return dec !== undefined ? `${intFormatted}.${dec}` : intFormatted;
}
function unformatNumber(n: string) {
  return n.replace(/,/g, "");
}
const DEFAULT_MIN = "500000000";
const DEFAULT_MAX = "20000000000";

const DataFilterBar: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read from query params, fallback to default
  const initialMin = searchParams.get("minPrice") || DEFAULT_MIN;
  const initialMax = searchParams.get("maxPrice") || DEFAULT_MAX;

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [minPriceRaw, setMinPriceRaw] = useState<string>(initialMin);
  const [minPriceFormatted, setMinPriceFormatted] = useState<string>(
    formatNumber(initialMin)
  );
  const [maxPriceRaw, setMaxPriceRaw] = useState<string>(initialMax);
  const [maxPriceFormatted, setMaxPriceFormatted] = useState<string>(
    formatNumber(initialMax)
  );

  // On mount: ensure URL price params are initialized
  useEffect(() => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    let shouldUpdate = false;
    if (!searchParams.get("minPrice")) {
      params.set("minPrice", DEFAULT_MIN);
      shouldUpdate = true;
    }
    if (!searchParams.get("maxPrice")) {
      params.set("maxPrice", DEFAULT_MAX);
      shouldUpdate = true;
    }
    if (shouldUpdate) {
      router.replace(`?${params.toString()}`);
    }
    // Only run on first mount
    // eslint-disable-next-line
  }, []);

  // Apply filters
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    if (startDate)
      params.set("startDate", startDate.toISOString().slice(0, 10));
    else params.delete("startDate");
    if (endDate) params.set("endDate", endDate.toISOString().slice(0, 10));
    else params.delete("endDate");
    if (minPriceRaw) params.set("minPrice", unformatNumber(minPriceRaw));
    else params.delete("minPrice");
    if (maxPriceRaw) params.set("maxPrice", unformatNumber(maxPriceRaw));
    else params.delete("maxPrice");
    router.replace(`?${params.toString()}`);
  };

  // Remove all filters including price (clear query params and fields)
  const handleClear = (e: React.FormEvent) => {
    e.preventDefault();
    setStartDate(null);
    setEndDate(null);
    setMinPriceRaw("");
    setMinPriceFormatted("");
    setMaxPriceRaw("");
    setMaxPriceFormatted("");
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.delete("startDate");
    params.delete("endDate");
    params.delete("minPrice");
    params.delete("maxPrice");
    router.replace(`?${params.toString()}`);
  };

  return (
    <form className="flex flex-wrap gap-4 items-end" onSubmit={handleSubmit}>
      {/* Start Date Picker */}
      <div>
        <label className="block text-xs mb-1">Fecha inicial</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-44 justify-start font-normal"
              type="button"
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
              type="button"
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
      {/* Min Price Input */}
      <div>
        <label className="block text-xs mb-1">Precio mínimo</label>
        <input
          type="text"
          inputMode="decimal"
          className="w-36 px-2 py-1 border rounded"
          value={minPriceFormatted}
          onFocus={() => setMinPriceFormatted(minPriceRaw)}
          onBlur={() => setMinPriceFormatted(formatNumber(minPriceRaw))}
          onChange={(e) => {
            let val = e.target.value.replace(/[^0-9.]/g, "");
            const parts = val.split(".");
            if (parts.length > 2)
              val = parts[0] + "." + parts.slice(1).join("");
            setMinPriceRaw(val);
            setMinPriceFormatted(val);
          }}
          placeholder="Ej. 500,000,000"
        />
      </div>
      {/* Max Price Input */}
      <div>
        <label className="block text-xs mb-1">Precio máximo</label>
        <input
          type="text"
          inputMode="decimal"
          className="w-36 px-2 py-1 border rounded"
          value={maxPriceFormatted}
          onFocus={() => setMaxPriceFormatted(maxPriceRaw)}
          onBlur={() => setMaxPriceFormatted(formatNumber(maxPriceRaw))}
          onChange={(e) => {
            let val = e.target.value.replace(/[^0-9.]/g, "");
            const parts = val.split(".");
            if (parts.length > 2)
              val = parts[0] + "." + parts.slice(1).join("");
            setMaxPriceRaw(val);
            setMaxPriceFormatted(val);
          }}
          placeholder="Ej. 20,000,000,000"
        />
      </div>
      {/* Buttons */}
      <Button type="submit" variant="default">
        Aplicar filtros
      </Button>
      <Button type="button" variant="outline" onClick={handleClear}>
        Borrar filtros
      </Button>
    </form>
  );
};

export default DataFilterBar;
