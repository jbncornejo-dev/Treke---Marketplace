// src/components/Reportes/SectionCard.tsx
import type { ReactNode } from "react";

export default function SectionCard({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-2">
      {title && (
        <h2 className="text-sm font-semibold text-slate-900 dark:text-neutral-100">
          {title}
        </h2>
      )}
      <div className="rounded-2xl border border-neutral-200/70 bg-white/90 p-4 shadow-sm backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/60">
        {children}
      </div>
    </section>
  );
}
