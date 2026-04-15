import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Aperture, Camera, Plus, Star } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { GalleryGrid } from "../components/gallery/GalleryGrid";
import { UploadForm } from "../components/gallery/UploadForm";
import { Layout } from "../components/layout/Layout";
import { useIsStaff } from "../hooks/useAuth";
import type { MediaItem } from "../types";

const FILTER_TABS = [
  { label: "All", value: "all" },
  { label: "Photography", value: "Photography" },
  { label: "Videography", value: "Videography" },
  { label: "Weddings", value: "Weddings" },
  { label: "Events", value: "Events" },
  { label: "Corporate", value: "Corporate" },
  { label: "Portraits", value: "Portraits" },
  { label: "Short Films", value: "Short Films" },
];

const GALLERY_ITEMS: MediaItem[] = [
  {
    id: "g1",
    title: "Golden Hour Wedding",
    category: "Weddings",
    url: "https://images.unsplash.com/photo-1519741347686-c1e0aadf4611?w=800",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1519741347686-c1e0aadf4611?w=800",
    type: "image",
    createdAt: BigInt(Date.now()) * BigInt(1_000_000),
  },
  {
    id: "g2",
    title: "Wedding Ceremony Aisle",
    category: "Weddings",
    url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800",
    type: "image",
    createdAt: BigInt(Date.now() * 1_000_000),
  },
  {
    id: "g3",
    title: "Professional Camera Setup",
    category: "Photography",
    url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800",
    type: "image",
    createdAt: BigInt(Date.now() * 1_000_000),
  },
  {
    id: "g4",
    title: "Portrait Studio Session",
    category: "Photography",
    url: "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800",
    type: "image",
    createdAt: BigInt(Date.now() * 1_000_000),
  },
  {
    id: "g5",
    title: "Cinematic Film Camera",
    category: "Videography",
    url: "https://images.unsplash.com/photo-1601520493833-ab2a1c8c6e22?w=800",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1601520493833-ab2a1c8c6e22?w=800",
    type: "video",
    createdAt: BigInt(Date.now() * 1_000_000),
  },
  {
    id: "g6",
    title: "Professional Film Set",
    category: "Videography",
    url: "https://images.unsplash.com/photo-1535016120720-40c646be5580?w=800",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1535016120720-40c646be5580?w=800",
    type: "video",
    createdAt: BigInt(Date.now() * 1_000_000),
  },
  {
    id: "g7",
    title: "Electric Event Night",
    category: "Events",
    url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800",
    type: "image",
    createdAt: BigInt(Date.now() * 1_000_000),
  },
  {
    id: "g8",
    title: "Live Concert Coverage",
    category: "Events",
    url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
    type: "image",
    createdAt: BigInt(Date.now() * 1_000_000),
  },
  {
    id: "g9",
    title: "Corporate Keynote",
    category: "Corporate",
    url: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800",
    type: "image",
    createdAt: BigInt(Date.now() * 1_000_000),
  },
  {
    id: "g10",
    title: "Business Executive Portrait",
    category: "Corporate",
    url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800",
    type: "image",
    createdAt: BigInt(Date.now() * 1_000_000),
  },
  {
    id: "g11",
    title: "Expressive Female Portrait",
    category: "Portraits",
    url: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800",
    type: "image",
    createdAt: BigInt(Date.now() * 1_000_000),
  },
  {
    id: "g12",
    title: "Dramatic Male Portrait",
    category: "Portraits",
    url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800",
    type: "image",
    createdAt: BigInt(Date.now() * 1_000_000),
  },
  {
    id: "g13",
    title: "Behind the Scenes — Studio",
    category: "Photography",
    url: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800",
    type: "image",
    createdAt: BigInt(Date.now() * 1_000_000),
  },
  {
    id: "g14",
    title: "Film Production BTS",
    category: "Videography",
    url: "https://images.unsplash.com/photo-1607462109225-6b64ae2dd3cb?w=800",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1607462109225-6b64ae2dd3cb?w=800",
    type: "video",
    createdAt: BigInt(Date.now() * 1_000_000),
  },
  {
    id: "g15",
    title: "Short Film Clapperboard",
    category: "Short Films",
    url: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800",
    type: "video",
    createdAt: BigInt(Date.now() * 1_000_000),
  },
  {
    id: "g16",
    title: "Movie Set Atmosphere",
    category: "Short Films",
    url: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800",
    type: "video",
    createdAt: BigInt(Date.now() * 1_000_000),
  },
  {
    id: "g17",
    title: "Monsoon Bridal Shoot",
    category: "Weddings",
    url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800",
    type: "image",
    createdAt: BigInt(Date.now() * 1_000_000),
  },
  {
    id: "g18",
    title: "Fashion Editorial",
    category: "Photography",
    url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800",
    type: "image",
    createdAt: BigInt(Date.now() * 1_000_000),
  },
];

const FEATURED_IDS = ["g1", "g5", "g15"];

const ITEMS_PER_PAGE = 12;

export function GalleryPage() {
  const isStaff = useIsStaff();
  const [activeFilter, setActiveFilter] = useState("all");
  const [showUpload, setShowUpload] = useState(false);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const filteredItems =
    activeFilter === "all"
      ? GALLERY_ITEMS
      : GALLERY_ITEMS.filter((item) => item.category === activeFilter);

  const visibleItems = filteredItems.slice(0, visibleCount);
  const hasMore = visibleCount < filteredItems.length;

  return (
    <Layout>
      {/* Cinematic Hero Banner */}
      <section
        className="relative overflow-hidden bg-card border-b border-border/30"
        style={{ minHeight: "340px" }}
      >
        {/* Background layers */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
        >
          {/* Deep gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background" />
          {/* Animated gold orb */}
          <motion.div
            className="absolute top-10 left-1/3 w-[500px] h-[500px] rounded-full opacity-[0.07]"
            style={{ background: "oklch(0.7 0.22 70)" }}
            animate={{ scale: [1, 1.15, 1], x: [-20, 20, -20] }}
            transition={{
              duration: 8,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
          {/* Purple orb */}
          <motion.div
            className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full opacity-[0.05]"
            style={{ background: "oklch(0.68 0.2 290)" }}
            animate={{ scale: [1.1, 1, 1.1], y: [-10, 10, -10] }}
            transition={{
              duration: 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
          {/* Film grain overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")",
            }}
          />
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-5"
          >
            <motion.div
              className="flex items-center justify-center gap-3"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary/60" />
              <Camera className="w-5 h-5 text-primary" />
              <span className="section-label">Portfolio</span>
              <Aperture className="w-5 h-5 text-primary" />
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary/60" />
            </motion.div>

            <motion.h1
              className="font-display text-5xl md:text-7xl font-bold tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              Our{" "}
              <span className="text-primary text-glow-gold relative">
                Portfolio
                <motion.span
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                />
              </span>
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Capturing moments that last forever. Every frame is a story, every
              story is a memory — crafted with cinematic precision.
            </motion.p>

            {/* Stats row */}
            <motion.div
              className="flex items-center justify-center gap-8 pt-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              {[
                { value: "500+", label: "Shoots" },
                { value: "18", label: "Galleries" },
                { value: "8", label: "Categories" },
              ].map(({ value, label }) => (
                <div key={label} className="text-center">
                  <div className="font-display text-2xl font-bold text-primary">
                    {value}
                  </div>
                  <div className="text-xs text-muted-foreground tracking-wide uppercase">
                    {label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="py-12 bg-muted/20">
        <div className="container mx-auto px-4">
          <motion.div
            className="flex items-center gap-3 mb-8"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Star className="w-5 h-5 text-primary fill-primary" />
            <h2 className="font-display text-2xl font-bold text-foreground">
              Featured Work
            </h2>
            <Badge className="gradient-gold text-background border-0 text-xs">
              Editor's Pick
            </Badge>
          </motion.div>
          <GalleryGrid
            items={GALLERY_ITEMS.filter((i) => FEATURED_IDS.includes(i.id))}
            featuredIds={FEATURED_IDS}
            isLoading={false}
          />
        </div>
      </section>

      {/* Main Gallery */}
      <section className="py-14">
        <div className="container mx-auto px-4">
          {/* Filter tabs + upload */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div
              className="flex flex-wrap gap-2"
              role="tablist"
              aria-label="Gallery category filters"
            >
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  role="tab"
                  aria-selected={activeFilter === tab.value}
                  onClick={() => {
                    setActiveFilter(tab.value);
                    setVisibleCount(ITEMS_PER_PAGE);
                  }}
                  className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    activeFilter === tab.value
                      ? "gradient-gold text-background shadow-subtle"
                      : "bg-card/50 border border-border/30 text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-card"
                  }`}
                  data-ocid={`gallery-filter-${tab.value}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {isStaff && (
              <Button
                type="button"
                className="gradient-gold text-background border-0 hover:opacity-90 gap-2 shrink-0"
                onClick={() => setShowUpload(true)}
                data-ocid="gallery-upload-btn"
              >
                <Plus className="w-4 h-4" />
                Upload Media
              </Button>
            )}
          </div>

          {/* Count + active filter badge */}
          <div className="mb-6 flex items-center gap-3">
            <span className="text-muted-foreground text-sm">
              Showing{" "}
              <strong className="text-foreground">{visibleItems.length}</strong>{" "}
              of{" "}
              <strong className="text-foreground">
                {filteredItems.length}
              </strong>{" "}
              {filteredItems.length === 1 ? "item" : "items"}
            </span>
            {activeFilter !== "all" && (
              <Badge
                variant="outline"
                className="border-primary/30 text-primary text-xs"
              >
                {activeFilter}
              </Badge>
            )}
          </div>

          {/* Grid */}
          <GalleryGrid
            items={visibleItems}
            featuredIds={FEATURED_IDS}
            isLoading={false}
          />

          {/* Load More */}
          {hasMore && (
            <motion.div
              className="flex justify-center mt-12"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <Button
                type="button"
                variant="outline"
                className="border-primary/40 text-primary hover:bg-primary/10 hover:border-primary px-10 py-6 text-base font-semibold gap-2 transition-all duration-200 hover:scale-105"
                onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_PAGE)}
                data-ocid="gallery-load-more"
              >
                <Camera className="w-4 h-4" />
                Load More Photos
              </Button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Upload Modal */}
      <UploadForm
        open={showUpload}
        onClose={() => setShowUpload(false)}
        onSuccess={() => setShowUpload(false)}
      />
    </Layout>
  );
}
