import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import type { Product } from "../types";

export function ProductCard({ product }: { product: Product }) {
  const { user } = useAuth();
  const { addItem } = useCart();
  const [message, setMessage] = useState("");

  const handleAdd = async () => {
    if (!user) {
      setMessage("Login to add items to your cart.");
      return;
    }

    try {
      await addItem(product._id);
      setMessage("Added to cart.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to add item.");
    }
  };

  return (
    <article className="card product-card">
      <div className="product-image-wrap">
        {product.image ? (
          <img
            alt={product.name}
            className="product-image"
            loading="lazy"
            src={product.image}
          />
        ) : (
          <div className="product-image product-image-fallback">No image</div>
        )}
      </div>

      <div className="product-topline">
        <span className="pill">{product.category?.name || "Category"}</span>
        <span className={product.countInStock > 0 ? "stock in-stock" : "stock out-stock"}>
          {product.countInStock > 0 ? `${product.countInStock} in stock` : "Out of stock"}
        </span>
      </div>

      <h2>{product.name}</h2>
      <p className="muted">{product.description}</p>
      <p className="price">Rs. {product.price.toFixed(2)}</p>
      <p className="muted">Brand: {product.brand || "Generic"}</p>

      <div className="product-actions">
        <button
          className="primary-button"
          disabled={product.countInStock < 1}
          onClick={handleAdd}
          type="button"
        >
          Add to cart
        </button>
        {!user && <Link to="/login">Login first</Link>}
      </div>

      {message && <p className="helper-text">{message}</p>}
    </article>
  );
}

