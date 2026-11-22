/* ============================================================
   Character Voice – illustrated SVG characters + talking face rig
   ------------------------------------------------------------
   window.CharacterArt.render(categoryKey, itemKey, { mood, size, label })
       → SVG markup string for one character (viewBox 0 0 200 200).
   window.CharacterArt.createRig(svgElement)
       → controller that blinks, glances, and lip-syncs the character.
   Every character shares the same face rig (eyes, brows, mouth), so
   lip-sync and moods work identically for all of them. Items without
   a drawing fall back to a generic round character in the item colour.
   ============================================================ */
(function () {
    'use strict';

    // ---------- palette & constants ----------
    const OL = '#2b2233';          // outline colour
    const SW = 3.2;                // outline width
    const MOUTH_IN = '#5b1a2a';
    const TONGUE = '#ef6f7f';
    const IRIS = '#3a2418';

    let uidCounter = 0;
    const uid = (p) => `cv-${p}-${++uidCounter}`;

    // ---------- drawing helpers ----------
    const attrs = (o) => Object.keys(o).map((k) => `${k}="${o[k]}"`).join(' ');

    // Filled shape with outline + soft volume shading overlay.
    function shp(tag, a, fill, o) {
        o = o || {};
        const sw = o.sw == null ? SW : o.sw;
        const t = o.t ? ` transform="${o.t}"` : '';
        const op = o.op != null ? ` opacity="${o.op}"` : '';
        let s = `<${tag} ${attrs(a)}${t}${op} fill="${fill}"` +
            (sw ? ` stroke="${o.stroke || OL}" stroke-width="${sw}" stroke-linejoin="round"` : '') + '/>';
        if (!o.flat) s += `<${tag} ${attrs(a)}${t} fill="url(#cv-shade)"/>`;
        return s;
    }

    const FLAT = { flat: true, sw: 0 };
    const flat = (o) => Object.assign({ flat: true, sw: 0 }, o);

    function E(cx, cy, rx, ry, fill, o) {
        if (o && o.rot) o = Object.assign({}, o, { t: `rotate(${o.rot} ${cx} ${cy})` });
        return shp('ellipse', { cx, cy, rx, ry }, fill, o);
    }
    const C = (cx, cy, r, fill, o) => shp('circle', { cx, cy, r }, fill, o);
    const P = (d, fill, o) => shp('path', { d }, fill, o);
    const R = (x, y, width, height, rx, fill, o) => shp('rect', { x, y, width, height, rx }, fill, o);

    // Mirror helpers (around x = 100). Paths must use absolute "x y" pairs only.
    const mir = (d) => d.replace(/(-?\d*\.?\d+)[ ,]+(-?\d*\.?\d+)/g, (m, x, y) => `${+(200 - x).toFixed(2)} ${y}`);
    const both = (d, fn) => fn(d) + fn(mir(d));
    const E2 = (cx, cy, rx, ry, fill, o) =>
        E(cx, cy, rx, ry, fill, o) + E(200 - cx, cy, rx, ry, fill, o && o.rot ? Object.assign({}, o, { rot: -o.rot }) : o);
    const C2 = (cx, cy, r, fill, o) => C(cx, cy, r, fill, o) + C(200 - cx, cy, r, fill, o);

    const L = (d, w, color, op) =>
        `<path d="${d}" fill="none" stroke="${color || OL}" stroke-width="${w || 3}" stroke-linecap="round" stroke-linejoin="round"${op != null ? ` opacity="${op}"` : ''}/>`;
    // Outlined tube (stems, tails, tentacles, straws…)
    const tube = (d, w, fill) => L(d, w + SW * 2, OL) + L(d, w, fill);
    const shine = (cx, cy, rx, ry, rot) =>
        `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#fff" opacity=".55"${rot ? ` transform="rotate(${rot} ${cx} ${cy})"` : ''}/>`;
    const dot = (cx, cy, r, fill, op) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"${op != null ? ` opacity="${op}"` : ''}/>`;

    // Scalloped ellipse outline (manes, florets, clouds, frosting, foam).
    function blobE(cx, cy, rx, ry, n, amp, rot) {
        rot = rot || 0;
        let d = '';
        for (let i = 0; i <= n; i++) {
            const a = rot + (i / n) * Math.PI * 2;
            const x = (cx + Math.cos(a) * rx).toFixed(1);
            const y = (cy + Math.sin(a) * ry).toFixed(1);
            if (i === 0) { d += `M${x} ${y}`; continue; }
            const m = rot + ((i - 0.5) / n) * Math.PI * 2;
            const qx = (cx + Math.cos(m) * (rx + amp)).toFixed(1);
            const qy = (cy + Math.sin(m) * (ry + amp)).toFixed(1);
            d += ` Q${qx} ${qy} ${x} ${y}`;
        }
        return d + 'Z';
    }

    function spiralPath(cx, cy, rMax, turns) {
        const end = turns * Math.PI * 2;
        let d = '';
        for (let t = 0; t <= end; t += 0.22) {
            const r = (rMax * t) / end;
            const x = (cx + Math.cos(t) * r).toFixed(1);
            const y = (cy + Math.sin(t) * r).toFixed(1);
            d += (d ? ' L' : 'M') + `${x} ${y}`;
        }
        return d;
    }

    function clipped(shapeMarkup, content) {
        const id = uid('clip');
        return `<clipPath id="${id}">${shapeMarkup}</clipPath><g clip-path="url(#${id})">${content}</g>`;
    }

    // ---------- limbs ----------
    // Thin cartoon arms with white gloves (drawn behind the body).
    function arms(o) {
        const { cx = 100, y = 120, x = 46, len = 20, drop = 14, color = OL, hand = '#fff', w = 4.2, hr = 6.5 } = o || {};
        let s = '';
        [-1, 1].forEach((k) => {
            const sx = cx + k * x;
            const ex = sx + k * len;
            const ey = y + drop;
            s += `<g class="cv-arm cv-arm-${k < 0 ? 'l' : 'r'}" style="transform-origin:${sx}px ${y}px">` +
                L(`M${sx} ${y} Q${sx + k * len * 0.7} ${y - 3} ${ex} ${ey}`, w, color) +
                C(ex, ey, hr, hand, { sw: 2.6 }) + '</g>';
        });
        return s;
    }

    // Thin legs with little shoes.
    function legs(o) {
        const { cx = 100, x = 18, top = 160, bottom = 178, color = OL, shoe = '#4a3b5c', w = 4.2 } = o || {};
        let s = '';
        [-1, 1].forEach((k) => {
            const lx = cx + k * x;
            s += L(`M${lx} ${top} L${lx} ${bottom}`, w, color) +
                E(lx + k * 4, bottom + 3, 10.5, 6, shoe, { sw: 2.6 }) +
                shine(lx + k * 4 - 3, bottom + 1, 3.5, 1.5);
        });
        return s;
    }

    // Furry paws / wings / fins hanging in front of the body.
    function sideArms(fill, d, ox, oy, extra) {
        const dr = mir(d);
        const ex = extra ? extra : () => '';
        return `<g class="cv-arm cv-arm-l" style="transform-origin:${ox}px ${oy}px">${P(d, fill)}${ex(false)}</g>` +
            `<g class="cv-arm cv-arm-r" style="transform-origin:${200 - ox}px ${oy}px">${P(dr, fill)}${ex(true)}</g>`;
    }
    const pawArms = (fill, y, x) => {
        y = y || 134; x = x || 30;
        const sx = 100 - x;
        return sideArms(fill, `M${sx + 4} ${y - 8} Q${sx - 14} ${y - 2} ${sx - 14} ${y + 16} Q${sx - 12} ${y + 26} ${sx - 2} ${y + 24} Q${sx + 8} ${y + 14} ${sx + 10} ${y}Z`, sx + 4, y - 6);
    };
    const wingArms = (fill, d, ox, oy, extra) => sideArms(fill, d || 'M56 104 Q34 130 44 160 Q58 152 62 126Z', ox || 58, oy || 106, extra);

    // ---------- face rig ----------
    const VIS = {
        etc: 'M-9 -1.5 Q0 -3 9 -1.5 Q7 5.5 0 5.5 Q-7 5.5 -9 -1.5Z',
        AI: 'M-11 -3 Q0 -5.5 11 -3 Q9.5 13 0 13 Q-9.5 13 -11 -3Z',
        E: 'M-12 -2.5 Q0 -2 12 -2.5 Q8.5 8 0 8 Q-8.5 8 -12 -2.5Z',
        O: 'M0 -5.5 Q6.5 -5.5 6.5 3 Q6.5 11.5 0 11.5 Q-6.5 11.5 -6.5 3 Q-6.5 -5.5 0 -5.5Z',
        U: 'M0 -2.5 Q4.2 -2.5 4.2 2 Q4.2 6.5 0 6.5 Q-4.2 6.5 -4.2 2 Q-4.2 -2.5 0 -2.5Z',
        L: 'M-10 -2 Q0 -4 10 -2 Q8 9 0 9 Q-8 9 -10 -2Z',
        FV: 'M-9 -1 Q0 -2 9 -1 Q6 4.5 0 4.5 Q-6 4.5 -9 -1Z',
    };
    const VIS_INNER = {
        etc: '<rect x="-11" y="-5" width="22" height="4.6" fill="#fff"/>',
        AI: `<rect x="-12" y="-7" width="24" height="5" fill="#fff"/><ellipse cx="0" cy="12" rx="7.5" ry="4.5" fill="${TONGUE}"/>`,
        E: '<rect x="-13" y="-5" width="26" height="4.5" fill="#fff"/><rect x="-13" y="5" width="26" height="4" fill="#fff"/>',
        O: `<rect x="-8" y="-7" width="16" height="3.4" fill="#fff"/><ellipse cx="0" cy="10.5" rx="4.6" ry="3" fill="${TONGUE}"/>`,
        U: `<ellipse cx="0" cy="5.5" rx="3" ry="2" fill="${TONGUE}"/>`,
        L: `<rect x="-11" y="-5" width="22" height="4" fill="#fff"/><ellipse cx="0" cy="1.5" rx="5" ry="3.2" fill="${TONGUE}"/>`,
        FV: '',
    };
    const REST = {
        happy: 'M-9 -1 Q0 7 9 -1',
        angry: 'M-8 4 Q0 -1.5 8 4',
        worried: 'M-8 2.5 Q-4 -0.5 0 2.5 Q4 5.5 8 2.5',
        sly: 'M-8 2.5 Q2 5 9 -3',
    };

    function openViseme(key) {
        const w = key === 'U' ? 3.4 : 2.6;
        let s = `<g class="cv-v cv-v-${key}"><path d="${VIS[key]}" fill="${MOUTH_IN}"/>`;
        if (VIS_INNER[key]) s += `<g clip-path="url(#cv-m-${key})">${VIS_INNER[key]}</g>`;
        s += `<path d="${VIS[key]}" fill="none" stroke="${OL}" stroke-width="${w}" stroke-linejoin="round"/>`;
        if (key === 'FV') s += `<rect x="-5" y="-2.2" width="10" height="4.2" rx="1.2" fill="#fff" stroke="${OL}" stroke-width="1.2"/>`;
        return s + '</g>';
    }

    function humanMouth(mood) {
        return `<g class="cv-v cv-v-X">${L(REST[mood] || REST.happy, 3)}</g>` +
            `<g class="cv-v cv-v-MBP">${L('M-8 0.5 Q0 2.5 8 0.5', 3.6)}${L('M-3.5 4.6 Q0 5.6 3.5 4.6', 1.6, OL, 0.45)}</g>` +
            ['etc', 'AI', 'E', 'O', 'U', 'L', 'FV'].map(openViseme).join('');
    }

    // Beaks open by sliding the lower half down with --open (set from data-v in CSS).
    function beak(type, color, low) {
        low = low || color;
        if (type === 'bill') {
            return `<ellipse cx="0" cy="6" rx="12" ry="6" fill="${MOUTH_IN}"/>` +
                `<g class="cv-jaw">${P('M-15 3 Q0 15 15 3 Q0 9 -15 3Z', low)}</g>` +
                P('M-18 -2 Q0 -11 18 -2 Q17 6 0 7 Q-17 6 -18 -2Z', color) + shine(-6, -3, 5, 1.8) +
                dot(-5, -2, 1.3, OL, 0.5) + dot(5, -2, 1.3, OL, 0.5);
        }
        if (type === 'hook') {
            return `<ellipse cx="0" cy="8" rx="6" ry="5" fill="${MOUTH_IN}"/>` +
                `<g class="cv-jaw">${P('M-7 4 Q0 6 7 4 L0 12Z', low)}</g>` +
                P('M-12 -5 Q0 -12 12 -5 Q10 6 1 16 Q-1 11 -3 7 Q-10 3 -12 -5Z', color) + shine(-4, -5, 3.5, 1.5);
        }
        return `<ellipse cx="0" cy="6" rx="5.5" ry="4.5" fill="${MOUTH_IN}"/>` +
            `<g class="cv-jaw">${P('M-7 3 Q0 5 7 3 L0 11Z', low)}</g>` +
            P('M-10 -3 Q0 -8 10 -3 Q4 3 0 9 Q-4 3 -10 -3Z', color) + shine(-3, -3, 3, 1.3);
    }

    function face(o) {
        const {
            x = 100, y = 95, s = 1, gap = 15, er = 1, iris = IRIS,
            mouth = 'human', mx = 0, my = 22, ms = 1,
            blush = '#ff7b8a', blushOp = 0.38, noBlush = false,
            brow = OL, beakColor = '#f5a623', beakLow, mood = 'happy',
        } = o;

        let eyes = '';
        [-1, 1].forEach((k) => {
            eyes += `<g transform="translate(${k * gap} 0)"><g class="cv-eye">` +
                `<ellipse cx="0" cy="0" rx="${8.5 * er}" ry="${10 * er}" fill="#fff" stroke="${OL}" stroke-width="2.4"/>` +
                `<g class="cv-look">` +
                `<circle cx="0" cy="${er}" r="${5.6 * er}" fill="${iris}"/>` +
                `<circle cx="0" cy="${er}" r="${3 * er}" fill="#160f14"/>` +
                `<circle cx="${1.8 * er}" cy="${-1.6 * er}" r="${1.8 * er}" fill="#fff"/>` +
                `<circle cx="${-1.7 * er}" cy="${3 * er}" r="${0.8 * er}" fill="#fff" opacity=".8"/>` +
                `</g></g></g>`;
        });

        const by1 = (-13 * er - 2).toFixed(1);
        const by2 = (-17 * er - 2).toFixed(1);
        const by3 = (-14 * er - 2).toFixed(1);
        const brows = `<g class="cv-brows">` +
            `<path class="cv-brow cv-brow-l" d="M${-gap - 7} ${by1} Q${-gap} ${by2} ${-gap + 7} ${by3}" fill="none" stroke="${brow}" stroke-width="3.2" stroke-linecap="round"/>` +
            `<path class="cv-brow cv-brow-r" d="M${gap - 7} ${by3} Q${gap} ${by2} ${gap + 7} ${by1}" fill="none" stroke="${brow}" stroke-width="3.2" stroke-linecap="round"/>` +
            `</g>`;

        const cheeks = noBlush ? '' :
            `<ellipse cx="${-(gap + 10 * er)}" cy="${11 * er}" rx="6" ry="3.4" fill="${blush}" opacity="${blushOp}"/>` +
            `<ellipse cx="${gap + 10 * er}" cy="${11 * er}" rx="6" ry="3.4" fill="${blush}" opacity="${blushOp}"/>`;

        const mouthMarkup = mouth === 'human' ? humanMouth(mood) : beak(mouth, beakColor, beakLow);
        const mouthGroup = `<g transform="translate(${mx} ${my}) scale(${ms})"><g class="cv-mouth">${mouthMarkup}</g></g>`;

        return `<g class="cv-face" transform="translate(${x} ${y}) scale(${s})">${cheeks}${eyes}${brows}${mouthGroup}</g>`;
    }

    // ---------- composition ----------
    function compose(p) {
        const neck = p.neck || '100px 130px';
        return `<ellipse class="cv-shadow" cx="${p.sx || 100}" cy="189" rx="${p.sr || 46}" ry="6.5" fill="${OL}" opacity=".13" style="transform-origin:${p.sx || 100}px 189px"/>` +
            `<g class="cv-rig">` +
            (p.back || '') + (p.legs || '') + (p.arms || '') + (p.body || '') + (p.front || '') +
            `<g class="cv-head" style="transform-origin:${neck}">` + (p.head || '') + p.face + (p.top || '') + `</g>` +
            `</g>`;
    }

    // Seated chibi animal body.
    function critter(o) {
        return {
            body: E(100, 150, 36, 30, o.fur) + (o.belly ? E(100, 156, 22, 19, o.belly, { sw: 0 }) : ''),
            front: E2(80, 178, 14, 8, o.feet || o.fur) + pawArms(o.paw || o.fur),
        };
    }
    const tail = (d, w, fill, ox, oy) => `<g class="cv-tail" style="transform-origin:${ox}px ${oy}px">${tube(d, w, fill)}</g>`;

    function penguin(F, emperor) {
        const black = '#2f3542', white = '#fdfdfd', orange = '#f39c33';
        return compose({
            legs: E2(84, 180, 15, 6, orange),
            arms: wingArms(black, 'M56 100 Q30 124 36 152 Q50 146 60 124Z', 56, 104),
            body: E(100, 108, 52, 70, black) +
                P('M100 58 Q78 46 66 66 Q58 84 66 100 Q56 128 66 154 Q80 174 100 174 Q120 174 134 154 Q144 128 134 100 Q142 84 134 66 Q122 46 100 58Z', white, { sw: 0 }) +
                (emperor ? E2(62, 90, 6, 12, '#ffcc33', flat({ rot: 20 })) : ''),
            face: F({ x: 100, y: 82, gap: 15, mouth: 'small', beakColor: orange, my: 18 }),
            neck: '100px 120px',
        });
    }

    // ============================================================
    // ARTWORK – one function per item, receives F(faceOptions)
    // ============================================================
    const ART = {
        // ---------------- ANIMALS ----------------
        animals: {
            dog(F) {
                const fur = '#c98b55', dark = '#8a5a35', muz = '#f4e3c8';
                return compose({
                    back: tail('M130 158 Q156 152 152 124', 9, fur, 130, 158),
                    ...critter({ fur, belly: muz, feet: muz }),
                    head: E(100, 80, 50, 44, fur) + E(118, 72, 15, 13, dark, flat({ op: 0.55 })) +
                        E(100, 104, 25, 17, muz, { sw: 2.4 }) +
                        both('M60 48 Q38 50 36 88 Q38 110 54 104 Q64 84 72 58Z', (d) => P(d, dark)) +
                        E(100, 94, 8, 5.5, OL, FLAT) + shine(97, 92.5, 2.5, 1.3),
                    face: F({ x: 100, y: 76, gap: 16, my: 30, ms: 0.9 }),
                });
            },
            cat(F) {
                const fur = '#f4a259', stripe = '#c96f2a', inner = '#f7a8b8', white = '#fff7ee';
                const whisk = (d) => L(d, 1.8, OL, 0.6);
                return compose({
                    back: tail('M128 160 Q162 160 160 126 Q158 110 146 112', 9, fur, 128, 160),
                    ...critter({ fur, belly: white }),
                    head: both('M56 62 L60 18 L92 42Z', (d) => P(d, fur)) +
                        both('M64 52 L66 30 L84 44Z', (d) => P(d, inner, FLAT)) +
                        E(100, 84, 50, 42, fur) +
                        L('M100 44 L100 56', 3.5, stripe) + both('M88 46 L90 56', (d) => L(d, 3.5, stripe)) +
                        both('M51 82 L63 84', (d) => L(d, 3.5, stripe)) + both('M52 92 L63 92', (d) => L(d, 3.5, stripe)) +
                        E2(91, 105, 11, 8.5, white, { sw: 0 }) +
                        P('M95 97 L105 97 L100 103Z', '#f08aa0', { sw: 2 }) +
                        both('M80 104 L56 100', whisk) + both('M80 108 L57 111', whisk),
                    face: F({ x: 100, y: 80, gap: 17, iris: '#5a8f29', my: 28, ms: 0.9 }),
                });
            },
            horse(F) {
                const fur = '#a8693f', mane = '#4a2c1d', snout = '#e0b48c';
                return compose({
                    back: tail('M130 160 Q162 162 158 132', 10, mane, 130, 160),
                    ...critter({ fur, belly: snout, feet: mane }),
                    head: both('M72 44 L72 12 L90 34Z', (d) => P(d, fur)) +
                        E(100, 80, 40, 52, fur) + E(100, 114, 31, 22, snout, { sw: 2.6 }) +
                        E2(89, 114, 3.2, 4.5, '#5b3a29', FLAT) +
                        P('M74 36 Q84 18 100 24 Q116 18 126 36 Q116 42 108 38 Q104 54 100 56 Q96 54 92 38 Q84 42 74 36Z', mane),
                    face: F({ x: 100, y: 72, gap: 18, my: 52, ms: 0.95 }),
                });
            },
            rabbit(F) {
                const fur = '#efe9e4', inner = '#f7b6c6';
                const whisk = (d) => L(d, 1.6, OL, 0.5);
                return compose({
                    back: C(134, 166, 11, '#fff'),
                    ...critter({ fur, belly: '#fff' }),
                    head: E(80, 32, 12, 34, fur, { rot: -10 }) + E(120, 32, 12, 34, fur, { rot: 10 }) +
                        E(80, 34, 6, 25, inner, flat({ rot: -10 })) + E(120, 34, 6, 25, inner, flat({ rot: 10 })) +
                        E(100, 88, 46, 40, fur) + E(100, 106, 16, 11, '#fff', { sw: 0 }) +
                        E(100, 98, 5.5, 4, '#f08aa0', { sw: 1.8 }) +
                        both('M84 104 L62 100', whisk) + both('M84 108 L63 111', whisk),
                    face: F({ x: 100, y: 86, gap: 16, my: 24, ms: 0.85, iris: '#7a4a3a' }),
                });
            },
            fox(F) {
                const fur = '#ec7a2e', cream = '#fff3e4', dark = '#3b2a2a';
                return compose({
                    back: P('M126 162 Q172 156 172 112 Q188 146 168 170 Q150 184 124 174Z', fur) +
                        P('M172 112 Q188 146 168 170 Q174 146 162 126Z', cream, { sw: 2 }),
                    ...critter({ fur, belly: cream, feet: dark }),
                    head: both('M54 64 L56 16 L92 44Z', (d) => P(d, fur)) +
                        both('M62 54 L62 30 L82 46Z', (d) => P(d, cream, FLAT)) +
                        P('M52 76 Q54 36 100 38 Q146 36 148 76 Q150 98 128 112 Q112 124 100 126 Q88 124 72 112 Q50 98 52 76Z', fur) +
                        P('M56 86 Q76 92 100 98 Q124 92 144 86 Q140 104 124 114 Q110 123 100 124 Q90 123 76 114 Q60 104 56 86Z', cream, { sw: 0 }) +
                        E(100, 104, 6.5, 4.8, dark, FLAT) + shine(98, 102.5, 2, 1),
                    face: F({ x: 100, y: 76, gap: 17, iris: '#7a4a12', my: 36, ms: 0.85 }),
                });
            },
            panda(F) {
                const white = '#fbfbfb', black = '#2b2b33';
                return compose({
                    ...critter({ fur: white, paw: black, feet: black }),
                    head: C2(60, 46, 15, black) + E(100, 84, 50, 44, white) +
                        E(84, 82, 12, 15.5, black, flat({ rot: 28 })) + E(116, 82, 12, 15.5, black, flat({ rot: -28 })) +
                        E(100, 100, 7, 5, black, FLAT) + shine(97.5, 98.5, 2, 1),
                    face: F({ x: 100, y: 82, gap: 16, my: 27, ms: 0.85 }),
                });
            },
            koala(F) {
                const fur = '#9aa3ab', inner = '#ece6e8', nose = '#3a3440';
                return compose({
                    ...critter({ fur, belly: inner }),
                    head: C2(56, 60, 22, fur) + C2(58, 63, 13, inner, FLAT) +
                        E(100, 86, 48, 42, fur) + E(100, 98, 9.5, 12.5, nose, { sw: 2 }) + shine(97, 92, 2.6, 3.5),
                    face: F({ x: 100, y: 82, gap: 21, er: 0.85, my: 36, ms: 0.85 }),
                });
            },
            tiger(F) {
                const fur = '#f28c28', white = '#fff7ec', st = '#3a2418';
                const s = (d) => L(d, 4, st);
                return compose({
                    back: tail('M130 160 Q164 160 162 128', 9, fur, 130, 160),
                    ...critter({ fur, belly: white }),
                    head: C2(62, 48, 13, fur) + C2(62, 50, 7, '#ffd9b8', FLAT) +
                        E(100, 84, 50, 43, fur) + E2(85, 106, 18, 13, white, { sw: 0 }) +
                        s('M100 43 L100 56') + both('M88 45 Q91 51 88 57', s) +
                        both('M51 80 L66 83', s) + both('M52 92 L65 92', s) +
                        P('M94 97 L106 97 L100 103Z', '#e8798f', { sw: 2 }),
                    face: F({ x: 100, y: 80, gap: 17, iris: '#8a6d12', my: 28, ms: 0.9 }),
                });
            },
            lion(F) {
                const mane = '#b8621b', fur = '#f2b84b', muz = '#fbe6c0';
                return compose({
                    back: tail('M130 160 Q164 162 162 130', 7, fur, 130, 160) + C(162, 126, 8, mane),
                    ...critter({ fur, belly: muz }),
                    head: P(blobE(100, 82, 58, 54, 14, 10), mane) + C2(68, 50, 10, fur) +
                        E(100, 86, 44, 40, fur) + E(100, 104, 20, 13, muz, { sw: 0 }) +
                        P('M94 96 L106 96 L100 102Z', '#8a4b2a', { sw: 2 }),
                    face: F({ x: 100, y: 82, gap: 16, my: 26, ms: 0.85 }),
                });
            },
            monkey(F) {
                const fur = '#8b5a3c', skin = '#f0c9a0';
                return compose({
                    back: tail('M130 165 Q168 170 166 140 Q164 120 150 126', 8, fur, 130, 165),
                    ...critter({ fur, belly: skin, paw: fur, feet: skin }),
                    head: C2(52, 86, 16, fur) + C2(52, 86, 9, skin, FLAT) + E(100, 82, 46, 44, fur) +
                        P('M100 62 Q86 48 72 60 Q62 74 70 90 Q62 108 80 120 Q100 130 120 120 Q138 108 130 90 Q138 74 128 60 Q114 48 100 62Z', skin, { sw: 2.2 }) +
                        E2(96, 98, 1.8, 1.4, '#6b4226', FLAT),
                    face: F({ x: 100, y: 80, gap: 16, my: 30, ms: 0.9 }),
                });
            },
            elephant(F) {
                const grey = '#a4b0be', inner = '#f2c4cf';
                const wrinkle = (d) => L(d, 1.8, OL, 0.4);
                return compose({
                    ...critter({ fur: grey, belly: '#c3ccd6' }),
                    head: E(52, 90, 28, 35, grey, { rot: -14 }) + E(148, 90, 28, 35, grey, { rot: 14 }) +
                        E(54, 92, 18, 25, inner, flat({ rot: -14 })) + E(146, 92, 18, 25, inner, flat({ rot: 14 })) +
                        E(100, 80, 44, 42, grey) +
                        tube('M100 92 Q100 118 110 128 Q122 138 130 126', 15, grey) +
                        wrinkle('M93 106 Q100 108 107 106') + wrinkle('M96 116 Q103 119 110 115'),
                    face: F({ x: 100, y: 72, gap: 18, mx: -18, my: 38, ms: 0.8 }),
                });
            },
            penguin(F) { return penguin(F, false); },
        },

        // ---------------- FRUITS ----------------
        fruits: {
            banana(F) {
                return compose({
                    legs: legs({ cx: 96, x: 14, top: 158 }),
                    arms: arms({ cx: 86, x: 26, y: 112 }),
                    body: P('M102 27 L104 12 L114 14 L112 30Z', '#8b6b3d') +
                        P('M96 26 Q78 30 68 60 Q56 100 68 138 Q80 172 118 176 Q140 174 136 160 Q118 150 112 120 Q106 84 116 52 Q122 34 112 28 Q104 24 96 26Z', '#ffd93d') +
                        E(134, 166, 4, 3, '#6b4a2a', FLAT) + shine(76, 84, 5, 18, 10),
                    face: F({ x: 86, y: 96, gap: 12, s: 0.95, my: 20, ms: 0.85 }),
                    neck: '86px 130px',
                });
            },
            apple(F) {
                return compose({
                    back: tube('M100 54 Q100 40 106 30', 5, '#7a4a2a'),
                    legs: legs({ x: 18, top: 150 }),
                    arms: arms({ y: 112, x: 56 }),
                    body: P('M100 52 Q80 38 60 48 Q36 62 40 102 Q44 142 70 160 Q86 170 100 162 Q114 170 130 160 Q156 142 160 102 Q164 62 140 48 Q120 38 100 52Z', '#e74c3c') +
                        P('M104 40 Q118 22 138 28 Q126 46 104 40Z', '#6bcb77') + L('M106 39 Q120 32 132 30', 1.6, '#3e8e41') +
                        shine(68, 80, 7, 14, 25),
                    face: F({ x: 100, y: 100, gap: 16, my: 24 }),
                });
            },
            orange(F) {
                const pores = [[70, 78], [130, 74], [58, 120], [142, 124], [100, 58], [84, 152], [118, 154], [148, 96], [54, 92]]
                    .map(([x, y]) => dot(x, y, 1.6, '#e07b1a', 0.7)).join('');
                return compose({
                    back: P('M104 52 Q116 34 136 38 Q126 56 104 52Z', '#4caf50'),
                    legs: legs({ x: 20, top: 156 }),
                    arms: arms({ y: 110, x: 56 }),
                    body: C(100, 106, 58, '#ff9f43') + pores + E(100, 50, 4, 2.5, '#7a4a2a', FLAT) + shine(72, 78, 9, 14, 30),
                    face: F({ x: 100, y: 102, gap: 16, my: 24 }),
                });
            },
            strawberry(F) {
                const seeds = [[66, 72], [134, 72], [56, 100], [144, 100], [70, 128], [130, 128], [86, 150], [114, 150], [100, 164], [100, 64]]
                    .map(([x, y]) => E(x, y, 2.2, 3.2, '#ffe066', flat({ rot: (x - 100) / 3 }))).join('');
                return compose({
                    back: tube('M100 56 L100 40', 4, '#2e8b57'),
                    legs: legs({ x: 16, top: 150 }),
                    arms: arms({ y: 104, x: 54 }),
                    body: P('M100 54 Q60 44 46 72 Q38 100 60 134 Q80 166 100 172 Q120 166 140 134 Q162 100 154 72 Q140 44 100 54Z', '#ff4757') +
                        seeds + P('M100 58 L80 40 L88 58 L62 54 L82 66 L100 62 L118 66 L138 54 L112 58 L120 40Z', '#2ed573', { sw: 2.4 }) +
                        shine(66, 86, 5, 10, 30),
                    face: F({ x: 100, y: 96, gap: 16, my: 22 }),
                });
            },
            watermelon(F) {
                const seed = ([x, y]) => P(`M${x} ${y - 4} Q${x + 3} ${y + 1} ${x} ${y + 3} Q${x - 3} ${y + 1} ${x} ${y - 4}Z`, OL, FLAT);
                return compose({
                    legs: legs({ x: 18, top: 160 }),
                    arms: arms({ y: 84, x: 62, drop: 12 }),
                    body: P('M34 72 L166 72 Q166 172 100 172 Q34 172 34 72Z', '#2e8b57') +
                        P('M42 72 L158 72 Q158 162 100 162 Q42 162 42 72Z', '#c8f7c5', FLAT) +
                        P('M46 72 L154 72 Q154 156 100 156 Q46 156 46 72Z', '#ff4d6d', { sw: 2 }) +
                        [[62, 92], [138, 92], [68, 124], [132, 124], [100, 146], [80, 140], [120, 140]].map(seed).join(''),
                    face: F({ x: 100, y: 96, gap: 16, my: 22 }),
                });
            },
            mango(F) {
                return compose({
                    back: tube('M92 50 Q90 38 96 30', 4, '#7a4a2a') + P('M96 36 Q112 20 132 26 Q120 44 96 36Z', '#4caf50'),
                    legs: legs({ x: 18, top: 160 }),
                    arms: arms({ y: 112, x: 54 }),
                    body: P('M70 50 Q40 70 44 112 Q50 156 96 166 Q144 172 156 128 Q166 84 136 58 Q106 34 70 50Z', '#ffb627') +
                        E(128, 74, 26, 22, '#ff6b3d', flat({ op: 0.45 })) + shine(66, 84, 6, 14, 30),
                    face: F({ x: 98, y: 106, gap: 16, my: 24 }),
                });
            },
            pineapple(F) {
                let hatch = '';
                for (let k = -140; k <= 140; k += 18) {
                    hatch += L(`M${100 + k - 60} 70 L${100 + k + 60} 182`, 2, '#c47f0e', 0.5) +
                        L(`M${100 + k + 60} 70 L${100 + k - 60} 182`, 2, '#c47f0e', 0.5);
                }
                return compose({
                    back: P('M100 82 Q82 56 64 46 Q86 50 96 62 Q90 34 100 14 Q110 34 104 62 Q114 50 136 46 Q118 56 100 82Z', '#27ae60') +
                        P('M100 80 Q90 50 80 30 Q96 44 100 60 Q104 44 120 30 Q110 50 100 80Z', '#2ecc71', { sw: 2 }),
                    legs: legs({ x: 18, top: 170 }),
                    arms: arms({ y: 126, x: 48 }),
                    body: E(100, 126, 46, 52, '#f6b93b') + clipped('<ellipse cx="100" cy="126" rx="44" ry="50"/>', hatch),
                    face: F({ x: 100, y: 118, gap: 16, my: 24 }),
                    neck: '100px 160px',
                });
            },
            grapes(F) {
                const g = [[76, 66], [100, 62], [124, 66], [64, 92], [88, 90], [112, 90], [136, 92], [76, 118], [100, 116], [124, 118], [88, 142], [112, 142], [100, 164]]
                    .map(([x, y]) => C(x, y, 17, '#8e44ad') + shine(x - 5, y - 6, 3.5, 2, -30)).join('');
                return compose({
                    back: tube('M100 56 L104 38', 4, '#7a4a2a') + P('M104 46 Q124 30 146 40 Q130 58 104 46Z', '#6bcb77'),
                    arms: arms({ y: 106, x: 52 }),
                    body: g,
                    face: F({ x: 100, y: 100, gap: 16, my: 22 }),
                });
            },
            peach(F) {
                return compose({
                    back: P('M104 58 Q116 40 136 44 Q126 62 104 58Z', '#4caf50'),
                    legs: legs({ x: 18, top: 158 }),
                    arms: arms({ y: 112, x: 56 }),
                    body: P('M100 60 Q70 44 50 64 Q34 84 42 116 Q52 154 100 168 Q148 154 158 116 Q166 84 150 64 Q130 44 100 60Z', '#ffb38a') +
                        E(132, 96, 24, 30, '#ff7f6e', flat({ op: 0.35 })) + L('M100 62 Q94 72 92 82', 2.4, '#e8875f', 0.6) +
                        shine(66, 84, 6, 12, 30),
                    face: F({ x: 100, y: 106, gap: 16, my: 24 }),
                });
            },
            kiwi(F) {
                let seeds = '';
                for (let i = 0; i < 18; i++) {
                    const a = (i / 18) * Math.PI * 2;
                    const x = (100 + Math.cos(a) * 39).toFixed(1);
                    const y = (106 + Math.sin(a) * 39).toFixed(1);
                    seeds += E(x, y, 1.8, 3.6, OL, flat({ rot: ((a * 180) / Math.PI + 90).toFixed(0) }));
                }
                return compose({
                    legs: legs({ x: 20, top: 158 }),
                    arms: arms({ y: 110, x: 58 }),
                    body: C(100, 106, 60, '#8d6e4f') + C(100, 106, 52, '#8bc34a', { sw: 2.2 }) +
                        C(100, 106, 31, '#e8f5b0', flat({ op: 0.95 })) + seeds,
                    face: F({ x: 100, y: 100, gap: 13, s: 0.9, my: 20, ms: 0.85 }),
                });
            },
            lemon(F) {
                return compose({
                    back: P('M110 62 Q122 44 142 48 Q132 66 110 62Z', '#4caf50'),
                    legs: legs({ x: 20, top: 146 }),
                    arms: arms({ y: 104, x: 64 }),
                    body: P('M24 104 Q32 98 40 88 Q60 58 100 58 Q140 58 160 88 Q168 98 176 104 Q168 110 160 120 Q140 150 100 150 Q60 150 40 120 Q32 110 24 104Z', '#ffe14d') +
                        [[60, 80], [140, 84], [56, 124], [146, 120], [100, 66], [100, 142]].map(([x, y]) => dot(x, y, 1.5, '#e0b800', 0.7)).join('') +
                        shine(64, 78, 6, 10, 50),
                    face: F({ x: 100, y: 98, gap: 16, my: 22 }),
                });
            },
            coconut(F) {
                const fibre = [[64, 82, -30], [132, 78, 30], [58, 118, -80], [142, 120, 80], [80, 152, -20], [120, 154, 20], [100, 60, 0], [76, 64, -40], [124, 62, 40], [50, 100, -70], [150, 100, 70]]
                    .map(([x, y, r]) => `<path d="M${x - 5} ${y} L${x + 5} ${y}" stroke="#a0713f" stroke-width="2" stroke-linecap="round" transform="rotate(${r} ${x} ${y})"/>`).join('');
                return compose({
                    legs: legs({ x: 20, top: 158 }),
                    arms: arms({ y: 112, x: 56 }),
                    body: C(100, 108, 56, '#7b4b2a') + fibre + shine(74, 80, 7, 12, 30),
                    face: F({ x: 100, y: 104, gap: 16, my: 24 }),
                });
            },
        },

        // ---------------- FOOD ----------------
        food: {
            potato(F) {
                const spots = [[64, 84, 4], [140, 96, 3.5], [72, 146, 3], [132, 146, 4], [112, 56, 3]]
                    .map(([x, y, r]) => E(x, y, r, r * 0.7, '#a87b4f', flat({ op: 0.7 }))).join('');
                return compose({
                    legs: legs({ x: 20, top: 160 }),
                    arms: arms({ y: 110, x: 52 }),
                    body: P('M56 70 Q70 40 108 44 Q150 46 156 88 Q162 124 144 152 Q122 176 88 168 Q52 160 46 124 Q42 96 56 70Z', '#d4a574') +
                        spots + shine(70, 70, 6, 10, 40),
                    face: F({ x: 102, y: 100, gap: 16, my: 24 }),
                });
            },
            pizza(F) {
                const pep = (x, y, r) => C(x, y, r, '#d64045', { sw: 2.2 }) + dot(x - 3, y - 2, 1.4, '#a82830') + dot(x + 3, y + 2, 1.2, '#a82830');
                return compose({
                    legs: legs({ x: 8, top: 160 }),
                    arms: arms({ y: 92, x: 46, drop: 12 }),
                    body: P('M40 66 Q100 48 160 66 L104 172 Q100 178 96 172Z', '#ffd166') +
                        P('M62 70 Q66 86 72 74 Q78 90 84 72Z', '#ffe29a', FLAT) +
                        pep(62, 76, 10) + pep(138, 76, 10) + pep(100, 148, 8) +
                        R(118, 120, 8, 4, 2, '#3e8e41', flat({ t: 'rotate(30 122 122)' })) + R(76, 124, 8, 4, 2, '#3e8e41', flat({ t: 'rotate(-30 80 126)' })) +
                        P('M32 50 Q100 30 168 50 Q172 62 162 70 Q100 50 38 70 Q28 62 32 50Z', '#d9893b') +
                        dot(70, 52, 1.5, '#a4621f') + dot(100, 46, 1.5, '#a4621f') + dot(132, 52, 1.5, '#a4621f'),
                    face: F({ x: 100, y: 96, gap: 14, s: 0.95, my: 22 }),
                });
            },
            burger(F) {
                const seeds = [[74, 64, -20], [100, 58, 0], [126, 64, 20], [62, 84, -40], [138, 84, 40], [88, 52, -10], [112, 52, 10]]
                    .map(([x, y, r]) => E(x, y, 3.2, 1.6, '#fff4d6', flat({ rot: r }))).join('');
                return compose({
                    legs: legs({ x: 20, top: 160 }),
                    arms: arms({ y: 128, x: 56 }),
                    body: R(46, 138, 108, 26, 12, '#e0a052') + R(42, 120, 116, 22, 11, '#7a4520') +
                        P('M44 116 L156 116 L156 124 L140 124 L134 136 L128 124 L82 124 L76 134 L70 124 L44 124Z', '#ffc93c', { sw: 2.4 }) +
                        P('M38 116 Q46 106 56 114 Q66 104 76 114 Q86 104 96 114 Q106 104 116 114 Q126 104 136 114 Q146 104 156 114 Q164 108 162 120 L38 120Z', '#7bc950', { sw: 2.4 }) +
                        P('M42 112 Q42 46 100 46 Q158 46 158 112 Q100 118 42 112Z', '#f0a94b') + seeds,
                    face: F({ x: 100, y: 84, gap: 16, my: 20 }),
                });
            },
            taco(F) {
                return compose({
                    legs: legs({ x: 20, top: 166 }),
                    arms: arms({ y: 118, x: 64 }),
                    body: P('M28 98 Q30 76 46 80 Q52 64 68 72 Q78 58 92 68 Q104 56 116 68 Q130 58 138 72 Q154 64 158 80 Q172 78 172 98Z', '#7bc950') +
                        R(58, 72, 12, 10, 3, '#e63946', { sw: 2 }) + R(122, 70, 12, 10, 3, '#e63946', { sw: 2 }) + R(92, 62, 12, 10, 3, '#e63946', { sw: 2 }) +
                        P('M76 82 L84 70 L88 84Z', '#ffd43b', { sw: 1.8 }) + P('M108 80 L116 68 L120 82Z', '#ffd43b', { sw: 1.8 }) +
                        P('M30 92 Q30 170 100 170 Q170 170 170 92Z', '#f7c873') +
                        [[52, 110], [148, 112], [60, 146], [140, 146], [100, 160]].map(([x, y]) => dot(x, y, 2, '#d99a3c', 0.8)).join(''),
                    face: F({ x: 100, y: 122, gap: 17, my: 22 }),
                    neck: '100px 160px',
                });
            },
            bread(F) {
                const toast = 'M48 168 L48 86 Q30 80 34 60 Q40 34 74 36 Q100 26 126 36 Q160 34 166 60 Q170 80 152 86 L152 168 Q152 174 146 174 L54 174 Q48 174 48 168Z';
                return compose({
                    legs: legs({ x: 18, top: 170, bottom: 180 }),
                    arms: arms({ y: 118, x: 50 }),
                    body: P(toast, '#c8843f') +
                        `<g transform="translate(100 104) scale(.86) translate(-100 -104)">${P(toast, '#f6d7a0', { sw: 0 })}</g>` +
                        [[68, 70], [134, 74], [64, 150], [138, 148], [100, 56]].map(([x, y]) => E(x, y, 2.6, 1.6, '#d9b06b')).join(''),
                    face: F({ x: 100, y: 104, gap: 16, my: 24 }),
                });
            },
            sushi(F) {
                const grains = [[56, 150], [72, 160], [130, 158], [146, 146], [58, 124], [144, 124]]
                    .map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="4" ry="2.4" fill="#fff" stroke="#d9d6c8" stroke-width="1.2"/>`).join('');
                return compose({
                    legs: legs({ x: 20, top: 164 }),
                    arms: arms({ y: 136, x: 58 }),
                    body: P('M40 134 Q40 110 60 106 L140 106 Q160 110 160 134 L160 150 Q160 168 140 168 L60 168 Q40 168 40 150Z', '#fbfbf5') + grains +
                        P('M34 114 Q30 84 62 76 Q100 66 138 76 Q170 84 166 114 Q150 106 100 106 Q50 106 34 114Z', '#ff8c5a') +
                        L('M62 82 Q72 94 64 108', 3, '#ffd0b5') + L('M90 74 Q100 90 92 106', 3, '#ffd0b5') + L('M120 74 Q130 90 122 106', 3, '#ffd0b5') + L('M146 82 Q154 94 148 108', 3, '#ffd0b5'),
                    face: F({ x: 100, y: 132, gap: 16, my: 20 }),
                    neck: '100px 165px',
                });
            },
            pasta(F) {
                return compose({
                    back: P(blobE(100, 98, 60, 26, 10, 8), '#f6d365') +
                        L('M60 96 Q70 80 84 94 Q96 104 106 90 Q118 76 132 94', 2.4, '#e0b040') +
                        L('M54 104 Q66 92 80 102 Q92 112 108 100 Q124 88 144 104', 2.4, '#e0b040') +
                        P(blobE(100, 82, 26, 12, 8, 6), '#d63031', { sw: 2.4 }) + C(100, 70, 13, '#8b4513') +
                        P('M108 60 Q120 50 128 58 Q118 66 108 60Z', '#3e8e41', { sw: 2 }),
                    legs: legs({ x: 18, top: 166 }),
                    arms: arms({ y: 124, x: 64 }),
                    body: P('M28 106 L172 106 Q168 160 122 170 L78 170 Q32 160 28 106Z', '#f5f5f5') +
                        L('M44 156 Q100 166 156 156', 4, '#4d96ff', 0.8),
                    face: F({ x: 100, y: 132, gap: 16, my: 20, ms: 0.9 }),
                    neck: '100px 165px',
                });
            },
            pancake(F) {
                return compose({
                    legs: legs({ x: 20, top: 162 }),
                    arms: arms({ y: 130, x: 58 }),
                    body: R(38, 140, 124, 24, 12, '#e09a45') + R(42, 118, 116, 24, 12, '#e8a54f') + R(46, 96, 108, 24, 12, '#efb35f') +
                        E(100, 98, 52, 9, '#f6c77a', { sw: 2.4 }) + R(88, 82, 24, 13, 3, '#fff3a0', { sw: 2.4 }) +
                        P('M56 98 Q100 112 144 98 L144 106 Q140 120 134 106 Q120 116 104 108 Q96 124 88 108 Q70 114 64 106 Q58 116 56 104Z', '#a0522d', { sw: 2 }),
                    face: F({ x: 100, y: 136, gap: 16, my: 18 }),
                    neck: '100px 165px',
                });
            },
            egg(F) {
                return compose({
                    legs: legs({ x: 18, top: 162 }),
                    arms: arms({ y: 118, x: 48 }),
                    body: P('M100 34 Q62 34 52 96 Q46 150 100 168 Q154 150 148 96 Q138 34 100 34Z', '#fff8ec') +
                        [[76, 70], [128, 66], [64, 128], [138, 132], [112, 154]].map(([x, y]) => dot(x, y, 1.6, '#d9c3a5')).join('') +
                        shine(76, 70, 7, 14, 25),
                    face: F({ x: 100, y: 108, gap: 16, my: 24 }),
                });
            },
            cheese(F) {
                return compose({
                    legs: legs({ cx: 102, x: 28, top: 158 }),
                    arms: arms({ cx: 102, y: 132, x: 70 }),
                    body: P('M30 118 L150 70 L174 98Z', '#ffe57f') + P('M30 118 L174 98 L174 160 L30 162Z', '#ffd43b') +
                        E(46, 144, 7, 5, '#f0b429', { sw: 2 }) + E(158, 146, 6, 8, '#f0b429', { sw: 2 }) + E(160, 114, 4, 4, '#f0b429', { sw: 2 }) +
                        E(118, 90, 6, 3, '#f0b429', { sw: 2 }) + E(80, 104, 4, 2, '#f0b429', { sw: 1.8 }),
                    face: F({ x: 102, y: 126, gap: 16, my: 20 }),
                    neck: '102px 160px',
                });
            },
            donut(F) {
                const sprinkles = [[66, 84, 30, '#4d96ff'], [136, 86, -30, '#ffd93d'], [58, 116, 70, '#6bcb77'], [144, 118, -70, '#4d96ff'], [76, 150, 20, '#ffd93d'], [124, 150, -20, '#6bcb77'], [100, 62, 90, '#fff'], [122, 66, 10, '#6bcb77'], [78, 66, -10, '#ffd93d'], [142, 140, 50, '#fff'], [58, 140, -50, '#fff']]
                    .map(([x, y, r, c]) => `<rect x="-4" y="-1.4" width="8" height="2.8" rx="1.4" fill="${c}" transform="translate(${x} ${y}) rotate(${r})"/>`).join('');
                return compose({
                    legs: legs({ x: 20, top: 166 }),
                    arms: arms({ y: 112, x: 60 }),
                    body: C(100, 112, 62, '#d9934a') + P(blobE(100, 108, 54, 52, 16, 7), '#ff8fb1', { sw: 2.4 }) + sprinkles +
                        C(100, 134, 17, '#c97a35', { sw: 2.4, flat: true }) + C(100, 137, 12, '#fffdf8', FLAT),
                    face: F({ x: 100, y: 84, gap: 16, my: 20, ms: 0.9 }),
                });
            },
            cookie(F) {
                const chip = ([x, y]) => P(`M${x - 5} ${y} Q${x - 4} ${y - 5} ${x} ${y - 5} Q${x + 5} ${y - 4} ${x + 5} ${y} Q${x + 4} ${y + 5} ${x} ${y + 4} Q${x - 5} ${y + 4} ${x - 5} ${y}Z`, '#5a3418', FLAT);
                return compose({
                    legs: legs({ x: 20, top: 160 }),
                    arms: arms({ y: 110, x: 56 }),
                    body: P(blobE(100, 108, 58, 56, 18, 3), '#d29b5b') +
                        [[66, 80], [138, 84], [56, 116], [146, 120], [80, 152], [124, 152], [100, 64], [100, 160]].map(chip).join(''),
                    face: F({ x: 100, y: 104, gap: 16, my: 24 }),
                });
            },
        },

        // ---------------- VEGETABLES ----------------
        vegetables: {
            carrot(F) {
                const r = (d) => L(d, 2.2, '#d9700f', 0.8);
                return compose({
                    back: P('M100 62 Q84 36 78 18 Q96 28 100 50 Q104 24 122 16 Q114 38 100 62Z', '#4caf50') + P('M100 60 Q88 30 100 10 Q112 30 100 60Z', '#66bb6a'),
                    arms: arms({ y: 92, x: 36, drop: 14 }),
                    body: P('M58 62 Q100 48 142 62 Q144 82 122 130 Q110 160 100 178 Q90 160 78 130 Q56 82 58 62Z', '#ff8c1a') +
                        r('M64 92 L74 94') + r('M128 110 L136 108') + r('M84 142 L92 143') + r('M112 134 L118 133') + shine(72, 76, 5, 12, -15),
                    face: F({ x: 100, y: 84, gap: 15, my: 20, ms: 0.9 }),
                });
            },
            broccoli(F) {
                return compose({
                    legs: legs({ x: 10, top: 166 }),
                    arms: arms({ y: 130, x: 20, len: 22 }),
                    body: P('M78 98 L122 98 L116 168 Q100 176 84 168Z', '#a8d672') + L('M94 120 L96 160', 2, '#7fb04a', 0.7) +
                        P(blobE(100, 72, 54, 40, 12, 10), '#3e8e41') +
                        [[64, 56, 10], [136, 58, 9], [100, 42, 8], [58, 92, 7], [142, 92, 7]].map(([x, y, r]) => C(x, y, r, '#56a85a', FLAT)).join(''),
                    face: F({ x: 100, y: 72, gap: 16, my: 22 }),
                });
            },
            corn(F) {
                let k = '';
                for (let y = 34; y <= 172; y += 10) {
                    for (let x = 60 + ((y / 10) % 2) * 5; x <= 140; x += 11) {
                        k += `<ellipse cx="${x}" cy="${y}" rx="4.6" ry="4" fill="#ffe066" stroke="#e0a800" stroke-width="1.2"/>`;
                    }
                }
                const cob = 'M100 28 Q66 28 64 96 Q64 152 100 172 Q136 152 136 96 Q134 28 100 28Z';
                return compose({
                    back: both('M100 176 Q48 156 44 76 Q66 120 98 140Z', (d) => P(d, '#69b34c')),
                    legs: legs({ x: 16, top: 168 }),
                    arms: arms({ y: 110, x: 40 }),
                    body: P(cob, '#ffd43b') + clipped(`<path d="${cob}"/>`, k) + `<path d="${cob}" fill="none" stroke="${OL}" stroke-width="${SW}"/>` +
                        both('M100 178 Q58 166 48 110 Q70 146 96 154Z', (d) => P(d, '#5aa13e', { sw: 2.6 })),
                    face: F({ x: 100, y: 86, gap: 15, my: 22, ms: 0.9 }),
                });
            },
            tomato(F) {
                return compose({
                    back: tube('M100 58 L100 46', 4, '#2e8b57'),
                    legs: legs({ x: 20, top: 160 }),
                    arms: arms({ y: 112, x: 56 }),
                    body: P('M100 58 Q60 50 44 80 Q32 110 52 140 Q74 168 100 166 Q126 168 148 140 Q168 110 156 80 Q140 50 100 58Z', '#ff4136') +
                        both('M68 70 Q56 110 74 150', (d) => L(d, 2, '#d62d20', 0.4)) +
                        P('M100 60 L86 50 L90 62 L72 62 L88 70 L100 66 L112 70 L128 62 L110 62 L114 50Z', '#2ed573', { sw: 2.4 }) +
                        shine(66, 84, 6, 12, 30),
                    face: F({ x: 100, y: 106, gap: 16, my: 24 }),
                });
            },
            cucumber(F) {
                return compose({
                    legs: legs({ x: 16, top: 170 }),
                    arms: arms({ y: 108, x: 36 }),
                    body: R(62, 28, 76, 148, 38, '#4caf50') +
                        L('M72 50 L72 156', 5, '#7bc96f', 0.6) + L('M128 50 L128 156', 5, '#7bc96f', 0.6) +
                        [[80, 46], [118, 50], [76, 130], [124, 136], [96, 158], [106, 40]].map(([x, y]) => dot(x, y, 1.8, '#2e7d32')).join(''),
                    face: F({ x: 100, y: 84, gap: 15, my: 22 }),
                });
            },
            mushroom(F) {
                return compose({
                    legs: legs({ x: 14, top: 168 }),
                    arms: arms({ y: 136, x: 26 }),
                    body: P('M74 108 Q70 150 78 170 Q100 178 122 170 Q130 150 126 108Z', '#f5e6d0') +
                        P('M28 110 Q28 40 100 36 Q172 40 172 110 Q140 120 100 120 Q60 120 28 110Z', '#e74c3c') +
                        E(56, 70, 9, 7, '#fff', { sw: 2 }) + E(144, 70, 9, 7, '#fff', { sw: 2 }) + E(100, 48, 10, 6, '#fff', { sw: 2 }) +
                        E(42, 98, 6, 5, '#fff', { sw: 2 }) + E(158, 98, 6, 5, '#fff', { sw: 2 }),
                    face: F({ x: 100, y: 84, gap: 16, my: 22 }),
                });
            },
            pepper(F) {
                return compose({
                    back: tube('M100 56 Q100 42 112 34', 5, '#2e8b57'),
                    legs: legs({ x: 20, top: 162 }),
                    arms: arms({ y: 112, x: 54 }),
                    body: P('M100 54 Q76 40 58 56 Q40 74 46 112 Q52 150 72 164 Q86 172 100 162 Q114 172 128 164 Q148 150 154 112 Q160 74 142 56 Q124 40 100 54Z', '#e63946') +
                        both('M72 66 Q62 112 74 156', (d) => L(d, 2.2, '#b8222f', 0.5)) +
                        P('M86 56 Q100 46 114 56 Q100 62 86 56Z', '#2e8b57', { sw: 2.4 }) + shine(66, 84, 6, 14, 20),
                    face: F({ x: 100, y: 104, gap: 16, my: 24 }),
                });
            },
            chili(F) {
                return compose({
                    back: tube('M100 46 Q102 30 116 26', 4, '#2e8b57'),
                    legs: legs({ cx: 96, x: 12, top: 164 }),
                    arms: arms({ cx: 82, x: 22, y: 110 }),
                    body: P('M84 46 Q58 62 60 106 Q62 150 92 172 Q112 184 132 174 Q110 160 104 120 Q100 84 116 56 Q106 40 84 46Z', '#e8202a') +
                        P('M82 48 Q96 36 116 56 Q100 54 82 48Z', '#2e8b57', { sw: 2.4 }) + shine(70, 92, 4, 14, 8),
                    face: F({ x: 82, y: 96, gap: 12, s: 0.9, my: 20, ms: 0.85 }),
                    neck: '82px 130px',
                });
            },
            pumpkin(F) {
                return compose({
                    back: tube('M100 64 Q98 46 108 38', 8, '#6b4a2a') + L('M108 46 Q124 34 120 26 Q114 22 112 30', 2, '#3e8e41'),
                    legs: legs({ x: 20, top: 156 }),
                    arms: arms({ y: 114, x: 64 }),
                    body: E(66, 114, 34, 46, '#f78a1d') + E(134, 114, 34, 46, '#f78a1d') + E(100, 112, 42, 52, '#ff9a2e'),
                    face: F({ x: 100, y: 108, gap: 16, my: 24 }),
                });
            },
            garlic(F) {
                return compose({
                    legs: legs({ x: 18, top: 164 }),
                    arms: arms({ y: 118, x: 50 }),
                    body: P('M100 30 Q92 56 72 70 Q42 92 48 130 Q56 166 100 168 Q144 166 152 130 Q158 92 128 70 Q108 56 100 30Z', '#f8f1e7') +
                        both('M76 74 Q58 120 74 162', (d) => L(d, 2, '#d9c7b0', 0.8)) +
                        L('M92 168 L88 178', 1.6, '#c9b79b') + L('M100 168 L100 180', 1.6, '#c9b79b') + L('M108 168 L112 178', 1.6, '#c9b79b'),
                    face: F({ x: 100, y: 114, gap: 16, my: 22 }),
                    neck: '100px 150px',
                });
            },
            onion(F) {
                return compose({
                    back: P('M100 40 Q92 22 98 6 Q106 22 104 40Z', '#4caf50', { sw: 2.4 }),
                    legs: legs({ x: 18, top: 164 }),
                    arms: arms({ y: 120, x: 50 }),
                    body: P('M100 34 Q96 60 74 74 Q44 94 50 128 Q58 166 100 168 Q142 166 150 128 Q156 94 126 74 Q104 60 100 34Z', '#b5688f') +
                        both('M80 74 Q60 116 78 164', (d) => L(d, 2, '#e3b5cc', 0.8)) + shine(70, 100, 5, 14, 20),
                    face: F({ x: 100, y: 116, gap: 16, my: 22 }),
                    neck: '100px 150px',
                });
            },
            avocado(F) {
                const avo = 'M100 30 Q74 30 64 66 Q42 104 50 136 Q60 174 100 176 Q140 174 150 136 Q158 104 136 66 Q126 30 100 30Z';
                return compose({
                    legs: legs({ x: 18, top: 170 }),
                    arms: arms({ y: 118, x: 52 }),
                    body: P(avo, '#2d6a2e') +
                        `<g transform="translate(100 108) scale(.88) translate(-100 -108)">${P(avo, '#d4e79e', { sw: 0 })}</g>` +
                        E(100, 112, 34, 46, '#eef7c0', flat({ op: 0.6 })) + C(100, 138, 22, '#8b5a2b') + shine(92, 130, 6, 8, -20),
                    face: F({ x: 100, y: 84, gap: 15, my: 20, ms: 0.9 }),
                });
            },
        },

        // ---------------- DRINKS ----------------
        drinks: {
            coffee(F) {
                const steam = (d) => `<g class="cv-steam">${L(d, 3, '#c9c3bb', 0.7)}</g>`;
                return compose({
                    back: steam('M84 60 Q76 48 84 38 Q92 28 84 16') + steam('M108 58 Q100 44 108 34 Q116 24 108 12') +
                        tube('M148 92 Q178 92 178 120 Q178 148 148 148', 11, '#fafafa'),
                    legs: legs({ cx: 98, x: 22, top: 168 }),
                    arms: arms({ cx: 98, y: 118, x: 52 }),
                    body: R(44, 68, 108, 104, 18, '#fafafa') + E(98, 72, 50, 8, '#6b4226', { sw: 2.4 }) +
                        P('M124 150 Q120 144 126 142 Q130 140 132 146 Q134 140 138 142 Q144 144 140 150 L132 158Z', '#ff6b6b', { sw: 1.6, flat: true }),
                    face: F({ x: 98, y: 112, gap: 16, my: 24 }),
                    neck: '98px 160px',
                });
            },
            tea(F) {
                return compose({
                    back: tube('M156 102 Q182 102 180 124 Q178 144 150 144', 10, '#9be7c4'),
                    arms: arms({ y: 110, x: 56 }),
                    body: P('M40 92 L160 92 Q156 150 120 164 L80 164 Q44 150 40 92Z', '#9be7c4') +
                        E(100, 92, 58, 8, '#c47f3a', { sw: 2.4 }) + L('M128 92 Q136 110 140 124', 1.6, OL) +
                        R(132, 122, 16, 18, 2, '#ffd93d', { sw: 2 }) + E(100, 168, 72, 10, '#7fd1ae'),
                    face: F({ x: 100, y: 118, gap: 16, my: 20 }),
                    neck: '100px 160px',
                });
            },
            soda(F) {
                return compose({
                    legs: legs({ x: 20, top: 174 }),
                    arms: arms({ y: 100, x: 42 }),
                    body: R(56, 38, 88, 140, 14, '#e63946') +
                        P('M56 120 Q78 104 100 120 Q122 136 144 120 L144 132 Q122 148 100 132 Q78 116 56 132Z', '#fff', FLAT) +
                        R(66, 52, 6, 100, 3, '#fff', flat({ op: 0.3 })) +
                        E(100, 42, 42, 7, '#d4d9de', { sw: 2.4 }) + R(92, 36, 16, 6, 3, '#b0b8c0', { sw: 1.6 }) +
                        R(58, 168, 84, 8, 4, '#d4d9de', { sw: 2 }),
                    face: F({ x: 100, y: 84, gap: 16, my: 22 }),
                });
            },
            juice(F) {
                return compose({
                    back: tube('M118 46 L118 22 L132 12', 5, '#fafafa'),
                    legs: legs({ cx: 96, x: 22, top: 170 }),
                    arms: arms({ cx: 92, y: 110, x: 40 }),
                    body: R(50, 52, 84, 120, 6, '#ff9f43') + P('M134 52 L150 42 L150 160 L134 172Z', '#e8822a') +
                        P('M50 52 L66 42 L150 42 L134 52Z', '#ffc078') +
                        C(92, 146, 12, '#ffd93d', { sw: 2 }) + P('M92 134 Q98 124 106 126 Q100 134 92 134Z', '#4caf50', { sw: 1.6 }),
                    face: F({ x: 92, y: 96, gap: 15, my: 22 }),
                    neck: '92px 140px',
                });
            },
            milk(F) {
                return compose({
                    legs: legs({ cx: 96, x: 22, top: 170 }),
                    arms: arms({ cx: 92, y: 110, x: 38 }),
                    body: R(54, 70, 76, 104, 4, '#fafafa') + P('M130 70 L150 58 L150 162 L130 174Z', '#dfe6ee') +
                        P('M54 70 L74 36 L110 36 L130 70Z', '#fafafa') + P('M110 36 L130 70 L150 58 L128 30Z', '#dfe6ee') +
                        R(98, 26, 14, 10, 3, '#4d96ff', { sw: 2 }) + R(56, 138, 72, 24, 0, '#4d96ff', FLAT) +
                        P('M92 142 Q100 152 92 158 Q84 152 92 142Z', '#fff', FLAT),
                    face: F({ x: 92, y: 100, gap: 15, my: 22 }),
                    neck: '92px 140px',
                });
            },
            beer(F) {
                const bubbles = [[64, 150, 2.4], [80, 160, 1.8], [124, 146, 2.2], [118, 160, 1.6], [70, 128, 1.6], [128, 124, 1.8]]
                    .map(([x, y, r]) => dot(x, y, r, '#fff3c4', 0.8)).join('');
                return compose({
                    back: tube('M140 92 Q170 92 170 120 Q170 150 140 150', 11, '#f8e08e'),
                    legs: legs({ cx: 96, x: 22, top: 170 }),
                    arms: arms({ cx: 96, y: 116, x: 48 }),
                    body: R(50, 66, 92, 108, 14, '#f6b40e') + bubbles + R(58, 80, 6, 80, 3, '#fff', flat({ op: 0.4 })) +
                        P(blobE(96, 64, 52, 16, 10, 6), '#fffdf5') + P('M126 70 Q132 84 126 90 Q120 84 126 70Z', '#fffdf5', { sw: 2 }),
                    face: F({ x: 96, y: 116, gap: 16, my: 24 }),
                    neck: '96px 160px',
                });
            },
            wine(F) {
                return compose({
                    arms: arms({ y: 86, x: 44, drop: 12 }),
                    body: tube('M100 128 L100 172', 5, '#e8eef4') + E(100, 174, 30, 6, '#e8eef4', { sw: 2.6 }) +
                        P('M54 46 L146 46 Q150 108 100 130 Q50 108 54 46Z', '#eef3f8', { sw: 2.6 }) +
                        P('M57 76 L143 76 Q142 112 100 127 Q58 112 57 76Z', '#8e1b3a', { sw: 0 }) + E(100, 76, 43, 5, '#a8264b', FLAT) +
                        R(64, 52, 5, 44, 2.5, '#fff', flat({ op: 0.7 })),
                    face: F({ x: 100, y: 94, gap: 15, my: 18, ms: 0.85 }),
                    neck: '100px 130px',
                });
            },
            cocktail(F) {
                return compose({
                    arms: arms({ y: 60, x: 54, drop: 14 }),
                    body: tube('M100 118 L100 172', 5, '#e8eef4') + E(100, 174, 28, 6, '#e8eef4', { sw: 2.6 }) +
                        P('M36 46 L164 46 L100 118Z', '#eaf7ff', { sw: 2.6 }) + P('M46 54 L154 54 L100 112Z', '#ff6fa8', { sw: 0 }) +
                        L('M132 28 L112 76', 2.4, OL) + C(118, 62, 6, '#7bc950', { sw: 2 }) +
                        C(46, 44, 12, '#b8e04a') + C(46, 44, 8, '#e6f7a6', FLAT) +
                        L('M46 36 L46 52 M38 44 L54 44', 1.4, '#9bc43a'),
                    face: F({ x: 100, y: 72, gap: 14, s: 0.9, my: 16, ms: 0.85 }),
                    neck: '100px 112px',
                });
            },
            shake(F) {
                return compose({
                    back: tube('M112 70 L128 14', 6, '#ff6b6b') + L('M115 60 L119 46 M120 40 L124 26', 6, '#fff'),
                    legs: legs({ x: 18, top: 168 }),
                    arms: arms({ y: 118, x: 46 }),
                    body: P('M58 76 L142 76 L130 172 L70 172Z', '#ffb3d1') + R(66, 86, 6, 70, 3, '#fff', flat({ op: 0.45 })) +
                        P(blobE(100, 70, 48, 18, 9, 8), '#fffdf8') + C(100, 48, 9, '#e63946') + L('M100 40 Q104 30 112 28', 2, '#6b3a1f'),
                    face: F({ x: 100, y: 118, gap: 15, my: 22 }),
                    neck: '100px 160px',
                });
            },
            coffee_cup(F) {
                const steam = (d) => `<g class="cv-steam">${L(d, 3, '#c9c3bb', 0.7)}</g>`;
                return compose({
                    back: steam('M92 26 Q86 16 92 8') + steam('M110 24 Q104 14 110 4'),
                    legs: legs({ x: 20, top: 168 }),
                    arms: arms({ y: 112, x: 40 }),
                    body: P('M58 52 L142 52 L130 172 L70 172Z', '#f5f0e6') +
                        P('M61 92 L139 92 L134 136 L66 136Z', '#a0522d', { sw: 2.4 }) +
                        P('M60 40 Q62 28 100 28 Q138 28 140 40Z', '#4a4a4a') + R(50, 40, 100, 16, 7, '#3d3d3d'),
                    face: F({ x: 100, y: 110, gap: 15, my: 18, ms: 0.85 }),
                    neck: '100px 150px',
                });
            },
        },

        // ---------------- DESSERTS ----------------
        desserts: {
            cake(F) {
                const candle = (x, c) => R(x, 64, 8, 32, 2, c, { sw: 2 }) +
                    `<g class="cv-flame" style="transform-origin:${x + 4}px 62px">${P(`M${x + 4} 44 Q${x + 11} 56 ${x + 4} 62 Q${x - 3} 56 ${x + 4} 44Z`, '#ffb703', { sw: 1.6 })}</g>`;
                return compose({
                    back: candle(70, '#4d96ff') + candle(96, '#ffd93d') + candle(122, '#6bcb77'),
                    arms: arms({ y: 128, x: 62 }),
                    body: R(36, 94, 128, 72, 14, '#ffd1dc') + L('M38 152 L162 152', 5, '#ff8fab') +
                        P('M34 108 Q34 90 52 90 L148 90 Q166 90 166 108 Q160 120 154 108 Q148 124 140 108 Q130 122 120 108 Q110 124 100 108 Q90 124 80 108 Q70 122 60 108 Q52 124 46 108 Q40 118 34 108Z', '#fffdf8', { sw: 2.4 }) +
                        E(100, 168, 76, 9, '#e0e6ee'),
                    face: F({ x: 100, y: 128, gap: 17, my: 20 }),
                    neck: '100px 160px',
                });
            },
            cupcake(F) {
                const pleats = [70, 84, 100, 116, 130].map((x) => L(`M${x} 106 L${(100 + (x - 100) * 0.82).toFixed(1)} 170`, 2, '#2f6fc4', 0.6)).join('');
                const sprinkles = [[80, 92, 30, '#ffd93d'], [122, 96, -30, '#6bcb77'], [92, 76, -60, '#4d96ff'], [112, 72, 60, '#fff'], [66, 102, 10, '#fff']]
                    .map(([x, y, r, c]) => `<rect x="-3.5" y="-1.2" width="7" height="2.4" rx="1.2" fill="${c}" transform="translate(${x} ${y}) rotate(${r})"/>`).join('');
                return compose({
                    legs: legs({ x: 20, top: 168 }),
                    arms: arms({ y: 132, x: 44 }),
                    body: P('M54 104 L146 104 L134 172 L66 172Z', '#4d96ff') + pleats +
                        E(100, 100, 54, 16, '#ffb6d9') + E(100, 84, 44, 15, '#ffb6d9') + E(100, 68, 30, 12, '#ffb6d9') +
                        P('M90 60 Q100 42 110 60Z', '#ffb6d9', { sw: 2.4 }) + sprinkles +
                        L('M100 38 Q104 28 112 24', 2, '#6b3a1f') + C(100, 46, 9, '#e63946'),
                    face: F({ x: 100, y: 130, gap: 15, s: 0.95, my: 20, ms: 0.9 }),
                    neck: '100px 165px',
                });
            },
            ice_cream(F) {
                let waffle = '';
                for (let k = -60; k <= 60; k += 12) {
                    waffle += L(`M${100 + k - 40} 100 L${100 + k + 40} 186`, 2, '#b97a3d', 0.7) + L(`M${100 + k + 40} 100 L${100 + k - 40} 186`, 2, '#b97a3d', 0.7);
                }
                const cone = 'M64 102 L136 102 L100 184Z';
                return compose({
                    arms: arms({ y: 92, x: 48, drop: 14 }),
                    body: P(cone, '#e0a96d') + clipped(`<path d="${cone}"/>`, waffle) +
                        P('M52 104 Q44 58 100 44 Q156 58 148 104 Q140 112 132 104 Q126 118 116 106 Q106 116 96 106 Q86 120 78 106 Q66 114 52 104Z', '#ffc2d4') +
                        [[70, 64, 40, '#4d96ff'], [130, 66, -40, '#ffd93d'], [100, 52, 0, '#6bcb77']].map(([x, y, r, c]) => `<rect x="-3.5" y="-1.2" width="7" height="2.4" rx="1.2" fill="${c}" transform="translate(${x} ${y}) rotate(${r})"/>`).join(''),
                    face: F({ x: 100, y: 78, gap: 16, my: 18 }),
                    neck: '100px 110px',
                });
            },
            chocolate(F) {
                const g = (d) => L(d, 2, '#4a2612', 0.7);
                return compose({
                    legs: legs({ x: 20, top: 172 }),
                    arms: arms({ y: 120, x: 46 }),
                    body: R(56, 34, 88, 74, 6, '#6b3a1f') + g('M56 58 L144 58') + g('M56 82 L144 82') + g('M85 34 L85 106') + g('M115 34 L115 106') +
                        R(52, 104, 96, 72, 6, '#c0392b') +
                        P('M52 104 L60 96 L68 104 L76 96 L84 104 L92 96 L100 104 L108 96 L116 104 L124 96 L132 104 L140 96 L148 104Z', '#e8c547', { sw: 2 }) +
                        `<text x="100" y="148" text-anchor="middle" font-family="Lobster, cursive" font-size="20" fill="#fff">Choco</text>`,
                    face: F({ x: 100, y: 66, gap: 16, my: 22 }),
                    neck: '100px 104px',
                });
            },
            candy(F) {
                const endL = 'M68 104 L28 78 Q22 104 28 130Z';
                const pleat = (d) => L(d, 1.8, OL, 0.5);
                return compose({
                    legs: legs({ x: 16, top: 132 }),
                    arms: `<g class="cv-arm cv-arm-l" style="transform-origin:66px 104px">${P(endL, '#ff6b6b')}${pleat('M54 96 L40 88')}${pleat('M54 112 L40 120')}</g>` +
                        `<g class="cv-arm cv-arm-r" style="transform-origin:134px 104px">${P(mir(endL), '#ff6b6b')}${pleat(mir('M54 96 L40 88'))}${pleat(mir('M54 112 L40 120'))}</g>`,
                    body: E(100, 104, 40, 32, '#ff6b6b') + both('M70 86 Q80 104 70 122', (d) => L(d, 5, '#fff', 0.9)) + shine(82, 86, 6, 3, -20),
                    face: F({ x: 100, y: 100, gap: 14, s: 0.9, my: 18, ms: 0.85 }),
                });
            },
            lollipop(F) {
                return compose({
                    arms: arms({ y: 92, x: 48 }),
                    body: tube('M100 128 L100 182', 6, '#fafafa') + C(100, 82, 52, '#ff9ff3') +
                        L(spiralPath(100, 82, 48, 3), 6, '#fff', 0.8) +
                        `<circle cx="100" cy="82" r="52" fill="none" stroke="${OL}" stroke-width="${SW}"/>`,
                    face: F({ x: 100, y: 80, gap: 16, my: 22 }),
                });
            },
            pie(F) {
                let lattice = '';
                for (let x = 50; x <= 150; x += 20) lattice += L(`M${x} 90 L${x} 134`, 6, '#f0c27b');
                for (let y = 100; y <= 126; y += 12) lattice += L(`M28 ${y} L172 ${y}`, 6, '#f0c27b');
                let rim = '';
                for (let i = 0; i < 18; i++) {
                    const a = (i / 18) * Math.PI * 2;
                    rim += C((100 + Math.cos(a) * 68).toFixed(1), (112 + Math.sin(a) * 17).toFixed(1), 5, '#e9b97a', { sw: 1.6, flat: true });
                }
                return compose({
                    legs: legs({ x: 24, top: 168 }),
                    arms: arms({ y: 140, x: 62 }),
                    body: P('M30 112 Q32 132 42 166 Q100 178 158 166 Q168 132 170 112 Q100 134 30 112Z', '#e0a96d') +
                        [54, 76, 124, 146].map((x) => L(`M${x} 128 L${x + (x < 100 ? 3 : -3)} 166`, 2, '#c98b4f', 0.6)).join('') +
                        E(100, 112, 70, 18, '#c0392b', { sw: 2.6 }) +
                        clipped('<ellipse cx="100" cy="112" rx="68" ry="16"/>', lattice) + rim,
                    face: F({ x: 100, y: 144, gap: 15, s: 0.85, my: 16, ms: 0.85 }),
                    neck: '100px 170px',
                });
            },
            pudding(F) {
                return compose({
                    arms: arms({ y: 122, x: 42 }),
                    body: P('M56 166 L66 82 Q100 70 134 82 L144 166 Q100 176 56 166Z', '#ffd166') +
                        P('M66 84 Q100 70 134 84 L136 96 Q128 104 124 96 Q118 112 110 98 Q100 106 92 96 Q84 110 78 96 Q72 104 64 96Z', '#a0522d', { sw: 2.4 }) +
                        R(70, 104, 6, 50, 3, '#fff', flat({ op: 0.35 })) + E(100, 170, 66, 9, '#dfe7f2'),
                    face: F({ x: 100, y: 124, gap: 16, my: 22 }),
                    neck: '100px 160px',
                });
            },
            popsicle(F) {
                const pop = 'M58 58 Q58 30 100 30 Q142 30 142 58 L142 150 Q142 160 132 160 L68 160 Q58 160 58 150Z';
                return compose({
                    back: R(92, 150, 16, 38, 7, '#e8c39e', { sw: 2.6 }),
                    arms: arms({ y: 110, x: 42 }),
                    body: P(pop, '#ff6b6b') + P('M58 64 Q58 30 100 30 Q142 30 142 64Z', '#ffd93d', FLAT) +
                        `<path d="${pop}" fill="none" stroke="${OL}" stroke-width="${SW}"/>` +
                        P('M76 160 Q78 172 84 172 Q90 172 90 160Z', '#ff6b6b', { sw: 2 }) + R(66, 74, 6, 66, 3, '#fff', flat({ op: 0.35 })),
                    face: F({ x: 100, y: 100, gap: 16, my: 22 }),
                });
            },
        },

        // ---------------- BIRDS ----------------
        birds: {
            owl(F) {
                const brown = '#9c6b45', disc = '#ecd6b8', wing = '#7a5234';
                const marks = [[90, 132], [110, 132], [100, 144], [90, 156], [110, 156]]
                    .map(([x, y]) => L(`M${x - 4} ${y - 3} L${x} ${y + 1} L${x + 4} ${y - 3}`, 2, brown, 0.8)).join('');
                return compose({
                    back: both('M62 66 L56 30 L84 54Z', (d) => P(d, brown)),
                    body: E(100, 112, 50, 64, brown) + E2(82, 90, 22, 21, disc, { sw: 2 }) + E(100, 142, 30, 28, disc, { sw: 0 }) + marks,
                    front: wingArms(wing) + E2(88, 176, 9, 5, '#f0a030'),
                    face: F({ x: 100, y: 90, gap: 18, er: 1.2, iris: '#f2a900', mouth: 'small', beakColor: '#f0a030', my: 16, ms: 0.9 }),
                    neck: '100px 140px',
                });
            },
            eagle(F) {
                const brown = '#6b4226', white = '#fafafa', yellow = '#f6c330';
                return compose({
                    body: E(100, 134, 46, 46, brown),
                    front: wingArms('#553319', 'M58 112 Q36 138 46 168 Q62 160 66 132Z', 62, 114) + E2(86, 178, 10, 6, yellow),
                    head: E(100, 76, 40, 36, white),
                    face: F({ x: 100, y: 72, gap: 15, iris: '#c58b00', mouth: 'hook', beakColor: yellow, my: 20 }),
                    neck: '100px 110px',
                });
            },
            duck(F) {
                const yellow = '#ffd34e', orange = '#f39c33';
                return compose({
                    body: E(100, 142, 44, 34, yellow),
                    front: wingArms('#f7c331', 'M60 128 Q42 146 52 166 Q64 158 68 140Z', 64, 130) +
                        both('M76 172 L66 184 L90 184 L86 172Z', (d) => P(d, orange)),
                    head: P('M94 44 Q90 30 100 28 Q98 36 108 34 Q104 44 94 44Z', yellow) + C(100, 80, 38, yellow),
                    face: F({ x: 100, y: 76, gap: 15, mouth: 'bill', beakColor: orange, my: 22, ms: 0.95 }),
                    neck: '100px 116px',
                });
            },
            chicken(F) {
                const white = '#fafafa', red = '#e63946', yellow = '#f6b93b';
                return compose({
                    back: P('M138 120 Q162 98 160 130 Q150 134 140 132Z', white),
                    legs: legs({ x: 12, top: 164, bottom: 178, color: yellow, shoe: yellow }),
                    body: E(100, 132, 44, 40, white),
                    front: wingArms('#e9e9ef', 'M60 118 Q40 140 50 162 Q64 156 66 134Z', 62, 120),
                    head: P('M84 50 Q80 34 92 36 Q94 22 104 28 Q112 20 116 34 Q126 36 118 50Z', red) + C(100, 76, 34, white) + E(100, 108, 6, 8, red, { sw: 2 }),
                    face: F({ x: 100, y: 74, gap: 14, mouth: 'small', beakColor: yellow, my: 22 }),
                    neck: '100px 110px',
                });
            },
            penguin_bird(F) { return penguin(F, true); },
            parrot(F) {
                const red = '#e63946', yellow = '#ffd23f', blue = '#2e86de';
                return compose({
                    back: P('M90 160 L82 194 L100 186 L118 194 L110 160Z', blue),
                    body: E(100, 134, 40, 42, red),
                    front: wingArms(blue, 'M62 112 Q40 138 50 168 Q66 160 68 132Z', 64, 114,
                        (r) => P(r ? mir('M62 114 Q52 124 50 136 Q60 130 66 120Z') : 'M62 114 Q52 124 50 136 Q60 130 66 120Z', yellow, FLAT)) +
                        E2(88, 176, 8, 5, '#8d8d99'),
                    head: C(100, 78, 36, red) + E2(85, 74, 13, 13, '#fff', { sw: 0 }),
                    face: F({ x: 100, y: 74, gap: 15, er: 0.9, mouth: 'hook', beakColor: '#f1f2f6', beakLow: '#2b2233', my: 20 }),
                    neck: '100px 112px',
                });
            },
            pigeon(F) {
                const grey = '#8e9aaf', dark = '#5d6b82';
                return compose({
                    body: E(100, 134, 46, 40, grey) +
                        P('M70 100 Q100 124 130 100 Q132 114 100 124 Q68 114 70 100Z', '#4fb286', { sw: 0 }) +
                        P('M78 106 Q100 120 122 106 Q112 116 100 118 Q88 116 78 106Z', '#8e6bbf', flat({ op: 0.7 })),
                    front: wingArms('#7b879c', 'M58 116 Q38 140 48 166 Q62 158 66 134Z', 60, 118,
                        (r) => L(r ? mir('M52 140 L62 144') : 'M52 140 L62 144', 3, dark) + L(r ? mir('M50 150 L60 154') : 'M50 150 L60 154', 3, dark)) +
                        E2(88, 176, 9, 5, '#e58fa0'),
                    head: C(100, 80, 34, grey),
                    face: F({ x: 100, y: 78, gap: 14, iris: '#e8702a', mouth: 'small', beakColor: '#4b4453', beakLow: '#3a3440', my: 20 }),
                    top: C(100, 95, 3.2, '#f2f2f2', { sw: 1.4, flat: true }),
                    neck: '100px 112px',
                });
            },
            flamingo(F) {
                const pink = '#ff8fab', deep = '#f06a8f';
                return compose({
                    legs: L('M104 154 L104 180', 3.5, deep) + L('M116 154 L116 168 L106 164', 3.5, deep) + E(100, 182, 9, 4, deep, { sw: 2 }),
                    body: E(112, 130, 42, 28, pink) + tube('M92 122 Q70 104 82 86 Q90 76 90 66', 13, pink),
                    front: `<g class="cv-arm cv-arm-r" style="transform-origin:100px 124px">${P('M96 122 Q118 112 146 124 Q136 144 110 140Z', deep, { sw: 2.4 })}</g>`,
                    head: C(90, 58, 27, pink),
                    face: F({ x: 90, y: 56, gap: 13, s: 0.95, mouth: 'small', beakColor: '#fff0d9', beakLow: '#2b2233', my: 18 }),
                    neck: '90px 90px', sx: 108,
                });
            },
            peacock(F) {
                let fan = '';
                for (let i = 0; i < 9; i++) {
                    const a = ((195 + i * (150 / 8)) * Math.PI) / 180;
                    const fx = (100 + Math.cos(a) * 64).toFixed(1);
                    const fy = (128 + Math.sin(a) * 64).toFixed(1);
                    const deg = ((a * 180) / Math.PI + 90).toFixed(0);
                    const ex = (100 + Math.cos(a) * 72).toFixed(1);
                    const ey = (128 + Math.sin(a) * 72).toFixed(1);
                    fan += E(fx, fy, 14, 28, '#2a9d8f', { rot: deg }) +
                        dot(ex, ey, 8, '#f4d35e') + dot(ex, ey, 5, '#1d6fb8') + dot(ex, ey, 2.6, '#1d3557');
                }
                const blue = '#1e6fd9';
                return compose({
                    back: fan,
                    body: E(100, 140, 34, 38, blue),
                    front: wingArms('#2a9d8f', 'M68 124 Q50 144 58 168 Q70 160 74 140Z', 70, 126) + E2(88, 178, 8, 5, '#b0a58a'),
                    head: L('M100 64 L92 44 M100 64 L100 40 M100 64 L108 44', 2, OL) + dot(92, 44, 3.2, blue) + dot(100, 40, 3.2, blue) + dot(108, 44, 3.2, blue) +
                        C(100, 88, 26, blue),
                    face: F({ x: 100, y: 86, gap: 12, s: 0.95, er: 0.85, mouth: 'small', beakColor: '#d8c99b', my: 16 }),
                    neck: '100px 114px',
                });
            },
            swan(F) {
                const white = '#fafafa', orange = '#f39c33';
                return compose({
                    body: E(110, 146, 48, 30, white) + tube('M86 140 Q70 116 80 96 Q88 82 90 72', 13, white),
                    front: `<g class="cv-arm cv-arm-r" style="transform-origin:104px 140px">${P('M100 138 Q124 116 156 130 Q146 152 116 152Z', '#eef0f4', { sw: 2.4 })}</g>` +
                        E2(96, 180, 10, 4, OL),
                    head: C(90, 62, 25, white),
                    face: F({ x: 90, y: 60, gap: 12, s: 0.95, er: 0.9, mouth: 'small', beakColor: orange, beakLow: '#e08a20', my: 17 }),
                    neck: '90px 96px', sx: 110,
                });
            },
            rooster(F) {
                const gold = '#f0a030', bodyC = '#9c3a24', red = '#e63946', yellow = '#f6c330';
                return compose({
                    back: tube('M132 132 Q176 104 166 70', 11, '#1e7a4c') + tube('M136 142 Q186 128 182 94', 11, '#1b4d3e') + tube('M132 152 Q176 156 184 128', 10, '#2d6a4f'),
                    legs: legs({ x: 12, top: 164, bottom: 178, color: yellow, shoe: yellow }),
                    body: E(100, 136, 42, 40, bodyC) + P('M66 116 Q100 140 134 116 Q130 100 100 100 Q70 100 66 116Z', gold, { sw: 0 }),
                    front: wingArms('#7a2a18', 'M62 120 Q42 142 52 164 Q66 158 68 136Z', 64, 122),
                    head: P('M80 56 Q72 36 86 38 Q86 20 100 28 Q110 14 118 32 Q132 30 124 52Z', red) + C(100, 78, 32, gold) + E2(95, 110, 5, 9, red, { sw: 2 }),
                    face: F({ x: 100, y: 76, gap: 14, iris: '#c0392b', mouth: 'small', beakColor: yellow, my: 20 }),
                    neck: '100px 110px',
                });
            },
        },

        // ---------------- SEA CREATURES ----------------
        sea: {
            fish(F) {
                const fin = '#ff7f11';
                return compose({
                    back: P('M78 66 Q94 34 130 62Z', fin) + P('M90 152 Q104 176 124 152Z', fin) +
                        C(28, 60, 5, '#dff4ff', { sw: 2 }) + C(40, 42, 3.5, '#dff4ff', { sw: 2 }),
                    body: P('M40 110 Q46 62 100 62 Q140 62 154 100 L184 72 Q178 110 184 148 L154 120 Q140 158 100 158 Q46 158 40 110Z', '#ff9f43') +
                        P('M112 64 Q126 110 112 156 Q100 110 112 64Z', '#fff', { sw: 2.4 }) + P('M148 96 Q156 110 148 124 Q142 110 148 96Z', '#fff', { sw: 2.4 }),
                    front: `<g class="cv-arm cv-arm-r" style="transform-origin:102px 122px">${P('M100 120 Q86 140 100 148 Q112 136 106 120Z', fin)}</g>`,
                    face: F({ x: 76, y: 100, gap: 13, er: 0.95, my: 26, ms: 0.9 }),
                    neck: '76px 130px', sx: 104, sr: 50,
                });
            },
            shark(F) {
                const gill = (d) => L(d, 2.4, OL, 0.55);
                return compose({
                    back: P('M86 72 Q100 26 126 74Z', '#6c7a91'),
                    body: P('M26 112 Q40 70 96 68 Q144 68 160 96 L188 64 Q184 110 190 152 L160 124 Q140 154 96 156 Q40 156 26 112Z', '#7f8fa6') +
                        P('M32 120 Q60 150 100 152 Q132 152 152 128 Q110 138 32 120Z', '#f1f2f6', { sw: 0 }) +
                        gill('M118 100 Q114 110 118 120') + gill('M126 98 Q122 110 126 122') + gill('M134 98 Q130 110 134 120'),
                    front: `<g class="cv-arm cv-arm-r" style="transform-origin:102px 130px">${P('M96 130 Q84 156 106 160 Q110 142 108 130Z', '#6c7a91')}</g>`,
                    face: F({ x: 68, y: 98, gap: 14, er: 0.9, my: 30, ms: 1.15 }),
                    neck: '68px 130px', sx: 106, sr: 56,
                });
            },
            octopus(F) {
                const col = '#c56cf0', light = '#e3a8ff';
                const t = (d) => tube(d, 15, col);
                return compose({
                    back: t('M66 116 Q50 146 60 168 Q66 178 76 172') + t(mir('M66 116 Q50 146 60 168 Q66 178 76 172')) +
                        t('M86 122 Q78 152 88 176 Q92 182 98 176') + t(mir('M86 122 Q78 152 88 176 Q92 182 98 176')) +
                        dot(60, 160, 2.4, light) + dot(140, 160, 2.4, light) + dot(86, 166, 2.4, light) + dot(114, 166, 2.4, light),
                    arms: `<g class="cv-arm cv-arm-l" style="transform-origin:58px 110px">${t('M58 110 Q30 120 26 146 Q24 160 36 160')}</g>` +
                        `<g class="cv-arm cv-arm-r" style="transform-origin:142px 110px">${t(mir('M58 110 Q30 120 26 146 Q24 160 36 160'))}</g>`,
                    body: P('M50 108 Q46 38 100 36 Q154 38 150 108 Q150 128 100 130 Q50 128 50 108Z', col) +
                        dot(70, 60, 6, light, 0.8) + dot(132, 56, 4.5, light, 0.8) + dot(140, 80, 5, light, 0.8) + dot(62, 84, 3.5, light, 0.8),
                    face: F({ x: 100, y: 86, gap: 17, my: 26 }),
                });
            },
            whale(F) {
                const blue = '#4a90e2';
                const groove = (d) => L(d, 1.8, '#8fb9ea');
                return compose({
                    back: P('M160 98 Q166 66 186 58 Q190 80 178 98 Q194 102 198 122 Q180 126 166 116Z', blue) +
                        L('M74 52 Q70 32 58 26', 3, '#7ec8ff') + L('M74 52 Q78 30 92 22', 3, '#7ec8ff') +
                        dot(56, 22, 3.5, '#bfe6ff') + dot(94, 18, 3, '#bfe6ff'),
                    body: P('M22 120 Q22 58 96 56 Q150 56 168 104 Q166 160 96 164 Q22 164 22 120Z', blue) +
                        P('M28 130 Q56 160 100 160 Q140 160 160 132 Q110 148 28 130Z', '#d6e9ff', { sw: 0 }) +
                        groove('M50 142 Q90 154 130 146') + groove('M60 150 Q96 158 124 154'),
                    front: `<g class="cv-arm cv-arm-r" style="transform-origin:96px 134px">${P('M88 134 Q76 158 98 160 Q104 146 100 134Z', '#3b7dd0')}</g>`,
                    face: F({ x: 68, y: 100, gap: 14, my: 28 }),
                    neck: '68px 130px', sx: 104, sr: 58,
                });
            },
            dolphin(F) {
                return compose({
                    back: P('M96 74 Q110 44 128 76Z', '#5a88bf'),
                    body: P('M18 114 Q24 104 42 102 Q56 72 104 70 Q148 70 166 100 L190 80 Q184 112 190 142 L164 124 Q142 152 100 152 Q60 152 46 126 Q26 126 18 120Z', '#6c9bd2') +
                        P('M24 118 Q40 126 50 128 Q66 150 100 150 Q130 150 150 130 Q110 140 70 120 Q50 116 24 118Z', '#e3eefa', { sw: 0 }),
                    front: `<g class="cv-arm cv-arm-r" style="transform-origin:102px 128px">${P('M96 128 Q86 152 106 154 Q110 140 108 128Z', '#5a88bf')}</g>`,
                    face: F({ x: 70, y: 96, gap: 12, er: 0.9, mx: -34, my: 20, ms: 0.75 }),
                    neck: '70px 130px', sx: 104, sr: 58,
                });
            },
            crab(F) {
                const red = '#e8553f', dark = '#c0392b';
                const leg = (d) => tube(d, 6, red);
                const claw = 'M60 114 Q40 108 34 90';
                const pincer = 'M34 92 Q14 82 18 58 Q30 58 34 70 Q38 58 48 66 Q48 86 34 92Z';
                return compose({
                    back: both('M64 128 Q44 140 38 162', leg) + both('M70 138 Q56 152 54 172', leg) + both('M80 144 Q72 160 74 178', leg) +
                        tube('M88 100 L86 64', 6, red) + tube('M112 100 L114 64', 6, red),
                    body: E(100, 120, 54, 34, red) + dot(76, 106, 3, dark) + dot(126, 104, 2.5, dark) + dot(136, 124, 3, dark) + dot(66, 128, 2.5, dark),
                    front: `<g class="cv-arm cv-arm-l" style="transform-origin:60px 114px">${tube(claw, 8, red)}${P(pincer, red)}</g>` +
                        `<g class="cv-arm cv-arm-r" style="transform-origin:140px 114px">${tube(mir(claw), 8, red)}${P(mir(pincer), red)}</g>`,
                    face: F({ x: 100, y: 60, gap: 15, er: 0.95, my: 66, ms: 0.9, noBlush: true }),
                    neck: '100px 120px', sr: 58,
                });
            },
            lobster(F) {
                const red = '#d63031';
                const claw = 'M68 96 Q44 100 36 80';
                const pincer = 'M36 82 Q12 72 16 44 Q30 44 34 58 Q38 44 50 50 Q52 76 36 82Z';
                return compose({
                    back: L('M92 56 Q76 20 54 12', 2.5, OL) + L(mir('M92 56 Q76 20 54 12'), 2.5, OL) +
                        both('M80 120 Q66 128 62 140', (d) => tube(d, 4, red)) + both('M82 134 Q70 144 68 156', (d) => tube(d, 4, red)),
                    body: P('M86 166 L74 188 L100 182 L126 188 L114 166Z', red) +
                        E(100, 160, 20, 10, red) + E(100, 144, 24, 12, red) + E(100, 126, 28, 14, red) + E(100, 84, 34, 36, red),
                    front: `<g class="cv-arm cv-arm-l" style="transform-origin:68px 96px">${tube(claw, 8, red)}${P(pincer, red)}</g>` +
                        `<g class="cv-arm cv-arm-r" style="transform-origin:132px 96px">${tube(mir(claw), 8, red)}${P(mir(pincer), red)}</g>`,
                    face: F({ x: 100, y: 76, gap: 13, my: 26, ms: 0.9 }),
                    neck: '100px 116px',
                });
            },
            snail(F) {
                const bodyC = '#a8d08d';
                return compose({
                    back: tube('M68 78 L62 44', 5, bodyC) + tube('M86 78 L92 44', 5, bodyC),
                    body: C(130, 116, 40, '#e0a458') +
                        L('M130 116 Q138 112 136 104 Q130 96 120 104 Q110 116 122 130 Q138 142 154 126 Q166 106 150 88 Q130 72 104 86', 3, '#a8692e') +
                        P('M54 160 L54 96 Q54 72 76 72 Q98 72 98 96 L100 160Z', bodyC) +
                        P('M28 172 Q30 152 60 148 L150 150 Q170 156 178 168 Q180 180 160 180 L42 180 Q28 180 28 172Z', bodyC),
                    face: F({ x: 77, y: 42, gap: 15, er: 0.85, my: 56, ms: 0.85, noBlush: true }),
                    neck: '77px 100px', sx: 104, sr: 74,
                });
            },
            turtle(F) {
                const shell = '#4f8a35', plate = '#f3dc8a', skin = '#8fcf6a';
                const pl = (d) => L(d, 2, '#c9a94e');
                return compose({
                    back: P('M146 160 Q166 162 170 150 Q160 148 150 150Z', skin),
                    body: E(100, 130, 54, 44, shell) +
                        L('M58 110 L72 120 L72 140 L58 150', 2.4, '#3a6b26') + L(mir('M58 110 L72 120 L72 140 L58 150'), 2.4, '#3a6b26') +
                        E(100, 136, 34, 34, plate, { sw: 2.4 }) + pl('M70 124 L130 124') + pl('M68 144 L132 144') + pl('M100 104 L100 168'),
                    front: pawArms(skin, 122, 44) + E2(78, 176, 12, 9, skin),
                    head: C(100, 70, 32, skin),
                    face: F({ x: 100, y: 70, gap: 14, my: 20, ms: 0.9 }),
                    neck: '100px 104px', sr: 52,
                });
            },
            frog(F) {
                const green = '#6ab04c', belly = '#cdeaa8';
                return compose({
                    back: both('M64 150 Q36 152 40 176 L70 178 Q60 168 72 160Z', (d) => P(d, green)),
                    body: E(100, 150, 40, 28, green) + E(100, 156, 26, 18, belly, { sw: 0 }),
                    front: pawArms(green, 146, 34),
                    head: C2(74, 64, 19, green) + E(100, 98, 58, 38, green) + dot(86, 122, 1.6, '#3f7a2a') + dot(114, 122, 1.6, '#3f7a2a'),
                    face: F({ x: 100, y: 60, gap: 26, er: 1.05, my: 46, ms: 1.4, blushOp: 0.5 }),
                    neck: '100px 134px', sr: 54,
                });
            },
            crocodile(F) {
                const green = '#4c9a2a', snout = '#5fb33a';
                const tooth = (d) => P(d, '#fff', { sw: 1.4, flat: true });
                return compose({
                    back: tail('M130 168 Q170 172 182 150', 14, green, 130, 168),
                    body: E(100, 162, 38, 22, green) + E(100, 166, 24, 14, '#cde6a2', { sw: 0 }),
                    front: pawArms(green, 152, 34),
                    head: C2(80, 46, 14, green) + E(100, 76, 46, 34, green) + E(100, 112, 42, 26, snout) +
                        E2(91, 100, 2.6, 2, OL, FLAT) + both('M70 126 L74 132 L78 126', tooth) +
                        dot(86, 62, 2, '#3a7a1f') + dot(100, 58, 2, '#3a7a1f') + dot(114, 62, 2, '#3a7a1f'),
                    face: F({ x: 100, y: 44, gap: 20, er: 0.9, iris: '#c9a227', my: 76, ms: 1.4, noBlush: true }),
                    neck: '100px 140px', sr: 50,
                });
            },
        },
    };

    // Generic character for any item that has no bespoke drawing yet.
    function fallbackArt(F, color) {
        return compose({
            legs: legs({ x: 20, top: 156 }),
            arms: arms({ y: 110, x: 56 }),
            body: C(100, 106, 56, color || '#f3c969') + shine(74, 80, 8, 14, 30),
            face: F({ x: 100, y: 102, gap: 16, my: 24 }),
        });
    }

    // Representative character for each category card.
    const CATEGORY_HERO = {
        animals: 'dog', fruits: 'strawberry', food: 'pizza', vegetables: 'carrot',
        drinks: 'coffee', desserts: 'cupcake', birds: 'owl', sea: 'octopus',
    };

    const MOODS = {
        grumpy: 'angry', furious: 'angry', judgmental: 'angry',
        dramatic: 'worried', overdramatic: 'worried', moody: 'worried',
        sassy: 'sly', sarcastic: 'sly', snarky: 'sly', mysterious: 'sly',
    };
    const moodFor = (adjective) => MOODS[String(adjective || '').toLowerCase()] || 'happy';

    const escAttr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

    // ---------- shared <defs> (gradient + mouth clip paths) ----------
    function ensureDefs() {
        if (document.getElementById('cv-defs')) return;
        if (!document.body) {
            document.addEventListener('DOMContentLoaded', ensureDefs, { once: true });
            return;
        }
        const clips = Object.keys(VIS)
            .map((k) => `<clipPath id="cv-m-${k}" clipPathUnits="userSpaceOnUse"><path d="${VIS[k]}"/></clipPath>`).join('');
        const holder = document.createElement('div');
        holder.innerHTML =
            `<svg id="cv-defs" width="0" height="0" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true" focusable="false"><defs>` +
            `<radialGradient id="cv-shade" cx=".36" cy=".3" r=".8">` +
            `<stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset=".38" stop-color="#fff" stop-opacity="0"/>` +
            `<stop offset=".7" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/>` +
            `</radialGradient>${clips}</defs></svg>`;
        document.body.appendChild(holder.firstChild);
    }

    function render(categoryKey, itemKey, opts) {
        ensureDefs();
        opts = opts || {};
        const mood = opts.mood || 'happy';
        const F = (o) => face(Object.assign({ mood }, o));
        const draw = ART[categoryKey] && ART[categoryKey][itemKey];
        const inner = draw ? draw(F) : fallbackArt(F, opts.color);
        const a11y = opts.label ? `role="img" aria-label="${escAttr(opts.label)}"` : 'aria-hidden="true" focusable="false"';
        return `<svg class="cv cv-size-${opts.size || 'stage'} cv-mood-${mood}" viewBox="0 0 200 200" data-v="X" ${a11y}>${inner}</svg>`;
    }

    // ============================================================
    // LIP-SYNC – text → mouth shapes (Preston Blair-style visemes)
    // ============================================================
    const LETTER_VISEME = {
        a: 'AI', i: 'AI', e: 'E', y: 'E', o: 'O', u: 'U', w: 'U', q: 'U',
        m: 'MBP', b: 'MBP', p: 'MBP', f: 'FV', v: 'FV',
        l: 'L', t: 'L', d: 'L', n: 'L', h: null,
    };
    const CYCLE = ['AI', 'etc', 'O', 'E', 'MBP', 'AI', 'U', 'E', 'L'];
    const CJK = /[぀-ヿ㐀-鿿가-힯]/;

    function wordToVisemes(word) {
        const raw = String(word || '').toLowerCase();
        const w = raw.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]/g, '');
        const seq = [];
        const push = (v) => { if (v && seq[seq.length - 1] !== v) seq.push(v); };

        if (!w) {
            // Non-Latin scripts: approximate syllables from character count.
            const chars = Array.from(raw.replace(/[\s.,!?;:'"“”‘’()\-…。、！？]/g, ''));
            if (!chars.length) return ['MBP'];
            const n = Math.max(1, Math.round(chars.length * (CJK.test(raw) ? 1 : 0.5)));
            for (let i = 0; i < n; i++) {
                const code = chars[Math.min(chars.length - 1, i)].codePointAt(0);
                push(CYCLE[(code + i) % CYCLE.length]);
                if (seq.length === i) seq.push(i % 2 ? 'etc' : 'AI');
            }
            return seq;
        }

        for (let i = 0; i < w.length; i++) {
            const c = w[i], n = w[i + 1];
            if (c === 't' && n === 'h') { push('L'); i++; continue; }
            if ((c === 's' || c === 'c') && n === 'h') { push('U'); i++; continue; }
            if (c === 'o' && n === 'o') { push('U'); i++; continue; }
            if (c === 'e' && n === 'e') { push('E'); i++; continue; }
            const v = c in LETTER_VISEME ? LETTER_VISEME[c] : 'etc';
            push(v);
        }
        return seq.length ? seq : ['etc'];
    }

    function wordDuration(word, rate) {
        const n = String(word).replace(/[\s.,!?;:'"]/g, '').length || 1;
        return Math.min(900, Math.max(170, n * 62 + 50)) / (rate || 1);
    }

    function createRig(svg) {
        if (!svg) return null;
        let wordTimers = [];
        let textTimer = null;
        let blinkTimer = null;
        let lookTimer = null;
        let emphTimer = null;
        let dead = false;

        const setV = (v) => svg.setAttribute('data-v', v);
        const clearWord = () => { wordTimers.forEach(clearTimeout); wordTimers = []; };

        function alive() {
            if (dead) return false;
            if (!svg.isConnected) { destroy(); return false; }
            return true;
        }

        function blink() {
            if (!alive()) return;
            svg.classList.add('cv-blink');
            setTimeout(() => svg.classList.remove('cv-blink'), 120);
            if (Math.random() < 0.18) {
                setTimeout(() => {
                    svg.classList.add('cv-blink');
                    setTimeout(() => svg.classList.remove('cv-blink'), 110);
                }, 260);
            }
            blinkTimer = setTimeout(blink, 2200 + Math.random() * 3200);
        }

        function look() {
            if (!alive()) return;
            const talking = svg.classList.contains('is-speaking');
            const r = talking ? 0.8 : 2.2;
            svg.style.setProperty('--lx', `${((Math.random() * 2 - 1) * r).toFixed(2)}px`);
            svg.style.setProperty('--ly', `${((Math.random() * 2 - 1) * r * 0.6).toFixed(2)}px`);
            lookTimer = setTimeout(look, 1400 + Math.random() * 2600);
        }

        function emphasize() {
            svg.classList.add('cv-emph');
            clearTimeout(emphTimer);
            emphTimer = setTimeout(() => svg.classList.remove('cv-emph'), 380);
        }

        // Animate one spoken word; returns how long the mouth animation lasts (ms).
        function speakWord(word, rate) {
            if (!alive()) return 0;
            clearWord();
            const seq = wordToVisemes(word);
            const total = wordDuration(word, rate);
            const step = Math.max(55, Math.min(150, total / seq.length));
            seq.forEach((v, i) => wordTimers.push(setTimeout(() => setV(v), i * step)));
            wordTimers.push(setTimeout(() => setV('X'), seq.length * step));
            if (/[!?]$/.test(word) || String(word).length > 8 || Math.random() < 0.12) emphasize();
            return seq.length * step;
        }

        // Fallback when the browser sends no word-boundary events.
        function playText(text, rate) {
            stopText();
            const words = String(text || '').split(/\s+/).filter(Boolean);
            let i = 0;
            const next = () => {
                if (!alive() || i >= words.length) { textTimer = null; return; }
                const w = words[i++];
                const d = speakWord(w, rate);
                const pause = /[.,!?;:]$/.test(w) ? 260 : 80;
                textTimer = setTimeout(next, d + pause / (rate || 1));
            };
            next();
        }

        function stopText() { clearTimeout(textTimer); textTimer = null; }
        function start() { if (alive()) svg.classList.add('is-speaking'); }
        function stop() {
            clearWord();
            stopText();
            setV('X');
            svg.classList.remove('is-speaking', 'cv-emph');
        }
        function destroy() {
            dead = true;
            clearTimeout(blinkTimer);
            clearTimeout(lookTimer);
            clearTimeout(emphTimer);
            clearWord();
            stopText();
        }

        blinkTimer = setTimeout(blink, 1200);
        lookTimer = setTimeout(look, 900);

        return { speakWord, playText, stopText, start, stop, destroy, setViseme: setV };
    }

    ensureDefs();

    window.CharacterArt = {
        render,
        createRig,
        moodFor,
        wordToVisemes,
        heroFor: (categoryKey) => CATEGORY_HERO[categoryKey],
        hasArt: (categoryKey, itemKey) => !!(ART[categoryKey] && ART[categoryKey][itemKey]),
    };
})();
