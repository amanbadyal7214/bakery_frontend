import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Mail, Lock, CheckCircle2 } from "lucide-react";
import { useDispatch } from "react-redux";
import { setCredentials } from "../store/slices/authSlice";
import { useToast } from '@/hooks/use-toast';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();

  // Forgot-password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [fpEmail, setFpEmail] = useState("");
  const [fpOtp, setFpOtp] = useState("");
  const [fpNewPassword, setFpNewPassword] = useState("");
  const [fpStage, setFpStage] = useState<'request' | 'verify' | 'reset'>('request');
  const [fpLoading, setFpLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("https://api.hangrysweet.com/api/customers/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to login");
      }

      dispatch(setCredentials({ user: data.customer, token: data.token }));

      // Persist auth state to localStorage for session recovery
      localStorage.setItem("token", data.token);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("user", JSON.stringify(data.customer));
      navigate("/");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      toast({ title: 'Sign in failed', description: message });
    } finally {
      setLoading(false);
    }
  };

  // --- Forgot password modal actions ---
  const openForgotModal = () => {
    setFpEmail("");
    setFpOtp("");
    setFpNewPassword("");
    setFpStage('request');
    setShowForgotModal(true);
  };

  const sendResetOtp = async () => {
    setFpLoading(true);
    try {
      const res = await fetch('https://api.hangrysweet.com/api/customers/send-reset-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fpEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to send OTP');
      setFpStage('verify');
      toast({ title: 'OTP sent', description: 'Check your email for the one-time code.' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      toast({ title: 'Failed to send OTP', description: message });
    } finally {
      setFpLoading(false);
    }
  };

  const verifyResetOtp = async () => {
    setFpLoading(true);
    try {
      const res = await fetch('https://api.hangrysweet.com/api/customers/verify-reset-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fpEmail, otp: fpOtp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to verify OTP');
      setFpStage('reset');
      toast({ title: 'OTP verified', description: 'You may now set a new password.' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      toast({ title: 'OTP verification failed', description: message });
    } finally {
      setFpLoading(false);
    }
  };

  const resetPassword = async () => {
    setFpLoading(true);
    try {
      const res = await fetch('https://api.hangrysweet.com/api/customers/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fpEmail, otp: fpOtp, newPassword: fpNewPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to reset password');
      toast({ title: 'Password reset', description: 'Password updated. You can sign in with the new password.' });
      setShowForgotModal(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      toast({ title: 'Password reset failed', description: message });
    } finally {
      setFpLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FAFAFA] font-inter">

      {/* ── Left Side: Image Panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#1A2744]">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 hover:scale-105"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?q=80&w=2000&auto=format&fit=crop")' }}
        />
        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A2744]/90 via-[#1A2744]/40 to-transparent" />

        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 text-white/50 animate-spin-slow opacity-20">
          <svg width="100" height="100" viewBox="0 0 100 100"><path fill="currentColor" d="M50 0 L55 45 L100 50 L55 55 L50 100 L45 55 L0 50 L45 45 Z" /></svg>
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col justify-end p-16 h-full text-white w-full">
          <div>
            <div className="w-16 h-1 bg-[#D4A373] mb-6 rounded-full" />
            <h2 className="font-playfair text-5xl font-bold leading-tight mb-4">
              Taste the Magic of <br />Freshly Baked Delights.
            </h2>
            <p className="text-white/80 text-lg max-w-md font-light">
              Log in to your account to track your sweet orders, save your favorite pastries, and enjoy exclusive bakery rewards.
            </p>
          </div>

          {/* Testimonial / Social Proof */}
          <div className="mt-12 flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl w-max border border-white/10">
            <div className="flex -space-x-2">
              {[
                "https://i.pravatar.cc/100?img=1",
                "https://i.pravatar.cc/100?img=5",
                "https://i.pravatar.cc/100?img=3",
              ].map((src, i) => (
                <img key={i} src={src} alt="User" className="w-8 h-8 rounded-full border-2 border-[#1A2744]" />
              ))}
            </div>
            <p className="text-sm font-medium">Join 10,000+ happy customers</p>
          </div>
        </div>
      </div>

      {/* ── Right Side: Form Panel ── */}
      <div className="w-full lg:w-1/2 flex flex-col relative px-6 md:px-16 py-12 justify-center bg-white">

        {/* Back Button */}
        <Link
          to="/"
          className="absolute top-8 left-6 md:left-12 flex items-center gap-2 text-[#8D6E63] hover:text-[#1A2744] transition-colors text-sm font-semibold tracking-wide"
        >
          <ArrowLeft size={16} /> Home
        </Link>

        <div className="max-w-md w-full mx-auto animate-fade-up">

          {/* Header */}
          <div className="text-center lg:text-left mb-10">
            <div className="inline-flex lg:hidden items-center justify-center w-14 h-14 bg-[#F5ECD7] rounded-2xl shadow-sm mb-6 text-3xl">
              🧁
            </div>
            <h1 className="font-playfair text-4xl font-extrabold text-[#1A2744] mb-3">
              Welcome Back
            </h1>
            <p className="text-[#8D6E63] text-base">
              Please enter your details to sign in.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">

            {/* Email Field */}
            <div className="space-y-2 group">
              <label
                htmlFor="email"
                className="text-xs font-bold text-[#1A2744] uppercase tracking-widest pl-1"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={18} className="text-[#BFAA99] group-focus-within:text-[#D4A373] transition-colors" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-[#FAFAFA] border border-[#E0E0E0] rounded-xl text-[#1A2744] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D4A373]/30 focus:border-[#D4A373] transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2 group">
              <label
                htmlFor="password"
                className="text-xs font-bold text-[#1A2744] uppercase tracking-widest pl-1"
              >
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
                  placeholder="••••••••"
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-[#FAFAFA] border border-[#E0E0E0] rounded-xl text-[#1A2744] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D4A373]/30 focus:border-[#D4A373] transition-all"
                />
              </div>
            </div>

            {/* Options */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center justify-center w-5 h-5 rounded border border-[#E0E0E0] bg-[#FAFAFA] group-hover:border-[#D4A373] transition-colors">
                  <input type="checkbox" className="peer opacity-0 absolute w-full h-full cursor-pointer" />
                  <CheckCircle2 size={14} className="text-[#D4A373] opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
                <span className="text-sm text-[#8D6E63] group-hover:text-[#1A2744] transition-colors">Remember me</span>
              </label>
              <button
                type="button"
                className="text-sm font-semibold text-[#1A2744] hover:text-[#D4A373] transition-colors"
                onClick={openForgotModal}
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-[#1A2744] hover:bg-[#2C3D6B] text-white py-4 rounded-xl font-bold text-sm tracking-wide transition-all transform active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-[#1A2744]/20"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Sign In to My Account"
              )}
            </button>

          </form>

          {/* Registration Link */}
          <div className="mt-10 text-center">
            <p className="text-[#8D6E63] text-sm">
              Don't have an account yet?{" "}
              <Link to="/register" className="font-bold text-[#D4A373] hover:text-[#1A2744] transition-colors">
                Sign up for free
              </Link>
            </p>
          </div>

        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowForgotModal(false)} />
          <div className="relative bg-white w-full max-w-md mx-4 rounded-2xl p-6 z-10 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Reset password</h3>
              <button onClick={() => setShowForgotModal(false)} className="text-sm text-gray-500">Close</button>
            </div>

            {fpStage === 'request' && (
              <>
                <p className="text-sm text-gray-600 mb-3">Enter your email to receive a reset OTP.</p>
                <input type="email" value={fpEmail} onChange={(e) => setFpEmail(e.target.value)} placeholder="Email" className="w-full mb-3 px-3 py-2 border rounded" />
                <div className="flex gap-2">
                  <button onClick={sendResetOtp} disabled={fpLoading || !fpEmail} className="flex-1 bg-[#1A2744] text-white py-2 rounded">{fpLoading ? 'Sending...' : 'Send OTP'}</button>
                  <button onClick={() => setShowForgotModal(false)} className="flex-1 border rounded">Cancel</button>
                </div>
              </>
            )}

            {fpStage === 'verify' && (
              <>
                <p className="text-sm text-gray-600 mb-3">Enter the OTP sent to your email.</p>
                <input type="text" value={fpOtp} onChange={(e) => setFpOtp(e.target.value)} placeholder="6-digit OTP" className="w-full mb-3 px-3 py-2 border rounded" />
                <div className="flex gap-2">
                  <button onClick={verifyResetOtp} disabled={fpLoading || !fpOtp} className="flex-1 bg-[#1A2744] text-white py-2 rounded">{fpLoading ? 'Verifying...' : 'Verify OTP'}</button>
                  <button onClick={sendResetOtp} disabled={fpLoading} className="flex-1 border rounded">Resend</button>
                </div>
              </>
            )}

            {fpStage === 'reset' && (
              <>
                <p className="text-sm text-gray-600 mb-3">Set a new password for your account.</p>
                <input type="password" value={fpNewPassword} onChange={(e) => setFpNewPassword(e.target.value)} placeholder="New password" className="w-full mb-3 px-3 py-2 border rounded" />
                <div className="flex gap-2">
                  <button onClick={resetPassword} disabled={fpLoading || !fpNewPassword} className="flex-1 bg-[#1A2744] text-white py-2 rounded">{fpLoading ? 'Saving...' : 'Save password'}</button>
                  <button onClick={() => setShowForgotModal(false)} className="flex-1 border rounded">Close</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
