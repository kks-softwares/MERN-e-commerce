import { useCart } from "../context/CartContext";

export function CartPage() {
  const { cart, loading, removeItem, updateQuantity } = useCart();

  return (
    <section className="page-section">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Your cart</p>
          <h1>Shopping cart</h1>
        </div>
        <div className="card total-card">
          <span className="muted">Total</span>
          <strong>Rs. {cart?.totalPrice?.toFixed(2) || "0.00"}</strong>
        </div>
      </div>

      {loading && <div className="empty-state">Updating cart...</div>}

      {!loading && (!cart || cart.items.length === 0) && (
        <div className="empty-state">Your cart is empty.</div>
      )}

      <div className="cart-list">
        {cart?.items.map((item) => (
          <article className="card cart-row" key={item.product._id}>
            <div>
              <h2>{item.product.name}</h2>
              <p className="muted">Rs. {item.price.toFixed(2)} each</p>
            </div>

            <label className="field inline-field">
              <span>Qty</span>
              <input
                min={1}
                onChange={(event) => void updateQuantity(item.product._id, Number(event.target.value))}
                type="number"
                value={item.quantity}
              />
            </label>

            <button className="secondary-button" onClick={() => void removeItem(item.product._id)} type="button">
              Remove
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
