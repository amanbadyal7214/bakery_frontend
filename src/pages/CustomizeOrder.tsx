import React, { useState, FormEvent, ChangeEvent, useRef } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";  
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, 
  Calendar, 
  Clock, 
  IndianRupee, 
  Utensils, 
  Gift, 
  User, 
  Image as ImageIcon, 
  MapPin, 
  Truck, 
  Cake, 
  Heart,
  MessageCircle,
  Palette,
  Check,
  X,
  Phone
} from "lucide-react";

const occasions = [
  "Birthday", "Wedding", "Anniversary", "Baby Shower", "Graduation", "Corporate Event", "Festival", "Other"
];

const cakeWeights = [
  { id: "0.5kg", name: "0.5 kg (Small)" },
  { id: "1kg", name: "1 kg (Medium)" },
  { id: "2kg", name: "2 kg (Large)" },
  { id: "3kg", name: "3 kg (Extra Large)" },
  { id: "custom", name: "Custom / Describe in notes" },
];

const flavors = [
  "Chocolate", "Vanilla", "Butterscotch", "Red Velvet", "Black Forest", "Pineapple", "Fruit Cake", "Custom"
];

const shapes = [
  "Round", "Square", "Heart Shape", "2-Tier", "3-Tier", "Custom (Car, Cartoon, Number)"
];

const frostings = [
  "Whipped Cream", "Buttercream", "Fondant", "Ganache"
];

export default function CustomizeOrder() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  // Form State
  const [formData, setFormData] = useState({
    occasion: "",
    weight: "",
    servingCount: "", // Optional explicit serving count if weight is confusing
    flavor: "",
    shape: "",
    designTheme: "", // Description
    image: null as File | null,
    message: "",
    frosting: "",
    isEggless: "egg", // "egg" | "eggless"
    deliveryType: "pickup", // "pickup" | "delivery"
    deliveryDate: "",
    deliveryTime: "",
    name: "",
    mobile: "",
    address: "",
    pincode: "",
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Basic client-side validation
  const validateForm = () => {
    // Name
    if (!formData.name || formData.name.trim().length < 2) {
      toast({ title: 'Invalid Name', description: 'Please enter your full name.' });
      return false;
    }

    // Mobile number (accepts digits; require at least 10 digits)
    const digits = formData.mobile ? formData.mobile.replace(/\D/g, '') : '';
    if (!digits || digits.length < 10) {
      toast({ title: 'Invalid Mobile Number', description: 'Please enter a valid 10-digit mobile number.' });
      return false;
    }

    // If delivery selected, require address and 6-digit pincode
    if (formData.deliveryType === 'delivery') {
      if (!formData.address || formData.address.trim().length < 5) {
        toast({ title: 'Address Required', description: 'Please enter a delivery address.' });
        return false;
      }
      const pin = formData.pincode ? formData.pincode.replace(/\D/g, '') : '';
      if (!pin || pin.length !== 6) {
        toast({ title: 'Invalid Pincode', description: 'Please enter a 6-digit pincode for delivery.' });
        return false;
      }
    }

    // Serving count if provided should be numeric
    if (formData.servingCount && !/^\d+$/.test(formData.servingCount)) {
      toast({ title: 'Invalid Serving Count', description: 'Estimated guests should be a number.' });
      return false;
    }

    // Delivery date must not be in the past
    if (formData.deliveryDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const sel = new Date(formData.deliveryDate);
      if (sel < today) {
        toast({ title: 'Invalid Date', description: 'Delivery date cannot be in the past.' });
        return false;
      }
    }

    // Message length limit
    if (formData.message && formData.message.length > 200) {
      toast({ title: 'Message Too Long', description: 'Please keep cake message under 200 characters.' });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // Validate before sending
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value === null || value === undefined) return;
        // image is handled separately
        if (key === 'image') return;
        data.append(key, String(value));
      });
      // image is a File in formData.image
      if (formData.image) data.set('image', formData.image);

      const base = (import.meta.env.VITE_API_URL as string) || '';
      const url = base ? `${base.replace(/\/$/, '')}/api/orders` : '/api/orders';
      
      const token = localStorage.getItem('token');
      if (!token) {
        toast({ title: 'Login Required', description: 'Please log in to submit an order.' });
        setIsSubmitting(false);
        return;
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data,
      });

      if (!res.ok) throw new Error('Failed to submit order');

      const json = await res.json();
      console.log('Order created', json);
      toast({ title: 'Order Request Received!', description: "We'll contact you shortly to confirm options within your budget." });

      // Reset form
      setFormData({
        occasion: "",
        weight: "",
        servingCount: "",
        flavor: "",
        shape: "",
        designTheme: "",
        image: null,
        message: "",
        frosting: "",
        isEggless: "egg",
        deliveryType: "pickup",
        deliveryDate: "",
        deliveryTime: "",
        name: "",
        mobile: "",
        address: "",
        pincode: "",
      });
      setImagePreview(null);
      // clear native file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Could not submit order. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData((prev) => ({ ...prev, image: file }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      e.target.value = ""; // Allow re-selecting the same file
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setImagePreview(null);
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0] font-hepta pb-20">
      <Navbar />
      
      <div className="bg-[#3E2723] text-[#F5ECD7] pt-32 pb-16 px-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            {/* Abstract bg pattern could go here */}
            <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-[#D4A373] blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-[#D4A373] blur-3xl"></div>
        </div>
        <h1 className="font-playfair text-4xl md:text-6xl font-bold mb-4 relative z-10">
          Design Your Dream Cake
        </h1>
        <p className="text-[#D4A373] text-lg max-w-2xl mx-auto font-light relative z-10">
          From flavors to frostings, tell us exactly what you envision. We'll bake it to perfection.
        </p>
      </div>

      <main className="px-4 md:px-8 max-w-5xl mx-auto -mt-10 relative z-20">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 md:p-12 border border-[#D4A373]/20">
          <form onSubmit={handleSubmit} className="space-y-12">
            
            {/* Section Component Helper */}
            {/* 1. Reference Image */}
            <div className="bg-[#FFF8F0]/50 p-6 rounded-2xl border border-[#D4A373]/20 hover:border-[#D4A373]/50 transition-colors">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#3E2723] flex items-center justify-center text-[#F5ECD7]">
                  <ImageIcon size={20} />
                </div>
                <h2 className="font-playfair text-2xl font-bold text-[#3E2723]">
                   Reference Image <span className="text-base font-normal text-[#8D6E63] ml-2">(Optional)</span>
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-8 items-start">
                 <div className="flex flex-col gap-4">
                   <Label className="text-[#5D4037] text-base">Got an inspiration photo?</Label>
                   <div className="relative group">
                     <Input 
                        ref={fileInputRef}
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageChange} 
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                      />
                      <div className="border-2 border-dashed border-[#D4A373] rounded-xl p-8 text-center bg-white group-hover:bg-[#FFF8F0] transition-colors">
                        <Upload className="mx-auto h-10 w-10 text-[#D4A373] mb-3" />
                        <p className="font-medium text-[#3E2723]">Click or Drop Image Here</p>
                        <p className="text-sm text-[#8D6E63]">Support: JPG, PNG</p>
                      </div>
                   </div>
                 </div>
                 
                 {imagePreview ? (
                   <div className="relative w-full max-w-[240px] aspect-square rounded-xl overflow-hidden border-4 border-white shadow-lg rotate-2 mx-auto md:mx-0 group">
                     <img 
                        src={imagePreview} 
                        alt="Cake reference" 
                        className="w-full h-full object-cover" 
                     />
                     <div className="absolute inset-0 bg-black/10 transition-opacity group-hover:bg-black/20"></div>
                     <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-md transition-all opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100"
                        aria-label="Remove image"
                     >
                        <X size={16} />
                     </button>
                   </div>
                 ) : (
                    <div className="flex items-center justify-center h-full min-h-[160px] text-[#D4A373]/40 italic">
                      No image selected
                    </div>
                 )}
              </div>
            </div>

            {/* 2. Occasion */}
            <div className="bg-[#FFF8F0]/50 p-6 rounded-2xl border border-[#D4A373]/20 hover:border-[#D4A373]/50 transition-colors">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#3E2723] flex items-center justify-center text-[#F5ECD7]">
                  <Gift size={20} />
                </div>
                <h2 className="font-playfair text-2xl font-bold text-[#3E2723]">Occasion</h2>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {occasions.map((occ) => (
                  <label key={occ} className={`
                    relative cursor-pointer border rounded-xl p-4 text-center text-sm font-medium transition-all duration-200 shadow-sm
                    ${formData.occasion === occ 
                      ? "bg-[#3E2723] text-[#F5ECD7] border-[#3E2723] shadow-md transform scale-105" 
                      : "bg-white text-[#5D4037] hover:bg-[#FFF8F0] border-transparent hover:border-[#D4A373]/30"}
                  `}>
                    <input 
                      type="radio" 
                      name="occasion" 
                      value={occ} 
                      checked={formData.occasion === occ} 
                      onChange={(e) => handleInputChange("occasion", e.target.value)}
                      className="hidden" 
                    />
                    {occ}
                  </label>
                ))}
              </div>
            </div>

            {/* 3. Specifications Grid */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Size & Servings */}
                <div className="bg-[#FFF8F0]/50 p-6 rounded-2xl border border-[#D4A373]/20 hover:border-[#D4A373]/50 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                        <UsersIcon className="text-[#3E2723]" />
                        <h2 className="font-playfair text-xl font-bold text-[#3E2723]">Size & Servings</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                           <Label className="text-[#5D4037]">Cake Weight</Label>
                           <Select value={formData.weight} onValueChange={(val) => handleInputChange("weight", val)}>
                            <SelectTrigger className="bg-white border-[#D4A373]/30 h-12">
                              <SelectValue placeholder="Select weight" />
                            </SelectTrigger>
                            <SelectContent>
                              {cakeWeights.map((w) => (
                                <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                           <Label className="text-[#5D4037]">Estimated Guests (Optional)</Label>
                           <div className="relative">
                               <User className="absolute left-3 top-3.5 h-4 w-4 text-[#8D6E63]" />
                               <Input 
                                  placeholder="e.g. 50 people" 
                                  value={formData.servingCount}
                                  onChange={(e) => handleInputChange("servingCount", e.target.value)}
                                  className="pl-9 bg-white border-[#D4A373]/30 h-11"
                               />
                           </div>
                        </div>
                    </div>
                </div>

                {/* Flavor & Shape */}
                <div className="bg-[#FFF8F0]/50 p-6 rounded-2xl border border-[#D4A373]/20 hover:border-[#D4A373]/50 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                        <Cake className="text-[#3E2723]" />
                        <h2 className="font-playfair text-xl font-bold text-[#3E2723]">Details</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-[#5D4037]">Flavor</Label>
                            <Select value={formData.flavor} onValueChange={(val) => handleInputChange("flavor", val)}>
                              <SelectTrigger className="bg-white border-[#D4A373]/30 h-12">
                                <SelectValue placeholder="Select flavor" />
                              </SelectTrigger>
                              <SelectContent>
                                {flavors.map((f) => (
                                  <SelectItem key={f} value={f}>{f}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2">
                            <Label className="text-[#5D4037]">Shape</Label>
                            <Select value={formData.shape} onValueChange={(val) => handleInputChange("shape", val)}>
                              <SelectTrigger className="bg-white border-[#D4A373]/30 h-12">
                                <SelectValue placeholder="Select shape" />
                              </SelectTrigger>
                              <SelectContent>
                                {shapes.map((s) => (
                                  <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </div>

            {/* 6. Design & Theme */}
            <div className="bg-[#FFF8F0]/50 p-6 rounded-2xl border border-[#D4A373]/20 hover:border-[#D4A373]/50 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <Palette className="text-[#3E2723]" />
                <h2 className="font-playfair text-2xl font-bold text-[#3E2723]">Design & Theme</h2>
              </div>
              <div className="grid gap-2">
                 <Label className="text-[#5D4037]">Describe your vision (Color, Cartoon, Minimalist, etc.)</Label>
                 <Textarea 
                   value={formData.designTheme}
                   placeholder="e.g. I want a Blue and Gold theme with an elephant topper. Please write 'Happy Birthday' in gold cursive."
                   className="min-h-[100px] bg-white border-[#D4A373]/30 text-base resize-none focus:ring-1 focus:ring-[#3E2723]"
                   onChange={(e) => handleInputChange("designTheme", e.target.value)}
                 />
              </div>
            </div>

            {/* 7. Message on Cake */}
            <div className="bg-[#FFF8F0]/50 p-6 rounded-2xl border border-[#D4A373]/20 hover:border-[#D4A373]/50 transition-colors">
               <div className="flex items-center gap-3 mb-4">
                <MessageCircle className="text-[#3E2723]" />
                <h2 className="font-playfair text-xl font-bold text-[#3E2723]">Message on Cake</h2>
              </div>
              <Input 
                value={formData.message}
                placeholder="e.g. Happy Birthday Aman" 
                className="text-lg py-6 bg-white border-[#D4A373]/30 font-playfair text-center italic placeholder:not-italic"
                onChange={(e) => handleInputChange("message", e.target.value)}
              />
            </div>

            {/* 8. & 9. Cream & Egg Preference */}
            <div className="grid md:grid-cols-2 gap-6">
               <div className="bg-[#FFF8F0]/50 p-6 rounded-2xl border border-[#D4A373]/20 hover:border-[#D4A373]/50 transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                     <Utensils className="text-[#3E2723]" />
                     <h2 className="font-playfair text-xl font-bold text-[#3E2723]">Frosting</h2>
                  </div>
                  <Select onValueChange={(val) => handleInputChange("frosting", val)}>
                    <SelectTrigger className="bg-white border-[#D4A373]/30 h-12">
                      <SelectValue placeholder="Select frosting" />
                    </SelectTrigger>
                    <SelectContent>
                      {frostings.map((f) => (
                        <SelectItem key={f} value={f}>{f}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
               </div>

               <div className="bg-[#FFF8F0]/50 p-6 rounded-2xl border border-[#D4A373]/20 hover:border-[#D4A373]/50 transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                     <Heart className="text-[#3E2723]" />
                     <h2 className="font-playfair text-xl font-bold text-[#3E2723]">Preference</h2>
                  </div>
                  <RadioGroup value={formData.isEggless} onValueChange={(val) => handleInputChange("isEggless", val)} className="flex items-center gap-4 mt-2">
                    <label className={`flex-1 flex items-center justify-center space-x-2 border rounded-xl p-3 cursor-pointer transition-colors ${formData.isEggless === 'egg' ? 'bg-white border-[#3E2723] shadow-sm' : 'border-transparent hover:bg-white'}`}>
                      <RadioGroupItem value="egg" id="r-egg" />
                      <Label htmlFor="r-egg" className="font-medium cursor-pointer">With Egg</Label>
                    </label>
                    <label className={`flex-1 flex items-center justify-center space-x-2 border rounded-xl p-3 cursor-pointer transition-colors ${formData.isEggless === 'eggless' ? 'bg-green-50 border-green-600 shadow-sm' : 'border-transparent hover:bg-green-50/50'}`}>
                      <RadioGroupItem value="eggless" id="r-eggless" className="text-green-600 border-green-600" />
                      <Label htmlFor="r-eggless" className="font-medium text-green-700 cursor-pointer">Eggless</Label>
                    </label>
                  </RadioGroup>
               </div>
            </div>

            {/* 10. Delivery / Pickup */}
            <div className="bg-[#FFF8F0]/50 p-6 rounded-2xl border border-[#D4A373]/20 hover:border-[#D4A373]/50 transition-colors">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#3E2723] flex items-center justify-center text-[#F5ECD7]">
                  <Truck size={20} />
                </div>
                <h2 className="font-playfair text-2xl font-bold text-[#3E2723]">Delivery Details</h2>
              </div>
              
              <RadioGroup value={formData.deliveryType} onValueChange={(val) => handleInputChange("deliveryType", val)} className="flex flex-col sm:flex-row gap-4 mb-8">
                 <label className={`flex-1 flex items-center gap-4 border-2 rounded-xl px-6 py-4 cursor-pointer transition-all ${formData.deliveryType === 'pickup' ? 'border-[#3E2723] bg-white shadow-md' : 'border-dashed border-[#D4A373]/50 hover:bg-white'}`}>
                    <RadioGroupItem value="pickup" id="d-pickup" />
                    <div>
                        <div className="flex items-center gap-2 font-bold text-[#3E2723] mb-1">
                            <MapPin size={18} /> Pickup
                        </div>
                        <p className="text-sm text-[#8D6E63]">Collect from our bakery</p>
                    </div>
                 </label>
                 <label className={`flex-1 flex items-center gap-4 border-2 rounded-xl px-6 py-4 cursor-pointer transition-all ${formData.deliveryType === 'delivery' ? 'border-[#3E2723] bg-white shadow-md' : 'border-dashed border-[#D4A373]/50 hover:bg-white'}`}>
                    <RadioGroupItem value="delivery" id="d-delivery" />
                    <div>
                         <div className="flex items-center gap-2 font-bold text-[#3E2723] mb-1">
                            <Truck size={18} /> Home Delivery
                        </div>
                        <p className="text-sm text-[#8D6E63]">We deliver to your doorstep</p>
                    </div>
                 </label>
              </RadioGroup>

              {formData.deliveryType === "delivery" && (
                <div className="mb-6 animate-in slide-in-from-top-2 fade-in duration-300 space-y-4">
                  <div>
                    <Label className="text-[#5D4037] mb-2 block">Delivery Address</Label>
                    <Textarea 
                      value={formData.address}
                      placeholder="Enter complete address (House No, Street, Landmark...)" 
                      className="bg-white border-[#D4A373]/30 min-h-[80px] focus:ring-[#3E2723]"
                      onChange={(e) => handleInputChange("address", e.target.value)}
                    />
                  </div>
                  
                  <div className="max-w-[200px]">
                     <Label className="text-[#5D4037] mb-2 block">Pincode</Label>
                     <Input 
                      value={formData.pincode}
                      type="text" 
                      placeholder="e.g. 110001" 
                      className="bg-white border-[#D4A373]/30 focus:ring-[#3E2723]"
                      maxLength={6}
                      onChange={(e) => handleInputChange("pincode", e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                <div className="grid gap-2">
                  <Label className="text-[#5D4037]">Date</Label>
                  <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-[#8D6E63]" />
                      <Input value={formData.deliveryDate} type="date" className="pl-9 bg-white border-[#D4A373]/30 h-11" onChange={(e) => handleInputChange("deliveryDate", e.target.value)} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label className="text-[#5D4037]">Time</Label>
                   <div className="relative">
                      <Clock className="absolute left-3 top-3 h-4 w-4 text-[#8D6E63]" />
                      <Input value={formData.deliveryTime} type="time" className="pl-9 bg-white border-[#D4A373]/30 h-11" onChange={(e) => handleInputChange("deliveryTime", e.target.value)} />
                   </div>
                </div>
              </div>
            </div>

            {/* 11. Contact Details */}
            <div className="bg-[#FFF8F0]/50 p-6 rounded-2xl border border-[#D4A373]/20 hover:border-[#D4A373]/50 transition-colors">
               <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#3E2723] flex items-center justify-center text-[#F5ECD7]">
                  <User size={20} />
                </div>
                <h2 className="font-playfair text-2xl font-bold text-[#3E2723]">Contact Details</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                   <Label className="text-[#5D4037]">Full Name</Label>
                   <div className="relative">
                      <User className="absolute left-3 top-3.5 h-4 w-4 text-[#8D6E63]" />
                      <Input 
                        value={formData.name}
                        type="text" 
                        placeholder="Your Name" 
                        className="pl-9 bg-white border-[#D4A373]/30 h-11 focus:ring-[#3E2723]"
                        onChange={(e) => handleInputChange("name", e.target.value)}
                      />
                   </div>
                </div>

                <div className="space-y-2">
                   <Label className="text-[#5D4037]">Contact Number</Label>
                   <div className="relative">
                      <Phone className="absolute left-3 top-3.5 h-4 w-4 text-[#8D6E63]" />
                      <Input 
                        value={formData.mobile}
                        type="tel" 
                        placeholder="Your Mobile Number" 
                        className="pl-9 bg-white border-[#D4A373]/30 h-11 focus:ring-[#3E2723]"
                        onChange={(e) => handleInputChange("mobile", e.target.value)}
                      />
                   </div>
                </div>
              </div>
              <p className="text-sm text-[#8D6E63] mt-3">We will contact you to discuss the final price.</p>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-[#3E2723] hover:bg-[#5D4037] text-[#F5ECD7] text-xl font-bold py-8 rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 mt-8 group flex items-center justify-center gap-3"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'SENDING...' : 'SEND ENQUIRY'} 
              {!isSubmitting && <Check className="w-6 h-6 group-hover:scale-125 transition-transform" />}
            </Button>

          </form>
        </div>
      </main>
    </div>
  );
}

// Simple Helper Icon Component
function UsersIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  );
}
