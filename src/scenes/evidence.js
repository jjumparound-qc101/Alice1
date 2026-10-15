// Chapter XII, "Alice's Evidence", in two scenes:
//   evidence — the court (src/sets/court.js): Alice, grown large, tips over the jury-box and puts
//              the jurors back (Bill head downwards); Rule Forty-two; the King turns pale; the
//              verses; the inkstand; "Sentence first"; the Queen turns purple; "You're nothing
//              but a pack of cards!" and the whole pack flies up at her;
//   waking   — the riverbank (Chapter I's set): her head in her sister's lap, the dead leaves,
//              "Wake up, Alice dear!"; she runs in to tea; her sister dreams of Wonderland,
//              its creatures appear faintly around her, then turn back into the countryside.
// Figures and props not yet drawn are placeholders (props12.js and earlier chapters').
import * as THREE from 'three';
import { crowdCard } from '../cards.js';
import { paperFlat, buildStage } from '../stage.js';
import { texture, PAPER } from '../ink.js';
import { card, cardBack, SOLDIERS, COURTIERS, CHILDREN, GUESTS, OFFICERS } from '../props8.js';
import { verses, noteBook, inkstand, deadLeaf, goldfishVignette, countryVignette, grownAliceVignette } from '../props12.js';
import { buildCourt, THRONE, KING, QUEEN, HERALD, KNAVE, JURY, SEAT, BILL } from '../sets/court.js';
import { drawnPose, extras } from '../crowd.js';
import { thoughts } from '../thoughts.js';
import { carry } from '../puppet.js';
import { smooth, lerp, route, cameraTrack } from '../track.js';

const RABBIT = 0.38;
const soldier = (ai) => (who) => ({ poses: { stand: crowdCard(ai, who, 0.28) }, height: 0.28 });
// Pseudo-random but fixed, so every frame (and every reader) sees the same flight.
const rnd = (i, k) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };

// --- 1. The court --------------------------------------------------------------------------
export const evidence = {
  id: 'evidence',
  title: "Alice's evidence",
  start: () => 0,
  parts: (cue) => [
    { title: 'Rule Forty-two', t: cue.at('silence', 1) - 2 },
    { title: 'The verses', t: cue.at('verses', 2) - 3 },
    { title: 'Sentence first', t: cue.at('sentence', 1) - 3 },
    { title: 'A pack of cards', t: cue.at('cares') - 2 },
  ],
  build({ group, ai, cue }) {
    const at = cue.at;
    const T = {
      jumped: at('jumped'), tipped: at('tipped'), goldfish: at('goldfish', 1), pardon: at('pardon'), collected: at('collected'), downwards: at('downwards'),
      right: at('right', 1), mouth: at('mouth'), what: at('nothing', 1) - 4, silence: at('silence', 1), mile: at('mile', 1), pale: at('pale'), paper: at('paper', 1),
      unfolded: at('verses', 1) - 4, guilt: at('guilt'), spectacles: at('spectacles'), read: at('verses', 2), large: at('important', 3) + 6, shook: at('shook'),
      knee: at('knee'), roof: at('roof'), tarts: at('tarts', 2), inkstand: at('inkstand'), sentence: at('sentence', 1), purple: at('purple'), offHead: at('head', 4), cares: at('cares'), cards: at('cards'),
      air: at('air', 1), scream: at('scream'),
    };
    const end = at('bank') - 1;
    const { jury, jurors } = buildCourt({ group, ai });
    const BG = ai['ch12/bill_gape'], billGape = paperFlat(BG.tex, 0.14 * BG.aspect, 0.14); // gazing up into the roof (AI, 2026-10-14)
    billGape.position.copy(jurors[BILL].home); billGape.rotation.y = JURY.turn; billGape.visible = false; group.add(billGape);
    const think = thoughts(group, [{ t0: T.goldfish - 1, t1: T.goldfish + 12, art: goldfishVignette() }]);
    const note = paperFlat(texture(noteBook()), 0.05, 0.0375, { anchor: 'center' });
    const paper = paperFlat(texture(verses()), 0.05, 0.065, { anchor: 'center' });
    const ink = paperFlat(texture(inkstand()), 0.05, 0.043, { anchor: 'center' });
    group.add(note, paper, ink);
    const guards = extras(group, [soldier(ai)(SOLDIERS[4]), soldier(ai)(SOLDIERS[5]), ...OFFICERS.map(soldier(ai))]);

    // Alice: seated by the jury-box, grown large; jumps up; picks up the jurors; walks out
    // before the throne; full size by "Who cares for you?"
    const NEAR = SEAT, BOX = { x: JURY.x + 0.45, z: JURY.z + 0.45 }, MIDDLE = { x: 0.4, z: -0.15 };
    const scaleAt = (t) => lerp(0.5, 0.65, smooth((t - T.mile + 6) / 8)) + smooth((t - T.large + 4) / 6) * 0.15 + smooth((t - T.purple) / 9) * 0.2;
    const aliceA = (t) => {
      const s = route(t, [[0, NEAR], [T.tipped + 1, NEAR], [T.pardon + 1, BOX], [T.right + 2, BOX], [T.what, MIDDLE]], { phase: t * 2.2 });
      const picking = t >= T.pardon + 1 && t < T.right + 2;
      const scream = t >= T.scream && t < T.scream + 3 ? Math.sin(t * 22) * 0.07 : 0;
      // AI poses (2026-10-14): jumping up, her skirt sweeping the jury-box over (after plate 12.1); picking the
      // jurors up; "Who cares for you?"; beating off the cards (after plate 12.3).
      let pose = t < T.jumped ? 'bench' : 'stand';
      if (t >= T.jumped && t < T.jumped + 2.5) pose = 'jumpup';
      if (picking && !s.moving) pose = 'pickup';
      if (t >= T.cares - 0.3 && t < T.air - 0.3) pose = 'defiant';
      if (t >= T.air - 0.3) pose = 'cards';
      return { ...s, pose, scale: scaleAt(t), dir: s.moving ? s.dir : pose === 'bench' ? 1 : -1, tilt: pose === 'cards' ? scream * 0.5 : scream };
    };
    const flown = (t) => t >= T.air + 0.3;   // the court cards have risen into the air
    const kingA = (t) => {
      if (flown(t)) return { visible: false };
      let pose = 'judge';
      if (t >= T.silence - 0.5 && t < T.silence + 3) pose = 'judgePoint';               // cackled out "Silence!"
      if (t >= T.pale - 0.3 && t < T.pale + 7) pose = 'judgePale';                      // "The King turned pale"
      if (t >= T.tarts - 0.5 && t < T.tarts + 4) pose = 'judgePoint';                   // pointing to the tarts
      // AI poses (2026-10-14): "busily writing in his note-book"; the verses spread out on his knee, one eye shut.
      if (t >= T.silence - 6 && t < T.pale - 0.3) pose = 'judgeNote';
      if (t >= T.knee - 0.5 && t < T.knee + 7) pose = 'judgePaper';
      return { pose, x: KING.x, z: KING.z, y: THRONE.seat, dir: 1 };
    };
    const queenA = (t) => {
      if (flown(t)) return { visible: false };
      let pose = 'stand';
      if (t >= T.guilt - 0.5 && t < T.guilt + 2) pose = 'point';
      if (t >= T.inkstand - 1 && t < T.inkstand + 0.3) pose = 'inkstand';              // throwing an inkstand at the Lizard (AI, 2026-10-14)
      if (t >= T.sentence - 0.5 && t < T.sentence + 3) pose = 'point';
      if (t >= T.purple - 0.3 && t < T.offHead) pose = 'purple';                        // "turning purple"
      if (t >= T.offHead && t < T.cards) pose = 'point';                                // "Off with her head!" Nobody moved.
      return { pose, x: QUEEN.x, z: QUEEN.z, y: THRONE.seat, dir: -1 };
    };
    const knaveA = (t) => (flown(t) ? { visible: false } : { pose: 'chains', x: KNAVE.x, z: KNAVE.z, dir: 1, tilt: t >= T.shook && t < T.shook + 2.5 ? Math.sin(t * 9) * 0.1 : 0 });
    const rabbitA = (t) => {
      const hop = t >= T.paper - 2 && t < T.paper - 1 ? Math.sin((t - T.paper + 2) * Math.PI) * 0.04 : 0;   // "jumping up in a great hurry"
      // The Chapter I model as herald (owner, 2026-10-14); in spectacles reading the paper of verses (drawn in his paws).
      const reading = t >= T.paper - 1 && t < T.read + 70;
      return { pose: reading ? 'specs' : 'herald', x: HERALD.x, z: HERALD.z, y: hop, scale: RABBIT, dir: 1, idle: t, visible: !flown(t) };
    };
    const gryphonA = (t) => ({ pose: 'sit', x: 1.3, z: 0.45, dir: -1, scale: 0.85 });
    const guardStates = (t) => (flown(t) ? [] : [
      { pose: 'stand', x: KNAVE.x - 0.2, z: KNAVE.z, dir: 1, idle: t }, { pose: 'stand', x: KNAVE.x + 0.2, z: KNAVE.z, dir: -1, idle: t + 0.7 },
      { pose: 'stand', x: -1.95, z: 0.75, dir: 1, idle: t + 0.3 }, { pose: 'stand', x: -2.17, z: 0.75, dir: 1, idle: t + 1.1 },
    ]);
    // The jurors: tipped out onto the heads of the crowd below; put back one by one (Bill head
    // downwards at first); the box set right.
    const sprawl = jurors.map((_, i) => new THREE.Vector3(-2.1 + rnd(i, 1) * 1.0, 0, -0.5 + rnd(i, 2) * 0.9));
    const backAt = (i) => lerp(T.pardon + 2, T.collected + 3, i / (jurors.length - 1));
    // The whole pack, rising into the air and flying down upon her.
    const pack = [...SOLDIERS, ...COURTIERS, ...CHILDREN, ...GUESTS, ...OFFICERS, { suit: 'hearts', rank: 'king' }, { suit: 'hearts', rank: 'queen' }, { suit: 'hearts', rank: 'knave' }];
    const backTex = ai['ch8/card_back'].tex;
    // Behind the separate cards, a drawn cloud of the pack (after Tenniel's plate 12.3, AI 2026-10-14).
    const PF = ai['ch8/pack_flying'], packCloud = paperFlat(PF.tex, 1.7, 1.7 / PF.aspect, { anchor: 'center', edge: false }); group.add(packCloud);
    packCloud.userData.front.material.transparent = true;
    const flyers = pack.map((who, i) => {
      const face = crowdCard(ai, who, 0.28);
      const art = i % 3 === 2 ? ai['ch8/card_back'] : face, h = 0.3; // the whole pack flying up: faces and backs, in their own proportions
      const f = paperFlat(art.tex, h * art.aspect, h, { anchor: 'center' });
      group.add(f); return f;
    });
    function update(t, cast, camera) {
      guards.apply(guardStates(t), camera);
      // The jury-box tips over with the edge of her skirt, and is set up again.
      const tip = smooth((t - T.tipped) / 0.6) * (1 - smooth((t - T.pardon) / 1.5));
      jury.rotation.x = -1.4 * tip;
      jurors.forEach((j, i) => {
        const out = smooth((t - T.tipped) / 1.2), back = smooth((t - backAt(i)) / 1.0);
        const k = out * (1 - back);
        j.flat.position.set(lerp(j.home.x, sprawl[i].x, k), lerp(j.home.y, 0, k) + Math.sin(k * Math.PI) * 0.25 * (1 - back), lerp(j.home.z, sprawl[i].z, k));
        j.flat.rotation.set(0, JURY.turn, k * (i % 2 ? 1.4 : -1.4));
        j.slate.visible = t < T.tipped || t > T.mouth;                                   // "their slates and pencils had been found"
      });
      const bill = jurors[BILL].flat;
      if (t >= backAt(BILL) + 1 && t < T.right) { bill.rotation.z = Math.PI + Math.sin(t * 6) * 0.15; bill.position.y = jurors[BILL].home.y + 0.12; }   // head downwards, tail waving
      if (t >= T.inkstand && t < T.inkstand + 6) bill.rotation.z = Math.sin(t * 12) * 0.1;
      // The King's note-book; the paper of verses; the inkstand thrown at Bill.
      note.visible = !flown(t) && t >= T.pale - 0.3 && t < T.pale + 7; // (in his writing drawing before that)
      if (note.visible) carry(note, cast.king);
      // Bill, put back right way up: "sit with its mouth open, gazing up into the roof of the court".
      const gaping = t >= T.roof - 2 && t < T.roof + 9;
      billGape.visible = gaping; bill.visible = !gaping;
      paper.visible = false; // the paper is in his reading drawing
      const throwK = smooth((t - T.inkstand) / 0.9);
      ink.visible = t >= T.inkstand + 0.3 && t < T.inkstand + 8; // out of her hand (her drawing holds it before)
      const h = jurors[BILL].home;
      ink.position.set(lerp(QUEEN.x - 0.05, h.x + 0.03, throwK), lerp(THRONE.seat + 0.25, h.y + 0.1, throwK) + Math.sin(throwK * Math.PI) * 0.3, lerp(QUEEN.z, h.z + 0.04, throwK));
      ink.rotation.set(0, 0, throwK * 6);
      // The pack: up into the air, swirling, then down upon Alice.
      const a = aliceA(t);
      const cloud = smooth((t - T.air + 0.2) / 1.5) * (1 - smooth((t - T.scream - 1) / 1.5));
      packCloud.visible = cloud > 0.01; packCloud.userData.front.material.opacity = cloud;
      packCloud.position.set(a.x, 0.75 + cloud * 0.15, a.z - 0.5); packCloud.rotation.set(0, 0, Math.sin(t * 0.7) * 0.05);
      flyers.forEach((f, i) => {
        f.visible = t >= T.air - 0.2;
        if (!f.visible) return;
        const rise = smooth((t - T.air - rnd(i, 3) * 0.8) / 1.6);
        const dive = smooth((t - T.scream + 1 - rnd(i, 4) * 1.2) / 2.0);
        const ang = i * 0.7 + t * (0.8 + rnd(i, 5));
        const x0 = -1.8 + rnd(i, 6) * 3.6, z0 = -1.8 + rnd(i, 7) * 1.6;
        const sx = lerp(x0, a.x + Math.cos(ang) * 0.6, rise), sy = lerp(0.1, 0.7 + rnd(i, 8) * 0.6, rise), sz = lerp(z0, a.z - 0.4 + Math.sin(ang) * 0.4, rise);
        f.position.set(lerp(sx, a.x + (rnd(i, 9) - 0.5) * 0.5, dive), lerp(sy, 0.9 + rnd(i, 10) * 0.4, dive), lerp(sz, a.z + 0.25 + rnd(i, 11) * 0.3, dive));
        f.rotation.set(Math.sin(ang) * 0.6, ang, Math.cos(ang * 1.3) * 0.8);
      });
      think(t, { x: a.x - 0.2, y: 0.8, z: a.z - 0.3 }, 0.32);
    }
    // The camera (hand-directed 2026-10-15 for the AI court): Alice in the picture at least every ~12 s. She is a
    // giant here, by the jury-box and then in the middle of the court, so her shots stand further back and higher.
    const shot = (pos, look) => ({ pos, look });
    const OPEN = shot([0.3, 0.5, 1.0], [-1.1, 0.2, -0.6]);                       // "Here!": Alice by the jury-box
    const SPRAWL = shot([0.6, 0.7, 1.4], [-1.2, 0.15, -0.4]);                    // the jurymen sprawling, Alice over them
    const PICK = shot([-0.1, 0.5, 0.9], [-1.15, 0.2, -0.6]);                     // picking them up again
    const BILL_A = shot([-0.15, 0.6, 1.0], [-1.25, 0.1, -1.0]);                  // the Lizard head downwards, Alice
    const JURY_S = shot([-0.9, 0.3, 0.0], [-1.45, 0.1, -0.85]);                  // the jury-box
    const BILL_S = shot([-0.7, 0.3, -0.45], [-1.1, 0.12, -1.2]);                 // Bill
    const JURY_A = shot([1.6, 0.6, 1.6], [-0.9, 0.06, -0.8]);                    // the jury-box, Alice over it
    const MID_L = shot([-0.25, 0.62, 2.25], [0.15, 0.2, -1.3]);                  // Alice before the throne, from the left
    const MID_R = shot([2.1, 0.6, 1.6], [-0.4, 0.18, -1.4]);                     // the same, from the right
    const KING_S = shot([-0.02, 0.36, -1.2], [-0.12, 0.26, -1.83]);              // the King
    const QUEEN_S = shot([0.25, 0.36, -1.25], [0.16, 0.27, -1.83]);              // the Queen
    const THRONE_S = shot([0.0, 0.38, -1.15], [0.0, 0.28, -1.83]);               // the King and Queen together
    const HERALD_S = shot([-0.2, 0.3, -0.95], [-0.6, 0.16, -1.6]);               // the White Rabbit
    const KING_R = shot([-0.1, 0.32, -0.85], [-0.42, 0.22, -1.7]);               // the King and the Rabbit
    const KNAVE_S = shot([0.5, 0.3, -0.3], [0.02, 0.16, -1.3]);                  // the Knave
    const FULL = shot([1.7, 0.95, 3.0], [0.25, 0.5, -0.5]);                      // Alice at her full size
    const PACK = shot([1.7, 1.0, 3.0], [0.3, 0.75, -0.5]);                       // the pack flying down upon her
    // Once she stands in the middle of the court, a move between her and the throne would pass through her:
    // the close shots (and the way back from them) are cuts.
    const CLOSE = [KING_S, QUEEN_S, THRONE_S, HERALD_S, KING_R, KNAVE_S, JURY_S, BILL_S];
    let prev = OPEN;
    const key = (t, s, dur = 2) => { const cut = t > T.what && (CLOSE.includes(s) || CLOSE.includes(prev)); prev = s; return { t, dur: cut ? 0 : dur, ...s }; };
    const camera = cameraTrack([
      { t: 0, dur: 0, ...OPEN },                                                 // "Here!"
      key(T.tipped + 0.5, SPRAWL, 2), key(T.pardon, PICK, 2.5),                  // the jurymen sprawling; "I beg your pardon!"
      key(37, KING_S, 1.5), key(45, PICK, 2),                                    // "The trial cannot proceed"
      key(52, BILL_A, 2), key(64, PICK, 2),                                      // the Lizard head downwards; "not that it signifies much"
      key(72.2, JURY_A, 3), key(T.roof - 1, BILL_S, 1.5),                        // Alice walks out into the court; Bill gazing up into the roof
      key(88.6, KING_S, 1.2), key(92.5, MID_R, 2),                               // "What do you know about this business?" "Nothing."
      key(100, KING_S, 1.2), key(103.5, HERALD_S, 1.2), key(110, MID_L, 2),      // "very important"; the Rabbit interrupts
      key(116.5, KING_S, 1.2), key(122.5, MID_R, 2), key(129.8, JURY_S, 1.5),    // the King tries the words; the jury writes
      key(133.8, JURY_A, 2),                                                     // Alice looks over their slates
      key(140.8, KING_S, 1.2), key(150.5, MID_R, 2.5),                           // "Silence!" Rule Forty-two; everybody looked at Alice
      key(160.3, KING_S, 1), key(162.5, QUEEN_S, 1), key(165.4, MID_L, 1.5),     // "You are"; "Nearly two miles high"; "I shan't go"
      key(173.7, KING_S, 1), key(177.6, MID_R, 1.5), key(180.5, KING_S, 1),      // the oldest rule; "Number One"; the King turned pale
      key(188.4, HERALD_S, 1.2), key(192.3, MID_R, 2), key(197, QUEEN_S, 1), key(199.2, HERALD_S, 1),  // "this paper has just been picked up"
      key(203, MID_L, 2), key(207.7, KING_S, 1), key(214.5, JURY_S, 1.2),        // "a letter"; "Who is it directed to?"
      key(218.2, HERALD_S, 1), key(220.8, MID_R, 2), key(224.3, HERALD_S, 1), key(231.5, JURY_A, 1.5),        // "a set of verses"; the prisoner's handwriting?
      key(235.3, HERALD_S, 1), key(240.1, JURY_S, 1), key(242, KING_S, 1),     // the jury puzzled; "imitated somebody else's hand"
      key(247, JURY_S, 1), key(249, KNAVE_S, 1.2), key(252.3, MID_L, 2),         // the jury brightened; the Knave: "I didn't write it"
      key(258.4, KING_S, 1), key(266.5, MID_R, 2), key(274.2, QUEEN_S, 1),       // "like an honest man"; clapping; "proves his guilt"
      key(276.9, MID_L, 1.5), key(282.5, KING_S, 1), key(284.6, HERALD_S, 1.2),  // "It proves nothing of the sort!"; "Read them"
      key(289, MID_R, 1.5), key(291, KING_S, 1), key(295, MID_L, 2.5),                               // "Begin at the beginning"
      key(305.5, HERALD_S, 2.5), key(315, JURY_A, 3), key(326, HERALD_S, 2.5),   // the verses
      key(336, MID_L, 3), key(346, THRONE_S, 2.5), key(354, MID_R, 2.5),
      key(359.8, KING_S, 1.2), key(367, MID_L, 2),                               // "the most important piece of evidence"; "If any one of them can explain it"
      key(378.8, JURY_S, 1.2), key(385.7, KING_S, 1.2), key(390, MID_R, 2),      // the jury writes; "that saves a world of trouble"
      key(395.5, KING_S, 1.2), key(400.5, MID_R, 1.5), key(404, KING_S, 1), key(408.2, KNAVE_S, 1.2), key(413, MID_L, 2),   // the verses on his knee; "you can't swim, can you?"; cardboard
      key(418.3, KING_S, 1.2), key(427, MID_R, 2.5),                             // muttering over the verses
      key(435.7, MID_L, 1.5), key(440.4, KING_S, 1), key(445.2, MID_R, 2),       // "they all returned"; "there they are!" (the tarts)
      key(447.3, THRONE_S, 1.2), key(451.5, MID_L, 1.5), key(455.3, QUEEN_S, 0.8), key(458.3, BILL_S, 1), // "you never had fits"; "Never!" the inkstand at the Lizard
      key(462.5, JURY_A, 2), key(470.3, KING_S, 1), key(475.4, MID_R, 2),        // the ink; the pun; a dead silence
      key(482, MID_L, 2), key(487.5, QUEEN_S, 1), key(492.7, MID_R, 1.2),        // "Let the jury consider"; "Sentence first"; "Stuff and nonsense!"
      key(499, QUEEN_S, 0.8), key(502.4, MID_L, 1), key(504.7, QUEEN_S, 0.8),    // "Hold your tongue!" purple; "I won't!"; "Off with her head!"
      key(508.5, FULL, 3), key(T.air - 0.5, PACK, 2.5),                          // nobody moved; full size; the pack rises
    ]);
    return {
      T, bg: PAPER, fog: [7, 26], bounds: null, hotspots: [], camera, update,
      actors: (t) => ({ alice: aliceA(t), king: kingA(t), queen: queenA(t), knave: knaveA(t), rabbit: rabbitA(t), gryphon: gryphonA(t) }),
    };
  },
};

// --- 2. The riverbank: waking, and the sister's dream ----------------------------------------
const SISTER = { x: -3.25, z: -2.6 };
export const waking = {
  id: 'waking',
  title: 'The bank',
  start: (cue) => cue.at('bank') - 1,
  parts: (cue) => [{ title: "The sister's dream", t: cue.at('dream', 4) - 3 }],
  build({ group, ai, cue }) {
    const at = cue.at;
    const start = waking.start(cue);
    const T = {
      lap: at('lap'), wake: at('wake'), kissed: at('kissed'), ran: at('ran', 1), sun: at('sun'), dream: at('dream', 4), rabbit: at('rabbit', 8), mouse: at('mouse'),
      teacups: at('teacups', 1), queen: at('queen', 9), pig: at('pig-baby'), gryphon: at('gryphon', 1), turtle: at('turtle'), closed: at('closed'), bells: at('sheep-bells'),
      gryphon2: at('gryphon', 2), cattle: at('cattle'), lastly: at('lastly'), children: at('children'),
    };
    const end = cue.end;
    const set = buildStage(group, ai);
    const think = thoughts(group, [
      { t0: T.bells - 1, t1: T.lastly, art: countryVignette() },
      { t0: T.lastly + 3, t1: end + 5, art: grownAliceVignette() },
    ]);
    // Dead leaves fluttering down upon her face.
    const leaves = [0, 1, 2, 3].map((k) => { const l = paperFlat(texture(deadLeaf(k)), 0.08, 0.053, { anchor: 'center', edge: false }); group.add(l); return l; });
    // The creatures of the dream, faint, each as the text names it; they fade back into the
    // sounds of the countryside: the teacups into sheep-bells, the Queen into the shepherd boy,
    // the baby and the Gryphon into the farm-yard, the Mock Turtle into the lowing cattle.
    // c: a drawing in code (canvas) or an AI drawing from `ai` ({ tex, aspect }).
    const ghost = (c, h, x, z, t0, t1) => {
      const f = c.tex ? paperFlat(c.tex, h * c.aspect, h, { edge: false }) : paperFlat(texture(c), h * c.width / c.height, h, { edge: false });
      const m = f.userData.front.material; m.transparent = true; m.alphaTest = 0.02; m.depthWrite = false;
      f.position.set(x, 0, z); group.add(f);
      return { f, m, t0, t1 };
    };
    const reality = (k) => lerp(T.bells, T.cattle, k);
    const ghosts = [
      ghost(ai['ch3/mouse3_away'], 0.3, -2.3, -2.2, T.mouse, reality(0.9)),
      ghost(ai['ch7/hatter_sit_stare'], 0.9, -0.9, -2.9, T.teacups, T.bells), ghost(ai['ch7/marchhare_sit'], 0.85, -0.3, -3.0, T.teacups, T.bells), ghost(ai['ch7/teapot'], 0.3, -0.6, -2.6, T.teacups, T.bells),
      ghost(ai['ch8/queen_point'], 1.1, 0.5, -2.6, T.queen, reality(0.3)),
      ghost(ai['ch6/duchess_nurse'], 1.1, -4.3, -2.5, T.pig, reality(0.55)), ghost(ai['ch6/baby_snout'], 0.35, -3.9, -2.3, T.pig, reality(0.55)),
      ghost(ai['ch9/gryphon_walk'], 0.75, -1.6, -3.3, T.gryphon, reality(0.6)),
      ghost(ai['ch4/bill_stand'], 0.5, -1.9, -2.1, T.gryphon + 1.5, reality(0.7)),
      ghost(ai['ch4/guinea_stand'], 0.42, 1.1, -2.3, T.gryphon + 3.5, reality(0.75)), ghost(ai['ch4/guinea_bottle'], 0.42, 1.45, -2.4, T.gryphon + 3.8, reality(0.75)),
      ghost(ai['ch9/mockturtle_sob'], 1.2, 1.6, -3.2, T.turtle, T.cattle + 2),
      ghost(ai['ch8/hedgehog_ball'], 0.16, 0.1, -2.1, T.queen + 1, reality(0.3)),
    ];
    const LAP = { x: SISTER.x + 0.38, z: SISTER.z + 0.18 };
    const aliceA = (t) => {
      if (t >= T.ran + 7) return { visible: false };
      const s = route(t, [[start, LAP], [T.ran, LAP], [T.ran + 7, { x: 1.8, z: -1.2, dir: 1 }]], { phase: t * 2.4 });
      const asleep = t < T.wake;
      const pose = t < T.ran ? 'sit' : s.moving ? 'runhome' : 'stand'; // running in to her tea (AI, 2026-10-14)
      return { ...s, pose, dir: t < T.ran ? -1 : s.dir, tilt: asleep ? 0.45 : 0, y: asleep ? -0.05 : 0 };   // her head in her sister's lap
    };
    const rabbitA = (t) => {
      if (t < T.rabbit - 0.5 || t > T.rabbit + 5) return { visible: false };
      const s = route(t, [[T.rabbit - 0.5, { x: -6, z: -1.9, dir: 1 }], [T.rabbit + 5, { x: 3.5, z: -1.9 }]], { phase: t * 2.6 });   // "the White Rabbit hurried by"
      return { ...s, pose: s.moving ? 'trot1' : 'watch1' }; // the Chapter I model
    };
    function update(t) {
      leaves.forEach((l, k) => {
        const f = smooth((t - start - k * 0.8) / 4);
        l.visible = t < T.wake + 1;
        l.position.set(LAP.x - 0.2 + k * 0.12 + Math.sin(t * 2 + k) * 0.08, lerp(2.2, 0.3, f), LAP.z + 0.1);
        l.rotation.z = t * (k % 2 ? 1.5 : -1.2);
      });
      for (const g of ghosts) {
        const o = smooth((t - g.t0) / 1.5) * (1 - smooth((t - g.t1) / 2.5)) * 0.7;
        g.f.visible = o > 0.01; g.m.opacity = o;
      }
      think(t, { x: SISTER.x + 0.9, y: 1.7, z: SISTER.z + 0.3 }, 1.0);
    }
    const camera = cameraTrack([
      { t: start, dur: 0, pos: [-2.4, 0.9, -1.0], look: [SISTER.x + 0.2, 0.55, SISTER.z] },             // lying on the bank
      { t: T.wake, dur: 3, pos: [-1.9, 1.0, -0.4], look: [SISTER.x + 0.3, 0.6, SISTER.z] },             // "Wake up, Alice dear!"
      { t: T.ran - 1, dur: 4, pos: [-0.6, 1.4, 1.6], look: [-0.5, 0.5, -2.2] },                         // she ran off
      { t: T.sun - 3, dur: 5, pos: [-2.3, 1.0, -0.9], look: [SISTER.x, 0.65, SISTER.z] },               // her sister sat still
      { t: T.dream + 6, dur: 10, pos: [-0.9, 1.25, 1.4], look: [-1.0, 0.6, -2.7] },                       // the whole place alive with strange creatures
      { t: T.closed + 2, dur: 15, pos: [-1.2, 1.3, 1.8], look: [-1.2, 0.6, -2.8] },
      { t: T.lastly - 2, dur: 6, pos: [-2.2, 1.2, -0.4], look: [SISTER.x + 0.5, 0.9, SISTER.z] },       // the after-time
      { t: T.children, dur: Math.max(4, end - T.children), pos: [-1.2, 1.6, 1.4], look: [SISTER.x + 0.6, 1.0, SISTER.z] },
    ]);
    return {
      T, bg: PAPER, fog: [9, 34], bounds: set.bounds, hotspots: set.hotspots, camera, update,
      // The sister (AI poses, 2026-10-14): Alice's head in her lap, brushing away the leaves; then alone, her head on her hand, dreaming.
      actors: (t) => ({ alice: aliceA(t), rabbit: rabbitA(t), sister: { pose: t < T.ran ? 'lap' : t >= T.ran + 4 ? 'dream' : 'read', x: SISTER.x, z: SISTER.z, dir: 1 } }),
    };
  },
};

export const CHAPTER_12 = [evidence, waking];
