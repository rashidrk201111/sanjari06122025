import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";
import { getAIGeneratedProductImageUrl } from "../lib/aiProductImages";

export function ProductShowcase() {
  const { pageContent } = useAdmin();
  const products = pageContent.products.filter(p => p.isActive);
  return (
    <section id="products" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl lg:text-5xl mb-4">Popular Products</h2>
          <p className="text-lg text-gray-600">
            Browse our most popular printing products and find the perfect solution for your needs
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, index) => {
            const image = product.imageUrl || getAIGeneratedProductImageUrl(product.title, product.slug);
            return (
            <div
              key={product.id || index}
              className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer"
            >
              <div className="relative h-64 overflow-hidden">
                <ImageWithFallback
                  src={image}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-xl mb-1">{product.title}</h3>
                  <p className="text-sm text-gray-200">{product.description}</p>
                </div>
              </div>
              <div className="p-4">
                <Link to={`/products/${product.slug}`}>
                  <Button variant="ghost" className="w-full group-hover:bg-blue-50 group-hover:text-blue-600">
                    View Details
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
