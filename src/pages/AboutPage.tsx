import { useAdmin } from "../context/AdminContext";
import { PageHeader } from "../components/PageHeader";

export function AboutPage() {
  const { pageContent, siteSettings } = useAdmin();
  const { aboutPage } = pageContent;

  return (
    <div className="min-h-screen bg-white">
      <PageHeader
        title={aboutPage.title || `About ${siteSettings.siteName}`}
        subtitle={aboutPage.subtitle || "Your trusted partner for premium printing solutions"}
        breadcrumbs={[{ label: "About Us" }]}
      />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl mb-6">Our Story</h2>
            <p className="text-gray-600 mb-4 whitespace-pre-line">
              {aboutPage.description || 
                `${siteSettings.siteName} was founded with a simple mission: to provide high-quality printing services that businesses and individuals can rely on. What started as a small print shop has grown into a full-service printing company serving thousands of customers across India.

We believe that great printing should be accessible to everyone. That's why we've invested in state-of-the-art technology and built a team of experienced professionals who are passionate about delivering exceptional results.`}
            </p>
          </div>
          <div>
            <h2 className="text-3xl mb-6">Our Mission</h2>
            <p className="text-gray-600 mb-4 whitespace-pre-line">
              {aboutPage.mission || 
                `To revolutionize the printing industry by combining cutting-edge technology with traditional craftsmanship, ensuring every project meets the highest standards of quality and customer satisfaction.

We're committed to sustainability, using eco-friendly materials and processes wherever possible, and to providing our customers with competitive pricing without compromising on quality.`}
            </p>
            {aboutPage.vision && (
              <>
                <h2 className="text-3xl mb-6 mt-8">Our Vision</h2>
                <p className="text-gray-600 mb-4 whitespace-pre-line">{aboutPage.vision}</p>
              </>
            )}
          </div>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-3xl mb-8 text-center">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl mb-3 text-blue-600">Quality First</h3>
              <p className="text-gray-600">
                We never compromise on quality. Every print job is carefully inspected to ensure
                it meets our rigorous standards.
              </p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl mb-3 text-blue-600">Customer Focus</h3>
              <p className="text-gray-600">
                Your satisfaction is our priority. We work closely with you to understand your
                needs and deliver results that exceed expectations.
              </p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl mb-3 text-blue-600">Innovation</h3>
              <p className="text-gray-600">
                We continuously invest in new technologies and techniques to provide you with
                the best printing solutions available.
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-blue-600 text-white rounded-lg p-12">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl mb-2">15+</div>
              <div className="text-blue-100">Years Experience</div>
            </div>
            <div>
              <div className="text-4xl mb-2">50,000+</div>
              <div className="text-blue-100">Happy Customers</div>
            </div>
            <div>
              <div className="text-4xl mb-2">1M+</div>
              <div className="text-blue-100">Prints Delivered</div>
            </div>
            <div>
              <div className="text-4xl mb-2">24/7</div>
              <div className="text-blue-100">Customer Support</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
