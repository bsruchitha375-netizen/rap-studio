import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useActor } from "@caffeineai/core-infrastructure";
import {
  AlertTriangle,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  Edit3,
  Eye,
  FileText,
  Globe,
  GraduationCap,
  Image,
  Layers,
  Monitor,
  Palette,
  Plus,
  Save,
  Search,
  Text,
  Trash2,
  UploadCloud,
  Users,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { createActor } from "../../backend";
import { CmsContentType } from "../../backend";
import type {
  AdminCourseInput,
  AdminServiceInput,
  CourseMode,
  CourseStatus,
  ExternalBlob,
  FileType,
} from "../../backend.d.ts";
import { COURSES } from "../../data/courses";
import { SERVICE_CATEGORIES } from "../../data/services";
import {
  useAdminAddCourse,
  useAdminAddService,
  useAdminCmsContent,
  useAdminCourses,
  useAdminDeleteCourse,
  useAdminDeleteService,
  useAdminServices,
  useAdminUpdateCourse,
  useAdminUpdateService,
  useAllSubServiceImages,
  useDeleteMedia,
  useDeleteSubServiceImage,
  useLessons,
  useMediaItems,
  useUploadSubServiceImage,
} from "../../hooks/useBackend";
import { LessonQuizManager } from "./LessonQuizManager";
import { StudentProgressPanel } from "./StudentProgressPanel";

// ── Helpers ──────────────────────────────────────────────────────────────────

function dispatchCmsUpdate(section: string, data: Record<string, unknown>) {
  window.dispatchEvent(
    new CustomEvent("cms-updated", { detail: { section, data } }),
  );
}

async function fileToUint8Array(file: File): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const buf = e.target?.result as ArrayBuffer;
      resolve(new Uint8Array(buf));
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function blobToObjectUrl(blobData: Uint8Array | undefined): string {
  if (!blobData) return "";
  const b = new Blob([blobData.buffer as ArrayBuffer]);
  return URL.createObjectURL(b);
}

// ── Save Button ───────────────────────────────────────────────────────────────

function SaveBtn({
  onClick,
  saving,
  saved,
  label = "Save",
  ocid,
  disabled = false,
}: {
  onClick: () => void;
  saving: boolean;
  saved: boolean;
  label?: string;
  ocid?: string;
  disabled?: boolean;
}) {
  return (
    <Button
      type="button"
      size="sm"
      className={`h-9 px-4 text-xs transition-all ${
        saved
          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
          : "bg-primary text-primary-foreground hover:bg-primary/90"
      }`}
      onClick={onClick}
      disabled={saving || disabled}
      data-ocid={ocid}
    >
      {saved ? (
        <>
          <Check className="w-3.5 h-3.5 mr-1.5" />
          Saved!
        </>
      ) : saving ? (
        <span className="flex items-center gap-1.5">
          <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          Saving…
        </span>
      ) : (
        <>
          <Save className="w-3 h-3 mr-1.5" />
          {label}
        </>
      )}
    </Button>
  );
}

// ── Section accordion wrapper ─────────────────────────────────────────────────

function CmsSection({
  icon,
  title,
  subtitle,
  children,
  delay = 0,
  defaultOpen = true,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  delay?: number;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="rounded-2xl border border-primary/20 bg-card/60 backdrop-blur-sm overflow-hidden"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-5 py-4 border-b border-primary/10 bg-primary/5 hover:bg-primary/8 transition-colors text-left"
        aria-expanded={open}
      >
        <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center text-primary flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-foreground text-sm tracking-wide">
            {title}
          </h3>
          {subtitle && (
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
        {open ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        )}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Hero Editor ───────────────────────────────────────────────────────────────

function HeroEditor() {
  const { actor } = useActor(createActor);
  const [vals, setVals] = useState({
    heading:
      localStorage.getItem("cms_hero_heading") ??
      "Where Every Frame Tells a Story",
    subheading:
      localStorage.getItem("cms_hero_subheading") ??
      "Luxury photography, videography & short film studio in Bengaluru",
    cta_primary:
      localStorage.getItem("cms_hero_cta_primary") ?? "Book a Session",
    cta_secondary:
      localStorage.getItem("cms_hero_cta_secondary") ?? "Explore Courses",
  });
  const [bgImage, setBgImage] = useState(
    localStorage.getItem("cms_img_hero_bg_image") ?? "",
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  function handleBgUpload(file: File) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      setBgImage(url);
      localStorage.setItem("cms_img_hero_bg_image", url);
      dispatchCmsUpdate("hero_image", { hero_bg_image: url });
      toast.success("Hero background updated");
    };
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    setSaving(true);
    for (const [key, val] of Object.entries(vals)) {
      localStorage.setItem(`cms_hero_${key}`, val);
    }
    dispatchCmsUpdate("hero", vals);
    // Persist heading and subheading to backend canister
    try {
      if (actor) {
        await actor.setCmsContent(
          "hero_heading",
          vals.heading,
          CmsContentType.text,
        );
        await actor.setCmsContent(
          "hero_subheading",
          vals.subheading,
          CmsContentType.text,
        );
      }
    } catch {
      // backend persistence is best-effort; local update already dispatched
    }
    setSaving(false);
    setSaved(true);
    toast.success("Hero section saved");
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {(
          [
            {
              key: "heading",
              label: "Main Heading",
              placeholder: "Where Every Frame Tells a Story",
            },
            {
              key: "subheading",
              label: "Sub Heading",
              placeholder: "Luxury photography...",
            },
            {
              key: "cta_primary",
              label: "CTA Button (Primary)",
              placeholder: "Book a Session",
            },
            {
              key: "cta_secondary",
              label: "CTA Button (Secondary)",
              placeholder: "Explore Courses",
            },
          ] as const
        ).map((f, i) => (
          <div key={f.key} data-ocid={`cms-hero-field.${i + 1}`}>
            <label
              htmlFor={`hero-field-${f.key}`}
              className="text-[11px] font-semibold text-muted-foreground block mb-1.5"
            >
              {f.label}
            </label>
            <Input
              id={`hero-field-${f.key}`}
              value={vals[f.key]}
              placeholder={f.placeholder}
              onChange={(e) =>
                setVals((p) => ({ ...p, [f.key]: e.target.value }))
              }
              className="h-9 text-sm bg-background/60 border-border/50"
            />
          </div>
        ))}
      </div>
      <div>
        <p className="text-[11px] font-semibold text-muted-foreground block mb-2">
          Hero Background Image
        </p>
        <div
          className={`relative rounded-xl border-2 border-dashed transition-colors ${bgImage ? "border-primary/30" : "border-border/40"} bg-muted/10 overflow-hidden`}
          style={{ minHeight: "120px" }}
        >
          {bgImage ? (
            <div className="relative">
              <img
                src={bgImage}
                alt="Hero background"
                className="w-full h-32 object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setBgImage("");
                  localStorage.removeItem("cms_img_hero_bg_image");
                }}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/90 border border-border/50 flex items-center justify-center hover:bg-red-500/20 transition-colors"
                aria-label="Remove hero background image"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <UploadCloud className="w-8 h-8 opacity-40" />
              <span className="text-xs">
                Click or drag to upload hero background
              </span>
            </button>
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileRef}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleBgUpload(f);
          }}
        />
        {bgImage && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="mt-2 h-7 text-xs border-primary/30 text-primary hover:bg-primary/10"
            onClick={() => fileRef.current?.click()}
            data-ocid="cms-hero-bg-upload-btn"
          >
            <UploadCloud className="w-3 h-3 mr-1" />
            Replace Image
          </Button>
        )}
      </div>
      <div className="flex justify-end pt-1">
        <SaveBtn
          onClick={handleSave}
          saving={saving}
          saved={saved}
          label="Save Hero Section"
          ocid="cms-hero-save-btn"
        />
      </div>
    </div>
  );
}

// ── Page Texts Editor ─────────────────────────────────────────────────────────

const TEXT_GROUPS = [
  {
    group: "Hero",
    fields: [
      {
        key: "hero_heading",
        label: "Hero Heading",
        placeholder: "Where Every Frame Tells a Story",
      },
      {
        key: "hero_subtext",
        label: "Hero Subtext",
        placeholder: "Luxury photography & videography",
      },
    ],
  },
  {
    group: "About / Why Choose Us",
    fields: [
      {
        key: "about_heading",
        label: "About Heading",
        placeholder: "Behind the Lens",
      },
      {
        key: "about_body",
        label: "About Body Text",
        placeholder: "Founded by three passionate creators...",
      },
      {
        key: "why_us_heading",
        label: "Why Choose Us Heading",
        placeholder: "Why Choose RAP Studio?",
      },
    ],
  },
  {
    group: "Services & Courses",
    fields: [
      {
        key: "services_heading",
        label: "Services Section Heading",
        placeholder: "Our Studio Services",
      },
      {
        key: "courses_heading",
        label: "Courses Section Heading",
        placeholder: "Learning Platform",
      },
    ],
  },
  {
    group: "Contact & Footer",
    fields: [
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
    ],
  },
];

function PageTextsEditor({
  initialValues,
}: { initialValues: Record<string, string> }) {
  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [savingGroup, setSavingGroup] = useState<Record<string, boolean>>({});
  const [savedGroup, setSavedGroup] = useState<Record<string, boolean>>({});

  function saveGroup(
    groupName: string,
    fields: (typeof TEXT_GROUPS)[0]["fields"],
  ) {
    setSavingGroup((p) => ({ ...p, [groupName]: true }));
    const data: Record<string, string> = {};
    for (const f of fields) {
      localStorage.setItem(`cms_${f.key}`, values[f.key] ?? "");
      data[f.key] = values[f.key] ?? "";
    }
    dispatchCmsUpdate(
      `texts_${groupName.toLowerCase().replace(/\s/g, "_")}`,
      data,
    );
    setSavingGroup((p) => ({ ...p, [groupName]: false }));
    setSavedGroup((p) => ({ ...p, [groupName]: true }));
    toast.success(`${groupName} texts saved`);
    setTimeout(
      () => setSavedGroup((p) => ({ ...p, [groupName]: false })),
      3000,
    );
  }

  return (
    <div className="space-y-6">
      {TEXT_GROUPS.map((group, gi) => (
        <div
          key={group.group}
          className="space-y-3"
          data-ocid={`cms-text-group.${gi + 1}`}
        >
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-border/30" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2">
              {group.group}
            </span>
            <div className="h-px flex-1 bg-border/30" />
          </div>
          {group.fields.map((field, fi) => (
            <div key={field.key} data-ocid={`cms-text-row.${gi * 10 + fi + 1}`}>
              <label
                htmlFor={`cms-text-${field.key}`}
                className="text-[11px] font-semibold text-muted-foreground block mb-1.5"
              >
                {field.label}
              </label>
              {field.key.includes("body") || field.key.includes("text") ? (
                <textarea
                  id={`cms-text-${field.key}`}
                  value={values[field.key] ?? ""}
                  placeholder={field.placeholder}
                  rows={3}
                  onChange={(e) =>
                    setValues((p) => ({ ...p, [field.key]: e.target.value }))
                  }
                  className="w-full rounded-md border border-border/50 bg-background/60 text-foreground text-sm px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                  data-ocid={`cms-text-textarea.${gi * 10 + fi + 1}`}
                />
              ) : (
                <Input
                  id={`cms-text-${field.key}`}
                  value={values[field.key] ?? ""}
                  placeholder={field.placeholder}
                  onChange={(e) =>
                    setValues((p) => ({ ...p, [field.key]: e.target.value }))
                  }
                  className="h-9 text-sm bg-background/60 border-border/50"
                  data-ocid={`cms-text-input.${gi * 10 + fi + 1}`}
                />
              )}
            </div>
          ))}
          <div className="flex justify-end">
            <SaveBtn
              onClick={() => saveGroup(group.group, group.fields)}
              saving={savingGroup[group.group] ?? false}
              saved={savedGroup[group.group] ?? false}
              label={`Save ${group.group}`}
              ocid={`cms-text-group-save-btn.${gi + 1}`}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Color Theme Editor ────────────────────────────────────────────────────────

const COLOR_FIELDS = [
  {
    key: "primary_color",
    label: "Primary / Gold Accent",
    cssVar: "--color-primary",
    default: "#B8860B",
  },
  {
    key: "background_color",
    label: "Page Background",
    cssVar: "--color-background",
    default: "#0a0a0a",
  },
  {
    key: "card_color",
    label: "Card Background",
    cssVar: "--color-card",
    default: "#111111",
  },
  {
    key: "accent_color",
    label: "Secondary Accent",
    cssVar: "--color-accent",
    default: "#D4AF37",
  },
];

function ColorThemeEditor() {
  const [colors, setColors] = useState<Record<string, string>>(() => {
    const obj: Record<string, string> = {};
    for (const f of COLOR_FIELDS) {
      obj[f.key] = localStorage.getItem(`cms_${f.key}`) ?? f.default;
    }
    return obj;
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function applyColor(cssVar: string, value: string) {
    document.documentElement.style.setProperty(cssVar, value);
  }

  function handleSaveAll() {
    setSaving(true);
    for (const f of COLOR_FIELDS) {
      localStorage.setItem(`cms_${f.key}`, colors[f.key]);
      applyColor(f.cssVar, colors[f.key]);
    }
    dispatchCmsUpdate("colors", colors);
    setSaving(false);
    setSaved(true);
    toast.success("Theme colors applied site-wide");
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-primary/15 bg-primary/5 px-4 py-3 flex items-center gap-2">
        <Zap className="w-4 h-4 text-primary flex-shrink-0" />
        <p className="text-xs text-foreground/80">
          Color changes apply{" "}
          <span className="font-semibold text-primary">instantly</span>{" "}
          site-wide without page reload.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {COLOR_FIELDS.map((field, i) => (
          <div
            key={field.key}
            className="rounded-xl border border-border/40 bg-background/40 p-4 space-y-3"
            data-ocid={`cms-color-row.${i + 1}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">
                {field.label}
              </span>
              <div
                className="w-7 h-7 rounded-lg border border-border/60 shadow-sm"
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
                className="w-10 h-10 rounded-lg border border-border/50 bg-transparent cursor-pointer p-0.5"
                data-ocid={`cms-color-picker.${i + 1}`}
              />
              <Input
                aria-label={`${field.label} hex value`}
                value={colors[field.key]}
                onChange={(e) => {
                  setColors((p) => ({ ...p, [field.key]: e.target.value }));
                  if (/^#[0-9a-fA-F]{6}$/.test(e.target.value))
                    applyColor(field.cssVar, e.target.value);
                }}
                className="font-mono text-sm h-10 bg-background/60 border-border/50 flex-1"
                maxLength={7}
                data-ocid={`cms-color-input.${i + 1}`}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <SaveBtn
          onClick={handleSaveAll}
          saving={saving}
          saved={saved}
          label="Apply All Colors"
          ocid="cms-colors-save-btn"
        />
      </div>
    </div>
  );
}

// ── Image Manager (static site images) ───────────────────────────────────────

const IMAGE_SLOTS = [
  {
    key: "hero_bg_image",
    label: "Hero Background",
    hint: "Main hero section banner",
  },
  {
    key: "services_bg_image",
    label: "Services Background",
    hint: "Services section backdrop",
  },
  {
    key: "courses_bg_image",
    label: "Courses Background",
    hint: "Learning platform section",
  },
  {
    key: "gallery_featured",
    label: "Gallery Featured",
    hint: "Gallery page hero image",
  },
  {
    key: "team_photo_1",
    label: "Founder — Ruchitha B S",
    hint: "Founder photo 1",
  },
  {
    key: "team_photo_2",
    label: "Founder — Ashitha S",
    hint: "Founder photo 2",
  },
  {
    key: "team_photo_3",
    label: "Founder — Prarthana R",
    hint: "Founder photo 3",
  },
  { key: "logo_image", label: "Studio Logo", hint: "Appears in header/nav" },
];

function ImageManager() {
  const [images, setImages] = useState<Record<string, string>>(() => {
    const obj: Record<string, string> = {};
    for (const slot of IMAGE_SLOTS) {
      obj[slot.key] = localStorage.getItem(`cms_img_${slot.key}`) ?? "";
    }
    return obj;
  });
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  function handleFileChange(key: string, file: File) {
    setUploading((p) => ({ ...p, [key]: true }));
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      localStorage.setItem(`cms_img_${key}`, dataUrl);
      setImages((p) => ({ ...p, [key]: dataUrl }));
      dispatchCmsUpdate("image", { key, url: dataUrl });
      toast.success(
        `"${IMAGE_SLOTS.find((s) => s.key === key)?.label}" updated`,
      );
      setUploading((p) => ({ ...p, [key]: false }));
    };
    reader.onerror = () => {
      toast.error("Upload failed");
      setUploading((p) => ({ ...p, [key]: false }));
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {IMAGE_SLOTS.map((slot, i) => (
        <div
          key={slot.key}
          className="rounded-xl border border-border/40 bg-background/40 overflow-hidden"
          data-ocid={`cms-image-slot.${i + 1}`}
        >
          <div className="aspect-video relative bg-muted/20 flex items-center justify-center overflow-hidden">
            {images[slot.key] ? (
              <img
                src={images[slot.key]}
                alt={slot.label}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-1 text-muted-foreground/30">
                <Image className="w-6 h-6" />
                <span className="text-[9px]">No image</span>
              </div>
            )}
            {uploading[slot.key] && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          <div className="p-3 space-y-1.5">
            <p className="text-[11px] font-semibold text-foreground truncate">
              {slot.label}
            </p>
            <p className="text-[9px] text-muted-foreground/60 truncate">
              {slot.hint}
            </p>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={(el) => {
                fileRefs.current[slot.key] = el;
              }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileChange(slot.key, f);
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
        </div>
      ))}
    </div>
  );
}

// ── Gallery Manager (real backend) ───────────────────────────────────────────

function GalleryManager() {
  const { data: mediaItems = [], isLoading } = useMediaItems(null);
  const deleteMediaMutation = useDeleteMedia();
  const { actor } = useActor(createActor);
  const [category, setCategory] = useState("wedding");
  const [title, setTitle] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<bigint | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const GALLERY_CATS = [
    "wedding",
    "fashion",
    "corporate",
    "pre_wedding",
    "baby",
    "food",
    "real_estate",
    "product",
  ];

  // local items from localStorage as fallback
  const [localItems, setLocalItems] = useState<
    Array<{ id: string; url: string; category: string; title: string }>
  >(() => {
    try {
      const raw = localStorage.getItem("cms_gallery");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  async function addImage(file: File) {
    setUploading(true);
    try {
      if (actor) {
        const bytes = await fileToUint8Array(file);
        // ExternalBlob is the platform blob type — access via global constructor
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const globalAny = globalThis as Record<string, unknown>;
        const ExternalBlobCtor = globalAny.ExternalBlob as
          | typeof ExternalBlob
          | undefined;
        if (ExternalBlobCtor) {
          const eb = ExternalBlobCtor.fromBytes(
            bytes as Uint8Array<ArrayBuffer>,
          );
          const ft = { Photo: null } as unknown as FileType;
          await actor.uploadMedia({
            title: title || file.name,
            serviceCategory: category,
            blob: eb,
            fileType: ft,
          });
          toast.success("Gallery photo uploaded to backend");
          setTitle("");
          setUploading(false);
          return;
        }
      }
    } catch {
      /* fall through to local */
    }
    // local fallback
    const url = await fileToDataUrl(file);
    const newItem = {
      id: `gal_${Date.now()}`,
      url,
      category,
      title: title || file.name,
    };
    const updated = [...localItems, newItem];
    setLocalItems(updated);
    localStorage.setItem("cms_gallery", JSON.stringify(updated));
    dispatchCmsUpdate("gallery", { items: updated });
    toast.success("Gallery image added");
    setTitle("");
    setUploading(false);
  }

  async function handleRemove(id: bigint | string) {
    if (typeof id === "bigint") {
      await deleteMediaMutation.mutateAsync(id);
      toast.success("Gallery photo removed");
    } else {
      const updated = localItems.filter((it) => it.id !== id);
      setLocalItems(updated);
      localStorage.setItem("cms_gallery", JSON.stringify(updated));
      dispatchCmsUpdate("gallery", { items: updated });
      toast.success("Gallery image removed");
    }
    setConfirmDelete(null);
  }

  const allItems = [
    ...mediaItems.map((m) => ({
      id: m.id,
      url: m.blob?.getDirectURL() ?? "",
      category: m.serviceCategory,
      title: m.title,
      isBackend: true as const,
    })),
    ...localItems.map((m) => ({
      ...m,
      isBackend: false as const,
      id: m.id as bigint | string,
    })),
  ];

  return (
    <div className="space-y-4">
      {/* Upload area */}
      <div
        className={`rounded-xl border-2 border-dashed p-6 text-center transition-colors ${dragOver ? "border-primary bg-primary/5" : "border-border/40 hover:border-primary/40"}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files[0];
          if (f) addImage(f);
        }}
        data-ocid="cms-gallery-dropzone"
      >
        <UploadCloud className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground mb-3">
          Drag & drop images here, or click to browse
        </p>
        <div className="flex flex-col sm:flex-row gap-2 mb-3 max-w-sm mx-auto">
          <Input
            placeholder="Image title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-8 text-xs bg-background/60 border-border/50 flex-1"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-8 rounded-md border border-border/50 bg-background/60 text-foreground text-xs px-2"
          >
            {GALLERY_CATS.map((c) => (
              <option key={c} value={c} className="capitalize">
                {c.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          ref={fileRef}
          onChange={(e) => {
            for (const f of Array.from(e.target.files ?? [])) addImage(f);
          }}
        />
        <Button
          type="button"
          size="sm"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25 text-xs"
          data-ocid="cms-gallery-upload-btn"
        >
          {uploading ? (
            <>
              <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin mr-1.5" />
              Uploading…
            </>
          ) : (
            <>
              <UploadCloud className="w-3 h-3 mr-1" />
              Upload Images
            </>
          )}
        </Button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div
          className="text-center py-8 text-muted-foreground text-sm"
          data-ocid="cms-gallery-loading_state"
        >
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading gallery…
        </div>
      ) : allItems.length === 0 ? (
        <div
          className="text-center py-8 text-muted-foreground text-sm"
          data-ocid="cms-gallery-empty_state"
        >
          No images in gallery yet. Upload to get started.
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {allItems.map((item, i) => (
            <div
              key={String(item.id)}
              className="relative group rounded-lg overflow-hidden aspect-square border border-border/30"
              data-ocid={`cms-gallery-item.${i + 1}`}
            >
              <img
                src={item.url}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-background/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                <p className="text-[9px] text-foreground text-center truncate w-full px-1">
                  {item.title}
                </p>
                <span className="text-[8px] text-primary capitalize">
                  {item.category?.replace(/_/g, " ") || "—"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (typeof item.id === "bigint") setConfirmDelete(item.id);
                    else handleRemove(item.id);
                  }}
                  className="w-6 h-6 rounded-full bg-red-500/80 flex items-center justify-center hover:bg-red-600 transition-colors"
                  aria-label="Remove image"
                  data-ocid={`cms-gallery-remove-btn.${i + 1}`}
                >
                  <Trash2 className="w-3 h-3 text-white" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm delete dialog */}
      {confirmDelete !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          data-ocid="cms-gallery-delete-dialog"
        >
          <div className="rounded-2xl border border-red-500/30 bg-card p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="font-display font-bold text-foreground mb-2">
              Remove Photo?
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              This will permanently delete the photo from the gallery.
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="border-border/50"
                onClick={() => setConfirmDelete(null)}
                data-ocid="cms-gallery-delete-cancel-btn"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => handleRemove(confirmDelete!)}
                data-ocid="cms-gallery-delete-confirm-btn"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      <p className="text-[10px] text-muted-foreground/50 text-center">
        {allItems.length} images in gallery. Supported: JPG, PNG, WebP. Max 5MB
        per image.
      </p>
    </div>
  );
}

// ── Team/Founders Editor ──────────────────────────────────────────────────────

const FOUNDERS = [
  {
    key: "founder_1",
    defaultName: "RUCHITHA B S",
    defaultTitle: "Co-Founder & Lead Photographer",
  },
  {
    key: "founder_2",
    defaultName: "ASHITHA S",
    defaultTitle: "Co-Founder & Creative Director",
  },
  {
    key: "founder_3",
    defaultName: "PRARTHANA R",
    defaultTitle: "Co-Founder & Videography Lead",
  },
];

function TeamEditor() {
  const [data, setData] = useState(() =>
    FOUNDERS.map((f) => ({
      key: f.key,
      name: localStorage.getItem(`cms_${f.key}_name`) ?? f.defaultName,
      title: localStorage.getItem(`cms_${f.key}_title`) ?? f.defaultTitle,
      photo: localStorage.getItem(`cms_img_${f.key}_photo`) ?? "",
    })),
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  function handlePhotoUpload(key: string, file: File) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      setData((prev) =>
        prev.map((d) => (d.key === key ? { ...d, photo: url } : d)),
      );
      localStorage.setItem(`cms_img_${key}_photo`, url);
      dispatchCmsUpdate("team_photo", { key, url });
      toast.success("Founder photo updated");
    };
    reader.readAsDataURL(file);
  }

  function handleSave() {
    setSaving(true);
    for (const item of data) {
      localStorage.setItem(`cms_${item.key}_name`, item.name);
      localStorage.setItem(`cms_${item.key}_title`, item.title);
    }
    dispatchCmsUpdate("team", { founders: data });
    setSaving(false);
    setSaved(true);
    toast.success("Team/founders saved");
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-4">
      {data.map((founder, i) => (
        <div
          key={founder.key}
          className="rounded-xl border border-border/40 bg-background/40 p-4"
          data-ocid={`cms-founder-row.${i + 1}`}
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full border-2 border-primary/30 overflow-hidden bg-muted/20 flex items-center justify-center">
                {founder.photo ? (
                  <img
                    src={founder.photo}
                    alt={founder.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Users className="w-6 h-6 text-muted-foreground/30" />
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={(el) => {
                  fileRefs.current[founder.key] = el;
                }}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handlePhotoUpload(founder.key, f);
                }}
              />
              <Button
                type="button"
                size="sm"
                className="mt-2 w-16 h-6 text-[9px] bg-primary/10 text-primary border border-primary/25 hover:bg-primary/20"
                onClick={() => fileRefs.current[founder.key]?.click()}
                data-ocid={`cms-founder-photo-btn.${i + 1}`}
              >
                <UploadCloud className="w-2.5 h-2.5 mr-0.5" />
                Photo
              </Button>
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              <div>
                <label
                  htmlFor={`founder-name-${founder.key}`}
                  className="text-[10px] font-semibold text-muted-foreground block mb-1"
                >
                  Full Name
                </label>
                <Input
                  id={`founder-name-${founder.key}`}
                  value={founder.name}
                  onChange={(e) =>
                    setData((prev) =>
                      prev.map((d) =>
                        d.key === founder.key
                          ? { ...d, name: e.target.value }
                          : d,
                      ),
                    )
                  }
                  className="h-8 text-sm bg-background/60 border-border/50"
                  data-ocid={`cms-founder-name-input.${i + 1}`}
                />
              </div>
              <div>
                <label
                  htmlFor={`founder-title-${founder.key}`}
                  className="text-[10px] font-semibold text-muted-foreground block mb-1"
                >
                  Title / Role
                </label>
                <Input
                  id={`founder-title-${founder.key}`}
                  value={founder.title}
                  onChange={(e) =>
                    setData((prev) =>
                      prev.map((d) =>
                        d.key === founder.key
                          ? { ...d, title: e.target.value }
                          : d,
                      ),
                    )
                  }
                  className="h-8 text-sm bg-background/60 border-border/50"
                  data-ocid={`cms-founder-title-input.${i + 1}`}
                />
              </div>
            </div>
          </div>
        </div>
      ))}
      <div className="flex justify-end">
        <SaveBtn
          onClick={handleSave}
          saving={saving}
          saved={saved}
          label="Save Team"
          ocid="cms-team-save-btn"
        />
      </div>
    </div>
  );
}

// ── Services Editor (real backend) ───────────────────────────────────────────

interface ServiceFormState {
  name: string;
  description: string;
  icon: string;
  imageFile: File | null;
  imagePreview: string;
}

function emptyServiceForm(): ServiceFormState {
  return {
    name: "",
    description: "",
    icon: "📸",
    imageFile: null,
    imagePreview: "",
  };
}

function ServicePreviewModal({
  name,
  description,
  icon,
  imageUrl,
  onClose,
}: {
  name: string;
  description: string;
  icon: string;
  imageUrl: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      data-ocid="cms-service-preview-dialog"
    >
      <div className="rounded-2xl border border-primary/30 bg-card p-6 max-w-sm w-full mx-4 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-foreground text-sm">
            Service Preview
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full hover:bg-muted/40 flex items-center justify-center"
            aria-label="Close preview"
            data-ocid="cms-service-preview-close-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="rounded-xl overflow-hidden border border-border/40 bg-muted/10">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-40 object-cover"
            />
          ) : (
            <div className="w-full h-40 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-4xl">
              {icon}
            </div>
          )}
        </div>
        <div>
          <p className="font-display font-bold text-foreground">
            {icon} {name}
          </p>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
      </div>
    </div>
  );
}

function ServicesEditor() {
  const { data: backendServices = [], isLoading } = useAdminServices();
  const addServiceMutation = useAdminAddService();
  const updateServiceMutation = useAdminUpdateService();
  const deleteServiceMutation = useAdminDeleteService();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<bigint | null>(null);
  const [editForm, setEditForm] = useState<ServiceFormState>(
    emptyServiceForm(),
  );
  const [addForm, setAddForm] = useState<ServiceFormState>(emptyServiceForm());
  const [confirmDeleteId, setConfirmDeleteId] = useState<bigint | null>(null);
  const [previewItem, setPreviewItem] = useState<{
    name: string;
    description: string;
    icon: string;
    imageUrl: string;
  } | null>(null);
  const [savingId, setSavingId] = useState<bigint | null>(null);
  const addFileRef = useRef<HTMLInputElement | null>(null);
  const editFileRef = useRef<HTMLInputElement | null>(null);

  // Merge static + backend services for display
  const staticServices = SERVICE_CATEGORIES.map((c, i) => ({
    id: BigInt(-(i + 1)), // negative = static
    name: c.name,
    description: c.description,
    icon: c.emoji,
    imageUrl: c.coverImage ?? "",
    isStatic: true,
  }));

  const backendServicesMapped = backendServices.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    icon: s.icon,
    imageUrl: s.imageBlob ? blobToObjectUrl(s.imageBlob) : "",
    isStatic: false,
  }));

  const allServices = [...staticServices, ...backendServicesMapped];

  function openEdit(s: (typeof allServices)[0]) {
    setEditingId(s.id);
    setEditForm({
      name: s.name,
      description: s.description,
      icon: s.icon,
      imageFile: null,
      imagePreview: s.imageUrl,
    });
  }

  async function handleSaveEdit() {
    if (!editingId) return;
    if (editingId < 0n) {
      // Static service — apply preview-only local update
      toast.info(
        "This is a built-in service — changes are shown in the preview only",
      );
      dispatchCmsUpdate("service_preview", {
        id: String(editingId),
        name: editForm.name,
        description: editForm.description,
        icon: editForm.icon,
        imagePreview: editForm.imagePreview,
      });
      setEditingId(null);
      return;
    }
    setSavingId(editingId);
    try {
      const imageData = editForm.imageFile
        ? await fileToUint8Array(editForm.imageFile)
        : new Uint8Array(0);
      await updateServiceMutation.mutateAsync({
        id: editingId,
        input: {
          name: editForm.name,
          description: editForm.description,
          icon: editForm.icon,
          imageData,
          subServices: [],
        },
      });
      toast.success("Service updated on main website");
      setEditingId(null);
    } catch {
      toast.error("Update failed");
    }
    setSavingId(null);
  }

  async function handleAdd() {
    if (!addForm.name.trim()) {
      toast.error("Service name is required");
      return;
    }
    setSavingId(0n);
    try {
      const imageData = addForm.imageFile
        ? await fileToUint8Array(addForm.imageFile)
        : new Uint8Array(0);
      await addServiceMutation.mutateAsync({
        name: addForm.name,
        description: addForm.description,
        icon: addForm.icon,
        imageData,
        subServices: [],
      });
      toast.success("New service added to main website");
      setAddForm(emptyServiceForm());
      setShowAddForm(false);
    } catch {
      toast.error("Failed to add service");
    }
    setSavingId(null);
  }

  async function handleDelete(id: bigint) {
    try {
      await deleteServiceMutation.mutateAsync(id);
      toast.success("Service removed from main website");
    } catch {
      toast.error("Delete failed");
    }
    setConfirmDeleteId(null);
  }

  function handleImageSelect(file: File, target: "add" | "edit") {
    const url = URL.createObjectURL(file);
    if (target === "add")
      setAddForm((p) => ({ ...p, imageFile: file, imagePreview: url }));
    else setEditForm((p) => ({ ...p, imageFile: file, imagePreview: url }));
  }

  return (
    <div className="space-y-3">
      {/* Add new service button */}
      <div className="flex justify-end">
        <Button
          type="button"
          size="sm"
          className="h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5"
          onClick={() => setShowAddForm(true)}
          data-ocid="cms-service-add-btn"
        >
          <Plus className="w-3.5 h-3.5" />
          Add New Service
        </Button>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3"
            data-ocid="cms-service-add-form"
          >
            <p className="text-sm font-semibold text-foreground">
              Add New Service
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-muted-foreground mb-1">
                  Service Name
                </p>
                <Input
                  value={addForm.name}
                  onChange={(e) =>
                    setAddForm((p) => ({ ...p, name: e.target.value }))
                  }
                  className="h-8 text-sm bg-background/60 border-border/50"
                  placeholder="e.g. Wedding Photography"
                  data-ocid="cms-service-add-name-input"
                />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground mb-1">
                  Emoji/Icon
                </p>
                <Input
                  value={addForm.icon}
                  onChange={(e) =>
                    setAddForm((p) => ({ ...p, icon: e.target.value }))
                  }
                  className="h-8 text-sm bg-background/60 border-border/50"
                  placeholder="📸"
                  data-ocid="cms-service-add-icon-input"
                />
              </div>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground mb-1">
                Description
              </p>
              <Input
                value={addForm.description}
                onChange={(e) =>
                  setAddForm((p) => ({ ...p, description: e.target.value }))
                }
                className="h-8 text-sm bg-background/60 border-border/50"
                placeholder="Brief description..."
                data-ocid="cms-service-add-desc-input"
              />
            </div>
            {/* Image upload */}
            <div>
              <p className="text-[10px] text-muted-foreground mb-1">
                Service Image
              </p>
              <div className="flex items-center gap-3">
                {addForm.imagePreview && (
                  <img
                    src={addForm.imagePreview}
                    alt="Preview"
                    className="w-16 h-12 object-cover rounded-lg border border-border/40"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={addFileRef}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleImageSelect(f, "add");
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs border-primary/30 text-primary hover:bg-primary/10"
                  onClick={() => addFileRef.current?.click()}
                  data-ocid="cms-service-add-image-btn"
                >
                  <UploadCloud className="w-3 h-3 mr-1" />
                  {addForm.imagePreview ? "Replace" : "Upload Image"}
                </Button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                className="h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleAdd}
                disabled={savingId === 0n}
                data-ocid="cms-service-add-save-btn"
              >
                {savingId === 0n ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin mr-1" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save className="w-3 h-3 mr-1" />
                    Save Service
                  </>
                )}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 text-xs border-border/50"
                onClick={() => {
                  setShowAddForm(false);
                  setAddForm(emptyServiceForm());
                }}
                data-ocid="cms-service-add-cancel-btn"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading */}
      {isLoading && (
        <div
          className="flex items-center justify-center py-8 text-muted-foreground"
          data-ocid="cms-services-loading_state"
        >
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
          Loading services…
        </div>
      )}

      {/* Service cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {allServices.map((svc, i) => (
          <div
            key={String(svc.id)}
            className="rounded-xl border border-border/40 bg-background/40 overflow-hidden"
            data-ocid={`cms-service-card.${i + 1}`}
          >
            {/* Image */}
            <div className="h-32 bg-muted/20 relative overflow-hidden">
              {svc.imageUrl ? (
                <img
                  src={svc.imageUrl}
                  alt={svc.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                  <span className="text-4xl">{svc.icon}</span>
                </div>
              )}
              {svc.isStatic && (
                <div className="absolute top-2 left-2 text-[8px] px-1.5 py-0.5 rounded-full bg-muted/80 text-muted-foreground border border-border/40">
                  Static
                </div>
              )}
            </div>
            {/* Edit mode */}
            {editingId === svc.id ? (
              <div className="p-3 space-y-2">
                <Input
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, name: e.target.value }))
                  }
                  className="h-8 text-sm bg-background/60 border-border/50"
                  placeholder="Name"
                />
                <Input
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, description: e.target.value }))
                  }
                  className="h-8 text-xs bg-background/60 border-border/50"
                  placeholder="Description"
                />
                <div className="flex items-center gap-2">
                  {editForm.imagePreview && (
                    <img
                      src={editForm.imagePreview}
                      alt="Preview"
                      className="w-12 h-9 object-cover rounded border border-border/40"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={editFileRef}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleImageSelect(f, "edit");
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 text-[10px] border-primary/30 text-primary hover:bg-primary/10"
                    onClick={() => editFileRef.current?.click()}
                    data-ocid={`cms-service-edit-image-btn.${i + 1}`}
                  >
                    <UploadCloud className="w-3 h-3 mr-1" />
                    Image
                  </Button>
                </div>
                <div className="flex gap-1.5">
                  <Button
                    type="button"
                    size="sm"
                    className="h-7 text-[10px] bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={handleSaveEdit}
                    disabled={savingId === svc.id}
                    data-ocid={`cms-service-save-btn.${i + 1}`}
                  >
                    <Save className="w-3 h-3 mr-1" />
                    Save
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 text-[10px]"
                    onClick={() => setEditingId(null)}
                    data-ocid={`cms-service-cancel-btn.${i + 1}`}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-3 space-y-2">
                <p className="font-semibold text-sm text-foreground truncate">
                  {svc.icon} {svc.name}
                </p>
                <p className="text-[10px] text-muted-foreground line-clamp-2">
                  {svc.description}
                </p>
                <div className="flex gap-1.5 flex-wrap">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 text-[10px] border-primary/30 text-primary hover:bg-primary/10 flex-1"
                    onClick={() => openEdit(svc)}
                    data-ocid={`cms-service-edit-btn.${i + 1}`}
                  >
                    <Edit3 className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 text-[10px] border-border/40 hover:bg-muted/30 flex-1"
                    onClick={() =>
                      setPreviewItem({
                        name: svc.name,
                        description: svc.description,
                        icon: svc.icon,
                        imageUrl: svc.imageUrl,
                      })
                    }
                    data-ocid={`cms-service-preview-btn.${i + 1}`}
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Preview
                  </Button>
                  {!svc.isStatic && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 text-[10px] border-red-500/30 text-red-400 hover:bg-red-500/10"
                      onClick={() => setConfirmDeleteId(svc.id)}
                      data-ocid={`cms-service-delete-btn.${i + 1}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Confirm delete */}
      {confirmDeleteId !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          data-ocid="cms-service-delete-dialog"
        >
          <div className="rounded-2xl border border-red-500/30 bg-card p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="font-display font-bold text-foreground mb-2">
              Remove Service?
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              This will remove the service from the main website.
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="border-border/50"
                onClick={() => setConfirmDeleteId(null)}
                data-ocid="cms-service-delete-cancel-btn"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => handleDelete(confirmDeleteId!)}
                data-ocid="cms-service-delete-confirm-btn"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Preview modal */}
      {previewItem && (
        <ServicePreviewModal
          {...previewItem}
          onClose={() => setPreviewItem(null)}
        />
      )}
    </div>
  );
}

// ── Courses Editor (real backend) ─────────────────────────────────────────────

interface CourseFormState {
  title: string;
  description: string;
  category: string;
  mode: "Online" | "Offline" | "Hybrid";
  duration: string;
  price: number;
  prerequisites: string;
  imageFile: File | null;
  imagePreview: string;
}

function emptyCourseForm(): CourseFormState {
  return {
    title: "",
    description: "",
    category: "photography",
    mode: "Hybrid",
    duration: "4 weeks",
    price: 5,
    prerequisites: "",
    imageFile: null,
    imagePreview: "",
  };
}

const MODE_BADGE_COLORS: Record<string, string> = {
  Online: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Offline: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  Hybrid: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  online: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  offline: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  hybrid: "bg-purple-500/20 text-purple-300 border-purple-500/30",
};

function CoursePreviewModal({
  title,
  description,
  mode,
  imageUrl,
  onClose,
}: {
  title: string;
  description: string;
  mode: string;
  imageUrl: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      data-ocid="cms-course-preview-dialog"
    >
      <div className="rounded-2xl border border-primary/30 bg-card p-6 max-w-sm w-full mx-4 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-foreground text-sm">
            Course Preview
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full hover:bg-muted/40 flex items-center justify-center"
            aria-label="Close preview"
            data-ocid="cms-course-preview-close-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {imageUrl && (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-40 object-cover rounded-xl border border-border/40"
          />
        )}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="font-display font-bold text-foreground">{title}</p>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full border ${MODE_BADGE_COLORS[mode] ?? ""}`}
            >
              {mode}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}

function CoursesEditor() {
  const { data: backendCourses = [], isLoading } = useAdminCourses();
  const addCourseMutation = useAdminAddCourse();
  const updateCourseMutation = useAdminUpdateCourse();
  const deleteCourseMutation = useAdminDeleteCourse();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<bigint | null>(null);
  const [editForm, setEditForm] = useState<CourseFormState>(emptyCourseForm());
  const [addForm, setAddForm] = useState<CourseFormState>(emptyCourseForm());
  const [confirmDeleteId, setConfirmDeleteId] = useState<bigint | null>(null);
  const [previewItem, setPreviewItem] = useState<{
    title: string;
    description: string;
    mode: string;
    imageUrl: string;
  } | null>(null);
  const [savingId, setSavingId] = useState<bigint | null>(null);
  const [managingLessonsCourseId, setManagingLessonsCourseId] = useState<
    number | null
  >(null);
  const [managingLessonsTitle, setManagingLessonsTitle] = useState<string>("");
  const addFileRef = useRef<HTMLInputElement | null>(null);
  const editFileRef = useRef<HTMLInputElement | null>(null);

  // Fetch lessons for the selected course
  const { data: courseLessons = [] } = useLessons(managingLessonsCourseId);

  // Static courses
  const staticCoursesMapped = COURSES.map((c, i) => ({
    id: BigInt(-(i + 1)),
    title: c.title,
    description: c.description,
    mode: c.mode as string,
    category: c.category,
    duration: c.duration,
    price: c.price,
    imageUrl: c.image,
    isStatic: true,
  }));

  const backendCoursesMapped = backendCourses.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    mode: c.mode as string,
    category: c.category,
    duration: c.duration,
    price: Number(c.price),
    imageUrl: c.imageBlob ? blobToObjectUrl(c.imageBlob) : "",
    isStatic: false,
  }));

  const allCourses = [...staticCoursesMapped, ...backendCoursesMapped];

  function openEdit(c: (typeof allCourses)[0]) {
    setEditingId(c.id);
    setEditForm({
      title: c.title,
      description: c.description,
      category: c.category,
      mode: c.mode as "Online" | "Offline" | "Hybrid",
      duration: c.duration,
      price: c.price,
      prerequisites: "",
      imageFile: null,
      imagePreview: c.imageUrl ?? "",
    });
  }

  async function buildCourseInput(
    form: CourseFormState,
  ): Promise<AdminCourseInput> {
    const imageData = form.imageFile
      ? await fileToUint8Array(form.imageFile)
      : new Uint8Array(0);
    return {
      title: form.title,
      description: form.description,
      category: form.category,
      mode: (form.mode === "Online"
        ? { Online: null }
        : form.mode === "Offline"
          ? { Offline: null }
          : { Hybrid: null }) as unknown as CourseMode,
      duration: form.duration,
      price: BigInt(Math.round(form.price * 100)),
      prerequisites: form.prerequisites
        ? form.prerequisites.split(",").map((s) => s.trim())
        : [],
      imageData,
      status: { Active: null } as unknown as CourseStatus,
    };
  }

  async function handleSaveEdit() {
    if (!editingId) return;
    if (editingId < 0n) {
      toast.info(
        "This is a built-in course — changes are shown in the preview only",
      );
      dispatchCmsUpdate("course_preview", {
        id: String(editingId),
        title: editForm.title,
        description: editForm.description,
        mode: editForm.mode,
        imagePreview: editForm.imagePreview,
      });
      setEditingId(null);
      return;
    }
    setSavingId(editingId);
    try {
      const input = await buildCourseInput(editForm);
      await updateCourseMutation.mutateAsync({ id: editingId, input });
      toast.success("Course updated on main website");
      setEditingId(null);
    } catch {
      toast.error("Update failed");
    }
    setSavingId(null);
  }

  async function handleModeToggle(
    courseId: bigint,
    currentMode: string,
    course: (typeof allCourses)[0],
  ) {
    if (courseId < 0n) {
      toast.info("Cannot change mode for built-in static courses");
      return;
    }
    const modes: Array<"Online" | "Offline" | "Hybrid"> = [
      "Online",
      "Offline",
      "Hybrid",
    ];
    const normalizedCurrent = (currentMode.charAt(0).toUpperCase() +
      currentMode.slice(1).toLowerCase()) as "Online" | "Offline" | "Hybrid";
    const nextIdx = (modes.indexOf(normalizedCurrent) + 1) % modes.length;
    const newMode = modes[nextIdx];
    setSavingId(courseId);
    try {
      const imageData = new Uint8Array(0);
      const input: AdminCourseInput = {
        title: course.title,
        description: course.description,
        category: course.category,
        mode: (newMode === "Online"
          ? { Online: null }
          : newMode === "Offline"
            ? { Offline: null }
            : { Hybrid: null }) as unknown as CourseMode,
        duration: course.duration,
        price: BigInt(Math.round(course.price * 100)),
        prerequisites: [],
        imageData,
        status: { Active: null } as unknown as CourseStatus,
      };
      await updateCourseMutation.mutateAsync({ id: courseId, input });
      toast.success(`Mode changed to ${newMode}`);
    } catch {
      toast.error("Mode update failed");
    }
    setSavingId(null);
  }

  async function handleAdd() {
    if (!addForm.title.trim()) {
      toast.error("Course title is required");
      return;
    }
    setSavingId(0n);
    try {
      const input = await buildCourseInput(addForm);
      await addCourseMutation.mutateAsync(input);
      toast.success("New course added to main website");
      setAddForm(emptyCourseForm());
      setShowAddForm(false);
    } catch {
      toast.error("Failed to add course");
    }
    setSavingId(null);
  }

  async function handleDelete(id: bigint) {
    try {
      await deleteCourseMutation.mutateAsync(id);
      toast.success("Course removed from main website");
    } catch {
      toast.error("Delete failed");
    }
    setConfirmDeleteId(null);
  }

  function handleImageSelect(file: File, target: "add" | "edit") {
    const url = URL.createObjectURL(file);
    if (target === "add")
      setAddForm((p) => ({ ...p, imageFile: file, imagePreview: url }));
    else setEditForm((p) => ({ ...p, imageFile: file, imagePreview: url }));
  }

  // Show LessonQuizManager panel when managing lessons
  if (managingLessonsCourseId !== null) {
    return (
      <LessonQuizManager
        courseId={managingLessonsCourseId}
        courseTitle={managingLessonsTitle}
        lessons={courseLessons}
        onBack={() => {
          setManagingLessonsCourseId(null);
          setManagingLessonsTitle("");
        }}
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button
          type="button"
          size="sm"
          className="h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5"
          onClick={() => setShowAddForm(true)}
          data-ocid="cms-course-add-btn"
        >
          <Plus className="w-3.5 h-3.5" />
          Add New Course
        </Button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3"
            data-ocid="cms-course-add-form"
          >
            <p className="text-sm font-semibold text-foreground">
              Add New Course
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-muted-foreground mb-1">Title</p>
                <Input
                  value={addForm.title}
                  onChange={(e) =>
                    setAddForm((p) => ({ ...p, title: e.target.value }))
                  }
                  className="h-8 text-sm bg-background/60 border-border/50"
                  placeholder="Course title"
                  data-ocid="cms-course-add-title-input"
                />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground mb-1">Mode</p>
                <select
                  value={addForm.mode}
                  onChange={(e) =>
                    setAddForm((p) => ({
                      ...p,
                      mode: e.target.value as "Online" | "Offline" | "Hybrid",
                    }))
                  }
                  className="w-full h-8 rounded-md border border-border/50 bg-background/60 text-foreground text-sm px-2"
                >
                  <option value="Online">Online</option>
                  <option value="Offline">Offline</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground mb-1">
                  Category
                </p>
                <Input
                  value={addForm.category}
                  onChange={(e) =>
                    setAddForm((p) => ({ ...p, category: e.target.value }))
                  }
                  className="h-8 text-sm bg-background/60 border-border/50"
                  placeholder="photography"
                />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground mb-1">
                  Duration
                </p>
                <Input
                  value={addForm.duration}
                  onChange={(e) =>
                    setAddForm((p) => ({ ...p, duration: e.target.value }))
                  }
                  className="h-8 text-sm bg-background/60 border-border/50"
                  placeholder="4 weeks"
                />
              </div>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground mb-1">
                Description
              </p>
              <Input
                value={addForm.description}
                onChange={(e) =>
                  setAddForm((p) => ({ ...p, description: e.target.value }))
                }
                className="h-8 text-sm bg-background/60 border-border/50"
                placeholder="Course description..."
              />
            </div>
            <div className="flex items-center gap-3">
              {addForm.imagePreview && (
                <img
                  src={addForm.imagePreview}
                  alt="Preview"
                  className="w-16 h-12 object-cover rounded-lg border border-border/40"
                />
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={addFileRef}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleImageSelect(f, "add");
                }}
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 text-xs border-primary/30 text-primary hover:bg-primary/10"
                onClick={() => addFileRef.current?.click()}
                data-ocid="cms-course-add-image-btn"
              >
                <UploadCloud className="w-3 h-3 mr-1" />
                {addForm.imagePreview ? "Replace" : "Upload Image"}
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                className="h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleAdd}
                disabled={savingId === 0n}
                data-ocid="cms-course-add-save-btn"
              >
                {savingId === 0n ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin mr-1" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save className="w-3 h-3 mr-1" />
                    Save Course
                  </>
                )}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 text-xs border-border/50"
                onClick={() => {
                  setShowAddForm(false);
                  setAddForm(emptyCourseForm());
                }}
                data-ocid="cms-course-add-cancel-btn"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading && (
        <div
          className="flex items-center justify-center py-8 text-muted-foreground"
          data-ocid="cms-courses-loading_state"
        >
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
          Loading courses…
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {allCourses.map((course, i) => (
          <div
            key={String(course.id)}
            className="rounded-xl border border-border/40 bg-background/40 overflow-hidden"
            data-ocid={`cms-course-card.${i + 1}`}
          >
            <div className="h-28 bg-muted/20 relative overflow-hidden">
              {course.imageUrl ? (
                <img
                  src={course.imageUrl}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                  <BookOpen className="w-8 h-8 text-primary/40" />
                </div>
              )}
              {/* Mode toggle badge — always visible */}
              <button
                type="button"
                onClick={() => handleModeToggle(course.id, course.mode, course)}
                disabled={savingId === course.id || course.isStatic}
                title="Click to toggle mode: Online / Offline / Hybrid"
                className={`absolute top-2 right-2 text-[9px] px-1.5 py-0.5 rounded-full border cursor-pointer transition-opacity hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed ${MODE_BADGE_COLORS[course.mode] ?? ""}`}
                data-ocid={`cms-course-mode-toggle.${i + 1}`}
              >
                {course.mode}
              </button>
              {course.isStatic && (
                <div className="absolute top-2 left-2 text-[8px] px-1.5 py-0.5 rounded-full bg-muted/80 text-muted-foreground border border-border/40">
                  Static
                </div>
              )}
            </div>
            {editingId === course.id ? (
              <div className="p-3 space-y-2">
                <Input
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, title: e.target.value }))
                  }
                  className="h-8 text-sm bg-background/60 border-border/50"
                  placeholder="Title"
                />
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={editForm.mode}
                    onChange={(e) =>
                      setEditForm((p) => ({
                        ...p,
                        mode: e.target.value as "Online" | "Offline" | "Hybrid",
                      }))
                    }
                    className="h-8 rounded-md border border-border/50 bg-background/60 text-foreground text-xs px-2"
                  >
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                  <Input
                    value={editForm.duration}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, duration: e.target.value }))
                    }
                    className="h-8 text-xs bg-background/60 border-border/50"
                    placeholder="Duration"
                  />
                </div>
                <Input
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, description: e.target.value }))
                  }
                  className="h-8 text-xs bg-background/60 border-border/50"
                  placeholder="Description"
                />
                <div className="flex items-center gap-2">
                  {editForm.imagePreview && (
                    <img
                      src={editForm.imagePreview}
                      alt="Preview"
                      className="w-12 h-9 object-cover rounded border border-border/40"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={editFileRef}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleImageSelect(f, "edit");
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 text-[10px] border-primary/30 text-primary hover:bg-primary/10"
                    onClick={() => editFileRef.current?.click()}
                    data-ocid={`cms-course-edit-image-btn.${i + 1}`}
                  >
                    <UploadCloud className="w-3 h-3 mr-1" />
                    Image
                  </Button>
                </div>
                <div className="flex gap-1.5">
                  <Button
                    type="button"
                    size="sm"
                    className="h-7 text-[10px] bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={handleSaveEdit}
                    disabled={savingId === course.id}
                    data-ocid={`cms-course-save-btn.${i + 1}`}
                  >
                    <Save className="w-3 h-3 mr-1" />
                    Save
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 text-[10px]"
                    onClick={() => setEditingId(null)}
                    data-ocid={`cms-course-cancel-btn.${i + 1}`}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-3 space-y-1.5">
                <p className="font-semibold text-sm text-foreground truncate">
                  {course.title}
                </p>
                <p className="text-[10px] text-muted-foreground line-clamp-2">
                  {course.description}
                </p>
                {/* All action buttons — always visible, never hidden */}
                <div className="flex gap-1.5 flex-wrap">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 text-[10px] border-primary/30 text-primary hover:bg-primary/10"
                    onClick={() => openEdit(course)}
                    data-ocid={`cms-course-edit-btn.${i + 1}`}
                  >
                    <Edit3 className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 text-[10px] border-border/40 hover:bg-muted/30"
                    onClick={() =>
                      setPreviewItem({
                        title: course.title,
                        description: course.description,
                        mode: course.mode,
                        imageUrl: course.imageUrl ?? "",
                      })
                    }
                    data-ocid={`cms-course-preview-btn.${i + 1}`}
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Preview
                  </Button>
                  {/* Manage Lessons button — always visible */}
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 text-[10px] border-amber-500/30 text-amber-400 hover:bg-amber-500/10 flex-1"
                    onClick={() => {
                      setManagingLessonsCourseId(Number(course.id));
                      setManagingLessonsTitle(course.title);
                    }}
                    data-ocid={`cms-course-manage-lessons-btn.${i + 1}`}
                  >
                    <GraduationCap className="w-3 h-3 mr-1" />
                    Manage Lessons
                  </Button>
                  {!course.isStatic && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 text-[10px] border-red-500/30 text-red-400 hover:bg-red-500/10"
                      onClick={() => setConfirmDeleteId(course.id)}
                      data-ocid={`cms-course-delete-btn.${i + 1}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {confirmDeleteId !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          data-ocid="cms-course-delete-dialog"
        >
          <div className="rounded-2xl border border-red-500/30 bg-card p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="font-display font-bold text-foreground mb-2">
              Remove Course?
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              This will remove the course from the learning platform.
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="border-border/50"
                onClick={() => setConfirmDeleteId(null)}
                data-ocid="cms-course-delete-cancel-btn"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => handleDelete(confirmDeleteId!)}
                data-ocid="cms-course-delete-confirm-btn"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {previewItem && (
        <CoursePreviewModal
          {...previewItem}
          onClose={() => setPreviewItem(null)}
        />
      )}
    </div>
  );
}

// ── Sub-Service Image Manager (real backend) ───────────────────────────────────

type SubServiceImageState = Record<string, string>;

function makeSubServiceKey(categoryId: string, subServiceId: string): string {
  return `${categoryId}/${subServiceId}`;
}

function SubServiceImageRow({
  categoryId,
  subServiceId,
  subServiceName,
  imageUrl,
  uploading,
  onUpload,
  onDelete,
  index,
}: {
  categoryId: string;
  subServiceId: string;
  subServiceName: string;
  imageUrl: string;
  uploading: boolean;
  onUpload: (cid: string, sid: string, file: File) => void;
  onDelete: (cid: string, sid: string) => void;
  index: number;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);

  return (
    <div
      className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-muted/15 transition-colors group"
      data-ocid={`cms-subservice-row.${index}`}
    >
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
        {uploading && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
      <span className="flex-1 text-xs text-foreground min-w-0 truncate">
        {subServiceName}
      </span>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileRef}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) {
              onUpload(categoryId, subServiceId, f);
              if (fileRef.current) fileRef.current.value = "";
            }
          }}
        />
        <Button
          type="button"
          size="sm"
          className="h-7 px-2 text-[10px] bg-primary/10 text-primary border border-primary/25 hover:bg-primary/20"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
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
            className="h-7 px-2 text-[10px] border-red-500/30 text-red-400 hover:bg-red-500/10"
            onClick={() => onDelete(categoryId, subServiceId)}
            disabled={uploading}
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
  const { data: backendImagePairs = [] } = useAllSubServiceImages();
  const uploadMutation = useUploadSubServiceImage();
  const deleteMutation = useDeleteSubServiceImage();

  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [localImages, setLocalImages] = useState<SubServiceImageState>(() => {
    const obj: SubServiceImageState = {};
    for (const cat of SERVICE_CATEGORIES) {
      for (const sub of cat.subServices) {
        const key = makeSubServiceKey(cat.id, sub.id);
        const stored = localStorage.getItem(`cms_subimg_${key}`);
        if (stored) obj[key] = stored;
      }
    }
    return obj;
  });

  const [search, setSearch] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >(() => {
    const obj: Record<string, boolean> = {};
    for (const cat of SERVICE_CATEGORIES.slice(0, 3)) obj[cat.id] = true;
    return obj;
  });

  // Merge backend + local images
  const images = useMemo<SubServiceImageState>(() => {
    const merged: SubServiceImageState = { ...localImages };
    for (const [key, url] of backendImagePairs) merged[key] = url;
    return merged;
  }, [backendImagePairs, localImages]);

  const handleUpload = useCallback(
    async (categoryId: string, subServiceId: string, file: File) => {
      const key = makeSubServiceKey(categoryId, subServiceId);
      setUploading((p) => ({ ...p, [key]: true }));
      try {
        const imageData = await fileToUint8Array(file);
        // Try backend first
        try {
          await uploadMutation.mutateAsync({
            categoryId,
            subServiceId,
            imageData,
          });
          toast.success("Sub-service image uploaded to backend");
          setUploading((p) => ({ ...p, [key]: false }));
          return;
        } catch {
          /* fall through */
        }
        // Local fallback
        const dataUrl = await fileToDataUrl(file);
        localStorage.setItem(`cms_subimg_${key}`, dataUrl);
        setLocalImages((p) => ({ ...p, [key]: dataUrl }));
        dispatchCmsUpdate("subservice_image", { key, url: dataUrl });
        toast.success("Sub-service image saved locally");
      } catch {
        toast.error("Upload failed");
      }
      setUploading((p) => ({ ...p, [key]: false }));
    },
    [uploadMutation],
  );

  const handleDelete = useCallback(
    async (categoryId: string, subServiceId: string) => {
      const key = makeSubServiceKey(categoryId, subServiceId);
      try {
        await deleteMutation.mutateAsync({ categoryId, subServiceId });
      } catch {
        /* noop */
      }
      localStorage.removeItem(`cms_subimg_${key}`);
      setLocalImages((p) => {
        const next = { ...p };
        delete next[key];
        return next;
      });
      dispatchCmsUpdate("subservice_image_delete", { key });
      toast.success("Image removed");
    },
    [deleteMutation],
  );

  function toggleCategory(catId: string) {
    setExpandedCategories((p) => ({ ...p, [catId]: !p[catId] }));
  }
  function expandAll() {
    const obj: Record<string, boolean> = {};
    for (const cat of SERVICE_CATEGORIES) obj[cat.id] = true;
    setExpandedCategories(obj);
  }
  function collapseAll() {
    setExpandedCategories({});
  }

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

  const totalSubServices = SERVICE_CATEGORIES.reduce(
    (acc, cat) => acc + cat.subServices.length,
    0,
  );
  const uploadedCount = Object.keys(images).length;
  let globalRowIndex = 0;

  return (
    <div className="space-y-4">
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
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
          <Input
            placeholder="Search sub-services…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9 text-sm bg-background/60 border-border/50"
            data-ocid="cms-subservice-search-input"
          />
          {search && (
            <button
              type="button"
              aria-label="Clear"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-9 text-xs"
          onClick={expandAll}
          data-ocid="cms-subservice-expand-all"
        >
          Expand All
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-9 text-xs"
          onClick={collapseAll}
          data-ocid="cms-subservice-collapse-all"
        >
          Collapse
        </Button>
      </div>
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
              <button
                type="button"
                onClick={() => toggleCategory(cat.id)}
                aria-expanded={isExpanded}
                className="w-full flex items-center gap-3 px-4 py-3 bg-muted/20 hover:bg-muted/30 transition-colors text-left"
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
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
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
                            uploading={uploading[key] ?? false}
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
    </div>
  );
}

// ── Main CmsTab ───────────────────────────────────────────────────────────────

type CmsSectionId =
  | "hero"
  | "texts"
  | "color"
  | "images"
  | "gallery"
  | "team"
  | "subservice-images"
  | "services"
  | "courses"
  | "student-progress";

const CMS_NAV: Array<{
  id: CmsSectionId;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}> = [
  {
    id: "hero",
    label: "Hero Section",
    icon: <Monitor className="w-3.5 h-3.5" />,
  },
  { id: "texts", label: "Page Texts", icon: <Text className="w-3.5 h-3.5" /> },
  {
    id: "color",
    label: "Colors & Theme",
    icon: <Palette className="w-3.5 h-3.5" />,
  },
  {
    id: "images",
    label: "Site Images",
    icon: <Image className="w-3.5 h-3.5" />,
  },
  { id: "gallery", label: "Gallery", icon: <Globe className="w-3.5 h-3.5" /> },
  {
    id: "team",
    label: "Team / Founders",
    icon: <Users className="w-3.5 h-3.5" />,
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
  {
    id: "courses",
    label: "Courses",
    icon: <FileText className="w-3.5 h-3.5" />,
  },
  {
    id: "student-progress",
    label: "Student Progress",
    icon: <GraduationCap className="w-3.5 h-3.5" />,
  },
];

const CMS_SECTION_INFO: Record<
  CmsSectionId,
  { title: string; subtitle: string; icon: React.ReactNode }
> = {
  hero: {
    title: "Hero Section Editor",
    subtitle: "Edit heading, subheading, CTA buttons and background image",
    icon: <Monitor className="w-4 h-4" />,
  },
  texts: {
    title: "Page Texts Editor",
    subtitle: "Edit all headings, descriptions, and copy across the site",
    icon: <Text className="w-4 h-4" />,
  },
  color: {
    title: "Colors & Theme — Live Preview",
    subtitle: "Pick colors that apply to the live site instantly",
    icon: <Palette className="w-4 h-4" />,
  },
  images: {
    title: "Site Image Manager",
    subtitle: "Upload hero, team, and background images",
    icon: <Image className="w-4 h-4" />,
  },
  gallery: {
    title: "Gallery Manager",
    subtitle:
      "Add, remove, and categorize gallery photos — synced with main site",
    icon: <Globe className="w-4 h-4" />,
  },
  team: {
    title: "Team & Founders Editor",
    subtitle: "Update founder names, titles, and photos",
    icon: <Users className="w-4 h-4" />,
  },
  "subservice-images": {
    title: "Sub-Service Images — All 109+ Sub-Services",
    subtitle:
      "Upload images for every individual sub-service, grouped by category",
    icon: <Layers className="w-4 h-4" />,
  },
  services: {
    title: "Services Editor",
    subtitle:
      "View all services with images. Add new services, edit or remove backend-added ones.",
    icon: <Edit3 className="w-4 h-4" />,
  },
  courses: {
    title: "Courses Editor",
    subtitle:
      "View all 50+ courses with images. Add new courses, edit or remove backend-added ones.",
    icon: <BookOpen className="w-4 h-4" />,
  },
  "student-progress": {
    title: "Student Progress — Live",
    subtitle:
      "Real-time overview of all student course progress, lesson completion, and certificates earned",
    icon: <GraduationCap className="w-4 h-4" />,
  },
};

export function CmsTab() {
  const [activeSection, setActiveSection] = useState<CmsSectionId>("hero");
  const { data: cmsContent = [] } = useAdminCmsContent();

  const initialTextValues: Record<string, string> = {};
  for (const entry of cmsContent) initialTextValues[entry.key] = entry.value;
  for (const group of TEXT_GROUPS) {
    for (const field of group.fields) {
      const stored = localStorage.getItem(`cms_${field.key}`);
      if (stored) initialTextValues[field.key] = stored;
    }
  }

  const activeInfo = CMS_SECTION_INFO[activeSection];

  const renderSection = () => {
    switch (activeSection) {
      case "hero":
        return <HeroEditor />;
      case "texts":
        return <PageTextsEditor initialValues={initialTextValues} />;
      case "color":
        return <ColorThemeEditor />;
      case "images":
        return <ImageManager />;
      case "gallery":
        return <GalleryManager />;
      case "team":
        return <TeamEditor />;
      case "subservice-images":
        return <SubServiceImageManager />;
      case "services":
        return <ServicesEditor />;
      case "courses":
        return <CoursesEditor />;
      case "student-progress":
        return <StudentProgressPanel />;
    }
  };

  return (
    <div className="w-full space-y-4">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 flex items-center gap-3"
      >
        <AlertTriangle className="w-4 h-4 text-primary flex-shrink-0" />
        <p className="text-xs text-foreground/80">
          <span className="font-semibold text-primary">CMS Editor</span> — All
          changes update the live site. Images show with their actual photos.
          Backend changes appear on main site within 10 seconds via polling.
        </p>
      </motion.div>

      <div className="flex flex-wrap gap-2" data-ocid="cms-section-tabs">
        {CMS_NAV.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setActiveSection(s.id)}
            className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border transition-colors ${activeSection === s.id ? "bg-primary/15 text-primary border-primary/40 font-semibold" : "border-border/40 text-muted-foreground hover:border-primary/30 hover:text-foreground"}`}
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

      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22 }}
        >
          <CmsSection
            icon={activeInfo.icon}
            title={activeInfo.title}
            subtitle={activeInfo.subtitle}
            delay={0}
          >
            {renderSection()}
          </CmsSection>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
