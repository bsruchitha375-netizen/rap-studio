# Design Brief

## Direction

**RAP Integrated Studio Management** — A world-class luxury photography, videography, and short film studio platform with cinematic visual language and premium dark aesthetics.

## Tone

Refined maximalism meets brutalist clarity — bold gold accents against deep navy, editorial typography hierarchy, premium shadows and glass effects that communicate trust and craftsmanship without excess.

## Differentiation

Circular/orbital service layouts and carousel course galleries create dynamic, celestial visual flow around the RAP logo — platforms feel like a studio ecosystem, not a typical grid-based marketplace.

## Color Palette

| Token           | OKLCH              | Role                                  |
|-----------------|-------------------|---------------------------------------|
| background      | 0.12 0.015 280    | Deep navy-black, primary surface      |
| foreground      | 0.94 0.008 280    | Off-white text, maximum readability   |
| card            | 0.165 0.018 280   | Elevated container, subtle lift       |
| primary         | 0.7 0.22 70       | Gold accent, CTAs, premium highlights |
| secondary       | 0.22 0.025 280    | Darker cards, secondary containers    |
| accent          | 0.68 0.2 290      | Deep purple, interactive states       |
| success         | 0.65 0.18 150     | Green confirmation, booking success   |
| muted           | 0.22 0.025 280    | Disabled, low-priority text           |
| destructive     | 0.58 0.22 25      | Alerts, errors (muted warm red)       |
| border          | 0.3 0.02 280      | Subtle dividers, control outlines     |

## Typography

- **Display**: Playfair Display — Editorial, cinematic, luxury; used for hero headlines (up to 8xl on desktop), section titles, premium visual statements. Tracking: -1px for impact.
- **Body**: General Sans — Clean, professional, readable; all UI copy, labels, button text, descriptions. Letter-spacing: -0.3px for optical refinement.
- **Mono**: JetBrains Mono — Code, timestamps, technical details, data displays.

**Scale**: Hero `text-8xl font-bold`, H2 `text-5xl font-bold`, H3 `text-3xl font-semibold`, Labels `text-xs uppercase tracking-widest`, Body `text-base text-foreground`

## Elevation & Depth

Five-layer depth model with refined luxury shadows: background (deepest) → muted cards (0.35 opacity) → elevated cards with glass-effect (0.45 opacity) → premium shadow layers → floating CTAs. Luxury shadows layered (dual box-shadow) create dimensional depth; `shadow-glow-gold` adds premium light interaction on hover.

## Structural Zones

| Zone    | Background           | Border              | Notes                                                          |
|---------|---------------------|-------------------|--------------------------------------------------------------|
| Header  | card/60 glass-effect | border/30 bottom    | Fixed or sticky nav, logo + WhatsApp CTA right-aligned        |
| Hero    | background gradient  | none                | Full-screen cinematic, animated shutter/film reel, CTA button |
| Content | alternating sections | section dividers    | bg-background main, bg-card/30 for alternate sections         |
| Login Panels | Glass-effect + bokeh orbs | Primary divider (gold gradient) | Desktop: side-by-side 50% width each; mobile: tab toggle; bokeh orbs (300–400px) float in background |
| Booking Form | card-luxury semi-transparent | border-border | Multi-service checkboxes, real-time total, Stripe button     |
| Orbits  | background gradient  | none                | Circular service/course layouts, planets orbit central logo   |
| Footer  | secondary/40         | border/30 top       | Legal, studio info, premium spacing, contact WhatsApp link    |

## Spacing & Rhythm

Spacious 3–4rem gaps between sections; 1–2rem micro-spacing within cards. Breathing room communicates luxury; no cramped density. Consistent 1.5rem padding inside cards.

## Component Patterns

- **Buttons**: Gold fill primary (`btn-primary-luxury`) with dual-layer shadow (4px soft + 12px deep); secondary stroke (`btn-secondary-luxury`) with gold border on hover; tertiary text-only (`btn-tertiary-luxury`)
- **Cards**: Rounded-2xl, `glass-effect` (45% opacity) or `glass-effect-subtle` (35% opacity), refined border; hover brightens to 55% opacity with enhanced border
- **Badges**: Inline gold text on dark muted background, small rounded caps, opacity-90 for refinement
- **Login Panels**: `login-panel` with glass-morphism; left "New Registration" (signup), right "Already Registered" (login); gold vertical divider (gradient 30–40% opacity) center; mobile tabs with active gold underline; bokeh orbs animate continuously
- **Role Badges**: `.role-badge` with icon prefix; Admin (purple-gold), Client (gold), Staff (teal), Student (blue); active state shows colored border and glow
- **Form Inputs**: `.input-luxury` with black text forced (#000), white background, left icon positioning; focus ring primary color 2px; focus shadow gold-tinted; password strength bars animate from weak→strong
- **Form Fields**: Staggered slide-up entrance (100ms per field) with scale-up + opacity; smooth 0.3–0.4s cubic-bezier transitions
- **Booking Form**: Multi-service checkboxes with labels, real-time total amount display, distinct Stripe checkout CTA with `btn-stripe` blue

## Motion

- **Entrance**: Login card fade-in (500ms), staggered form fields slide-up + scale-in (100ms between each, 600ms per field)
- **Hover**: Buttons scale 1.05 with shadow-luxury (0.4s cubic-bezier); badges brighten with border glow; cards brighten background and strengthen border
- **Form Interactions**: Input focus ring smooth 0.3s base, focus shadow gold glow (0.15 opacity); password strength bars animate color on type; show/hide icon toggles smoothly
- **Notifications**: Toast notifications (success/error) slide-up + fade-in 0.5s, auto-dismiss 4s fade-out 0.3s
- **Decorative**: Bokeh orbs float continuously (25–35s duration, ease-in-out curves) independently; spinners rotate 0.8s linear on form submit
- **Transitions**: Global `--transition-smooth` (0.4s cubic-bezier(0.23, 1, 0.32, 1)) for premium feel; `--transition-base` (0.3s cubic-bezier(0.4, 0, 0.2, 1)) for UI feedback

## Constraints

- All colors use OKLCH tokens only; no hex or rgb literals in components except form inputs (#000/#ffffff for accessibility)
- Playfair Display (headings), General Sans (body), JetBrains Mono (technical) exclusively; no system fonts in production
- Gold primary token (`--gradient-gold` with multi-stop gradient) drives all CTAs and premium highlights; Stripe button is distinct blue
- Glass morphism effects use `glass-effect` (12px blur, 45% opacity) or `glass-effect-subtle` (8px blur, 35% opacity) for consistency
- Framer Motion animations choreographed per page; entrance transitions use `scale-in` keyframe, hover uses `cubic-bezier(0.23, 1, 0.32, 1)`
- **Form field visibility**: Input text forced to black (#000000) on white (#ffffff) background; placeholder gray (#6b7280); autofill overlay suppressed
- **Login panel layout**: Desktop side-by-side (50% width + gold gradient divider + 50% width); mobile tab toggle with active tab underlined in primary gold
- **Role-based colors**: Admin uses purple-gold gradient; Client, Staff, Student show distinct color coding in badge selectors
- **Bokeh background**: Three floating orbs (400px, 300px, 350px) with 60px blur, 0.1–0.3 opacity, animate independently (25–35s duration)
- **Premium shadows**: Dual-layer shadows throughout — soft layer (8px, 0.35 opacity) + deep layer (16–24px, 0.25–0.3 opacity) for dimensional effect
- **Multi-service booking**: Real-time amount recalculation on service selection and hours chosen; Stripe payment requires ₹2 deposit upfront, remainder after completion
- **Notifications**: All booking, payment, progress confirmations sent to both email and WhatsApp simultaneously

## Signature Detail

Celestial orbital UI — services and courses arranged in circular formations around RAP logo, with smooth rotation animations and planet-scale visual metaphors, making the studio feel like a curated creative ecosystem rather than a commodity marketplace.
