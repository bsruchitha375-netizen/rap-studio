import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useRouter } from "@tanstack/react-router";
import { Bell, ChevronDown, LogOut, Menu, User, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useAuth, useRole } from "../../hooks/useAuth";
import { useMyNotifications } from "../../hooks/useBackend";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Courses", href: "/courses" },
  { label: "Gallery", href: "/gallery" },
  { label: "Book Now", href: "/booking" },
];

const ROLE_DASHBOARD: Record<string, string> = {
  admin: "/admin",
  staff: "/dashboard/staff",
  receptionist: "/dashboard/receptionist",
  client: "/dashboard/client",
  student: "/dashboard/student",
};

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const role = useRole();
  const { data: notifications } = useMyNotifications();
  const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const dashboardHref = role
    ? (ROLE_DASHBOARD[role] ?? "/dashboard")
    : "/login";

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass-effect shadow-elevated border-b border-border/20"
          : "bg-transparent"
      }`}
      data-ocid="navbar"
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 group"
            data-ocid="nav-logo"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-full gradient-gold flex items-center justify-center shadow-luxury group-hover:scale-105 transition-smooth">
                <span className="font-display font-bold text-sm text-background">
                  RAP
                </span>
              </div>
              <div className="absolute inset-0 rounded-full gradient-gold opacity-40 blur-md group-hover:opacity-70 transition-smooth" />
            </div>
            <div className="hidden sm:block">
              <p className="font-display font-bold text-foreground text-lg leading-none">
                RAP Studio
              </p>
              <p className="text-xs text-muted-foreground leading-tight">
                Integrated Studio Management
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav
            className="hidden md:flex items-center gap-1"
            aria-label="Main navigation"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-card/40 rounded-lg transition-smooth"
                activeProps={{ className: "text-primary" }}
                data-ocid={`nav-link-${link.label.toLowerCase()}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            {isAuthenticated && (
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                aria-label="Notifications"
                data-ocid="nav-notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 text-xs flex items-center justify-center bg-primary text-primary-foreground">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            )}

            {/* Auth */}
            {isAuthenticated ? (
              <div className="relative">
                <Button
                  variant="ghost"
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2"
                  data-ocid="nav-profile"
                >
                  <div className="w-8 h-8 rounded-full gradient-gold flex items-center justify-center">
                    <User className="w-4 h-4 text-background" />
                  </div>
                  <span className="hidden md:inline text-sm capitalize">
                    {role}
                  </span>
                  <ChevronDown className="w-4 h-4 hidden md:block" />
                </Button>
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-48 glass-effect rounded-xl border border-border/30 shadow-elevated overflow-hidden"
                    >
                      <Link
                        to={dashboardHref}
                        className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-card/60 transition-smooth"
                        onClick={() => setProfileOpen(false)}
                        data-ocid="nav-dashboard"
                      >
                        <User className="w-4 h-4 text-muted-foreground" />
                        Dashboard
                      </Link>
                      <button
                        type="button"
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-destructive hover:bg-card/60 transition-smooth"
                        onClick={() => {
                          logout();
                          setProfileOpen(false);
                        }}
                        data-ocid="nav-logout"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login" data-ocid="nav-login">
                <Button className="btn-primary-luxury hidden sm:flex">
                  Sign In
                </Button>
              </Link>
            )}

            {/* Mobile hamburger */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
              aria-expanded={isOpen}
              data-ocid="nav-hamburger"
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

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden glass-effect border-t border-border/20 overflow-hidden"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-card/40 rounded-lg transition-smooth"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {!isAuthenticated && (
                <Link to="/login" onClick={() => setIsOpen(false)}>
                  <Button className="w-full mt-2 btn-primary-luxury">
                    Sign In
                  </Button>
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
