'use client';

import { useEffect, useMemo, useState } from "react";
import ProductList from "./ProductList";
import CategoryFilter from "./CategoryFilter";
import PriceFilter from "./PriceFilter";
import CartSummary from "./CartSummary";
import StatusMessage from "./StatusMessage";

export default function Catalog() {
  // Data + UI state
  const [products, setProducts] = useState([]);
  const [baseProducts, setBaseProducts] = useState([]); // for categories
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({ category: "", price: "" });
  const [cart, setCart] = useState({}); // { [productId]: qty }

  // Fetch products on mount
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

  // Simulate stock changes every 4s (after mount). Cleanup on unmount.
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

  // Map for quick lookup (name/price by id)
  const productsById = useMemo(() => {
    const map = Object.create(null);
    for (const p of products) map[p.id] = p;
    return map;
  }, [products]);

  // Controlled inputs
  const updateFilters = (key, value) =>
    setFilters((f) => ({ ...f, [key]: value }));

  // Categories from base list (stable)
  const categories = useMemo(() => {
    const set = new Set(baseProducts.map((p) => p.category));
    return Array.from(set).sort();
  }, [baseProducts]);

  // Apply filters
  const filtered = useMemo(() => {
    const max = filters.price ? Number(filters.price) : Infinity;
    const cat = filters.category;
    return products.filter(
      (p) => (cat ? p.category === cat : true) && p.price <= max
    );
  }, [products, filters]);

  // Cart actions with stock synchronization
  const addToCart = (product) => {
    // guard: respect current stock
    const current = productsById[product.id];
    if (!current || current.stock <= 0) return;

    // 1) increment cart
    setCart((c) => ({ ...c, [product.id]: (c[product.id] || 0) + 1 }));

    // 2) decrement stock in products list
    setProducts((prev) =>
      prev.map((p) =>
        p.id === product.id ? { ...p, stock: Math.max(0, p.stock - 1) } : p
      )
    );
  };

  const decrement = (productId) => {
    setCart((c) => {
      const qty = (c[productId] || 0) - 1;
      const next = { ...c };
      if (qty <= 0) delete next[productId];
      else next[productId] = qty;
      return next;
    });

    // restore one unit of stock when an item is removed from cart
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, stock: p.stock + 1 } : p
      )
    );
  };

  const resetCart = () => {
    // add back all quantities to stock
    setProducts((prev) => {
      const back = { ...cart };
      return prev.map((p) =>
        back[p.id] ? { ...p, stock: p.stock + back[p.id] } : p
      );
    });
    setCart({});
  };

  // Derived totals and cart lines with names
  const { itemCount, total, lines } = useMemo(() => {
    let count = 0;
    let sum = 0;
    const out = [];
    for (const [pid, qty] of Object.entries(cart)) {
      const p = productsById[pid];
      if (!p) continue;
      count += qty;
      sum += p.price * qty;
      out.push({ id: pid, qty, name: p.name, price: p.price });
    }
    return { itemCount: count, total: sum, lines: out };
  }, [cart, productsById]);

  // Conditional rendering
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
          lines={lines}
          itemCount={itemCount}
          total={total}
          decrement={decrement}
          reset={resetCart}
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
