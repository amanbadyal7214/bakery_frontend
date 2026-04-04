import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, User, Mail, MapPin, Lock, CheckCircle2, Phone } from "lucide-react";
import { useDispatch } from "react-redux";
import ReCAPTCHA from "react-google-recaptcha";
import { setCredentials } from "../store/slices/authSlice";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSendOtp = async () => {
    if (!email) {
      alert("Please enter your email first");
      return;
    }
    setSendingOtp(true);
    try {
      const response = await fetch("https://bakery-bakend.onrender.com/api/customers/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to send OTP");
      setOtpSent(true);
      alert("OTP sent to your email!");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpSent || !otp) {
      alert("Please verify your email with OTP first");
      return;
    }
    if (!recaptchaToken) {
      alert("Please complete the reCAPTCHA verification");
      return;
    }
    setLoading(true);

    try {
      const response = await fetch("https://bakery-bakend.onrender.com/api/customers/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, phone, address, password, otp, recaptchaToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to register account");
      }

      dispatch(setCredentials({ user: data.customer, token: data.token }));

      // Persist auth state to localStorage for session recovery
      localStorage.setItem("token", data.token);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("user", JSON.stringify(data.customer));
      navigate("/");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FAFAFA] font-inter">

      {/* ── Left Side: Form Panel ── */}
      <div className="w-full lg:w-1/2 flex flex-col relative px-6 md:px-16 py-12 justify-center bg-white order-2 lg:order-1">

        {/* Back Button */}
        <Link
          to="/login"
          className="absolute top-8 left-6 md:left-12 flex items-center gap-2 text-[#8D6E63] hover:text-[#1A2744] transition-colors text-sm font-semibold tracking-wide"
        >
          <ArrowLeft size={16} /> Back to Login
        </Link>

        <div className="max-w-md w-full mx-auto animate-fade-up">

          {/* Header */}
          <div className="text-center lg:text-left mb-8 mt-6">
            <h1 className="font-playfair text-4xl font-extrabold text-[#1A2744] mb-3">
              Join Our Bakery
            </h1>
            <p className="text-[#8D6E63] text-sm leading-relaxed">
              Create an account to start enjoying exclusive sweet rewards, faster checkouts, and tracking your past orders.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-5">

            {/* Name Field */}
            <div className="space-y-1.5 group">
              <label htmlFor="name" className="text-[0.7rem] font-bold text-[#1A2744] uppercase tracking-widest pl-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User size={18} className="text-[#BFAA99] group-focus-within:text-[#D4A373] transition-colors" />
                </div>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-[#FAFAFA] border border-[#E0E0E0] rounded-xl text-[#1A2744] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D4A373]/30 focus:border-[#D4A373] transition-all"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1.5 group">
              <label htmlFor="email" className="text-[0.7rem] font-bold text-[#1A2744] uppercase tracking-widest pl-1">
                Email Address
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail size={18} className="text-[#BFAA99] group-focus-within:text-[#D4A373] transition-colors" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    disabled={otpSent}
                    className="w-full pl-11 pr-4 py-3 bg-[#FAFAFA] border border-[#E0E0E0] rounded-xl text-[#1A2744] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D4A373]/30 focus:border-[#D4A373] transition-all disabled:opacity-60"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={sendingOtp || otpSent || !email}
                  className="px-4 py-3 bg-[#1A2744] hover:bg-[#2A3754] text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-60 whitespace-nowrap"
                >
                  {sendingOtp ? "Sending..." : otpSent ? "Sent" : "Send OTP"}
                </button>
              </div>
            </div>

            {/* OTP Field */}
            {otpSent && (
              <div className="space-y-1.5 group animate-fade-in">
                <label htmlFor="otp" className="text-[0.7rem] font-bold text-[#1A2744] uppercase tracking-widest pl-1">
                  Enter OTP
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <CheckCircle2 size={18} className="text-[#BFAA99] group-focus-within:text-[#D4A373] transition-colors" />
                  </div>
                  <input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    required
                    maxLength={6}
                    className="w-full pl-11 pr-4 py-3 bg-[#FAFAFA] border border-[#E0E0E0] rounded-xl text-[#1A2744] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D4A373]/30 focus:border-[#D4A373] transition-all tracking-widest"
                  />
                </div>
              </div>
            )}

            {/* Phone Field */}
            <div className="space-y-1.5 group">
              <label htmlFor="phone" className="text-[0.7rem] font-bold text-[#1A2744] uppercase tracking-widest pl-1">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone size={18} className="text-[#BFAA99] group-focus-within:text-[#D4A373] transition-colors" />
                </div>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 234 567 8900"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-[#FAFAFA] border border-[#E0E0E0] rounded-xl text-[#1A2744] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D4A373]/30 focus:border-[#D4A373] transition-all"
                />
              </div>
            </div>

            {/* Address Field */}
            <div className="space-y-1.5 group">
              <label htmlFor="address" className="text-[0.7rem] font-bold text-[#1A2744] uppercase tracking-widest pl-1">
                Delivery Address
              </label>
              <div className="relative flex items-start">
                <div className="absolute top-3.5 left-0 pl-4 pointer-events-none">
                  <MapPin size={18} className="text-[#BFAA99] group-focus-within:text-[#D4A373] transition-colors" />
                </div>
                <textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your full home or office address..."
                  required
                  rows={3}
                  className="w-full pl-11 pr-4 py-3 bg-[#FAFAFA] border border-[#E0E0E0] rounded-xl text-[#1A2744] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D4A373]/30 focus:border-[#D4A373] transition-all resize-none"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5 group">
              <label htmlFor="password" className="text-[0.7rem] font-bold text-[#1A2744] uppercase tracking-widest pl-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-[#BFAA99] group-focus-within:text-[#D4A373] transition-colors" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-[#FAFAFA] border border-[#E0E0E0] rounded-xl text-[#1A2744] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D4A373]/30 focus:border-[#D4A373] transition-all"
                />
              </div>
            </div>

            {/* reCAPTCHA */}
            <div className="flex justify-center py-2">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LfpTaQsAAAAAMacLo5D1EtA-kPSE6nbmfjHyxCy"}
                onChange={(token) => setRecaptchaToken(token)}
                theme="light"
              />
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer group pt-2 pb-1">
              <div className="relative flex items-center justify-center w-5 h-5 mt-0.5 shrink-0 rounded border border-[#E0E0E0] bg-[#FAFAFA] group-hover:border-[#D4A373] transition-colors">
                <input type="checkbox" required className="peer opacity-0 absolute w-full h-full cursor-pointer" />
                <CheckCircle2 size={14} className="text-[#D4A373] opacity-0 peer-checked:opacity-100 transition-opacity" />
              </div>
              <span className="text-xs text-[#8D6E63] leading-relaxed select-none">
                I agree to the <span className="font-bold text-[#1A2744]">Terms of Service</span> and <span className="font-bold text-[#1A2744]">Privacy Policy</span>. I understand my data will be used to process orders.
              </span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#D4A373] hover:bg-[#c49260] text-white py-4 rounded-xl font-bold text-sm tracking-wide transition-all transform active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-[#D4A373]/30"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Create Account"
              )}
            </button>

          </form>

          {/* Login Link for Mobile */}
          <div className="mt-8 text-center block lg:hidden">
            <p className="text-[#8D6E63] text-sm">
              Already have an account?{" "}
              <Link to="/login" className="font-bold text-[#D4A373]">
                Sign in
              </Link>
            </p>
          </div>

        </div>
      </div>

      {/* ── Right Side: Image Panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#3E2723] order-1 lg:order-2">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 md:scale-105 hover:scale-100"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1614145121029-83a9f7b68bf4?q=80&w=2000&auto=format&fit=crop")' }}
        />
        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-[#3E2723]/60 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A2744] via-transparent to-transparent opacity-80" />

        {/* Glassmorphic Card Overlay */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] bg-white/10 backdrop-blur-md border border-white/20 p-10 rounded-3xl shadow-2xl">
          <div className="mb-6 flex justify-center">
            <span className="w-16 h-16 bg-[#D4A373] rounded-full flex items-center justify-center text-3xl shadow-[0_0_30px_rgba(212,163,115,0.4)]">
              ✨
            </span>
          </div>
          <h2 className="font-playfair text-3xl font-bold text-white text-center mb-4">
            Become a VIP Member
          </h2>
          <ul className="space-y-4 text-white/90 text-sm font-medium">
            <li className="flex items-center gap-3">
              <CheckCircle2 size={18} className="text-[#D4A373]" />
              Earn points on every sweet purchase
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 size={18} className="text-[#D4A373]" />
              Get a free pastry on your birthday
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 size={18} className="text-[#D4A373]" />
              Save multiple delivery addresses
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 size={18} className="text-[#D4A373]" />
              Early access to new seasonal menus
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
