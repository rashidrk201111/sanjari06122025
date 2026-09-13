import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";
import { useAdmin } from "../context/AdminContext";
import { Link } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";

export function FAQsPage() {
  const { pageContent, siteSettings } = useAdmin();
  const { faqs } = pageContent;

  // Group FAQs by category if available
  const categorizedFAQs = faqs.reduce((acc, faq) => {
    const category = faq.category || "General";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(faq);
    return acc;
  }, {} as Record<string, typeof faqs>);

  // Fallback FAQs if none are set in admin
  const hasFAQs = faqs.length > 0;

  return (
    <div className="min-h-screen bg-white">
      <PageHeader
        title="Frequently Asked Questions"
        subtitle="Find answers to common questions about our printing services"
        breadcrumbs={[{ label: "FAQs" }]}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {hasFAQs ? (
          <Accordion type="single" collapsible className="space-y-4">
            {Object.entries(categorizedFAQs).map(([category, categoryFAQs], categoryIndex) => (
              <div key={category} className="mb-8">
                <h2 className="text-2xl mb-4">{category}</h2>
                {categoryFAQs.map((faq, faqIndex) => (
                  <AccordionItem 
                    key={faq.id} 
                    value={`${categoryIndex}-${faqIndex}`} 
                    className="border rounded-lg px-6 mt-4 first:mt-0"
                  >
                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                    <AccordionContent>{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </div>
            ))}
          </Accordion>
        ) : (
          /* Fallback content */
          <Accordion type="single" collapsible className="space-y-4">
            {/* General Questions */}
            <div className="mb-8">
              <h2 className="text-2xl mb-4">General Questions</h2>
              
              <AccordionItem value="item-1" className="border rounded-lg px-6">
                <AccordionTrigger>What printing services do you offer?</AccordionTrigger>
                <AccordionContent>
                  We offer a wide range of printing services including documents, books, thesis & dissertations,
                  certificates, business cards, marketing materials, posters, flyers, letterheads, stationery,
                  personalized gifts, stickers, labels, and various binding options.
                </AccordionContent>
              </AccordionItem>

            <AccordionItem value="item-2" className="border rounded-lg px-6 mt-4">
              <AccordionTrigger>What file formats do you accept?</AccordionTrigger>
              <AccordionContent>
                We accept PDF, DOC, DOCX, JPG, PNG, and other common file formats. For best results,
                we recommend submitting files in PDF format with high resolution (300 DPI or higher).
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border rounded-lg px-6 mt-4">
              <AccordionTrigger>How do I place an order?</AccordionTrigger>
              <AccordionContent>
                Simply select the product you want, upload your file, customize your specifications
                (paper type, size, binding, etc.), review your order, and proceed to payment. You'll
                receive an order confirmation via email once payment is complete.
              </AccordionContent>
            </AccordionItem>
          </div>

          {/* Pricing and Payment */}
          <div className="mb-8">
            <h2 className="text-2xl mb-4">Pricing & Payment</h2>
            
            <AccordionItem value="item-4" className="border rounded-lg px-6">
              <AccordionTrigger>How is pricing calculated?</AccordionTrigger>
              <AccordionContent>
                Pricing is calculated based on several factors including page count, paper type, color vs.
                black & white, binding type, and quantity. Our system provides instant price calculation
                as you customize your order.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="border rounded-lg px-6 mt-4">
              <AccordionTrigger>What payment methods do you accept?</AccordionTrigger>
              <AccordionContent>
                We accept UPI, credit/debit cards (Visa, Mastercard, RuPay), net banking, and various
                digital wallets through our secure payment gateway powered by Razorpay.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6" className="border rounded-lg px-6 mt-4">
              <AccordionTrigger>Do you offer bulk discounts?</AccordionTrigger>
              <AccordionContent>
                Yes! We offer attractive discounts for bulk orders. The discount percentage increases
                with quantity. Please visit our Bulk Order page or contact us for custom quotes on
                large volume orders.
              </AccordionContent>
            </AccordionItem>
          </div>

          {/* Printing and Quality */}
          <div className="mb-8">
            <h2 className="text-2xl mb-4">Printing & Quality</h2>
            
            <AccordionItem value="item-7" className="border rounded-lg px-6">
              <AccordionTrigger>What paper types are available?</AccordionTrigger>
              <AccordionContent>
                We offer various paper types ranging from 70 GSM to 300 GSM, including bond paper,
                maplitho, art paper, glossy paper, and specialty papers. The available options depend
                on the product you're ordering.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-8" className="border rounded-lg px-6 mt-4">
              <AccordionTrigger>What binding options do you provide?</AccordionTrigger>
              <AccordionContent>
                We offer multiple binding options including spiral binding, thermal binding, perfect binding,
                hard cover binding, and comb binding. The availability depends on your document type and
                page count.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-9" className="border rounded-lg px-6 mt-4">
              <AccordionTrigger>Can I get a proof before final printing?</AccordionTrigger>
              <AccordionContent>
                Yes, you can request a digital proof or a physical sample for orders above a certain
                quantity. Please contact us to arrange for proofing services.
              </AccordionContent>
            </AccordionItem>
          </div>

          {/* Delivery and Shipping */}
          <div className="mb-8">
            <h2 className="text-2xl mb-4">Delivery & Shipping</h2>
            
            <AccordionItem value="item-10" className="border rounded-lg px-6">
              <AccordionTrigger>What is the typical turnaround time?</AccordionTrigger>
              <AccordionContent>
                Standard printing takes 24-48 hours from order confirmation. Delivery time depends on
                your location - typically 2-5 business days for most locations in India. Express options
                are available for urgent orders.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-11" className="border rounded-lg px-6 mt-4">
              <AccordionTrigger>Do you ship across India?</AccordionTrigger>
              <AccordionContent>
                Yes, we ship to all locations across India through our trusted partners DTDC and Shiprocket.
                Shipping charges are calculated based on weight and destination.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-12" className="border rounded-lg px-6 mt-4">
              <AccordionTrigger>Can I track my order?</AccordionTrigger>
              <AccordionContent>
                Yes, you'll receive a tracking number via email and SMS once your order is shipped.
                You can track your order status in real-time through the courier's website.
              </AccordionContent>
            </AccordionItem>
          </div>

          {/* Returns and Cancellation */}
          <div className="mb-8">
            <h2 className="text-2xl mb-4">Returns & Cancellation</h2>
            
            <AccordionItem value="item-13" className="border rounded-lg px-6">
              <AccordionTrigger>Can I cancel my order?</AccordionTrigger>
              <AccordionContent>
                Orders can be cancelled within 2 hours of placement if printing hasn't started. Once
                printing begins, cancellation is not possible. Please refer to our Cancellation Policy
                for full details.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-14" className="border rounded-lg px-6 mt-4">
              <AccordionTrigger>What is your return policy?</AccordionTrigger>
              <AccordionContent>
                We accept returns only if there's a printing error or defect from our end. Custom printed
                items with correct specifications cannot be returned. Please inspect your order upon
                delivery and report any issues within 48 hours.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-15" className="border rounded-lg px-6 mt-4">
              <AccordionTrigger>How do I get a refund?</AccordionTrigger>
              <AccordionContent>
                Refunds are processed within 7-10 business days for approved cancellations or returns.
                The refund will be credited to the original payment method used for the order.
              </AccordionContent>
            </AccordionItem>
          </div>

          {/* Support */}
          <div className="mb-8">
            <h2 className="text-2xl mb-4">Customer Support</h2>
            
            <AccordionItem value="item-16" className="border rounded-lg px-6">
              <AccordionTrigger>How can I contact customer support?</AccordionTrigger>
              <AccordionContent>
                You can reach us via phone/WhatsApp at {siteSettings.phone} {siteSettings.phone2 && `/ ${siteSettings.phone2}`} (11 AM - 8 PM, Mon-Sat) or
                email us at {siteSettings.email}. We typically respond to emails within 24 hours.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-17" className="border rounded-lg px-6 mt-4">
              <AccordionTrigger>Do you provide design services?</AccordionTrigger>
              <AccordionContent>
                Yes, we offer basic design assistance for business cards, flyers, and other marketing
                materials. For complex design work, we can connect you with our partner designers.
                Additional charges may apply.
              </AccordionContent>
            </AccordionItem>
          </div>
        </Accordion>
        )}

        {/* Still have questions */}
        <div className="mt-12 text-center bg-blue-50 rounded-lg p-8">
          <h2 className="text-2xl mb-4">Still have questions?</h2>
          <p className="text-gray-600 mb-6">
            Can't find the answer you're looking for? Our team is here to help.
          </p>
          <Link to="/contact">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              Contact Support
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
