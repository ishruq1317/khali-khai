"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { calculatePricing, PricingResult } from "@/lib/pricing";

export interface CartItem {
  id: string; // menuItemId
  nameBn: string;
  nameEn: string;
  price: number;
  quantity: number;
  restaurantId: string;
  restaurantNameBn: string;
  restaurantNameEn: string;
  restaurantLat: number;
  restaurantLng: number;
  prepTimeMinutes: number;
  instructions?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  restaurantGroups: {
    restaurantId: string;
    restaurantNameBn: string;
    restaurantNameEn: string;
    restaurantLat: number;
    restaurantLng: number;
    items: CartItem[];
    subtotal: number;
  }[];
  totalItemCount: number;
  foodSubtotal: number;
  pricing: PricingResult;
  customerLat: number;
  customerLng: number;
  setCustomerCoordinates: (lat: number, lng: number) => void;
  isFirstOrder: boolean;
  hasLoyaltyDiscount: boolean;
  setDiscounts: (firstOrder: boolean, loyalty: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [customerLat, setCustomerLat] = useState(23.8480); // Radio Colony, Savar default
  const [customerLng, setCustomerLng] = useState(90.2600);
  const [isFirstOrder, setIsFirstOrder] = useState(false);
  const [hasLoyaltyDiscount, setHasLoyaltyDiscount] = useState(false);

  // Load cart and location from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("khali_khai_cart");
      if (saved) {
        setItems(JSON.parse(saved));
      }
      const savedLoc = localStorage.getItem("khali_khai_user_location");
      if (savedLoc) {
        const parsed = JSON.parse(savedLoc);
        if (parsed.lat && parsed.lng) {
          setCustomerLat(parsed.lat);
          setCustomerLng(parsed.lng);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("khali_khai_cart", JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  const addItem = (newItem: CartItem) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === newItem.id);
      if (existingIndex > -1) {
        const copy = [...prev];
        copy[existingIndex].quantity += newItem.quantity;
        return copy;
      }
      return [...prev, newItem];
    });
  };

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
    try {
      localStorage.removeItem("khali_khai_cart");
    } catch {
      // ignore
    }
  };

  // Group items by restaurant
  const groupMap = new Map<string, {
    restaurantId: string;
    restaurantNameBn: string;
    restaurantNameEn: string;
    restaurantLat: number;
    restaurantLng: number;
    items: CartItem[];
    subtotal: number;
  }>();

  for (const item of items) {
    if (!groupMap.has(item.restaurantId)) {
      groupMap.set(item.restaurantId, {
        restaurantId: item.restaurantId,
        restaurantNameBn: item.restaurantNameBn,
        restaurantNameEn: item.restaurantNameEn,
        restaurantLat: item.restaurantLat,
        restaurantLng: item.restaurantLng,
        items: [],
        subtotal: 0,
      });
    }
    const group = groupMap.get(item.restaurantId)!;
    group.items.push(item);
    group.subtotal += item.price * item.quantity;
  }

  const restaurantGroups = Array.from(groupMap.values());
  const totalItemCount = items.reduce((acc, curr) => acc + curr.quantity, 0);
  const foodSubtotal = items.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);

  // Compute pricing
  const restaurantCoords = restaurantGroups.map((g) => ({
    lat: g.restaurantLat,
    lng: g.restaurantLng,
  }));

  const pricing = calculatePricing({
    foodSubtotal,
    restaurantCount: restaurantGroups.length,
    restaurantCoordinates: restaurantCoords,
    customerCoordinates: { lat: customerLat, lng: customerLng },
    isFirstOrder,
    hasLoyaltyDiscount,
  });

  const setCustomerCoordinates = (lat: number, lng: number) => {
    setCustomerLat(lat);
    setCustomerLng(lng);
    try {
      localStorage.setItem("khali_khai_user_location", JSON.stringify({ lat, lng }));
    } catch {}
  };

  const setDiscounts = (firstOrder: boolean, loyalty: boolean) => {
    setIsFirstOrder(firstOrder);
    setHasLoyaltyDiscount(loyalty);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        restaurantGroups,
        totalItemCount,
        foodSubtotal,
        pricing,
        customerLat,
        customerLng,
        setCustomerCoordinates,
        isFirstOrder,
        hasLoyaltyDiscount,
        setDiscounts,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
