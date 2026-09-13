import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContextSupabase";
import { useAdmin } from "../context/AdminContext";
import type { PricingOption, PricingRule } from "../context/AdminContext";
import { categories } from "../data/categories";
import {
  CheckCircle2,
  CreditCard,
  Wallet,
  Loader2,
  Truck,
  Shield,
  ChevronDown,
  ChevronUp,
  Trash2,
  Plus,
  FileText,
  AlertCircle,
  RefreshCw,
  Tag,
  MapPin,
  User,
  Phone,
  Mail,
  Home,
  CheckCheck,
  CloudUpload,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import {
  fetchPaymentSettings,
  fetchCheckoutQuote,
  fetchCheckoutChargeSettings,
  createPhonePePayment,
  checkPhonePePaymentStatus,
} from "../lib/paymentsApi";
import { API_BASE } from "../lib/apiBase";

declare global { interface Window { Razorpay: any; } }

/* Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Types Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */
interface FileSettings {
  id: string;
  file: File;
  fileName: string;
  fileSize: number;
  totalPages: number;
  pages: number;
  copies: number;
  paper: string;
  sides: string;
  size: string;
  color: string;
  binding: string;
  cover: string;
  lamination?: string;
  specialInstructions: string;
  printType: string;
  subcategory: string;
  pageDetection: "pending" | "success" | "failed";
  collapsed: boolean;
  tempUploadId?: number;
  uploadUrl?: string;
}

type Section = "login" | "upload" | "settings" | "address" | "payment";

export interface OrderProductContext {
  categorySlug: string;
  subcategorySlug: string;
  categoryName: string;
  productName: string;
  productImage?: string;
}

function printTypeForCategory(categorySlug?: string): string {
  if (categorySlug === "posters") return "Poster Printing";
  if (categorySlug === "certificates" || categorySlug === "certificate-cards") return "Certificate Printing";
  if (categorySlug === "visiting-cards") return "Visiting Card Printing";
  if (categorySlug === "letterheads") return "Letterhead Printing";
  if (categorySlug === "flyers" || categorySlug === "leaflets") return "Leaflet / Flyer / Template Printing";
  if (categorySlug === "photo-albums") return "Photo Album Printing";
  if (categorySlug === "calendars" || categorySlug === "table-calendars") return "Table Calendar Printing";
  if (categorySlug === "books") return "Books Printing";
  if (categorySlug === "thesis-dissertation") return "Documents Printing";
  if (categorySlug === "black-book-white-book-binding") return "Documents Printing";
  if (categorySlug === "binding") return "Documents Printing";
  return "Documents Printing";
}

/* Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Constants Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */
const PRINT_TYPES   = [
  "Documents Printing",
  "Certificate Printing",
  "Leaflet / Flyer / Template Printing",
  "Letterhead Printing",
  "Photo Album Printing",
  "Poster Printing",
  "Table Calendar Printing",
  "Visiting Card Printing",
  "Photos Printing",
  "Books Printing",
];
const PAPER_OPTIONS = [
  "75GSM - Normal Paper",
  "100GSM - Bond Paper",
  "130GSM - Art Paper",
  "300GSM - Art Card",
  "300GSM - Bond Paper",
  "90GSM - High Quality",
  "100GSM - Premium",
  "120GSM - Glossy",
];
const SIDES_OPTIONS = ["Single Side", "Both Side (Back2Back)"];
const SIZE_OPTIONS  = ["A4", "A3", "A5", "Letter", "Legal"];
const COLOR_OPTIONS = ["Black and White", "Smartcolor Standard", "Ultracolor Pro"];
const CERT_COLOR_OPTIONS = ["Black and White", "Ultracolor Pro"];
const BINDING_OPTIONS = ["No Binding", "Spiral Binding", "Soft Bind", "Hard Bind", "Staple"];
const COVER_OPTIONS = ["No Cover", "Transparent Front Cover", "Front and Back Cover"];
const LAMINATION_OPTIONS = ["Without Lamination", "Matt Lamination", "Glossy Lamination", "Soft Touch Lamination"];

const BINDING_PRICES: Record<string, number> = {
  "No Binding": 0, "Spiral Binding": 40, "Soft Bind": 30, "Hard Bind": 80, "Staple": 5,
};

const COLOR_ADDONS: Record<string, number> = {
  "black and white": 0,
  bw: 0,
  color: 4.5,
  "color-standard": 2.5,
  "color-premium": 4.5,
  "smartcolor standard": 2.5,
  "ultracolor pro": 4.5,
};

const SIDES_ADDONS: Record<string, number> = {
  "single side": 0,
  single: 0,
  duplex: 0.6,
  "both side (back2back)": 0.6,
};

const FALLBACK_QUANTITY_DISCOUNTS = [
  { minQty: 500, discount: 12 },
  { minQty: 200, discount: 8 },
  { minQty: 100, discount: 5 },
  { minQty: 50, discount: 3 },
];

const COUPONS: Record<string, { discount: number; type: "percent" | "flat"; maxDiscount?: number; desc: string }> = {
  FIRST31: { discount: 31, type: "percent", maxDiscount: 310, desc: "31% off on printing + FREE shipping" },
  DEAL25:  { discount: 25, type: "percent", maxDiscount: 250, desc: "25% off on printing" },
};

const DEFAULT_SETTINGS: Omit<FileSettings, "id"|"file"|"fileName"|"fileSize"|"totalPages"|"pages"|"pageDetection"|"collapsed"> = {
  copies: 1, paper: PAPER_OPTIONS[0], sides: SIDES_OPTIONS[0], size: SIZE_OPTIONS[0],
  color: COLOR_OPTIONS[0], binding: BINDING_OPTIONS[0], cover: COVER_OPTIONS[0], lamination: "Without Lamination", specialInstructions: "", printType: PRINT_TYPES[0],
  subcategory: "",
};

function normalizeRuleText(value?: string) {
  return (value || "").trim().toLowerCase();
}

function slugish(value?: string) {
  return normalizeRuleText(value).replace(/&/g, "and").replace(/[/-]/g, " ");
}

function getOrderSubcategoryName(effectiveOrderProduct?: OrderProductContext) {
  const category = categories.find(c => c.slug === effectiveOrderProduct?.categorySlug);
  const subcategory = category?.subcategories.find(s => s.slug === effectiveOrderProduct?.subcategorySlug);
  return subcategory?.name || effectiveOrderProduct?.productName || effectiveOrderProduct?.subcategorySlug || "PDF PRINT";
}

function findCheckoutPricingRule(
  pricingRules: PricingRule[] | undefined,
  effectiveOrderProduct?: OrderProductContext
) {
  if (!pricingRules?.length) return null;

  const categorySlug = effectiveOrderProduct?.categorySlug || "documents";
  const subcategoryName = getOrderSubcategoryName(effectiveOrderProduct);
  const candidates = [effectiveOrderProduct?.subcategorySlug, subcategoryName, effectiveOrderProduct?.productName]
    .map(slugish)
    .filter(Boolean);
  const categoryRules = pricingRules.filter(rule => normalizeRuleText(rule.category) === categorySlug);

  for (const candidate of candidates) {
    const exact = categoryRules.find(rule => slugish(rule.subcategory) === candidate);
    if (exact) return exact;
    const loose = categoryRules.find(rule => {
      const ruleName = slugish(rule.subcategory);
      return ruleName.includes(candidate) || candidate.includes(ruleName);
    });
    if (loose) return loose;
  }

  if (categoryRules.length > 0) return categoryRules[0];
  return pricingRules.find(rule => normalizeRuleText(rule.category) === "documents") || null;
}

function categorySlugForPrintType(printType: string): string {
  const norm = printType.toLowerCase();
  if (norm.includes("document") || norm.includes("thesis") || norm.includes("dissertation") || norm.includes("binding")) return "documents";
  if (norm.includes("book")) return "books";
  if (norm.includes("certificate") || norm.includes("card")) return "certificate-cards";
  if (norm.includes("poster")) return "posters";
  if (norm.includes("visiting")) return "visiting-cards";
  if (norm.includes("letterhead")) return "letterheads";
  if (norm.includes("flyer") || norm.includes("leaflet") || norm.includes("template")) return "flyers";
  if (norm.includes("photo album")) return "photo-albums";
  if (norm.includes("calendar")) return "calendars";
  return "documents";
}

function subcategoriesForPrintType(printType: string): string[] {
  const norm = printType.toLowerCase();
  if (norm.includes("document") || norm.includes("thesis") || norm.includes("dissertation") || norm.includes("binding")) {
    return ["PDF PRINT", "ANNUAL REPORT PRINTING", "Thesis Print", "Black Book Binding", "White Book Binding"];
  }
  if (norm.includes("book")) {
    return ["PAPERBACK / SOFTCOVER / SOFTBACK BOOKS", "E-BOOK PRINTING", "STUDY MATERIAL/GUIDE PRINTING"];
  }
  if (norm.includes("certificate") || norm.includes("card")) {
    return ["NOTE CARDS", "CERTIFICATE PRINTING", "FLASH CARD PRINTING", "Visiting Card Printing"];
  }
  if (norm.includes("poster")) {
    return ["Poster Printing"];
  }
  if (norm.includes("letterhead")) {
    return ["Letterhead Printing"];
  }
  if (norm.includes("flyer") || norm.includes("leaflet") || norm.includes("template")) {
    return ["Leaflet / Flyer / Template Printing"];
  }
  if (norm.includes("photo album")) {
    return ["Photo Album Printing"];
  }
  if (norm.includes("calendar")) {
    return ["Table Calendar Printing"];
  }
  if (norm.includes("photo")) {
    return ["Photos Printing"];
  }
  return [printType];
}

function isBlackWhiteBindingContext(subcategoryName?: string, effectiveOrderProduct?: OrderProductContext) {
  const sub = normalizeRuleText(subcategoryName);
  if (sub.includes("black book") || sub.includes("white book")) return true;
  if (sub.includes("certificate") || sub.includes("pdf print") || sub.includes("annual report") || sub.includes("book") || sub.includes("poster") || sub.includes("notecard") || sub.includes("flash card")) return false;
  const cat = normalizeRuleText(effectiveOrderProduct?.categorySlug);
  const prodSub = normalizeRuleText(effectiveOrderProduct?.subcategorySlug);
  return (
    cat === "black-book-white-book-binding" ||
    prodSub.includes("black-book") ||
    prodSub.includes("white-book")
  );
}

function isCertificateContext(printType?: string, subcategoryName?: string, effectiveOrderProduct?: OrderProductContext) {
  const normPrint = normalizeRuleText(printType);
  const normSub = normalizeRuleText(subcategoryName);
  if (normPrint.includes("certificate") || normSub.includes("certificate") || normSub.includes("note card") || normSub.includes("flash card")) {
    return true;
  }
  if (normPrint && (normPrint.includes("document") || normPrint.includes("book") || normPrint.includes("poster") || normPrint.includes("letterhead") || normPrint.includes("leaflet") || normPrint.includes("flyer"))) {
    return false;
  }
  const normCat = normalizeRuleText(effectiveOrderProduct?.categorySlug);
  const normProdSub = normalizeRuleText(effectiveOrderProduct?.subcategorySlug);
  return (
    normCat === "certificates" ||
    normCat === "certificate-cards" ||
    normProdSub.includes("certificate") ||
    normProdSub.includes("notecard") ||
    normProdSub.includes("flash-card")
  );
}

function getAvailableSizeOptions(fileRule: PricingRule | null | undefined, isBlackWhiteBinding: boolean) {
  const fallback = isBlackWhiteBinding ? ["A4", "A5"] : SIZE_OPTIONS;
  const options = enabledOptions(fileRule?.paperSizes, fallback);
  if (isBlackWhiteBinding) {
    const filtered = options.filter(sz => sz.toUpperCase() === "A4" || sz.toUpperCase() === "A5");
    return filtered.length > 0 ? filtered : ["A4", "A5"];
  }
  return options;
}

function getAvailableColorOptions(fileRule: PricingRule | null | undefined, isCert: boolean) {
  const fallback = isCert ? CERT_COLOR_OPTIONS : COLOR_OPTIONS;
  const options = enabledOptions(fileRule?.colorTypes, fallback);
  if (isCert) {
    const filtered = options.filter(c => !c.toLowerCase().includes("smart") && c !== "color-standard");
    return filtered.length > 0 ? filtered : CERT_COLOR_OPTIONS;
  }
  return options;
}

function getFilePricingRule(pricingRules: PricingRule[] | undefined, printType: string, subcategoryName: string) {
  if (!pricingRules?.length) return null;

  const categorySlug = categorySlugForPrintType(printType);
  const candidates = [slugish(subcategoryName)].filter(Boolean);
  const categoryRules = pricingRules.filter(rule => normalizeRuleText(rule.category) === categorySlug);

  for (const candidate of candidates) {
    const exact = categoryRules.find(rule => slugish(rule.subcategory) === candidate);
    if (exact) return exact;
    const loose = categoryRules.find(rule => {
      const ruleName = slugish(rule.subcategory);
      return ruleName.includes(candidate) || candidate.includes(ruleName);
    });
    if (loose) return loose;
  }

  // Cross-category search by subcategory
  for (const candidate of candidates) {
    const exact = pricingRules.find(rule => slugish(rule.subcategory) === candidate);
    if (exact) return exact;
    const loose = pricingRules.find(rule => {
      const ruleName = slugish(rule.subcategory);
      return ruleName.includes(candidate) || candidate.includes(ruleName);
    });
    if (loose) return loose;
  }

  return categoryRules[0] || pricingRules[0] || null;
}

function findNamedRule<T extends { name: string }>(rules: T[] | undefined, selected: string) {
  const availableRules = rules?.filter(rule => (rule as PricingOption).enabled !== false) || [];
  const selectedKey = normalizeRuleText(selected);
  const selectedRule = selectedKey ? availableRules.find(rule => {
      const ruleName = normalizeRuleText(rule.name);
      return selectedKey === ruleName || selectedKey.includes(ruleName) || ruleName.includes(selectedKey);
    }) : undefined;
  return selectedRule || availableRules.find(rule => (rule as PricingOption).isDefault) || availableRules[0];
}

function enabledOptions(options: PricingOption[] | undefined, fallback: string[]) {
  const active = options?.filter(option => option.enabled !== false && option.name.trim() && !option.name.toLowerCase().includes("eco"));
  return active?.length ? active.map(option => option.name) : fallback;
}

function defaultOption(options: PricingOption[] | undefined, fallback: string[]) {
  const active = options?.filter(option => option.enabled !== false && option.name.trim() && !option.name.toLowerCase().includes("eco")) || [];
  return active.find(option => option.isDefault)?.name || active[0]?.name || fallback[0];
}

function optionPriceModifier(options: PricingOption[] | undefined, selected: string, fallback: Record<string, number> = {}) {
  const option = findNamedRule(options, selected);
  return option?.priceModifier ?? fallback[normalizeRuleText(selected)] ?? 0;
}

function hierarchicalPriceForFile(rule: PricingRule | null, file: FileSettings) {
  const sizeRule = findNamedRule(rule?.paperSizes, file.size);
  const paperRule = findNamedRule(sizeRule?.paperTypes, file.paper);
  const prices = paperRule?.prices;
  if (!prices) return null;

  const color = normalizeRuleText(file.color);
  const sides = normalizeRuleText(file.sides);
  const side = sides.includes("both") || sides.includes("double") || sides.includes("duplex") || sides.includes("back2back")
    ? "_double"
    : "_single";

  let priceKey = `color${side}`;
  if (color === "bw" || color.includes("black") || color.includes("b&w")) priceKey = `bw${side}`;
  else if (color.includes("premium") || color.includes("ultra")) priceKey = `premium${side}`;

  const copies = file.copies || 1;
  let tierSuffix = "";
  if (copies >= 5000) {
    tierSuffix = "_5000";
  } else if (copies >= 100) {
    tierSuffix = "_100";
  }

  const tieredPrice = prices[`${priceKey}${tierSuffix}`];
  if (tieredPrice !== undefined && tieredPrice !== null && Number(tieredPrice) > 0) {
    return Number(tieredPrice);
  }

  return prices[priceKey] ?? prices[`color${side}`] ?? null;
}

function bestQuantityDiscount(discounts: { minQty: number; discount: number }[] | undefined, copies: number, hasRule: boolean = false) {
  const source = hasRule ? (discounts || []) : (discounts?.length ? discounts : FALLBACK_QUANTITY_DISCOUNTS);
  return source
    .filter(discount => copies >= discount.minQty)
    .sort((a, b) => b.minQty - a.minQty)[0];
}

const SECTIONS: { id: Section; label: string; short: string }[] = [
  { id: "login", label: "Login", short: "Account" },
  { id: "upload", label: "Upload", short: "Upload" },
  { id: "settings", label: "Settings", short: "Settings" },
  { id: "address", label: "Address", short: "Address" },
  { id: "payment", label: "Payment", short: "Pay" },
];

function stepIndex(section: Section) {
  return SECTIONS.findIndex(s => s.id === section);
}

function formatBytes(b: number) {
  if (b < 1024) return b + " B";
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
  return (b / (1024 * 1024)).toFixed(1) + " MB";
}

function formatCurrency(value: number) {
  return `Rs ${Number(value || 0).toFixed(2)}`;
}

/* Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Sub-components Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */
function SelectField({ label, value, options, disabled = false, onChange }: { label: string; value: string; options: string[]; disabled?: boolean; onChange: (v: string) => void; }) {
  return (
    <label className={`group block rounded-2xl border px-3 py-2.5 shadow-sm transition-all ${
      disabled 
        ? "border-emerald-200 bg-emerald-50" 
        : "border-gray-200 bg-white hover:border-purple-200 focus-within:border-purple-400 focus-within:ring-4 focus-within:ring-purple-100"
    }`}>
      <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-gray-500">
        {label}
      </span>
      <div className="relative">
        <select
          value={value}
          disabled={disabled}
          onChange={e => onChange(e.target.value)}
          className="h-8 w-full cursor-pointer appearance-none bg-transparent pr-9 text-sm font-semibold text-gray-950 outline-none disabled:text-emerald-800 disabled:cursor-not-allowed"
        >
          {options.map(o => <option key={o}>{o}</option>)}
        </select>
        <div className="pointer-events-none absolute right-0 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl bg-purple-50 text-purple-600 transition-colors group-focus-within:bg-purple-100">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>
    </label>
  );
}

function SpinnerField({ label, value, min = 1, disabled = false, helperText, onChange }: { label: string; value: number; min?: number; disabled?: boolean; helperText?: string; onChange: (v: number) => void; }) {
  return (
    <label className={`block rounded-2xl border px-3 py-2.5 shadow-sm transition-all ${
      disabled
        ? "border-emerald-200 bg-emerald-50"
        : "border-gray-200 bg-white hover:border-purple-200 focus-within:border-purple-400 focus-within:ring-4 focus-within:ring-purple-100"
    }`}>
      <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-gray-500">
        {label}
      </span>
      <div className="flex h-8 items-center gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(Math.max(min, value - 1))}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-lg font-bold leading-none text-gray-500 transition-colors hover:bg-purple-50 hover:text-purple-700 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={`Decrease ${label}`}
        >
          -
        </button>
        <input
          type="number"
          min={min}
          value={value}
          disabled={disabled}
          onChange={e => onChange(Math.max(min, parseInt(e.target.value) || min))}
          className="min-w-0 flex-1 bg-transparent text-center text-sm font-bold text-gray-950 outline-none disabled:text-emerald-800 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(value + 1)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-lg font-bold leading-none text-purple-700 transition-colors hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
      {helperText && <span className="mt-1 block text-[11px] font-medium text-emerald-700">{helperText}</span>}
    </label>
  );
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationOrderProduct = (location.state as any)?.effectiveOrderProduct ?? (location.state as any)?.orderProduct;

  // Manual category/subcategory selection (fallback or active selection)
  const [manualCatSlug, setManualCatSlug] = useState<string>(() => locationOrderProduct?.categorySlug || "");
  const [manualSubSlug, setManualSubSlug] = useState<string>(() => locationOrderProduct?.subcategorySlug || "");

  const activeCatSlug = manualCatSlug || locationOrderProduct?.categorySlug || "";
  const activeSubSlug = manualSubSlug || locationOrderProduct?.subcategorySlug || "";
  const activeCategory = categories.find(c => c.slug === activeCatSlug);
  const activeSubcategory = activeCategory?.subcategories.find(s => s.slug === activeSubSlug);

  const effectiveOrderProduct: OrderProductContext | undefined = (activeCategory && activeSubcategory)
    ? {
        categorySlug: activeCategory.slug,
        subcategorySlug: activeSubcategory.slug,
        categoryName: activeCategory.name,
        productName: activeSubcategory.name,
        productImage: activeSubcategory.image,
      }
    : locationOrderProduct;

  const handleCategoryChange = (catSlug: string) => {
    setManualCatSlug(catSlug);
    const cat = categories.find(c => c.slug === catSlug);
    const firstSub = cat?.subcategories[0]?.slug || "";
    setManualSubSlug(firstSub);

    if (!cat) return;
    const preferredPrint = printTypeForCategory(catSlug);
    const subName = cat.subcategories[0]?.name || "";
    const isCert = isCertificateContext(preferredPrint, subName);
    const isBw = isBlackWhiteBindingContext(subName);

    setUploadedFiles(prev => prev.map(f => {
      const fileRule = getFilePricingRule(pricingRules, preferredPrint, subName);
      const nextSizeOpts = getAvailableSizeOptions(fileRule, isBw);
      const nextSize = nextSizeOpts.includes(f.size) ? f.size : (nextSizeOpts[0] || "A4");
      const sizeRule = findNamedRule(fileRule?.paperSizes, nextSize);
      const nextColorOpts = getAvailableColorOptions(fileRule, isCert);
      const nextColor = nextColorOpts.includes(f.color) ? f.color : (nextColorOpts[0] || "Black and White");

      return {
        ...f,
        printType: preferredPrint,
        subcategory: subName,
        size: nextSize,
        paper: defaultOption(sizeRule?.paperTypes || fileRule?.paperTypes, PAPER_OPTIONS),
        sides: defaultOption(fileRule?.sideTypes, SIDES_OPTIONS),
        color: nextColor,
        binding: isCert ? "No Binding" : defaultOption(sizeRule?.bindingTypes || fileRule?.bindingTypes, BINDING_OPTIONS),
        cover: isCert ? "No Cover" : defaultOption(sizeRule?.coverTypes || fileRule?.coverTypes, COVER_OPTIONS),
        lamination: isCert ? defaultOption(sizeRule?.laminationTypes || fileRule?.laminationTypes, LAMINATION_OPTIONS) : "Without Lamination",
      };
    }));
  };

  const handleSubcategoryChange = (subSlug: string) => {
    setManualSubSlug(subSlug);
    const cat = categories.find(c => c.slug === (manualCatSlug || activeCatSlug));
    const sub = cat?.subcategories.find(s => s.slug === subSlug);
    if (!sub) return;

    const subName = sub.name;
    const currentPrint = printTypeForCategory(cat?.slug);
    const isCert = isCertificateContext(currentPrint, subName);
    const isBw = isBlackWhiteBindingContext(subName);

    setUploadedFiles(prev => prev.map(f => {
      const fileRule = getFilePricingRule(pricingRules, f.printType, subName);
      const nextSizeOpts = getAvailableSizeOptions(fileRule, isBw);
      const nextSize = nextSizeOpts.includes(f.size) ? f.size : (nextSizeOpts[0] || "A4");
      const sizeRule = findNamedRule(fileRule?.paperSizes, nextSize);
      const nextColorOpts = getAvailableColorOptions(fileRule, isCert);
      const nextColor = nextColorOpts.includes(f.color) ? f.color : (nextColorOpts[0] || "Black and White");

      return {
        ...f,
        subcategory: subName,
        size: nextSize,
        paper: defaultOption(sizeRule?.paperTypes || fileRule?.paperTypes, PAPER_OPTIONS),
        sides: defaultOption(fileRule?.sideTypes, SIDES_OPTIONS),
        color: nextColor,
        binding: isCert ? "No Binding" : defaultOption(sizeRule?.bindingTypes || fileRule?.bindingTypes, BINDING_OPTIONS),
        cover: isCert ? "No Cover" : defaultOption(sizeRule?.coverTypes || fileRule?.coverTypes, COVER_OPTIONS),
        lamination: isCert ? defaultOption(sizeRule?.laminationTypes || fileRule?.laminationTypes, LAMINATION_OPTIONS) : "Without Lamination",
      };
    }));
  };
  const { items, getCartTotal, clearCart } = useCart();
  const { addOrder, user, isAuthenticated } = useAuth();
  const { pricingRules } = useAdmin();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  /* ─── State ─── */
  const [openSection, setOpenSection] = useState<Section>("upload");
  const [checkoutAsGuest, setCheckoutAsGuest] = useState(() => sessionStorage.getItem("checkout_mode") === "guest");
  const [uploadedFiles, setUploadedFiles] = useState<FileSettings[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const [formData, setFormData] = useState({ fullName: "", email: "", phone: "", address: "", city: "", state: "", pincode: "", landmark: "" });
  const [formErrors, setFormErrors] = useState<Partial<typeof formData>>({});
  const [addressSaved, setAddressSaved] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "phonepe" | "cod">("cod");
  const [paymentSettings, setPaymentSettings] = useState<any>(null);
  const [checkoutCharges, setCheckoutCharges] = useState({
    packagingCharge: 0,
    shippingCharge: 0,
    freeShippingThreshold: 500,
  });
  const [processing, setProcessing] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [confirmedOrderTotal, setConfirmedOrderTotal] = useState(0);

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState("");

  /* ─── Pricing ─── */
  const checkoutPricingRule = findCheckoutPricingRule(pricingRules, effectiveOrderProduct);
  const isOrderBwBinding = isBlackWhiteBindingContext(effectiveOrderProduct?.subcategorySlug, effectiveOrderProduct);
  const printTypeOptions = enabledOptions(checkoutPricingRule?.printTypes, PRINT_TYPES);
  const paperOptions = enabledOptions(checkoutPricingRule?.paperTypes, PAPER_OPTIONS);
  const sideOptions = enabledOptions(checkoutPricingRule?.sideTypes, SIDES_OPTIONS);
  const sizeOptions = getAvailableSizeOptions(checkoutPricingRule, isOrderBwBinding);
  const isOrderCert = isCertificateContext(printTypeOptions[0], effectiveOrderProduct?.subcategorySlug, effectiveOrderProduct);
  const colorOptions = getAvailableColorOptions(checkoutPricingRule, isOrderCert);
  const bindingOptions = enabledOptions(checkoutPricingRule?.bindingTypes, BINDING_OPTIONS);
  const coverOptions = enabledOptions(checkoutPricingRule?.coverTypes, COVER_OPTIONS);

  useEffect(() => {
    if (!pricingRules?.length) return;
    setUploadedFiles(previous => {
      let changed = false;
      const normalized = previous.map(file => {
        const fileRule = getFilePricingRule(pricingRules, file.printType, file.subcategory || subcategoriesForPrintType(file.printType)[0] || "");
        const isBwBinding = isBlackWhiteBindingContext(file.subcategory, effectiveOrderProduct);
        const isCert = isCertificateContext(file.printType, file.subcategory, effectiveOrderProduct);
        const fSizeOptions = getAvailableSizeOptions(fileRule, isBwBinding);
        const selectedSize = fSizeOptions.includes(file.size) ? file.size : (fSizeOptions[0] || "A4");
        const sizeRule = findNamedRule(fileRule?.paperSizes, selectedSize);

        const fPaperOptions = sizeRule?.paperTypes?.length
          ? enabledOptions(sizeRule.paperTypes, PAPER_OPTIONS)
          : enabledOptions(fileRule?.paperTypes, PAPER_OPTIONS);
        const fSideOptions = enabledOptions(fileRule?.sideTypes, SIDES_OPTIONS);
        const fColorOptions = getAvailableColorOptions(fileRule, isCert);
        const fBindingOptions = sizeRule?.bindingTypes?.length
          ? enabledOptions(sizeRule.bindingTypes, BINDING_OPTIONS)
          : enabledOptions(fileRule?.bindingTypes, BINDING_OPTIONS);
        const fCoverOptions = sizeRule?.coverTypes?.length
          ? enabledOptions(sizeRule.coverTypes, COVER_OPTIONS)
          : enabledOptions(fileRule?.coverTypes, COVER_OPTIONS);
        const fLaminationOptions = sizeRule?.laminationTypes?.length
          ? enabledOptions(sizeRule.laminationTypes, LAMINATION_OPTIONS)
          : enabledOptions(fileRule?.laminationTypes, LAMINATION_OPTIONS);

        const next = {
          ...file,
          subcategory: file.subcategory || subcategoriesForPrintType(file.printType)[0] || "",
          size: selectedSize,
          paper: fPaperOptions.includes(file.paper) ? file.paper : defaultOption(sizeRule?.paperTypes || fileRule?.paperTypes, PAPER_OPTIONS),
          sides: fSideOptions.includes(file.sides) ? file.sides : defaultOption(fileRule?.sideTypes, SIDES_OPTIONS),
          color: fColorOptions.includes(file.color) ? file.color : (fColorOptions[0] || "Black and White"),
          binding: isCert ? "No Binding" : (fBindingOptions.includes(file.binding) ? file.binding : defaultOption(sizeRule?.bindingTypes || fileRule?.bindingTypes, BINDING_OPTIONS)),
          cover: isCert ? "No Cover" : (fCoverOptions.includes(file.cover) ? file.cover : defaultOption(sizeRule?.coverTypes || fileRule?.coverTypes, COVER_OPTIONS)),
          lamination: isCert ? (fLaminationOptions.includes(file.lamination || "") ? file.lamination : defaultOption(sizeRule?.laminationTypes || fileRule?.laminationTypes, LAMINATION_OPTIONS)) : "Without Lamination",
        };
        if (Object.keys(next).some(key => next[key as keyof FileSettings] !== file[key as keyof FileSettings])) changed = true;
        return next;
      });
      return changed ? normalized : previous;
    });
  }, [pricingRules, effectiveOrderProduct]);

  const calculateFileLine = (f: FileSettings) => {
    const fileRule = getFilePricingRule(pricingRules, f.printType, f.subcategory);
    const isCert = isCertificateContext(f.printType, f.subcategory, effectiveOrderProduct);
    let pricePerPage = fileRule?.basePrice ?? 1.5;

    if (fileRule) {
      const hierarchicalPrice = hierarchicalPriceForFile(fileRule, f);
      if (hierarchicalPrice !== null) {
        pricePerPage = hierarchicalPrice;
      } else {
        pricePerPage += optionPriceModifier(fileRule.printTypes, f.printType);
        pricePerPage += optionPriceModifier(fileRule.paperSizes, f.size);
        pricePerPage += optionPriceModifier(fileRule.paperTypes, f.paper);
        pricePerPage += optionPriceModifier(fileRule.colorTypes, f.color, COLOR_ADDONS);
        pricePerPage += optionPriceModifier(fileRule.sideTypes, f.sides, SIDES_ADDONS);
      }
    } else if (normalizeRuleText(f.color) === "color") {
      pricePerPage *= 5;
    }

    let printingCost = f.pages * f.copies * pricePerPage;
    const quantityDiscount = bestQuantityDiscount(fileRule?.quantityDiscounts, f.copies, !!fileRule);
    if (quantityDiscount) {
      printingCost *= (1 - quantityDiscount.discount / 100);
    }

    const sizeRule = findNamedRule(fileRule?.paperSizes, f.size);
    const bindingRule = isCert ? null : findNamedRule(sizeRule?.bindingTypes || fileRule?.bindingTypes, f.binding);
    const bindingCost = isCert ? 0 : ((sizeRule?.bindingTypes?.length || fileRule?.bindingTypes?.length)
      ? (bindingRule?.price ?? 0)
      : (BINDING_PRICES[f.binding] ?? 0)) * f.copies;
    const coverRule = isCert ? null : findNamedRule(sizeRule?.coverTypes || fileRule?.coverTypes, f.cover);
    const coverCost = isCert ? 0 : ((coverRule?.price ?? 0) * f.copies);

    let laminationCost = 0;
    if (isCert && f.lamination && !["without lamination", "no lamination", "none"].includes(normalizeRuleText(f.lamination))) {
      const lamRule = findNamedRule(sizeRule?.laminationTypes || fileRule?.laminationTypes, f.lamination);
      const lamRate = (lamRule?.price !== undefined) ? lamRule.price : (
        normalizeRuleText(f.lamination).includes("soft") ? 8 : 5
      );
      laminationCost = lamRate * f.pages * f.copies;
    }

    return {
      pricePerPage,
      printingCost,
      bindingCost,
      coverCost,
      laminationCost,
      total: printingCost + bindingCost + coverCost + laminationCost,
    };
  };

  const printingCharges = uploadedFiles.reduce((s, f) => s + calculateFileLine(f).printingCost, 0) + getCartTotal();
  const bindingCharges = uploadedFiles.reduce((s, f) => {
    const line = calculateFileLine(f);
    return s + line.bindingCost + line.coverCost + line.laminationCost;
  }, 0);
  const hasChargeableItems = uploadedFiles.length > 0 || items.length > 0;
  const packagingCharges = hasChargeableItems ? checkoutCharges.packagingCharge : 0;
  const netCharges = printingCharges + bindingCharges + packagingCharges;

  const couponDef = appliedCoupon ? COUPONS[appliedCoupon] : null;
  let discount = 0;
  if (couponDef) {
    if (couponDef.type === "percent") {
      discount = Math.min(printingCharges * couponDef.discount / 100, couponDef.maxDiscount ?? Infinity);
    } else {
      discount = couponDef.discount;
    }
    discount = Math.round(discount * 100) / 100;
  }

  const shippingCharge = netCharges - discount >= checkoutCharges.freeShippingThreshold || appliedCoupon === "FIRST31"
    ? 0
    : checkoutCharges.shippingCharge;
  const totalAmount = netCharges - discount + shippingCharge;

  /* Ã¢â€â‚¬Ã¢â€â‚¬ PDF Page Detection Ã¢â€â‚¬Ã¢â€â‚¬ */
  const getBackendPdfPageCount = async (file: File): Promise<number> => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE}/api/payments/detect-pdf-pages/`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) return 0;

      const data = await response.json();
      const pages = Number(data.pages);
      return Number.isFinite(pages) && pages > 0 ? pages : 0;
    } catch {
      return 0;
    }
  };

  const getPdfPageCount = async (file: File): Promise<number> => {
    const backendCount = await getBackendPdfPageCount(file);
    if (backendCount > 0) return backendCount;

    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = async e => {
        try {
          const typedArray = new Uint8Array(e.target?.result as ArrayBuffer);
          const pdfjsLib = await import("pdfjs-dist");
          const pdfjs = (pdfjsLib as any).default || pdfjsLib;
          if (!pdfjs.GlobalWorkerOptions.workerSrc) {
            pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version || "4.16.67"}/pdf.worker.min.mjs`;
          }
          const task = pdfjs.getDocument({ data: typedArray, cMapUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.16.67/cmaps/", cMapPacked: true });
          const doc = await task.promise;
          const n = doc.numPages;
          doc.destroy(); task.destroy();
          resolve(n);
        } catch { resolve(0); }
      };
      reader.onerror = () => resolve(0);
      reader.readAsArrayBuffer(file);
    });
  };

  const uploadCheckoutPdf = async (file: File): Promise<{ pages: number; fileItemId?: number; uploadUrl?: string }> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE}/api/payments/upload-file/`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(errorText || "File upload failed");
    }

    const data = await response.json();
    const pages = Number(data.pages || data.total_pages || 0);
    return {
      pages: Number.isFinite(pages) && pages > 0 ? pages : 0,
      fileItemId: data.fileItemId || data.id,
      uploadUrl: data.uploadUrl || data.upload,
    };
  };

  /* Ã¢â€â‚¬Ã¢â€â‚¬ File Upload Ã¢â€â‚¬Ã¢â€â‚¬ */
  const processFiles = useCallback(async (files: FileList | File[]) => {
    const arr = Array.from(files);
    const newEntries: FileSettings[] = [];

    for (const file of arr) {
      const isPdf = file.name.toLowerCase().endsWith(".pdf") && (!file.type || file.type === "application/pdf");
      if (!isPdf) { toast.error(`"${file.name}" - only PDF files are accepted`); continue; }
      if (uploadedFiles.some(u => u.fileName === file.name && u.fileSize === file.size)) { toast.error(`"${file.name}" already uploaded`); continue; }
      const id = `file_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const currentCat = categories.find(c => c.slug === (manualCatSlug || activeCatSlug));
      const currentSub = currentCat?.subcategories.find(s => s.slug === (manualSubSlug || activeSubSlug));
      const preferredPrintType = currentCat
        ? printTypeForCategory(currentCat.slug)
        : (effectiveOrderProduct ? printTypeForCategory(effectiveOrderProduct.categorySlug) : DEFAULT_SETTINGS.printType);
      const printType = PRINT_TYPES.includes(preferredPrintType) ? preferredPrintType : PRINT_TYPES[0];
      const subcategory = currentSub
        ? currentSub.name
        : (effectiveOrderProduct ? getOrderSubcategoryName(effectiveOrderProduct) : (subcategoriesForPrintType(printType)[0] || ""));
      const fileRule = getFilePricingRule(pricingRules, printType, subcategory);
      const isBwBinding = isBlackWhiteBindingContext(subcategory, effectiveOrderProduct);
      const isCert = isCertificateContext(printType, subcategory, effectiveOrderProduct);
      const fSizeOptions = getAvailableSizeOptions(fileRule, isBwBinding);
      const initialSize = defaultOption(fileRule?.paperSizes, isBwBinding ? ["A4", "A5"] : SIZE_OPTIONS);
      const sizeRule = findNamedRule(fileRule?.paperSizes, initialSize);
      const initialPaper = defaultOption(sizeRule?.paperTypes || fileRule?.paperTypes, PAPER_OPTIONS);
      const initialBinding = isCert ? "No Binding" : defaultOption(sizeRule?.bindingTypes || fileRule?.bindingTypes, BINDING_OPTIONS);
      const initialCover = isCert ? "No Cover" : defaultOption(sizeRule?.coverTypes || fileRule?.coverTypes, COVER_OPTIONS);
      const initialLamination = isCert ? defaultOption(sizeRule?.laminationTypes || fileRule?.laminationTypes, LAMINATION_OPTIONS) : "Without Lamination";

      newEntries.push({
        id,
        file,
        fileName: file.name,
        fileSize: file.size,
        totalPages: 0,
        pages: 1,
        pageDetection: "pending",
        collapsed: false,
        ...DEFAULT_SETTINGS,
        printType,
        subcategory,
        size: initialSize,
        paper: initialPaper,
        sides: defaultOption(fileRule?.sideTypes, SIDES_OPTIONS),
        color: getAvailableColorOptions(fileRule, isCert)[0] || "Black and White",
        binding: initialBinding,
        cover: initialCover,
        lamination: initialLamination,
      });
    }

    if (!newEntries.length) return;
    setUploadedFiles(prev => [...prev, ...newEntries]);
    setOpenSection("settings");

    for (const entry of newEntries) {
      let count = 0;
      let tempUploadId: number | undefined;
      let uploadUrl: string | undefined;
      try {
        const uploaded = await uploadCheckoutPdf(entry.file);
        count = uploaded.pages;
        tempUploadId = uploaded.fileItemId;
        uploadUrl = uploaded.uploadUrl;
      } catch {
        count = await getPdfPageCount(entry.file);
      }
      setUploadedFiles(prev => prev.map(f => f.id === entry.id
        ? { ...f, totalPages: count, pages: count > 0 ? count : 1, pageDetection: count > 0 ? "success" : "failed", tempUploadId, uploadUrl }
        : f
      ));
      if (count > 0 && tempUploadId) toast.success(`"${entry.fileName}" uploaded - ${count} pages detected`, { duration: 2500 });
      else if (count > 0) toast.success(`"${entry.fileName}" - ${count} pages detected`, { duration: 2500 });
      else toast.warning(`"${entry.fileName}" - page count detection failed. Please enter manually.`);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [uploadedFiles, effectiveOrderProduct, checkoutPricingRule, manualCatSlug, manualSubSlug, activeCatSlug, activeSubSlug, pricingRules]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    processFiles(e.dataTransfer.files);
  }, [processFiles]);

  const removeFile = (id: string) => { setUploadedFiles(p => p.filter(f => f.id !== id)); };
  const updateFile = (id: string, patch: Partial<FileSettings>) => setUploadedFiles(p => p.map(f => f.id === id ? { ...f, ...patch } : f));
  const toggleCollapse = (id: string) => updateFile(id, { collapsed: !uploadedFiles.find(f => f.id === id)?.collapsed });

  /* Ã¢â€â‚¬Ã¢â€â‚¬ Coupon Ã¢â€â‚¬Ã¢â€â‚¬ */
  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) { setCouponError("Enter a coupon code"); return; }
    if (COUPONS[code]) { setAppliedCoupon(code); setCouponError(""); toast.success(`Coupon "${code}" applied!`); }
    else { setCouponError("Invalid coupon code"); }
  };
  const removeCoupon = () => { setAppliedCoupon(null); setCouponInput(""); setCouponError(""); toast.info("Coupon removed"); };

  /* Ã¢â€â‚¬Ã¢â€â‚¬ Address validation Ã¢â€â‚¬Ã¢â€â‚¬ */
  const validateAddress = (): boolean => {
    const errors: Partial<typeof formData> = {};
    if (!formData.fullName.trim()) errors.fullName = "Required";
    if (!formData.phone.trim() || !/^\d{10}$/.test(formData.phone)) errors.phone = "10-digit number required";
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = "Valid email required";
    if (!formData.address.trim()) errors.address = "Required";
    if (!formData.city.trim()) errors.city = "Required";
    if (!formData.state.trim()) errors.state = "Required";
    if (!formData.pincode.trim() || !/^\d{6}$/.test(formData.pincode)) errors.pincode = "6-digit pincode required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /* Ã¢â€â‚¬Ã¢â€â‚¬ Effects Ã¢â€â‚¬Ã¢â€â‚¬ */
  useEffect(() => {
    if (user && !checkoutAsGuest) setFormData(p => ({ ...p, fullName: user.name || p.fullName, email: user.email || p.email, phone: user.phone || p.phone }));
  }, [user, checkoutAsGuest]);

  useEffect(() => {
    const s = document.createElement("script"); s.src = "https://checkout.razorpay.com/v1/checkout.js"; s.async = true;
    document.body.appendChild(s); return () => { if (document.body.contains(s)) document.body.removeChild(s); };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const s = await fetchPaymentSettings();
        setPaymentSettings(s);
        if (s.razorpay?.enabled) setPaymentMethod("razorpay");
        else if (s.phonepe?.enabled) setPaymentMethod("phonepe");
        else setPaymentMethod("cod");
      } catch {
        setPaymentSettings({ razorpay: { enabled: false }, phonepe: { enabled: false }, codEnabled: true });
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const settings = await fetchCheckoutChargeSettings();
        setCheckoutCharges({
          packagingCharge: Number(settings.packagingCharge || 0),
          shippingCharge: Number(settings.shippingCharge || 0),
          freeShippingThreshold: Number(settings.freeShippingThreshold || 500),
        });
      } catch {
        setCheckoutCharges({ packagingCharge: 0, shippingCharge: 0, freeShippingThreshold: 500 });
      }
    })();
  }, []);

  useEffect(() => {
    const pendingRaw = sessionStorage.getItem("pending_phonepe_order");
    if (!pendingRaw) return;

    (async () => {
      setVerifyingPayment(true);
      try {
        const pending = JSON.parse(pendingRaw);
        if (pending.guestCheckout || pending.order?.guestCheckout) {
          setCheckoutAsGuest(true);
          sessionStorage.setItem("checkout_mode", "guest");
        }
        if (pending.order?.deliveryAddress) {
          setFormData(prev => ({ ...prev, ...pending.order.deliveryAddress }));
          setAddressSaved(true);
          setOpenSection("payment");
        }
        const status = await checkPhonePePaymentStatus(pending.orderNumber);
        const paymentStatus = String(status.payment_status || "").toUpperCase();

        if (paymentStatus === "COMPLETED" || paymentStatus === "SUCCESS") {
          sessionStorage.removeItem("pending_phonepe_order");
          setOrderNumber(pending.orderNumber);
          setConfirmedOrderTotal(Number(pending.order?.total || 0));
          setPaymentMethod("phonepe");
          clearCart();
          setOrderPlaced(true);
          toast.success("Payment successful! Order confirmed.");
        } else if (paymentStatus === "FAILED") {
          sessionStorage.removeItem("pending_phonepe_order");
          toast.error("Payment failed. Please try again.");
        } else {
          toast.message("Payment not completed yet. You can retry from checkout.");
        }
      } catch (err: any) {
        toast.error(err?.message || "Could not verify payment status");
      } finally {
        setVerifyingPayment(false);
      }
    })();
  }, [clearCart]);

  /* Ã¢â€â‚¬Ã¢â€â‚¬ Place order Ã¢â€â‚¬Ã¢â€â‚¬ */
  const handlePlaceOrder = async () => {
    if (processing || verifyingPayment) return;
    if (uploadedFiles.length === 0 && items.length === 0) { toast.error("Please upload at least one file"); setOpenSection("upload"); return; }
    if (!addressSaved) { toast.error("Please save your delivery address first"); setOpenSection("address"); return; }
    if (uploadedFiles.some(f => f.pageDetection === "pending")) { toast.error("Waiting for page detection to complete..."); return; }

    setProcessing(true);
    const orderNum = "SPR-" + Date.now().toString().slice(-10);
    setOrderNumber(orderNum);

    const estimatedDate = new Date(); estimatedDate.setDate(estimatedDate.getDate() + 5);
    const estimatedDelivery = estimatedDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

    const virtualItems = uploadedFiles.map(f => {
      const isCert = isCertificateContext(f.printType, f.subcategory, effectiveOrderProduct);
      return {
        id: `checkout_${f.id}`,
        productName: f.subcategory ? `${f.subcategory}: ${f.fileName}` : (effectiveOrderProduct?.productName ? `${effectiveOrderProduct.productName}: ${f.fileName}` : `Document: ${f.fileName}`),
        categorySlug: categorySlugForPrintType(f.printType),
        subcategorySlug: slugish(f.subcategory || effectiveOrderProduct?.subcategorySlug || "pdf-print"),
        configuration: {
          pages: f.pages,
          copies: f.copies,
          sides: f.sides,
          color: f.color,
          size: f.size,
          paper: f.paper,
          binding: isCert ? "No Binding" : f.binding,
          cover: isCert ? "No Cover" : f.cover,
          lamination: isCert ? (f.lamination || "Without Lamination") : undefined,
          printType: f.printType,
        },
        price: Math.round(calculateFileLine(f).total),
        quantity: 1,
        files: [{ name: f.fileName, pageCount: f.totalPages, pagesToPrint: f.pages, instruction: f.specialInstructions }],
      };
    });

    const order: any = {
      id: "order_" + Date.now(), orderNumber: orderNum, date: new Date().toISOString(), status: "pending",
      items: [...items, ...virtualItems],
      files: uploadedFiles.map(f => {
        const isCert = isCertificateContext(f.printType, f.subcategory, effectiveOrderProduct);
        return {
          fileName: f.fileName,
          productName: f.subcategory || effectiveOrderProduct?.productName || "Document",
          categorySlug: categorySlugForPrintType(f.printType),
          categoryName: f.printType.toUpperCase(),
          subcategorySlug: slugish(f.subcategory || "pdf-print"),
          subcategoryName: f.subcategory || "PDF PRINT",
          totalPages: f.totalPages,
          pages: f.pages,
          startPage: 1,
          endPage: f.pages,
          copies: f.copies,
          color: f.color,
          binding: isCert ? "No Binding" : f.binding,
          cover: isCert ? "No Cover" : f.cover,
          lamination: isCert ? (f.lamination || "Without Lamination") : undefined,
          sides: f.sides,
          size: f.size,
          paper: f.paper,
          printType: f.printType,
          tempUploadId: f.tempUploadId,
          uploadUrl: f.uploadUrl,
        };
      }),
      subtotal: netCharges, gst: 0, shipping: shippingCharge, total: totalAmount,
      deliveryAddress: { ...formData },
      paymentMethod: paymentMethod === "razorpay" ? "Razorpay" : paymentMethod === "phonepe" ? "PhonePe" : "Cash on Delivery",
      paymentId: "", estimatedDelivery, coupon: appliedCoupon, discount,
      guestCheckout: checkoutAsGuest || !isAuthenticated,
    };

    const cartPayload = items.map(item => ({
      productName: item.productName,
      categorySlug: item.categorySlug,
      subcategorySlug: item.subcategorySlug,
      price: item.price,
      quantity: item.quantity,
    }));

    if (paymentMethod === "phonepe") {
      try {
        const appBase = ((import.meta.env.VITE_APP_URL as string) || window.location.origin).replace(/\/$/, "");
        const redirectUrl = `${appBase}/checkout`;
        const quote = await fetchCheckoutQuote({
          files: order.files,
          cartItems: cartPayload,
          coupon: appliedCoupon,
          deliveryAddress: formData,
        });
        const quotedAmountPaise = Math.max(100, Number(quote.amountPaise || 0));

        order.subtotal = quote.netCharges ?? order.subtotal;
        order.shipping = quote.shippingCharge ?? order.shipping;
        order.total = quote.totalAmount ?? order.total;
        order.discount = quote.discount ?? order.discount;

        const paymentPayload = {
          amount: quotedAmountPaise,
          order_number: orderNum,
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          redirect_url: redirectUrl,
          userId: !order.guestCheckout && user?.id ? user.id : null,
          items: order.items,
          files: order.files,
          cartItems: cartPayload,
          coupon: appliedCoupon,
          deliveryAddress: formData,
        };
        const payment = await createPhonePePayment(paymentPayload);

        sessionStorage.setItem("pending_phonepe_order", JSON.stringify({ orderNumber: orderNum, order, guestCheckout: order.guestCheckout }));
        const paymentUrl = payment.redirectUrl || payment.data?.redirectUrl;
        if (!paymentUrl) throw new Error("PhonePe did not return a payment URL");
        // Same-tab redirect Ã¢â‚¬â€ required for PhonePe QR / UPI flows
        window.location.assign(paymentUrl);
        return;
      } catch (err: any) {
        toast.error(err?.message || "Failed to start PhonePe payment");
        setProcessing(false);
        return;
      }
    }

    const result = await addOrder(order);
    if (result.success) {
      setConfirmedOrderTotal(totalAmount);
      clearCart();
      setOrderPlaced(true);
      toast.success("Order placed successfully!");
    }
    else toast.error(result.error || "Failed to place order");
    setProcessing(false);
  };

  /* Ã¢â€â‚¬Ã¢â€â‚¬ Section header Ã¢â€â‚¬Ã¢â€â‚¬ */
  const completed: Partial<Record<Section, boolean>> = {
    login: isAuthenticated || true,
    upload: uploadedFiles.length > 0 || items.length > 0,
    settings: (uploadedFiles.length > 0 || items.length > 0) && uploadedFiles.every(f => f.pageDetection !== "pending"),
    address: addressSaved,
    payment: addressSaved,
  };

  const hasFiles = uploadedFiles.length > 0 || items.length > 0;
  const settingsReady = hasFiles && uploadedFiles.every(f => f.pageDetection !== "pending");

  const goToStep = (section: Section) => {
    if (section === "settings" && !hasFiles) {
      toast.error("Please upload at least one PDF first");
      setOpenSection("upload");
      return;
    }
    if (section === "address" && !settingsReady) {
      toast.error("Please finish document settings first");
      setOpenSection(hasFiles ? "settings" : "upload");
      return;
    }
    if (section === "payment" && !addressSaved) {
      toast.error("Please save your delivery address first");
      setOpenSection("address");
      return;
    }
    setOpenSection(section);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSaveAddress = () => {
    if (!validateAddress()) return;
    if (!isAuthenticated) {
      setCheckoutAsGuest(true);
      sessionStorage.setItem("checkout_mode", "guest");
    }
    setAddressSaved(true);
    setOpenSection("payment");
    toast.success("Address saved!");
  };

  const continueAsGuest = () => {
    setCheckoutAsGuest(true);
    sessionStorage.setItem("checkout_mode", "guest");
    setOpenSection("upload");
  };

  const useSignedInAccount = () => {
    setCheckoutAsGuest(false);
    sessionStorage.removeItem("checkout_mode");
    if (user) setFormData(p => ({ ...p, fullName: user.name || p.fullName, email: user.email || p.email, phone: user.phone || p.phone }));
    setOpenSection("upload");
  };

  const handleProceedFromSettings = () => {
    if (uploadedFiles.some(f => f.pageDetection === "pending")) {
      toast.warning("Still detecting pages, please wait...");
      return;
    }
    if (!hasFiles) {
      toast.error("Upload at least one document to continue");
      setOpenSection("upload");
      return;
    }
    setOpenSection("address");
    toast.success("Print settings saved");
  };

  const primaryAction = () => {
    switch (openSection) {
      case "login":
        goToStep("upload");
        break;
      case "upload":
        if (!hasFiles) {
          toast.error("Upload at least one PDF to continue");
          fileInputRef.current?.click();
          return;
        }
        goToStep("settings");
        break;
      case "settings":
        handleProceedFromSettings();
        break;
      case "address":
        handleSaveAddress();
        break;
      case "payment":
        handlePlaceOrder();
        break;
    }
  };

  const primaryCta = (() => {
    switch (openSection) {
      case "login":
        return { label: "Continue to Upload", disabled: false, hint: "Login optional - guest checkout available" };
      case "upload":
        return {
          label: hasFiles ? "Proceed to Settings" : "Upload PDF",
          disabled: !hasFiles,
          hint: hasFiles ? `${uploadedFiles.length} file(s) ready` : "Drag & drop or click to upload",
        };
      case "settings":
        return {
          label: "Save Settings & Continue",
          disabled: !settingsReady,
          hint: settingsReady ? "Review options, then continue to address" : "Waiting for page detection...",
        };
      case "address":
        return {
          label: "Save Address & Proceed to Payment",
          disabled: false,
          hint: addressSaved ? "Address saved - you can edit and save again" : "Fill all required fields",
        };
      case "payment":
        return {
          label: paymentMethod === "phonepe"
            ? `Pay with PhonePe - ${formatCurrency(totalAmount)}`
            : paymentMethod === "razorpay"
              ? `Pay with Razorpay - ${formatCurrency(totalAmount)}`
              : `Place Order - ${formatCurrency(totalAmount)}`,
          disabled: !addressSaved || processing || verifyingPayment,
          hint: !addressSaved ? "Save delivery address first" : "Secure checkout",
        };
      default:
        return { label: "Continue", disabled: false, hint: "" };
    }
  })();

  const SectionHeader = ({ num, title, section, badge }: { num: number; title: string; section: Section; badge?: string }) => {
    const isOpen = openSection === section;
    const done = completed[section];
    return (
      <button
        type="button"
        onClick={() => goToStep(section)}
        className={`w-full flex items-center justify-between gap-4 px-5 py-4 sm:px-6 sm:py-5 transition-all duration-200 ${
          isOpen
            ? "bg-gradient-to-r from-purple-700 via-purple-600 to-purple-500 text-white shadow-sm"
            : done
              ? "bg-gradient-to-r from-purple-50 to-white text-gray-950 hover:from-purple-100 hover:to-white"
              : "bg-white text-gray-900 hover:bg-gray-50"
        }`}
      >
        <div className="flex min-w-0 items-center gap-4 sm:gap-5">
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-extrabold transition-all ${
            isOpen
              ? "bg-white text-purple-700 shadow-md ring-4 ring-white/20"
              : done
                ? "bg-purple-700 text-white shadow-sm ring-4 ring-purple-100"
                : "bg-gray-100 text-gray-500 ring-1 ring-gray-200"
          }`}>
            {done && !isOpen ? <CheckCheck className="h-5 w-5" /> : num}
          </span>
          <div className="min-w-0 text-left">
            <span className="block truncate text-base font-extrabold tracking-normal">{title}</span>
            {badge && !isOpen && (
              <span className="mt-0.5 block truncate text-sm font-medium text-gray-600">
                {badge}
              </span>
            )}
            {badge && isOpen && (
              <span className="mt-0.5 block truncate text-sm font-medium text-purple-100">
                {badge}
              </span>
            )}
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 shrink-0 text-white/90" />
        ) : (
          <ChevronDown className="h-5 w-5 shrink-0 text-gray-400" />
        )}
      </button>
    );
  };

  const ProgressStepper = () => (
    <div className="bg-white/90 backdrop-blur border-b border-gray-200">
      <div className="max-w-[1440px] mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-1 sm:gap-2 overflow-x-auto pb-1">
          {SECTIONS.map((step, i) => {
            const active = openSection === step.id;
            const done = completed[step.id];
            const current = stepIndex(openSection);
            return (
              <div key={step.id} className="flex items-center flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() => goToStep(step.id)}
                  className={`flex flex-col sm:flex-row items-center gap-1 sm:gap-2 w-full rounded-xl px-2 py-2 transition-colors ${active ? "text-purple-700 bg-purple-50" : done ? "text-purple-700" : "text-gray-400"}`}
                >
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${active ? "bg-purple-600 text-white ring-4 ring-purple-100" : done ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-500"}`}>
                    {done && !active ? <CheckCheck className="w-3.5 h-3.5" /> : i + 1}
                  </span>
                  <span className={`text-[10px] sm:text-xs font-bold truncate ${active ? "text-purple-700" : ""}`}>{step.short}</span>
                </button>
                {i < SECTIONS.length - 1 && (
                  <div className={`hidden sm:block h-0.5 flex-1 mx-1 rounded ${i < current ? "bg-purple-400" : "bg-gray-200"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  /* Ã¢â€â‚¬Ã¢â€â‚¬ Order Confirmation Ã¢â€â‚¬Ã¢â€â‚¬ */
  if (orderPlaced) {
    const paidAmount = confirmedOrderTotal || totalAmount;
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-8 text-center text-white">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h1 className="text-2xl font-bold mb-1">Order Placed!</h1>
              <p className="text-emerald-100 text-sm">Your printing order is confirmed</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
                {[["Order Number", orderNumber], ["Total Paid", formatCurrency(paidAmount)], ["Payment", paymentMethod === "cod" ? "Cash on Delivery" : paymentMethod === "razorpay" ? "Razorpay" : "PhonePe"], ["Estimated Delivery", "5-7 business days"]].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <span className="text-gray-500">{k}</span>
                    <span className="font-semibold text-gray-900">{v}</span>
                  </div>
                ))}
              </div>
              {formData.address && (
                <div className="bg-purple-50 rounded-xl p-4 text-sm">
                  <p className="font-semibold text-purple-900 mb-1 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />Delivery To</p>
                  <p className="text-purple-700">{formData.fullName}, {formData.phone}</p>
                  <p className="text-purple-600 text-xs mt-0.5">{formData.address}, {formData.city}, {formData.state} - {formData.pincode}</p>
                </div>
              )}
              <div className="flex gap-3 pt-1">
                <Button variant="outline" className="flex-1 rounded-xl" onClick={() => navigate("/")}>Back to Home</Button>
                <Button className="flex-1 rounded-xl bg-purple-600 hover:bg-purple-700" onClick={() => navigate("/all-products")}>Shop More</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* Ã¢â€â‚¬Ã¢â€â‚¬ Main Ã¢â€â‚¬Ã¢â€â‚¬ */
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-purple-50 pb-28" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Top bar */}
      <div className="bg-white/95 backdrop-blur border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-700 to-purple-400 flex items-center justify-center flex-shrink-0 shadow-md shadow-purple-200">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-lg leading-tight">
              {effectiveOrderProduct ? "Place Your Order" : "Checkout"}
            </h1>
            <p className="text-xs text-gray-500">
              {effectiveOrderProduct ? `${effectiveOrderProduct.categoryName} - ${effectiveOrderProduct.productName}` : "Upload > Settings > Address > Pay"}
            </p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs text-gray-500">Order total</p>
            <p className="font-bold text-purple-700 text-lg leading-tight">{formatCurrency(totalAmount)}</p>
          </div>
        </div>
      </div>

      <ProgressStepper />

      {effectiveOrderProduct && (
        <div className="max-w-[1440px] mx-auto px-4 pt-4">
          <div className="flex items-center gap-3 rounded-2xl border border-purple-200 bg-white px-4 py-3 shadow-sm">
            {effectiveOrderProduct.productImage ? (
              <img src={effectiveOrderProduct.productImage} alt="" className="w-12 h-12 rounded-lg object-cover border border-purple-100" />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-purple-600">{effectiveOrderProduct.categoryName}</p>
              <p className="text-sm font-bold text-purple-900 truncate">{effectiveOrderProduct.productName}</p>
              <p className="text-xs text-purple-700 mt-0.5">Upload your PDF, configure print options, then pay securely.</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[1440px] mx-auto px-4 py-5 flex flex-col lg:flex-row gap-6">
        {/* Ã¢â€â‚¬Ã¢â€â‚¬ LEFT COLUMN Ã¢â€â‚¬Ã¢â€â‚¬ */}
        <div className="flex-1 min-w-0 space-y-3">

          {/* Ã¢â€â‚¬Ã¢â€â‚¬ 1. LOGIN Ã¢â€â‚¬Ã¢â€â‚¬ */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <SectionHeader num={1} title="Login" section="login"
              badge={checkoutAsGuest ? "Guest checkout" : isAuthenticated ? `${user?.name} - ${user?.email}` : "Not logged in"} />
            {openSection === "login" && (
              <div className="p-5">
                {isAuthenticated && !checkoutAsGuest ? (
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-purple-700 font-bold text-lg">{(user?.name || "U")[0].toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{user?.name}</p>
                      <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                      {user?.phone && <p className="text-sm text-gray-500">{user.phone}</p>}
                    </div>
                    <div className="flex flex-wrap gap-2"><button type="button" onClick={() => goToStep("upload")} className="px-4 py-2.5 text-sm bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-semibold shadow-md shadow-purple-200">Continue <ArrowRight className="w-4 h-4 inline ml-1" /></button><button type="button" onClick={continueAsGuest} className="px-4 py-2.5 text-sm border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors font-semibold">Checkout as Guest</button></div>
                  </div>
                ) : checkoutAsGuest ? (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">Guest checkout selected</p>
                      <p className="text-sm text-gray-500">Your order will use the delivery details entered below, not a saved account.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {isAuthenticated && (
                        <Button variant="outline" className="rounded-lg" onClick={useSignedInAccount}>Use Signed-in Account</Button>
                      )}
                      <Button className="bg-purple-600 hover:bg-purple-700 rounded-lg" onClick={() => goToStep("upload")}>Continue</Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">Login to auto-fill your details and track your order.</p>
                    <div className="flex flex-wrap gap-2">
                      <Button className="bg-purple-600 hover:bg-purple-700 rounded-lg" onClick={() => navigate("/login", { state: { from: "/checkout" } })}>Login</Button>
                      <Button variant="outline" className="rounded-lg" onClick={() => navigate("/signup", { state: { from: "/checkout" } })}>Sign Up</Button>
                      <Button variant="ghost" className="text-gray-500 rounded-lg" onClick={continueAsGuest}>Continue as Guest <ArrowRight className="w-4 h-4 ml-1" /></Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Ã¢â€â‚¬Ã¢â€â‚¬ 2. UPLOAD DOCUMENTS Ã¢â€â‚¬Ã¢â€â‚¬ */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <SectionHeader num={2} title="Upload Documents" section="upload"
              badge={uploadedFiles.length > 0 ? `${uploadedFiles.length} file(s) uploaded` : undefined} />
            {openSection === "upload" && (
              <div className="p-5 space-y-4">
                {/* Product Type / Category selector */}
                <div className="rounded-2xl border border-purple-200 bg-purple-50/70 p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold text-purple-900 uppercase tracking-wide">
                        Product Type &amp; Category
                      </p>
                      <p className="text-xs text-purple-700 mt-0.5">
                        Select or customize your product category to get instant, accurate pricing.
                      </p>
                    </div>
                    {effectiveOrderProduct && (
                      <span className="self-start sm:self-auto text-[11px] font-semibold text-purple-700 bg-purple-100 border border-purple-200 px-3 py-1 rounded-full">
                        {effectiveOrderProduct.categoryName} &rsaquo; {effectiveOrderProduct.productName}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-purple-900">Category</Label>
                      <select
                        value={manualCatSlug || activeCatSlug || ""}
                        onChange={e => handleCategoryChange(e.target.value)}
                        className="h-10 w-full rounded-xl border border-purple-200 bg-white px-3 text-sm font-semibold outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100 appearance-none cursor-pointer text-gray-900"
                      >
                        <option value="">-- Select Category --</option>
                        {categories.map(cat => (
                          <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-purple-900">Subcategory</Label>
                      <select
                        value={manualSubSlug || activeSubSlug || ""}
                        onChange={e => handleSubcategoryChange(e.target.value)}
                        disabled={!(manualCatSlug || activeCatSlug)}
                        className="h-10 w-full rounded-xl border border-purple-200 bg-white px-3 text-sm font-semibold outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100 appearance-none cursor-pointer text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">-- Select Subcategory --</option>
                        {activeCategory?.subcategories.map(sub => (
                          <option key={sub.slug} value={sub.slug}>{sub.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div
                  ref={dropRef}
                  className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-200 ${isDragging ? "border-purple-500 bg-purple-50 scale-[0.99]" : "border-gray-300 hover:border-purple-400 hover:bg-purple-50/30"}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                >
                  <div className={`flex flex-col items-center gap-3 transition-colors ${isDragging ? "text-purple-600" : "text-gray-400"}`}>
                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-colors ${isDragging ? "bg-purple-100" : "bg-gray-100"}`}>
                      <CloudUpload className={`w-10 h-10 ${isDragging ? "text-purple-500" : "text-gray-400"}`} />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-gray-700">{isDragging ? "Drop files here!" : "Drag & Drop to Upload Files"}</p>
                      <p className="text-xs text-gray-400 mt-1">or click to browse - <span className="text-purple-500 font-medium">PDF files only</span></p>
                    </div>
                  </div>
                  <input ref={fileInputRef} type="file" multiple accept=".pdf" onChange={e => processFiles(e.currentTarget.files!)} className="hidden" />
                </div>

                {/* Uploaded files mini-list */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    {uploadedFiles.map((f, i) => (
                      <div key={f.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <FileText className="w-4 h-4 text-purple-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{i+1}. {f.fileName}</p>
                          <p className="text-xs text-gray-400">{formatBytes(f.fileSize)} - {f.pageDetection === "pending" ? <span className="text-amber-500 animate-pulse">Detecting pages...</span> : f.pageDetection === "success" ? <span className="text-emerald-600">{f.totalPages} pages</span> : <span className="text-red-500">Detection failed</span>}</p>
                        </div>
                        <button onClick={() => removeFile(f.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    ))}
                  </div>
                )}

                {/* WeTransfer info box */}
                <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 text-xs text-purple-900 leading-relaxed">
                  <p className="font-bold uppercase mb-1.5 text-purple-700">Having trouble uploading?</p>
                  <p>If file uploading fails or page redirects to the same page, send your file via{" "}
                    <a href="https://wetransfer.com" target="_blank" rel="noreferrer" className="underline font-medium">WeTransfer</a>{" "}
                    or WhatsApp us at{" "}
                    <span className="text-purple-700 font-bold">+91 9323684301</span>.
                  </p>
                  <a href="https://wa.me/919323684301" target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1.5 mt-2.5 bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-purple-700 transition-colors">
                    Click Here to WhatsApp
                  </a>
                </div>

                {uploadedFiles.length > 0 && (
                  <button type="button" onClick={() => goToStep("settings")}
                    className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-purple-200 flex items-center justify-center gap-2">
                    Proceed to Print Settings <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Ã¢â€â‚¬Ã¢â€â‚¬ 3. DOCUMENTS SETTING Ã¢â€â‚¬Ã¢â€â‚¬ */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <SectionHeader num={3} title="Documents Setting" section="settings"
              badge={uploadedFiles.length > 0 ? `${uploadedFiles.length} document(s)` : undefined} />
            {openSection === "settings" && (
              <div>
                {/* Instructions */}
                <div className="bg-emerald-50 border-b border-emerald-200 px-5 py-4">
                  <p className="text-xs font-bold text-emerald-800 uppercase tracking-wide mb-2">Important Instructions</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs text-emerald-900 leading-relaxed">
                    <li>For Back2Back print, enter <strong>half</strong> the number of document pages.</li>
                    <li>Please verify that the page count is correct before submitting.</li>
                    <li>Documents are printed in the same resolution they were uploaded.</li>
                    <li>You can select different print types for each document in the same order.</li>
                    <li>For B&W printing, ensure the document is actually in B&W - color docs will appear faded.</li>
                    <li>We are not responsible for any copyrighted content uploaded by you.</li>
                    <li>If any font issues exist in .docx/.pptx files, our team will call you on <strong>9323684301</strong>.</li>
                  </ol>
                </div>

                {uploadedFiles.length === 0 ? (
                  <div className="p-8 text-center">
                    <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm mb-3">No files uploaded yet.</p>
                    <button type="button" onClick={() => goToStep("upload")} className="text-purple-600 text-sm font-semibold hover:underline">Upload files</button>
                  </div>
                ) : (
                  <div>
                    {uploadedFiles.map((f, idx) => (
                      <div key={f.id} className="border-b border-gray-100 last:border-0">
                        {/* File row header */}
                        <div className={`flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center ${f.collapsed ? "bg-white" : "bg-gray-50"}`}>
                          <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center flex-shrink-0">{idx + 1}</span>
                          <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium text-gray-800 truncate block">{f.fileName}</span>
                            <span className="text-xs text-gray-400">{formatBytes(f.fileSize)}</span>
                          </div>
                          {/* Detection badge */}
                          {f.pageDetection === "pending" && <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full animate-pulse flex-shrink-0">Detecting...</span>}
                          {f.pageDetection === "success" && <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex-shrink-0">{f.totalPages}p detected</span>}
                          {f.pageDetection === "failed" && <span className="text-xs text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full flex-shrink-0 flex items-center gap-1"><AlertCircle className="w-3 h-3" />Failed</span>}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button onClick={() => toggleCollapse(f.id)} className="text-xs border border-gray-300 text-gray-600 px-2.5 py-1 rounded-lg hover:bg-gray-100 transition-colors font-medium">
                              {f.collapsed ? "Edit" : "Collapse"}
                            </button>
                            <button onClick={() => removeFile(f.id)} className="text-xs border border-red-200 text-red-500 px-2.5 py-1 rounded-lg hover:bg-red-50 transition-colors font-medium flex items-center gap-1">
                              <Trash2 className="w-3 h-3" />Delete
                            </button>
                          </div>
                        </div>

                        {/* Settings panel */}
                        {!f.collapsed && (
                          <div className="px-5 pb-5 pt-4 space-y-4 bg-white">
                            {/* Manual page entry if detection failed */}
                            {f.pageDetection === "failed" && (
                              <div className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center">
                                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                                <p className="text-xs text-red-700 flex-1">Auto-detection failed. Enter page count manually.</p>
                                <input type="number" min={1} placeholder="Pages" value={f.pages}
                                  onChange={e => updateFile(f.id, { pages: Math.max(1, parseInt(e.target.value) || 1) })}
                                  className="h-10 w-full rounded-xl border border-red-300 bg-white px-3 text-sm font-semibold outline-none focus:border-purple-400 sm:w-28" />
                                <button onClick={async () => { updateFile(f.id, { pageDetection: "pending" }); const c = await getPdfPageCount(f.file); updateFile(f.id, { totalPages: c, pages: c > 0 ? c : f.pages, pageDetection: c > 0 ? "success" : "failed" }); }}
                                  className="flex h-10 items-center justify-center gap-1 rounded-xl border border-purple-200 bg-white px-4 text-xs font-bold text-purple-700 transition-colors hover:bg-purple-50">
                                  <RefreshCw className="w-3 h-3" />Retry
                                </button>
                              </div>
                            )}

                            {/* Category/Subcategory info badge when set manually */}
                            {!locationOrderProduct && effectiveOrderProduct && (
                              <div className="rounded-xl border border-purple-200 bg-purple-50 px-4 py-2.5 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-purple-500 shrink-0" />
                                <span className="text-xs font-semibold text-purple-800">
                                  {effectiveOrderProduct.categoryName} &rsaquo; {effectiveOrderProduct.productName}
                                </span>
                              </div>
                            )}

                            {(() => {
                              const fileRule = getFilePricingRule(pricingRules, f.printType, f.subcategory);
                              const isBwBinding = isBlackWhiteBindingContext(f.subcategory, effectiveOrderProduct);
                              const isCert = isCertificateContext(f.printType, f.subcategory, effectiveOrderProduct);
                              const fSizeOptions = getAvailableSizeOptions(fileRule, isBwBinding);
                              const sizeRule = findNamedRule(fileRule?.paperSizes, f.size);
                              const fPaperOptions = sizeRule?.paperTypes?.length
                                ? enabledOptions(sizeRule.paperTypes, PAPER_OPTIONS)
                                : enabledOptions(fileRule?.paperTypes, PAPER_OPTIONS);
                              const fSideOptions = enabledOptions(fileRule?.sideTypes, SIDES_OPTIONS);
                              const fColorOptions = getAvailableColorOptions(fileRule, isCert);
                              const fBindingOptions = sizeRule?.bindingTypes?.length
                                ? enabledOptions(sizeRule.bindingTypes, BINDING_OPTIONS)
                                : enabledOptions(fileRule?.bindingTypes, BINDING_OPTIONS);
                              const fCoverOptions = sizeRule?.coverTypes?.length
                                ? enabledOptions(sizeRule.coverTypes, COVER_OPTIONS)
                                : enabledOptions(fileRule?.coverTypes, COVER_OPTIONS);
                              const fLaminationOptions = sizeRule?.laminationTypes?.length
                                ? enabledOptions(sizeRule.laminationTypes, LAMINATION_OPTIONS)
                                : enabledOptions(fileRule?.laminationTypes, LAMINATION_OPTIONS);

                              return (
                                <>
                                  {/* Row 1: Category & Subcategory */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <SelectField
                                      label="Category"
                                      value={f.printType}
                                      options={PRINT_TYPES}
                                      disabled={false}
                                      onChange={v => {
                                        const nextSubs = subcategoriesForPrintType(v);
                                        const sub = nextSubs[0] || "";
                                        const newRule = getFilePricingRule(pricingRules, v, sub);
                                        const isSubBw = isBlackWhiteBindingContext(sub, effectiveOrderProduct);
                                        const isNextCert = isCertificateContext(v, sub, effectiveOrderProduct);
                                        const nextSizeOpts = getAvailableSizeOptions(newRule, isSubBw);
                                        const nextSize = defaultOption(newRule?.paperSizes, isSubBw ? ["A4", "A5"] : SIZE_OPTIONS);
                                        const nextSizeRule = findNamedRule(newRule?.paperSizes, nextSize);
                                        const nextColorOpts = getAvailableColorOptions(newRule, isNextCert);
                                        const nextColor = nextColorOpts.includes(f.color) ? f.color : (nextColorOpts[0] || "Black and White");
                                        updateFile(f.id, {
                                          printType: v,
                                          subcategory: sub,
                                          size: nextSize,
                                          paper: defaultOption(nextSizeRule?.paperTypes || newRule?.paperTypes, PAPER_OPTIONS),
                                          sides: defaultOption(newRule?.sideTypes, SIDES_OPTIONS),
                                          color: nextColor,
                                          binding: isNextCert ? "No Binding" : defaultOption(nextSizeRule?.bindingTypes || newRule?.bindingTypes, BINDING_OPTIONS),
                                          cover: isNextCert ? "No Cover" : defaultOption(nextSizeRule?.coverTypes || newRule?.coverTypes, COVER_OPTIONS),
                                          lamination: isNextCert ? defaultOption(nextSizeRule?.laminationTypes || newRule?.laminationTypes, LAMINATION_OPTIONS) : "Without Lamination",
                                        });
                                      }}
                                    />
                                    <SelectField
                                      label="Subcategory"
                                      value={f.subcategory || ""}
                                      options={subcategoriesForPrintType(f.printType)}
                                      disabled={false}
                                      onChange={v => {
                                        const newRule = getFilePricingRule(pricingRules, f.printType, v);
                                        const isSubBw = isBlackWhiteBindingContext(v, effectiveOrderProduct);
                                        const isNextCert = isCertificateContext(f.printType, v, effectiveOrderProduct);
                                        const nextSizeOpts = getAvailableSizeOptions(newRule, isSubBw);
                                        const nextSize = nextSizeOpts.includes(f.size) ? f.size : (nextSizeOpts[0] || "A4");
                                        const nextSizeRule = findNamedRule(newRule?.paperSizes, nextSize);
                                        const nextColorOpts = getAvailableColorOptions(newRule, isNextCert);
                                        const nextColor = nextColorOpts.includes(f.color) ? f.color : (nextColorOpts[0] || "Black and White");
                                        updateFile(f.id, {
                                          subcategory: v,
                                          size: nextSize,
                                          paper: defaultOption(nextSizeRule?.paperTypes || newRule?.paperTypes, PAPER_OPTIONS),
                                          sides: defaultOption(newRule?.sideTypes, SIDES_OPTIONS),
                                          color: nextColor,
                                          binding: isNextCert ? "No Binding" : defaultOption(nextSizeRule?.bindingTypes || newRule?.bindingTypes, BINDING_OPTIONS),
                                          cover: isNextCert ? "No Cover" : defaultOption(nextSizeRule?.coverTypes || newRule?.coverTypes, COVER_OPTIONS),
                                          lamination: isNextCert ? defaultOption(nextSizeRule?.laminationTypes || newRule?.laminationTypes, LAMINATION_OPTIONS) : "Without Lamination",
                                        });
                                      }}
                                    />
                                  </div>

                                  {/* Row 2: Pages | Copies | Paper */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[1fr_1fr_2fr] gap-3 items-start">
                                    <SpinnerField
                                      label="Pages"
                                      value={f.pages}
                                      disabled={f.pageDetection === "success"}
                                      helperText={f.pageDetection === "success" ? `Frozen at detected count: ${f.totalPages} pages` : undefined}
                                      onChange={v => updateFile(f.id, { pages: v })}
                                    />
                                    <SpinnerField label="Copies" value={f.copies} onChange={v => updateFile(f.id, { copies: v })} />
                                    <SelectField label="Paper" value={f.paper} options={fPaperOptions} onChange={v => updateFile(f.id, { paper: v })} />
                                  </div>

                                  {/* Row 3: Sides | Size | Color */}
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <SelectField label="Sides" value={f.sides} options={fSideOptions} onChange={v => updateFile(f.id, { sides: v })} />
                                    <SelectField
                                      label="Size"
                                      value={f.size}
                                      options={fSizeOptions}
                                      onChange={v => {
                                        const newSizeRule = findNamedRule(fileRule?.paperSizes, v);
                                        const nextPapers = newSizeRule?.paperTypes?.length ? enabledOptions(newSizeRule.paperTypes, PAPER_OPTIONS) : fPaperOptions;
                                        const nextBindings = newSizeRule?.bindingTypes?.length ? enabledOptions(newSizeRule.bindingTypes, BINDING_OPTIONS) : fBindingOptions;
                                        const nextCovers = newSizeRule?.coverTypes?.length ? enabledOptions(newSizeRule.coverTypes, COVER_OPTIONS) : fCoverOptions;
                                        const nextLams = newSizeRule?.laminationTypes?.length ? enabledOptions(newSizeRule.laminationTypes, LAMINATION_OPTIONS) : fLaminationOptions;
                                        updateFile(f.id, {
                                          size: v,
                                          paper: nextPapers.includes(f.paper) ? f.paper : (nextPapers[0] || f.paper),
                                          binding: isCert ? "No Binding" : (nextBindings.includes(f.binding) ? f.binding : (nextBindings[0] || f.binding)),
                                          cover: isCert ? "No Cover" : (nextCovers.includes(f.cover) ? f.cover : (nextCovers[0] || f.cover)),
                                          lamination: isCert ? (nextLams.includes(f.lamination || "") ? f.lamination : (nextLams[0] || "Without Lamination")) : undefined,
                                        });
                                      }}
                                    />
                                    <SelectField label="Color" value={f.color} options={fColorOptions} onChange={v => updateFile(f.id, { color: v })} />
                                  </div>

                                  {/* Row 4: Binding | Cover for regular documents, or Lamination for certificates */}
                                  {isCert ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      <SelectField
                                        label="Lamination Option"
                                        value={f.lamination || fLaminationOptions[0] || "Without Lamination"}
                                        options={fLaminationOptions}
                                        onChange={v => updateFile(f.id, { lamination: v })}
                                      />
                                    </div>
                                  ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      <SelectField label="Binding" value={f.binding} options={fBindingOptions} onChange={v => updateFile(f.id, { binding: v })} />
                                      <SelectField label="Cover" value={f.cover} options={fCoverOptions} onChange={v => updateFile(f.id, { cover: v })} />
                                    </div>
                                  )}
                                </>
                              );
                            })()}

                            <div>
                              <label className="block rounded-2xl border border-gray-200 bg-white px-3 py-2.5 shadow-sm transition-all hover:border-purple-200 focus-within:border-purple-400 focus-within:ring-4 focus-within:ring-purple-100">
                                <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-gray-500">Instructions</span>
                                <input type="text" placeholder="e.g. Print only odd pages, use staple..." value={f.specialInstructions}
                                  onChange={e => updateFile(f.id, { specialInstructions: e.target.value })}
                                  className="h-8 w-full bg-transparent text-sm font-medium text-gray-950 outline-none placeholder:text-gray-400" />
                              </label>
                            </div>

                            {/* Per-file price pill */}
                            {(() => {
                              const line = calculateFileLine(f);
                              return (
                                <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                                  <span>
                                    {f.pages} pages x {f.copies} copies x {formatCurrency(line.pricePerPage)}/page
                                    {line.bindingCost > 0 ? ` + ${formatCurrency(line.bindingCost)} binding` : ""}
                                    {line.coverCost > 0 ? ` + ${formatCurrency(line.coverCost)} cover` : ""}
                                    {line.laminationCost > 0 ? ` + ${formatCurrency(line.laminationCost)} lamination` : ""}
                                  </span>
                                  <span className="font-bold text-purple-700 text-sm">{formatCurrency(line.total)}</span>
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Bottom actions */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-4 py-4 bg-gradient-to-r from-gray-50 to-purple-50 border-t border-gray-200">
                      <button type="button"
                        onClick={() => goToStep("upload")}
                        className="flex items-center justify-center gap-2 text-sm text-purple-700 hover:text-purple-900 font-semibold border border-purple-200 bg-white hover:bg-purple-50 px-4 py-3 rounded-xl transition-colors">
                        <Plus className="w-4 h-4" />Upload More Files
                      </button>
                      <button type="button"
                        onClick={handleProceedFromSettings}
                        disabled={!settingsReady}
                        className="flex items-center justify-center gap-2 text-sm text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-purple-200">
                        Save & Continue to Address <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Ã¢â€â‚¬Ã¢â€â‚¬ 4. DELIVERY ADDRESS Ã¢â€â‚¬Ã¢â€â‚¬ */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <SectionHeader num={4} title="Delivery Address" section="address"
              badge={addressSaved ? `${formData.fullName} - ${formData.city}` : undefined} />
            {openSection === "address" && (
              <div className="p-5 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-600 flex items-center gap-1"><User className="w-3 h-3" />Full Name *</Label>
                    <Input placeholder="Enter your full name" value={formData.fullName} onChange={e => { setFormData(p => ({ ...p, fullName: e.target.value })); setFormErrors(p => ({ ...p, fullName: "" })); }} className={`h-10 rounded-lg ${formErrors.fullName ? "border-red-400" : ""}`} />
                    {formErrors.fullName && <p className="text-xs text-red-500">{formErrors.fullName}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-600 flex items-center gap-1"><Phone className="w-3 h-3" />Phone *</Label>
                    <Input type="tel" placeholder="10-digit mobile number" maxLength={10} value={formData.phone} onChange={e => { setFormData(p => ({ ...p, phone: e.target.value.replace(/\D/g, "") })); setFormErrors(p => ({ ...p, phone: "" })); }} className={`h-10 rounded-lg ${formErrors.phone ? "border-red-400" : ""}`} />
                    {formErrors.phone && <p className="text-xs text-red-500">{formErrors.phone}</p>}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-600 flex items-center gap-1"><Mail className="w-3 h-3" />Email Address *</Label>
                  <Input type="email" placeholder="your@email.com" value={formData.email} onChange={e => { setFormData(p => ({ ...p, email: e.target.value })); setFormErrors(p => ({ ...p, email: "" })); }} className={`h-10 rounded-lg ${formErrors.email ? "border-red-400" : ""}`} />
                  {formErrors.email && <p className="text-xs text-red-500">{formErrors.email}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-600 flex items-center gap-1"><Home className="w-3 h-3" />Full Address *</Label>
                  <Textarea placeholder="House No., Building, Street, Area, Colony..." className={`min-h-[80px] rounded-lg text-sm resize-none ${formErrors.address ? "border-red-400" : ""}`} value={formData.address} onChange={e => { setFormData(p => ({ ...p, address: e.target.value })); setFormErrors(p => ({ ...p, address: "" })); }} />
                  {formErrors.address && <p className="text-xs text-red-500">{formErrors.address}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-600">Landmark <span className="text-gray-400">(optional)</span></Label>
                  <Input placeholder="Near temple, opposite mall..." value={formData.landmark} onChange={e => setFormData(p => ({ ...p, landmark: e.target.value }))} className="h-10 rounded-lg" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[["City", "city", "Mumbai"], ["State", "state", "Maharashtra"], ["Pincode", "pincode", "400001"]].map(([label, key, ph]) => (
                    <div key={key} className="space-y-1.5">
                      <Label className="text-xs font-medium text-gray-600">{label} *</Label>
                      <Input placeholder={ph} maxLength={key === "pincode" ? 6 : undefined} value={(formData as any)[key]}
                        onChange={e => { const v = key === "pincode" ? e.target.value.replace(/\D/g, "") : e.target.value; setFormData(p => ({ ...p, [key]: v })); setFormErrors(p => ({ ...p, [key]: "" })); }}
                        className={`h-10 rounded-lg ${(formErrors as any)[key] ? "border-red-400" : ""}`} />
                      {(formErrors as any)[key] && <p className="text-xs text-red-500">{(formErrors as any)[key]}</p>}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3.5">
                  <Truck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-emerald-800">All India Delivery Available</p>
                    <p className="text-xs text-emerald-600">Free shipping on orders above Rs 500 - 5-7 business days</p>
                  </div>
                </div>
                <button type="button"
                  onClick={handleSaveAddress}
                  className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-purple-200 flex items-center justify-center gap-2">
                  Save Address & Proceed to Payment <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Ã¢â€â‚¬Ã¢â€â‚¬ 5. PAYMENT Ã¢â€â‚¬Ã¢â€â‚¬ */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <SectionHeader num={5} title="Order Details & Payment" section="payment" />
            {openSection === "payment" && (
              <div className="p-5 space-y-5">
                {/* Order summary mini */}
                {(uploadedFiles.length > 0 || items.length > 0) && (
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Files</p>
                    <div className="space-y-1.5">
                      {uploadedFiles.map(f => (
                        <div key={f.id} className="flex items-center justify-between text-xs bg-gray-50 rounded-lg px-3 py-2">
                          <span className="text-gray-700 truncate mr-3">{f.fileName}</span>
                          <span className="text-gray-500 flex-shrink-0">{f.pages}p x {f.copies} - {/color|smart|ultra/i.test(f.color) ? f.color : "B&W"} - {f.size}</span>
                        </div>
                      ))}
                      {items.map(item => (
                        <div key={item.id} className="flex items-center justify-between text-xs bg-gray-50 rounded-lg px-3 py-2">
                          <span className="text-gray-700 truncate mr-3">{item.productName}</span>
                          <span className="text-gray-500 flex-shrink-0">{formatCurrency(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Delivery address summary */}
                {addressSaved && (
                  <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                    <div className="flex justify-between items-start">
                      <p className="text-xs font-bold text-purple-800 uppercase tracking-wide mb-1.5 flex items-center gap-1"><MapPin className="w-3 h-3" />Deliver To</p>
                      <button type="button" onClick={() => goToStep("address")} className="text-xs text-purple-600 hover:underline font-medium">Change</button>
                    </div>
                    <p className="text-sm font-semibold text-purple-900">{formData.fullName}</p>
                    <p className="text-xs text-purple-700">{formData.address}</p>
                    <p className="text-xs text-purple-700">{formData.city}, {formData.state} - {formData.pincode}</p>
                    <p className="text-xs text-purple-600 mt-1">{formData.phone} - {formData.email}</p>
                  </div>
                )}

                {/* Payment method */}
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Payment Method</p>
                  <div className="space-y-2">
                    {paymentSettings?.phonepe?.enabled && (
                      <label className={`flex items-center gap-3 p-3.5 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === "phonepe" ? "border-purple-500 bg-purple-50" : "border-gray-200 hover:border-gray-300"}`}>
                        <input type="radio" value="phonepe" checked={paymentMethod === "phonepe"} onChange={() => setPaymentMethod("phonepe")} className="accent-purple-600" />
                        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                          <span className="text-purple-700 font-bold text-xs">Pe</span>
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-800">PhonePe</p>
                          <p className="text-xs text-gray-500">UPI - Cards - Netbanking</p>
                        </div>
                        <span className="ml-auto text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">Recommended</span>
                      </label>
                    )}
                    {paymentSettings?.razorpay?.enabled && (
                      <label className={`flex items-center gap-3 p-3.5 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === "razorpay" ? "border-purple-500 bg-purple-50" : "border-gray-200 hover:border-gray-300"}`}>
                        <input type="radio" value="razorpay" checked={paymentMethod === "razorpay"} onChange={() => setPaymentMethod("razorpay")} className="accent-purple-600" />
                        <CreditCard className="w-8 h-8 text-blue-500" />
                        <div>
                          <p className="font-semibold text-sm text-gray-800">Razorpay</p>
                          <p className="text-xs text-gray-500">UPI - Cards - Netbanking - Wallets</p>
                        </div>
                      </label>
                    )}
                    <label className={`flex items-center gap-3 p-3.5 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === "cod" ? "border-purple-500 bg-purple-50" : "border-gray-200 hover:border-gray-300"}`}>
                      <input type="radio" value="cod" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} className="accent-purple-600" />
                      <Wallet className="w-8 h-8 text-emerald-500" />
                      <div>
                        <p className="font-semibold text-sm text-gray-800">Cash on Delivery</p>
                        <p className="text-xs text-gray-500">Pay when your order arrives</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 rounded-lg p-3">
                  <Shield className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  Your payment is 100% secure and encrypted with SSL
                </div>

                {paymentMethod === "phonepe" && window.location.hostname === "localhost" && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                    <p className="font-semibold mb-1">UPI QR on local testing</p>
                    <p>PhonePe QR may not open on <strong>localhost</strong> with live keys. Use your deployed site URL, or pay via UPI ID / card on the PhonePe page. QR works best on desktop.</p>
                  </div>
                )}

                {!addressSaved && (
                  <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>Complete and <button type="button" className="font-semibold underline" onClick={() => goToStep("address")}>save your delivery address</button> before placing the order.</p>
                  </div>
                )}

                <button type="button"
                  onClick={handlePlaceOrder}
                  disabled={primaryCta.disabled}
                  className="w-full h-14 rounded-xl text-white font-bold text-base transition-all disabled:opacity-60 disabled:cursor-not-allowed bg-purple-600 hover:bg-purple-700 shadow-xl shadow-purple-200 flex items-center justify-center gap-2">
                  {verifyingPayment ? <><Loader2 className="w-5 h-5 animate-spin" />Verifying payment...</> : processing ? <><Loader2 className="w-5 h-5 animate-spin" />Redirecting to PhonePe...</> : <>{primaryCta.label} <ArrowRight className="w-5 h-5" /></>}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Ã¢â€â‚¬Ã¢â€â‚¬ RIGHT COLUMN Ã¢â‚¬â€ Price Details Ã¢â€â‚¬Ã¢â€â‚¬ */}
        <div className="lg:w-80 xl:w-96 shrink-0">
          <div className="sticky top-16 space-y-3">
            {/* Price breakdown card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-purple-700 to-purple-500 text-white px-4 py-3 flex items-center gap-2">
                <Tag className="w-4 h-4 text-white" />
                <span className="font-bold text-sm tracking-widest uppercase">Price Details</span>
              </div>
              <div className="p-4 space-y-3 text-sm">
                {[
                  ["Printing Charges", printingCharges],
                  ["Binding Charges", bindingCharges],
                  ["Packaging Charges", packagingCharges],
                ].map(([label, val]) => (
                  <div key={label as string} className="flex justify-between items-center text-gray-600">
                    <span>{label as string}</span>
                    <span className="font-medium text-gray-800">{formatCurrency(val as number)}</span>
                  </div>
                ))}
                <div className="border-t border-gray-100 pt-2 flex justify-between items-center text-gray-600">
                  <span>Net Charges</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(netCharges)}</span>
                </div>
                <div className="flex justify-between items-center text-gray-600">
                  <span>Shipping Charge</span>
                  <span className={shippingCharge === 0 ? "font-semibold text-emerald-600" : "font-medium text-gray-900"}>
                    {formatCurrency(shippingCharge)}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between items-center text-emerald-600">
                    <span>Discount ({appliedCoupon})</span>
                    <span className="font-semibold">- {formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="border-t-2 border-purple-600 pt-3 flex justify-between items-center">
                  <span className="font-bold text-gray-900 text-base">Total Amount:</span>
                  <span className="font-bold text-purple-700 text-xl">{formatCurrency(totalAmount)}</span>
                </div>
              </div>

              <div className="px-4 pb-4">
                <button
                  type="button"
                  onClick={primaryAction}
                  disabled={primaryCta.disabled}
                  className="w-full h-11 rounded-xl text-white text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-md flex items-center justify-center gap-2"
                >
                  {processing || verifyingPayment ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                  {openSection === "payment" && paymentMethod === "phonepe" ? "Pay with PhonePe" : "Continue"}
                </button>
                <p className="text-[11px] text-gray-500 text-center mt-2">{primaryCta.hint}</p>
              </div>

              {/* Coupon section */}
              <div className="border-t border-gray-100 px-4 py-3">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-sm font-bold text-emerald-700">{appliedCoupon}</span>
                      <span className="text-xs text-emerald-600">applied</span>
                    </div>
                    <button onClick={removeCoupon} className="text-xs text-red-500 hover:text-red-700 font-medium">Remove</button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input placeholder="Coupon code" value={couponInput} onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError(""); }}
                        onKeyDown={e => e.key === "Enter" && applyCoupon()} className="h-9 text-sm rounded-lg flex-1" />
                      <button onClick={applyCoupon} className="px-3 h-9 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors flex-shrink-0">Apply</button>
                    </div>
                    {couponError && <p className="text-xs text-red-500">{couponError}</p>}
                  </div>
                )}
              </div>
            </div>

            {/* Offer codes hint */}
            <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-200 rounded-2xl p-4 text-xs space-y-2.5">
              <p className="font-bold text-purple-800 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                Special Offers
              </p>
              <div className="space-y-2">
                <div className="bg-white rounded-lg p-2.5 border border-purple-100">
                  <p className="font-bold text-gray-800"><span className="text-purple-600 font-mono bg-purple-50 px-1.5 py-0.5 rounded text-xs">FIRST31</span></p>
                  <p className="text-gray-600 mt-1">31% off on printing + FREE Shipping</p>
                  <p className="text-gray-400">Max discount: Rs 310</p>
                </div>
                <div className="bg-white rounded-lg p-2.5 border border-purple-100">
                  <p className="font-bold text-gray-800"><span className="text-purple-600 font-mono bg-purple-50 px-1.5 py-0.5 rounded text-xs">DEAL25</span></p>
                  <p className="text-gray-600 mt-1">25% off on printing</p>
                  <p className="text-gray-400">Max discount: Rs 250</p>
                </div>
              </div>
            </div>

            {/* Trust badges */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-2.5">
              {[
                { Icon: Shield, text: "100% Secure Payments" },
                { Icon: Truck, text: "All India Delivery" },
                { Icon: RefreshCw, text: "Fast Processing" },
                { Icon: Phone, text: "24/7 Support: 9323684301" },
              ].map(({ Icon, text }) => (
                <div key={text} className="flex items-center gap-2.5 text-xs text-gray-600">
                  <Icon className="w-4 h-4 text-purple-600" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky bottom action bar */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-purple-100 bg-white/95 shadow-[0_-12px_36px_rgba(88,28,135,0.14)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] items-center gap-3 px-4 py-3 sm:px-6">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold uppercase tracking-wide text-purple-700">
              Step {stepIndex(openSection) + 1} of {SECTIONS.length} - {SECTIONS[stepIndex(openSection)]?.label}
            </p>
            <p className="truncate text-sm font-semibold text-gray-900">{primaryCta.hint}</p>
          </div>
          <div className="hidden rounded-2xl border border-purple-100 bg-purple-50 px-4 py-2 text-right sm:block">
            <p className="text-xs font-medium text-purple-700">Total</p>
            <p className="text-lg font-extrabold leading-tight text-purple-800">Rs {totalAmount.toFixed(2)}</p>
          </div>
          <button
            type="button"
            onClick={primaryAction}
            disabled={primaryCta.disabled}
            className="flex h-[52px] w-[46vw] min-w-[190px] max-w-[380px] shrink-0 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-extrabold shadow-lg ring-1 transition-all hover:shadow-xl disabled:cursor-not-allowed sm:h-14 sm:w-auto sm:min-w-[300px] sm:px-8 sm:text-base"
            style={{
              background: primaryCta.disabled ? "#e5e7eb" : "#6d28d9",
              color: primaryCta.disabled ? "#374151" : "#ffffff",
              border: primaryCta.disabled ? "1px solid #d1d5db" : "1px solid rgba(109, 40, 217, 0.35)",
              boxShadow: primaryCta.disabled ? "0 8px 20px rgba(17, 24, 39, 0.08)" : "0 14px 28px rgba(109, 40, 217, 0.26)",
            }}
          >
            {processing || verifyingPayment ? (
              <><Loader2 className="h-5 w-5 animate-spin" /><span>Please wait...</span></>
            ) : (
              <><span className="truncate">{primaryCta.label}</span><ArrowRight className="h-5 w-5 shrink-0" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
