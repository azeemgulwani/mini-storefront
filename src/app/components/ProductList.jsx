'use client';

import ProductCard from "./ProductCard";

export default function ProductList({ products, onAdd }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} onAdd={() => onAdd(p)} />
      ))}
    </div>
  );
}