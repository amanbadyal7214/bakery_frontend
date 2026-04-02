import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProductActions } from "../components/home/home-data";
import { api } from "@/services/api";
import Navbar from "@/components/Navbaimport { 
  ArrowLeft, Star, ShoppingBag, Truck, ShieldCheck, Heart, 
  Share2, Plus, Minus, Info, ClipboardList, Zap, Package,
  ChefHat, Clock, Award, CheckCircle2, ChevronRight
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

  const [flavors, setFlavors] = useState<string[]>([
    "Classic Vanilla", "Rich Chocolate", "Red Velvet",
  ]);

  const [weightOptions, setWeightOptions] = useState<Array<{label:string; pack:string; multiplier:number}>>([
    { label: "500 g", pack: "Serves 4-6", multiplier: 1 },
    { label: "1 kg", pack: "Serves 8-10", multiplier: 1.8 },
  ]);

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

      <div className="pt-24 pb-20 px-4 md:px-8 max-w-[1440px] mx-auto">
        {/* Breadcrumbs & Back */}
        <div className="flex items-center gap-2 mb-10 text-sm text-[#7A5C4F]">
            <button onClick={() => navigate("/")} className="hover:text-[#2C1810] transition-colors">Home</button>
            <ChevronRight size={14} />
            <span className="text-[#D4A373] font-medium truncate max-w-[200px]">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20">
          
          {/* LEFT COLUMN: Gallery */}
          <div className="lg:col-span-7 space-y-8">
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

          {/* RIGHT COLUMN: Info */}
          <div className="lg:col-span-5 flex flex-col">
            <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
            >
                {/* Header Info */}
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <span className="px-4 py-1.5 bg-[#F2EBE3] text-[#7A5C4F] rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                            {product.category}
                        </span>
                        <div className="flex items-center gap-1.5 text-sm font-bold">
                            <Star size={14} className="fi3l-[#FFD700] text-[#FFD700]" />
                            <span>{product.rating || "5.0"}</span>
                             <span className="text-gray-400 fomd-normal">Rating</span>
                        </div>
                    </div>

                    <h1 className="font-playfair text-5xl md:text-6xl font-black text-[#2C1810] leading-tight">
                        {product.name}
                    </h1>

                    <p className="text-lg text-[#7A5C4F] leading-relaxed font-light">
                        {product.tasteDescription || product.description || "A masterfully crafted artisan creation, made with organic ingredients and baked fresh daily for an unparalleled sensory experience."}
                    </p>
                </div>

                {/* Price Section */}
                <div className="p-8 bg-white rounded-[2.5rem] shadow-[0_15px_35px_rgba(44,24,16,0.05)] border border-[#F2EBE3]">
                    <div className="flex items-center justify-between mb-8">
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-[#D4A373] uppercase tracking-widest">Premium Collection</p>
                            <div className="flex items-baseline gap-3">
                                <span className="text-5xl font-playfair font-black">{formatCurrency(currentPrice * quantity)}</span>
                                {quantity > 1 && <span className="text-[#7A5C4F] text-sm font-medium">({formatCurrency(currentPrice)} each)</span>}
                            </div>
                        </div>
                        <div className="hidden sm:flex flex-col items-end">
                            <p className="text-[10px] font-bold text-[#7A5C4F] uppercase tracking-wider">Premium Bakery Choice</p>
                        </div>
                    </div>

                    {/* Variant Selection */}
                    <div className="space-y-6">
                        {flavors.length > 0 && (
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-[#2C1810] flex items-center gap-2">
                                    <ChefHat size={16} className="text-[#D4A373]" /> Choice of Flavor
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {flavors.map((f) => (
                                        <button
                                            key={f}
                                            onClick={() => setSelectedFlavor(f)}
                                            className={`px-5 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${selectedFlavor === f ? "border-[#2C1810] bg-[#2C1810] text-white shadow-lg scale-105" : "border-[#F2EBE3] bg-white text-[#7A5C4F] hover:border-[#D4A373]"}`}
                                        >
                                            {f}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="space-y-3">
                            <label className="text-sm font-bold text-[#2C1810] flex items-center gap-2">
                                <Package size={16} className="text-[#D4A373]" /> Size & Portion
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {weightOptions.map((opt, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedWeightIndex(idx)}
                                        className={`p-4 rounded-2xl border-2 text-left transition-all relative ${selectedWeightIndex === idx ? "border-[#D4A373] bg-[#FDFBF7] shadow-md" : "border-[#F2EBE3] bg-white hover:border-[#D4A373]"}`}
                                    >
                                        <div className="font-bold text-sm mb-1">{opt.label}</div>
                                        <div className="text-[10px] text-[#7A5C4F] font-medium">{opt.pack}</div>
                                        {selectedWeightIndex === idx && <CheckCircle2 className="absolute top-3 right-3 text-[#D4A373]" size={16} />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Purchase Actions */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex items-center bg-white rounded-2xl p-1.5 shadow-md border border-[#F2EBE3]">
                        <button 
                            onClick={() => handleQuantityChange("dec")}
                            className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-[#F2EBE3] transition-colors text-[#2C1810] disabled:opacity-30"
                            disabled={quantity <= 1}
                        >
                            <Minus size={20} />
                        </button>
                        <span className="w-12 text-center text-xl font-black font-playfair">{quantity}</span>
                        <button 
                            onClick={() => handleQuantityChange("inc")}
                            className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-[#F2EBE3] transition-colors text-[#2C1810]"
                        >
                            <Plus size={20} />
                        </button>
                    </div>

                    <Button 
                        onClick={onAddToCart}
                        className="flex-1 h-[60px] bg-[#2C1810] text-white text-lg font-bold rounded-2xl hover:bg-[#D4A373] transition-all shadow-[0_10px_30px_rgba(44,24,16,0.2)] flex items-center justify-center gap-3 active:scale-95 group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-[#D4A373] translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        <span className="relative z-10 flex items-center gap-3">
                            <ShoppingBag size={22} /> Add to Cart
                        </span>
                    </Button>
                </div>

                {/* Quick Trust Badges */}
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
            </motion.div>
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                                <div className="space-y-6">
                                    <h3 className="text-3xl font-playfair font-black flex items-center gap-3"><ClipboardList className="text-[#D4A373]" /> The Artisan Way</h3>
                                    <p className="text-[#7A5C4F] leading-relaxed text-lg italic">"Every creation begins with a passion for excellence and ends with a smile on our client's face."</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-6 bg-white rounded-3xl border border-[#F2EBE3]">
                                            <p className="text-xs font-bold text-[#B08968] mb-1">OCCASION</p>
                                            <p className="font-bold">{product.occasion?.join(', ') || 'Any Day Sweetness'}</p>
                                        </div>
                                        <div className="p-6 bg-white rounded-3xl border border-[#F2EBE3]">
                                            <p className="text-xs font-bold text-[#B08968] mb-1">SHELF LIFE</p>
                                            <p className="font-bold">48-72 Hours</p>
                                        </div>
                                    </div>
                                    <Accordion type="single" collapsible className="w-full">
                                        <AccordionItem value="item-2" className="border-none bg-white rounded-2xl px-4">
                                            <AccordionTrigger className="hover:no-underline font-bold">Shipping Information</AccordionTrigger>
                                            <AccordionContent className="text-[#7A5C4F] pb-6">
                                                We currently offer same-day delivery across the metropolitan area for orders placed before 2 PM. Each item is hand-delivered in temperature-controlled packaging to ensure it reaches you in pristine condition.
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                </div>
                                <div className="relative">
                                    <div className="aspect-[4/3] rounded-[2.5rem] overflow-hidden bg-gray-100 shadow-2xl">
                                        <img src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80" alt="Bakery Process" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#2C1810]/60 to-transparent" />
                                        <div className="absolute bottom-8 left-8 right-8">
                                            <div className="flex items-center gap-4 text-white">
                                                <div className="w-12 h-12 rounded-full bg-[#D4A373] flex items-center justify-center"><Award size={24} /></div>
                                                <div>
                                                    <p className="font-bold text-lg">Award Winning Quality</p>
                                                    <p className="text-sm opacity-80">Certified Organic & Master Baked</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="ingredients" className="m-0 focus-visible:ring-0">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                                <div className="space-y-8">
                                    <div>
                                        <h3 className="text-3xl font-playfair font-black mb-4 flex items-center gap-3">
                                            <ChefHat className="text-[#D4A373]" /> Pure & Authentic
                                        </h3>
                                        <p className="text-[#7A5C4F] leading-relaxed italic">
                                            We believe in full transparency. Every ingredient is ethically sourced, organic, and chosen for its superior quality and flavor profile.
                                        </p>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <p className="text-xs font-bold text-[#B08968] tracking-widest uppercase">The Composition</p>
                                        <div className="flex flex-wrap gap-3">
                                            {(product.ingredients?.length > 0 ? product.ingredients : ["Organic Flour", "Unsalted Butter", "Cane Sugar", "Organic Eggs", "Natural Vanilla", "Sea Salt"]).map((ing: string, i: number) => (
                                                <div key={i} className="px-6 py-3 bg-white rounded-2xl border border-[#F2EBE3] shadow-sm flex items-center gap-2 hover:border-[#D4A373] transition-colors group">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-[#D4A373] group-hover:scale-150 transition-transform" />
                                                    <span className="font-bold text-[#2C1810] text-sm">{ing}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-8 bg-[#fff8e7] rounded-3xl border border-[#f5e6d3] space-y-3">
                                        <p className="text-sm font-bold text-[#8D6E63] flex items-center gap-2">
                                            <ShieldCheck size={18} /> ALLERGEN ADVISORY
                                        </p>
                                        <p className="text-sm text-[#7A5C4F] leading-relaxed font-medium">
                                            {product.allergens ? `Contains: ${product.allergens.join(', ')}.` : "Contains: Gluten, Dairy, and Eggs. Prepared in a facility that also processes tree nuts, soy, and peanuts."}
                                        </p>
                                    </div>
                                </div>
                                <div className="hidden lg:block relative">
                                    <div className="aspect-square rounded-[3rem] overflow-hidden border-8 border-white shadow-2xl">
                                        <img src="https://images.unsplash.com/photo-1595126731003-733b4395ff68?auto=format&fit=crop&q=80" alt="Ingredients" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-3xl shadow-xl border border-[#F2EBE3] flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-[#FDFBF7] flex items-center justify-center text-[#D4A373] shadow-inner"><Star className="fill-current" size={20} /></div>
                                        <div>
                                            <p className="font-black text-[#2C1810]">100% Organic</p>
                                            <p className="text-[10px] font-bold text-[#7A5C4F] uppercase tracking-widest">Sourced Locally</p>
                                        </div>
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
                                        { label: "Calories", val: "320 kcal", p: "15%" },
                                        { label: "Total Fat", val: "18g", p: "24%" },
                                        { label: "Proteins", val: "5.4g", p: "11%" },
                                        { label: "Carbs", val: "42g", p: "18%" },
                                    ].map((n, i) => (
                                        <div key={i} className="text-center space-y-2 group">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-[#B08968]">{n.label}</div>
                                            <div className="text-3xl font-playfair font-black text-[#2C1810] group-hover:text-[#D4A373] transition-colors">{n.val}</div>
                                            <div className="w-full bg-[#F2EBE3] h-1.5 rounded-full overflow-hidden">
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    whileInView={{ width: n.p }}
                                                    transition={{ duration: 1, delay: i * 0.1 }}
                                                    className="bg-[#D4A373] h-full rounded-full"
                                                />
                                            </div>
                                            <div className="text-[10px] font-bold text-[#7A5C4F]">{n.p} daily value</div>
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

            {/* Newsletter / CTA */}
            <section className="relative rounded-[4rem] overflow-hidden p-16 md:p-24 bg-[#2C1810] text-[#FDFBF7] text-center shadow-2xl">
                <div className="absolute inset-0 opacity-10">
                    <img src="https://images.unsplash.com/photo-1558961359-1d99283f085c?auto=format&fit=crop&q=80" alt="Pattern" className="w-full h-full object-cover grayscale" />
                </div>
                <div className="relative z-10 max-w-3xl mx-auto space-y-10">
                    <div className="inline-flex items-center gap-4 px-6 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                        <Star className="text-[#D4A373] animate-pulse" size={16} />
                        <span className="text-xs font-bold tracking-[0.3em] uppercase">The Artisan Club</span>
                    </div>
                    <h2 className="text-5xl md:text-7xl font-playfair font-black leading-tight">Join Our Sweetest Circle</h2>
                    <p className="text-xl text-[#F2EBE3]/70 font-light max-w-2xl mx-auto">Get exclusive access to seasonal releases, masterclass invites, and a little surprise on your birthday.</p>
                    <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                        <input 
                            type="email" 
                            placeholder="your email address" 
                            className="flex-1 bg-white/10 border-2 border-white/20 rounded-2xl px-8 h-[60px] text-white placeholder:text-white/40 focus:outline-none focus:border-[#D4A373] transition-all"
                        />
                        <Button className="h-[60px] px-10 bg-[#D4A373] text-[#2C1810] font-black rounded-2xl hover:bg-white transition-all">Subscribe</Button>
                    </div>
                </div>
            </section>

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
Name="flex items-start gap-4">
                <div className="p-3 bg-white rounded-xl text-[#D4A373] shadow-sm">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-[#2C1810] font-playfair">Fresh Guarantee</h4>
                  <p className="text-xs text-[#7A5C4F] mt-1">Baked fresh daily</p>
                </div>
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
}
ollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}} />
Name="flex items-start gap-4">
                <div className="p-3 bg-white rounded-xl text-[#D4A373] shadow-sm">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-[#2C1810] font-playfair">Fresh Guarantee</h4>
                  <p className="text-xs text-[#7A5C4F] mt-1">Baked fresh daily</p>
                </div>
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
}
