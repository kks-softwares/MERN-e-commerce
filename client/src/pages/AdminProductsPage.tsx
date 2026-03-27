import { useEffect, useState, type FormEvent } from "react";

import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import type { Category, CreateProductPayload, Product } from "../types";

const initialForm: CreateProductPayload = {
  name: "",
  description: "",
  price: 0,
  brand: "",
  image: "",
  countInStock: 0,
  category: ""
};

const toFormState = (product: Product): CreateProductPayload => ({
  name: product.name,
  description: product.description,
  price: product.price,
  brand: product.brand || "",
  image: product.image || "",
  countInStock: product.countInStock,
  category: product.category?._id || ""
});

export function AdminProductsPage() {
  const { user } = useAuth();
  const [form, setForm] = useState<CreateProductPayload>(initialForm);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const resetForm = (nextCategoryId = categories[0]?._id || "") => {
    setEditingProductId(null);
    setForm({
      ...initialForm,
      category: nextCategoryId
    });
  };

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [categoriesResponse, productsResponse] = await Promise.all([
        api.getCategories(),
        api.getProducts()
      ]);

      setCategories(categoriesResponse.data);
      setProducts(productsResponse.data);
      setForm((current) => ({
        ...current,
        category: current.category || categoriesResponse.data[0]?._id || ""
      }));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleChange = (field: keyof CreateProductPayload, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: field === "price" || field === "countInStock" ? Number(value) : value
    }));
  };

  const handleEditStart = (product: Product) => {
    setError("");
    setSuccess(`Editing ${product.name}`);
    setEditingProductId(product._id);
    setForm(toFormState(product));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (product: Product) => {
    if (!user?.token) {
      setError("Admin login required");
      return;
    }

    const confirmed = window.confirm(`Delete ${product.name}? This cannot be undone.`);

    if (!confirmed) {
      return;
    }

    setDeletingProductId(product._id);
    setError("");
    setSuccess("");

    try {
      await api.deleteProduct(user.token, product._id);
      setSuccess(`${product.name} deleted successfully.`);

      if (editingProductId === product._id) {
        resetForm();
      }

      await loadData();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete product");
    } finally {
      setDeletingProductId(null);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user?.token) {
      setError("Admin login required");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      if (editingProductId) {
        const response = await api.updateProduct(user.token, editingProductId, form);
        setSuccess(`${response.data.name} updated successfully.`);
      } else {
        const response = await api.createProduct(user.token, form);
        setSuccess(`${response.data.name} created successfully.`);
      }

      const nextCategoryId = form.category || categories[0]?._id || "";
      resetForm(nextCategoryId);
      await loadData();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to save product");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="page-section">
      <div className="hero admin-hero">
        <p className="eyebrow">Admin panel</p>
        <h1>Manage your store products</h1>
        <p className="muted wide">
          This panel creates, edits, and deletes products using your protected backend routes.
        </p>
      </div>

      {loading && <div className="empty-state">Loading admin tools...</div>}
      {error && <div className="error-banner">{error}</div>}
      {success && <div className="success-banner">{success}</div>}

      {!loading && categories.length === 0 && (
        <div className="empty-state">Create at least one category in the backend before adding products.</div>
      )}

      {!loading && categories.length > 0 && (
        <div className="admin-grid">
          <form className="card admin-form" onSubmit={handleSubmit}>
            <div className="page-heading compact-heading">
              <div>
                <p className="eyebrow">{editingProductId ? "Update product" : "New product"}</p>
                <h2>{editingProductId ? "Edit product" : "Create product"}</h2>
              </div>
              {editingProductId && (
                <button className="ghost-button" onClick={() => resetForm(form.category)} type="button">
                  Cancel edit
                </button>
              )}
            </div>

            <label className="field">
              <span>Product name</span>
              <input
                required
                type="text"
                value={form.name}
                onChange={(event) => handleChange("name", event.target.value)}
              />
            </label>

            <label className="field">
              <span>Description</span>
              <textarea
                required
                rows={4}
                value={form.description}
                onChange={(event) => handleChange("description", event.target.value)}
              />
            </label>

            <div className="form-split">
              <label className="field">
                <span>Price</span>
                <input
                  min={0}
                  required
                  type="number"
                  value={form.price}
                  onChange={(event) => handleChange("price", event.target.value)}
                />
              </label>

              <label className="field">
                <span>Stock</span>
                <input
                  min={0}
                  required
                  type="number"
                  value={form.countInStock}
                  onChange={(event) => handleChange("countInStock", event.target.value)}
                />
              </label>
            </div>

            <label className="field">
              <span>Brand</span>
              <input
                type="text"
                value={form.brand}
                onChange={(event) => handleChange("brand", event.target.value)}
              />
            </label>

            <label className="field">
              <span>Image URL</span>
              <input
                type="url"
                value={form.image}
                onChange={(event) => handleChange("image", event.target.value)}
              />
            </label>

            <label className="field">
              <span>Category</span>
              <select
                required
                value={form.category}
                onChange={(event) => handleChange("category", event.target.value)}
              >
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <button className="primary-button" disabled={submitting} type="submit">
              {submitting ? (editingProductId ? "Updating..." : "Creating...") : editingProductId ? "Save changes" : "Add product"}
            </button>
          </form>

          <div className="card admin-list">
            <div className="page-heading compact-heading">
              <div>
                <p className="eyebrow">Live catalog</p>
                <h2>Existing products</h2>
              </div>
              <strong>{products.length}</strong>
            </div>

            <div className="admin-product-list">
              {products.map((product) => (
                <article className="admin-product-row" key={product._id}>
                  <div className="admin-product-meta">
                    <strong>{product.name}</strong>
                    <span className="muted">{product.category?.name || "No category"}</span>
                  </div>
                  <div className="admin-product-meta align-right">
                    <strong>Rs. {product.price.toFixed(2)}</strong>
                    <span className="muted">Stock: {product.countInStock}</span>
                  </div>
                  <div className="admin-actions">
                    <button className="secondary-button" onClick={() => handleEditStart(product)} type="button">
                      Edit
                    </button>
                    <button
                      className="danger-button"
                      disabled={deletingProductId === product._id}
                      onClick={() => void handleDelete(product)}
                      type="button"
                    >
                      {deletingProductId === product._id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
