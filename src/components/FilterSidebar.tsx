import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { X, Filter } from "lucide-react";
import { api } from "@/services/api";

export interface FilterState {
  category: string[];
  flavor: string[];
  type: string[];
  occasion: string[];
  suboccasion: string[];
  subtheme: string[];
  priceRange: [number, number];
  weight: string[];
  delivery: string[];
  dietary: string[];
  rating: number | null;
  shape: string[];
  theme: string[];
}

const initialFilters: FilterState = {
  category: [],
  flavor: [],
  type: [],
  occasion: [],
  suboccasion: [],
  subtheme: [],
  priceRange: [0, 2000],
  weight: [],
  delivery: [],
  dietary: [],
  rating: null,
  shape: [],
  theme: [],
};

// default fallbacks used while API loads or if API fails
const defaultFilterOptions = {
  category: ["Cakes", "Cupcakes", "Pastries", "Cookies", "Donuts", "Pies & Tarts", "Gift Hampers", "Chocolates"],
  flavor: ["Chocolate", "Vanilla", "Red Velvet", "Butterscotch", "Black Forest", "Pineapple", "Strawberry", "Coffee", "Mango"],
  type: ["Eggless", "Egg Cake", "Vegan Cake", "Sugar-Free Cake", "Gluten-Free Cake", "Designer Cake", "Photo Cake", "Fondant Cake", "Theme Cake"],
  occasion: ["Birthday", "Anniversary", "Valentine's Day", "Baby Shower", "Graduation", "Christmas", "Diwali", "Party"],
  weight: ["500g", "1 Kg", "1.5 Kg", "2 Kg", "3 Kg+"],
  delivery: [],
  dietary: [],
  shape: ["Round", "Heart Shape", "Square", "Cartoon Shape", "Number Cake"],
  theme: ["Kids Theme", "Superhero Theme", "Princess Theme", "Football Theme", "Wedding Theme"],
};

// dynamic options state
const useDynamicOptions = () => {
  const [options, setOptions] = useState<typeof defaultFilterOptions>(defaultFilterOptions);
  const [subOccMap, setSubOccMap] = useState<Record<string, string[]>>({});
  const [subThemeMap, setSubThemeMap] = useState<Record<string, string[]>>({});

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const requests = [
          api.categories.getAll().catch(() => []),
          api.flavors.getAll().catch(() => []),
          api.weights.getAll().catch(() => []),
          api.types.getAll().catch(() => []),
          api.occasions.getAll().catch(() => []),
          api.shapes.getAll().catch(() => []),
          api.themes.getAll().catch(() => []),
        ];

        const results = await Promise.all(requests);

        if (!mounted) return;

        const normalizeResp = (r: unknown): unknown[] => {
          if (!r) return [];
          if (Array.isArray(r)) return r;
          // handle { data: [...] } or { data: { ... } }
          if (r && typeof r === 'object' && (r as Record<string, unknown>).data !== undefined) {
            const d = (r as Record<string, unknown>).data;
            return Array.isArray(d) ? d : [d];
          }
          // single object -> wrap
          if (typeof r === 'object') return [r];
          return [];
        };

        const toStrings = (arr: unknown[]): string[] => (arr || []).map((it) => {
          if (typeof it === 'string') return it;
          if (it && typeof it === 'object') {
            const obj = it as Record<string, unknown>;
            return (typeof obj.name === 'string' && obj.name)
              || (typeof obj.title === 'string' && obj.title)
              || (typeof obj.label === 'string' && obj.label)
              || (typeof obj.type === 'string' && obj.type)
              || (typeof obj._id === 'string' && String(obj._id))
              || '';
          }
          return '';
        }).filter(Boolean) as string[];

        const [cats, flvs, wts, types, occ, shp, thm] = results.map(normalizeResp);

        let built: Record<string, string[]> = {
          category: toStrings(cats),
          flavor: toStrings(flvs),
          type: toStrings(types),
          occasion: toStrings(occ),
          weight: toStrings(wts),
          delivery: [],
          dietary: [],
          shape: toStrings(shp),
          theme: toStrings(thm),
        };

        // build subOccMap from occasions response if objects provided
        const occMap: Record<string, string[]> = {};
        for (const o of occ) {
          if (!o) continue;
          const obj = typeof o === 'string' ? { name: o } : (o as Record<string, unknown>);
          const idVal = (obj as Record<string, unknown>)['_id'];
          const name = (typeof obj.name === 'string' && obj.name) || (typeof obj.title === 'string' && obj.title) || (typeof idVal === 'string' ? idVal : String(obj.name || obj.title || ''));
          const candidateKeys = ['suboccasions', 'subOccasions', 'sub_occasions'];
          let subs: string[] = [];
          for (const k of candidateKeys) {
            const val = (obj as Record<string, unknown>)[k];
            if (Array.isArray(val)) {
              subs = (val as unknown[]).map(s => String(s ?? '').trim()).filter(Boolean);
              break;
            }
          }
          if (name) occMap[name] = subs;
        }

        // build subThemeMap from themes response
        const thMap: Record<string, string[]> = {};
        for (const t of thm) {
          if (!t) continue;
          const obj = typeof t === 'string' ? { name: t } : (t as Record<string, unknown>);
          const idVal2 = (obj as Record<string, unknown>)['_id'];
          const name = (typeof obj.name === 'string' && obj.name) || (typeof obj.title === 'string' && obj.title) || (typeof idVal2 === 'string' ? idVal2 : String(obj.name || obj.title || ''));
          const candidateKeys = ['subthemes', 'subThemes', 'sub_themes'];
          let subs: string[] = [];
          for (const k of candidateKeys) {
            const val = (obj as Record<string, unknown>)[k];
            if (Array.isArray(val)) {
              subs = (val as unknown[]).map(s => String(s ?? '').trim()).filter(Boolean);
              break;
            }
          }
          if (name) thMap[name] = subs;
        }

        // If backend endpoints returned unexpected shapes (empty), fall back to scanning products to build filter lists
        const allEmpty = Object.values(built).every(arr => !arr || arr.length === 0);
        if (allEmpty) {
          try {
            const prodsRaw = await api.products.getAll().catch(() => []);
            const prods = normalizeResp(prodsRaw);
            const extract = (key: string) => {
              const set = new Set<string>();
              for (const p of prods) {
                const val = (p as Record<string, unknown>)?.[key];
                if (Array.isArray(val)) (val as unknown[]).forEach((v) => v && set.add(String(v)));
                else if (typeof val === 'string' && val) set.add(val);
              }
              return Array.from(set);
            };
            built = {
              category: extract('category'),
              flavor: extract('flavor'),
              type: extract('type'),
              occasion: extract('occasion'),
              weight: extract('weight'),
              delivery: extract('delivery'),
              dietary: extract('dietary'),
              shape: extract('shape'),
              theme: extract('theme'),
            };

            // also attempt to derive suboccasions and subthemes from products grouped by occasion/theme
            const subOccMapFallback: Record<string, Set<string>> = {};
            const subThemeMapFallback: Record<string, Set<string>> = {};
            for (const p of prods) {
              const occVal = (p as Record<string, unknown>)?.occasion;
              const occNames = Array.isArray(occVal) ? occVal as unknown[] : (typeof occVal === 'string' ? (occVal as string).split(',').map((s:string)=>s.trim()) : []);
              const subOccVal = (p as Record<string, unknown>)?.suboccasions;
              const subOccNames = Array.isArray(subOccVal) ? subOccVal as unknown[] : (typeof subOccVal === 'string' ? (subOccVal as string).split(',').map((s:string)=>s.trim()) : []);

              const themeVal = (p as Record<string, unknown>)?.theme;
              const themeNames = Array.isArray(themeVal) ? themeVal as unknown[] : (typeof themeVal === 'string' ? (themeVal as string).split(',').map((s:string)=>s.trim()) : []);
              const subThemeVal = (p as Record<string, unknown>)?.subthemes;
              const subThemeNames = Array.isArray(subThemeVal) ? subThemeVal as unknown[] : (typeof subThemeVal === 'string' ? (subThemeVal as string).split(',').map((s:string)=>s.trim()) : []);

              for (const oName of occNames as string[]) {
                if (!oName) continue;
                if (!subOccMapFallback[oName]) subOccMapFallback[oName] = new Set();
                for (const sName of subOccNames as string[]) if (sName) subOccMapFallback[oName].add(sName);
              }

              for (const tName of themeNames as string[]) {
                if (!tName) continue;
                if (!subThemeMapFallback[tName]) subThemeMapFallback[tName] = new Set();
                for (const sName of subThemeNames as string[]) if (sName) subThemeMapFallback[tName].add(sName);
              }
            }
            for (const k of Object.keys(subOccMapFallback)) occMap[k] = Array.from(subOccMapFallback[k]);
            for (const k of Object.keys(subThemeMapFallback)) thMap[k] = Array.from(subThemeMapFallback[k]);

          } catch (e) {
            // ignore fallback errors
          }
        }

        // merge with defaults where empty
        setOptions({
          category: built.category.length ? built.category : defaultFilterOptions.category,
          flavor: built.flavor.length ? built.flavor : defaultFilterOptions.flavor,
          type: built.type.length ? built.type : defaultFilterOptions.type,
          occasion: built.occasion.length ? built.occasion : defaultFilterOptions.occasion,
          weight: built.weight.length ? built.weight : defaultFilterOptions.weight,
          delivery: built.delivery && built.delivery.length ? built.delivery : defaultFilterOptions.delivery,
          dietary: built.dietary && built.dietary.length ? built.dietary : defaultFilterOptions.delivery,
          shape: built.shape.length ? built.shape : defaultFilterOptions.shape,
          theme: built.theme.length ? built.theme : defaultFilterOptions.theme,
        });

        setSubOccMap(occMap);
        setSubThemeMap(thMap);
      } catch (e) {
        // noop
      } finally {
        mounted = false;
      }
    })();

    return () => { mounted = false; };
  }, []);

  return { options, subOccMap, subThemeMap };
};

interface FilterSidebarProps {
  onFilterChange?: (filters: FilterState) => void;
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function FilterSidebar({ onFilterChange, className, isOpen, onClose }: FilterSidebarProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const { options, subOccMap, subThemeMap } = useDynamicOptions();

  const handleCheckboxChange = (section: keyof FilterState, value: string) => {
    setFilters((prev) => {
      const current = prev[section] as string[];
      const updated = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      
      const newFilters = { ...prev, [section]: updated };
      onFilterChange?.(newFilters);
      return newFilters;
    });
  };

  const handlePriceChange = (value: number[]) => {
    const newFilters = { ...filters, priceRange: value as [number, number] };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const clearFilters = () => {
    setFilters(initialFilters);
    onFilterChange?.(initialFilters);
  };

  // compute sub-occasion list to show based on selected occasion(s)
  const computeSubOccOptions = () => {
    const sel = filters.occasion || [];
    const set = new Set<string>();
    if (sel.length === 0) {
      // union of all
      Object.values(subOccMap).flat().forEach(s => s && set.add(s));
    } else {
      for (const s of sel) {
        const list = subOccMap[s] || [];
        list.forEach(it => it && set.add(it));
      }
    }
    return Array.from(set);
  };

  // compute sub-theme list to show based on selected theme(s)
  const computeSubThemeOptions = () => {
    const sel = filters.theme || [];
    const set = new Set<string>();
    if (sel.length === 0) {
      Object.values(subThemeMap).flat().forEach(s => s && set.add(s));
    } else {
      for (const t of sel) {
        const list = subThemeMap[t] || [];
        list.forEach(it => it && set.add(it));
      }
    }
    return Array.from(set);
  };

  return (
    <div className={`bg-white border-r border-[#D4A373]/20 ${className}`}>
      <div className="p-4 border-b border-[#F5ECD7] flex items-center justify-between bg-white z-10">
        <div className="flex items-center gap-2 text-[#3E2723]">
          <Filter size={20} />
          <h2 className="font-playfair font-bold text-xl">Filters</h2>
        </div>
        <div className="flex items-center gap-2">
           <button 
            onClick={clearFilters}
            className="text-xs font-bold text-[#8D6E63] hover:text-[#D4A373] underline"
          >
            Clear All
          </button>
          {onClose && (
            <button onClick={onClose} className="md:hidden text-[#3E2723]">
              <X size={24} />
            </button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-2">
        <Accordion type="multiple" defaultValue={["category", "price", "flavor"]} className="w-full">
          
          {/* Price Range */}
          <AccordionItem value="price" className="border-b border-[#D4A373]/20">
            <AccordionTrigger className="text-[#3E2723] font-semibold hover:no-underline hover:text-[#D4A373] py-3">Price Range</AccordionTrigger>
            <AccordionContent className="pt-4 px-2">
              <Slider
                defaultValue={[0, 2000]}
                max={5000}
                min={0}
                step={50}
                value={filters.priceRange}
                onValueChange={handlePriceChange}
                className="mb-4"
              />
              <div className="flex justify-between text-sm font-bold text-[#8D6E63]">
                <span className="bg-[#D4A373]/10 px-2 py-0.5 rounded-lg">${filters.priceRange[0]}</span>
                <span className="bg-[#D4A373]/10 px-2 py-0.5 rounded-lg">${filters.priceRange[1]}</span>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Dynamic Checkbox Sections */}
          {Object.entries(options).map(([key, opts]) => (
            <AccordionItem value={key} key={key} className="border-b border-[#D4A373]/20">
              <AccordionTrigger className="capitalize text-[#3E2723] font-semibold hover:no-underline hover:text-[#D4A373] py-3">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 gap-1.5 pt-1">
                  {opts.map((option) => (
                    <div
                      key={option}
                      className={`flex items-center space-x-2 px-2 py-1.5 rounded-lg transition-colors cursor-pointer ${
                        (filters[key as keyof FilterState] as string[]).includes(option)
                          ? "bg-[#3E2723]/8 "
                          : "hover:bg-[#D4A373]/10"
                      }`}
                    >
                      <Checkbox 
                        id={`${key}-${option}`} 
                        checked={(filters[key as keyof FilterState] as string[]).includes(option)}
                        onCheckedChange={() => handleCheckboxChange(key as keyof FilterState, option)}
                        className="border-[#D4A373] data-[state=checked]:bg-[#3E2723] data-[state=checked]:border-[#3E2723]"
                      />
                      <label
                        htmlFor={`${key}-${option}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-[#5D4037] cursor-pointer w-full"
                      >
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}

          {/* Sub-Occasions (dependent on selected Occasion) */}
          <AccordionItem value="suboccasions" className="border-b border-[#D4A373]/20">
            <AccordionTrigger className="text-[#3E2723] font-semibold hover:no-underline hover:text-[#D4A373] py-3">Sub-Occasions</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 gap-1.5 pt-1">
                {computeSubOccOptions().length === 0 ? (
                  <div className="text-sm text-[#8D6E63] italic">Select an occasion to see sub-occasions</div>
                ) : computeSubOccOptions().map((option) => (
                  <div
                    key={option}
                    className={`flex items-center space-x-2 px-2 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      (filters.suboccasion as string[]).includes(option)
                        ? "bg-[#3E2723]/8 "
                        : "hover:bg-[#D4A373]/10"
                    }`}
                  >
                    <Checkbox 
                      id={`subocc-${option}`} 
                      checked={(filters.suboccasion as string[]).includes(option)}
                      onCheckedChange={() => handleCheckboxChange('suboccasion', option as string)}
                      className="border-[#D4A373] data-[state=checked]:bg-[#3E2723] data-[state=checked]:border-[#3E2723]"
                    />
                    <label
                      htmlFor={`subocc-${option}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-[#5D4037] cursor-pointer w-full"
                    >
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Sub-Themes (dependent on selected Theme) */}
          <AccordionItem value="subthemes" className="border-b border-[#D4A373]/20">
            <AccordionTrigger className="text-[#3E2723] font-semibold hover:no-underline hover:text-[#D4A373] py-3">Sub-Themes</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 gap-1.5 pt-1">
                {computeSubThemeOptions().length === 0 ? (
                  <div className="text-sm text-[#8D6E63] italic">Select a theme to see sub-themes</div>
                ) : computeSubThemeOptions().map((option) => (
                  <div
                    key={option}
                    className={`flex items-center space-x-2 px-2 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      (filters.subtheme as string[]).includes(option)
                        ? "bg-[#3E2723]/8 "
                        : "hover:bg-[#D4A373]/10"
                    }`}
                  >
                    <Checkbox 
                      id={`subtheme-${option}`} 
                      checked={(filters.subtheme as string[]).includes(option)}
                      onCheckedChange={() => handleCheckboxChange('subtheme', option as string)}
                      className="border-[#D4A373] data-[state=checked]:bg-[#3E2723] data-[state=checked]:border-[#3E2723]"
                    />
                    <label
                      htmlFor={`subtheme-${option}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-[#5D4037] cursor-pointer w-full"
                    >
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Ratings */}
          <AccordionItem value="ratings" className="border-b-0">
            <AccordionTrigger className="text-[#3E2723] font-semibold hover:no-underline hover:text-[#D4A373] py-3">Ratings</AccordionTrigger>
            <AccordionContent>
               <div className="space-y-1.5 pt-1">
                  {[4, 3, 2, 1].map((rating) => (
                    <div
                      key={rating}
                      className={`flex items-center space-x-2 px-2 py-1.5 rounded-lg transition-colors cursor-pointer ${
                        filters.rating === rating ? "bg-[#3E2723]/8" : "hover:bg-[#D4A373]/10"
                      }`}
                    >
                      <Checkbox 
                        id={`rating-${rating}`}
                        checked={filters.rating === rating}
                        onCheckedChange={(checked) => {
                             setFilters(prev => {
                                 const newVal = checked ? rating : null;
                                 const newFilters = { ...prev, rating: newVal };
                                 onFilterChange?.(newFilters);
                                 return newFilters;
                             });
                        }}
                        className="border-[#D4A373] data-[state=checked]:bg-[#3E2723] data-[state=checked]:border-[#3E2723]"
                      />
                      <label htmlFor={`rating-${rating}`} className="text-sm font-medium text-[#5D4037] flex items-center gap-1 cursor-pointer w-full">
                        <span className="text-[#FFB800]">{"★".repeat(rating)}{"☆".repeat(4 - rating)}</span>
                        <span className="text-[#8D6E63]">& above</span>
                      </label>
                    </div>
                  ))}
               </div>
            </AccordionContent>
          </AccordionItem>

        </Accordion>
      </div>
    </div>
  );
}
