import { Link } from "react-router-dom";
import { categories } from "../data/categories";
import { PageHeader } from "../components/PageHeader";

export function SitemapPage() {
  return (
    <div className="min-h-screen bg-white">
      <PageHeader
        title="Sitemap"
        subtitle="Quick navigation to all pages on our website"
        breadcrumbs={[{ label: "Sitemap" }]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
          {/* Main Navigation */}
          <div>
            <h2 className="text-2xl mb-4 text-blue-600">Main Pages</h2>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/all-products" className="text-gray-700 hover:text-blue-600 transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/price-calculator" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Price Calculator
                </Link>
              </li>
              <li>
                <Link to="/bulk-order" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Bulk Order
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h2 className="text-2xl mb-4 text-blue-600">Company</h2>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-700 hover:text-blue-600 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-gray-700 hover:text-blue-600 transition-colors">
                  How it Works
                </Link>
              </li>
              <li>
                <Link to="/why-choose" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Why Choose Us
                </Link>
              </li>
              <li>
                <Link to="/press" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Press
                </Link>
              </li>
              <li>
                <Link to="/career" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h2 className="text-2xl mb-4 text-blue-600">Support</h2>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/faqs" className="text-gray-700 hover:text-blue-600 transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link to="/order-by-email" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Order by Email
                </Link>
              </li>
              <li>
                <Link to="/print-your-file" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Print Your File
                </Link>
              </li>
              <li>
                <Link to="/payment-options" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Payment Options
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h2 className="text-2xl mb-4 text-blue-600">Services</h2>
            <ul className="space-y-2">
              <li>
                <Link to="/offers" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Offers & Deals
                </Link>
              </li>
              <li>
                <Link to="/partner" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Partner with Us
                </Link>
              </li>
              <li>
                <Link to="/printonweb-service" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Printonweb Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h2 className="text-2xl mb-4 text-blue-600">Legal</h2>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/shipping-policy" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link to="/cancellation-policy" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Cancellation Policy
                </Link>
              </li>
              <li>
                <Link to="/payment-terms" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Payment Terms
                </Link>
              </li>
            </ul>
          </div>

          {/* Products */}
          <div className="md:col-span-2 lg:col-span-3">
            <h2 className="text-2xl mb-4 text-blue-600">Product Categories</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categories.map((category) => (
                <div key={category.slug}>
                  <h3 className="mb-2 text-gray-900">{category.name}</h3>
                  <ul className="space-y-1">
                    {category.subcategories.map((subcategory) => (
                      <li key={subcategory.slug}>
                        <Link
                          to={`/product/${subcategory.slug}`}
                          className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                        >
                          {subcategory.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
