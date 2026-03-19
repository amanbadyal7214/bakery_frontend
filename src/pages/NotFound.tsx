import React from "react";
import { Link } from "react-router-dom";
import { MoveLeft } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-vanilla text-center px-4">
      <h1 className="text-9xl font-bold font-dancing text-chocolate mb-4">404</h1>
      <p className="text-2xl font-medium text-muted-foreground mb-8">
        Oops! The page you are looking for seems to have crumbled away. 🍪
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-chocolate text-cream font-semibold hover:opacity-90 transition-opacity"
      >
        <MoveLeft className="w-5 h-5" /> Back to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;
