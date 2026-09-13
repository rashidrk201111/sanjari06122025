import { useState, useMemo, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { categories } from "../data/categories";
import { Search, SlidersHorizontal, X, Heart, ShoppingCart, Star, ChevronRight } from "lucide-react";
import { getAIGeneratedProductImageUrl } from "../lib/aiProductImages";
import { buildCheckoutProductState } from "../lib/checkoutNavigation";

type ProductItem = {
  slug: string;
  name: string;
  categoryName: string;
  categorySlug: string;
  description?: string;
  startingPrice?: number;
  rating?: string;
  reviewCount?: number;
  image?: string;
};

const allProducts = categories.flatMap((category) =>
  category.subcategories.map((sub) => ({
    ...sub,
    categoryName: category.name,
    categorySlug: category.slug,
    startingPrice: Math.floor(Math.random() * 500) + 99,
    rating: (Math.random() * 2 + 3).toFixed(1),
    reviewCount: Math.floor(Math.random() * 200) + 10,
  }))
);

function MLCProductCard({ product }: { product: ProductItem }) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  return (
    <div className="mlc-product-card group">
      {/* Wishlist Button */}
      <button
        className={`wishlist-btn ${isWishlisted ? 'favorited' : ''}`}
        onClick={(e) => {
          e.preventDefault();
          setIsWishlisted(!isWishlisted);
        }}
      >
        <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-brand text-brand' : 'text-gray-400'}`}
          style={isWishlisted ? { color: 'var(--brand)', fill: 'var(--brand)' } : {}}
        />
      </button>

      {/* Product Image */}
      <Link to={`/product/${product.slug}`}>
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          <ImageWithFallback
            src={product.image || getAIGeneratedProductImageUrl(product.name, product.categoryName)}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4">
        <Link to={`/product/${product.slug}`}>
          <h3
            className="text-sm font-semibold text-gray-900 line-clamp-2 transition-colors"
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--brand)')}
            onMouseLeave={e => (e.currentTarget.style.color = '')}
          >
            {product.name}
          </h3>
          <p className="text-xs text-gray-500 mt-1">{product.categoryName}</p>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-2">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3 h-3 ${
                  star <= Math.floor(Number(product.rating))
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">({product.reviewCount})</span>
        </div>

        {/* Tagline */}
        <p className="text-xs font-medium mt-2 text-brand">
          Premium Quality · Fast Delivery
        </p>

        {/* CTA Buttons */}
        <div className="mt-3 flex items-center gap-2">
          {/* View Details — outline */}
          <Link to={`/product/${product.slug}`} className="flex-1">
            <button className="btn-brand-outline w-full justify-center">
              <span>View Details</span>
            </button>
          </Link>

          {/* Order Now — solid */}
          <Link
            to="/checkout"
            state={buildCheckoutProductState({
              categorySlug: product.categorySlug,
              subcategorySlug: product.slug,
              categoryName: product.categoryName,
              productName: product.name,
              productImage: product.image,
            })}
            className="flex-1"
          >
            <button className="btn-brand w-full justify-center">
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Order</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function FilterSidebar({
  selectedCategories,
  setSelectedCategories,
  priceRange,
  setPriceRange,
  minRating,
  setMinRating,
}: {
  selectedCategories: string[];
  setSelectedCategories: (cats: string[]) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  minRating: number;
  setMinRating: (rating: number) => void;
}) {
  const toggleCategory = (slug: string) => {
    if (selectedCategories.includes(slug)) {
      setSelectedCategories(selectedCategories.filter(c => c !== slug));
    } else {
      setSelectedCategories([...selectedCategories, slug]);
    }
  };

  return (
    <aside className="mlc-sidebar sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-gray-900">Filters</h3>
        <button
          className="text-xs text-purple-600 hover:text-purple-700 font-medium"
          onClick={() => {
            setSelectedCategories([]);
            setPriceRange([0, 5000]);
            setMinRating(0);
          }}
        >
          Reset all
        </button>
      </div>

      {/* Categories Filter */}
      <div className="mlc-sidebar-section">
        <h4 className="mlc-sidebar-title">Categories</h4>
        <div className="space-y-1 max-h-60 overflow-y-auto">
          {categories.map((cat) => (
            <label
              key={cat.slug}
              className={`mlc-filter-item ${selectedCategories.includes(cat.slug) ? 'checked' : ''}`}
              onClick={() => toggleCategory(cat.slug)}
            >
              <div className="mlc-checkbox">
                {selectedCategories.includes(cat.slug) && (
                  <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                    <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className="text-sm">{cat.name}</span>
              <span className="ml-auto text-xs text-gray-400">{cat.subcategories.length}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="mlc-sidebar-section">
        <div className="flex items-center justify-between">
          <h4 className="mlc-sidebar-title mb-3">Price Range</h4>
        </div>
        <div className="flex items-center justify-between text-sm mb-3">
          <span className="text-gray-600">₹{priceRange[0]}</span>
          <span className="text-gray-600">₹{priceRange[1]}</span>
        </div>
        <div className="relative h-2 bg-gray-200 rounded-full">
          <div
            className="absolute h-full bg-purple-600 rounded-full"
            style={{
              left: `${(priceRange[0] / 5000) * 100}%`,
              right: `${100 - (priceRange[1] / 5000) * 100}%`,
            }}
          />
        </div>
        <input
          type="range"
          min="0"
          max="5000"
          value={priceRange[0]}
          onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
          className="mlc-price-slider"
        />
        <input
          type="range"
          min="0"
          max="5000"
          value={priceRange[1]}
          onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
          className="mlc-price-slider"
        />
      </div>

      {/* Rating Filter */}
      <div className="mlc-sidebar-section">
        <h4 className="mlc-sidebar-title mb-3">Rating</h4>
        <div className="space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <label
              key={rating}
              className={`mlc-filter-item ${minRating === rating ? 'checked' : ''}`}
              onClick={() => setMinRating(minRating === rating ? 0 : rating)}
            >
              <div className="mlc-checkbox">
                {minRating === rating && (
                  <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                    <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3 h-3 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                  />
                ))}
                <span className="text-xs text-gray-500 ml-1">& up</span>
              </div>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}

export function AllProductsPage() {
  const { categorySlug } = useParams<{ categorySlug?: string }>();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    categorySlug ? [categorySlug] : []
  );

  useEffect(() => {
    setSelectedCategories(categorySlug ? [categorySlug] : []);
  }, [categorySlug]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("popular");

  const navigateToSubcategory = (slug: string) => {
    navigate(`/product/${slug}`);
  };

  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.categoryName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategories.length === 0 ||
        selectedCategories.includes(product.categorySlug);
      const matchesPrice = product.startingPrice! >= priceRange[0] && product.startingPrice! <= priceRange[1];
      const matchesRating = Number(product.rating) >= minRating;
      return matchesSearch && matchesCategory && matchesPrice && matchesRating;
    }).sort((a, b) => {
      if (sortBy === "price-low") return (a.startingPrice || 0) - (b.startingPrice || 0);
      if (sortBy === "price-high") return (b.startingPrice || 0) - (a.startingPrice || 0);
      if (sortBy === "rating") return Number(b.rating) - Number(a.rating);
      return 0;
    });
  }, [searchQuery, selectedCategories, priceRange, minRating, sortBy]);

  const selectedCategory = categories.find(c => c.slug === categorySlug);
  const pageTitle = selectedCategory ? selectedCategory.name : "All Products";
  const pageSubtitle = selectedCategory
    ? `${allProducts.filter(p => p.categorySlug === categorySlug).length} products in ${selectedCategory.name}`
    : `${filteredProducts.length} printing services available`;

  const activeFiltersCount = selectedCategories.length + (minRating > 0 ? 1 : 0) + (priceRange[0] > 0 || priceRange[1] < 5000 ? 1 : 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {selectedCategory && (
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
              <Link to="/all-products" className="hover:text-purple-600">All Products</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900">{selectedCategory.name}</span>
            </div>
          )}
          <h1 className="text-3xl font-bold text-gray-900">{pageTitle}</h1>
          <p className="text-gray-500 mt-1">{pageSubtitle}</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="mlc-search flex-1">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Toggle & Sort */}
          <div className="flex gap-3">
            <button
              className={`mlc-btn mlc-btn-outline flex items-center gap-2 ${showFilters ? 'bg-purple-50 border-purple-300' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="ml-1 w-5 h-5 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500"
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {categorySlug ? (
            <>
              <button
                className="mlc-pill whitespace-nowrap"
                onClick={() => navigate("/all-products")}
              >
                All Products
              </button>
              <button
                className={`mlc-pill whitespace-nowrap active`}
                onClick={() => setSelectedCategories([categorySlug])}
              >
                All in {selectedCategory?.name}
              </button>
              {selectedCategory?.subcategories.map((sub) => (
                <button
                  key={sub.slug}
                  className="mlc-pill whitespace-nowrap"
                  onClick={() => navigateToSubcategory(sub.slug)}
                >
                  {sub.name}
                </button>
              ))}
            </>
          ) : (
            <>
              <button
                className={`mlc-pill whitespace-nowrap ${selectedCategories.length === 0 ? 'active' : ''}`}
                onClick={() => setSelectedCategories([])}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  className={`mlc-pill whitespace-nowrap ${selectedCategories.includes(cat.slug) ? 'active' : ''}`}
                  onClick={() => {
                    if (selectedCategories.includes(cat.slug)) {
                      setSelectedCategories(selectedCategories.filter(c => c !== cat.slug));
                    } else {
                      setSelectedCategories([...selectedCategories, cat.slug]);
                    }
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </>
          )}
        </div>

        {/* Main Content */}
        <div className="flex gap-8">
          {/* Sidebar - Desktop */}
          <div className="hidden lg:block w-72 flex-shrink-0">
            <FilterSidebar
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              minRating={minRating}
              setMinRating={setMinRating}
            />
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your filters or search query</p>
                <Button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategories([]);
                    setPriceRange([0, 5000]);
                    setMinRating(0);
                  }}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Clear all filters
                </Button>
              </div>
            ) : (
              <div className="mlc-grid">
                {filteredProducts.map((product) => (
                  <MLCProductCard key={product.slug} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}