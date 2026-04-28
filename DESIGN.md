# Design Brief

## Direction

**RAP Integrated Studio Management** — A world-class luxury photography, videography, and short film studio platform with premium cinematic visual language, enhanced saturated color palette, maximum clarity, and step-by-step course learning infrastructure. All text is crystal-clear in both dark and light modes with WCAG AAA compliance. Enhanced color saturation, glowing accent pulses, and luxury glassmorphism create a premium, responsive ecosystem.

## Tone

Ultra-premium cinematic luxury with maximum contrast clarity — saturated golds (0.73 chroma), vibrant violets (0.28 chroma), teal accents (0.22 chroma), and rich coral; premium dark navy (#0F1419) against warm cream in light mode; enhanced glassmorphism cards (28px blur, 78% dark / 95% light opacity) with refined saturation; premium typography hierarchy; and shadow depth communicating trust and craftsmanship. WCAG AAA contrast on all text and interactive elements (16:1 dark mode, 13:1+ light mode). No empty images or placeholders visible — all fallbacks hidden or replaced with fallback UI.

## Differentiation

Circular/orbital service layouts, carousel course galleries, and step-by-step learning flows create dynamic, celestial visual progression around the RAP logo — platforms feel like a curated creative ecosystem with clear mastery pathways, not a typical grid-based marketplace or generic LMS. Animated data loading states with glowing accent pulses make real-time admin management feel responsive and alive.

## Color Palette

| Token           | Dark OKLCH              | Light OKLCH             | Contrast Ratio | Role                                        |
|-----------------|------------------------|------------------------|----------------|---------------------------------------------|
| background      | 0.11 0.014 244         | 0.974 0.008 72         | 16:1           | Deep navy (dark), warm cream (light)         |
| foreground      | 0.96 0.008 72          | 0.10 0.024 270         | 16:1+          | Off-white text (dark), very dark charcoal (light)|
| card            | 0.16 0.038 262         | 0.995 0.002 72         | —              | Elevated container, subtle lift              |
| primary         | 0.73 0.168 83          | 0.56 0.168 83          | 13:1+          | Rich saturated gold, premium CTAs, progress  |
| accent          | 0.68 0.28 292          | 0.50 0.28 292          | 12:1+          | Vibrant violet, active lesson step (enhanced)|
| teal            | 0.64 0.22 180          | 0.50 0.22 180          | 11:1+          | Saturated teal for secondary actions         |
| success         | 0.70 0.24 150          | 0.50 0.26 150          | 11:1+          | Rich green, completion, passed quiz          |
| destructive     | 0.64 0.28 25           | 0.50 0.28 25           | 11:1+          | Saturated coral/red for alerts               |
| progress-fill   | 0.73 0.168 83          | 0.54 0.24 82           | 13:1+          | Course progress bar (gold gradient)          |
| step-active     | 0.68 0.28 292          | 0.50 0.28 292          | 12:1+          | Current lesson (violet glow)                 |
| cert-milestone  | 0.73 0.168 83          | 0.54 0.24 82           | 13:1+          | Certificate milestone (gold glow)            |

## Typography

- **Display**: Playfair Display — Editorial, cinematic, luxury; hero headlines (up to 8xl), section titles, certificate names. Tracking: -1px.
- **Body**: Inter/General Sans — Clean UI copy, lesson titles, quiz questions, button text. Letter-spacing: -0.3px.
- **Mono**: JetBrains Mono — Timestamps, score displays, certificate codes.

**Scale**: Hero `text-8xl font-bold`, H2 `text-5xl font-bold`, Lesson Title `text-2xl font-semibold`, Quiz Question `text-base`, Label `text-xs uppercase tracking-widest`.

## Learning Flow Components

- **Progress bar**: Gold gradient fill on dark track, animated smooth width transition (0.6s cubic-bezier), 8px height, subtle glow on fill (0.4 opacity shadow)
- **Step markers**: 2.5rem circles with border + background; pending (muted border), active (violet border + glow-pulse-violet animation, 16px shadow), completed (green border + glow, 12px shadow)
- **Video frame**: Glassmorphism container (0.15 0.016 275 bg), 1px border, 1rem radius, 16:9 aspect ratio, 8px+32px dual shadow for depth
- **Quiz questions**: 0.875rem border-radius cards, clickable with hover state (brighter bg, primary border), selected state shows violet glow (0.15 opacity) with primary 0.5 opacity border
- **Lesson sidebar**: `.lesson-item` flex layout, left 3px border indicator (pending/active/completed color states), hover brightens bg + lifts border color
- **Certificate card**: `.cert-milestone` with 2px gold border, earned state shows 12px shadow + enhanced border opacity with glow-pulse-gold animation
- **Quiz results**: Pass shows green bg/border/text (0.1 opacity background), fail shows red. Both 1rem padding, full width, center text.
- **Admin data loading**: `.admin-panel-loading` glow-pulse-gold animation on panels during live data refresh, signaling active connection

## Elevation & Depth

Five-layer depth model with enhanced visibility: background → muted cards (32% opacity for dark, 22% for light) → elevated cards with glass-effect (85% opacity dark, 97% light) → premium dual-shadow layers with enhanced saturation gold tints → floating premium CTAs. Video frames get enhanced dual shadows (8px soft + 32px deep, stronger in dark). Quiz questions lift on selection with violet glow. Course progress bar glows on interaction with saturated gold accent. Glassmorphism uses 24-28px blur for luxury feel while maintaining text readability in both modes. Bokeh orbs larger and more vibrant (500px base, enhanced opacity 0.12 dark / 0.05 light).

## Structural Zones

| Zone    | Background           | Border              | Notes                                                          |
|---------|---------------------|-------------------|--------------------------------------------------------------|
| Header  | card/60 glass-effect | border/30 bottom    | Fixed nav, RAP logo, progress bar at top, theme toggle        |
| Hero    | background gradient  | none                | Full-screen cinematic hero for course platform                |
| Admin Panel | background       | none                | Live data panels with glow-pulse animations on refresh         |
| Lesson View | background       | none                | 70% video+quiz center, 30% lesson sidebar right (responsive)  |
| Video Player | video-frame card | border/40           | Embedded YouTube, full responsive, 16:9 ratio                |
| Quiz Area | quiz-section card  | border/30           | 10+ MCQ questions in stacked cards, submit button, result     |
| Sidebar | card/50 glass      | border/25           | Lesson list with step markers, completion checkmarks          |
| Cert Card | cert-milestone    | primary/30 → /60    | QR code preview, "Ready to Download" state, download button  |
| Footer  | secondary/40       | border/30 top       | Legal, studio info, premium spacing, WhatsApp link            |

## Spacing & Rhythm

Spacious 3–4rem gaps between sections; 1–2rem micro-spacing within cards. Lesson sidebar: 0.75rem gaps between items. Quiz questions: 1rem margin-bottom stacked. Breathing room communicates premium feel and learning clarity. 1.5rem padding inside card containers. Admin panels: 1rem inner spacing for live data lists.

## Component Patterns

- **Buttons**: Primary gold (`btn-primary-luxury`), secondary stroke (`btn-secondary-luxury`), tertiary text (`btn-tertiary-luxury`), teal secondary (`btn-teal-secondary`). Quiz "Next Lesson" button highlighted in gold with shadow-luxury.
- **Badges**: Step markers with icon + number; colors by state (muted pending, violet active with glow-pulse-violet, green completed). Completion checkmark animates on earn.
- **Glassmorphism**: Applied throughout — nav header, quiz sections, lesson sidebar with 12-16px blur, 40-60% opacity, 1px border with gold tint on hover.
- **Form Inputs**: `.input-luxury` styling for admin lesson editing (YouTube URL field, quiz builder). Focus ring primary color 2px, gold-tinted shadow on focus.
- **Modal States**: Quiz result modals slide-up (0.6s), pass state shows green with confetti animation opportunity, fail state shows retry button with smooth color transition.
- **Admin controls**: Add/Remove/Edit/Save buttons always visible, never auto-hide. Teal accent on secondary actions for easy scanning.

## Motion

- **Progress bar fill**: Width animates 0.6s cubic-bezier(0.23, 1, 0.32, 1) on lesson completion, glows brightly with enhanced saturated gold
- **Step marker transitions**: Active/completed state changes 0.4s smooth with enhanced shadow + color glow; active step uses glow-pulse-violet animation (40% opacity peak)
- **Quiz question selection**: Border color + background transitions 0.3s cubic-bezier when selected, hover state brightens 0.3s with violet glow
- **Lesson item hover**: Background brightens, left border lifts 0.3s smooth
- **Certificate earned**: Card glows in 0.4s cubic-bezier with glow-pulse-gold animation (65% opacity peak), shadow intensifies 0.2s on render
- **Admin panel refresh**: `.admin-panel-loading` glows with enhanced glow-pulse-gold animation (65% peak opacity), signaling live data sync every 5 seconds
- **Entrance animations**: Quiz section fade-in + slide-up 0.5s, step list staggered 80-130ms between items, video player scale-in 0.6s cubic-bezier(0.23, 1, 0.32, 1)
- **Decorative**: Bokeh orbs continue floating in background (32-42s duration with opacity animation), lesson sidebar scroll smooth, quiz submit spinner rotates 0.8s linear
- **Global transitions**: `--transition-smooth` (0.4s cubic-bezier(0.23, 1, 0.32, 1)) for premium feel; `--transition-base` (0.3s cubic-bezier(0.4, 0, 0.2, 1)) for UI feedback

## Constraints

- All colors use OKLCH tokens only; no hardcoded hex, rgb, or arbitrary Tailwind colors
- Enhanced color saturation: gold 0.168 chroma, violet 0.28, teal 0.22, coral 0.28, green 0.24-0.26
- Course progress tokens (progress-fill, step-active, step-completed, cert-milestone) respect light/dark theme via CSS variables
- Dark mode: foreground 0.96 0.008 72 (off-white) on background 0.11 0.014 244 (deep navy) = 16:1+ contrast ratio (WCAG AAA+)
- Light mode: foreground 0.10 0.024 270 (very dark charcoal) on background 0.974 0.008 72 (warm cream) = 16:1+ contrast ratio (WCAG AAA)
- Gold primary, violet, teal, and coral accents highly saturated and darkened for maximum contrast in both modes
- Playfair Display, Inter, JetBrains Mono exclusively; no system fonts
- Glassmorphism: glass-effect (24-28px blur, 78-97% opacity), glass-card (28px blur, 78-95% opacity) with enhanced saturation
- Framer Motion animations choreographed per page; entrance via scale-in keyframe, interactions via cubic-bezier(0.23, 1, 0.32, 1)
- Glow animations enhanced: glow-pulse-gold/violet peak at 65% opacity, casting 40-80px shadow radius for cinematic depth
- Course learning UI prioritizes progress psychology: completion state earned, milestones celebrated with bright glows, quiz feedback clear
- Video frame maintains 16:9 aspect ratio responsively; sidebar collapses to bottom on mobile (`md:` breakpoint)
- Theme toggle persists in localStorage; CSS variables in `:root`, `.light`, `.dark` blocks ensure instant switch with zero flicker
- Quiz progress: 10+ questions minimum, per-question validation, 60%+ pass score, retry option after fail
- Certificate state: Only appears after quiz passed AND full payment received; includes QR code for public verification at `/verify/{code}`
- All image placeholders must be hidden; empty states show clear fallback UI with descriptive text, no broken images or videos visible
- Input fields: enhanced border visibility (0.8 opacity dark, 0.9 light), focus ring primary color with 2px thickness, gold-tinted shadow on focus
- Shadow hierarchy: subtle (2-4px soft), elevated (8px + 32px dual), luxury (12-16px primary color tinted); all using OKLCH for consistent theme switching
- Admin panel: real-time data updates every 5 seconds with enhanced glow-pulse-gold animation indicating active connection; controls always visible
- Bokeh orbs: larger (400-500px), more vibrant (0.5 opacity base for dark, 0.05 for light), 32-42s float duration with staggered animations

## Signature Detail

Step-by-step visual progression storytelling — each lesson marked by a circular step indicator that fills with enhanced saturated violet as the student progresses, surrounded by a celestial dashboard backdrop with larger, more vibrant bokeh orbs in gold, violet, and teal. Completing a lesson animates the progress bar in saturated gold with enhanced glow (65% opacity peak), celebrates the milestone with bright glow-pulse-gold animation, and visually unlocks the next step with enhanced violet highlight and glow-pulse-violet animation, making learning feel like ascending through concentric rings of mastery. Admin panels display live data with pulsing enhanced gold glows every 5 seconds, creating the visual sensation of a real-time, responsive management ecosystem with cinematic luxury depth.
