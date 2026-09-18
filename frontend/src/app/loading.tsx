export default function Loading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <div className="relative flex h-14 w-14 items-center justify-center">
        <div className="absolute inset-0 rounded-2xl border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-teal-400 text-white shadow-md shadow-blue-500/30">
          <span className="font-sans font-black text-sm tracking-tight">N</span>
        </div>
      </div>
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 animate-pulse">
        Harmonizing Living Space...
      </p>
    </div>
  );
}
