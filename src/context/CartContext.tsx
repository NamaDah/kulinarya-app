"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import { CartItem, Product } from "@/lib/types";

// ── Actions ──
type CartAction =
  | { type: "ADD_ITEM"; product: Product }
  | { type: "REMOVE_ITEM"; productId: number }
  | { type: "UPDATE_QUANTITY"; productId: number; quantity: number }
  | { type: "ADD_MULTIPLE"; products: Product[] }
  | { type: "CLEAR_CART" }
  | { type: "HYDRATE"; items: CartItem[] };

// ── State ──
interface CartState {
  items: CartItem[];
  isHydrated: boolean;
}

const initialState: CartState = {
  items: [],
  isHydrated: false,
};

// ── Reducer ──
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find(
        (i) => i.product.id === action.product.id,
      );
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.product.id === action.product.id
              ? { ...i, quantity: i.quantity + 1 }
              : i,
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { product: action.product, quantity: 1 }],
      };
    }
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((i) => i.product.id !== action.productId),
      };
    case "UPDATE_QUANTITY":
      if (action.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((i) => i.product.id !== action.productId),
        };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.product.id === action.productId
            ? { ...i, quantity: action.quantity }
            : i,
        ),
      };
    case "ADD_MULTIPLE": {
      const newItems = [...state.items];
      for (const product of action.products) {
        const existing = newItems.find((i) => i.product.id === product.id);
        if (existing) {
          existing.quantity += 1;
        } else {
          newItems.push({ product, quantity: 1 });
        }
      }
      return { ...state, items: newItems };
    }
    case "CLEAR_CART":
      return { ...state, items: [] };
    case "HYDRATE":
      return { ...state, items: action.items, isHydrated: true };
    default:
      return state;
  }
}

// ── Context ──
interface CartContextType {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  addMultipleItems: (products: Product[]) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isHydrated: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// ── Provider ──
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Hydrate from sessionStorage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("kulinarya-cart");
      if (saved) {
        const items = JSON.parse(saved) as CartItem[];
        dispatch({ type: "HYDRATE", items });
      } else {
        dispatch({ type: "HYDRATE", items: [] });
      }
    } catch {
      dispatch({ type: "HYDRATE", items: [] });
    }
  }, []);

  // Persist to sessionStorage on change
  useEffect(() => {
    if (state.isHydrated) {
      sessionStorage.setItem("kulinarya-cart", JSON.stringify(state.items));
    }
  }, [state.items, state.isHydrated]);

  const addItem = useCallback(
    (product: Product) => dispatch({ type: "ADD_ITEM", product }),
    [],
  );
  const removeItem = useCallback(
    (productId: number) => dispatch({ type: "REMOVE_ITEM", productId }),
    [],
  );
  const updateQuantity = useCallback(
    (productId: number, quantity: number) =>
      dispatch({ type: "UPDATE_QUANTITY", productId, quantity }),
    [],
  );
  const addMultipleItems = useCallback(
    (products: Product[]) => dispatch({ type: "ADD_MULTIPLE", products }),
    [],
  );
  const clearCart = useCallback(() => dispatch({ type: "CLEAR_CART" }), []);

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = state.items.reduce(
    (sum, i) => sum + parseFloat(i.product.price) * i.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        addItem,
        removeItem,
        updateQuantity,
        addMultipleItems,
        clearCart,
        totalItems,
        totalPrice,
        isHydrated: state.isHydrated,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ── Hook ──
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
