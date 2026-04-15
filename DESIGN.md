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
| muted           | 0.22 0.025 280    | Disabled, low-priority text           |
| destructive     | 0.58 0.22 25      | Alerts, errors (muted warm red)       |
| border          | 0.3 0.02 280      | Subtle dividers, control outlines     |

## Typography

- **Display**: Fraunces — Editorial, luxury, cinematic; used for hero headlines, section titles, premium visual statements
- **Body**: General Sans — Clean, professional, readable; all UI copy, labels, button text
- **Mono**: JetBrains Mono — Code, timestamps, technical details

**Scale**: Hero `text-7xl font-bold tracking-tight`, H2 `text-5xl font-bold`, Labels `text-sm uppercase tracking-widest text-primary`, Body `text-base text-foreground`

## Elevation & Depth

Four-layer depth model: background (deepest) → muted cards → elevated cards with glass effect → floating CTAs. Premium shadows (`shadow-luxury`, `shadow-elevated`) create visual hierarchy; no flat surfaces except lowest layer.

## Structural Zones

| Zone    | Background           | Border              | Notes                                                          |
|---------|---------------------|-------------------|--------------------------------------------------------------|
| Header  | card/60 glass-effect | border/30 bottom    | Fixed or sticky nav, logo + WhatsApp CTA right-aligned        |
| Hero    | background gradient  | none                | Full-screen cinematic, animated shutter/film reel, CTA button |
| Content | alternating sections | section dividers    | bg-background main, bg-card/30 for alternate sections         |
| Orbits  | background gradient  | none                | Circular service/course layouts, planets orbit central logo   |
| Footer  | secondary/40         | border/30 top       | Legal, studio info, premium spacing, contact WhatsApp link    |

## Spacing & Rhythm

Spacious 3–4rem gaps between sections; 1–2rem micro-spacing within cards. Breathing room communicates luxury; no cramped density. Consistent 1.5rem padding inside cards.

## Component Patterns

- **Buttons**: Gold fill primary (`btn-primary-luxury`) with hover scale effect; secondary stroke variant (`btn-secondary-luxury`)
- **Cards**: Rounded-xl, `glass-effect` class, border fade, hover brightness lift
- **Badges**: Inline gold text on dark muted background, small rounded caps

## Motion

- **Entrance**: Page fade-in 0.5s, staggered section slide-up 0.6s on scroll (Framer Motion)
- **Hover**: Cards brighten, buttons scale 1.05, text glows on gold accents
- **Decorative**: Continuous float animation on hero elements (3s), orbital spin on service circles (20s linear)

## Constraints

- All colors use OKLCH tokens only; no hex or rgb literals in components
- Fraunces and General Sans exclusively; no system fonts in production
- Gold primary token drives all CTAs and premium UI highlights
- Circular layouts for services (planet orbit) and courses (rotating carousel) — no fixed grids
- Glass morphism effects use `glass-effect` utility for consistency
- Framer Motion animations choreographed per page, not scattered

## Signature Detail

Celestial orbital UI — services and courses arranged in circular formations around RAP logo, with smooth rotation animations and planet-scale visual metaphors, making the studio feel like a curated creative ecosystem rather than a commodity marketplace.
