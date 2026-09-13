import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { ArrowRight, Check, Star, Heart, ShoppingCart, Truck, Shield, Clock, ChevronRight } from "lucide-react";
import { categories } from "../data/categories";
import { getAIGeneratedProductImageUrl } from "../lib/aiProductImages";
import { buildCheckoutProductState } from "../lib/checkoutNavigation";

export function ProductDetailPage() {
  const { productSlug, categorySlug } = useParams<{ productSlug?: string; categorySlug?: string }>();
  const [activeTab, setActiveTab] = useState("description");
  const [isWishlisted, setIsWishlisted] = useState(false);

  let currentProduct: { name: string; slug: string; description?: string; image?: string } | null = null;
  let currentCategory: { name: string; slug: string } | null = null;

  if (categorySlug) {
    const matchedCategory = categories.find((c) => c.slug === categorySlug);
    if (matchedCategory) {
      const product = matchedCategory.subcategories.find((sub) => sub.slug === productSlug);
      if (product) {
        currentProduct = product;
        currentCategory = matchedCategory;
      }
    }
  }

  if (!currentProduct) {
    for (const category of categories) {
      const product = category.subcategories.find((sub) => sub.slug === productSlug);
      if (product) {
        currentProduct = product;
        currentCategory = category;
        break;
      }
    }
  }

  if (!currentProduct) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
          <Link to="/all-products">
            <Button className="bg-purple-600 hover:bg-purple-700">Back to All Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  const relatedProducts = currentCategory?.subcategories.filter(
    (sub) => sub.slug !== productSlug
  ) || [];

  const tabs = [
    { id: "description", label: "Description" },
    { id: "papers", label: "Available Papers" },
    { id: "sizes", label: "Sizes" },
    { id: "binding", label: "Binding Options" },
  ];

  const checkoutState = buildCheckoutProductState({
    categorySlug: currentCategory!.slug,
    subcategorySlug: currentProduct.slug,
    categoryName: currentCategory!.name,
    productName: currentProduct.name,
    productImage: currentProduct.image,
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-0">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link to="/" className="hover:text-purple-600">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/all-products" className="hover:text-purple-600">Products</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to={`/products/${currentCategory?.slug}`} className="hover:text-purple-600">{currentCategory?.name}</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">{currentProduct.name}</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-white py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Product Image */}
            <div className="relative">
              <div className="relative aspect-square bg-gradient-to-br from-purple-100 to-purple-50 rounded-2xl overflow-hidden flex items-center justify-center">
                <ImageWithFallback
                  src={currentProduct.image || getAIGeneratedProductImageUrl(currentProduct.name, currentCategory?.name || "Printing")}
                  alt={`Image for ${currentProduct.name}`}
                  className="w-full h-full object-cover"
                />
                {!currentProduct.image && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-8xl font-bold text-purple-200/50">{currentProduct.name.charAt(0)}</span>
                  </div>
                )}
              </div>
              <button
                className={`absolute top-4 right-4 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center transition-all hover:scale-110 ${isWishlisted ? 'text-red-500' : 'text-gray-400'}`}
                onClick={() => setIsWishlisted(!isWishlisted)}
              >
                <Heart className={`w-6 h-6 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
              <div className="absolute top-4 left-4">
                <span className="mlc-badge mlc-badge-accent">Popular</span>
              </div>
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <span className="mlc-badge bg-purple-100 text-purple-700 text-xs">{currentCategory?.name}</span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">{currentProduct.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-sm text-gray-500">4.8 (324 reviews)</span>
              </div>

              <p className="text-gray-600 mb-6 leading-relaxed">
                Professional {currentProduct.name.toLowerCase()} services with premium quality materials, fast turnaround times, and competitive pricing. Perfect for business cards, presentations, and marketing materials.
              </p>

              <div className="mb-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/checkout"
                  state={checkoutState}
                  className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl px-5 text-base font-extrabold text-white shadow-lg transition hover:shadow-xl"
                  style={{ background: "#6d28d9", boxShadow: "0 14px 28px rgba(109, 40, 217, 0.25)" }}
                >
                  <ShoppingCart className="h-5 w-5" />
                    Order Now
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  to="/price-calculator"
                  className="flex h-14 items-center justify-center rounded-2xl border px-6 text-base font-extrabold transition sm:w-auto"
                  style={{ background: "#ffffff", borderColor: "#ddd6fe", color: "#6d28d9" }}
                >
                  Calculate Price
                </Link>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Turnaround</p>
                    <p className="text-sm font-semibold text-gray-900">24-48 Hours</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <Truck className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Free Delivery</p>
                    <p className="text-sm font-semibold text-gray-900">Orders ₹500+</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Quality</p>
                    <p className="text-sm font-semibold text-gray-900">Premium Paper</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <Check className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Support</p>
                    <p className="text-sm font-semibold text-gray-900">24/7 Available</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Details Tabs */}
      <section className="py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="mlc-tabs mb-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={`mlc-tab ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <Card className="p-6 lg:p-8">
                {activeTab === "description" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">About This Product</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Professional printing services for {currentProduct.name.toLowerCase()}. We use premium quality materials and state-of-the-art equipment to ensure your prints look their best. Whether you need a single copy or bulk orders, we've got you covered with competitive pricing and fast turnaround.
                      </p>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {[
                        "Premium quality materials",
                        "Vibrant color printing",
                        "Fast turnaround time",
                        "Competitive pricing",
                        "Free shipping on ₹500+",
                        "100% satisfaction guarantee"
                      ].map((feature, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                            <Check className="w-4 h-4 text-green-600" />
                          </div>
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "papers" && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Available Paper Types</h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {[
                        "Economy White Paper (75gsm)",
                        "Premium White Paper (75gsm)",
                        "Bond Paper (80gsm)",
                        "Duo White Paper (100gsm)",
                        "Glossy White Paper (100gsm)",
                        "Matt White Paper (100gsm)"
                      ].map((paper, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                            <span className="text-purple-600 text-xs font-bold">P{i + 1}</span>
                          </div>
                          <span className="text-sm text-gray-700">{paper}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "sizes" && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Available Sizes</h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {[
                        { size: "A3", dims: "297 × 420 mm" },
                        { size: "A4", dims: "210 × 297 mm" },
                        { size: "A5", dims: "148 × 210 mm" },
                        { size: "B5", dims: "176 × 250 mm" }
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                            <span className="text-purple-600 font-bold">{item.size}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{item.size} Size</p>
                            <p className="text-xs text-gray-500">{item.dims}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "binding" && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Binding Options</h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {[
                        "Corner Staple",
                        "Staple",
                        "Saddle Stitch",
                        "Hard Binding",
                        "Hard Binding with Golden Print",
                        "Soft Cover / Perfect Binding",
                        "Glue Binding / Tape Binding"
                      ].map((binding, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                            <span className="text-purple-600 text-xs font-bold">B{i + 1}</span>
                          </div>
                          <span className="text-sm text-gray-700">{binding}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Card className="p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Products</h3>
                  <div className="space-y-3">
                    {relatedProducts.slice(0, 6).map((product) => (
                      <Link
                        key={product.slug}
                        to={`/product/${product.slug}`}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 transition-colors group"
                      >
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-purple-600 font-bold text-sm">{product.name.charAt(0)}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate group-hover:text-purple-600">{product.name}</p>
                          <p className="text-xs text-purple-600 font-medium">Premium Quality</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
                      </Link>
                    ))}
                  </div>
                  <Link to={`/products/${currentCategory?.slug}`} className="block mt-4">
                    <Button variant="outline" className="w-full border-purple-200 text-purple-600">
                      View All in {currentCategory?.name}
                    </Button>
                  </Link>
                </Card>

                {/* Help Card */}
                <Card className="p-6 bg-gradient-to-br from-purple-600 to-purple-700 text-white">
                  <h3 className="text-lg font-semibold mb-2">Need Help?</h3>
                  <p className="text-purple-100 text-sm mb-4">Our team is available 24/7 to assist you with your order.</p>
                  <Link to="/contact" className="block">
                    <Button className="w-full bg-white text-purple-700 hover:bg-purple-50">
                      Contact Support
                    </Button>
                  </Link>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-purple-100 bg-white/95 p-3 shadow-[0_-10px_28px_rgba(88,28,135,0.16)] backdrop-blur-lg md:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold uppercase tracking-wide text-purple-700">{currentCategory?.name}</p>
            <p className="truncate text-sm font-extrabold text-gray-950">{currentProduct.name}</p>
          </div>
          <Link
            to="/checkout"
            state={checkoutState}
            className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-extrabold text-white shadow-lg"
            style={{ background: "#6d28d9", boxShadow: "0 12px 24px rgba(109, 40, 217, 0.25)" }}
          >
            Order Now
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
