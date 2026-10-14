// Chapter XI, "Who Stole the Tarts?", in one scene in the court (src/sets/court.js, shared with
// Chapter XII), at foot-high Alice's scale until she begins to grow: the King as judge, the
// Knave in chains, the jury and their slates, the squeaking pencil, the accusation, the Hatter
// as witness (pale, biting his teacup, shaking his shoes off, on one knee, gone), the
// guinea-pigs suppressed, the cook and her pepper, the Dormouse turned out, and "Alice!"
// Figures and props not yet drawn are placeholders (props11.js and earlier chapters').
import * as THREE from 'three';
import { crowdCard } from '../cards.js';
import { paperFlat } from '../stage.js';
import { texture, PAPER, canvas, INK } from '../ink.js';
import { card, OFFICERS } from '../props8.js';
import { trumpet, scroll, canvasBag, shoe, refreshmentsVignette, slatesVignette } from '../props11.js';
import { FOOT } from '../sets/croquet.js';
import { buildCourt, THRONE, KING, QUEEN, HERALD, KNAVE, TARTS, JURY, WITNESS, DOOR, FRONT, BILL } from '../sets/court.js';
import { drawnPose, extras } from '../crowd.js';
import { thoughts } from '../thoughts.js';
import { carry } from '../puppet.js';
import { smooth, lerp, route, cameraTrack, withAlice } from '../track.js';

const RABBIT = 0.38, PIG = 0.32;          // the Rabbit's and the guinea-pigs' scale in the court
const officer = (ai) => (who) => ({ poses: { stand: crowdCard(ai, who, 0.28) }, height: 0.28 });
const soldier = (ai, n) => ({ poses: { stand: crowdCard(ai, { suit: 'clubs', rank: n }, 0.28) }, height: 0.28 });

export const trial = {
  id: 'trial',
  title: 'The court of justice',
  start: () => 0,
  parts: (cue) => [
    { title: 'The jury', t: cue.at('jury-box') - 3 },
    { title: 'Herald, read the accusation!', t: cue.at('accusation') - 2 },
    { title: 'The first witness', t: cue.at('witness', 1) - 2 },
    { title: 'Alice grows', t: cue.at('larger') - 6 },
    { title: 'The guinea-pigs', t: cue.at('guinea-pigs', 1) - 3 },
    { title: 'The cook', t: cue.at('witness', 5) - 1 },
    { title: '"Alice!"', t: cue.at('list', 3) - 3 },
  ],
  build({ group, ai, cue }) {
    const at = cue.at;
    const T = {
      tarts: at('tarts', 1), judge: at('judge', 1), juryBox: at('jury-box'), slates: at('slates', 1), stupid: at('stupid', 1), silence: at('silence'), specs: at('spectacles', 1),
      stupid2: at('stupid', 2), pencil: at('pencil'), behind: at('behind', 1), lizard: at('lizard'), accusation: at('accusation'), blasts: at('blasts', 1), unrolled: at('unrolled'),
      verdict: at('verdict'), witness: at('witness', 1), blasts2: at('blasts', 2), hatter: at('hatter', 1), hare: at('hare', 1), stolen: at('stolen'), qspecs: at('spectacles', 2),
      pale: at('pale'), bit: at('bit'), larger: at('larger'), squeeze: at('squeeze'), crossed: at('crossed', 1), concert: at('concert'), shoes: at('shoes', 1), knee: at('knee'),
      cheered: at('cheered', 1), bag: at('bag'), cheered2: at('cheered', 2), go: at('go', 3), off: at('hatter', 20), cook: at('cook', 1), sneezing: at('sneezing'),
      arms: at('arms'), treacle: at('treacle'), collar: at('collar'), gone: at('disappeared'), list: at('list', 3), alice: at('alice', 16),
    };
    const end = cue.end;
    const { jurors } = buildCourt({ group });
    const think = thoughts(group, [
      { t0: T.tarts + 2, t1: T.tarts + 12, art: refreshmentsVignette() },
      { t0: T.stupid2 - 1, t1: T.stupid2 + 10, art: slatesVignette() },
    ]);
    // Props: the herald's trumpet and scroll, the squeaky pencil, the Hatter's shoes, the canvas bags, the Dormouse.
    const trump = paperFlat(texture(trumpet()), 0.1, 0.04, { anchor: 'center' });
    const scrollRolled = paperFlat(texture(scroll(false)), 0.07, 0.028, { anchor: 'center' });
    const scrollOpen = paperFlat(texture(scroll(true)), 0.07, 0.091, { anchor: 'center' });
    const pencilC = canvas(120, 16); pencilC.g.fillStyle = INK; pencilC.g.fillRect(0, 4, 120, 8);
    const pencil = paperFlat(texture(pencilC.c), 0.04, 0.006, { anchor: 'center', edge: false });
    const shoeTex = texture(shoe());
    const shoes = [0, 1].map(() => { const s = paperFlat(shoeTex, 0.04, 0.02); group.add(s); return s; });
    const bags = [0, 1].map(() => { const b = paperFlat(texture(canvasBag()), 0.09, 0.076); group.add(b); return b; });
    const dorSleep = paperFlat(ai['ch7/dormouse_sleep'].tex, 0.055, 0.055 / ai['ch7/dormouse_sleep'].aspect), dorTalk = paperFlat(ai['ch7/dormouse_talk'].tex, 0.055, 0.055 / ai['ch7/dormouse_talk'].aspect); // AI
    group.add(trump, scrollRolled, scrollOpen, pencil, dorSleep, dorTalk);
    // Extras: the two soldiers guarding the Knave, and the two officers who suppress the guinea-pigs.
    const guards = extras(group, [soldier(ai, 5), soldier(ai, 6), ...OFFICERS.map(officer(ai))]);
    const PIGS = [{ x: -0.45, z: 0.62 }, { x: -0.75, z: 0.66 }];

    // Alice: at the front of the crowd; round behind the jury-box for the pencil; sitting among
    // the crowd, beginning to grow.
    const billHome = jurors[BILL].home;
    const BEHIND = { x: billHome.x - 0.1, z: billHome.z - 0.22 };
    const SEAT = { x: FRONT.x + 0.05, z: FRONT.z + 0.05 };
    const scaleAt = (t) => FOOT + smooth((t - T.larger) / 18) * 0.16 + smooth((t - T.larger - 18) / (end - T.larger - 18)) * 0.1;
    const aliceA = (t) => {
      const s = route(t, [
        [0, { x: FRONT.x + 0.6, z: FRONT.z + 0.15, dir: -1 }], [T.tarts - 6, FRONT], [T.pencil, FRONT],
        [T.behind, { x: -0.2, z: -0.25 }], [T.behind + 4, BEHIND], [T.lizard + 3, BEHIND], [T.accusation - 1, FRONT],
        [T.hatter + 10, FRONT], [T.hatter + 13, SEAT],
      ], { phase: t * 2.2 });
      const seated = t >= T.hatter + 13;
      const startled = t >= T.alice ? Math.sin((t - T.alice) * 30) * 0.05 * (1 - smooth((t - T.alice) / 1.5)) : 0;
      return { ...s, pose: seated ? 'sit' : 'stand', scale: scaleAt(t), dir: s.moving ? s.dir : -1, tilt: startled };
    };
    const gryphonA = () => ({ pose: 'sit', x: FRONT.x + 0.32, z: FRONT.z - 0.02, dir: -1, scale: 0.85 });
    const rabbitA = (t) => {
      const hop = (t >= T.silence && t < T.silence + 0.6) || (t >= T.blasts && t < T.blasts + 0.6) ? Math.sin(((t % 0.6) / 0.6) * Math.PI) * 0.03 : 0;
      return { pose: 'watch', x: HERALD.x, z: HERALD.z, y: hop, scale: RABBIT, dir: 1, idle: t };
    };
    const kingA = (t) => {
      let pose = 'judge';
      if (t >= T.specs && t < T.stupid2 + 8) pose = 'judgeSpecs';                     // "the King put on his spectacles"
      if (t >= T.stolen - 0.3 && t < T.stolen + 2.5) pose = 'judgePoint';            // "Stolen!"
      if (t >= T.arms && t < T.arms + 8) pose = 'judgeFold';                         // "folding his arms and frowning at the cook"
      return { pose, x: KING.x, z: KING.z, y: THRONE.seat, dir: 1 };
    };
    const queenA = (t) => {
      let pose = 'stand';
      if (t >= T.qspecs && t < T.off) pose = 'specs';                                // staring at the Hatter through her spectacles
      if ((t >= T.off + 2 && t < T.off + 6) || (t >= T.collar && t < T.gone)) pose = 'point';
      return { pose, x: QUEEN.x, z: QUEEN.z, y: THRONE.seat, dir: -1 };
    };
    const knaveA = () => ({ pose: 'chains', x: KNAVE.x, z: KNAVE.z, dir: 1 });
    const STAND = { x: WITNESS.x + 0.02, z: WITNESS.z - 0.07 };
    const hatterA = (t) => {
      if (t < T.hatter - 3 || t >= T.off + 4) return { visible: false };
      const s = route(t, [[T.hatter - 3, { x: DOOR.x - 0.1, z: DOOR.z, dir: -1 }], [T.hatter + 3, STAND], [T.off, STAND], [T.off + 4, { x: DOOR.x - 0.05, z: DOOR.z, dir: 1 }]], { phase: t * 2.6 });
      let pose = 'cup';
      if (t >= T.pale - 0.3 && t < T.pale + 7) pose = 'pale';                       // "turned pale and fidgeted"
      if (t >= T.bit && t < T.bit + 3) pose = 'bite';                                // bit a piece out of his teacup
      if (t >= T.shoes - 2 && t < T.shoes + 7) pose = 'tremble';                     // shook both his shoes off
      if (t >= T.knee && t < T.go - 1) pose = 'knee';
      if (t >= T.off) pose = 'run';
      const fidget = pose === 'pale' || pose === 'tremble' ? Math.sin(t * 22) * 0.04 : 0;
      return { ...s, pose, tilt: fidget, dir: s.moving ? s.dir : -1 };
    };
    const hareA = (t) => (t < T.hare - 2 || t >= T.off + 2 ? { visible: false } : { pose: 'sit', x: WITNESS.x + 0.3, z: WITNESS.z - 0.18, dir: -1, scale: 0.55 });
    const cookA = (t) => {
      if (t < T.cook - 3 || t >= T.gone) return { visible: false };
      const s = route(t, [[T.cook - 3, { x: DOOR.x - 0.1, z: DOOR.z, dir: -1 }], [T.cook + 4, STAND]], { phase: t * 2.4 });
      return { ...s, pose: 'stir', scale: 0.9 };
    };
    const pigA = (k) => (t) => {
      const cheer = k === 0 ? T.cheered : T.cheered2;
      if (t >= cheer + 1.5) return { visible: false };                               // into the bag, head first
      const jump = t >= cheer && t < cheer + 1.2 ? Math.abs(Math.sin((t - cheer) * 8)) * 0.04 : 0;
      return { pose: 'up', x: PIGS[k].x, z: PIGS[k].z, y: jump, scale: PIG, dir: 1 };
    };
    const guardStates = (t) => [
      { pose: 'stand', x: KNAVE.x - 0.2, z: KNAVE.z, dir: 1, idle: t },
      { pose: 'stand', x: KNAVE.x + 0.2, z: KNAVE.z, dir: -1, idle: t + 0.7 },
      ...[0, 1].map((k) => {
        const cheer = k === 0 ? T.cheered : T.cheered2;
        const s = route(t, [[0, { x: -1.0 - k * 0.25, z: 0.25, dir: 1 }], [cheer, { x: -1.0 - k * 0.25, z: 0.25 }], [cheer + 1.5, { x: PIGS[k].x, z: PIGS[k].z - 0.02 }]], { phase: t * 2.6 });
        return { ...s, pose: 'stand', y: t >= cheer + 2.5 ? 0.05 : 0 };               // "and then sat upon it"
      }),
    ];
    function update(t, cast, camera) {
      guards.apply(guardStates(t), camera);
      // The herald: the trumpet for the three blasts, the scroll unrolled for the accusation.
      const blowing = (t >= T.blasts - 0.5 && t < T.unrolled) || (t >= T.blasts2 - 0.5 && t < T.blasts2 + 3);
      trump.visible = blowing; if (blowing) carry(trump, cast.rabbit, { tilt: 0.3 });
      scrollOpen.visible = t >= T.unrolled && t < T.verdict; if (scrollOpen.visible) carry(scrollOpen, cast.rabbit);
      scrollRolled.visible = !scrollOpen.visible && !blowing; if (scrollRolled.visible) carry(scrollRolled, cast.rabbit, { tilt: -0.4 });
      // Bill's squeaking pencil: in his hand, then in Alice's, then gone.
      pencil.visible = t < T.lizard + 3;
      if (t < T.behind + 4) { const h = jurors[BILL].home; pencil.position.set(h.x + 0.02, h.y + 0.08, h.z + 0.03); pencil.rotation.set(0, JURY.turn, 0.6 + Math.sin(t * 9) * 0.1); }
      else carry(pencil, cast.alice);
      // The jurors write busily on their slates.
      jurors.forEach((j, i) => { j.slate.position.y = j.slateHome.y + (Math.sin(t * 7 + i * 1.3) > 0.6 ? 0.004 : 0); });
      jurors[BILL].flat.rotation.z = t >= T.lizard && t < T.lizard + 6 ? Math.sin(t * 4) * 0.15 : 0;   // hunting all about for it
      // The Hatter's shoes, shaken off; left behind.
      shoes.forEach((s, k) => {
        s.visible = t >= T.shoes;
        const k2 = smooth((t - T.shoes) / 0.8);
        s.position.set(STAND.x - 0.08 + k * 0.16 * k2, Math.sin(k2 * Math.PI) * 0.08, STAND.z + 0.12 + k * 0.03); s.rotation.z = k2 * (k ? 2.5 : -2.5);
      });
      // The canvas bags, a guinea-pig inside each, an officer sitting on top.
      bags.forEach((b, k) => { const cheer = k === 0 ? T.cheered : T.cheered2; b.visible = t >= cheer + 1.5; b.position.set(PIGS[k].x, 0, PIGS[k].z); });
      // The Dormouse: beside Alice, asleep; across the court; awake for "Treacle"; turned out.
      const dx = route(t, [[T.hare - 2, { x: WITNESS.x + 0.4, z: WITNESS.z + 0.2 }], [T.hare + 10, { x: SEAT.x - 0.15, z: SEAT.z + 0.04 }], [T.crossed - 1, { x: SEAT.x - 0.15, z: SEAT.z + 0.04 }],
        [T.crossed + 6, { x: -0.95, z: 0.5 }], [T.collar + 1, { x: -0.95, z: 0.5 }], [T.gone - 2, { x: DOOR.x - 0.1, z: DOOR.z }]]);
      const awake = t >= T.treacle - 0.5 && t < T.collar + 1;
      const inCourt = t >= T.hare - 2 && t < T.gone - 2;
      dorSleep.visible = inCourt && !awake; dorTalk.visible = inCourt && awake;
      for (const d of [dorSleep, dorTalk]) d.position.set(dx.x, 0, dx.z);
      const a = aliceA(t);
      think(t, { x: a.x - 0.1, y: 0.42, z: a.z - 0.25 }, 0.24);
    }
    const W = [WITNESS.x, 0.22, WITNESS.z];
    const camera = cameraTrack([
      { t: 0, dur: 0, pos: [0.4, 0.7, 2.0], look: [0, 0.2, -1.2] },                                        // the court
      { t: T.tarts - 2, dur: 3, pos: [0.25, 0.4, 0.5], look: [TARTS.x, 0.2, TARTS.z] },                    // the dish of tarts
      { t: T.judge - 2, dur: 3, pos: [-0.1, 0.42, -0.9], look: [KING.x, 0.32, KING.z] },                   // the judge, with his great wig
      { t: T.juryBox - 2, dur: 3, pos: [-0.75, 0.38, -0.2], look: [JURY.x, 0.18, JURY.z] },                // the jury-box
      { t: T.silence - 1, dur: 2, pos: [-0.2, 0.5, -0.6], look: [HERALD.x + 0.2, 0.25, HERALD.z] },        // "Silence in the court!"
      { t: T.pencil - 1, dur: 3, pos: [-0.6, 0.4, 0.2], look: [JURY.x + 0.1, 0.15, JURY.z - 0.1] },        // the squeaking pencil
      { t: T.accusation - 1, dur: 3, pos: [-0.35, 0.36, -0.95], look: [HERALD.x, 0.22, HERALD.z] },        // the herald
      { t: T.verdict, dur: 3, pos: [0.4, 0.7, 1.6], look: [0, 0.2, -1.2] },
      { t: T.hatter - 1, dur: 4, pos: [1.0, 0.35, -0.1], look: W },                                        // the first witness
      { t: T.qspecs - 1, dur: 2, pos: [0.3, 0.4, -1.0], look: [QUEEN.x, 0.33, QUEEN.z] },                  // the Queen's spectacles
      { t: T.pale - 0.5, dur: 2, pos: [1.05, 0.33, -0.45], look: [WITNESS.x, 0.28, WITNESS.z] },           // the Hatter turned pale
      { t: T.larger - 1, dur: 4, pos: [1.1, 0.4, 1.3], look: [SEAT.x, 0.2, SEAT.z] },                      // Alice begins to grow
      { t: T.concert - 1, dur: 3, pos: [1.0, 0.35, -0.1], look: W },                                       // shoes shaken off
      { t: T.cheered - 1, dur: 2, pos: [-0.5, 0.35, 1.3], look: [PIGS[0].x, 0.08, PIGS[0].z] },            // the guinea-pigs suppressed
      { t: T.cheered2 + 8, dur: 3, pos: [1.0, 0.35, -0.1], look: W },
      { t: T.cook - 2, dur: 4, pos: [1.0, 0.4, 0.0], look: [WITNESS.x + 0.3, 0.2, WITNESS.z + 0.2] },      // the cook and her pepper-box
      { t: T.collar - 1, dur: 3, pos: [0.0, 0.6, 1.5], look: [-0.3, 0.15, 0.1] },                          // the Dormouse turned out
      { t: T.list - 2, dur: 3, pos: [-0.2, 0.45, -0.9], look: [HERALD.x, 0.22, HERALD.z] },                // the Rabbit with his list
      { t: T.alice - 2.5, dur: 1.5, pos: [SEAT.x + 0.15, 0.45, SEAT.z + 0.8], look: [SEAT.x, 0.25, SEAT.z] }, // "Alice!"
    ]);
    return {
      T, bg: PAPER, fog: [7, 26], bounds: { minX: -2.2, maxX: 2.2, minZ: 0.2, maxZ: 2.0 },
      hotspots: [{ pos: new THREE.Vector3(TARTS.x, 0.2, TARTS.z), title: 'The tarts', text: 'In the very middle of the court was a table, with a large dish of tarts upon it' }],
      camera: withAlice(camera, aliceA, [[0, 7], [22, 141], [154, 285], [334, 600]]), update,
      actors: (t) => ({ alice: aliceA(t), gryphon: gryphonA(t), rabbit: rabbitA(t), king: kingA(t), queen: queenA(t), knave: knaveA(t), hatter: hatterA(t), hare: hareA(t), cook: cookA(t), pig1: pigA(0)(t), pig2: pigA(1)(t) }),
    };
  },
};

export const CHAPTER_11 = [trial];
