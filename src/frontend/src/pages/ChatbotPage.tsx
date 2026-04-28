import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, MessageCircle, Send } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Layout } from "../components/layout/Layout";

interface ChatMessage {
  id: string;
  from: "user" | "bot";
  text: string;
  timestamp: Date;
}

const FAQ_RESPONSES: Array<{ keywords: string[]; response: string }> = [
  {
    keywords: ["price", "cost", "fee", "how much", "₹", "rupee", "pricing"],
    response:
      "💰 All our services and courses are priced at just **₹5**! Booking requires a minimum ₹2 upfront payment, with the remaining ₹3 after delivery. Course certificates are issued only after full payment.",
  },
  {
    keywords: ["book", "booking", "appointment", "schedule", "reserve"],
    response:
      "📅 To book a service: 1) Choose your service category, 2) Select date, time slot & location, 3) Submit your request. Our receptionist will review it, and admin will send you a Stripe payment link to confirm. After delivery, pay the balance.",
  },
  {
    keywords: ["course", "learn", "class", "training", "education", "workshop"],
    response:
      "🎓 We offer 50 professional courses across Photography, Videography, Editing, Business, and Specialized categories — all at just ₹5! Courses are available online, offline, and hybrid. Upon completion, receive a QR-verified certificate.",
  },
  {
    keywords: ["certificate", "verify", "certification", "credential"],
    response:
      "🏆 Course certificates are issued after completing the course AND full ₹5 payment. Each certificate has a unique QR code for public verification at /verify/{code}. If payment is overdue, certificate issuance is blocked until cleared.",
  },
  {
    keywords: ["wedding", "couple", "pre-wedding", "engagement"],
    response:
      "💑 We offer comprehensive wedding photography including full wedding coverage, candid, traditional, drone, bridal & groom shoots, and beautiful pre/post-wedding sessions. All packages at ₹5!",
  },
  {
    keywords: ["video", "videography", "film", "reel", "cinematic"],
    response:
      "🎥 Our videography services include wedding cinematic films, event highlights, promotional videos, music videos, YouTube content, and drone videography — all shot with cinema-grade equipment. Starting at ₹5!",
  },
  {
    keywords: [
      "portrait",
      "portfolio",
      "model",
      "fashion",
      "actor",
      "headshot",
    ],
    response:
      "📸 We specialize in professional portfolios for models, actors, and personal branding. Our fashion shoot, editorial, and headshot services will make you shine. Visit our Services page and select Single Shoot or Fashion Shoot!",
  },
  {
    keywords: ["whatsapp", "contact", "call", "phone", "reach", "talk"],
    response:
      "📲 Contact us on WhatsApp at **+91 73385 01228**. We respond during business hours. For bookings, please use the booking flow on our website for faster processing!",
  },
  {
    keywords: ["location", "indoor", "outdoor", "studio", "where"],
    response:
      "📍 We shoot at various locations! Options include: Indoor Studio, Outdoor locations of your choice, our Professional Studio setup, or any Custom location you specify. When booking, you can search for specific places by name!",
  },
  {
    keywords: ["login", "signup", "register", "account", "role"],
    response:
      "🔐 We have 5 user roles: Client, Student, Receptionist, Staff, and Admin. Visit /login to sign in with your preferred role. Admin login is exclusively at /admin/login.",
  },
  {
    keywords: ["calendar", "available", "slot", "time", "availability"],
    response:
      "📆 Our public calendar shows slot availability — no client details are ever shown for privacy. Choose from Morning, Afternoon, Evening, Night, Half Day, or Full Day time slots when booking!",
  },
  {
    keywords: ["payment", "stripe", "razorpay", "pay", "refund"],
    response:
      "💳 We use Stripe for secure payments (Credit/Debit cards, UPI, Net Banking). For bookings: pay the initial deposit to confirm, balance after delivery. For courses: full payment required for certificate.",
  },
  {
    keywords: ["gallery", "work", "sample"],
    response:
      "🖼️ Explore our stunning portfolio in the Gallery section! We showcase our best work across all 23 service categories. Each photo tells a unique story captured by our expert team.",
  },
  {
    keywords: ["service", "offer", "what do you do", "categories"],
    response:
      "🌟 We offer **23 service categories**: Couple Shoots, Single/Portfolio, Family, Kids & Baby, Wedding, Events, Corporate, Fashion, Products, Real Estate, Travel, Videography, Creative/Artistic, Fitness, Pet Photography, Automobile, E-commerce, Food & Restaurant, Educational, Medical, Entertainment, Social Media, and Special Occasions — all at ₹5!",
  },
  {
    keywords: ["newborn", "baby", "kids", "child"],
    response:
      "👶 We offer Newborn Shoots, Baby Milestones, Cake Smash, Birthday Shoots, and Kids Theme Shoots. Gentle, safe, and adorable photography starting at ₹5.",
  },
  {
    keywords: ["family", "reunion", "maternity"],
    response:
      "👨‍👩‍👧 Our family photography includes Family Portraits, Outdoor Sessions, Reunion Shoots, Maternity Shoots, and Lifestyle Family Sessions. Timeless memories, beautifully captured.",
  },
  {
    keywords: ["food", "restaurant", "product", "ecommerce"],
    response:
      "🍽️ We specialize in Food Photography, Restaurant Interiors, Menu Shoots, and E-commerce Product Photography including 360° spins. Make your listings stand out on Zomato, Swiggy, and marketplaces!",
  },
  {
    keywords: ["real estate", "property", "interior", "airbnb"],
    response:
      "🏠 Our Real Estate Photography covers Property Shoots, Interior & Exterior Photography, Commercial Spaces, Airbnb Listings, and Drone Property Shots. Maximize your listing's appeal!",
  },
  {
    keywords: ["social media", "instagram", "reels", "youtube", "influencer"],
    response:
      "📱 We create scroll-stopping Social Media Content — Instagram Reels, YouTube Shorts, Influencer Content, Branding Content, and Viral Campaign Shoots. Grow your presence with professional visuals!",
  },
];

const QUICK_REPLIES = [
  "What services do you offer?",
  "How does booking work?",
  "Course pricing?",
  "How do I get a certificate?",
  "Contact WhatsApp",
];

function getBotResponse(input: string): string {
  if (input === "Contact WhatsApp") {
    return "📲 Reach us directly on WhatsApp: **+91 73385 01228**. Click the WhatsApp button below to start chatting right now!";
  }
  const lower = input.toLowerCase();
  for (const item of FAQ_RESPONSES) {
    if (item.keywords.some((kw) => lower.includes(kw))) {
      return item.response;
    }
  }
  return "🤔 I didn't quite catch that. You can ask me about:\n• 📸 Services & Pricing\n• 🎓 Courses & Certificates\n• 📅 How to Book\n• 💳 Payment Process\n• 📲 Contact & Location\n\nOr reach us directly on WhatsApp: +91 73385 01228";
}

function formatMessage(text: string) {
  return text.split("\n").map((line, i, arr) => (
    <span key={line.slice(0, 15) + String(i)}>
      {line.replace(/\*\*(.*?)\*\*/g, "$1")}
      {i < arr.length - 1 && <br />}
    </span>
  ));
}

const WELCOME: ChatMessage = {
  id: "welcome",
  from: "bot",
  text: "👋 Welcome to **RAP Integrated Studio**! I'm your dedicated AI assistant. Ask me anything about our 23 service categories, 50 professional courses, booking process, pricing, or certificates. How can I help you today?",
  timestamp: new Date(),
};

export function ChatbotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  });

  const sendMessage = (text?: string) => {
    const msg = (text ?? inputValue).trim();
    if (!msg) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      from: "user",
      text: msg,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    setTimeout(
      () => {
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          from: "bot",
          text: getBotResponse(msg),
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMsg]);
        setIsTyping(false);
      },
      700 + Math.random() * 500,
    );
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 space-y-3"
        >
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full gradient-gold flex items-center justify-center shadow-luxury">
              <Bot className="w-6 h-6 text-background" />
            </div>
            <div className="text-left">
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                RAP Studio AI Assistant
              </h1>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                Always online — instant answers
              </p>
            </div>
          </div>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm">
            Ask about services, courses, booking, pricing, certificates, or
            anything about RAP Integrated Studio.
          </p>
        </motion.div>

        {/* Chat Container */}
        <div
          className="glass-effect rounded-2xl border border-border/30 shadow-elevated flex flex-col"
          style={{ height: "60vh", minHeight: "480px" }}
        >
          <ScrollArea
            className="flex-1 p-6"
            ref={scrollRef as React.RefObject<HTMLDivElement>}
          >
            <div className="flex flex-col gap-4">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"} gap-3`}
                  >
                    {msg.from === "bot" && (
                      <div className="w-8 h-8 rounded-full gradient-gold flex items-center justify-center shrink-0 mt-1">
                        <Bot className="w-4 h-4 text-background" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        msg.from === "user"
                          ? "gradient-gold text-background rounded-br-sm"
                          : "bg-card/60 text-foreground rounded-bl-sm border border-border/20"
                      }`}
                    >
                      {formatMessage(msg.text)}
                      <p
                        className={`text-xs mt-1.5 ${msg.from === "user" ? "text-background/60" : "text-muted-foreground"}`}
                      >
                        {msg.timestamp.toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {msg.from === "user" && (
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-1">
                        <MessageCircle className="w-4 h-4 text-secondary-foreground" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start gap-3"
                >
                  <div className="w-8 h-8 rounded-full gradient-gold flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-background" />
                  </div>
                  <div className="bg-card/60 px-4 py-3 rounded-2xl rounded-bl-sm border border-border/20">
                    <div className="flex gap-1 items-center h-4">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 rounded-full bg-primary"
                          animate={{ y: [0, -5, 0] }}
                          transition={{
                            duration: 0.7,
                            delay: i * 0.15,
                            repeat: Number.POSITIVE_INFINITY,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-border/20">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Ask about services, courses, booking…"
                className="flex-1 bg-background/40 border-border/30"
                data-ocid="chatbot-page-input"
              />
              <Button
                type="button"
                className="gradient-gold text-background hover:opacity-90 border-0 shrink-0"
                onClick={() => sendMessage()}
                disabled={!inputValue.trim()}
                aria-label="Send message"
                data-ocid="chatbot-page-send"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Replies */}
        <div className="mt-6">
          <p className="text-xs text-muted-foreground mb-3 text-center font-medium tracking-wide uppercase">
            Quick Questions
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {QUICK_REPLIES.map((qr) => (
              <button
                key={qr}
                type="button"
                onClick={() => sendMessage(qr)}
                className="px-4 py-2 text-sm rounded-full bg-card/60 border border-border/30 text-muted-foreground hover:text-foreground hover:border-primary/40 transition-smooth"
                data-ocid={`quick-reply-${qr.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {qr}
              </button>
            ))}
          </div>
        </div>

        {/* WhatsApp handoff */}
        <div className="mt-8 text-center">
          <div className="inline-flex flex-col items-center gap-3 p-6 rounded-2xl bg-card/30 border border-border/20">
            <p className="text-muted-foreground text-sm">
              Prefer to speak with a human?
            </p>
            <a
              href="https://wa.me/917338501228"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#25D366] text-white font-semibold text-sm hover:opacity-90 transition-smooth shadow-luxury"
              data-ocid="chatbot-whatsapp-handoff"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 fill-current"
                aria-hidden="true"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Chat with Human Support
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
}
