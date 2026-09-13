import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, FileText } from "lucide-react";
import { Button } from "../components/ui/button";
import { categories } from "../data/categories";

/** Redirects legacy /configure routes to the unified checkout flow. */
export function ProductConfigurationPage() {
  const { categorySlug, subcategorySlug } = useParams<{
    categorySlug: string;
    subcategorySlug: string;
  }>();
  const navigate = useNavigate();

  const category = categories.find((cat) => cat.slug === categorySlug);
  const product = category?.subcategories.find((sub) => sub.slug === subcategorySlug);

  useEffect(() => {
    if (!category || !product) return;
    navigate("/checkout", {
      replace: true,
      state: {
        orderProduct: {
          categorySlug: categorySlug!,
          subcategorySlug: subcategorySlug!,
          categoryName: category.name,
          productName: product.name,
          productImage: product.image,
        },
      },
    });
  }, [category, product, categorySlug, subcategorySlug, navigate]);

  if (!category || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center max-w-md">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-sm text-gray-500 mb-6">This product is no longer available or the link is invalid.</p>
          <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => navigate("/all-products")}>
            Browse Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-gray-100 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-indigo-700">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="text-sm font-medium">Opening checkout for {product.name}…</p>
      </div>
    </div>
  );
}
