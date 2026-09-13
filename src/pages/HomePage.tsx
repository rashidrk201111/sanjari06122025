import { Hero } from "../components/Hero";
import { Services } from "../components/Services";
import { ProductShowcase } from "../components/ProductShowcase";
import { Features } from "../components/Features";
import { Testimonials } from "../components/Testimonials";
import { CTA } from "../components/CTA";
import { ArrowRight, MessageCircle, Phone, Package } from "lucide-react";
import { Link } from "react-router-dom";

function BulkOrderBanner() {
  return (
    <div
      className="border-y"
      style={{
        background: "linear-gradient(90deg, #e84118 0%, #f04b22 52%, #c81e1e 100%)",
        borderColor: "rgba(255,255,255,0.2)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{
                background: "rgba(255,255,255,0.18)",
                border: "1px solid rgba(255,255,255,0.35)",
              }}
            >
              <Package className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-extrabold leading-tight text-white">For Bulk Orders</p>
              <p className="text-xs font-medium leading-tight text-white">Fast quotes for large print runs</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <a
              href="tel:+919323684301"
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-extrabold shadow-sm transition hover:shadow-md"
              style={{ background: "#ffffff", color: "#d93614", border: "1px solid rgba(255,255,255,0.55)" }}
            >
              <Phone className="h-4 w-4" />
              +91 9323684301
            </a>
            <a
              href="https://wa.me/919323684301"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-extrabold text-white shadow-sm transition hover:shadow-md"
              style={{ background: "#16a34a", border: "1px solid rgba(255,255,255,0.35)" }}
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
            <Link
              to="/bulk-order"
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-extrabold text-white shadow-sm transition hover:shadow-md"
              style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.25)" }}
            >
              Place Bulk Order
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HomePage() {
  return (
    <>
      <Hero />
      <BulkOrderBanner />
      <Services />
      <ProductShowcase />
      <Features />
      <Testimonials />
      <CTA />
    </>
  );
}
