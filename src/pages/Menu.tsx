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
import { useToast } from '@/hooks/use-toast';

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
    suboccasion: [],
    subtheme: [],
    priceRange: [0, 5000],
    weight: [],
    delivery: [],
    dietary: [],
    rating: null,
    shape: [],
    theme: [],
  });

  const { handleAddToCart } = useProductActions();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state: any) => state.auth.isAuthenticated);
  const { toast } = useToast();

  // products loaded from backend API (replace demo import)
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  // pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

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
    const prodFlavor = Array.isArray(p.flavor) ? p.flavor : (typeof p.flavor === 'string' ? p.flavor.split(',').map((s: string) => s.trim()) : []);
    const matchedFlavor = filters.flavor?.filter(f => prodFlavor.includes(f)) || [];
    pushIf(matchedFlavor);

    // type
    const prodType = Array.isArray(p.type) ? p.type : (typeof p.type === 'string' ? p.type.split(',').map((s: string) => s.trim()) : []);
    const matchedType = filters.type?.filter(t => prodType.includes(t)) || [];
    pushIf(matchedType);

    // occasion (also consider sub-occasions on product)
    const prodOcc = Array.isArray(p.occasion) ? p.occasion : (typeof p.occasion === 'string' ? p.occasion.split(',').map((s: string) => s.trim()) : []);
    const prodSubOcc = Array.isArray(p.suboccasions) ? p.suboccasions : (typeof p.suboccasions === 'string' ? p.suboccasions.split(',').map((s: string) => s.trim()) : []);
    const matchedOcc = filters.occasion?.filter(o => prodOcc.includes(o) || prodSubOcc.includes(o)) || [];
    pushIf(matchedOcc);

    // weight
    const prodWeight = Array.isArray(p.weight) ? p.weight : (typeof p.weight === 'string' ? p.weight.split(',').map((s: string) => s.trim()) : []);
    const matchedWeight = filters.weight?.filter(w => prodWeight.includes(w)) || [];
    pushIf(matchedWeight);

    // delivery, dietary, shape, theme (also consider subthemes)
    const prodDelivery = Array.isArray(p.delivery) ? p.delivery : (p.delivery ? [p.delivery] : []);
    pushIf(filters.delivery?.filter(d => prodDelivery.includes(d)));

    const prodDietary = Array.isArray(p.dietary) ? p.dietary : (p.dietary ? [p.dietary] : []);
    pushIf(filters.dietary?.filter(d => prodDietary.includes(d)));

    const prodSubthemes = Array.isArray(p.subthemes) ? p.subthemes : (typeof p.subthemes === 'string' ? p.subthemes.split(',').map((s: string) => s.trim()) : []);
    if (filters.shape && filters.shape.length > 0 && p.shape && filters.shape.includes(p.shape)) pushIf([p.shape]);
    const matchedTheme = (filters.theme?.filter(t => (p.theme && matches(p.theme, t)) || prodSubthemes.includes(t))) || [];
    pushIf(matchedTheme);

    // also always surface any available subtheme/suboccasion labels (not filter-driven)
    pushIf(prodSubthemes);
    pushIf(prodSubOcc);

    return tags.slice(0, 8);
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
    // whenever filters change, go back to first page
    setCurrentPage(1);
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

  const fieldMatchesAny = (fieldValue: unknown, filtersArr: string[]) => {
    if (!filtersArr || filtersArr.length === 0) return true;
    if (Array.isArray(fieldValue)) {
      return filtersArr.some(f => (fieldValue as unknown[]).some((v) => matches(String(v), f)));
    }
    return filtersArr.some(f => matches(String(fieldValue), f));
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

    // occasion: check both main occasion field and suboccasions
    if (filters.occasion.length > 0) {
      const prodOcc = Array.isArray(p.occasion) ? p.occasion : (typeof p.occasion === 'string' ? p.occasion.split(',').map((s: string) => s.trim()) : []);
      const prodSubOcc = Array.isArray(p.suboccasions) ? p.suboccasions : (typeof p.suboccasions === 'string' ? p.suboccasions.split(',').map((s: string) => s.trim()) : []);
      const occMatch = filters.occasion.some(o => prodOcc.some((v: string) => matches(v, o)) || prodSubOcc.some((v: string) => matches(v, o)));
      if (!occMatch) return false;
    }

    if (filters.weight.length > 0 && !fieldMatchesAny(p.weight, filters.weight)) return false;
    if (filters.delivery.length > 0 && !fieldMatchesAny(p.delivery, filters.delivery)) return false;
    if (filters.dietary.length > 0 && !fieldMatchesAny(p.dietary, filters.dietary)) return false;

    // shape
    if (filters.shape.length > 0 && !filters.shape.some(s => matches(p.shape, s))) return false;

    // theme: check main theme and subthemes
    if (filters.theme.length > 0) {
      const prodTheme = p.theme;
      const prodSubthemes = Array.isArray(p.subthemes) ? p.subthemes : (typeof p.subthemes === 'string' ? p.subthemes.split(',').map((s: string) => s.trim()) : []);
      const themeMatch = filters.theme.some(t => (prodTheme && matches(prodTheme, t)) || prodSubthemes.some((v: string) => matches(v, t)));
      if (!themeMatch) return false;
    }

    return true;
  });

  // ensure currentPage is valid when filteredProducts changes
  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [filteredProducts.length, currentPage, itemsPerPage]);

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
                      // reset pagination when switching top category
                      setCurrentPage(1);
                    }}
                    className={`whitespace-nowrap px-6 py-2.5 rounded-2xl text-sm font-bold tracking-wide transition-all duration-300 border-2 select-none ${selectedCategory === cat
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
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 lg:gap-8"
            >
              <AnimatePresence mode="popLayout">
                {loading ? (
                  Array.from({ length: 15 }).map((_, i) => (
                    <motion.article key={`skeleton-${i}`}
                      variants={item}
                      className="bg-[#FCFAFA] rounded-[2rem] overflow-hidden shadow-[0_10px_40px_rgba(62,39,35,0.05)] border border-[#3E2723]/5 flex flex-col h-full animate-pulse"
                    >
                      <div className="block h-full w-full p-3 flex flex-col">
                        <div className="relative aspect-square w-full rounded-[1.5rem] overflow-hidden mb-4 bg-gray-200"></div>
                        <div className="flex-1 flex flex-col px-1">
                          <div className="h-5 bg-gray-200 rounded-md w-3/4 mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded-md w-1/2 mb-2"></div>
                          <div className="mt-auto pt-3 border-t border-[#3E2723]/5 flex items-center justify-between gap-3">
                            <div className="flex flex-col gap-1 w-full max-w-[60px]">
                              <div className="h-2 bg-gray-200 rounded w-full"></div>
                              <div className="h-4 bg-gray-200 rounded w-full"></div>
                            </div>
                            <div className="h-10 bg-gray-200 rounded-xl w-24"></div>
                          </div>
                        </div>
                      </div>
                    </motion.article>
                  ))
                ) : (
                  /* paginate filteredProducts */
                  (() => {
                    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
                    const start = (currentPage - 1) * itemsPerPage;
                    const pagedProducts = filteredProducts.slice(start, start + itemsPerPage);
                    return pagedProducts.map((p, pIndex) => {
                      // determine stock availability from variants first, then common field names
                      let bestVariant: any = null;
                      if (Array.isArray(p.variants) && p.variants.length > 0) {
                        bestVariant = p.variants.find((v: any) => Number(v.stock) > 0) || p.variants[0];
                      }
                      const currentVariantStock = bestVariant ? Number(bestVariant.stock) : Number(p.stock);
                      const inStock = (() => {
                        if (!p) return false;
                        if (!Number.isNaN(currentVariantStock)) return currentVariantStock > 0;
                        if (typeof p.quantity === 'number') return p.quantity > 0;
                        if (typeof p.available === 'boolean') return p.available === true;
                        // fallback: if there's an inventory field
                        if (typeof p.inventory === 'number') return p.inventory > 0;
                        // if no clear field, assume available
                        return true;
                      })();

                      return (
                        <motion.article key={p._id || p.id || `fallback-${pIndex}`}
                          layout
                          variants={item}
                          initial="hidden"
                          animate="show"
                          exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                          className="bg-[#FCFAFA] rounded-[2rem] overflow-hidden shadow-[0_10px_40px_rgba(62,39,35,0.05)] hover:shadow-[0_20px_50px_rgba(62,39,35,0.12)] transition-all duration-500 border border-[#3E2723]/5 flex flex-col h-full group"
                        >
                          <div onClick={() => {
                            const prodId = (p && (p._id ?? p.id ?? '')) || '';
                            if (!prodId) {
                              console.warn('Product missing id, not navigating to detail:', p);
                              return;
                            }
                            navigate(`/product/${prodId}`);
                          }} className="block h-full w-full p-3 flex flex-col cursor-pointer">
                            {/* Image Container */}
                            <div className="relative aspect-square w-full rounded-[1.5rem] overflow-hidden mb-4 bg-[#F5F1ED]">
                              <img src={getImageSrc(p)} alt={p.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />

                              {/* Badge */}
                              {p.badge && (
                                <div className="absolute top-2.5 left-2.5 px-2.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md shadow-sm flex items-center gap-1.5 animate-in fade-in slide-in-from-left-4 duration-500">
                                  <Star size={10} className="fill-[#D4A373] text-[#D4A373]" />
                                  <span className="text-[#3E2723] text-[0.6rem] font-bold uppercase tracking-wider">
                                    {p.badge}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Content Section */}
                            <div className="flex-1 flex flex-col px-1">
                              <div className="flex justify-between items-start mb-1">
                                <h3 className="font-playfair text-base font-bold text-[#3E2723] group-hover:text-[#D4A373] transition-colors line-clamp-1">
                                  {p.name}
                                </h3>
                              </div>

                              <div className="flex items-center gap-1.5 mb-2 text-[#D4A373]">
                                <Star size={12} className="fill-[#D4A373] text-[#D4A373]" />
                                <span className="text-[#3E2723] text-xs font-bold">{p.rating || "4.8"}</span>
                                <span className="text-[#3E2723]/40 text-[10px] uppercase font-bold tracking-widest ml-auto">{p.category}</span>
                              </div>

                              {/* show which selected filters this product matches */}
                              {(filters && (Object.values(filters).some(v => Array.isArray(v) ? v.length > 0 : v !== null))) && (
                                <div className="mb-4 flex flex-wrap gap-1.5">
                                  {getMatchedTags(p).slice(0, 2).map((t) => (
                                    <span key={t} className="text-[9px] bg-[#3E2723]/5 text-[#3E2723] px-2 py-0.5 rounded-full border border-[#3E2723]/10 font-bold capitalize">
                                      {t}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Price & Action */}
                              <div className="mt-auto pt-3 border-t border-[#3E2723]/5 flex items-center justify-between gap-3">
                                <div className="flex flex-col">
                                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#3E2723]/40 italic">Price</span>
                                  <span className="text-sm font-bold text-[#3E2723]">${(bestVariant ? bestVariant.price : p.price).toFixed(2)}</span>
                                </div>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (!isAuthenticated) {
                                      toast({ title: 'Login required', description: 'Please sign in to add items to cart.' });
                                      navigate('/login');
                                      return;
                                    }
                                    if (!inStock) {
                                      toast({ title: 'Out of stock', description: 'This item is currently unavailable.' });
                                      return;
                                    }

                                    const baseWeight = bestVariant ? bestVariant.weight : (Array.isArray(p.weight) && p.weight.length > 0 ? p.weight[0] : 'Standard');
                                    const baseFlavor = Array.isArray(p.flavor) && p.flavor.length > 0 ? p.flavor[0] : (typeof p.flavor === 'string' ? p.flavor : 'Original');
                                    const basePrice = bestVariant ? bestVariant.price : (Array.isArray(p.pricesByWeight) && p.pricesByWeight[0] !== undefined ? p.pricesByWeight[0] : p.price);

                                    const variantProductToAdd = {
                                      ...p,
                                      name: `${p.name} (${baseFlavor}, ${baseWeight})`,
                                      price: basePrice,
                                      stock: currentVariantStock || 0
                                    };
                                    void handleAddToCart(variantProductToAdd, 1, isAuthenticated);
                                  }}
                                  disabled={!inStock}
                                  className={`font-bold h-10 px-4 text-[9px] rounded-xl transition-all duration-300 uppercase tracking-widest flex items-center justify-center gap-1.5 ${!inStock
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-[#3E2723] text-white hover:bg-[#D4A373] hover:text-[#3E2723] shadow-md hover:shadow-lg active:scale-95'
                                    }`}
                                >
                                  <ShoppingBag size={12} />
                                  {!inStock ? 'Soon' : 'Add To Cart'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.article>
                      );
                    });
                  })())}
              </AnimatePresence>
            </motion.div>

            {/* pagination controls */}
            {filteredProducts.length > itemsPerPage && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 rounded-md font-semibold ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white border border-[#D4A373] text-[#3E2723]'}`}>
                  Previous
                </button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage)) }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-md ${currentPage === page ? 'bg-[#3E2723] text-[#F5ECD7]' : 'bg-white border border-[#E8E2D8] text-[#3E2723]'}`}>
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredProducts.length / itemsPerPage), prev + 1))}
                  disabled={currentPage === Math.ceil(filteredProducts.length / itemsPerPage)}
                  className={`px-3 py-2 rounded-md font-semibold ${currentPage === Math.ceil(filteredProducts.length / itemsPerPage) ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white border border-[#D4A373] text-[#3E2723]'}`}>
                  Next
                </button>
              </div>
            )}

            {!loading && filteredProducts.length === 0 && (
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
