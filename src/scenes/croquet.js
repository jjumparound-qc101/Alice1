// Chapter VIII, "The Queen's Croquet-Ground", in two scenes, both in the Queen's garden
// (src/sets/croquet.js, shared with Chapter IX), at foot-high Alice's scale:
//   roseTree — Two, Five and Seven painting the white roses red; the procession; "Off with her
//              head!"; "Nonsense!"; the gardeners hidden in the flower-pot; walking with the Rabbit;
//   croquet  — the game: flamingoes, hedgehogs, soldiers for arches; the Queen stamping about;
//              the Cheshire Cat's head in the air; the King; the flamingo in the tree; the
//              argument about beheading a head; the Cat fades away.
// Figures and props not yet drawn are placeholders from props8.js.
import * as THREE from 'three';
import { crowdCard } from '../cards.js';
import { paperFlat } from '../stage.js';
import { texture, PAPER } from '../ink.js';
import { card, cardBack, cardArch, SOLDIERS, COURTIERS, CHILDREN, GUESTS, tulipVignette } from '../props8.js';
import { buildCroquet, FOOT, ROSE, POT, CROQ, FTREE } from '../sets/croquet.js';
import { drawnPose, extras } from '../crowd.js';
import { thoughts } from '../thoughts.js';
import { carry } from '../puppet.js';
import { smooth, lerp, route, cameraTrack, withAlice } from '../track.js';

const RABBIT = 0.35;                         // the Rabbit's scale beside foot-high Alice
const CARD_H = 0.28, CHILD_H = 0.2, COURT_H = 0.32;
const cardPose = (who, pose, h) => drawnPose(`${who.suit}-${who.rank}-${pose}`, () => card(who, pose), h);

// The procession, in order: a row is [offset behind the head (m), [z of each member], kind].
const LANE = [-0.2, -0.34];
const ROWS = [
  ...[0, 1, 2, 3, 4].map((k) => [k * 0.2, LANE, 'soldier']),
  ...[0, 1, 2, 3, 4].map((k) => [1.1 + k * 0.2, LANE, 'courtier']),
  ...[0, 1, 2, 3, 4].map((k) => [2.2 + k * 0.18, LANE, 'child']),
  [3.2, LANE, 'guest'], [3.4, LANE, 'guest'], [3.6, LANE, 'guest'], [3.8, [LANE[1]], 'guest'],
];
const OFF = { rabbit: 3.8, knave: 4.05, queen: 4.35, king: 4.5 };

// --- 1. The rose-tree and the procession -------------------------------------------------
export const roseTree = {
  id: 'roseTree',
  title: 'Painting the roses red',
  start: () => 0,
  parts: (cue) => [
    { title: 'The Queen! The Queen!', t: cue.at('queen', 3) - 2 },
    { title: 'The procession', t: cue.at('soldiers', 1) - 2 },
    { title: 'Off with her head!', t: cue.at('crimson', 2) - 2 },
    { title: 'The flower-pot', t: cue.at('moved') - 2 },
    { title: 'Walking with the Rabbit', t: cue.at('timid') - 3 },
  ],
  build({ group, ai, cue }) {
    const at = cue.at;
    const T = {
      nearer: at('nearer'), five: at('queen', 1) - 4, tulip: at('tulip-roots'), flung: at('flung'), bowed: at('bowed', 1), ask: at('alice', 3) - 1,
      queenCry: at('queen', 3), flat: at('flat', 1), backs: at('backs'), soldiers: at('soldiers', 1), kings: at('king', 1), opposite: at('opposite'), who: at('queen', 7),
      idiot: at('idiot'), these: at('queen', 9), crimson: at('crimson', 2), nonsense: at('nonsense'), laid: at('laid'), turn: at('knave', 3),
      carefully: at('carefully'), get: at('get', 1), leave: at('leave'), roses: at('queen', 15) + 2, knee: at('knee'), offHeads: at('queen', 16),
      moved: at('moved'), ran: at('ran', 1), pot: at('flower-pot'), wandered: at('wandered'), marched: at('marched'), joined: at('joined'),
      timid: at('timid'), tiptoe: at('tiptoe'), scream: at('scream'), end: at('get', 2) - 1,
    };
    const { paint } = buildCroquet({ group, ai });
    const think = thoughts(group, [{ t0: T.tulip - 1, t1: T.tulip + 7, art: tulipVignette() }]);
    const A = { x: -1.35, z: 0.1 };                      // where Alice stands and watches
    // The three gardeners: where each paints, where each lies flat, and in the pot.
    const G = { two: { x: -2.48, z: -0.6, dir: 1, rank: 2 }, five: { x: -1.95, z: -0.6, dir: -1, rank: 5 }, seven: { x: -2.22, z: -0.52, dir: -1, rank: 7 } };
    // Lying flat on their faces: the card's back, the same for the whole pack, with head, hands
    // and feet showing; turned over, the gardener's own drawing on its back (AI, tools/ch8_art.py).
    const lying = Object.fromEntries(Object.entries(G).map(([name, g]) => {
      const lay = (a, w) => { const f = paperFlat(a.tex, w, w / a.aspect, { anchor: 'center', edge: false }); f.rotation.x = -Math.PI / 2; f.position.set(g.x, 0.004, g.z); group.add(f); return f; };
      return [name, { back: lay(ai['ch8/card_back'], 0.24), face: lay(ai[`ch8/${name}_stand`], 0.2) }];
    }));

    // The column: the head's distance along the path. It passes Alice slowly, each group as
    // the text names it, eases to a stop "opposite to Alice", then moves on.
    const QSTOP = A.x - 0.42;
    const queenX = (t) => {
      if (t < T.kings) return QSTOP - 0.65 + 0.088 * (t - T.kings);
      if (t < T.moved) return lerp(QSTOP - 0.65, QSTOP, smooth((t - T.kings) / (T.opposite - T.kings)));
      return QSTOP + Math.max(0, t - T.moved) * 0.16;
    };
    const head = (t) => queenX(t) + OFF.queen;
    const walking = (t) => (t > T.soldiers - 8 && t < T.opposite) || t > T.moved;
    const member = (t, off, z, extra = {}) => {
      const x = head(t) - off;
      return { x, z, dir: 1, moving: walking(t), dist: x * 1, visible: t >= T.soldiers - 8 && x > -4.6 && x < 6, ...extra };
    };
    // The extras of the procession: soldiers (clubs), courtiers (diamonds), children (hearts), guests.
    const list = [], places = [];
    const next = { soldier: 0, courtier: 0, child: 0, guest: 0 };
    const deck = { soldier: SOLDIERS, courtier: COURTIERS, child: CHILDREN, guest: GUESTS };
    for (const [off, zs, kind] of ROWS) for (const z of zs) {
      const who = deck[kind][next[kind]++];                      // each card person is a different card of the pack
      const h = kind === 'child' ? CHILD_H : kind === 'guest' ? COURT_H : CARD_H;
      list.push({ poses: { stand: crowdCard(ai, who, h) }, height: h });
      places.push({ off, z, kind, i: list.length - 1 });
    }
    const crowd = extras(group, list);
    // Three soldiers remain behind to execute the gardeners: they wander about, then march off.
    const STAY = [7, 8, 9];
    const crowdStates = (t) => places.map(({ off, z, kind, i }) => {
      if (STAY.includes(i) && t >= T.moved) {
        const x0 = head(T.moved) - off;
        const s = route(t, [[T.moved, { x: x0, z }], [T.wandered, { x: x0, z }], [T.wandered + 1.5, { x: POT.x + 0.3 - (i - 7) * 0.25, z: POT.z + 0.4 }],
          [T.marched, { x: POT.x - 0.1 - (i - 7) * 0.2, z: POT.z + 0.3 }], [T.marched + 14, { x: x0 + 3, z }]], { phase: t * 2.5 });
        return { ...s, pose: 'stand', visible: t < T.marched + 14 };
      }
      const m = member(t, off, z, { pose: 'stand', phase: t * 2.4 });
      // "the little dears came jumping merrily along hand in hand"
      if (kind === 'child' && m.moving) m.y = Math.abs(Math.sin(t * 5 + off)) * 0.04;
      return m;
    });

    const gardener = (name) => (t) => {
      const g = G[name];
      if (t >= T.flat - 0.3 && t < T.get) return { visible: false };
      if (t >= T.pot + 2.5) return { visible: false };
      // "who ran to Alice for protection", and into the flower-pot.
      if (t >= T.ran) {
        const k = { two: -0.08, five: 0.06, seven: -0.01 }[name];
        const s = route(t, [[T.ran, g], [T.ran + 1.2, { x: A.x - 0.1 + k, z: A.z - 0.12 }], [T.pot - 0.5, { x: A.x - 0.1 + k, z: A.z - 0.12 }], [T.pot + 0.8, { x: POT.x + k, z: POT.z - 0.04 }]], { phase: t * 4 });
        return { ...s, pose: t < T.pot - 0.5 ? 'run' : 'stand', sink: smooth((t - T.pot - 0.8) / 1.2) };
      }
      let pose = t < T.flat ? 'paint' : 'stand';
      if (t >= T.bowed && t < T.bowed + 4) pose = 'bow';                       // "all of them bowed low"
      if (t >= T.get + 0.4 && t < T.leave) pose = Math.floor((t - T.get) / 1.1) % 2 ? 'bow' : 'stand'; // bowing to everybody
      if (name === 'two' && t >= T.knee && t < T.moved) pose = 'kneel';
      if (name === 'seven' && t >= T.flung && t < T.flung + 3) pose = 'stand'; // flung down his brush
      const jump = t >= T.get && t < T.get + 0.5 ? Math.sin((t - T.get) / 0.5 * Math.PI) * 0.06 : 0;
      return { pose, x: g.x, z: g.z, y: jump, dir: t >= T.bowed && t < T.queenCry ? 1 : g.dir };
    };
    const QFINAL = { x: QSTOP, z: LANE[0] };
    const queenA = (t) => {
      // Turns to the rose-tree, examines the roses, then back into the procession.
      if (t >= T.leave + 3 && t < T.moved) {
        const s = route(t, [[T.leave + 3, QFINAL], [T.roses + 2, { x: ROSE.x + 0.35, z: ROSE.z + 0.3, dir: -1 }], [T.offHeads + 1, { x: ROSE.x + 0.35, z: ROSE.z + 0.3 }], [T.moved, QFINAL]], { phase: t * 2.2 });
        return { ...s, pose: t >= T.offHeads && t < T.offHeads + 3 ? 'point' : 'stand', dir: t < T.offHeads + 1 ? -1 : s.dir };
      }
      const m = member(t, OFF.queen, LANE[0], { phase: t * 2.2 });
      let pose = 'stand';
      if (t >= T.who && t < T.who + 3) pose = 'point';
      if (t >= T.idiot && t < T.idiot + 1.5) m.tilt = Math.sin((t - T.idiot) * 8) * 0.1; // "tossing her head impatiently"
      if (t >= T.these && t < T.these + 4) { pose = 'point'; m.dir = -1; }              // "pointing to the three gardeners"
      if (t >= T.crimson && t < T.nonsense + 1.5) pose = 'flush';                        // "turned crimson with fury"
      if (t >= T.turn - 4 && t < T.leave + 3) { m.dir = -1; if (t < T.turn + 1.5 || (t >= T.get && t < T.get + 2)) pose = 'point'; }
      if (t >= T.leave && t < T.leave + 2) pose = 'stamp';
      return { ...m, pose };
    };
    const kingA = (t) => {
      const m = member(t, OFF.king, LANE[1], { pose: 'stand', phase: t * 2.2 });
      if (t >= T.laid && t < T.laid + 6) { m.x += smooth((t - T.laid) / 0.8) * 0.12; m.tilt = -0.08; } // "laid his hand upon her arm"
      return m;
    };
    const knaveA = (t) => {
      // Turns the gardeners over, very carefully, with one foot.
      if (t >= T.turn && t < T.get + 3) {
        const s = route(t, [[T.turn, { x: head(T.turn) - OFF.knave, z: LANE[1] + 0.06 }], [T.carefully - 0.3, { x: G.seven.x + 0.12, z: G.seven.z + 0.18, dir: -1 }],
          [T.get, { x: G.seven.x + 0.12, z: G.seven.z + 0.18 }], [T.get + 3, { x: head(T.turn) - OFF.knave, z: LANE[1] + 0.06, dir: 1 }]], { phase: t * 2.2 });
        return { ...s, pose: 'carry', tilt: t >= T.carefully - 0.3 && t < T.carefully + 1.2 ? 0.15 : 0 };
      }
      const m = member(t, OFF.knave, LANE[1] + 0.06, { pose: 'carry', phase: t * 2.2 });
      if (t >= T.who + 1 && t < T.who + 4) m.tilt = smooth((t - T.who - 1) / 0.5) * 0.3 * (1 - smooth((t - T.who - 3) / 0.5)); // "only bowed and smiled"
      return m;
    };
    const rabbitA = (t) => {
      // In the procession among the guests; then walking beside Alice, whispering on tiptoe.
      // The Chapter I model (owner, 2026-10-14): trotting in the procession; peeping up into her face; on tiptoe.
      if (t < T.timid - 1) { const m = member(t, OFF.rabbit, LANE[0], { phase: t * 3 }); return { ...m, pose: m.moving ? 'trot1' : 'watch1', scale: RABBIT }; }
      const a = aliceA(t);
      const whisper = t >= T.tiptoe && t < T.tiptoe + 4;
      return { ...a, pose: whisper ? 'tiptoe' : 'peep', x: a.x - 0.18, y: 0, z: a.z - 0.05, scale: RABBIT, dir: whisper ? 1 : a.dir, visible: t < T.end };
    };
    const WALK = [[T.joined + 2, A], [T.joined + 5, { x: A.x + 0.25, z: A.z + 0.1, dir: 1 }], [T.timid, { x: A.x + 0.25, z: A.z + 0.1 }], [T.end, { x: CROQ.x0 + 0.1, z: 0.3 }]];
    const aliceA = (t) => {
      const s = route(t, [
        [0, { x: -3.2, z: 0.25, dir: 1 }], [T.nearer + 3, { x: -1.75, z: -0.25 }],              // "she went nearer to watch them"
        [T.queenCry, { x: -1.75, z: -0.25 }], [T.queenCry + 3, A],                              // stands back as the procession comes
        [T.ran + 1, A], [T.pot - 0.5, A], [T.pot + 0.8, { x: POT.x + 0.32, z: POT.z + 0.22, dir: -1 }], [T.pot + 4, A],
        ...WALK,
      ], { phase: t * 2.2 });
      const laughing = t >= T.scream && t < T.scream + 1.5 ? Math.sin(t * 25) * 0.05 : 0;  // "a little scream of laughter"
      const dir = !s.moving && t >= T.queenCry + 3 && t < T.moved ? -1 : s.dir;               // facing the procession, then the Queen
      // AI poses (2026-10-14): watching the procession, hands behind her back; "Nonsense!"; laughing.
      let pose = 'stand';
      if (!s.moving && t >= T.queenCry + 3 && t < T.moved) pose = 'procession';
      if (t >= T.nonsense - 0.3 && t < T.nonsense + 4) pose = 'nonsense';
      if (t >= T.scream && t < T.scream + 2) pose = 'laugh';
      return { ...s, dir, pose, scale: FOOT, tilt: pose === 'laugh' ? 0 : laughing };
    };
    function update(t, cast, camera) {
      // The roses: painted red one by one until the Queen comes.
      paint(Math.floor(lerp(3, 8, Math.min(1, t / T.queenCry))));
      // Flat on their faces; turned over by the Knave; up again.
      for (const l of Object.values(lying)) {
        const down = t >= T.flat - 0.3 && t < T.get;
        l.back.visible = down && t < T.carefully; l.face.visible = down && t >= T.carefully;
      }
      crowd.apply(crowdStates(t), camera);
      const a = aliceA(t);
      think(t, { x: a.x - 0.25, y: 0.42, z: a.z }, 0.24);
    }
    const L = (x, y = 0.18, z = -0.3) => [x, y, z];
    const camera = cameraTrack([
      { t: 0, dur: 0, pos: [-1.3, 0.45, 1.5], look: [ROSE.x, 0.28, ROSE.z] },                         // the rose-tree near the entrance
      { t: T.nearer, dur: 4, pos: [-1.6, 0.36, 0.7], look: [ROSE.x + 0.15, 0.26, ROSE.z] },                // the gardeners at work
      { t: T.five - 1, dur: 3, pos: [-1.75, 0.3, 0.45], look: [ROSE.x + 0.15, 0.22, ROSE.z + 0.15] },
      { t: T.ask - 1, dur: 3, pos: [-1.3, 0.34, 0.85], look: [-2.0, 0.2, -0.4] },                   // "why you are painting those roses?"
      { t: T.queenCry - 1, dur: 3, pos: [-1.2, 0.45, 1.4], look: [-2.1, 0.12, -0.4] },                // flat upon their faces
      { t: T.soldiers - 3, dur: 4, pos: [-1.5, 0.3, 1.0], look: L(-2.3) },                             // the procession passes
      { t: T.kings - 6, dur: 4, pos: [-1.8, 0.3, 0.75], look: L(-2.4, 0.2) },                          // the Knave, the King and Queen
      { t: T.opposite - 1, dur: 3, pos: [-1.2, 0.3, 0.85], look: [-1.6, 0.18, -0.15] },               // opposite to Alice
      // "the pattern on their backs was the same as the rest of the pack": looking down at the three backs.
      { t: T.backs - 1.5, dur: 2.5, pos: [-2.05, 0.75, 0.25], look: [-2.2, 0.0, -0.62] },
      { t: T.backs + 5, dur: 2.5, pos: [-1.2, 0.3, 0.85], look: [-1.6, 0.18, -0.15] },
      { t: T.crimson - 1, dur: 2, pos: [-1.55, 0.29, 0.45], look: [QSTOP, 0.26, LANE[0]] },            // "Off with her head!"
      { t: T.nonsense - 0.3, dur: 1.5, pos: [-1.15, 0.25, 0.65], look: [A.x - 0.1, 0.2, 0.0] },       // "Nonsense!"
      { t: T.turn - 1, dur: 3, pos: [-1.5, 0.45, 1.1], look: [-2.0, 0.1, -0.45] },                    // "Turn them over!"
      { t: T.leave + 2, dur: 4, pos: [-1.7, 0.35, 0.7], look: [ROSE.x, 0.28, ROSE.z] },               // examining the roses
      { t: T.moved - 1, dur: 3, pos: [-1.1, 0.4, 1.2], look: [-1.5, 0.15, -0.4] },                    // the procession moves on
      { t: T.pot - 2, dur: 2, pos: [-1.15, 0.3, 0.6], look: [POT.x, 0.15, POT.z] },                   // into the flower-pot
      { t: T.marched - 1, dur: 4, pos: [-0.9, 0.35, 1.1], look: [-0.3, 0.15, -0.3] },                 // the soldiers march off
      { t: T.joined, dur: 3, pos: [-1.0, 0.32, 0.9], look: [-1.1, 0.2, 0.1] },                        // Alice joins the procession
      { t: T.timid, dur: T.end - T.timid, pos: [CROQ.x0 + 0.3, 0.32, 1.0], look: [CROQ.x0, 0.2, 0.2] }, // walking with the Rabbit
    ]);
    return {
      T, bg: PAPER, fog: [7, 26], bounds: null,
      hotspots: [{ pos: new THREE.Vector3(ROSE.x, 0.3, ROSE.z), title: 'The rose-tree', text: 'the roses growing on it were white, but there were three gardeners at it, busily painting them red' }],
      camera: withAlice(camera, aliceA, [[106, 172], [208, 216], [223, 233], [266, 287], [303, 329]]), update, // (frame_report, 2026-10-15)
      actors: (t) => ({ alice: aliceA(t), two: gardener('two')(t), five: gardener('five')(t), seven: gardener('seven')(t), queen: queenA(t), king: kingA(t), knave: knaveA(t), rabbit: rabbitA(t) }),
    };
  },
};

// --- 2. The croquet-ground ----------------------------------------------------------------
export const croquetGame = {
  id: 'croquet',
  title: 'The croquet-ground',
  start: (cue) => cue.at('get', 2) - 1,
  parts: (cue) => [
    { title: 'Managing her flamingo', t: cue.at('managing') - 2 },
    { title: 'The Cheshire Cat', t: cue.at('appearance') - 3 },
    { title: 'A cat may look at a king', t: cue.at('king', 4) - 3 },
    { title: 'The flamingo in the tree', t: cue.at('search') - 2 },
    { title: 'Off with its head?', t: cue.at('crowd') - 3 },
  ],
  build({ group, ai, cue }) {
    const at = cue.at;
    const start = croquetGame.start(cue);
    const T = {
      places: at('places'), settled: at('game', 1), flamingo: at('flamingo', 1), blow: at('blow'), twist: at('twist'), laughing: at('laughing'), unrolled: at('unrolled'),
      allOnce: at('quarrelling') - 2, stamping: at('stamping'), uneasy: at('uneasy'), appearance: at('appearance'), grin: at('grin'), eyes: at('eyes'), whole: at('whole', 1),
      down: at('flamingo', 2), close: at('close', 2), passed: at('passed'), kingUp: at('king', 4), behind: at('behind', 3), removed: at('removed', 1), offHis: at('head', 9),
      hurried: at('hurried', 3), search: at('search'), fight: at('fight', 1), tree: at('tree'), caught: at('caught'), tucked: at('tucked', 2), crowd: at('crowd'),
      arrow: at('arrow'), fading: at('fading'), duchess: at('duchess', 3), wildly: at('wildly'),
    };
    buildCroquet({ group, ai });
    // Soldiers doubled up as arches; now and then one gets up and walks off to another place.
    const archTex = ai['ch8/card_arch'].tex; // a soldier doubled up into a hoop (AI)
    const ARCHES = [[1.3, -0.6], [2.4, -1.2], [3.1, -0.3], [4.0, -1.1], [4.6, 0.1], [3.0, -1.6]];
    const arches = ARCHES.map(([x, z]) => { const a = paperFlat(archTex, 0.2, 0.2 / ai['ch8/card_arch'].aspect); a.position.set(x, 0, z); group.add(a); return { a, x, z }; });
    // Alice's flamingo and hedgehogs.
    // AI drawings (tools/creatures_art.py, 2026-10-14), the flamingo after Tenniel's plate 8.3: held as a mallet
    // (body under her arm, neck hanging straight down), its neck twisted round to look up at her, flapping up at
    // the tree. FH: the held drawing's height, about from her elbow to the ground.
    const FH = 0.55 * 1.25 * FOOT;
    const flamArt = (n, h) => paperFlat(ai[`ch8/${n}`].tex, h * ai[`ch8/${n}`].aspect, h, { anchor: 'center' });
    const flam = { held: flamArt('flamingo_mallet', FH), twist: flamArt('flamingo_twist', FH), fly: flamArt('flamingo_fly', 0.36) };
    Object.values(flam).forEach((f) => group.add(f));
    // The hedgehogs (after the same plate): rolled up as a ball; unrolled and crawling away; two fighting.
    const hogArt = (n, h) => paperFlat(ai[`ch8/${n}`].tex, h * ai[`ch8/${n}`].aspect, h);
    const hog = { ball: hogArt('hedgehog_ball', 0.045), crawl: hogArt('hedgehog_crawl', 0.045) };
    const hog2 = hogArt('hedgehog_fight', 0.09);
    group.add(hog.ball, hog.crawl, hog2);
    // The Cat's head, appearing grin first, then the eyes, then the rest.
    const CAT = { x: 2.3, y: 0.44, z: 0.0 };
    // AI drawing after Tenniel's plate 8.4 (tools/creatures_art.py, 2026-10-14): the grin alone, the grin and eyes, the head.
    const CW = 0.16, CH = CW / ai['ch8/cheshire_head'].aspect;
    const heads = ['cheshire_head_grin', 'cheshire_head_eyes', 'cheshire_head'].map((n) => { const h = paperFlat(ai[`ch8/${n}`].tex, CW, CH, { anchor: 'center', edge: false }); h.position.set(CAT.x, CAT.y, CAT.z); group.add(h); return h; });
    heads.forEach((h) => { h.userData.front.material.transparent = true; h.userData.front.material.alphaTest = 0.01; });
    // The other players, quarrelling and fighting for the hedgehogs; at the end, a crowd round the Cat.
    const players = [...GUESTS, COURTIERS[2], CHILDREN[3]];       // the guests play, and a courtier and a child
    const crowd = extras(group, players.map((who) => {
      const h = who.rank === 'king' || who.rank === 'queen' ? COURT_H : who.suit === 'hearts' ? CHILD_H : CARD_H;
      return { poses: { stand: crowdCard(ai, who, h) }, height: h };
    }));
    const playerA = (i) => (t) => {
      const cx = lerp(CROQ.x0 + 0.5, CROQ.x1 - 0.5, (i + 0.5) / players.length), cz = lerp(CROQ.z0 + 0.4, CROQ.z1 - 0.4, ((i * 37) % 10) / 10);
      // "people began running about in all directions, tumbling up against each other"
      const wild = t < T.settled ? 1 : 0.25;
      const x = cx + Math.sin(t * 0.7 * (1 + wild) + i * 1.7) * 0.5 * wild + Math.sin(t * 0.21 + i) * 0.3;
      const z = cz + Math.cos(t * 0.5 * (1 + wild) + i * 2.3) * 0.25 * wild;
      const ring = smooth((t - T.crowd + 4) / 3);                                            // gathered round the Cat
      const a = (i / players.length) * Math.PI - 0.2;
      const rx = CAT.x + Math.cos(a) * 0.45, rz = CAT.z - 0.25 - Math.sin(a) * 0.25;
      const back = smooth((t - T.wildly) / 3);                                               // back to the game
      const k = ring * (1 - back);
      return { pose: 'stand', x: lerp(x, rx, k), z: lerp(z, rz, k), dir: Math.cos(t * 0.7 + i) > 0 ? 1 : -1, moving: k < 0.9, phase: t * 2.6, dist: t * 0.3 };
    };
    const playerStates = (t) => players.map((_, i) => playerA(i)(t));
    const SPOT = { x: 2.0, z: 0.25 };                         // where Alice talks to the Cat
    const HOG = { x: 1.82, z: 0.22 };                         // her hedgehog at first
    const FIGHT = { x: 3.5, z: -0.25 };
    const FLY = { x: FTREE.x - 0.75, y: 0.32, z: FTREE.z + 0.8 };   // under the tree, flapping up at it
    const holding = (t) => (t >= T.flamingo - 1 && t < T.down) || (t >= T.caught && t < T.crowd + 200);
    const aliceA = (t) => {
      const s = route(t, [
        [start, { x: CROQ.x0 + 0.1, z: 0.3, dir: 1 }], [T.flamingo, { x: 1.65, z: 0.25 }],
        [T.allOnce, { x: 1.65, z: 0.25 }], [T.allOnce + 6, { x: 2.3, z: 0.45 }], [T.uneasy + 6, { x: 2.3, z: 0.45 }], [T.appearance, SPOT],
        [T.search, SPOT], [T.search + 3, { x: FIGHT.x - 0.18, z: FIGHT.z + 0.15 }], [T.tree, { x: FIGHT.x - 0.18, z: FIGHT.z + 0.15 }],
        [T.caught, { x: FLY.x + 0.18, z: FLY.z + 0.12 }], [T.caught + 6, { x: FIGHT.x - 0.18, z: FIGHT.z + 0.15 }], [T.tucked + 2, { x: FIGHT.x - 0.18, z: FIGHT.z + 0.15 }],
        [T.crowd, { x: SPOT.x - 0.1, z: SPOT.z + 0.1 }],
      ], { phase: t * 2.2 });
      const laughing = t >= T.laughing && t < T.laughing + 2 ? Math.sin(t * 25) * 0.05 : 0;
      const swing = t >= T.blow && t < T.blow + 1 ? -Math.sin((t - T.blow) * Math.PI) * 0.15 : 0;
      const dir = !s.moving && t >= T.appearance && t < T.search ? 1 : s.dir;
      // AI poses (2026-10-14), after Tenniel's plate 8.3: the flamingo tucked under her arm, its neck twisted up
      // to her face; swinging it at the hedgehog; laughing at it. These drawings hold the flamingo.
      let pose = 'stand';
      if (holding(t)) pose = t >= T.blow - 0.2 && t < T.blow + 0.8 ? 'swing8' : t >= T.laughing - 0.3 && t < T.laughing + 3 ? 'laugh8' : 'flamingo8';
      return { ...s, dir, pose, scale: FOOT, tilt: pose === 'stand' ? laughing + swing : 0 };
    };
    const queenA = (t) => {
      // "went stamping about"; close behind Alice, listening; then away screaming in the distance.
      const s = route(t, [
        [start, { x: 3.6, z: -1.0, dir: -1 }], [T.stamping, { x: 3.6, z: -1.0 }], [T.stamping + 6, { x: 2.8, z: -0.4 }], [T.uneasy, { x: 3.8, z: -0.8 }],
        [T.close - 4, { x: 3.8, z: -0.8 }], [T.close, { x: SPOT.x + 0.25, z: SPOT.z - 0.15, dir: -1 }], [T.passed + 0.5, { x: SPOT.x + 0.25, z: SPOT.z - 0.15 }],
        [T.passed + 8, { x: 4.4, z: -1.2, dir: 1 }], [T.crowd - 6, { x: 4.4, z: -1.2 }], [T.crowd, { x: CAT.x + 0.3, z: CAT.z - 0.12, dir: -1 }],
        [T.wildly + 2, { x: CAT.x + 0.3, z: CAT.z - 0.12 }], [T.wildly + 8, { x: 4.2, z: -0.6 }],
      ], { phase: t * 2.2 });
      const stamping = (t >= T.stamping && t < T.uneasy) || (t >= T.removed && t < T.offHis + 3);
      const pose = t >= T.passed - 1 && t < T.passed + 1 ? 'stand' : stamping ? 'stamp' : t >= T.crowd && t < T.arrow + 1 ? 'point' : 'stand';
      return { ...s, pose };
    };
    const kingA = (t) => {
      // Up to Alice, looking at the Cat's head; gets behind her; hurries off for the executioner.
      if (t < T.kingUp - 4) return { visible: false };
      const s = route(t, [
        [T.kingUp - 4, { x: 3.2, z: -0.6, dir: -1 }], [T.kingUp, { x: SPOT.x + 0.22, z: SPOT.z - 0.08 }], [T.behind - 1, { x: SPOT.x + 0.22, z: SPOT.z - 0.08 }],
        [T.behind + 0.8, { x: SPOT.x - 0.05, z: SPOT.z - 0.18 }], [T.hurried, { x: SPOT.x - 0.05, z: SPOT.z - 0.18 }], [T.hurried + 5, { x: 5.6, z: -1.0, dir: 1 }],
        [T.crowd - 5, { x: 5.6, z: -1.0 }], [T.crowd, { x: CAT.x - 0.28, z: CAT.z - 0.1, dir: 1 }], [T.wildly, { x: CAT.x - 0.28, z: CAT.z - 0.1 }],
        [T.wildly + 1.5, { x: CAT.x + 0.9, z: CAT.z - 0.2 }], [T.wildly + 3, { x: CAT.x - 0.6, z: CAT.z - 0.3 }], [T.wildly + 4.5, { x: CAT.x + 0.9, z: CAT.z - 0.2 }],
      ], { phase: t * 2.5 });
      return { ...s, pose: 'stand', dir: !s.moving && t < T.hurried ? -1 : s.dir, visible: !(t >= T.hurried + 5 && t < T.crowd - 5) };
    };
    const executionerA = (t) => {
      if (t < T.crowd - 5) return { visible: false };
      const s = route(t, [
        [T.crowd - 5, { x: 5.6, z: -0.6, dir: -1 }], [T.crowd, { x: CAT.x + 0.05, z: CAT.z - 0.28 }], [T.arrow, { x: CAT.x + 0.05, z: CAT.z - 0.28 }],
        [T.arrow + 2, { x: 6.0, z: -1.2, dir: 1 }], [T.duchess - 2, { x: 6.0, z: -1.2 }], [T.duchess + 1, { x: CAT.x + 0.5, z: CAT.z - 0.2, dir: -1 }],
        [T.wildly, { x: CAT.x + 0.5, z: CAT.z - 0.2 }], [T.wildly + 1.5, { x: CAT.x - 0.7, z: CAT.z - 0.3 }], [T.wildly + 3, { x: CAT.x + 0.8, z: CAT.z - 0.25 }],
      ], { phase: t * 3 });
      return { ...s, pose: 'axe', visible: !(t >= T.arrow + 2 && t < T.duchess - 2) };
    };
    const duchessA = (t) => {
      if (t < T.duchess - 2) return { visible: false };
      const s = route(t, [[T.duchess - 2, { x: 6.2, z: -1.0, dir: -1 }], [T.duchess + 1.5, { x: CAT.x + 0.75, z: CAT.z - 0.35 }]], { phase: t * 2.2 });
      return { ...s, pose: 'stand' };
    };
    function update(t, cast, camera) {
      crowd.apply(playerStates(t), camera);
      // "the doubled-up soldiers were always getting up and walking off to other parts of the ground"
      arches.forEach(({ a, x, z }, i) => {
        const hop = Math.max(0, Math.sin(t * 0.13 + i * 2.1) - 0.85) * 6;
        a.position.set(x + Math.sin(t * 0.05 + i) * 0.4, 0, z);
        a.rotation.z = hop > 0 ? Math.sin(t * 8) * 0.05 : 0;
        a.visible = !(t >= T.tucked - 6 && i < 2); // "all the arches are gone from this side of the ground"
      });
      // The flamingo: under Alice's arm; twisting round to look up at her; put down while she
      // talks to the Cat; trying to fly up into a tree; caught and tucked away again.
      const held = (t >= T.flamingo - 1 && t < T.down) || (t >= T.caught && t < T.crowd + 200);
      const twist = t >= T.twist && t < T.laughing + 3;
      const flying = t >= T.search && t < T.caught;
      for (const f of Object.values(flam)) f.visible = false;
      if (flying) { const f = flam.fly; f.visible = true; f.position.set(FLY.x + Math.sin(t * 1.5) * 0.06, FLY.y + Math.abs(Math.sin(t * 2)) * 0.12, FLY.z); f.rotation.set(0, 0, Math.sin(t * 6) * 0.1); }
      else if (held) { /* her drawings with the flamingo hold it (2026-10-14) */ }
      else if (t >= T.down && t < T.search) { const f = flam.held; f.visible = true; f.position.set(SPOT.x - 0.1, FH * 0.2, SPOT.z + 0.05); f.rotation.set(0, 0, -1.4); f.scale.x = 1; } // put down, lying on its side
      // The hedgehogs: rolled up; unrolled and crawling away; two fighting.
      hog.ball.visible = t >= start && t < T.unrolled;
      hog.ball.position.set(HOG.x, 0, HOG.z);
      const crawl = smooth((t - T.unrolled) / 10);
      hog.crawl.visible = t >= T.unrolled && t < T.unrolled + 10;
      hog.crawl.position.set(lerp(HOG.x, HOG.x + 0.6, crawl), 0, lerp(HOG.z, HOG.z - 0.4, crawl));
      const fighting = t >= T.fight - 1 && t < T.caught + 1;   // one drawing of the two fighting
      hog2.visible = fighting;
      if (fighting) { hog2.position.set(FIGHT.x + Math.sin(t * 18) * 0.004, 0, FIGHT.z); hog.crawl.visible = false; }
      // The Cat's head: a grin, then eyes, then the whole head; fading away when the
      // executioner goes for the Duchess, gone by the time he is back.
      const fade = 1 - smooth((t - T.fading) / (T.duchess - T.fading));
      const show = [t >= T.grin - 2 && t < T.eyes, t >= T.eyes && t < T.whole, t >= T.whole];
      heads.forEach((h, i) => {
        h.visible = show[i] && fade > 0.01;
        const appear = i === 0 ? smooth((t - T.grin + 2) / 2) : 1;
        h.userData.front.material.opacity = appear * fade;
        h.position.y = CAT.y + Math.sin(t * 0.8) * 0.005;
      });
    }
    const camera = cameraTrack([
      { t: start, dur: 0, pos: [1.4, 0.7, 2.2], look: [2.8, 0.0, -0.5] },                             // "Get to your places!"
      { t: T.settled, dur: 10, pos: [3.0, 0.6, 1.8], look: [3.0, 0.0, -0.6] },                         // all ridges and furrows
      { t: T.flamingo - 1, dur: 3, pos: [1.95, 0.24, 0.8], look: [1.65, 0.18, 0.2] },                 // managing her flamingo
      { t: T.unrolled - 1, dur: 2, pos: [2.0, 0.25, 0.85], look: [2.1, 0.06, 0.05] },                 // the hedgehog crawls away
      { t: T.allOnce, dur: 4, pos: [2.8, 0.6, 2.0], look: [3.0, 0.1, -0.5] },                         // all played at once
      { t: T.uneasy, dur: 3, pos: [2.5, 0.25, 0.95], look: [2.3, 0.2, 0.45] },                        // Alice uneasy
      { t: T.appearance, dur: 4, pos: [1.75, 0.3, 1.3], look: [2.15, 0.27, 0.15] },                  // a curious appearance in the air, and Alice
      { t: T.whole + 8, dur: 4, pos: [1.75, 0.3, 1.0], look: [2.15, 0.3, 0.12] },                     // talking to the Cat
      { t: T.close - 3, dur: 3, pos: [1.85, 0.36, 1.25], look: [2.15, 0.25, 0.1] },                   // the Queen close behind
      { t: T.hurried + 1, dur: 3, pos: [3.0, 0.5, 1.6], look: [3.4, 0.1, -0.3] },
      { t: T.tree - 2, dur: 3, pos: [4.3, 0.42, 0.6], look: [FLY.x + 0.15, 0.42, FLY.z] },              // the flamingo and the tree
      { t: T.caught + 3, dur: 4, pos: [3.1, 0.45, 1.5], look: [3.2, 0.12, -0.2] },
      { t: T.crowd - 2, dur: 4, pos: [2.0, 0.4, 1.3], look: [CAT.x, 0.25, CAT.z] },                   // a crowd round the Cat
      { t: T.fading - 1, dur: 2, pos: [2.3, 0.38, 0.95], look: [CAT.x, 0.32, CAT.z - 0.1] },                // the Cat's head fades
      { t: T.wildly - 1, dur: 3, pos: [2.3, 0.5, 1.6], look: [2.5, 0.15, -0.2] },                     // up and down looking for it
    ]);
    return {
      T, bg: PAPER, fog: [7, 26], bounds: { minX: -2.5, maxX: 5.5, minZ: 1.0, maxZ: 3.0 },
      hotspots: [{ pos: new THREE.Vector3(3.0, 0.1, -0.5), title: 'The croquet-ground', text: 'the balls were live hedgehogs, the mallets live flamingoes, and the soldiers had to double themselves up' }],
      camera: withAlice(camera, aliceA, [[386, 416], [652, 670]]), update,
      actors: (t) => ({ alice: aliceA(t), queen: queenA(t), king: kingA(t), executioner: executionerA(t), duchess: duchessA(t) }),
    };
  },
};

export const CHAPTER_8 = [roseTree, croquetGame];
