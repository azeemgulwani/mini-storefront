'use client';

export default function ProductCard({ product, onAdd }) {
  const out = product.stock <= 0;

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-medium">{product.name}</h3>
        <span className="text-sm text-gray-500">{product.category}</span>
      </div>

      <div className="mt-2 text-2xl font-semibold">${product.price}</div>

      <div className="mt-1 text-sm">
        {out ? (
          <span className="text-red-600 font-medium">Out of stock</span>
        ) : (
          <span className="text-gray-600">In stock: {product.stock}</span>
        )}
      </div>

      <button
        className={`mt-4 w-full rounded-xl px-4 py-2 font-medium ${
          out
            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
            : "bg-black text-white hover:bg-gray-800"
        }`}
        disabled={out}
        onClick={onAdd}
      >
        {out ? "Unavailable" : "Add to cart"}
      </button>
    </div>
  );
}