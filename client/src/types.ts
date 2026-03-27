export interface User {
  _id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
}

export interface AuthUser extends User {
  token: string;
}

export interface Category {
  _id: string;
  name: string;
  description: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  brand: string;
  image: string;
  countInStock: number;
  category: Category;
}

export interface CreateProductPayload {
  name: string;
  description: string;
  price: number;
  brand: string;
  image: string;
  countInStock: number;
  category: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  price: number;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  totalPrice: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  count?: number;
  data: T;
}

export interface ProductListResponse {
  success: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  data: Product[];
}
