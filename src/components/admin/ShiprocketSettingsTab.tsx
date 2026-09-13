import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Save, Truck } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { API_BASE } from "../../lib/apiBase";
import { adminJsonHeaders } from "../../lib/adminAuthHeaders";
import { projectId, publicAnonKey } from "../../utils/supabase/info";
import { ShiprocketSettings } from "../../context/AdminContext";

interface ShiprocketSettingsTabProps {
  shiprocketSettings: ShiprocketSettings;
  updateShiprocketSettings: (settings: Partial<ShiprocketSettings>) => Promise<void>;
  canEdit?: boolean;
}

export function ShiprocketSettingsTab({ shiprocketSettings, updateShiprocketSettings, canEdit = true }: ShiprocketSettingsTabProps) {
  const [edited, setEdited] = useState(shiprocketSettings);
  const [showPassword, setShowPassword] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [simulatingWebhook, setSimulatingWebhook] = useState(false);
  const [simulator, setSimulator] = useState({
    orderNumber: "",
    status: "SHIPPED",
    awb: "TESTAWB123456",
    trackingUrl: "https://shiprocket.co/tracking",
  });
  const [syncState, setSyncState] = useState<"idle" | "checking" | "ok" | "mismatch" | "error">("idle");
  const [syncMessage, setSyncMessage] = useState("Not checked yet");

  useEffect(() => {
    setEdited(shiprocketSettings);
  }, [shiprocketSettings]);

  const verifySync = async (settingsToCompare: ShiprocketSettings = edited) => {
    setSyncState("checking");
    setSyncMessage("Checking Shiprocket sync...");
    try {
      const response = await fetch(
        `${API_BASE}/api/payments/shiprocket/settings/`,
        {
          headers: await adminJsonHeaders(),
        }
      );

      if (!response.ok) throw new Error("Failed to fetch shiprocket settings from edge function");

      const backend = await response.json();
      const match =
        backend?.enabled === settingsToCompare.enabled &&
        (backend?.email || "") === (settingsToCompare.email || "") &&
        (backend?.webhookSecret || "") === (settingsToCompare.webhookSecret || "") &&
        (backend?.pickupLocation || "") === (settingsToCompare.pickupLocation || "") &&
        (backend?.companyName || "") === (settingsToCompare.companyName || "") &&
        (backend?.phone || "") === (settingsToCompare.phone || "") &&
        (backend?.pincode || "") === (settingsToCompare.pincode || "");

      if (match) {
        setSyncState("ok");
        setSyncMessage("Edge function is using latest Shiprocket settings.");
      } else {
        setSyncState("mismatch");
        setSyncMessage("Edge function settings are out of sync with admin values.");
      }
    } catch (err) {
      console.error("Shiprocket sync check failed:", err);
      setSyncState("error");
      setSyncMessage("Could not verify Shiprocket sync.");
    }
  };

  const handleSave = async () => {
    if (!canEdit) {
      toast.error("Only admin can update Shiprocket settings");
      return;
    }
    await updateShiprocketSettings(edited);
    toast.success("Shiprocket settings updated successfully!");
    await verifySync(edited);
  };

  const loadLogs = async () => {
    setLoadingLogs(true);
    try {
      const response = await fetch(
        `${API_BASE}/api/payments/shiprocket/logs/`,
        {
          headers: await adminJsonHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch Shiprocket logs");
      }

      const data = await response.json();
      setLogs(Array.isArray(data?.logs) ? data.logs : []);
    } catch (error) {
      console.error("Error loading shiprocket logs:", error);
      toast.error("Could not load Shiprocket logs");
    } finally {
      setLoadingLogs(false);
    }
  };

  const runWebhookSimulator = async () => {
    if (!simulator.orderNumber.trim()) {
      toast.error("Order number is required to simulate webhook");
      return;
    }

    setSimulatingWebhook(true);
    try {
      const response = await fetch(
        `${API_BASE}/api/payments/shiprocket/webhook/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(simulator),
        }
      );

      const data = await response.json();
      if (!response.ok || !data?.success) {
        throw new Error(data?.error || "Webhook simulation failed");
      }

      toast.success(`Webhook simulated: ${data.normalizedStatus || simulator.status}`);
      await loadLogs();
    } catch (error: any) {
      console.error("Webhook simulator failed:", error);
      toast.error(error?.message || "Could not simulate webhook");
    } finally {
      setSimulatingWebhook(false);
    }
  };

  const getSyncBadge = () => {
    if (syncState === "checking") return <Badge variant="outline">Checking...</Badge>;
    if (syncState === "ok") return <Badge className="bg-green-100 text-green-800 border-green-300">Sync OK</Badge>;
    if (syncState === "mismatch") return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Out of Sync</Badge>;
    if (syncState === "error") return <Badge className="bg-red-100 text-red-800 border-red-300">Sync Error</Badge>;
    return <Badge variant="outline">Not Checked</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-gray-900">Shiprocket Integration</h2>
          <p className="text-sm text-gray-600 mt-1">Connect Shiprocket to generate shipments and tracking from admin orders.</p>
        </div>
        <div className="flex items-center gap-2">
          {getSyncBadge()}
          <Button type="button" variant="outline" onClick={loadLogs}>
            {loadingLogs ? "Loading Logs..." : "View Logs"}
          </Button>
          <Button type="button" variant="outline" onClick={() => verifySync()}>
            Check Sync
          </Button>
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700" disabled={!canEdit}>
            <Save className="w-4 h-4 mr-2" />
            Save Shiprocket Settings
          </Button>
        </div>
      </div>

      {!canEdit && (
        <Alert className="border-yellow-300 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            You can view Shiprocket settings, but only users with Admin role can edit them.
          </AlertDescription>
        </Alert>
      )}

      <Alert className={syncState === "ok" ? "border-green-300 bg-green-50" : ""}>
        {syncState === "ok" ? (
          <CheckCircle2 className="h-4 w-4 text-green-600" />
        ) : (
          <AlertCircle className="h-4 w-4" />
        )}
        <AlertDescription className={syncState === "ok" ? "text-green-800" : ""}>
          <strong>Shiprocket Sync Status:</strong> {syncMessage}
        </AlertDescription>
      </Alert>

      <Card className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Truck className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg text-gray-900">Enable Shiprocket</h3>
              <p className="text-sm text-gray-600">Turn on to allow shipment creation from admin orders.</p>
            </div>
          </div>
          <Switch
            checked={edited.enabled}
            onCheckedChange={(checked) => setEdited({ ...edited, enabled: checked })}
            disabled={!canEdit}
          />
        </div>

        {edited.enabled && (
          <>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="srEmail">Shiprocket Email</Label>
                <Input
                  id="srEmail"
                  className="mt-2"
                  value={edited.email}
                  onChange={(e) => setEdited({ ...edited, email: e.target.value })}
                  placeholder="your-email@domain.com"
                  disabled={!canEdit}
                />
              </div>
              <div>
                <Label htmlFor="srPassword">Shiprocket Password</Label>
                <div className="relative mt-2">
                  <Input
                    id="srPassword"
                    type={showPassword ? "text" : "password"}
                    className="pr-10"
                    value={edited.password}
                    onChange={(e) => setEdited({ ...edited, password: e.target.value })}
                    placeholder="••••••••••"
                    disabled={!canEdit}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="webhookSecret">Webhook Secret (Recommended)</Label>
              <Input
                id="webhookSecret"
                className="mt-2"
                value={edited.webhookSecret || ""}
                onChange={(e) => setEdited({ ...edited, webhookSecret: e.target.value })}
                placeholder="Set a shared secret for webhook signature/header verification"
                disabled={!canEdit}
              />
              <p className="text-xs text-gray-500 mt-2">
                If set, webhook requests must include a matching secret header or HMAC signature.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pickupLocation">Pickup Location Name</Label>
                <Input
                  id="pickupLocation"
                  className="mt-2"
                  value={edited.pickupLocation}
                  onChange={(e) => setEdited({ ...edited, pickupLocation: e.target.value })}
                  placeholder="Primary"
                  disabled={!canEdit}
                />
              </div>
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  className="mt-2"
                  value={edited.companyName}
                  onChange={(e) => setEdited({ ...edited, companyName: e.target.value })}
                  disabled={!canEdit}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Pickup Phone</Label>
                <Input
                  id="phone"
                  className="mt-2"
                  value={edited.phone}
                  onChange={(e) => setEdited({ ...edited, phone: e.target.value })}
                  disabled={!canEdit}
                />
              </div>
              <div>
                <Label htmlFor="pincode">Pickup Pincode</Label>
                <Input
                  id="pincode"
                  className="mt-2"
                  value={edited.pincode}
                  onChange={(e) => setEdited({ ...edited, pincode: e.target.value })}
                  disabled={!canEdit}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Pickup Address</Label>
              <Input
                id="address"
                value={edited.address}
                onChange={(e) => setEdited({ ...edited, address: e.target.value })}
                disabled={!canEdit}
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  className="mt-2"
                  value={edited.city}
                  onChange={(e) => setEdited({ ...edited, city: e.target.value })}
                  disabled={!canEdit}
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  className="mt-2"
                  value={edited.state}
                  onChange={(e) => setEdited({ ...edited, state: e.target.value })}
                  disabled={!canEdit}
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  className="mt-2"
                  value={edited.country}
                  onChange={(e) => setEdited({ ...edited, country: e.target.value })}
                  disabled={!canEdit}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="defaultWeight">Default Weight (kg)</Label>
                <Input
                  id="defaultWeight"
                  type="number"
                  step="0.1"
                  className="mt-2"
                  value={edited.defaultWeight}
                  onChange={(e) => setEdited({ ...edited, defaultWeight: Number(e.target.value) || 0 })}
                  disabled={!canEdit}
                />
              </div>
              <div>
                <Label htmlFor="defaultLength">Length (cm)</Label>
                <Input
                  id="defaultLength"
                  type="number"
                  className="mt-2"
                  value={edited.defaultLength}
                  onChange={(e) => setEdited({ ...edited, defaultLength: Number(e.target.value) || 0 })}
                  disabled={!canEdit}
                />
              </div>
              <div>
                <Label htmlFor="defaultBreadth">Breadth (cm)</Label>
                <Input
                  id="defaultBreadth"
                  type="number"
                  className="mt-2"
                  value={edited.defaultBreadth}
                  onChange={(e) => setEdited({ ...edited, defaultBreadth: Number(e.target.value) || 0 })}
                  disabled={!canEdit}
                />
              </div>
              <div>
                <Label htmlFor="defaultHeight">Height (cm)</Label>
                <Input
                  id="defaultHeight"
                  type="number"
                  className="mt-2"
                  value={edited.defaultHeight}
                  onChange={(e) => setEdited({ ...edited, defaultHeight: Number(e.target.value) || 0 })}
                  disabled={!canEdit}
                />
              </div>
            </div>
          </>
        )}
      </Card>

      <Card className="p-6 space-y-4">
        <div>
          <h3 className="text-lg text-gray-900">Webhook Test Simulator</h3>
          <p className="text-sm text-gray-600 mt-1">Simulate Shiprocket webhook updates to instantly test order tracking/status flow.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="simOrderNumber">Order Number *</Label>
            <Input
              id="simOrderNumber"
              className="mt-2"
              placeholder="e.g. SPR12345678"
              value={simulator.orderNumber}
              onChange={(e) => setSimulator({ ...simulator, orderNumber: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="simStatus">Webhook Status</Label>
            <Input
              id="simStatus"
              className="mt-2"
              placeholder="SHIPPED / DELIVERED / RTO"
              value={simulator.status}
              onChange={(e) => setSimulator({ ...simulator, status: e.target.value })}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="simAwb">AWB</Label>
            <Input
              id="simAwb"
              className="mt-2"
              value={simulator.awb}
              onChange={(e) => setSimulator({ ...simulator, awb: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="simTrackingUrl">Tracking URL</Label>
            <Input
              id="simTrackingUrl"
              className="mt-2"
              value={simulator.trackingUrl}
              onChange={(e) => setSimulator({ ...simulator, trackingUrl: e.target.value })}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={runWebhookSimulator} disabled={simulatingWebhook || !simulator.orderNumber.trim()}>
            {simulatingWebhook ? "Simulating..." : "Run Webhook Simulation"}
          </Button>
          <Button type="button" variant="outline" onClick={loadLogs}>
            Refresh Logs
          </Button>
        </div>
      </Card>

      {logs.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg text-gray-900 mb-3">Recent Shiprocket Logs</h3>
          <div className="space-y-2 max-h-80 overflow-auto">
            {logs.slice(0, 50).map((log, idx) => (
              <div key={idx} className="p-3 rounded-lg border bg-gray-50">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="outline">{log.eventType || "event"}</Badge>
                  <span className="text-xs text-gray-500">{log.createdAt ? new Date(log.createdAt).toLocaleString("en-IN") : ""}</span>
                </div>
                <pre className="mt-2 text-xs text-gray-700 whitespace-pre-wrap break-all">{JSON.stringify(log.payload || {}, null, 2)}</pre>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
