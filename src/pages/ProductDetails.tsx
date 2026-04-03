import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProductActions } from "../components/home/home-data";
import { api } from "@/services/api";
import Navbar from "@/components/Navbar";
import { 
  ArrowLeft, Star, ShoppingBag, Truck, ShieldCheck, Heart, 
  Share2, Plus, Minus, Info, ClipboardList, Zap, Package,
  ChefHat, Clock, Award, CheckCircle2, ChevronRight,
  History, PackageCheck, Leaf
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useSelector } from 'react-redux';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import FooterSection from "@/components/home/FooterSection";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { handleAddToCart } = useProductActions();
  const isAuthenticated = useSelector((state: { auth?: { isAuthenticated?: boolean } }) => Boolean(state.auth?.isAuthenticated));
  
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0); 
  const [product, setProduct] = useState<Record<string, any> | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedFlavor, setSelectedFlavor] = useState<string | null>(null);
  const [selectedWeightIndex, setSelectedWeightIndex] = useState(0);

  const [flavors, setFlavors] = useState<string[]>([]);

  const [weightOptions, setWeightOptions] = useState<Array<{label:string; pack:string; multiplier:number}>>([]);

  const getFirstImage = (prod: Record<string, any> | null): string => {
    if (!prod) return '/placeholder.svg';
    const imgBase64 = prod['imgBase64'];
    if (typeof imgBase64 === 'string' && imgBase64) return imgBase64;
    const img = prod['img'];
    if (typeof img === 'string' && img) return img;
    const images = prod['images'];
    if (Array.isArray(images) && images.length > 0) {
      const first = images[0];
      if (first && typeof first === 'object') {
        const firstRec = first as Record<string, any>;
        const base64 = firstRec['base64'];
        if (typeof base64 === 'string' && base64) return base64;
        const url = firstRec['url'];
        if (typeof url === 'string' && url) return url;
      } else if (typeof first === 'string') {
        return first;
      }
    }
    return '/placeholder.svg';
  };

  const extractProductImages = (prod: Record<string, any> | null): string[] => {
    const imgs: string[] = [];
    const first = getFirstImage(prod);
    if (first) imgs.push(first);
    const imagesField = prod?.['images'];
    if (Array.isArray(imagesField)) {
        imagesField.forEach((it) => {
        if (!it) return;
        if (typeof it === 'string') {
          imgs.push(it);
          return;
        }
        if (typeof it === 'object') {
          const rec = it as Record<string, any>;
          const b64 = rec['base64'];
          const url = rec['url'];
          if (typeof b64 === 'string' && b64) imgs.push(b64);
          else if (typeof url === 'string' && url) imgs.push(url);
        }
      });
    }
    return Array.from(new Set(imgs.filter(v => v && v !== '/placeholder.svg')));
  };

  const productImages = useMemo(() => {
    const imgs = extractProductImages(product);
    return imgs.length > 0 ? imgs : ['/placeholder.svg'];
  }, [product]);

  useEffect(() => {
    if (!id || id === 'undefined') {
      setError('Invalid product id.');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);

    Promise.all([
        api.products.getById(String(id)),
        api.products.getAll()
    ])
    .then(([p, allProducts]) => {
        setProduct(p);
        
        if (Array.isArray(p?.flavor) && p.flavor.length > 0) {
            setFlavors(p.flavor);
            setSelectedFlavor(p.flavor[0]);
        } else if (p?.flavor && typeof p.flavor === 'string') {
            setFlavors([p.flavor]);
            setSelectedFlavor(p.flavor);
        }

        if (Array.isArray(p?.weight) && p.weight.length > 0) {
            const parsed = p.weight.map((w: string, idx: number) => ({
                label: w,
                pack: w.includes('kg') ? 'Serves 8-12' : 'Serves 4-6',
                multiplier: w.includes('kg') ? 1.8 : 1
            }));
            setWeightOptions(parsed);
        }

        // Related products
        const related = allProducts
            .filter((item: any) => item._id !== id && item.category === p.category)
            .slice(0, 4);
        setRelatedProducts(related);
    })
    .catch((err) => {
        console.error(err);
        setError('Failed to load product details.');
    })
    .finally(() => {
        setLoading(false);
    });
  }, [id]);

  const currentPrice = useMemo(() => {
    if (!product) return 0;
    if (Array.isArray(product.pricesByWeight) && product.pricesByWeight[selectedWeightIndex] !== undefined) {
      return product.pricesByWeight[selectedWeightIndex];
    }
    return product.price || 0;
  }, [product, selectedWeightIndex]);

  const formatCurrency = (v: number) => {
      return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(v);
  };

  const handleQuantityChange = (type: "inc" | "dec") => {
    if (type === "dec" && quantity > 1) setQuantity(prev => prev - 1);
    if (type === "inc" && quantity < 20) setQuantity(prev => prev + 1);
  };

  const onAddToCart = () => {
    if (!isAuthenticated) {
      alert('Please login first to add items to cart');
      navigate('/login');
      return;
    }

    if (!product) return;
    
    const variantProduct = {
      ...product,
      name: `${product.name} (${selectedFlavor || 'Original'}, ${weightOptions[selectedWeightIndex]?.label || 'Standard'})`,
      price: currentPrice
    };

    void handleAddToCart(variantProduct, quantity, isAuthenticated);
  };

  const onBuyNow = async () => {
    if (!isAuthenticated) {
      alert('Please login to proceed to checkout');
      navigate('/login');
      return;
    }
    if (!product) return;
    const variantProduct = {
      ...product,
      name: `${product.name} (${selectedFlavor || 'Original'}, ${weightOptions[selectedWeightIndex]?.label || 'Standard'})`,
      price: currentPrice
    };
    // ensure item added then go to checkout
    try {
      await Promise.resolve(handleAddToCart(variantProduct, quantity, isAuthenticated));
    } catch (e) {
      console.error(e);
    }
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-[#D4A373] border-t-transparent rounded-full animate-spin" />
            <p className="font-playfair text-xl text-[#2C1810]">Preparing sweetness...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFBF7] p-6 text-center">
        <h2 className="text-4xl font-playfair font-bold text-[#2C1810] mb-4">Something went wrong</h2>
        <p className="text-[#7A5C4F] mb-8 max-w-md">{error || "We couldn't find the product you're looking for."}</p>
        <Button 
          onClick={() => navigate("/")}
          className="bg-[#2C1810] text-white hover:bg-[#D4A373] transition-all px-8 py-6 rounded-full"
        >
          <ArrowLeft className="mr-2" size={20} /> Back to Bakery
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-inter text-[#2C1810] overflow-x-hidden">
      <Navbar />
      
      {/* Scroll Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-[#D4A373] z-[60] origin-left"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
      />

      <div className="pt-24  w-full">
        {/* Breadcrumbs & Back */}
        <div className="flex items-center gap-2 mb-10 text-sm text-[#7A5C4F]">
            <button onClick={() => navigate("/")} className="hover:text-[#2C1810] transition-colors">Home</button>
            <ChevronRight size={14} />
            <span className="text-[#D4A373] font-medium truncate max-w-[200px]">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-16">
          
          {/* LEFT COLUMN: Gallery */}
          <div className="lg:col-span-5 space-y-8">
            <div className="sticky top-28">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative aspect-square md:aspect-[5/4] rounded-[3rem] overflow-hidden bg-white shadow-[0_20px_50px_rgba(44,24,16,0.12)] border-8 border-white"
                >
                    <AnimatePresence mode="wait">
                        <motion.img 
                            key={activeImage}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            src={productImages[activeImage]} 
                            alt={product.name} 
                            className="w-full h-full object-cover"
                        />
                    </AnimatePresence>
                    
                    {/* Floating Badges */}
                    <div className="absolute top-6 left-6 flex flex-col gap-2">
                        {product.badge && (
                            <Badge className="bg-[#2C1810] text-[#D4A373] border-none px-4 py-2 text-xs font-bold tracking-widest uppercase rounded-full shadow-lg">
                                {product.badge}
                            </Badge>
                        )}
                        <Badge className="bg-white/90 backdrop-blur-md text-[#2C1810] border-none px-4 py-2 text-xs font-bold rounded-full shadow-lg flex items-center gap-2">
                            <Zap size={14} className="text-[#D4A373] fill-[#D4A373]" /> Popular Choice
                        </Badge>
                    </div>

                    {/* Action Overlay */}
                    <div className="absolute top-6 right-6 flex flex-col gap-3">
                        <button className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-xl hover:bg-white hover:scale-110 transition-all text-red-500 group">
                            <Heart size={22} className="group-hover:fill-red-500" />
                        </button>
                        <button className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-xl hover:bg-white hover:scale-110 transition-all text-[#2C1810]">
                            <Share2 size={22} />
                        </button>
                    </div>
                </motion.div>

                {/* Thumbnails */}
                {productImages.length > 1 && (
                    <div className="flex gap-4 mt-8 overflow-x-auto pb-4 no-scrollbar justify-center">
                        {productImages.map((img, idx) => (
                            <button 
                                key={idx}
                                onClick={() => setActiveImage(idx)}
                                className={`relative w-24 h-24 rounded-2xl overflow-hidden bg-white border-4 transition-all flex-shrink-0 ${activeImage === idx ? 'border-[#D4A373] scale-105 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                            >
                                <img src={img} alt="Gallery" className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                )}
            </div>
          </div>

          {/* MIDDLE COLUMN: Info */}
          <div className="lg:col-span-4 flex flex-col">
            <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
            >
                {/* Header Info */}
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <span className="px-4 py-1.5 bg-[#F2EBE3] text-[#7A5C4F] rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
                            {product.category || "CAKE"}
                        </span>
                        <div className="flex items-center gap-1.5 text-sm font-bold text-[#D4A373]">
                            <Star size={16} className="fill-[#D4A373] text-[#D4A373]" />
                            <span className="text-[#2C1810]">{product.rating || "4.8"}</span>
                            <span className="text-gray-400 font-medium ml-1">Rating</span>
                        </div>
                    </div>

                    <h1 className="font-playfair text-3xl md:text-3xl font-black text-[#2C1810] leading-tight tracking-tight">
                        {product.name}
                    </h1>

                    <p className="text-md text-[#7A5C4F] leading-relaxed font-light max-w-xl">
                        {product.tasteDescription || product.description || "A masterfully crafted artisan creation, made with organic ingredients and baked fresh daily for an unparalleled sensory experience."}
                    </p>
                </div>

                {/* Variant Selection Card */}
                <div className="p-10 bg-white rounded-[3rem] shadow-[0_30px_60px_rgba(44,24,16,0.08)] border border-[#F2EBE3] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#FDFBF7] rounded-bl-[4rem] -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                    
                    <div className="relative z-10 space-y-10">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-[#B08968] uppercase tracking-[0.3em]">Premium Collection</p>
                                <div className="flex items-baseline gap-3">
                                    <span className="text-2xl font-playfair font-black text-[#2C1810]">{formatCurrency(currentPrice)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Variant Selection */}
                        <div className="space-y-8">
                            {flavors.length > 0 && (
                                <div className="space-y-4">
                                    <label className="text-xs font-black text-[#2C1810] uppercase tracking-widest flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#D4A373]" /> Choice of Flavor
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {flavors.map((f) => (
                                            <button
                                                key={f}
                                                onClick={() => setSelectedFlavor(f)}
                                                className={`px-6 py-3 rounded-2xl border-2 text-sm font-bold transition-all ${selectedFlavor === f ? "border-[#2C1810] bg-[#2C1810] text-white shadow-xl scale-105" : "border-[#F2EBE3] bg-white text-[#7A5C4F] hover:border-[#D4A373] hover:shadow-md"}`}
                                            >
                                                {f}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4">
                                <label className="text-xs font-black text-[#2C1810] uppercase tracking-widest flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#D4A373]" /> Size & Portion
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {weightOptions.map((opt, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedWeightIndex(idx)}
                                            className={`p-5 rounded-[2rem] border-2 text-left transition-all relative group/item ${selectedWeightIndex === idx ? "border-[#D4A373] bg-[#FDFBF7] shadow-lg ring-4 ring-[#D4A373]/5" : "border-[#F2EBE3] bg-white hover:border-[#D4A373] hover:shadow-md"}`}
                                        >
                                            <div className="font-black text-lg mb-0.5 text-[#2C1810]">{opt.label}</div>
                                            <div className="text-[11px] text-[#7A5C4F] font-bold uppercase tracking-wider">{opt.pack}</div>
                                            {selectedWeightIndex === idx && (
                                                <div className="absolute top-5 right-5 w-6 h-6 bg-[#D4A373] rounded-full flex items-center justify-center text-white shadow-md">
                                                    <CheckCircle2 size={14} />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Trust Badges & Mobile Actions */}
                <div className="space-y-8">
                    {/* Mobile Only Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 lg:hidden">
                        <div className="flex items-center bg-white rounded-2xl p-1.5 shadow-md border border-[#F2EBE3]">
                            <button onClick={() => handleQuantityChange("dec")} className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-[#F2EBE3] transition-colors" disabled={quantity <= 1}><Minus size={20} /></button>
                            <span className="w-12 text-center text-xl font-black font-playfair">{quantity}</span>
                            <button onClick={() => handleQuantityChange("inc")} className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-[#F2EBE3] transition-colors"><Plus size={20} /></button>
                        </div>
                        <Button onClick={onAddToCart} className="flex-1 h-[60px] bg-[#2C1810] text-white text-lg font-bold rounded-2xl hover:bg-[#D4A373] transition-all flex items-center justify-center gap-3">
                            <ShoppingBag size={22} /> Add to Cart
                        </Button>
                    </div>

                    <div className="flex items-center justify-between p-6 bg-white/50 border border-white rounded-[2rem] backdrop-blur-sm">
                        <div className="flex flex-col items-center gap-2 text-center group">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#D4A373] shadow-sm group-hover:scale-110 transition-all"><Truck size={18} /></div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A5C4F]">Free Shipping</span>
                        </div>
                        <div className="w-px h-10 bg-[#F2EBE3]" />
                        <div className="flex flex-col items-center gap-2 text-center group">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#D4A373] shadow-sm group-hover:scale-110 transition-all"><ShieldCheck size={18} /></div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A5C4F]">Secure Pay</span>
                        </div>
                        <div className="w-px h-10 bg-[#F2EBE3]" />
                        <div className="flex flex-col items-center gap-2 text-center group">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#D4A373] shadow-sm group-hover:scale-110 transition-all"><Clock size={18} /></div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A5C4F]">Freshly Baked</span>
                        </div>
                    </div>
                </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: Purchase Panel */}
          <div className="hidden lg:block lg:col-span-3 space-y-8">
            <div className="sticky top-28">
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/90 backdrop-blur-xl border border-white rounded-[3rem] shadow-[0_30px_60px_rgba(44,24,16,0.1)] p-12 space-y-12"
              >
                <div>
                  <p className="text-[10px] font-black text-[#7A5C4F] uppercase tracking-[0.3em] mb-4">One-time purchase</p>
                  <div className="flex items-baseline gap-4">
                    <span className="text-2xl font-playfair font-black text-[#2C1810]">{formatCurrency(currentPrice)}</span>
                  </div>
                  <p className="text-[11px] text-[#7A5C4F] mt-4 font-medium leading-relaxed">
                    FREE delivery where available — fastest delivery at checkout
                  </p>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-[#2C1810] uppercase tracking-widest flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#D4A373]" /> Size
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {weightOptions.map((opt, idx) => {
                      const optionPrice = Array.isArray(product.pricesByWeight) && product.pricesByWeight[idx] !== undefined
                        ? product.pricesByWeight[idx]
                        : product.price;
                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedWeightIndex(idx)}
                          className={`p-3 rounded-2xl text-left border-2 transition-all relative ${selectedWeightIndex === idx ? 'border-[#2C1810] bg-[#f8f3ea] shadow-md' : 'border-[#F2EBE3] bg-white'}`}
                        >
                          <div className="font-black text-xs text-[#2C1810]">{opt.label}</div>
                          <div className="text-[9px] text-[#7A5C4F] font-bold">{formatCurrency(optionPrice)}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 flex items-center bg-[#FDFBF7] rounded-2xl p-1.5 border border-[#F2EBE3]">
                    <button onClick={() => handleQuantityChange('dec')} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[#F2EBE3] transition-colors" disabled={quantity <= 1}><Minus size={16} /></button>
                    <div className="flex-1 text-center font-black text-lg font-playfair">{quantity}</div>
                    <button onClick={() => handleQuantityChange('inc')} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[#F2EBE3] transition-colors" disabled={quantity >= 20}><Plus size={16} /></button>
                  </div>
                  <div className={`px-4 py-3 rounded-2xl border ${product.stock > 0 ? 'bg-[#F2FDF2] border-[#D1FADF]' : 'bg-red-50 border-red-100'}`}>
                    <div className={`text-[9px] font-black uppercase tracking-widest ${product.stock > 0 ? 'text-[#16a34a]' : 'text-red-500'}`}>
                      {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </div>
                  </div>
                </div>

                <Button 
                    onClick={onAddToCart} 
                    disabled={product.stock <= 0}
                    className={`w-full h-16 text-white font-black text-lg rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-3 group ${product.stock > 0 ? 'bg-[#C69C6D] hover:bg-[#B08968] shadow-[0_15px_30px_rgba(198,156,109,0.2)]' : 'bg-gray-400 cursor-not-allowed'}`}
                >
                  {product.stock > 0 ? 'Add to cart' : 'Sold Out'}
                </Button>

                <div className="pt-6 border-t border-[#F2EBE3] space-y-4">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                    <span className="text-[#7A5C4F]">From</span>
                    <span className="text-[#2C1810]">Bakery</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                    <span className="text-[#7A5C4F]">Seller</span>
                    <span className="text-[#2C1810]">Bakery Direct</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>


        {/* BOTTOM SECTION: Tabs & Details */}
        <div className="mt-24 space-y-24">
            
            {/* Tabs for Detailed Info */}
            <section>
                <Tabs defaultValue="details" className="w-full">
                    <TabsList className="w-full justify-start bg-transparent border-b border-[#F2EBE3] rounded-none h-16 p-0 gap-8">
                        <TabsTrigger value="details" className="bg-transparent border-none text-xl font-playfair font-bold text-[#7A5C4F] data-[state=active]:text-[#2C1810] data-[state=active]:shadow-none data-[state=active]:border-b-4 data-[state=active]:border-[#D4A373] rounded-none h-full transition-all">Details</TabsTrigger>
                        <TabsTrigger value="ingredients" className="bg-transparent border-none text-xl font-playfair font-bold text-[#7A5C4F] data-[state=active]:text-[#2C1810] data-[state=active]:shadow-none data-[state=active]:border-b-4 data-[state=active]:border-[#D4A373] rounded-none h-full transition-all">Ingredients</TabsTrigger>
                        <TabsTrigger value="nutrition" className="bg-transparent border-none text-xl font-playfair font-bold text-[#7A5C4F] data-[state=active]:text-[#2C1810] data-[state=active]:shadow-none data-[state=active]:border-b-4 data-[state=active]:border-[#D4A373] rounded-none h-full transition-all">Nutrition</TabsTrigger>
                    </TabsList>
                    
                    <div className="py-12">
                        <TabsContent value="details" className="m-0 focus-visible:ring-0">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="space-y-8">
                                    <div className="p-10 bg-white rounded-[3rem] border border-[#F2EBE3] shadow-sm hover:shadow-xl transition-all h-full">
                                        <h3 className="text-2xl font-playfair font-black mb-6 flex items-center gap-3"><History className="text-[#D4A373]" /> Specifications</h3>
                                        <div className="space-y-4">
                                            {product.type && (
                                                <div className="flex justify-between items-center py-3 border-b border-[#FDFBF7]">
                                                    <span className="text-xs font-bold text-[#B08968] uppercase tracking-wider">Type</span>
                                                    <span className="font-bold text-[#2C1810]">{Array.isArray(product.type) ? product.type.join(', ') : product.type}</span>
                                                </div>
                                            )}
                                            {product.shape && (
                                                <div className="flex justify-between items-center py-3 border-b border-[#FDFBF7]">
                                                    <span className="text-xs font-bold text-[#B08968] uppercase tracking-wider">Shape</span>
                                                    <span className="font-bold text-[#2C1810]">{product.shape}</span>
                                                </div>
                                            )}
                                            {product.theme && (
                                                <div className="flex justify-between items-center py-3 border-b border-[#FDFBF7]">
                                                    <span className="text-xs font-bold text-[#B08968] uppercase tracking-wider">Theme</span>
                                                    <span className="font-bold text-[#2C1810]">{product.theme}</span>
                                                </div>
                                            )}
                                            {product.occasion && product.occasion.length > 0 && (
                                                <div className="flex justify-between items-center py-3">
                                                    <span className="text-xs font-bold text-[#B08968] uppercase tracking-wider">Occasions</span>
                                                    <span className="font-bold text-[#2C1810] text-right truncate max-w-[150px]">{product.occasion.join(', ')}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="p-10 bg-[#FDFBF7] rounded-[3rem] border border-[#D4A373]/20 shadow-sm h-full">
                                        <h3 className="text-2xl font-playfair font-black mb-6 flex items-center gap-3"><PackageCheck className="text-[#D4A373]" /> Storage & Care</h3>
                                        <div className="space-y-6">
                                            <div>
                                                <p className="text-xs font-black text-[#2C1810] uppercase tracking-widest mb-2">Optimal Freshness</p>
                                                <p className="text-[#7A5C4F] text-sm leading-relaxed">Best enjoyed at room temperature within 48 hours of delivery. Keep in an airtight container away from direct sunlight.</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 bg-white rounded-2xl border border-[#F2EBE3]">
                                                    <p className="text-[10px] font-bold text-[#B08968] mb-1 uppercase">Ambient</p>
                                                    <p className="font-bold text-sm text-[#2C1810]">2-3 Days</p>
                                                </div>
                                                <div className="p-4 bg-white rounded-2xl border border-[#F2EBE3]">
                                                    <p className="text-[10px] font-bold text-[#B08968] mb-1 uppercase">Refrigerated</p>
                                                    <p className="font-bold text-sm text-[#2C1810]">Up to 5 Days</p>
                                                </div>
                                            </div>
                                            <div className="pt-4 flex items-center gap-3 text-[#D4A373]">
                                                <Info size={16} />
                                                <p className="text-[11px] font-bold italic">Do not freeze to maintain delicate crumb structure.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="p-10 bg-white rounded-[3rem] border border-[#F2EBE3] shadow-sm h-full">
                                        <h3 className="text-2xl font-playfair font-black mb-6 flex items-center gap-3"><Truck className="text-[#D4A373]" /> Hand-Delivery Excellence</h3>
                                        <div className="space-y-6">
                                            <p className="text-[#7A5C4F] text-sm leading-relaxed">Each artisan piece is hand-carried in our signature temperature-controlled gift boxes. We guarantee it arrives as beautiful as when it left our studio.</p>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-4 text-sm font-bold text-[#2C1810]">
                                                    <div className="w-8 h-8 rounded-full bg-[#F2FDF2] flex items-center justify-center text-[#16a34a]"><CheckCircle2 size={16} /></div>
                                                    Signature Packaging Included
                                                </div>
                                                <div className="flex items-center gap-4 text-sm font-bold text-[#2C1810]">
                                                    <div className="w-8 h-8 rounded-full bg-[#F2FDF2] flex items-center justify-center text-[#16a34a]"><CheckCircle2 size={16} /></div>
                                                    Real-time Fleet Tracking
                                                </div>
                                                <div className="flex items-center gap-4 text-sm font-bold text-[#2C1810]">
                                                    <div className="w-8 h-8 rounded-full bg-[#F2FDF2] flex items-center justify-center text-[#16a34a]"><CheckCircle2 size={16} /></div>
                                                    BPA-Free Eco Materials
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="ingredients" className="m-0 focus-visible:ring-0">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                <div className="space-y-10">
                                    <div className="p-12 bg-white rounded-[3.5rem] border border-[#F2EBE3] shadow-sm relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FDFBF7] rounded-bl-full" />
                                        <div className="relative z-10">
                                            <h3 className="text-3xl font-playfair font-black mb-4 flex items-center gap-3">
                                                <ChefHat className="text-[#D4A373]" /> Pure Composition
                                            </h3>
                                            <p className="text-[#7A5C4F] leading-relaxed italic mb-10 max-w-lg">
                                                Our commitment to purity means zero additives, zero preservatives, and zero compromises. We trace every grain and drop back to its organic farm.
                                            </p>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                                {(product.ingredients || []).map((ing: string, i: number) => (
                                                    <div key={i} className="flex items-center justify-between pb-3 border-b border-[#FDFBF7] group">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-[#D4A373] group-hover:scale-150 transition-transform" />
                                                            <span className="font-bold text-[#2C1810] text-sm tracking-tight">{ing}</span>
                                                        </div>
                                                        <span className="text-[10px] font-black text-[#B08968] opacity-40 uppercase tracking-widest">Natural</span>
                                                    </div>
                                                ))}
                                                {(!product.ingredients || product.ingredients.length === 0) && (
                                                    <p className="text-[#7A5C4F] text-sm italic">Detailed ingredient list available upon request.</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="p-12 bg-[#2C1810] rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')] opacity-20" />
                                        <div className="relative z-10">
                                            <div className="inline-flex items-center gap-3 px-4 py-1 bg-[#D4A373] text-[#2C1810] rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                                                <ShieldCheck size={14} /> Quality Assurance
                                            </div>
                                            <h4 className="text-2xl font-playfair font-black text-white mb-6">Allergen Information & Traceability</h4>
                                            <div className="space-y-6">
                                                <p className="text-[#F2EBE3]/70 text-sm leading-relaxed">
                                                    {product.allergens ? `Contains: ${Array.isArray(product.allergens) ? product.allergens.join(', ') : product.allergens}.` : "Please contact our support for specific allergen inquiries regarding this micro-batch."}
                                                </p>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="p-5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                                                        <p className="text-[#D4A373] font-black text-xs uppercase tracking-tighter mb-1">Butter Origin</p>
                                                        <p className="text-white text-sm font-bold">Normandy, France</p>
                                                    </div>
                                                    <div className="p-5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                                                        <p className="text-[#D4A373] font-black text-xs uppercase tracking-tighter mb-1">Vanilla Type</p>
                                                        <p className="text-white text-sm font-bold">Bourbon Extract</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="p-8 bg-white rounded-[2.5rem] border border-[#F2EBE3] flex items-center justify-between group cursor-default">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-[#FDFBF7] flex items-center justify-center text-[#D4A373] shadow-inner group-hover:bg-[#D4A373] group-hover:text-white transition-all"><Leaf size={22} /></div>
                                            <div>
                                                <p className="font-black text-[#2C1810]">100% Sustainably Sourced</p>
                                                <p className="text-[10px] font-bold text-[#7A5C4F] uppercase tracking-widest">Ethical Farming Initiatives</p>
                                            </div>
                                        </div>
                                        <Star className="text-[#F2EBE3] group-hover:text-[#D4A373] transition-colors" size={24} />
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="nutrition" className="m-0 focus-visible:ring-0">
                            <div className="bg-white rounded-[3rem] p-12 border border-[#F2EBE3] shadow-sm max-w-4xl mx-auto">
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="w-14 h-14 rounded-full bg-[#FDFBF7] flex items-center justify-center text-[#D4A373]"><Info size={28} /></div>
                                    <div>
                                        <h3 className="text-3xl font-playfair font-black">Nutritional Transparency</h3>
                                        <p className="text-[#7A5C4F]">Values based on a single serving (100g approx.)</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                                    {[
                                        { 
                                            label: "Calories", 
                                            val: (product.totalNutrition?.calories || product.totalNutrition?.Calories) 
                                                ? (() => {
                                                    const v = product.totalNutrition.calories || product.totalNutrition.Calories;
                                                    return typeof v === 'object' ? `${v.value} ${v.unit}` : `${v} kcal`;
                                                  })()
                                                : null, 
                                            p: product.totalNutrition?.calories_dv
                                        },
                                        { 
                                            label: "Total Fat", 
                                            val: (product.totalNutrition?.fat || product.totalNutrition?.Fat) 
                                                ? (() => {
                                                    const v = product.totalNutrition.fat || product.totalNutrition.Fat;
                                                    return typeof v === 'object' ? `${v.value}${v.unit}` : v;
                                                  })()
                                                : null, 
                                            p: product.totalNutrition?.fat_dv
                                        },
                                        { 
                                            label: "Proteins", 
                                            val: (product.totalNutrition?.protein || product.totalNutrition?.Protein) 
                                                ? (() => {
                                                    const v = product.totalNutrition.protein || product.totalNutrition.Protein;
                                                    return typeof v === 'object' ? `${v.value}${v.unit}` : v;
                                                  })()
                                                : null, 
                                            p: product.totalNutrition?.protein_dv
                                        },
                                        { 
                                            label: "Carbs", 
                                            val: (product.totalNutrition?.carbs || product.totalNutrition?.Carbs) 
                                                ? (() => {
                                                    const v = product.totalNutrition.carbs || product.totalNutrition.Carbs;
                                                    return typeof v === 'object' ? `${v.value}${v.unit}` : v;
                                                  })()
                                                : null, 
                                            p: product.totalNutrition?.carbs_dv
                                        },
                                    ].filter(n => n.val !== null).map((n, i) => (
                                        <div key={i} className="text-center space-y-2 group">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-[#B08968]">{n.label}</div>
                                            <div className="text-3xl font-playfair font-black text-[#2C1810] group-hover:text-[#D4A373] transition-colors">{n.val}</div>
                                            {n.p && (
                                                <>
                                                    <div className="w-full bg-[#F2EBE3] h-1.5 rounded-full overflow-hidden">
                                                        <motion.div 
                                                            initial={{ width: 0 }}
                                                            whileInView={{ width: n.p }}
                                                            transition={{ duration: 1, delay: i * 0.1 }}
                                                            className="bg-[#D4A373] h-full rounded-full"
                                                        />
                                                    </div>
                                                    <div className="text-[10px] font-bold text-[#7A5C4F]">{n.p} daily value</div>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-12 p-8 bg-[#FDFBF7] rounded-3xl border-2 border-dashed border-[#F2EBE3]">
                                    <p className="text-sm font-bold text-[#7A5C4F] flex items-center gap-2 mb-2"><Info size={16} /> ALLERGEN INFORMATION</p>
                                    <p className="text-[#7A5C4F] text-sm leading-relaxed">This product contains gluten, dairy, and eggs. May contain traces of tree nuts and soy. All our products are prepared in a facility that handles common food allergens.</p>
                                </div>
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </section>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
                <section className="space-y-12">
                    <div className="flex items-end justify-between border-b pb-8 border-[#F2EBE3]">
                        <div className="space-y-2">
                            <h2 className="text-5xl font-playfair font-black">You'll Also Love</h2>
                            <p className="text-[#7A5C4F] text-lg">Curated pairings to complete your sweet experience</p>
                        </div>
                        <Button 
                            variant="ghost" 
                            onClick={() => navigate('/')}
                            className="text-[#2C1810] font-bold gap-2 hover:bg-[#F2EBE3] rounded-xl group"
                        >
                            View Entire Menu <ArrowLeft className="rotate-180 transition-transform group-hover:translate-x-2" size={20} />
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {relatedProducts.map((p) => (
                            <motion.div 
                                key={p._id}
                                whileHover={{ y: -10 }}
                                onClick={() => {
                                    navigate(`/product/${p._id}`);
                                    window.scrollTo(0, 0);
                                }}
                                className="group cursor-pointer"
                            >
                                <div className="relative aspect-square rounded-[2rem] overflow-hidden mb-6 shadow-lg border-2 border-white">
                                    <img 
                                        src={getFirstImage(p)} 
                                        alt={p.name} 
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                    />
                                    <div className="absolute inset-0 bg-[#2C1810]/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-[#2C1810] shadow-2xl scale-0 group-hover:scale-100 transition-transform duration-500 delay-100">
                                            <ShoppingBag size={24} />
                                        </div>
                                    </div>
                                    {p.badge && (
                                        <div className="absolute top-4 left-4">
                                            <Badge className="bg-white/90 backdrop-blur-md text-[#2C1810] border-none text-[8px] font-black uppercase tracking-widest px-3 py-1.5">{p.badge}</Badge>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2 text-center">
                                    <p className="text-[10px] font-black tracking-widest text-[#B08968] uppercase">{p.category}</p>
                                    <h4 className="font-playfair text-xl font-black text-[#2C1810] group-hover:text-[#D4A373] transition-colors line-clamp-1">{p.name}</h4>
                                    <p className="font-bold text-[#7A5C4F]">{formatCurrency(p.price)}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>
            )}

            {/* Footer */}
            <FooterSection />

        </div>
      </div>
      
      {/* Floating Checkout Button (Mobile Only) */}
      <div className="lg:hidden fixed bottom-6 left-6 right-6 z-[100]">
        <Button 
            onClick={onAddToCart}
            className="w-full h-16 bg-[#2C1810] text-[#FDFBF7] font-black rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center justify-between px-6 border-2 border-white/20 overflow-hidden group"
        >
            <div className="flex items-center gap-3">
                <ShoppingBag size={24} />
                <span className="text-lg">Add to Cart</span>
            </div>
            <span className="text-xl font-playfair">{formatCurrency(currentPrice * quantity)}</span>
        </Button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
