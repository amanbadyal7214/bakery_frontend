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

        const normalizeResp = (r: any) => {
          if (!r) return [] as any[];
          if (Array.isArray(r)) return r;
          // handle { data: [...] } or { data: { ... } }
          if (r && typeof r === 'object' && r.data !== undefined) {
            return Array.isArray(r.data) ? r.data : [r.data];
          }
          // single object -> wrap
          if (typeof r === 'object') return [r];
          return [] as any[];
        };

        const toStrings = (arr: any[]) => (arr || []).map((it) => {
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

        let built = {
          category: toStrings(cats),
          flavor: toStrings(flvs),
          type: toStrings(types),
          occasion: toStrings(occ),
          weight: toStrings(wts),
          shape: toStrings(shp),
          theme: toStrings(thm),
        } as Record<string, string[]>;

        // If backend endpoints returned unexpected shapes (empty), fall back to scanning products to build filter lists
        const allEmpty = Object.values(built).every(arr => !arr || arr.length === 0);
        if (allEmpty) {
          try {
            const prodsRaw = await api.products.getAll().catch(() => []);
            const prods = normalizeResp(prodsRaw);
            const extract = (key: string) => {
              const set = new Set<string>();
              for (const p of prods) {
                const val = p?.[key];
                if (Array.isArray(val)) val.forEach((v: any) => v && set.add(String(v)));
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
          shape: built.shape.length ? built.shape : defaultFilterOptions.shape,
          theme: built.theme.length ? built.theme : defaultFilterOptions.theme,
        });
      } catch (e) {
        // noop
      } finally {
        mounted = false;
      }
    })();

    return () => { mounted = false; };
  }, []);

  return options;
};

interface FilterSidebarProps {
  onFilterChange?: (filters: FilterState) => void;
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function FilterSidebar({ onFilterChange, className, isOpen, onClose }: FilterSidebarProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const options = useDynamicOptions();

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
    // In Slider component, value is number[]. Here we need [number, number].
    // Since we initialized as [200, 2000], and slider is dual thumb, it should be fine.
    // However, if the slider returns less than 2 items, we need to be careful.
    // Assuming shadcn slider with 2 values works as expected.
    const newFilters = { ...filters, priceRange: value as [number, number] };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const clearFilters = () => {
    setFilters(initialFilters);
    onFilterChange?.(initialFilters);
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
