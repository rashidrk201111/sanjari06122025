import { ArrowRight, Clock, Headphones, Package, TrendingDown } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner@2.0.3";
import { useAuth } from "../context/AuthContextSupabase";

export function BulkOrder() {
  const navigate = useNavigate();
  const { addOrder, isAuthenticated, user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    productType: "",
    quantity: "",
    details: "",
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        contactName: prev.contactName || user.name || "",
        email: prev.email || user.email || "",
        phone: prev.phone || user.phone || "",
      }));
    }
  }, [user]);

  const pricingTiers = [
    {
      name: "Starter Bulk",
      minUnits: "500+",
      discount: 10,
      summary: "Perfect for pilot campaigns and short-run print batches.",
      featured: false,
    },
    {
      name: "Growth Bulk",
      minUnits: "1,000+",
      discount: 20,
      summary: "Great for recurring monthly print requirements.",
      featured: false,
    },
    {
      name: "Business Bulk",
      minUnits: "5,000+",
      discount: 30,
      summary: "Designed for high-volume teams with aggressive cost targets.",
      featured: true,
    },
    {
      name: "Enterprise Bulk",
      minUnits: "10,000+",
      discount: 40,
      summary: "Maximum savings, priority SLAs, and dedicated account support.",
      featured: false,
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Please sign in to submit a bulk quote request");
      navigate("/login", { state: { from: "/bulk-order" } });
      return;
    }

    if (!formData.contactName.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.productType.trim() || !formData.quantity.trim()) {
      toast.error("Please fill all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const orderNumber = `BULK${Date.now().toString().slice(-8)}`;

      const result = await addOrder({
        id: `bulk_${Date.now()}`,
        orderNumber,
        date: new Date().toISOString(),
        status: "pending",
        items: [
          {
            type: "bulk_quote_request",
            companyName: formData.companyName,
            productType: formData.productType,
            quantity: Number(formData.quantity),
            details: formData.details,
          },
        ],
        subtotal: 0,
        gst: 0,
        shipping: 0,
        total: 0,
        deliveryAddress: {
          fullName: formData.contactName,
          email: formData.email,
          phone: formData.phone,
          address: "",
          city: "",
          state: "",
          pincode: "000000",
          landmark: formData.companyName,
        },
        paymentMethod: "Bulk Quote",
        estimatedDelivery: "To be confirmed",
      });

      if (!result.success) {
        toast.error(result.error || "Failed to submit quote request");
        return;
      }

      toast.success(`Bulk quote request submitted! Ref: ${orderNumber}`);
      setFormData({
        companyName: "",
        contactName: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        productType: "",
        quantity: "",
        details: "",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="relative overflow-hidden py-20 bg-slate-50">
      <div className="absolute -top-20 -right-16 h-72 w-72 rounded-full bg-blue-100/70 blur-3xl" />
      <div className="absolute -bottom-16 -left-16 h-72 w-72 rounded-full bg-cyan-100/60 blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-flex items-center rounded-full border border-blue-200 bg-white px-4 py-1.5 text-sm font-medium text-blue-700 mb-5">
            Enterprise Bulk Printing Programs
          </span>
          <h2 className="text-3xl lg:text-5xl mb-4 text-slate-900 font-semibold tracking-tight">Bulk Order Solutions</h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            Unlock volume-based pricing, faster production windows, and dedicated support for large-scale print orders.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-12">
          <div>
            <h3 className="text-2xl mb-6 text-slate-900">Why Order in Bulk?</h3>
            <div className="space-y-6">
              <div className="flex gap-4 rounded-xl bg-white p-4 border border-slate-200">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingDown className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div>
                  <h4 className="text-lg mb-1.5 text-slate-900">Significant Cost Savings</h4>
                  <p className="text-slate-600 leading-relaxed">
                    Reduce your per-unit cost with slab-based discounts up to 40%.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 rounded-xl bg-white p-4 border border-slate-200">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h4 className="text-lg mb-1.5 text-slate-900">Priority Processing</h4>
                  <p className="text-slate-600 leading-relaxed">
                    Large orders are queued with priority to ensure faster turnaround.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 rounded-xl bg-white p-4 border border-slate-200">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Headphones className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div>
                  <h4 className="text-lg mb-1.5 text-slate-900">Dedicated Account Manager</h4>
                  <p className="text-slate-600 leading-relaxed">
                    Work with a single point of contact from quote to delivery.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 rounded-xl bg-white p-4 border border-slate-200">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <div>
                  <h4 className="text-lg mb-1.5 text-slate-900">Flexible Payment Terms</h4>
                  <p className="text-slate-600 leading-relaxed">
                    Approved bulk clients can access flexible payment and credit options.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <Card className="p-8 border border-slate-200/90 shadow-lg bg-white">
              <h3 className="text-2xl mb-1 text-slate-900">Request Bulk Order Quote</h3>
              <p className="text-sm text-slate-600 mb-6">Share your requirements to receive a tailored INR quote from our bulk-print team.</p>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input
                      id="company-name"
                      placeholder="Your company name"
                      value={formData.companyName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, companyName: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-name">Contact Name</Label>
                    <Input
                      id="contact-name"
                      placeholder="Your name"
                      value={formData.contactName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, contactName: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="product-type">Product Type</Label>
                    <Input
                      id="product-type"
                      placeholder="e.g., Business cards, brochures, catalogs"
                      value={formData.productType}
                      onChange={(e) => setFormData((prev) => ({ ...prev, productType: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="quantity">Estimated Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      placeholder="e.g., 10000 units"
                      value={formData.quantity}
                      onChange={(e) => setFormData((prev) => ({ ...prev, quantity: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="details">Project Details</Label>
                  <Textarea
                    id="details"
                    placeholder="Share size, paper, color mode, finishing, delivery timeline, and any special instructions..."
                    rows={4}
                    value={formData.details}
                    onChange={(e) => setFormData((prev) => ({ ...prev, details: e.target.value }))}
                  />
                </div>

                <Button className="w-full" size="lg" type="submit" disabled={submitting}>
                  {submitting ? "Submitting..." : "Get My Bulk Quote"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            </Card>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
          <h3 className="text-2xl text-center mb-2 text-slate-900">Bulk Order Pricing Tiers</h3>
          <p className="text-center text-slate-600 mb-8">Simple volume discounts with final INR quotation shared after artwork and specification review.</p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingTiers.map((tier) => (
              <Card
                key={tier.name}
                className={`p-6 text-center bg-white border transition-all ${tier.featured ? "border-blue-500 shadow-lg" : "border-slate-200"}`}
              >
                <div className="mb-3 min-h-[24px]">
                  {tier.featured ? (
                    <span className="inline-flex rounded-full bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1">
                      Best Value
                    </span>
                  ) : null}
                </div>
                <div className="text-sm font-semibold text-slate-700 mb-2">{tier.name}</div>
                <div className="text-3xl font-semibold mb-1 text-slate-900">{tier.minUnits}</div>
                <div className="text-xs text-gray-600 mb-4">Minimum Units</div>
                <div className="text-3xl font-semibold text-blue-600">{tier.discount}%</div>
                <div className="text-sm text-gray-600 mb-3">Savings</div>
                <div className="text-xs text-emerald-700 font-medium mb-3">You Pay Only {100 - tier.discount}%</div>
                <p className="text-xs text-slate-500 leading-relaxed">{tier.summary}</p>
              </Card>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-blue-200/80 bg-white/80 px-5 py-4 text-sm text-slate-600">
            Final pricing depends on paper selection, color mode, finishing options, packaging, and delivery timeline.
          </div>
        </div>
      </div>
    </section>
  );
}
