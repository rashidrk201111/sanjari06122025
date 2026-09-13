import { Upload, Settings, Truck, CheckCircle } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Link } from "react-router-dom";

export function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white">
      <PageHeader
        title="How It Works"
        subtitle="Get your prints delivered in 4 simple steps"
        breadcrumbs={[{ label: "How It Works" }]}
      />

      {/* Steps */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-16">
          {/* Step 1 */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Upload className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm text-blue-600 mb-1">Step 1</div>
                  <h2 className="text-3xl">Upload Your File</h2>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Choose the product you want to print and upload your PDF, DOC, or design file.
                Our system supports all major file formats and provides instant preview.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Support for PDF, DOC, DOCX, JPG, PNG formats</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Instant file preview</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Secure file handling</span>
                </li>
              </ul>
            </div>
            <div className="order-1 lg:order-2 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-12 flex items-center justify-center">
              <Upload className="w-32 h-32 text-blue-600" />
            </div>
          </div>

          {/* Step 2 */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-12 flex items-center justify-center">
              <Settings className="w-32 h-32 text-purple-600" />
            </div>
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                  <Settings className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm text-purple-600 mb-1">Step 2</div>
                  <h2 className="text-3xl">Customize Your Order</h2>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Select your preferred paper type, size, binding options, quantity, and other
                specifications. Get instant price calculation as you customize.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Multiple paper options (70 GSM to 300 GSM)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Various binding types available</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Real-time price updates</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Step 3 */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <div className="text-sm text-green-600 mb-1">Step 3</div>
                  <h2 className="text-3xl">Review & Pay</h2>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Review your order details, preview the final product, and proceed to secure
                payment. We accept all major payment methods.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Secure payment gateway</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Multiple payment options (UPI, Cards, Net Banking)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Instant order confirmation</span>
                </li>
              </ul>
            </div>
            <div className="order-1 lg:order-2 bg-gradient-to-br from-green-50 to-teal-50 rounded-lg p-12 flex items-center justify-center">
              <CheckCircle className="w-32 h-32 text-green-600" />
            </div>
          </div>

          {/* Step 4 */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-12 flex items-center justify-center">
              <Truck className="w-32 h-32 text-orange-600" />
            </div>
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                  <Truck className="w-8 h-8 text-orange-600" />
                </div>
                <div>
                  <div className="text-sm text-orange-600 mb-1">Step 4</div>
                  <h2 className="text-3xl">Receive Your Prints</h2>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                We print, pack, and ship your order with care. Track your order in real-time
                and receive it at your doorstep.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Fast printing (24-48 hours)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Real-time order tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Secure packaging for safe delivery</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl mb-4">Ready to get started?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Upload your file now and experience the easiest way to get professional prints
          </p>
          <Link to="/all-products">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              Start Printing Now
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
