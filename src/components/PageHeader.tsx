import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  /** Optional icon/badge rendered to the left of the title */
  icon?: React.ReactNode;
}

/**
 * PageHeader — shared section header that matches the navbar's design language.
 * Replaces the old `bg-gradient-to-r from-blue-600 to-purple-600` hero banners.
 */
export function PageHeader({ title, subtitle, breadcrumbs, icon }: PageHeaderProps) {
  return (
    <div
      style={{
        background: "#ffffff",
        borderBottom: "1px solid #e5e7eb",
      }}
    >
      {/* Red accent top stripe */}
      <div style={{ height: "3px", background: "linear-gradient(90deg, var(--brand) 0%, #f39c12 100%)" }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav
            className="flex items-center gap-1 mb-3"
            aria-label="Breadcrumb"
            style={{ fontSize: "13px", color: "#6b7280" }}
          >
            <Link
              to="/"
              className="flex items-center gap-1 hover:text-orange-500 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1">
                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                {crumb.href ? (
                  <Link
                    to={crumb.href}
                    className="hover:text-orange-500 transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span style={{ color: "#111827", fontWeight: 500 }}>{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}

        {/* Title row */}
        <div className="flex items-center gap-3">
          {icon && (
            <div
              className="flex items-center justify-center rounded-lg flex-shrink-0"
              style={{
                width: "42px",
                height: "42px",
                background: "rgba(232,65,24,0.08)",
                border: "1px solid rgba(232,65,24,0.15)",
              }}
            >
              {icon}
            </div>
          )}
          <div>
            <h1
              style={{
                fontSize: "clamp(22px, 3vw, 30px)",
                fontWeight: 700,
                color: "#111827",
                lineHeight: 1.2,
                letterSpacing: "-0.5px",
              }}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                style={{
                  fontSize: "14px",
                  color: "#6b7280",
                  marginTop: "4px",
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
