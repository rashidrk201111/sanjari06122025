import { PageHeader } from "../components/PageHeader";

export function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <PageHeader
        title="Shipping Policy"
        subtitle="Fast and reliable delivery across India"
        breadcrumbs={[{ label: "Shipping Policy" }]}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="prose prose-lg max-w-none">
          <h2>1. Shipping Coverage</h2>
          <p>
            We ship to all serviceable locations across India through our trusted shipping partners DTDC and Shiprocket.
            Coverage includes all major cities, towns, and rural areas where courier services are available.
          </p>

          <h2>2. Processing Time</h2>
          <ul>
            <li><strong>Standard Orders:</strong> 24-48 hours from order confirmation</li>
            <li><strong>Bulk Orders:</strong> 3-5 business days depending on quantity</li>
            <li><strong>Express Orders:</strong> Same day or next day processing (additional charges apply)</li>
            <li><strong>Custom Orders:</strong> Processing time varies, will be communicated at order placement</li>
          </ul>
          <p className="text-sm text-gray-600">
            Note: Processing time starts after payment confirmation and file approval. Orders placed on weekends or
            holidays will be processed on the next business day.
          </p>

          <h2>3. Delivery Time</h2>
          <p>Delivery times are estimated from the date of shipment:</p>
          <ul>
            <li><strong>Metro Cities:</strong> 2-3 business days</li>
            <li><strong>Tier 2 Cities:</strong> 3-4 business days</li>
            <li><strong>Tier 3 Cities & Towns:</strong> 4-6 business days</li>
            <li><strong>Remote Areas:</strong> 5-8 business days</li>
          </ul>

          <h2>4. Shipping Methods</h2>
          <h3>Standard Shipping</h3>
          <p>
            Our default shipping method using surface transport. Cost-effective and suitable for most orders.
            Charges calculated based on weight and distance.
          </p>

          <h3>Express Shipping</h3>
          <p>
            Faster delivery option using air transport where available. Higher charges apply but ensures
            quicker delivery to your doorstep.
          </p>

          <h2>5. Shipping Charges</h2>
          <ul>
            <li>Calculated based on order weight, dimensions, and destination pin code</li>
            <li>Displayed during checkout before payment</li>
            <li>Free shipping on orders above ₹2,000 (selected locations)</li>
            <li>Express shipping charges are additional</li>
          </ul>

          <h2>6. Order Tracking</h2>
          <p>
            Once your order is shipped, you will receive:
          </p>
          <ul>
            <li>Shipping confirmation email with tracking number</li>
            <li>SMS notification with courier partner details</li>
            <li>Real-time tracking link to monitor your shipment</li>
            <li>Delivery updates via SMS</li>
          </ul>

          <h2>7. Delivery Process</h2>
          <ul>
            <li>Orders are delivered during business hours (10 AM - 7 PM)</li>
            <li>Signature may be required upon delivery</li>
            <li>If you're unavailable, courier will attempt redelivery</li>
            <li>Contact courier partner directly for rescheduling delivery</li>
            <li>Orders not collected within 7 days may be returned to us</li>
          </ul>

          <h2>8. Packaging</h2>
          <p>
            We take great care in packaging your orders:
          </p>
          <ul>
            <li>Sturdy corrugated boxes for documents and books</li>
            <li>Bubble wrap and padding for delicate items</li>
            <li>Waterproof covering for weather protection</li>
            <li>Tamper-proof sealing for security</li>
          </ul>

          <h2>9. Delivery Issues</h2>
          <h3>Damaged Items</h3>
          <p>
            If your order arrives damaged:
          </p>
          <ul>
            <li>Do not accept the delivery if packaging is severely damaged</li>
            <li>Take photos of the damaged package</li>
            <li>Contact us within 48 hours with images</li>
            <li>We will arrange for replacement or refund</li>
          </ul>

          <h3>Non-Delivery</h3>
          <p>
            If your order is marked delivered but not received:
          </p>
          <ul>
            <li>Check with neighbors or building security</li>
            <li>Verify delivery address on order confirmation</li>
            <li>Contact courier partner using tracking number</li>
            <li>Reach out to us within 48 hours for assistance</li>
          </ul>

          <h2>10. Undeliverable Orders</h2>
          <p>Orders may be returned to us if:</p>
          <ul>
            <li>Address is incomplete or incorrect</li>
            <li>Recipient is unavailable after multiple attempts</li>
            <li>Delivery location is inaccessible</li>
            <li>Customer refuses to accept delivery</li>
          </ul>
          <p>
            Return shipping charges may apply for undelivered orders due to customer error.
          </p>

          <h2>11. International Shipping</h2>
          <p>
            Currently, we only ship within India. International shipping is not available at this time.
            Please check back for updates on international service availability.
          </p>

          <h2>12. Bulk Orders</h2>
          <p>
            For bulk orders requiring special logistics:
          </p>
          <ul>
            <li>Contact us for customized shipping solutions</li>
            <li>Multiple shipments may be used for large quantities</li>
            <li>Freight shipping available for very large orders</li>
            <li>Special rates negotiable for regular bulk customers</li>
          </ul>

          <h2>13. Contact for Shipping Queries</h2>
          <p>For any shipping-related questions:</p>
          <ul>
            <li>Email: sanjariprint@gmail.com</li>
            <li>Phone/WhatsApp: +91 7350001266 / 9323684301</li>
            <li>Business Hours: 11:00 AM - 8:00 PM (Mon-Sat)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
