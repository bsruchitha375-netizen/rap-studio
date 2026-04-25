import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Aperture, Camera, Plus, Star } from "lucide-react";
import { motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { GalleryGrid } from "../components/gallery/GalleryGrid";
import { UploadForm } from "../components/gallery/UploadForm";
import { Layout } from "../components/layout/Layout";
import { useIsStaff } from "../hooks/useAuth";
import { useCmsSection } from "../hooks/useCmsContent";
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

const DEFAULT_GALLERY_ITEMS: MediaItem[] = [
  {
    id: "g1",
    title: "Golden Hour Wedding",
    category: "Weddings",
    url: "https://images.unsplash.com/photo-1519741347686-c1e0aadf4611?w=900",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1519741347686-c1e0aadf4611?w=800",
    type: "image",
    createdAt: BigInt(Date.now()) * BigInt(1_000_000),
  },
  {
    id: "g2",
    title: "Wedding Ceremony Aisle",
    category: "Weddings",
    url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=900",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800",
    type: "image",
    createdAt: BigInt(Date.now() * 1_000_000),
  },
  {
    id: "g3",
    title: "Professional Camera Setup",
    category: "Photography",
    url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=900",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800",
    type: "image",
    createdAt: BigInt(Date.now() * 1_000_000),
  },
  {
    id: "g4",
    title: "Portrait Studio Session",
    category: "Photography",
    url: "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=900",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800",
    type: "image",
    createdAt: BigInt(Date.now() * 1_000_000),
  },
  {
    id: "g5",
    title: "Cinematic Film Camera",
    category: "Videography",
    url: "https://images.unsplash.com/photo-1601520493833-ab2a1c8c6e22?w=900",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1601520493833-ab2a1c8c6e22?w=800",
    type: "video",
    createdAt: BigInt(Date.now() * 1_000_000),
  },
  {
    id: "g6",
    title: "Professional Film Set",
    category: "Videography",
    url: "https://images.unsplash.com/photo-1535016120720-40c646be5580?w=900",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1535016120720-40c646be5580?w=800",
    type: "video",
    createdAt: BigInt(Date.now() * 1_000_000),
  },
  {
    id: "g7",
    title: "Electric Event Night",
    category: "Events",
    url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=900",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800",
    type: "image",
    createdAt: BigInt(Date.now() * 1_000_000),
  },
  {
    id: "g8",
    title: "Live Concert Coverage",
    category: "Events",
    url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
    type: "image",
    createdAt: BigInt(Date.now() * 1_000_000),
  },
  {
    id: "g9",
    title: "Corporate Keynote",
    category: "Corporate",
    url: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=900",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800",
    type: "image",
    createdAt: BigInt(Date.now() * 1_000_000),
  },
  {
    id: "g10",
    title: "Business Executive Portrait",
    category: "Corporate",
    url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=900",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800",
    type: "image",
    createdAt: BigInt(Date.now() * 1_000_000),
  },
  {
    id: "g11",
    title: "Expressive Female Portrait",
    category: "Portraits",
    url: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=900",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800",
    type: "image",
    createdAt: BigInt(Date.now() * 1_000_000),
  },
  {
    id: "g12",
    title: "Dramatic Male Portrait",
    category: "Portraits",
    url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=900",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800",
    type: "image",
    createdAt: BigInt(Date.now() * 1_000_000),
  },
  {
    id: "g13",
    title: "Behind the Scenes — Studio",
    category: "Photography",
    url: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=900",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800",
    type: "image",
    createdAt: BigInt(Date.now() * 1_000_000),
  },
  {
    id: "g14",
    title: "Film Production BTS",
    category: "Videography",
    url: "https://images.unsplash.com/photo-1607462109225-6b64ae2dd3cb?w=900",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1607462109225-6b64ae2dd3cb?w=800",
    type: "video",
    createdAt: BigInt(Date.now() * 1_000_000),
  },
  {
    id: "g15",
    title: "Short Film Clapperboard",
    category: "Short Films",
    url: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=900",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800",
    type: "video",
    createdAt: BigInt(Date.now() * 1_000_000),
  },
  {
    id: "g16",
    title: "Movie Set Atmosphere",
    category: "Short Films",
    url: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=900",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800",
    type: "video",
    createdAt: BigInt(Date.now() * 1_000_000),
  },
  {
    id: "g17",
    title: "Monsoon Bridal Shoot",
    category: "Weddings",
    url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=900",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800",
    type: "image",
    createdAt: BigInt(Date.now() * 1_000_000),
  },
  {
    id: "g18",
    title: "Fashion Editorial",
    category: "Photography",
    url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=900",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800",
    type: "image",
    createdAt: BigInt(Date.now() * 1_000_000),
  },
  {
    id: "g19",
    title: "Studio Light Trail",
    category: "Photography",
    url: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=900",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800",
    type: "image",
    createdAt: BigInt(Date.now() * 1_000_000),
  },
  {
    id: "g20",
    title: "Cinematic Night Scene",
    category: "Videography",
    url: "https://images.unsplash.com/photo-1478358161113-b0e11994a36b?w=900",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1478358161113-b0e11994a36b?w=800",
    type: "video",
    createdAt: BigInt(Date.now() * 1_000_000),
  },
  {
    id: "g21",
    title: "Bridal Ceremony Detail",
    category: "Weddings",
    url: "https://images.unsplash.com/photo-1583244532610-2cf4ba9e3f73?w=900",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1583244532610-2cf4ba9e3f73?w=800",
    type: "image",
    createdAt: BigInt(Date.now() * 1_000_000),
  },
  {
    id: "g22",
    title: "Corporate Team Portrait",
    category: "Corporate",
    url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800",
    type: "image",
    createdAt: BigInt(Date.now() * 1_000_000),
  },
  {
    id: "g23",
    title: "Intimate Portrait Session",
    category: "Portraits",
    url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=900",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800",
    type: "image",
    createdAt: BigInt(Date.now() * 1_000_000),
  },
  {
    id: "g24",
    title: "Award Night Coverage",
    category: "Events",
    url: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=900",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800",
    type: "image",
    createdAt: BigInt(Date.now() * 1_000_000),
  },
];

const FEATURED_IDS = ["g1", "g5", "g15", "g11"];
const ITEMS_PER_PAGE = 12;

function mergeGalleryItems(
  defaults: MediaItem[],
  cmsItems: {
    id: string;
    title: string;
    category: string;
    url: string;
    thumbnailUrl: string;
    type: "image" | "video";
  }[],
): MediaItem[] {
  if (!cmsItems.length) return defaults;
  const cmsMap = new Map(cmsItems.map((i) => [i.id, i]));
  const merged = defaults.map((item) => {
    const override = cmsMap.get(item.id);
    if (override) {
      return {
        ...item,
        title: override.title,
        category: override.category,
        url: override.url,
        thumbnailUrl: override.thumbnailUrl,
        type: override.type,
      };
    }
    return item;
  });
  for (const ci of cmsItems) {
    if (!merged.find((m) => m.id === ci.id)) {
      merged.push({
        id: ci.id,
        title: ci.title,
        category: ci.category,
        url: ci.url,
        thumbnailUrl: ci.thumbnailUrl,
        type: ci.type,
        createdAt: BigInt(Date.now() * 1_000_000),
      });
    }
  }
  return merged;
}

export function GalleryPage() {
  const isStaff = useIsStaff();
  const [activeFilter, setActiveFilter] = useState("all");
  const [showUpload, setShowUpload] = useState(false);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const mainRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(mainRef, { once: true });

  const cmsGallery = useCmsSection("gallery");
  const [galleryItems, setGalleryItems] = useState<MediaItem[]>(() =>
    mergeGalleryItems(DEFAULT_GALLERY_ITEMS, cmsGallery),
  );

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const detail = (e as CustomEvent<{ section?: string }>).detail;
      if (!detail?.section || detail.section === "gallery") {
        try {
          const raw = localStorage.getItem("cms_gallery");
          const items = raw
            ? (JSON.parse(raw) as Array<{
                id: string;
                title: string;
                category: string;
                url: string;
                thumbnailUrl: string;
                type: "image" | "video";
              }>)
            : [];
          setGalleryItems(mergeGalleryItems(DEFAULT_GALLERY_ITEMS, items));
        } catch {
          setGalleryItems(DEFAULT_GALLERY_ITEMS);
        }
        setVisibleCount(ITEMS_PER_PAGE);
      }
    };
    window.addEventListener("cms-updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("cms-updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  useEffect(() => {
    setGalleryItems(mergeGalleryItems(DEFAULT_GALLERY_ITEMS, cmsGallery));
  }, [cmsGallery]);

  const filteredItems =
    activeFilter === "all"
      ? galleryItems
      : galleryItems.filter((item) => item.category === activeFilter);
  const visibleItems = filteredItems.slice(0, visibleCount);
  const hasMore = visibleCount < filteredItems.length;

  return (
    <Layout>
      {/* Cinematic Hero Banner */}
      <section
        className="relative overflow-hidden border-b border-border/20"
        style={{ minHeight: "420px" }}
      >
        {/* Background image with parallax feel */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1600&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.22) saturate(0.7)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />

        {/* Gold ambient glow */}
        <motion.div
          className="absolute top-1/4 left-1/3 w-[600px] h-[400px] rounded-full opacity-[0.1] pointer-events-none"
          style={{ background: "oklch(0.72 0.14 82)" }}
          animate={{ scale: [1, 1.12, 1], x: [-15, 15, -15] }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />

        <div className="container mx-auto px-4 py-28 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-5"
          >
            <motion.div
              className="flex items-center justify-center gap-3"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="h-px w-20 bg-gradient-to-r from-transparent to-primary/50" />
              <Camera className="w-5 h-5 text-primary" />
              <span className="section-label tracking-[2px]">Portfolio</span>
              <Aperture className="w-5 h-5 text-primary" />
              <div className="h-px w-20 bg-gradient-to-l from-transparent to-primary/50" />
            </motion.div>

            <motion.h1
              className="section-heading text-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              Our{" "}
              <span className="text-primary text-glow-gold relative inline-block">
                Gallery
                <motion.span
                  className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full"
                  style={{ background: "var(--gradient-gold)" }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.9, delay: 0.7 }}
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

            {/* Stats */}
            <motion.div
              className="flex items-center justify-center gap-12 pt-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.55 }}
            >
              {[
                { value: "500+", label: "Shoots" },
                { value: String(galleryItems.length), label: "Photos" },
                { value: "8", label: "Categories" },
              ].map(({ value, label }) => (
                <div key={label} className="text-center">
                  <div className="font-display text-2xl font-bold text-primary">
                    {value}
                  </div>
                  <div className="text-[10px] text-muted-foreground tracking-widest uppercase mt-0.5">
                    {label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured */}
      <section className="py-14 bg-muted/15 border-b border-border/15">
        <div className="container mx-auto px-4">
          <motion.div
            className="flex items-center gap-3 mb-8"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="w-1 h-7 rounded-full bg-primary" />
            <Star className="w-5 h-5 text-primary fill-primary" />
            <h2 className="font-display text-2xl font-bold text-foreground">
              Featured Work
            </h2>
            <Badge className="gradient-gold text-primary-foreground border-0 text-xs shadow-glow-gold">
              Editor's Pick
            </Badge>
          </motion.div>
          <GalleryGrid
            items={galleryItems.filter((i) => FEATURED_IDS.includes(i.id))}
            featuredIds={FEATURED_IDS}
            isLoading={false}
          />
        </div>
      </section>

      {/* Main Gallery */}
      <section className="py-14 bg-background" ref={mainRef}>
        <div className="container mx-auto px-4">
          {/* Filter + upload row */}
          <motion.div
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
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
                  className={`relative px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                    activeFilter === tab.value
                      ? "text-primary-foreground shadow-glow-gold"
                      : "glass-effect-subtle text-muted-foreground hover:text-foreground hover:border-primary/30"
                  }`}
                  style={
                    activeFilter === tab.value
                      ? { background: "var(--gradient-gold)" }
                      : undefined
                  }
                  data-ocid="gallery.filter.tab"
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {isStaff && (
              <Button
                type="button"
                className="gradient-gold text-primary-foreground border-0 hover:opacity-90 gap-2 shrink-0 shadow-glow-gold"
                onClick={() => setShowUpload(true)}
                data-ocid="gallery.upload_button"
              >
                <Plus className="w-4 h-4" />
                Upload Media
              </Button>
            )}
          </motion.div>

          <div className="mb-5 flex items-center gap-3">
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

          <GalleryGrid
            items={visibleItems}
            featuredIds={FEATURED_IDS}
            isLoading={false}
          />

          {hasMore && (
            <motion.div
              className="flex justify-center mt-14"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <Button
                type="button"
                variant="outline"
                className="border-primary/40 text-primary hover:bg-primary/10 hover:border-primary px-12 py-6 text-base font-semibold gap-2 transition-all duration-200 hover:scale-105 shadow-glow-gold"
                onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_PAGE)}
                data-ocid="gallery.load_more_button"
              >
                <Camera className="w-4 h-4" />
                Load More Photos
              </Button>
            </motion.div>
          )}
        </div>
      </section>

      <UploadForm
        open={showUpload}
        onClose={() => setShowUpload(false)}
        onSuccess={() => setShowUpload(false)}
      />
    </Layout>
  );
}
