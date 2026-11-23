export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10" role="status" aria-busy="true">
      <span className="sr-only">…</span>
      <div className="mb-6 h-9 w-56 animate-pulse bg-line" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="aspect-square animate-pulse bg-line" />
        ))}
      </div>
    </div>
  );
}
