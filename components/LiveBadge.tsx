export function LiveBadge({ label = "LIVE" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-live/10 px-2.5 py-1 text-xs font-semibold tracking-widest text-live">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-pulseDot rounded-full bg-live" />
      </span>
      {label}
    </span>
  );
}
