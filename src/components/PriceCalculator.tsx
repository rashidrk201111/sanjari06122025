import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { categories } from "../data/categories";
import { MessageCircle, Minus, Phone, Plus } from "lucide-react";
import { useAdmin } from "../context/AdminContext";
import type { PricingOption } from "../context/AdminContext";
import { toast } from "sonner@2.0.3";

interface CalculationResult {
  pages: string;
  copies: string;
  paperType: string;
  paperSize: string;
  printedColour: string;
  coverOption: string;
  printingSides: string;
  bindingOptions: string;
  lamination?: string;
  pricePerPage: number;
  printingCost: number;
  coverCost: number;
  totalCost: number;
}

type FieldType = 
  | "pages"
  | "copies"
  | "paperSize"
  | "paperType"
  | "printingColor"
  | "printingSides"
  | "printedSide"
  | "bindingOptions"
  | "coverOption"
  | "quantity"
  | "quantityButtons"
  | "size"
  | "paper"
  | "laminationType"
  | "corner"
  | "mugColor"
  | "cushionType"
  | "papertype"
  | "printType"
  | "frameType"
  | "material"
  | "displayType"
  | "printing"
  | "invoiceNumber"
  | "billBookType";

interface SubcategoryConfig {
  fields: FieldType[];
  colorLabel?: "PRINTING COLOR" | "PRINTED COLOUR" | "PRINTED COLOR";
  isNotecardFormat?: boolean;
  useQuantityButtons?: boolean;
}

// INR fallback pricing (used when admin pricing rule is missing)
const INR_PAPER_BASE_RATE: Record<string, number> = {
  "75GSM NORMAL PAPER": 1.0,
  "80GSM NORMAL PAPER": 1.2,
  "75GSM PREMIUM PAPER": 1.4,
  "85GSM BOND PAPER": 1.6,
  "80GSM DUO PAPER": 1.8,
  "100GSM BOND PAPER": 2.2,
  "100GSM DUO PAPER": 2.5,
  "120GSM MATTE PAPER": 3.0,
  "170GSM MATTE PAPER": 3.8,
  "170GSM GLOSS PAPER": 4.2,
};

const INR_COLOR_ADDON_PER_PAGE: Record<string, number> = {
  bw: 0,
  "color-standard": 2.5,
  "color-premium": 4.5,
  color: 4.5,
};

const INR_SIDES_ADDON_PER_PAGE: Record<string, number> = {
  single: 0,
  duplex: 0.6,
};

const INR_BINDING_COST_PER_COPY: Record<string, number> = {
  "no-binding": 0,
  staple: 8,
  "corner-staple": 10,
  "center-staple": 12,
  spiral: 35,
  wiro: 45,
  "soft-cover": 55,
  "hard-binding": 110,
  "glue-tape": 28,
  perfect: 65,
};

const INR_FALLBACK_QUANTITY_DISCOUNTS = [
  { minQty: 500, discount: 12 },
  { minQty: 200, discount: 8 },
  { minQty: 100, discount: 5 },
  { minQty: 50, discount: 3 },
];

interface PricingChoice {
  value: string;
  label: string;
}

const FALLBACK_PAPER_SIZES: PricingChoice[] = [
  { value: "A4", label: "A4" }, { value: "A3", label: "A3" },
  { value: "A5", label: "A5" }, { value: "B5", label: "B5" },
  { value: "Letter", label: "Letter" }, { value: "Legal", label: "Legal" },
];
const FALLBACK_PAPER_TYPES: PricingChoice[] = [
  "75GSM NORMAL PAPER", "80GSM NORMAL PAPER", "75GSM PREMIUM PAPER", "85GSM BOND PAPER",
  "80GSM DUO PAPER", "100GSM BOND PAPER", "100GSM DUO PAPER", "170GSM MATTE PAPER",
  "120GSM MATTE PAPER", "170GSM GLOSS PAPER",
].map(value => ({ value, label: value }));
const FALLBACK_COLORS: PricingChoice[] = [
  { value: "bw", label: "BLACK & WHITE PRINTING" },
  { value: "color-standard", label: "SMARTCOLOR STANDARD (LOW COST)" },
  { value: "color-premium", label: "ULTRACOLOR PRO (HIGH QUALITY)" },
];
const CERT_FALLBACK_COLORS: PricingChoice[] = [
  { value: "bw", label: "BLACK & WHITE PRINTING" },
  { value: "color-premium", label: "ULTRACOLOR PRO (HIGH QUALITY)" },
];
const FALLBACK_SIDES: PricingChoice[] = [
  { value: "single", label: "SINGLE SIDE PRINTING" },
  { value: "duplex", label: "DUPLEX PRINTING (BOTH SIDES)" },
];
const FALLBACK_BINDINGS: PricingChoice[] = [
  { value: "no-binding", label: "LOOSE SHEET (NO BINDING)" },
  { value: "staple", label: "STAPLE BINDING" },
  { value: "corner-staple", label: "CORNER STAPLE BINDING" },
  { value: "center-staple", label: "CENTER STAPLE BINDING (SADDLE STITCH)" },
  { value: "spiral", label: "SPIRAL BINDING" },
  { value: "wiro", label: "WIRO BINDING" },
  { value: "soft-cover", label: "SOFT COVER BINDING" },
  { value: "hard-binding", label: "HARD BINDING WITH LAMINATION" },
  { value: "glue-tape", label: "GLUE / TAPE BINDING" },
  { value: "perfect", label: "PERFECT BINDING" },
];
const FALLBACK_COVERS: PricingChoice[] = [
  { value: "no-cover", label: "NO COVER" },
  { value: "front-cover", label: "FRONT COVER" },
  { value: "front-back-cover", label: "FRONT & BACK COVER" },
  { value: "thick-color-cover", label: "THICK COLOR COVER" },
];
const FALLBACK_LAMINATIONS: PricingChoice[] = [
  { value: "without-lamination", label: "WITHOUT LAMINATION" },
  { value: "matt-lamination", label: "MATT LAMINATION" },
  { value: "glossy-lamination", label: "GLOSSY LAMINATION" },
  { value: "soft-touch-lamination", label: "SOFT TOUCH LAMINATION" },
];

function activePricingOptions(options?: PricingOption[]) {
  return options?.filter(option => option.enabled !== false && option.name.trim() && !option.name.toLowerCase().includes("eco")) || [];
}

function pricingChoices(options: PricingOption[] | undefined, fallback: PricingChoice[]) {
  const active = activePricingOptions(options);
  return active.length ? active.map(option => ({ value: option.name, label: option.name })) : fallback;
}

function defaultPricingValue(options: PricingOption[] | undefined, fallback: PricingChoice[]) {
  const active = activePricingOptions(options);
  return active.find(option => option.isDefault)?.name || active[0]?.name || fallback[0]?.value || "";
}

function matchingPricingOption(options: PricingOption[] | undefined, selected: string) {
  const selectedKey = selected.trim().toLowerCase();
  const active = activePricingOptions(options);
  return active.find(option => option.name.trim().toLowerCase() === selectedKey)
    || active.find(option => option.isDefault)
    || active[0];
}

function resolveHierarchicalPrice(
  pricingRule: any,
  sizeName: string,
  paperTypeName: string,
  colorName: string,
  sidesName: string,
  copies: number = 1
): number | null {
  if (!pricingRule) return null;
  const sizeOption = pricingRule.paperSizes?.find(
    (s: any) => s.name.trim().toLowerCase() === sizeName.trim().toLowerCase()
  );
  if (sizeOption && sizeOption.paperTypes?.length) {
    const typeOption = sizeOption.paperTypes.find(
      (t: any) => t.name.trim().toLowerCase() === paperTypeName.trim().toLowerCase()
    );
    if (typeOption && typeOption.prices) {
      const colorKey = colorName.trim().toLowerCase();
      const sidesKey = sidesName.trim().toLowerCase();

      const isBw = colorKey === "bw" || colorKey.includes("black") || colorKey.includes("b&w");
      const isDouble = sidesKey.includes("both") || sidesKey.includes("double") || sidesKey === "duplex" || sidesKey.includes("back2back");
      const side = isDouble ? "_double" : "_single";

      let priceKey = `color${side}`;
      if (isBw) priceKey = `bw${side}`;
      else if (colorKey.includes("premium") || colorKey.includes("ultra")) priceKey = `premium${side}`;

      let tierSuffix = "";
      if (copies >= 5000) {
        tierSuffix = "_5000";
      } else if (copies >= 100) {
        tierSuffix = "_100";
      }

      const tieredPrice = typeOption.prices[`${priceKey}${tierSuffix}`];
      if (tieredPrice !== undefined && tieredPrice !== null && Number(tieredPrice) > 0) {
        return Number(tieredPrice);
      }

      return typeOption.prices[priceKey] ?? typeOption.prices[`color${side}`] ?? 0;
    }
  }
  return null;
}

const SIZE_MULTIPLIER: Record<string, number> = {
  "a3": 1.6,
  "a4": 1.25,
  "a5": 1,
  "a6": 0.85,
  "b5": 1.1,
  "dl": 0.9,
  "8x11": 1.15,
  "16x20": 1.8,
  "20x30": 1.3,
  "30x40": 1.5,
  "40x60": 1.9,
  "5x5": 0.8,
  "6x8": 1,
  "8x10": 1.2,
  "89x51": 1,
  "85x55": 1,
  "90x50": 1,
  "custom": 1.25,
};

const PAPER_OPTION_BASE_RATE: Record<string, number> = {
  "300gsm-coated": 6,
  "300gsm-matte": 6.5,
  "250gsm-coated": 5.5,
  "350gsm-coated": 7,
  "normal-75gsm": 2,
  "premium-80gsm": 2.5,
  "glossy-170gsm": 4.2,
  "matte-170gsm": 3.8,
  "300gsm-glossy": 6.2,
  "170gsm-matte": 3.8,
  "170gsm-glossy": 4.2,
};

const LAMINATION_ADDON_PER_UNIT: Record<string, number> = {
  "no-lamination": 0,
  "gloss-lamination": 0.8,
  "matte-lamination": 1,
  "soft-touch-lamination": 1.5,
};

const PRINTING_MODE_ADDON_PER_UNIT: Record<string, number> = {
  "single-bw": 0,
  "single-color": 1.8,
  "double-bw": 0.9,
  "double-color": 3,
};

const PRODUCT_OPTION_ADDON: Record<string, number> = {
  "rounded": 0.75,
  "black": 10,
  "white": 0,
  "red": 8,
  "blue": 8,
  "green": 8,
  "yellow": 8,
  "cushion-covers": 140,
  "cushion-with-filler": 220,
  "canvas-print": 90,
  "photo-print": 40,
  "art-print": 70,
  "black-frame": 120,
  "white-frame": 120,
  "wooden-frame": 150,
  "no-frame": 0,
  "gloss": 10,
  "matte": 12,
  "textured": 14,
  "table-tent": 8,
  "tent-card": 7,
  "standee": 20,
  "50-original-50-duplicate": 50,
  "100-original": 70,
  "50-original-50-duplicate-50-triplicate": 85,
  "with-invoice": 20,
  "without-invoice": 0,
};

// Field configurations for each subcategory
const getSubcategoryConfig = (categorySlug: string, subcategorySlug: string): SubcategoryConfig => {
  // DOCUMENTS - all subcategories have same order
  if (categorySlug === "documents") {
    return {
      fields: ["pages", "copies", "paperSize", "paperType", "printingColor", "printingSides", "bindingOptions", "coverOption"],
      colorLabel: "PRINTING COLOR"
    };
  }
  
  // BOOKS - different orders for different subcategories
  if (categorySlug === "books") {
    // Subcategories with "PRINTING COLOR" label and specific order
    if (["paperback-books", "hardbound-books", "comic-book-printing", "training-manual-printing", 
         "portfolios", "children-book", "gaming-rulebook", "yearbook-print", "presentations", 
         "proposal-print", "instructions-print"].includes(subcategorySlug)) {
      
      // Paperback, Portfolios, Children Book, Gaming Rulebook, Yearbook, Instructions - no cover option
      if (["paperback-books", "portfolios", "children-book", "gaming-rulebook", "yearbook-print", "instructions-print"].includes(subcategorySlug)) {
        return {
          fields: ["pages", "copies", "paperSize", "paperType", "printingColor", "printingSides", "bindingOptions"],
          colorLabel: "PRINTING COLOR"
        };
      }
      
      // Hardbound, Comic Book, Training Manual, Presentations, Proposal - with cover option
      return {
        fields: ["pages", "copies", "paperSize", "paperType", "printingColor", "printingSides", "bindingOptions", "coverOption"],
        colorLabel: "PRINTING COLOR"
      };
    }
    
    // E-Book - specific order
    if (subcategorySlug === "ebook-printing") {
      return {
        fields: ["pages", "copies", "paperType", "paperSize", "printingColor", "printingSides", "bindingOptions"],
        colorLabel: "PRINTED COLOUR"
      };
    }
    
    // Study Material, School Book, Family History, Bulk Book, Magazines - "PRINTED COLOUR" label
    return {
      fields: ["pages", "copies", "paperType", "paperSize", "printingColor", "coverOption", "printingSides", "bindingOptions"],
      colorLabel: "PRINTED COLOUR"
    };
  }
  
  // THESIS & DISSERTATION - all subcategories have same order as DOCUMENTS
  if (categorySlug === "thesis-dissertation") {
    return {
      fields: ["pages", "copies", "paperSize", "paperType", "printingColor", "printingSides", "bindingOptions", "coverOption"],
      colorLabel: "PRINTING COLOR"
    };
  }

  // BLACK BOOK & WHITE BOOK BINDING - same order as DOCUMENTS
  if (categorySlug === "black-book-white-book-binding") {
    return {
      fields: ["pages", "copies", "paperSize", "paperType", "printingColor", "printingSides", "bindingOptions", "coverOption"],
      colorLabel: "PRINTING COLOR"
    };
  }
  
  // CERTIFICATE & CARDS - different formats
  if (categorySlug === "certificate-cards") {
    // Notecards has special format with quantity, size, lamination, corner
    if (subcategorySlug === "notecards") {
      return {
        fields: ["quantity", "size", "paper", "printingSides", "laminationType", "corner"],
        isNotecardFormat: true
      };
    }
    
    // Certificate Printing - standard format with lamination, without binding and cover
    if (subcategorySlug === "certificate-printing") {
      return {
        fields: ["pages", "copies", "paperSize", "paperType", "printingColor", "printingSides", "laminationType"],
        colorLabel: "PRINTED COLOUR"
      };
    }

    // Flash Card and others - standard format without binding and cover
    return {
      fields: ["pages", "copies", "paperSize", "paperType", "printingColor", "printingSides"],
      colorLabel: "PRINTED COLOUR"
    };
  }
  
  // MARKETING MATERIALS - Table and Tentcards
  if (categorySlug === "marketing-materials") {
    return {
      fields: ["quantityButtons", "size", "material", "displayType"],
      useQuantityButtons: true
    };
  }
  
  // POSTERS - different subcategories
  if (categorySlug === "posters") {
    // Poster Printing - standard format
    if (subcategorySlug === "poster-printing") {
      return {
        fields: ["pages", "copies", "paperSize", "paperType", "printingColor"],
        colorLabel: "PRINTED COLOUR"
      };
    }
    
    // Graphics and Art Prints - uses quantity with +/- buttons
    if (subcategorySlug === "graphics-art-prints") {
      return {
        fields: ["quantityButtons", "paperSize", "paperType", "printingColor", "printedSide"],
        colorLabel: "PRINTED COLOUR",
        useQuantityButtons: true
      };
    }
    
    // Framed Posters - blank/not shown
    return {
      fields: [],
    };
  }
  
  // FLYERS OR LEAFLETS - unique combined printing field
  if (categorySlug === "flyers-leaflets") {
    return {
      fields: ["quantity", "size", "paper", "printing"]
    };
  }
  
  // LETTERHEAD & STATIONERY - different formats
  if (categorySlug === "letterhead-stationery") {
    // Bill Books - unique format
    if (subcategorySlug === "bill-books") {
      return {
        fields: ["quantity", "size", "paperType", "billBookType", "printingColor", "invoiceNumber"],
        colorLabel: "PRINTED COLOR"
      };
    }
    
    // Letterhead Printing - simplified format
    return {
      fields: ["pages", "copies", "paperSize", "paperType", "printingColor", "printedSide"],
      colorLabel: "PRINTED COLOUR"
    };
  }
  
  // VISITING CARDS - same as notecards
  if (categorySlug === "visiting-cards") {
    return {
      fields: ["quantity", "size", "paper", "printingSides", "laminationType", "corner"],
      isNotecardFormat: true
    };
  }
  
  // PERSONALISED GIFTS - each subcategory has unique fields
  if (categorySlug === "personalised-gifts") {
    if (subcategorySlug === "mug-printing") {
      return {
        fields: ["quantityButtons", "mugColor"],
        useQuantityButtons: true
      };
    }
    
    if (subcategorySlug === "cushion-print") {
      return {
        fields: ["quantityButtons", "cushionType"],
        useQuantityButtons: true
      };
    }
    
    if (subcategorySlug === "photo-calender") {
      return {
        fields: ["quantityButtons", "size", "papertype"],
        useQuantityButtons: true
      };
    }
    
    if (subcategorySlug === "canvas-print") {
      return {
        fields: ["quantityButtons", "size", "printType"],
        useQuantityButtons: true
      };
    }
    
    if (subcategorySlug === "framed-photos") {
      return {
        fields: ["quantityButtons", "size", "paperType", "frameType"],
        useQuantityButtons: true
      };
    }
  }
  
  // BUSINESS STATIONERY - blank/not shown
  if (categorySlug === "business-stationery") {
    return {
      fields: []
    };
  }
  
  // STICKERS AND LABELS - blank/not shown
  if (categorySlug === "stickers-labels") {
    return {
      fields: []
    };
  }
  
  // Default configuration
  return {
    fields: ["pages", "copies", "paperSize", "paperType", "printingColor", "printingSides", "bindingOptions", "coverOption"],
    colorLabel: "PRINTING COLOR"
  };
};

export function PriceCalculator() {
  const { pricingRules } = useAdmin();
  const [mainCategory, setMainCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [pages, setPages] = useState(1);
  const [copies, setCopies] = useState(1);
  const [paperType, setPaperType] = useState("");
  const [paperSize, setPaperSize] = useState("");
  const [printedColour, setPrintedColour] = useState("");
  const [coverOption, setCoverOption] = useState("");
  const [printingSides, setPrintingSides] = useState("");
  const [bindingOptions, setBindingOptions] = useState("");
  
  // Notecard-specific fields
  const [quantity, setQuantity] = useState("");
  const [size, setSize] = useState("");
  const [paper, setPaper] = useState("");
  const [laminationType, setLaminationType] = useState("");
  const [corner, setCorner] = useState("");
  
  // Personalised Gifts fields
  const [mugColor, setMugColor] = useState("");
  const [cushionType, setCushionType] = useState("");
  const [papertype, setPapertype] = useState("");
  const [printType, setPrintType] = useState("");
  const [frameType, setFrameType] = useState("");
  
  // Marketing Materials fields
  const [material, setMaterial] = useState("");
  const [displayType, setDisplayType] = useState("");
  
  // Flyers fields
  const [printing, setPrinting] = useState("");
  
  // Bill Books fields
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [billBookType, setBillBookType] = useState("");
  
  const [result, setResult] = useState<CalculationResult | null>(null);

  const selectedCategory = categories.find(cat => cat.slug === mainCategory);
  const config = getSubcategoryConfig(mainCategory, subCategory);
  const usesPageModel = config.fields.includes("pages") && config.fields.includes("copies");
  
  // Get pricing rule for current selection
  const getPricingRule = () => {
    if (!mainCategory || !subCategory) return null;
    
    const category = categories.find(c => c.slug === mainCategory);
    const subcategoryObj = category?.subcategories.find(s => s.slug === subCategory);
    
    if (!subcategoryObj) return null;
    
    const candidates = [subcategoryObj.name, subcategoryObj.slug]
      .map(value => value.trim().toLowerCase().replace(/[\/_-]+/g, " "));
    return pricingRules.find(rule => {
      const ruleName = rule.subcategory.trim().toLowerCase().replace(/[\/_-]+/g, " ");
      return rule.category === mainCategory && candidates.some(candidate =>
        ruleName === candidate || ruleName.includes(candidate) || candidate.includes(ruleName)
      );
    });
  };

  const activePricingRule = getPricingRule();
  const isBlackWhiteBindingCategory =
    mainCategory === "black-book-white-book-binding" ||
    subCategory === "black-book-binding" ||
    subCategory === "white-book-binding";

  const rawPaperSizeChoices = pricingChoices(activePricingRule?.paperSizes, FALLBACK_PAPER_SIZES);
  const paperSizeChoices = isBlackWhiteBindingCategory
    ? (() => {
        const filtered = rawPaperSizeChoices.filter(c => {
          const v = (c.value || c.label || "").trim().toUpperCase();
          return v === "A4" || v === "A5";
        });
        return filtered.length > 0 ? filtered : [
          { value: "A4", label: "A4" },
          { value: "A5", label: "A5" },
        ];
      })()
    : rawPaperSizeChoices;
  
  // Resolve paper types, binding, cover & lamination from selected paper size if hierarchical structure is present
  const defaultSizeFallback = isBlackWhiteBindingCategory
    ? [{ value: "A4", label: "A4" }, { value: "A5", label: "A5" }]
    : FALLBACK_PAPER_SIZES;
  const selectedSizeName = paperSize || size || defaultPricingValue(activePricingRule?.paperSizes, defaultSizeFallback);
  const selectedSizeOption = activePricingRule?.paperSizes?.find(s => s.name === selectedSizeName);
  
  const paperTypeChoices = selectedSizeOption && selectedSizeOption.paperTypes?.length
    ? pricingChoices(selectedSizeOption.paperTypes, FALLBACK_PAPER_TYPES)
    : pricingChoices(activePricingRule?.paperTypes, FALLBACK_PAPER_TYPES);

  const isCertificateCategory =
    mainCategory === "certificate-cards" ||
    subCategory === "certificate-printing" ||
    (subCategory && subCategory.toLowerCase().includes("certificate"));

  const rawColorChoices = pricingChoices(activePricingRule?.colorTypes, isCertificateCategory ? CERT_FALLBACK_COLORS : FALLBACK_COLORS);
  const colorChoices = isCertificateCategory
    ? rawColorChoices.filter(c => !c.value.toLowerCase().includes("smart") && !c.label.toLowerCase().includes("smart") && c.value !== "color-standard")
    : rawColorChoices;
  const sideChoices = pricingChoices(activePricingRule?.sideTypes, FALLBACK_SIDES);

  const bindingChoices = selectedSizeOption && selectedSizeOption.bindingTypes?.length
    ? pricingChoices(selectedSizeOption.bindingTypes, FALLBACK_BINDINGS)
    : pricingChoices(activePricingRule?.bindingTypes, FALLBACK_BINDINGS);

  const coverChoices = selectedSizeOption && selectedSizeOption.coverTypes?.length
    ? pricingChoices(selectedSizeOption.coverTypes, FALLBACK_COVERS)
    : pricingChoices(activePricingRule?.coverTypes, FALLBACK_COVERS);

  const laminationChoices = selectedSizeOption && selectedSizeOption.laminationTypes?.length
    ? pricingChoices(selectedSizeOption.laminationTypes, FALLBACK_LAMINATIONS)
    : FALLBACK_LAMINATIONS;

  // Initialize values when rule changes
  useEffect(() => {
    const initialFallbackSizes = isBlackWhiteBindingCategory
      ? [{ value: "A4", label: "A4" }, { value: "A5", label: "A5" }]
      : FALLBACK_PAPER_SIZES;
    let initialSize = defaultPricingValue(activePricingRule?.paperSizes, initialFallbackSizes);
    if (isBlackWhiteBindingCategory && initialSize.toUpperCase() !== "A4" && initialSize.toUpperCase() !== "A5") {
      initialSize = "A4";
    }
    const sizeOpt = activePricingRule?.paperSizes?.find(s => s.name === initialSize);
    const initialType = sizeOpt && sizeOpt.paperTypes?.length
      ? defaultPricingValue(sizeOpt.paperTypes, FALLBACK_PAPER_TYPES)
      : defaultPricingValue(activePricingRule?.paperTypes, FALLBACK_PAPER_TYPES);
    const initialBinding = sizeOpt && sizeOpt.bindingTypes?.length
      ? defaultPricingValue(sizeOpt.bindingTypes, FALLBACK_BINDINGS)
      : defaultPricingValue(activePricingRule?.bindingTypes, FALLBACK_BINDINGS);
    const initialCover = sizeOpt && sizeOpt.coverTypes?.length
      ? defaultPricingValue(sizeOpt.coverTypes, FALLBACK_COVERS)
      : defaultPricingValue(activePricingRule?.coverTypes, FALLBACK_COVERS);
    const initialLamination = sizeOpt && sizeOpt.laminationTypes?.length
      ? defaultPricingValue(sizeOpt.laminationTypes, FALLBACK_LAMINATIONS)
      : defaultPricingValue(undefined, FALLBACK_LAMINATIONS);

    const colorFallback = isCertificateCategory ? CERT_FALLBACK_COLORS : FALLBACK_COLORS;
    let initialColor = defaultPricingValue(activePricingRule?.colorTypes, colorFallback);
    if (isCertificateCategory && (initialColor.toLowerCase().includes("smart") || initialColor === "color-standard")) {
      initialColor = colorChoices[0]?.value || "bw";
    }

    setPaperSize(initialSize);
    setSize(initialSize);
    setPaperType(initialType);
    setPaper(initialType);
    setPapertype(initialType);
    
    setPrintedColour(initialColor);
    setPrintingSides(defaultPricingValue(activePricingRule?.sideTypes, FALLBACK_SIDES));
    setBindingOptions(initialBinding);
    setCoverOption(initialCover);
    setLaminationType(initialLamination);
    setResult(null);
  }, [mainCategory, subCategory, activePricingRule?.id, isBlackWhiteBindingCategory, isCertificateCategory]);

  useEffect(() => {
    if (isCertificateCategory) {
      const cur = (printedColour || "").toLowerCase().trim();
      if (cur.includes("smart") || cur === "color-standard") {
        setPrintedColour(colorChoices[0]?.value || "bw");
      }
    }
  }, [isCertificateCategory, printedColour, colorChoices]);

  useEffect(() => {
    if (isBlackWhiteBindingCategory) {
      const cur = (paperSize || size || "").toUpperCase().trim();
      if (cur && cur !== "A4" && cur !== "A5") {
        setPaperSize("A4");
        setSize("A4");
      }
    }
  }, [isBlackWhiteBindingCategory, paperSize, size]);

  // Dynamically sync paper types, binding, cover & lamination when paper size changes
  useEffect(() => {
    if (activePricingRule) {
      const currentSize = paperSize || size;
      const sizeOpt = activePricingRule.paperSizes?.find(s => s.name === currentSize);
      if (sizeOpt) {
        if (sizeOpt.paperTypes?.length) {
          const matchingType = defaultPricingValue(sizeOpt.paperTypes, FALLBACK_PAPER_TYPES);
          setPaperType(matchingType);
          setPaper(matchingType);
          setPapertype(matchingType);
        }
        if (sizeOpt.bindingTypes?.length) {
          setBindingOptions(defaultPricingValue(sizeOpt.bindingTypes, FALLBACK_BINDINGS));
        }
        if (sizeOpt.coverTypes?.length) {
          setCoverOption(defaultPricingValue(sizeOpt.coverTypes, FALLBACK_COVERS));
        }
        if (sizeOpt.laminationTypes?.length) {
          setLaminationType(defaultPricingValue(sizeOpt.laminationTypes, FALLBACK_LAMINATIONS));
        }
      }
    }
  }, [paperSize, size, activePricingRule?.id]);

  const incrementPages = () => setPages(prev => prev + 1);
  const decrementPages = () => setPages(prev => prev > 1 ? prev - 1 : 1);
  const incrementCopies = () => setCopies(prev => prev + 1);
  const decrementCopies = () => setCopies(prev => prev > 1 ? prev - 1 : 1);

  const calculatePrice = () => {
    if (!mainCategory || !subCategory) {
      toast.error("Please select category and subcategory first");
      return;
    }

    const requiredFieldMessages: Partial<Record<FieldType, string>> = {
      paperSize: "Please select paper size",
      paperType: "Please select paper type",
      printingColor: "Please select printing color",
      printingSides: "Please select printing sides",
      printedSide: "Please select printed side",
      bindingOptions: "Please select binding option",
      coverOption: "Please select cover option",
      quantity: "Please select quantity",
      size: "Please select size",
      paper: "Please select paper",
      laminationType: "Please select lamination type",
      corner: "Please select corner type",
      mugColor: "Please select mug color",
      cushionType: "Please select cushion type",
      papertype: "Please select papertype",
      printType: "Please select print type",
      frameType: "Please select frame type",
      material: "Please select material",
      displayType: "Please select display type",
      printing: "Please select printing option",
      invoiceNumber: "Please select invoice number option",
      billBookType: "Please select bill book type",
    };

    const fieldValues: Partial<Record<FieldType, string>> = {
      paperSize,
      paperType,
      printingColor: printedColour,
      printingSides,
      printedSide: printingSides,
      bindingOptions,
      coverOption,
      quantity,
      size,
      paper,
      laminationType,
      corner,
      mugColor,
      cushionType,
      papertype,
      printType,
      frameType,
      material,
      displayType,
      printing,
      invoiceNumber,
      billBookType,
    };

    const missingField = config.fields.find((field) => {
      if (field === "pages" || field === "copies" || field === "quantityButtons") {
        return false;
      }

      if (!(field in requiredFieldMessages)) {
        return false;
      }

      return !fieldValues[field as FieldType];
    });

    if (missingField && requiredFieldMessages[missingField]) {
      toast.error(requiredFieldMessages[missingField] as string);
      return;
    }

    const pagesNum = pages;
    const copiesNum = copies;
    const pricingRule = activePricingRule;
    const usesPageModel = config.fields.includes("pages") && config.fields.includes("copies");

    // Always compute charges in INR.
    let pricePerPage = 1.2;

    if (!usesPageModel) {
      const units = config.fields.includes("quantity") ? Number(quantity) || 0 : copiesNum;
      if (units <= 0) {
        toast.error("Please enter a valid quantity");
        return;
      }

      const selectedSize = (size || paperSize || "").toLowerCase();
      const sizeMultiplier = SIZE_MULTIPLIER[selectedSize] ?? 1;

      const selectedPaper = (paper || papertype || "").toLowerCase();
      const paperBase = PAPER_OPTION_BASE_RATE[selectedPaper] ?? 3;

      let baseUnitPrice = paperBase;
      const hierarchicalPrice = resolveHierarchicalPrice(
        pricingRule,
        size || paperSize,
        paper || papertype || paperType,
        printedColour,
        printingSides,
        units
      );

      if (hierarchicalPrice !== null) {
        baseUnitPrice = hierarchicalPrice;
      } else {
        baseUnitPrice = pricingRule?.basePrice ?? paperBase;
        const sizeRule = matchingPricingOption(pricingRule?.paperSizes, size || paperSize);
        const paperRule = matchingPricingOption(pricingRule?.paperTypes, paper || papertype || paperType);
        const colorRule = matchingPricingOption(pricingRule?.colorTypes, printedColour);
        const sideRule = matchingPricingOption(pricingRule?.sideTypes, printingSides);

        if (activePricingOptions(pricingRule?.paperSizes).length) baseUnitPrice += sizeRule?.priceModifier ?? 0;
        else baseUnitPrice *= sizeMultiplier;
        if (activePricingOptions(pricingRule?.paperTypes).length) baseUnitPrice += paperRule?.priceModifier ?? 0;
        if (activePricingOptions(pricingRule?.colorTypes).length) baseUnitPrice += colorRule?.priceModifier ?? 0;
        else if (printedColour) baseUnitPrice += INR_COLOR_ADDON_PER_PAGE[printedColour] ?? 0;
        if (activePricingOptions(pricingRule?.sideTypes).length) baseUnitPrice += sideRule?.priceModifier ?? 0;
        else if (printingSides) baseUnitPrice += INR_SIDES_ADDON_PER_PAGE[printingSides] ?? 0;
      }
      if (printing) {
        baseUnitPrice += PRINTING_MODE_ADDON_PER_UNIT[printing] ?? 0;
      }
      if (laminationType) {
        baseUnitPrice += LAMINATION_ADDON_PER_UNIT[laminationType] ?? 0;
      }

      const bindingRule = matchingPricingOption(pricingRule?.bindingTypes, bindingOptions);
      const coverRule = matchingPricingOption(pricingRule?.coverTypes, coverOption);
      const fixedOptionAddons =
        (PRODUCT_OPTION_ADDON[corner] ?? 0) +
        (PRODUCT_OPTION_ADDON[mugColor] ?? 0) +
        (PRODUCT_OPTION_ADDON[cushionType] ?? 0) +
        (PRODUCT_OPTION_ADDON[printType] ?? 0) +
        (PRODUCT_OPTION_ADDON[frameType] ?? 0) +
        (PRODUCT_OPTION_ADDON[material] ?? 0) +
        (PRODUCT_OPTION_ADDON[displayType] ?? 0) +
        (PRODUCT_OPTION_ADDON[billBookType] ?? 0) +
        (PRODUCT_OPTION_ADDON[invoiceNumber] ?? 0) +
        ((bindingRule?.price ?? 0) * units) +
        ((coverRule?.price ?? 0) * units);

      let printingCost = units * baseUnitPrice;

      if (pricingRule) {
        if (pricingRule.quantityDiscounts && pricingRule.quantityDiscounts.length > 0) {
          const applicableDiscount = pricingRule.quantityDiscounts
            .filter((qd) => units >= qd.minQty)
            .sort((a, b) => b.minQty - a.minQty)[0];

          if (applicableDiscount) {
            printingCost = printingCost * (1 - applicableDiscount.discount / 100);
          }
        }
      } else {
        const applicableDiscount = INR_FALLBACK_QUANTITY_DISCOUNTS
          .filter((qd) => units >= qd.minQty)
          .sort((a, b) => b.minQty - a.minQty)[0];

        if (applicableDiscount) {
          printingCost = printingCost * (1 - applicableDiscount.discount / 100);
        }
      }

      const totalCost = printingCost + fixedOptionAddons;

      setResult({
        pages: "1",
        copies: units.toString(),
        paperType: (paperType || paper || papertype || material || "").toUpperCase(),
        paperSize: (paperSize || size || "").toUpperCase(),
        printedColour: printedColour || printing || "-",
        coverOption: coverOption || "-",
        printingSides: printingSides || "-",
        bindingOptions: bindingOptions || "-",
        pricePerPage: baseUnitPrice,
        printingCost,
        coverCost: fixedOptionAddons,
        totalCost,
      });
      return;
    }

    if (pricingRule) {
      const hierarchicalPrice = resolveHierarchicalPrice(
        pricingRule,
        paperSize,
        paperType,
        printedColour,
        printingSides,
        copiesNum
      );

      if (hierarchicalPrice !== null) {
        pricePerPage = hierarchicalPrice;
      } else {
        pricePerPage = pricingRule.basePrice;
        pricePerPage += matchingPricingOption(pricingRule.paperSizes, paperSize)?.priceModifier ?? 0;
        pricePerPage += matchingPricingOption(pricingRule.paperTypes, paperType)?.priceModifier ?? 0;
        pricePerPage += activePricingOptions(pricingRule.colorTypes).length
          ? matchingPricingOption(pricingRule.colorTypes, printedColour)?.priceModifier ?? 0
          : INR_COLOR_ADDON_PER_PAGE[printedColour || "bw"] ?? 0;
        pricePerPage += activePricingOptions(pricingRule.sideTypes).length
          ? matchingPricingOption(pricingRule.sideTypes, printingSides)?.priceModifier ?? 0
          : INR_SIDES_ADDON_PER_PAGE[printingSides || "single"] ?? 0;
      }
    } else {
      const matchedPaperRate = Object.entries(INR_PAPER_BASE_RATE).find(([paperName]) =>
        paperType.toUpperCase().includes(paperName)
      );

      if (matchedPaperRate) {
        pricePerPage = matchedPaperRate[1];
      }

      pricePerPage += INR_COLOR_ADDON_PER_PAGE[printedColour || "bw"] ?? 0;
      pricePerPage += INR_SIDES_ADDON_PER_PAGE[printingSides || "single"] ?? 0;
    }

    let printingCost = pagesNum * copiesNum * pricePerPage;

    if (pricingRule) {
      if (pricingRule.quantityDiscounts && pricingRule.quantityDiscounts.length > 0) {
        const applicableDiscount = pricingRule.quantityDiscounts
          .filter((qd) => copiesNum >= qd.minQty)
          .sort((a, b) => b.minQty - a.minQty)[0];

        if (applicableDiscount) {
          printingCost = printingCost * (1 - applicableDiscount.discount / 100);
        }
      }
    } else {
      const applicableDiscount = INR_FALLBACK_QUANTITY_DISCOUNTS
        .filter((qd) => copiesNum >= qd.minQty)
        .sort((a, b) => b.minQty - a.minQty)[0];

      if (applicableDiscount) {
        printingCost = printingCost * (1 - applicableDiscount.discount / 100);
      }
    }

    let bindingCost = 0;
    const selectedSizeOpt = activePricingRule?.paperSizes?.find(s => s.name === (paperSize || size));
    const activeBindingOpts = selectedSizeOpt?.bindingTypes?.length ? selectedSizeOpt.bindingTypes : activePricingRule?.bindingTypes;
    if (config.fields.includes("bindingOptions") && bindingOptions) {
      if (activePricingOptions(activeBindingOpts).length) {
        bindingCost = (matchingPricingOption(activeBindingOpts, bindingOptions)?.price ?? 0) * copiesNum;
      } else {
        bindingCost = (INR_BINDING_COST_PER_COPY[bindingOptions] ?? 0) * copiesNum;
      }
    }

    let coverCost = 0;
    const activeCoverOpts = selectedSizeOpt?.coverTypes?.length ? selectedSizeOpt.coverTypes : activePricingRule?.coverTypes;
    if (config.fields.includes("coverOption") && coverOption) {
      if (activePricingOptions(activeCoverOpts).length) {
        coverCost = (matchingPricingOption(activeCoverOpts, coverOption)?.price ?? 0) * copiesNum;
      } else if (coverOption === "front-cover") coverCost = 10 * copiesNum;
      else if (coverOption === "front-back-cover") coverCost = 20 * copiesNum;
      else if (coverOption === "thick-color-cover") coverCost = 30 * copiesNum;
    }

    let laminationCost = 0;
    if (config.fields.includes("laminationType") && laminationType) {
      const sizeLamOption = matchingPricingOption(selectedSizeOpt?.laminationTypes, laminationType);
      if (sizeLamOption && sizeLamOption.price !== undefined) {
        laminationCost = sizeLamOption.price * pagesNum * copiesNum;
      } else {
        const lamKey = laminationType.toLowerCase();
        if (lamKey.includes("matt") || lamKey.includes("gloss")) {
          laminationCost = 5 * pagesNum * copiesNum;
        } else if (lamKey.includes("soft")) {
          laminationCost = 8 * pagesNum * copiesNum;
        }
      }
    }

    const totalCost = printingCost + bindingCost + coverCost + laminationCost;

    setResult({
      pages: pages.toString(),
      copies: copies.toString(),
      paperType: paperType || "",
      paperSize: paperSize || "",
      printedColour: printedColour || "",
      coverOption: config.fields.includes("coverOption") ? (coverOption || "") : "",
      printingSides: printingSides || "",
      bindingOptions: config.fields.includes("bindingOptions") ? (bindingOptions || "") : "",
      lamination: config.fields.includes("laminationType") ? (laminationType || "") : "",
      pricePerPage,
      printingCost,
      coverCost: coverCost + bindingCost + laminationCost,
      totalCost,
    });
  };

  const getPrintedColourLabel = (value: string) => {
    const labels: { [key: string]: string } = {
      "bw": "BLACK & WHITE PRINTING",
      "color-standard": "SMARTCOLOR STANDARD (LOW COST)",
      "color-premium": "ULTRACOLOR PRO (HIGH QUALITY)",
      "color": "ULTRACOLOR PRO (HIGH QUALITY)",
    };
    return labels[value] || value;
  };

  const getCoverOptionLabel = (value: string) => {
    const labels: { [key: string]: string } = {
      "no-cover": "NO COVER",
      "front-cover": "FRONT COVER",
      "front-back-cover": "FRONT & BACK COVER",
      "thick-color-cover": "THICK COLOR COVER",
    };
    return labels[value] || value;
  };

  const getPrintingSidesLabel = (value: string) => {
    const labels: { [key: string]: string } = {
      "single": "SINGLE SIDE PRINTING",
      "duplex": "DUPLEX PRINTING (BOTH SIDES)",
    };
    return labels[value] || value;
  };

  const getBindingOptionsLabel = (value: string) => {
    const labels: { [key: string]: string } = {
      "no-binding": "LOOSE SHEET (NO BINDING)",
      "staple": "STAPLE BINDING",
      "spiral": "SPIRAL BINDING",
      "perfect": "PERFECT BINDING",
      "soft-cover": "SOFT COVER BINDING",
      "hard-binding": "HARD BINDING WITH LAMINATION",
    };
    return labels[value] || value;
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl lg:text-4xl">PRICE CALCULATOR</h2>
        </div>

        <div className="mb-6 overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-sm">
          <div className="flex flex-col gap-4 bg-gradient-to-r from-purple-50 via-white to-orange-50 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-purple-700">Need help with pricing?</p>
              <p className="mt-1 text-sm text-gray-600">
                Call or WhatsApp us for custom quantity, bulk order, and print option support.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href="tel:+919323684301"
                className="inline-flex items-center gap-2 rounded-full bg-purple-700 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-purple-800"
              >
                <Phone className="h-4 w-4" />
                +91 9323684301
              </a>
              <a
                href="https://wa.me/919323684301"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white px-4 py-2 text-sm font-bold text-purple-700 transition hover:bg-purple-50"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Main Category Selection - Dark Header */}
        <div className="bg-gray-800 text-white px-8 py-6 rounded-t-lg">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div>
              <Label className="text-white text-lg mb-3 block">Select Product Type</Label>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <Select value={mainCategory} onValueChange={(value) => {
                setMainCategory(value);
                setSubCategory("");
              }}>
                <SelectTrigger className="bg-white text-gray-900 h-12">
                  <SelectValue placeholder="Select Main Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.slug} value={category.slug}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select 
                value={subCategory} 
                onValueChange={setSubCategory}
                disabled={!mainCategory || !selectedCategory?.subcategories.length}
              >
                <SelectTrigger className="bg-white text-gray-900 h-12">
                  <SelectValue placeholder="Select Subcategory" />
                </SelectTrigger>
                <SelectContent>
                  {selectedCategory?.subcategories.map((sub) => (
                    <SelectItem key={sub.slug} value={sub.slug}>
                      {sub.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Results Display - Only show after calculation */}
        {result && (
          <div className="bg-white border border-gray-200 px-8 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <span className="text-sm text-gray-600">{usesPageModel ? "PAGES" : "UNITS"}: </span>
                <span className="text-sm">{usesPageModel ? result.pages : result.copies}</span>
              </div>
              <div>
                <span className="text-sm text-gray-600">{usesPageModel ? "COPIES" : "PRICE BASIS"}: </span>
                <span className="text-sm">{usesPageModel ? result.copies : "Per Unit"}</span>
              </div>
              <div>
                <span className="text-sm text-gray-600">PAPER TYPE: </span>
                <span className="text-sm text-orange-500">{result.paperType}</span>
              </div>
              <div>
                <span className="text-sm text-gray-600">PAPER SIZE: </span>
                <span className="text-sm text-orange-500">{result.paperSize.toUpperCase()}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <span className="text-sm text-gray-600">PRINTED COLOUR: </span>
                <span className="text-sm text-orange-500">{getPrintedColourLabel(result.printedColour)}</span>
              </div>
              {result.coverOption && (
                <div>
                  <span className="text-sm text-gray-600">COVER OPTION: </span>
                  <span className="text-sm text-orange-500">{getCoverOptionLabel(result.coverOption)}</span>
                </div>
              )}
              {result.lamination && (
                <div>
                  <span className="text-sm text-gray-600">LAMINATION: </span>
                  <span className="text-sm text-orange-500">{result.lamination.replace(/-/g, ' ').toUpperCase()}</span>
                </div>
              )}
              <div className={result.coverOption || result.lamination ? "md:col-span-2" : "md:col-span-3"}>
                <span className="text-sm text-gray-600">PRINTING SIDES: </span>
                <span className="text-sm text-orange-500">{getPrintingSidesLabel(result.printingSides)}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              {result.bindingOptions && (
                <div className="md:col-span-2">
                  <span className="text-sm text-gray-600">BINDING OPTIONS: </span>
                  <span className="text-sm text-orange-500">{getBindingOptionsLabel(result.bindingOptions)}</span>
                </div>
              )}
              <div className={result.bindingOptions ? "md:col-span-2" : "md:col-span-4"}>
                <span className="text-sm text-gray-600">PRINTING CHARGE PER PAGE: </span>
                <span className="text-sm text-orange-500">₹{result.pricePerPage.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded text-sm">
                PRINTING COST: ₹ {result.printingCost.toFixed(2)}/-
              </span>
              <span className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded text-sm">
                COVER OPTION: ₹ {result.coverCost.toFixed(2)}/-
              </span>
              <span className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded text-sm">
                TOTAL COST: ₹ {result.totalCost.toFixed(2)}/-
              </span>
            </div>
          </div>
        )}

        {/* Form Card - Only show when subcategory is selected */}
        {subCategory ? (
          <Card className="p-8 rounded-t-none">
            {config.fields.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">Form configuration coming soon for this category.</p>
                <p className="text-gray-500 text-sm mt-2">Please select a different category or check back later.</p>
              </div>
            ) : (
              <>
            <div className="grid md:grid-cols-3 gap-6 mb-6">
            {config.fields.map((field) => {
              // Pages field
              if (field === "pages") {
                return (
                  <div key="pages" className="space-y-2">
                    <Label className="text-xs text-gray-600">PAGES:</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={decrementPages}
                        className="h-10 w-10 shrink-0"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        value={pages}
                        onChange={(e) => setPages(Math.max(1, parseInt(e.target.value) || 1))}
                        min="1"
                        className="h-10 text-center"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={incrementPages}
                        className="h-10 w-10 shrink-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              }

              // Copies field
              if (field === "copies") {
                return (
                  <div key="copies" className="space-y-2">
                    <Label className="text-xs text-gray-600">COPIES:</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={decrementCopies}
                        className="h-10 w-10 shrink-0"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        value={copies}
                        onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                        min="1"
                        className="h-10 text-center"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={incrementCopies}
                        className="h-10 w-10 shrink-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              }

              // Paper Size field
              if (field === "paperSize") {
                return (
                  <div key="paperSize" className="space-y-2">
                    <Label className="text-xs text-gray-600">PAPER SIZE:</Label>
                    <Select value={paperSize} onValueChange={setPaperSize}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select paper size" />
                      </SelectTrigger>
                      <SelectContent>
                        {paperSizeChoices.map(option => (
                          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              }

              // Paper Type field
              if (field === "paperType") {
                return (
                  <div key="paperType" className="space-y-2">
                    <Label className="text-xs text-gray-600">PAPER TYPE:</Label>
                    <Select value={paperType} onValueChange={setPaperType}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select paper type" />
                      </SelectTrigger>
                      <SelectContent>
                        {paperTypeChoices.map(option => (
                          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              }

              // Printing Color field
              if (field === "printingColor") {
                return (
                  <div key="printingColor" className="space-y-2">
                    <Label className="text-xs text-gray-600">{config.colorLabel}:</Label>
                    <Select value={printedColour} onValueChange={setPrintedColour}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select colour option" />
                      </SelectTrigger>
                      <SelectContent>
                        {colorChoices.map(option => (
                          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              }

              // Printing Sides field
              if (field === "printingSides") {
                return (
                  <div key="printingSides" className="space-y-2">
                    <Label className="text-xs text-gray-600">PRINTING SIDES:</Label>
                    <Select value={printingSides} onValueChange={setPrintingSides}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select printing sides" />
                      </SelectTrigger>
                      <SelectContent>
                        {sideChoices.map(option => (
                          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              }

              // Binding Options field
              if (field === "bindingOptions") {
                return (
                  <div key="bindingOptions" className="space-y-2">
                    <Label className="text-xs text-gray-600">BINDING OPTIONS:</Label>
                    <Select value={bindingOptions} onValueChange={setBindingOptions}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select binding option" />
                      </SelectTrigger>
                      <SelectContent>
                        {bindingChoices.map(option => (
                          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              }

              // Cover Option field
              if (field === "coverOption") {
                return (
                  <div key="coverOption" className="space-y-2">
                    <Label className="text-xs text-gray-600">COVER OPTION:</Label>
                    <Select value={coverOption} onValueChange={setCoverOption}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select cover option" />
                      </SelectTrigger>
                      <SelectContent>
                        {coverChoices.map(option => (
                          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              }

              // Quantity field (dropdown - for Notecards, Flyers, Bill Books)
              if (field === "quantity") {
                // Flyers - different quantity options
                if (mainCategory === "flyers-leaflets") {
                  return (
                    <div key="quantity" className="space-y-2">
                      <Label className="text-xs text-gray-600">QUANTITY:</Label>
                      <Select value={quantity} onValueChange={setQuantity}>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select quantity" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="50">50</SelectItem>
                          <SelectItem value="100">100</SelectItem>
                          <SelectItem value="250">250</SelectItem>
                          <SelectItem value="500">500</SelectItem>
                          <SelectItem value="1000">1000</SelectItem>
                          <SelectItem value="2500">2500</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  );
                }
                
                // Bill Books - book quantity
                if (mainCategory === "letterhead-stationery" && subCategory === "bill-books") {
                  return (
                    <div key="quantity" className="space-y-2">
                      <Label className="text-xs text-gray-600">QUANTITY:</Label>
                      <Select value={quantity} onValueChange={setQuantity}>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select quantity" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="25">25</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                          <SelectItem value="100">100</SelectItem>
                          <SelectItem value="250">250</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  );
                }
                
                // Notecards, Visiting Cards - standard card quantities
                return (
                  <div key="quantity" className="space-y-2">
                    <Label className="text-xs text-gray-600">QUANTITY:</Label>
                    <Select value={quantity} onValueChange={setQuantity}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select quantity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="100">100</SelectItem>
                        <SelectItem value="250">250</SelectItem>
                        <SelectItem value="500">500</SelectItem>
                        <SelectItem value="1000">1000</SelectItem>
                        <SelectItem value="2500">2500</SelectItem>
                        <SelectItem value="5000">5000</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                );
              }

              // Size field (different options for different categories)
              if (field === "size") {
                if (activePricingOptions(activePricingRule?.paperSizes).length) {
                  return (
                    <div key="size" className="space-y-2">
                      <Label className="text-xs text-gray-600">SIZE:</Label>
                      <Select value={size} onValueChange={setSize}>
                        <SelectTrigger className="h-10"><SelectValue placeholder="Select size" /></SelectTrigger>
                        <SelectContent>
                          {paperSizeChoices.map(option => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  );
                }

                // Flyers - specific size format
                if (mainCategory === "flyers-leaflets") {
                  return (
                    <div key="size" className="space-y-2">
                      <Label className="text-xs text-gray-600">SIZE:</Label>
                      <Select value={size} onValueChange={setSize}>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="a5">A5 SIZE - 148 MM x 210 MM</SelectItem>
                          <SelectItem value="a4">A4 SIZE - 210 MM x 297 MM</SelectItem>
                          <SelectItem value="a6">A6 SIZE - 105 MM x 148 MM</SelectItem>
                          <SelectItem value="dl">DL SIZE - 99 MM x 210 MM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  );
                }
                
                // Marketing Materials - standard sizes
                if (mainCategory === "marketing-materials") {
                  return (
                    <div key="size" className="space-y-2">
                      <Label className="text-xs text-gray-600">SIZE:</Label>
                      <Select value={size} onValueChange={setSize}>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="a5">A5</SelectItem>
                          <SelectItem value="a4">A4</SelectItem>
                          <SelectItem value="a6">A6</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  );
                }
                
                // Personalised Gifts - different sizes for different products
                if (mainCategory === "personalised-gifts") {
                  if (subCategory === "photo-calender") {
                    return (
                      <div key="size" className="space-y-2">
                        <Label className="text-xs text-gray-600">SIZE:</Label>
                        <Select value={size} onValueChange={setSize}>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="a4">A4</SelectItem>
                            <SelectItem value="a3">A3</SelectItem>
                            <SelectItem value="8x11">8X11 INCH</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    );
                  }
                  
                  if (subCategory === "canvas-print") {
                    return (
                      <div key="size" className="space-y-2">
                        <Label className="text-xs text-gray-600">SIZE:</Label>
                        <Select value={size} onValueChange={setSize}>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="20x30">20X30CM</SelectItem>
                            <SelectItem value="30x40">30X40CM</SelectItem>
                            <SelectItem value="40x60">40X60CM</SelectItem>
                            <SelectItem value="16x20">16X20 INCH</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    );
                  }
                  
                  if (subCategory === "framed-photos") {
                    return (
                      <div key="size" className="space-y-2">
                        <Label className="text-xs text-gray-600">SIZE:</Label>
                        <Select value={size} onValueChange={setSize}>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5x5">5X5INCH</SelectItem>
                            <SelectItem value="6x8">6X8INCH</SelectItem>
                            <SelectItem value="8x10">8X10INCH</SelectItem>
                            <SelectItem value="a4">A4</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    );
                  }
                }
                
                // Bill Books - standard sizes
                if (mainCategory === "letterhead-stationery" && subCategory === "bill-books") {
                  return (
                    <div key="size" className="space-y-2">
                      <Label className="text-xs text-gray-600">SIZE:</Label>
                      <Select value={size} onValueChange={setSize}>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="a4">A4</SelectItem>
                          <SelectItem value="a5">A5</SelectItem>
                          <SelectItem value="b5">B5</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  );
                }
                
                // Notecards, Visiting Cards - business card sizes
                return (
                  <div key="size" className="space-y-2">
                    <Label className="text-xs text-gray-600">SIZE:</Label>
                    <Select value={size} onValueChange={setSize}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="89x51">89 X 51 MM</SelectItem>
                        <SelectItem value="85x55">85 X 55 MM (STANDARD BUSINESS CARD)</SelectItem>
                        <SelectItem value="90x50">90 X 50 MM</SelectItem>
                        <SelectItem value="custom">CUSTOM SIZE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                );
              }

              // Paper field (different options for different categories)
              if (field === "paper") {
                if (activePricingOptions(activePricingRule?.paperTypes).length) {
                  return (
                    <div key="paper" className="space-y-2">
                      <Label className="text-xs text-gray-600">PAPER:</Label>
                      <Select value={paper} onValueChange={setPaper}>
                        <SelectTrigger className="h-10"><SelectValue placeholder="Select paper" /></SelectTrigger>
                        <SelectContent>
                          {paperTypeChoices.map(option => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  );
                }

                // Flyers - combines type and weight
                if (mainCategory === "flyers-leaflets") {
                  return (
                    <div key="paper" className="space-y-2">
                      <Label className="text-xs text-gray-600">PAPER:</Label>
                      <Select value={paper} onValueChange={setPaper}>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select paper" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal-75gsm">NORMAL - 75GSM</SelectItem>
                          <SelectItem value="premium-80gsm">PREMIUM - 80GSM</SelectItem>
                          <SelectItem value="glossy-170gsm">GLOSSY - 170GSM</SelectItem>
                          <SelectItem value="matte-170gsm">MATTE - 170GSM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  );
                }
                
                // Notecards, Visiting Cards - thick paper options
                return (
                  <div key="paper" className="space-y-2">
                    <Label className="text-xs text-gray-600">PAPER:</Label>
                    <Select value={paper} onValueChange={setPaper}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select paper" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="300gsm-coated">300GSM COATED PAPER</SelectItem>
                        <SelectItem value="300gsm-matte">300GSM MATTE PAPER</SelectItem>
                        <SelectItem value="250gsm-coated">250GSM COATED PAPER</SelectItem>
                        <SelectItem value="350gsm-coated">350GSM COATED PAPER</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                );
              }

              // Lamination Type field (for Certificates, Notecards, etc.)
              if (field === "laminationType") {
                return (
                  <div key="laminationType" className="space-y-2">
                    <Label className="text-xs text-gray-600">LAMINATION OPTION:</Label>
                    <Select value={laminationType} onValueChange={setLaminationType}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select lamination option" />
                      </SelectTrigger>
                      <SelectContent>
                        {laminationChoices.map((choice) => (
                          <SelectItem key={choice.value} value={choice.value}>
                            {choice.label.toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              }

              // Corner field (for Notecards)
              if (field === "corner") {
                return (
                  <div key="corner" className="space-y-2">
                    <Label className="text-xs text-gray-600">CORNER:</Label>
                    <Select value={corner} onValueChange={setCorner}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select corner type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">STANDARD (SHARP CORNERS)</SelectItem>
                        <SelectItem value="rounded">ROUNDED CORNERS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                );
              }

              // Quantity with +/- buttons (for Personalised Gifts, Posters, Marketing Materials)
              if (field === "quantityButtons") {
                return (
                  <div key="quantityButtons" className="space-y-2">
                    <Label className="text-xs text-gray-600">QUANTITY:</Label>
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 shrink-0"
                        onClick={() => setCopies(Math.max(1, copies - 1))}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        value={copies}
                        onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                        className="h-10 text-center"
                        min="1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 shrink-0"
                        onClick={() => setCopies(copies + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              }

              // Printed Side (singular - for Letterhead, Posters Graphics)
              if (field === "printedSide") {
                return (
                  <div key="printedSide" className="space-y-2">
                    <Label className="text-xs text-gray-600">PRINTED SIDE:</Label>
                    <Select value={printingSides} onValueChange={setPrintingSides}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select printed side" />
                      </SelectTrigger>
                      <SelectContent>
                        {sideChoices.map(option => (
                          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              }

              // Mug Color (for Mug Printing)
              if (field === "mugColor") {
                return (
                  <div key="mugColor" className="space-y-2">
                    <Label className="text-xs text-gray-600">MUG COLOR:</Label>
                    <Select value={mugColor} onValueChange={setMugColor}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select mug color" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="black">BLACK</SelectItem>
                        <SelectItem value="white">WHITE</SelectItem>
                        <SelectItem value="red">RED</SelectItem>
                        <SelectItem value="blue">BLUE</SelectItem>
                        <SelectItem value="green">GREEN</SelectItem>
                        <SelectItem value="yellow">YELLOW</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                );
              }

              // Cushion Type (for Cushion Print)
              if (field === "cushionType") {
                return (
                  <div key="cushionType" className="space-y-2">
                    <Label className="text-xs text-gray-600">TYPE:</Label>
                    <Select value={cushionType} onValueChange={setCushionType}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cushion-covers">CUSHION COVERS</SelectItem>
                        <SelectItem value="cushion-with-filler">CUSHION WITH FILLER</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                );
              }

              // Papertype (lowercase - for Photo Calender)
              if (field === "papertype") {
                if (activePricingOptions(activePricingRule?.paperTypes).length) {
                  return (
                    <div key="papertype" className="space-y-2">
                      <Label className="text-xs text-gray-600">PAPERTYPE:</Label>
                      <Select value={papertype} onValueChange={setPapertype}>
                        <SelectTrigger className="h-10"><SelectValue placeholder="Select papertype" /></SelectTrigger>
                        <SelectContent>
                          {paperTypeChoices.map(option => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  );
                }

                return (
                  <div key="papertype" className="space-y-2">
                    <Label className="text-xs text-gray-600">PAPERTYPE:</Label>
                    <Select value={papertype} onValueChange={setPapertype}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select papertype" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="300gsm-matte">300GSM MATTE PAPER</SelectItem>
                        <SelectItem value="300gsm-glossy">300GSM GLOSSY PAPER</SelectItem>
                        <SelectItem value="170gsm-matte">170GSM MATTE PAPER</SelectItem>
                        <SelectItem value="170gsm-glossy">170GSM GLOSSY PAPER</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                );
              }

              // Print Type (for Canvas Print)
              if (field === "printType") {
                return (
                  <div key="printType" className="space-y-2">
                    <Label className="text-xs text-gray-600">PRINT TYPE:</Label>
                    <Select value={printType} onValueChange={setPrintType}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select print type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="canvas-print">CANVAS PRINT</SelectItem>
                        <SelectItem value="photo-print">PHOTO PRINT</SelectItem>
                        <SelectItem value="art-print">ART PRINT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                );
              }

              // Frame Type (for Framed Photos)
              if (field === "frameType") {
                return (
                  <div key="frameType" className="space-y-2">
                    <Label className="text-xs text-gray-600">FRAME TYPE:</Label>
                    <Select value={frameType} onValueChange={setFrameType}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select frame type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="black-frame">BLACK FRAME WITH GLASS</SelectItem>
                        <SelectItem value="white-frame">WHITE FRAME WITH GLASS</SelectItem>
                        <SelectItem value="wooden-frame">WOODEN FRAME WITH GLASS</SelectItem>
                        <SelectItem value="no-frame">NO FRAME</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                );
              }

              // Material (for Table and Tentcards)
              if (field === "material") {
                return (
                  <div key="material" className="space-y-2">
                    <Label className="text-xs text-gray-600">MATERIAL:</Label>
                    <Select value={material} onValueChange={setMaterial}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select material" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gloss">GLOSS</SelectItem>
                        <SelectItem value="matte">MATTE</SelectItem>
                        <SelectItem value="textured">TEXTURED</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                );
              }

              // Display Type (for Table and Tentcards)
              if (field === "displayType") {
                return (
                  <div key="displayType" className="space-y-2">
                    <Label className="text-xs text-gray-600">DISPLAY TYPE:</Label>
                    <Select value={displayType} onValueChange={setDisplayType}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select display type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="table-tent">TABLE TENT</SelectItem>
                        <SelectItem value="tent-card">TENT CARD</SelectItem>
                        <SelectItem value="standee">STANDEE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                );
              }

              // Printing (combined sides + color for Flyers)
              if (field === "printing") {
                return (
                  <div key="printing" className="space-y-2">
                    <Label className="text-xs text-gray-600">PRINTING:</Label>
                    <Select value={printing} onValueChange={setPrinting}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select printing option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single-bw">SINGLE SIDE - BLACK AND WHITE</SelectItem>
                        <SelectItem value="single-color">SINGLE SIDE - COLOR</SelectItem>
                        <SelectItem value="double-bw">DOUBLE SIDE - BLACK AND WHITE</SelectItem>
                        <SelectItem value="double-color">DOUBLE SIDE - COLOR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                );
              }

              // Bill Book Type (for Bill Books)
              if (field === "billBookType") {
                return (
                  <div key="billBookType" className="space-y-2">
                    <Label className="text-xs text-gray-600">TYPE:</Label>
                    <Select value={billBookType} onValueChange={setBillBookType}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="50-original-50-duplicate">50 ORIGINAL + 50 DUPLICATE</SelectItem>
                        <SelectItem value="100-original">100 ORIGINAL</SelectItem>
                        <SelectItem value="50-original-50-duplicate-50-triplicate">50 ORIGINAL + 50 DUPLICATE + 50 TRIPLICATE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                );
              }

              // Invoice Number (for Bill Books)
              if (field === "invoiceNumber") {
                return (
                  <div key="invoiceNumber" className="space-y-2">
                    <Label className="text-xs text-gray-600">INVOICE NUMBER:</Label>
                    <Select value={invoiceNumber} onValueChange={setInvoiceNumber}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select invoice number option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="with-invoice">WITH INVOICE NUMBER</SelectItem>
                        <SelectItem value="without-invoice">WITHOUT INVOICE NUMBER</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                );
              }

              return null;
            })}
          </div>

          {/* Calculate Button */}
          <Button
            onClick={calculatePrice}
            className="bg-blue-900 hover:bg-blue-800 text-white px-12"
            size="lg"
          >
            CALCULATE PRICE
          </Button>

          {/* Notes Section */}
          <div className="mt-8 space-y-3">
            <h3 className="text-sm">Notes:</h3>
            
            <div className="text-xs text-gray-700 space-y-2">
              <p>
                <strong>Paper Size:</strong> Size of the Paper A3 [297 x 420 millimeters or 11.69 x 16.54 inches], A4 [210 297 millimeters or 8.27 11.69 inches], 
                B5 [176 x 250 millimeters or 6.9 x 9.8 inches], A5 [148 x 210 millimeters or 5.83 x 8.27 inches]
              </p>
              
              <p>
                <strong>Printing Sides:</strong> To find out whether you want duplex printing (Back 2 Back) or Single Side Printing
              </p>
              
              <p>
                <strong>Paper Type:</strong> Types of Document [75GSM: Business Forms, Flyers, Books, Mailers, Reports], [100GSM/130GSM: Premium Books, Mailers, Resume, Letterhead], 
                [170GSM: Booklet, Magazine, etc], [170GSM/250GSM/300GSM: Poster, Marketing Materials], [250GSM/300GSM: Business Card, Certificates, Photo, Premium Poster, etc]
              </p>
              
              <p>
                <strong>Binding Type:</strong> Choose Binding type of the Document.
              </p>
            </div>
          </div>
              </>
            )}
        </Card>
        ) : (
          <Card className="p-8 rounded-t-none">
            <div className="text-center py-12 text-gray-500">
              <p>Please select a main category and subcategory to start calculating prices.</p>
            </div>
          </Card>
        )}
      </div>
    </section>
  );
}
