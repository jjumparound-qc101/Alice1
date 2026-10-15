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
import { trumpet, scroll, canvasBag, shoe } from '../props11.js';
import { FOOT } from '../sets/croquet.js';
import { buildCourt, THRONE, KING, QUEEN, HERALD, KNAVE, TARTS, JURY, WITNESS, DOOR, FRONT, SEAT, BILL } from '../sets/court.js';
import { drawnPose, extras } from '../crowd.js';
import { thoughts } from '../thoughts.js';
import { carry } from '../puppet.js';
import { smooth, route, cameraTrack } from '../track.js';

const RABBIT = 0.38, PIG = 0.32;          // the Rabbit's and the guinea-pigs' scale in the court
const officer = (ai) => (who) => ({ poses: { stand: crowdCard(ai, who, 0.28), bag: crowdCard(ai, { ...who, body: 'bag' }, 0.28) }, height: 0.28 });
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
    const { jurors, toWorld } = buildCourt({ group, ai });
    const think = thoughts(group, [
      { t0: T.tarts + 2, t1: T.tarts + 12, art: ai['vignettes/refreshments'].tex },
      { t0: T.stupid2 - 1, t1: T.stupid2 + 10, art: ai['vignettes/slates'].tex },
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
    const dorSulky = paperFlat(ai['ch11/dormouse_sulky'].tex, 0.06 * ai['ch11/dormouse_sulky'].aspect, 0.06); // walking off sulkily (2026-10-14)
    group.add(trump, scrollRolled, scrollOpen, pencil, dorSleep, dorTalk, dorSulky);
    // Extras: the two soldiers guarding the Knave, and the two officers who suppress the guinea-pigs.
    const guards = extras(group, [soldier(ai, 5), soldier(ai, 6), ...OFFICERS.map(officer(ai))]);
    const PIGS = [{ x: -0.95, z: 0.95 }, { x: -1.25, z: 1.0 }];                // in front of the crowd at the bar

    // Alice: at the front of the crowd; round behind the jury-box for the pencil; sitting among
    // the crowd, beginning to grow.
    const billHome = jurors[BILL].home;
    const BF = ai['ch11/bill_finger'], billFinger = paperFlat(BF.tex, 0.14 * BF.aspect, 0.14); // writing with one finger (2026-10-14)
    billFinger.position.copy(billHome); billFinger.rotation.y = JURY.turn; group.add(billFinger);
    const behind = toWorld(JURY.w / 2 + 0.17, 0, -0.1), BEHIND = { x: behind.x, z: behind.z };   // beside the box's end, behind Bill
    const scaleAt = (t) => FOOT + smooth((t - T.larger) / 18) * 0.16 + smooth((t - T.larger - 18) / (end - T.larger - 18)) * 0.1;
    const aliceA = (t) => {
      const s = route(t, [
        [0, { x: FRONT.x + 0.6, z: FRONT.z + 0.15, dir: -1 }], [T.tarts - 6, FRONT], [T.pencil, FRONT],
        [T.behind, { x: -0.2, z: -0.25 }], [T.behind + 4, BEHIND], [T.lizard + 3, BEHIND], [T.lizard + 8, { ...SEAT, dir: 1 }],
      ], { phase: t * 2.2 });
      const seated = t >= T.lizard + 8;                                     // on a bench by the jury-box, where Chapter XII finds her
      const startled = t >= T.alice ? Math.sin((t - T.alice) * 30) * 0.05 * (1 - smooth((t - T.alice) / 1.5)) : 0;
      // AI poses (2026-10-14): looking round the court, whispering to the Gryphon; taking Bill's pencil; squeezed on
      // the bench as she grows; startled to hear her own name.
      let pose = seated ? 'bench' : 'stand';
      if (!s.moving && t < T.pencil) pose = 'court11';
      if (!s.moving && t >= T.behind + 4 && t < T.lizard + 3) pose = 'pencil';
      if (t >= T.alice - 0.2) pose = 'named';
      return { ...s, pose, scale: scaleAt(t), dir: s.moving ? s.dir : seated ? 1 : -1, tilt: pose === 'named' ? 0 : startled };
    };
    const gryphonA = () => ({ pose: 'sit', x: FRONT.x + 0.32, z: FRONT.z - 0.02, dir: -1, scale: 0.85 });
    const rabbitA = (t) => {
      const hop = (t >= T.silence && t < T.silence + 0.6) || (t >= T.blasts && t < T.blasts + 0.6) ? Math.sin(((t % 0.6) / 0.6) * Math.PI) * 0.03 : 0;
      // The Chapter I model as herald (owner, 2026-10-14), after Tenniel's plate 11.1: the trumpet for the blasts,
      // the scroll unrolled for the accusation (both drawn in his paws).
      const blowing = (t >= T.blasts - 0.5 && t < T.unrolled) || (t >= T.blasts2 - 0.5 && t < T.blasts2 + 3);
      const pose = blowing ? 'trumpet' : t >= T.unrolled && t < T.verdict ? 'scroll' : 'herald';
      return { pose, x: HERALD.x, z: HERALD.z, y: hop, scale: RABBIT, dir: 1, idle: t };
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
    // The March Hare comes in arm in arm with the Dormouse (one drawing of the two, 2026-10-14), then sits.
    const HARE_AT = { x: WITNESS.x + 0.3, z: WITNESS.z - 0.18 };
    const armInArm = (t) => t >= T.hare - 2 && t < T.hare + 4;
    const hareA = (t) => {
      if (t < T.hare - 2 || t >= T.off + 2) return { visible: false };
      if (armInArm(t)) { const s = route(t, [[T.hare - 2, { x: DOOR.x - 0.1, z: DOOR.z, dir: -1 }], [T.hare + 4, HARE_AT]], { phase: t * 2.4 }); return { ...s, pose: 'arm', scale: 0.55 }; }
      return { pose: 'sit', ...HARE_AT, dir: -1, scale: 0.55 };
    };
    const cookA = (t) => {
      if (t < T.cook - 3 || t >= T.gone) return { visible: false };
      const s = route(t, [[T.cook - 3, { x: DOOR.x - 0.1, z: DOOR.z, dir: -1 }], [T.cook + 4, STAND]], { phase: t * 2.4 });
      return { ...s, pose: 'pepper', scale: 0.9 }; // the pepper-box in her hand: "Shan't," said the cook (2026-10-14)
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
        const s = route(t, [[0, { x: -1.95 - k * 0.22, z: 0.75, dir: 1 }], [cheer - 1, { x: -1.95 - k * 0.22, z: 0.75 }], [cheer + 1.5, { x: PIGS[k].x, z: PIGS[k].z - 0.02 }]], { phase: t * 2.6 });
        if (t >= cheer + 2.5) return { pose: 'bag', x: PIGS[k].x, z: PIGS[k].z, dir: 1, idle: t }; // "and then sat upon it" (one drawing, 2026-10-14)
        return { ...s, pose: 'stand' };
      }),
    ];
    function update(t, cast, camera) {
      guards.apply(guardStates(t), camera);
      // The herald's trumpet and scroll are in his drawings now (the separate props stay hidden).
      trump.visible = scrollOpen.visible = scrollRolled.visible = false;
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
      bags.forEach((b, k) => { const cheer = k === 0 ? T.cheered : T.cheered2; b.visible = t >= cheer + 1.5 && t < cheer + 2.5; b.position.set(PIGS[k].x, 0, PIGS[k].z); });
      // The Dormouse: beside Alice, asleep; across the court; awake for "Treacle"; turned out.
      // He comes in with the March Hare, goes over to sit next to Alice, and after "crossed over to the other side
      // of the court" sits by the Hare, behind the witness-box, so "a sleepy voice behind her" is behind the cook.
      const NEXT = { x: SEAT.x + 0.17, z: SEAT.z + 0.06 }, OTHER = { x: WITNESS.x + 0.3, z: WITNESS.z + 0.2 };
      const dx = route(t, [[T.hare + 4, { x: HARE_AT.x + 0.08, z: HARE_AT.z + 0.08 }], [T.hare + 12, { x: HARE_AT.x + 0.08, z: HARE_AT.z + 0.08 }], [T.hare + 22, NEXT], [T.crossed - 1, NEXT],
        [T.crossed + 7, OTHER], [T.collar + 1, OTHER], [T.gone - 2, { x: DOOR.x - 0.1, z: DOOR.z }]]);
      const awake = t >= T.treacle - 0.5 && t < T.collar + 1;
      const inCourt = t >= T.hare - 2 && t < T.gone - 2;
      const walking = dx.moving && t < T.collar;                           // over to Alice; "got up very sulkily and crossed over"
      dorSleep.visible = inCourt && !awake && !walking && !armInArm(t); dorTalk.visible = inCourt && awake && !walking;
      dorSulky.visible = inCourt && walking;
      dorSulky.scale.x = dx.dir > 0 ? -1 : 1;                              // the drawing faces left
      for (const d of [dorSleep, dorTalk, dorSulky]) d.position.set(dx.x, 0, dx.z);
      // Bill, having lost his pencil, writes with one finger for the rest of the day.
      const finger = t >= T.lizard + 6;
      billFinger.visible = finger; jurors[BILL].flat.visible = !finger;
      const a = aliceA(t);
      think(t, { x: a.x - 0.1, y: 0.42, z: a.z - 0.25 }, 0.24);
    }
    // The camera (hand-directed 2026-10-15 for the AI court): Alice in the picture at least every ~12 s.
    // The court from behind her at her own eye level; the witness-box with the door, or with the throne,
    // over her shoulder; close shots of the King, the Queen, the herald, the jury and the witness.
    const shot = (pos, look) => ({ pos, look });
    const MASTER = shot([1.3, 0.2, 1.65], [-0.35, 0.2, -0.9]);                    // the court, from behind Alice
    const TARTS_A = shot([1.2, 0.17, 1.45], [-0.1, 0.16, -0.6]);                 // the dish of tarts, Alice looking at it
    const THRONE_A = shot([1.3, 0.17, 1.75], [-0.25, 0.22, -1.3]);               // the throne, Alice looking at it
    const ALICE = shot([0.4, 0.2, 1.2], [0.95, 0.1, 0.4]);                       // Alice, from in front
    const TWO = shot([0.95, 0.2, 1.4], [1.1, 0.1, 0.39]);                        // Alice and the Gryphon
    const KNAVE_S = shot([0.5, 0.3, -0.3], [0.02, 0.16, -1.3]);                  // the Knave in chains, the throne behind
    const KING_R = shot([-0.1, 0.32, -0.85], [-0.42, 0.22, -1.7]);               // the King and the herald
    const KING_S = shot([-0.02, 0.36, -1.2], [-0.12, 0.26, -1.83]);              // the judge
    const QUEEN_S = shot([0.25, 0.36, -1.25], [0.16, 0.27, -1.83]);              // the Queen
    const THRONE_S = shot([0.0, 0.38, -1.15], [0.0, 0.28, -1.83]);               // the King and Queen together
    const HERALD_S = shot([-0.2, 0.3, -0.95], [-0.6, 0.16, -1.6]);               // the White Rabbit
    const JURY_S = shot([-0.9, 0.3, 0.0], [-1.45, 0.1, -0.85]);                  // the jury-box
    const JURY_W = shot([-1.0, 0.28, -0.2], [-1.45, 0.1, -0.85]);                // the jurors writing
    const JURY_A = shot([1.7, 0.18, 1.55], [-0.9, 0.2, -0.75]);                  // the jury-box, Alice looking at it
    const BILL_S = shot([-0.7, 0.3, -0.45], [-1.1, 0.12, -1.2]);                 // Bill, and Alice behind him
    const ROUND = shot([1.0, 0.45, 1.0], [-0.7, 0.05, -0.8]);                    // Alice going round the court
    const WIT = shot([0.8, 0.3, -0.2], [1.25, 0.16, -0.98]);                     // the witness
    const WIT_LOW = shot([0.85, 0.25, -0.3], [1.25, 0.08, -0.98]);               // the witness, on one knee
    const WIT_HARE = shot([0.85, 0.32, -0.05], [1.4, 0.12, -1.05]);              // the Hatter and the March Hare
    // From the accusation on, Alice sits on a bench by the jury-box (SEAT), growing from "larger".
    const FRONTW = shot([0.15, 0.45, 2.1], [0.6, 0.12, -0.6]);                   // the court from the front, wide: Alice, the witness-box, the door
    const ST = shot([-1.85, 0.25, 0.05], [0.0, 0.06, -1.7]);                     // over Alice: the throne and the herald
    const FRONTC = shot([0.1, 0.4, 1.6], [0.35, 0.15, -0.8]);                    // the court from the front: Alice, the throne, the witness
    const GROW = shot([-0.15, 0.3, 0.75], [-0.85, 0.14, -0.4]);                  // Alice on her bench, the Dormouse beside her
    const GROW2 = shot([0.05, 0.42, 1.05], [-0.85, 0.22, -0.4]);                 // the same, as she grows
    const BENCHG = shot([-0.05, 0.45, 1.05], [-0.85, 0.24, -0.4]);               // Alice, grown
    const CROSSG = shot([0.4, 0.6, 2.0], [0.4, 0.12, -0.8]);                     // the whole court, wide
    const DOOR_S = shot([0.6, 0.35, 0.6], [2.4, 0.2, -0.6]);                     // the door
    const PIGS_A = shot([0.1, 0.3, 1.75], [-1.0, 0.08, 0.6]);                    // the guinea-pigs suppressed, Alice behind
    const LISTG = shot([-0.1, 0.4, 1.4], [-0.6, 0.12, -1.5]);                    // Alice watching the Rabbit with his list
    const NAMEDG = shot([-0.4, 0.45, 1.3], [-0.8, 0.2, -0.35]);                  // "Alice!"
    const key = (t, s, dur = 2) => ({ t, dur, ...s });
    const camera = cameraTrack([
      { t: 0, dur: 0, pos: [1.6, 0.45, 2.4], look: [0.0, 0.2, -1.0] },          // they arrive
      key(4, MASTER, 5),
      key(10.3, KNAVE_S, 2.5), key(14.8, KING_R, 2.5),                          // the Knave in chains; the White Rabbit near the King
      key(19.5, TARTS_A, 3),                                                     // the dish of tarts; "quite hungry"
      key(33.5, ALICE, 3),                                                       // looking at everything about her
      key(44.2, KING_S, 2), key(52.5, THRONE_A, 2.5),                            // the judge; "not at all comfortable"
      key(58.8, JURY_S, 2.5), key(70.5, JURY_A, 2.5),                            // the jury-box; proud of the word
      key(83.2, JURY_W, 2), key(86.5, TWO, 2),                                   // writing on slates; whispering to the Gryphon
      key(108.6, HERALD_S, 1.2), key(111.3, KING_S, 1.5),                        // "Silence in the court!"; the King's spectacles
      key(115.6, JURY_W, 2), key(119.4, JURY_A, 2.5),                            // "stupid things!"; the muddle on their slates
      key(132.9, BILL_S, 1.5), key(134.5, MASTER, 1.5), key(137, ROUND, 2.5),    // the squeaking pencil; round the court
      key(143.4, BILL_S, 2),                                                     // Bill hunting all about for it
      key(149.5, ST, 2.5), key(157.8, KING_R, 2),                                // she goes to sit by the jury-box; "Herald, read the accusation!"
      key(162, HERALD_S, 1.5), key(168, FRONTC, 2.5), key(172.5, KNAVE_S, 2),    // the blasts and the scroll; the verse
      key(177.6, KING_S, 1.5), key(181, HERALD_S, 1.2), key(183.6, ST, 2),       // "Consider your verdict"; "Not yet!"
      key(189.3, HERALD_S, 1.2), key(193, FRONTW, 3),                                // "First witness!"; the Hatter comes in
      key(200.5, WIT, 2), key(208.2, FRONTC, 2.5), key(212.3, FRONTW, 2.5),          // "I beg pardon"; the King; the March Hare
      key(217.6, WIT_HARE, 1.5), key(226, JURY_W, 2), key(228.6, FRONTC, 2.5),   // the dates; the jury writes; "Take off your hat"
      key(238.3, WIT, 1.2), key(240.4, KING_S, 1), key(245.8, WIT, 1.2),         // "It isn't mine"; "Stolen!"
      key(248.4, FRONTC, 2), key(252.6, QUEEN_S, 1.2), key(255.4, WIT, 1.2),     // the Queen's spectacles; the Hatter turns pale
      key(257.1, FRONTC, 2), key(264, WIT, 2),                                   // "Give your evidence"; the teacup bitten
      key(274.2, GROW, 3), key(284, GROW2, 14),                                  // Alice begins to grow; "I wish you wouldn't squeeze so"
      key(320.5, FRONTC, 2.5),                                                   // the Dormouse crosses over
      key(329, QUEEN_S, 1.5), key(334.5, WIT, 1.2), key(338.8, FRONTC, 2),       // the concert; the shoes; "Give your evidence"
      key(346.2, WIT, 1.5), key(353.5, FRONTC, 2), key(359.4, KING_S, 1.2),      // twinkling; "The twinkling of the what?"
      key(363, WIT, 1), key(366.4, FRONTC, 2), key(373.6, WIT_HARE, 1.5),        // "Do you take me for a dunce?"; the March Hare
      key(383.4, FRONTC, 2), key(390.6, KING_S, 1.2), key(394.4, WIT_HARE, 1.5), // "I deny it!"; the Dormouse fast asleep
      key(400.2, FRONTC, 2), key(408.2, JURY_S, 1.2),                              // a juror asks
      key(412, WIT, 1), key(414.7, FRONTC, 2), key(419.8, WIT_LOW, 1.5),         // "I'll have you executed"; down on one knee
      key(427.5, KING_S, 1), key(431.8, PIGS_A, 1.5),                            // "a very poor speaker"; the guinea-pig suppressed
      key(451.5, BENCHG, 2.5), key(466, FRONTC, 2), key(470.6, WIT_LOW, 1),      // "I'm glad I've seen that done"; "stand down"
      key(475.3, KING_S, 1), key(478.4, PIGS_A, 1.2), key(484, BENCHG, 2),       // "sit down"; the other guinea-pig
      key(490, WIT, 1.5), key(495.7, DOOR_S, 2), key(500.6, FRONTC, 1.5),         // "I'd rather finish my tea"; he goes; "take his head off"
      key(505.4, DOOR_S, 1.5), key(508.7, KING_S, 1), key(511.5, DOOR_S, 2),     // out of sight; the cook comes in
      key(515, FRONTC, 2), key(524.1, WIT, 1), key(526.2, KING_R, 2),          // the sneezing; "Shan't"; the King looks at the Rabbit
      key(533.4, FRONTC, 2), key(546.7, WIT, 1), key(549.7, WIT_HARE, 1.2),      // folding his arms; "Treacle"
      key(553.6, QUEEN_S, 1), key(556.8, CROSSG, 2.5),                           // "Collar that Dormouse"; the court in confusion
      key(571.8, KING_S, 1.5), key(577.3, THRONE_S, 1.5), key(582, FRONTC, 2),                        // "Never mind!"; to the Queen
      key(585.7, LISTG, 2.5), key(595.4, HERALD_S, 1.2), key(599.3, NAMEDG, 1.5), // the Rabbit fumbles over the list; "Alice!"
    ]);
    return {
      T, bg: PAPER, fog: [7, 26], bounds: { minX: -2.2, maxX: 2.2, minZ: 0.2, maxZ: 2.0 },
      hotspots: [{ pos: new THREE.Vector3(TARTS.x, 0.2, TARTS.z), title: 'The tarts', text: 'In the very middle of the court was a table, with a large dish of tarts upon it' }],
      camera, update,
      actors: (t) => ({ alice: aliceA(t), gryphon: gryphonA(t), rabbit: rabbitA(t), king: kingA(t), queen: queenA(t), knave: knaveA(t), hatter: hatterA(t), hare: hareA(t), cook: cookA(t), pig1: pigA(0)(t), pig2: pigA(1)(t) }),
    };
  },
};

export const CHAPTER_11 = [trial];
