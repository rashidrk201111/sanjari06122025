import { FormEvent, useMemo, useState } from "react";
import { AlertCircle, Clock, ExternalLink, Loader2, MapPin, PackageCheck, Search, Truck } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { PageHeader } from "../components/PageHeader";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { API_BASE } from "../lib/apiBase";

type TrackingActivity = {
  date?: string;
  status?: string;
  location?: string;
  remarks?: string;
};

type TrackingResult = {
  success: boolean;
  identifier?: string;
  orderNumber?: string;
  awb?: string;
  currentStatus?: string;
  courierName?: string;
  estimatedDelivery?: string;
  trackUrl?: string;
  activities?: TrackingActivity[];
  message?: string;
  awbPending?: boolean;
};

function formatTrackingDate(value?: string) {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TrackOrderPage() {
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [error, setError] = useState("");

  const activities = useMemo(() => result?.activities || [], [result]);
  const statusLabel = result?.awbPending ? "AWB pending" : result?.currentStatus || "Tracking available";

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const query = identifier.trim();
    if (!query) {
      setError("Enter your order number or AWB tracking number.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const response = await fetch(
        `${API_BASE}/api/payments/shiprocket/track-order/?id=${encodeURIComponent(query)}`,
        { headers: { "Content-Type": "application/json" } }
      );
      const data = await response.json();
      if (!response.ok || !data?.success) {
        throw new Error(data?.error || "Tracking details are not available yet.");
      }

      setResult(data);
    } catch (err: any) {
      const message = err?.message || "Could not fetch tracking details.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <PageHeader
        title="Track Order"
        subtitle="Check live delivery updates using your Sanjari order number or Shiprocket AWB."
        breadcrumbs={[{ label: "Track Order" }]}
        icon={<Truck className="w-5 h-5 text-orange-600" />}
      />

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <Card className="rounded-lg border-gray-200 bg-white shadow-sm hover:shadow-sm">
              <CardContent className="p-5 sm:p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="tracking-id" className="block text-sm font-semibold text-gray-900 mb-2">
                      Order number or AWB
                    </label>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Input
                        id="tracking-id"
                        value={identifier}
                        onChange={(event) => setIdentifier(event.target.value)}
                        placeholder="Example: SP12345 or 190XXXXXXXX"
                        className="h-11 rounded-lg bg-white"
                      />
                      <Button
                        type="submit"
                        disabled={loading}
                        className="h-11 rounded-lg bg-purple-600 px-5 hover:bg-purple-700"
                      >
                        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                        Track
                      </Button>
                    </div>
                    {error && (
                      <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            {loading && (
              <Card className="overflow-hidden rounded-lg border-purple-100 bg-white shadow-sm hover:shadow-sm">
                <CardContent className="p-5 sm:p-6">
                  <div className="relative">
                    <div className="mb-5 flex items-center gap-3">
                      <div className="relative flex h-11 w-11 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
                        <Truck className="h-5 w-5 animate-pulse" />
                        <span className="absolute inset-0 rounded-lg border border-purple-300 animate-ping" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-950">Checking live tracking</p>
                        <p className="text-sm text-gray-500">Looking up your order with Sanjari and Shiprocket.</p>
                      </div>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <div className="h-full w-1/2 animate-pulse rounded-full bg-purple-600" />
                    </div>
                    <div className="mt-5 space-y-3">
                      {[0, 1, 2].map((item) => (
                        <div key={item} className="flex items-center gap-3">
                          <span className="h-3 w-3 rounded-full bg-purple-100" />
                          <span className="h-3 flex-1 animate-pulse rounded bg-gray-100" />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {result && (
              <Card className="rounded-lg border-gray-200 bg-white shadow-sm hover:shadow-sm">
                <CardContent className="p-5 sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${result.awbPending ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
                        {result.awbPending ? <Clock className="w-4 h-4" /> : <PackageCheck className="w-4 h-4" />}
                        {statusLabel}
                      </div>
                      <h2 className="mt-4 text-xl font-bold text-gray-950">Shipment details</h2>
                      <div className="mt-3 grid gap-2 text-sm text-gray-700 sm:grid-cols-2">
                        {result.orderNumber && <p><span className="font-semibold text-gray-950">Order:</span> {result.orderNumber}</p>}
                        {result.awb && <p><span className="font-semibold text-gray-950">AWB:</span> {result.awb}</p>}
                        {result.courierName && <p><span className="font-semibold text-gray-950">Courier:</span> {result.courierName}</p>}
                        {result.estimatedDelivery && <p><span className="font-semibold text-gray-950">ETA:</span> {result.estimatedDelivery}</p>}
                      </div>
                    </div>

                    {result.trackUrl && (
                      <a
                        href={result.trackUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-purple-200 px-4 text-sm font-semibold text-purple-700 transition-colors hover:bg-purple-50"
                      >
                        Open Shiprocket
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  <div className="mt-6 border-t border-gray-100 pt-5">
                    <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">Tracking timeline</h3>
                    {activities.length > 0 ? (
                      <div className="mt-4 space-y-4">
                        {activities.map((item, index) => (
                          <div key={`${item.date}-${index}`} className="relative pl-7">
                            <span className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-purple-600 ring-4 ring-purple-100" />
                            {index !== activities.length - 1 && <span className="absolute left-1.5 top-5 h-full w-px bg-gray-200" />}
                            <p className="font-semibold text-gray-950">{item.status || "Shipment update"}</p>
                            {(item.location || item.remarks) && (
                              <p className="mt-1 flex flex-wrap items-center gap-1 text-sm text-gray-600">
                                {item.location && <><MapPin className="w-3.5 h-3.5" />{item.location}</>}
                                {item.remarks && <span>{item.remarks}</span>}
                              </p>
                            )}
                            {item.date && <p className="mt-1 text-xs font-medium text-gray-500">{formatTrackingDate(item.date)}</p>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-4 rounded-lg border border-amber-100 bg-amber-50 p-4">
                        <div className="flex items-start gap-3">
                          <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                          <div>
                            <p className="font-semibold text-amber-900">
                              {result.awbPending ? "AWB assignment is pending" : "Timeline is not available yet"}
                            </p>
                            <p className="mt-1 text-sm leading-6 text-amber-800">
                              {result.message || "The order exists, but courier movement events have not been shared yet."}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <aside className="space-y-4">
            <Card className="rounded-lg border-gray-200 bg-white shadow-sm hover:shadow-sm">
              <CardContent className="p-5">
                <h2 className="text-base font-bold text-gray-950">Where to find the ID</h2>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Use the Sanjari order number from your confirmation message, or the AWB tracking number shared after dispatch.
                </p>
              </CardContent>
            </Card>
            <Card className="rounded-lg border-gray-200 bg-white shadow-sm hover:shadow-sm">
              <CardContent className="p-5">
                <h2 className="text-base font-bold text-gray-950">Need help?</h2>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Call 9323684301 with your order number if tracking is not visible after dispatch.
                </p>
              </CardContent>
            </Card>
          </aside>
        </div>
      </section>
    </div>
  );
}
