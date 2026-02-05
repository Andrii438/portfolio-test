# Project Context: Portfolio Website — Valeriia Kozinna

## Overview
Portfolio website for a graphic designer (Valeriia Kozinna). Features four sections: Hero, About Me, Projects, and Contact. Includes EN/PL language switching. The hero section has a JS-positioned red "pillar" that acts as structural separation between text elements.

## Files

### Core Website Files (committed to git)
- `index.html` — HTML structure (all 4 sections + lightbox)
- `styles.css` — All styles (responsive, uses clamp/vw/% throughout)
- `script.js` — Hero layout positioning + language switching + nav/filter/lightbox interactivity

### Asset Structure
```
asset/
├── about-me.png — Photo for About Me section
├── logos/ — Logo project images (7 total)
│   ├── coffeina.png
│   ├── francy.png — Francy logo (formerly Frame 496 (1).png)
│   ├── frame-496.png — Logo design (formerly Frame 496.png)
│   ├── golden-peacock.png
│   ├── krolowa.png
│   ├── la-pasta.jpg
│   └── sokol.jpg
├── illustrations/ — Organized by project theme (3 projects)
│   ├── jungle-explorer/
│   │   ├── illustration.png — Standalone artwork
│   │   └── book-mockup.png — Book context mockup
│   ├── farm-boy/
│   │   ├── illustration.png
│   │   └── book-mockup.png
│   └── cosmic-journey/
│       ├── illustration.png
│       └── book-mockup.png
├── social-media/ — Social media design projects (4 files)
│   ├── instalift.png — Instalift social media design
│   ├── instalift-mockup.png — Instalift mockup
│   ├── bus-station.jpg — Bus station advertisement (bottle in context)
│   └── bottle-design.jpg — Bottle product design
└── print-ads/ — Print advertising projects (8 files, subcategorized)
    ├── francy-bag.png — Francy bag design [branding]
    ├── francy-label.png — Francy label design [branding]
    ├── francy-mockup.png — Francy brand mockup [branding]
    ├── poster.jpg — Poster design [posters]
    ├── poster-cinema.jpg — Cinema poster design [posters]
    ├── menu-la-pasta.png — La Pasta menu design [materials]
    ├── certificate.png — Certificate design [materials]
    └── price-manicure-pedicure.png — Price list design [materials]
```

### Dev/Test Files (NOT committed)
- `verify.js` — Puppeteer-based automated layout tests for hero (5 viewports)
- `screenshot.js` — Takes screenshots for visual comparison
- `design-specs/` — Figma reference images
- `node_modules/`, `package.json`, `package-lock.json` — Node dependencies

## Git Repository
- Remote: https://github.com/Andrii438/portfolio-test
- Branch: main
- Committed files: `index.html`, `styles.css`, `script.js`, `asset/**/*`

## Sections

### 1. Header & Hero Section

**Header:**
- Fixed position, z-index: 100, background: #E8E8E8
- Logo: "Valeriia Kozinna" (font-weight 900, letter-spacing: -0.02em)
- Nav links with animated underline on hover/active
- Language switcher: ENG | PL buttons with underline animation
- Mobile: Logo centered, hamburger menu (animated X transformation)

**Hero:**
- Red pillar positioned by JS based on text bounding box measurements
- Quote: "Design is not decoration. It's a way to organize meaning."
- Headline: "GRAPHIC DESIGN & ILLUSTRATION"
- Author credit bottom-right, ink-aligned with headline baseline
- Decorative red square top-right (12.5vw × 12.5vw)
- Mobile: Simplified layout, red block behind DESIGN word only

**Hero JS Algorithm (script.js → positionLayout):**
1. Mobile (≤768px): Positions red block behind DESIGN word only
2. Desktop: Equalizes inside-span widths for grid column alignment
3. Horizontal position: quoteLeft = (DESIGN_text_right + 4vw_overhang) - maxInsideWidth
4. Vertical position: headlineTop - 100px_gap - quoteHeight
5. Collision check: pushes quote up if overlapping headline
6. Draws red pillar: left=DESIGN.left, right=max(designIs.right, itsAWay.right), top=quote.top-8vh, bottom=DESIGN.bottom
7. Author ink-aligned with "& ILLUSTRATION" baseline

### 2. About Me Section
**Desktop Layout (CSS Grid):**
- Grid areas: `"image headline" / "image text"`
- Left column (42%): red upper block (70% width, bleeds left), photo (aspect-ratio 858/785), red lower quarter-circle
- Headline overlaps into left column via `margin-left: -10vw`
- Body text with red highlights, `margin-top: 12vw`

**Mobile Layout (CSS Grid):**
- Grid areas stacked: `"headline" / "image" / "text"`
- Headline at TOP, RIGHT-aligned (`justify-self: end`)
- Photo centered below headline
- Description text centered below photo

### 3. Projects Section
- "PROJECTS" headline (same style as other sections)
- Filter buttons: Logos, Illustrations, Social media, Print ads (with active state)
- Sticky filter bar appears when original filters scroll past header
- **Sub-filters for Print ads**: All, Branding, Posters, Materials (pill-shaped, appears only when Print ads active)
- 2-column grid of project cards (1-column on mobile)
- Each card has hover effect (lift + shadow)
- "more" button opens lightbox
- "See more projects" button at bottom
- Lazy-loaded images with fade-in animation
- Clicking any filter/sub-filter scrolls to the filter bar (not the section heading)

**Project Card Data Attributes:**
- `data-category` — Filter category (logos, illustrations, social-media, print-ads)
- `data-subcategory` — Sub-filter for print-ads (branding, posters, materials)
- `data-images` — JSON array for lightbox gallery: `[{src, label, alt}, ...]`

**Filtering Behavior:**
- Default filter: "logos"
- Initial display limit: 6 cards (desktop), 3 cards (mobile)
- "See more projects" button shows all cards in category
- Hidden cards use `.projects__card--hidden` class
- Both inline and sticky filter bars stay synchronized
- Sub-filter resets to "all" when switching main categories

**Card Styling:**
- Aspect ratio: 4/3
- Background placeholder: #D9D9D9
- "more" button: #E07A7A background, turns #FF0000 on hover
- Poster cards use `object-fit: contain` (`.projects__card-image--contain`) to show full image

**Cross-category Lightbox:**
- Francy logo card (logos) includes print-ads materials in lightbox (Bag, Label, Mockup tabs)
- Bottle design + bus station (social-media) grouped as one lightbox project (Design / In Context)

### 4. Contact Section
- Full viewport height (min-height: 100vh), flex centered vertically
- "CONTACT" headline centered
- Two-column layout (stacks on mobile):
  - **Left: Red card** — bleeds to left edge, contains name + phone
  - **Right: Social links** — Email, Facebook, Telegram with SVG icons
- All external links have `rel="noopener noreferrer"` and `aria-label`

### 5. Lightbox
- Full-screen overlay (rgba(0,0,0,0.95)) for viewing project images
- Navigation: prev/next buttons, keyboard arrows, touch swipe gestures
- Tab buttons for multi-image projects (Artwork / In Context)
- Counter showing current position: "1 / 7 • 1/2"
- Closes on: X button, Escape key, clicking backdrop
- **Keyboard controls**: Left/Right arrows = prev/next project, Up/Down = prev/next image in project
- **Touch gestures**: Horizontal swipe = prev/next project, Vertical swipe = prev/next image
- **Image preloading**: Preloads all images in current project + first image of adjacent projects

## CSS Architecture

### Design Tokens
```css
--color-red: #FF0000
--color-black: #000000
--color-white: #FFFFFF
--color-bg: #F5F5F5
--color-red-hover: #F96161
--color-header-bg: #E8E8E8
--font-family: 'Inter', sans-serif
```

### Responsive Strategy
- All layout uses relative units: vw, vh, %, clamp()
- Section padding: `padding: Xvh 3.125vw` (20px on mobile)
- Font sizes: `clamp(min, preferred, max)`
- Section headlines: `clamp(50px, 8.5vw, 160px)`, weight 900, letter-spacing 0.03em
- Smooth scrolling enabled: `scroll-behavior: smooth`

### Media Queries
- `@media (max-width: 1023px)`: Tablet adjustments (header, hero red square)
- `@media (max-width: 768px)`: Mobile layout (hamburger menu, stacked sections)
- `@media print`: Print styles (hides UI, shows all projects)

### Accessibility Features
- Skip-to-content link (`.skip-link`) — hidden until focused
- Focus-visible states (2px red outline) on all interactive elements
- ARIA labels on buttons, links, and lightbox
- `aria-hidden="true"` on decorative SVG icons
- Language switcher uses `<button>` elements with aria-labels
- Lightbox has `role="dialog"` and `aria-modal="true"`

### Animations & Transitions
- **Nav links**: Underline slides in via `transform: scaleX()` with `cubic-bezier(0.16, 1, 0.3, 1)`
- **Language switcher**: Same underline animation as nav links
- **Hero red block**: Fades in with `.hero__red-block--ready` class (0.5s cubic-bezier)
- **Project cards**: Lift up 4px + shadow on hover (`transform: translateY(-4px)`)
- **Card images**: Scale to 1.05x on hover
- **Lazy images**: Fade in when loaded (opacity 0 → 1)
- **Hamburger menu**: Transforms to X when active (rotate spans)
- **Mobile menu**: Full-screen overlay slides in
- **Sticky filters**: Slide down with opacity transition

## JavaScript (script.js)

### Utility Functions
- `debounce(func, wait)` — Prevents excessive function calls on resize

### Core Functions
- `positionLayout()` — Measures hero text, positions quote + red pillar + author (debounced on resize)
- `setLanguage(lang)` — Updates all text for EN/PL, toggles PL-specific CSS classes
- `setActiveNavLink(clickedLink)` — Manages nav active state on click
- `initNavActiveState()` — Click + scroll-based nav active state
- `filterProjects()` — Applies current filter + sub-filter, respects display limits
- `scrollToProjects()` — Scrolls viewport to the filter bar on category/sub-filter change
- `initProjectFilters()` — Category + sub-category filter button toggling
- `initStickyFilters()` — Shows/hides sticky filter bar based on scroll
- `initLanguageSwitcher()` — ENG/PL click handlers
- `initMobileMenu()` — Hamburger menu toggle, closes menu on link click
- `initLightbox()` — Project image viewer with navigation
- `initLoadMore()` — "See more projects" functionality
- `initImageLoading()` — Adds fade-in effect to lazy-loaded images

### Translations Object
Both `en` and `pl` keys with:
- `nav` — 3 nav link labels
- `role` — Author role text
- `quoteLine1Inside/Outside`, `quoteLine2Inside/Outside` — Hero quote spans
- `graphic`, `design`, `illustration` — Hero headline words
- `aboutHeadline`, `aboutBody1`, `aboutBody2` — About section text
- `projectsHeadline`, `projectsFilters`, `projectsSeeMore`, `projectsSeeLess`, `projectsCardMore`
- `projectsSubFilters` — Print ads sub-filter labels (All, Branding, Posters, Materials)
- `contactHeadline`

### Initialization Order
Runs on `document.fonts.ready` (fallback: window load):
1. positionLayout()
2. initLanguageSwitcher()
3. initNavActiveState()
4. initProjectFilters()
5. initStickyFilters()
6. initMobileMenu()
7. initLightbox()
8. initLoadMore()
9. initImageLoading()

## SEO & Performance

### Meta Tags
```html
<meta name="description" content="Portfolio of Valeriia Kozinna...">
<meta name="author" content="Valeriia Kozinna">
<meta property="og:title" content="Valeriia Kozinna — Graphic Designer & Illustrator">
<meta property="og:description" content="Portfolio showcasing...">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
```

### Performance Optimizations
- **Font preloading**: `<link rel="preload" ... as="style">` for Google Fonts
- **Font preconnect**: `preconnect` to fonts.googleapis.com and fonts.gstatic.com
- **Lazy loading**: All project images use `loading="lazy"`
- **Debounced resize**: `positionLayout()` debounced at 100ms
- **Scroll listeners**: Use `{ passive: true }` for better scroll performance
- **Image preloading in lightbox**: Adjacent projects preloaded for instant navigation

## Hero verify.js Checks (12 total)
1. DESIGN fully inside red block
2. Red block not narrower than DESIGN
3. GRAPHIC strictly left of red block
4. "Design is" inside red block horizontally
5. "It's a way" inside red block horizontally
6. "not decoration." right of red block
7. "to organize meaning." right of red block
8. Vertical gap quote-to-headline >= 70px
9. Gutter between red block right and "not" left: 5-15px
10. Outside spans left-edge alignment: max 2px drift
11. Inside spans right-edge alignment: max 1px drift
12. Pillar ratio H/W (informational)

## Important Notes
- The headline is NOT a grid — uses standard block/inline-block layout
- `#span-design-text` is an inner span inside `#span-design` for accurate DESIGN width measurement
- Polish text uses smaller font classes: `.hero__headline--pl`, `.hero__quote--pl`
- About section headline is OUTSIDE `.about__text-col` in HTML for mobile positioning
- Project images use `loading="lazy"` for performance
- External edits have repeatedly reverted changes — always read files before editing

## How to Continue
1. Read core files: `index.html`, `styles.css`, `script.js`
2. Run `node verify.js` to confirm hero layout
3. Run `node screenshot.js` for visual baseline
4. Test mobile at 430px width, desktop at 1440px

## Recent Changes Log
- **Social media & print ads added**: New project categories with cards, images, and lightbox support
- **Print ads sub-filters**: Branding / Posters / Materials pill-shaped sub-filter bar (EN/PL)
- **Asset reorganization**: Cleaned all filenames to kebab-case, removed Figma artifacts (Frame 496 → francy.png), removed unused files (me_1.jpg, francy.png design duplicate)
- **Cross-category lightbox**: Francy logo card links to print-ads materials; bottle + bus station grouped
- **Filter scroll behavior**: Clicking category/sub-filter scrolls to filter bar, not section top
- **Poster card fit**: Uses `object-fit: contain` to show full poster without cropping
- **Illustrations reorganized**: Moved from flat files to themed folders (jungle-explorer, farm-boy, cosmic-journey)
- **Accessibility improvements**: Focus states, skip link, ARIA attributes, semantic buttons
- **SEO enhancements**: Meta tags, Open Graph, font preloading
- **Performance**: Debounced resize handler, lazy image loading with fade-in
- **Mobile About Me fix**: Headline moved to top, right-aligned using CSS Grid
- **Security**: Added `rel="noopener noreferrer"` to external links
- **Print styles**: Added for portfolio printing
