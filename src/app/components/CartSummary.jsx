'use client';

export default function CartSummary({ lines, itemCount, total, decrement, reset }) {
  const hasItems = itemCount > 0;

  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Cart Summary</h3>
        <span className="text-xs text-gray-500">
          {hasItems ? `${itemCount} item(s)` : "Empty"}
        </span>
      </div>

      <div className="mt-2 text-2xl font-semibold">${total.toFixed(2)}</div>

      <div className="mt-3 flex gap-2">
        <button
          className={`rounded-xl px-3 py-2 text-sm font-medium border ${
            hasItems ? "bg-white hover:bg-gray-50"
                     : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
          disabled={!hasItems}
          onClick={reset}
        >
          Reset
        </button>
      </div>

      {hasItems && (
        <ul className="mt-3 space-y-1 text-sm">
          {lines.map((line) => (
            <li key={line.id} className="flex items-center justify-between">
              <span className="truncate">{line.name}</span>
              <span className="ml-2">x{line.qty}</span>
              <span className="ml-2">${(line.price * line.qty).toFixed(2)}</span>
              <button
                className="ml-3 rounded-lg border px-2 py-1 hover:bg-gray-50"
                onClick={() => decrement(line.id)}
                title={`Remove one ${line.name}`}
              >
                −
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}