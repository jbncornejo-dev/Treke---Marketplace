// src/components/Reportes/KPICard.tsx
import React from "react";

type KPICardProps = {
  label: string;
  value: number | string;
  helperText?: string;
};

function formatValue(value: number | string) {
  if (typeof value === "number") {
    if (Math.abs(value) >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (Math.abs(value) >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toLocaleString("es-BO");
  }
  return value;
}

export default function KPICard({ label, value, helperText }: KPICardProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-emerald-500/25 bg-gradient-to-br from-emerald-950/70 via-neutral-950 to-neutral-900 px-4 py-5 shadow-lg shadow-emerald-500/15 transition-transform duration-200 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/25">
      {/* Glow decorativo */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-emerald-500/20 blur-2xl" />
      <div className="pointer-events-none absolute -left-16 bottom-0 h-24 w-24 rounded-full bg-emerald-400/10 blur-3xl" />

      <div className="relative flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-300/80">
            {label}
          </p>

          {/* Badge TREKE / Eco */}
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-200">
            <span className="text-[9px]">●</span> Eco KPI
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-semibold tracking-tight text-emerald-100 sm:text-4xl">
            {formatValue(value)}
          </span>
        </div>

        {helperText && (
          <p className="mt-1 text-xs text-emerald-100/70">{helperText}</p>
        )}
      </div>
    </div>
  );
}
