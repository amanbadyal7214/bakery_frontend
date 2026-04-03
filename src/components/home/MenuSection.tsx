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
          animate={loading ? "hidden" : "show"}
          className="grid grid-cols-2 md:grid-cols-4 gap-5"
        >
          {loading && (
            <div className="col-span-2 md:col-span-4 text-center py-12 text-gray-500">Loading menu…</div>
          )}
          {!loading && products.length === 0 && (
            <div className="col-span-2 md:col-span-4 text-center py-12 text-gray-500">No menu items available.</div>
          )}
          {products.slice(0, 8).map((p, i) => (
            <motion.article key={getProdId(p) || `prod-${i}`}
              variants={item}
              className="group relative h-[320px] rounded-2xl overflow-hidden shadow-xl cursor-pointer"
            >
              {/* Wrap the product card content with Link */}
              <Link to={`/product/${getProdId(p)}`} className="block h-full w-full">
                {/* Full Background Image */}
                <div className="absolute inset-0 w-full h-full">
                  <img
                    alt={p.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    src={imgMap[getProdId(p)] ?? p.img}
                  />
                </div>

                {/* Gradient Overlay: Dark Bottom to Transparent Top */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a0f0a] via-[#3E2723]/60 to-transparent opacity-90" />

                {/* Content Section */}
                <div className="absolute inset-0 p-4 flex flex-col justify-end text-white z-10">
                  <div className="transform transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                    <div className="flex justify-between items-end mb-1.5">
                      <div className="flex flex-col gap-0.5">
                        {p.badge && (
                          <span className="w-fit px-2 py-0.5 rounded-full bg-[#D4A373] text-[#2C1810] text-[0.6rem] font-bold uppercase tracking-wider mb-0.5">
                            {p.badge}
                          </span>
                        )}
                        <h3 className="font-playfair text-lg font-bold leading-tight group-hover:text-[#D4A373] transition-colors">
                          {p.name}
                        </h3>
                      </div>
                      <span className="bg-white/10 px-2 py-0.5 rounded-full text-sm font-semibold backdrop-blur-sm border border-white/10">
                        ${p.price.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-[#FFD700] text-[#FFD700]" />
                        <span className="text-white text-xs font-bold">4.8</span>
                      </div>
                      <span className="text-white/60 text-[0.65rem] font-medium uppercase tracking-widest">
                        {p.category}
                      </span>
                    </div>

                    {/* Add / Out of Stock button */}
                    {(() => {
                      const outOfStock = typeof (p as any).stock === 'number' ? Number((p as any).stock) <= 0 : false;
                      const disabled = outOfStock || !isAuthenticated;
                      const label = outOfStock ? 'Out of Stock' : (isAuthenticated ? 'Add to Order' : 'Login to Order');
                      const btnClass = disabled
                        ? 'w-full bg-gray-300 text-gray-600 font-bold py-2.5 text-sm rounded-full transition-colors shadow-none cursor-not-allowed'
                        : 'w-full bg-white text-[#2C1810] font-bold py-2.5 text-sm rounded-full hover:bg-[#D4A373] hover:text-[#2C1810] transition-colors shadow-lg active:scale-95 duration-200';

                      return (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            if (!isAuthenticated) {
                              alert('Please login first to add items to cart');
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
