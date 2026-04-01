import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useProductActions } from "../components/home/home-data";
import Navbar from "../components/Navbar";
import FooterSection from "../components/home/FooterSection";
import FilterSidebar, { FilterState } from "../components/FilterSidebar";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { ShoppingBag, Star, Filter, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom"; 

// derive categories dynamically from loaded products; include 'All' as first option
// default fallback to common categories until products load
const defaultCategories = ["Cakes", "Pastries", "Breads", "Cookies", "Muffins"];

export default function Menu() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    category: [],
    flavor: [],
    type: [],
    occasion: [],
    priceRange: [0, 5000], 
    weight: [],
    delivery: [],
    rating: null,
    dietary: [],
    shape: [],
    theme: [],
  });
  
  const { handleAddToCart } = useProductActions();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state: any) => state.auth.isAuthenticated); 

  // products loaded from backend API (replace demo import)
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://bakery-bakend.onrender.com/api/products?limit=100`, { signal: controller.signal });
        if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
        const json = await res.json();
        console.log('Menu page API response:', json);
        const result = json && Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : null);
        if (mounted && result) setProducts(result);
        else if (mounted) setProducts([]);
      } catch (e) {
        console.warn('Menu page fetch error:', e);
        if (mounted) setProducts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; controller.abort(); };
  }, []);

  // derive dynamic categories from products
  const categories = (() => {
    try {
      const set = new Set<string>();
      for (const p of products) {
        const cat = p?.category;
        if (!cat) continue;
        if (Array.isArray(cat)) {
          for (const c of cat) if (c) set.add(String(c));
        } else if (typeof cat === 'string') {
          set.add(cat);
        }
      }
      const arr = Array.from(set);
      return ['All', ...(arr.length ? arr : defaultCategories)];
    } catch (e) {
      return ['All', ...defaultCategories];
    }
  })();

  // keep selectedCategory valid if products (and derived categories) change
  useEffect(() => {
    if (selectedCategory === 'All') return;
    if (!categories.includes(selectedCategory)) setSelectedCategory('All');
  }, [categories]);

  // helper to choose image src: prefer base64/data then stored paths
  const getImageSrc = (p: any) => {
    if (!p) return '/placeholder.svg';
    if (typeof p.imgBase64 === 'string' && p.imgBase64) return p.imgBase64;
    if (typeof p.img === 'string' && p.img) return (p.img.startsWith('data:') || p.img.startsWith('http') || p.img.startsWith('/')) ? p.img : (`/${p.img}`);
    if (Array.isArray(p.images) && p.images.length) {
      const first = p.images[0];
      if (first && typeof first.base64 === 'string' && first.base64) return first.base64;
      if (first && typeof first.url === 'string' && first.url) return (first.url.startsWith('/') || first.url.startsWith('http')) ? first.url : `/${first.url}`;
    }
    if (typeof p.image === 'string' && p.image) return p.image;
    return '/placeholder.svg';
  };

  // compute which of the currently selected filters a product matches
  const getMatchedTags = (p: any) => {
    const tags: string[] = [];
    const pushIf = (vals: string[] | undefined) => {
      if (!vals || vals.length === 0) return;
      for (const v of vals) if (v && !tags.includes(v)) tags.push(v);
    };

    // category
    if (filters.category && filters.category.length > 0 && filters.category.includes(p.category)) pushIf([p.category]);

    // flavor (product may have string or array)
    const prodFlavor = Array.isArray(p.flavor) ? p.flavor : (typeof p.flavor === 'string' ? p.flavor.split(',').map((s:string)=>s.trim()) : []);
    const matchedFlavor = filters.flavor?.filter(f => prodFlavor.includes(f)) || [];
    pushIf(matchedFlavor);

    // type
    const prodType = Array.isArray(p.type) ? p.type : (typeof p.type === 'string' ? p.type.split(',').map((s:string)=>s.trim()) : []);
    const matchedType = filters.type?.filter(t => prodType.includes(t)) || [];
    pushIf(matchedType);

    // occasion
    const prodOcc = Array.isArray(p.occasion) ? p.occasion : (typeof p.occasion === 'string' ? p.occasion.split(',').map((s:string)=>s.trim()) : []);
    const matchedOcc = filters.occasion?.filter(o => prodOcc.includes(o)) || [];
    pushIf(matchedOcc);

    // weight
    const prodWeight = Array.isArray(p.weight) ? p.weight : (typeof p.weight === 'string' ? p.weight.split(',').map((s:string)=>s.trim()) : []);
    const matchedWeight = filters.weight?.filter(w => prodWeight.includes(w)) || [];
    pushIf(matchedWeight);

    // delivery, dietary, shape, theme
    const prodDelivery = Array.isArray(p.delivery) ? p.delivery : (p.delivery ? [p.delivery] : []);
    pushIf(filters.delivery?.filter(d => prodDelivery.includes(d)));

    const prodDietary = Array.isArray(p.dietary) ? p.dietary : (p.dietary ? [p.dietary] : []);
    pushIf(filters.dietary?.filter(d => prodDietary.includes(d)));

    if (filters.shape && filters.shape.length > 0 && p.shape && filters.shape.includes(p.shape)) pushIf([p.shape]);
    if (filters.theme && filters.theme.length > 0 && p.theme && filters.theme.includes(p.theme)) pushIf([p.theme]);

    return tags.slice(0, 6);
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    // If sidebar category filter selects exactly one category, mirror it to the top tab
    if (Array.isArray(newFilters.category) && newFilters.category.length === 1) {
      setSelectedCategory(newFilters.category[0]);
    } else if (Array.isArray(newFilters.category) && newFilters.category.length === 0) {
      setSelectedCategory("All");
    } else if (Array.isArray(newFilters.category) && newFilters.category.length > 1) {
      // When multiple categories are selected, clear the top tab selection to 'All' to avoid conflict
      setSelectedCategory("All");
    }
  };

  // helper to compare tags (case-insensitive and tolerant to simple singular/plural mismatch)
  const matches = (a?: string | null, b?: string | null) => {
    if (!a || !b) return false;
    const A = String(a).toLowerCase().trim();
    const B = String(b).toLowerCase().trim();
    if (A === B) return true;
    if (A === B + 's' || B === A + 's') return true;
    return false;
  };

  const fieldMatchesAny = (fieldValue: any, filtersArr: string[]) => {
    if (!filtersArr || filtersArr.length === 0) return true;
    if (Array.isArray(fieldValue)) {
      return filtersArr.some(f => fieldValue.some((v: any) => matches(v, f)));
    }
    return filtersArr.some(f => matches(fieldValue, f));
  };

  const filteredProducts = products.filter(p => {
    // 1. Category Filter (Top tabs)
    if (selectedCategory !== "All" && !matches(p.category, selectedCategory)) return false;

    // 2. Sidebar Category Filter
    if (filters.category.length > 0 && !filters.category.some(c => matches(p.category, c))) return false;

    // 3. Price Range
    if (p.price < filters.priceRange[0] || p.price > filters.priceRange[1]) return false;

    // 4. Rating
    if (filters.rating && (p.rating || 0) < filters.rating) return false;

    // 5. Dynamic Filters (Flavor, Type, Occasion, etc.)
    if (filters.flavor.length > 0 && !fieldMatchesAny(p.flavor, filters.flavor)) return false;
    if (filters.type.length > 0 && !fieldMatchesAny(p.type, filters.type)) return false;
    if (filters.occasion.length > 0 && !fieldMatchesAny(p.occasion, filters.occasion)) return false;
    if (filters.weight.length > 0 && !fieldMatchesAny(p.weight, filters.weight)) return false;
    if (filters.delivery.length > 0 && !fieldMatchesAny(p.delivery, filters.delivery)) return false;
    if (filters.dietary.length > 0 && !fieldMatchesAny(p.dietary, filters.dietary)) return false;
    if (filters.shape.length > 0 && !filters.shape.some(s => matches(p.shape, s))) return false;
    if (filters.theme.length > 0 && !filters.theme.some(t => matches(p.theme, t))) return false;

    return true;
  });

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } }
  };

  return (
    <div className="min-h-screen bg-white font-inter text-[#1A2744] selection:bg-[#D4A373] selection:text-white overflow-x-hidden">
      <Navbar />
      
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#D4A373]/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#3E2723]/5 rounded-full blur-[80px]" />
      </div>

      <div className="pt-32 relative z-10 w-full max-w-[1800px] mx-auto px-4 md:px-6">
        
        <div className="flex items-start gap-8 min-h-[calc(100vh-6rem)]">
            
          <aside className="hidden lg:block w-[300px] min-w-[300px] sticky top-28 self-start rounded-3xl bg-white border border-[#D4A373]/20 shadow-2xl shadow-[#3E2723]/5 transition-all duration-300 hover:shadow-xl">
               <FilterSidebar onFilterChange={handleFilterChange} className="bg-white shadow-none border-none h-auto" />
          </aside>

          <AnimatePresence>
            {isFilterOpen && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsFilterOpen(false)}
                  className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
                />
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="fixed top-0 left-0 bottom-0 w-4/5 max-w-sm bg-[#FAF6E6] z-50 overflow-y-auto lg:hidden shadow-2xl border-r border-[#D4A373]"
                >
                   <div className="p-5 flex justify-between items-center bg-[#3E2723] text-[#F5ECD7]">
                     <h2 className="font-playfair font-bold text-xl tracking-wider flex items-center gap-2">
                        <Filter size={18} /> Filters
                     </h2>
                     <button onClick={() => setIsFilterOpen(false)} className="bg-[#white]/10 hover:bg-white/20 p-2 rounded-full text-[#F5ECD7] transition-colors">
                       <X size={20} />
                     </button>
                   </div>
                   <FilterSidebar onFilterChange={handleFilterChange} className="bg-transparent shadow-none border-none" onClose={() => setIsFilterOpen(false)} />
                </motion.div>
              </>
            )}
          </AnimatePresence>

          <main className="flex-1 w-full pb-20">
              
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                   <span className="text-xs font-bold text-[#8D6E63] uppercase tracking-widest mb-1 block">Menu / {selectedCategory}</span>
                   <h1 className="font-playfair font-bold text-3xl md:text-4xl text-[#3E2723]">
                      Fresh From The Oven
                   </h1>
                </div>

                <Button 
                  onClick={() => setIsFilterOpen(true)}
                  variant="outline" 
                  className="lg:hidden bg-white border-[#D4A373] text-[#3E2723] hover:bg-[#3E2723] hover:text-[#F5ECD7] gap-2 rounded-full shadow-sm"
                >
                  <Filter size={16} /> Filters
                </Button>
            </div>

            <div className="sticky top-[80px] lg:static z-20 -mx-4 px-4 py-3 bg-white/95 backdrop-blur-md lg:bg-transparent lg:p-0 lg:mx-0 mb-8 border-b border-[#D4A373]/10 lg:border-none">
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none lg:flex-wrap">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      // keep sidebar filters in sync: selecting a top category applies it as the sidebar category filter
                      setFilters(prev => ({ ...prev, category: cat === 'All' ? [] : [cat] }));
                    }}
                    className={`whitespace-nowrap px-6 py-2.5 rounded-2xl text-sm font-bold tracking-wide transition-all duration-300 border-2 select-none ${
                      selectedCategory === cat
                        ? "bg-[#3E2723] text-[#F5ECD7] border-[#3E2723] shadow-lg shadow-[#3E2723]/20 transform -translate-y-0.5"
                        : "bg.white text-[#8D6E63] border-transparent hover:border-[#D4A373]/30 hover:text-[#3E2723] hover:bg-white shadow-sm"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <motion.div 
              variants={container}
              initial="hidden"
              animate="show"
              layout
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 lg:gap-8"
            >
              <AnimatePresence mode="popLayout">
              {filteredProducts.map((p) => (
                <motion.article key={p.id}
                  layout
                  variants={item}
                  initial="hidden"
                  animate="show"
                   exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  className="group relative h-[450px] w-full rounded-3xl overflow-hidden shadow-xl cursor-pointer" // Add cursor-pointer
                >
                  <div onClick={() => {
                    const prodId = (p && (p._id ?? p.id ?? '')) || '';
                    if (!prodId) {
                      console.warn('Product missing id, not navigating to detail:', p);
                      return;
                    }
                    navigate(`/product/${prodId}`);
                  }} className="block h-full w-full"> 
                    {/* Full Background Image */}
                    <div className="absolute inset-0 w-full h-full">
                      <img src={getImageSrc(p)} alt={p.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    </div>
                    
                    {/* Gradient Overlay: Dark Bottom to Transparent Top */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a0f0a] via-[#3E2723]/60 to-transparent opacity-90" />

                    {/* Content Section */}
                    <div className="absolute inset-0 p-6 flex flex-col justify-end text-white z-10">
                      <div className="transform transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                        <div className="flex justify-between items-end mb-2">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              {p.badge && (
                                <span className="w-fit px-2 py-0.5 rounded-full bg-[#D4A373] text-[#2C1810] text-[0.65rem] font-bold uppercase tracking-wider">
                                  {p.badge}
                                </span>
                              )}
                              <h3 className="font-playfair text-2xl font-bold leading-tight group-hover:text-[#D4A373] transition-colors">
                                {p.name}
                              </h3>
                            </div>
                            {/* show which selected filters this product matches */}
                            { (filters && (Object.values(filters).some(v => Array.isArray(v) ? v.length>0 : v !== null)) ) && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {getMatchedTags(p).map((t) => (
                                  <span key={t} className="text-xs bg-white/10 px-2 py-0.5 rounded-full border border-white/20">{t}</span>
                                ))}
                              </div>
                            )}
                         </div>
                          <span className="bg-white/10 px-3 py-1 rounded-full text-md font-semibold backdrop-blur-sm border border-white/10">
                            ${p.price.toFixed(2)}
                          </span>
                        </div>

                        <p className="text-white/80 text-sm mb-4 line-clamp-2 opacity-0 h-0 group-hover:h-auto group-hover:opacity-100 transition-all duration-300 delay-75">
                          Experience the taste of our premium {p.category.toLowerCase()}, baked fresh every morning with organic ingredients.
                        </p>

                        <div className="flex items-center justify-between mb-5">
                          <div className="flex items-center gap-1.5">
                            <Star className="w-4 h-4 fill-[#FFD700] text-[#FFD700]" />
                            <span className="text-white text-sm font-bold">{p.rating || "4.8"}</span>
                          </div>
                          <span className="text-white/60 text-xs font-medium uppercase tracking-widest">
                            {p.category}
                          </span>
                        </div>

                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isAuthenticated) {
                              alert('Please login first to add items to cart');
                              navigate('/login');
                              return;
                            }
                            void handleAddToCart(p, 1, isAuthenticated);
                          }}
                          disabled={!isAuthenticated}
                          className={`w-full font-bold py-3 rounded-xl transition-colors text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 group/btn ${
                            isAuthenticated
                              ? 'bg-[#D4A373] text-[#2C1810] hover:bg-[#F5ECD7]'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {isAuthenticated ? 'Add to Cart' : 'Login to Order'} <ShoppingBag size={16} className="group-hover/btn:scale-110 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
              </AnimatePresence>
            </motion.div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-20 flex flex-col items-center">
                <div className="w-24 h-24 bg-[#F5ECD7] rounded-full flex items-center justify-center mb-4 text-4xl">🍪</div>
                <h3 className="text-2xl font-playfair font-bold text-[#1A2744] mb-2">No items match your taste</h3>
                <p className="text-[#8D6E63]">Try adjusting your filters or search for something else.</p>
                <button 
                   onClick={() => setSelectedCategory("All")}
                   className="mt-6 text-[#D4A373] font-bold border-b-2 border-[#D4A373] hover:text-[#3E2723] hover:border-[#3E2723] transition-all"
                >
                  Clear Filters
                </button>
              </div>
            )}
        </main>
      </div>
      </div>

      <FooterSection />
    </div>
  );
}
