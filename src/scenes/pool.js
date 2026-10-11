// Chapter II, "The Pool of Tears", staged in the Chapter I hall (src/sets/hall.js):
// Alice grows until her head strikes the roof, cries a pool of tears, frightens the
// White Rabbit into dropping his gloves and fan, wonders who she is, shrinks again, slips
// into her own tears, and swims with the Mouse until the birds and animals arrive.
// The art is the AI drawings (tools/compose_poses.py for Alice, tools/ch2_art.py for the
// rest); tears are still drawn in code (props2.js).
import * as THREE from 'three';
import { paperFlat } from '../stage.js';
import { texture } from '../ink.js';
import { buildHall, TABLE, DOOR, KEY, H } from '../sets/hall.js';
import { tear } from '../props2.js';
import { thoughts } from '../thoughts.js';
import { carry } from '../puppet.js';
import { smooth, lerp, route, cameraTrack } from '../track.js';

const GIANT = 2.55;       // "more than nine feet high": her head reaches the roof
const TWO_FEET = 0.48;
const TINY = 0.13;        // "I never was so small as this before"
const WATER_Y = 0.1;      // "about four inches deep"
// The pool spreads round where she sits crying, "reaching half down the hall"; the table
// and the little door stay on dry floor.
const POOL = { x: 3.2, z: -0.6, rx: 2.8, rz: 1.3 };

export const pool = {
  id: 'pool',
  title: 'Curiouser and curiouser',
  start: () => 0,
  parts: (cue) => [
    { title: 'Nine feet high', t: cue.at('struck') - 1 },
    { title: 'A pool of tears', t: cue.at('lying') - 2 },
    { title: 'The White Rabbit returns', t: cue.at('pattering') - 1.5 },
    { title: 'Who in the world am I?', t: cue.at('took', 2) - 1 },
    { title: 'Shrinking again', t: cue.at('hands', 2) - 1.5 },
    { title: 'Splash!', t: cue.at('slipped') - 1.5 },
    { title: 'The Mouse', t: cue.para('Just then she heard something splashing') },
    { title: 'The birds and animals', t: cue.at('crowded') - 2 },
  ],

  build({ group, ai, cue, hallMeta }) {
    const at = cue.at;
    const T = {
      telescope: at('telescope'), feet: at('feet', 2), struck: at('struck'), key: at('key'), hurried: at('hurried'),
      lying: at('lying'), sat: at('sat'), cry: at('cry'), hall: at('hall', 2),
      pattering: at('pattering'), near: at('rabbit', 2), please: at('please'), started: at('started'), dropped: at('dropped'),
      skurried: at('skurried'), took: at('took', 2), fanning: at('fanning'), ada: at('ada'), puzzling: at('dear', 1, at('ada')),
      lap: at('hands', 1), crocodile: at('crocodile'), notRight: cue.para('“I’m sure those are not the right words'),
      burst: at('tears', 3), hands: at('hands', 2), table: at('table', 2), two: at('two'), droppedFan: at('dropped', 2),
      garden: at('garden', 3), ran: at('ran'), shut: at('shut'), keyOnTable: at('key', 2), slipped: at('slipped'), splash: at('splash'),
      bathing: at('bathing'), poolOfTears: at('pool', 2), swam: at('swam', 1), splashing: cue.para('Just then she heard something splashing'),
      nearer: at('swam', 2), walrus: at('walrus'), mouse: at('mouse', 1), leap: at('leap'), dinah: at('dinah'), purring: at('purring'),
      bristling: at('mouse', 11), terrier: at('terrier'), offended: at('offended', 2), away: at('swimming', 2), turned: at('turned'),
      crowded: at('crowded'), ledTheWay: at('swam', 5), end: cue.end,
    };

    // --- The set: the Chapter I hall, the curtain already drawn aside, the door shut ---
    const { key, curt } = buildHall({ group, ai, hallMeta });
    curt.position.set(DOOR.x + 0.85, 0, DOOR.z + 0.03);
    const KEY_ON_TABLE = [TABLE.x + 0.12, TABLE.top + 0.015 + KEY.h / 2, TABLE.z + 0.08];

    // The pool of tears: engraved water lines, spreading as she cries and rising to four inches.
    const waterTex = ai['ch2/pool_water'].tex;
    waterTex.wrapS = waterTex.wrapT = THREE.RepeatWrapping;
    const pond = new THREE.Mesh(new THREE.CircleGeometry(1, 72), new THREE.MeshBasicMaterial({ map: waterTex }));
    pond.rotation.x = -Math.PI / 2;
    group.add(pond);
    const spread = (t) => smooth((t - T.cry) / (T.hall - T.cry));

    // Tears, falling while she cries; drops thrown up when she falls in.
    const dropTex = texture(tear());
    const drops = Array.from({ length: 10 }, () => {
      const d = paperFlat(dropTex, 1, 1.5, { anchor: 'center', edge: false });
      group.add(d);
      return d;
    });

    // The Rabbit's white kid gloves and large fan, which Alice picks up.
    const gloves = paperFlat(ai['ch2/kid_gloves'].tex, 0.07, 0.07 / ai['ch2/kid_gloves'].aspect, { anchor: 'center' });
    const fanProp = paperFlat(ai['props/fan'].tex, 0.2, 0.2 / ai['props/fan'].aspect, { anchor: 'center' }); // AI drawing (tools/small_props.py)
    group.add(gloves, fanProp);
    const splash = paperFlat(ai['ch2/splash'].tex, 0.22, 0.22 / ai['ch2/splash'].aspect, { edge: false });
    // The pool's far shore, seen from water level by tiny Alice: the stones of the floor's
    // edge rising like cliffs (the band of stones from the shore drawing; the hall itself
    // stands behind). Laid round the far half of the pool, alternately mirrored so the
    // stones' tops meet.
    const rimTex = ai['ch2/pool_rim'].tex, RIM_H = 0.12, RIM_W = RIM_H * ai['ch2/pool_rim'].aspect;
    const shore = new THREE.Group();
    const RIM_N = 14;
    for (let i = 0; i < RIM_N; i++) {
      const a = Math.PI * (1.04 + 0.92 * (i + 0.5) / RIM_N);          // round the back of the pool
      const piece = paperFlat(rimTex, RIM_W, RIM_H, { edge: false });
      piece.position.set(POOL.x + Math.cos(a) * POOL.rx * 1.0, WATER_Y - 0.02, POOL.z + Math.sin(a) * POOL.rz * 1.0);
      // Face the pool's centre; mirrored every other piece.
      piece.lookAt(POOL.x, WATER_Y - 0.02, POOL.z);
      if (i % 2) piece.scale.x = -1;
      shore.add(piece);
    }
    group.add(splash, shore);

    const V = (n) => ai[`vignettes/${n}`].tex;
    const think = thoughts(group, [
      { t0: at('right') - 1, t1: at('dear', 1) + 1, art: V('foot_parcel') },  // "Alice's Right Foot, Esq."
      { t0: T.ada - 0.5, t1: T.puzzling + 1, art: V('ada_mabel') },
      { t0: T.crocodile - 1, t1: T.notRight, art: V('crocodile') },
      { t0: T.bathing - 1.5, t1: T.poolOfTears - 0.5, art: V('seaside') },
      { t0: T.walrus - 0.8, t1: T.mouse - 0.3, art: V('walrus') },
      { t0: T.purring - 1, t1: T.purring + 13, art: V('dinah_fire') },
      { t0: T.terrier - 1, t1: T.offended - 3, art: V('terrier') },
    ]);

    // --- Alice -----------------------------------------------------------------
    const START = { x: TABLE.x - 0.05, z: TABLE.z + 0.45 };   // where Chapter I left her, by the table leg
    const BY_DOOR = { x: DOOR.x - 0.9, z: -2.25 };
    const CRYING = { x: 2.9, z: -1.3 };
    const FAN_SPOT = { x: 1.6, z: 0.75 };                       // where the Rabbit drops them
    const TALKING = { x: 1.9, z: 0.35 };
    const MEASURE = { x: 0.0, z: -0.6 };                        // beside the table, on dry floor
    const AT_DOOR = { x: DOOR.x - 0.15, z: DOOR.z + 0.22 };
    const EDGE = { x: 2.9, z: -1.95 };                          // the pool's edge
    const IN_POOL = { x: 3.0, z: -1.6 };

    const scaleAt = (t) => {
      if (t < T.hands) return lerp(0.2, 2.3, smooth((t - 1.5) / (T.telescope + 1.5 - 1.5))) + (GIANT - 2.3) * smooth((t - T.struck + 1) / 1.1);
      if (t < T.two) return lerp(GIANT, TWO_FEET, smooth((t - T.table) / (T.two - T.table)));
      return lerp(TWO_FEET, TINY, smooth((t - T.two) / (T.droppedFan + 0.4 - T.two)));
    };

    const walk = (t) => route(t, [
      [0, START],
      [T.hurried, START],
      [T.hurried + 2.5, BY_DOOR],                                 // "hurried off to the garden door"
      [T.sat - 1, BY_DOOR],
      [T.sat + 1, CRYING],
      [T.took - 1, CRYING],
      [T.took + 1.2, FAN_SPOT],                                    // takes up the fan and gloves
      [T.fanning, TALKING],
      [T.table - 0.5, TALKING],
      [T.two + 1, MEASURE],                                        // "went to the table to measure herself"
      [T.ran, MEASURE],
      [T.ran + 3.5, { x: 1.5, z: -1.9 }],                          // "ran with all speed back to the little door"
      [T.shut - 0.5, AT_DOOR],
      [T.keyOnTable + 4, AT_DOOR],
      [T.slipped, EDGE],
    ], { phase: t * 2.2 });

    const swim = (t) => route(t, [
      [T.splash, IN_POOL],
      [T.swam, IN_POOL],
      [T.splashing, { x: 3.4, z: -1.1, dir: 1 }],                  // "swam about, trying to find her way out"
      [T.nearer + 6, { x: 3.55, z: -0.75, dir: 1 }],               // "swam nearer to make out what it was"
      [T.purring - 2, { x: 3.55, z: -0.75 }],
      [T.purring + 10, { x: 3.3, z: -0.55, dir: -1 }],             // "as she swam lazily about in the pool"
      [T.ledTheWay - 3, { x: 3.3, z: -0.55 }],
      [T.end + 1, { x: 0.9, z: -0.5, dir: -1 }],                   // "Alice led the way … to the shore"
    ], { phase: t * 0.8 });

    // Her drawn poses, by the text. (Whole figures, tools/compose_poses.py.)
    const talking = (t) => (t >= T.mouse - 1 && t < T.away) || (t >= T.turned + 7 && t < T.ledTheWay - 3);
    function posed(t) {
      if (t >= 1.5 && t < T.feet - 1) return 'longneck';                 // "opening out like the largest telescope"
      if (t >= T.feet - 1 && t < T.struck - 0.3) return 'feet';           // "Good-bye, feet!"
      if (t >= T.struck - 0.3 && t < T.hurried) return 'stoop';           // her head against the roof
      if (t >= T.lying && t < T.sat - 1) return 'lie';                     // "lying down on one side, to look through"
      if (t >= T.sat + 1 && t < T.please - 1) return 'cry_giant';          // "began to cry again"
      if (t >= T.please - 1 && t < T.skurried + 1.5) return 'kneel_back';  // "If you please, sir—"
      if (t >= T.skurried + 1.5 && t < T.took - 1.2) return 'cry_giant';
      if (t >= T.took + 1.2 && t < T.lap) return 'fan';                    // "fanning herself all the time"
      if (t >= T.lap && t < T.hands - 0.5) return 'recite';                // "crossed her hands on her lap"
      if (t >= T.hands - 0.5 && t < T.table - 0.5) return 'glove';         // "one of the Rabbit's little white kid gloves"
      if (t >= T.droppedFan - 0.2 && t < T.droppedFan + 1.2) return 'drop_fan'; // "she dropped it hastily"
      if (t >= T.slipped && t < T.splash) return 'slip';                   // "her foot slipped"
      return 'stand';
    }
    // Poses drawn taller or lower than her standing figure: the long neck keeps her height
    // (her body smaller); stooping, her head stays against the roof.
    const POSE_K = { longneck: 708 / 950, stoop: 708 / 625 * 0.98 };

    function alice(t) {
      const scale = scaleAt(t);
      if (t >= T.splash) {
        const s = swim(t);
        const fall = 1 - smooth((t - T.splash) / 0.5);
        // Drawn down to the water line: the bottom of the picture sits at the surface.
        return { ...s, pose: talking(t) ? 'swim_talk' : 'swim', scale, float: true, moving: s.moving, y: WATER_Y - 0.004 * scale + fall * 0.12 };
      }
      const s = walk(t);
      const pose = s.moving ? 'stand' : posed(t);
      const dir = pose === 'lie' || pose === 'kneel_back' ? 1 : pose === 'cry_giant' || pose === 'recite' ? -1 : s.dir;
      // Slipping: a little stumble forward at the pool's edge.
      const slip = t >= T.slipped ? smooth((t - T.slipped) / (T.splash - T.slipped)) : 0;
      return { ...s, dir, pose, scale: scale * (POSE_K[pose] ?? 1), tilt: slip * 0.25, y: -slip * 0.1, z: s.z + slip * 0.3 };
    }

    // --- The White Rabbit: back "splendidly dressed", gloves in one paw, fan in the other ---
    const FROM = { x: -5.7, z: 0.9 };
    const STOP = { x: FAN_SPOT.x, z: 0.95 };
    function rabbit(t) {
      if (t < T.pattering - 1 || t > T.skurried + 3) return { visible: false };
      const s = route(t, [
        [T.pattering - 1, { ...FROM, dir: 1 }],
        [T.near, STOP],
        [T.skurried, STOP],
        [T.skurried + 2.6, { x: -6.2, z: 0.6, dir: -1 }],            // "skurried away into the darkness"
      ], { phase: t * (t > T.skurried ? 4 : 2.4) });
      const jump = t >= T.started && t < T.started + 0.8 ? Math.sin(((t - T.started) / 0.8) * Math.PI) * 0.3 : 0; // "started violently"
      // Trotting in, gloves and fan drawn in his paws; starting, as they fly; scurrying away.
      const pose = t >= T.skurried ? 'away' : t >= T.started ? 'start' : 'trot';
      return { ...s, pose, dir: t > T.skurried ? -1 : s.moving ? 1 : -1, y: jump };
    }
    const DROP = T.started + 0.7; // the gloves and fan, drawn flying in his starting pose, land
    const dropAt = (() => { const r = route(T.dropped, [[T.near, STOP]]); return { x: r.x + 0.08, z: r.z + 0.05 }; })();

    function update(t, cast) {
      const a = alice(t);
      const scale = a.scale;
      // The key: on the table; in her hand from "took up the little golden key" until she lies down.
      if (t >= T.key && t < T.lying) carry(key, cast.alice, { tilt: -0.6 });
      else { key.position.set(...KEY_ON_TABLE); key.rotation.set(0, 0, 0); }

      // The pool.
      const k = spread(t);
      pond.visible = k > 0.001;
      pond.scale.set(POOL.rx * k, POOL.rz * k, 1);
      pond.position.set(POOL.x, WATER_Y * Math.min(1, k * 1.5) + 0.002, POOL.z);
      waterTex.repeat.set((POOL.rx * k * 2) / 0.7, (POOL.rz * k * 2) / 0.7);
      waterTex.offset.set(t * 0.01, 0);

      // Tears while she cries, and the splash.
      const crying = (t >= T.cry && t < T.pattering + 1) || (t >= T.burst && t < T.hands);
      const face = { x: a.x + 0.06 * scale * (a.dir ?? 1), y: (a.y ?? 0) + ({ cry_giant: 0.66, recite: 0.7, lie: 0.2, kneel_back: 0.8 }[a.pose] ?? 1.05) * scale, z: a.z + 0.03 };
      drops.forEach((d, i) => {
        if (crying) {
          const ph = ((t * 1.2 + i / drops.length) % 1);
          d.visible = true;
          d.scale.setScalar(0.035 * scale);
          d.position.set(face.x + ((i % 3) - 1) * 0.03 * scale, lerp(face.y, WATER_Y, ph * ph), face.z);
        } else if (t >= T.splash && t < T.splash + 1) {
          const ph = (t - T.splash), ang = (i / drops.length) * Math.PI * 2;
          d.visible = true;
          d.scale.setScalar(0.025);
          d.position.set(IN_POOL.x + Math.cos(ang) * ph * 0.25, WATER_Y + ph * 0.6 - ph * ph * 0.9, IN_POOL.z + Math.sin(ang) * ph * 0.12);
        } else d.visible = false;
      });

      // The gloves and fan: in the Rabbit's paws, dropped, then taken up by Alice. She
      // fans herself as she talks, until she drops the fan "just in time".
      // While the Rabbit holds them, and as they fly when he starts, they are drawn with him.
      const p = a.pose;
      if (t < DROP) {
        gloves.visible = fanProp.visible = false;
      } else if (t < T.took + 0.6) {
        gloves.visible = fanProp.visible = true;
        const fall = smooth((t - DROP) / 0.4);
        gloves.position.set(dropAt.x, lerp(0.45, 0.035, fall), dropAt.z); gloves.rotation.set(-1.2 * fall, 0, 0);
        fanProp.position.set(dropAt.x + 0.12, lerp(0.4, 0.045, fall), dropAt.z + 0.06); fanProp.rotation.set(-1.2 * fall, 0, 0.4);
      } else if (t < T.droppedFan - 0.2) {
        // In her hands; her fanning, reciting and glove poses draw them (or set them aside).
        const drawnIn = p === 'fan' || p === 'recite' || p === 'glove';
        gloves.visible = !drawnIn && t < T.hands;
        fanProp.visible = !drawnIn;
        if (gloves.visible) carry(gloves, cast.alice, { drop: 0.06 * scale });
        if (fanProp.visible) { carry(fanProp, cast.alice); fanProp.scale.setScalar(1); }
      } else {
        gloves.visible = false;
        // Drawn falling from her hand in the dropping pose, then on the floor.
        const fall = smooth((t - T.droppedFan - 1.2) / 0.3);
        fanProp.visible = p !== 'drop_fan' && t < T.splash;
        fanProp.position.set(MEASURE.x + 0.15, lerp(0.15, 0.045, fall), MEASURE.z + 0.1); fanProp.rotation.set(-1.2 * fall, 0, 0.4);
      }

      // The splash as she falls in.
      const sp = (t - T.splash) / 1.2;
      splash.visible = sp > -0.05 && sp < 1;
      if (splash.visible) {
        const k = Math.max(0, sp);
        splash.position.set(IN_POOL.x, WATER_Y, IN_POOL.z + 0.02);
        splash.scale.setScalar((0.4 + smooth(k / 0.3) * 0.6) * (1 - 0.6 * smooth((k - 0.6) / 0.4)));
      }
      shore.visible = t >= T.splash;

      // Her thoughts, beside her head but under the roof; small and low once she is swimming.
      const big = scale > 1;
      if (t >= T.splash) think(t, { x: a.x - 0.1, y: WATER_Y + 0.1, z: a.z + 0.04 }, 0.1);
      else think(t, {
        x: a.x - (big ? 1.0 : 0.35 * Math.max(scale, 0.4)),
        y: Math.min(H - 0.45, (a.y ?? 0) + (big ? 1.25 : 1.6) * scale),
        z: a.z + 0.2,
      }, big ? 1.0 : Math.max(scale, 0.4));
    }

    // --- The Mouse, and the birds and animals --------------------------------------
    function mouse(t) {
      if (t < T.splashing + 1.5) return { visible: false };
      const s = route(t, [
        [T.splashing + 1.5, { x: 4.4, z: -0.45, dir: -1 }],
        [T.nearer + 6, { x: 3.85, z: -0.62, dir: -1 }],
        [T.away, { x: 3.85, z: -0.62 }],
        [T.away + 4.5, { x: 5.4, z: -0.25, dir: 1 }],                // "swimming away from her as hard as it could go"
        [T.turned, { x: 5.4, z: -0.25 }],
        [T.turned + 7, { x: 3.9, z: -0.6, dir: -1 }],                // "turned round and swam slowly back to her"
        [T.ledTheWay - 2.5, { x: 3.9, z: -0.6 }],
        [T.end + 1, { x: 1.2, z: -0.45, dir: -1 }],
      ], { phase: t * 1.1 });
      const leaping = t >= T.leap && t < T.leap + 2.2;                // "a sudden leap out of the water … quiver all over"
      const hop = leaping ? Math.sin(Math.min(1, (t - T.leap) / 0.9) * Math.PI) * 0.12 : 0;
      const quiver = (leaping && t > T.leap + 0.9) || (t >= T.bristling && t < T.bristling + 6) ? Math.sin(t * 60) * 0.06 : 0;
      const pose = leaping ? 'leap' : t >= T.bristling && t < T.bristling + 6 ? 'bristle'   // "bristling all over"
        : t >= T.away && t < T.away + 4.5 ? 'away' : 'swim';                                    // "swimming away from her"
      return { ...s, pose, float: !leaping, moving: s.moving, y: WATER_Y - 0.004 + hop, tilt: quiver };
    }
    const BIRDS = {
      duck: [{ x: 5.7, z: -1.3 }, { x: 4.7, z: -1.15 }, { x: 1.4, z: -0.9 }],
      dodo: [{ x: 5.8, z: -0.4 }, { x: 4.6, z: -0.25 }, { x: 1.6, z: -0.2 }],
      lory: [{ x: 5.9, z: 0.1 }, { x: 4.9, z: 0.15 }, { x: 1.9, z: 0.1 }],
      eaglet: [{ x: 6.0, z: -0.9 }, { x: 5.1, z: -0.75 }, { x: 2.1, z: -0.7 }],
    };
    function bird(name, t, i) {
      const [p0, p1, p2] = BIRDS[name];
      if (t < T.crowded - 2) return { visible: false };
      const s = route(t, [
        [T.crowded - 2 + i * 0.6, { ...p0, dir: -1 }],
        [T.crowded + 3 + i * 0.6, p1],
        [T.ledTheWay - 2, p1],
        [T.end + 1.5, p2],
      ], { phase: t * 0.9 + i });
      return { ...s, pose: 'swim', float: true, y: WATER_Y - 0.004 };
    }

    // --- Camera ---------------------------------------------------------------
    const A0 = START, D = DOOR;
    const camera = cameraTrack([
      { t: 0, dur: 0, pos: [TABLE.x + 0.6, 0.45, TABLE.z + 1.5], look: [TABLE.x, 0.15, TABLE.z + 0.3] },
      { t: 1.5, dur: T.telescope, pos: [0.7, 1.5, 2.9], look: [A0.x, 1.9, A0.z] },          // "opening out like the largest telescope"
      { t: T.feet - 1, dur: 3, pos: [1.0, 0.35, 1.2], look: [A0.x, 0.1, A0.z] },            // "Good-bye, feet!"
      { t: T.feet + 6, dur: 4, pos: [0.9, 1.7, 2.9], look: [A0.x, 2.3, A0.z] },             // her face, far above
      { t: T.struck - 1, dur: 1.5, pos: [0.4, 1.0, 2.9], look: [A0.x, 2.7, A0.z - 0.2] },   // her head strikes the roof
      { t: T.key - 1, dur: 2, pos: [1.0, 1.4, 1.4], look: [TABLE.x + 0.1, 1.0, TABLE.z] },  // the key
      { t: T.hurried, dur: 3, pos: [0.4, 1.6, 2.2], look: [BY_DOOR.x + 0.4, 1.0, D.z + 0.4] },
      { t: T.lying - 0.5, dur: 3, pos: [1.0, 0.6, -0.9], look: [D.x, 0.35, D.z] },         // one eye to the little door
      { t: T.sat - 0.5, dur: 4, pos: [-0.6, 1.6, 2.7], look: [CRYING.x, 1.0, CRYING.z] },  // crying
      { t: T.cry + 8, dur: 12, pos: [-1.6, 2.6, 2.7], look: [POOL.x, 0, POOL.z] },          // the pool spreads
      { t: T.pattering - 1, dur: 3, pos: [2.8, 1.1, 1.8], look: [-3.0, 0.4, 0.6] },        // pattering feet, far off
      { t: T.near - 8, dur: 6, pos: [0.2, 1.0, 2.9], look: [STOP.x, 0.7, 0.3] },
      { t: T.please - 1, dur: 1.5, pos: [0.9, 0.55, 2.5], look: [STOP.x, 0.4, STOP.z] },    // "If you please, sir—"
      { t: T.skurried, dur: 2, pos: [1.6, 0.9, 1.9], look: [-3.5, 0.4, 0.6] },              // into the darkness
      { t: T.took - 1, dur: 2.5, pos: [0.3, 1.5, 2.9], look: [TALKING.x, 1.7, TALKING.z] },
      { t: T.lap - 1, dur: 3, pos: [0.5, 1.2, 2.9], look: [TALKING.x, 1.2, TALKING.z] },    // saying her lessons
      { t: T.hands - 1, dur: 2.5, pos: [0.9, 1.7, 2.95], look: [TALKING.x, 2.1, TALKING.z] }, // the glove on her hand
      { t: T.table - 1, dur: 4, pos: [-1.2, 0.9, 1.9], look: [MEASURE.x, 0.4, MEASURE.z] },  // measuring by the table
      { t: T.two + 1, dur: 3, pos: [-0.5, 0.3, 0.6], look: [MEASURE.x, 0.08, MEASURE.z] },
      { t: T.ran - 0.5, dur: 3, pos: [1.6, 0.4, 0.4], look: [1.2, 0.08, -1.7] },          // back to the little door
      { t: T.shut - 1, dur: 2, pos: [D.x - 0.1, 0.25, D.z + 1.3], look: [D.x, 0.15, D.z] },  // shut again
      { t: T.keyOnTable - 0.5, dur: 2, pos: [TABLE.x + 0.5, 1.15, TABLE.z + 1.0], look: [TABLE.x + 0.12, 0.93, TABLE.z] },
      { t: T.keyOnTable + 3, dur: 3, pos: [2.0, 0.35, -0.6], look: [EDGE.x, 0.06, EDGE.z] },
      // In the water, close to her: she is only a few inches tall, and up to her chin.
      { t: T.splash - 0.3, dur: 1.5, pos: [IN_POOL.x - 0.12, 0.15, IN_POOL.z + 0.32], look: [IN_POOL.x, 0.12, IN_POOL.z] },
      { t: T.swam, dur: T.splashing - T.swam, pos: [3.2, 0.14, -0.82], look: [3.4, 0.12, -1.15] },
      { t: T.splashing + 1, dur: 4, pos: [3.75, 0.15, -0.3], look: [4.2, 0.11, -0.5] },      // something splashing a little way off
      { t: T.nearer + 3, dur: 5, pos: [3.68, 0.14, -0.33], look: [3.7, 0.12, -0.7] },        // Alice and the Mouse
      { t: T.away, dur: 3, pos: [3.45, 0.17, -0.2], look: [4.6, 0.11, -0.5] },               // the Mouse swims away
      { t: T.turned + 6, dur: 4, pos: [3.68, 0.14, -0.33], look: [3.7, 0.12, -0.7] },
      { t: T.crowded - 1, dur: 4, pos: [3.9, 0.17, 0.1], look: [4.75, 0.11, -0.55] },          // the pool getting crowded
      { t: T.ledTheWay - 3, dur: 5, pos: [1.7, 0.17, -0.05], look: [2.4, 0.1, -0.6] },       // to the shore
    ]);

    return {
      T, bg: '#efe9da', fog: [8, 20],
      bounds: { minX: -5.5, maxX: 5.5, minZ: -2.4, maxZ: 2.2 },
      hotspots: [
        { pos: new THREE.Vector3(POOL.x, 0.2, POOL.z), title: 'The pool of tears', text: 'shedding gallons of tears, until there was a large pool all round her, about four inches deep and reaching half down the hall' },
        { pos: new THREE.Vector3(TABLE.x, TABLE.top, TABLE.z), title: 'The glass table', text: 'the little golden key was lying on the glass table as before' },
        { pos: new THREE.Vector3(D.x, 0.3, D.z), title: 'The little door', text: 'alas! the little door was shut again' },
      ],
      camera, update,
      actors: (t) => ({
        alice: alice(t), rabbit: rabbit(t), mouse: mouse(t),
        duck: bird('duck', t, 0), dodo: bird('dodo', t, 1), lory: bird('lory', t, 2), eaglet: bird('eaglet', t, 3),
      }),
    };
  },
};
