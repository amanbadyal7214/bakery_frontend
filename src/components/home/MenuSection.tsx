import type { Product } from "./home-data";
import { useProductActions } from "./home-data";
import { Star } from "lucide-react";
import { motion, Variants } from "framer-motion";
import { Link, useNavigate } from "react-router-dom"; // Import Link for navigation
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

export default function MenuSection() {
  const { handleAddToCart, scrollTo } = useProductActions();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  // load products from backend (no local fallback)
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://bakery-bakend.onrender.com/api/products?limit=8`, { signal: controller.signal });
        if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
        const json = await res.json();
        console.log('MenuSection API response:', json);
        // accept either { data: [...] } or raw array response
        const result = json && Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : null);
        if (mounted && result) setProducts(result as Product[]);
        else if (mounted) {
          console.warn('MenuSection unexpected API format — not using local fallback');
          setProducts([]);
        }

      } catch (err) {
        console.warn('MenuSection fetch error:', err);
        if (mounted) setProducts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    console.log('MenuSection products state:', products);
  }, [products]);

  // helper to get a stable string id for a product (supports id:number or _id:string)
  const getProdId = (prod: Product | Record<string, unknown>) =>
    String((prod as Product).id ?? (prod as Record<string, unknown>)['_id'] ?? '');

  // Convert any product.img that is a base64 data URL into an object URL for display
  const [imgMap, setImgMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const createdUrls: string[] = [];
    const map: Record<string, string> = {};

    products.forEach((p) => {
      const id = getProdId(p);
      try {
        // look for a data URL in commonly used fields
        const record = p as unknown as Record<string, unknown>;
        const candidates: string[] = [];
        const fields = ['img', 'imgBase64', 'image'];
        for (const f of fields) {
          const v = record[f];
          if (typeof v === 'string') candidates.push(v);
        }
        if (Array.isArray(record['images'])) {
          const arr = record['images'] as unknown[];
          if (arr.length) {
            const first = arr[0] as Record<string, unknown> | undefined;
            if (first) {
              const b = first['base64'];
              const u = first['url'];
              if (typeof b === 'string') candidates.push(b);
              if (typeof u === 'string') candidates.push(u);
            }
          }
        }

        // find first candidate that is a data URL
        const dataUrl = candidates.find((c) => typeof c === 'string' && c.startsWith('data:image')) as string | undefined;
        if (!dataUrl) return;

        const parts = dataUrl.split(',');
        const meta = parts[0] || '';
        const base64 = parts[1] || '';
        const m = meta.match(/data:([^;]+);base64/);
        const mime = m ? m[1] : 'image/png';
        const byteString = atob(base64);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
        const blob = new Blob([ab], { type: mime });
        const url = URL.createObjectURL(blob);
        if (id) map[id] = url;
        createdUrls.push(url);
      } catch (e) {
        // ignore conversion errors, fallback to original string
      }
    });

    if (Object.keys(map).length) setImgMap((prev) => ({ ...prev, ...map }));

    return () => {
      // revoke created object URLs when products change/unmount
      createdUrls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [products]);

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
    hidden: { opacity: 0, y: 50 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <section id="menu" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-[0.8rem] font-bold tracking-[0.2em] uppercase text-gold mb-3">Our Menu</p>
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-bread-dark mb-4">Made to Delight</h2>
          <p className="text-[#7A5C4F] max-w-xl mx-auto text-base leading-relaxed">
            From flaky morning croissants to celebration cakes — something for every craving.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 md:grid-cols-4 gap-5"
        >
          {loading && Array.from({ length: 8 }).map((_, i) => (
            <motion.article key={`skeleton-${i}`}
              variants={item}
              className="bg-[#FCFAFA] rounded-[2rem] overflow-hidden shadow-[0_10px_40px_rgba(62,39,35,0.05)] border border-[#3E2723]/5 flex flex-col h-full animate-pulse"
            >
              <div className="block h-full w-full p-3 flex flex-col">
                {/* Image Skeleton */}
                <div className="relative aspect-square w-full rounded-[1.5rem] overflow-hidden mb-4 bg-gray-200"></div>

                {/* Content Skeleton */}
                <div className="flex-1 flex flex-col px-1">
                  <div className="h-5 bg-gray-200 rounded-md w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded-md w-1/2 mb-2"></div>

                  {/* Price & Action Skeleton */}
                  <div className="mt-auto pt-3 border-t border-[#3E2723]/5 flex items-center justify-between gap-3">
                    <div className="flex flex-col gap-1 w-full max-w-[60px]">
                      <div className="h-2 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                    </div>
                    <div className="h-8 bg-gray-200 rounded-xl w-24"></div>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
          {!loading && products.length === 0 && (
            <div className="col-span-2 md:col-span-4 text-center py-12 text-gray-500">No menu items available.</div>
          )}
          {products.slice(0, 8).map((p, i) => (
            <motion.article key={getProdId(p) || `prod-${i}`}
              variants={item}
              className="bg-[#FCFAFA] rounded-[2rem] overflow-hidden shadow-[0_10px_40px_rgba(62,39,35,0.05)] hover:shadow-[0_20px_50px_rgba(62,39,35,0.12)] transition-all duration-500 border border-[#3E2723]/5 flex flex-col h-full group"
            >
              <Link to={`/product/${getProdId(p)}`} className="block h-full w-full p-3 flex flex-col">
                {/* Image Container */}
                <div className="relative aspect-square w-full rounded-[1.5rem] overflow-hidden mb-4 bg-[#F5F1ED]">
                  <img
                    alt={p.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    src={imgMap[getProdId(p)] ?? p.img}
                  />

                  {/* Badge */}
                  {p.badge && (
                    <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md shadow-sm flex items-center gap-1">
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
                    <span className="text-[#3E2723] text-xs font-bold">4.8</span>
                    <span className="text-[#3E2723]/40 text-[10px] uppercase font-bold tracking-widest ml-auto">{p.category}</span>
                  </div>

                  {/* Price & Action */}
                  <div className="mt-auto pt-3 border-t border-[#3E2723]/5 flex items-center justify-between gap-3">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-[#3E2723]/40 italic">Price</span>
                      <span className="text-sm font-bold text-[#3E2723]">${p.price.toFixed(2)}</span>
                    </div>

                    {(() => {
                      const outOfStock = typeof (p as any).stock === 'number' ? Number((p as any).stock) <= 0 : false;
                      const disabled = outOfStock;
                      const label = outOfStock ? 'Soon' : 'Add To Cart';
                      const btnClass = disabled
                        ? 'bg-gray-100 text-gray-400 font-bold py-2 px-4 text-[9px] rounded-xl cursor-not-allowed uppercase tracking-widest'
                        : 'bg-[#3E2723] text-white font-bold py-2 px-4 text-[9px] rounded-xl hover:bg-[#D4A373] hover:text-[#3E2723] transition-all shadow-md hover:shadow-lg active:scale-95 duration-200 uppercase tracking-widest';

                      return (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            if (!isAuthenticated) {
                              navigate('/login');
                              return;
                            }
                            if (outOfStock) return;
                            void handleAddToCart(p, 1, isAuthenticated);
                          }}
                          disabled={disabled}
                          className={btnClass}
                        >
                          {label}
                        </button>
                      );
                    })()}
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <button
            onClick={() => scrollTo("Contact")}
            className="border-2 border-bread-brown text-bread-brown bg-transparent px-8 py-3.5 rounded-full font-semibold hover:bg-bread-brown hover:text-white transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
          >
            See Full Menu
          </button>
        </motion.div>
      </div>
    </section>
  );
}
