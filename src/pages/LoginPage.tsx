import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import { Checkbox } from "../components/ui/checkbox";
import { Card } from "../components/ui/card";
import { Eye, EyeOff, Mail, Lock, Sparkles } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContextSupabase";
import authPoster from "../assets/hero/ai-auth-poster.png";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, socialLogin } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Please enter a valid email address");
      setIsLoading(false);
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }
    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        toast.success("Welcome back!");
        const from = (location.state as any)?.from;
        navigate(from || "/dashboard");
      } else {
        toast.error(result.error || "Invalid credentials");
      }
    } catch (error) {
      toast.error("An error occurred during login");
    }
    setIsLoading(false);
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    try {
      toast.info(`Logging in with ${provider}...`);
      const result = await socialLogin(provider);
      if (!result.success) toast.error(result.error || `Failed to login with ${provider}`);
    } catch (error) {
      toast.error('An error occurred during login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-5xl w-full">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Form */}
          <Card className="p-8 rounded-2xl border-gray-100 shadow-sm">
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome Back</h1>
                <p className="text-gray-500">Sign in to continue to your account</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input type="email" placeholder="your@email.com" className="pl-10 h-12" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input type={showPassword ? "text" : "password"} placeholder="Enter password" className="pl-10 pr-10 h-12" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="remember" checked={rememberMe} onCheckedChange={(checked) => setRememberMe(checked as boolean)} />
                    <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">Remember me</label>
                  </div>
                  <Link to="/forgot-password" className="text-sm text-purple-600 hover:text-purple-700 font-medium">Forgot Password?</Link>
                </div>

                <Button type="submit" className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-medium" disabled={isLoading}>
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </form>

              <div className="relative">
                <Separator />
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-sm text-gray-400">or continue with</span>
              </div>

              <Button type="button" variant="outline" className="w-full h-12 border-gray-200 hover:bg-gray-50" onClick={() => handleSocialLogin("google")}>
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </Button>

              <div className="text-center">
                <p className="text-gray-600">
                  Don't have an account?{" "}
                  <Link to="/signup" className="text-purple-600 hover:text-purple-700 font-semibold">Sign Up</Link>
                </p>
              </div>
            </div>
          </Card>

          {/* Poster Panel */}
          <div className="hidden md:flex min-h-[620px] flex-col justify-end rounded-2xl border border-purple-100 bg-white p-4 shadow-sm">
            <div className="relative h-full min-h-[560px] overflow-hidden rounded-xl bg-gray-950">
              <img src={authPoster} alt="Sanjari Prints premium printing poster" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/25 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                <Sparkles className="w-8 h-8" />
              </div>
                <h2 className="mb-3 text-3xl font-extrabold">Welcome to Sanjari Prints</h2>
                <p className="mb-6 text-sm font-medium text-white/85">Your trusted partner for professional printing, fast delivery, and secure checkout.</p>

              <div className="space-y-4">
                {[
                  "Track your orders in real-time",
                  "Save your details for faster checkout",
                  "Get exclusive offers and deals",
                  "Access your order history"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    </div>
                    <p className="text-sm">{item}</p>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex gap-2">
                <div className="w-12 h-1 bg-white/40 rounded-full" />
                <div className="w-12 h-1 bg-white/60 rounded-full" />
                <div className="w-12 h-1 bg-white rounded-full" />
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
