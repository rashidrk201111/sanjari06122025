import { PageHeader } from "../components/PageHeader";

export function CancellationPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <PageHeader
        title="Cancellation & Return Policy"
        subtitle="Your rights and our commitment to customer satisfaction"
        breadcrumbs={[{ label: "Cancellation Policy" }]}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="prose prose-lg max-w-none">
          <h2>1. Order Cancellation</h2>
          
          <h3>Before Processing</h3>
          <p>
            Orders can be cancelled free of charge within 2 hours of placement if printing has not started.
            To cancel your order:
          </p>
          <ul>
            <li>Contact us immediately via phone (+91 7350001266 / 9323684301) or email</li>
            <li>Provide your order number and registered email</li>
            <li>Full refund will be processed within 7-10 business days</li>
          </ul>

          <h3>After Processing Has Started</h3>
          <p>
            Once printing has commenced, orders cannot be cancelled as materials and resources have been committed.
            In exceptional circumstances, partial cancellation may be considered on a case-by-case basis with
            applicable charges.
          </p>

          <h2>2. Modification of Orders</h2>
          <p>
            Order modifications (quantity, specifications, delivery address) are possible only before printing starts:
          </p>
          <ul>
            <li>Contact us within 2 hours of order placement</li>
            <li>Modifications may affect pricing and delivery time</li>
            <li>Price difference (if any) will be adjusted accordingly</li>
            <li>Modified orders require fresh confirmation before processing</li>
          </ul>

          <h2>3. Return Policy</h2>
          
          <h3>Eligible Returns</h3>
          <p>We accept returns only in the following cases:</p>
          <ul>
            <li><strong>Printing Errors:</strong> Incorrect content, colors, or quality issues from our end</li>
            <li><strong>Defective Products:</strong> Damaged or defective items due to manufacturing issues</li>
            <li><strong>Wrong Items:</strong> If you receive a different product than ordered</li>
            <li><strong>Shipping Damage:</strong> Items damaged during transit (with photographic evidence)</li>
          </ul>

          <h3>Non-Returnable Items</h3>
          <p>The following cannot be returned:</p>
          <ul>
            <li>Custom printed items with correct specifications</li>
            <li>Items with customer-provided content errors</li>
            <li>Products damaged due to customer handling</li>
            <li>Items used, soiled, or altered after delivery</li>
            <li>Personalized and custom-made products (unless defective)</li>
          </ul>

          <h2>4. Return Process</h2>
          <ol>
            <li>
              <strong>Initiate Return:</strong> Contact us within 48 hours of delivery with:
              <ul>
                <li>Order number and date</li>
                <li>Clear photos of the issue</li>
                <li>Description of the problem</li>
              </ul>
            </li>
            <li>
              <strong>Approval:</strong> Our team will review and approve eligible returns within 24 hours
            </li>
            <li>
              <strong>Return Shipping:</strong> We will arrange pickup or provide return shipping label
            </li>
            <li>
              <strong>Inspection:</strong> Returned items will be inspected upon receipt
            </li>
            <li>
              <strong>Resolution:</strong> Refund or replacement processed after inspection approval
            </li>
          </ol>

          <h2>5. Refund Policy</h2>
          
          <h3>Refund Processing Time</h3>
          <ul>
            <li>Refunds initiated within 48 hours of return approval</li>
            <li>Credit to original payment method within 7-10 business days</li>
            <li>Email notification sent upon refund processing</li>
            <li>Bank processing time may vary (typically 5-7 days)</li>
          </ul>

          <h3>Refund Amount</h3>
          <ul>
            <li><strong>Full Refund:</strong> For cancellations within 2 hours or defective products</li>
            <li><strong>Partial Refund:</strong> If only part of the order is returned/defective</li>
            <li><strong>Shipping Charges:</strong> Refunded only if error was from our end</li>
          </ul>

          <h2>6. Replacement Policy</h2>
          <p>
            For defective or incorrect items, you may choose replacement instead of refund:
          </p>
          <ul>
            <li>Free replacement for our errors</li>
            <li>Priority processing for replacement orders</li>
            <li>Original specifications maintained unless requested otherwise</li>
            <li>No additional charges for replacement shipping</li>
            <li>Approved replacement orders will be delivered within 3 business days</li>
          </ul>

          <h2>7. Quality Guarantee</h2>
          <p>
            We stand behind the quality of our work. If you're not satisfied with the print quality due to our error:
          </p>
          <ul>
            <li>Contact us within 48 hours with photos</li>
            <li>Our quality team will review the issue</li>
            <li>If confirmed, we'll reprint at no additional cost</li>
            <li>Expedited processing for reprint orders</li>
          </ul>

          <h2>8. Bulk Order Cancellations</h2>
          <p>
            For bulk orders (100+ units or value above ₹10,000):
          </p>
          <ul>
            <li>Cancellation charges may apply after proof approval</li>
            <li>Partial delivery accepted with adjusted pricing</li>
            <li>Contact us for customized cancellation terms</li>
            <li>Special agreements documented in order confirmation</li>
          </ul>

          <h2>9. Force Majeure</h2>
          <p>
            We are not liable for cancellations or delays due to circumstances beyond our control including:
          </p>
          <ul>
            <li>Natural disasters</li>
            <li>Government restrictions</li>
            <li>Labor disputes</li>
            <li>Supply chain disruptions</li>
          </ul>
          <p>
            In such cases, we will communicate promptly and offer alternatives including postponement or cancellation
            with full refund.
          </p>

          <h2>10. Customer Responsibilities</h2>
          <ul>
            <li>Inspect orders immediately upon delivery</li>
            <li>Report issues within 48 hours with supporting evidence</li>
            <li>Keep original packaging for returns</li>
            <li>Provide accurate information for return processing</li>
            <li>Ensure items are unused and in original condition (for defect returns)</li>
          </ul>

          <h2>11. Dispute Resolution</h2>
          <p>
            If you're not satisfied with our cancellation/return decision:
          </p>
          <ul>
            <li>Request escalation to senior management</li>
            <li>Provide additional evidence if available</li>
            <li>We'll review within 2 business days</li>
            <li>Final decision will be communicated in writing</li>
          </ul>

          <h2>12. Contact Information</h2>
          <p>For cancellations, returns, or related queries:</p>
          <ul>
            <li><strong>Email:</strong> sanjariprint@gmail.com</li>
            <li><strong>Phone/WhatsApp:</strong> +91 7350001266 / 9323684301</li>
            <li><strong>Hours:</strong> 11:00 AM - 8:00 PM (Monday - Saturday)</li>
          </ul>

          <div className="bg-blue-50 p-6 rounded-lg mt-8">
            <h3>Important Note</h3>
            <p className="mb-0">
              This policy is designed to be fair to both customers and our business. We value your satisfaction
              and will work with you to resolve any genuine concerns. For the best experience, please review
              your files carefully before ordering and contact us immediately if you have any questions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
