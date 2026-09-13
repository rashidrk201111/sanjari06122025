import { Briefcase, MapPin, Clock, DollarSign } from "lucide-react";
import { Button } from "../components/ui/button";
import { PageHeader } from "../components/PageHeader";

export function CareerPage() {
  const openings = [
    {
      title: "Graphic Designer",
      department: "Design",
      location: "Design City, India",
      type: "Full-time",
      experience: "2-4 years",
      description: "Create stunning designs for our clients' printing needs. Experience with Adobe Creative Suite required.",
    },
    {
      title: "Print Production Manager",
      department: "Operations",
      location: "Design City, India",
      type: "Full-time",
      experience: "5+ years",
      description: "Oversee printing operations, quality control, and ensure timely delivery of all orders.",
    },
    {
      title: "Customer Support Executive",
      department: "Support",
      location: "Design City, India",
      type: "Full-time",
      experience: "1-3 years",
      description: "Assist customers with inquiries, orders, and provide excellent support via phone, email, and chat.",
    },
    {
      title: "Sales Executive",
      department: "Sales",
      location: "Design City, India",
      type: "Full-time",
      experience: "2-5 years",
      description: "Drive sales growth, acquire new clients, and maintain relationships with existing customers.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <PageHeader
        title="Join Our Team"
        subtitle="Build your career with Sanjari prints and help us deliver excellence"
        breadcrumbs={[{ label: "Careers" }]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Why Work With Us */}
        <div className="mb-16">
          <h2 className="text-3xl mb-8 text-center">Why Work With Us?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <h3 className="text-xl mb-3">Growth Opportunities</h3>
              <p className="text-gray-600">
                Continuous learning and career advancement with skill development programs and mentorship.
              </p>
            </div>
            <div className="text-center p-6 bg-purple-50 rounded-lg">
              <h3 className="text-xl mb-3">Competitive Benefits</h3>
              <p className="text-gray-600">
                Attractive salary packages, health insurance, and performance bonuses to reward your contributions.
              </p>
            </div>
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <h3 className="text-xl mb-3">Great Culture</h3>
              <p className="text-gray-600">
                Collaborative work environment, flexible hours, and a team that values innovation and creativity.
              </p>
            </div>
          </div>
        </div>

        {/* Current Openings */}
        <div className="mb-16">
          <h2 className="text-3xl mb-8">Current Openings</h2>
          <div className="space-y-6">
            {openings.map((job, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-2xl mb-2">{job.title}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        {job.department}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {job.type}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {job.experience} experience
                      </span>
                    </div>
                  </div>
                  <a
                    href={`mailto:sanjariprint@gmail.com?subject=${encodeURIComponent(`Application for ${job.title} - Sanjari Prints`)}`}
                    className="lg:flex-shrink-0"
                  >
                    <Button className="bg-blue-600 hover:bg-blue-700 w-full lg:w-auto">
                      Apply Now
                    </Button>
                  </a>
                </div>
                <p className="text-gray-600">{job.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Don't See a Fit? */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-12 text-center">
          <h2 className="text-3xl mb-4">Don't See the Right Position?</h2>
          <p className="text-xl mb-6 max-w-2xl mx-auto">
            We're always looking for talented individuals. Send us your resume and we'll keep you in mind for future opportunities.
          </p>
          <a href="mailto:sanjariprint@gmail.com?subject=Job Application - Sanjari Prints">
            <Button className="bg-white text-blue-600 hover:bg-blue-50">
              Submit Your Resume
            </Button>
          </a>
        </div>

        {/* Our Values */}
        <div className="mt-16">
          <h2 className="text-3xl mb-8 text-center">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 border border-gray-200 rounded-lg">
              <h3 className="text-xl mb-3 text-blue-600">Excellence</h3>
              <p className="text-gray-600">
                We strive for excellence in everything we do, from customer service to print quality.
              </p>
            </div>
            <div className="p-6 border border-gray-200 rounded-lg">
              <h3 className="text-xl mb-3 text-purple-600">Innovation</h3>
              <p className="text-gray-600">
                We embrace new technologies and creative solutions to serve our customers better.
              </p>
            </div>
            <div className="p-6 border border-gray-200 rounded-lg">
              <h3 className="text-xl mb-3 text-green-600">Integrity</h3>
              <p className="text-gray-600">
                We conduct business with honesty, transparency, and ethical practices.
              </p>
            </div>
            <div className="p-6 border border-gray-200 rounded-lg">
              <h3 className="text-xl mb-3 text-orange-600">Teamwork</h3>
              <p className="text-gray-600">
                We believe in collaboration and supporting each other to achieve common goals.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
