'use client';

export default function CategoryFilter({ categories, value, onChange }) {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <label className="block text-sm font-medium mb-1">Category</label>
      <select
        className="w-full rounded-xl border px-3 py-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">All</option>
        {categories.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </div>
  );
}