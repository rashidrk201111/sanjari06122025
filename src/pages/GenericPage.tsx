import { PageHeader } from "../components/PageHeader";

interface GenericPageProps {
  title: string;
  subtitle?: string;
  content: string;
}

export function GenericPage({ title, subtitle, content }: GenericPageProps) {
  return (
    <div className="min-h-screen bg-white">
      <PageHeader
        title={title}
        subtitle={subtitle}
        breadcrumbs={[{ label: title }]}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600">{content}</p>
        </div>
      </div>
    </div>
  );
}
