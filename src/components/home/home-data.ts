import { useDispatch } from "react-redux";
import { addToCart, setCartItems } from "@/store/slices/cartSlice";
import type { Product as CartProduct } from "@/types";
import { addCartItem } from "@/services/cartApi";
import cakeJpg from "../../assets/cake.jpg";
import chocolateJpg from "../../assets/choclate.jpg";
import pastryJpg from "../../assets/pastery.jpg";
import doJpg from "../../assets/DO.jpg";

const CART_OPEN_EVENT = "cart:open";

export interface Product {
  id: number | string;
  name: string;
  category: string;
  price: number;
  img: string;
  badge?: string;
  rating?: number;
  flavor?: string;
  type?: string[];
  occasion?: string[];
  weight?: string[];
  dietary?: string[];
  shape?: string;
  theme?: string;
  delivery?: string[];
}

export const useProductActions = () => {
  const dispatch = useDispatch();

  const resolveImage = (record: Record<string, unknown>): string => {
    const imageCandidates = [
      record.img,
      record.imgBase64,
      record.image,
    ];

    const images = record.images;
    if (Array.isArray(images) && images.length > 0) {
      const first = images[0] as Record<string, unknown>;
      imageCandidates.push(first?.base64, first?.url);
    }

    const image = imageCandidates.find((v) => typeof v === "string" && v.trim().length > 0);
    return (image as string | undefined) ?? "/placeholder.svg";
  };

  const toCartProduct = (product: Product | Record<string, unknown>): CartProduct | null => {
    const record = product as Record<string, unknown>;
    const rawId = record._id ?? record.id;
    if (rawId === undefined || rawId === null || String(rawId).trim() === "") {
      return null;
    }

    const rawPrice = Number(record.price);
    const safePrice = Number.isFinite(rawPrice) ? rawPrice : 0;
    const rawStock = Number(record.stock);
    // Preserve actual numeric stock including zero so frontend can render out-of-stock state
    const safeStock = Number.isFinite(rawStock) ? rawStock : 10;

    return {
      id: String(rawId),
      name: String(record.name ?? "Bakery Item"),
      category: String(record.category ?? "Bakery"),
      price: safePrice,
      stock: safeStock,
      image: resolveImage(record),
      rating: Number.isFinite(Number(record.rating)) ? Number(record.rating) : undefined,
      flavor: Array.isArray(record.flavor)
        ? (record.flavor as string[])
        : typeof record.flavor === "string"
          ? [record.flavor]
          : undefined,
      ingredients: Array.isArray(record.ingredients)
        ? (record.ingredients as string[])
        : undefined,
      tasteDescription: typeof record.tasteDescription === "string"
        ? record.tasteDescription
        : undefined,
    };
  };

  const handleAddToCart = async (
    product: Product | Record<string, unknown>,
    quantity: number,
    isAuthenticated: boolean,
  ) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      alert('Please login first to add items to cart');
      window.location.href = '/login';
      return;
    }

    const cartProduct = toCartProduct(product);
    if (!cartProduct) return;

    // Prevent adding out-of-stock items on client
    if (Number(cartProduct.stock) <= 0) {
      alert(`Product "${cartProduct.name}" is currently out of stock`);
      return;
    }

    const token = localStorage.getItem("token");
    const normalizedQuantity = Math.max(1, Math.floor(Number(quantity) || 1));
    const isObjectId = /^[a-fA-F0-9]{24}$/.test(String(cartProduct.id));

    if (token && isObjectId) {
      try {
        const response = await addCartItem(token, {
          productId: String(cartProduct.id),
          quantity: normalizedQuantity,
        });
        dispatch(setCartItems(response.cart.items));
      } catch (error) {
        console.error("Failed to sync cart with server, using local fallback:", error);
        dispatch(
          addToCart({
            product: cartProduct,
            quantity: normalizedQuantity,
          }),
        );
      }
    } else {
      dispatch(
        addToCart({
          product: cartProduct,
          quantity: normalizedQuantity,
        }),
      );
    }

    // Open cart only for explicit add-to-cart actions.
    window.dispatchEvent(new Event(CART_OPEN_EVENT));
  };

  const scrollTo = (id: string) => {
    document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: "smooth" });
  };

  return { handleAddToCart, scrollTo };
};

export const products: Product[] = [
  { 
    id: 1, 
    name: "Classic Croissant", 
    category: "Pastries", 
    price: 3.50, 
    img: "/croissant.png", 
    badge: "Bestseller",
    rating: 4.8,
    flavor: "Butter",
    type: ["Classic"],
    dietary: ["Eggless"],
    weight: ["500g"],
    delivery: ["Same Day Delivery", "Express Delivery"]
  },
  { 
    id: 2, 
    name: "Strawberry Dream Cake", 
    category: "Cakes", 
    price: 28.00, 
    img: "/cake.png", 
    badge: "New",
    rating: 4.9,
    flavor: "Strawberry",
    type: ["Egg Cake", "Designer Cake"],
    occasion: ["Birthday", "Anniversary"],
    weight: ["1 Kg", "2 Kg"],
    shape: "Round",
    delivery: ["Scheduled Delivery", "Midnight Delivery"]
  },
  { 
    id: 3, 
    name: "Rustic Sourdough", 
    category: "Breads", 
    price: 9.00, 
    img: "/bread.png", 
    badge: "Artisan",
    rating: 4.7,
    flavor: "Plain",
    type: ["Vegan Cake", "Sugar-Free Cake"], // Using Cake types for simplicty in demo
    dietary: ["Vegan", "Sugar-Free", "Gluten-Free"],
    weight: ["500g"],
    delivery: ["Same Day Delivery"]
  },
  { 
    id: 4, 
    name: "Chocolate Chip Cookies", 
    category: "Cookies", 
    price: 2.50, 
    img: chocolateJpg, 
    badge: "Classic",
    rating: 4.6,
    flavor: "Chocolate",
    type: ["Eggless"],
    occasion: ["Party"],
    weight: ["500g"],
    delivery: ["Express Delivery"]
  },
  { 
    id: 5, 
    name: "Blueberry Muffin", 
    category: "Muffins", 
    price: 3.00, 
    img: cakeJpg, 
    badge: "Fresh",
    rating: 4.5,
    flavor: "Blueberry",
    type: ["Egg Cake"],
    occasion: ["Breakfast"],
    weight: ["500g"]
  },
  { 
    id: 6, 
    name: "Cinnamon Roll", 
    category: "Pastries", 
    price: 4.00, 
    img: pastryJpg, 
    badge: "Hot",
    rating: 4.8,
    flavor: "Cinnamon",
    type: ["Eggless"],
    weight: ["500g"]
  },
  { 
    id: 7, 
    name: "Baguette", 
    category: "Breads", 
    price: 3.00, 
    img: "/bread.png", 
    badge: "Crispy",
    rating: 4.4,
    dietary: ["Vegan"],
    weight: ["500g"]
  },
  { 
    id: 8, 
    name: "Cheesecake Slice", 
    category: "Cakes", 
    price: 5.00, 
    img: doJpg, 
    badge: "Creamy",
    rating: 4.9,
    flavor: "Cheese",
    type: ["Egg Cake"],
    occasion: ["Anniversary"],
    weight: ["500g"]
  },
];

export const testimonials = [
  { name: "Aisha Patel", role: "Regular Customer", text: "Every morning starts with their croissants. Perfectly flaky, buttery, absolutely divine. Nothing else comes close!", stars: 5 },
  { name: "Marco Rossi", role: "Event Planner", text: "Ordered a custom cake for our corporate event. The team was professional, the cake was spectacular. 10/10.", stars: 5 },
  { name: "Sarah Thompson", role: "Food Blogger", text: "The sourdough here is the real deal — tangy, crusty crust, airy crumb. The best artisan bread in the city.", stars: 5 },
];

export const navLinks = ["Home", "Menu", "About", "Testimonials", "Contact"];
