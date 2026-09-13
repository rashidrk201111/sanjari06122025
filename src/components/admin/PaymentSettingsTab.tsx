import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { CreditCard, Save, Shield, DollarSign, AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { PaymentGateway } from "../../context/AdminContext";
import { Alert, AlertDescription } from "../ui/alert";
import { Badge } from "../ui/badge";
import { API_BASE } from "../../lib/apiBase";
import { adminJsonHeaders } from "../../lib/adminAuthHeaders";
import { projectId, publicAnonKey } from "../../utils/supabase/info";

interface PaymentSettingsTabProps {
  paymentGateway: PaymentGateway;
  updatePaymentGateway: (settings: Partial<PaymentGateway>) => Promise<void>;
}

export function PaymentSettingsTab({ paymentGateway, updatePaymentGateway }: PaymentSettingsTabProps) {
  const [editedPayment, setEditedPayment] = useState(paymentGateway);
  const [showRazorpaySecret, setShowRazorpaySecret] = useState(false);
  const [showPhonePeSalt, setShowPhonePeSalt] = useState(false);
  const [syncState, setSyncState] = useState<"idle" | "checking" | "ok" | "mismatch" | "error">("idle");
  const [syncMessage, setSyncMessage] = useState("Not checked yet");
  const [lastCheckedAt, setLastCheckedAt] = useState<Date | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  useEffect(() => {
    setEditedPayment(paymentGateway);
  }, [paymentGateway]);

  const formatDateTime = (date: Date) =>
    date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const verifyCheckoutSync = async (settingsToCompare: PaymentGateway = editedPayment) => {
    setSyncState("checking");
    setSyncMessage("Checking checkout sync...");
    setLastCheckedAt(new Date());

    try {
      const response = await fetch(
        `${API_BASE}/api/payments/settings/`,
        {
          method: "GET",
          headers: await adminJsonHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to read checkout payment settings");
      }

      const backendSettings = await response.json();

      const publicFieldsMatch =
        backendSettings?.codEnabled === settingsToCompare.codEnabled &&
        backendSettings?.razorpay?.enabled === settingsToCompare.razorpay.enabled &&
        backendSettings?.razorpay?.testMode === settingsToCompare.razorpay.testMode &&
        backendSettings?.phonepe?.enabled === settingsToCompare.phonepe.enabled &&
        backendSettings?.phonepe?.testMode === settingsToCompare.phonepe.testMode &&
        (backendSettings?.phonepe?.saltIndex || "1") === (settingsToCompare.phonepe.saltIndex || "1");

      if (publicFieldsMatch) {
        const now = new Date();
        setSyncState("ok");
        setSyncMessage("Checkout is using latest admin payment settings.");
        setLastCheckedAt(now);
        setLastSyncedAt(now);
      } else {
        setSyncState("mismatch");
        setSyncMessage("Checkout settings do not match current admin values yet.");
        setLastCheckedAt(new Date());
      }
    } catch (error) {
      console.error("Error verifying checkout sync:", error);
      setSyncState("error");
      setSyncMessage("Could not verify checkout sync. Check edge function deployment.");
      setLastCheckedAt(new Date());
    }
  };

  const handleSavePayment = async () => {
    await updatePaymentGateway(editedPayment);
    toast.success("Payment gateway settings updated successfully!");
    await verifyCheckoutSync(editedPayment);
  };

  const getSyncBadge = () => {
    if (syncState === "checking") {
      return <Badge variant="outline">Checking...</Badge>;
    }
    if (syncState === "ok") {
      return <Badge className="bg-green-100 text-green-800 border-green-300">Sync OK</Badge>;
    }
    if (syncState === "mismatch") {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Out of Sync</Badge>;
    }
    if (syncState === "error") {
      return <Badge className="bg-red-100 text-red-800 border-red-300">Sync Error</Badge>;
    }
    return <Badge variant="outline">Not Checked</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-gray-900">Payment Gateway Settings</h2>
          <p className="text-sm text-gray-600 mt-1">
            Configure payment methods for your customers
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getSyncBadge()}
          <Button type="button" variant="outline" onClick={() => verifyCheckoutSync()}>
            Check Sync
          </Button>
          <Button onClick={handleSavePayment} className="bg-green-600 hover:bg-green-700">
            <Save className="w-4 h-4 mr-2" />
            Save Payment Settings
          </Button>
        </div>
      </div>

      <Alert className={syncState === "ok" ? "border-green-300 bg-green-50" : ""}>
        {syncState === "ok" ? (
          <CheckCircle2 className="h-4 w-4 text-green-600" />
        ) : (
          <AlertCircle className="h-4 w-4" />
        )}
        <AlertDescription className={syncState === "ok" ? "text-green-800" : ""}>
          <div><strong>Checkout Sync Status:</strong> {syncMessage}</div>
          <div className="mt-1 text-xs opacity-80">
            Last checked: {lastCheckedAt ? formatDateTime(lastCheckedAt) : "Not checked yet"}
          </div>
          <div className="text-xs opacity-80">
            Last sync OK: {lastSyncedAt ? formatDateTime(lastSyncedAt) : "No successful sync yet"}
          </div>
        </AlertDescription>
      </Alert>

      {/* Security Warning */}
      <Alert className="border-yellow-300 bg-yellow-50">
        <Shield className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          <strong>Security Note:</strong> Never share your API keys publicly. These are stored locally in your browser. 
          For production, implement proper backend API key management.
        </AlertDescription>
      </Alert>

      {/* Razorpay Settings */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg text-gray-900">Razorpay Payment Gateway</h3>
              <p className="text-sm text-gray-600">Accept UPI, cards, wallets, and net banking</p>
            </div>
          </div>
          <Switch
            checked={editedPayment.razorpay.enabled}
            onCheckedChange={(checked) =>
              setEditedPayment({
                ...editedPayment,
                razorpay: { ...editedPayment.razorpay, enabled: checked },
              })
            }
          />
        </div>

        {editedPayment.razorpay.enabled && (
          <div className="space-y-6 pt-6 border-t">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-900">Test Mode</p>
                <p className="text-xs text-gray-600 mt-1">
                  Use test API keys for development
                </p>
              </div>
              <Switch
                checked={editedPayment.razorpay.testMode}
                onCheckedChange={(checked) =>
                  setEditedPayment({
                    ...editedPayment,
                    razorpay: { ...editedPayment.razorpay, testMode: checked },
                  })
                }
              />
            </div>

            <div>
              <Label htmlFor="razorpayKeyId">Razorpay Key ID</Label>
              <Input
                id="razorpayKeyId"
                value={editedPayment.razorpay.keyId}
                onChange={(e) =>
                  setEditedPayment({
                    ...editedPayment,
                    razorpay: { ...editedPayment.razorpay, keyId: e.target.value },
                  })
                }
                placeholder="rzp_test_xxxxxxxxxx or rzp_live_xxxxxxxxxx"
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Public key - starts with rzp_test or rzp_live
              </p>
            </div>

            <div>
              <Label htmlFor="razorpayKeySecret">Razorpay Key Secret</Label>
              <div className="relative mt-2">
                <Input
                  id="razorpayKeySecret"
                  type={showRazorpaySecret ? "text" : "password"}
                  value={editedPayment.razorpay.keySecret}
                  onChange={(e) =>
                    setEditedPayment({
                      ...editedPayment,
                      razorpay: { ...editedPayment.razorpay, keySecret: e.target.value },
                    })
                  }
                  placeholder="••••••••••••••••••••"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowRazorpaySecret(!showRazorpaySecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showRazorpaySecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Secret key - keep this confidential
              </p>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm text-blue-900 mb-2">How to get Razorpay API Keys:</h4>
              <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
                <li>Sign up at <a href="https://razorpay.com" target="_blank" rel="noopener noreferrer" className="underline">razorpay.com</a></li>
                <li>Complete KYC verification</li>
                <li>Go to Settings → API Keys</li>
                <li>Generate new keys or use existing ones</li>
                <li>Copy Key ID and Key Secret here</li>
              </ol>
            </div>
          </div>
        )}
      </Card>

      {/* PhonePe Settings */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg text-gray-900">PhonePe Payment Gateway</h3>
              <p className="text-sm text-gray-600">Accept payments via PhonePe UPI</p>
            </div>
          </div>
          <Switch
            checked={editedPayment.phonepe.enabled}
            onCheckedChange={(checked) =>
              setEditedPayment({
                ...editedPayment,
                phonepe: { ...editedPayment.phonepe, enabled: checked },
              })
            }
          />
        </div>

        {editedPayment.phonepe.enabled && (
          <div className="space-y-6 pt-6 border-t">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-900">Test Mode</p>
                <p className="text-xs text-gray-600 mt-1">
                  Use UAT environment for testing
                </p>
              </div>
              <Switch
                checked={editedPayment.phonepe.testMode}
                onCheckedChange={(checked) =>
                  setEditedPayment({
                    ...editedPayment,
                    phonepe: { ...editedPayment.phonepe, testMode: checked },
                  })
                }
              />
            </div>

            <div>
              <Label htmlFor="phonepeMerchantId">Merchant ID</Label>
              <Input
                id="phonepeMerchantId"
                value={editedPayment.phonepe.merchantId}
                onChange={(e) =>
                  setEditedPayment({
                    ...editedPayment,
                    phonepe: { ...editedPayment.phonepe, merchantId: e.target.value },
                  })
                }
                placeholder="M1234567890"
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Your PhonePe merchant ID
              </p>
            </div>

            <div>
              <Label htmlFor="phonepeSaltKey">Salt Key</Label>
              <div className="relative mt-2">
                <Input
                  id="phonepeSaltKey"
                  type={showPhonePeSalt ? "text" : "password"}
                  value={editedPayment.phonepe.saltKey}
                  onChange={(e) =>
                    setEditedPayment({
                      ...editedPayment,
                      phonepe: { ...editedPayment.phonepe, saltKey: e.target.value },
                    })
                  }
                  placeholder="••••••••-••••-••••-••••-••••••••••••"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPhonePeSalt(!showPhonePeSalt)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPhonePeSalt ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Salt key for request signing - keep confidential
              </p>
            </div>

            <div>
              <Label htmlFor="phonepeSaltIndex">Salt Index</Label>
              <Input
                id="phonepeSaltIndex"
                value={editedPayment.phonepe.saltIndex}
                onChange={(e) =>
                  setEditedPayment({
                    ...editedPayment,
                    phonepe: { ...editedPayment.phonepe, saltIndex: e.target.value },
                  })
                }
                placeholder="1"
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Salt key index (usually 1)
              </p>
            </div>

            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 className="text-sm text-purple-900 mb-2">How to get PhonePe API Credentials:</h4>
              <ol className="text-xs text-purple-800 space-y-1 list-decimal list-inside">
                <li>Register as a PhonePe merchant at <a href="https://business.phonepe.com" target="_blank" rel="noopener noreferrer" className="underline">business.phonepe.com</a></li>
                <li>Complete business verification</li>
                <li>Access merchant dashboard</li>
                <li>Navigate to API Keys section</li>
                <li>Copy Merchant ID, Salt Key, and Salt Index</li>
              </ol>
            </div>
          </div>
        )}
      </Card>

      {/* Cash on Delivery */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg text-gray-900">Cash on Delivery (COD)</h3>
              <p className="text-sm text-gray-600">Allow customers to pay on delivery</p>
            </div>
          </div>
          <Switch
            checked={editedPayment.codEnabled}
            onCheckedChange={(checked) =>
              setEditedPayment({ ...editedPayment, codEnabled: checked })
            }
          />
        </div>

        {editedPayment.codEnabled && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Note:</strong> COD is enabled for all orders. You can add COD restrictions 
              (minimum order value, specific regions) in future updates.
            </p>
          </div>
        )}
      </Card>

      {/* Payment Summary */}
      <Card className="p-6 bg-gray-50">
        <h3 className="text-lg text-gray-900 mb-4">Active Payment Methods</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-white rounded-lg">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-900">Razorpay</span>
            </div>
            {editedPayment.razorpay.enabled ? (
              <Badge className="bg-green-100 text-green-700">Active</Badge>
            ) : (
              <Badge className="bg-gray-100 text-gray-700">Disabled</Badge>
            )}
          </div>

          <div className="flex items-center justify-between p-3 bg-white rounded-lg">
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-900">PhonePe</span>
            </div>
            {editedPayment.phonepe.enabled ? (
              <Badge className="bg-green-100 text-green-700">Active</Badge>
            ) : (
              <Badge className="bg-gray-100 text-gray-700">Disabled</Badge>
            )}
          </div>

          <div className="flex items-center justify-between p-3 bg-white rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-900">Cash on Delivery</span>
            </div>
            {editedPayment.codEnabled ? (
              <Badge className="bg-green-100 text-green-700">Active</Badge>
            ) : (
              <Badge className="bg-gray-100 text-gray-700">Disabled</Badge>
            )}
          </div>
        </div>
      </Card>

      {/* Integration Guide */}
      <Card className="p-6 border-blue-200 bg-blue-50">
        <h3 className="text-lg text-blue-900 mb-3">🔐 Integration Status</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>✅ Payment gateway configuration interface complete</p>
          <p>⚠️ Actual payment processing requires backend integration</p>
          <p>💡 Next steps for production:</p>
          <ul className="ml-4 space-y-1 list-disc">
            <li>Set up backend API endpoints for payment initialization</li>
            <li>Implement webhook handlers for payment verification</li>
            <li>Add proper error handling and logging</li>
            <li>Test in sandbox/UAT environment thoroughly</li>
            <li>Switch to live keys after testing</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}

// Badge component (if not already imported)
function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${className}`}>
      {children}
    </span>
  );
}
