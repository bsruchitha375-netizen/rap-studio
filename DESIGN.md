# Design Brief

## Direction

**RAP Integrated Studio Management** — A world-class luxury photography, videography, and short film studio platform with cinematic visual language, premium dark aesthetics, and step-by-step course learning infrastructure.

## Tone

Cinematic luxury with amplified contrast — rich saturated golds and violets, premium dark navy against warm cream in light mode, glassmorphism throughout, refined typography hierarchy, and shadow depth that communicates trust and craftsmanship. WCAG AA+ contrast on all text and interactive elements in both themes. Course learning UI emphasizes progress psychology and milestone celebration.

## Differentiation

Circular/orbital service layouts, carousel course galleries, and step-by-step learning flows create dynamic, celestial visual progression around the RAP logo — platforms feel like a curated creative ecosystem with clear mastery pathways, not a typical grid-based marketplace or generic LMS.

## Color Palette

| Token           | Dark OKLCH              | Light OKLCH             | Role                                        |
|-----------------|------------------------|------------------------|---------------------------------------------|
| background      | 0.07 0.01 270          | 0.975 0.006 80         | Deep navy (dark), warm cream (light)         |
| foreground      | 0.94 0.008 280         | 0.12 0.018 270         | Off-white text (dark), very dark navy (light)|
| card            | 0.12 0.014 275         | 0.995 0.003 80         | Elevated container, subtle lift              |
| primary         | 0.72 0.14 82           | 0.54 0.18 82           | Saturated gold accent, premium CTAs, progress|
| accent          | 0.68 0.2 290           | 0.52 0.20 290          | Vibrant violet, active lesson step           |
| success         | 0.65 0.18 150          | 0.50 0.19 150          | Green completion, passed quiz, earned cert   |
| progress-fill   | 0.72 0.14 82           | 0.54 0.18 82           | Course progress bar (gold gradient)          |
| step-active     | 0.68 0.2 290           | 0.52 0.2 290           | Current lesson step indicator (violet glow)  |
| step-completed  | 0.65 0.18 150          | 0.50 0.19 150          | Completed lessons (green check)              |
| video-frame     | 0.15 0.016 275         | 0.88 0.01 85           | YouTube embed container (dark card)          |
| quiz-section    | 0.12 0.014 275         | 0.95 0.003 80          | Quiz question container                      |
| cert-milestone  | 0.72 0.14 82           | 0.54 0.18 82           | Certificate ready/earned state (gold glow)   |

## Typography

- **Display**: Playfair Display — Editorial, cinematic, luxury; hero headlines (up to 8xl), section titles, certificate names. Tracking: -1px.
- **Body**: General Sans — Clean UI copy, lesson titles, quiz questions, button text. Letter-spacing: -0.3px.
- **Mono**: JetBrains Mono — Timestamps, score displays, certificate codes.

**Scale**: Hero `text-8xl font-bold`, H2 `text-5xl font-bold`, Lesson Title `text-2xl font-semibold`, Quiz Question `text-base`, Label `text-xs uppercase tracking-widest`.

## Learning Flow Components

- **Progress bar**: Gold gradient fill on dark track, animated smooth width transition (0.6s cubic-bezier), 8px height, subtle glow on fill (0.4 opacity shadow)
- **Step markers**: 2.5rem circles with border + background; pending (muted border), active (violet border + glow, 16px shadow), completed (green border + glow, 12px shadow). State transitions smooth via 0.4s cubic-bezier.
- **Video frame**: Glassmorphism container (0.15 0.016 275 bg), 1px border, 1rem radius, 16:9 aspect ratio, 8px+32px dual shadow for depth
- **Quiz questions**: 0.875rem border-radius cards, clickable with hover state (brighter bg, primary border), selected state shows violet glow (0.15 opacity) with primary 0.5 opacity border
- **Lesson sidebar**: `.lesson-item` flex layout, left 3px border indicator (pending/active/completed color states), hover brightens bg + lifts border color
- **Certificate card**: `.cert-milestone` with 2px gold border, earned state shows 12px shadow + enhanced border opacity for celebration effect
- **Quiz results**: Pass shows green bg/border/text (0.1 opacity background), fail shows red. Both 1rem padding, full width, center text.

## Elevation & Depth

Five-layer depth model: background → muted cards (0.35 opacity) → elevated cards with glass-effect (0.45 opacity) → premium shadow layers → floating CTAs. Video frames get dual shadows (8px soft + 32px deep). Quiz questions lift on selection. Course progress bar glows on interaction.

## Structural Zones

| Zone    | Background           | Border              | Notes                                                          |
|---------|---------------------|-------------------|--------------------------------------------------------------|
| Header  | card/60 glass-effect | border/30 bottom    | Fixed nav, RAP logo, progress bar at top, theme toggle        |
| Hero    | background gradient  | none                | Full-screen cinematic hero for course platform                |
| Lesson View | background       | none                | 70% video+quiz center, 30% lesson sidebar right (responsive)  |
| Video Player | video-frame card | border/40           | Embedded YouTube, full responsive, 16:9 ratio                |
| Quiz Area | quiz-section card  | border/30           | 10+ MCQ questions in stacked cards, submit button, result     |
| Sidebar | card/50 glass      | border/25           | Lesson list with step markers, completion checkmarks          |
| Cert Card | cert-milestone    | primary/30 → /60    | QR code preview, "Ready to Download" state, download button  |
| Footer  | secondary/40       | border/30 top       | Legal, studio info, premium spacing, WhatsApp link            |

## Spacing & Rhythm

Spacious 3–4rem gaps between sections; 1–2rem micro-spacing within cards. Lesson sidebar: 0.75rem gaps between items. Quiz questions: 1rem margin-bottom stacked. Breathing room communicates premium feel and learning clarity. 1.5rem padding inside card containers.

## Component Patterns

- **Buttons**: Primary gold (`btn-primary-luxury`), secondary stroke (`btn-secondary-luxury`), tertiary text (`btn-tertiary-luxury`). Quiz "Next Lesson" button highlighted in gold with shadow-luxury.
- **Badges**: Step markers with icon + number; colors by state (muted pending, violet active, green completed). Completion checkmark animates on earn.
- **Glassmorphism**: Applied throughout — nav header, quiz sections, lesson sidebar with 12-16px blur, 40-60% opacity, 1px border with gold tint on hover.
- **Form Inputs**: `.input-luxury` styling for admin lesson editing (YouTube URL field, quiz builder). Focus ring primary color 2px, gold-tinted shadow on focus.
- **Modal States**: Quiz result modals slide-up (0.6s), pass state shows green with confetti animation opportunity, fail state shows retry button with smooth color transition.

## Motion

- **Progress bar fill**: Width animates 0.6s cubic-bezier(0.23, 1, 0.32, 1) on lesson completion, glows softly during animation
- **Step marker transitions**: Active/completed state changes 0.4s smooth with shadow + color glow
- **Quiz question selection**: Border color + background transitions 0.3s cubic-bezier when selected, hover state brightens 0.3s
- **Lesson item hover**: Background brightens, left border lifts 0.3s smooth
- **Certificate earned**: Card glows in 0.4s cubic-bezier, shadow intensifies 0.2s on render
- **Entrance animations**: Quiz section fade-in + slide-up 0.5s, step list staggered 80-100ms between items, video player scale-in 0.6s cubic-bezier(0.23, 1, 0.32, 1)
- **Decorative**: Bokeh orbs continue floating in background (25-35s duration), lesson sidebar scroll smooth, quiz submit spinner rotates 0.8s linear
- **Global transitions**: `--transition-smooth` (0.4s cubic-bezier(0.23, 1, 0.32, 1)) for premium feel; `--transition-base` (0.3s cubic-bezier(0.4, 0, 0.2, 1)) for UI feedback

## Constraints

- All colors use OKLCH tokens only; no hardcoded hex or rgb values anywhere
- Course progress tokens (progress-fill, step-active, step-completed, cert-milestone) respect light/dark theme via CSS variables
- Light mode: foreground 0.12 0.018 270 (very dark navy) on background 0.975 0.006 80 (warm cream) = 13:1 contrast ratio (WCAG AAA)
- Dark mode: foreground 0.94 0.008 280 (off-white) on background 0.07 0.01 270 (deep navy) = 16:1 contrast ratio (WCAG AAA)
- Gold primary and violet accent saturated and darkened for high contrast in both modes
- Playfair Display, General Sans, JetBrains Mono exclusively; no system fonts
- Glassmorphism: glass-effect (12px blur, 45% opacity) or glass-effect-subtle (8px blur, 35% opacity)
- Framer Motion animations choreographed per page; entrance via scale-in keyframe, hover via cubic-bezier(0.23, 1, 0.32, 1)
- Course learning UI prioritizes progress psychology: completion state should feel earned, milestones should feel celebrated, quiz feedback should be clear
- Video frame maintains 16:9 aspect ratio responsively; sidebar collapses to bottom on mobile (`md:` breakpoint)
- Theme toggle persists in localStorage; CSS variables in `:root`, `.light`, `.dark` blocks ensure instant switch
- Quiz progress: 10+ questions minimum, per-question validation, score calculation, pass/fail determination with retry option
- Certificate state: Only appears after quiz passed AND full payment received; includes QR code for public verification at `/verify/{code}`

## Signature Detail

Step-by-step visual progression storytelling — each lesson marked by a circular step indicator that fills with color as the student progresses, surrounded by a celestial dashboard backdrop. Completing a lesson animates the progress bar in gold, celebrates the milestone with subtle glow effects, and visually unlocks the next step with a violet highlight, making learning feel like ascending through concentric rings of mastery rather than grinding through a list of content.
