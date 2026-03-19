import { motion, Variants } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { api } from "@/services/api";

interface BackendGalleryItem {
  _id?: string;
  id?: string | number;
  imgBase64?: string;
  src?: string | { data?: number[] };
  alt?: string;
  title?: string;
}

export default function ImageGallerySection() {
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const item: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <section className="py-24 px-6 bg-[#fcfcfc]">
      <MotionGallery />
    </section>
  );

  function MotionGallery() {
    const [items, setItems] = useState<BackendGalleryItem[]>([]);
    const objectUrlsRef = useRef<string[]>([]);

    useEffect(() => {
      let mounted = true;
      const fetchItems = async () => {
        try {
          const res = await api.gallery.getAll() as any;
          const data = Array.isArray(res) ? res : (res && (res.data || res)) || [];

          // revoke previous URLs
          objectUrlsRef.current.forEach(u => { try { URL.revokeObjectURL(u); } catch (e) { /* ignore revoke error */ } });
          objectUrlsRef.current = [];

          const normalized = (data as any[]).map(d => {
            const it = d as BackendGalleryItem;
            let src: string | undefined;
            if (typeof it.imgBase64 === 'string' && it.imgBase64.trim()) {
              src = it.imgBase64;
              if (!src.startsWith('data:')) src = `data:image/png;base64,${src}`;
            } else if (typeof it.src === 'string') {
              src = it.src;
              if (!src.startsWith('data:') && !src.startsWith('/') && !src.startsWith('http')) {
                src = `data:image/png;base64,${src}`;
              }
            } else if (it.src && typeof it.src === 'object') {
              const maybe = it.src as { data?: number[] };
              if (Array.isArray(maybe.data)) {
                try {
                  const u8 = new Uint8Array(maybe.data);
                  const blob = new Blob([u8], { type: 'image/png' });
                  const url = URL.createObjectURL(blob);
                  objectUrlsRef.current.push(url);
                  src = url;
                } catch (e) { src = undefined; }
              }
            }

            return {
              id: it._id || it.id,
              src,
              alt: it.alt || it.title || '',
            } as BackendGalleryItem;
          });

          if (mounted) setItems(normalized.filter((i: BackendGalleryItem) => !!i.src));
        } catch (e) {
          // ignore — keep empty
        }
      };
      fetchItems();
      return () => {
        mounted = false;
        objectUrlsRef.current.forEach(u => { try { URL.revokeObjectURL(u); } catch (e) { /* ignore revoke error */ } });
        objectUrlsRef.current = [];
      };
    }, []);

    // static fallback images (used if backend returns too few)
    const fallback = [
      '/about-baker.png', '/bread.png', '/croissant.png', '/hero-bg.png', '/about-baker.png', '/cake.png'
    ];

    const slots = [...(items.slice(0, 6).map(i => i.src)), ...fallback].slice(0, 6) as string[];

    return (
      <motion.div 
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="max-w-6xl mx-auto"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[200px]">
          {/* 1st Column */}
          <motion.div variants={item} className="col-span-1 row-span-2 overflow-hidden rounded-xl">
              <img src={slots[0]} alt="Baker dusting flour" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          </motion.div>

          <motion.div variants={item} className="col-span-1 row-span-2 overflow-hidden rounded-xl bg-black">
              <img src={slots[1]} alt="Loaf of Bread" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          </motion.div>
          
          {/* 2nd Column - Large Span */}
            <motion.div variants={item} className="col-span-1 lg:col-span-1 row-span-1 lg:row-span-2 overflow-hidden rounded-xl">
                <div className="h-full flex flex-col gap-4">
                    <div className="flex-1 overflow-hidden rounded-xl">
                        <img src={slots[2]} alt="Croissants" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="flex-1 overflow-hidden rounded-xl">
                        <img src={slots[3]} alt="Bread prep" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                    </div>
                </div>
          </motion.div>


          {/* 3rd Column */}
          <motion.div variants={item} className="col-span-1 row-span-1 overflow-hidden rounded-xl">
                <img src={slots[4]} alt="Dark bread" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          </motion.div>

            <motion.div variants={item} className="col-span-1 row-span-1 lg:col-span-1 lg:row-span-1 overflow-hidden rounded-xl">
                <img src={slots[5]} alt="Chocolate dipped cake" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          </motion.div>
            
        </div>
      </motion.div>
    );
  }
}
