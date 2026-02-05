const puppeteer = require('puppeteer');
const path = require('path');

const TOL = 3; // px tolerance for sub-pixel rounding
const VIEWPORTS = [1920, 1536, 1440, 1024, 768];

// ── helpers ──────────────────────────────────────────────
async function box(page, sel) {
    return page.evaluate(s => {
        const el = document.querySelector(s);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { left: r.left, top: r.top, right: r.right, bottom: r.bottom,
                 width: r.width, height: r.height };
    }, sel);
}

function contained(inner, outer) {
    return inner.left   >= outer.left   - TOL
        && inner.top    >= outer.top    - TOL
        && inner.right  <= outer.right  + TOL
        && inner.bottom <= outer.bottom + TOL;
}

function fmt(b) {
    return `L=${b.left.toFixed(1)} T=${b.top.toFixed(1)} R=${b.right.toFixed(1)} B=${b.bottom.toFixed(1)} (${b.width.toFixed(0)}×${b.height.toFixed(0)})`;
}

// ── geometric checks (language-agnostic) ─────────────────
async function runGeometricChecks(page, w, lang) {
    const errors = [];

    // Mobile layout uses a completely different structure — skip desktop geometric checks
    if (w <= 768) {
        console.log('  (Mobile viewport — desktop geometric checks skipped)');
        return errors;
    }

    const rect         = await box(page, '#red-block');
    const design       = await box(page, '#span-design-text');
    const graphic      = await box(page, '#span-graphic');
    const designIs     = await box(page, '#span-design-is');
    const itsAWay      = await box(page, '#span-its-a-way');
    const quoteBox     = await box(page, '#quote');
    const notDecor     = await box(page, '#span-not-decoration');
    const toOrganize   = await box(page, '#span-to-organize');

    if (!rect || rect.width === 0) {
        errors.push('Red block not rendered');
        return errors;
    }

    console.log('  Red block : ' + fmt(rect));
    console.log('  DESIGN    : ' + fmt(design));
    console.log('  GRAPHIC   : ' + fmt(graphic));
    console.log('  Inside 1  : ' + fmt(designIs));
    console.log('  Inside 2  : ' + fmt(itsAWay));
    if (notDecor)    console.log('  Outside 1 : ' + fmt(notDecor));
    if (toOrganize)  console.log('  Outside 2 : ' + fmt(toOrganize));

    // 1. DESIGN fully inside red rect
    if (!contained(design, rect)) {
        const dx = {
            left:   design.left   - rect.left,
            top:    design.top    - rect.top,
            right:  rect.right    - design.right,
            bottom: rect.bottom   - design.bottom,
        };
        errors.push(
            `DESIGN not contained — clearance L=${dx.left.toFixed(1)} T=${dx.top.toFixed(1)} R=${dx.right.toFixed(1)} B=${dx.bottom.toFixed(1)}`
        );
    }

    // 2. Red box not narrower than DESIGN
    if (rect.width < design.width - TOL) {
        errors.push(`Red box too narrow: ${rect.width.toFixed(1)} < DESIGN ${design.width.toFixed(1)}`);
    }

    // 3. GRAPHIC strictly left of red rect
    {
        const leftGap = rect.left - graphic.right;
        console.log(`  Left gap (GRAPHIC→rect): ${leftGap.toFixed(1)}px`);
        if (leftGap < -TOL) {
            errors.push(`GRAPHIC overlaps red block by ${(-leftGap).toFixed(1)}px`);
        }
    }

    // 4. Inside span 1 inside red rect horizontally
    if (designIs.left < rect.left - TOL || designIs.right > rect.right + TOL) {
        errors.push(`Inside span 1 not inside rect: [${designIs.left.toFixed(1)}, ${designIs.right.toFixed(1)}] vs [${rect.left.toFixed(1)}, ${rect.right.toFixed(1)}]`);
    }

    // 5. Inside span 2 inside red rect horizontally
    if (itsAWay.left < rect.left - TOL || itsAWay.right > rect.right + TOL) {
        errors.push(`Inside span 2 not inside rect: [${itsAWay.left.toFixed(1)}, ${itsAWay.right.toFixed(1)}] vs [${rect.left.toFixed(1)}, ${rect.right.toFixed(1)}]`);
    }

    // 6. Outside span 1 right of red block
    if (notDecor) {
        const rightGap = notDecor.left - rect.right;
        console.log(`  Right gap (rect→out1): ${rightGap.toFixed(1)}px`);
        if (rightGap < -TOL) {
            errors.push(`Outside span 1 overlaps red block by ${(-rightGap).toFixed(1)}px`);
        }
    }

    // 7. Outside span 2 right of red block
    if (toOrganize) {
        const rightGap2 = toOrganize.left - rect.right;
        console.log(`  Right gap (rect→out2): ${rightGap2.toFixed(1)}px`);
        if (rightGap2 < -TOL) {
            errors.push(`Outside span 2 overlaps red block by ${(-rightGap2).toFixed(1)}px`);
        }
    }

    // 8. Vertical gap quote → headline >= 70px
    if (quoteBox && design) {
        const gap = design.top - quoteBox.bottom;
        console.log(`  Vertical gap (quote→headline): ${gap.toFixed(1)}px`);
        if (gap < 70 - TOL) {
            errors.push(`Vertical gap too small: ${gap.toFixed(1)}px (min 70px)`);
        }
    }

    // 9. Gutter 8-20px
    if (notDecor) {
        const gutterWidth = notDecor.left - rect.right;
        console.log(`  Gutter width: ${gutterWidth.toFixed(1)}px`);
        if (gutterWidth < 8 - TOL) {
            errors.push(`Gutter too narrow: ${gutterWidth.toFixed(1)}px (min 8px)`);
        }
        if (gutterWidth > 20 + TOL) {
            errors.push(`Gutter too wide: ${gutterWidth.toFixed(1)}px (max 20px)`);
        }
    }

    // 10. Outside spans left-edge alignment <= 1px
    if (notDecor && toOrganize) {
        const drift = Math.abs(notDecor.left - toOrganize.left);
        console.log(`  Outside left drift: ${drift.toFixed(1)}px`);
        if (drift > 1) {
            errors.push(`Outside spans misaligned: ${drift.toFixed(1)}px (max 1px)`);
        }
    }

    // 11. Inside spans right-edge alignment <= 1px
    if (designIs && itsAWay) {
        const rightDrift = Math.abs(designIs.right - itsAWay.right);
        console.log(`  Inside right drift: ${rightDrift.toFixed(1)}px`);
        if (rightDrift > 1) {
            errors.push(`Inside spans right edges misaligned: ${rightDrift.toFixed(1)}px (max 1px)`);
        }
    }

    // 12. Pillar ratio (informational)
    {
        const ratio = rect.height / rect.width;
        console.log(`  Pillar ratio (H/W): ${ratio.toFixed(2)}`);
    }

    // 13. Square size check (>= 10vw)
    {
        const sq = await box(page, '.hero__red-square');
        if (sq) {
            const minWidth = w * 0.12;
            console.log(`  Square width: ${sq.width.toFixed(1)}px (min ${minWidth.toFixed(1)}px = 10vw)`);
            if (sq.width < minWidth - TOL) {
                errors.push(`Red square too small: ${sq.width.toFixed(1)}px < 10vw (${minWidth.toFixed(1)}px)`);
            }
            // Check right-edge alignment with author
            const authorBox2 = await box(page, '.hero__author');
            if (authorBox2) {
                const sqRightDrift = Math.abs(sq.right - authorBox2.right);
                console.log(`  Square-Author right drift: ${sqRightDrift.toFixed(1)}px`);
                if (sqRightDrift > 3) {
                    errors.push(`Square right edge not aligned with author: ${sqRightDrift.toFixed(1)}px drift (max 3px)`);
                }
            }
        }
    }

    // 14. Ink-floor lock — role ink-bottom aligns with illustration ink-bottom
    {
        const roleBox  = await box(page, '#span-author-role');
        const illusBox = await box(page, '#span-illustration');
        if (roleBox && illusBox) {
            const metrics = await page.evaluate(() => {
                const illus = document.getElementById('span-illustration');
                const role  = document.getElementById('span-author-role');
                const hFs = parseFloat(getComputedStyle(illus).fontSize);
                const hLh = parseFloat(getComputedStyle(illus).lineHeight);
                const rFs = parseFloat(getComputedStyle(role).fontSize);
                const rLh = parseFloat(getComputedStyle(role).lineHeight);
                return {
                    headlineLeadBelow: (hLh - hFs) / 2,
                    roleLeadBelow: (rLh - rFs) / 2
                };
            });
            const illusInk = illusBox.bottom - metrics.headlineLeadBelow;
            const roleInk  = roleBox.bottom  - metrics.roleLeadBelow;
            const drift = Math.abs(roleInk - illusInk);
            console.log(`  Ink-floor drift: ${drift.toFixed(1)}px (roleInk=${roleInk.toFixed(1)}, illusInk=${illusInk.toFixed(1)})`);
            if (drift > 1) {
                errors.push(`Ink-floor drift: ${drift.toFixed(1)}px (max 1px)`);
            }
        }
    }

    return errors;
}

// ── main ─────────────────────────────────────────────────
async function verify() {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page    = await browser.newPage();
    const url     = 'file://' + path.resolve(__dirname, 'index.html');
    let allPassed = true;

    for (const w of VIEWPORTS) {
        const vpH = w === 1536 ? 864 : (w >= 1024 ? Math.round(w * 9 / 16) : 1024);

        for (const lang of ['ENG', 'PL']) {
            console.log(`\n===== Viewport ${w}x${vpH} [${lang}] =====`);
            await page.setViewport({ width: w, height: vpH });
            await page.goto(url, { waitUntil: 'networkidle0' });
            await new Promise(r => setTimeout(r, 1500));

            // Switch language if PL
            if (lang === 'PL') {
                await page.evaluate(() => {
                    const plBtn = document.getElementById('lang-pl');
                    if (plBtn) plBtn.click();
                });
                await new Promise(r => setTimeout(r, 800));
            }

            await page.screenshot({ path: `screenshots/verify-${lang}-${w}px.png` });

            // ── Run geometric checks ──
            const errors = await runGeometricChecks(page, w, lang);

            // ── Language-specific checks (only on first pass per viewport) ──
            if (lang === 'ENG') {
                // Header bg differs from hero
                const [headerBg, heroBg] = await page.evaluate(() => {
                    return [
                        getComputedStyle(document.querySelector('.header')).backgroundColor,
                        getComputedStyle(document.querySelector('.hero')).backgroundColor
                    ];
                });
                console.log(`  Header bg: ${headerBg} | Hero bg: ${heroBg}`);
                if (headerBg === heroBg) errors.push(`Header/hero same bg: ${headerBg}`);

                // Header 3 children
                const childCount = await page.evaluate(() => document.querySelector('.header').children.length);
                console.log(`  Header children: ${childCount}`);
                if (childCount !== 4) errors.push(`Header must have 4 children (hamburger + logo + nav + lang), has ${childCount}`);

                // ENG nav content
                const navTexts = await page.evaluate(() =>
                    [...document.querySelectorAll('.header__nav-link')].map(a => a.textContent.trim())
                );
                console.log(`  Nav links: ${JSON.stringify(navTexts)}`);
                const expected = ['About me', 'Projects', 'Contact'];
                if (!expected.every(t => navTexts.includes(t)) || navTexts.length !== expected.length) {
                    errors.push(`Nav links must be ${JSON.stringify(expected)}, got ${JSON.stringify(navTexts)}`);
                }

                // Nav spacing >= 5vw (desktop only — nav hidden on mobile)
                if (w > 768) {
                    const [l1, l2] = await page.evaluate(() => {
                        const links = document.querySelectorAll('.header__nav-link');
                        return [
                            { right: links[0].getBoundingClientRect().right },
                            { left: links[1].getBoundingClientRect().left }
                        ];
                    });
                    const navGap = l2.left - l1.right;
                    console.log(`  Nav gap: ${navGap.toFixed(1)}px (min ${(w * 0.05).toFixed(1)}px)`);
                    if (navGap < w * 0.05) errors.push(`Nav gap ${navGap.toFixed(1)}px < 5vw`);
                }

                // Nav weight < Logo weight
                const [navW, logoW] = await page.evaluate(() => {
                    return [
                        parseInt(getComputedStyle(document.querySelector('.header__nav-link')).fontWeight),
                        parseInt(getComputedStyle(document.querySelector('.header__logo')).fontWeight)
                    ];
                });
                console.log(`  Nav weight: ${navW} | Logo weight: ${logoW}`);
                if (navW >= logoW) errors.push(`Nav weight (${navW}) >= Logo weight (${logoW})`);

                // Lang switcher
                const hasLangSep = await page.evaluate(() => {
                    const el = document.querySelector('.header__lang');
                    return el ? el.textContent.includes('|') : false;
                });
                console.log(`  Language switcher has "|": ${hasLangSep}`);
                if (!hasLangSep) errors.push('Language switcher missing "|"');

                // Red block transition
                const dur = await page.evaluate(() =>
                    getComputedStyle(document.querySelector('.hero__red-block')).transitionDuration
                );
                const hasTrans = dur && !dur.split(',').every(d => parseFloat(d) === 0);
                console.log(`  Red block transition: ${dur} — active: ${hasTrans}`);
                if (!hasTrans) errors.push(`Red block transition-duration must be > 0s`);

                // Nav color transition
                const navTP = await page.evaluate(() =>
                    getComputedStyle(document.querySelector('.header__nav-link')).transitionProperty
                );
                const hasCol = navTP && (navTP.includes('color') || navTP === 'all');
                console.log(`  Nav transition-property: ${navTP} — has color: ${hasCol}`);
                if (!hasCol) errors.push(`Nav links missing color transition`);
            }

            if (lang === 'PL') {
                // PL nav content
                const plNav = await page.evaluate(() =>
                    [...document.querySelectorAll('.header__nav-link')].map(a => a.textContent.trim())
                );
                console.log(`  PL nav: ${JSON.stringify(plNav)}`);
                if (!plNav.includes('Projekty')) errors.push(`PL nav missing "Projekty"`);
                if (!plNav.includes('Kontakt')) errors.push(`PL nav missing "Kontakt"`);

                // PL headline
                const plHL = await page.evaluate(() => {
                    return {
                        graphic: (document.getElementById('span-graphic') || {}).textContent || '',
                        design: (document.getElementById('span-design-text') || {}).textContent || ''
                    };
                });
                console.log(`  PL headline: "${plHL.graphic.trim()} ${plHL.design}"`);
                if (!plHL.graphic.includes('PROJEKTOWANIE')) errors.push(`PL missing "PROJEKTOWANIE"`);
                if (!plHL.design.includes('GRAFICZNE')) errors.push(`PL missing "GRAFICZNE"`);
            }

            // ── Interactivity checks (only at 1536x864 ENG) ──
            if (w === 1536 && lang === 'ENG') {
                // Scroll to About section so nav active state triggers
                await page.evaluate(() => document.getElementById('about').scrollIntoView());
                await new Promise(r => setTimeout(r, 800));

                // Active state: "About me" should have red color and ::after underline
                const activeCheck = await page.evaluate(() => {
                    const link = document.querySelector('.header__nav-link');
                    if (!link) return { error: 'no nav link found' };
                    const style = getComputedStyle(link);
                    const afterStyle = getComputedStyle(link, '::after');
                    const color = style.color;
                    const transform = afterStyle.transform;
                    const hasActiveClass = link.classList.contains('header__nav-link--active');
                    return { color, transform, hasActiveClass };
                });
                console.log(`  Active link color: ${activeCheck.color}`);
                console.log(`  Active link ::after transform: ${activeCheck.transform}`);
                console.log(`  Has active class: ${activeCheck.hasActiveClass}`);
                if (!activeCheck.hasActiveClass) {
                    errors.push('First nav link missing header__nav-link--active class');
                }
                // Check color is red (rgb(255, 0, 0))
                if (activeCheck.color !== 'rgb(255, 0, 0)') {
                    errors.push(`Active nav link color is ${activeCheck.color}, expected rgb(255, 0, 0)`);
                }
                // Check ::after is visible (scaleX(1) means no "scaleX(0)")
                if (activeCheck.transform && activeCheck.transform.includes('0, 0, 0, 0')) {
                    errors.push('Active nav link ::after is not visible (scaleX(0))');
                }

                // Hover simulation: hover over "Projects" (2nd link)
                const projectsLink = await page.$('.header__nav-link:nth-child(2)');
                if (projectsLink) {
                    await projectsLink.hover();
                    await new Promise(r => setTimeout(r, 700));
                    const hoverCheck = await page.evaluate(() => {
                        const link = document.querySelectorAll('.header__nav-link')[1];
                        const style = getComputedStyle(link);
                        const afterStyle = getComputedStyle(link, '::after');
                        return { color: style.color, transform: afterStyle.transform };
                    });
                    console.log(`  Hovered "Projects" color: ${hoverCheck.color}`);
                    console.log(`  Hovered "Projects" ::after transform: ${hoverCheck.transform}`);
                    if (hoverCheck.color !== 'rgb(249, 97, 97)') {
                        errors.push(`Hovered nav link color is ${hoverCheck.color}, expected rgb(249, 97, 97)`);
                    }
                }

                // Language active state: ENG should have red underline
                const langCheck = await page.evaluate(() => {
                    const eng = document.getElementById('lang-eng');
                    if (!eng) return { error: 'no eng span' };
                    const style = getComputedStyle(eng);
                    const afterStyle = getComputedStyle(eng, '::after');
                    return { color: style.color, transform: afterStyle.transform, hasActive: eng.classList.contains('header__lang-active') };
                });
                console.log(`  ENG lang color: ${langCheck.color}`);
                console.log(`  ENG lang ::after transform: ${langCheck.transform}`);
                if (langCheck.color !== 'rgb(255, 0, 0)') {
                    errors.push(`Active lang color is ${langCheck.color}, expected rgb(255, 0, 0)`);
                }

                // Scroll back to top for subsequent checks
                await page.evaluate(() => window.scrollTo(0, 0));
                await new Promise(r => setTimeout(r, 300));
            }

            // ── About section checks (ENG only, once per viewport) ──
            if (lang === 'ENG') {
                // Sticky header check
                const headerPos = await page.evaluate(() => {
                    const h = document.querySelector('.header');
                    return h ? getComputedStyle(h).position : null;
                });
                console.log(`  Header position: ${headerPos}`);
                if (headerPos !== 'fixed' && headerPos !== 'sticky') {
                    errors.push(`Header position is "${headerPos}", expected fixed or sticky`);
                }

                // About image rendered with width > 0
                const aboutImg = await box(page, '.about__photo');
                console.log(`  About image: ${aboutImg ? `${aboutImg.width.toFixed(0)}×${aboutImg.height.toFixed(0)}` : 'NOT FOUND'}`);
                if (!aboutImg || aboutImg.width <= 0) {
                    errors.push('About image not rendered or has zero width');
                }

                // About section left margin alignment (3.125vw)
                const aboutSection = await box(page, '.about');
                const aboutContent = await box(page, '.about__content');
                if (aboutSection && aboutContent) {
                    const expectedMargin = w * 0.03125;
                    const actualMargin = aboutContent.left - aboutSection.left;
                    console.log(`  About content left margin: ${actualMargin.toFixed(1)}px (expected ~${expectedMargin.toFixed(1)}px = 3.125vw)`);
                    if (Math.abs(actualMargin - expectedMargin) > 5) {
                        errors.push(`About content margin misaligned: ${actualMargin.toFixed(1)}px vs expected ${expectedMargin.toFixed(1)}px`);
                    }
                }

                // Title above photo: title top should be above photo top
                const upperRed = await box(page, '.about__red-upper');
                const aboutHL = await box(page, '.about__headline');
                if (aboutHL && aboutImg) {
                    const titleAbovePhoto = aboutImg.top - aboutHL.top;
                    console.log(`  Title above photo: title.top=${aboutHL.top.toFixed(1)} photo.top=${aboutImg.top.toFixed(1)} gap=${titleAbovePhoto.toFixed(1)}px`);
                    if (titleAbovePhoto < 10) {
                        errors.push(`Title should start above photo top, gap=${titleAbovePhoto.toFixed(1)}px (min 10px)`);
                    }
                }
                // Upper red block visible above photo
                if (upperRed && aboutImg) {
                    const redAbovePhoto = aboutImg.top - upperRed.top;
                    console.log(`  Red upper above photo: ${redAbovePhoto.toFixed(1)}px`);
                    if (redAbovePhoto < 5) {
                        errors.push(`Upper red should be above photo, gap=${redAbovePhoto.toFixed(1)}px`);
                    }
                }
                // Lower red near photo bottom-right corner (protrudes slightly)
                const lowerRed = await box(page, '.about__red-lower');
                if (lowerRed && aboutImg) {
                    const overlapBottom = lowerRed.bottom - aboutImg.bottom;
                    const overlapRight = lowerRed.right - aboutImg.right;
                    console.log(`  Lower red protrusion: bottom=${overlapBottom.toFixed(1)}px, right=${overlapRight.toFixed(1)}px`);
                    // Should protrude past the photo corner
                    if (lowerRed.bottom < aboutImg.bottom - 5) {
                        errors.push(`Lower red should be near photo bottom`);
                    }
                }

                // Scale test: title fontSize >= 4x body fontSize
                const aboutFonts = await page.evaluate(() => {
                    const hl = document.querySelector('.about__headline');
                    const body = document.querySelector('.about__body');
                    if (!hl || !body) return null;
                    return {
                        titleFs: parseFloat(getComputedStyle(hl).fontSize),
                        bodyFs: parseFloat(getComputedStyle(body).fontSize)
                    };
                });
                if (aboutFonts) {
                    const ratio = aboutFonts.titleFs / aboutFonts.bodyFs;
                    console.log(`  About title/body font ratio: ${ratio.toFixed(2)} (title=${aboutFonts.titleFs.toFixed(1)}px, body=${aboutFonts.bodyFs.toFixed(1)}px)`);
                    if (ratio < 4) {
                        errors.push(`About title/body ratio ${ratio.toFixed(2)} < 4.0 (title=${aboutFonts.titleFs.toFixed(1)}px, body=${aboutFonts.bodyFs.toFixed(1)}px)`);
                    }
                }

                // Shape test: photo aspect ratio near 858/785 = 1.09
                if (aboutImg) {
                    const photoRatio = aboutImg.width / aboutImg.height;
                    console.log(`  Photo aspect ratio: ${photoRatio.toFixed(2)} (target ~1.09)`);
                    if (Math.abs(photoRatio - 1.09) > 0.05) {
                        errors.push(`Photo aspect ratio ${photoRatio.toFixed(2)} not near 1.09 (858/785)`);
                    }
                }

                // Highlight color check — "4 years..." must be red
                const highlightColor = await page.evaluate(() => {
                    const el = document.querySelector('.about__highlight');
                    return el ? getComputedStyle(el).color : null;
                });
                console.log(`  About highlight color: ${highlightColor}`);
                if (highlightColor !== 'rgb(255, 0, 0)') {
                    errors.push(`About highlight color is "${highlightColor}", expected rgb(255, 0, 0)`);
                }

                // Asymmetry check — upper red element larger than lower
                if (upperRed && lowerRed) {
                    const upperArea = upperRed.width * upperRed.height;
                    const lowerArea = lowerRed.width * lowerRed.height;
                    console.log(`  Red upper: ${upperRed.width.toFixed(0)}×${upperRed.height.toFixed(0)} (${upperArea.toFixed(0)}px²) | lower: ${lowerRed.width.toFixed(0)}×${lowerRed.height.toFixed(0)} (${lowerArea.toFixed(0)}px²)`);
                    if (upperArea <= lowerArea) {
                        errors.push(`Upper red element (${upperArea.toFixed(0)}px²) must be larger than lower (${lowerArea.toFixed(0)}px²)`);
                    }
                }
            }

            // ── report ──
            if (errors.length === 0) {
                console.log(`  ✅ ALL CHECKS PASSED [${lang}]`);
            } else {
                allPassed = false;
                errors.forEach(e => console.log('  ❌ ' + e));
            }
        }
    }

    await browser.close();
    console.log('\n' + (allPassed ? '🎉 All viewports passed (ENG + PL)!' : '⚠️  Some checks failed.'));
    if (!allPassed) process.exit(1);
}

verify().catch(e => { console.error(e); process.exit(1); });
