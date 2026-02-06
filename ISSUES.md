# UX/UI Audit Issues

Audit date: 2026-02-05

---

## Critical

### C1. Lightbox has no focus trap despite `aria-modal="true"`
- **Files:** `script.js:524-710`, `index.html:283`
- **Problem:** The lightbox declares `role="dialog"` and `aria-modal="true"`, but Tab key sends focus to elements behind the overlay. Focus doesn't move to the lightbox on open or return to the trigger on close.
- **Impact:** Breaks keyboard navigation. Violates WCAG 2.1 SC 2.4.3.
- **Fix:** Added `getFocusableElements()` + `trapFocus()` helpers, Tab key interception in keydown listener, focus-to-close-button on open, focus-restore-to-trigger on close.
- **Status:** Fixed

### C2. `<html lang="en">` never updates on language switch
- **Files:** `script.js:213-314`
- **Problem:** `setLanguage()` updates all visible text to Polish but never changes the document's `lang` attribute. Screen readers announce Polish text with English pronunciation.
- **Impact:** Polish content unintelligible via screen reader. Violates WCAG 2.1 SC 3.1.1.
- **Fix:** Added `document.documentElement.lang = lang;` at top of `setLanguage()`.
- **Status:** Fixed

### C3. 768px portrait tablet — massive hero dead space
- **Files:** `styles.css:964-965`, `styles.css:1067-1075`
- **Problem:** On 768x1024 (iPad), the hero `min-height: calc(100vh - 48px)` = ~976px but content fills ~550px. `margin-top: auto` on the author creates ~400px of empty whitespace.
- **Impact:** Looks broken on one of the most common tablet resolutions.
- **Fix:** Changed author `margin-top: auto` to `margin-top: 30px` so it sits directly below the headline (matching Figma design). Hero keeps full-viewport `min-height: calc(100vh - 48px)` — the dead space was caused by `auto` pushing the author to the bottom, not by the height itself.
- **Status:** Fixed

---

## Major

### M1. Touch targets below 44px minimum
- **Files:** `styles.css` (multiple locations)
- **Problem:** Several interactive elements have touch targets well below the 44x44px WCAG minimum.
- **Impact:** Frustrating taps on touch devices. Fails WCAG 2.5.8.
- **Fix:** Increased padding on hamburger (4px→10px), lang buttons (0→8px 4px), mobile filters (`min-height: 44px`), mobile subfilters (`min-height: 44px`), mobile "more" button (0.5em→0.7em vertical).
- **Status:** Fixed

### M2. "more" button fails color contrast
- **Files:** `styles.css:557`
- **Problem:** White (#FFF) on #E07A7A has ~2.9:1 contrast. Fails WCAG AA.
- **Impact:** Hard to read in bright environments.
- **Fix:** Changed background from `#E07A7A` to `#CC0000` (5.9:1 contrast ratio, passes AA).
- **Status:** Fixed

### M3. Inactive language switcher fails contrast
- **Files:** `styles.css:168`
- **Problem:** `color: #757575` on header `#E8E8E8` yields ~3.8:1 contrast. Fails WCAG AA for normal text.
- **Fix:** Changed inactive color from `#757575` to `#636363` (4.9:1 ratio, passes AA). Also updated separator color.
- **Status:** Fixed

### M4. Lightbox doesn't fade in — it pops
- **Files:** `styles.css:706-724`
- **Problem:** `display: none` → `display: flex` prevents CSS opacity transition from animating.
- **Impact:** Jarring transition for a designer's portfolio.
- **Fix:** Replaced `display:none/flex` toggle with `visibility:hidden/visible` + `pointer-events:none/auto`. Lightbox now fades in smoothly.
- **Status:** Fixed

### M5. No `<main>` landmark element
- **Files:** `index.html`
- **Problem:** Page sections not wrapped in `<main>`. Skip link went to `#about`.
- **Impact:** Screen reader users lose landmark navigation. Violates WCAG 1.3.1.
- **Fix:** Wrapped all sections (hero through contact) in `<main id="main-content">`. Updated skip link to target `#main-content`.
- **Status:** Fixed

### M6. Single-image cards show nothing "more"
- **Files:** `index.html:127-170`, `styles.css`
- **Problem:** 5 of 7 logo cards have no `data-images`. "more" button opens lightbox with the identical image.
- **Impact:** "more" button promises additional content but delivers none.
- **Fix:** Added CSS rule `.projects__card:not([data-images]) .projects__card-more { display: none; }`. Image area remains clickable for full-screen view.
- **Status:** Fixed

### M7. About Me body text has `line-height: 1`
- **Files:** `styles.css:401`
- **Problem:** `line-height: 1` at `font-weight: 900` causes descenders to collide with next line's ascenders.
- **Impact:** Reduced readability.
- **Fix:** Changed `line-height` from `1` to `1.3`.
- **Status:** Fixed

### M8. Lightbox ignores active sub-filter
- **Files:** `script.js:566`
- **Problem:** `updateProjectList()` queries by `data-category` only, ignoring subcategory.
- **Impact:** Confusing disconnect between grid and lightbox when sub-filter is active.
- **Fix:** Added subcategory check in `updateProjectList()` that skips cards not matching `currentSubFilter`.
- **Status:** Fixed

---

## Minor

### m1. Scroll listener missing `{ passive: true }`
- **Files:** `script.js:352`
- **Problem:** `initNavActiveState` scroll listener lacks `{ passive: true }`, unlike `initStickyFilters` (line 489).
- **Fix:** Added `{ passive: true }` to scroll listener.
- **Status:** Fixed

### m2. No `prefers-reduced-motion` support
- **Files:** `styles.css` (global)
- **Problem:** No `@media (prefers-reduced-motion: reduce)` query. All animations play regardless of user OS settings. Violates WCAG 2.3.3.
- **Fix:** Added `@media (prefers-reduced-motion: reduce)` that sets all transition/animation durations to near-zero and disables smooth scrolling.
- **Status:** Fixed

### m3. Lightbox wraps around silently
- **Files:** `script.js:634-646`
- **Problem:** At the last project "next" wraps to first; at first "prev" wraps to last. No visual cue signals the boundary.
- **Fix:** Prev/next buttons now hide at boundaries. Navigation stops instead of wrapping.
- **Status:** Fixed

### m4. Failed lazy images remain invisible forever
- **Files:** `styles.css:528-529`, `script.js:713-724`
- **Problem:** `img[loading="lazy"]` starts at `opacity: 0`. If an image fails to load, it stays invisible while its `#D9D9D9` placeholder container remains.
- **Fix:** Added `error` event listener that adds `.loaded` class, making the placeholder container visible.
- **Status:** Fixed

### m5. Contact card uses fixed padding
- **Files:** `styles.css:654`
- **Problem:** `.contact__card` has `padding: 60px 80px` in fixed pixels. Doesn't scale between 769-1023px viewports.
- **Fix:** Changed to `clamp(30px, 4vw, 60px) clamp(30px, 5.5vw, 80px)` for fluid scaling.
- **Status:** Fixed

### m6. Language preference not persisted
- **Files:** `script.js:211`
- **Problem:** `currentLang` resets to `'en'` on every page load. No `localStorage` or URL parameter persistence.
- **Fix:** `setLanguage()` saves to `localStorage`. On init, saved preference is restored.
- **Status:** Fixed

### m7. Print styles show redundant URLs
- **Files:** `styles.css:1341-1345`
- **Problem:** `a[href]::after` prints `(tel:+48796501780)` next to the phone number and `(mailto:...)` next to the email — both redundant.
- **Fix:** Added `a[href^="tel:"]::after, a[href^="mailto:"]::after { content: none; }` to print styles.
- **Status:** Fixed

### m8. No favicon
- **Files:** `index.html` (head)
- **Problem:** No `<link rel="icon">`. Browser shows default blank icon.
- **Fix:** Added inline SVG favicon (red square with "VK" initials).
- **Status:** Fixed

### m9. Missing `og:image` meta tag
- **Files:** `index.html:8-11`
- **Problem:** Open Graph tags have no image. Social shares show a generic placeholder.
- **Fix:** Added `<meta property="og:image" content="asset/about-me.png">`.
- **Status:** Fixed

---

## Design Spec Discrepancies

### D1. About Me first paragraph text differs from Figma
- Figma: "I'm a graphic designer and illustrator with over 4 years of professional experience."
- Code: "Graphic designer and illustrator with 4 years of professional experience."
- **Fix:** Updated HTML and EN/PL translations to match Figma text.
- **Status:** Fixed

### D2. About Me second paragraph text differs from Figma
- Figma: "I work across visual identities, print and digital design, creating illustrations and graphic solutions that are clear, thoughtful, and structured."
- Code: "I create visual identities and illustrations that speak before words do — clear in structure, bold in feeling."
- **Fix:** Updated HTML and EN/PL translations to match Figma text.
- **Status:** Fixed

### D3. Mobile contact heading plural mismatch
- Figma: "CONTACTS" (plural)
- Code: "CONTACT" (singular)
- **Fix:** Changed HTML and EN/PL translations to "CONTACTS" / "KONTAKTY".
- **Status:** Fixed

### D4. Filter label singular/plural mismatch
- Figma: "Illustration" (singular)
- Code: "Illustrations" (plural)
- **Fix:** Changed HTML filter buttons and EN/PL translations to singular "Illustration" / "Ilustracja".
- **Status:** Fixed

### D5. "more" button default color differs
- Figma: Red (#FF0000)
- Code: #CC0000 (darker red for accessibility)
- **Note:** Kept #CC0000 intentionally — #FF0000 on white fails WCAG AA contrast (4:1). #CC0000 passes at 5.9:1.
- **Status:** Won't fix (accessibility)

### D6. Mobile filter button style differs
- Figma: Outlined/bordered buttons
- Code: Filled red active state in a 2x2 grid
- **Fix:** Added `border: 1.5px solid` to mobile filter buttons. Active state keeps red fill with red border; inactive buttons show black border on transparent background.
- **Status:** Fixed
