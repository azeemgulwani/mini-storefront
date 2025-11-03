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

  // Cart holds what the user wants; pending holds units waiting to be applied to stock.
  // Example: cart = { p1: 2 }, pending = { p1: 2 } initially; interval will apply 1 at a time.
  const [cart, setCart] = useState({});     // { [productId]: qty }
  const [pending, setPending] = useState({}); // { [productId]: qty to apply to stock over time }

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

  // Quick lookup by id
  const productsById = useMemo(() => {
    const map = Object.create(null);
    for (const p of products) map[p.id] = p;
    return map;
  }, [products]);

  // Controlled inputs
  const updateFilters = (key, value) =>
    setFilters((f) => ({ ...f, [key]: value }));

  // Categories (stable from original dataset)
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

  // Cart actions (no immediate stock change here!)
  // We enqueue pending stock updates and let the interval apply them over time.
  const addToCart = (product) => {
    const current = productsById[product.id];
    if (!current || current.stock <= 0) return;

    // 1) Increase cart quantity
    setCart((c) => ({ ...c, [product.id]: (c[product.id] || 0) + 1 }));

    // 2) Enqueue one pending unit for interval to apply later
    setPending((q) => ({ ...q, [product.id]: (q[product.id] || 0) + 1 }));
  };

  const decrement = (productId) => {
    // If item exists in cart, decrease by 1
    setCart((c) => {
      const qty = (c[productId] || 0) - 1;
      const next = { ...c };
      if (qty <= 0) delete next[productId];
      else next[productId] = qty;
      return next;
    });

    // If we still have a pending unit not yet applied, cancel it.
    // Otherwise, the unit was already applied to stock → restore one unit to stock.
    setPending((q) => {
      const pendingQty = q[productId] || 0;
      if (pendingQty > 0) {
        const nextQ = { ...q, [productId]: pendingQty - 1 };
        if (nextQ[productId] <= 0) delete nextQ[productId];
        return nextQ;
      } else {
        // Restore stock since applied earlier
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, stock: p.stock + 1 } : p))
        );
        return q;
      }
    });
  };

  const resetCart = () => {
    // Return any already-applied units to stock (cart - pending)
    setProducts((prev) => {
      const next = prev.map((p) => {
        const cQty = cart[p.id] || 0;
        const pend = pending[p.id] || 0;
        const applied = Math.max(0, cQty - pend); // units already applied to stock
        return applied > 0 ? { ...p, stock: p.stock + applied } : p;
      });
      return next;
    });

    // Clear cart and pending
    setCart({});
    setPending({});
  };

  // Interval: apply pending units to stock over time.
  // Runs ONLY when there is something in pending.
  useEffect(() => {
    const keys = Object.keys(pending);
    if (keys.length === 0) return;

    const id = setInterval(() => {
      // Pick the first product in the queue and apply 1 unit
      const pid = Object.keys(pending)[0];
      if (!pid) return;

      // Apply to stock (decrement if available)
      setProducts((prev) =>
        prev.map((p) =>
          p.id === pid && p.stock > 0 ? { ...p, stock: p.stock - 1 } : p
        )
      );

      // Decrease pending for that product by 1
      setPending((q) => {
        const qty = (q[pid] || 0) - 1;
        const nextQ = { ...q };
        if (qty <= 0) delete nextQ[pid];
        else nextQ[pid] = qty;
        return nextQ;
      });
    }, 1200); // one unit ~every 1.2s so you can see it change

    return () => clearInterval(id); // cleanup
  }, [pending]);

  // Totals + cart lines with names
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
      {/* Controls row */}
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

      {/* Products */}
      {filtered.length === 0 ? (
        <StatusMessage state="empty" />
      ) : (
        <ProductList products={filtered} onAdd={addToCart} />
      )}
    </section>
  );
}