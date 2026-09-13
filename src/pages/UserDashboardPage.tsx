import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContextSupabase";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Switch } from "../components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../components/ui/alert-dialog";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  Edit2,
  LogOut,
  ShoppingBag,
  IndianRupee,
  Calendar,
  Eye,
  Download,
  RefreshCw,
  Trash2,
  Plus,
  Search,
  Filter,
  Bell,
  Lock,
  Shield,
  Camera,
  Settings,
  Heart,
  CreditCard,
  FileText,
  Star
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { API_BASE } from "../lib/apiBase";
import { projectId, publicAnonKey } from "../utils/supabase/info";

export function UserDashboardPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, orders, logout, updateProfile, isAuthenticated } = useAuth();
  
  // Get tab from URL parameter, default to "profile"
  const tabFromUrl = searchParams.get("tab") || "profile";
  const [activeTab, setActiveTab] = useState(tabFromUrl);
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressIndex, setEditingAddressIndex] = useState<number | null>(null);
  const [orderFilter, setOrderFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [trackingOrder, setTrackingOrder] = useState<string | null>(null);
  
  // Update active tab when URL parameter changes
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);
  
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [newAddress, setNewAddress] = useState({
    label: "Home",
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
    isDefault: false,
  });

  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    orderUpdates: true,
    promotionalEmails: false,
    twoFactorAuth: false,
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate("/login");
    }
  }, [isAuthenticated, user, navigate]);

  // Early return if not authenticated
  if (!isAuthenticated || !user) {
    return null;
  }

  // Get unique addresses from orders
  const savedAddresses = Array.from(
    new Set(orders.map((o) => JSON.stringify(o.deliveryAddress)))
  ).map((addressStr, index) => ({
    ...JSON.parse(addressStr),
    id: `addr_${index}`,
    label: index === 0 ? "Home" : "Address " + (index + 1),
    isDefault: index === 0,
  }));

  // Filter and search orders
  const filteredOrders = orders.filter((order) => {
    const matchesFilter = orderFilter === "all" || order.status === orderFilter;
    const matchesSearch =
      searchQuery === "" ||
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((item) =>
        item.productName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesFilter && matchesSearch;
  });

  const handleProfileUpdate = () => {
    if (!profileData.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!profileData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      toast.error("Valid email is required");
      return;
    }
    if (profileData.phone && !/^[0-9]{10}$/.test(profileData.phone)) {
      toast.error("Phone must be 10 digits");
      return;
    }

    updateProfile(profileData);
    setIsEditingProfile(false);
    toast.success("Profile updated successfully!");
  };

  const handlePasswordChange = () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error("All password fields are required");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    // Simulate password change
    toast.success("Password changed successfully!");
    setIsChangingPassword(false);
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleAddAddress = () => {
    if (!newAddress.fullName || !newAddress.phone || !newAddress.address || !newAddress.city || !newAddress.state || !newAddress.pincode) {
      toast.error("Please fill all required fields");
      return;
    }
    if (!/^[0-9]{10}$/.test(newAddress.phone)) {
      toast.error("Phone must be 10 digits");
      return;
    }
    if (!/^[0-9]{6}$/.test(newAddress.pincode)) {
      toast.error("Pincode must be 6 digits");
      return;
    }

    toast.success("Address saved successfully!");
    setIsAddingAddress(false);
    setNewAddress({
      label: "Home",
      fullName: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      landmark: "",
      isDefault: false,
    });
  };

  const handleDeleteAddress = (index: number) => {
    toast.success("Address deleted successfully!");
  };

  const handleReorder = (order: any) => {
    toast.success("Items added to cart!");
    navigate("/cart");
  };

  const handleDownloadInvoice = (orderNumber: string) => {
    toast.success(`Downloading invoice for order ${orderNumber}`);
  };

  const handleCancelOrder = (orderNumber: string) => {
    toast.success(`Order ${orderNumber} has been cancelled`);
  };

  const openFirstUrlFromObject = (obj: any): string | null => {
    if (!obj || typeof obj !== "object") return null;
    const keys = ["tracking_url", "url", "shipment_track_activities"]; 
    for (const key of keys) {
      const val = obj[key];
      if (typeof val === "string" && /^https?:\/\//i.test(val)) return val;
      if (typeof val === "object") {
        const nested = openFirstUrlFromObject(val);
        if (nested) return nested;
      }
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

  const handleTrackOrder = async (order: any) => {
    if (!order.trackingNumber) {
      toast.error("Tracking number is not available yet");
      return;
    }

    try {
      setTrackingOrder(order.orderNumber);
      const response = await fetch(
        `${API_BASE}/api/payments/shiprocket/track/${encodeURIComponent(order.trackingNumber)}/`,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await response.json();
      if (!response.ok || !data?.success) {
        throw new Error(data?.error || "Could not fetch live tracking");
      }

      const url = openFirstUrlFromObject(data);
      if (url) {
        window.open(url, "_blank");
      } else {
        toast.success("Tracking refreshed successfully");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to fetch tracking details");
    } finally {
      setTrackingOrder(null);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const handleDeleteAccount = () => {
    toast.success("Account deletion request submitted. You'll receive a confirmation email.");
    setTimeout(() => {
      logout();
      navigate("/");
    }, 2000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "processing":
        return <Package className="w-4 h-4" />;
      case "shipped":
        return <Truck className="w-4 h-4" />;
      case "delivered":
        return <CheckCircle2 className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "shipped":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);
  const deliveredCount = orders.filter((o) => o.status === "delivered").length;
  const shippedCount = orders.filter((o) => o.status === "shipped").length;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600">
                  <AvatarFallback className="text-white text-2xl">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <button className="absolute bottom-0 right-0 w-7 h-7 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-gray-100 hover:bg-gray-50 transition-colors">
                  <Camera className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <div>
                <h1 className="text-3xl text-gray-900">Welcome back, {user.name}!</h1>
                <p className="text-gray-600">Member since {formatDate(user.joinedDate)}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate("/all-products")}>
                <ShoppingBag className="w-4 h-4 mr-2" />
                Continue Shopping
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          {/* Dashboard Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="text-2xl text-gray-900">{orders.length}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Delivered</p>
                  <p className="text-2xl text-gray-900">{deliveredCount}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <Truck className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">In Transit</p>
                  <p className="text-2xl text-gray-900">{shippedCount}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <IndianRupee className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Spent</p>
                  <p className="text-2xl text-gray-900">₹{totalSpent}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 lg:w-auto">
            <TabsTrigger value="profile" className="gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <Package className="w-4 h-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="addresses" className="gap-2">
              <MapPin className="w-4 h-4" />
              Addresses
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="w-4 h-4" />
              Security
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl text-gray-900">Profile Information</h2>
                    {!isEditingProfile && (
                      <Button variant="outline" onClick={() => setIsEditingProfile(true)}>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    )}
                  </div>

                  {isEditingProfile ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="name"
                            className="pl-10"
                            value={profileData.name}
                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="email"
                            type="email"
                            className="pl-10"
                            value={profileData.email}
                            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="phone"
                            type="tel"
                            maxLength={10}
                            className="pl-10"
                            value={profileData.phone}
                            onChange={(e) =>
                              setProfileData({ ...profileData, phone: e.target.value.replace(/\D/g, "") })
                            }
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button onClick={handleProfileUpdate} className="bg-blue-600 hover:bg-blue-700">
                          Save Changes
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsEditingProfile(false);
                            setProfileData({
                              name: user.name,
                              email: user.email,
                              phone: user.phone,
                            });
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                        <User className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="text-sm text-gray-600">Full Name</p>
                          <p className="text-gray-900">{user.name}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                        <Mail className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="text-sm text-gray-600">Email Address</p>
                          <p className="text-gray-900">{user.email}</p>
                        </div>
                      </div>

                      {user.phone && (
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                          <Phone className="w-5 h-5 text-gray-600" />
                          <div>
                            <p className="text-sm text-gray-600">Phone Number</p>
                            <p className="text-gray-900">{user.phone}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                        <Calendar className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="text-sm text-gray-600">Member Since</p>
                          <p className="text-gray-900">{formatDate(user.joinedDate)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="space-y-4">
                <Card className="p-6">
                  <h3 className="text-lg text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/all-products")}>
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Browse Products
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/cart")}>
                      <Package className="w-4 h-4 mr-2" />
                      View Cart
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/contact")}>
                      <Mail className="w-4 h-4 mr-2" />
                      Contact Support
                    </Button>
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                      <Star className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg text-gray-900 mb-1">Loyalty Points</h3>
                      <p className="text-sm text-gray-600">Earn points on every purchase</p>
                    </div>
                  </div>
                  <p className="text-3xl text-blue-600 mb-2">0 Points</p>
                  <p className="text-xs text-gray-600">Start shopping to earn rewards!</p>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <h2 className="text-2xl text-gray-900">Order History</h2>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1 sm:flex-initial">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search orders..."
                      className="pl-10 w-full sm:w-64"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={orderFilter} onValueChange={setOrderFilter}>
                    <SelectTrigger className="w-full sm:w-40">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Orders</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl text-gray-900 mb-2">
                    {searchQuery || orderFilter !== "all" ? "No matching orders found" : "No Orders Yet"}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchQuery || orderFilter !== "all"
                      ? "Try adjusting your filters or search query"
                      : "Start shopping and your orders will appear here"}
                  </p>
                  <Button onClick={() => navigate("/all-products")} className="bg-blue-600 hover:bg-blue-700">
                    Browse Products
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <Card key={order.id} className="p-6 border-2 hover:border-blue-200 transition-colors">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg text-gray-900">Order #{order.orderNumber}</h3>
                            <Badge className={`${getStatusColor(order.status)} border`}>
                              <span className="flex items-center gap-1">
                                {getStatusIcon(order.status)}
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">Placed on {formatDate(order.date)}</p>
                        </div>
                        <div className="text-left md:text-right">
                          <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                          <p className="text-2xl text-gray-900 flex items-center md:justify-end">
                            <IndianRupee className="w-5 h-5" />
                            {order.total}
                          </p>
                        </div>
                      </div>

                      <Separator className="my-4" />

                      {/* Order Items */}
                      <div className="space-y-2 mb-4">
                        <p className="text-sm text-gray-700">Items ({order.items.length}):</p>
                        {order.items.slice(0, 3).map((item) => (
                          <div key={item.id} className="flex items-center gap-3 text-sm">
                            <ShoppingBag className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-900">{item.productName}</span>
                            <span className="text-gray-600">x{item.quantity}</span>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <p className="text-sm text-gray-500 ml-7">+{order.items.length - 3} more items</p>
                        )}
                      </div>

                      {/* Delivery Address */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <p className="text-sm text-gray-700 mb-2 flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Delivery Address
                        </p>
                        <p className="text-sm text-gray-900">{order.deliveryAddress.fullName}</p>
                        <p className="text-sm text-gray-600">
                          {order.deliveryAddress.address}, {order.deliveryAddress.city}
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">Phone: {order.deliveryAddress.phone}</p>
                      </div>

                      {/* Order Actions */}
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => toast.info("Order details view coming soon")}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDownloadInvoice(order.orderNumber)}>
                          <Download className="w-4 h-4 mr-2" />
                          Invoice
                        </Button>
                        {order.status === "delivered" && (
                          <>
                            <Button variant="outline" size="sm" onClick={() => handleReorder(order)}>
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Reorder
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => toast.info("Review feature coming soon")}>
                              <Star className="w-4 h-4 mr-2" />
                              Review
                            </Button>
                          </>
                        )}
                        {(order.status === "pending" || order.status === "processing") && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                <XCircle className="w-4 h-4 mr-2" />
                                Cancel
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Cancel Order?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to cancel order #{order.orderNumber}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Keep Order</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleCancelOrder(order.orderNumber)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Cancel Order
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                        {order.status === "shipped" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-purple-50 border-purple-200"
                            onClick={() => handleTrackOrder(order)}
                            disabled={trackingOrder === order.orderNumber}
                          >
                            <Truck className="w-4 h-4 mr-2" />
                            {trackingOrder === order.orderNumber ? "Tracking..." : "Track Order"}
                          </Button>
                        )}
                      </div>

                      {order.trackingNumber && (
                        <div className="mt-3 text-xs text-gray-600">
                          Tracking Number: <span className="text-gray-900">{order.trackingNumber}</span>
                        </div>
                      )}

                      {order.estimatedDelivery && order.status !== "delivered" && order.status !== "cancelled" && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-900">📦 Estimated delivery: {order.estimatedDelivery}</p>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Addresses Tab */}
          <TabsContent value="addresses">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl text-gray-900">Saved Addresses</h2>
                <Dialog open={isAddingAddress} onOpenChange={setIsAddingAddress}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Address
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add New Address</DialogTitle>
                      <DialogDescription>Enter your delivery address details</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Address Label *</Label>
                          <Select value={newAddress.label} onValueChange={(value) => setNewAddress({ ...newAddress, label: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Home">Home</SelectItem>
                              <SelectItem value="Office">Office</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="addrName">Full Name *</Label>
                          <Input
                            id="addrName"
                            value={newAddress.fullName}
                            onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="addrPhone">Phone Number *</Label>
                        <Input
                          id="addrPhone"
                          type="tel"
                          maxLength={10}
                          value={newAddress.phone}
                          onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value.replace(/\D/g, "") })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="addrAddress">Address *</Label>
                        <Input
                          id="addrAddress"
                          value={newAddress.address}
                          onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="addrLandmark">Landmark</Label>
                        <Input
                          id="addrLandmark"
                          value={newAddress.landmark}
                          onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="addrCity">City *</Label>
                          <Input
                            id="addrCity"
                            value={newAddress.city}
                            onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="addrState">State *</Label>
                          <Input
                            id="addrState"
                            value={newAddress.state}
                            onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="addrPincode">Pincode *</Label>
                          <Input
                            id="addrPincode"
                            maxLength={6}
                            value={newAddress.pincode}
                            onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value.replace(/\D/g, "") })}
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="defaultAddr"
                          checked={newAddress.isDefault}
                          onCheckedChange={(checked) => setNewAddress({ ...newAddress, isDefault: checked })}
                        />
                        <Label htmlFor="defaultAddr" className="cursor-pointer">Set as default address</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddingAddress(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddAddress} className="bg-blue-600 hover:bg-blue-700">
                        Save Address
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {savedAddresses.length === 0 ? (
                <div className="text-center py-12">
                  <MapPin className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl text-gray-900 mb-2">No Saved Addresses</h3>
                  <p className="text-gray-600 mb-6">Add your delivery addresses for faster checkout</p>
                  <Button onClick={() => setIsAddingAddress(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Address
                  </Button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {savedAddresses.map((address, index) => (
                    <Card key={address.id} className="p-4 border-2 hover:border-blue-200 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-blue-600" />
                          <div>
                            <span className="text-gray-900">{address.label || "Address"}</span>
                            {address.isDefault && (
                              <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                                Default
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-900 mb-1">{address.fullName}</p>
                      <p className="text-sm text-gray-600 mb-1">{address.address}</p>
                      {address.landmark && <p className="text-sm text-gray-600 mb-1">Landmark: {address.landmark}</p>}
                      <p className="text-sm text-gray-600 mb-1">
                        {address.city}, {address.state} - {address.pincode}
                      </p>
                      <p className="text-sm text-gray-600 mb-3">Phone: {address.phone}</p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="text-xs" onClick={() => toast.info("Edit functionality coming soon")}>
                          <Edit2 className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        {!address.isDefault && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-xs text-red-600">
                                <Trash2 className="w-3 h-3 mr-1" />
                                Remove
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Address?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this address? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteAddress(index)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card className="p-6">
              <h2 className="text-2xl text-gray-900 mb-6">Notification Preferences</h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-gray-900">Email Notifications</p>
                      <p className="text-sm text-gray-600">Receive updates via email</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => {
                      setSettings({ ...settings, emailNotifications: checked });
                      toast.success("Settings updated");
                    }}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-gray-900">SMS Notifications</p>
                      <p className="text-sm text-gray-600">Receive order updates via SMS</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.smsNotifications}
                    onCheckedChange={(checked) => {
                      setSettings({ ...settings, smsNotifications: checked });
                      toast.success("Settings updated");
                    }}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-gray-900">Order Updates</p>
                      <p className="text-sm text-gray-600">Get notified about order status changes</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.orderUpdates}
                    onCheckedChange={(checked) => {
                      setSettings({ ...settings, orderUpdates: checked });
                      toast.success("Settings updated");
                    }}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-gray-900">Promotional Emails</p>
                      <p className="text-sm text-gray-600">Receive offers and promotional content</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.promotionalEmails}
                    onCheckedChange={(checked) => {
                      setSettings({ ...settings, promotionalEmails: checked });
                      toast.success("Settings updated");
                    }}
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h2 className="text-2xl text-gray-900 mb-6">Change Password</h2>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="currentPassword"
                        type="password"
                        className="pl-10"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="newPassword"
                        type="password"
                        className="pl-10"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      />
                    </div>
                    <p className="text-xs text-gray-500">Password must be at least 6 characters</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        className="pl-10"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      />
                    </div>
                  </div>

                  <Button onClick={handlePasswordChange} className="w-full bg-blue-600 hover:bg-blue-700">
                    Update Password
                  </Button>
                </div>
              </Card>

              <div className="space-y-6">
                <Card className="p-6">
                  <h2 className="text-2xl text-gray-900 mb-6">Security Settings</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="text-gray-900">Two-Factor Authentication</p>
                          <p className="text-sm text-gray-600">Add extra security to your account</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.twoFactorAuth}
                        onCheckedChange={(checked) => {
                          setSettings({ ...settings, twoFactorAuth: checked });
                          toast.success(checked ? "2FA enabled" : "2FA disabled");
                        }}
                      />
                    </div>
                  </div>
                </Card>

                <Card className="p-6 border-red-200 bg-red-50">
                  <h3 className="text-lg text-red-900 mb-4 flex items-center gap-2">
                    <XCircle className="w-5 h-5" />
                    Danger Zone
                  </h3>
                  <p className="text-sm text-red-700 mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Yes, delete my account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
