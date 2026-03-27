import type {
  ApiResponse,
  AuthUser,
  Cart,
  Category,
  CreateProductPayload,
  Product,
  ProductListResponse,
  User
} from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  token?: string;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data as T;
}

export const api = {
  register: (payload: { name: string; email: string; password: string }) =>
    request<ApiResponse<AuthUser>>("/auth/register", { method: "POST", body: payload }),

  login: (payload: { email: string; password: string }) =>
    request<ApiResponse<AuthUser>>("/auth/login", { method: "POST", body: payload }),

  getProfile: (token: string) => request<ApiResponse<User>>("/auth/profile", { token }),

  getProducts: () => request<ProductListResponse>("/products"),

  createProduct: (token: string, payload: CreateProductPayload) =>
    request<ApiResponse<Product>>("/products", { method: "POST", token, body: payload }),

  updateProduct: (token: string, productId: string, payload: CreateProductPayload) =>
    request<ApiResponse<Product>>(`/products/${productId}`, { method: "PUT", token, body: payload }),

  deleteProduct: (token: string, productId: string) =>
    request<ApiResponse<{ message?: string }>>(`/products/${productId}`, { method: "DELETE", token }),

  getCategories: () => request<ApiResponse<Category[]>>("/categories"),

  getCart: (token: string) => request<ApiResponse<Cart>>("/cart", { token }),

  addToCart: (token: string, payload: { productId: string; quantity: number }) =>
    request<ApiResponse<Cart>>("/cart", { method: "POST", token, body: payload }),

  updateCartItem: (token: string, payload: { productId: string; quantity: number }) =>
    request<ApiResponse<Cart>>("/cart", { method: "PUT", token, body: payload }),

  removeCartItem: (token: string, productId: string) =>
    request<ApiResponse<Cart>>(`/cart/${productId}`, { method: "DELETE", token })
};
