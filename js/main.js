// Shared behaviors: mobile nav, scroll reveal, typing effect, footer year
document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', function () {
    // --- mobile nav toggle ---
    var toggle = document.querySelector('.nav-toggle');
    var links = document.querySelector('.nav-links');
    if (toggle && links) {
        toggle.addEventListener('click', function () {
            toggle.classList.toggle('open');
            links.classList.toggle('open');
        });
        links.addEventListener('click', function (e) {
            if (e.target.tagName === 'A') {
                toggle.classList.remove('open');
                links.classList.remove('open');
            }
        });
    }

    // --- scroll reveal ---
    var revealEls = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });
        revealEls.forEach(function (el) { observer.observe(el); });
    } else {
        revealEls.forEach(function (el) { el.classList.add('visible'); });
    }

    // --- typing effect (hero subtitle) ---
    var typedEl = document.querySelector('[data-typing]');
    if (typedEl) {
        var phrases;
        try {
            phrases = JSON.parse(typedEl.getAttribute('data-typing'));
        } catch (err) {
            phrases = [typedEl.textContent];
        }
        var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduceMotion || !phrases.length) {
            typedEl.textContent = phrases[0] || typedEl.textContent;
        } else {
            var phraseIndex = 0;
            var charIndex = 0;
            var deleting = false;
            typedEl.textContent = '';
            (function tick() {
                var phrase = phrases[phraseIndex];
                if (!deleting) {
                    charIndex++;
                    typedEl.textContent = phrase.slice(0, charIndex);
                    if (charIndex === phrase.length) {
                        deleting = true;
                        setTimeout(tick, 2200);
                        return;
                    }
                    setTimeout(tick, 70);
                } else {
                    charIndex--;
                    typedEl.textContent = phrase.slice(0, charIndex);
                    if (charIndex === 0) {
                        deleting = false;
                        phraseIndex = (phraseIndex + 1) % phrases.length;
                    }
                    setTimeout(tick, 35);
                }
            })();
        }
    }

    // --- footer year ---
    var yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }
});
