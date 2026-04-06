import { createContext, useContext, useState } from "react";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export default function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const addToCart = (p) => {
    const found = items.find((x) => x.variant_id === p.variant_id);
    if (found) {
      setItems(items.map((x) => x.variant_id === p.variant_id ? { ...x, quantity: x.quantity + 1 } : x));
    } else {
      setItems([...items, { ...p, quantity: 1 }]);
    }
  };

  const clearCart = () => setItems([]);
  return <CartContext.Provider value={{ items, setItems, addToCart, clearCart }}>{children}</CartContext.Provider>;
}