/**
 * Grid-spine "Vertical Pillar" positioning + language switching.
 */

// Debounce utility for performance optimization
function debounce(func, wait) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(function() {
            func.apply(context, args);
        }, wait);
    };
}

function positionLayout() {
    var hero    = document.getElementById('hero');
    var block   = document.getElementById('red-block');
    var spanD   = document.getElementById('span-design');
    var spanDT  = document.getElementById('span-design-text');
    var spanDI  = document.getElementById('span-design-is');
    var spanIAW = document.getElementById('span-its-a-way');
    var quote   = document.getElementById('quote');

    if (!hero || !block || !spanD || !spanDT || !spanDI || !spanIAW || !quote) return;

    // ── Tablet layout (769–1024) ──────────────────────────
    if (window.innerWidth >= 769 && window.innerWidth <= 1024 && window.innerHeight >= 900) {
        // Clear desktop inline styles
        quote.style.position = '';
        quote.style.left = '';
        quote.style.top = '';
        spanDI.style.width = '';
        spanIAW.style.width = '';
        var author = document.querySelector('.hero__author');
        if (author) author.style.top = '';

        var h = hero.getBoundingClientRect();
        var d = spanD.getBoundingClientRect();
        var dt = spanDT.getBoundingClientRect();
        var spanG = document.getElementById('span-graphic');
        var quoteEl = document.querySelector('.hero__quote');
        var illus = document.getElementById('span-illustration');

        var gRect = spanG ? spanG.getBoundingClientRect() : null;
        var qRect = quoteEl ? quoteEl.getBoundingClientRect() : null;
        var iRect = illus ? illus.getBoundingClientRect() : null;

        // Red block: anchor bottom to DESIGN, shrink from top
        var blockBottom = d.bottom - h.top + 5;
        var fullHeight = blockBottom - (qRect ? (qRect.bottom - h.top + 20) : (d.top - h.top - 200));
        var blockHeight = fullHeight * 0.75; // 25% shorter
        var blockTop = blockBottom - blockHeight; // shrink from top, bottom stays anchored

        // Ensure block doesn't overlap quote
        var quoteLimit = qRect ? (qRect.bottom - h.top + 20) : 0;
        if (blockTop < quoteLimit) {
            blockTop = quoteLimit;
            blockHeight = blockBottom - blockTop;
        }

        // Red block left: starts after GRAPHIC (small gap)
        var blockLeft = gRect ? (gRect.right - h.left + 2) : (d.left - h.left);

        // Width: smaller square-ish block, ensure DESIGN is covered
        var designWidth = dt.right - dt.left;
        var blockWidth = Math.max(blockHeight * 0.85, designWidth + 40);

        // Don't exceed viewport right edge
        var maxRight = h.width - window.innerWidth * 0.05;
        if (blockLeft + blockWidth > maxRight) {
            blockWidth = maxRight - blockLeft;
        }

        block.style.left   = blockLeft + 'px';
        block.style.top    = blockTop + 'px';
        block.style.width  = blockWidth + 'px';
        block.style.height = blockHeight + 'px';
        block.classList.add('hero__red-block--ready');

        return;
    }

    // Mobile layout — position red block behind DESIGN word
    if (window.innerWidth <= 768) {
        // Clear desktop inline styles
        quote.style.position = '';
        quote.style.left = '';
        quote.style.top = '';
        spanDI.style.width = '';
        spanIAW.style.width = '';
        var author = document.querySelector('.hero__author');
        if (author) author.style.top = '';

        // Position red block: only DESIGN overlaps, not quote or other text
        var h = hero.getBoundingClientRect();
        var d = spanD.getBoundingClientRect();
        var spanG = document.getElementById('span-graphic');
        var quoteEl = document.querySelector('.hero__quote');

        var gRight = spanG ? spanG.getBoundingClientRect().right : d.left;
        var quoteBottom = quoteEl ? quoteEl.getBoundingClientRect().bottom : 0;

        // Left: just after GRAPHIC
        var padLeft = Math.max(d.left - gRight - 2, 0);
        var blockLeft = d.left - h.left - padLeft;

        // Width: leave 20px right margin (not touching edge)
        var blockWidth = h.width - blockLeft - 20;

        // Block bottom: only 8px below DESIGN so & ILLUSTRATION doesn't touch
        var blockBottom = d.bottom - h.top + 3;

        // Height: sized relative to DESIGN word (same as original)
        var blockHeight = d.height * 3;
        var blockTop = blockBottom - blockHeight;

        // Don't go above the quote
        var minTop = quoteBottom - h.top + 15;
        if (blockTop < minTop) {
            blockTop = minTop;
            blockHeight = blockBottom - blockTop;
        }

        block.style.left   = blockLeft + 'px';
        block.style.top    = blockTop + 'px';
        block.style.width  = blockWidth + 'px';
        block.style.height = blockHeight + 'px';
        return;
    }

    // --- Step 0: Equalize inside-span widths for grid column alignment ---
    spanDI.style.width  = '';
    spanIAW.style.width = '';
    var diW  = spanDI.getBoundingClientRect().width;
    var iawW = spanIAW.getBoundingClientRect().width;
    var maxW = Math.max(diW, iawW);
    spanDI.style.width  = maxW + 'px';
    spanIAW.style.width = maxW + 'px';

    var h = hero.getBoundingClientRect();

    // --- Step 1: Horizontal alignment ---
    var dRight = spanDT.getBoundingClientRect().right - h.left;
    var overhang = h.width * 0.04;
    var quoteLeft = (dRight + overhang) - maxW;

    // --- Step 2: Headline-relative vertical positioning ---
    var headlineTop = spanD.getBoundingClientRect().top - h.top;
    var minGap = 100;

    quote.style.position = 'absolute';
    quote.style.left = quoteLeft + 'px';
    quote.style.top  = '0px';
    var quoteHeight = quote.getBoundingClientRect().height;
    var quoteTop = headlineTop - minGap - quoteHeight;
    if (quoteTop < 10) quoteTop = 10;
    quote.style.top = quoteTop + 'px';

    // --- Step 3: Collision check ---
    var quoteBottom = quote.getBoundingClientRect().bottom - h.top;
    if (quoteBottom + minGap > headlineTop) {
        quoteTop = quoteTop - (quoteBottom + minGap - headlineTop);
        if (quoteTop < 10) quoteTop = 10;
        quote.style.top = quoteTop + 'px';
    }

    // --- Step 4: Re-measure after final positioning ---
    var d   = spanD.getBoundingClientRect();
    var di  = spanDI.getBoundingClientRect();
    var iaw = spanIAW.getBoundingClientRect();
    var q   = quote.getBoundingClientRect();

    // --- Step 5: Draw the red pillar ---
    var anchorLeft   = d.left - h.left;
    var anchorRight  = Math.max(di.right, iaw.right) - h.left;
    var anchorBottom = d.bottom - h.top;

    var qTopRel      = q.top - h.top;
    var paddingAbove = h.height * 0.08; // 8vh
    var anchorTop    = qTopRel - paddingAbove;
    if (anchorTop < 0) anchorTop = 0;

    block.style.left   = anchorLeft + 'px';
    block.style.top    = anchorTop  + 'px';
    block.style.width  = (anchorRight - anchorLeft) + 'px';
    block.style.height = (anchorBottom - anchorTop) + 'px';
    block.classList.add('hero__red-block--ready');

    // --- Step 6: Text-to-text floor lock — measure spans, not containers ---
    var author   = document.querySelector('.hero__author');
    var illus    = document.getElementById('span-illustration');
    var roleSpan = document.getElementById('span-author-role');
    if (author && illus && roleSpan) {
        // Strip line-height padding from BOTH elements to align visible ink.
        var illusRect   = illus.getBoundingClientRect();
        var authorRect  = author.getBoundingClientRect();
        var roleRect    = roleSpan.getBoundingClientRect();

        var headlineFs = parseFloat(getComputedStyle(illus).fontSize);
        var headlineLh = parseFloat(getComputedStyle(illus).lineHeight);
        var headlineLeadBelow = (headlineLh - headlineFs) / 2;

        var roleFs = parseFloat(getComputedStyle(roleSpan).fontSize);
        var roleLh = parseFloat(getComputedStyle(roleSpan).lineHeight);
        var roleLeadBelow = (roleLh - roleFs) / 2;

        // Where the visible ink of each element actually ends:
        var illusInkBottom = illusRect.bottom - headlineLeadBelow;
        var roleInkOffset  = roleRect.bottom - roleLeadBelow - authorRect.top;

        // Position author so role ink-bottom = illus ink-bottom
        var targetTop = illusInkBottom - roleInkOffset - h.top;
        author.style.top = targetTop + 'px';
    }
}

// ── Language switching ──────────────────────────────────
var translations = {
    en: {
        nav: ['About Me', 'Projects', 'Contacts'],
        role: 'Graphic Designer & Illustrator',
        quoteLine1Inside: 'Design is\u00a0 ',
        quoteLine1Outside: 'not decoration.',
        quoteLine2Inside: "It\u2019s a way ",
        quoteLine2Outside: 'to organize meaning.',
        graphic: 'GRAPHIC ',
        design: 'DESIGN',
        illustration: '& ILLUSTRATION',
        aboutHeadline: 'ABOUT ME',
        aboutBody1: 'I\u2019m a graphic designer and illustrator<br>with <strong class="about__highlight">over 4 years of professional experience.</strong>',
        aboutBody2: 'I work across visual identities, print and digital design, creating illustrations and graphic solutions that are <strong class="about__highlight">clear, thoughtful, and structured.</strong>',
        projectsHeadline: 'PROJECTS',
        projectsFilters: ['Logos', 'Illustrations', 'Social media', 'Print ads'],
        projectsSeeMore: 'See more projects',
        projectsSeeLess: 'See less',
        projectsCardMore: 'more',
        projectsSubFilters: ['All', 'Branding', 'Posters', 'Materials'],
        contactHeadline: 'CONTACTS'
    },
    pl: {
        nav: ['O mnie', 'Projekty', 'Kontakty'],
        role: 'Projektantka Graficzna & Ilustratorka',
        quoteLine1Inside: 'Design to nie ',
        quoteLine1Outside: 'dekoracja.',
        quoteLine2Inside: 'To spos\u00F3b na ',
        quoteLine2Outside: 'organizowanie znacze\u0144.',
        graphic: 'PROJEKTOWANIE ',
        design: 'GRAFICZNE',
        illustration: '& ILUSTRACJA',
        aboutHeadline: 'O MNIE',
        aboutBody1: 'Jestem graficzk\u0105 i ilustratork\u0105<br>z <strong class="about__highlight">ponad 4-letnim do\u015Bwiadczeniem zawodowym.</strong>',
        aboutBody2: 'Pracuj\u0119 w zakresie identyfikacji wizualnej, druku i projektowania cyfrowego, tworz\u0105c ilustracje i rozwi\u0105zania graficzne, kt\u00F3re s\u0105 <strong class="about__highlight">czytelne, przemy\u015Blane i uporz\u0105dkowane.</strong>',
        projectsHeadline: 'PROJEKTY',
        projectsFilters: ['Logotypy', 'Ilustracje', 'Media spo\u0142eczno\u015Bciowe', 'Reklamy drukowane'],
        projectsSeeMore: 'Zobacz wi\u0119cej projekt\u00F3w',
        projectsSeeLess: 'Zobacz mniej',
        projectsCardMore: 'wi\u0119cej',
        projectsSubFilters: ['Wszystko', 'Branding', 'Plakaty', 'Materia\u0142y'],
        contactHeadline: 'KONTAKTY'
    }
};

var currentLang = 'en';

function setLanguage(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;
    try { localStorage.setItem('lang', lang); } catch (e) {}
    var t = translations[lang];
    if (!t) return;

    // Nav links
    var navLinks = document.querySelectorAll('.header__nav-link');
    for (var i = 0; i < navLinks.length && i < t.nav.length; i++) {
        navLinks[i].textContent = t.nav[i];
    }

    // Author role
    var role = document.querySelector('.hero__author-role');
    if (role) role.textContent = t.role;

    // Quote spans
    var spanDI  = document.getElementById('span-design-is');
    var spanND  = document.getElementById('span-not-decoration');
    var spanIAW = document.getElementById('span-its-a-way');
    var spanTO  = document.getElementById('span-to-organize');
    if (spanDI)  spanDI.textContent  = t.quoteLine1Inside;
    if (spanND)  spanND.textContent  = t.quoteLine1Outside;
    if (spanIAW) spanIAW.textContent = t.quoteLine2Inside;
    if (spanTO)  spanTO.textContent  = t.quoteLine2Outside;

    // Headline
    var spanGraphic = document.getElementById('span-graphic');
    var spanDesignText = document.getElementById('span-design-text');
    var spanIllus = document.getElementById('span-illustration');
    var headline = document.getElementById('headline');
    if (spanGraphic) spanGraphic.textContent = t.graphic;
    if (spanDesignText) spanDesignText.textContent = t.design;
    if (spanIllus) spanIllus.textContent = t.illustration;

    // Scale headline + quote for Polish (longer words)
    if (headline) {
        headline.classList.toggle('hero__headline--pl', lang === 'pl');
    }
    var quoteEl = document.getElementById('quote');
    if (quoteEl) {
        quoteEl.classList.toggle('hero__quote--pl', lang === 'pl');
    }

    // About section
    var aboutHL = document.getElementById('about-headline');
    var aboutB1 = document.getElementById('about-body');
    var aboutB2 = document.getElementById('about-body2');
    if (aboutHL) aboutHL.textContent = t.aboutHeadline;
    if (aboutB1) aboutB1.innerHTML = t.aboutBody1;
    if (aboutB2) aboutB2.innerHTML = t.aboutBody2;

    // Projects section
    var projHL = document.getElementById('projects-headline');
    var projFilters = document.querySelectorAll('#projects .projects__filter');
    var stickyFilters = document.querySelectorAll('#projects-filters-sticky .projects__filter');
    var projSeeMore = document.getElementById('see-more-btn');
    if (projHL) projHL.textContent = t.projectsHeadline;
    for (var j = 0; j < projFilters.length && j < t.projectsFilters.length; j++) {
        projFilters[j].textContent = t.projectsFilters[j];
    }
    for (var j = 0; j < stickyFilters.length && j < t.projectsFilters.length; j++) {
        stickyFilters[j].textContent = t.projectsFilters[j];
    }
    if (projSeeMore && !allShownFlag) projSeeMore.textContent = t.projectsSeeMore;
    var projSubFilters = document.querySelectorAll('#projects-subfilters .projects__subfilter');
    for (var j = 0; j < projSubFilters.length && j < t.projectsSubFilters.length; j++) {
        projSubFilters[j].textContent = t.projectsSubFilters[j];
    }
    var cardMoreBtns = document.querySelectorAll('.projects__card-more');
    for (var j = 0; j < cardMoreBtns.length; j++) {
        cardMoreBtns[j].textContent = t.projectsCardMore;
    }

    // Contact section
    var contactHL = document.getElementById('contact-headline');
    if (contactHL) contactHL.textContent = t.contactHeadline;

    // Update active language styling (desktop + mobile)
    var langPairs = [
        [document.getElementById('lang-eng'), document.getElementById('lang-pl')],
        [document.getElementById('mobile-lang-eng'), document.getElementById('mobile-lang-pl')]
    ];
    for (var p = 0; p < langPairs.length; p++) {
        var engSpan = langPairs[p][0];
        var plSpan  = langPairs[p][1];
        if (engSpan && plSpan) {
            engSpan.classList.toggle('header__lang-active', lang === 'en');
            engSpan.classList.toggle('header__lang-inactive', lang !== 'en');
            plSpan.classList.toggle('header__lang-active', lang === 'pl');
            plSpan.classList.toggle('header__lang-inactive', lang !== 'pl');
        }
    }

    // Update mobile menu links
    var mobileLinks = document.querySelectorAll('.mobile-menu__link');
    for (var i = 0; i < mobileLinks.length && i < t.nav.length; i++) {
        mobileLinks[i].textContent = t.nav[i];
    }

    // Re-calculate layout after text change
    positionLayout();
}

function setActiveNavLink(clickedLink) {
    var links = document.querySelectorAll('.header__nav-link');
    for (var i = 0; i < links.length; i++) {
        links[i].classList.remove('header__nav-link--active');
    }
    if (clickedLink) {
        clickedLink.classList.add('header__nav-link--active');
    }
}

function initNavActiveState() {
    var links = document.querySelectorAll('.header__nav-link');
    for (var i = 0; i < links.length; i++) {
        links[i].addEventListener('click', function(e) {
            setActiveNavLink(this);
        });
    }
    // Update active link on scroll based on which section is in view
    function updateActiveOnScroll() {
        var sections = ['about', 'projects', 'contact'];
        var scrollY = window.scrollY || window.pageYOffset;
        var headerHeight = document.querySelector('.header').offsetHeight;
        var activeLink = null;
        for (var i = 0; i < sections.length; i++) {
            var section = document.getElementById(sections[i]);
            if (section && section.offsetTop - headerHeight - 100 <= scrollY) {
                activeLink = links[i];
            }
        }
        for (var j = 0; j < links.length; j++) {
            links[j].classList.remove('header__nav-link--active');
        }
        if (activeLink) {
            activeLink.classList.add('header__nav-link--active');
        }
    }
    window.addEventListener('scroll', updateActiveOnScroll, { passive: true });
    updateActiveOnScroll();
}

var currentFilter = 'logos';
var currentSubFilter = 'all';
var allShownFlag = false;

function filterProjects() {
    var projectsGrid = document.getElementById('projects-grid');
    if (!projectsGrid) return;
    var allCards = projectsGrid.querySelectorAll('.projects__card');
    var isMobile = window.innerWidth <= 768;
    var limit = isMobile ? 3 : 6;
    var visibleCount = 0;

    allCards.forEach(function(card) {
        var category = card.getAttribute('data-category');
        var subcategory = card.getAttribute('data-subcategory');
        var matchesCategory = category === currentFilter;
        var matchesSub = currentSubFilter === 'all' || !subcategory || subcategory === currentSubFilter;
        if (matchesCategory && matchesSub) {
            if (allShownFlag || visibleCount < limit) {
                card.classList.remove('projects__card--hidden');
                visibleCount++;
            } else {
                card.classList.add('projects__card--hidden');
            }
        } else {
            card.classList.add('projects__card--hidden');
        }
    });

    // Show/hide sub-filters
    var subfilters = document.getElementById('projects-subfilters');
    if (subfilters) {
        if (currentFilter === 'print-ads') {
            subfilters.classList.add('projects__subfilters--visible');
        } else {
            subfilters.classList.remove('projects__subfilters--visible');
        }
    }

    // Update see more button
    var seeMoreBtn = document.getElementById('see-more-btn');
    if (!seeMoreBtn) return;
    var matchingCards = 0;
    allCards.forEach(function(card) {
        var category = card.getAttribute('data-category');
        var subcategory = card.getAttribute('data-subcategory');
        var matchesSub = currentSubFilter === 'all' || !subcategory || subcategory === currentSubFilter;
        if (category === currentFilter && matchesSub) matchingCards++;
    });
    if (allShownFlag || matchingCards <= limit) {
        seeMoreBtn.style.display = 'none';
    } else {
        seeMoreBtn.style.display = '';
        seeMoreBtn.textContent = translations[currentLang].projectsSeeMore;
    }

}

function scrollToProjects() {
    var filters = document.querySelector('.projects__filters');
    var header = document.querySelector('.header');
    if (filters) {
        var headerHeight = header ? header.offsetHeight : 0;
        var top = filters.getBoundingClientRect().top + window.scrollY - headerHeight;
        window.scrollTo({ top: top, behavior: 'smooth' });
    }
}

function initProjectFilters() {
    var allFilters = document.querySelectorAll('.projects__filter');
    var allSubFilters = document.querySelectorAll('.projects__subfilter');

    for (var i = 0; i < allFilters.length; i++) {
        allFilters[i].addEventListener('click', function() {
            var category = this.getAttribute('data-category');
            currentFilter = category;
            currentSubFilter = 'all';
            allShownFlag = false;
            for (var j = 0; j < allFilters.length; j++) {
                if (allFilters[j].getAttribute('data-category') === category) {
                    allFilters[j].classList.add('projects__filter--active');
                } else {
                    allFilters[j].classList.remove('projects__filter--active');
                }
            }
            // Reset sub-filter active state
            for (var k = 0; k < allSubFilters.length; k++) {
                allSubFilters[k].classList.toggle('projects__subfilter--active',
                    allSubFilters[k].getAttribute('data-subcategory') === 'all');
            }
            filterProjects();
            scrollToProjects();
        });
    }

    for (var i = 0; i < allSubFilters.length; i++) {
        allSubFilters[i].addEventListener('click', function() {
            currentSubFilter = this.getAttribute('data-subcategory');
            allShownFlag = false;
            for (var k = 0; k < allSubFilters.length; k++) {
                allSubFilters[k].classList.toggle('projects__subfilter--active',
                    allSubFilters[k].getAttribute('data-subcategory') === currentSubFilter);
            }
            filterProjects();
            scrollToProjects();
        });
    }

    // Apply initial filter
    filterProjects();
}

function initStickyFilters() {
    var projectsSection = document.getElementById('projects');
    var stickyFilters = document.getElementById('projects-filters-sticky');
    var originalFilters = document.querySelector('.projects__filters');
    var header = document.querySelector('.header');
    if (!projectsSection || !stickyFilters || !originalFilters) return;

    function update() {
        var headerHeight = header ? header.getBoundingClientRect().height : 60;
        var sectionRect = projectsSection.getBoundingClientRect();
        var origRect = originalFilters.getBoundingClientRect();
        var pastHeader = origRect.bottom < headerHeight;
        var sectionVisible = sectionRect.bottom > headerHeight + 50;

        if (pastHeader && sectionVisible) {
            stickyFilters.classList.add('projects__filters-sticky--visible');
        } else {
            stickyFilters.classList.remove('projects__filters-sticky--visible');
        }
    }

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();
}

function initLanguageSwitcher() {
    var engSpan = document.getElementById('lang-eng');
    var plSpan  = document.getElementById('lang-pl');
    var mEngSpan = document.getElementById('mobile-lang-eng');
    var mPlSpan  = document.getElementById('mobile-lang-pl');
    if (engSpan) engSpan.addEventListener('click', function() { setLanguage('en'); });
    if (plSpan)  plSpan.addEventListener('click', function()  { setLanguage('pl'); });
    if (mEngSpan) mEngSpan.addEventListener('click', function() { setLanguage('en'); });
    if (mPlSpan)  mPlSpan.addEventListener('click', function()  { setLanguage('pl'); });
}

function initMobileMenu() {
    var hamburger = document.getElementById('hamburger-btn');
    var mobileMenu = document.getElementById('mobile-menu');
    var closeBtn = document.getElementById('mobile-menu-close');
    var panel = document.getElementById('mobile-menu-panel');
    var backdrop = document.getElementById('mobile-menu-backdrop');
    if (!hamburger || !mobileMenu) return;

    function closeMenu() {
        mobileMenu.classList.remove('mobile-menu--open');
    }

    hamburger.addEventListener('click', function() {
        mobileMenu.classList.add('mobile-menu--open');
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', closeMenu);
    }

    if (backdrop) {
        backdrop.addEventListener('click', closeMenu);
    }

    // Close when clicking empty space inside the panel (not on links/buttons)
    if (panel) {
        panel.addEventListener('click', function(e) {
            if (e.target === panel) closeMenu();
        });
    }

    var mobileLinks = mobileMenu.querySelectorAll('.mobile-menu__link');
    for (var i = 0; i < mobileLinks.length; i++) {
        mobileLinks[i].addEventListener('click', closeMenu);
    }
}

function initLightbox() {
    var lightbox = document.getElementById('lightbox');
    var lightboxImage = document.getElementById('lightbox-image');
    var lightboxCaption = document.getElementById('lightbox-caption');
    var lightboxCounter = document.getElementById('lightbox-counter');
    var lightboxTabs = document.getElementById('lightbox-tabs');
    var closeBtn = document.getElementById('lightbox-close');
    var prevBtn = document.getElementById('lightbox-prev');
    var nextBtn = document.getElementById('lightbox-next');
    var lightboxProjects = [];
    var currentProjectIndex = 0;
    var currentImageIndex = 0;
    var triggerElement = null;
    if (!lightbox) return;

    function getFocusableElements() {
        var elements = lightbox.querySelectorAll(
            'button:not([disabled]):not([style*="display: none"]), [href], [tabindex]:not([tabindex="-1"])'
        );
        return Array.from(elements).filter(function(el) {
            return el.offsetParent !== null;
        });
    }

    function trapFocus(e) {
        var focusable = getFocusableElements();
        if (focusable.length === 0) return;
        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        if (e.shiftKey) {
            if (document.activeElement === first) {
                e.preventDefault();
                last.focus();
            }
        } else {
            if (document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    }

    function updateProjectList() {
        var allCards = document.querySelectorAll('.projects__card[data-category="' + currentFilter + '"]');
        lightboxProjects = [];
        allCards.forEach(function(card) {
            // Respect active sub-filter
            if (currentSubFilter !== 'all') {
                var subcategory = card.getAttribute('data-subcategory');
                if (subcategory && subcategory !== currentSubFilter) return;
            }
            var project = { images: [] };
            var imagesData = card.getAttribute('data-images');
            if (imagesData) {
                try { project.images = JSON.parse(imagesData); } catch (e) {}
            }
            if (project.images.length === 0) {
                var img = card.querySelector('.projects__card-image img');
                if (img) {
                    project.images.push({ src: img.src, label: '', alt: img.alt });
                }
            }
            if (project.images.length > 0) lightboxProjects.push(project);
        });
    }

    function openLightbox(index) {
        triggerElement = document.activeElement;
        updateProjectList();
        currentProjectIndex = (index >= 0 && index < lightboxProjects.length) ? index : 0;
        currentImageIndex = 0;
        showCurrentImage();
        renderTabs();
        lightbox.classList.add('lightbox--open');
        document.body.style.overflow = 'hidden';
        updateNavButtons();
        closeBtn.focus();
    }

    function closeLightbox() {
        lightbox.classList.remove('lightbox--open');
        document.body.style.overflow = '';
        if (triggerElement && triggerElement.focus) {
            triggerElement.focus();
            triggerElement = null;
        }
    }

    function showCurrentImage() {
        var project = lightboxProjects[currentProjectIndex];
        if (!project || !project.images[currentImageIndex]) return;
        var imageData = project.images[currentImageIndex];

        lightboxImage.style.opacity = '0.5';
        var img = new Image();
        img.onload = function() {
            lightboxImage.src = imageData.src;
            lightboxImage.alt = imageData.alt || '';
            lightboxImage.style.opacity = '1';
        };
        img.src = imageData.src;

        lightboxCaption.textContent = imageData.alt || '';

        var counter = (currentProjectIndex + 1) + ' / ' + lightboxProjects.length;
        if (project.images.length > 1) {
            counter += ' \u2022 ' + (currentImageIndex + 1) + '/' + project.images.length;
        }
        lightboxCounter.textContent = counter;

        updateActiveTabs();
        preloadImages();
    }

    function renderTabs() {
        if (!lightboxTabs) return;
        lightboxTabs.innerHTML = '';
        var project = lightboxProjects[currentProjectIndex];
        if (!project || project.images.length <= 1) return;

        project.images.forEach(function(img, index) {
            var tab = document.createElement('button');
            tab.className = 'lightbox__tab' + (index === currentImageIndex ? ' lightbox__tab--active' : '');
            tab.textContent = img.label || ('View ' + (index + 1));
            tab.addEventListener('click', function() {
                currentImageIndex = index;
                showCurrentImage();
            });
            lightboxTabs.appendChild(tab);
        });
    }

    function updateActiveTabs() {
        if (!lightboxTabs) return;
        var tabs = lightboxTabs.querySelectorAll('.lightbox__tab');
        tabs.forEach(function(tab, index) {
            tab.classList.toggle('lightbox__tab--active', index === currentImageIndex);
        });
    }

    function preloadImages() {
        var project = lightboxProjects[currentProjectIndex];
        if (!project) return;
        project.images.forEach(function(img) { new Image().src = img.src; });
        var prev = lightboxProjects[(currentProjectIndex - 1 + lightboxProjects.length) % lightboxProjects.length];
        var next = lightboxProjects[(currentProjectIndex + 1) % lightboxProjects.length];
        if (prev && prev.images[0]) new Image().src = prev.images[0].src;
        if (next && next.images[0]) new Image().src = next.images[0].src;
    }

    function updateNavButtons() {
        prevBtn.style.display = currentProjectIndex <= 0 ? 'none' : '';
        nextBtn.style.display = currentProjectIndex >= lightboxProjects.length - 1 ? 'none' : '';
    }

    function prevProject() {
        if (currentProjectIndex <= 0) return;
        currentProjectIndex--;
        currentImageIndex = 0;
        showCurrentImage();
        renderTabs();
        updateNavButtons();
    }

    function nextProject() {
        if (currentProjectIndex >= lightboxProjects.length - 1) return;
        currentProjectIndex++;
        currentImageIndex = 0;
        showCurrentImage();
        renderTabs();
        updateNavButtons();
    }

    function nextImageInProject() {
        var project = lightboxProjects[currentProjectIndex];
        if (project && project.images.length > 1) {
            currentImageIndex = (currentImageIndex + 1) % project.images.length;
            showCurrentImage();
        }
    }

    function prevImageInProject() {
        var project = lightboxProjects[currentProjectIndex];
        if (project && project.images.length > 1) {
            currentImageIndex = (currentImageIndex - 1 + project.images.length) % project.images.length;
            showCurrentImage();
        }
    }

    document.getElementById('projects-grid').addEventListener('click', function(e) {
        var cardImage = e.target.closest('.projects__card-image');
        var moreBtn = e.target.closest('.projects__card-more');
        if (cardImage || moreBtn) {
            var card = e.target.closest('.projects__card');
            if (card && card.getAttribute('data-category') === currentFilter) {
                e.preventDefault();
                e.stopPropagation();
                var allInCategory = document.querySelectorAll('.projects__card[data-category="' + currentFilter + '"]');
                var index = Array.from(allInCategory).indexOf(card);
                if (index >= 0) openLightbox(index);
            }
        }
    });

    closeBtn.addEventListener('click', closeLightbox);
    prevBtn.addEventListener('click', function(e) { e.stopPropagation(); prevProject(); });
    nextBtn.addEventListener('click', function(e) { e.stopPropagation(); nextProject(); });

    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', function(e) {
        if (!lightbox.classList.contains('lightbox--open')) return;
        if (e.key === 'Tab') trapFocus(e);
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') prevProject();
        if (e.key === 'ArrowRight') nextProject();
        if (e.key === 'ArrowUp') { e.preventDefault(); prevImageInProject(); }
        if (e.key === 'ArrowDown') { e.preventDefault(); nextImageInProject(); }
    });

    var touchStartX = 0;
    var touchStartY = 0;
    lightbox.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });
    lightbox.addEventListener('touchend', function(e) {
        var diffX = touchStartX - e.changedTouches[0].screenX;
        var diffY = touchStartY - e.changedTouches[0].screenY;
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
            if (diffX > 0) nextProject(); else prevProject();
        } else if (Math.abs(diffY) > 50) {
            if (diffY > 0) nextImageInProject(); else prevImageInProject();
        }
    }, { passive: true });
}

function initImageLoading() {
    var lazyImages = document.querySelectorAll('img[loading="lazy"]');
    lazyImages.forEach(function(img) {
        if (img.complete) {
            img.classList.add('loaded');
        } else {
            img.addEventListener('load', function() {
                img.classList.add('loaded');
            });
            img.addEventListener('error', function() {
                img.classList.add('loaded');
            });
        }
    });
}

function initLoadMore() {
    var seeMoreBtn = document.getElementById('see-more-btn');
    if (!seeMoreBtn) return;

    seeMoreBtn.addEventListener('click', function() {
        allShownFlag = true;
        filterProjects();
        seeMoreBtn.style.display = 'none';
    });

    window.addEventListener('resize', function() {
        if (!allShownFlag) filterProjects();
    });
}

function initAll() {
    positionLayout();
    initLanguageSwitcher();
    initNavActiveState();
    initProjectFilters();
    initStickyFilters();
    initMobileMenu();
    initLightbox();
    initLoadMore();
    initImageLoading();
    try {
        var saved = localStorage.getItem('lang');
        if (saved && saved !== currentLang) setLanguage(saved);
    } catch (e) {}
}

if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(initAll);
} else {
    window.addEventListener('load', initAll);
}
window.addEventListener('resize', debounce(positionLayout, 100));
