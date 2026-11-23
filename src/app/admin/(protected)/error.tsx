"use client";

export default function AdminError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <div role="alert" className="rounded-lg border border-cherry-deep bg-[#fff4f6] p-4">
      <h1 className="text-lg">Could not load this page</h1>
      <p className="mt-1 text-sm text-ink-soft">The API may be unreachable or returned an unexpected response. {error.digest ? `(ref ${error.digest})` : ""}</p>
      <button onClick={() => retry()} className="btn btn-ink mt-3 min-h-9! px-3.5! py-1! text-sm!">Try again</button>
    </div>
  );
}
