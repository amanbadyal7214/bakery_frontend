import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProductActions } from "../components/home/home-data";
import { api } from "@/services/api";
import Navbar from "@/components/Navbar";
import { ArrowLeft, Star, ShoppingBag, Truck, ShieldCheck, Heart, Share2, Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useSelector } from 'react-redux';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { handleAddToCart } = useProductActions();
  const isAuthenticated = useSelector((state: { auth?: { isAuthenticated?: boolean } }) => Boolean(state.auth?.isAuthenticated));
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0); 
  const [product, setProduct] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedFlavor, setSelectedFlavor] = useState<string | null>(null);
  const [selectedWeightIndex, setSelectedWeightIndex] = useState(0);

  // Use backend-provided flavors/weights when available, fall back to defaults
  const [flavors, setFlavors] = useState<string[]>([
    "Truffle Chocolate Cake", "Coffee Cake 2", "Butterscotch",
  ]);

  const [weightOptions, setWeightOptions] = useState<Array<{label:string; pack:string; multiplier:number}>>([
    { label: "500 g", pack: "Pack of 1", multiplier: 1 },
    { label: "1 kg", pack: "Pack of 1", multiplier: 1.8 },
  ]);

  // Helpers to safely extract images from a loosely-typed product object without using `any`.
  const getFirstImage = (prod: Record<string, unknown> | null): string => {
    if (!prod) return '/placeholder.svg';
    const imgBase64 = prod['imgBase64'];
    if (typeof imgBase64 === 'string' && imgBase64) return imgBase64;
    const img = prod['img'];
    if (typeof img === 'string' && img) return img;
    const images = prod['images'];
    if (Array.isArray(images) && images.length > 0) {
      const first = images[0];
      if (first && typeof first === 'object') {
        const firstRec = first as Record<string, unknown>;
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

  const extractProductImages = (prod: Record<string, unknown> | null): string[] => {
    const imgs: string[] = [];
    const first = getFirstImage(prod);
    if (first) imgs.push(first);
    const imagesField = prod?.['images'];
    if (Array.isArray(imagesField)) {
      imagesField.slice(0, 2).forEach((it) => {
        if (!it) return;
        if (typeof it === 'string') {
          imgs.push(it);
          return;
        }
        if (typeof it === 'object') {
          const rec = it as Record<string, unknown>;
          const b64 = rec['base64'];
          const url = rec['url'];
          if (typeof b64 === 'string' && b64) imgs.push(b64);
          else if (typeof url === 'string' && url) imgs.push(url);
        }
      });
    }
    // dedupe
    return Array.from(new Set(imgs.filter(Boolean)));
  };

  const productImages = useMemo(() => extractProductImages(product), [product]);

  useEffect(() => {
    // Guard against invalid route params (missing, empty or the literal 'undefined')
    if (!id || id === 'undefined' || String(id).trim() === '') {
      setError('Invalid product id.');
      return;
    }
    let mounted = true;
    setError(null);
    setLoading(true);
    // Ensure we pass a string id to the API
    api.products.getById(String(id))
      .then((res) => { 
        if (!mounted) return; 
        // Response shape from api is dynamic; allow explicit any here with a targeted eslint exception
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const p = res as any;
        setProduct(p);
        // hydrate flavors from backend
        if (Array.isArray(p?.flavor) && p.flavor.length > 0) {
          setFlavors(p.flavor as string[]);
          setSelectedFlavor(String(p.flavor[0]));
        }
        // hydrate weight options from backend (try to parse numeric values)
        if (Array.isArray(p?.weight) && p.weight.length > 0) {
          const parsed = (p.weight as string[]).map((w: string, idx: number) => {
            // try to extract number (kg or g)
            const match = w.match(/([0-9]+(?:\.[0-9]+)?)/);
            let multiplier = 1;
            if (match) {
              const num = Number(match[1]);
              // if label contains 'kg' assume base 0.5kg -> multiplier = (kg*1000)/500
              if (/kg/i.test(w)) multiplier = (num * 1000) / 500;
              else if (/g/i.test(w)) multiplier = num / 500;
              else multiplier = idx === 0 ? 1 : 1 + idx; // fallback
            }
            return { label: w, pack: 'Pack of 1', multiplier };
          });
          setWeightOptions(parsed);
          setSelectedWeightIndex(0);
        }
      })
      .catch((err) => {
        console.error(err);
        if (!mounted) return;
        // Prefer server-provided message, fall back to generic text
        const status = (err as unknown as { response?: { status?: number } })?.response?.status;
        if (status === 404) setError('Product not found.');
        else if (status === 500) setError('Server error while fetching product.');
        else setError((err as Error)?.message || 'Failed to load product');
      })
      .finally(() => { if (!mounted) return; setLoading(false); });
    return () => { mounted = false; };
  }, [id]);

  // Use backend-provided price for the selected weight if available.
  // If backend exposes a prices list (e.g. product.pricesByWeight), prefer that; otherwise use product.price as-is.
  const currentPrice = product
    ? (Array.isArray(product.pricesByWeight) && product.pricesByWeight[selectedWeightIndex] !== undefined)
      ? product.pricesByWeight[selectedWeightIndex]
      : product.price
    : 0;

  // Format price as Canadian dollars
  const formatCurrency = (v: number) => new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(v);

  // Keep backend price display unchanged unless quantity > 1 (then show calculated CAD total)
  // We'll compute mainPriceDisplay after product is available to avoid showing a formatted value over the raw backend value.
  // Fall back to formatted price if backend price is missing
  let backendPriceRaw: number | null = null;
  let mainPriceDisplay = '';
  if (product) {
    backendPriceRaw = product.price || null;
    mainPriceDisplay = quantity > 1
      ? formatCurrency(currentPrice)
      : (backendPriceRaw !== undefined && backendPriceRaw !== null ? String(backendPriceRaw) : formatCurrency(currentPrice));
  }

  if (loading) return <div className="p-6">Loading product...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;
  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFBF7]">
        <h2 className="text-4xl font-playfair font-bold text-[#2C1810] mb-4">Product Not Found</h2>
        <button 
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-[#D4A373] hover:text-[#B08968] transition-colors"
        >
          <ArrowLeft size={20} /> Back to Menu
        </button>
      </div>
    );
  }

  const handleQuantityChange = (type: "inc" | "dec") => {
    if (type === "dec" && quantity > 1) setQuantity(prev => prev - 1);
    if (type === "inc" && quantity < 10) setQuantity(prev => prev + 1);
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
      name: `${product.name} (${selectedFlavor}, ${weightOptions[selectedWeightIndex].label})`,
      price: currentPrice
    };

    void handleAddToCart(variantProduct, quantity, isAuthenticated);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-inter">
      <Navbar />
      
      <div className="pt-28 pb-16 px-6 w-full mx-auto">
        <button 
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-[#7A5C4F] hover:text-[#2C1810] mb-8 transition-colors text-sm font-medium uppercase tracking-wider group"
        >
          <div className="p-2 bg-white rounded-full shadow-sm group-hover:shadow-md transition-all">
            <ArrowLeft size={16} /> 
          </div>
          Back to Menu
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">
          
          {/* Left: Image Gallery Section */}
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative aspect-[4/5] md:aspect-square rounded-[2.5rem] overflow-hidden shadow-2xl bg-white p-12 group border-[3px] border-white ring-1 ring-black/5"
            >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#ff000000] to-[#00000005]" />
                <AnimatePresence mode="wait">
                    <motion.img 
                        key={activeImage}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        src={productImages[activeImage]} 
                        alt={product.name} 
                        className="w-full h-full object-contain drop-shadow-2xl z-10 relative"
                    />
                </AnimatePresence>
                
                {product.badge && (
                <span className="absolute top-8 left-8 bg-[#2C1810] text-[#D4A373] px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-xl z-20">
                    {product.badge}
                </span>
                )}

                <div className="absolute top-8 right-8 z-20 flex flex-col gap-3">
                    <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform text-red-500">
                        <Heart size={20} />
                    </button>
                    <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform text-[#2C1810]">
                        <Share2 size={20} />
                    </button>
                </div>
            </motion.div>

            {/* Thumbnail Navigation */}
            <div className="flex justify-center gap-4">
                {productImages.map((img, idx) => (
                    <button 
                        key={idx}
                        onClick={() => setActiveImage(idx)}
                        className={`relative w-24 h-24 rounded-2xl bg-white p-2 border-2 transition-all ${activeImage === idx ? 'border-[#D4A373] shadow-lg scale-105' : 'border-transparent opacity-70 hover:opacity-100 hover:scale-105'}`}
                    >
                        <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-contain" />
                    </button>
                ))}
            </div>
          </div>


          {/* Right: Details Section */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col h-full pt-4"
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 bg-[#F2EBE3] rounded-full text-[#D4A373] font-bold text-xs tracking-widest uppercase">{product.category}</span>
              <div className="flex items-center gap-2">
                {(() => {
                  const rating = Number(product.rating) || 0;
                  return [...Array(5)].map((_, i) => {
                    const filled = rating >= i + 1;
                    return (
                      <Star
                        key={i}
                        size={14}
                        className={filled ? "fill-[#FFD700] text-[#FFD700]" : "text-gray-300"}
                      />
                    );
                  });
                })()}
                <span className="text-[#2C1810] text-sm font-bold ml-2">{Number(product.rating).toFixed(1)}{product.reviewsCount ? ` • ${product.reviewsCount} reviews` : ''}</span>
              </div>
            </div>

            <h1 className="font-playfair text-5xl md:text-7xl font-bold text-[#2C1810] mb-6 leading-[0.9]">
              {product.name}
            </h1>

            
           

            <div className="flex items-end gap-6 mb-10">
              <span className="text-5xl font-playfair font-bold text-[#2C1810]">
                {quantity > 1 ? formatCurrency(currentPrice * quantity) : formatCurrency(currentPrice)}
              </span>
              {quantity > 1 && (
                 <span className="text-lg text-[#7A5C4F] font-medium mb-2">
                    ({formatCurrency(currentPrice)} each)
                 </span>
              )}
            </div>

            {/* Flavor Selection */}
            <div className="mb-8">
                <p className="text-[#2C1810] font-bold mb-3">Flavour Name: <span className="font-playfair">{selectedFlavor}</span></p>
                <div className="flex flex-wrap gap-2">
                    {flavors.map((flavor) => (
                        <button
                            key={flavor}
                            onClick={() => setSelectedFlavor(flavor)}
                            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                                selectedFlavor === flavor
                                ? "border-[#2C1810] bg-[#2C1810] text-white shadow-md"
                                : "border-gray-200 bg-white text-[#2C1810] hover:border-[#D4A373]"
                            }`}
                        >
                            {flavor}
                        </button>
                    ))}
                </div>
            </div>

            {/* Size Selection */}
            <div className="mb-10">
                <p className="text-[#2C1810] font-bold mb-3">Size: <span className="font-playfair">{weightOptions[selectedWeightIndex].label}</span> ({weightOptions[selectedWeightIndex].pack})</p>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
                    {weightOptions.map((option, index) => {
                         // Prefer backend price per weight if provided, else fall back to product.price
                         const optionPrice = Array.isArray(product.pricesByWeight) && product.pricesByWeight[index] !== undefined
                           ? product.pricesByWeight[index]
                           : product.price;
                         const originalPrice = optionPrice * 1.5;
                          return (
                            <button
                                key={index}
                                onClick={() => setSelectedWeightIndex(index)}
                                className={`text-left p-3 rounded-xl border-2 transition-all ${
                                    selectedWeightIndex === index
                                    ? "border-[#2C1810] bg-[#F2EBE3]"
                                    : "border-gray-100 bg-white hover:border-[#D4A373]"
                                }`}
                            >
                                <div className="font-bold text-[#2C1810] text-sm mb-1">{option.label}</div>
                                <div className="text-xs text-[#7A5C4F] mb-2">{option.pack}</div>
                                <div className="font-bold text-[#2C1810]">{formatCurrency(optionPrice)}</div>
                                <div className="text-xs text-gray-400 line-through">{formatCurrency(originalPrice)}</div>
                            </button>
                         );
                    })}
                 </div>
             </div>
            
            {/* Quantity & Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-6 mb-12">
                <div className="flex items-center bg-white rounded-full p-2 shadow-sm border border-gray-100 w-fit">
                    <button 
                        onClick={() => handleQuantityChange("dec")}
                        className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-[#2C1810]"
                        disabled={quantity <= 1}
                    >
                        <Minus size={20} />
                    </button>
                    <span className="w-12 text-center text-xl font-bold font-playfair">{quantity}</span>
                    <button 
                        onClick={() => handleQuantityChange("inc")}
                        className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-[#2C1810]"
                        disabled={quantity >= 10}
                    >
                        <Plus size={20} />
                    </button>
                </div>

                <Button 
                    onClick={onAddToCart}
                    className="flex-1 h-16 bg-[#2C1810] text-white font-bold text-lg rounded-full hover:bg-[#D4A373] hover:text-[#2C1810] transition-all shadow-xl hover:shadow-2xl active:scale-95 flex items-center justify-center gap-3 relative overflow-hidden group"
                >
                    <span className="relative z-10 flex items-center gap-3">
                        <ShoppingBag size={22} />
                        Add to Cart • {quantity > 1 ? formatCurrency(currentPrice * quantity) : formatCurrency(currentPrice)}
                    </span>
                    <div className="absolute inset-0 bg-[#D4A373] translate-y-[101%] group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
                </Button>
            </div>

            {/* Accordion Info */}
            <div className="mb-12">
                <Accordion type="single" collapsible className="w-full" defaultValue="desc">
                    <AccordionItem value="desc" className="border-b border-[#E5DACE]">
                        <AccordionTrigger className="text-[#2C1810] font-playfair font-bold text-lg hover:no-underline hover:text-[#D4A373]">Description</AccordionTrigger>
                        <AccordionContent className="text-[#7A5C4F] leading-relaxed text-base pt-2">
                            {product.tasteDescription || product.description || 'No description available.'}
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="ingredients" className="border-b border-[#E5DACE]">
                        <AccordionTrigger className="text-[#2C1810] font-playfair font-bold text-lg hover:no-underline hover:text-[#D4A373]">Ingredients & Allergens</AccordionTrigger>
                        <AccordionContent className="text-[#7A5C4F] leading-relaxed text-base pt-2">
                            {((product.ingredients || []) as string[]).length > 0 ? (
                                <div>
                                    <p className="mb-2">{(product.ingredients || []).join(', ')}</p>
                                    {product.allergens ? (
                                        <p className="text-sm text-[#8D6E63]">Contains: {(product.allergens || []).join(', ')}</p>
                                    ) : (
                                        <p className="text-sm text-[#8D6E63]">May contain common allergens (eggs, nuts, dairy) — check with bakery for specifics.</p>
                                    )}
                                </div>
                            ) : (
                                <p>No ingredients information provided.</p>
                            )}
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="nutrition" className="border-b border-[#E5DACE]">
                        <AccordionTrigger className="text-[#2C1810] font-playfair font-bold text-lg hover:no-underline hover:text-[#D4A373]">Nutrition</AccordionTrigger>
                        <AccordionContent className="text-[#7A5C4F] leading-relaxed text-base pt-2">
                            {product && product.totalNutrition && Object.keys(product.totalNutrition).length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {Object.entries(product.totalNutrition).map(([k, v], idx) => (
                                        <div key={`${k || 'nutr'}-${idx}`} className="flex justify-between items-center p-2 bg-white rounded-lg shadow-sm">
                                            <div className="text-sm font-medium text-[#2C1810]">{String(k).replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}</div>
                                            <div className="text-sm text-[#7A5C4F]">
                                                {(() => {
                                                    if (v == null) return '';
                                                    if (typeof v === 'object') {
                                                        if (Array.isArray(v)) return (v as unknown[]).map(i => String(i)).join(', ');
                                                        const anyV = v as Record<string, unknown> | null;
                                                        if (anyV && typeof anyV === 'object') {
                                                            if (anyV['value'] !== undefined && anyV['unit'] !== undefined) return `${String(anyV['value'])}${String(anyV['unit'])}`;
                                                            return Object.entries(anyV).map(([kk, vv]) => `${kk}: ${String(vv)}`).join(', ');
                                                        }
                                                    }
                                                    return String(v);
                                                })()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>No nutrition information provided.</p>
                            )}
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="shipping" className="border-b border-[#E5DACE]">
                        <AccordionTrigger className="text-[#2C1810] font-playfair font-bold text-lg hover:no-underline hover:text-[#D4A373]">Delivery & Shipping</AccordionTrigger>
                        <AccordionContent className="text-[#7A5C4F] leading-relaxed text-base pt-2">
                            {Array.isArray(product.delivery) && product.delivery.length > 0 ? (
                                // delivery items are flexible shapes from the API; allow any here
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                <ul className="list-disc pl-5 space-y-1">{product.delivery.map((d: any, i: number) => <li key={i}>{typeof d === 'string' ? d : (d.text || JSON.stringify(d))}</li>)}</ul>
                            ) : (
                                <p>Same Day Delivery available where applicable. Delivery charges and slots depend on location and order time.</p>
                            )}
                        </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="offers" className="border-b border-[#E5DACE]">
                        <AccordionTrigger className="text-[#2C1810] font-playfair font-bold text-lg hover:no-underline hover:text-[#D4A373]">Product Details</AccordionTrigger>
                        <AccordionContent className="text-[#7A5C4F] leading-relaxed text-base pt-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                <div><strong className="text-[#8D6E63]">Types:</strong> {(product.type || []).join(', ') || '—'}</div>
                                <div><strong className="text-[#8D6E63]">Occasions:</strong> {(product.occasion || []).join(', ') || '—'}</div>
                                <div><strong className="text-[#8D6E63]">Shape:</strong> {product.shape || '—'}</div>
                                <div><strong className="text-[#8D6E63]">Theme:</strong> {product.theme || '—'}</div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-6 p-6 bg-[#fff8e7] rounded-2xl border border-[#f5e6d3]">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white rounded-xl text-[#D4A373] shadow-sm">
                  <Truck size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-[#2C1810] font-playfair">Free Delivery</h4>
                  <p className="text-xs text-[#7A5C4F] mt-1">On orders over $50</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
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
