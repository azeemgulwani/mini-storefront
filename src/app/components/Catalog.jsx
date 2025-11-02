'use client';

import { useEffect, useMemo, useState } from "react";
import ProductList from "./ProductList";
import CategoryFilter from "./CategoryFilter";
import PriceFilter from "./PriceFilter";
import CartSummary from "./CartSummary";
import StatusMessage from "./StatusMessage";

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [baseProducts, setBaseProducts] = useState([]); // for categories
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({ category: "", price: "" });
  const [cart, setCart] = useState({}); // { [productId]: qty }

  // Fetch once
  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetch("/api/products")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load products");
        return r.json();
      })
      .then((data) => {
        if (!alive) return;
        setBaseProducts(data);
        setProducts(data);
      })
      .catch((e) => {
        if (!alive) return;
        setError(e.message || "Error loading products");
      })
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  // Simulate stock changes (cleanup interval)
  useEffect(() => {
    if (products.length === 0) return;
    const id = setInterval(() => {
      setProducts((prev) => {
        const idx = Math.floor(Math.random() * prev.length);
        return prev.map((p, i) =>
          i === idx ? { ...p, stock: Math.max(0, p.stock - (Math.random() < 0.5 ? 1 : 0)) } : p
        );
      });
    }, 4000);
    return () => clearInterval(id);
  }, [products.length]);

  const updateFilters = (key, value) => setFilters((f) => ({ ...f, [key]: value }));

  const categories = useMemo(() => {
    const set = new Set(baseProducts.map((p) => p.category));
    return Array.from(set).sort();
  }, [baseProducts]);

  const filtered = useMemo(() => {
    const max = filters.price ? Number(filters.price) : Infinity;
    const cat = filters.category;
    return products.filter(
      (p) => (cat ? p.category === cat : true) && p.price <= max
    );
  }, [products, filters]);

  const addToCart = (product) => {
    if (product.stock <= 0) return;
    setCart((c) => ({ ...c, [product.id]: (c[product.id] || 0) + 1 }));
  };
  const decrement = (productId) => {
    setCart((c) => {
      const qty = (c[productId] || 0) - 1;
      const next = { ...c };
      if (qty <= 0) delete next[productId];
      else next[productId] = qty;
      return next;
    });
  };
  const resetCart = () => setCart({});

  const { itemCount, total } = useMemo(() => {
    let count = 0, sum = 0;
    for (const [pid, qty] of Object.entries(cart)) {
      const p = products.find((x) => x.id === pid);
      if (!p) continue;
      count += qty;
      sum += p.price * qty;
    }
    return { itemCount: count, total: sum };
  }, [cart, products]);

  if (loading) return <StatusMessage state="loading" />;
  if (error)   return <StatusMessage state="error" message={error} />;

  return (
    <section className="space-y-6">
      <div className="grid gap-3 md:grid-cols-3">
        <CategoryFilter
          categories={categories}
          value={filters.category}
          onChange={(v) => updateFilters("category", v)}
        />
        <PriceFilter
          value={filters.price}
          onChange={(v) => updateFilters("price", v)}
        />
        <CartSummary
          itemCount={itemCount}
          total={total}
          decrement={decrement}
          reset={resetCart}
          cart={cart}
        />
      </div>

      {filtered.length === 0 ? (
        <StatusMessage state="empty" />
      ) : (
        <ProductList products={filtered} onAdd={addToCart} />
      )}
    </section>
  );
}
