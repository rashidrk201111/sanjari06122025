import { PageHeader } from "../components/PageHeader";

export function PaymentTermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <PageHeader
        title="Payment Terms"
        subtitle="Secure and flexible payment options for your convenience"
        breadcrumbs={[{ label: "Payment Terms" }]}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="prose prose-lg max-w-none">
          <h2>1. Accepted Payment Methods</h2>
          <p>
            We accept the following secure payment methods through our payment partner Razorpay:
          </p>
          
          <h3>Digital Payments</h3>
          <ul>
            <li><strong>UPI:</strong> Google Pay, PhonePe, Paytm, BHIM, and all UPI apps</li>
            <li><strong>Digital Wallets:</strong> Paytm Wallet, Mobikwik, Amazon Pay</li>
          </ul>

          <h3>Credit/Debit Cards</h3>
          <ul>
            <li>Visa</li>
            <li>Mastercard</li>
            <li>RuPay</li>
            <li>American Express</li>
            <li>Maestro</li>
          </ul>

          <h3>Net Banking</h3>
          <ul>
            <li>All major Indian banks</li>
            <li>Instant bank transfer</li>
          </ul>

          <h2>2. Payment Security</h2>
          <p>Your payment security is our top priority:</p>
          <ul>
            <li>All transactions encrypted with 256-bit SSL</li>
            <li>PCI DSS compliant payment gateway</li>
            <li>No card details stored on our servers</li>
            <li>Secure 3D authentication for card payments</li>
            <li>Razorpay's fraud detection system</li>
          </ul>

          <h2>3. Payment Process</h2>
          <ol>
            <li>Select your product and customize specifications</li>
            <li>Review order summary with price breakdown</li>
            <li>Choose preferred payment method</li>
            <li>Complete payment through secure gateway</li>
            <li>Receive instant order confirmation via email and SMS</li>
          </ol>

          <h2>4. Pricing and Charges</h2>
          
          <h3>Price Display</h3>
          <ul>
            <li>All prices in Indian Rupees (INR)</li>
            <li>Prices include applicable GST</li>
            <li>Shipping charges calculated at checkout</li>
            <li>No hidden charges</li>
          </ul>

          <h3>GST and Taxes</h3>
          <ul>
            <li>GST applicable as per government regulations</li>
            <li>GST invoice provided for all orders</li>
            <li>Tax breakdown shown in order summary</li>
            <li>GSTIN available on request for business orders</li>
          </ul>

          <h2>5. Payment Confirmation</h2>
          <p>After successful payment:</p>
          <ul>
            <li>Instant confirmation email with order details</li>
            <li>SMS confirmation to registered mobile number</li>
            <li>Transaction ID for reference</li>
            <li>Digital invoice (download from order confirmation email)</li>
          </ul>

          <h2>6. Failed Transactions</h2>
          
          <h3>If Your Payment Fails:</h3>
          <ul>
            <li>Check internet connectivity</li>
            <li>Verify card details and available balance</li>
            <li>Ensure OTP is entered correctly</li>
            <li>Try a different payment method</li>
            <li>Contact your bank if issue persists</li>
          </ul>

          <h3>Amount Deducted but Order Not Confirmed:</h3>
          <ul>
            <li>Amount will be auto-refunded within 5-7 business days</li>
            <li>Contact us with transaction ID for faster resolution</li>
            <li>We'll verify with payment gateway and update you</li>
          </ul>

          <h2>7. Advance Payment for Bulk Orders</h2>
          <p>For bulk orders (value above ₹50,000):</p>
          <ul>
            <li>50% advance payment required</li>
            <li>Balance payable before shipment</li>
            <li>Special payment terms negotiable for regular customers</li>
            <li>Credit facility available for verified corporate clients</li>
          </ul>

          <h2>8. Refund Process</h2>
          
          <h3>Refund Timeline</h3>
          <ul>
            <li>Refund initiated within 48 hours of approval</li>
            <li>Amount credited to original payment method</li>
            <li>UPI/Wallet: 3-5 business days</li>
            <li>Credit/Debit Cards: 5-7 business days</li>
            <li>Net Banking: 7-10 business days</li>
          </ul>

          <h3>Refund Notification</h3>
          <ul>
            <li>Email confirmation when refund is initiated</li>
            <li>SMS alert upon successful credit</li>
            <li>Refund reference number provided</li>
          </ul>

          <h2>9. Invoice and Receipt</h2>
          <ul>
            <li>GST-compliant tax invoice issued for all orders</li>
            <li>Available for download in your account</li>
            <li>Sent via email with order confirmation</li>
            <li>Physical invoice included with shipment</li>
            <li>Duplicate invoices available on request</li>
          </ul>

          <h2>10. Payment Disputes</h2>
          <p>In case of payment-related disputes:</p>
          <ul>
            <li>Contact us within 30 days of transaction</li>
            <li>Provide transaction ID and order number</li>
            <li>We'll investigate and respond within 3-5 business days</li>
            <li>Resolution as per our refund policy</li>
          </ul>

          <h2>11. Corporate Payments</h2>
          
          <h3>For Business Customers:</h3>
          <ul>
            <li>Credit facility available (subject to approval)</li>
            <li>Credit period: 15-30 days for verified accounts</li>
            <li>Monthly billing option for regular orders</li>
            <li>Dedicated account manager</li>
            <li>NEFT/RTGS accepted for large orders</li>
          </ul>

          <h2>12. Payment Receipt and Records</h2>
          <ul>
            <li>All payment records maintained securely</li>
            <li>Order history accessible in your account</li>
            <li>Download invoices and receipts anytime</li>
            <li>Annual statement available on request</li>
          </ul>

          <h2>13. Currency</h2>
          <p>
            All transactions are processed in Indian Rupees (INR). For international cards, the amount will be
            converted by your card issuer at prevailing exchange rates. Additional international transaction
            charges may apply as per your bank's policy.
          </p>

          <h2>14. Price Changes</h2>
          <ul>
            <li>Prices may change without prior notice</li>
            <li>Order price locked at time of payment</li>
            <li>Bulk order quotes valid for 7 days</li>
            <li>Special discounts and offers subject to terms & conditions</li>
          </ul>

          <h2>15. Contact for Payment Queries</h2>
          <p>For any payment-related questions or issues:</p>
          <ul>
            <li><strong>Email:</strong> sanjariprint@gmail.com</li>
            <li><strong>Phone/WhatsApp:</strong> +91 7350001266 / 9323684301</li>
            <li><strong>Hours:</strong> 11:00 AM - 8:00 PM (Monday - Saturday)</li>
          </ul>

          <div className="bg-green-50 p-6 rounded-lg mt-8">
            <h3>Payment Security Guarantee</h3>
            <p className="mb-0">
              Your payment information is processed through industry-leading secure payment gateway Razorpay.
              We never see or store your card details. All transactions are encrypted and monitored for
              fraudulent activity. Your trust and security are paramount to us.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
