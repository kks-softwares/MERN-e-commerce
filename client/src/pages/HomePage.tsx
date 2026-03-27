import { useEffect, useState } from "react";

import { ProductCard } from "../components/ProductCard";
import { api } from "../lib/api";
import type { Product } from "../types";

export function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await api.getProducts();
        setProducts(response.data);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    void loadProducts();
  }, []);

  return (
    <section className="page-section">
      <div className="hero">
        <p className="eyebrow">React + TypeScript + Express</p>
        <h1>Your store is now connected end to end.</h1>
        <p className="muted wide">
          Products below are coming directly from your Express backend and MongoDB database.
        </p>
      </div>

      {loading && <div className="empty-state">Loading products...</div>}
      {error && <div className="error-banner">{error}</div>}

      {!loading && !error && products.length === 0 && (
        <div className="empty-state">No products found. Add products from the backend first.</div>
      )}

      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
}
