import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import { Textarea } from "../components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Checkbox } from "../components/ui/checkbox";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContextSupabase";
import { 
  ArrowLeft, 
  IndianRupee, 
  ShoppingBag, 
  MapPin, 
  User, 
  Mail, 
  Phone,
  CheckCircle2,
  CreditCard,
  Wallet,
  Building2,
  LogIn,
  Loader2
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { projectId, publicAnonKey } from "../utils/supabase/info";

// Declare Razorpay on window object
declare global {
  interface Window {
    Razorpay: any;
  }
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, getCartTotal, clearCart } = useCart();
  const { addOrder, user, isAuthenticated } = useAuth();
  const [step, setStep] = useState<"address" | "payment" | "confirmation">("address");
  const [orderNumber, setOrderNumber] = useState("");
  const [processing, setProcessing] = useState(false);
  const [paymentSettings, setPaymentSettings] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
    saveAddress: false,
  });

  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "phonepe" | "cod">("razorpay");

  // Load Razorpay SDK
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Set payment settings to only show PhonePe
  useEffect(() => {
    console.log("Setting up payment settings...");
    
    // Always use these settings regardless of database
    const phonepeSettings = {
      razorpay: { 
        enabled: false,  // Disable Razorpay
        key: '', 
        testMode: true 
      },
      phonepe: { 
        enabled: true,   // Always enable PhonePe
        merchantId: 'PGTESTPAYUAT',
        testMode: true 
      },
      codEnabled: true,  // Keep COD enabled
      testMode: true
    };

    console.log("Payment settings:", phonepeSettings);
    setPaymentSettings(phonepeSettings);
    setPaymentMethod("phonepe"); // Set PhonePe as default payment method
  }, []);

  // Update form data when user logs in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.name || prev.fullName,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  // Check if cart is empty
  if (items.length === 0 && step !== "confirmation") {
    navigate("/cart");
    return null;
  }

  const subtotal = getCartTotal();
  const gst = Math.round(subtotal * 0.18);
  const shipping = subtotal >= 500 ? 0 : 50;
  const total = subtotal + gst + shipping;

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.fullName.trim()) {
      toast.error("Please enter your full name");
      return;
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (!formData.phone.trim() || !/^[0-9]{10}$/.test(formData.phone)) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }
    if (!formData.address.trim()) {
      toast.error("Please enter your address");
      return;
    }
    if (!formData.city.trim()) {
      toast.error("Please enter your city");
      return;
    }
    if (!formData.state.trim()) {
      toast.error("Please enter your state");
      return;
    }
    if (!formData.pincode.trim() || !/^[0-9]{6}$/.test(formData.pincode)) {
      toast.error("Please enter a valid 6-digit pincode");
      return;
    }

    setStep("payment");
  };

  const saveOrder = async (orderNum: string, paymentId?: string, paymentStatus: string = "processing") => {
    // Calculate estimated delivery date (3-5 days from now)
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + 4);
    const estimatedDelivery = estimatedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    // Create order object
    const order = {
      id: "order_" + Date.now(),
      orderNumber: orderNum,
      date: new Date().toISOString(),
      status: paymentStatus as const,
      items: [...items],
      subtotal,
      gst,
      shipping,
      total,
      deliveryAddress: {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        landmark: formData.landmark,
      },
      paymentMethod: paymentMethod === "razorpay" ? "Razorpay" : 
                    paymentMethod === "phonepe" ? "PhonePe" : "Cash on Delivery",
      paymentId: paymentId || "",
      estimatedDelivery,
    };

    // Save order to database
    const result = await addOrder(order);
    
    if (result.success) {
      if (isAuthenticated) {
        setTimeout(() => {
          toast.info("Order saved to your account! View it in your dashboard.");
        }, 1500);
      }
      
      setStep("confirmation");
      setTimeout(() => {
        clearCart();
      }, 1000);
      
      return true;
    } else {
      toast.error(result.error || "Failed to save order. Please try again.");
      return false;
    }
  };

  const handleRazorpayPayment = async (orderNum: string) => {
    try {
      // Create Razorpay order
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a145b27b/create-razorpay-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            amount: total,
            currency: "INR",
            receipt: orderNum,
            notes: {
              customerName: formData.fullName,
              customerEmail: formData.email,
            },
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to create Razorpay order");
      }

      const { orderId, keyId } = await response.json();

      // Initialize Razorpay checkout
      const options = {
        key: keyId,
        amount: total * 100,
        currency: "INR",
        name: "Sanjari Prints",
        description: `Order #${orderNum}`,
        order_id: orderId,
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: "#2563eb",
        },
        handler: async function (response: any) {
          // Verify payment
          const verifyResponse = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-a145b27b/verify-razorpay-payment`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${publicAnonKey}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            }
          );

          const verifyData = await verifyResponse.json();

          if (verifyData.verified) {
            toast.success("Payment successful!");
            await saveOrder(orderNum, response.razorpay_payment_id, "processing");
          } else {
            toast.error("Payment verification failed");
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
            toast.info("Payment cancelled");
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Razorpay payment error:", error);
      toast.error("Failed to initialize payment. Please try again.");
      setProcessing(false);
    }
  };

  const handlePhonePePayment = async (orderNum: string) => {
    try {
      const merchantTransactionId = `TXN_${orderNum}_${Date.now()}`;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a145b27b/create-phonepe-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            amount: total,
            merchantTransactionId: merchantTransactionId,
            merchantUserId: user?.id || `guest_${Date.now()}`,
            redirectUrl: `${window.location.origin}/checkout?order=${orderNum}`,
            callbackUrl: `https://${projectId}.supabase.co/functions/v1/make-server-a145b27b/phonepe-callback`,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to create PhonePe payment");
      }

      const { redirectUrl } = await response.json();

      // Save order with pending status
      await saveOrder(orderNum, merchantTransactionId, "pending");

      // Redirect to PhonePe payment page
      window.location.href = redirectUrl;
    } catch (error) {
      console.error("PhonePe payment error:", error);
      toast.error("Failed to initialize payment. Please try again.");
      setProcessing(false);
    }
  };

  const handleCODPayment = async (orderNum: string) => {
    toast.success("Order placed successfully!");
    await saveOrder(orderNum, undefined, "pending");
  };

  const handlePayment = async () => {
    if (processing) return;

    setProcessing(true);
    const orderNum = "SPR" + Date.now().toString().slice(-8);
    setOrderNumber(orderNum);

    try {
      if (paymentMethod === "razorpay") {
        if (!paymentSettings?.razorpay?.enabled) {
          toast.error("Razorpay is not enabled. Please choose another payment method.");
          setProcessing(false);
          return;
        }
        await handleRazorpayPayment(orderNum);
      } else if (paymentMethod === "phonepe") {
        if (!paymentSettings?.phonepe?.enabled) {
          toast.error("PhonePe is not enabled. Please choose another payment method.");
          setProcessing(false);
          return;
        }
        await handlePhonePePayment(orderNum);
      } else if (paymentMethod === "cod") {
        if (!paymentSettings?.codEnabled) {
          toast.error("Cash on Delivery is not enabled. Please choose another payment method.");
          setProcessing(false);
          return;
        }
        await handleCODPayment(orderNum);
        setProcessing(false);
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("An error occurred while processing your payment.");
      setProcessing(false);
    }
  };

  // Confirmation Page
  if (step === "confirmation") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-6 inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          
          <h1 className="text-3xl text-gray-900 mb-4">Order Placed Successfully!</h1>
          <p className="text-gray-600 mb-2">
            Thank you for your order. We've received your order and will start processing it soon.
          </p>
          
          <Card className="p-6 my-8 text-left">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Order Number</p>
                <p className="text-xl text-gray-900">{orderNumber}</p>
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm text-gray-600 mb-2">Delivery Address</p>
                <p className="text-gray-900">{formData.fullName}</p>
                <p className="text-gray-600 text-sm">{formData.address}</p>
                <p className="text-gray-600 text-sm">
                  {formData.city}, {formData.state} - {formData.pincode}
                </p>
                <p className="text-gray-600 text-sm mt-2">Phone: {formData.phone}</p>
                <p className="text-gray-600 text-sm">Email: {formData.email}</p>
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm text-gray-600 mb-2">Order Summary</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="text-gray-900 flex items-center">
                      <IndianRupee className="w-3 h-3" />
                      {subtotal}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">GST (18%):</span>
                    <span className="text-gray-900 flex items-center">
                      <IndianRupee className="w-3 h-3" />
                      {gst}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="text-gray-900 flex items-center">
                      {shipping === 0 ? (
                        <span className="text-green-600">FREE</span>
                      ) : (
                        <>
                          <IndianRupee className="w-3 h-3" />
                          {shipping}
                        </>
                      )}
                    </span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between">
                    <span className="text-gray-900">Total Paid:</span>
                    <span className="text-xl text-green-600 flex items-center">
                      <IndianRupee className="w-5 h-5" />
                      {total}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-900">
              📧 Order confirmation will be sent to <strong>{formData.email}</strong>
            </p>
            <p className="text-sm text-blue-700 mt-1">
              Estimated delivery: 3-5 business days
            </p>
            <p className="text-xs text-blue-600 mt-2">
              💡 For order updates, please contact us at +91 7350001266 or sanjariprint@gmail.com
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate("/")} variant="outline" size="lg">
              Back to Home
            </Button>
            {isAuthenticated && (
              <Button onClick={() => navigate("/dashboard")} size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                <ShoppingBag className="w-5 h-5 mr-2" />
                View My Orders
              </Button>
            )}
            <Button onClick={() => navigate("/all-products")} size="lg" className="bg-blue-600 hover:bg-blue-700">
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Login Suggestion Banner */}
        {!isAuthenticated && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <LogIn className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-blue-900 mb-2">
                  <strong>Have an account?</strong> Login to auto-fill your details and track your order!
                </p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="border-blue-600 text-blue-600 hover:bg-blue-100"
                  onClick={() => navigate("/login", { state: { from: "/checkout" } })}
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Login to Continue
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Button variant="ghost" onClick={() => step === "payment" ? setStep("address") : navigate("/cart")}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl text-gray-900">Checkout</h1>
            <p className="text-gray-600">
              {step === "address" ? "Enter delivery details" : "Choose payment method"}
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            <div className={`flex items-center gap-2 ${step === "address" ? "text-blue-600" : "text-green-600"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === "address" ? "bg-blue-600 text-white" : "bg-green-600 text-white"
              }`}>
                {step === "address" ? "1" : <CheckCircle2 className="w-5 h-5" />}
              </div>
              <span>Address</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center gap-2 ${step === "payment" ? "text-blue-600" : "text-gray-400"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === "payment" ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-600"
              }`}>
                2
              </div>
              <span>Payment</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Side - Form */}
          <div className="lg:col-span-2">
            {step === "address" ? (
              <Card className="p-6">
                <h2 className="text-xl text-gray-900 mb-6">Delivery Address</h2>
                <form onSubmit={handleAddressSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="fullName"
                          placeholder="Enter your full name"
                          className="pl-10"
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="10-digit mobile number"
                          className="pl-10"
                          maxLength={10}
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "") })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        className="pl-10"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Textarea
                        id="address"
                        placeholder="House No., Building Name, Street"
                        className="pl-10 min-h-20"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="landmark">Landmark (Optional)</Label>
                    <Input
                      id="landmark"
                      placeholder="Near landmark"
                      value={formData.landmark}
                      onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        placeholder="City"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        placeholder="State"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pincode">Pincode *</Label>
                      <Input
                        id="pincode"
                        placeholder="6-digit pincode"
                        maxLength={6}
                        value={formData.pincode}
                        onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, "") })}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox
                      id="saveAddress"
                      checked={formData.saveAddress}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, saveAddress: checked as boolean })
                      }
                    />
                    <label htmlFor="saveAddress" className="text-sm text-gray-700 cursor-pointer">
                      Save this address for future orders
                    </label>
                  </div>

                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
                    Continue to Payment
                  </Button>
                </form>
              </Card>
            ) : (
              <Card className="p-6">
                <h2 className="text-xl text-gray-900 mb-6">Payment Method</h2>
                
                <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                  <div className="space-y-3">
                    {/* PhonePe - Always shown */}
                    <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                      <RadioGroupItem value="phonepe" id="phonepe" checked={true} />
                      <Label htmlFor="phonepe" className="flex items-center gap-3 cursor-pointer flex-1">
                        <Wallet className="w-5 h-5 text-purple-600" />
                        <div>
                          <p className="text-gray-900">PhonePe</p>
                          <p className="text-sm text-gray-500">Pay using PhonePe UPI</p>
                        </div>
                      </Label>
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Test Mode</span>
                    </div>

                    {/* Cash on Delivery */}
                    <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod" className="flex items-center gap-3 cursor-pointer flex-1">
                        <IndianRupee className="w-5 h-5 text-orange-600" />
                        <div>
                          <p className="text-gray-900">Cash on Delivery</p>
                          <p className="text-sm text-gray-500">Pay when you receive</p>
                        </div>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-900">
                    🔒 Your payment information is secure and encrypted
                  </p>
                </div>

                <Button 
                  onClick={handlePayment} 
                  className="w-full mt-6 bg-green-600 hover:bg-green-700" 
                  size="lg"
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>Place Order & Pay ₹{total}</>
                  )}
                </Button>
              </Card>
            )}
          </div>

          {/* Right Side - Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
              <h2 className="text-xl text-gray-900 mb-4">Order Summary</h2>
              <Separator className="mb-4" />

              {/* Cart Items */}
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                      <ShoppingBag className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate">{item.productName}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <div className="flex items-center text-sm text-gray-900">
                      <IndianRupee className="w-3 h-3" />
                      {item.price * item.quantity}
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="mb-4" />

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="text-gray-900 flex items-center">
                    <IndianRupee className="w-3 h-3" />
                    {subtotal}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">GST (18%):</span>
                  <span className="text-gray-900 flex items-center">
                    <IndianRupee className="w-3 h-3" />
                    {gst}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping:</span>
                  <span className="text-gray-900 flex items-center">
                    {shipping === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      <>
                        <IndianRupee className="w-3 h-3" />
                        {shipping}
                      </>
                    )}
                  </span>
                </div>

                <Separator className="my-2" />

                <div className="flex justify-between">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-2xl text-blue-600 flex items-center">
                    <IndianRupee className="w-5 h-5" />
                    {total}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Secure Checkout</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Estimated delivery: 3-5 days</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
