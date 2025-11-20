"use client";
import { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";

const formatNumber = (n: string) => {
  if (!n) return "";
  const cleaned = n.replace(/[^0-9.]/g, "");
  const [int, dec] = cleaned.split(".");
  const intFormatted = int ? Number(int).toLocaleString("en-US") : "";
  return dec !== undefined ? `${intFormatted}.${dec}` : intFormatted;
};

const unformatNumber = (n: string) => n.replace(/,/g, "");

const DEFAULT_MIN = "500000000";
const DEFAULT_MAX = "20000000000";

const getDefaultStartDate = (): Date => {
  const today = new Date();
  const lastMonth = new Date(today);
  lastMonth.setMonth(today.getMonth() - 1);
  // Handle overflow when previous month has fewer days than today
  if (lastMonth.getMonth() === today.getMonth()) {
    lastMonth.setDate(0);
  }
  return lastMonth;
};
const getDefaultEndDate = (): Date => new Date();

const toDisplayDate = (date?: Date | null): string => {
  if (!date) return "Seleccionar...";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${d}/${m}/${y}`;
};

const DataFilterBar: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Price defaults with query param fallback
  const initialMin = searchParams.get("minPrice") || DEFAULT_MIN;
  const initialMax = searchParams.get("maxPrice") || DEFAULT_MAX;

  // Date: from query or default (last month to today)
  const queryStartDate = searchParams.get("startDate")
    ? new Date(searchParams.get("startDate") as string)
    : getDefaultStartDate();
  const queryEndDate = searchParams.get("endDate")
    ? new Date(searchParams.get("endDate") as string)
    : getDefaultEndDate();

  const [startDate, setStartDate] = useState<Date | null>(queryStartDate);
  const [endDate, setEndDate] = useState<Date | null>(queryEndDate);

  const [minPriceRaw, setMinPriceRaw] = useState<string>(initialMin);
  const [minPriceFormatted, setMinPriceFormatted] = useState<string>(
    formatNumber(initialMin)
  );
  const [maxPriceRaw, setMaxPriceRaw] = useState<string>(initialMax);
  const [maxPriceFormatted, setMaxPriceFormatted] = useState<string>(
    formatNumber(initialMax)
  );

  // On mount: ensure URL price/date params are initialized
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
    if (!searchParams.get("startDate")) {
      params.set(
        "startDate",
        getDefaultStartDate().toISOString().substring(0, 10)
      );
      shouldUpdate = true;
    }
    if (!searchParams.get("endDate")) {
      params.set("endDate", getDefaultEndDate().toISOString().substring(0, 10));
      shouldUpdate = true;
    }
    if (shouldUpdate) {
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  }, []);

  // Submit filters
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    startDate
      ? params.set("startDate", startDate.toISOString().slice(0, 10))
      : params.delete("startDate");
    endDate
      ? params.set("endDate", endDate.toISOString().slice(0, 10))
      : params.delete("endDate");
    minPriceRaw
      ? params.set("minPrice", unformatNumber(minPriceRaw))
      : params.delete("minPrice");
    maxPriceRaw
      ? params.set("maxPrice", unformatNumber(maxPriceRaw))
      : params.delete("maxPrice");
    startTransition(() => {
      router.replace(`?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <form className="flex flex-wrap gap-4 items-end" onSubmit={handleSubmit}>
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
              {toDisplayDate(startDate)}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={startDate ?? undefined}
              onSelect={setStartDate}
              defaultMonth={startDate ?? new Date()}
              captionLayout="dropdown"
              required
            />
          </PopoverContent>
        </Popover>
      </div>

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
              {toDisplayDate(endDate)}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={endDate ?? undefined}
              onSelect={setEndDate}
              defaultMonth={endDate ?? new Date()}
              captionLayout="dropdown"
              required
            />
          </PopoverContent>
        </Popover>
      </div>

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

      <Button type="submit" variant="default" disabled={isPending}>
        {isPending ? "Procesando..." : "Aplicar filtros"}
      </Button>
    </form>
  );
};

export default DataFilterBar;
