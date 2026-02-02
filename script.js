/**
 * Grid-spine "Vertical Pillar" positioning + language switching.
 */
function positionLayout() {
    var hero    = document.getElementById('hero');
    var block   = document.getElementById('red-block');
    var spanD   = document.getElementById('span-design');
    var spanDT  = document.getElementById('span-design-text');
    var spanDI  = document.getElementById('span-design-is');
    var spanIAW = document.getElementById('span-its-a-way');
    var quote   = document.getElementById('quote');

    if (!hero || !block || !spanD || !spanDT || !spanDI || !spanIAW || !quote) return;

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

        // Top: below quote
        var minTop = quoteBottom - h.top + 15;

        // Height spans from minTop to blockBottom
        var blockHeight = blockBottom - minTop;
        var blockTop = minTop;

        // Ensure minimum height covers DESIGN
        if (blockHeight < d.height * 1.5) {
            blockHeight = d.height * 2;
            blockTop = blockBottom - blockHeight;
            if (blockTop < minTop) blockTop = minTop;
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
        nav: ['About me', 'Projects', 'Contact'],
        role: 'Graphic Designer & Illustrator',
        quoteLine1Inside: 'Design is\u00a0 ',
        quoteLine1Outside: 'not decoration.',
        quoteLine2Inside: "It\u2019s a way ",
        quoteLine2Outside: 'to organize meaning.',
        graphic: 'GRAPHIC ',
        design: 'DESIGN',
        illustration: '& ILLUSTRATION',
        aboutHeadline: 'ABOUT ME',
        aboutBody1: 'Graphic designer and illustrator<br>with <strong class="about__highlight">4 years of professional experience.</strong>',
        aboutBody2: 'I create visual identities and illustrations that speak before words do \u2014 <strong class="about__highlight">clear in structure, bold in feeling.</strong>',
        projectsHeadline: 'PROJECTS',
        projectsFilters: ['Logos', 'Illustrations', 'Social media', 'Print ads'],
        projectsSeeMore: 'See more projects',
        projectsCardMore: 'more',
        contactHeadline: 'CONTACT'
    },
    pl: {
        nav: ['O mnie', 'Projekty', 'Kontakt'],
        role: 'Projektant Graficzny & Ilustrator',
        quoteLine1Inside: 'Design to nie ',
        quoteLine1Outside: 'dekoracja.',
        quoteLine2Inside: 'To spos\u00F3b na ',
        quoteLine2Outside: 'organizowanie znacze\u0144.',
        graphic: 'PROJEKTOWANIE ',
        design: 'GRAFICZNE',
        illustration: '& ILUSTRACJA',
        aboutHeadline: 'O MNIE',
        aboutBody1: 'Graficzka i ilustratorka<br>z <strong class="about__highlight">4-letnim do\u015Bwiadczeniem zawodowym.</strong>',
        aboutBody2: 'Tworz\u0119 identyfikacje wizualne i ilustracje, kt\u00F3re m\u00F3wi\u0105 zanim padnie s\u0142owo \u2014 <strong class="about__highlight">czytelne w strukturze, odwa\u017Cne w wyrazie.</strong>',
        projectsHeadline: 'PROJEKTY',
        projectsFilters: ['Logotypy', 'Ilustracje', 'Media spo\u0142eczno\u015Bciowe', 'Reklamy drukowane'],
        projectsSeeMore: 'Zobacz wi\u0119cej projekt\u00F3w',
        projectsCardMore: 'wi\u0119cej',
        contactHeadline: 'KONTAKT'
    }
};

function setLanguage(lang) {
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
    if (projSeeMore) projSeeMore.textContent = t.projectsSeeMore;
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
    window.addEventListener('scroll', updateActiveOnScroll);
    updateActiveOnScroll();
}

function initProjectFilters() {
    var allFilters = document.querySelectorAll('.projects__filter');
    for (var i = 0; i < allFilters.length; i++) {
        allFilters[i].addEventListener('click', function() {
            var category = this.getAttribute('data-category');
            for (var j = 0; j < allFilters.length; j++) {
                if (allFilters[j].getAttribute('data-category') === category) {
                    allFilters[j].classList.add('projects__filter--active');
                } else {
                    allFilters[j].classList.remove('projects__filter--active');
                }
            }
        });
    }
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
    if (!hamburger || !mobileMenu) return;

    hamburger.addEventListener('click', function() {
        mobileMenu.classList.toggle('mobile-menu--open');
        hamburger.classList.toggle('header__hamburger--active');
    });

    var mobileLinks = mobileMenu.querySelectorAll('.mobile-menu__link');
    for (var i = 0; i < mobileLinks.length; i++) {
        mobileLinks[i].addEventListener('click', function() {
            mobileMenu.classList.remove('mobile-menu--open');
            hamburger.classList.remove('header__hamburger--active');
        });
    }
}

if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function() {
        positionLayout();
        initLanguageSwitcher();
        initNavActiveState();
        initProjectFilters();
        initStickyFilters();
        initMobileMenu();
    });
} else {
    window.addEventListener('load', function() {
        positionLayout();
        initLanguageSwitcher();
        initNavActiveState();
        initProjectFilters();
        initStickyFilters();
        initMobileMenu();
    });
}
window.addEventListener('resize', positionLayout);
