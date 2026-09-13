import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card } from "../components/ui/card";
import { Mail, ArrowLeft } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContextSupabase";

export function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    try {
      const result = await resetPassword(email);
      if (result.success) {
        setIsEmailSent(true);
        toast.success("Password reset link sent to your email!");
      } else {
        toast.error(result.error || "Failed to send reset email");
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <Card className="p-8 shadow-xl">
          <div className="space-y-6">
            {/* Back Button */}
            <Link
              to="/login"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Sign In
            </Link>

            {!isEmailSent ? (
              <>
                {/* Header */}
                <div>
                  <h1 className="text-3xl text-gray-900 mb-2">Forgot Password?</h1>
                  <p className="text-gray-600">
                    Enter your email address and we'll send you a link to reset your password
                  </p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-4">
                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700">
                      Email Address
                    </Label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <Mail className="w-5 h-5" />
                      </div>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10 h-12"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full h-12 bg-blue-900 hover:bg-blue-800 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending..." : "Send Reset Link"}
                  </Button>
                </form>
              </>
            ) : (
              <>
                {/* Success Message */}
                <div className="text-center space-y-4 py-8">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <svg
                      className="w-10 h-10 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>

                  <div>
                    <h1 className="text-3xl text-gray-900 mb-2">Check Your Email</h1>
                    <p className="text-gray-600">
                      We've sent a password reset link to
                    </p>
                    <p className="text-blue-900 mt-1">{email}</p>
                  </div>

                  <div className="space-y-3 pt-4">
                    <p className="text-sm text-gray-600">
                      Didn't receive the email? Check your spam folder or
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-12"
                      onClick={() => {
                        setIsEmailSent(false);
                        setEmail("");
                      }}
                    >
                      Try Another Email
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* Additional Help */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                <strong>Need help?</strong> Contact our support team at{" "}
                <a
                  href="mailto:sanjariprint@gmail.com"
                  className="text-blue-600 hover:underline"
                >
                  sanjariprint@gmail.com
                </a>{" "}
                or call us at{" "}
                <a href="tel:+917350001266" className="text-blue-600 hover:underline">
                  +91 7350001266
                </a>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
