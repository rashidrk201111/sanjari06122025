import { Facebook, Twitter, Linkedin, Phone, MessageCircle, Instagram, Mail, MapPin, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";

export function Footer() {
  const { siteSettings } = useAdmin();

  return (
    <footer className="bg-white border-t border-gray-200">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)' }}>
                <span className="text-white font-bold text-lg">{siteSettings.siteName.charAt(0).toUpperCase()}</span>
              </div>
              <span className="text-xl font-bold text-gray-900">{siteSettings.siteName}</span>
            </div>
            <p className="text-sm text-gray-500 mb-4 leading-relaxed">
              Premium quality printing services delivered to your doorstep. From business cards to banners, we've got you covered.
            </p>
            <div className="flex gap-3">
              {siteSettings.socialMedia.facebook && (
                <a href={siteSettings.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-purple-100 transition-colors">
                  <Facebook className="w-4 h-4 text-gray-600" />
                </a>
              )}
              {siteSettings.socialMedia.twitter && (
                <a href={siteSettings.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-purple-100 transition-colors">
                  <Twitter className="w-4 h-4 text-gray-600" />
                </a>
              )}
              {siteSettings.socialMedia.instagram && (
                <a href={siteSettings.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-purple-100 transition-colors">
                  <Instagram className="w-4 h-4 text-gray-600" />
                </a>
              )}
              {siteSettings.socialMedia.linkedin && (
                <a href={siteSettings.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-purple-100 transition-colors">
                  <Linkedin className="w-4 h-4 text-gray-600" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">Company</h3>
            <ul className="space-y-3">
              {[
                { label: "About Us", href: "/about" },
                { label: "How It Works", href: "/how-it-works" },
                { label: "Offers", href: "/offers" },
                { label: "Contact", href: "/contact" },
                { label: "Sitemap", href: "/sitemap" },
                { label: "Careers", href: "/career" },
              ].map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-gray-500 hover:text-purple-600 transition-colors flex items-center gap-1 group">
                    <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help & Support */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">Help</h3>
            <ul className="space-y-3">
              {[
                { label: "FAQs", href: "/faqs" },
                { label: "Order By Email", href: "/order-by-email" },
                { label: "Print Your File", href: "/print-your-file" },
                { label: "Printonweb Service", href: "/printonweb-service" },
                { label: "Payment Options", href: "/payment-options" },
                { label: "Why Choose Us", href: "/why-choose" },
              ].map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-gray-500 hover:text-purple-600 transition-colors flex items-center gap-1 group">
                    <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">Policies</h3>
            <ul className="space-y-3">
              {[
                { label: "Terms & Conditions", href: "/terms" },
                { label: "Privacy Policy", href: "/privacy-policy" },
                { label: "Shipping Policy", href: "/shipping-policy" },
                { label: "Cancellation Policy", href: "/cancellation-policy" },
                { label: "Payment Terms", href: "/payment-terms" },
              ].map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-gray-500 hover:text-purple-600 transition-colors flex items-center gap-1 group">
                    <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">Contact Us</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-900 font-medium">{siteSettings.phone}</p>
                  {siteSettings.phone2 && <p className="text-sm text-gray-500">{siteSettings.phone2}</p>}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Call & WhatsApp</p>
                  <p className="text-xs text-gray-400">11:00 AM - 8:00 PM, Mon-Sat</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-900">{siteSettings.email}</p>
                </div>
              </div>
              {siteSettings.address && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-purple-600" />
                  </div>
                  <p className="text-sm text-gray-500">{siteSettings.address}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Partners Section */}
        <div className="mt-10 pt-8 border-t border-gray-100">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Shipping Partners</p>
                <div className="flex gap-3">
                  <div className="px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-xs font-medium text-gray-700">DTDC</span>
                  </div>
                  <div className="px-3 py-1.5 bg-purple-50 rounded-lg border border-purple-200">
                    <span className="text-xs font-medium text-purple-600">Shiprocket</span>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Payment Methods</p>
                <div className="flex gap-2 flex-wrap">
                  {['Visa', 'Mastercard', 'RuPay', 'UPI'].map(method => (
                    <div key={method} className="px-2 py-1 bg-gray-50 rounded border border-gray-200">
                      <span className="text-xs text-gray-600">{method}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Powered by</span>
              <span className="text-xs font-medium text-purple-600">Razorpay</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2">
            <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} {siteSettings.siteName}. All rights reserved.</p>
            <p className="text-sm text-gray-400">Made with <span className="text-red-400">♥</span> in India</p>
          </div>
        </div>
      </div>
    </footer>
  );
}