import type { LucideIcon } from "lucide-react";

function MiniStatus({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <Icon className="mb-3 h-5 w-5 text-teal-600" />
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 truncate font-semibold">{value}</p>
    </div>
  );
}

export { MiniStatus };
