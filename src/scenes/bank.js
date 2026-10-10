// Chapter III, "A Caucus-Race and a Long Tale", on the bank of the pool of tears: the
// edge of the pool on the hall floor (owner, 2026-10-10: option A), with Alice still a few
// inches tall among the birds and animals. The Mouse's dry lecture, the Caucus-race, the
// prizes, the Mouse's long tale, and the party leaving Alice alone.
// Figures and props not yet drawn are placeholders from props2.js and props3.js.
import * as THREE from 'three';
import { paperFlat } from '../stage.js';
import { texture } from '../ink.js';
import { buildHall, DOOR } from '../sets/hall.js';
import { water, tear } from '../props2.js';
import { comfitBox, thimble, mouseTale, shakespeareVignette, knotVignette, dinahBirdsVignette } from '../props3.js';
import { thoughts } from '../thoughts.js';
import { carry } from '../puppet.js';
import { smooth, lerp, route, cameraTrack } from '../track.js';

const TINY = 0.13;
const WATER_Y = 0.1;
const POOL = { x: 3.2, z: -0.6, rx: 2.8, rz: 1.3 };       // as Chapter II left it
const RC = { x: -0.05, z: -0.55 }, R = 0.22;              // the ring, on dry floor by the pool
const slot = (deg, r = R) => ({ x: RC.x + r * Math.cos((deg * Math.PI) / 180), z: RC.z + r * Math.sin((deg * Math.PI) / 180) });

// Each member of the party: their place in the ring (degrees; 90 is nearest the camera),
// where they stand on arrival, and where they go when they leave.
const PARTY = {
  alice: { deg: 90, bank: { x: 0.26, z: -0.5 } },
  mouse: { deg: 120, bank: { x: 0.14, z: -0.62 } },     // sits in the middle; runs with the rest
  dodo: { deg: 200, bank: { x: 0.33, z: -0.28 }, off: { x: -1.6, z: -1.6 } },
  duck: { deg: 235, bank: { x: 0.18, z: -0.25 }, off: { x: -1.7, z: -0.4 } },
  lory: { deg: 300, bank: { x: 0.08, z: -0.78 }, off: { x: -1.2, z: -2.1 } },
  eaglet: { deg: 335, bank: { x: 0.36, z: -0.86 }, off: { x: 0.2, z: -2.4 } },
  owl: { deg: 20, bank: { x: 0.4, z: -0.62 }, off: { x: -1.9, z: -1.1 } },
  magpie: { deg: 265, bank: { x: 0.0, z: -0.45 }, off: { x: -1.4, z: 0.6 } },
  canary: { deg: 55, bank: { x: 0.22, z: -0.95 }, off: { x: -0.9, z: 0.9 } },
  crab: { deg: 140, bank: { x: 0.36, z: -0.4 }, off: { x: 0.6, z: -0.3 } },
  crabling: { deg: 155, bank: { x: 0.4, z: -0.36 }, off: { x: 0.62, z: -0.25 } },
};

export const bank = {
  id: 'bank',
  title: 'A queer-looking party',
  start: () => 0,
  parts: (cue) => [
    { title: 'The driest thing I know', t: cue.at('sit') - 2 },
    { title: 'The Caucus-race', t: cue.para('“In that case,” said the Dodo') - 0.5 },
    { title: 'Prizes', t: cue.para('“But who is to give the prizes?”') - 0.5 },
    { title: 'A long and a sad tale', t: cue.para('“You promised to tell me your history') - 0.5 },
    { title: 'Alone again', t: cue.para('“What a pity it wouldn’t stay!”') - 0.5 },
  ],

  build({ group, ai, cue, hallMeta }) {
    const at = cue.at;
    const T = {
      sulky: at('sulky'), sit: at('sit'), ring: at('ring', 1), ahem: at('ahem'), ugh: at('ugh'), shiver: at('shiver'),
      foundWhat: at('what', 1), wet: cue.para('“As wet as ever,”'), rising: at('rising'), english: at('english', 2),
      smile: at('smile'), alice: at('caucus-race', 2), course: at('race-course'), running: at('running', 1), over: at('over', 2),
      thought: cue.para('This question the Dodo could not answer'), finger: at('finger', 1), everybody: at('everybody'),
      pointing: at('pointing'), pocket: at('pocket', 1), comfits: at('comfits', 1), herself: cue.para('“But she must have a prize'),
      thimble: at('thimble', 1), handOver: cue.para('“Hand it over here,”'), presented: at('thimble', 2), cheered: at('cheered'),
      bowed: at('bowed'), eat: at('eat', 1), ringAgain: at('ring', 2), history: cue.para('“You promised to tell me your history'),
      sad: at('tale', 1), tail: at('tail', 1), tale: at('tale', 2), attending: at('attending'), knot: at('knot'),
      walking: at('walking'), please: cue.para('“Please come back'), quicker: at('quicker'), pity: at('pity'), crab: at('crab', 1),
      tongue: at('tongue'), dinah: at('dinah', 1), bird: at('bird'), sensation: at('sensation'), magpie: at('magpie'),
      canary: at('canary'), alone: at('alone'), cry: at('cry'), pattering: at('pattering'), end: cue.end,
    };

    // --- The set: the hall floor at the pool's edge, the pool as Chapter II left it -----
    const { curt } = buildHall({ group, ai, hallMeta });
    curt.position.set(DOOR.x + 0.85, 0, DOOR.z + 0.03);
    const waterTex = texture(water(), { repeat: [(POOL.rx * 2) / 0.7, (POOL.rz * 2) / 0.7] });
    const pond = new THREE.Mesh(new THREE.CircleGeometry(1, 72), new THREE.MeshBasicMaterial({ map: waterTex }));
    pond.rotation.x = -Math.PI / 2; pond.scale.set(POOL.rx, POOL.rz, 1); pond.position.set(POOL.x, WATER_Y, POOL.z);
    group.add(pond);

    // "First it marked out a race-course, in a sort of circle": scratched on the floor.
    const RACE_R = 0.32;
    const coursePts = Array.from({ length: 97 }, (_, i) => {
      const a = (i / 96) * Math.PI * 2;
      const wob = 1 + Math.sin(a * 3) * 0.06 + Math.sin(a * 5 + 1) * 0.03; // "the exact shape doesn't matter"
      return new THREE.Vector3(RC.x + Math.cos(a) * RACE_R * wob, 0.003, RC.z + Math.sin(a) * RACE_R * wob);
    });
    const course = new THREE.Line(new THREE.BufferGeometry().setFromPoints(coursePts), new THREE.LineBasicMaterial({ color: '#17140f' }));
    group.add(course);

    // Props: the comfits, the thimble, Alice's tears, and the Mouse's tale.
    const box = paperFlat(texture(comfitBox()), 0.035, 0.025, { anchor: 'center' });
    const thim = paperFlat(texture(thimble()), 0.014, 0.016, { anchor: 'center' });
    const dropTex = texture(tear());
    const drops = Array.from({ length: 6 }, () => { const d = paperFlat(dropTex, 1, 1.5, { anchor: 'center', edge: false }); group.add(d); return d; });
    const tale = paperFlat(texture(mouseTale()), 0.17, 0.34, { anchor: 'center' });
    group.add(box, thim, tale);
    const think = thoughts(group, [
      { t0: T.finger - 1, t1: T.everybody, art: shakespeareVignette() },
      { t0: T.knot - 0.3, t1: T.walking - 1, art: knotVignette() },
      { t0: T.bird - 4, t1: T.sensation + 2, art: dinahBirdsVignette() },
    ]);

    // --- Where everyone is -------------------------------------------------------
    // The Caucus-race: round the course, "running when they liked, and left off when they
    // liked": each runner's speed swells and fades on its own rhythm.
    const RACE = { start: T.running, end: T.over };
    function racing(name, t, i) {
      const k = 1.3 + (i % 3) * 0.45, ph = i * 1.7, w = 0.9 + (i % 4) * 0.15;
      const angleAt = (u) => (PARTY[name].deg * Math.PI) / 180 + w * (0.5 * u - (0.5 / k) * (Math.cos(k * u + ph) - Math.cos(ph)));
      const u = t - RACE.start, a = angleAt(u);
      const speed = w * (0.5 + 0.5 * Math.sin(k * u + ph));
      return { x: RC.x + Math.cos(a) * RACE_R, z: RC.z + Math.sin(a) * RACE_R, moving: speed > 0.15, dist: a * RACE_R, dir: Math.sin(a) > 0 ? 1 : -1 };
    }
    const DODO_AT = slot(PARTY.dodo.deg, RACE_R); // where the Dodo stops when he calls the race over
    const nearDodo = (deg) => ({ x: DODO_AT.x + Math.cos(deg) * 0.12, z: DODO_AT.z + Math.sin(deg) * 0.12 });
    const ALICE_RACE_END = slot(PARTY.alice.deg, RACE_R);
    const nearAlice = (deg) => ({ x: ALICE_RACE_END.x + Math.cos(deg) * 0.13, z: ALICE_RACE_END.z + Math.sin(deg) * 0.1 - 0.04 });

    function place(name, t, i) {
      const p = PARTY[name], s0 = slot(p.deg);
      if (t >= RACE.start && t < RACE.end) return racing(name, t, i);
      const ang = (p.deg * Math.PI) / 180;
      const keys = [
        [0, p.bank],
        [T.sit, p.bank],
        [T.ring, s0],                                            // "They all sat down at once, in a large ring"
        [T.course, s0],
        [T.running - 0.5, slot(p.deg, RACE_R)],                   // "placed along the course, here and there"
      ];
      const after = [
        [RACE.end, racing(name, RACE.end, i)],
        [RACE.end + 3, name === 'dodo' ? DODO_AT : nearDodo(ang)], // "they all crowded round it, panting"
        [T.pointing + 1, name === 'dodo' ? DODO_AT : nearDodo(ang)],
        [T.pointing + 4, nearAlice(ang)],                         // "the whole party at once crowded round her"
        [T.ringAgain - 1, nearAlice(ang)],
        [T.ringAgain + 2, s0],                                    // "they sat down again in a ring"
      ];
      if (name === 'dodo') after.splice(4, 0, [T.handOver, nearAlice(ang)], [T.presented - 1, { x: ALICE_RACE_END.x - 0.08, z: ALICE_RACE_END.z - 0.05 }], [T.bowed + 1, { x: ALICE_RACE_END.x - 0.08, z: ALICE_RACE_END.z - 0.05 }]);
      const leave = p.off ? [[T.sensation + (i % 4) * 1.5, s0], [T.sensation + 6 + (i % 4) * 2, p.off]] : [];
      const s = route(t, t < RACE.start ? keys : [...after, ...leave], { phase: t * 2.4 + i });
      return s;
    }

    function alice(t) {
      const s = t >= RACE.start && t < RACE.end ? racing('alice', t, 0)
        : route(t, [
          [0, PARTY.alice.bank], [T.sit, PARTY.alice.bank], [T.ring, slot(90)], [T.course, slot(90)], [T.running - 0.5, slot(90, RACE_R)],
          [RACE.end, racing('alice', RACE.end, 0)], [RACE.end + 3, ALICE_RACE_END], [T.ringAgain, ALICE_RACE_END], [T.ringAgain + 2, slot(90)],
        ]);
      const sitting = (t >= T.ring && t < T.wet + 4) || (t >= T.ringAgain + 2 && t < T.please) || t >= T.cry - 1;
      const bow = t >= T.bowed && t < T.bowed + 1.6 ? Math.sin(((t - T.bowed) / 1.6) * Math.PI) * 0.35 : 0;
      const dir = sitting ? -1 : s.moving ? s.dir : t >= T.please ? -1 : 1;
      return { ...s, dir, pose: sitting ? 'sit' : 'stand', scale: TINY, tilt: -bow * dir };
    }

    function mouse(t) {
      let s;
      if (t < T.walking) {
        s = route(t, [[0, { x: 0.14, z: -0.62 }], [T.sit - 1, { x: 0.14, z: -0.62 }], [T.ring - 1, RC]], { phase: t * 2.4 });
        if (t >= RACE.start && t < RACE.end) s = racing('mouse', t, 7);
        else if (t >= RACE.end) s = route(t, [[RACE.end, racing('mouse', RACE.end, 7)], [RACE.end + 3, nearDodo(2.6)], [T.pointing + 4, nearAlice(1.2)], [T.ringAgain + 2, RC]], { phase: t * 2.4 });
      } else {
        s = route(t, [[T.walking, RC], [T.quicker, { x: -0.9, z: -1.0, dir: -1 }], [T.quicker + 3, { x: -1.6, z: -1.3 }]], { phase: t * 3 });
      }
      // He turns to whoever speaks.
      const facing = t >= T.sad && t < T.walking ? 1 : t >= T.foundWhat && t < T.foundWhat + 8 ? -1 : (s.dir ?? -1);
      const angry = t >= at('not', 1, T.knot - 6) && t < T.knot + 1;
      const walkingAway = t >= T.walking;
      return { ...s, pose: walkingAway || (s.moving && t >= RACE.start && t < RACE.end) ? 'walk' : 'up', dir: walkingAway ? -1 : facing,
        visible: t < T.quicker + 3, tilt: angry ? Math.sin(t * 40) * 0.05 : 0 };
    }

    function creature(name, i) {
      return (t) => {
        const s = place(name, t, i);
        const p = PARTY[name];
        let tilt = 0, y = 0;
        if (name === 'lory' && t >= T.ugh && t < T.ugh + 2.5) tilt = Math.sin(t * 50) * 0.08;      // "with a shiver"
        if (name === 'lory' && t >= T.sulky && t < T.sit) tilt = -0.1;                               // turned sulky
        if (name === 'eaglet' && t >= T.smile - 1 && t < T.smile + 3) tilt = 0.35;                   // bent down its head
        if (name === 'dodo' && t >= T.rising && t < T.rising + 1) y = Math.sin((t - T.rising) * Math.PI) * 0.03; // rising to its feet
        if ((name === 'canary' || name === 'magpie') && t >= T.eat && t < T.eat + 9) y = Math.abs(Math.sin(t * 6 + i)) * 0.015; // choking on comfits
        const gone = p.off && t > T.sensation + 7 + (i % 4) * 2;
        return { ...s, pose: name.startsWith('crab') ? 'stand' : 'up', visible: !gone, tilt, y, dir: s.moving ? s.dir : (p.deg > 90 && p.deg < 270 ? 1 : -1) };
      };
    }
    const crowd = Object.fromEntries(['dodo', 'duck', 'lory', 'eaglet', 'owl', 'magpie', 'canary', 'crab', 'crabling'].map((n, i) => [n, creature(n, i + 1)]));

    function update(t, cast) {
      const a = alice(t);
      // Race-course: scratched out by the Dodo, then left on the floor.
      course.visible = t >= T.course;
      course.geometry.setDrawRange(0, Math.floor(97 * Math.min(1, (t - T.course) / 6)));
      // The comfits come out of her pocket and go round; the thimble goes to the Dodo and back.
      box.visible = t >= T.comfits && t < T.herself;
      if (box.visible) carry(box, cast.alice);
      thim.visible = t >= T.thimble && t < T.ringAgain;
      if (thim.visible) carry(thim, t >= T.handOver + 1 && t < T.bowed + 0.6 ? cast.dodo : cast.alice);
      // The Mouse's tale, as Alice pictures it.
      const open = smooth((t - T.tale + 0.3) / 0.6) * (1 - smooth((t - T.attending + 0.5) / 0.5));
      tale.visible = open > 0.01;
      tale.scale.setScalar(open);
      tale.position.set(RC.x + 0.02, 0.2, RC.z + 0.12);
      // Tears, at the end.
      drops.forEach((d, i) => {
        d.visible = t >= T.cry && t < T.pattering;
        const ph = (t * 1.3 + i / drops.length) % 1;
        d.scale.setScalar(0.006);
        d.position.set(a.x + ((i % 3) - 1) * 0.004, lerp(0.075, 0.0, ph * ph), a.z + 0.01);
      });
      // Thoughts sit above the middle of the ring, where shots of the party can see them.
      think(t, { x: RC.x + 0.05, y: 0.17, z: RC.z - 0.05 }, 0.12);
    }

    // --- Camera: at a mouse's eye level -------------------------------------------
    const S = (name) => slot(PARTY[name].deg);
    const cam = (t, dur, pos, look) => ({ t, dur, pos, look });
    const camera = cameraTrack([
      cam(0, 0, [0.75, 0.24, 0.3], [0.22, 0.06, -0.58]),                                              // the party on the bank
      cam(T.sulky - 6, 3, [-0.3, 0.12, -0.3], [0.2, 0.07, -0.66]),                                   // Alice and the sulky Lory
      cam(T.sit - 1, 3, [0.62, 0.2, -0.1], [0.15, 0.06, -0.6]),
      cam(T.ring, 4, [0.13, 0.14, -0.02], [RC.x, 0.06, RC.z]),                                       // in a ring, from behind Alice
      cam(T.ahem, 3, [0.14, 0.08, -0.4], [RC.x, 0.06, RC.z]),                                       // "Ahem!"
      cam(T.ugh - 0.5, 1.5, [0.02, 0.1, -0.4], [S('lory').x, 0.07, S('lory').z]),                    // the Lory shivers
      cam(T.ugh + 4, 2, [0.14, 0.08, -0.4], [RC.x, 0.06, RC.z]),
      cam(T.foundWhat - 0.5, 1.5, [0.05, 0.1, -0.4], [S('duck').x, 0.07, S('duck').z]),              // "Found what?"
      cam(T.foundWhat + 8, 2, [0.14, 0.08, -0.4], [RC.x, 0.06, RC.z]),
      cam(T.wet - 1, 2, [0.1, 0.11, -0.2], [slot(90).x, 0.08, slot(90).z]),                          // "As wet as ever"
      cam(T.rising - 1, 2, [0.08, 0.12, -0.38], [S('dodo').x, 0.1, S('dodo').z]),                    // the Dodo rises
      cam(T.english - 0.5, 1.5, [0.02, 0.1, -0.45], [S('eaglet').x, 0.07, S('eaglet').z]),           // "Speak English!"
      cam(T.smile + 3, 2, [0.08, 0.12, -0.38], [S('dodo').x, 0.1, S('dodo').z]),
      cam(T.course - 1, 4, [RC.x + 0.35, 0.42, RC.z + 0.55], [RC.x, 0.0, RC.z]),                     // the race-course, from above
      cam(T.running, 6, [RC.x + 0.55, 0.22, RC.z + 0.45], [RC.x, 0.05, RC.z]),                       // the Caucus-race
      cam(T.over, 3, [DODO_AT.x + 0.3, 0.13, DODO_AT.z + 0.25], [DODO_AT.x, 0.08, DODO_AT.z]),        // crowded round the Dodo
      cam(T.pointing, 3, [ALICE_RACE_END.x + 0.25, 0.14, ALICE_RACE_END.z + 0.3], [ALICE_RACE_END.x - 0.05, 0.08, ALICE_RACE_END.z - 0.05]),
      cam(T.comfits - 1, 2, [ALICE_RACE_END.x + 0.12, 0.11, ALICE_RACE_END.z + 0.2], [ALICE_RACE_END.x, 0.08, ALICE_RACE_END.z]), // the comfits
      cam(T.presented - 2, 3, [ALICE_RACE_END.x + 0.2, 0.11, ALICE_RACE_END.z + 0.22], [ALICE_RACE_END.x - 0.05, 0.09, ALICE_RACE_END.z - 0.03]), // the thimble
      cam(T.eat - 1, 3, [RC.x + 0.35, 0.2, RC.z + 0.55], [RC.x, 0.05, RC.z]),                        // eating the comfits
      cam(T.ringAgain + 1, 3, [0.13, 0.14, -0.02], [RC.x, 0.06, RC.z]),
      cam(T.sad - 1, 2, [0.12, 0.09, -0.3], [RC.x + 0.03, 0.06, RC.z + 0.1]),                         // "a long and a sad tale"
      cam(T.tale - 1, 2, [RC.x + 0.05, 0.2, RC.z + 0.5], [RC.x + 0.02, 0.2, RC.z + 0.12]),           // the tale, as she pictures it
      cam(T.attending - 0.5, 2, [0.12, 0.09, -0.3], [RC.x + 0.03, 0.06, RC.z + 0.1]),
      cam(T.walking, 4, [0.2, 0.16, -0.25], [-0.6, 0.05, -0.85]),                                     // the Mouse walks away
      cam(T.pity - 1, 3, [0.2, 0.11, -0.25], [S('crab').x, 0.04, S('crab').z]),                       // the Crabs
      cam(T.dinah - 1, 2, [0.12, 0.1, -0.15], [slot(90).x, 0.08, slot(90).z]),
      cam(T.sensation, 4, [0.6, 0.3, 0.3], [RC.x - 0.2, 0.05, RC.z]),                                 // everyone hurries off
      cam(T.alone - 1, 4, [0.18, 0.1, -0.15], [slot(90).x, 0.07, slot(90).z]),                         // left alone
      cam(T.pattering - 0.5, 2, [0.25, 0.09, -0.3], [-0.8, 0.08, -0.9]),                              // pattering footsteps, far off
    ]);

    return {
      T, bg: '#efe9da', fog: [8, 20],
      bounds: { minX: -5.5, maxX: 5.5, minZ: -2.4, maxZ: 2.2 },
      hotspots: [
        { pos: new THREE.Vector3(RC.x, 0.1, RC.z), title: 'The race-course', text: 'First it marked out a race-course, in a sort of circle, (“the exact shape doesn’t matter,” it said,)' },
        { pos: new THREE.Vector3(POOL.x, 0.2, POOL.z), title: 'The pool of tears', text: 'They were indeed a queer-looking party that assembled on the bank' },
      ],
      camera, update,
      actors: (t) => ({ alice: alice(t), mouse: mouse(t), ...Object.fromEntries(Object.entries(crowd).map(([n, f]) => [n, f(t)])) }),
    };
  },
};
