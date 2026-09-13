import {
  HashRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { HomePage } from "./pages/HomePage";
import { AllProductsPage } from "./pages/AllProductsPage";
import { PriceCalculatorPage } from "./pages/PriceCalculatorPage";
import { BulkOrderPage } from "./pages/BulkOrderPage";
import { TrackOrderPage } from "./pages/TrackOrderPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { ProductConfigurationPage } from "./pages/ProductConfigurationPage";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { AboutPage } from "./pages/AboutPage";
import { HowItWorksPage } from "./pages/HowItWorksPage";
import { ContactPage } from "./pages/ContactPage";
import { TermsPage } from "./pages/TermsPage";
import { FAQsPage } from "./pages/FAQsPage";
import { PrivacyPolicyPage } from "./pages/PrivacyPolicyPage";
import { ShippingPolicyPage } from "./pages/ShippingPolicyPage";
import { CancellationPolicyPage } from "./pages/CancellationPolicyPage";
import { PaymentTermsPage } from "./pages/PaymentTermsPage";
import { OffersPage } from "./pages/OffersPage";
import { SitemapPage } from "./pages/SitemapPage";
import { CareerPage } from "./pages/CareerPage";
import { GenericPage } from "./pages/GenericPage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { VerifyEmailPage } from "./pages/VerifyEmailPage";
import { AuthCallbackPage } from "./pages/AuthCallbackPage";
import { Toaster } from "./components/ui/sonner";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContextSupabase";
import { AdminProvider } from "./context/AdminContext";
import { UserDashboardPage } from "./pages/UserDashboardPage";
import { AdminLoginPage } from "./pages/AdminLoginPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";

export default function App() {
  // Redirect server-side /checkout redirects (e.g. from payment gateway) to HashRouter
  if (typeof window !== "undefined" && window.location.pathname === "/checkout") {
    const search = window.location.search;
    window.location.replace(window.location.origin + "/#/checkout" + search);
    return null;
  }

  return (
    <Router>
      <AuthProvider>
        <AdminProvider>
          <CartProvider>
            <div className="min-h-screen flex flex-col">
              <Toaster position="top-right" />
              <Routes>
                {/* Admin Routes - No Navbar/Footer */}
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                
                {/* Regular Routes with Navbar/Footer */}
                <Route path="/*" element={
                  <>
                    <Navbar />
                    <main className="flex-grow">
                      <Routes>
                        <Route path="/" element={<HomePage />} />
                        
                        {/* Auth Pages */}
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/signup" element={<SignupPage />} />
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                        <Route path="/verify-email" element={<VerifyEmailPage />} />
                        <Route path="/auth/callback" element={<AuthCallbackPage />} />
                        <Route path="/dashboard" element={<UserDashboardPage />} />
              
              {/* Product & Cart Pages */}
              <Route path="/all-products" element={<AllProductsPage />} />
              <Route path="/products/:categorySlug" element={<AllProductsPage />} />
              <Route path="/product/:productSlug" element={<ProductDetailPage />} />
              <Route path="/products/:categorySlug/:productSlug" element={<ProductDetailPage />} />
              <Route path="/configure/:categorySlug/:subcategorySlug" element={<ProductConfigurationPage />} />
              <Route path="/order" element={<CheckoutPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/price-calculator" element={<PriceCalculatorPage />} />
              <Route path="/bulk-order" element={<BulkOrderPage />} />
              <Route path="/track-order" element={<TrackOrderPage />} />
            
            {/* Company Pages */}
            <Route path="/about" element={<AboutPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/sitemap" element={<SitemapPage />} />
            <Route path="/offers" element={<OffersPage />} />
            <Route path="/career" element={<CareerPage />} />
            
            {/* Help Pages */}
            <Route path="/faqs" element={<FAQsPage />} />
            <Route path="/order-by-email" element={
              <GenericPage 
                title="Order By Email" 
                subtitle="Send us your requirements and we'll handle the rest"
                content="You can also place orders via email. Simply send your file along with your requirements (paper type, quantity, binding, etc.) to sanjariprint@gmail.com. Include your delivery address and contact details. Our team will review your request, send you a quote, and process your order upon confirmation."
              />
            } />
            <Route path="/press" element={
              <GenericPage 
                title="Press & Media" 
                subtitle="Latest news and media coverage"
                content="For press inquiries, media coverage, or partnership opportunities, please contact our media relations team at sanjariprint@gmail.com. We're happy to provide information about our services, company updates, and industry insights."
              />
            } />
            <Route path="/why-choose" element={
              <GenericPage 
                title="Why Choose Sanjari prints?" 
                subtitle="Quality, reliability, and exceptional service"
                content="With over 15 years of experience, state-of-the-art printing technology, competitive pricing, fast turnaround times, and exceptional customer service, Sanjari prints is your trusted printing partner. We're committed to delivering high-quality prints that exceed your expectations, every single time."
              />
            } />
            <Route path="/partner" element={
              <GenericPage 
                title="Partner With Us" 
                subtitle="Join our network of successful partners"
                content="We're always looking for strategic partners, resellers, and affiliates to join our growing network. Whether you're a design agency, educational institution, or business looking to offer printing services, we have partnership programs tailored to your needs. Contact us at sanjariprint@gmail.com to explore partnership opportunities."
              />
            } />
            <Route path="/print-your-file" element={
              <GenericPage 
                title="Print Your File" 
                subtitle="Easy, fast, and reliable printing"
                content="Upload your file, choose your specifications, and we'll take care of the rest. Our simple online ordering system makes it easy to get professional prints delivered to your doorstep. Support for all major file formats with instant preview and real-time pricing."
              />
            } />
            <Route path="/printonweb-service" element={
              <GenericPage 
                title="Printonweb Service" 
                subtitle="Professional online printing made easy"
                content="Our Printonweb Service offers a complete online printing solution with advanced features including bulk upload, template management, order tracking, and dedicated account management. Perfect for businesses and organizations with regular printing needs."
              />
            } />
            <Route path="/payment-options" element={
              <GenericPage 
                title="Payment Options" 
                subtitle="Flexible and secure payment methods"
                content="We accept UPI, credit/debit cards (Visa, Mastercard, RuPay), net banking, and digital wallets through our secure payment gateway powered by Razorpay. All transactions are encrypted and protected. For bulk orders, we also offer invoice-based payments for verified corporate clients. Contact us at sanjariprint@gmail.com for more information."
              />
            } />
            
                        {/* Policy Pages */}
                        <Route path="/terms" element={<TermsPage />} />
                        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                        <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
                        <Route path="/cancellation-policy" element={<CancellationPolicyPage />} />
                        <Route path="/payment-terms" element={<PaymentTermsPage />} />
                      </Routes>
                    </main>
                    <Footer />
                  </>
                } />
              </Routes>
            </div>
          </CartProvider>
        </AdminProvider>
      </AuthProvider>
    </Router>
  );
}
