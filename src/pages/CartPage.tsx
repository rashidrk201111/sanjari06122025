import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { useCart } from "../context/CartContext";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, FileText } from "lucide-react";

export function CartPage() {
  const navigate = useNavigate();
  const { items, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-gray-100 flex items-center justify-center py-16 px-4">
        <div className="max-w-md mx-auto text-center bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-indigo-50 flex items-center justify-center">
            <ShoppingBag className="w-10 h-10 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Your Cart is Empty</h1>
          <p className="text-gray-500 mb-8 text-sm">Upload documents and place your order from checkout — same flow for every product.</p>
          <Button onClick={() => navigate("/checkout")} size="lg" className="bg-indigo-600 hover:bg-indigo-700 rounded-xl mr-2">
            Go to Checkout
          </Button>
          <Button onClick={() => navigate("/all-products")} variant="outline" size="lg" className="rounded-xl">
            Browse Products
          </Button>
        </div>
      </div>
    );
  }

  const subtotal = getCartTotal();
  const shipping = subtotal >= 500 ? 0 : 50;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-gray-100 pb-28">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center shadow-md shadow-indigo-200">
            <ShoppingBag className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-base">Your Cart</h1>
            <p className="text-xs text-gray-500">{items.length} item(s) · Continue to checkout to upload & pay</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs text-gray-500">Total</p>
            <p className="font-bold text-indigo-700 text-lg">₹{total.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-3 py-5 flex flex-col lg:flex-row gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex justify-end">
            <Button variant="outline" onClick={clearCart} className="text-red-500 border-red-200 hover:bg-red-50 rounded-xl text-sm">
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>

          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <div className="flex gap-4">
                <div className="w-16 h-16 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-7 h-7 text-indigo-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">{item.productName}</h3>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {Object.entries(item.configuration).map(([key, value]) => {
                      if (value && value !== "none" && !key.includes("autoDetectedPages")) {
                        const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());
                        return (
                          <span key={key} className="px-2 py-0.5 bg-gray-100 rounded-full text-[11px] text-gray-600">
                            {label}: {String(value)}
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>
                  {item.files && item.files.length > 0 && (
                    <div className="mb-3 p-2 bg-indigo-50 rounded-lg text-xs text-indigo-700">
                      {item.files.length} file(s) · {item.files.reduce((sum, f) => sum + f.pagesToPrint, 0)} pages
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-indigo-50"
                      >
                        <Minus className="w-4 h-4 text-gray-600" />
                      </button>
                      <span className="w-10 text-center font-medium text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-indigo-50"
                      >
                        <Plus className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                    <p className="font-bold text-gray-900">₹{item.price * item.quantity}</p>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:w-72 shrink-0">
          <div className="sticky top-16 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gray-900 text-white px-4 py-3">
              <span className="font-bold text-sm tracking-widest uppercase">Order Summary</span>
            </div>
            <div className="p-4 space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className={shipping === 0 ? "font-semibold text-emerald-600" : "font-medium text-gray-900"}>
                  {shipping === 0 ? "FREE" : `₹${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="border-t-2 border-gray-900 pt-3 flex justify-between items-center">
                <span className="font-bold text-gray-900">Total</span>
                <span className="font-bold text-xl text-gray-900">₹{total.toFixed(2)}</span>
              </div>
            </div>
            <div className="px-4 pb-4 space-y-2">
              {[["🚚", "Free shipping above ₹500"], ["🔒", "Secure PhonePe checkout"], ["⚡", "Fast processing"]].map(([icon, text]) => (
                <div key={text} className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{icon}</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 inset-x-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur-md shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="hidden sm:block flex-1">
            <p className="text-xs text-gray-500">Ready to complete your order?</p>
            <p className="text-sm font-medium text-gray-800">Upload files, set print options & pay on checkout</p>
          </div>
          <div className="sm:hidden flex-1">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-lg font-bold text-indigo-700">₹{total.toFixed(2)}</p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/checkout")}
            className="shrink-0 h-12 px-6 sm:px-8 rounded-xl text-white font-bold text-sm sm:text-base bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:via-purple-700 hover:to-indigo-800 shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
          >
            Proceed to Checkout
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
