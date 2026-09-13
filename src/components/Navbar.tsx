import {
  Menu,
  ShoppingCart,
  User,
  X,
  ChevronDown,
  LogOut,
  Package,
  UserCircle,
  Phone,
  Mail,
  Calculator,
  Truck,
} from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { categories } from "../data/categories";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContextSupabase";
import { useAdmin } from "../context/AdminContext";
import { toast } from "sonner@2.0.3";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { getCartCount } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const { siteSettings } = useAdmin();
  const cartCount = getCartCount();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const isActive = (path: string) => location.pathname === path;

  // Main nav links matching the reference design
  const navLinks = [
    { label: "Documents Printing", path: "/products/documents" },
    { label: "Poster Printing", path: "/products/posters" },
    { label: "Brochure Printing", path: "/products/brochures" },
    { label: "Our Services", path: "/all-products" },
  ];

  return (
    <nav className="sticky top-0 z-50" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* ── Top Utility Bar ── */}
      <div style={{ background: "linear-gradient(90deg, #111111 0%, #1f1630 100%)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3" style={{ minHeight: "42px" }}>
            {/* Left: Utility links */}
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <Link
                to="/price-calculator"
                className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-white shadow-sm transition-colors hover:bg-white/25"
                style={{ fontSize: "12px" }}
              >
                <Calculator className="w-3.5 h-3.5 text-white" />
                <span className="font-semibold whitespace-nowrap">Price Calculator</span>
              </Link>
              <a
                href="tel:+919323684301"
                className="flex items-center gap-1.5 rounded-full border border-white/25 bg-white px-3 py-1.5 text-gray-950 shadow-sm transition-colors hover:bg-purple-50"
                style={{ fontSize: "12px" }}
              >
                <Phone className="w-3.5 h-3.5 text-purple-700" />
                <span className="font-semibold whitespace-nowrap">+91 9323684301</span>
              </a>
              <a
                href="mailto:mail@sanjariprint.in"
                className="hidden lg:flex items-center gap-1.5 rounded-full px-3 py-1.5 text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
                style={{ fontSize: "12px" }}
              >
                <Mail className="w-3.5 h-3.5" />
                <span className="whitespace-nowrap">mail@sanjariprint.in</span>
              </a>
            </div>

            {/* Right: Track Order */}
            <Link
              to="/track-order"
              className="hidden sm:flex items-center gap-1.5 rounded-full px-3 py-1.5 text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
              style={{ fontSize: "12px" }}
            >
              <Truck className="w-3.5 h-3.5" />
              <span className="whitespace-nowrap">Track Order</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Main Header ── */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between" style={{ height: "64px" }}>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0" aria-label={`${siteSettings.siteName} home`}>
              <div className="flex items-center gap-2">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)" }}
                >
                  <span className="text-white font-bold text-lg">
                    {siteSettings.siteName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-xl font-bold text-gray-900 whitespace-nowrap">
                  {siteSettings.siteName}
                </span>
              </div>
            </Link>

            {/* Centre Nav Links – Desktop */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="px-4 py-2 rounded-md transition-colors whitespace-nowrap"
                  style={{
                    fontSize: "14px",
                    fontWeight: isActive(link.path) ? 600 : 500,
                    color: isActive(link.path) ? "var(--brand)" : "#374151",
                  }}
                  onMouseEnter={(e) => { (e.target as HTMLElement).style.color = "var(--brand)"; }}
                  onMouseLeave={(e) => { (e.target as HTMLElement).style.color = isActive(link.path) ? "var(--brand)" : "#374151"; }}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Bulk Order Button */}
              <Link to="/bulk-order" className="hidden sm:block">
                <button
                  className="px-4 py-1.5 rounded-md font-semibold transition-all"
                  style={{
                    fontSize: "13px",
                    border: "2px solid var(--brand)",
                    color: "var(--brand)",
                    background: "transparent",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    const btn = e.currentTarget;
                    btn.style.background = "var(--brand)";
                    btn.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    const btn = e.currentTarget;
                    btn.style.background = "transparent";
                    btn.style.color = "var(--brand)";
                  }}
                >
                  Bulk Order
                </button>
              </Link>

            <Link
              to="/track-order"
              className="flex shrink-0 items-center gap-1.5 rounded-md border border-purple-200 bg-purple-50 px-2.5 py-1.5 font-semibold text-purple-700 transition-colors hover:bg-purple-100"
              style={{ fontSize: "12px" }}
            >
              <Truck className="w-4 h-4" />
              <span className="whitespace-nowrap">Track</span>
            </Link>

              {/* Cart */}
              <Link
                to="/cart"
                className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors"
              >
                <ShoppingCart className="w-5 h-5 text-gray-700" />
                <span style={{ fontSize: "13px", fontWeight: 500, color: "#374151" }}>
                  Cart
                </span>
                <span
                  className="flex items-center justify-center rounded-full text-white font-bold"
                  style={{
                    minWidth: "20px",
                    height: "20px",
                    fontSize: "11px",
                    background: "var(--brand)",
                    padding: "0 5px",
                  }}
                >
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              </Link>

              {/* User Menu */}
              {isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-gray-50 transition-colors"
                      style={{ border: "none", background: "transparent", cursor: "pointer" }}
                    >
                      <Avatar
                        className="w-7 h-7 rounded-full"
                        style={{ background: "linear-gradient(135deg, var(--brand) 0%, #f39c12 100%)" }}
                      >
                        <AvatarFallback className="text-white" style={{ fontSize: "11px" }}>
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span
                        className="hidden md:block max-w-[90px] truncate"
                        style={{ fontSize: "13px", fontWeight: 500, color: "#374151" }}
                      >
                        {user.name.split(" ")[0]}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-60 bg-white border border-gray-100 shadow-xl rounded-xl">
                    <DropdownMenuLabel className="bg-gray-50 rounded-t-xl px-4 py-3">
                      <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-gray-100" />
                    <DropdownMenuItem
                      onClick={() => navigate("/dashboard?tab=profile")}
                      className="px-4 py-3 hover:bg-orange-50 cursor-pointer"
                    >
                      <UserCircle className="w-4 h-4 mr-3" style={{ color: "var(--brand)" }} />
                      <span className="text-sm font-medium">My Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigate("/dashboard?tab=orders")}
                      className="px-4 py-3 hover:bg-orange-50 cursor-pointer"
                    >
                      <Package className="w-4 h-4 mr-3" style={{ color: "var(--brand)" }} />
                      <span className="text-sm font-medium">My Orders</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-100" />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="px-4 py-3 hover:bg-red-50 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 mr-3 text-red-500" />
                      <span className="text-sm font-medium text-red-500">Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link to="/login">
                    <button
                      className="px-4 py-1.5 rounded-md font-medium transition-colors"
                      style={{ fontSize: "13px", color: "#374151", border: "1px solid #d1d5db", background: "transparent", cursor: "pointer" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#f9fafb"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    >
                      Sign In
                    </button>
                  </Link>
                  <Link to="/signup">
                    <button
                      className="px-4 py-1.5 rounded-md font-semibold text-white transition-colors"
                      style={{ fontSize: "13px", background: "var(--brand)", border: "none", cursor: "pointer" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--brand-dark)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--brand)"; }}
                    >
                      Sign Up
                    </button>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                className="lg:hidden p-2 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Category Pill Bar ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 py-2 overflow-x-auto scrollbar-hide">
            <Link
              to="/all-products"
              className={`mlc-pill whitespace-nowrap ${isActive("/all-products") ? "active" : ""}`}
            >
              All Categories
            </Link>
            {categories.slice(0, 10).map((cat) => (
              <Link
                key={cat.slug}
                to={`/products/${cat.slug}`}
                className={`mlc-pill whitespace-nowrap ${isActive(`/products/${cat.slug}`) ? "active" : ""}`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-lg hover:bg-orange-50 transition-colors"
                style={{ fontSize: "14px", fontWeight: 500, color: "#374151" }}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/bulk-order"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg font-semibold"
              style={{ fontSize: "14px", color: "var(--brand)" }}
            >
              Bulk Order
            </Link>
            <Link
              to="/track-order"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-orange-50 transition-colors"
              style={{ fontSize: "14px", fontWeight: 600, color: "#374151" }}
            >
              <Truck className="w-4 h-4" style={{ color: "var(--brand)" }} />
              Track Order
            </Link>

            {/* Mobile Categories */}
            <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  to={`/products/${cat.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="mlc-pill text-sm"
                >
                  {cat.name}
                </Link>
              ))}
            </div>

            {/* Mobile Auth */}
            {!isAuthenticated && (
              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <Link to="/login" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">Sign In</Button>
                </Link>
                <Link to="/signup" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full text-white" style={{ background: "var(--brand)" }}>Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
