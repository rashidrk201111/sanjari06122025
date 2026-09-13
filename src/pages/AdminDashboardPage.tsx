import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";
import { API_BASE } from "../lib/apiBase";
import { adminJsonHeaders } from "../lib/adminAuthHeaders";
import { supabase } from "../lib/supabase";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Switch } from "../components/ui/switch";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  LayoutDashboard,
  Users,
  Package,
  Settings,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  FileText,
  Edit2,
  Trash2,
  Plus,
  Search,
  LogOut,
  Shield,
  Mail,
  Phone,
  MapPin,
  Globe,
  Save,
  CheckCircle2,
  XCircle,
  Clock,
  Truck,
  Eye,
  Download,
  RefreshCw,
  Ban,
  UserCheck,
  Calculator,
  Image,
  AlertCircle,
  List,
  Upload,
  X,
  Check
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { categories } from "../data/categories";
import { PricingRuleDialog } from "../components/PricingRuleDialog";
import { FAQDialog } from "../components/FAQDialog";
import { UserDialog } from "../components/UserDialog";
import { StaffDialog } from "../components/StaffDialog";
import { ProductDialog } from "../components/ProductDialog";
import { SEOSettingsTab } from "../components/admin/SEOSettingsTab";
import { PaymentSettingsTab } from "../components/admin/PaymentSettingsTab";
import { ShiprocketSettingsTab } from "../components/admin/ShiprocketSettingsTab";
import { ReviewsTab } from "../components/admin/ReviewsTab";
import { PricingRule, FAQ, AdminUser, Staff, Product, ServiceCard, Feature, HeroSlideContent, AdminAuditLog } from "../context/AdminContext";
import { projectId, publicAnonKey } from "../utils/supabase/info";

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const { 
    admin, 
    isAdminAuthenticated, 
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
    addFAQ,
    updateFAQ,
    deleteFAQ,
    updateProduct,
    addProduct,
    deleteProduct,
    replaceProducts,
    updateServiceCard,
    addFeature,
    updateFeature,
    deleteFeature,
    replaceFeatures,
    seoSettings,
    updateSEOSettings,
    paymentGateway,
    updatePaymentGateway,
    shiprocketSettings,
    updateShiprocketSettings,
  } = useAdmin();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [orderFilter, setOrderFilter] = useState("all");
  const [quickOrderView, setQuickOrderView] = useState("all");
  const [orderPreset, setOrderPreset] = useState("all");
  const [selectedOrderNumbers, setSelectedOrderNumbers] = useState<string[]>([]);
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [bulkLabeling, setBulkLabeling] = useState(false);
  const [bulkSearchQuery, setBulkSearchQuery] = useState("");
  const [bulkOrderFilter, setBulkOrderFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  
  // Site Settings State
  const [editedSettings, setEditedSettings] = useState(siteSettings);
  
  // Pricing Rule State
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [pricingDialogOpen, setPricingDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null);
  
  // Content Management State
  const [faqDialogOpen, setFaqDialogOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [editingHero, setEditingHero] = useState(false);
  const [heroData, setHeroData] = useState(pageContent.hero);
  const [heroSlidesData, setHeroSlidesData] = useState<HeroSlideContent[]>(pageContent.heroSlides);
  const [editingHeroSlides, setEditingHeroSlides] = useState(false);
  const [draggedHeroSlideId, setDraggedHeroSlideId] = useState<number | null>(null);
  const [editingServicesSection, setEditingServicesSection] = useState(false);
  const [servicesSectionData, setServicesSectionData] = useState(pageContent.servicesSection);
  const [editingCTASection, setEditingCTASection] = useState(false);
  const [ctaSectionData, setCtaSectionData] = useState(pageContent.ctaSection);
  const [editingContactPage, setEditingContactPage] = useState(false);
  const [contactPageData, setContactPageData] = useState(pageContent.contactPage);
  const [editingAbout, setEditingAbout] = useState(false);
  const [aboutData, setAboutData] = useState(pageContent.aboutPage);

  // Product Management State
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Service Card Management State
  const [editingServiceCard, setEditingServiceCard] = useState<ServiceCard | null>(null);

  // Feature Management State
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
  const [newFeature, setNewFeature] = useState<Feature>({ id: "", icon: "Star", title: "", description: "" });
  const [addingFeature, setAddingFeature] = useState(false);
  const [draggedFeatureId, setDraggedFeatureId] = useState<string | null>(null);

  const [draggedProductId, setDraggedProductId] = useState<string | null>(null);
  
  // User Management State
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  
  // Staff Management State
  const [staffDialogOpen, setStaffDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [staffFilter, setStaffFilter] = useState("all");
  const [creatingShipmentOrder, setCreatingShipmentOrder] = useState<string | null>(null);
  const [shiprocketActionOrder, setShiprocketActionOrder] = useState<string | null>(null);
  const [lastWebhookLogAt, setLastWebhookLogAt] = useState<string>("");
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<any | null>(null);
  const [orderDetailOpen, setOrderDetailOpen] = useState(false);
  
  // SEO Settings State
  const [editedSEO, setEditedSEO] = useState(seoSettings);
  
  // Payment Gateway State
  const [editedPayment, setEditedPayment] = useState(paymentGateway);
  
  // Logo Upload State
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [currentLogo, setCurrentLogo] = useState("");

  useEffect(() => {
    setHeroData(pageContent.hero);
    setHeroSlidesData(pageContent.heroSlides);
    setServicesSectionData(pageContent.servicesSection);
    setCtaSectionData(pageContent.ctaSection);
    setContactPageData(pageContent.contactPage);
    setAboutData(pageContent.aboutPage);
  }, [pageContent]);

  useEffect(() => {
    if (!admin?.id) return;
    const storageKey = `admin_orders_filters_${admin.id}`;
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.orderFilter) setOrderFilter(parsed.orderFilter);
      if (parsed?.quickOrderView) setQuickOrderView(parsed.quickOrderView);
      if (parsed?.orderPreset) setOrderPreset(parsed.orderPreset);
      if (parsed?.searchQuery) setSearchQuery(parsed.searchQuery);
    } catch {
      // Ignore invalid local storage values.
    }
  }, [admin?.id]);

  useEffect(() => {
    if (!admin?.id) return;
    const storageKey = `admin_orders_filters_${admin.id}`;
    localStorage.setItem(storageKey, JSON.stringify({
      orderFilter,
      quickOrderView,
      orderPreset,
      searchQuery,
    }));
  }, [admin?.id, orderFilter, quickOrderView, orderPreset, searchQuery]);

  useEffect(() => {
    if (activeTab !== "audit") return;
    loadAuditLogs(100);
  }, [activeTab]);

  // Keep selected order detail in sync with updated orders list
  useEffect(() => {
    if (selectedOrderDetail && orderDetailOpen) {
      const updatedOrder = orders.find(o => o.orderNumber === selectedOrderDetail.orderNumber);
      if (updatedOrder) {
        setSelectedOrderDetail(updatedOrder);
      }
    }
  }, [orders, orderDetailOpen, selectedOrderDetail]);

  // Keep bulk selected order numbers in sync with orders list
  useEffect(() => {
    setSelectedOrderNumbers(prev => prev.filter(num => orders.some(o => o.orderNumber === num)));
  }, [orders]);

  useEffect(() => {
    if (activeTab !== "orders" || !shiprocketSettings.enabled) return;

    let cancelled = false;

    const checkWebhookUpdates = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/api/payments/shiprocket/logs/`,
          {
            headers: await adminJsonHeaders(),
          }
        );

        if (!response.ok) return;

        const data = await response.json();
        if (cancelled || !Array.isArray(data?.logs)) return;

        const latestWebhookEvent = data.logs.find((log: any) =>
          ["webhook_received", "webhook_simulated"].includes(log?.eventType)
        );

        const latestWebhookAt = latestWebhookEvent?.createdAt;
        if (!latestWebhookAt) return;

        if (!lastWebhookLogAt) {
          setLastWebhookLogAt(latestWebhookAt);
          return;
        }

        if (new Date(latestWebhookAt).getTime() > new Date(lastWebhookLogAt).getTime()) {
          setLastWebhookLogAt(latestWebhookAt);
          await refreshOrders();
          toast.success("Orders auto-refreshed after Shiprocket webhook update");
        }
      } catch {
        // Silent polling for admin convenience; no toast spam on transient network errors.
      }
    };

    checkWebhookUpdates();
    const intervalId = window.setInterval(checkWebhookUpdates, 15000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [activeTab, shiprocketSettings.enabled, lastWebhookLogAt]);

  // Redirect if not authenticated
  if (!isAdminAuthenticated || !admin) {
    navigate("/admin/login");
    return null;
  }

  // Calculate statistics
  const totalUsers = users.length;
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const pendingOrders = orders.filter(o => o.status === "pending" || o.status === "processing").length;
  const deliveredOrders = orders.filter(o => o.status === "delivered").length;
  const shippedOrders = orders.filter(o => o.status === "shipped").length;
  const withTrackingOrders = orders.filter(o => !!o.trackingNumber).length;

  const isBulkQuoteOrder = (order: any) =>
    Array.isArray(order.items) && order.items.some((item: any) => item?.type === "bulk_quote_request");

  const regularOrders = orders.filter(order => !isBulkQuoteOrder(order));
  const bulkQuoteOrders = orders.filter(order => isBulkQuoteOrder(order));

  const matchesQuickView = (order: any) => {
    if (quickOrderView === "all") return true;
    if (quickOrderView === "pending") return order.status === "pending" || order.status === "processing";
    if (quickOrderView === "shipped") return order.status === "shipped";
    if (quickOrderView === "delivered") return order.status === "delivered";
    if (quickOrderView === "attention") {
      const createdAt = new Date(order.date);
      const ageInDays = Number.isNaN(createdAt.getTime()) ? 0 : (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
      const stalePending = (order.status === "pending" || order.status === "processing") && ageInDays > 2;
      const shippedWithoutTracking = order.status === "shipped" && !order.trackingNumber;
      return stalePending || shippedWithoutTracking;
    }
    return true;
  };

  const matchesPreset = (order: any) => {
    if (orderPreset === "all") return true;

    const createdDate = new Date(order.date);
    const now = new Date();

    if (orderPreset === "today") {
      return createdDate.toDateString() === now.toDateString();
    }

    if (orderPreset === "last7") {
      const diff = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 7;
    }

    if (orderPreset === "cod") {
      return String(order.paymentMethod || "").toLowerCase().includes("cod") ||
        String(order.paymentMethod || "").toLowerCase().includes("cash");
    }

    if (orderPreset === "noTracking") {
      return !order.trackingNumber;
    }

    return true;
  };

  // Filter orders
  const filteredOrders = regularOrders.filter(order => {
    const matchesFilter = orderFilter === "all" || order.status === orderFilter;
    const matchesQuick = matchesQuickView(order);
    const matchesOrderPreset = matchesPreset(order);
    const matchesSearch = searchQuery === "" || 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.deliveryAddress?.fullName || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesQuick && matchesOrderPreset && matchesSearch;
  });

  const selectedOrders = filteredOrders.filter(order => selectedOrderNumbers.includes(order.orderNumber));
  const allFilteredSelected = filteredOrders.length > 0 && filteredOrders.every(order => selectedOrderNumbers.includes(order.orderNumber));

  const filteredBulkQuoteOrders = bulkQuoteOrders.filter(order => {
    const matchesFilter = bulkOrderFilter === "all" || order.status === bulkOrderFilter;
    const bulkItem = Array.isArray(order.items)
      ? order.items.find((item: any) => item?.type === "bulk_quote_request")
      : null;
    const matchesSearch = bulkSearchQuery === "" ||
      order.orderNumber.toLowerCase().includes(bulkSearchQuery.toLowerCase()) ||
      (order.deliveryAddress?.fullName || "").toLowerCase().includes(bulkSearchQuery.toLowerCase()) ||
      (bulkItem?.companyName || "").toLowerCase().includes(bulkSearchQuery.toLowerCase()) ||
      (bulkItem?.productType || "").toLowerCase().includes(bulkSearchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesFilter = userFilter === "all" || 
      (userFilter === "active" && user.isActive) || 
      (userFilter === "inactive" && !user.isActive);
    const matchesSearch = searchQuery === "" ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleLogout = () => {
    adminLogout();
    toast.success("Logged out successfully");
    navigate("/admin/login");
  };

  // Fetch current logo on mount
  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/api/payments/logo/`,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.logo) {
            setCurrentLogo(data.logo);
            setLogoPreview(data.logo);
          }
        }
      } catch (error) {
        console.error("Error fetching logo:", error);
      }
    };

    fetchLogo();
  }, []);

  const handleLogoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size should be less than 2MB");
      return;
    }

    setLogoFile(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = async () => {
    if (!logoFile) {
      toast.error("Please select a file first");
      return;
    }

    setUploadingLogo(true);
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        
        // Upload to server
        const response = await fetch(
          `${API_BASE}/api/payments/logo/`,
          {
            method: "POST",
            headers: await adminJsonHeaders(),
            body: JSON.stringify({
              file: base64,
              fileName: logoFile.name,
              fileType: logoFile.type,
            }),
          }
        );

        if (!response.ok) {
          const error = await response.text();
          throw new Error(error || "Failed to upload logo");
        }

        const data = await response.json();
        
        // Update current logo
        setCurrentLogo(data.url);
        setLogoPreview(data.url);
        setLogoFile(null);
        
        toast.success("Logo uploaded successfully! It will appear on your website shortly.");
      };
      
      reader.readAsDataURL(logoFile);
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast.error("Failed to upload logo. Please try again.");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleLogoRemove = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/api/payments/logo/`,
        {
          method: "DELETE",
          headers: await adminJsonHeaders(),
        }
      );

      if (response.ok) {
        setCurrentLogo("");
        setLogoPreview("");
        setLogoFile(null);
        toast.success("Logo removed successfully!");
      } else {
        throw new Error("Failed to remove logo");
      }
    } catch (error) {
      console.error("Error removing logo:", error);
      toast.error("Failed to remove logo");
    }
  };

  const handleLogoReset = () => {
    setLogoFile(null);
    setLogoPreview(currentLogo);
  };

  const handleSaveSettings = () => {
    updateSiteSettings(editedSettings);
    toast.success("Site settings updated successfully!");
  };

  const handleSlideImageUpload = async (slideId: number, file: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      const toastId = toast.loading("Uploading slide image...");
      try {
        const response = await fetch(
          `${API_BASE}/api/payments/upload-image/`,
          {
            method: "POST",
            headers: await adminJsonHeaders(),
            body: JSON.stringify({
              file: base64,
              fileName: file.name,
              fileType: file.type,
            }),
          }
        );
        if (!response.ok) {
          throw new Error("Failed to upload image");
        }
        const data = await response.json();
        handleUpdateHeroSlide(slideId, "imageUrl", data.url);
        toast.success("Image uploaded successfully!", { id: toastId });
      } catch (err) {
        console.error("Error uploading image:", err);
        toast.error("Failed to upload image. Please try again.", { id: toastId });
      }
    };
    reader.readAsDataURL(file);
  };


  const handleUpdateOrderStatus = (orderNumber: string, newStatus: string) => {
    updateOrderStatus(orderNumber, newStatus);
    logAdminAction("order_status_updated", { orderNumber, newStatus });
    toast.success(`Order ${orderNumber} status updated to ${newStatus}`);
  };

  const toggleOrderSelection = (orderNumber: string) => {
    setSelectedOrderNumbers(prev =>
      prev.includes(orderNumber)
        ? prev.filter(id => id !== orderNumber)
        : [...prev, orderNumber]
    );
  };

  const toggleSelectAllFiltered = () => {
    if (allFilteredSelected) {
      setSelectedOrderNumbers(prev => prev.filter(id => !filteredOrders.some(order => order.orderNumber === id)));
      return;
    }

    const filteredIds = filteredOrders.map(order => order.orderNumber);
    setSelectedOrderNumbers(prev => Array.from(new Set([...prev, ...filteredIds])));
  };

  const handleBulkStatusUpdate = async (newStatus: "pending" | "processing" | "shipped" | "delivered" | "cancelled") => {
    if (selectedOrderNumbers.length === 0) {
      toast.error("Select at least one order");
      return;
    }

    setBulkUpdating(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .in('order_number', selectedOrderNumbers);

      if (error) {
        throw error;
      }

      await refreshOrders();
      await logAdminAction("orders_bulk_status_updated", {
        count: selectedOrderNumbers.length,
        newStatus,
        orderNumbers: selectedOrderNumbers,
      });
      toast.success(`Updated ${selectedOrderNumbers.length} orders to ${newStatus}`);
      setSelectedOrderNumbers([]);
    } catch (error: any) {
      console.error("Bulk order status update failed:", error);
      toast.error(error?.message || "Failed to update selected orders");
    } finally {
      setBulkUpdating(false);
    }
  };

  const toCsvCell = (value: any) => {
    const text = String(value ?? "");
    return `"${text.replace(/"/g, '""')}"`;
  };

  const exportOrdersCsv = (rows: any[], filename: string) => {
    const headers = [
      "Order Number",
      "Date",
      "Status",
      "Customer",
      "Phone",
      "Email",
      "Items",
      "Total",
      "Payment Method",
      "Tracking Number",
    ];

    const lines = rows.map(order => [
      order.orderNumber,
      order.date,
      order.status,
      order.deliveryAddress?.fullName || "",
      order.deliveryAddress?.phone || "",
      order.deliveryAddress?.email || "",
      order.items?.length || 0,
      order.total || 0,
      order.paymentMethod || "",
      order.trackingNumber || "",
    ].map(toCsvCell).join(","));

    const csv = [headers.map(toCsvCell).join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportOrdersCsv = (mode: "filtered" | "selected") => {
    const source = mode === "selected" ? selectedOrders : filteredOrders;
    if (!source.length) {
      toast.error("No orders available to export");
      return;
    }

    const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, "-");
    const filename = mode === "selected"
      ? `selected-orders-${timestamp}.csv`
      : `filtered-orders-${timestamp}.csv`;
    exportOrdersCsv(source, filename);
    logAdminAction("orders_csv_exported", { mode, count: source.length });
    toast.success(`${source.length} orders exported`);
  };

  const exportAuditLogsCsv = () => {
    if (!auditLogs.length) {
      toast.error("No audit logs to export");
      return;
    }

    const headers = ["Time", "Admin Name", "Admin Email", "Action", "Details"];
    const rows = auditLogs.map(log => [
      new Date(log.createdAt).toLocaleString("en-IN"),
      log.actorName,
      log.actorEmail,
      log.action,
      JSON.stringify(log.details || {}),
    ].map(toCsvCell).join(","));

    const csv = [headers.map(toCsvCell).join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, "-");
    link.href = url;
    link.setAttribute("download", `admin-audit-logs-${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    logAdminAction("audit_logs_csv_exported", { count: auditLogs.length });
    toast.success(`${auditLogs.length} audit logs exported`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="w-4 h-4" />;
      case "processing": return <Package className="w-4 h-4" />;
      case "shipped": return <Truck className="w-4 h-4" />;
      case "delivered": return <CheckCircle2 className="w-4 h-4" />;
      case "cancelled": return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "processing": return "bg-blue-100 text-blue-700 border-blue-300";
      case "shipped": return "bg-purple-100 text-purple-700 border-purple-300";
      case "delivered": return "bg-green-100 text-green-700 border-green-300";
      case "cancelled": return "bg-red-100 text-red-700 border-red-300";
      default: return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const handleSavePricingRule = (rule: PricingRule) => {
    if (editingRule) {
      updatePricingRule(rule);
    } else {
      addPricingRule(rule);
    }
  };

  const handleEditRule = (rule: PricingRule) => {
    setEditingRule(rule);
    setPricingDialogOpen(true);
  };

  const handleAddRule = () => {
    setEditingRule(null);
    setPricingDialogOpen(true);
  };

  const handleDeleteRule = (id: string) => {
    if (confirm("Are you sure you want to delete this pricing rule?")) {
      deletePricingRule(id);
      toast.success("Pricing rule deleted");
    }
  };

  // Content Management Handlers
  // Product handlers
  const handleSaveProduct = (product: Product) => {
    if (editingProduct) {
      updateProduct(product);
    } else {
      addProduct(product);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductDialogOpen(true);
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setProductDialogOpen(true);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProduct(id);
    }
  };

  // Feature handlers
  const handleSaveFeature = () => {
    const feature = { ...newFeature, id: crypto.randomUUID() };
    addFeature(feature);
    setNewFeature({ id: "", icon: "Star", title: "", description: "" });
    setAddingFeature(false);
  };

  const handleUpdateFeature = (feature: Feature) => {
    updateFeature(feature);
    setEditingFeature(null);
  };

  const handleDeleteFeature = (id: string) => {
    if (confirm("Delete this feature?")) deleteFeature(id);
  };

  // Service card handlers
  const handleSaveServiceCard = (card: ServiceCard) => {
    updateServiceCard(card);
    setEditingServiceCard(null);
  };

  const handleSaveFAQ = (faq: FAQ) => {    if (editingFAQ) {
      updateFAQ(faq);
    } else {
      addFAQ(faq);
    }
  };

  const handleEditFAQ = (faq: FAQ) => {
    setEditingFAQ(faq);
    setFaqDialogOpen(true);
  };

  const handleAddFAQ = () => {
    setEditingFAQ(null);
    setFaqDialogOpen(true);
  };

  const handleDeleteFAQ = (id: string) => {
    if (confirm("Are you sure you want to delete this FAQ?")) {
      deleteFAQ(id);
      toast.success("FAQ deleted");
    }
  };

  const handleSaveHero = () => {
    updateHeroContent(heroData);
    setEditingHero(false);
    toast.success("Hero content updated!");
  };

  const handleSaveHeroSlides = () => {
    updateHeroSlides(heroSlidesData);
    setEditingHeroSlides(false);
    toast.success("Hero slides updated!");
  };

  const handleUpdateHeroSlide = (id: number, field: keyof HeroSlideContent, value: string) => {
    setHeroSlidesData(prev => prev.map(slide => slide.id === id ? { ...slide, [field]: value } : slide));
  };

  const reorderListById = <T extends { id: string | number }>(list: T[], dragId: string | number, dropId: string | number) => {
    const from = list.findIndex(item => item.id === dragId);
    const to = list.findIndex(item => item.id === dropId);
    if (from === -1 || to === -1 || from === to) return list;
    const clone = [...list];
    const [moved] = clone.splice(from, 1);
    clone.splice(to, 0, moved);
    return clone;
  };

  const handleDropHeroSlide = (dropId: number) => {
    if (draggedHeroSlideId === null || draggedHeroSlideId === dropId) return;
    setHeroSlidesData(prev => reorderListById(prev, draggedHeroSlideId, dropId));
    setDraggedHeroSlideId(null);
  };

  const handleDropFeature = async (dropId: string) => {
    if (!draggedFeatureId || draggedFeatureId === dropId) return;
    const reordered = reorderListById(pageContent.features, draggedFeatureId, dropId);
    setDraggedFeatureId(null);
    await replaceFeatures(reordered);
  };

  const handleDropProduct = async (dropId: string) => {
    if (!draggedProductId || draggedProductId === dropId) return;
    const reordered = reorderListById(pageContent.products, draggedProductId, dropId);
    setDraggedProductId(null);
    await replaceProducts(reordered);
  };

  const handleSaveServicesSection = () => {
    updateServicesSection(servicesSectionData);
    setEditingServicesSection(false);
    toast.success("Services section updated!");
  };

  const handleSaveCTASection = () => {
    updateCTASection(ctaSectionData);
    setEditingCTASection(false);
    toast.success("CTA section updated!");
  };

  const handleSaveContactPage = () => {
    updateContactPageContent(contactPageData);
    setEditingContactPage(false);
    toast.success("Contact page content updated!");
  };

  const handleSaveAbout = () => {
    updateAboutContent(aboutData);
    setEditingAbout(false);
    toast.success("About page updated!");
  };

  // User Management Handlers
  const handleSaveUser = async (user: AdminUser) => {
    if (editingUser) {
      return await updateUser(user);
    } else {
      return await addUser(user);
    }
  };

  const handleEditUser = (user: AdminUser) => {
    setEditingUser(user);
    setUserDialogOpen(true);
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setUserDialogOpen(true);
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      const result = await deleteUser(id);
      if (result.success) {
        toast.success("User deleted");
      } else {
        toast.error(result.error || "Failed to delete user");
      }
    }
  };

  // Staff Management Handlers
  const handleSaveStaff = async (staffMember: Staff & { password?: string }) => {
    if (editingStaff) {
      return await updateStaff(staffMember);
    } else {
      return await addStaff(staffMember);
    }
  };

  const handleEditStaff = (staffMember: Staff) => {
    setEditingStaff(staffMember);
    setStaffDialogOpen(true);
  };

  const handleAddStaff = () => {
    setEditingStaff(null);
    setStaffDialogOpen(true);
  };

  const handleDeleteStaff = async (id: string) => {
    if (confirm("Are you sure you want to delete this staff member?")) {
      await deleteStaff(id);
    }
  };

  const handleCreateShiprocketShipment = async (order: any) => {
    try {
      if (order.trackingNumber) {
        const proceed = confirm("This order already has a tracking number. Create another shipment anyway?");
        if (!proceed) return;
      }

      setCreatingShipmentOrder(order.orderNumber);

      const response = await fetch(
        `${API_BASE}/api/payments/shiprocket/create-shipment/`,
        {
          method: "POST",
          headers: await adminJsonHeaders(),
          body: JSON.stringify({ orderNumber: order.orderNumber, order, force: !!order.trackingNumber }),
        }
      );

      const data = await response.json();
      if (!response.ok || !data?.success) {
        throw new Error(data?.error || "Failed to create shipment");
      }

      toast.success(`Shipment created! AWB: ${data.awbCode || "N/A"}`);
      await updateOrderShipment(order.orderNumber, {
        status: "shipped",
        trackingNumber: data.awbCode || order.trackingNumber,
        trackingUrl: data.trackingUrl || order.trackingUrl,
      });
    } catch (error: any) {
      console.error("Shiprocket shipment creation failed:", error);
      toast.error(error?.message || "Could not create Shiprocket shipment");
    } finally {
      setCreatingShipmentOrder(null);
    }
  };

  const openFirstUrlFromObject = (obj: any): string | null => {
    if (!obj || typeof obj !== "object") return null;
    const urlCandidateKeys = ["label_url", "manifest_url", "url", "pdf_url", "tracking_url", "invoice_url"];

    for (const key of urlCandidateKeys) {
      const val = obj[key];
      if (typeof val === "string" && /^https?:\/\//i.test(val)) return val;
    }

    for (const val of Object.values(obj)) {
      if (typeof val === "string" && /^https?:\/\//i.test(val)) return val;
      if (typeof val === "object") {
        const nested = openFirstUrlFromObject(val);
        if (nested) return nested;
      }
    }

    return null;
  };

  const handleOpenLabel = async (order: any) => {
    try {
      setShiprocketActionOrder(order.orderNumber);
      const response = await fetch(
        `${API_BASE}/api/payments/shiprocket/label/${encodeURIComponent(order.orderNumber)}/`,
        {
          headers: await adminJsonHeaders(),
        }
      );
      const data = await response.json();
      if (!response.ok || !data?.success) {
        throw new Error(data?.error || "Could not generate label");
      }

      const url = openFirstUrlFromObject(data);
      if (url) {
        window.open(url, "_blank");
      } else {
        toast.info("Label generated. Shiprocket did not return a direct URL.");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to open label");
    } finally {
      setShiprocketActionOrder(null);
    }
  };

  const handleBulkGenerateLabels = async () => {
    if (selectedOrders.length === 0) {
      toast.error("Select at least one order for bulk labels");
      return;
    }

    setBulkLabeling(true);
    try {
      const openedUrls = new Set<string>();
      const failedOrders: string[] = [];

      for (const order of selectedOrders) {
        try {
          const response = await fetch(
            `${API_BASE}/api/payments/shiprocket/label/${encodeURIComponent(order.orderNumber)}/`,
            {
              headers: await adminJsonHeaders(),
            }
          );

          const data = await response.json();
          if (!response.ok || !data?.success) {
            failedOrders.push(order.orderNumber);
            continue;
          }

          const url = openFirstUrlFromObject(data);
          if (url) {
            openedUrls.add(url);
          } else {
            failedOrders.push(order.orderNumber);
          }
        } catch {
          failedOrders.push(order.orderNumber);
        }
      }

      openedUrls.forEach((url) => window.open(url, "_blank"));

      await logAdminAction("orders_bulk_labels_generated", {
        totalSelected: selectedOrders.length,
        labelsOpened: openedUrls.size,
        failedOrders,
      });

      if (openedUrls.size > 0) {
        toast.success(`Opened ${openedUrls.size} label(s)`);
      }

      if (failedOrders.length > 0) {
        toast.error(`Could not generate labels for ${failedOrders.length} order(s)`);
      }
    } finally {
      setBulkLabeling(false);
    }
  };

  const handleOpenManifest = async (order: any) => {
    try {
      setShiprocketActionOrder(order.orderNumber);
      const response = await fetch(
        `${API_BASE}/api/payments/shiprocket/manifest/${encodeURIComponent(order.orderNumber)}/`,
        {
          headers: await adminJsonHeaders(),
        }
      );
      const data = await response.json();
      if (!response.ok || !data?.success) {
        throw new Error(data?.error || "Could not generate manifest");
      }

      const url = openFirstUrlFromObject(data);
      if (url) {
        window.open(url, "_blank");
      } else {
        toast.info("Manifest generated. Shiprocket did not return a direct URL.");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to open manifest");
    } finally {
      setShiprocketActionOrder(null);
    }
  };

  const handleTrackShipment = async (order: any) => {
    if (!order.trackingNumber) {
      toast.error("No tracking number available for this order");
      return;
    }

    try {
      setShiprocketActionOrder(order.orderNumber);
      const response = await fetch(
        `${API_BASE}/api/payments/shiprocket/track/${encodeURIComponent(order.trackingNumber)}/`,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await response.json();
      if (!response.ok || !data?.success) {
        throw new Error(data?.error || "Could not fetch tracking");
      }

      const url = openFirstUrlFromObject(data);
      if (url) {
        window.open(url, "_blank");
      } else {
        toast.success("Tracking fetched successfully");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to fetch tracking");
    } finally {
      setShiprocketActionOrder(null);
    }
  };

  const handleExceptionAction = async (order: any, action: "retry_delivery" | "mark_rto") => {
    try {
      setShiprocketActionOrder(order.orderNumber);
      const response = await fetch(
        `${API_BASE}/api/payments/shiprocket/action/`,
        {
          method: "POST",
          headers: await adminJsonHeaders(),
          body: JSON.stringify({
            orderNumber: order.orderNumber,
            action,
            note: action === "retry_delivery" ? "Manual retry requested from admin" : "Marked as RTO from admin",
          }),
        }
      );

      const data = await response.json();
      if (!response.ok || !data?.success) {
        throw new Error(data?.error || "Action failed");
      }

      if (action === "retry_delivery") {
        await updateOrderStatus(order.orderNumber, "shipped");
        toast.success("Retry delivery action saved");
      } else {
        await updateOrderStatus(order.orderNumber, "cancelled");
        toast.success("Order marked as RTO/cancelled");
      }
    } catch (error: any) {
      toast.error(error?.message || "Could not run action");
    } finally {
      setShiprocketActionOrder(null);
    }
  };

  // Helper functions for subcategory management
  const getSubcategoriesForCategory = (categorySlug: string) => {
    if (categorySlug === "all") {
      return categories.flatMap(cat => 
        cat.subcategories.map(sub => ({
          ...sub,
          categoryName: cat.name,
          categorySlug: cat.slug
        }))
      );
    }
    const category = categories.find(cat => cat.slug === categorySlug);
    return category ? category.subcategories.map(sub => ({
      ...sub,
      categoryName: category.name,
      categorySlug: category.slug
    })) : [];
  };

  const hasRuleForSubcategory = (categorySlug: string, subcategoryName: string) => {
    return pricingRules.some(rule => 
      rule.category === categorySlug && 
      rule.subcategory.toLowerCase() === subcategoryName.toLowerCase()
    );
  };

  const getRuleForSubcategory = (categorySlug: string, subcategoryName: string) => {
    return pricingRules.find(rule => 
      rule.category === categorySlug && 
      rule.subcategory.toLowerCase() === subcategoryName.toLowerCase()
    );
  };

  const handleQuickAddRule = (categorySlug: string, categoryName: string, subcategoryName: string) => {
    setEditingRule(null);
    setPricingDialogOpen(true);
    // The dialog will be pre-filled with this category/subcategory
    setTimeout(() => {
      const event = new CustomEvent('prefillPricingRule', {
        detail: { categorySlug, categoryName, subcategoryName }
      });
      window.dispatchEvent(event);
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white/95 backdrop-blur border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-sm">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl text-slate-900 tracking-tight">Admin Dashboard</h1>
                <p className="text-sm text-slate-600">Manage your printing service platform</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm text-gray-900">{admin.name}</p>
                <p className="text-xs text-gray-600">{admin.role}</p>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="w-full h-auto flex flex-wrap justify-start gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
            <TabsTrigger value="overview" className="gap-2 rounded-xl px-4 py-2.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <LayoutDashboard className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2 rounded-xl px-4 py-2.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <ShoppingCart className="w-4 h-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="bulk-quotes" className="gap-2 rounded-xl px-4 py-2.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Package className="w-4 h-4" />
              Bulk Quotes
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2 rounded-xl px-4 py-2.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="pricing" className="gap-2 rounded-xl px-4 py-2.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Calculator className="w-4 h-4" />
              Pricing
            </TabsTrigger>
            <TabsTrigger value="content" className="gap-2 rounded-xl px-4 py-2.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <FileText className="w-4 h-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="reviews" className="gap-2 rounded-xl px-4 py-2.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <List className="w-4 h-4" />
              Reviews
            </TabsTrigger>
            <TabsTrigger value="seo" className="gap-2 rounded-xl px-4 py-2.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Globe className="w-4 h-4" />
              SEO
            </TabsTrigger>
            <TabsTrigger value="payment" className="gap-2 rounded-xl px-4 py-2.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <DollarSign className="w-4 h-4" />
              Payment
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2 rounded-xl px-4 py-2.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="audit" className="gap-2 rounded-xl px-4 py-2.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Shield className="w-4 h-4" />
              Audit Logs
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <Card className="p-6 border-blue-200 bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-sm text-blue-900/80 mb-1">Total Revenue</p>
                <p className="text-3xl text-blue-950 tracking-tight">₹{totalRevenue.toLocaleString()}</p>
              </Card>

              <Card className="p-6 border-emerald-200 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
                    <ShoppingCart className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-sm text-emerald-900/80 mb-1">Total Orders</p>
                <p className="text-3xl text-emerald-950 tracking-tight">{totalOrders}</p>
              </Card>

              <Card className="p-6 border-violet-200 bg-gradient-to-br from-violet-50 via-indigo-50 to-blue-50 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-violet-600 rounded-xl flex items-center justify-center shadow-sm">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-sm text-violet-900/80 mb-1">Total Users</p>
                <p className="text-3xl text-violet-950 tracking-tight">{totalUsers}</p>
              </Card>

              <Card className="p-6 border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center shadow-sm">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-sm text-orange-900/80 mb-1">Pending Orders</p>
                <p className="text-3xl text-orange-950 tracking-tight">{pendingOrders}</p>
              </Card>
            </div>

            {/* Recent Orders */}
            <Card className="p-6 border-slate-200 shadow-sm">
              <h2 className="text-xl text-slate-900 mb-4 tracking-tight">Recent Orders</h2>
              <div className="space-y-3">
                {orders.slice(0, 5).map(order => (
                  <div key={order.orderNumber} className="flex items-center justify-between p-4 bg-slate-50/90 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-4">
                      <Package className="w-5 h-5 text-slate-600" />
                      <div>
                        <p className="text-sm text-slate-900">Order #{order.orderNumber}</p>
                        <p className="text-xs text-slate-600">{order.deliveryAddress.fullName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1">{order.status}</span>
                      </Badge>
                      <p className="text-sm text-gray-900">₹{order.total}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Orders Management Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <h2 className="text-2xl text-gray-900">Order Management</h2>
                <div className="flex gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search orders..."
                      className="pl-10 w-64"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={orderFilter} onValueChange={setOrderFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  { key: "all", label: "All" },
                  { key: "pending", label: "Pending" },
                  { key: "shipped", label: "Shipped" },
                  { key: "delivered", label: "Delivered" },
                  { key: "attention", label: "Needs Attention" },
                ].map(view => (
                  <Button
                    key={view.key}
                    size="sm"
                    variant={quickOrderView === view.key ? "default" : "outline"}
                    onClick={() => setQuickOrderView(view.key)}
                  >
                    {view.label}
                  </Button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  { key: "all", label: "Preset: All" },
                  { key: "today", label: "Today" },
                  { key: "last7", label: "Last 7 Days" },
                  { key: "cod", label: "COD" },
                  { key: "noTracking", label: "No Tracking" },
                ].map(preset => (
                  <Button
                    key={preset.key}
                    size="sm"
                    variant={orderPreset === preset.key ? "default" : "outline"}
                    onClick={() => setOrderPreset(preset.key)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-6 p-3 rounded-xl border bg-slate-50">
                <Badge variant="outline">Selected: {selectedOrderNumbers.length}</Badge>
                <Button size="sm" variant="outline" onClick={() => handleExportOrdersCsv("filtered")}>Export Filtered CSV</Button>
                <Button size="sm" variant="outline" onClick={() => handleExportOrdersCsv("selected")} disabled={selectedOrderNumbers.length === 0}>Export Selected CSV</Button>
                <Button size="sm" variant="outline" onClick={handleBulkGenerateLabels} disabled={selectedOrderNumbers.length === 0 || bulkLabeling}>
                  {bulkLabeling ? "Generating Labels..." : "Bulk Print Labels"}
                </Button>
                <Button size="sm" onClick={() => handleBulkStatusUpdate("processing")} disabled={selectedOrderNumbers.length === 0 || bulkUpdating}>Mark Processing</Button>
                <Button size="sm" onClick={() => handleBulkStatusUpdate("shipped")} disabled={selectedOrderNumbers.length === 0 || bulkUpdating}>Mark Shipped</Button>
                <Button size="sm" onClick={() => handleBulkStatusUpdate("delivered")} disabled={selectedOrderNumbers.length === 0 || bulkUpdating}>Mark Delivered</Button>
                <Button size="sm" variant="outline" onClick={() => setSelectedOrderNumbers([])} disabled={selectedOrderNumbers.length === 0}>Clear Selection</Button>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                <Card className="p-3 bg-blue-50 border-blue-200">
                  <p className="text-xs text-blue-700">Total Orders</p>
                  <p className="text-lg text-blue-900">{regularOrders.length}</p>
                </Card>
                <Card className="p-3 bg-purple-50 border-purple-200">
                  <p className="text-xs text-purple-700">Shipped</p>
                  <p className="text-lg text-purple-900">{shippedOrders}</p>
                </Card>
                <Card className="p-3 bg-green-50 border-green-200">
                  <p className="text-xs text-green-700">Delivered</p>
                  <p className="text-lg text-green-900">{deliveredOrders}</p>
                </Card>
                <Card className="p-3 bg-amber-50 border-amber-200">
                  <p className="text-xs text-amber-700">With Tracking</p>
                  <p className="text-lg text-amber-900">{withTrackingOrders}</p>
                </Card>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <input
                          type="checkbox"
                          checked={allFilteredSelected}
                          onChange={toggleSelectAllFiltered}
                          aria-label="Select all filtered orders"
                        />
                      </TableHead>
                      <TableHead>Order #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tracking</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map(order => (
                      <TableRow key={order.orderNumber}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedOrderNumbers.includes(order.orderNumber)}
                            onChange={() => toggleOrderSelection(order.orderNumber)}
                            aria-label={`Select order ${order.orderNumber}`}
                          />
                        </TableCell>
                        <TableCell className="font-mono text-sm">{order.orderNumber}</TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm text-gray-900">{order.deliveryAddress.fullName}</p>
                            <p className="text-xs text-gray-600">{order.deliveryAddress.phone}</p>
                          </div>
                        </TableCell>
                        <TableCell>{order.items.length}</TableCell>
                        <TableCell>₹{order.total}</TableCell>
                        <TableCell>
                          <Select
                            value={order.status}
                            onValueChange={(value) => handleUpdateOrderStatus(order.orderNumber, value)}
                          >
                            <SelectTrigger className={`w-32 ${getStatusColor(order.status)}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="processing">Processing</SelectItem>
                              <SelectItem value="shipped">Shipped</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-xs text-gray-700">{order.trackingNumber || "-"}</p>
                            {order.trackingNumber && (
                              <Badge variant="outline" className="text-[10px]">AWB</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">{order.date}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 flex-wrap">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              title="View order"
                              onClick={() => {
                                setSelectedOrderDetail(order);
                                setOrderDetailOpen(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              title="Create Shiprocket shipment"
                              onClick={() => handleCreateShiprocketShipment(order)}
                              disabled={creatingShipmentOrder === order.orderNumber || shiprocketActionOrder === order.orderNumber}
                            >
                              <Truck className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              title="Track shipment"
                              onClick={() => handleTrackShipment(order)}
                              disabled={!order.trackingNumber || shiprocketActionOrder === order.orderNumber}
                            >
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              title="Download shipping label"
                              onClick={() => handleOpenLabel(order)}
                              disabled={shiprocketActionOrder === order.orderNumber}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              title="Download manifest"
                              onClick={() => handleOpenManifest(order)}
                              disabled={shiprocketActionOrder === order.orderNumber}
                            >
                              <FileText className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              title="Retry delivery"
                              onClick={() => handleExceptionAction(order, "retry_delivery")}
                              disabled={shiprocketActionOrder === order.orderNumber}
                            >
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              title="Mark RTO"
                              onClick={() => handleExceptionAction(order, "mark_rto")}
                              disabled={shiprocketActionOrder === order.orderNumber}
                            >
                              <Ban className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          {/* Bulk Quotes Management Tab */}
          <TabsContent value="bulk-quotes" className="space-y-6">
            <Card className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl text-gray-900">Bulk Quote Requests</h2>
                  <p className="text-sm text-gray-600 mt-1">Quote requests submitted from the Bulk Order page</p>
                </div>
                <div className="flex gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search quote requests..."
                      className="pl-10 w-64"
                      value={bulkSearchQuery}
                      onChange={(e) => setBulkSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={bulkOrderFilter} onValueChange={setBulkOrderFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mb-4">
                <Badge variant="outline" className="text-sm">
                  Total Bulk Quotes: {bulkQuoteOrders.length}
                </Badge>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ref #</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Requirement</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBulkQuoteOrders.map(order => {
                      const bulkItem = Array.isArray(order.items)
                        ? order.items.find((item: any) => item?.type === "bulk_quote_request")
                        : null;

                      return (
                        <TableRow key={order.orderNumber}>
                          <TableCell className="font-mono text-sm">{order.orderNumber}</TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm text-gray-900">{order.deliveryAddress?.fullName || "N/A"}</p>
                              <p className="text-xs text-gray-600">{order.deliveryAddress?.phone || "N/A"}</p>
                              <p className="text-xs text-gray-500">{order.deliveryAddress?.email || ""}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-gray-700">{bulkItem?.companyName || "N/A"}</TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm text-gray-900">{bulkItem?.productType || "N/A"}</p>
                              <p className="text-xs text-gray-600 max-w-xs truncate" title={bulkItem?.details || ""}>
                                {bulkItem?.details || "No extra details"}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{bulkItem?.quantity || "-"}</TableCell>
                          <TableCell>
                            <Select
                              value={order.status}
                              onValueChange={(value) => handleUpdateOrderStatus(order.orderNumber, value)}
                            >
                              <SelectTrigger className={`w-32 ${getStatusColor(order.status)}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="processing">Processing</SelectItem>
                                <SelectItem value="shipped">Shipped</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">{order.date}</TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              title="View order"
                              onClick={() => {
                                setSelectedOrderDetail(order);
                                setOrderDetailOpen(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          {/* Users Management Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <h2 className="text-2xl text-gray-900">Customer Management</h2>
                <div className="flex gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search users..."
                      className="pl-10 w-64"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={userFilter} onValueChange={setUserFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleAddUser} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map(user => {
                      const userOrders = orders.filter(o => o.deliveryAddress.phone === user.phone);
                      return (
                        <TableRow key={user.id}>
                          <TableCell className="text-gray-900">{user.name}</TableCell>
                          <TableCell className="text-sm text-gray-600">{user.email}</TableCell>
                          <TableCell className="text-sm text-gray-600">{user.phone || "N/A"}</TableCell>
                          <TableCell>{userOrders.length}</TableCell>
                          <TableCell className="text-sm text-gray-600">{user.joinedDate}</TableCell>
                          <TableCell>
                            <Badge className={user.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                              {user.isActive ? <UserCheck className="w-3 h-3 mr-1" /> : <Ban className="w-3 h-3 mr-1" />}
                              {user.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user.id)}>
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </Card>

            {/* Staff Management Section */}
            <Card className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl text-gray-900">Staff Management</h2>
                  <p className="text-sm text-gray-600 mt-1">Manage team members with role-based access</p>
                </div>
                <div className="flex gap-3">
                  <Select value={staffFilter} onValueChange={setStaffFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Staff</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="support">Support</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleAddStaff} className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Staff
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staff
                      .filter(s => {
                        if (staffFilter === "all") return true;
                        if (staffFilter === "active") return s.isActive;
                        if (staffFilter === "inactive") return !s.isActive;
                        return s.role === staffFilter;
                      })
                      .map(staffMember => (
                        <TableRow key={staffMember.id}>
                          <TableCell className="text-gray-900">{staffMember.name}</TableCell>
                          <TableCell className="text-sm text-gray-600">{staffMember.email}</TableCell>
                          <TableCell className="text-sm text-gray-600">{staffMember.phone || "N/A"}</TableCell>
                          <TableCell>
                            <Badge className={
                              staffMember.role === "admin" ? "bg-red-100 text-red-700" :
                              staffMember.role === "manager" ? "bg-blue-100 text-blue-700" :
                              staffMember.role === "staff" ? "bg-purple-100 text-purple-700" :
                              "bg-green-100 text-green-700"
                            }>
                              {staffMember.role.charAt(0).toUpperCase() + staffMember.role.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600 capitalize">
                            {staffMember.department?.replace("-", " ") || "N/A"}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">{staffMember.joinedDate}</TableCell>
                          <TableCell className="text-sm text-gray-600">{staffMember.lastLogin || "Never"}</TableCell>
                          <TableCell>
                            <Badge className={staffMember.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                              {staffMember.isActive ? <UserCheck className="w-3 h-3 mr-1" /> : <Ban className="w-3 h-3 mr-1" />}
                              {staffMember.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleEditStaff(staffMember)}>
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteStaff(staffMember.id)}>
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </Card>

            {/* User Dialog */}
            <UserDialog
              open={userDialogOpen}
              onOpenChange={setUserDialogOpen}
              user={editingUser}
              onSave={handleSaveUser}
            />

            {/* Staff Dialog */}
            <StaffDialog
              open={staffDialogOpen}
              onOpenChange={setStaffDialogOpen}
              staff={editingStaff}
              onSave={handleSaveStaff}
            />
          </TabsContent>

          {/* Pricing Management Tab */}
          <TabsContent value="pricing" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl text-gray-900">Price Calculator Management</h2>
                <Button onClick={handleAddRule} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Pricing Rule
                </Button>
              </div>

              <Alert className="mb-6">
                <Calculator className="h-4 w-4" />
                <AlertDescription>
                  Configure pricing rules for different product categories. These rules will be used in the price calculator.
                </AlertDescription>
              </Alert>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <Label>Filter by Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat.slug} value={cat.slug}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Subcategory Coverage Overview */}
              {selectedCategory !== "all" && (
                <Card className="p-6 mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg text-gray-900 mb-1">Subcategory Coverage</h3>
                      <p className="text-sm text-gray-600">
                        {getSubcategoriesForCategory(selectedCategory).filter(sub => 
                          hasRuleForSubcategory(selectedCategory, sub.name)
                        ).length} of {getSubcategoriesForCategory(selectedCategory).length} subcategories configured
                      </p>
                    </div>
                    <Badge className="bg-blue-600 text-white">
                      {Math.round((getSubcategoriesForCategory(selectedCategory).filter(sub => 
                        hasRuleForSubcategory(selectedCategory, sub.name)
                      ).length / Math.max(getSubcategoriesForCategory(selectedCategory).length, 1)) * 100)}% Complete
                    </Badge>
                  </div>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {getSubcategoriesForCategory(selectedCategory).map(subcategory => {
                      const hasRule = hasRuleForSubcategory(selectedCategory, subcategory.name);
                      const rule = getRuleForSubcategory(selectedCategory, subcategory.name);
                      
                      return (
                        <Card 
                          key={subcategory.slug} 
                          className={`p-3 border-2 transition-all ${
                            hasRule 
                              ? 'bg-green-50 border-green-300 hover:border-green-400' 
                              : 'bg-white border-orange-300 hover:border-orange-400'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                {hasRule ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                                ) : (
                                  <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0" />
                                )}
                                <p className="text-sm text-gray-900 truncate" title={subcategory.name}>
                                  {subcategory.name}
                                </p>
                              </div>
                              {hasRule && rule && (
                                <p className="text-xs text-gray-600">Base: ₹{rule.basePrice}</p>
                              )}
                            </div>
                            <div className="flex gap-1 flex-shrink-0">
                              {hasRule && rule ? (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-7 w-7 p-0"
                                  onClick={() => handleEditRule(rule)}
                                >
                                  <Edit2 className="w-3 h-3" />
                                </Button>
                              ) : (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-7 px-2 text-xs bg-orange-100 hover:bg-orange-200 text-orange-700"
                                  onClick={() => handleQuickAddRule(
                                    selectedCategory,
                                    categories.find(c => c.slug === selectedCategory)?.name || '',
                                    subcategory.name
                                  )}
                                >
                                  <Plus className="w-3 h-3 mr-1" />
                                  Add
                                </Button>
                              )}
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                  
                  {getSubcategoriesForCategory(selectedCategory).length === 0 && (
                    <div className="text-center py-6">
                      <p className="text-gray-600">No subcategories available for this category</p>
                    </div>
                  )}
                </Card>
              )}

              {pricingRules.length === 0 ? (
                <div className="text-center py-12">
                  <Calculator className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl text-gray-900 mb-2">No Pricing Rules</h3>
                  <p className="text-gray-600 mb-6">Add your first pricing rule to get started</p>
                  <Button onClick={handleAddRule} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Pricing Rule
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {pricingRules
                    .filter(rule => selectedCategory === "all" || rule.category === selectedCategory)
                    .map(rule => (
                      <Card key={rule.id} className="p-4 border-2 hover:border-blue-200 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg text-gray-900">{rule.subcategory}</h3>
                              <Badge variant="outline">{rule.category}</Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">Base Price: ₹{rule.basePrice}</p>
                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-gray-700 mb-1">Paper Types:</p>
                                <div className="space-y-1">
                                  {rule.paperTypes.map((paper, idx) => (
                                    <p key={idx} className="text-gray-600">• {paper.name} (+₹{paper.priceModifier})</p>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <p className="text-gray-700 mb-1">Quantity Discounts:</p>
                                <div className="space-y-1">
                                  {rule.quantityDiscounts.map((discount, idx) => (
                                    <p key={idx} className="text-gray-600">• {discount.minQty}+ units: {discount.discount}% off</p>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEditRule(rule)}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteRule(rule.id)}>
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                </div>
              )}
            </Card>

            {/* Pricing Rule Dialog */}
            <PricingRuleDialog
              open={pricingDialogOpen}
              onOpenChange={setPricingDialogOpen}
              rule={editingRule}
              onSave={handleSavePricingRule}
            />
          </TabsContent>

          {/* Content Management Tab */}
          <TabsContent value="content" className="space-y-6">
            {/* Hero Section */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl text-gray-900">Homepage Hero Section</h2>
                {!editingHero ? (
                  <Button onClick={() => setEditingHero(true)} variant="outline">
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Hero
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={handleSaveHero} className="bg-green-600 hover:bg-green-700">
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button onClick={() => {
                      setEditingHero(false);
                      setHeroData(pageContent.hero);
                    }} variant="outline">
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              {editingHero ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="heroTitle">Hero Title</Label>
                    <Input
                      id="heroTitle"
                      value={heroData.title}
                      onChange={(e) => setHeroData({ ...heroData, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
                    <Textarea
                      id="heroSubtitle"
                      value={heroData.subtitle}
                      onChange={(e) => setHeroData({ ...heroData, subtitle: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="heroCta">CTA Button Text</Label>
                      <Input
                        id="heroCta"
                        value={heroData.ctaText}
                        onChange={(e) => setHeroData({ ...heroData, ctaText: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="heroCtaLink">CTA Button Link</Label>
                      <Input
                        id="heroCtaLink"
                        value={heroData.ctaLink}
                        onChange={(e) => setHeroData({ ...heroData, ctaLink: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-xl text-gray-900">{pageContent.hero.title}</h3>
                  <p className="text-gray-600">{pageContent.hero.subtitle}</p>
                  <p className="text-sm text-gray-500">CTA: {pageContent.hero.ctaText} → {pageContent.hero.ctaLink}</p>
                </div>
              )}
            </Card>

            {/* Hero Slides Management */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl text-gray-900">Hero Slides (All Slides)</h2>
                  <p className="text-sm text-gray-500 mt-1">Edit badges, text, links, and image URL for every homepage hero slide.</p>
                </div>
                {!editingHeroSlides ? (
                  <Button onClick={() => setEditingHeroSlides(true)} variant="outline">
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Slides
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={handleSaveHeroSlides} className="bg-green-600 hover:bg-green-700">
                      <Save className="w-4 h-4 mr-2" />
                      Save All Slides
                    </Button>
                    <Button
                      onClick={() => {
                        setEditingHeroSlides(false);
                        setHeroSlidesData(pageContent.heroSlides);
                      }}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {heroSlidesData.map((slide, index) => (
                  <Card
                    key={slide.id}
                    className="p-4 border-2"
                    draggable={editingHeroSlides}
                    onDragStart={() => setDraggedHeroSlideId(slide.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDropHeroSlide(slide.id)}
                  >
                    <h3 className="text-lg text-gray-900 mb-3">Hero Poster {index + 1}</h3>

                    {editingHeroSlides ? (
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label>Hero Poster Image</Label>
                          <div className="overflow-hidden rounded-lg border bg-gray-100" style={{ aspectRatio: "2172 / 724" }}>
                            {slide.imageUrl ? (
                              <img src={slide.imageUrl} alt={`Hero poster ${index + 1}`} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full items-center justify-center text-sm text-gray-500">
                                Default homepage poster
                              </div>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button type="button" variant="outline" size="sm" asChild>
                              <label className="cursor-pointer">
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Poster
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleSlideImageUpload(slide.id, file);
                                    e.currentTarget.value = "";
                                  }}
                                />
                              </label>
                            </Button>
                            {slide.imageUrl && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleUpdateHeroSlide(slide.id, "imageUrl", "")}
                              >
                                <X className="w-4 h-4 mr-2" />
                                Use Default
                              </Button>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">Recommended size: 2172 x 724 px, or any 3:1 banner image under 5MB.</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label>Badge</Label>
                            <Input value={slide.badge} onChange={(e) => handleUpdateHeroSlide(slide.id, "badge", e.target.value)} />
                          </div>
                          <div className="space-y-1">
                            <Label>Tag Text</Label>
                            <Input value={slide.tagText} onChange={(e) => handleUpdateHeroSlide(slide.id, "tagText", e.target.value)} />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <Label>Title</Label>
                          <Input value={slide.title} onChange={(e) => handleUpdateHeroSlide(slide.id, "title", e.target.value)} />
                        </div>

                        <div className="space-y-1">
                          <Label>Subtitle</Label>
                          <Textarea rows={2} value={slide.subtitle} onChange={(e) => handleUpdateHeroSlide(slide.id, "subtitle", e.target.value)} />
                        </div>

                        <div className="grid md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label>Primary CTA Label</Label>
                            <Input value={slide.ctaLabel} onChange={(e) => handleUpdateHeroSlide(slide.id, "ctaLabel", e.target.value)} />
                          </div>
                          <div className="space-y-1">
                            <Label>Primary CTA Link</Label>
                            <Input value={slide.ctaLink} onChange={(e) => handleUpdateHeroSlide(slide.id, "ctaLink", e.target.value)} />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label>Secondary CTA Label</Label>
                            <Input value={slide.secondaryLabel} onChange={(e) => handleUpdateHeroSlide(slide.id, "secondaryLabel", e.target.value)} />
                          </div>
                          <div className="space-y-1">
                            <Label>Secondary CTA Link</Label>
                            <Input value={slide.secondaryLink} onChange={(e) => handleUpdateHeroSlide(slide.id, "secondaryLink", e.target.value)} />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <Label>Background Image URL (optional)</Label>
                          <Input
                            placeholder="https://..."
                            value={slide.imageUrl}
                            onChange={(e) => handleUpdateHeroSlide(slide.id, "imageUrl", e.target.value)}
                          />
                          <p className="text-xs text-gray-500">Leave empty to keep the built-in image for this slide.</p>
                          <p className="text-xs text-blue-600 mt-1">Tip: Drag this card to reorder slides.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1 text-sm text-gray-700">
                        <p><span className="text-gray-500">Badge:</span> {slide.badge}</p>
                        <p><span className="text-gray-500">Title:</span> {slide.title}</p>
                        <p><span className="text-gray-500">Primary CTA:</span> {slide.ctaLabel} → {slide.ctaLink}</p>
                        <p><span className="text-gray-500">Secondary CTA:</span> {slide.secondaryLabel} → {slide.secondaryLink}</p>
                        <p><span className="text-gray-500">Image URL:</span> {slide.imageUrl || "(default image)"}</p>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </Card>

            {/* About Page */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl text-gray-900">About Page Content</h2>
                {!editingAbout ? (
                  <Button onClick={() => setEditingAbout(true)} variant="outline">
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit About
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={handleSaveAbout} className="bg-green-600 hover:bg-green-700">
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button onClick={() => {
                      setEditingAbout(false);
                      setAboutData(pageContent.aboutPage);
                    }} variant="outline">
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              {editingAbout ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="aboutTitle">Page Title</Label>
                    <Input
                      id="aboutTitle"
                      value={aboutData.title}
                      onChange={(e) => setAboutData({ ...aboutData, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aboutSubtitle">Subtitle</Label>
                    <Input
                      id="aboutSubtitle"
                      value={aboutData.subtitle}
                      onChange={(e) => setAboutData({ ...aboutData, subtitle: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aboutDescription">Description</Label>
                    <Textarea
                      id="aboutDescription"
                      value={aboutData.description}
                      onChange={(e) => setAboutData({ ...aboutData, description: e.target.value })}
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aboutMission">Mission Statement</Label>
                    <Textarea
                      id="aboutMission"
                      value={aboutData.mission}
                      onChange={(e) => setAboutData({ ...aboutData, mission: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aboutVision">Vision Statement</Label>
                    <Textarea
                      id="aboutVision"
                      value={aboutData.vision}
                      onChange={(e) => setAboutData({ ...aboutData, vision: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-xl text-gray-900">{pageContent.aboutPage.title}</h3>
                  <p className="text-gray-700">{pageContent.aboutPage.subtitle}</p>
                  <p className="text-sm text-gray-600">{pageContent.aboutPage.description}</p>
                </div>
              )}
            </Card>

            {/* Services Section */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl text-gray-900">Homepage Services Section</h2>
                {!editingServicesSection ? (
                  <Button onClick={() => setEditingServicesSection(true)} variant="outline">
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Services Section
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={handleSaveServicesSection} className="bg-green-600 hover:bg-green-700">
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button onClick={() => {
                      setEditingServicesSection(false);
                      setServicesSectionData(pageContent.servicesSection);
                    }} variant="outline">
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              {editingServicesSection ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="servicesBadge">Badge Text</Label>
                    <Input
                      id="servicesBadge"
                      value={servicesSectionData.badge}
                      onChange={(e) => setServicesSectionData({ ...servicesSectionData, badge: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="servicesTitle">Title</Label>
                    <Input
                      id="servicesTitle"
                      value={servicesSectionData.title}
                      onChange={(e) => setServicesSectionData({ ...servicesSectionData, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="servicesSubtitle">Subtitle</Label>
                    <Textarea
                      id="servicesSubtitle"
                      rows={3}
                      value={servicesSectionData.subtitle}
                      onChange={(e) => setServicesSectionData({ ...servicesSectionData, subtitle: e.target.value })}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Badge: {pageContent.servicesSection.badge}</p>
                  <h3 className="text-xl text-gray-900">{pageContent.servicesSection.title}</h3>
                  <p className="text-sm text-gray-600">{pageContent.servicesSection.subtitle}</p>
                </div>
              )}
            </Card>

            {/* CTA Section */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl text-gray-900">Homepage CTA Section</h2>
                {!editingCTASection ? (
                  <Button onClick={() => setEditingCTASection(true)} variant="outline">
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit CTA Section
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={handleSaveCTASection} className="bg-green-600 hover:bg-green-700">
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button onClick={() => {
                      setEditingCTASection(false);
                      setCtaSectionData(pageContent.ctaSection);
                    }} variant="outline">
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              {editingCTASection ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ctaTitle">Title</Label>
                    <Input
                      id="ctaTitle"
                      value={ctaSectionData.title}
                      onChange={(e) => setCtaSectionData({ ...ctaSectionData, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ctaSubtitle">Subtitle</Label>
                    <Textarea
                      id="ctaSubtitle"
                      rows={3}
                      value={ctaSectionData.subtitle}
                      onChange={(e) => setCtaSectionData({ ...ctaSectionData, subtitle: e.target.value })}
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ctaPrimaryText">Primary Button Text</Label>
                      <Input
                        id="ctaPrimaryText"
                        value={ctaSectionData.primaryText}
                        onChange={(e) => setCtaSectionData({ ...ctaSectionData, primaryText: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ctaPrimaryLink">Primary Button Link</Label>
                      <Input
                        id="ctaPrimaryLink"
                        value={ctaSectionData.primaryLink}
                        onChange={(e) => setCtaSectionData({ ...ctaSectionData, primaryLink: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ctaSecondaryText">Secondary Button Text</Label>
                      <Input
                        id="ctaSecondaryText"
                        value={ctaSectionData.secondaryText}
                        onChange={(e) => setCtaSectionData({ ...ctaSectionData, secondaryText: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ctaSecondaryLink">Secondary Button Link</Label>
                      <Input
                        id="ctaSecondaryLink"
                        value={ctaSectionData.secondaryLink}
                        onChange={(e) => setCtaSectionData({ ...ctaSectionData, secondaryLink: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-xl text-gray-900">{pageContent.ctaSection.title}</h3>
                  <p className="text-sm text-gray-600">{pageContent.ctaSection.subtitle}</p>
                  <p className="text-xs text-gray-500">
                    Primary: {pageContent.ctaSection.primaryText} ({pageContent.ctaSection.primaryLink})
                  </p>
                  <p className="text-xs text-gray-500">
                    Secondary: {pageContent.ctaSection.secondaryText} ({pageContent.ctaSection.secondaryLink})
                  </p>
                </div>
              )}
            </Card>

            {/* Contact Page Content */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl text-gray-900">Contact Page Content</h2>
                {!editingContactPage ? (
                  <Button onClick={() => setEditingContactPage(true)} variant="outline">
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Contact Page
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={handleSaveContactPage} className="bg-green-600 hover:bg-green-700">
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button onClick={() => {
                      setEditingContactPage(false);
                      setContactPageData(pageContent.contactPage);
                    }} variant="outline">
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              {editingContactPage ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactTitle">Page Title</Label>
                    <Input
                      id="contactTitle"
                      value={contactPageData.title}
                      onChange={(e) => setContactPageData({ ...contactPageData, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactSubtitle">Page Subtitle</Label>
                    <Textarea
                      id="contactSubtitle"
                      rows={2}
                      value={contactPageData.subtitle}
                      onChange={(e) => setContactPageData({ ...contactPageData, subtitle: e.target.value })}
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactFormTitle">Form Title</Label>
                      <Input
                        id="contactFormTitle"
                        value={contactPageData.formTitle}
                        onChange={(e) => setContactPageData({ ...contactPageData, formTitle: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactWhatsapp">WhatsApp Text</Label>
                      <Input
                        id="contactWhatsapp"
                        value={contactPageData.whatsappText}
                        onChange={(e) => setContactPageData({ ...contactPageData, whatsappText: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactFormSubtitle">Form Subtitle</Label>
                    <Textarea
                      id="contactFormSubtitle"
                      rows={2}
                      value={contactPageData.formSubtitle}
                      onChange={(e) => setContactPageData({ ...contactPageData, formSubtitle: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactBusinessHours">Business Hours (one line per row)</Label>
                    <Textarea
                      id="contactBusinessHours"
                      rows={3}
                      value={contactPageData.businessHours}
                      onChange={(e) => setContactPageData({ ...contactPageData, businessHours: e.target.value })}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-xl text-gray-900">{pageContent.contactPage.title}</h3>
                  <p className="text-sm text-gray-600">{pageContent.contactPage.subtitle}</p>
                  <p className="text-xs text-gray-500">Form: {pageContent.contactPage.formTitle}</p>
                </div>
              )}
            </Card>

            {/* Features Management */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl text-gray-900">Why Choose Us — Feature Highlights</h2>
                  <p className="text-sm text-gray-500 mt-1">These feature cards appear in the "Why Choose Us" section on the homepage.</p>
                </div>
                <Button onClick={() => setAddingFeature(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Feature
                </Button>
              </div>

              <div className="space-y-3">
                {pageContent.features.map(feature => (
                  <Card
                    key={feature.id}
                    className="p-4 border-2 hover:border-blue-200 transition-colors"
                    draggable={editingFeature?.id !== feature.id}
                    onDragStart={() => setDraggedFeatureId(feature.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => void handleDropFeature(feature.id)}
                  >
                    {editingFeature?.id === feature.id ? (
                      <div className="space-y-3">
                        <div className="grid md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label>Title</Label>
                            <Input
                              value={editingFeature.title}
                              onChange={(e) => setEditingFeature({ ...editingFeature, title: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label>Icon (Lucide)</Label>
                            <Input
                              placeholder="e.g. Star, Palette, Clock, Truck, Shield, CheckCircle"
                              value={editingFeature.icon}
                              onChange={(e) => setEditingFeature({ ...editingFeature, icon: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label>Description</Label>
                          <Textarea
                            rows={2}
                            value={editingFeature.description}
                            onChange={(e) => setEditingFeature({ ...editingFeature, description: e.target.value })}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleUpdateFeature(editingFeature)}>
                            <Save className="w-4 h-4 mr-1" />Save
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setEditingFeature(null)}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className="bg-blue-100 text-blue-700 text-xs">{feature.icon}</Badge>
                            <h3 className="text-gray-900 font-medium">{feature.title}</h3>
                          </div>
                          <p className="text-sm text-gray-600">{feature.description}</p>
                          <p className="text-xs text-blue-600 mt-1">Drag to reorder</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => setEditingFeature(feature)}>
                            <Edit2 className="w-4 h-4 mr-1" />Edit
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteFeature(feature.id)}>
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}

                {/* Add Feature Form */}
                {addingFeature && (
                  <Card className="p-4 border-2 border-blue-300 bg-blue-50">
                    <h4 className="text-gray-900 font-medium mb-3">New Feature</h4>
                    <div className="space-y-3">
                      <div className="grid md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label>Title *</Label>
                          <Input
                            placeholder="e.g. Fast Turnaround"
                            value={newFeature.title}
                            onChange={(e) => setNewFeature({ ...newFeature, title: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Icon (Lucide)</Label>
                          <Input
                            placeholder="e.g. Clock, Star, Shield"
                            value={newFeature.icon}
                            onChange={(e) => setNewFeature({ ...newFeature, icon: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label>Description</Label>
                        <Textarea
                          rows={2}
                          placeholder="Short description of this feature"
                          value={newFeature.description}
                          onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={handleSaveFeature} disabled={!newFeature.title.trim()}>
                          <Save className="w-4 h-4 mr-1" />Add Feature
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setAddingFeature(false)}>Cancel</Button>
                      </div>
                    </div>
                  </Card>
                )}

                {pageContent.features.length === 0 && !addingFeature && (
                  <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                    No custom features yet. Click "Add Feature" or leave empty to use the built-in defaults.
                  </div>
                )}
              </div>
            </Card>

            {/* Popular Products Management */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl text-gray-900">Popular Products (Homepage Showcase)</h2>
                  <p className="text-sm text-gray-500 mt-1">Edit product titles, descriptions, and poster images shown on the homepage.</p>
                </div>
                <Button onClick={handleAddProduct} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </div>

              <div className="space-y-3">
                {pageContent.products.map(product => (
                  <Card
                    key={product.id}
                    className="p-4 border-2 hover:border-blue-200 transition-colors"
                    draggable
                    onDragStart={() => setDraggedProductId(product.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => void handleDropProduct(product.id)}
                  >
                    {editingServiceCard === null && (
                      <div className="flex items-start gap-4">
                        {product.imageUrl && (
                          <img
                            src={product.imageUrl}
                            alt={product.title}
                            className="w-16 h-16 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                          />
                        )}
                        {!product.imageUrl && (
                          <div className="w-16 h-16 bg-gray-100 rounded-lg border border-dashed border-gray-300 flex items-center justify-center flex-shrink-0">
                            <Image className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-gray-900 font-medium">{product.title}</h3>
                            <Badge className={product.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}>
                              {product.isActive ? "Visible" : "Hidden"}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{product.description}</p>
                          <p className="text-xs text-gray-400 mt-1">Slug: {product.slug}</p>
                          {!product.imageUrl && (
                            <p className="text-xs text-orange-600 mt-1">Using default image — set a custom image URL to update the poster</p>
                          )}
                          <p className="text-xs text-blue-600 mt-1">Drag to reorder</p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Button variant="outline" size="sm" onClick={() => handleEditProduct(product)}>
                            <Edit2 className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteProduct(product.id)}>
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
                {pageContent.products.length === 0 && (
                  <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                    No products yet. Click "Add Product" to get started.
                  </div>
                )}
              </div>
            </Card>

            {/* Service Cards Management */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl text-gray-900">Services Section Cards</h2>
                  <p className="text-sm text-gray-500 mt-1">Edit the individual service cards shown in the Services section on the homepage.</p>
                </div>
              </div>

              <div className="space-y-3">
                {pageContent.serviceCards.map(card => (
                  <Card key={card.id} className="p-4 border-2 hover:border-blue-200 transition-colors">
                    {editingServiceCard?.id === card.id ? (
                      <div className="space-y-3">
                        <div className="grid md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label>Title</Label>
                            <Input
                              value={editingServiceCard.title}
                              onChange={(e) => setEditingServiceCard({ ...editingServiceCard, title: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label>Tag</Label>
                            <Input
                              value={editingServiceCard.tag}
                              onChange={(e) => setEditingServiceCard({ ...editingServiceCard, tag: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label>Description</Label>
                          <Textarea
                            rows={2}
                            value={editingServiceCard.description}
                            onChange={(e) => setEditingServiceCard({ ...editingServiceCard, description: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Icon Name (Lucide)</Label>
                          <Input
                            placeholder="e.g. CreditCard, FileText, Image, Package, Tag"
                            value={editingServiceCard.icon}
                            onChange={(e) => setEditingServiceCard({ ...editingServiceCard, icon: e.target.value })}
                          />
                          <p className="text-xs text-gray-500">Options: CreditCard, FileText, Image, Package, Tag, Star, Printer, BookOpen, Layers</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleSaveServiceCard(editingServiceCard)}>
                            <Save className="w-4 h-4 mr-1" />
                            Save
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setEditingServiceCard(null)}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className="bg-blue-100 text-blue-700 text-xs">{card.icon}</Badge>
                            <h3 className="text-gray-900 font-medium">{card.title}</h3>
                            <Badge className="bg-purple-100 text-purple-700 text-xs">{card.tag}</Badge>
                          </div>
                          <p className="text-sm text-gray-600">{card.description}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setEditingServiceCard(card)}>
                          <Edit2 className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </Card>

            {/* FAQs Management */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl text-gray-900">FAQs Management</h2>
                <Button onClick={handleAddFAQ} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add FAQ
                </Button>
              </div>

              <div className="space-y-3">
                {pageContent.faqs.map(faq => (
                  <Card key={faq.id} className="p-4 border-2 hover:border-blue-200 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-blue-100 text-blue-700">{faq.category}</Badge>
                          <h3 className="text-gray-900">{faq.question}</h3>
                        </div>
                        <p className="text-sm text-gray-600">{faq.answer}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditFAQ(faq)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteFAQ(faq.id)}>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            {/* FAQ Dialog */}
            <FAQDialog
              open={faqDialogOpen}
              onOpenChange={setFaqDialogOpen}
              faq={editingFAQ}
              onSave={handleSaveFAQ}
            />

            {/* Product Dialog */}
            <ProductDialog
              open={productDialogOpen}
              onOpenChange={setProductDialogOpen}
              product={editingProduct}
              onSave={handleSaveProduct}
            />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl text-gray-900">Site Settings</h2>
                <Button onClick={handleSaveSettings} className="bg-green-600 hover:bg-green-700">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>

              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg text-gray-900 mb-4">Basic Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="siteName">Site Name</Label>
                      <Input
                        id="siteName"
                        value={editedSettings.siteName}
                        onChange={(e) => setEditedSettings({ ...editedSettings, siteName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-4 col-span-2">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
                        <Label className="text-base mb-3 block">Website Logo</Label>
                        
                        {/* Current Logo Preview */}
                        {logoPreview ? (
                          <div className="mb-4">
                            <div className="relative inline-block">
                              <img
                                src={logoPreview}
                                alt="Logo preview"
                                className="max-w-[200px] max-h-[120px] object-contain border-2 border-gray-200 rounded-lg p-2 bg-white"
                              />
                              {logoFile && (
                                <Badge className="absolute -top-2 -right-2 bg-orange-500 text-white px-2 py-1 text-xs">
                                  Preview
                                </Badge>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="mb-4 text-center py-8 border-2 border-gray-200 rounded-lg bg-white">
                            <Image className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">No logo uploaded</p>
                            <p className="text-xs text-gray-500 mt-1">Default icon will be shown</p>
                          </div>
                        )}

                        {/* Upload Section */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={handleLogoFileSelect}
                              className="flex-1"
                              disabled={uploadingLogo}
                            />
                            
                            {logoFile && (
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={handleLogoReset}
                                title="Cancel selection"
                                disabled={uploadingLogo}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>

                          {logoFile && (
                            <Alert className="bg-blue-50 border-blue-200">
                              <AlertDescription className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm text-blue-900">
                                    <strong>Selected:</strong> {logoFile.name}
                                  </p>
                                  <p className="text-xs text-blue-700 mt-1">
                                    Size: {(logoFile.size / 1024).toFixed(2)} KB
                                  </p>
                                </div>
                                <Check className="w-5 h-5 text-blue-600" />
                              </AlertDescription>
                            </Alert>
                          )}

                          <div className="flex gap-2">
                            <Button
                              onClick={handleLogoUpload}
                              disabled={!logoFile || uploadingLogo}
                              className="flex-1"
                            >
                              {uploadingLogo ? (
                                <>
                                  <Upload className="w-4 h-4 mr-2 animate-spin" />
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <Upload className="w-4 h-4 mr-2" />
                                  Upload Logo
                                </>
                              )}
                            </Button>

                            {currentLogo && (
                              <Button
                                onClick={handleLogoRemove}
                                variant="destructive"
                                disabled={uploadingLogo}
                              >
                                <X className="w-4 h-4 mr-2" />
                                Remove
                              </Button>
                            )}
                          </div>

                          <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="text-xs">
                              <strong>Recommended:</strong> 200x200px or larger. Max 2MB. 
                              Formats: PNG, JPG, SVG, WebP. Transparent background (PNG) works best.
                            </AlertDescription>
                          </Alert>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg text-gray-900 mb-4">Contact Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">
                        <Mail className="w-4 h-4 inline mr-2" />
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={editedSettings.email}
                        onChange={(e) => setEditedSettings({ ...editedSettings, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">
                        <Phone className="w-4 h-4 inline mr-2" />
                        Primary Phone
                      </Label>
                      <Input
                        id="phone"
                        value={editedSettings.phone}
                        onChange={(e) => setEditedSettings({ ...editedSettings, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone2">
                        <Phone className="w-4 h-4 inline mr-2" />
                        Secondary Phone (Optional)
                      </Label>
                      <Input
                        id="phone2"
                        value={editedSettings.phone2 || ""}
                        onChange={(e) => setEditedSettings({ ...editedSettings, phone2: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">
                        <MapPin className="w-4 h-4 inline mr-2" />
                        Address
                      </Label>
                      <Input
                        id="address"
                        value={editedSettings.address}
                        onChange={(e) => setEditedSettings({ ...editedSettings, address: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg text-gray-900 mb-4">Footer Content</h3>
                  <div className="space-y-2">
                    <Label htmlFor="footerAbout">About Text</Label>
                    <Textarea
                      id="footerAbout"
                      rows={3}
                      value={editedSettings.footerAbout}
                      onChange={(e) => setEditedSettings({ ...editedSettings, footerAbout: e.target.value })}
                    />
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg text-gray-900 mb-4">
                    <Globe className="w-5 h-5 inline mr-2" />
                    Social Media Links
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="facebook">Facebook</Label>
                      <Input
                        id="facebook"
                        value={editedSettings.socialMedia.facebook || ""}
                        onChange={(e) => setEditedSettings({
                          ...editedSettings,
                          socialMedia: { ...editedSettings.socialMedia, facebook: e.target.value }
                        })}
                        placeholder="https://facebook.com/yourpage"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="instagram">Instagram</Label>
                      <Input
                        id="instagram"
                        value={editedSettings.socialMedia.instagram || ""}
                        onChange={(e) => setEditedSettings({
                          ...editedSettings,
                          socialMedia: { ...editedSettings.socialMedia, instagram: e.target.value }
                        })}
                        placeholder="https://instagram.com/yourpage"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="twitter">Twitter</Label>
                      <Input
                        id="twitter"
                        value={editedSettings.socialMedia.twitter || ""}
                        onChange={(e) => setEditedSettings({
                          ...editedSettings,
                          socialMedia: { ...editedSettings.socialMedia, twitter: e.target.value }
                        })}
                        placeholder="https://twitter.com/yourpage"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="linkedin">LinkedIn</Label>
                      <Input
                        id="linkedin"
                        value={editedSettings.socialMedia.linkedin || ""}
                        onChange={(e) => setEditedSettings({
                          ...editedSettings,
                          socialMedia: { ...editedSettings.socialMedia, linkedin: e.target.value }
                        })}
                        placeholder="https://linkedin.com/company/yourpage"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            <ReviewsTab />
          </TabsContent>

          {/* SEO Settings Tab */}
          <TabsContent value="seo" className="space-y-6">
            <SEOSettingsTab 
              seoSettings={seoSettings}
              updateSEOSettings={updateSEOSettings}
            />
          </TabsContent>

          {/* Payment Gateway Settings Tab */}
          <TabsContent value="payment" className="space-y-6">
            <PaymentSettingsTab 
              paymentGateway={paymentGateway}
              updatePaymentGateway={updatePaymentGateway}
            />

            <ShiprocketSettingsTab
              shiprocketSettings={shiprocketSettings}
              updateShiprocketSettings={updateShiprocketSettings}
              canEdit={admin?.role === "admin"}
            />
          </TabsContent>

          <TabsContent value="audit" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl text-gray-900">Admin Audit Logs</h2>
                  <p className="text-sm text-gray-600 mt-1">Tracks key admin actions for accountability.</p>
                </div>
                <Button variant="outline" onClick={() => loadAuditLogs(150)}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Button variant="outline" onClick={exportAuditLogsCsv}>
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Admin</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-sm text-gray-500 py-8">
                          No audit logs found. If this remains empty, create the audit table from SQL migration first.
                        </TableCell>
                      </TableRow>
                    ) : (
                      auditLogs.map((log: AdminAuditLog) => (
                        <TableRow key={log.id}>
                          <TableCell className="text-sm text-gray-700">
                            {new Date(log.createdAt).toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm text-gray-900">{log.actorName}</p>
                              <p className="text-xs text-gray-600">{log.actorEmail}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{log.action}</Badge>
                          </TableCell>
                          <TableCell className="max-w-xl">
                            <pre className="text-xs text-gray-700 whitespace-pre-wrap break-all">
                              {JSON.stringify(log.details || {}, null, 2)}
                            </pre>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <PricingRuleDialog
          open={pricingDialogOpen}
          onOpenChange={setPricingDialogOpen}
          onSave={handleSavePricingRule}
          editingRule={editingRule}
        />

        <FAQDialog
          open={faqDialogOpen}
          onOpenChange={setFaqDialogOpen}
          onSave={handleSaveFAQ}
          editingFAQ={editingFAQ}
        />

        <UserDialog
          open={userDialogOpen}
          onOpenChange={setUserDialogOpen}
          onSave={handleSaveUser}
          editingUser={editingUser}
        />

        <StaffDialog
          open={staffDialogOpen}
          onOpenChange={setStaffDialogOpen}
          staff={editingStaff}
          onSave={handleSaveStaff}
        />

        {/* Order Details Dialog */}
        <Dialog open={orderDetailOpen} onOpenChange={setOrderDetailOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Order Details - #{selectedOrderDetail?.orderNumber}</DialogTitle>
              <DialogDescription>
                Placed on {selectedOrderDetail?.date}
              </DialogDescription>
            </DialogHeader>
            
            {selectedOrderDetail && (
              <div className="space-y-6 py-4">
                {/* Status and Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl">
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <Badge className={`mt-1 ${getStatusColor(selectedOrderDetail.status)}`}>
                      {selectedOrderDetail.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Payment Method</p>
                    <p className="text-sm font-medium mt-1">{selectedOrderDetail.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Amount</p>
                    <p className="text-sm font-semibold mt-1">₹{selectedOrderDetail.total}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Tracking Number</p>
                    <p className="text-sm font-mono mt-1">{selectedOrderDetail.trackingNumber || "None"}</p>
                  </div>
                </div>

                {/* Shipping & Customer Details */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Customer Info</h3>
                    <div className="space-y-1 text-sm bg-gray-50 p-3 rounded-lg">
                      <p><span className="text-gray-500">Name:</span> {selectedOrderDetail.deliveryAddress?.fullName}</p>
                      <p><span className="text-gray-500">Email:</span> {selectedOrderDetail.deliveryAddress?.email}</p>
                      <p><span className="text-gray-500">Phone:</span> {selectedOrderDetail.deliveryAddress?.phone}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Shipping Address</h3>
                    <div className="space-y-1 text-sm bg-gray-50 p-3 rounded-lg">
                      <p>{selectedOrderDetail.deliveryAddress?.fullName}</p>
                      <p>{selectedOrderDetail.deliveryAddress?.address}</p>
                      <p>{selectedOrderDetail.deliveryAddress?.city}, {selectedOrderDetail.deliveryAddress?.state} - {selectedOrderDetail.deliveryAddress?.pincode}</p>
                      {selectedOrderDetail.deliveryAddress?.landmark && (
                        <p><span className="text-gray-500">Landmark:</span> {selectedOrderDetail.deliveryAddress?.landmark}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Items & Files */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Items Ordered ({selectedOrderDetail.items?.length})</h3>
                  <div className="space-y-3">
                    {selectedOrderDetail.items?.map((item: any, idx: number) => (
                      <div key={item.id || idx} className="p-4 border rounded-xl bg-white space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">{item.productName}</p>
                            <p className="text-xs text-gray-500">Category: {item.categorySlug} / {item.subcategorySlug}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold">₹{item.price}</p>
                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                          </div>
                        </div>

                        {/* Configuration */}
                        {item.configuration && Object.keys(item.configuration).length > 0 && (
                          <div className="text-xs bg-slate-50 p-2 rounded-lg">
                            <p className="font-semibold text-gray-600 mb-1">Configuration:</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {Object.entries(item.configuration).map(([key, val]: [string, any]) => (
                                <p key={key}><span className="text-gray-500">{key}:</span> {String(val)}</p>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Files */}
                        {item.files && item.files.length > 0 && (
                          <div className="space-y-2 mt-2 pt-2 border-t border-dashed">
                            <p className="text-xs font-semibold text-gray-700">Files:</p>
                            {item.files.map((file: any, fIdx: number) => (
                              <div key={fIdx} className="flex justify-between items-center bg-purple-50/50 p-2 rounded border border-purple-100 text-xs">
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-purple-600" />
                                  <div>
                                    <p className="font-medium text-gray-900">{file.name || file.fileName}</p>
                                    <p className="text-[10px] text-gray-500">
                                      Pages to print: {file.pagesToPrint || "All"} (Total: {file.pageCount || "N/A"})
                                    </p>
                                    {file.instruction && (
                                      <p className="text-[10px] text-purple-700 italic">Instruction: {file.instruction}</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button onClick={() => setOrderDetailOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
