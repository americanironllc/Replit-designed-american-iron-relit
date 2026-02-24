import { useState, useCallback, useEffect } from "react";
import type { Part } from "@shared/schema";

export interface QuoteCartItem {
  partNumber: string;
  description: string;
  category: string;
  quantity: number;
}

const STORAGE_KEY = "american-iron-quote-cart";

function loadCart(): QuoteCartItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveCart(items: QuoteCartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

export function useQuoteCart() {
  const [items, setItems] = useState<QuoteCartItem[]>(loadCart);

  useEffect(() => {
    saveCart(items);
  }, [items]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setItems(loadCart());
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const addItem = useCallback((part: Part) => {
    setItems((prev) => {
      if (prev.some((item) => item.partNumber === part.partNumber)) return prev;
      return [
        ...prev,
        {
          partNumber: part.partNumber,
          description: part.description,
          category: part.category,
          quantity: 1,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((partNumber: string) => {
    setItems((prev) => prev.filter((item) => item.partNumber !== partNumber));
  }, []);

  const updateQuantity = useCallback((partNumber: string, quantity: number) => {
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((item) =>
        item.partNumber === partNumber ? { ...item, quantity } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const isInCart = useCallback(
    (partNumber: string) => items.some((item) => item.partNumber === partNumber),
    [items]
  );

  return { items, addItem, removeItem, updateQuantity, clearCart, isInCart };
}
