export function MotionBadge({ motionDetected }: { motionDetected: 0 | 1 }) {
  return motionDetected === 1 ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
      Motion
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-700 text-slate-400">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
      Clear
    </span>
  );
}
