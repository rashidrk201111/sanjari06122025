import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "./ui/button";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "../context/AuthContextSupabase";
import { useAdmin } from "../context/AdminContext";
import delhiPickupImage from "../assets/hero/delhi-pickup.jpg";
import premiumPrintingImpactImage from "../assets/hero/premium-printing-impact.png";
import couponDiscountBannerImage from "../assets/hero/coupon-discount-banner.png";
import exclusiveCouponBannerImage from "../assets/hero/exclusive-coupon-banner.png";

const baseSlides = [
  {
    id: 0,
    badge: "Premium Printing Offer",
    title: ["Premium Printing", "That Makes", "An Impact"],
    subtitle: "Use code EARLY15 and get 15% off between the 1st and 10th of every month.",
    cta: { label: "Use EARLY15", href: "/#/all-products" },
    secondary: { label: "View All Products", href: "/#/all-products" },
    image: premiumPrintingImpactImage,
    gradientStyle: { background: "linear-gradient(135deg, #0b1f58 0%, #ff4b12 100%)" },
    accentColor: "var(--brand)",
    tagText: "Free shipping every Thursday & Sunday",
  },
  {
    id: 1,
    badge: "Pickup Now Available",
    title: ["Pickup Now Available", "Exclusively For", "Delhi NCR"],
    subtitle: "Skip the shipping - order online and pick up from our store! Convenient, quick, and hassle-free same-day pickup.",
    cta: { label: "Order Now", href: "/#/all-products" },
    secondary: { label: "View All Products", href: "/#/all-products" },
    image: delhiPickupImage,
    gradientStyle: { background: "linear-gradient(135deg, #FFB900 0%, #FF8C00 100%)" },
    accentColor: "var(--brand)",
    tagText: "Order online & pick up in store!",
  },
  {
    id: 2,
    badge: "Coupon Discount Offer",
    title: ["First Order", "And Next Order", "Discounts"],
    subtitle: "Use FIRST31 for 31% off your first order, plus DEAL25 for 25% off your next order.",
    cta: { label: "Claim Offer", href: "/#/all-products" },
    secondary: { label: "View Offers", href: "/#/offers" },
    image: couponDiscountBannerImage,
    gradientStyle: { background: "linear-gradient(135deg, #fff3df 0%, #ff5a1f 100%)" },
    accentColor: "var(--brand)",
    tagText: "Free shipping on first order",
  },
  {
    id: 3,
    badge: "Exclusive Coupon Offer",
    title: ["Exclusive Offer", "First And Next", "Order Discounts"],
    subtitle: "Use FIRST31 for 31% off with free shipping, and DEAL25 for 25% off your next order.",
    cta: { label: "Shop Offer", href: "/#/all-products" },
    secondary: { label: "View Offers", href: "/#/offers" },
    image: exclusiveCouponBannerImage,
    gradientStyle: { background: "linear-gradient(135deg, #fff3df 0%, #0b1f58 100%)" },
    accentColor: "var(--brand)",
    tagText: "Premium prints with secure checkout",
  },
];

export function Hero() {
  const { isAuthenticated, user } = useAuth();
  const { pageContent } = useAdmin();
  const [current, setCurrent] = useState(0);
  const [prev2, setPrev2] = useState<number | null>(null);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [transitioning, setTransitioning] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const splitTitle = (title: string) => {
    if (!title.trim()) return ["Professional Printing", "Services"];
    const words = title.trim().split(/\s+/);
    const lines: string[] = [];
    for (let i = 0; i < words.length; i += 3) {
      lines.push(words.slice(i, i + 3).join(" "));
    }
    return lines;
  };

  const slides = baseSlides.map((slide, idx) => {
    const configuredSlide =
      pageContent.heroSlides?.find((s) => s.id === slide.id) ||
      pageContent.heroSlides?.find((s) => s.id === idx + 1) ||
      pageContent.heroSlides?.[idx];

    const titleText = configuredSlide?.title
      || (idx === 0 ? pageContent.hero.title : "")
      || slide.title.join(" ");

    const configuredImg = (configuredSlide?.imageUrl && configuredSlide.imageUrl.trim()) || (idx === 0 && pageContent.hero.backgroundImage?.trim()) || "";

    return {
      ...slide,
      badge: configuredSlide?.badge || slide.badge,
      title: splitTitle(titleText),
      subtitle: configuredSlide?.subtitle || (idx === 0 ? pageContent.hero.subtitle : "") || slide.subtitle,
      cta: {
        label: configuredSlide?.ctaLabel || (idx === 0 ? pageContent.hero.ctaText : "") || slide.cta.label,
        href: configuredSlide?.ctaLink || (idx === 0 ? pageContent.hero.ctaLink : "") || slide.cta.href,
      },
      secondary: {
        label: configuredSlide?.secondaryLabel || slide.secondary.label,
        href: configuredSlide?.secondaryLink || slide.secondary.href,
      },
      image: failedImages[idx] ? slide.image : (configuredImg || slide.image),
      tagText: configuredSlide?.tagText || slide.tagText,
    };
  });

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      navigate("next");
    }, 5500);
  }, []);

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startTimer]);

  function navigate(dir: "next" | "prev") {
    if (transitioning) return;
    setDirection(dir);
    setPrev2(current);
    setTransitioning(true);
    const next = dir === "next"
      ? (current + 1) % slides.length
      : (current - 1 + slides.length) % slides.length;
    setTimeout(() => {
      setCurrent(next);
      setPrev2(null);
      setTransitioning(false);
    }, 500);
  }

  function goTo(idx: number) {
    if (transitioning || idx === current) return;
    setDirection(idx > current ? "next" : "prev");
    setPrev2(current);
    setTransitioning(true);
    setTimeout(() => {
      setCurrent(idx);
      setPrev2(null);
      setTransitioning(false);
    }, 500);
    startTimer();
  }

  const slide = slides[current];

  /* ── Slider view for all users ────────────────────────── */
  return (
    <section
      className="w-full"
      onMouseEnter={() => { if (timerRef.current) clearInterval(timerRef.current); }}
      onMouseLeave={() => startTimer()}
    >
      {/* Slider Container */}
      <div 
        className="relative w-full overflow-hidden bg-gray-100 group"
        style={{ aspectRatio: "2172 / 724" }}
      >
        {[prev2, current].map((idx, layerPos) => {
          if (idx === null) return null;
          const s = slides[idx];
          const isActive = layerPos === 1;
          const imgSrc = failedImages[idx] ? baseSlides[idx]?.image : (s.image || baseSlides[idx]?.image);
          return (
            <a
              key={`${s.id}-${layerPos}`}
              href={s.cta.href}
              className="absolute inset-0 transition-opacity duration-500 block"
              style={{
                opacity: isActive ? (transitioning ? 0 : 1) : (transitioning ? 1 : 0),
                zIndex: isActive ? 2 : 1,
                pointerEvents: isActive && !transitioning ? "auto" : "none",
              }}
            >
              <img
                src={imgSrc}
                alt={s.badge || `Banner ${idx + 1}`}
                className="w-full h-full object-cover select-none animate-none"
                onError={() => {
                  setFailedImages(prev => ({ ...prev, [idx]: true }));
                }}
              />
            </a>
          );
        })}

        {/* ── Controls ── */}
        {/* Left Arrow */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate("prev"); startTimer(); }}
          className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-12 md:h-12 rounded-full bg-white/70 hover:bg-white text-gray-800 flex items-center justify-center shadow-lg transition-all opacity-0 group-hover:opacity-100 duration-300"
          style={{ zIndex: 30 }}
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-5 w-5 md:h-6 md:w-6 text-[var(--brand)] stroke-[3px]" />
        </button>

        {/* Right Arrow */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate("next"); startTimer(); }}
          className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-12 md:h-12 rounded-full bg-white/70 hover:bg-white text-gray-800 flex items-center justify-center shadow-lg transition-all opacity-0 group-hover:opacity-100 duration-300"
          style={{ zIndex: 30 }}
          aria-label="Next slide"
        >
          <ChevronRight className="h-5 w-5 md:h-6 md:w-6 text-[var(--brand)] stroke-[3px]" />
        </button>

        {/* Dots */}
        <div 
          className="absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 md:gap-2"
          style={{ zIndex: 30 }}
        >
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); goTo(i); }}
              aria-label={`Slide ${i + 1}`}
              className="transition-all duration-300 cursor-pointer"
              style={{
                width: i === current ? "28px" : "10px",
                height: "10px",
                borderRadius: "9999px",
                background: i === current ? "var(--brand)" : "rgba(255,255,255,0.85)",
                border: "2px solid var(--brand)",
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-3 text-gray-800 text-center text-sm md:text-base">
            <div className="flex flex-col items-center justify-center">
              <div className="text-xl md:text-2xl font-extrabold text-[var(--brand)]">500K+</div>
              <div className="text-[10px] md:text-xs font-semibold text-gray-500 uppercase tracking-wider">Orders Delivered</div>
            </div>
            <div className="flex flex-col items-center justify-center border-x border-gray-100">
              <div className="text-xl md:text-2xl font-extrabold text-[var(--brand)]">24 hrs</div>
              <div className="text-[10px] md:text-xs font-semibold text-gray-500 uppercase tracking-wider">Fast Turnaround</div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className="text-xl md:text-2xl font-extrabold text-[var(--brand)]">4.9 ★</div>
              <div className="text-[10px] md:text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer Rating</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
