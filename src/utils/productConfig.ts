// Product configuration helper for all categories

export type FieldType = 
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

export interface ProductConfig {
  fields: FieldType[];
  colorLabel?: "PRINTING COLOR" | "PRINTED COLOUR" | "PRINTED COLOR";
}

export const getProductConfig = (categorySlug: string, subcategorySlug: string): ProductConfig => {
  // DOCUMENTS - all subcategories have same configuration
  if (categorySlug === "documents") {
    return {
      fields: ["pages", "copies", "paperSize", "paperType", "printingColor", "printingSides", "bindingOptions", "coverOption"],
      colorLabel: "PRINTING COLOR"
    };
  }
  
  // BOOKS - different configurations for different subcategories
  if (categorySlug === "books") {
    if (["paperback-books", "hardbound-books", "comic-book-printing", "training-manual-printing", 
         "portfolios", "children-book", "gaming-rulebook", "yearbook-print", "presentations", 
         "proposal-print", "instructions-print"].includes(subcategorySlug)) {
      
      // Without cover option
      if (["paperback-books", "portfolios", "children-book", "gaming-rulebook", "yearbook-print", "instructions-print"].includes(subcategorySlug)) {
        return {
          fields: ["pages", "copies", "paperSize", "paperType", "printingColor", "printingSides", "bindingOptions"],
          colorLabel: "PRINTING COLOR"
        };
      }
      
      // With cover option
      return {
        fields: ["pages", "copies", "paperSize", "paperType", "printingColor", "printingSides", "bindingOptions", "coverOption"],
        colorLabel: "PRINTING COLOR"
      };
    }
    
    if (subcategorySlug === "ebook-printing") {
      return {
        fields: ["pages", "copies", "paperType", "paperSize", "printingColor", "printingSides", "bindingOptions"],
        colorLabel: "PRINTED COLOUR"
      };
    }
    
    // Study Material, School Book, etc.
    return {
      fields: ["pages", "copies", "paperSize", "paperType", "printingColor", "printingSides", "bindingOptions", "coverOption"],
      colorLabel: "PRINTED COLOUR"
    };
  }
  
  // THESIS & DISSERTATION
  if (categorySlug === "thesis-dissertation") {
    return {
      fields: ["pages", "copies", "paperSize", "paperType", "printingColor", "printingSides", "bindingOptions", "coverOption"],
      colorLabel: "PRINTING COLOR"
    };
  }

  // BLACK BOOK & WHITE BOOK BINDING
  if (categorySlug === "black-book-white-book-binding") {
    return {
      fields: ["pages", "copies", "paperSize", "paperType", "printingColor", "printingSides", "bindingOptions", "coverOption"],
      colorLabel: "PRINTING COLOR"
    };
  }
  
  // CERTIFICATE & CARDS
  if (categorySlug === "certificate-cards") {
    if (subcategorySlug === "notecards") {
      return {
        fields: ["quantity", "size", "paper", "printingColor"],
        colorLabel: "PRINTED COLOR"
      };
    }
    if (subcategorySlug === "certificate-printing") {
      return {
        fields: ["pages", "copies", "paperSize", "paperType", "printingColor", "printingSides", "laminationType"],
        colorLabel: "PRINTED COLOR"
      };
    }
    if (subcategorySlug === "flash-card-printing") {
      return {
        fields: ["quantity", "size", "paper", "printingColor", "corner"],
        colorLabel: "PRINTED COLOR"
      };
    }
  }
  
  // MARKETING MATERIALS
  if (categorySlug === "marketing-materials") {
    if (subcategorySlug === "brochures") {
      return {
        fields: ["quantity", "size", "paper", "printingColor", "printingSides"],
        colorLabel: "PRINTED COLOR"
      };
    }
    if (subcategorySlug === "table-tentcards") {
      return {
        fields: ["quantity", "size", "paper", "printingColor"],
        colorLabel: "PRINTED COLOR"
      };
    }
  }
  
  // POSTERS
  if (categorySlug === "posters") {
    if (subcategorySlug === "poster-printing") {
      return {
        fields: ["quantity", "size", "paper", "printingColor", "laminationType"],
        colorLabel: "PRINTED COLOR"
      };
    }
    if (subcategorySlug === "framed-posters") {
      return {
        fields: ["quantity", "size", "paper", "printingColor", "frameType"],
        colorLabel: "PRINTED COLOR"
      };
    }
    if (subcategorySlug === "graphics-art-prints") {
      return {
        fields: ["quantity", "size", "paper", "printingColor"],
        colorLabel: "PRINTED COLOR"
      };
    }
  }
  
  // FLYERS OR LEAFLETS
  if (categorySlug === "flyers-leaflets") {
    return {
      fields: ["quantity", "size", "paper", "printingSides"],
      colorLabel: "PRINTED COLOR"
    };
  }
  
  // LETTERHEAD & STATIONERY
  if (categorySlug === "letterhead-stationery") {
    if (subcategorySlug === "letterhead-printing") {
      return {
        fields: ["quantity", "size", "paper", "printingColor", "printingSides"],
        colorLabel: "PRINTED COLOR"
      };
    }
    if (subcategorySlug === "bill-books") {
      return {
        fields: ["invoiceNumber", "copies", "billBookType"],
        colorLabel: "PRINTED COLOR"
      };
    }
  }
  
  // VISITING CARDS
  if (categorySlug === "visiting-cards") {
    return {
      fields: ["quantity", "size", "paper", "printingColor", "printingSides"],
      colorLabel: "PRINTED COLOR"
    };
  }
  
  // BUSINESS STATIONERY
  if (categorySlug === "business-stationery") {
    return {
      fields: ["quantity", "size", "paper", "printingColor", "printingSides"],
      colorLabel: "PRINTED COLOR"
    };
  }
  
  // PERSONALISED GIFTS
  if (categorySlug === "personalised-gifts") {
    if (subcategorySlug === "mug-printing") {
      return {
        fields: ["quantity", "mugColor", "printingColor"],
        colorLabel: "PRINTING COLOR"
      };
    }
    if (subcategorySlug === "cushion-print") {
      return {
        fields: ["quantity", "cushionType", "printingColor"],
        colorLabel: "PRINTING COLOR"
      };
    }
    if (subcategorySlug === "photo-calender") {
      return {
        fields: ["quantity", "size", "papertype", "displayType"],
        colorLabel: "PRINTED COLOR"
      };
    }
    if (subcategorySlug === "canvas-print") {
      return {
        fields: ["quantity", "size", "material"],
        colorLabel: "PRINTED COLOR"
      };
    }
    if (subcategorySlug === "framed-photos") {
      return {
        fields: ["quantity", "size", "frameType"],
        colorLabel: "PRINTED COLOR"
      };
    }
  }
  
  // STICKERS AND LABELS
  if (categorySlug === "stickers-labels") {
    return {
      fields: ["quantity", "size", "paper", "printingColor"],
      colorLabel: "PRINTED COLOR"
    };
  }
  
  // Default configuration
  return {
    fields: ["quantity", "size", "paper", "printingColor"],
    colorLabel: "PRINTED COLOR"
  };
};

// Field options
export const fieldOptions = {
  paperSize: [
    { value: "a4", label: "A4 (210 x 297 mm)" },
    { value: "a3", label: "A3 (297 x 420 mm)" },
    { value: "a5", label: "A5 (148 x 210 mm)" },
    { value: "letter", label: "Letter (8.5 x 11 inch)" },
    { value: "legal", label: "Legal (8.5 x 14 inch)" },
  ],
  paperType: [
    { value: "70gsm", label: "70 GSM" },
    { value: "80gsm", label: "80 GSM" },
    { value: "100gsm", label: "100 GSM" },
    { value: "120gsm", label: "120 GSM" },
    { value: "150gsm", label: "150 GSM" },
  ],
  printingColor: [
    { value: "bw", label: "Black & White" },
    { value: "color", label: "Color" },
  ],
  printingSides: [
    { value: "single", label: "Single Side" },
    { value: "double", label: "Double Side" },
  ],
  bindingOptions: [
    { value: "none", label: "No Binding" },
    { value: "staple", label: "Staple Binding" },
    { value: "spiral", label: "Spiral Binding" },
    { value: "wiro", label: "Wiro Binding" },
    { value: "thermal", label: "Thermal Binding" },
    { value: "hardbound", label: "Hard Bound" },
  ],
  coverOption: [
    { value: "none", label: "No Cover" },
    { value: "transparent", label: "Transparent Cover" },
    { value: "colored", label: "Colored Cover" },
  ],
  size: [
    { value: "small", label: "Small" },
    { value: "medium", label: "Medium" },
    { value: "large", label: "Large" },
    { value: "custom", label: "Custom Size" },
  ],
  paper: [
    { value: "matte", label: "Matte" },
    { value: "glossy", label: "Glossy" },
    { value: "art-paper", label: "Art Paper" },
  ],
  laminationType: [
    { value: "none", label: "No Lamination" },
    { value: "matte", label: "Matte Lamination" },
    { value: "glossy", label: "Glossy Lamination" },
  ],
  corner: [
    { value: "rounded", label: "Rounded Corners" },
    { value: "sharp", label: "Sharp Corners" },
  ],
  mugColor: [
    { value: "white", label: "White" },
    { value: "black", label: "Black" },
    { value: "red", label: "Red" },
    { value: "blue", label: "Blue" },
  ],
  cushionType: [
    { value: "standard", label: "Standard Cushion" },
    { value: "premium", label: "Premium Cushion" },
  ],
  frameType: [
    { value: "wooden", label: "Wooden Frame" },
    { value: "metal", label: "Metal Frame" },
    { value: "plastic", label: "Plastic Frame" },
  ],
  material: [
    { value: "canvas", label: "Canvas" },
    { value: "vinyl", label: "Vinyl" },
  ],
  displayType: [
    { value: "wall", label: "Wall Calendar" },
    { value: "table", label: "Table Calendar" },
  ],
  billBookType: [
    { value: "duplicate", label: "Duplicate" },
    { value: "triplicate", label: "Triplicate" },
  ],
};
