'use client';

const variants = {
  loading: { title: "Loading products…", note: "Fetching the latest inventory." },
  error:   { title: "Something went wrong", note: "Please refresh and try again." },
  empty:   { title: "No products match your filters", note: "Try changing filters." },
};

export default function StatusMessage({ state, message }) {
  const v = variants[state] || variants.empty;
  return (
    <div className="rounded-2xl border bg-white p-6 text-center text-gray-700">
      <h3 className="text-lg font-semibold">{v.title}</h3>
      <p className="mt-1 text-sm">{message || v.note}</p>
    </div>
  );
}