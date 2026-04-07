import React, { Suspense, lazy, useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthProvider from "./components/AuthProvider";
import LogoLoader from "./components/LogoLoader";

// Lazy-loaded pages and admin layout
const Home = lazy(() => import("./pages/Home"));
const Menu = lazy(() => import("./pages/Menu"));
const About = lazy(() => import("./pages/About"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Contact = lazy(() => import("./pages/Contact"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const CustomizeOrder = lazy(() => import("./pages/CustomizeOrder"));
const Payment = lazy(() => import("./pages/Payment"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const AppContent = () => {
  const [loading, setLoading] = useState(true);

  // Use sessionStorage to only show the loader once per session
  useEffect(() => {
    const hasSeenLoader = sessionStorage.getItem("hasSeenLoader");
    if (hasSeenLoader) {
      setLoading(false);
    }
  }, []);

  const handleLoadingComplete = () => {
    setLoading(false);
    sessionStorage.setItem("hasSeenLoader", "true");
  };

  if (loading) {
    return <LogoLoader onComplete={handleLoadingComplete} />;
  }

  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="min-h-screen grid place-items-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-[#D4A373] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[#8D6E63] font-medium animate-pulse uppercase tracking-widest text-xs">Loading Store...</p>
            </div>
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/about" element={<About />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/customize-order" element={<CustomizeOrder />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
