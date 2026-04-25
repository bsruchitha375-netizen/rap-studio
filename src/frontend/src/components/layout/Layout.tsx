import { Toaster } from "@/components/ui/sonner";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { ChatbotWidget } from "../chatbot/ChatbotWidget";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";

interface LayoutProps {
  children: ReactNode;
}

const WhatsAppIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-6 h-6"
    aria-hidden="true"
  >
    <title>WhatsApp</title>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.553 4.126 1.527 5.862L.057 23.52a.5.5 0 0 0 .622.609l5.806-1.522A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.908 0-3.7-.51-5.242-1.4l-.373-.215-3.87 1.015 1.032-3.763-.23-.389A9.951 9.951 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
  </svg>
);

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-x-hidden">
      {/* Ambient background — subtle gold glow visible in both modes */}
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -top-60 -right-60 w-[600px] h-[600px] rounded-full opacity-[0.04] bg-primary blur-[100px]" />
        <div className="absolute top-1/3 -left-60 w-[500px] h-[500px] rounded-full opacity-[0.03] bg-accent blur-[100px]" />
        <div className="absolute bottom-0 right-1/3 w-96 h-96 rounded-full opacity-[0.025] bg-primary blur-3xl" />
      </div>

      <Navbar />

      <main className="flex-1 pt-16 md:pt-20">{children}</main>

      <Footer />
      <ChatbotWidget />

      {/* Floating WhatsApp Button */}
      <motion.button
        type="button"
        aria-label="Chat with us on WhatsApp"
        data-ocid="btn-whatsapp-float"
        onClick={() =>
          window.open(
            "https://wa.me/917338501228",
            "_blank",
            "noopener,noreferrer",
          )
        }
        initial={{ opacity: 0, scale: 0.6, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          delay: 1.5,
          duration: 0.55,
          type: "spring",
          stiffness: 220,
          damping: 20,
        }}
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.93 }}
        className="fixed z-[9999] flex flex-col items-center gap-1 bg-transparent border-0 p-0 cursor-pointer"
        style={{ bottom: "88px", right: "22px" }}
      >
        {/* Pulse ring */}
        <motion.span
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{ backgroundColor: "#25D366" }}
          animate={{ scale: [1, 1.6, 1], opacity: [0.45, 0, 0.45] }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          aria-hidden="true"
        />
        {/* Button circle */}
        <span
          className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-2xl text-white"
          style={{ backgroundColor: "#25D366" }}
        >
          <WhatsAppIcon />
        </span>
        {/* Label */}
        <span
          className="text-[9px] font-bold px-2 py-0.5 rounded-full shadow-lg whitespace-nowrap tracking-wide uppercase"
          style={{ backgroundColor: "#1da851", color: "#fff" }}
        >
          Chat
        </span>
      </motion.button>

      <Toaster richColors position="top-right" />
    </div>
  );
}
