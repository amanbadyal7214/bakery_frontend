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
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export interface FilterState {
  category: string[];
  flavor: string[];
  type: string[];
  occasion: string[];
  suboccasion: string[];
  subtheme: string[];
  priceRange: [number, number];
  weight: string[];
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
  priceRange: [0, 5000],
  weight: [],
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
  shape: ["Round", "Heart Shape", "Square", "Cartoon Shape", "Number Cake"],
  theme: ["Kids Theme", "Superhero Theme", "Princess Theme", "Football Theme", "Wedding Theme"],
};

// dynamic options state
const useDynamicOptions = () => {
  const [options, setOptions] = useState<typeof defaultFilterOptions>(defaultFilterOptions);
  const [subOccMap, setSubOccMap] = useState<Record<string, string[]>>({});
  const [subThemeMap, setSubThemeMap] = useState<Record<string, string[]>>({});
  const [flavorMap, setFlavorMap] = useState<Record<string, string[]>>({});
  const [typeMap, setTypeMap] = useState<Record<string, string[]>>({});
  const [occasionMap, setOccasionMap] = useState<Record<string, string[]>>({});
  const [weightMap, setWeightMap] = useState<Record<string, string[]>>({});
  const [shapeMap, setShapeMap] = useState<Record<string, string[]>>({});
  const [themeMap, setThemeMap] = useState<Record<string, string[]>>({});

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
          if (r && typeof r === 'object' && (r as Record<string, unknown>).data !== undefined) {
            const d = (r as Record<string, unknown>).data;
            return Array.isArray(d) ? d : [d];
          }
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

        const catLookup: Record<string, string> = {};
        cats.forEach(c => {
          if (!c) return;
          const id = (c as any)._id || (c as any).id;
          const name = toStrings([c])[0];
          if (id && name) catLookup[String(id)] = name;
        });

        let built: Record<string, string[]> = {
          category: toStrings(cats),
          flavor: toStrings(flvs),
          type: toStrings(types),
          occasion: toStrings(occ),
          weight: toStrings(wts),
          shape: toStrings(shp),
          theme: toStrings(thm),
        };

        const buildSectionMap = (data: unknown[]): Record<string, string[]> => {
          const map: Record<string, string[]> = {};
          data.forEach(item => {
            if (!item || typeof item !== 'object') return;
            const obj = item as any;
            const name = toStrings([item])[0];
            const catVal = obj.category || obj.categoryId;
            if (name && catVal) {
              const catsArr = Array.isArray(catVal) ? catVal : [catVal];
              catsArr.forEach(c => {
                let cn = '';
                if (typeof c === 'string') {
                  cn = catLookup[c] || c;
                } else {
                  cn = toStrings([c])[0];
                }
                if (cn) {
                  if (!map[cn]) map[cn] = [];
                  if (!map[cn].includes(name)) map[cn].push(name);
                }
              });
            }
          });
          return map;
        };

        const fMap = buildSectionMap(flvs);
        const tMap = buildSectionMap(types);
        const oMap = buildSectionMap(occ);
        const wMap = buildSectionMap(wts);
        const sShpMap = buildSectionMap(shp);
        const sThmMap = buildSectionMap(thm);

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
          if (typeof idVal === 'string' && idVal) occMap[String(idVal)] = subs;
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
          if (typeof idVal2 === 'string' && idVal2) thMap[String(idVal2)] = subs;
        }

        // If backend endpoints returned unexpected shapes (empty), fall back to scanning products
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
              shape: extract('shape'),
              theme: extract('theme'),
            };

            const subOccMapFallback: Record<string, Set<string>> = {};
            const subThemeMapFallback: Record<string, Set<string>> = {};
            for (const p of prods) {
              const obj = p as any;
              const catVal = obj.category;
              const catNames = Array.isArray(catVal) ? toStrings(catVal) : (typeof catVal === 'string' ? [catVal] : toStrings([catVal]));

              const flv = obj.flavor;
              const flvNames = Array.isArray(flv) ? toStrings(flv) : (typeof flv === 'string' ? [flv] : toStrings([flv]));

              const typ = obj.type;
              const typNames = Array.isArray(typ) ? toStrings(typ) : (typeof typ === 'string' ? [typ] : toStrings([typ]));

              catNames.forEach(cn => {
                if (cn) {
                  if (!fMap[cn]) fMap[cn] = [];
                  flvNames.forEach(fn => fn && !fMap[cn].includes(fn) && fMap[cn].push(fn));

                  if (!tMap[cn]) tMap[cn] = [];
                  typNames.forEach(tn => tn && !tMap[cn].includes(tn) && tMap[cn].push(tn));
                }
              });

              const occVal = obj.occasion;
              const occNames = Array.isArray(occVal) ? toStrings(occVal) : (typeof occVal === 'string' ? [occVal] : toStrings([occVal]));
              const subOccVal = obj.suboccasions;
              const subOccNames = Array.isArray(subOccVal) ? toStrings(subOccVal) : (typeof subOccVal === 'string' ? [subOccVal] : toStrings([subOccVal]));

              const themeVal = obj.theme;
              const themeNames = Array.isArray(themeVal) ? toStrings(themeVal) : (typeof themeVal === 'string' ? [themeVal] : toStrings([themeVal]));
              const subThemeVal = obj.subthemes;
              const subThemeNames = Array.isArray(subThemeVal) ? toStrings(subThemeVal) : (typeof subThemeVal === 'string' ? [subThemeVal] : toStrings([subThemeVal]));

              for (const oName of occNames) {
                if (!oName) continue;
                if (!subOccMapFallback[oName]) subOccMapFallback[oName] = new Set();
                for (const sName of subOccNames) if (sName) subOccMapFallback[oName].add(sName);
              }

              for (const tName of themeNames) {
                if (!tName) continue;
                if (!subThemeMapFallback[tName]) subThemeMapFallback[tName] = new Set();
                for (const sName of subThemeNames) if (sName) subThemeMapFallback[tName].add(sName);
              }
            }
            for (const k of Object.keys(subOccMapFallback)) occMap[k] = Array.from(subOccMapFallback[k]);
            for (const k of Object.keys(subThemeMapFallback)) thMap[k] = Array.from(subThemeMapFallback[k]);

          } catch (e) { }
        }

        setOptions({
          category: built.category.length ? built.category : defaultFilterOptions.category,
          flavor: built.flavor.length ? built.flavor : defaultFilterOptions.flavor,
          type: built.type.length ? built.type : defaultFilterOptions.type,
          occasion: built.occasion.length ? built.occasion : defaultFilterOptions.occasion,
          weight: built.weight.length ? built.weight : defaultFilterOptions.weight,
          shape: built.shape.length ? built.shape : defaultFilterOptions.shape,
          theme: built.theme.length ? built.theme : defaultFilterOptions.theme,
        });

        setSubOccMap(occMap);
        setSubThemeMap(thMap);
        setFlavorMap(fMap);
        setTypeMap(tMap);
        setOccasionMap(oMap);
        setWeightMap(wMap);
        setShapeMap(sShpMap);
        setThemeMap(sThmMap);
      } catch (e) {
      } finally {
        mounted = false;
      }
    })();

    return () => { mounted = false; };
  }, []);

  return { options, subOccMap, subThemeMap, flavorMap, typeMap, occasionMap, weightMap, shapeMap, themeMap };
};

interface FilterSidebarProps {
  filters?: FilterState;
  onFilterChange?: (filters: FilterState) => void;
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function FilterSidebar({ filters: externalFilters, onFilterChange, className, isOpen, onClose }: FilterSidebarProps) {
  const [filters, setFilters] = useState<FilterState>(externalFilters || initialFilters);

  useEffect(() => {
    if (externalFilters) {
      setFilters(externalFilters);
    }
  }, [externalFilters]);
  const { 
    options, subOccMap, subThemeMap, flavorMap, typeMap, 
    occasionMap, weightMap, shapeMap, themeMap 
  } = useDynamicOptions();
  // control which accordion panels are open so we can auto-open sub-sections
  const [openPanels, setOpenPanels] = useState<string[]>(["category", "price", "flavor"]);

  const applyFilterSideEffects = (section: keyof FilterState, updated: string[], prev: FilterState) => {
    const newFilters = { ...prev, [section]: updated };

    // Auto-prune flavor and type when category changes
    if (section === 'category') {
      if (updated.length > 0) {
        newFilters.flavor = prev.flavor.filter(f => computeFlavorOptions(updated).includes(f));
        newFilters.type = prev.type.filter(t => computeTypeOptions(updated).includes(t));
        newFilters.occasion = prev.occasion.filter(o => computeOccasionOptions(updated).includes(o));
        newFilters.weight = prev.weight.filter(w => computeWeightOptions(updated).includes(w));
        newFilters.shape = prev.shape.filter(s => computeShapeOptions(updated).includes(s));
        newFilters.theme = prev.theme.filter(th => computeThemeOptions(updated).includes(th));
      }
    }

    // Auto-open dependent sub-section when parent selection made/cleared
    if (section === 'occasion') {
      const subs = computeSubOccOptions(updated);
      if (updated.length > 0 && subs.length > 0) {
        setOpenPanels((prevPanels) => prevPanels.includes('suboccasions') ? prevPanels : [...prevPanels, 'suboccasions']);
      } else {
        setOpenPanels((prevPanels) => prevPanels.filter(p => p !== 'suboccasions'));
        if (updated.length === 0) {
          newFilters.suboccasion = [];
        }
      }
    }

    if (section === 'theme') {
      const subs = computeSubThemeOptions(updated);
      if (updated.length > 0 && subs.length > 0) {
        setOpenPanels((prevPanels) => prevPanels.includes('subthemes') ? prevPanels : [...prevPanels, 'subthemes']);
      } else {
        setOpenPanels((prevPanels) => prevPanels.filter(p => p !== 'subthemes'));
        if (updated.length === 0) {
          newFilters.subtheme = [];
        }
      }
    }

    return newFilters;
  };

  const handleCheckboxChange = (section: keyof FilterState, value: string) => {
    setFilters((prev) => {
      const current = prev[section] as string[];
      const updated = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];

      const newFilters = applyFilterSideEffects(section, updated, prev);
      onFilterChange?.(newFilters);
      return newFilters;
    });
  };

  const handleRadioChange = (section: keyof FilterState, value: string) => {
    setFilters((prev) => {
      const updated = [value];
      const newFilters = applyFilterSideEffects(section, updated, prev);
      onFilterChange?.(newFilters);
      return newFilters;
    });
  };

  const handlePriceChange = (value: number[]) => {
    const newFilters = { ...filters, priceRange: value as [number, number] };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleMinPriceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    const newRange: [number, number] = [Math.min(value, filters.priceRange[1]), filters.priceRange[1]];
    handlePriceChange(newRange);
  };

  const handleMaxPriceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    const newRange: [number, number] = [filters.priceRange[0], Math.max(value, filters.priceRange[0])];
    handlePriceChange(newRange);
  };

  const clearFilters = () => {
    setFilters(initialFilters);
    onFilterChange?.(initialFilters);
  };

  // compute sub-occasion list to show based on selected occasion(s)
  const computeSubOccOptions = (sel?: string[]) => {
    const selArr = (typeof sel !== 'undefined') ? (sel || []) : (filters.occasion || []);
    const set = new Set<string>();
    if (selArr.length === 0) {
      // union of all
      Object.values(subOccMap).flat().forEach(s => s && set.add(s));
    } else {
      // match keys case-insensitively and by simple plural rules
      const normalize = (s: string) => String(s).toLowerCase().trim();
      const selNorm = selArr.map(normalize);
      for (const [key, list] of Object.entries(subOccMap)) {
        if (!key) continue;
        const kn = normalize(key);
        const matched = selNorm.some(sn => sn === kn || kn === sn + 's' || sn === kn + 's');
        if (matched) list.forEach(it => it && set.add(it));
      }
    }
    return Array.from(set);
  };

  // compute sub-theme list to show based on selected theme(s)
  const computeSubThemeOptions = (sel?: string[]) => {
    const selArr = (typeof sel !== 'undefined') ? (sel || []) : (filters.theme || []);
    const set = new Set<string>();
    if (selArr.length === 0) {
      Object.values(subThemeMap).flat().forEach(s => s && set.add(s));
    } else {
      const normalize = (s: string) => String(s).toLowerCase().trim();
      const selNorm = selArr.map(normalize);
      for (const [key, list] of Object.entries(subThemeMap)) {
        if (!key) continue;
        const kn = normalize(key);
        const matched = selNorm.some(sn => sn === kn || kn === sn + 's' || sn === kn + 's');
        if (matched) list.forEach(it => it && set.add(it));
      }
    }
    return Array.from(set);
  };

  const computeFlavorOptions = (sel?: string[]) => {
    const selCats = (typeof sel !== 'undefined') ? (sel || []) : (filters.category || []);
    if (selCats.length === 0) return options.flavor;
    const set = new Set<string>();
    selCats.forEach(c => {
      const list = flavorMap[c] || [];
      list.forEach(item => set.add(item));
    });
    const result = Array.from(set);
    // fallback to all if empty to avoid "gayab" (disappearing) behavior
    return result.length > 0 ? result : options.flavor;
  };

  const computeTypeOptions = (sel?: string[]) => {
    const selCats = (typeof sel !== 'undefined') ? (sel || []) : (filters.category || []);
    if (selCats.length === 0) return options.type;
    const set = new Set<string>();
    selCats.forEach(c => {
      const list = typeMap[c] || [];
      list.forEach(item => set.add(item));
    });
    const result = Array.from(set);
    // fallback to all if empty to avoid "gayab" (disappearing) behavior
    return result.length > 0 ? result : options.type;
  };

  const computeOccasionOptions = (sel?: string[]) => {
    const selCats = (typeof sel !== 'undefined') ? (sel || []) : (filters.category || []);
    if (selCats.length === 0) return options.occasion;
    const set = new Set<string>();
    selCats.forEach(c => {
      const list = occasionMap[c] || [];
      list.forEach(item => set.add(item));
    });
    return Array.from(set);
  };

  const computeWeightOptions = (sel?: string[]) => {
    const selCats = (typeof sel !== 'undefined') ? (sel || []) : (filters.category || []);
    if (selCats.length === 0) return options.weight;
    const set = new Set<string>();
    selCats.forEach(c => {
      const list = weightMap[c] || [];
      list.forEach(item => set.add(item));
    });
    return Array.from(set);
  };

  const computeShapeOptions = (sel?: string[]) => {
    const selCats = (typeof sel !== 'undefined') ? (sel || []) : (filters.category || []);
    if (selCats.length === 0) return options.shape;
    const set = new Set<string>();
    selCats.forEach(c => {
      const list = shapeMap[c] || [];
      list.forEach(item => set.add(item));
    });
    return Array.from(set);
  };

  const computeThemeOptions = (sel?: string[]) => {
    const selCats = (typeof sel !== 'undefined') ? (sel || []) : (filters.category || []);
    if (selCats.length === 0) return options.theme;
    const set = new Set<string>();
    selCats.forEach(c => {
      const list = themeMap[c] || [];
      list.forEach(item => set.add(item));
    });
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
        <Accordion type="multiple" value={openPanels} onValueChange={(vals) => setOpenPanels(vals as string[])} className="w-full">

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
              <div className="flex items-center justify-between gap-4 mt-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-[#8D6E63] ml-1">Min Price</span>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[#8D6E63] text-sm">$</span>
                    <Input
                      type="number"
                      value={filters.priceRange[0]}
                      onChange={handleMinPriceInputChange}
                      className="h-9 pl-5 bg-[#D4A373]/5 border-[#D4A373]/20 focus-visible:ring-[#D4A373] text-sm font-bold text-[#3E2723]"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-[#8D6E63] ml-1">Max Price</span>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[#8D6E63] text-sm">$</span>
                    <Input
                      type="number"
                      value={filters.priceRange[1]}
                      onChange={handleMaxPriceInputChange}
                      className="h-9 pl-5 bg-[#D4A373]/5 border-[#D4A373]/20 focus-visible:ring-[#D4A373] text-sm font-bold text-[#3E2723]"
                    />
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Dynamic Checkbox Sections */}
          {Object.entries(options).map(([key, opts]) => {
            let displayOpts = opts;
            if (key === 'flavor') displayOpts = computeFlavorOptions();
            if (key === 'type') displayOpts = computeTypeOptions();
            if (key === 'occasion') displayOpts = computeOccasionOptions();
            if (key === 'weight') displayOpts = computeWeightOptions();
            if (key === 'shape') displayOpts = computeShapeOptions();
            if (key === 'theme') displayOpts = computeThemeOptions();

            if (displayOpts.length === 0) return null;

            return (
              <AccordionItem value={key} key={key} className="border-b border-[#D4A373]/20">
                <AccordionTrigger className="capitalize text-[#3E2723] font-semibold hover:no-underline hover:text-[#D4A373] py-3">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pt-1">
                    {['type', 'weight'].includes(key) ? (
                      <RadioGroup
                        value={(filters[key as keyof FilterState] as string[])[0] || ""}
                        onValueChange={(val) => handleRadioChange(key as keyof FilterState, val)}
                        className="grid grid-cols-1 gap-1.5"
                      >
                        {displayOpts.map((option) => (
                          <div
                            key={option}
                            className={`flex items-center px-2 py-1.5 rounded-lg transition-colors ${(filters[key as keyof FilterState] as string[]).includes(option)
                              ? "bg-[#D4A373]/10"
                              : "hover:bg-[#D4A373]/5"
                              }`}
                          >
                            <RadioGroupItem
                              value={option}
                              id={`${key}-${option}`}
                              className="border-[#D4A373] text-[#3E2723] rounded-full"
                            />
                            <Label
                              htmlFor={`${key}-${option}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-[#5D4037] cursor-pointer w-full flex-1 py-1 ml-2"
                            >
                              {option}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    ) : (
                      <div className="grid grid-cols-1 gap-1.5">
                        {displayOpts.map((option) => (
                          <div
                            key={option}
                            className={`flex items-center px-2 py-1.5 rounded-lg transition-colors ${(filters[key as keyof FilterState] as string[]).includes(option)
                              ? "bg-[#3E2723]/8"
                              : "hover:bg-[#D4A373]/10"
                              }`}
                          >
                            <Checkbox
                              id={`${key}-${option}`}
                              checked={(filters[key as keyof FilterState] as string[]).includes(option)}
                              onCheckedChange={() => handleCheckboxChange(key as keyof FilterState, option)}
                              className="border-[#D4A373] data-[state=checked]:bg-[#3E2723] data-[state=checked]:border-[#3E2723] rounded-none"
                            />
                            <label
                              htmlFor={`${key}-${option}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-[#5D4037] cursor-pointer w-full flex-1 py-1 ml-2"
                            >
                              {option}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}

          {/* Sub-Occasions (dependent on selected Occasion) */}
          {filters.occasion.length > 0 && computeSubOccOptions().length > 0 && (
            <AccordionItem value="suboccasions" className="border-b border-[#D4A373]/20">
              <AccordionTrigger className="text-[#3E2723] font-semibold hover:no-underline hover:text-[#D4A373] py-3">Sub-Occasions</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 gap-1.5 pt-1">
                  {computeSubOccOptions().map((option) => (
                    <div
                      key={option}
                      className={`flex items-center px-2 py-1.5 rounded-lg transition-colors ${(filters.suboccasion as string[]).includes(option)
                        ? "bg-[#3E2723]/8 "
                        : "hover:bg-[#D4A373]/10"
                        }`}
                    >
                      <Checkbox
                        id={`subocc-${option}`}
                        checked={(filters.suboccasion as string[]).includes(option)}
                        onCheckedChange={() => handleCheckboxChange('suboccasion', option as string)}
                        className="border-[#D4A373] data-[state=checked]:bg-[#3E2723] data-[state=checked]:border-[#3E2723] rounded-none"
                      />
                      <label
                        htmlFor={`subocc-${option}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-[#5D4037] cursor-pointer w-full flex-1 py-1 ml-2"
                      >
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Sub-Themes (dependent on selected Theme) */}
          {filters.theme.length > 0 && computeSubThemeOptions().length > 0 && (
            <AccordionItem value="subthemes" className="border-b border-[#D4A373]/20">
              <AccordionTrigger className="text-[#3E2723] font-semibold hover:no-underline hover:text-[#D4A373] py-3">Sub-Themes</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 gap-1.5 pt-1">
                  {computeSubThemeOptions().map((option) => (
                    <div
                      key={option}
                      className={`flex items-center px-2 py-1.5 rounded-lg transition-colors ${(filters.subtheme as string[]).includes(option)
                        ? "bg-[#3E2723]/8 "
                        : "hover:bg-[#D4A373]/10"
                        }`}
                    >
                      <Checkbox
                        id={`subtheme-${option}`}
                        checked={(filters.subtheme as string[]).includes(option)}
                        onCheckedChange={() => handleCheckboxChange('subtheme', option as string)}
                        className="border-[#D4A373] data-[state=checked]:bg-[#3E2723] data-[state=checked]:border-[#3E2723] rounded-none"
                      />
                      <label
                        htmlFor={`subtheme-${option}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-[#5D4037] cursor-pointer w-full flex-1 py-1 ml-2"
                      >
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}


        </Accordion>
      </div>
    </div>
  );
}
