import { useNavigate } from "react-router-dom";
import { Card } from "./ui/card";
import { ArrowUpRight, CreditCard, FileText, Image, Package, Tag, Star, Printer, BookOpen, Layers } from "lucide-react";
import { useAdmin } from "../context/AdminContext";

const iconMap: Record<string, React.ElementType> = {
  CreditCard,
  FileText,
  Image,
  Package,
  Tag,
  Star,
  Printer,
  BookOpen,
  Layers,
  ArrowUpRight,
};

const iconStyleMap: Record<string, string> = {
  CreditCard: "bg-blue-100 text-blue-700",
  FileText: "bg-indigo-100 text-indigo-700",
  Image: "bg-emerald-100 text-emerald-700",
  Package: "bg-amber-100 text-amber-700",
  Tag: "bg-rose-100 text-rose-700",
  Star: "bg-purple-100 text-purple-700",
  Printer: "bg-cyan-100 text-cyan-700",
  BookOpen: "bg-teal-100 text-teal-700",
  Layers: "bg-orange-100 text-orange-700",
};

export function Services() {
  const navigate = useNavigate();
  const { pageContent } = useAdmin();
  const servicesContent = pageContent.servicesSection;
  const serviceCards = pageContent.serviceCards;

  const handleCardClick = () => {
    navigate("/all-products");
  };

  return (
    <section id="services" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700 mb-5">
            {servicesContent.badge}
          </span>
          <h2 className="text-3xl lg:text-5xl mb-4 text-slate-900 font-semibold">{servicesContent.title}</h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            {servicesContent.subtitle}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {serviceCards.map((service) => {
            const Icon = iconMap[service.icon] || Package;
            const iconStyle = iconStyleMap[service.icon] || "bg-blue-100 text-blue-700";
            return (
              <div 
                key={service.id} 
                className="flex flex-col cursor-pointer group"
                onClick={handleCardClick}
              >
                <Card className="h-full p-6 border border-slate-200 hover:border-blue-200 hover:shadow-md transition-all duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`${iconStyle} w-12 h-12 rounded-lg flex items-center justify-center`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                  </div>

                  <span className="inline-block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2.5">
                    {service.tag}
                  </span>

                  <h3 className="text-xl font-semibold mb-2 text-slate-900 leading-snug">{service.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{service.description}</p>

                  <div className="mt-5 pt-4 border-t border-slate-100 text-sm text-blue-700 font-medium">
                    Explore service
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
