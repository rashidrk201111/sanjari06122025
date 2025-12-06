import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Create Supabase client
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

// Enable logger
app.use('*', logger(console.log));

// CORS middleware with proper configuration
const corsMiddleware = async (c: any, next: any) => {
  // Get the origin from the request
  const origin = c.req.header('origin') || '*';
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://sanjari-prints.vercel.app',
    'https://sanjari-prints.vercel.app',
    'https://sanjari-prints-git-main-rashidrk2011.vercel.app',
    'https://sanjari-prints-rashidrk2011.vercel.app'
  ];

  // If the request origin is in the allowed origins, use it, otherwise use the first allowed origin
  const allowedOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

  // Set CORS headers
  c.header('Access-Control-Allow-Origin', allowedOrigin);
  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-VERIFY, X-MERCHANT-ID');
  c.header('Access-Control-Allow-Credentials', 'true');
  c.header('Access-Control-Expose-Headers', 'Content-Length, Content-Type, X-VERIFY');
  c.header('Access-Control-Max-Age', '86400');

  // Handle preflight requests
  if (c.req.method === 'OPTIONS') {
    return c.text('', 204);
  }

  await next();
};

// Apply CORS to all routes
app.use('*', corsMiddleware);

// Health check endpoint
app.get("/make-server-a145b27b/health", (c) => {
  return c.json({ status: "ok" });
});

// Logo upload endpoint
app.post("/make-server-a145b27b/upload-logo", async (c) => {
  try {
    const body = await c.req.json();
    const { file, fileName, fileType } = body;

    if (!file || !fileName) {
      return c.json({ error: "Missing file or fileName" }, 400);
    }

    console.log("Uploading logo:", fileName);

    // Ensure bucket exists
    const bucketName = "make-a145b27b-logos";
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.log("Creating bucket:", bucketName);
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
      });
      if (createError) {
        console.error("Error creating bucket:", createError);
      }
    }

    // Extract base64 data
    const base64Data = file.split(",")[1] || file;
    const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    // Generate unique filename
    const timestamp = Date.now();
    const ext = fileName.split(".").pop();
    const uniqueFileName = `logo-${timestamp}.${ext}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(uniqueFileName, buffer, {
        contentType: fileType,
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return c.json({ error: uploadError.message }, 500);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(uniqueFileName);

    const logoUrl = urlData.publicUrl;
    console.log("Logo uploaded successfully:", logoUrl);

    // Store logo URL in KV store
    await kv.set("site_logo", logoUrl);

    return c.json({ 
      success: true, 
      url: logoUrl,
      fileName: uniqueFileName 
    });
  } catch (error) {
    console.error("Error uploading logo:", error);
    return c.json({ 
      error: error instanceof Error ? error.message : "Failed to upload logo" 
    }, 500);
  }
});

// Get current logo endpoint
app.get("/make-server-a145b27b/logo", async (c) => {
  try {
    const logo = await kv.get("site_logo");
    return c.json({ 
      logo: logo || "" 
    });
  } catch (error) {
    console.error("Error fetching logo:", error);
    return c.json({ 
      error: error instanceof Error ? error.message : "Failed to fetch logo" 
    }, 500);
  }
});

// Delete logo endpoint
app.delete("/make-server-a145b27b/logo", async (c) => {
  try {
    await kv.del("site_logo");
    return c.json({ 
      success: true,
      message: "Logo deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting logo:", error);
    return c.json({ 
      error: error instanceof Error ? error.message : "Failed to delete logo" 
    }, 500);
  }
});

// ==================== PAYMENT GATEWAY ENDPOINTS ====================

// Get payment gateway settings
app.get("/make-server-a145b27b/payment-settings", async (c) => {
  try {
    const settings = await kv.get("payment_gateway");
    
    if (!settings) {
      // Return default settings if none exist
      return c.json({
        razorpay: {
          enabled: false,
          testMode: true,
          keyId: "",
          keySecret: ""
        },
        phonepe: {
          enabled: false,
          testMode: true,
          merchantId: "",
          saltKey: "",
          saltIndex: "1"
        },
        codEnabled: true
      });
    }

    // Only return public keys (not secrets)
    return c.json({
      razorpay: {
        enabled: settings.razorpay?.enabled || false,
        testMode: settings.razorpay?.testMode || true,
        keyId: settings.razorpay?.keyId || ""
        // keySecret is kept server-side only
      },
      phonepe: {
        enabled: settings.phonepe?.enabled || false,
        testMode: settings.phonepe?.testMode || true,
        merchantId: settings.phonepe?.merchantId || ""
        // saltKey and saltIndex kept server-side only
      },
      codEnabled: settings.codEnabled !== undefined ? settings.codEnabled : true
    });
  } catch (error) {
    console.error("Error fetching payment settings:", error);
    return c.json({ 
      error: error instanceof Error ? error.message : "Failed to fetch payment settings" 
    }, 500);
  }
});

// Create Razorpay order
app.post("/make-server-a145b27b/create-razorpay-order", async (c) => {
  try {
    const body = await c.req.json();
    const { amount, currency = "INR", receipt, notes } = body;

    if (!amount) {
      return c.json({ error: "Amount is required" }, 400);
    }

    console.log("Creating Razorpay order for amount:", amount);

    // Get payment settings from KV store
    const settings = await kv.get("payment_gateway");
    
    if (!settings?.razorpay?.enabled) {
      return c.json({ error: "Razorpay is not enabled" }, 400);
    }

    const keyId = settings.razorpay.keyId;
    const keySecret = settings.razorpay.keySecret;

    if (!keyId || !keySecret) {
      return c.json({ error: "Razorpay credentials not configured" }, 400);
    }

    // Create Razorpay order using API
    const orderData = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: currency,
      receipt: receipt || `receipt_${Date.now()}`,
      notes: notes || {}
    };

    const auth = btoa(`${keyId}:${keySecret}`);
    
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${auth}`
      },
      body: JSON.stringify(orderData)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Razorpay API error:", errorData);
      throw new Error(`Razorpay API error: ${errorData}`);
    }

    const order = await response.json();
    console.log("Razorpay order created:", order.id);

    return c.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: keyId
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return c.json({ 
      error: error instanceof Error ? error.message : "Failed to create Razorpay order" 
    }, 500);
  }
});

// Verify Razorpay payment
app.post("/make-server-a145b27b/verify-razorpay-payment", async (c) => {
  try {
    const body = await c.req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return c.json({ error: "Missing payment verification data" }, 400);
    }

    console.log("Verifying Razorpay payment:", razorpay_payment_id);

    // Get payment settings
    const settings = await kv.get("payment_gateway");
    const keySecret = settings?.razorpay?.keySecret;

    if (!keySecret) {
      return c.json({ error: "Razorpay credentials not configured" }, 400);
    }

    // Verify signature
    const crypto = await import("node:crypto");
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(text)
      .digest("hex");

    const isValid = generatedSignature === razorpay_signature;

    if (isValid) {
      console.log("Razorpay payment verified successfully:", razorpay_payment_id);
      return c.json({ 
        success: true, 
        verified: true,
        paymentId: razorpay_payment_id
      });
    } else {
      console.error("Razorpay signature verification failed");
      return c.json({ 
        success: false, 
        verified: false,
        error: "Invalid signature"
      }, 400);
    }
  } catch (error) {
    console.error("Error verifying Razorpay payment:", error);
    return c.json({ 
      error: error instanceof Error ? error.message : "Failed to verify payment" 
    }, 500);
  }
});

// Create PhonePe payment
app.post("/make-server-a145b27b/create-phonepe-payment", async (c) => {
  try {
    let body;
    try {
      body = await c.req.json();
      console.log("Received PhonePe payment request:", JSON.stringify(body, null, 2));
    } catch (e) {
      console.error("Error parsing request body:", e);
      return c.json({ 
        success: false,
        error: "Invalid JSON payload",
        details: e instanceof Error ? e.message : 'Unknown error'
      }, 400);
    }
    
    const { amount, merchantTransactionId, merchantUserId, redirectUrl, callbackUrl } = body;

    if (!amount || !merchantTransactionId) {
      console.error("Missing required fields:", { amount, merchantTransactionId });
      return c.json({ 
        error: "Amount and transaction ID are required",
        details: { received: { amount, merchantTransactionId } }
      }, 400);
    }

    console.log("Creating PhonePe payment for amount:", amount);

    // Get payment settings
    const settings = await kv.get("payment_gateway");
    
    if (!settings?.phonepe?.enabled) {
      return c.json({ error: "PhonePe is not enabled" }, 400);
    }

    const merchantId = settings?.phonepe?.merchantId;
    const saltKey = settings?.phonepe?.saltKey;
    const saltIndex = settings?.phonepe?.saltIndex || "1";
    const testMode = settings?.phonepe?.testMode || false;

    if (!merchantId || !saltKey) {
      console.error("Missing PhonePe credentials in settings");
      return c.json({ 
        success: false,
        error: "PhonePe credentials not properly configured",
        details: { 
          hasMerchantId: !!merchantId, 
          hasSaltKey: !!saltKey,
          settings: {
            merchantId: merchantId ? '***' + merchantId.slice(-4) : 'missing',
            saltKey: saltKey ? '***' + saltKey.slice(-4) : 'missing',
            saltIndex,
            testMode
          }
        }
      }, 400);
    }

    // Prepare payment request
    // Ensure amount is a number and round to nearest integer
    const amountInPaise = Math.round(Number(amount) * 100);
    
    const paymentPayload = {
      merchantId: merchantId,
      merchantTransactionId: merchantTransactionId,
      merchantUserId: merchantUserId || `user_${Date.now()}`,
      amount: amountInPaise,
      redirectUrl: redirectUrl || `${window.location.origin}/checkout/status`,
      redirectMode: "POST",
      callbackUrl: callbackUrl || `${Deno.env.get("SUPABASE_URL")}/functions/v1/make-server-a145b27b/phonepe-callback`,
      mobileNumber: "",
      paymentInstrument: {
        type: "PAY_PAGE"
      }
    };
    
    console.log("Payment payload:", JSON.stringify(paymentPayload, null, 2));

    // Encode payload to base64
    const base64Payload = btoa(JSON.stringify(paymentPayload));
    console.log("Base64 payload:", base64Payload);

    try {
      // Generate checksum
      const crypto = await import("node:crypto");
      const checksumString = `${base64Payload}/pg/v1/pay${saltKey}`;
      console.log("Checksum string:", checksumString);
      
      const checksum = crypto.createHash("sha256").update(checksumString).digest("hex");
      const xVerify = `${checksum}###${saltIndex}`;
      console.log("X-VERIFY header:", xVerify);

    // Determine API endpoint based on test mode
    const apiUrl = testMode 
      ? "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay"
      : "https://api.phonepe.com/apis/hermes/pg/v1/pay";

    console.log("PhonePe API URL:", apiUrl);
    
    // Log test mode status
    console.log(`PhonePe test mode: ${testMode ? 'ENABLED' : 'DISABLED'}`);

      // Prepare request options
      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": xVerify,
          "X-CLIENT-ID": merchantId,
          "X-CALLBACK-URL": callbackUrl || `${Deno.env.get("SUPABASE_URL")}/functions/v1/make-server-a145b27b/phonepe-callback`
        },
        body: JSON.stringify({
          request: base64Payload
        })
      };
      
      console.log("Sending request to PhonePe API:", {
        url: apiUrl,
        ...requestOptions,
        headers: {
          ...requestOptions.headers,
          "X-VERIFY": "***" + (xVerify ? xVerify.slice(-10) : '')
        },
        body: {
          request: base64Payload.substring(0, 30) + "..."
        }
      });
      
      // Make API request
      const response = await fetch(apiUrl, requestOptions);

      const responseText = await response.text();
      let result;
      
      try {
        result = responseText ? JSON.parse(responseText) : {};
        console.log("Raw PhonePe API response:", responseText);
      } catch (e) {
        console.error("Failed to parse PhonePe response:", responseText);
        console.error("Parse error:", e);
        throw new Error(`Invalid response from PhonePe API: ${responseText.substring(0, 200)}...`);
      }

      console.log("PhonePe API response:", {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        result: {
          ...result,
          data: result.data ? {
            ...result.data,
            merchantTransactionId: result.data.merchantTransactionId || 'not-provided',
            transactionId: result.data.transactionId || 'not-provided',
            instrumentResponse: result.data.instrumentResponse ? 'present' : 'missing',
            responseCode: result.data.responseCode || 'not-provided',
            responseMessage: result.data.responseMessage || 'not-provided',
          } : 'no-data'
        }
      });

      if (!response.ok) {
        console.error("PhonePe API error:", {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: responseText
        });
        
        let errorMessage = `PhonePe API error: ${response.status} ${response.statusText}`;
        
        if (result) {
          errorMessage = result?.message || 
                        result?.error?.message || 
                        result?.data?.message ||
                        errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      if (result.success && result.data?.instrumentResponse?.redirectInfo?.url) {
        const redirectUrl = result.data.instrumentResponse.redirectInfo.url;
        console.log("Payment initiated successfully. Redirecting to:", redirectUrl);
        
        return c.json({
          success: true,
          redirectUrl: redirectUrl
        });
    }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      console.error("Error creating PhonePe payment:", {
        error: errorMessage,
        stack: errorStack,
        timestamp: new Date().toISOString()
      });
      
      return c.json({ 
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
        details: Deno.env.get("NODE_ENV") === 'development' ? {
          message: errorMessage,
          stack: errorStack
        } : undefined
      }, 500);
    }
  } catch (error) {
    console.error("Unexpected error in PhonePe payment handler:", error);
    return c.json({
      success: false,
      error: "An unexpected error occurred",
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// PhonePe payment callback/webhook
// ...
  try {
    const body = await c.req.json();
    console.log("PhonePe callback received:", body);

    // Get payment settings
    const settings = await kv.get("payment_gateway");
    const saltKey = settings?.phonepe?.saltKey;
    const saltIndex = settings?.phonepe?.saltIndex || "1";

    if (!saltKey) {
      return c.json({ error: "PhonePe credentials not configured" }, 400);
    }

    // Verify callback signature if present
    const xVerifyHeader = c.req.header("X-VERIFY");
    if (xVerifyHeader) {
      const [receivedChecksum] = xVerifyHeader.split("###");
      const base64Response = body.response;
      
      const crypto = await import("node:crypto");
      const checksumString = `${base64Response}${saltKey}`;
      const expectedChecksum = crypto.createHash("sha256").update(checksumString).digest("hex");

      if (receivedChecksum !== expectedChecksum) {
        console.error("PhonePe callback signature verification failed");
        return c.json({ error: "Invalid signature" }, 400);
      }
    }

    // Decode response
    const responseData = body.response ? JSON.parse(atob(body.response)) : body;
    
    return c.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error("Error processing PhonePe callback:", error);
    return c.json({ 
      error: error instanceof Error ? error.message : "Failed to process callback" 
    }, 500);
  }
});

// Check PhonePe payment status
app.post("/make-server-a145b27b/check-phonepe-status", async (c) => {
  try {
    const body = await c.req.json();
    const { merchantTransactionId } = body;

    if (!merchantTransactionId) {
      return c.json({ error: "Transaction ID is required" }, 400);
    }

    console.log("Checking PhonePe payment status:", merchantTransactionId);

    // Get payment settings
    const settings = await kv.get("payment_gateway");
    const merchantId = settings?.phonepe?.merchantId;
    const saltKey = settings?.phonepe?.saltKey;
    const saltIndex = settings?.phonepe?.saltIndex || "1";
    const testMode = settings?.phonepe?.testMode;

    if (!merchantId || !saltKey) {
      return c.json({ error: "PhonePe credentials not configured" }, 400);
    }

    // Generate checksum for status check
    const crypto = await import("node:crypto");
    const checksumString = `/pg/v1/status/${merchantId}/${merchantTransactionId}${saltKey}`;
    const checksum = crypto.createHash("sha256").update(checksumString).digest("hex");
    const xVerify = `${checksum}###${saltIndex}`;

    // Determine API endpoint
    const apiUrl = testMode
      ? `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${merchantId}/${merchantTransactionId}`
      : `https://api.phonepe.com/apis/hermes/pg/v1/status/${merchantId}/${merchantTransactionId}`;

    // Make status check request
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": xVerify,
        "X-MERCHANT-ID": merchantId
      }
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("PhonePe status check error:", errorData);
      throw new Error(`PhonePe status check failed: ${errorData}`);
    }

    const result = await response.json();
    console.log("PhonePe payment status:", result);

    return c.json({
      success: true,
      status: result.code === "PAYMENT_SUCCESS" ? "success" : "failed",
      data: result.data
    });
  } catch (error) {
    console.error("Error checking PhonePe status:", error);
    return c.json({ 
      error: error instanceof Error ? error.message : "Failed to check payment status" 
    }, 500);
  }
});

Deno.serve(app.fetch);