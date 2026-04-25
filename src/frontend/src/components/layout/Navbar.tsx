import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useRouter } from "@tanstack/react-router";
import { Bell, ChevronDown, LogOut, Menu, User, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useMyNotifications } from "../../hooks/useBackend";
import { ThemeToggle } from "./ThemeToggle";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Courses", href: "/courses" },
  { label: "Gallery", href: "/gallery" },
  { label: "Book Now", href: "/booking" },
];

const ROLE_DASHBOARD: Record<string, string> = {
  staff: "/dashboard/staff",
  receptionist: "/dashboard/receptionist",
  client: "/dashboard/client",
  student: "/dashboard/student",
};

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { isLoggedIn, logout, role } = useAuth();
  const isAuthenticated = isLoggedIn;
  const { data: notifications } = useMyNotifications();
  const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;
  const router = useRouter();
  const currentPath = router.state.location.pathname;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!profileOpen) return;
    const handler = (e: MouseEvent) => {
      if (!(e.target as Element).closest("[data-profile-dropdown]")) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [profileOpen]);

  const dashboardHref = role
    ? (ROLE_DASHBOARD[role] ?? "/dashboard")
    : "/login";

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-card/95 backdrop-blur-xl shadow-elevated border-b border-border/40"
          : "bg-card/90 backdrop-blur-lg border-b border-border/20"
      }`}
      data-ocid="navbar"
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link
            to="/"
            className="flex items-center gap-3 group flex-shrink-0"
            data-ocid="nav.logo"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-full gradient-gold flex items-center justify-center shadow-glow-gold group-hover:scale-105 transition-smooth">
                <span className="font-display font-bold text-sm text-primary-foreground">
                  RAP
                </span>
              </div>
              <div className="absolute inset-0 rounded-full gradient-gold opacity-30 blur-lg group-hover:opacity-60 transition-smooth" />
            </div>
            <div className="hidden sm:block">
              <p className="font-display font-bold text-foreground text-lg leading-none tracking-tight">
                <span className="gold-text">RAP</span> Studio
              </p>
              <p className="text-[10px] text-muted-foreground leading-tight tracking-widest uppercase">
                Integrated Studio Management
              </p>
            </div>
          </Link>

          <nav
            className="hidden md:flex items-center gap-1"
            aria-label="Main navigation"
          >
            {NAV_LINKS.map((link) => {
              const isActive = currentPath === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className="relative px-4 py-2 text-sm font-medium transition-smooth group"
                  data-ocid={`nav.${link.label.toLowerCase().replace(" ", "-")}.link`}
                >
                  <span
                    className={
                      isActive
                        ? "text-primary font-semibold"
                        : "text-foreground/70 group-hover:text-foreground"
                    }
                  >
                    {link.label}
                  </span>
                  {isActive && (
                    <motion.span
                      layoutId="nav-active-indicator"
                      className="absolute -bottom-0.5 left-2 right-2 h-0.5 rounded-full"
                      style={{ background: "var(--gradient-gold)" }}
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                  {!isActive && (
                    <span
                      className="absolute -bottom-0.5 left-2 right-2 h-0.5 rounded-full opacity-0 group-hover:opacity-50 transition-smooth"
                      style={{ background: "var(--gradient-gold)" }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1.5">
            <ThemeToggle />

            {isAuthenticated && (
              <Button
                variant="ghost"
                size="icon"
                className="relative w-9 h-9 hover:bg-primary/10 hover:text-primary transition-smooth text-foreground"
                aria-label="Notifications"
                data-ocid="nav.notifications"
              >
                <Bell className="w-[18px] h-[18px]" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 text-[10px] flex items-center justify-center gradient-gold text-primary-foreground border-0 shadow-glow-gold">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Badge>
                )}
              </Button>
            )}

            {isAuthenticated ? (
              <div className="relative" data-profile-dropdown="true">
                <Button
                  variant="ghost"
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 h-9 px-2 hover:bg-primary/10 transition-smooth text-foreground"
                  data-ocid="nav.profile"
                >
                  <div className="w-8 h-8 rounded-full gradient-gold flex items-center justify-center shadow-glow-gold">
                    <User className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <span className="hidden md:inline text-sm capitalize font-medium">
                    {role}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 hidden md:block transition-smooth ${profileOpen ? "rotate-180" : ""}`}
                  />
                </Button>
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-52 bg-card border border-border shadow-elevated rounded-xl overflow-hidden"
                    >
                      <div className="px-4 py-2.5 border-b border-border/50">
                        <p className="text-xs text-muted-foreground">
                          Signed in as
                        </p>
                        <p className="text-sm font-semibold capitalize text-foreground">
                          {role}
                        </p>
                      </div>
                      <Link
                        to={dashboardHref}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-primary/10 hover:text-primary transition-smooth"
                        onClick={() => setProfileOpen(false)}
                        data-ocid="nav.dashboard.link"
                      >
                        <User className="w-4 h-4 text-muted-foreground" />
                        My Dashboard
                      </Link>
                      <button
                        type="button"
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-destructive hover:bg-destructive/10 transition-smooth"
                        onClick={() => {
                          logout();
                          setProfileOpen(false);
                        }}
                        data-ocid="nav.logout.button"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login" data-ocid="nav.login.link">
                <Button className="btn-primary-luxury hidden sm:flex h-9 px-5 text-sm">
                  Sign In
                </Button>
              </Link>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden w-9 h-9 hover:bg-primary/10 transition-smooth text-foreground"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
              aria-expanded={isOpen}
              data-ocid="nav.hamburger.button"
            >
              {isOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-card border-t border-border/40 overflow-hidden"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-1">
              {NAV_LINKS.map((link, i) => {
                const isActive = currentPath === link.href;
                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      to={link.href}
                      className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-smooth ${
                        isActive
                          ? "text-primary bg-primary/10 font-semibold"
                          : "text-foreground hover:text-primary hover:bg-primary/5"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                      )}
                      {link.label}
                    </Link>
                  </motion.div>
                );
              })}
              {!isAuthenticated && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    <Button className="w-full mt-3 btn-primary-luxury">
                      Sign In
                    </Button>
                  </Link>
                </motion.div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
