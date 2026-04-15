import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, MessageCircle, Send, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

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
      '📅 To book a service: 1) Choose your service category, 2) Select date, time slot & location, 3) Submit your request. Our receptionist will review it, and admin will send you a Razorpay payment link for ₹2 to confirm. After delivery, pay the remaining ₹3. Click "Book Now" in the navigation to get started!',
  },
  {
    keywords: ["course", "learn", "class", "training", "education", "workshop"],
    response:
      "🎓 We offer 50 professional courses across Photography, Videography, Editing, Business, and Specialized categories — all at just ₹5! Courses are available online, offline, and hybrid. Upon completion, receive a QR-verified certificate. Visit our Courses page to explore!",
  },
  {
    keywords: ["certificate", "verify", "certification", "credential"],
    response:
      "🏆 Course certificates are issued after completing the course AND full ₹5 payment. Each certificate has a unique QR code for public verification at /verify/{code}. If payment is overdue, certificate issuance is blocked until cleared.",
  },
  {
    keywords: ["wedding", "couple", "pre-wedding", "engagement"],
    response:
      "💑 We offer comprehensive wedding photography including full wedding coverage, candid, traditional, drone, bridal & groom shoots, and beautiful pre/post-wedding sessions. All packages at ₹5 — book through our Services page!",
  },
  {
    keywords: ["video", "videography", "film", "reel", "cinematic"],
    response:
      "🎥 Our videography services include wedding cinematic films, event highlights, promotional videos, music videos, YouTube content, and drone videography — all shot with cinema-grade equipment. Starting at ₹5!",
  },
  {
    keywords: ["portfolio", "model", "fashion", "actor", "headshot"],
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
      "🔐 We have 5 user roles: Client, Student, Receptionist, Staff, and Admin. Visit /login to sign in with your preferred role. Admin login is exclusively at /admin/login. Use Internet Identity for secure, decentralized authentication!",
  },
  {
    keywords: ["calendar", "available", "slot", "time", "availability"],
    response:
      '📆 Our public calendar shows slot availability as "Slot taken on [date] at [time]" — no client details are ever shown for privacy. Choose from Morning, Afternoon, Evening, Night, Half Day, or Full Day time slots when booking!',
  },
  {
    keywords: ["payment", "razorpay", "pay", "refund"],
    response:
      "💳 We use Razorpay for secure payments (Credit/Debit cards, UPI, Net Banking). For bookings: pay ₹2 upfront to confirm, ₹3 after delivery. For courses: full ₹5 payment required for certificate. All transactions are encrypted and secure!",
  },
  {
    keywords: ["gallery", "portfolio", "work", "sample", "photo"],
    response:
      "🖼️ Explore our stunning portfolio in the Gallery section! We showcase our best work across all 23 service categories. Each photo tells a unique story captured by our expert team.",
  },
  {
    keywords: ["drone", "aerial", "flying"],
    response:
      "🚁 We offer professional drone photography and videography for weddings, real estate, automobile shoots, and travel. All our drone operators are DGCA certified. Add drone coverage to any service package!",
  },
  {
    keywords: ["corporate", "business", "office", "headshot", "team"],
    response:
      "🏢 Our corporate photography services include business headshots, office branding, team photos, product photography, conference coverage, and industrial shoots. All professionally done at just ₹5!",
  },
];

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  from: "bot",
  text: "👋 Welcome to **RAP Integrated Studio**! I'm your AI assistant. Ask me about our services, courses, pricing, booking process, or certificates. How can I help you today?",
  timestamp: new Date(),
};

function getBotResponse(input: string): string {
  const lower = input.toLowerCase();
  for (const item of FAQ_RESPONSES) {
    if (item.keywords.some((kw) => lower.includes(kw))) {
      return item.response;
    }
  }
  return `🤔 I didn't quite catch that. You can ask me about:\n• 📸 Services & Pricing\n• 🎓 Courses & Certificates\n• 📅 How to Book\n• 💳 Payment Process\n• 📲 Contact & Location\n\nOr reach us directly on WhatsApp: +91 73385 01228`;
}

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [inputValue, setInputValue] = useState("");
  const [unreadCount, setUnreadCount] = useState(1);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  });

  const sendMessage = () => {
    const text = inputValue.trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      from: "user",
      text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    setTimeout(
      () => {
        const response = getBotResponse(text);
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          from: "bot",
          text: response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMsg]);
        setIsTyping(false);
        if (!isOpen) setUnreadCount((n) => n + 1);
      },
      800 + Math.random() * 600,
    );
  };

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3"
      data-ocid="chatbot-widget"
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-80 sm:w-96 h-[480px] glass-effect rounded-2xl border border-border/30 shadow-elevated flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 gradient-gold">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-background/20 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-background" />
                </div>
                <div>
                  <p className="font-display font-bold text-sm text-background leading-none">
                    RAP Assistant
                  </p>
                  <p className="text-xs text-background/70">
                    Always here to help
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-background hover:bg-background/20 h-8 w-8"
                onClick={() => setIsOpen(false)}
                aria-label="Close chatbot"
                data-ocid="chatbot-close"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Messages */}
            <ScrollArea
              className="flex-1 p-4"
              ref={scrollRef as React.RefObject<HTMLDivElement>}
            >
              <div className="flex flex-col gap-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                        msg.from === "user"
                          ? "gradient-gold text-background rounded-br-sm"
                          : "bg-card/60 text-foreground rounded-bl-sm"
                      }`}
                    >
                      {msg.text.split("\n").map((line, idx) => (
                        <span key={`${msg.id}-line-${idx}`}>
                          {line.replace(/\*\*(.*?)\*\*/g, "$1")}
                          {idx < msg.text.split("\n").length - 1 && <br />}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-card/60 px-3 py-2 rounded-xl rounded-bl-sm">
                      <div className="flex gap-1 items-center h-4">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-primary"
                            animate={{ y: [0, -4, 0] }}
                            transition={{
                              duration: 0.6,
                              delay: i * 0.15,
                              repeat: Number.POSITIVE_INFINITY,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-3 border-t border-border/20">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Ask about services, courses..."
                  className="flex-1 bg-card/40 border-border/30 text-sm"
                  data-ocid="chatbot-input"
                />
                <Button
                  size="icon"
                  className="gradient-gold text-background hover:opacity-90 flex-shrink-0"
                  onClick={sendMessage}
                  disabled={!inputValue.trim()}
                  aria-label="Send message"
                  data-ocid="chatbot-send"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Or{" "}
                <a
                  href="https://wa.me/917338501228"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#25D366] hover:underline"
                >
                  chat on WhatsApp
                </a>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full gradient-gold shadow-luxury flex items-center justify-center relative"
        aria-label={isOpen ? "Close chatbot" : "Open chatbot"}
        data-ocid="chatbot-toggle"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="w-6 h-6 text-background" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <MessageCircle className="w-6 h-6 text-background" />
            </motion.div>
          )}
        </AnimatePresence>
        {!isOpen && unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs font-bold flex items-center justify-center"
          >
            {unreadCount}
          </motion.span>
        )}
      </motion.button>
    </div>
  );
}
