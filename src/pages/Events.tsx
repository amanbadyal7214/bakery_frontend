import { useState, useEffect } from "react";
import EventTemplate1, { EventConfig } from "@/components/events/EventTemplate1";
import EventTemplate2 from "@/components/events/EventTemplate2";
import { api } from "@/services/api";
import { Sparkles, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function Events() {
  const [eventConfig, setEventConfig] = useState<EventConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const fetchActiveEvent = async () => {
      try {
        const data = await api.events.getActive();
        if (data && typeof data === 'object') {
            const normalizedData: EventConfig = {
                ...data,
                countdown: (data as any).countdown || { days: 0, hours: 0, mins: 0, secs: 0 },
                floatingEmojis: ((data as any).floatingEmojis && (data as any).floatingEmojis.length >= 2) 
                    ? (data as any).floatingEmojis 
                    : ["🎂", "✨", "🎁", "🌟"],
                highlights: (data as any).highlights || [],
                offers: (data as any).offers || [],
                heroImage: (data as any).heroImage || "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=2000&auto=format&fit=crop"
            } as any;
            
            setEventConfig(normalizedData);

            // Start live countdown if endDate exists
            if (normalizedData.endDate) {
              timer = setInterval(() => {
                const end = new Date(normalizedData.endDate).getTime();
                const now = new Date().getTime();
                const diff = end - now;

                if (diff <= 0) {
                  setEventConfig(prev => prev ? { ...prev, countdown: { days: 0, hours: 0, mins: 0, secs: 0 } } : null);
                  return;
                }

                const newCountdown = {
                  days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                  hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                  mins: Math.floor((diff / 1000 / 60) % 60),
                  secs: Math.floor((diff / 1000) % 60),
                };

                setEventConfig(prev => prev ? { ...prev, countdown: newCountdown } : null);
              }, 1000);
            }
        }
      } catch (err) {
        console.error("Failed to fetch active event:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveEvent();
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#EBE3D5] text-[#2C1810]">
        <Loader2 size={48} className="animate-spin mb-4 opacity-20" />
        <p className="text-sm font-black uppercase tracking-[0.3em] animate-pulse">Prepping the Stage...</p>
      </div>
    );
  }

  if (!eventConfig) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#EBE3D5] text-[#2C1810] px-4 text-center">
        <div className="w-24 h-24 rounded-full bg-white/50 flex items-center justify-center mb-8 shadow-inner">
            <Sparkles size={40} className="text-[#D4A373] opacity-20" />
        </div>
        <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter">No Live Events</h1>
        <p className="max-w-md opacity-60 text-lg font-medium mb-10">
            Our bakers are busy crafting something special. Check back soon for our next grand celebration!
        </p>
        <Link 
            to="/" 
            className="px-8 py-3 bg-[#2C1810] text-white rounded-full font-black uppercase tracking-widest text-xs hover:bg-[#D4A373] hover:text-[#2C1810] transition-all shadow-xl"
        >
            Back to Home
        </Link>
      </div>
    );
  }

  // Choose template based on config
  if ((eventConfig as any).template === 'template2') {
    return <EventTemplate2 config={eventConfig} />;
  }

  return <EventTemplate1 config={eventConfig} />;
}
