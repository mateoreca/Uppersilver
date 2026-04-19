'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from 'react';
import { CartState, CartAction, CartItem } from '@/types';

// ─── Reducer ──────────────────────────────────────────────────────────────────

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.findIndex(
        (i) =>
          i.productId === action.payload.productId &&
          i.size === action.payload.size &&
          i.color === action.payload.color,
      );
      if (existing >= 0) {
        const updated = [...state.items];
        updated[existing] = {
          ...updated[existing],
          quantity: updated[existing].quantity + action.payload.quantity,
        };
        return { items: updated };
      }
      return { items: [...state.items, action.payload] };
    }

    case 'REMOVE_ITEM':
      return {
        items: state.items.filter(
          (i) =>
            !(
              i.productId === action.payload.productId &&
              i.size === action.payload.size &&
              i.color === action.payload.color
            ),
        ),
      };

    case 'INCREMENT': {
      return {
        items: state.items.map((i) =>
          i.productId === action.payload.productId &&
          i.size === action.payload.size &&
          i.color === action.payload.color
            ? { ...i, quantity: i.quantity + 1 }
            : i,
        ),
      };
    }

    case 'DECREMENT': {
      return {
        items: state.items
          .map((i) =>
            i.productId === action.payload.productId &&
            i.size === action.payload.size &&
            i.color === action.payload.color
              ? { ...i, quantity: Math.max(0, i.quantity - 1) }
              : i,
          )
          .filter((i) => i.quantity > 0),
      };
    }

    case 'CLEAR_CART':
      return { items: [] };

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, size: string, color: string) => void;
  increment: (productId: string, size: string, color: string) => void;
  decrement: (productId: string, size: string, color: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = 'uppersilver_cart';

// ─── Provider ─────────────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  // Cargar desde localStorage al montar
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: CartItem[] = JSON.parse(saved);
        parsed.forEach((item) => dispatch({ type: 'ADD_ITEM', payload: item }));
      }
    } catch {
      // Ignorar errores de parsing
    }
  }, []);

  // Persistir en localStorage cuando cambia
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items]);

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const addItem = useCallback((item: CartItem) => dispatch({ type: 'ADD_ITEM', payload: item }), []);
  const removeItem = useCallback((productId: string, size: string, color: string) =>
    dispatch({ type: 'REMOVE_ITEM', payload: { productId, size, color } }), []);
  const increment = useCallback((productId: string, size: string, color: string) =>
    dispatch({ type: 'INCREMENT', payload: { productId, size, color } }), []);
  const decrement = useCallback((productId: string, size: string, color: string) =>
    dispatch({ type: 'DECREMENT', payload: { productId, size, color } }), []);
  const clearCart = useCallback(() => dispatch({ type: 'CLEAR_CART' }), []);

  return (
    <CartContext.Provider
      value={{ items: state.items, totalItems, totalPrice, addItem, removeItem, increment, decrement, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
