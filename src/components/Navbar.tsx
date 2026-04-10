import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store";
import { logout } from "../store/slices/authSlice";
import { ShoppingBag, ChevronDown, Search, X, TrendingUp, Clock, ArrowRight, User } from "lucide-react";
import CartSheet from "./CartSheet";
import { products } from "./home/home-data";
import logo from "../assets/Logo2.png";
import CircleLogo from "../assets/CircleLogo.png"

const navLinks = [
  { label: "HOME", id: "home", path: null },
  { label: "MENU", id: "menu", path: "/menu" },
  { label: "ABOUT", id: null, path: "/about" },
  { label: "CUSTOMIZE", id: null, path: "/customize-order" },
  { label: "GALLERY", id: null, path: "/gallery", section: "gallery" },
  { label: "CONTACT", id: null, path: "/contact" },
];

const trendingSearches = ["Birthday Cake", "Croissant", "Sourdough", "Chocolate Cookies", "Muffins"];
const categories = ["All", "Cakes", "Pastries", "Breads", "Cookies", "Muffins"];

// Product shape used by suggestions
type Product = {
  id?: string | number;
  _id?: string | number;
  name?: string;
  img?: string;
  image?: string;
  imgBase64?: string;
  price?: number;
  category?: string;
  rating?: number;
  badge?: string;
  flavor?: string | string[];
  [k: string]: unknown;
};

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState("HOME");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("recentSearches") || "[]"); } catch { return []; }
  });

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const cartItems = useSelector((state: RootState) => state.cart.items);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("token");
    localStorage.removeItem("isLoggedIn");
    navigate("/");
  };

  // Sync active tab with current route
  useEffect(() => {
    const matched = navLinks.find(link => link.path && location.pathname === link.path);
    if (matched) {
      setActive(matched.label);
    } else if (location.pathname === "/") {
      setActive("HOME");
    }
  }, [location.pathname]);
  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Close search on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Debounce input so suggestions feel dynamic without spamming filtering
  useEffect(() => {
    setLoadingSearch(true);
    const id = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
      setLoadingSearch(false);
    }, 250);
    return () => { clearTimeout(id); };
  }, [searchQuery]);

  // Fetch suggestions from backend when debouncedQuery or selectedCategory changes
  useEffect(() => {
    // If no query, clear suggestions (frontend shows recent/trending in that case)
    if (!debouncedQuery) {
      setSuggestions([]);
      setActiveIndex(-1);
      setLoadingSearch(false);
      return;
    }

    const ac = new AbortController();
    setLoadingSearch(true);

    const token = localStorage.getItem('token');
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    // Build param strings
    const baseParams = new URLSearchParams({ q: debouncedQuery, limit: '6' });
    if (selectedCategory && selectedCategory !== 'All') baseParams.set('category', selectedCategory);

    const endpoints = [
      `/api/products/search?${baseParams.toString()}`,
      `https://bakery-bakend.onrender.com/api/products?search=${encodeURIComponent(debouncedQuery)}&limit=6${selectedCategory && selectedCategory !== 'All' ? `&category=${encodeURIComponent(selectedCategory)}` : ''}`,
      `/api/products?search=${encodeURIComponent(debouncedQuery)}&limit=6${selectedCategory && selectedCategory !== 'All' ? `&category=${encodeURIComponent(selectedCategory)}` : ''}`,
    ];

    (async () => {
      for (const url of endpoints) {
        try {
          const res = await fetch(url, { signal: ac.signal, headers });
          if (!res.ok) {
            if (res.status === 404) continue;
            throw new Error(`Search failed ${res.status} at ${url}`);
          }
          const data: unknown = await res.json();
          // Normalize response shapes without using `any`
          let items: unknown[] = [];
          if (Array.isArray(data)) items = data as unknown[];
          else if (data && typeof data === 'object') {
            const obj = data as Record<string, unknown>;
            if (Array.isArray(obj.data)) items = obj.data as unknown[];
            else if (Array.isArray(obj.items)) items = obj.items as unknown[];
            else if (Array.isArray(obj.products)) items = obj.products as unknown[];
            else if (Array.isArray(obj.results)) items = obj.results as unknown[];
          }

          // Some APIs return objects with pagination: { data: { items: [...] } }
          if (items.length === 0 && data && typeof data === 'object') {
            const obj = data as Record<string, unknown>;
            const maybe = obj.data ?? obj.items ?? obj.products ?? obj.results;
            if (Array.isArray(maybe)) items = maybe as unknown[];
          }

          // If we found items, normalize and set
          if (items.length > 0) {
            const normalized = items.slice(0, 6).map(it => it as Product);
            setSuggestions(normalized);
            setActiveIndex(normalized.length > 0 ? 0 : -1);
            setLoadingSearch(false);
            return; // success
          }
        } catch (err: unknown) {
          // Abort or other error — continue to fallback attempts
          if ((err as { name?: string })?.name === 'AbortError') return;
          console.warn('Search endpoint failed, trying next:', err);
          // continue to try next endpoint
        }
      }

      // Try to fetch the full product list (fallback to Menu's source) and filter client-side
      try {
        const resAll = await fetch('https://bakery-bakend.onrender.com/api/products?limit=100', { signal: ac.signal, headers });
        if (resAll.ok) {
          const allData: unknown = await resAll.json();
          let allItems: unknown[] = [];
          if (Array.isArray(allData)) allItems = allData as unknown[];
          else if (allData && typeof allData === 'object') {
            const obj = allData as Record<string, unknown>;
            if (Array.isArray(obj.data)) allItems = obj.data as unknown[];
            else if (Array.isArray(obj.items)) allItems = obj.items as unknown[];
            else if (Array.isArray(obj.products)) allItems = obj.products as unknown[];
          }

          // Filter locally to match query and category
          const q = debouncedQuery.toLowerCase();
          const matched = allItems.filter(it => {
            if (!it || typeof it !== 'object') return false;
            const rec = it as Record<string, unknown>;
            const name = String(rec.name ?? rec.title ?? '');
            const cat = String(rec.category ?? '');
            const flavor = (rec.flavor && typeof rec.flavor === 'string') ? String(rec.flavor) : '';
            const matchesQuery = name.toLowerCase().includes(q) || cat.toLowerCase().includes(q) || flavor.toLowerCase().includes(q);
            const matchesCategory = selectedCategory === 'All' ? true : (cat === selectedCategory || cat.toLowerCase() === selectedCategory.toLowerCase());
            return matchesQuery && matchesCategory;
          }).slice(0, 6).map(i => i as Record<string, unknown>);

          setSuggestions(matched as Product[]);
          setActiveIndex(matched.length > 0 ? 0 : -1);
          setLoadingSearch(false);
          return;
        }
      } catch (e) {
        if ((e as { name?: string })?.name === 'AbortError') return;
        console.warn('Full product list fallback failed', e);
      }

      // final fallback: empty
      setSuggestions([]);
      setActiveIndex(-1);
      setLoadingSearch(false);
    })();

    return () => ac.abort();
  }, [debouncedQuery, selectedCategory]);

  // Reset active refs length when suggestions change
  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, suggestions.length);
  }, [suggestions.length]);

  const filteredProducts: Product[] = suggestions;

  const handleSearch = (query: string) => {
    if (!query.trim()) return;
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 4);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
    setSearchFocused(false);
    setSearchQuery(query);
    navigate(`/menu?search=${encodeURIComponent(query)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      // If a suggestion is active, pick it; otherwise run a normal search
      if (activeIndex >= 0 && filteredProducts[activeIndex]) {
        const p = filteredProducts[activeIndex];
        const prodId = String(p.id ?? p._id ?? '');
        if (prodId) navigate(`/product/${prodId}`);
        setSearchFocused(false);
        setSearchQuery("");
        return;
      }
      handleSearch(searchQuery);
    }
    if (e.key === "Escape") { setSearchFocused(false); setSearchQuery(""); }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => Math.min(prev + 1, filteredProducts.length - 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => Math.max(prev - 1, 0));
    }
  };

  const clearRecent = (term: string) => {
    const updated = recentSearches.filter(s => s !== term);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  // Helper to render highlighted match in product name
  const highlightMatch = (text: string) => {
    if (!debouncedQuery) return text;
    const q = debouncedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${q})`, 'ig'));
    return parts.map((part, i) => (
      // Using React nodes as strings will be rendered properly in JSX
      part.toLowerCase() === debouncedQuery.toLowerCase() ? <span key={i} className="bg-[#D4A373]/40 px-0.5 rounded">{part}</span> : <span key={i}>{part}</span>
    ));
  };

  // Scroll active suggestion into view when it changes
  useEffect(() => {
    if (activeIndex >= 0 && itemRefs.current[activeIndex]) {
      itemRefs.current[activeIndex]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [activeIndex]);

  const scrollTo = (link: typeof navLinks[0]) => {
    if (link.path) {
      navigate(link.path);
      setActive(link.label);
      setMenuOpen(false);
      return;
    }
    if (link.id) {
      if (location.pathname !== "/") {
        navigate("/");
        setTimeout(() => {
          document.getElementById(link.id!)?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } else {
        document.getElementById(link.id)?.scrollIntoView({ behavior: "smooth" });
      }
    }
    setActive(link.label);
    setMenuOpen(false);
  };

  const showDropdown = searchFocused;

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 font-hepta transition-all duration-500 ${scrolled ? "shadow-md shadow-[#1A2744]/10" : ""
      }`}>

      {/* ═══ ROW 1: Logo + Search + Actions ═══ */}
      <div className={`bg-[#F5ECD7] transition-all duration-300 ${scrolled ? "py-2" : "py-3"} border-b border-[#D4A373]/20`}>
        <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4 px-6 lg:px-10">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-3 group no-underline select-none shrink-0">
            <div className="relative lg:hidden w-12 h-12 bg-[#eaccd1] rounded-xl rotate-3 group-hover:rotate-12 transition-all duration-300 flex items-center justify-center shadow-lg">
              <img src={logo} alt="Hangary? Sweet. Logo" className="w-11 h-11 object-cover rounded-xl" />
            </div>


             <div className="hidden lg:block absolute top-[30%] left-0 flex items-center justify-center z-[100]">
              <img src={CircleLogo} alt="Hangry? Sweet. Logo" className="w-32 h-32 object-contain drop-shadow-2xl hover:scale-110 transition-transform duration-300" />
            </div>
            <div className="hidden md:flex flex-col leading-none">
              <span className="font-playfair text-xl font-bold tracking-wider text-[#1A2744] group-hover:text-[#D4A373] transition-colors">Hangry?Sweet.</span>
              <span className="text-[0.6rem] tracking-[0.3em] text-[#8D6E63] font-medium uppercase mt-1">Est. 2024</span>
            </div>
          </Link>

          {/* ── Search Bar ── */}
          <div ref={searchRef} className="flex-1 max-w-2xl relative hidden lg:block">
            <div className={`flex items-stretch rounded-2xl overflow-visible transition-all duration-300 ${searchFocused ? "shadow-[0_0_0_3px_#D4A373]" : "shadow-md hover:shadow-lg"
              }`}>
              {/* Category Selector */}
              {/* <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="h-full pl-4 pr-8 bg-[#3E2723] text-[#F5ECD7] text-xs font-bold tracking-wide border-none outline-none cursor-pointer appearance-none rounded-l-2xl hover:bg-[#5D4037] transition-colors"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#F5ECD7] pointer-events-none" />
              </div> */}
              {/* Input */}
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onKeyDown={handleKeyDown}
                placeholder="Search cakes, pastries, breads..."
                className="flex-1 px-5 py-3 rounded-lg bg-white text-[#1A2744] text-sm placeholder-[#BFAA99] outline-none border-none font-inter"
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(""); inputRef.current?.focus(); }} className="px-2 bg-white text-[#BFAA99] hover:text-[#3E2723] transition-colors">
                  <X size={16} />
                </button>
              )}
              <button onClick={() => handleSearch(searchQuery)} className="px-6 bg-[#D4A373] hover:bg-[#c49260] text-[#2C1810] font-bold rounded-r-2xl transition-all duration-200 flex items-center active:scale-95">
                <Search size={18} strokeWidth={2.5} />
              </button>
            </div>

            {/* ── Search Dropdown ── */}
            {showDropdown && (
              <div className="absolute top-[calc(100%+10px)] left-0 right-0 bg-white rounded-2xl shadow-2xl shadow-[#1A2744]/15 border border-[#F0E6D3] z-50 overflow-hidden">
                {loadingSearch && debouncedQuery.length > 0 && (
                  <div className="px-5 py-4 text-sm text-[#8D6E63]">Searching...</div>
                )}
                {filteredProducts.length > 0 && (
                  <div className="p-3">
                    <p className="text-[0.65rem] font-bold tracking-widest text-[#8D6E63] uppercase px-2 mb-2">Products</p>
                    {filteredProducts.map((p, idx) => {
                      const prodId = String(p.id ?? p._id ?? '');
                      const imgSrc = p.img ?? p.image ?? p.imgBase64 ?? '';
                      return (
                        <button
                          key={prodId || idx}
                          ref={(el) => (itemRefs.current[idx] = el)}
                          onMouseEnter={() => setActiveIndex(idx)}
                          onClick={() => { if (prodId) navigate(`/product/${prodId}`); setSearchFocused(false); setSearchQuery(""); }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group text-left ${activeIndex === idx ? "bg-[#FAF6E6]" : "hover:bg-[#FAF6E6]"}`}
                          aria-current={activeIndex === idx}
                        >
                          <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-[#F0E6D3]">
                            <img src={imgSrc || '/placeholder.svg'} alt={String(p.name ?? '')} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#1A2744] truncate">{highlightMatch(String(p.name ?? ''))}</p>
                            <p className="text-xs text-[#8D6E63]">{String(p.category ?? '')} • ⭐ {String(p.rating ?? '')}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-bold text-[#3E2723]">${Number(p.price ?? 0).toFixed(2)}</p>
                            {p.badge && <span className="text-[0.6rem] bg-[#D4A373]/20 text-[#8D6E63] px-1.5 py-0.5 rounded-full font-bold">{p.badge}</span>}
                          </div>
                        </button>
                      );
                    })}
                    <button onClick={() => handleSearch(searchQuery)} className="w-full mt-1 py-2 text-xs font-bold text-[#D4A373] hover:text-[#3E2723] flex items-center justify-center gap-1 transition-colors">
                      See all results for "{searchQuery}" <ArrowRight size={12} />
                    </button>
                  </div>
                )}
                {searchQuery.trim().length > 0 && filteredProducts.length === 0 && (
                  <div className="px-5 py-6 text-center">
                    <div className="text-3xl mb-2">🔍</div>
                    <p className="text-sm font-semibold text-[#1A2744]">No results for "{searchQuery}"</p>
                    <p className="text-xs text-[#8D6E63] mt-1">Try searching for cakes, breads, or pastries</p>
                  </div>
                )}
                {searchQuery.trim().length === 0 && (
                  <div className="p-3 space-y-1">
                    {recentSearches.length > 0 && (
                      <>
                        <p className="text-[0.65rem] font-bold tracking-widest text-[#8D6E63] uppercase px-2 mb-2 flex items-center gap-1.5"><Clock size={11} /> Recent</p>
                        {recentSearches.map(term => (
                          <div key={term} className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#FAF6E6] transition-colors group">
                            <button onClick={() => { setSearchQuery(term); handleSearch(term); }} className="flex-1 text-left text-sm text-[#3E2723] font-medium flex items-center gap-2">
                              <Clock size={13} className="text-[#BFAA99]" /> {term}
                            </button>
                            <button onClick={() => clearRecent(term)} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#BFAA99] hover:text-[#3E2723]"><X size={13} /></button>
                          </div>
                        ))}
                        <div className="h-px bg-[#F0E6D3] mx-2 my-2" />
                      </>
                    )}
                    <p className="text-[0.65rem] font-bold tracking-widest text-[#8D6E63] uppercase px-2 mb-2 flex items-center gap-1.5"><TrendingUp size={11} /> Trending</p>
                    {trendingSearches.map((term, i) => (
                      <button key={term} onClick={() => { setSearchQuery(term); handleSearch(term); }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[#FAF6E6] transition-colors text-left group"
                      >
                        <span className="w-5 h-5 rounded-full bg-[#D4A373]/20 text-[#D4A373] text-[0.6rem] font-black flex items-center justify-center shrink-0">{i + 1}</span>
                        <span className="text-sm text-[#3E2723] font-medium flex-1">{term}</span>
                        <ArrowRight size={13} className="text-[#BFAA99] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Actions ── */}
          <div className="hidden lg:flex items-center gap-5 shrink-0">
            {isAuthenticated && user ? (
              <button onClick={handleLogout} className="flex items-center gap-2 group transition-all text-[#3E2723] hover:text-[#D4A373] font-bold text-xs tracking-widest bg-transparent border-none cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-[#3E2723]/10 flex items-center justify-center group-hover:bg-[#D4A373]/20 transition-colors">
                  <User size={16} />
                </div>
                <span>HI, {user.name?.split(' ')[0].toUpperCase()} <br /><span className="text-[0.6rem] text-[#8D6E63] group-hover:text-[#D4A373]">LOGOUT</span></span>
              </button>
            ) : (
              <Link to="/login" className="flex items-center gap-2 group transition-all text-[#3E2723] hover:text-[#D4A373] font-bold text-xs tracking-widest no-underline">
                <div className="w-8 h-8 rounded-full bg-[#3E2723]/10 flex items-center justify-center group-hover:bg-[#D4A373]/20 transition-colors">
                  <User size={16} />
                </div>
                LOGIN
              </Link>
            )}
            <CartSheet />
            <Link to="/customize-order" className="bg-[#3E2723] text-[#F5ECD7] border-none px-6 py-2.5 rounded-full text-xs font-bold tracking-widest hover:bg-[#5D4037] transition-all transform hover:scale-105 shadow-xl shadow-[#3E2723]/20 active:scale-95 no-underline">
              CUSTOMIZE ORDER
            </Link>
          </div>

          {/* ── Mobile Right ── */}
          <div className="lg:hidden flex items-center gap-3">
            <button onClick={() => setSearchOpen(!searchOpen)} className="w-9 h-9 flex items-center justify-center rounded-full bg-[#3E2723]/10 text-[#3E2723] hover:bg-[#3E2723] hover:text-[#F5ECD7] transition-all">
              <Search size={18} />
            </button>
            <button onClick={() => setMenuOpen(!menuOpen)} className="flex flex-col gap-[6px] w-8 h-8 justify-center z-50 focus:outline-none">
              <span className={`w-full h-[2px] bg-[#1A2744] transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`w-3/4 h-[2px] bg-[#1A2744] ml-auto transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`w-full h-[2px] bg-[#1A2744] transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </button>
          </div>
        </div>

        {/* ── Mobile Search Bar ── */}
        <div className={`lg:hidden overflow-hidden transition-all duration-300 ${searchOpen ? "max-h-24 opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="px-4 pb-3 pt-2">
            <div className="flex items-stretch rounded-xl overflow-hidden shadow-md">
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={handleKeyDown}
                placeholder="Search bakery items..."
                className="flex-1 px-4 py-3 bg-white text-[#1A2744] text-sm placeholder-[#BFAA99] outline-none border-none font-inter"
              />
              <button onClick={() => handleSearch(searchQuery)} className="px-5 bg-[#D4A373] text-[#2C1810] font-bold">
                <Search size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ ROW 2: Nav Links Bar ═══ */}
      <div className="hidden lg:block bg-[#3E2723]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <nav className="flex items-center justify-center gap-1">
            {navLinks.map((link) => (
              <button key={link.label} onClick={() => scrollTo(link)}
                className={`text-xs font-bold tracking-widest px-5 py-3.5 transition-all duration-200 border-b-2 whitespace-nowrap ${active === link.label
                  ? "text-[#D4A373] border-[#D4A373] bg-white/10"
                  : "text-[#F5ECD7]/90 border-transparent hover:text-[#D4A373] hover:bg-white/10 hover:border-[#D4A373]/50"
                  }`}
              >
                {link.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* ── Mobile Menu Overlay ── */}
      <div className={`fixed inset-0 bg-[#F5ECD7] z-40 flex flex-col items-center justify-center transition-all duration-500 ${menuOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}>
        <nav className="flex flex-col items-center gap-8 text-center">
          {navLinks.map((link) => (
            <button key={link.label} onClick={() => scrollTo(link)}
              className="font-playfair text-2xl font-bold text-[#3E2723] hover:text-[#D4A373] transition-colors"
            >
              {link.label}
            </button>
          ))}
          <div className="mt-8 flex flex-col items-center gap-6">
            <div className="relative">
              <ShoppingBag size={32} className="text-[#3E2723]" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#D4A373] text-white text-xs w-6 h-6 flex items-center justify-center rounded-full font-bold shadow-sm border-2 border-[#F5ECD7]">
                  {cartItemCount}
                </span>
              )}
            </div>
            {isAuthenticated && user ? (
              <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="bg-transparent border-2 border-[#3E2723] text-[#3E2723] px-8 py-3 rounded-full text-sm font-bold tracking-widest w-full max-w-[200px]">
                LOGOUT
              </button>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)} className="bg-transparent border-2 border-[#3E2723] text-[#3E2723] px-8 py-3 rounded-full text-sm font-bold tracking-widest no-underline w-full max-w-[200px]">
                LOGIN OR REGISTER
              </Link>
            )}
            <Link to="/customize-order" onClick={() => setMenuOpen(false)} className="bg-[#3E2723] text-[#F5ECD7] px-8 py-3 rounded-full text-sm font-bold tracking-widest no-underline w-full max-w-[200px]">
              CUSTOMIZE ORDER
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
