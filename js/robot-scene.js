// Interactive robot playground (About section).
// Autopilot delivers packages on its own; clicking the scene hands control
// to the user: arrow keys / A-D drive, space picks up or drops. Touch
// devices get on-screen buttons. Autopilot resumes on Escape, on clicking
// outside, or after 12s of inactivity.
document.addEventListener('DOMContentLoaded', function () {
    var scene = document.getElementById('robotScene');
    var rover = document.getElementById('rover');
    var pkg = document.getElementById('package');
    var box = document.getElementById('dropBox');
    var hint = document.getElementById('hudHint');
    var scoreEl = document.getElementById('hudScore');
    var controls = document.getElementById('sceneControls');
    if (!scene || !rover || !pkg || !box) return;

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var ROVER_W = 96;   // matches .rover width in css/home.css
    var PKG_W = 18;
    var SPEED = 170;    // px per second
    var PICK_RANGE = 46;
    var DROP_RANGE = 55;

    var state = {
        mode: 'auto',          // 'auto' | 'manual'
        x: 8,
        dir: 1,
        carrying: false,
        pkgX: 120,
        pkgState: 'ground',    // 'ground' | 'carried' | 'delivered'
        score: 0,
        waitUntil: 0,
        lastInput: 0,
        input: { left: false, right: false }
    };

    function sceneW() { return scene.clientWidth; }
    function boxCenter() { return sceneW() - 20 - 23; } // .drop-box: right 20px, width 46px
    function roverCenter() { return state.x + ROVER_W / 2; }
    function maxX() { return Math.max(4, sceneW() - ROVER_W - 4); }

    function respawnPackage() {
        var min = 24;
        var max = Math.max(min + 60, sceneW() - 220);
        state.pkgX = min + Math.random() * (max - min);
        state.pkgState = 'ground';
        pkg.style.opacity = '1';
    }

    function setHint(text) { if (hint) hint.textContent = text; }

    function tryGrab() {
        if (state.carrying) {
            state.carrying = false;
            if (Math.abs(roverCenter() - boxCenter()) < DROP_RANGE) {
                state.pkgState = 'delivered';
                state.pkgX = boxCenter() - PKG_W / 2;
                state.score++;
                if (scoreEl) scoreEl.textContent = 'delivered: ' + state.score;
                box.classList.add('flash');
                setTimeout(function () { box.classList.remove('flash'); }, 700);
                setTimeout(function () {
                    pkg.style.opacity = '0';
                    setTimeout(respawnPackage, 500);
                }, 350);
            } else {
                state.pkgState = 'ground';
                state.pkgX = Math.min(Math.max(roverCenter() - PKG_W / 2, 4), sceneW() - PKG_W - 4);
            }
        } else if (state.pkgState === 'ground' &&
                   Math.abs(roverCenter() - (state.pkgX + PKG_W / 2)) < PICK_RANGE) {
            state.carrying = true;
            state.pkgState = 'carried';
        }
    }

    function engageManual() {
        if (state.mode !== 'manual') {
            state.mode = 'manual';
            setHint('// manual — ◀ ▶ drive · space pick/drop · esc autopilot');
        }
        state.lastInput = performance.now();
    }

    function resumeAuto() {
        state.mode = 'auto';
        state.input.left = state.input.right = false;
        setHint('// autopilot on — click to take control');
    }

    function update(dt, now) {
        var move = 0;

        if (state.mode === 'manual') {
            if (state.input.left) move -= 1;
            if (state.input.right) move += 1;
            if (now - state.lastInput > 12000) resumeAuto();
        } else if (now >= state.waitUntil) {
            var target = state.carrying ? boxCenter()
                : (state.pkgState === 'ground' ? state.pkgX + PKG_W / 2 : null);
            if (target !== null) {
                var d = target - roverCenter();
                // the box center sits past the rover's clamp range, so hitting
                // the travel limit also counts as arrival
                var atLimit = (d > 0 && state.x >= maxX() - 0.5) ||
                              (d < 0 && state.x <= 4.5);
                if (Math.abs(d) > 12 && !atLimit) {
                    move = d > 0 ? 1 : -1;
                } else {
                    tryGrab();
                    state.waitUntil = now + 800;
                }
            }
        }

        if (move !== 0) {
            state.x += move * SPEED * dt;
            state.dir = move;
        }
        state.x = Math.min(Math.max(state.x, 4), maxX());

        rover.style.transform = 'translateX(' + state.x.toFixed(1) + 'px) scaleX(' + state.dir + ')';
        rover.classList.toggle('moving', move !== 0);

        if (state.pkgState === 'carried') {
            state.pkgX = roverCenter() - PKG_W / 2;
            pkg.style.transform = 'translate(' + state.pkgX.toFixed(1) + 'px, -44px)';
        } else {
            pkg.style.transform = 'translateX(' + state.pkgX.toFixed(1) + 'px)';
        }
    }

    if (reduceMotion) {
        // static tableau: rover mid-scene, package on the ground, no loop
        rover.style.transform = 'translateX(' + Math.round(sceneW() * 0.3) + 'px)';
        pkg.style.transform = 'translateX(' + Math.round(sceneW() * 0.55) + 'px)';
        setHint('// animations paused (reduced motion)');
        if (controls) controls.style.display = 'none';
        return;
    }

    // --- keyboard ---
    var KEY_LEFT = { ArrowLeft: 1, a: 1, A: 1 };
    var KEY_RIGHT = { ArrowRight: 1, d: 1, D: 1 };
    var KEY_GRAB = { ' ': 1, e: 1, E: 1, ArrowDown: 1 };

    window.addEventListener('keydown', function (e) {
        if (state.mode !== 'manual') {
            // scene still focused after an autopilot handback: any control key re-engages
            if (document.activeElement === scene &&
                (KEY_LEFT[e.key] || KEY_RIGHT[e.key] || KEY_GRAB[e.key])) {
                engageManual();
            } else {
                return;
            }
        }
        if (KEY_LEFT[e.key]) { state.input.left = true; }
        else if (KEY_RIGHT[e.key]) { state.input.right = true; }
        else if (KEY_GRAB[e.key]) { if (!e.repeat) tryGrab(); }
        else if (e.key === 'Escape') { resumeAuto(); return; }
        else return;
        state.lastInput = performance.now();
        e.preventDefault();
    });

    window.addEventListener('keyup', function (e) {
        if (KEY_LEFT[e.key]) state.input.left = false;
        if (KEY_RIGHT[e.key]) state.input.right = false;
    });

    // --- pointer/focus: engage on click or keyboard focus, resume on leave ---
    scene.addEventListener('pointerdown', engageManual);
    scene.addEventListener('focus', engageManual);
    scene.addEventListener('focusout', function (e) {
        if (!e.relatedTarget || !scene.contains(e.relatedTarget)) resumeAuto();
    });
    document.addEventListener('pointerdown', function (e) {
        if (state.mode === 'manual' && !scene.contains(e.target)) resumeAuto();
    });

    // --- touch / on-screen buttons ---
    if (controls) {
        controls.querySelectorAll('button').forEach(function (btn) {
            var act = btn.getAttribute('data-act');
            if (act === 'grab') {
                btn.addEventListener('pointerdown', function (e) {
                    e.stopPropagation();
                    engageManual();
                    tryGrab();
                });
            } else {
                btn.addEventListener('pointerdown', function (e) {
                    e.stopPropagation();
                    engageManual();
                    state.input[act] = true;
                });
                ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) {
                    btn.addEventListener(ev, function () { state.input[act] = false; });
                });
            }
        });
    }

    // --- main loop ---
    respawnPackage();
    state.pkgX = Math.max(60, sceneW() * 0.4); // deterministic first target
    var last = performance.now();
    function frame(now) {
        var dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        update(dt, now);
        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
});
