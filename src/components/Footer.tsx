import { Facebook, Twitter, Linkedin, Phone, MessageCircle, Instagram } from "lucide-react";
import { Link } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";

export function Footer() {
  const { siteSettings } = useAdmin();

  return (
    <footer className="bg-gray-100 text-gray-700 border-t border-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Site Name */}
          <div>
            <h3 className="mb-4 text-gray-900">{siteSettings.siteName}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                  <span className="text-red-500">›</span> About Us
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                  <span className="text-red-500">›</span> How it works?
                </Link>
              </li>
              <li>
                <Link to="/offers" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                  <span className="text-red-500">›</span> Offers
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                  <span className="text-red-500">›</span> Contact
                </Link>
              </li>
              <li>
                <Link to="/sitemap" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                  <span className="text-red-500">›</span> Sitemap
                </Link>
              </li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="mb-4 text-gray-900">Help</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/order-by-email" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                  <span className="text-red-500">›</span> Order By Email
                </Link>
              </li>
              <li>
                <Link to="/press" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                  <span className="text-red-500">›</span> Press
                </Link>
              </li>
              <li>
                <Link to="/why-choose" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                  <span className="text-red-500">›</span> Why Choose Sanjari prints?
                </Link>
              </li>
              <li>
                <Link to="/partner" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                  <span className="text-red-500">›</span> Partner with Us!
                </Link>
              </li>
              <li>
                <Link to="/print-your-file" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                  <span className="text-red-500">›</span> Print your File
                </Link>
              </li>
              <li>
                <Link to="/printonweb-service" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                  <span className="text-red-500">›</span> Printonweb Service
                </Link>
              </li>
              <li>
                <Link to="/faqs" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                  <span className="text-red-500">›</span> FAQs
                </Link>
              </li>
              <li>
                <Link to="/payment-options" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                  <span className="text-red-500">›</span> Payment Options
                </Link>
              </li>
              <li>
                <Link to="/career" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                  <span className="text-red-500">›</span> Career
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="mb-4 text-gray-900">Policies</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/terms" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                  <span className="text-red-500">›</span> Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/shipping-policy" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                  <span className="text-red-500">›</span> Shipping Policy
                </Link>
              </li>
              <li>
                <Link to="/cancellation-policy" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                  <span className="text-red-500">›</span> Cancellation Policy
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                  <span className="text-red-500">›</span> Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/payment-terms" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                  <span className="text-red-500">›</span> Payment Terms
                </Link>
              </li>
            </ul>
          </div>

          {/* Stay Connected */}
          <div>
            <h3 className="mb-4 text-gray-900">Stay Connected<br />With Us</h3>
            <div className="flex gap-3 mb-4">
              {siteSettings.socialMedia.facebook && (
                <a href={siteSettings.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {siteSettings.socialMedia.twitter && (
                <a href={siteSettings.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
              )}
              {siteSettings.socialMedia.instagram && (
                <a href={siteSettings.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {siteSettings.socialMedia.linkedin && (
                <a href={siteSettings.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
              )}
            </div>
            <div className="text-sm space-y-2">
              <h4 className="text-gray-900">Contact</h4>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>{siteSettings.phone}</span>
              </p>
              {siteSettings.phone2 && (
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>{siteSettings.phone2}</span>
                </p>
              )}
              <p className="flex items-center gap-2 text-xs">
                <MessageCircle className="h-4 w-4" />
                <span>Call & Whatsapp</span>
              </p>
              <p className="text-xs">11:00AM to 8:00PM<br />MON to SAT</p>
            </div>
          </div>

          {/* We Print With Love */}
          <div>
            <h3 className="mb-4 text-gray-900">We Print With <span className="text-red-500">❤️</span><br />in India</h3>
            
            <div className="mb-4">
              <h4 className="text-sm mb-2 text-gray-900">Shipping Partner</h4>
              <div className="flex flex-wrap gap-3 items-center">
                <div className="bg-white px-3 py-2 rounded border border-gray-300">
                  <span className="text-blue-600">DTDC</span>
                </div>
                <div className="bg-white px-3 py-2 rounded border border-gray-300">
                  <span className="text-purple-600">Shiprocket</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm mb-2 text-gray-900">Payment Partner</h4>
              <div className="bg-white px-3 py-2 rounded border border-gray-300 mb-2">
                <span className="text-blue-600">Razorpay</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                <div className="bg-white px-2 py-1 rounded border border-gray-300">
                  <span className="text-xs">VISA</span>
                </div>
                <div className="bg-white px-2 py-1 rounded border border-gray-300">
                  <span className="text-xs">Mastercard</span>
                </div>
                <div className="bg-white px-2 py-1 rounded border border-gray-300">
                  <span className="text-xs">Rupay</span>
                </div>
                <div className="bg-white px-2 py-1 rounded border border-gray-300">
                  <span className="text-xs">UPI</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-300 pt-6 text-sm text-center text-gray-600">
          <p>&copy; 2025 {siteSettings.siteName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
