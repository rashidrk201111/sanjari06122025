import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Card } from "./ui/card";
import { categories } from "../data/categories";

export function AllProducts() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const toggleCategory = (slug: string) => {
    setExpandedCategory(expandedCategory === slug ? null : slug);
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl lg:text-5xl mb-4">All Products</h2>
          <p className="text-lg text-gray-600">
            Browse our complete range of printing products organized by category
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Categories List */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h3 className="text-xl mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.slug}
                    onClick={() => toggleCategory(category.slug)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center justify-between ${
                      expandedCategory === category.slug
                        ? "bg-blue-100 text-blue-700"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <span>{category.name}</span>
                    {category.subcategories.length > 0 && (
                      expandedCategory === category.slug ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )
                    )}
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Subcategories Display */}
          <div className="lg:col-span-2">
            {expandedCategory ? (
              <Card className="p-6">
                <h3 className="text-2xl mb-6">
                  {categories.find((c) => c.slug === expandedCategory)?.name}
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {categories
                    .find((c) => c.slug === expandedCategory)
                    ?.subcategories.map((subcategory, index) => (
                      <Link
                        key={index}
                        to={`/product/${subcategory.slug}`}
                        className="group flex gap-4 p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer bg-white shadow-sm"
                      >
                        {subcategory.image && (
                          <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-100">
                            <img
                              src={subcategory.image}
                              alt={subcategory.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <div className="flex flex-col justify-center">
                          <h4 className="text-gray-900 font-semibold group-hover:text-blue-600 transition-colors">{subcategory.name}</h4>
                          <span className="text-xs text-blue-600 mt-1 font-medium flex items-center gap-1">
                            Configure &amp; Order &rarr;
                          </span>
                        </div>
                      </Link>
                    ))}
                  {categories.find((c) => c.slug === expandedCategory)
                    ?.subcategories.length === 0 && (
                    <div className="col-span-2 text-center py-8 text-gray-500">
                      <p>Explore our range of products in this category</p>
                      <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        View Products
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            ) : (
              <Card className="p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-10 h-10 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl mb-2">Select a Category</h3>
                  <p className="text-gray-600">
                    Choose a category from the list to view all available products and subcategories
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid sm:grid-cols-4 gap-6 mt-12">
          <Card className="p-6 text-center">
            <div className="text-3xl text-blue-600 mb-2">13</div>
            <div className="text-sm text-gray-600">Main Categories</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl text-blue-600 mb-2">50+</div>
            <div className="text-sm text-gray-600">Product Types</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl text-blue-600 mb-2">100%</div>
            <div className="text-sm text-gray-600">Quality Guaranteed</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl text-blue-600 mb-2">24/7</div>
            <div className="text-sm text-gray-600">Online Ordering</div>
          </Card>
        </div>
      </div>
    </section>
  );
}
