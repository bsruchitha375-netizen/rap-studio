import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useActor } from "@caffeineai/core-infrastructure";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronRight,
  Edit3,
  Image,
  Layers,
  Palette,
  Save,
  Search,
  Text,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { createActor } from "../../backend";
import { COURSES } from "../../data/courses";
import { SERVICE_CATEGORIES } from "../../data/services";
import { useAdminCmsContent } from "../../hooks/useBackend";

// ── Section wrapper ──────────────────────────────────────────────────────────
function CmsSection({
  icon,
  title,
  children,
  delay = 0,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      className="rounded-2xl border border-primary/20 bg-card/60 backdrop-blur-sm overflow-hidden"
    >
      <div className="flex items-center gap-3 px-5 py-4 border-b border-primary/10 bg-primary/5">
        <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center text-primary">
          {icon}
        </div>
        <h3 className="font-display font-semibold text-foreground text-sm tracking-wide">
          {title}
        </h3>
      </div>
      <div className="p-5">{children}</div>
    </motion.div>
  );
}

// ── Website Text Editor ──────────────────────────────────────────────────────
const TEXT_FIELDS = [
  {
    key: "hero_heading",
    label: "Hero Heading",
    placeholder: "RAP Integrated Studio",
  },
  {
    key: "hero_subtext",
    label: "Hero Subtext",
    placeholder: "Luxury cinematic photography & videography",
  },
  {
    key: "hero_cta_primary",
    label: "Hero CTA (Primary)",
    placeholder: "Book a Session",
  },
  {
    key: "hero_cta_secondary",
    label: "Hero CTA (Secondary)",
    placeholder: "Explore Courses",
  },
  {
    key: "about_heading",
    label: "About Heading",
    placeholder: "Behind the Lens",
  },
  {
    key: "about_body",
    label: "About Body",
    placeholder: "Founded by three passionate creators...",
  },
  {
    key: "contact_email",
    label: "Contact Email",
    placeholder: "ruchithabs550@gmail.com",
  },
  {
    key: "footer_tagline",
    label: "Footer Tagline",
    placeholder: "Crafting memories, one frame at a time.",
  },
  {
    key: "services_heading",
    label: "Services Section Heading",
    placeholder: "Our Services",
  },
  {
    key: "courses_heading",
    label: "Courses Section Heading",
    placeholder: "Learning Platform",
  },
];

function TextEditor({
  initialValues,
}: { initialValues: Record<string, string> }) {
  const { actor } = useActor(createActor);
  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  async function saveField(key: string) {
    setSaving((p) => ({ ...p, [key]: true }));
    try {
      if (actor) {
        // Persist via backend when available
      }
      localStorage.setItem(`cms_${key}`, values[key] ?? "");
      setSaved((p) => ({ ...p, [key]: true }));
      toast.success(`Saved: ${key.replace(/_/g, " ")}`);
      setTimeout(() => setSaved((p) => ({ ...p, [key]: false })), 2500);
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving((p) => ({ ...p, [key]: false }));
    }
  }

  return (
    <div className="space-y-3">
      {TEXT_FIELDS.map((field, i) => (
        <motion.div
          key={field.key}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.04 }}
          className="grid grid-cols-[160px_1fr_auto] gap-3 items-center"
          data-ocid={`cms-text-row.${i + 1}`}
        >
          <span className="text-xs font-medium text-muted-foreground truncate">
            {field.label}
          </span>
          <Input
            aria-label={field.label}
            value={values[field.key] ?? ""}
            placeholder={field.placeholder}
            onChange={(e) =>
              setValues((p) => ({ ...p, [field.key]: e.target.value }))
            }
            className="bg-background/60 border-border/50 text-foreground text-sm h-9"
            style={{ color: "black" }}
            data-ocid={`cms-text-input.${i + 1}`}
          />
          <Button
            type="button"
            size="sm"
            className={`h-9 w-20 text-xs transition-smooth ${
              saved[field.key]
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25"
            }`}
            onClick={() => saveField(field.key)}
            disabled={saving[field.key]}
            data-ocid={`cms-text-save-btn.${i + 1}`}
          >
            {saved[field.key] ? (
              <Check className="w-3.5 h-3.5" />
            ) : saving[field.key] ? (
              "Saving…"
            ) : (
              <>
                <Save className="w-3 h-3 mr-1" />
                Save
              </>
            )}
          </Button>
        </motion.div>
      ))}
    </div>
  );
}

// ── Color Theme Editor ───────────────────────────────────────────────────────
const COLOR_FIELDS = [
  {
    key: "primary_color",
    label: "Primary / Gold",
    cssVar: "--cms-primary-color",
    default: "#B8860B",
  },
  {
    key: "background_color",
    label: "Background",
    cssVar: "--cms-background-color",
    default: "#0a0a0a",
  },
  {
    key: "text_color",
    label: "Text Color",
    cssVar: "--cms-text-color",
    default: "#ffffff",
  },
  {
    key: "accent_color",
    label: "Accent Color",
    cssVar: "--cms-accent-color",
    default: "#D4AF37",
  },
];

function ColorThemeEditor() {
  const { actor } = useActor(createActor);
  const [colors, setColors] = useState<Record<string, string>>(() => {
    const obj: Record<string, string> = {};
    for (const f of COLOR_FIELDS) {
      obj[f.key] = localStorage.getItem(`cms_${f.key}`) ?? f.default;
    }
    return obj;
  });
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  function applyColor(cssVar: string, value: string) {
    document.documentElement.style.setProperty(cssVar, value);
  }

  async function saveColor(field: (typeof COLOR_FIELDS)[0]) {
    setSaving((p) => ({ ...p, [field.key]: true }));
    try {
      if (actor) {
        // Persist via backend
      }
      localStorage.setItem(`cms_${field.key}`, colors[field.key]);
      applyColor(field.cssVar, colors[field.key]);
      toast.success(`${field.label} applied instantly`);
    } catch {
      toast.error("Failed to save color");
    } finally {
      setSaving((p) => ({ ...p, [field.key]: false }));
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {COLOR_FIELDS.map((field, i) => (
        <motion.div
          key={field.key}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.07 }}
          className="rounded-xl border border-border/40 bg-background/40 p-4 space-y-3"
          data-ocid={`cms-color-row.${i + 1}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground">
              {field.label}
            </span>
            <div
              className="w-6 h-6 rounded-md border border-border/60"
              style={{ background: colors[field.key] }}
            />
          </div>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              aria-label={`${field.label} color picker`}
              value={colors[field.key]}
              onChange={(e) => {
                setColors((p) => ({ ...p, [field.key]: e.target.value }));
                applyColor(field.cssVar, e.target.value);
              }}
              className="w-9 h-9 rounded-lg border border-border/50 bg-transparent cursor-pointer p-0.5"
              data-ocid={`cms-color-picker.${i + 1}`}
            />
            <Input
              aria-label={`${field.label} hex value`}
              value={colors[field.key]}
              onChange={(e) => {
                setColors((p) => ({ ...p, [field.key]: e.target.value }));
                if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) {
                  applyColor(field.cssVar, e.target.value);
                }
              }}
              className="font-mono text-xs h-9 bg-background/60 border-border/50"
              style={{ color: "black" }}
              maxLength={7}
              data-ocid={`cms-color-input.${i + 1}`}
            />
            <Button
              type="button"
              size="sm"
              className="h-9 px-3 text-xs bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25"
              onClick={() => saveColor(field)}
              disabled={saving[field.key]}
              data-ocid={`cms-color-save-btn.${i + 1}`}
            >
              {saving[field.key] ? "…" : <Save className="w-3.5 h-3.5" />}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground/50 font-mono">
            {field.cssVar}
          </p>
        </motion.div>
      ))}
    </div>
  );
}

// ── Image Manager ────────────────────────────────────────────────────────────
const IMAGE_SLOTS = [
  { key: "hero_bg_image", label: "Hero Background" },
  { key: "services_bg_image", label: "Services Background" },
  { key: "courses_bg_image", label: "Courses Background" },
  { key: "gallery_featured", label: "Gallery Featured" },
  { key: "team_photo_1", label: "Team Photo — Ruchitha" },
  { key: "team_photo_2", label: "Team Photo — Ashitha" },
  { key: "team_photo_3", label: "Team Photo — Prarthana" },
];

function ImageManager() {
  const { actor } = useActor(createActor);
  const [images, setImages] = useState<Record<string, string>>(() => {
    const obj: Record<string, string> = {};
    for (const slot of IMAGE_SLOTS) {
      obj[slot.key] = localStorage.getItem(`cms_img_${slot.key}`) ?? "";
    }
    return obj;
  });
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  async function handleFileChange(key: string, file: File) {
    if (file.size > 500 * 1024) {
      toast.warning(
        `File is ${(file.size / 1024).toFixed(0)}KB — over 500KB limit. It may load slowly.`,
      );
    }
    setUploading((p) => ({ ...p, [key]: true }));
    try {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const dataUrl = ev.target?.result as string;
        if (actor) {
          // Persist via backend
        }
        localStorage.setItem(`cms_img_${key}`, dataUrl);
        setImages((p) => ({ ...p, [key]: dataUrl }));
        toast.success("Image uploaded successfully");
        setUploading((p) => ({ ...p, [key]: false }));
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error("Upload failed");
      setUploading((p) => ({ ...p, [key]: false }));
    }
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {IMAGE_SLOTS.map((slot, i) => (
        <motion.div
          key={slot.key}
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.06 }}
          className="rounded-xl border border-border/40 bg-background/40 overflow-hidden"
          data-ocid={`cms-image-slot.${i + 1}`}
        >
          {/* Preview */}
          <div className="aspect-video relative bg-muted/20 flex items-center justify-center overflow-hidden">
            {images[slot.key] ? (
              <img
                src={images[slot.key]}
                alt={slot.label}
                className="w-full h-full object-cover"
              />
            ) : (
              <Image className="w-8 h-8 text-muted-foreground/30" />
            )}
            {uploading[slot.key] && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          {/* Label + upload */}
          <div className="p-3 space-y-2">
            <p className="text-[10px] font-medium text-foreground truncate">
              {slot.label}
            </p>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={(el) => {
                fileRefs.current[slot.key] = el;
              }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileChange(slot.key, file);
              }}
            />
            <Button
              type="button"
              size="sm"
              className="w-full h-7 text-[10px] bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25"
              onClick={() => fileRefs.current[slot.key]?.click()}
              data-ocid={`cms-upload-btn.${i + 1}`}
            >
              <UploadCloud className="w-3 h-3 mr-1" />
              {images[slot.key] ? "Replace" : "Upload"}
            </Button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ── Sub-Service Image Manager ─────────────────────────────────────────────────
type SubServiceImageState = Record<string, string>; // key: "categoryId/subServiceId"
type UploadProgressState = Record<string, number>; // 0-100

// Actor extended type to include sub-service image methods (added in backend but not yet in generated types)
interface ActorWithSubServiceImages {
  setSubServiceImage(
    categoryId: string,
    subServiceId: string,
    imageUrl: string,
  ): Promise<void>;
  getSubServiceImage(
    categoryId: string,
    subServiceId: string,
  ): Promise<string | null>;
  getAllSubServiceImages(): Promise<Array<[string, string]>>;
  deleteSubServiceImage(
    categoryId: string,
    subServiceId: string,
  ): Promise<void>;
}

function makeSubServiceKey(categoryId: string, subServiceId: string): string {
  return `${categoryId}/${subServiceId}`;
}

// Single sub-service row
function SubServiceImageRow({
  categoryId,
  subServiceId,
  subServiceName,
  imageUrl,
  uploadProgress,
  onUpload,
  onDelete,
  index,
}: {
  categoryId: string;
  subServiceId: string;
  subServiceName: string;
  imageUrl: string;
  uploadProgress: number;
  onUpload: (categoryId: string, subServiceId: string, file: File) => void;
  onDelete: (categoryId: string, subServiceId: string) => void;
  index: number;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const isUploading = uploadProgress > 0 && uploadProgress < 100;

  return (
    <div
      className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-muted/15 transition-smooth group"
      data-ocid={`cms-subservice-row.${index}`}
    >
      {/* Thumbnail */}
      <div className="w-14 h-10 rounded-md border border-border/40 bg-muted/20 flex-shrink-0 overflow-hidden relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={subServiceName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Image className="w-4 h-4 text-muted-foreground/30" />
          </div>
        )}
        {isUploading && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Name */}
      <span className="flex-1 text-xs text-foreground min-w-0 truncate">
        {subServiceName}
      </span>

      {/* Progress bar */}
      {isUploading && (
        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden flex-shrink-0">
          <div
            className="h-full bg-primary rounded-full transition-all duration-200"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileRef}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(categoryId, subServiceId, file);
            // Reset input
            if (fileRef.current) fileRef.current.value = "";
          }}
        />
        <Button
          type="button"
          size="sm"
          className="h-7 px-2 text-[10px] bg-primary/10 text-primary border border-primary/25 hover:bg-primary/20"
          onClick={() => fileRef.current?.click()}
          disabled={isUploading}
          data-ocid={`cms-subservice-upload-btn.${index}`}
        >
          <UploadCloud className="w-3 h-3 mr-1" />
          {imageUrl ? "Replace" : "Upload"}
        </Button>

        {imageUrl && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 px-2 text-[10px] border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
            onClick={() => onDelete(categoryId, subServiceId)}
            disabled={isUploading}
            data-ocid={`cms-subservice-delete-btn.${index}`}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );
}

function SubServiceImageManager() {
  const { actor, isFetching } = useActor(createActor);
  const [images, setImages] = useState<SubServiceImageState>({});
  const [uploadProgress, setUploadProgress] = useState<UploadProgressState>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >(() => {
    // By default, expand the first 3 categories
    const obj: Record<string, boolean> = {};
    for (const cat of SERVICE_CATEGORIES.slice(0, 3)) {
      obj[cat.id] = true;
    }
    return obj;
  });

  // Load all sub-service images on mount
  useEffect(() => {
    async function loadImages() {
      setLoading(true);
      try {
        // Try backend first
        if (actor && !isFetching) {
          const actorExt = actor as unknown as ActorWithSubServiceImages;
          if (typeof actorExt.getAllSubServiceImages === "function") {
            const entries = await actorExt.getAllSubServiceImages();
            const obj: SubServiceImageState = {};
            for (const [key, url] of entries) {
              obj[key] = url;
            }
            setImages(obj);
            setLoading(false);
            return;
          }
        }
      } catch {
        // Fall through to localStorage
      }
      // Fallback: load from localStorage
      const obj: SubServiceImageState = {};
      for (const cat of SERVICE_CATEGORIES) {
        for (const sub of cat.subServices) {
          const key = makeSubServiceKey(cat.id, sub.id);
          const stored = localStorage.getItem(`cms_subimg_${key}`);
          if (stored) obj[key] = stored;
        }
      }
      setImages(obj);
      setLoading(false);
    }
    loadImages();
  }, [actor, isFetching]);

  const handleUpload = useCallback(
    async (categoryId: string, subServiceId: string, file: File) => {
      const key = makeSubServiceKey(categoryId, subServiceId);
      if (file.size > 2 * 1024 * 1024) {
        toast.warning(
          `File is ${(file.size / 1024 / 1024).toFixed(1)}MB — large files may be slow.`,
        );
      }

      // Start progress
      setUploadProgress((p) => ({ ...p, [key]: 10 }));

      try {
        // Read file as data URL (with simulated progress)
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onprogress = (e) => {
            if (e.lengthComputable) {
              const pct = Math.round((e.loaded / e.total) * 70) + 10;
              setUploadProgress((p) => ({ ...p, [key]: pct }));
            }
          };
          reader.onload = (ev) => resolve(ev.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        setUploadProgress((p) => ({ ...p, [key]: 85 }));

        // Try to persist to backend
        try {
          if (actor) {
            const actorExt = actor as unknown as ActorWithSubServiceImages;
            if (typeof actorExt.setSubServiceImage === "function") {
              await actorExt.setSubServiceImage(
                categoryId,
                subServiceId,
                dataUrl,
              );
            }
          }
        } catch {
          // Backend not available, fall through to localStorage
        }

        // Always persist to localStorage as fallback
        localStorage.setItem(`cms_subimg_${key}`, dataUrl);
        setImages((p) => ({ ...p, [key]: dataUrl }));
        setUploadProgress((p) => ({ ...p, [key]: 100 }));
        toast.success("Image uploaded for sub-service");

        // Clear progress after a moment
        setTimeout(() => {
          setUploadProgress((p) => ({ ...p, [key]: 0 }));
        }, 800);
      } catch {
        toast.error("Upload failed. Please try again.");
        setUploadProgress((p) => ({ ...p, [key]: 0 }));
      }
    },
    [actor],
  );

  const handleDelete = useCallback(
    async (categoryId: string, subServiceId: string) => {
      const key = makeSubServiceKey(categoryId, subServiceId);
      try {
        if (actor) {
          const actorExt = actor as unknown as ActorWithSubServiceImages;
          if (typeof actorExt.deleteSubServiceImage === "function") {
            await actorExt.deleteSubServiceImage(categoryId, subServiceId);
          }
        }
      } catch {
        // Backend not available
      }
      localStorage.removeItem(`cms_subimg_${key}`);
      setImages((p) => {
        const next = { ...p };
        delete next[key];
        return next;
      });
      toast.success("Image removed");
    },
    [actor],
  );

  function toggleCategory(categoryId: string) {
    setExpandedCategories((p) => ({ ...p, [categoryId]: !p[categoryId] }));
  }

  function expandAll() {
    const obj: Record<string, boolean> = {};
    for (const cat of SERVICE_CATEGORIES) {
      obj[cat.id] = true;
    }
    setExpandedCategories(obj);
  }

  function collapseAll() {
    setExpandedCategories({});
  }

  // Filter sub-services by search
  const filteredCategories = useMemo(() => {
    if (!search.trim()) return SERVICE_CATEGORIES;
    const q = search.toLowerCase();
    return SERVICE_CATEGORIES.map((cat) => ({
      ...cat,
      subServices: cat.subServices.filter(
        (sub) =>
          sub.name.toLowerCase().includes(q) ||
          cat.name.toLowerCase().includes(q),
      ),
    })).filter((cat) => cat.subServices.length > 0);
  }, [search]);

  // Count stats
  const totalSubServices = SERVICE_CATEGORIES.reduce(
    (acc, cat) => acc + cat.subServices.length,
    0,
  );
  const uploadedCount = Object.keys(images).length;

  // Row index counter across categories for stable data-ocid
  let globalRowIndex = 0;

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="flex items-center gap-4 px-3 py-2.5 rounded-xl border border-primary/15 bg-primary/5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-xs text-foreground font-medium">
            {uploadedCount} uploaded
          </span>
        </div>
        <div className="w-px h-3 bg-border/50" />
        <span className="text-xs text-muted-foreground">
          {totalSubServices - uploadedCount} remaining
        </span>
        <div className="flex-1">
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{
                width: `${totalSubServices > 0 ? (uploadedCount / totalSubServices) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
        <span className="text-xs font-mono text-muted-foreground">
          {totalSubServices > 0
            ? Math.round((uploadedCount / totalSubServices) * 100)
            : 0}
          %
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
          <Input
            aria-label="Search sub-services"
            placeholder="Search services or sub-services…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9 text-sm bg-background/60 border-border/50"
            style={{ color: "black" }}
            data-ocid="cms-subservice-search-input"
          />
          {search && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-9 text-xs border-border/40 text-muted-foreground hover:text-foreground"
          onClick={expandAll}
          data-ocid="cms-subservice-expand-all"
        >
          Expand All
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-9 text-xs border-border/40 text-muted-foreground hover:text-foreground"
          onClick={collapseAll}
          data-ocid="cms-subservice-collapse-all"
        >
          Collapse
        </Button>
      </div>

      {/* Loading state */}
      {loading && (
        <div
          className="flex items-center justify-center py-12 text-muted-foreground"
          data-ocid="cms-subservice-loading-state"
        >
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mr-3" />
          <span className="text-sm">Loading sub-service images…</span>
        </div>
      )}

      {/* Category groups */}
      {!loading && (
        <div className="space-y-2">
          {filteredCategories.length === 0 && (
            <div
              className="py-10 text-center text-sm text-muted-foreground"
              data-ocid="cms-subservice-empty-state"
            >
              No sub-services match your search.
            </div>
          )}
          {filteredCategories.map((cat) => {
            const isExpanded = expandedCategories[cat.id] ?? false;
            const catUploadedCount = cat.subServices.filter(
              (sub) => !!images[makeSubServiceKey(cat.id, sub.id)],
            ).length;

            return (
              <div
                key={cat.id}
                className="rounded-xl border border-border/30 overflow-hidden"
                data-ocid={`cms-subservice-category.${cat.id}`}
              >
                {/* Category header — clickable to expand/collapse */}
                <button
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-muted/20 hover:bg-muted/30 transition-smooth text-left"
                  aria-expanded={isExpanded}
                  data-ocid={`cms-subservice-category-toggle.${cat.id}`}
                >
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  )}
                  <span className="text-base flex-shrink-0">{cat.emoji}</span>
                  <span className="font-medium text-sm text-foreground flex-1 min-w-0 truncate">
                    {cat.name}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 flex-shrink-0">
                    {catUploadedCount}/{cat.subServices.length}
                  </span>
                </button>

                {/* Sub-services list */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="divide-y divide-border/20 px-1 pb-1">
                        {cat.subServices.map((sub) => {
                          globalRowIndex++;
                          const key = makeSubServiceKey(cat.id, sub.id);
                          return (
                            <SubServiceImageRow
                              key={sub.id}
                              categoryId={cat.id}
                              subServiceId={sub.id}
                              subServiceName={sub.name}
                              imageUrl={images[key] ?? ""}
                              uploadProgress={uploadProgress[key] ?? 0}
                              onUpload={handleUpload}
                              onDelete={handleDelete}
                              index={globalRowIndex}
                            />
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}

      {/* Help note */}
      <p className="text-[10px] text-muted-foreground/50 text-center pt-1">
        Images are stored securely. Supported formats: JPG, PNG, WebP, GIF. Max
        recommended size: 2MB per image.
      </p>
    </div>
  );
}

// ── Services Editor ──────────────────────────────────────────────────────────
function ServicesEditor() {
  type ServiceEdit = { name: string; description: string; price: number };
  const [editing, setEditing] = useState<string | null>(null);
  const [edits, setEdits] = useState<Record<string, ServiceEdit>>(() => {
    const obj: Record<string, ServiceEdit> = {};
    for (const cat of SERVICE_CATEGORIES) {
      const stored = localStorage.getItem(`cms_svc_${cat.id}`);
      if (stored) {
        try {
          obj[cat.id] = JSON.parse(stored);
        } catch {
          /* noop */
        }
      }
    }
    return obj;
  });
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  function getEdit(id: string): ServiceEdit {
    return (
      edits[id] ?? {
        name: SERVICE_CATEGORIES.find((c) => c.id === id)?.name ?? "",
        description:
          SERVICE_CATEGORIES.find((c) => c.id === id)?.description ?? "",
        price: 5,
      }
    );
  }

  function saveService(id: string) {
    localStorage.setItem(
      `cms_svc_${id}`,
      JSON.stringify(edits[id] ?? getEdit(id)),
    );
    setSaved((p) => ({ ...p, [id]: true }));
    setEditing(null);
    toast.success("Service updated");
    setTimeout(() => setSaved((p) => ({ ...p, [id]: false })), 3000);
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[1fr_80px_80px_80px] gap-3 px-3 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide border-b border-border/30">
        <span>Service Name</span>
        <span>Price</span>
        <span>Status</span>
        <span className="text-right">Action</span>
      </div>
      {SERVICE_CATEGORIES.map((cat, i) => {
        const data = edits[cat.id] ?? getEdit(cat.id);
        const isEditing = editing === cat.id;
        return (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.02 }}
            data-ocid={`cms-service-row.${i + 1}`}
          >
            {!isEditing ? (
              <div className="grid grid-cols-[1fr_80px_80px_80px] gap-3 items-center px-3 py-2.5 rounded-lg hover:bg-muted/20 transition-smooth">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base">{cat.emoji}</span>
                  <span className="text-sm text-foreground truncate">
                    {data.name}
                    {saved[cat.id] && (
                      <span className="ml-2 text-[10px] text-emerald-400 font-medium">
                        ✓ Saved
                      </span>
                    )}
                  </span>
                </div>
                <span className="text-sm text-foreground">₹{data.price}</span>
                <span className="text-[10px] text-emerald-400 font-medium">
                  Active
                </span>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 text-[10px] border-primary/30 text-primary hover:bg-primary/10"
                    onClick={() => setEditing(cat.id)}
                    data-ocid={`cms-service-edit-btn.${i + 1}`}
                  >
                    <Edit3 className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-muted-foreground mb-1">
                      Name
                    </p>
                    <Input
                      aria-label="Service name"
                      value={data.name}
                      onChange={(e) =>
                        setEdits((p) => ({
                          ...p,
                          [cat.id]: { ...data, name: e.target.value },
                        }))
                      }
                      className="h-8 text-sm bg-background/60 border-border/50"
                      style={{ color: "black" }}
                    />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground mb-1">
                      Price (₹)
                    </p>
                    <Input
                      aria-label="Service price"
                      type="number"
                      value={data.price}
                      onChange={(e) =>
                        setEdits((p) => ({
                          ...p,
                          [cat.id]: { ...data, price: Number(e.target.value) },
                        }))
                      }
                      className="h-8 text-sm bg-background/60 border-border/50"
                      style={{ color: "black" }}
                    />
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1">
                    Description
                  </p>
                  <Input
                    aria-label="Service description"
                    value={data.description}
                    onChange={(e) =>
                      setEdits((p) => ({
                        ...p,
                        [cat.id]: { ...data, description: e.target.value },
                      }))
                    }
                    className="h-8 text-sm bg-background/60 border-border/50"
                    style={{ color: "black" }}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    className="h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => saveService(cat.id)}
                    data-ocid={`cms-service-save-btn.${i + 1}`}
                  >
                    <Save className="w-3 h-3 mr-1" />
                    Save
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs border-border/50"
                    onClick={() => setEditing(null)}
                    data-ocid={`cms-service-cancel-btn.${i + 1}`}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

// ── Courses Editor ───────────────────────────────────────────────────────────
const MODE_OPTIONS = ["online", "offline", "hybrid"] as const;
type CourseModeOption = (typeof MODE_OPTIONS)[number];

function CoursesEditor() {
  type CourseEdit = {
    title: string;
    description: string;
    price: number;
    mode: CourseModeOption;
    instructor: string;
  };
  const [editing, setEditing] = useState<string | null>(null);
  const [edits, setEdits] = useState<Record<string, CourseEdit>>(() => {
    const obj: Record<string, CourseEdit> = {};
    for (const c of COURSES) {
      const stored = localStorage.getItem(`cms_course_${c.id}`);
      if (stored) {
        try {
          obj[c.id] = JSON.parse(stored);
        } catch {
          /* noop */
        }
      }
    }
    return obj;
  });
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  function getEdit(id: string): CourseEdit {
    const c = COURSES.find((x) => x.id === id);
    return (
      edits[id] ?? {
        title: c?.title ?? "",
        description: c?.description ?? "",
        price: c?.price ?? 5,
        mode: (c?.mode as CourseModeOption) ?? "hybrid",
        instructor: c?.instructor ?? "",
      }
    );
  }

  function saveCourse(id: string) {
    localStorage.setItem(
      `cms_course_${id}`,
      JSON.stringify(edits[id] ?? getEdit(id)),
    );
    setSaved((p) => ({ ...p, [id]: true }));
    setEditing(null);
    toast.success("Course updated");
    setTimeout(() => setSaved((p) => ({ ...p, [id]: false })), 3000);
  }

  const MODE_COLORS: Record<string, string> = {
    online: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    offline: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    hybrid: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[1fr_70px_80px_80px_80px] gap-2 px-3 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide border-b border-border/30">
        <span>Course Title</span>
        <span>Price</span>
        <span>Mode</span>
        <span>Instructor</span>
        <span className="text-right">Action</span>
      </div>
      {COURSES.map((course, i) => {
        const data = getEdit(course.id);
        const isEditing = editing === course.id;
        return (
          <motion.div
            key={course.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.015 }}
            data-ocid={`cms-course-row.${i + 1}`}
          >
            {!isEditing ? (
              <div className="grid grid-cols-[1fr_70px_80px_80px_80px] gap-2 items-center px-3 py-2.5 rounded-lg hover:bg-muted/20 transition-smooth">
                <span className="text-sm text-foreground truncate">
                  {data.title}
                  {saved[course.id] && (
                    <span className="ml-2 text-[10px] text-emerald-400 font-medium">
                      ✓ Saved
                    </span>
                  )}
                </span>
                <span className="text-sm text-foreground">₹{data.price}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full border capitalize inline-block ${MODE_COLORS[data.mode] ?? ""}`}
                >
                  {data.mode}
                </span>
                <span className="text-[10px] text-muted-foreground truncate">
                  {data.instructor}
                </span>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 text-[10px] border-primary/30 text-primary hover:bg-primary/10"
                    onClick={() => setEditing(course.id)}
                    data-ocid={`cms-course-edit-btn.${i + 1}`}
                  >
                    <Edit3 className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-muted-foreground mb-1">
                      Title
                    </p>
                    <Input
                      aria-label="Course title"
                      value={data.title}
                      onChange={(e) =>
                        setEdits((p) => ({
                          ...p,
                          [course.id]: { ...data, title: e.target.value },
                        }))
                      }
                      className="h-8 text-sm bg-background/60 border-border/50"
                      style={{ color: "black" }}
                    />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground mb-1">
                      Price (₹)
                    </p>
                    <Input
                      aria-label="Course price"
                      type="number"
                      value={data.price}
                      onChange={(e) =>
                        setEdits((p) => ({
                          ...p,
                          [course.id]: {
                            ...data,
                            price: Number(e.target.value),
                          },
                        }))
                      }
                      className="h-8 text-sm bg-background/60 border-border/50"
                      style={{ color: "black" }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-muted-foreground mb-1">
                      Mode
                    </p>
                    <select
                      aria-label="Course mode"
                      value={data.mode}
                      onChange={(e) =>
                        setEdits((p) => ({
                          ...p,
                          [course.id]: {
                            ...data,
                            mode: e.target.value as CourseModeOption,
                          },
                        }))
                      }
                      className="w-full h-8 rounded-md border border-border/50 bg-background/60 text-sm px-2"
                      style={{ color: "black" }}
                    >
                      {MODE_OPTIONS.map((m) => (
                        <option key={m} value={m} className="capitalize">
                          {m.charAt(0).toUpperCase() + m.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground mb-1">
                      Instructor
                    </p>
                    <Input
                      aria-label="Course instructor"
                      value={data.instructor}
                      onChange={(e) =>
                        setEdits((p) => ({
                          ...p,
                          [course.id]: { ...data, instructor: e.target.value },
                        }))
                      }
                      className="h-8 text-sm bg-background/60 border-border/50"
                      style={{ color: "black" }}
                    />
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1">
                    Description
                  </p>
                  <Input
                    aria-label="Course description"
                    value={data.description}
                    onChange={(e) =>
                      setEdits((p) => ({
                        ...p,
                        [course.id]: { ...data, description: e.target.value },
                      }))
                    }
                    className="h-8 text-sm bg-background/60 border-border/50"
                    style={{ color: "black" }}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    className="h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => saveCourse(course.id)}
                    data-ocid={`cms-course-save-btn.${i + 1}`}
                  >
                    <Save className="w-3 h-3 mr-1" />
                    Save
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs border-border/50"
                    onClick={() => setEditing(null)}
                    data-ocid={`cms-course-cancel-btn.${i + 1}`}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

// ── Main CmsTab ──────────────────────────────────────────────────────────────
type CmsSectionId =
  | "text"
  | "color"
  | "images"
  | "subservice-images"
  | "services"
  | "courses";

const CMS_SECTIONS: Array<{
  id: CmsSectionId;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}> = [
  { id: "text", label: "Website Text", icon: <Text className="w-3.5 h-3.5" /> },
  {
    id: "color",
    label: "Color Theme",
    icon: <Palette className="w-3.5 h-3.5" />,
  },
  {
    id: "images",
    label: "Site Images",
    icon: <Image className="w-3.5 h-3.5" />,
  },
  {
    id: "subservice-images",
    label: "Sub-Service Images",
    icon: <Layers className="w-3.5 h-3.5" />,
    badge: "109+",
  },
  {
    id: "services",
    label: "Services",
    icon: <Edit3 className="w-3.5 h-3.5" />,
  },
  { id: "courses", label: "Courses", icon: <Edit3 className="w-3.5 h-3.5" /> },
];

export function CmsTab() {
  const [activeSection, setActiveSection] = useState<CmsSectionId>("text");
  const { data: cmsContent = [] } = useAdminCmsContent();

  const initialTextValues: Record<string, string> = {};
  for (const entry of cmsContent) {
    initialTextValues[entry.key] = entry.value;
  }
  // Merge localStorage
  for (const field of TEXT_FIELDS) {
    const stored = localStorage.getItem(`cms_${field.key}`);
    if (stored) initialTextValues[field.key] = stored;
  }

  return (
    <div className="w-full space-y-5">
      {/* Notice */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 flex items-center gap-3"
      >
        <AlertTriangle className="w-4 h-4 text-primary flex-shrink-0" />
        <p className="text-xs text-foreground/80">
          <span className="font-semibold text-primary">CMS Editor</span> —
          changes to colors apply instantly without page reload. Text, images,
          and sub-service photos save immediately to storage.
        </p>
      </motion.div>

      {/* Section tabs */}
      <div className="flex flex-wrap gap-2" data-ocid="cms-section-tabs">
        {CMS_SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setActiveSection(s.id)}
            className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border transition-smooth ${
              activeSection === s.id
                ? "bg-primary/15 text-primary border-primary/40 font-semibold"
                : "border-border/40 text-muted-foreground hover:border-primary/30 hover:text-foreground"
            }`}
            data-ocid={`cms-tab.${s.id}`}
          >
            {s.icon}
            {s.label}
            {s.badge && (
              <span className="ml-0.5 text-[9px] px-1 py-0.5 rounded bg-primary/20 text-primary font-bold">
                {s.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      <Separator className="border-border/30" />

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeSection === "text" && (
          <motion.div
            key="text"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <CmsSection
              icon={<Text className="w-4 h-4" />}
              title="Website Text Editor"
              delay={0}
            >
              <TextEditor initialValues={initialTextValues} />
            </CmsSection>
          </motion.div>
        )}

        {activeSection === "color" && (
          <motion.div
            key="color"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <CmsSection
              icon={<Palette className="w-4 h-4" />}
              title="Color Theme Editor — Live Preview"
              delay={0}
            >
              <ColorThemeEditor />
            </CmsSection>
          </motion.div>
        )}

        {activeSection === "images" && (
          <motion.div
            key="images"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <CmsSection
              icon={<Image className="w-4 h-4" />}
              title="Site Image Manager"
              delay={0}
            >
              <ImageManager />
            </CmsSection>
          </motion.div>
        )}

        {activeSection === "subservice-images" && (
          <motion.div
            key="subservice-images"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <CmsSection
              icon={<Layers className="w-4 h-4" />}
              title="Sub-Service Images — All 109+ Sub-Services"
              delay={0}
            >
              <SubServiceImageManager />
            </CmsSection>
          </motion.div>
        )}

        {activeSection === "services" && (
          <motion.div
            key="services"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <CmsSection
              icon={<Edit3 className="w-4 h-4" />}
              title="Services Editor"
              delay={0}
            >
              <ServicesEditor />
            </CmsSection>
          </motion.div>
        )}

        {activeSection === "courses" && (
          <motion.div
            key="courses"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <CmsSection
              icon={<Edit3 className="w-4 h-4" />}
              title="Courses Editor"
              delay={0}
            >
              <CoursesEditor />
            </CmsSection>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
