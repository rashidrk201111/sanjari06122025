import { useState, useMemo } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import { Checkbox } from "../components/ui/checkbox";
import { Card } from "../components/ui/card";
import { Eye, EyeOff, Mail, Lock, User, Phone, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContextSupabase";
import authPoster from "../assets/hero/ai-auth-poster.png";

export function SignupPage() {
  const navigate = useNavigate();
  const { signup, socialLogin } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [touched, setTouched] = useState({ fullName: false, email: false, phone: false, password: false, confirmPassword: false });
  const [formData, setFormData] = useState({ fullName: "", email: "", phone: "", password: "", confirmPassword: "" });

  const validation = useMemo(() => ({
    fullName: formData.fullName.trim().length >= 2 && /^[a-zA-Z\s]+$/.test(formData.fullName.trim()),
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email),
    phone: /^[0-9]{10}$/.test(formData.phone) && ['6', '7', '8', '9'].includes(formData.phone[0]),
    password: formData.password.length >= 8 && /(?=.*[a-z])/.test(formData.password) && /(?=.*[A-Z])/.test(formData.password) && /(?=.*[0-9])/.test(formData.password),
    confirmPassword: formData.confirmPassword === formData.password && formData.confirmPassword.length > 0,
  }), [formData]);

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]+/)) strength++;
    if (password.match(/[A-Z]+/)) strength++;
    if (password.match(/[0-9]+/)) strength++;
    if (password.match(/[$@#&!]+/)) strength++;
    if (strength <= 1) return { strength: 20, label: "Weak", color: "bg-red-500" };
    if (strength <= 2) return { strength: 40, label: "Fair", color: "bg-orange-500" };
    if (strength <= 3) return { strength: 60, label: "Good", color: "bg-yellow-500" };
    if (strength <= 4) return { strength: 80, label: "Strong", color: "bg-blue-500" };
    return { strength: 100, label: "Very Strong", color: "bg-green-500" };
  };

  const passwordStrength = formData.password ? getPasswordStrength(formData.password) : null;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone || !formData.password || !formData.confirmPassword) {
      toast.error("Please fill in all fields");
      setIsLoading(false);
      return;
    }
    if (!validation.fullName || !validation.email || !validation.phone || !validation.password || !validation.confirmPassword) {
      toast.error("Please fix the errors above");
      setIsLoading(false);
      return;
    }
    if (!acceptTerms) {
      toast.error("Please accept the terms and conditions");
      setIsLoading(false);
      return;
    }
    try {
      const result = await signup(formData.email, formData.password, formData.fullName, formData.phone);
      if (result.success) {
        toast.success("Account created! Please check your email to verify.");
        setTimeout(() => navigate("/verify-email", { state: { email: formData.email } }), 1500);
      } else {
        toast.error(result.error || "Failed to create account");
      }
    } catch (error) {
      toast.error("An error occurred during signup");
    }
    setIsLoading(false);
  };

  const handleSocialSignup = async (provider: 'google' | 'facebook') => {
    try {
      toast.info(`Signing up with ${provider}...`);
      const result = await socialLogin(provider);
      if (!result.success) toast.error(result.error || `Failed to sign up with ${provider}`);
    } catch (error) {
      toast.error('An error occurred during signup');
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
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Create Account</h1>
                <p className="text-gray-500">Join us to get started with printing services</p>
              </div>

              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input placeholder="Enter your full name" className={`pl-10 h-12 ${touched.fullName && !validation.fullName ? "border-red-400" : touched.fullName && validation.fullName ? "border-green-400" : ""}`} value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} onBlur={() => setTouched({ ...touched, fullName: true })} />
                    {touched.fullName && <div className="absolute right-3 top-1/2 -translate-y-1/2">{validation.fullName ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}</div>}
                  </div>
                  {touched.fullName && !validation.fullName && <p className="text-xs text-red-500">At least 2 characters, letters only</p>}
                </div>

                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input type="email" placeholder="your@email.com" className={`pl-10 h-12 ${touched.email && !validation.email ? "border-red-400" : touched.email && validation.email ? "border-green-400" : ""}`} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} onBlur={() => setTouched({ ...touched, email: true })} />
                    {touched.email && <div className="absolute right-3 top-1/2 -translate-y-1/2">{validation.email ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}</div>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Mobile Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input type="tel" placeholder="10-digit number" maxLength={10} className={`pl-10 h-12 ${touched.phone && !validation.phone ? "border-red-400" : touched.phone && validation.phone ? "border-green-400" : ""}`} value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })} onBlur={() => setTouched({ ...touched, phone: true })} />
                    {touched.phone && <div className="absolute right-3 top-1/2 -translate-y-1/2">{validation.phone ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}</div>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input type={showPassword ? "text" : "password"} placeholder="Create a strong password" className={`pl-10 pr-10 h-12`} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} onBlur={() => setTouched({ ...touched, password: true })} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {passwordStrength && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs"><span className="text-gray-500">Strength:</span><span className={`font-medium ${passwordStrength.color.replace('bg-', 'text-')}`}>{passwordStrength.label}</span></div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden"><div className={`h-full transition-all ${passwordStrength.color}`} style={{ width: `${passwordStrength.strength}%` }} /></div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input type={showConfirmPassword ? "text" : "password"} placeholder="Re-enter password" className={`pl-10 pr-10 h-12`} value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} onBlur={() => setTouched({ ...touched, confirmPassword: true })} />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-start space-x-2 pt-2">
                  <Checkbox id="terms" checked={acceptTerms} onCheckedChange={(checked) => setAcceptTerms(checked as boolean)} className="mt-1" />
                  <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer leading-tight">I agree to the <Link to="/terms" className="text-purple-600 hover:underline">Terms</Link> and <Link to="/privacy-policy" className="text-purple-600 hover:underline">Privacy Policy</Link></label>
                </div>

                <Button type="submit" className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-medium" disabled={isLoading}>
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>

              <div className="relative">
                <Separator />
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-sm text-gray-400">or sign up with</span>
              </div>

              <Button type="button" variant="outline" className="w-full h-12 border-gray-200 hover:bg-gray-50" onClick={() => handleSocialSignup("google")}>
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </Button>

              <div className="text-center">
                <p className="text-gray-600">Already have an account? <Link to="/login" className="text-purple-600 hover:text-purple-700 font-semibold">Sign In</Link></p>
              </div>
            </div>
          </Card>

          {/* Poster Panel */}
          <div className="hidden md:flex min-h-[760px] flex-col justify-end rounded-2xl border border-purple-100 bg-white p-4 shadow-sm">
            <div className="relative h-full min-h-[700px] overflow-hidden rounded-xl bg-gray-950">
              <img src={authPoster} alt="Sanjari Prints premium printing poster" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/25 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                <Sparkles className="w-8 h-8" />
              </div>
                <h2 className="mb-3 text-3xl font-extrabold">Join Sanjari Prints</h2>
                <p className="mb-6 text-sm font-medium text-white/85">Create your account for faster checkout, saved details, order tracking, and exclusive print offers.</p>

              <div className="space-y-4">
                {["Track your orders in real-time", "Faster checkout with saved details", "Get exclusive offers and deals", "Access your order history anytime"].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg></div>
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
