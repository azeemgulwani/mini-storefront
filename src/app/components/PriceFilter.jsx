'use client';

export default function PriceFilter({ value, onChange }) {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <label className="block text-sm font-medium mb-1">Max Price</label>
      <input
        type="number"
        min="0"
        className="w-full rounded-xl border px-3 py-2"
        placeholder="e.g., 300"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}