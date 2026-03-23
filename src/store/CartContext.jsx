import React, { createContext, useState, useContext } from "react";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

// --- helpers ---
const stableStringify = (val) => {
  if (val === null || typeof val !== "object") return JSON.stringify(val);
  if (Array.isArray(val)) return `[${val.map(stableStringify).join(",")}]`;
  const keys = Object.keys(val).sort();
  return `{${keys.map((k) => JSON.stringify(k) + ":" + stableStringify(val[k])).join(",")}}`;
};

const lineKey = (item) => `${item.id}::${stableStringify(item.options || {})}`;

// Normalize ANY incoming item to a consistent cart shape:
// - unitPrice: per-unit price (options already applied)
// - price: kept equal to unitPrice for backward compat
// - qty: integer >= 1
const normalizeIncoming = (raw) => {
  const qty = Math.max(1, parseInt(raw?.qty ?? 1, 10) || 1);

  // If caller provided unitPrice, use it. Otherwise, try to infer:
  // - If they passed a total (totalPrice/lineTotal/total), prefer total/qty
  // - Else fall back to price/qty (defensive if they sent extended price)
  const explicitTotal =
    Number(raw?.totalPrice) ??
    Number(raw?.lineTotal) ??
    Number(raw?.total);

  let unitPrice;
  if (Number.isFinite(raw?.unitPrice)) {
    unitPrice = Number(raw.unitPrice);
  } else if (Number.isFinite(explicitTotal)) {
    unitPrice = explicitTotal / qty;
  } else {
    const p = Number(raw?.price ?? 0);
    unitPrice = qty > 0 ? p / qty : p; // safe if caller sent extended p
  }

  return {
    id: raw.id,
    name: raw.name,
    options: raw.options || {},
    qty,
    unitPrice,
    price: unitPrice, // keep for older UI math paths
  };
};

const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (incomingRaw) => {
    const incoming = normalizeIncoming(incomingRaw);
    const k = lineKey(incoming);

    setCartItems((prev) => {
      const idx = prev.findIndex((i) => lineKey(i) === k);
      if (idx >= 0) {
        // Same line (same id + same options): bump qty, keep unitPrice stable
        const copy = [...prev];
        const existing = copy[idx];
        copy[idx] = {
          ...existing,
          qty: existing.qty + incoming.qty,
          // If prices disagree (shouldn't), trust the existing unitPrice
          unitPrice: Number.isFinite(existing.unitPrice)
            ? existing.unitPrice
            : incoming.unitPrice,
          price: Number.isFinite(existing.unitPrice)
            ? existing.unitPrice
            : incoming.unitPrice,
        };
        return copy;
      }
      // New line
      return [...prev, incoming];
    });
  };

  const removeFromCart = (itemToRemove) => {
    const k = lineKey(itemToRemove);
    setCartItems((prev) =>
      prev.reduce((acc, item) => {
        if (lineKey(item) === k) {
          if (item.qty > 1) acc.push({ ...item, qty: item.qty - 1 });
          // else drop it
        } else {
          acc.push(item);
        }
        return acc;
      }, [])
    );
  };

  const removeAllOfItem = (itemToRemove) => {
    const k = lineKey(itemToRemove);
    setCartItems((prev) => prev.filter((i) => lineKey(i) !== k));
  };

  // Optional: remove all variants by id (ignore options)
  const removeAllById = (id) => {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  };

  // Safer update: require the full line key (id+options), not just id
  const updateQtyByLine = (itemRef, qty) => {
    const k = lineKey(itemRef);
    const q = Math.max(1, parseInt(qty ?? 1, 10) || 1);
    setCartItems((prev) =>
      prev.map((i) => (lineKey(i) === k ? { ...i, qty: q } : i))
    );
  };

  const clearCart = () => setCartItems([]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        removeAllOfItem,
        removeAllById,
        updateQtyByLine,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;
