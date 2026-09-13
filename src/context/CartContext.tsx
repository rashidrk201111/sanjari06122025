import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export interface CartFile {
  name: string;
  pageCount: number | null;
  pagesToPrint: number;
  instruction: string;
}

export interface CartItem {
  id: string;
  productName: string;
  categorySlug: string;
  subcategorySlug: string;
  configuration: {
    [key: string]: string | number;
  };
  price: number;
  quantity: number;
  thumbnail?: string;
  files?: CartFile[];
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  getTotalPages: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sanjari_cart");
      try {
        return saved ? JSON.parse(saved) : [];
      } catch (e) {
        console.error("Failed to parse cart", e);
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem("sanjari_cart", JSON.stringify(items));
  }, [items]);

  const addToCart = (item: CartItem) => {
    setItems((prevItems) => {
      // Check if item with same configuration already exists
      const existingItemIndex = prevItems.findIndex(
        (i) =>
          i.productName === item.productName &&
          JSON.stringify(i.configuration) === JSON.stringify(item.configuration)
      );

      if (existingItemIndex > -1) {
        // Update quantity of existing item
        const newItems = [...prevItems];
        newItems[existingItemIndex].quantity += item.quantity;
        return newItems;
      }

      // Add new item
      return [...prevItems, item];
    });
  };

  const removeFromCart = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getCartTotal = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  const getTotalPages = () => {
    return items.reduce((total, item) => {
      if (item.files && item.files.length > 0) {
        return total + item.files.reduce((sum, file) => sum + file.pagesToPrint, 0);
      }
      // Fall back to configuration pages if no files
      const configPages = item.configuration.pages || item.configuration.quantity || 1;
      return total + configPages;
    }, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        getTotalPages,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
