import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useAdmin } from "../context/AdminContext";
import { useNavigate } from "react-router-dom";

export function CTA() {
  const { pageContent } = useAdmin();
  const cta = pageContent.ctaSection;
  const navigate = useNavigate();

  const handleNavigate = (link: string) => {
    if (!link) return;
    if (link.startsWith("http://") || link.startsWith("https://") || link.startsWith("tel:") || link.startsWith("mailto:")) {
      window.location.href = link;
      return;
    }
    const cleanPath = link.replace(/^(\/#|#)/, "");
    navigate(cleanPath || "/");
  };

  return (
    <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-600 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1630283017802-785b7aff9aac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjB3b3Jrc3BhY2V8ZW58MXx8fHwxNzYwNzY3NDM0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Office workspace"
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <h2 className="text-3xl lg:text-5xl mb-6">
          {cta.title}
        </h2>
        <p className="text-xl mb-8 text-blue-100">
          {cta.subtitle}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            className="bg-white text-blue-600 hover:bg-gray-100"
            onClick={() => handleNavigate(cta.primaryLink)}
          >
            {cta.primaryText}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="border-white text-white hover:bg-white/10"
            onClick={() => handleNavigate(cta.secondaryLink)}
          >
            {cta.secondaryText}
          </Button>
        </div>
      </div>
    </section>
  );
}
