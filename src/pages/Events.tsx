import { Tag, Gift, Ticket, Star } from "lucide-react";
import EventTemplate1, { EventConfig } from "@/components/events/EventTemplate1";
import EventTemplate2, {EventConfig} from "@/components/events/EventTemplate2";

// ─────────────────────────────────────────────────────────────────────────────
// 🎪 EVENT DATA — Edit this object to customise for any festival / sale / offer
// ─────────────────────────────────────────────────────────────────────────────

const eventConfig: EventConfig = {
  // ── Branding ────────────────────────────────
  accentColor: "#D4A373",
  darkColor: "#2C1810",
  bgColor: "#EBE3D5",

  // ── Hero ─────────────────────────────────────
  badge: "Special Offer",          // e.g. "Festival", "Sale", "Limited Time"
  title: "Event Name Here",        // e.g. "Diwali Delights", "Summer Sale"
  subtitle: "A short punchy tagline that grabs attention and sets the vibe of the event.",
  ctaLabel: "Shop Now",
  ctaLink: "/shop",

  // ── Date & Venue ─────────────────────────────
  startDate: "Apr 20, 2026",
  endDate: "Apr 30, 2026",
  time: "9 AM – 9 PM",
  location: "All Outlets & Online",

  // ── Countdown (static values — wire up a real live timer as needed) ──────
  countdown: { days: 15, hours: 12, mins: 45, secs: 30 },

  // ── Floating decorative emojis (exactly 4) ────
  floatingEmojis: ["🎂", "✨", "🎁", "🌟"],

  // ── Highlight cards (up to 4) ─────────────────
  highlights: [
    {
      icon: Tag,
      title: "Up to 40% Off",
      desc: "Massive discounts on selected cakes, pastries, and seasonal specials.",
    },
    {
      icon: Gift,
      title: "Free Hampers",
      desc: "Complimentary gift hamper on every order above ₹1,500.",
    },
    {
      icon: Ticket,
      title: "Lucky Draw",
      desc: "Enter our lucky draw on every purchase and win exciting prizes.",
    },
    {
      icon: Star,
      title: "Exclusive Combos",
      desc: "Festival-only combo packs curated just for this celebration.",
    },
  ],

  // ── Featured product / offer cards ────────────
  offers: [
    {
      label: "Bestseller",
      name: "Signature Celebration Cake",
      price: "₹799",
      originalPrice: "₹1,299",
      discount: "38% OFF",
      emoji: "🎂",
    },
    {
      label: "Limited",
      name: "Festival Special Box",
      price: "₹499",
      originalPrice: "₹799",
      discount: "37% OFF",
      emoji: "🎁",
    },
    {
      label: "New",
      name: "Seasonal Pastry Platter",
      price: "₹349",
      originalPrice: "₹549",
      discount: "36% OFF",
      emoji: "🍰",
    },
  ],

  // ── Testimonials ──────────────────────────────
  testimonials: [
    {
      name: "Priya S.",
      quote: "The festival cakes were absolutely divine — best we've ever had!",
      stars: 5,
    },
    {
      name: "Rahul M.",
      quote: "Amazing deals and packaging. Will definitely order every year.",
      stars: 5,
    },
    {
      name: "Simran K.",
      quote: "The hamper was a hit at our family gathering. Thank you!",
      stars: 5,
    },
  ],

  // ── FAQ ───────────────────────────────────────
  faqs: [
    {
      q: "How long does the offer last?",
      a: "The offer runs from April 20 to April 30, 2026. Don't miss it!",
    },
    {
      q: "Can I order online?",
      a: "Yes! All offers are available both in-store and through our online ordering system.",
    },
    {
      q: "Is delivery available?",
      a: "We offer home delivery within the city. Additional charges may apply.",
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function Events() {
  return <EventTemplate1 config={eventConfig} />;
}
