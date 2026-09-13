import { Tag, Gift, Users, Clock } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Link } from "react-router-dom";

export function OffersPage() {
  return (
    <div className="min-h-screen bg-white">
      <PageHeader
        title="Special Offers & Deals"
        subtitle="Save more on quality printing with our exclusive offers"
        breadcrumbs={[{ label: "Offers" }]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Current Offers */}
        <div className="mb-16">
          <h2 className="text-3xl mb-8 text-center">Current Offers</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Offer 1 */}
            <div className="border-2 border-blue-500 rounded-lg p-8 relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm">
                Limited Time
              </div>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Tag className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-2xl mb-2">First Order Discount</h3>
                  <p className="text-gray-600">Get 15% OFF on your first order</p>
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <p className="text-3xl text-blue-600 mb-2">15% OFF</p>
                <p className="text-sm text-gray-600">Use code: <strong className="text-gray-900">FIRST15</strong></p>
              </div>
              <ul className="text-sm text-gray-600 space-y-1 mb-4">
                <li>• Valid for new customers only</li>
                <li>• Minimum order value: ₹500</li>
                <li>• Valid till: December 31, 2025</li>
              </ul>
              <Link to="/all-products" className="block">
                <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Claim Offer
                </button>
              </Link>
            </div>

            {/* Offer 2 */}
            <div className="border-2 border-purple-500 rounded-lg p-8 relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-purple-500 text-white px-3 py-1 rounded-full text-sm">
                Popular
              </div>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-2xl mb-2">Bulk Order Savings</h3>
                  <p className="text-gray-600">Save up to 30% on bulk orders</p>
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 mb-4">
                <p className="text-3xl text-purple-600 mb-2">Up to 30% OFF</p>
                <p className="text-sm text-gray-600">Automatic discount on quantity</p>
              </div>
              <ul className="text-sm text-gray-600 space-y-1 mb-4">
                <li>• 100+ units: 10% OFF</li>
                <li>• 500+ units: 20% OFF</li>
                <li>• 1000+ units: 30% OFF</li>
              </ul>
              <Link to="/bulk-order" className="block">
                <button className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors">
                  Start Bulk Order
                </button>
              </Link>
            </div>

            {/* Offer 3 */}
            <div className="border-2 border-green-500 rounded-lg p-8 relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                Ongoing
              </div>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Gift className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-2xl mb-2">Free Shipping</h3>
                  <p className="text-gray-600">On orders above ₹2000</p>
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 mb-4">
                <p className="text-3xl text-green-600 mb-2">₹0 Shipping</p>
                <p className="text-sm text-gray-600">Save up to ₹200 on delivery</p>
              </div>
              <ul className="text-sm text-gray-600 space-y-1 mb-4">
                <li>• Applicable on orders above ₹2000</li>
                <li>• All serviceable pin codes</li>
                <li>• No code required</li>
              </ul>
              <Link to="/all-products" className="block">
                <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
                  Shop Now
                </button>
              </Link>
            </div>

            {/* Offer 4 */}
            <div className="border-2 border-orange-500 rounded-lg p-8 relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm">
                New
              </div>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-2xl mb-2">Student Special</h3>
                  <p className="text-gray-600">Exclusive discount for students</p>
                </div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 mb-4">
                <p className="text-3xl text-orange-600 mb-2">20% OFF</p>
                <p className="text-sm text-gray-600">Use code: <strong className="text-gray-900">STUDENT20</strong></p>
              </div>
              <ul className="text-sm text-gray-600 space-y-1 mb-4">
                <li>• Valid student ID required</li>
                <li>• Thesis, dissertations, assignments</li>
                <li>• Valid throughout the year</li>
              </ul>
              <Link to="/all-products" className="block">
                <button className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-colors">
                  Verify & Claim
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Seasonal Offers */}
        <div className="mb-16">
          <h2 className="text-3xl mb-8 text-center">Upcoming Seasonal Offers</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-pink-50 to-red-50 rounded-lg p-6 text-center">
              <h3 className="text-xl mb-2">New Year Sale</h3>
              <p className="text-gray-600 mb-3">Coming Soon in January</p>
              <p className="text-2xl text-red-600 mb-2">Flat 25% OFF</p>
              <p className="text-sm text-gray-500">On all products</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg p-6 text-center">
              <h3 className="text-xl mb-2">Festival Bonanza</h3>
              <p className="text-gray-600 mb-3">During festive seasons</p>
              <p className="text-2xl text-orange-600 mb-2">Extra 10% OFF</p>
              <p className="text-sm text-gray-500">On bulk orders</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 text-center">
              <h3 className="text-xl mb-2">Anniversary Sale</h3>
              <p className="text-gray-600 mb-3">Celebrating our journey</p>
              <p className="text-2xl text-blue-600 mb-2">Up to 40% OFF</p>
              <p className="text-sm text-gray-500">Special combo deals</p>
            </div>
          </div>
        </div>


        {/* How to Redeem */}
        <div>
          <h2 className="text-3xl mb-8 text-center">How to Redeem Offers</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-blue-600">1</span>
              </div>
              <h3 className="mb-2">Choose Product</h3>
              <p className="text-sm text-gray-600">
                Select and customize your printing product
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-purple-600">2</span>
              </div>
              <h3 className="mb-2">Add to Cart</h3>
              <p className="text-sm text-gray-600">
                Review your order and proceed to checkout
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-green-600">3</span>
              </div>
              <h3 className="mb-2">Apply Code</h3>
              <p className="text-sm text-gray-600">
                Enter promo code at checkout page
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-orange-600">4</span>
              </div>
              <h3 className="mb-2">Save Money</h3>
              <p className="text-sm text-gray-600">
                See instant discount and complete payment
              </p>
            </div>
          </div>
        </div>

        {/* Terms */}
        <div className="mt-12 bg-gray-50 rounded-lg p-6">
          <h3 className="mb-4">Terms & Conditions</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• Offers cannot be combined unless explicitly stated</li>
            <li>• Discount codes are case-sensitive</li>
            <li>• Offers valid while supplies last or until expiration date</li>
            <li>• Sanjari prints reserves the right to modify or cancel offers</li>
            <li>• Some products may be excluded from certain promotions</li>
            <li>• Bulk discount applies automatically based on quantity</li>
            <li>• For corporate/custom offers, please contact our sales team</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
