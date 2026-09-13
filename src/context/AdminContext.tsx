import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "../lib/supabase";
import { API_BASE } from "../lib/apiBase";
import { adminJsonHeaders } from "../lib/adminAuthHeaders";
import { toast } from "sonner@2.0.3";
import { projectId, publicAnonKey } from "../utils/supabase/info";

import pdfPrintImg from "../assets/popular/pdf-print.png";
import annualReportImg from "../assets/popular/annual-report.png";
import paperbackBooksImg from "../assets/popular/paperback-books.png";
import posterPrintingImg from "../assets/popular/poster-printing.svg";
import thesisPrintImg from "../assets/popular/thesis-print.png";
import { categories as fallbackCategories } from "../data/categories";
import type { Category } from "../data/categories";

interface Admin {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isActive: boolean;
  joinedDate: string;
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "admin" | "manager" | "staff" | "support";
  department?: string;
  isActive: boolean;
  joinedDate: string;
  lastLogin?: string;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  date: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  items: any[];
  subtotal: number;
  gst: number;
  shipping: number;
  total: number;
  deliveryAddress: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
  paymentMethod: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  trackingUrl?: string;
}

export interface AdminAuditLog {
  id: string;
  action: string;
  actorName: string;
  actorEmail: string;
  details?: any;
  createdAt: string;
}

interface SiteSettings {
  siteName: string;
  logo: string;
  email: string;
  phone: string;
  phone2?: string;
  address: string;
  footerAbout: string;
  socialMedia: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export interface HeroContent {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  backgroundImage?: string;
}

export interface HeroSlideContent {
  id: number;
  badge: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaLink: string;
  secondaryLabel: string;
  secondaryLink: string;
  imageUrl: string;
  tagText: string;
}

export interface ServicesSectionContent {
  badge: string;
  title: string;
  subtitle: string;
}

export interface CTASectionContent {
  title: string;
  subtitle: string;
  primaryText: string;
  primaryLink: string;
  secondaryText: string;
  secondaryLink: string;
}

export interface ContactPageContent {
  title: string;
  subtitle: string;
  formTitle: string;
  formSubtitle: string;
  whatsappText: string;
  businessHours: string;
}

export interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  image?: string;
}

export interface Review {
  id: string;
  name: string;
  email?: string;
  role?: string;
  company?: string;
  content: string;
  rating: number;
  date: string;
  isApproved: boolean;
  isDefault: boolean;
  productReviewed?: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  slug: string;
  isActive: boolean;
}

export interface ServiceCard {
  id: string;
  icon: string;
  title: string;
  description: string;
  tag: string;
}

export interface PageContent {
  hero: HeroContent;
  heroSlides: HeroSlideContent[];
  servicesSection: ServicesSectionContent;
  ctaSection: CTASectionContent;
  contactPage: ContactPageContent;
  faqs: FAQ[];
  features: Feature[];
  testimonials: Testimonial[];
  products: Product[];
  serviceCards: ServiceCard[];
  aboutPage: {
    title: string;
    subtitle: string;
    description: string;
    mission: string;
    vision: string;
  };
}

export interface PricingOption {
  name: string;
  priceModifier?: number;
  price?: number;
  enabled?: boolean;
  isDefault?: boolean;
  paperTypes?: {
    name: string;
    enabled?: boolean;
    isDefault?: boolean;
    prices: {
      bw_single: number;
      bw_double: number;
      color_single: number;
      color_double: number;
      premium_single?: number;
      premium_double?: number;
      bw_single_100?: number;
      bw_double_100?: number;
      bw_single_5000?: number;
      bw_double_5000?: number;
      color_single_100?: number;
      color_double_100?: number;
      color_single_5000?: number;
      color_double_5000?: number;
      premium_single_100?: number;
      premium_double_100?: number;
      premium_single_5000?: number;
      premium_double_5000?: number;
    };
  }[];
  bindingTypes?: {
    name: string;
    price: number;
    enabled?: boolean;
    isDefault?: boolean;
  }[];
  coverTypes?: {
    name: string;
    price: number;
    enabled?: boolean;
    isDefault?: boolean;
  }[];
  laminationTypes?: {
    name: string;
    price: number;
    enabled?: boolean;
    isDefault?: boolean;
  }[];
}

export interface PricingRule {
  id: string;
  category: string;
  subcategory: string;
  basePrice: number;
  printTypes?: PricingOption[];
  paperSizes?: PricingOption[];
  paperTypes: PricingOption[];
  colorTypes?: PricingOption[];
  sideTypes?: PricingOption[];
  bindingTypes?: PricingOption[];
  coverTypes?: PricingOption[];
  quantityDiscounts: {
    minQty: number;
    discount: number;
  }[];
}

export interface SEOSettings {
  defaultTitle: string;
  defaultDescription: string;
  defaultKeywords: string;
  ogImage?: string;
  twitterHandle?: string;
  googleAnalyticsId?: string;
  googleTagManagerId?: string;
  facebookPixelId?: string;
  sitemap: boolean;
  robotsTxt: string;
  // Advanced Meta Tags
  author?: string;
  viewport?: string;
  themeColor?: string;
  canonicalUrl?: string;
  alternateLanguages?: { lang: string; url: string }[];
  customMetaTags?: { name: string; content: string }[];
  // Additional Open Graph
  ogType?: string;
  ogSiteName?: string;
  ogLocale?: string;
  // Schema.org structured data
  organizationSchema?: string;
  // Advanced SEO
  noIndexPages?: string[];
  preconnectUrls?: string[];
}

export interface PaymentGateway {
  razorpay: {
    enabled: boolean;
    keyId: string;
    keySecret: string;
    testMode: boolean;
  };
  phonepe: {
    enabled: boolean;
    merchantId: string;
    saltKey: string;
    saltIndex: string;
    testMode: boolean;
  };
  codEnabled: boolean;
}

export interface ShiprocketSettings {
  enabled: boolean;
  email: string;
  password: string;
  webhookSecret?: string;
  pickupLocation: string;
  companyName: string;
  phone: string;
  address: string;
  address2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  defaultWeight: number;
  defaultLength: number;
  defaultBreadth: number;
  defaultHeight: number;
}

interface AdminContextType {
  admin: Admin | null;
  isAdminAuthenticated: boolean;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  adminLogout: () => void;
  siteSettings: SiteSettings;
  updateSiteSettings: (settings: Partial<SiteSettings>) => Promise<void>;
  pricingRules: PricingRule[];
  updatePricingRule: (rule: PricingRule) => Promise<void>;
  addPricingRule: (rule: PricingRule) => Promise<void>;
  deletePricingRule: (id: string) => Promise<void>;
  users: AdminUser[];
  addUser: (user: AdminUser) => Promise<{ success: boolean; error?: string }>;
  updateUser: (user: AdminUser) => Promise<{ success: boolean; error?: string }>;
  deleteUser: (id: string) => Promise<{ success: boolean; error?: string }>;
  staff: Staff[];
  addStaff: (staff: Staff & { password?: string }) => Promise<{ success: boolean; error?: string }>;
  updateStaff: (staff: Staff & { password?: string }) => Promise<{ success: boolean; error?: string }>;
  deleteStaff: (id: string) => Promise<{ success: boolean; error?: string }>;
  orders: AdminOrder[];
  refreshOrders: () => Promise<void>;
  updateOrderStatus: (orderNumber: string, status: string) => Promise<void>;
  updateOrderShipment: (orderNumber: string, shipment: { status?: string; trackingNumber?: string; estimatedDelivery?: string; trackingUrl?: string }) => Promise<void>;
  auditLogs: AdminAuditLog[];
  loadAuditLogs: (limit?: number) => Promise<void>;
  logAdminAction: (action: string, details?: Record<string, any>) => Promise<void>;
  pageContent: PageContent;
  updateHeroContent: (hero: HeroContent) => Promise<void>;
  updateHeroSlides: (slides: HeroSlideContent[]) => Promise<void>;
  updateServicesSection: (services: ServicesSectionContent) => Promise<void>;
  updateCTASection: (cta: CTASectionContent) => Promise<void>;
  updateContactPageContent: (contact: ContactPageContent) => Promise<void>;
  updateAboutContent: (about: Partial<PageContent['aboutPage']>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  addProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  replaceProducts: (products: Product[]) => Promise<void>;
  updateServiceCard: (card: ServiceCard) => Promise<void>;
  addFAQ: (faq: FAQ) => Promise<void>;
  updateFAQ: (faq: FAQ) => Promise<void>;
  deleteFAQ: (id: string) => Promise<void>;
  addFeature: (feature: Feature) => Promise<void>;
  updateFeature: (feature: Feature) => Promise<void>;
  deleteFeature: (id: string) => Promise<void>;
  replaceFeatures: (features: Feature[]) => Promise<void>;
  addTestimonial: (testimonial: Testimonial) => Promise<void>;
  updateTestimonial: (testimonial: Testimonial) => Promise<void>;
  deleteTestimonial: (id: string) => Promise<void>;
  reviews: Review[];
  addReview: (review: Review) => Promise<void>;
  updateReview: (review: Review) => Promise<void>;
  deleteReview: (id: string) => Promise<void>;
  approveReview: (id: string) => Promise<void>;
  seoSettings: SEOSettings;
  updateSEOSettings: (settings: Partial<SEOSettings>) => Promise<void>;
  paymentGateway: PaymentGateway;
  updatePaymentGateway: (settings: Partial<PaymentGateway>) => Promise<void>;
  shiprocketSettings: ShiprocketSettings;
  updateShiprocketSettings: (settings: Partial<ShiprocketSettings>) => Promise<void>;
  loadingData: boolean;
  catalogCategories: Category[];
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Default values for initial state
const defaultSiteSettings: SiteSettings = {
  siteName: "Sanjari prints",
  logo: "/logo.png",
  email: "sanjariprint@gmail.com",
  phone: "+91 7350001266",
  phone2: "+91 9323684301",
  address: "Mumbai, Maharashtra, India",
  footerAbout: "Professional printing services with fast turnaround times. We deliver quality prints for all your business needs.",
  socialMedia: {
    facebook: "https://facebook.com/sanjariprints",
    instagram: "https://instagram.com/sanjariprints",
    twitter: "https://twitter.com/sanjariprints",
  }
};

const defaultPageContent: PageContent = {
  hero: {
    title: "Professional Printing Services",
    subtitle: "Quality prints delivered to your doorstep. Fast turnaround, competitive prices.",
    ctaText: "Get Started",
    ctaLink: "#/all-products",
    backgroundImage: "",
  },
  heroSlides: [
    {
      id: 1,
      badge: "🏆 #1 Printing Partner for Businesses",
      title: "Premium Quality Printing, Delivered to Your Door",
      subtitle: "From business cards to banners - professional printing with vibrant colours, fast turnaround, and unbeatable prices.",
      ctaLabel: "Start Your Order",
      ctaLink: "/#/all-products",
      secondaryLabel: "View All Products",
      secondaryLink: "/#/all-products",
      imageUrl: "",
      tagText: "✈ Free shipping on orders ₹500+",
    },
    {
      id: 2,
      badge: "⚡ Lightning-Fast Turnaround",
      title: "Get Your Prints in as Little as 24 Hours",
      subtitle: "Rush printing service available for all products. Order by noon and receive your prints tomorrow - guaranteed.",
      ctaLabel: "Get a Quick Quote",
      ctaLink: "/#/price-calculator",
      secondaryLabel: "How It Works",
      secondaryLink: "/#/how-it-works",
      imageUrl: "",
      tagText: "⭐ 4.9★ rated by 10,000+ customers",
    },
    {
      id: 3,
      badge: "📦 Bulk Order Specialists",
      title: "Save Up to 40% on Bulk Printing Orders",
      subtitle: "The more you print, the more you save. Custom quotes for large volumes - perfect for events, retail, and corporate needs.",
      ctaLabel: "Request Bulk Quote",
      ctaLink: "/#/bulk-order",
      secondaryLabel: "See Pricing",
      secondaryLink: "/#/price-calculator",
      imageUrl: "",
      tagText: "🏷 Volume discounts starting at 50 units",
    },
    {
      id: 4,
      badge: "🤝 Trusted by 10,000+ Businesses",
      title: "Your Vision, Our Craft - Perfect Every Time",
      subtitle: "Upload your design or use our free templates. Our quality check team ensures your prints look exactly as you imagined.",
      ctaLabel: "Get Started Free",
      ctaLink: "/#/signup",
      secondaryLabel: "Explore Products",
      secondaryLink: "/#/all-products",
      imageUrl: "",
      tagText: "🚀 500K+ orders delivered successfully",
    },
  ],
  servicesSection: {
    badge: "Professional Solutions for Every Print Need",
    title: "Our Printing Services",
    subtitle: "We offer a comprehensive range of printing solutions to meet all your business needs",
  },
  ctaSection: {
    title: "Ready to Bring Your Ideas to Life?",
    subtitle: "Get started with your custom printing project today. Free quotes and fast turnaround guaranteed.",
    primaryText: "Get Your Free Quote",
    primaryLink: "/#/contact",
    secondaryText: "Talk to an Expert",
    secondaryLink: "/#/contact",
  },
  contactPage: {
    title: "Contact Us",
    subtitle: "We're here to help! Get in touch with us for any queries or support",
    formTitle: "Send us a Message",
    formSubtitle: "Share your requirement and our team will contact you shortly.",
    whatsappText: "Chat with us on WhatsApp",
    businessHours: "Monday - Saturday\n11:00 AM - 8:00 PM\nClosed on Sundays",
  },
  faqs: [],
  features: [],
  testimonials: [],
  products: [
    { id: "1", title: "PDF Print", description: "Professional PDF printing services", imageUrl: pdfPrintImg, slug: "documents/pdf-print", isActive: true },
    { id: "2", title: "Annual Report Printing", description: "High-quality annual report printing", imageUrl: annualReportImg, slug: "documents/annual-report-printing", isActive: true },
    { id: "3", title: "Paperback Books", description: "Professional paperback book printing", imageUrl: paperbackBooksImg, slug: "books/paperback-books", isActive: true },
    { id: "4", title: "Poster Printing", description: "Vibrant poster prints for events and promotions", imageUrl: posterPrintingImg, slug: "posters/poster-printing", isActive: true },
    { id: "5", title: "Thesis Print", description: "Professional thesis printing services", imageUrl: thesisPrintImg, slug: "thesis-dissertation/thesis-print", isActive: true },
  ],
  serviceCards: [
    { id: "1", icon: "CreditCard", title: "Business Cards", description: "Make a lasting first impression with premium business cards in various finishes.", tag: "Brand Identity" },
    { id: "2", icon: "FileText", title: "Brochures & Flyers", description: "Eye-catching marketing materials to promote your business effectively.", tag: "Marketing" },
    { id: "3", icon: "Image", title: "Banners & Posters", description: "Large format printing for events, promotions, and advertising campaigns.", tag: "Large Format" },
    { id: "4", icon: "Package", title: "Packaging", description: "Custom packaging solutions that make your products stand out on the shelf.", tag: "Product Packaging" },
    { id: "5", icon: "Tag", title: "Labels & Stickers", description: "High-quality labels and stickers for products, branding, and promotions.", tag: "Branding" },
  ],
  aboutPage: {
    title: "About Sanjari Prints",
    subtitle: "Your Trusted Printing Partner Since 2010",
    description: "Sanjari Prints is a leading printing service provider based in Mumbai, offering comprehensive printing solutions for businesses, students, and individuals.",
    mission: "To provide high-quality, affordable printing services with exceptional customer support and fast turnaround times.",
    vision: "To become India's most trusted and innovative printing service provider, setting new standards in quality and customer satisfaction.",
  },
};

const defaultSEOSettings: SEOSettings = {
  defaultTitle: "Sanjari Prints - Professional Printing Services in India",
  defaultDescription: "Professional printing services with fast turnaround times. Documents, books, visiting cards, posters, and more. Quality prints delivered across India.",
  defaultKeywords: "printing services, online printing, business cards, document printing, book printing, poster printing, India",
  ogImage: "",
  twitterHandle: "@sanjariprints",
  googleAnalyticsId: "",
  googleTagManagerId: "",
  facebookPixelId: "",
  sitemap: true,
  robotsTxt: `User-agent: *
Allow: /
Disallow: /admin
Disallow: /checkout
Sitemap: https://sanjariprints.com/sitemap.xml`,
  author: "Sanjari Prints",
  viewport: "width=device-width, initial-scale=1.0",
  themeColor: "#2563eb",
  canonicalUrl: "",
  alternateLanguages: [],
  customMetaTags: [],
  ogType: "website",
  ogSiteName: "Sanjari Prints",
  ogLocale: "en_IN",
  organizationSchema: JSON.stringify({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Sanjari Prints",
    "description": "Professional printing services",
    "telephone": "+91 7350001266",
    "email": "sanjariprint@gmail.com",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "IN",
      "addressLocality": "Mumbai",
      "addressRegion": "Maharashtra"
    }
  }, null, 2),
  noIndexPages: ["/admin", "/checkout"],
  preconnectUrls: ["https://www.googletagmanager.com", "https://www.google-analytics.com"],
};

const defaultPaymentGateway: PaymentGateway = {
  razorpay: {
    enabled: false,
    keyId: "",
    keySecret: "",
    testMode: true,
  },
  phonepe: {
    enabled: true,
    merchantId: "",
    saltKey: "",
    saltIndex: "1",
    testMode: false, // PRODUCTION MODE
  },
  codEnabled: true,
};

const defaultShiprocketSettings: ShiprocketSettings = {
  enabled: false,
  email: "",
  password: "",
  webhookSecret: "",
  pickupLocation: "Primary",
  companyName: "Sanjari Prints",
  phone: "+91",
  address: "",
  address2: "",
  city: "Mumbai",
  state: "Maharashtra",
  pincode: "",
  country: "India",
  defaultWeight: 0.5,
  defaultLength: 25,
  defaultBreadth: 20,
  defaultHeight: 4,
};

export function AdminProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [pageContent, setPageContent] = useState<PageContent>(defaultPageContent);
  const [seoSettings, setSEOSettings] = useState<SEOSettings>(defaultSEOSettings);
  const [paymentGateway, setPaymentGateway] = useState<PaymentGateway>(defaultPaymentGateway);
  const [shiprocketSettings, setShiprocketSettings] = useState<ShiprocketSettings>(defaultShiprocketSettings);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [catalogCategories, setCatalogCategories] = useState<Category[]>(fallbackCategories);

  // Load all data from Supabase on mount
  useEffect(() => {
    loadAllData();
  }, []);

  // Real-time PostgreSQL subscription for orders and pricing rules
  useEffect(() => {
    // Realtime channel for orders table changes
    const ordersChannel = supabase
      .channel('realtime-orders-admin')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('Realtime order update received:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newOrder = payload.new;
            toast.success(`New order #${newOrder.order_number || ''} placed!`, {
              description: `Amount: ₹${newOrder.total_amount || 0}`,
              duration: 5000,
            });
          } else if (payload.eventType === 'UPDATE') {
            const oldOrder = payload.old;
            const newOrder = payload.new;
            if (oldOrder && oldOrder.status !== newOrder.status) {
              toast.info(`Order #${newOrder.order_number || ''} status changed to ${newOrder.status || ''}`);
            }
          }
          
          // Refresh orders list
          loadOrders();
        }
      )
      .subscribe();

    // Realtime channel for pricing rules table changes
    const pricingChannel = supabase
      .channel('realtime-pricing-admin')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pricing_rules' },
        (payload) => {
          console.log('Realtime pricing rule update received:', payload);
          toast.success("Pricing rules updated in real-time!");
          
          // Refresh pricing rules list
          loadPricingRules();
        }
      )
      .subscribe();

    const productsChannel = supabase
      .channel('realtime-products-catalog')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => loadCatalogProducts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(pricingChannel);
      supabase.removeChannel(productsChannel);
    };
  }, []);

  const loadAllData = async () => {
    try {
      setLoadingData(true);

      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Get user profile to check if admin
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (userData && (userData.role === 'admin' || userData.role === 'staff')) {
          setAdmin({
            id: userData.id,
            email: userData.email,
            name: userData.name,
            role: userData.role,
          });
          setIsAdminAuthenticated(true);
        }
      }

      // Load pricing rules
      await loadPricingRules();

      // Load the customer-facing product catalogue
      await loadCatalogProducts();

      // Load users
      await loadUsers();

      // Load staff
      await loadStaff();

      // Load orders
      await loadOrders();

      // Load audit logs
      await loadAuditLogs(50);

      // Load FAQs
      await loadFAQs();

      // Load reviews
      await loadReviews();

      // Load SEO settings
      await loadSEOSettings();

      // Load payment gateway settings
      await loadPaymentSettings();

      // Load shiprocket settings
      await loadShiprocketSettings();

      // Load site settings and page content from content_pages
      await loadContentPages();

    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const loadPricingRules = async () => {
    const { data, error } = await supabase
      .from('pricing_rules')
      .select('*');

    if (error) {
      console.error("Error loading pricing rules:", error);
      return;
    }

    if (data && data.length > 0) {
      const formattedRules = data.map((rule: any) => ({
        id: rule.id,
        category: rule.category,
        subcategory: rule.subcategory,
        ...rule.rules
      }));
      setPricingRules(formattedRules);
    }
  };

  const loadCatalogProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('id, category, subcategory, name, description, base_price, image_url, specifications')
      .order('category')
      .order('subcategory');

    if (error || !Array.isArray(data)) {
      if (error) console.warn("Could not load dynamic product catalogue:", error.message);
      setCatalogCategories(fallbackCategories);
      return;
    }

    const merged: Category[] = fallbackCategories.map(category => ({
      ...category,
      subcategories: category.subcategories.map(subcategory => ({ ...subcategory })),
    }));
    const slugify = (value: string) => value
      .trim()
      .toLowerCase()
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    data.forEach((row: any) => {
      const categorySlug = slugify(row.category || 'custom');
      const productName = String(row.subcategory || row.name || '').trim();
      if (!productName) return;
      const productSlug = String(row.specifications?.slug || slugify(productName));
      let category = merged.find(item => item.slug === categorySlug);
      if (!category) {
        category = {
          name: String(row.specifications?.categoryName || row.category || 'Custom Products').replace(/-/g, ' ').toUpperCase(),
          slug: categorySlug,
          subcategories: [],
        };
        merged.push(category);
      }
      const existing = category.subcategories.find(item => item.slug === productSlug || item.name.toLowerCase() === productName.toLowerCase());
      const product = {
        name: String(row.name || productName),
        slug: productSlug,
        image: row.image_url || existing?.image,
        description: row.description || existing?.description,
        startingPrice: Number(row.base_price || existing?.startingPrice || 0),
      };
      if (existing) Object.assign(existing, product);
      else category.subcategories.push(product);
    });

    setCatalogCategories(merged.filter(category => category.subcategories.length > 0));
  };

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'user');

    if (error) {
      console.error("Error loading users:", error);
      return;
    }

    if (data) {
      const formattedUsers = data.map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isActive: user.email_verified !== false,
        joinedDate: user.created_at?.split('T')[0] || '',
      }));
      setUsers(formattedUsers);
    }
  };

  const loadStaff = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .in('role', ['admin', 'staff']);

    if (error) {
      console.error("Error loading staff:", error);
      return;
    }

    if (data) {
      const formattedStaff = data.map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role as "admin" | "staff",
        department: "operations",
        isActive: true,
        joinedDate: user.created_at?.split('T')[0] || '',
      }));
      setStaff(formattedStaff);
    }
  };

  const loadOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error loading orders:", error);
      return;
    }

    if (data) {
      const formattedOrders = data.map((order: any) => ({
        id: order.id,
        orderNumber: order.order_number,
        date: order.created_at?.split('T')[0] || '',
        status: order.status,
        items: order.items || [],
        subtotal: order.total_amount * 0.82, // Rough calculation
        gst: order.total_amount * 0.18,
        shipping: 0,
        total: order.total_amount,
        deliveryAddress: order.shipping_address || {},
        paymentMethod: order.payment_method,
        trackingNumber: order.tracking_number || '',
        estimatedDelivery: order.estimated_delivery || '',
        trackingUrl: order.tracking_url || '',
      }));
      setOrders(formattedOrders);
    }
  };

  const refreshOrders = async () => {
    await loadOrders();
  };

  const loadAuditLogs = async (limit = 100) => {
    const { data, error } = await supabase
      .from('admin_audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.warn("Admin audit log table unavailable or failed to load:", error.message);
      return;
    }

    if (Array.isArray(data)) {
      const formatted = data.map((row: any) => ({
        id: String(row.id),
        action: row.action || "unknown_action",
        actorName: row.admin_name || "Admin",
        actorEmail: row.admin_email || "",
        details: row.details || null,
        createdAt: row.created_at || new Date().toISOString(),
      }));
      setAuditLogs(formatted);
    }
  };

  const logAdminAction = async (action: string, details?: Record<string, any>) => {
    if (!admin) return;

    const payload = {
      admin_id: admin.id,
      admin_email: admin.email,
      admin_name: admin.name,
      action,
      details: details || {},
    };

    const { data, error } = await supabase
      .from('admin_audit_logs')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      console.warn("Failed to write admin audit log:", error.message);
      return;
    }

    if (data) {
      const entry: AdminAuditLog = {
        id: String(data.id),
        action: data.action || action,
        actorName: data.admin_name || admin.name,
        actorEmail: data.admin_email || admin.email,
        details: data.details || details || null,
        createdAt: data.created_at || new Date().toISOString(),
      };
      setAuditLogs(prev => [entry, ...prev].slice(0, 200));
    }
  };

  const loadFAQs = async () => {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) {
      console.error("Error loading FAQs:", error);
      return;
    }

    if (data) {
      const formattedFAQs = data.map((faq: any) => ({
        id: faq.id,
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
      }));
      setPageContent(prev => ({ ...prev, faqs: formattedFAQs }));
    }
  };

  const loadReviews = async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error loading reviews:", error);
      return;
    }

    if (data) {
      const formattedReviews = data.map((review: any) => ({
        id: review.id,
        name: review.user_name,
        email: review.user_email,
        content: review.review_text,
        rating: review.rating,
        date: review.created_at?.split('T')[0] || '',
        isApproved: review.status === 'approved',
        isDefault: false,
      }));
      setReviews(formattedReviews);
    }
  };

  const loadSEOSettings = async () => {
    const { data, error } = await supabase
      .from('seo_settings')
      .select('*')
      .eq('page_path', '/')
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error("Error loading SEO settings:", error);
      return;
    }

    if (data) {
      setSEOSettings(prev => ({
        ...prev,
        defaultTitle: data.title || prev.defaultTitle,
        defaultDescription: data.description || prev.defaultDescription,
        defaultKeywords: data.keywords || prev.defaultKeywords,
        ogImage: data.og_image || prev.ogImage,
      }));
    }
  };

  const loadPaymentSettings = async () => {
    const { data, error } = await supabase
      .from('payment_settings')
      .select('*')
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error("Error loading payment settings:", error);
      return;
    }

    if (data) {
      setPaymentGateway({
        razorpay: {
          enabled: data.razorpay_enabled || false,
          keyId: data.razorpay_key_id || '',
          keySecret: data.razorpay_key_secret || '',
          testMode: true,
        },
        phonepe: {
          enabled: data.phonepe_enabled || false,
          merchantId: data.phonepe_merchant_id || '',
          saltKey: data.phonepe_salt_key || '',
          saltIndex: data.phonepe_salt_index || '1',
          testMode: true,
        },
        codEnabled: true,
      });
    }
  };

  const loadShiprocketSettings = async () => {
    const { data, error } = await supabase
      .from('content_pages')
      .select('*')
      .eq('page_type', 'shiprocket_settings')
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error("Error loading shiprocket settings:", error);
      return;
    }

    if (data?.content) {
      try {
        const parsed = JSON.parse(data.content);
        setShiprocketSettings(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error("Error parsing shiprocket settings:", e);
      }
    }
  };

  const loadContentPages = async () => {
    const { data, error } = await supabase
      .from('content_pages')
      .select('*');

    if (error) {
      console.error("Error loading content pages:", error);
      return;
    }

    if (data && data.length > 0) {
      data.forEach((page: any) => {
        try {
          const content = JSON.parse(page.content);
          
          if (page.page_type === 'hero') {
            setPageContent(prev => ({ ...prev, hero: content }));
          } else if (page.page_type === 'hero_slides') {
            setPageContent(prev => ({ ...prev, heroSlides: content }));
          } else if (page.page_type === 'services') {
            setPageContent(prev => ({ ...prev, servicesSection: content }));
          } else if (page.page_type === 'cta') {
            setPageContent(prev => ({ ...prev, ctaSection: content }));
          } else if (page.page_type === 'contact_page') {
            setPageContent(prev => ({ ...prev, contactPage: content }));
          } else if (page.page_type === 'features') {
            setPageContent(prev => ({ ...prev, features: content }));
          } else if (page.page_type === 'testimonials') {
            setPageContent(prev => ({ ...prev, testimonials: content }));
          } else if (page.page_type === 'about') {
            setPageContent(prev => ({ ...prev, aboutPage: content }));
          } else if (page.page_type === 'products') {
            setPageContent(prev => ({ ...prev, products: content }));
          } else if (page.page_type === 'service_cards') {
            setPageContent(prev => ({ ...prev, serviceCards: content }));
          } else if (page.page_type === 'site_settings') {
            setSiteSettings(content);
          }
        } catch (e) {
          console.error("Error parsing content:", e);
        }
      });
    }
  };

  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error);
        toast.error(error.message);
        return false;
      }

      if (data.user) {
        // Check if user is admin or staff
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (userData && (userData.role === 'admin' || userData.role === 'staff')) {
          setAdmin({
            id: userData.id,
            email: userData.email,
            name: userData.name,
            role: userData.role,
          });
          setIsAdminAuthenticated(true);
          toast.success("Admin login successful!");
          
          // Reload all data after login
          await loadAllData();
          return true;
        } else {
          await supabase.auth.signOut();
          toast.error("Access denied. Admin privileges required.");
          return false;
        }
      }

      return false;
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error("Login failed");
      return false;
    }
  };

  const adminLogout = async () => {
    await supabase.auth.signOut();
    setAdmin(null);
    setIsAdminAuthenticated(false);
    toast.success("Logged out successfully");
  };

  const updateSiteSettings = async (newSettings: Partial<SiteSettings>) => {
    const updated = { ...siteSettings, ...newSettings };
    setSiteSettings(updated);

    // Save to content_pages table
    const { error } = await supabase
      .from('content_pages')
      .upsert({
        page_type: 'site_settings',
        title: 'Site Settings',
        content: JSON.stringify(updated),
      }, {
        onConflict: 'page_type'
      });

    if (error) {
      console.error("Error saving site settings:", error);
      toast.error("Failed to save site settings");
    } else {
      toast.success("Site settings updated!");
    }
  };

  const updatePricingRule = async (rule: PricingRule) => {
    const { id, category, subcategory, ...rules } = rule;
    
    const { error } = await supabase
      .from('pricing_rules')
      .update({
        category,
        subcategory,
        rules,
      })
      .eq('id', id);

    if (error) {
      console.error("Error updating pricing rule:", error);
      toast.error("Failed to update pricing rule");
      return;
    }

    const updated = pricingRules.map(r => r.id === rule.id ? rule : r);
    setPricingRules(updated);
    toast.success("Pricing rule updated!");
  };

  const addPricingRule = async (rule: PricingRule) => {
    const { id, category, subcategory, ...rules } = rule;
    
    const { data, error } = await supabase
      .from('pricing_rules')
      .insert({
        category,
        subcategory,
        rules,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding pricing rule:", error);
      toast.error("Failed to add pricing rule");
      return;
    }

    if (data) {
      const newRule = {
        id: data.id,
        category: data.category,
        subcategory: data.subcategory,
        ...data.rules
      };
      setPricingRules([...pricingRules, newRule]);
      toast.success("Pricing rule added!");
    }
  };

  const deletePricingRule = async (id: string) => {
    const { error } = await supabase
      .from('pricing_rules')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting pricing rule:", error);
      toast.error("Failed to delete pricing rule");
      return;
    }

    const updated = pricingRules.filter(r => r.id !== id);
    setPricingRules(updated);
    toast.success("Pricing rule deleted!");
  };

  const updateOrderStatus = async (orderNumber: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('order_number', orderNumber);

    if (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
      return;
    }

    const updated = orders.map(order => 
      order.orderNumber === orderNumber 
        ? { ...order, status: newStatus as AdminOrder["status"] }
        : order
    );
    setOrders(updated);
    toast.success("Order status updated!");
  };

  const updateOrderShipment = async (
    orderNumber: string,
    shipment: { status?: string; trackingNumber?: string; estimatedDelivery?: string; trackingUrl?: string }
  ) => {
    const updatePayload: any = {};
    if (shipment.status) updatePayload.status = shipment.status;
    if (shipment.trackingNumber !== undefined) updatePayload.tracking_number = shipment.trackingNumber;
    if (shipment.estimatedDelivery !== undefined) updatePayload.estimated_delivery = shipment.estimatedDelivery;
    if (shipment.trackingUrl !== undefined) updatePayload.tracking_url = shipment.trackingUrl;

    const { error } = await supabase
      .from('orders')
      .update(updatePayload)
      .eq('order_number', orderNumber);

    if (error) {
      console.error("Error updating shipment details:", error);
      toast.error("Failed to update shipment details");
      return;
    }

    setOrders(prev => prev.map(order => {
      if (order.orderNumber !== orderNumber) return order;
      return {
        ...order,
        status: (shipment.status as AdminOrder["status"]) || order.status,
        trackingNumber: shipment.trackingNumber ?? order.trackingNumber,
        estimatedDelivery: shipment.estimatedDelivery ?? order.estimatedDelivery,
        trackingUrl: shipment.trackingUrl ?? order.trackingUrl,
      };
    }));

    toast.success("Shipment details updated!");
  };

  // Content Management Functions
  const updateHeroContent = async (hero: HeroContent) => {
    const updated = { ...pageContent, hero };
    setPageContent(updated);

    const { error } = await supabase
      .from('content_pages')
      .upsert({
        page_type: 'hero',
        title: 'Hero Section',
        content: JSON.stringify(hero),
      }, {
        onConflict: 'page_type'
      });

    if (error) {
      console.error("Error saving hero content:", error);
      toast.error("Failed to save hero content");
    } else {
      toast.success("Hero content updated!");
    }
  };

  const updateHeroSlides = async (slides: HeroSlideContent[]) => {
    const updated = { ...pageContent, heroSlides: slides };
    setPageContent(updated);

    const { error } = await supabase
      .from('content_pages')
      .upsert({
        page_type: 'hero_slides',
        title: 'Hero Slides',
        content: JSON.stringify(slides),
      }, {
        onConflict: 'page_type'
      });

    if (error) {
      console.error("Error saving hero slides:", error);
      toast.error("Failed to save hero slides");
    } else {
      toast.success("Hero slides updated!");
    }
  };

  const updateServicesSection = async (services: ServicesSectionContent) => {
    const updated = { ...pageContent, servicesSection: services };
    setPageContent(updated);

    const { error } = await supabase
      .from('content_pages')
      .upsert({
        page_type: 'services',
        title: 'Services Section',
        content: JSON.stringify(services),
      }, {
        onConflict: 'page_type'
      });

    if (error) {
      console.error("Error saving services section:", error);
      toast.error("Failed to save services section");
    } else {
      toast.success("Services section updated!");
    }
  };

  const updateCTASection = async (cta: CTASectionContent) => {
    const updated = { ...pageContent, ctaSection: cta };
    setPageContent(updated);

    const { error } = await supabase
      .from('content_pages')
      .upsert({
        page_type: 'cta',
        title: 'CTA Section',
        content: JSON.stringify(cta),
      }, {
        onConflict: 'page_type'
      });

    if (error) {
      console.error("Error saving CTA section:", error);
      toast.error("Failed to save CTA section");
    } else {
      toast.success("CTA section updated!");
    }
  };

  const updateContactPageContent = async (contact: ContactPageContent) => {
    const updated = { ...pageContent, contactPage: contact };
    setPageContent(updated);

    const { error } = await supabase
      .from('content_pages')
      .upsert({
        page_type: 'contact_page',
        title: 'Contact Page',
        content: JSON.stringify(contact),
      }, {
        onConflict: 'page_type'
      });

    if (error) {
      console.error("Error saving contact page content:", error);
      toast.error("Failed to save contact page content");
    } else {
      toast.success("Contact page content updated!");
    }
  };

  const updateAboutContent = async (about: Partial<PageContent['aboutPage']>) => {
    const updatedAbout = { ...pageContent.aboutPage, ...about };
    const updated = { 
      ...pageContent, 
      aboutPage: updatedAbout
    };
    setPageContent(updated);

    const { error } = await supabase
      .from('content_pages')
      .upsert({
        page_type: 'about',
        title: 'About Page',
        content: JSON.stringify(updatedAbout),
      }, {
        onConflict: 'page_type'
      });

    if (error) {
      console.error("Error saving about content:", error);
      toast.error("Failed to save about content");
    } else {
      toast.success("About content updated!");
    }
  };

  const addFAQ = async (faq: FAQ) => {
    const { data, error } = await supabase
      .from('faqs')
      .insert({
        question: faq.question,
        answer: faq.answer,
        category: faq.category || 'General',
        order_index: pageContent.faqs.length,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding FAQ:", error);
      toast.error("Failed to add FAQ");
      return;
    }

    if (data) {
      const newFAQ = {
        id: data.id,
        question: data.question,
        answer: data.answer,
        category: data.category,
      };
      setPageContent({ 
        ...pageContent, 
        faqs: [...pageContent.faqs, newFAQ] 
      });
      toast.success("FAQ added!");
    }
  };

  const updateFAQ = async (faq: FAQ) => {
    const { error } = await supabase
      .from('faqs')
      .update({
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
      })
      .eq('id', faq.id);

    if (error) {
      console.error("Error updating FAQ:", error);
      toast.error("Failed to update FAQ");
      return;
    }

    const updated = { 
      ...pageContent, 
      faqs: pageContent.faqs.map(f => f.id === faq.id ? faq : f) 
    };
    setPageContent(updated);
    toast.success("FAQ updated!");
  };

  const deleteFAQ = async (id: string) => {
    const { error } = await supabase
      .from('faqs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting FAQ:", error);
      toast.error("Failed to delete FAQ");
      return;
    }

    const updated = { 
      ...pageContent, 
      faqs: pageContent.faqs.filter(f => f.id !== id) 
    };
    setPageContent(updated);
    toast.success("FAQ deleted!");
  };

  const addFeature = async (feature: Feature) => {
    const updated = { 
      ...pageContent, 
      features: [...pageContent.features, feature] 
    };
    setPageContent(updated);

    const { error } = await supabase
      .from('content_pages')
      .upsert({
        page_type: 'features',
        title: 'Features',
        content: JSON.stringify(updated.features),
      }, {
        onConflict: 'page_type'
      });

    if (error) {
      console.error("Error saving features:", error);
      toast.error("Failed to add feature");
    } else {
      toast.success("Feature added!");
    }
  };

  const updateFeature = async (feature: Feature) => {
    const updated = { 
      ...pageContent, 
      features: pageContent.features.map(f => f.id === feature.id ? feature : f) 
    };
    setPageContent(updated);

    const { error } = await supabase
      .from('content_pages')
      .upsert({
        page_type: 'features',
        title: 'Features',
        content: JSON.stringify(updated.features),
      }, {
        onConflict: 'page_type'
      });

    if (error) {
      console.error("Error saving features:", error);
      toast.error("Failed to update feature");
    } else {
      toast.success("Feature updated!");
    }
  };

  const deleteFeature = async (id: string) => {
    const updated = { 
      ...pageContent, 
      features: pageContent.features.filter(f => f.id !== id) 
    };
    setPageContent(updated);

    const { error } = await supabase
      .from('content_pages')
      .upsert({
        page_type: 'features',
        title: 'Features',
        content: JSON.stringify(updated.features),
      }, {
        onConflict: 'page_type'
      });

    if (error) {
      console.error("Error saving features:", error);
      toast.error("Failed to delete feature");
    } else {
      toast.success("Feature deleted!");
    }
  };

  const replaceFeatures = async (features: Feature[]) => {
    setPageContent(prev => ({ ...prev, features }));

    const { error } = await supabase
      .from('content_pages')
      .upsert({
        page_type: 'features',
        title: 'Features',
        content: JSON.stringify(features),
      }, {
        onConflict: 'page_type'
      });

    if (error) {
      console.error("Error saving features order:", error);
      toast.error("Failed to reorder features");
    } else {
      toast.success("Features order updated!");
    }
  };

  const addTestimonial = async (testimonial: Testimonial) => {
    const updated = { 
      ...pageContent, 
      testimonials: [...pageContent.testimonials, testimonial] 
    };
    setPageContent(updated);

    const { error } = await supabase
      .from('content_pages')
      .upsert({
        page_type: 'testimonials',
        title: 'Testimonials',
        content: JSON.stringify(updated.testimonials),
      }, {
        onConflict: 'page_type'
      });

    if (error) {
      console.error("Error saving testimonials:", error);
      toast.error("Failed to add testimonial");
    } else {
      toast.success("Testimonial added!");
    }
  };

  const updateTestimonial = async (testimonial: Testimonial) => {
    const updated = { 
      ...pageContent, 
      testimonials: pageContent.testimonials.map(t => t.id === testimonial.id ? testimonial : t) 
    };
    setPageContent(updated);

    const { error } = await supabase
      .from('content_pages')
      .upsert({
        page_type: 'testimonials',
        title: 'Testimonials',
        content: JSON.stringify(updated.testimonials),
      }, {
        onConflict: 'page_type'
      });

    if (error) {
      console.error("Error saving testimonials:", error);
      toast.error("Failed to update testimonial");
    } else {
      toast.success("Testimonial updated!");
    }
  };

  const deleteTestimonial = async (id: string) => {
    const updated = { 
      ...pageContent, 
      testimonials: pageContent.testimonials.filter(t => t.id !== id) 
    };
    setPageContent(updated);

    const { error } = await supabase
      .from('content_pages')
      .upsert({
        page_type: 'testimonials',
        title: 'Testimonials',
        content: JSON.stringify(updated.testimonials),
      }, {
        onConflict: 'page_type'
      });

    if (error) {
      console.error("Error saving testimonials:", error);
      toast.error("Failed to delete testimonial");
    } else {
      toast.success("Testimonial deleted!");
    }
  };

  // Product Management Functions
  const updateProduct = async (product: Product) => {
    const updatedProducts = pageContent.products.map(p => p.id === product.id ? product : p);
    setPageContent(prev => ({ ...prev, products: updatedProducts }));

    const { error } = await supabase
      .from('content_pages')
      .upsert({
        page_type: 'products',
        title: 'Products Showcase',
        content: JSON.stringify(updatedProducts),
      }, { onConflict: 'page_type' });

    if (error) {
      console.error("Error saving products:", error);
      toast.error("Failed to save products");
    } else {
      toast.success("Product updated!");
    }
  };

  const addProduct = async (product: Product) => {
    const updatedProducts = [...pageContent.products, product];
    setPageContent(prev => ({ ...prev, products: updatedProducts }));

    const { error } = await supabase
      .from('content_pages')
      .upsert({
        page_type: 'products',
        title: 'Products Showcase',
        content: JSON.stringify(updatedProducts),
      }, { onConflict: 'page_type' });

    if (error) {
      console.error("Error saving products:", error);
      toast.error("Failed to add product");
    } else {
      toast.success("Product added!");
    }
  };

  const deleteProduct = async (id: string) => {
    const updatedProducts = pageContent.products.filter(p => p.id !== id);
    setPageContent(prev => ({ ...prev, products: updatedProducts }));

    const { error } = await supabase
      .from('content_pages')
      .upsert({
        page_type: 'products',
        title: 'Products Showcase',
        content: JSON.stringify(updatedProducts),
      }, { onConflict: 'page_type' });

    if (error) {
      console.error("Error saving products:", error);
      toast.error("Failed to delete product");
    } else {
      toast.success("Product deleted!");
    }
  };

  const replaceProducts = async (products: Product[]) => {
    setPageContent(prev => ({ ...prev, products }));

    const { error } = await supabase
      .from('content_pages')
      .upsert({
        page_type: 'products',
        title: 'Products Showcase',
        content: JSON.stringify(products),
      }, { onConflict: 'page_type' });

    if (error) {
      console.error("Error saving products order:", error);
      toast.error("Failed to reorder products");
    } else {
      toast.success("Products order updated!");
    }
  };

  const updateServiceCard = async (card: ServiceCard) => {
    const updatedCards = pageContent.serviceCards.map(s => s.id === card.id ? card : s);
    setPageContent(prev => ({ ...prev, serviceCards: updatedCards }));

    const { error } = await supabase
      .from('content_pages')
      .upsert({
        page_type: 'service_cards',
        title: 'Service Cards',
        content: JSON.stringify(updatedCards),
      }, { onConflict: 'page_type' });

    if (error) {
      console.error("Error saving service cards:", error);
      toast.error("Failed to save service card");
    } else {
      toast.success("Service card updated!");
    }
  };

  // User Management Functions with Supabase integration
  const addUser = async (user: AdminUser) => {
    try {
      const userId = user.id && user.id.startsWith("user_") ? crypto.randomUUID() : user.id;

      const { error } = await supabase
        .from('users')
        .insert({
          id: userId,
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          role: 'user',
          email_verified: user.isActive,
        });

      if (error) {
        console.error("Error adding user:", error);
        return { success: false, error: error.message };
      }

      await loadUsers();
      return { success: true };
    } catch (error: any) {
      console.error("Error adding user:", error);
      return { success: false, error: error.message || "Failed to add user" };
    }
  };

  const updateUser = async (user: AdminUser) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          email_verified: user.isActive,
        })
        .eq('id', user.id);

      if (error) {
        console.error("Error updating user:", error);
        return { success: false, error: error.message };
      }

      await loadUsers();
      return { success: true };
    } catch (error: any) {
      console.error("Error updating user:", error);
      return { success: false, error: error.message || "Failed to update user" };
    }
  };

  const deleteUser = async (id: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id)
        .eq('role', 'user');

      if (error) {
        console.error("Error deleting user:", error);
        return { success: false, error: error.message };
      }

      await loadUsers();
      return { success: true };
    } catch (error: any) {
      console.error("Error deleting user:", error);
      return { success: false, error: error.message || "Failed to delete user" };
    }
  };

  // Staff Management Functions with Supabase Integration
  const addStaff = async (staffMember: Staff & { password?: string }) => {
    try {
      const password = (staffMember as any).password;
      
      if (!password) {
        toast.error("Password is required for new staff members");
        return { success: false, error: "Password is required" };
      }

      // Show loading toast
      const loadingToast = toast.loading("Creating staff account...");

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: staffMember.email,
        password: password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            name: staffMember.name,
            phone: staffMember.phone || '',
            role: staffMember.role,
          }
        }
      });

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      if (authError) {
        console.error("Auth signup error:", authError);
        
        // Check for rate limiting error
        if (authError.message.includes("21 seconds") || authError.message.includes("security purposes")) {
          toast.error("⏱️ Rate limit reached! Please wait 30 seconds before creating another staff account.", {
            duration: 8000,
          });
          return { success: false, error: "RATE_LIMIT: Please wait 30 seconds before creating another staff account" };
        }
        
        toast.error(`Failed to create auth user: ${authError.message}`);
        return { success: false, error: authError.message };
      }

      if (!authData.user) {
        toast.error("Failed to create user");
        return { success: false, error: "No user returned from auth" };
      }

      // Map staff role to database role
      let dbRole: 'admin' | 'staff' | 'user' = 'staff';
      if (staffMember.role === 'admin' || staffMember.role === 'manager') {
        dbRole = 'admin';
      } else {
        dbRole = 'staff';
      }

      // Insert into users table
      const { error: dbError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: staffMember.email,
          name: staffMember.name,
          phone: staffMember.phone || '',
          role: dbRole,
          email_verified: false,
        });

      if (dbError) {
        console.error("Database insert error:", dbError);
        toast.error(`Failed to create user profile: ${dbError.message}`);
        return { success: false, error: dbError.message };
      }

      // Reload staff list
      await loadStaff();

      toast.success("Staff member created successfully! They can now login.");
      return { success: true };
    } catch (error: any) {
      console.error("Error adding staff:", error);
      toast.error(`Failed to add staff: ${error.message}`);
      return { success: false, error: error.message };
    }
  };

  const updateStaff = async (staffMember: Staff & { password?: string }) => {
    try {
      const password = (staffMember as any).password;

      // Map staff role to database role
      let dbRole: 'admin' | 'staff' | 'user' = 'staff';
      if (staffMember.role === 'admin' || staffMember.role === 'manager') {
        dbRole = 'admin';
      } else {
        dbRole = 'staff';
      }

      // Update in users table
      const { error: dbError } = await supabase
        .from('users')
        .update({
          name: staffMember.name,
          phone: staffMember.phone || '',
          role: dbRole,
        })
        .eq('id', staffMember.id);

      if (dbError) {
        console.error("Database update error:", dbError);
        toast.error(`Failed to update staff: ${dbError.message}`);
        return { success: false, error: dbError.message };
      }

      // If password is provided, update it
      if (password && password.length >= 6) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: password
        });

        if (passwordError) {
          console.error("Password update error:", passwordError);
          toast.error(`Profile updated but password change failed: ${passwordError.message}`);
        } else {
          toast.success("Staff updated with new password!");
        }
      } else {
        toast.success("Staff updated successfully!");
      }

      // Reload staff list
      await loadStaff();

      return { success: true };
    } catch (error: any) {
      console.error("Error updating staff:", error);
      toast.error(`Failed to update staff: ${error.message}`);
      return { success: false, error: error.message };
    }
  };

  const deleteStaff = async (id: string) => {
    try {
      // Delete from users table
      const { error: dbError } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (dbError) {
        console.error("Database delete error:", dbError);
        toast.error(`Failed to delete staff: ${dbError.message}`);
        return { success: false, error: dbError.message };
      }

      // Reload staff list
      await loadStaff();

      toast.success("Staff member removed successfully!");
      return { success: true };
    } catch (error: any) {
      console.error("Error deleting staff:", error);
      toast.error(`Failed to delete staff: ${error.message}`);
      return { success: false, error: error.message };
    }
  };

  // SEO Settings Management
  const updateSEOSettings = async (newSettings: Partial<SEOSettings>) => {
    const updated = { ...seoSettings, ...newSettings };
    setSEOSettings(updated);

    const { error } = await supabase
      .from('seo_settings')
      .upsert({
        page_path: '/',
        title: updated.defaultTitle,
        description: updated.defaultDescription,
        keywords: updated.defaultKeywords,
        og_image: updated.ogImage || '',
      }, {
        onConflict: 'page_path'
      });

    if (error) {
      console.error("Error saving SEO settings:", error);
      toast.error("Failed to save SEO settings");
    } else {
      toast.success("SEO settings updated!");
    }
  };

  // Payment Gateway Settings Management
  const updatePaymentGateway = async (newSettings: Partial<PaymentGateway>) => {
    const updated = { ...paymentGateway, ...newSettings };
    setPaymentGateway(updated);

    const { error } = await supabase
      .from('payment_settings')
      .upsert({
        razorpay_enabled: updated.razorpay.enabled,
        razorpay_key_id: updated.razorpay.keyId,
        razorpay_key_secret: updated.razorpay.keySecret,
        phonepe_enabled: updated.phonepe.enabled,
        phonepe_merchant_id: updated.phonepe.merchantId,
        phonepe_salt_key: updated.phonepe.saltKey,
        phonepe_salt_index: updated.phonepe.saltIndex,
      });

    if (error) {
      console.error("Error saving payment settings:", error);
      toast.error("Failed to save payment settings");
      return;
    }

    // Sync payment settings to Django backend
    try {
      const response = await fetch(
        `${API_BASE}/api/payments/settings/`,
        {
          method: "POST",
          headers: await adminJsonHeaders(),
          body: JSON.stringify({
            phonepe: {
              merchantId: updated.phonepe.merchantId,
              saltKey: updated.phonepe.saltKey,
              saltIndex: updated.phonepe.saltIndex,
              enabled: updated.phonepe.enabled,
              testMode: updated.phonepe.testMode,
            },
            razorpay: {
              keyId: updated.razorpay.keyId,
              keySecret: updated.razorpay.keySecret,
              enabled: updated.razorpay.enabled,
              testMode: updated.razorpay.testMode,
            },
            codEnabled: updated.codEnabled,
          }),
        }
      );

      if (!response.ok) {
        const msg = await response.text();
        console.error("Django sync failed:", msg);
      }
    } catch (syncError) {
      console.error("Error syncing payment settings to Django:", syncError);
    }

    toast.success("Payment settings updated!");
  };

  const updateShiprocketSettings = async (newSettings: Partial<ShiprocketSettings>) => {
    const updated = { ...shiprocketSettings, ...newSettings };
    setShiprocketSettings(updated);

    const { error } = await supabase
      .from('content_pages')
      .upsert({
        page_type: 'shiprocket_settings',
        title: 'Shiprocket Settings',
        content: JSON.stringify(updated),
      }, {
        onConflict: 'page_type'
      });

    if (error) {
      console.error("Error saving shiprocket settings:", error);
      toast.error("Failed to save Shiprocket settings");
      return;
    }

    // Sync Shiprocket settings to Django backend
    try {
      const response = await fetch(
        `${API_BASE}/api/payments/shiprocket/settings/`,
        {
          method: "POST",
          headers: await adminJsonHeaders(),
          body: JSON.stringify({
            enabled: updated.enabled,
            email: updated.email,
            password: updated.password,
            webhookSecret: updated.webhookSecret,
            pickupLocation: updated.pickupLocation,
            companyName: updated.companyName,
            phone: updated.phone,
            address: updated.address,
            address2: updated.address2,
            city: updated.city,
            state: updated.state,
            pincode: updated.pincode,
            country: updated.country,
            defaultWeight: updated.defaultWeight,
            defaultLength: updated.defaultLength,
            defaultBreadth: updated.defaultBreadth,
            defaultHeight: updated.defaultHeight,
          }),
        }
      );

      if (!response.ok) {
        const msg = await response.text();
        console.error("Django Shiprocket sync failed:", msg);
      }
    } catch (syncError) {
      console.error("Error syncing Shiprocket settings to Django:", syncError);
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a145b27b/shiprocket-settings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(updated),
        }
      );

      if (!response.ok) {
        const msg = await response.text();
        console.error("Shiprocket edge sync failed:", msg);
        toast.error("Saved in DB, but Shiprocket sync failed. Please redeploy edge function.");
        return;
      }
    } catch (syncError) {
      console.error("Error syncing shiprocket settings:", syncError);
      toast.error("Saved in DB, but Shiprocket sync failed. Please redeploy edge function.");
      return;
    }

    toast.success("Shiprocket settings updated!");
  };

  // Review Management
  const addReview = async (review: Review) => {
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        user_name: review.name,
        user_email: review.email || '',
        review_text: review.content,
        rating: review.rating,
        status: review.isApproved ? 'approved' : 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding review:", error);
      toast.error("Failed to add review");
      return;
    }

    if (data) {
      await loadReviews();
      toast.success("Review added!");
    }
  };

  const updateReview = async (review: Review) => {
    const { error } = await supabase
      .from('reviews')
      .update({
        user_name: review.name,
        user_email: review.email || '',
        review_text: review.content,
        rating: review.rating,
        status: review.isApproved ? 'approved' : 'pending',
      })
      .eq('id', review.id);

    if (error) {
      console.error("Error updating review:", error);
      toast.error("Failed to update review");
      return;
    }

    await loadReviews();
    toast.success("Review updated!");
  };

  const deleteReview = async (id: string) => {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting review:", error);
      toast.error("Failed to delete review");
      return;
    }

    await loadReviews();
    toast.success("Review deleted!");
  };

  const approveReview = async (id: string) => {
    const { error } = await supabase
      .from('reviews')
      .update({ status: 'approved' })
      .eq('id', id);

    if (error) {
      console.error("Error approving review:", error);
      toast.error("Failed to approve review");
      return;
    }

    await loadReviews();
    toast.success("Review approved!");
  };

  return (
    <AdminContext.Provider
      value={{
        admin,
        isAdminAuthenticated,
        adminLogin,
        adminLogout,
        siteSettings,
        updateSiteSettings,
        pricingRules,
        updatePricingRule,
        addPricingRule,
        deletePricingRule,
        users,
        addUser,
        updateUser,
        deleteUser,
        staff,
        addStaff,
        updateStaff,
        deleteStaff,
        orders,
        refreshOrders,
        updateOrderStatus,
        updateOrderShipment,
        auditLogs,
        loadAuditLogs,
        logAdminAction,
        pageContent,
        updateHeroContent,
        updateHeroSlides,
        updateServicesSection,
        updateCTASection,
        updateContactPageContent,
        updateAboutContent,
        updateProduct,
        addProduct,
        deleteProduct,
        replaceProducts,
        updateServiceCard,
        addFAQ,
        updateFAQ,
        deleteFAQ,
        addFeature,
        updateFeature,
        deleteFeature,
        replaceFeatures,
        addTestimonial,
        updateTestimonial,
        deleteTestimonial,
        reviews,
        addReview,
        updateReview,
        deleteReview,
        approveReview,
        seoSettings,
        updateSEOSettings,
        paymentGateway,
        updatePaymentGateway,
        shiprocketSettings,
        updateShiprocketSettings,
        loadingData,
        catalogCategories,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}
