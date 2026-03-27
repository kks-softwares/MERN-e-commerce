import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode
} from "react";

import { api } from "../lib/api";
import { useAuth } from "./AuthContext";
import type { Cart } from "../types";

type CartContextValue = {
  cart: Cart | null;
  loading: boolean;
  refreshCart: () => Promise<void>;
  addItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshCart = async () => {
    if (!user?.token) {
      setCart(null);
      return;
    }

    setLoading(true);
    try {
      const response = await api.getCart(user.token);
      setCart(response.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshCart();
  }, [user?.token]);

  const addItem = async (productId: string) => {
    if (!user?.token) {
      throw new Error("Login required");
    }

    setLoading(true);
    try {
      const response = await api.addToCart(user.token, { productId, quantity: 1 });
      setCart(response.data);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!user?.token) {
      throw new Error("Login required");
    }

    setLoading(true);
    try {
      const response = await api.updateCartItem(user.token, { productId, quantity });
      setCart(response.data);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (productId: string) => {
    if (!user?.token) {
      throw new Error("Login required");
    }

    setLoading(true);
    try {
      const response = await api.removeCartItem(user.token, productId);
      setCart(response.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider value={{ cart, loading, refreshCart, addItem, updateQuantity, removeItem }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}
