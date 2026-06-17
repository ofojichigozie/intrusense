export function IntrusionBadge({ isIntrusion }: { isIntrusion: boolean }) {
  return isIntrusion ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
      <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
      Intrusion
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
      Safe
    </span>
  );
}
