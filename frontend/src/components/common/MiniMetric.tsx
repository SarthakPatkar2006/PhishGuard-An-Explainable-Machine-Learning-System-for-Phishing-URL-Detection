function MiniMetric({ label, tone, value }: { label: string; tone: "danger" | "good" | "neutral"; value: string }) {
  const toneClass =
    tone === "danger"
      ? "border-red-200 bg-red-50 text-red-700"
      : tone === "good"
        ? "border-teal-200 bg-teal-50 text-teal-700"
        : "border-slate-200 bg-slate-50 text-slate-700";

  return (
    <div className={`rounded-lg border p-4 ${toneClass}`}>
      <p className="text-sm font-medium opacity-80">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

export { MiniMetric };
