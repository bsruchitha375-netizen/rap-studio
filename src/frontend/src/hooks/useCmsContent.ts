// useCmsContent — reactive CMS content hook
// Reads from localStorage and listens for "cms-updated" custom events
// Applies CMS colors as CSS custom properties dynamically

import { useCallback, useEffect, useState } from "react";

// ── Types ────────────────────────────────────────────────────────────────────

export interface CmsHeroContent {
  heading?: string;
  subheading?: string;
  ctaText?: string;
  ctaSecondaryText?: string;
  backgroundUrl?: string;
}

export interface CmsGalleryItem {
  id: string;
  title: string;
  category: string;
  url: string;
  thumbnailUrl: string;
  type: "image" | "video";
}

export interface CmsServiceItem {
  id: string;
  name?: string;
  description?: string;
  imageUrl?: string;
}

export interface CmsColors {
  primaryGold?: string;
  background?: string;
  accentPurple?: string;
}

export interface CmsTeamMember {
  name: string;
  role: string;
  imageUrl?: string;
}

export interface CmsTexts {
  siteTagline?: string;
  contactEmail?: string;
  whyChooseTitle?: string;
  footerText?: string;
}

export interface CmsContent {
  hero: CmsHeroContent;
  gallery: CmsGalleryItem[];
  services: CmsServiceItem[];
  colors: CmsColors;
  team: CmsTeamMember[];
  texts: CmsTexts;
  lastUpdated: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function safeRead<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function readAllCmsContent(): CmsContent {
  const hero = safeRead<CmsHeroContent>("cms_hero", {});
  const gallery = safeRead<CmsGalleryItem[]>("cms_gallery", []);
  const services = safeRead<CmsServiceItem[]>("cms_services", []);
  const colors = safeRead<CmsColors>("cms_colors", {});
  const team = safeRead<CmsTeamMember[]>("cms_team", []);
  const texts = safeRead<CmsTexts>("cms_texts", {});
  return {
    hero,
    gallery,
    services,
    colors,
    team,
    texts,
    lastUpdated: Date.now(),
  };
}

/**
 * Apply CMS colors to CSS custom properties on document root.
 * Called whenever cms_colors changes.
 */
export function applyCmsColors(colors: CmsColors): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (colors.primaryGold) {
    root.style.setProperty("--color-gold", colors.primaryGold);
    if (colors.primaryGold.startsWith("oklch(")) {
      const inner = colors.primaryGold.replace("oklch(", "").replace(")", "");
      root.style.setProperty("--primary", inner);
    }
  }
  if (colors.background) {
    if (colors.background.startsWith("oklch(")) {
      const inner = colors.background.replace("oklch(", "").replace(")", "");
      root.style.setProperty("--background", inner);
    }
  }
  if (colors.accentPurple) {
    root.style.setProperty("--color-accent", colors.accentPurple);
    if (colors.accentPurple.startsWith("oklch(")) {
      const inner = colors.accentPurple.replace("oklch(", "").replace(")", "");
      root.style.setProperty("--accent", inner);
    }
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Returns CMS content reactively.
 * Re-reads from localStorage whenever a "cms-updated" event fires.
 * Also applies CSS color tokens on change.
 */
export function useCmsContent(): CmsContent {
  const [content, setContent] = useState<CmsContent>(() => {
    const initial = readAllCmsContent();
    if (initial.colors) applyCmsColors(initial.colors);
    return initial;
  });

  const refresh = useCallback(() => {
    const updated = readAllCmsContent();
    setContent(updated);
    if (updated.colors) applyCmsColors(updated.colors);
  }, []);

  useEffect(() => {
    window.addEventListener("cms-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("cms-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);

  return content;
}

/**
 * Returns a single CMS section reactively.
 */
export function useCmsSection<K extends keyof CmsContent>(
  section: K,
): CmsContent[K] {
  const content = useCmsContent();
  return content[section];
}

/**
 * Dispatch a cms-updated event to notify all subscribers.
 * Admin CMS calls this after saving.
 */
export function dispatchCmsUpdate(section?: string): void {
  const event = new CustomEvent("cms-updated", {
    detail: { section },
    bubbles: true,
  });
  window.dispatchEvent(event);
}
