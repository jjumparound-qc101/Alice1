// Alice's Adventures in Wonderland: the book's settings for the shared engine (engine/docs/ENGINE.md,
// "startBook"). Moved here from the engine's main.js when Alice moved onto LoLBookEngine (2026-10-15);
// the code is as it was.
import { CHAPTERS } from './chapters.js';

// Interim AI master drawings (PROVENANCE.md), shared by every chapter.
const AI_ART = ['sky', 'treeline', 'tree', 'hedge', 'grass', 'bank_grass', 'bank_edge', 'proscenium', 'cloud_a', 'cloud_b', 'theatre_house', 'theatre_seats_row', 'theatre_seat_empty', 'alice_stand', 'alice_sit', 'sister_read', 'shaft_strip', 'jar_orange',
  'hall/floor', 'hall/lamp', 'hall/curtain', 'hall/door_frame', 'hall/door_leaf',
  'props/key', 'props/bottle', 'props/cake', 'props/box', 'props/fan', // tools/small_props.py
  ...['comfits', 'thimble', 'hatter_watch_close', 'jury_box_tipped', 'chapter1_end', 'court_paper_1', 'court_paper_2', 'court_paper_3', 'dead_leaf_1', 'dead_leaf_2', 'dead_leaf_3', 'dead_leaf_4'].map((n) => `props/${n}`), // tools/vignettes_art.py
  ...['antipodes', 'dinah_down', 'dream', 'shakespeare', 'knot', 'dinah_birds', 'dinah_nurse', 'book', 'chrysalis', 'eggs', 'raven', 'concert', 'bat', 'treacle', 'tulips', 'tempers', 'pigs_fly', 'sea_school', 'masters', 'lobsters_sea', 'whiting_snail', 'whitings', 'lobster_glass', 'owl_panther', 'soup', 'refreshments', 'slates', 'goldfish', 'country_sounds', 'grown_alice'].map((n) => `vignettes/${n}`),
  'ch1/leaf_heap', 'ch1/alice_land', 'ch1/garden', 'ch1/rabbit_run_away', 'ch1/rabbit_watch', 'ch1/rabbit_trot',
  'walls/shaft_side', 'walls/passage', 'walls/passage_floor', 'walls/passage_ceiling', 'walls/hall', 'walls/hall_ceiling', 'ch5/caterpillar_sit', ...['thistle', 'buttercup', 'ladders', 'cart_barrow', 'table_gloves', 'table_empty', 'wood_grass', ...[1, 2, 3, 4, 5].flatMap((k) => [`pebble_${k}`, `cake_${k}`])].map((n) => `ch4/${n}`), ...['mushroom', 'treetops', 'mushroom_bit_1', 'mushroom_bit_2'].map((n) => `ch5/${n}`), 'ch4/alice_hand', 'ch4/alice_foot', 'ch5/alice5_head', ...['rabbit_house', 'rabbit_room_back', 'rabbit_room_door', 'rabbit_room_fire', 'cucumber_frames', 'cucumber_frames_broken', 'alice_lying', 'alice_forearm'].map((n) => `ch4/${n}`), ...['cook_pepper', 'bill_finger', 'hare_dormouse_arm', 'dormouse_sulky'].map((n) => `ch11/${n}`), ...['court_wall', 'court_floor', 'court_ceiling', 'court_throne', 'court_table', 'court_jury_box', 'court_jury_box_front', 'court_witness_box', 'court_witness_box_front', 'court_door'].map((n) => `ch11/${n}`), 'ch12/bill_gape', 'ch12/sister_lap', 'ch12/sister_dream', 'ch9/gryphon_wake', ...['seashore', 'sea_tile', 'sand', 'surf', 'bank_sunny', 'rock_ledge'].map((n) => `ch9/${n}`), 'ch9/gryphon_chuckle', 'ch9/gryphon_thump', 'ch9/gryphon_run', 'ch7/dormouse_teapot', ...['tea_cloth', 'tea_armchair', 'tree_door', 'teacup', 'teapot', 'milk_jug', 'plate_bread'].map((n) => `ch7/${n}`), 'ch7/march_hare_push', 'ch7/hatter_push', 'ch7/hatter_move', 'ch8/cheshire_head', 'ch8/cheshire_head_grin', 'ch8/cheshire_head_eyes', 'ch1/rabbit_run_side', 'ch1/rabbit_hop', 'ch1/rabbit_idle_b', 'ch5/caterpillar_speak', 'ch5/caterpillar_rear', 'ch5/caterpillar_yawn', 'ch5/caterpillar_crawl', 'ch5/hookah', ...['dodo3_rise', 'dodo3_think', 'dodo3_point', 'dodo3_thimble', 'lory3_sulk', 'eaglet3_smile', 'duck3_ask'].map((n) => `ch3/${n}`), ...['lecture', 'cross', 'sigh', 'angry', 'away'].map((n) => `ch3/mouse3_${n}`), ...['flamingo_mallet', 'flamingo_twist', 'flamingo_fly', 'hedgehog_crawl', 'hedgehog_ball', 'hedgehog_fight'].map((n) => `ch8/${n}`), 'ch4/rabbit4_search', 'ch4/rabbit4_point', 'ch4/rabbit4_frame', 'ch4/rabbit4_order', 'ch8/rabbit8_peep', 'ch8/rabbit8_tiptoe', 'ch11/rabbit_herald', 'ch11/rabbit_trumpet', 'ch11/rabbit_scroll', 'ch11/rabbit_specs', ...['owl3', 'magpie3', 'magpie3_shawl', 'canary3', 'canary3_chicks', 'crab', 'crabling'].map((n) => `ch3/${n}`), 'ch5/pigeon_attack', 'ch5/pigeon_scream', 'ch5/pigeon_nest', ...['bill_stand', 'bill_ladder', 'bill_climb', 'bill_rocket', 'bill_limp', 'guinea_stand', 'guinea_hold', 'guinea_bottle', 'pat', 'pat_cap', 'puppy_look', 'puppy_jump', 'puppy_tumble', 'puppy_sit'].map((n) => `ch4/${n}`), 'ch6/cheshire_bough', 'ch6/cheshire_bough_empty', 'ch6/cheshire_grin', 'ch6/cheshire_paw', ...['queen_stand', 'queen_point', 'queen_flush', 'queen_stamp', 'queen_folded', 'queen_specs', 'queen_purple', 'king_stand', 'king_judge', 'king_judge_specs', 'king_judge_fold', 'king_judge_point', 'king_judge_pale', 'knave_carry', 'knave_stand', 'knave_chains', 'executioner', ...['two', 'five', 'seven'].flatMap((c) => ['stand', 'paint', 'bow', 'run'].map((p) => `${c}_${p}`)), 'two_kneel', 'rose_tree', 'rose_white', 'rose_red', 'card_back', 'suit_heart', 'suit_diamond', 'suit_club', 'suit_spade', 'body_soldier', 'body_courtier', 'body_child', 'body_officer', 'card_arch', 'body_soldier_lead', 'body_officer_bag', 'king_judge_notebook', 'king_judge_paper', 'queen_inkstand', 'pack_flying', 'crowd_court', 'garden_wall', 'garden_hedge', 'croquet_ground', 'garden_lawn', 'flower_bed', 'flower_pot', 'paint_pot', 'king_clubs', 'king_diamonds', 'king_spades', 'queen_clubs', 'queen_diamonds', 'queen_spades', 'knave_spades'].map((n) => `ch8/${n}`), ...['hatter_sit_stare', 'hatter_sit_riddle', 'hatter_sit_watch', 'hatter_cup', 'hatter_pale', 'hatter_bite', 'hatter_tremble', 'hatter_knee', 'hatter_run', 'marchhare_sit', 'marchhare_dip', 'dormouse_sleep', 'dormouse_talk'].map((n) => `ch7/${n}`), 'vignettes/axis', 'vignettes/pigs', 'ch6/cheshire_hearth', ...['fish_footman', 'frog_footman', 'frog_footman_sit', 'footmen_bow', 'cook_stir', 'cook_throw', 'baby_starfish', 'baby_snout', 'pig_trot', 'kitchen_back', 'kitchen_side', 'little_house', 'march_hare_house', ...['irons', 'saucepan', 'saucepan2', 'pan', 'plate', 'plate2', 'plate3', 'dish'].map((n) => `thrown_${n}`)].map((n) => `ch6/${n}`),
  ...['duchess_nurse', 'duchess_toss', 'duchess_fling', 'duchess9_arm', 'duchess9_tremble', 'duchess9_run'].map((n) => `ch6/${n}`),
  ...['sit', 'sob', 'count', 'hide', 'dance', 'sing', 'yawn'].map((n) => `ch9/mockturtle_${n}`),
  ...['sit', 'asleep', 'walk', 'paws', 'hide', 'dance', 'bound'].map((n) => `ch9/gryphon_${n}`), 'vignettes/dinah', 'vignettes/bats', 'vignettes/stairs', 'vignettes/globe', 'vignettes/histories', 'vignettes/poker', 'vignettes/knife', 'vignettes/poison', 'vignettes/candle', 'vignettes/telescope', 'vignettes/croquet', // tools/walls.py // tools/ch1_art.py
  // Chapter II (tools/ch2_art.py): the Rabbit, the Mouse, the birds, props, the pool and the thoughts.
  ...['rabbit2_trot', 'rabbit2_start', 'rabbit2_away', 'mouse_swim', 'mouse_leap', 'mouse_bristle', 'mouse_away',
    'duck_swim', 'duck_stand', 'dodo_swim', 'dodo_stand', 'lory_swim', 'lory_stand', 'eaglet_swim', 'eaglet_stand',
    'kid_gloves', 'splash', 'pool_water', 'pool_rim'].map((n) => `ch2/${n}`),
  ...['foot_parcel', 'ada_mabel', 'crocodile', 'seaside', 'walrus', 'dinah_fire', 'terrier'].map((n) => `vignettes/${n}`)];

export const BOOK = {
  chapters: CHAPTERS,
  storage: {
    place: 'alice.place.v2', speed: 'alice.speed.v1',
    upgrade() { // the first saves held Chapter I only
      const v1 = JSON.parse(localStorage.getItem('alice.place.v1'));
      return v1 ? { chapter: 1, times: { 1: v1.t } } : null;
    },
  },
  lead: 'alice',
  async loadArt(loadTexture) {
    const [shaftMeta, hallMeta, poseMeta, rabbitArt, ...aiArt] = await Promise.all([
      fetch('art/ai/shaft_strip.json').then((r) => r.json()),
      fetch('art/ai/hall/hall.json').then((r) => r.json()),
      fetch('art/ai/poses/poses.json').then((r) => r.json()),
      loadTexture('art/rabbit_w01-1_white.png'), // white, not paper (tools/white_rabbit.py)
      ...AI_ART.map((n) => loadTexture(`art/ai/${n}.webp`)),
    ]);
    // Whole-figure poses (tools/compose_poses.py), sized and lined up to match the standing Alice.
    const ALICE_H = 1.25;
    const posed = Object.fromEntries(await Promise.all(Object.entries(poseMeta.poses).filter(([name]) => !name.startsWith('run_')).map(async ([name, m]) => {
      const art = await loadTexture(`art/ai/poses/${name}.webp`);
      const k = ALICE_H / poseMeta.base.h; // metres per pixel
      return [name, { ...art, facesLeft: true, height: m.h * k, offsetX: (m.w / 2 - m.bodyX) * k }];
    })));
    const ai = Object.fromEntries(AI_ART.map((n, i) => [n, aiArt[i]]));
    // Tenniel's own plates shown as pictures (Chapter V's Father William), paper-tinted.
    for (const n of ['father_william_1', 'father_william_2', 'father_william_3', 'father_william_4']) ai[`tenniel/${n}`] = await loadTexture(`art/tenniel/${n}.webp`);
    return { ai, extras: { shaftMeta, hallMeta, posed, rabbitArt } };
  },
  cast({ ai, art, Puppet, extras: { posed, rabbitArt } }) {
    const ALICE_H = 1.25;
    const RB = 0.9 / 1465;
    const cast = {
      rabbit: new Puppet({
        watch: { ...rabbitArt, facesLeft: true },
        // Chapter I: seen from behind, running off down the passage (tools/ch1_art.py).
        runAway: { ...ai['ch1/rabbit_run_away'], facesLeft: true, height: 0.95 },
        // Chapter I's Rabbit (the owner's sheet, tools/ch1_art.py): with his watch; trotting.
        watch1: { ...ai['ch1/rabbit_watch'], facesLeft: true, height: 0.9 },
        trot1: { ...ai['ch1/rabbit_trot'], facesLeft: true, height: 0.9 },
        // Chapter I, drawn from the same sheet (2026-10-14): running; leaping head-first into the hole; glancing back.
        run: { ...ai['ch1/rabbit_run_side'], facesLeft: true, height: 1428 * RB },
        hop: { ...ai['ch1/rabbit_hop'], facesLeft: false, height: 559 * RB },
        idleB: { ...ai['ch1/rabbit_idle_b'], facesLeft: false, height: 1382 * RB },
        // Every later pose is drawn from the Chapter I sheet, all at one scale (RB: metres per source pixel, the
        // standing figures matching the sheet's 0.9 m) (owner, 2026-10-14: that model is the standard
        // in every scene he is in; tools/rabbit_art.py).
        // Chapter II: "splendidly dressed", gloves and fan in his paws; starting; scurrying away.
        trot: { ...ai['ch2/rabbit2_trot'], facesLeft: true, height: 1215 * RB },
        start: { ...ai['ch2/rabbit2_start'], facesLeft: true, height: 1302 * RB },
        away: { ...ai['ch2/rabbit2_away'], facesLeft: true, height: 1329 * RB },
        // Chapter IV: looking anxiously about; pointing ("run home this moment"); into the cucumber-frame; giving orders.
        search: { ...ai['ch4/rabbit4_search'], facesLeft: true, height: 1158 * RB },
        point: { ...ai['ch4/rabbit4_point'], facesLeft: true, height: 1418 * RB },
        frame: { ...ai['ch4/rabbit4_frame'], facesLeft: true, height: 836 * RB },
        order: { ...ai['ch4/rabbit4_order'], facesLeft: true, height: 1465 * RB },
        // Chapter VIII: walking beside her, peeping into her face; on tiptoe to whisper.
        peep: { ...ai['ch8/rabbit8_peep'], facesLeft: true, height: 1309 * RB },
        tiptoe: { ...ai['ch8/rabbit8_tiptoe'], facesLeft: false, height: 1393 * RB },
        // Chapters XI and XII: the herald, with his scroll; the trumpet; reading the accusation; the paper, in spectacles.
        herald: { ...ai['ch11/rabbit_herald'], facesLeft: true, height: 1431 * RB },
        trumpet: { ...ai['ch11/rabbit_trumpet'], facesLeft: true, height: 1316 * RB },
        scroll: { ...ai['ch11/rabbit_scroll'], facesLeft: true, height: 1348 * RB },
        specs: { ...ai['ch11/rabbit_specs'], facesLeft: true, height: 1434 * RB },
      }, 0.85),
      alice: new Puppet({
        sit: { ...ai.alice_sit, facesLeft: false, height: 0.85, hand: [0.65, 0.7] },
        stand: { ...ai.alice_stand, facesLeft: true, hand: [0.55, 0.57] },
        ...posed,
        walk_a: { ...posed.walk_a, hand: [0.03, 0.48] },
        walk_b: { ...posed.walk_b, hand: [0.09, 0.45] },
        jump: { ...posed.jump, hand: [0.03, 0.37] },
        fall: { ...posed.fall, hand: [0.06, 0.06] },        // the marmalade jar, in her raised left hand (Chapter I)
        hold: { ...posed.hold, hand: [0.05, 0.17] },        // the key or bottle held up (Chapter I)
        comfits: { ...posed.comfits, hand: [0.11, 0.45] },
        bow: { ...posed.bow, hand: [0.38, 0.51] },          // takes the thimble (Chapter III)
        lying: { ...ai['ch4/alice_lying'], facesLeft: false, height: 1.0 }, // too big for the Rabbit's room, after Tenniel's plate 4.1 (Chapter IV)
      }, ALICE_H),
      // Alice's sister: reading; Alice's head in her lap, brushing away the leaves; dreaming, her head on her hand (2026-10-14).
      sister: new Puppet({ read: { ...ai.sister_read, facesLeft: false, height: 1.05 }, lap: art('ch12/sister_lap', 1.05, false), dream: art('ch12/sister_dream', 1.05, false) }, 1.05),
      // Chapter II placeholders (props2.js), sized for a tiny Alice: swimmers show only what
      // is above the water.
      // The Mouse and the birds (AI drawings, tools/ch2_art.py; drawn facing right). The Mouse
      // standing and walking on the shore (Chapter III) are still placeholders.
      mouse: new Puppet({ swim: art('ch2/mouse_swim', 0.05, false), leap: art('ch2/mouse_leap', 0.13, false),
        bristle: art('ch2/mouse_bristle', 0.07), away: art('ch2/mouse_away', 0.06, false),
        // Dry, on the bank (Chapter III; AI, tools/creatures_art.py, 2026-10-14, after plate 3.1): sitting up to lecture,
        // cross, sighing over his long tale, angry, walking off on all fours (drawn facing right).
        ...Object.fromEntries([['up', 'lecture', 1044], ['cross', 'cross', 841], ['sigh', 'sigh', 1089], ['angry', 'angry', 1241]].map(([p, n, px]) => [p, art(`ch3/mouse3_${n}`, 0.09 * px / 1044)])),
        walk: art('ch3/mouse3_away', 0.09 * 690 / 1044, false) }, 0.05),
      duck: new Puppet({ swim: art('ch2/duck_swim', 0.06, false), up: art('ch2/duck_stand', 0.11, false), ask: art('ch3/duck3_ask', 0.11 * 1231 / 1170, false) }, 0.07),
      // Chapter III poses (AI, tools/creatures_art.py, 2026-10-14), scaled to the Chapter II standing drawings.
      dodo: new Puppet({ swim: art('ch2/dodo_swim', 0.09, false), up: art('ch2/dodo_stand', 0.2, false), rise: art('ch3/dodo3_rise', 0.2 * 1358 / 1324, false),
        think: art('ch3/dodo3_think', 0.2 * 1174 / 1324, false), point: art('ch3/dodo3_point', 0.2 * 1323 / 1324, false), thimble: art('ch3/dodo3_thimble', 0.2 * 1304 / 1324) }, 0.11),
      lory: new Puppet({ swim: art('ch2/lory_swim', 0.06, false), up: art('ch2/lory_stand', 0.1, false), sulk: art('ch3/lory3_sulk', 0.1 * 1233 / 1132, false) }, 0.065), // sulk: drawn turned away
      eaglet: new Puppet({ swim: art('ch2/eaglet_swim', 0.06, false), up: art('ch2/eaglet_stand', 0.11, false), smile: art('ch3/eaglet3_smile', 0.11 * 1358 / 1416, false) }, 0.065),
      // Chapter III placeholders (props3.js).
      // Chapter III's creatures (AI, tools/creatures_art.py, 2026-10-14): the Owl after Tenniel's plate 3.1; the
      // Magpie wrapping herself up "as if in a shawl"; the Canary calling to her children; the old Crab and her daughter.
      owl: new Puppet({ up: art('ch3/owl3', 0.1) }, 0.1),
      magpie: new Puppet({ up: art('ch3/magpie3', 0.1), shawl: art('ch3/magpie3_shawl', 0.1 * 1188 / 1154) }, 0.1),
      canary: new Puppet({ up: art('ch3/canary3', 0.06), chicks: art('ch3/canary3_chicks', 0.06 * 1143 / 1131) }, 0.06),
      crab: new Puppet({ stand: art('ch3/crab', 0.035) }, 0.035),
      crabling: new Puppet({ stand: art('ch3/crabling', 0.022) }, 0.022),
      // Chapter IV (AI drawings, tools/ch4_art.py, 2026-10-14): Bill the Lizard after Tenniel's plate 4.3,
      // the two guinea-pigs and Pat (a guinea-pig gardener in a smock and cap; the book doesn't say).
      bill: new Puppet({ stand: art('ch4/bill_stand', 0.32), ladder: art('ch4/bill_ladder', 0.34, false), climb: art('ch4/bill_climb', 0.42),
        fly: art('ch4/bill_rocket', 0.45), limp: art('ch4/bill_limp', 0.42) }, 0.32),
      pat: new Puppet({ spade: art('ch4/pat', 0.4), cap: art('ch4/pat_cap', 0.39) }, 0.4),
      ...Object.fromEntries(['pig1', 'pig2'].map((n) => [n, new Puppet({ up: art('ch4/guinea_stand', 0.32), hold: art('ch4/guinea_hold', 0.33, false),
        bottle: art('ch4/guinea_bottle', 0.33) }, 0.32)])),
      // Chapter V placeholders.
      // The AI drawing (tools/ch5_art.py): blue, with his hookah, on the scene's own mushroom.
      // The Caterpillar (AI, tools/ch5_art.py): smoking (the drawing has the hookah); his other poses are drawn
      // without it (2026-10-14) and the scene stands the hookah beside him: speaking, rearing up, yawning, crawling away.
      caterpillar: new Puppet({ sit: art('ch5/caterpillar_sit', 0.1), speak: art('ch5/caterpillar_speak', 0.1), rear: art('ch5/caterpillar_rear', 0.1 * 1424 / 1375),
        yawn: art('ch5/caterpillar_yawn', 0.1 * 1318 / 1375), crawl: art('ch5/caterpillar_crawl', 0.1 * 608 / 1375, false) }, 0.1),
      // The Pigeon (AI, tools/creatures_art.py, 2026-10-14; Tenniel never drew her): flying at Alice's face, screaming on a twig, back on her nest.
      pigeon: new Puppet({ fly: art('ch5/pigeon_attack', 0.24), perch: art('ch5/pigeon_scream', 0.2), nest: art('ch5/pigeon_nest', 0.3, false) }, 0.2),
      // Chapter VI placeholders.
      // Chapter VI's people: AI drawings, scaled alike by their heights in source pixels (tools/ch6_art.py prints them).
      fish: new Puppet({ stand: art('ch6/fish_footman', 0.3) }, 0.3),
      frog: new Puppet({ stand: art('ch6/frog_footman', 0.3 * 1439 / 1490, false), sit: art('ch6/frog_footman_sit', 0.3 * 1167 / 1490, false) }, 0.3),
      // The Duchess and the Mock Turtle: AI drawings all at one scale per character (tools/ch9_art.py prints
      // each drawing's height in source pixels, `px`, and the Turtle's `drop`, his tail below his hooves).
      duchess: new Puppet(Object.fromEntries([['sit', 'duchess_nurse', 1467], ['toss', 'duchess_toss', 1472], ['fling', 'duchess_fling', 1376],
        ['stand', 'duchess9_arm', 1494], ['tremble', 'duchess9_tremble', 1495], ['run', 'duchess9_run', 1408, false]]
        .map(([pose, name, px, left = true]) => [pose, art(`ch6/${name}`, px * 0.34 / 1467, left)])), 0.34),
      cook: new Puppet({ stir: art('ch6/cook_stir', 0.3), throw: art('ch6/cook_throw', 0.3 * 1390 / 1451, false), pepper: art('ch11/cook_pepper', 0.3 * 1461 / 1451) }, 0.3),
      pig: new Puppet({ trot: art('ch6/pig_trot', 0.08, false) }, 0.08),
      // Chapter VII placeholders (seated, waist up).
      // The Hatter and the March Hare (AI drawings, tools/ch7_art.py): sitting at the tea-table (VII),
      // standing as a witness (XI); standing poses scaled by their heights in source pixels.
      hatter: new Puppet({ stare: art('ch7/hatter_sit_stare', 0.42), riddle: art('ch7/hatter_sit_riddle', 0.42), watch: art('ch7/hatter_sit_watch', 0.42),
        ...Object.fromEntries([['cup', 1481], ['pale', 1482], ['bite', 1477], ['tremble', 1481], ['knee', 1251], ['run', 1394, false]]
          .map(([p, px, left = true]) => [p, art(`ch7/hatter_${p}`, 0.36 * px / 1481, left)])),
        // At the tea-table (2026-10-14): stepping along one place; pushing the Dormouse into the teapot (waist up).
        move: art('ch7/hatter_move', 0.41), push: art('ch7/hatter_push', 0.2) }, 0.42),
      hare: new Puppet({ sit: art('ch7/marchhare_sit', 0.4, false), dip: art('ch7/marchhare_dip', 0.4, false), push: art('ch7/march_hare_push', 0.29, false),
        arm: art('ch11/hare_dormouse_arm', 0.45) }, 0.4), // arm: arm in arm with the Dormouse (Chapter XI)
      // Chapter VIII: the gardeners Two, Five and Seven of Spades, fully drawn (tools/ch8_art.py; owner,
      // 2026-10-14: the card people with parts in the story are drawn as characters). px: heights in source pixels.
      ...Object.fromEntries(Object.entries({
        two: { stand: 1386, paint: 1362, bow: 1371, run: 1265, kneel: 1226 },
        five: { stand: 1479, paint: 1465, bow: 1430, run: 1383 },
        seven: { stand: 1418, paint: 1409, bow: 1382, run: 1300 },
      }).map(([name, px]) => [name, new Puppet(Object.fromEntries(Object.entries(px)
        .map(([p, h]) => [p, art(`ch8/${name}_${p}`, 0.3 * h / px.stand)])), 0.3)])),
      // The court cards (AI drawings with their hearts red, tools/ch8_art.py; px = height in source pixels).
      queen: new Puppet(Object.fromEntries([['stand', 1509], ['point', 1460], ['flush', 1507], ['stamp', 1494], ['folded', 1509], ['specs', 1508], ['purple', 1509], ['inkstand', 1470]]
        .map(([p, px]) => [p, art(`ch8/queen_${p}`, 0.34 * px / 1509)])), 0.34),
      // The King: as judge in Chapters XI and XII, his crown over his wig; spectacles; arms folded; pale.
      king: new Puppet(Object.fromEntries([['stand', 'king_stand', 1467], ['judge', 'king_judge', 1475], ['judgeSpecs', 'king_judge_specs', 1485], ['judgeNote', 'king_judge_notebook', 1452], ['judgePaper', 'king_judge_paper', 1468],
        ['judgeFold', 'king_judge_fold', 1473], ['judgePoint', 'king_judge_point', 1471], ['judgePale', 'king_judge_pale', 1484]]
        .map(([p, n, px]) => [p, art(`ch8/${n}`, 0.34 * px / 1475)])), 0.34),
      knave: new Puppet(Object.fromEntries([['carry', 1432], ['stand', 1429], ['chains', 1429]].map(([p, px]) => [p, art(`ch8/knave_${p}`, 0.31 * px / 1430)])), 0.31),
      executioner: new Puppet({ axe: art('ch8/executioner', 0.33) }, 0.33),
      // Chapter IX placeholders (props9.js).
      // The Gryphon (tools/ch9_art.py): the upright drawings scaled by their px; the wide ones by eye.
      gryphon: new Puppet(Object.fromEntries([['sit', 0.38, false], ['paws', 0.38 * 1495 / 1519, false], ['hide', 0.38 * 1507 / 1519, false],
        ['dance', 0.38 * 1500 / 1519], ['asleep', 0.25], ['walk', 0.3], ['bound', 0.3],
        ['wake', 0.38 * 1502 / 1519], ['chuckle', 0.38 * 1496 / 1519], ['thump', 0.38 * 1513 / 1519, false], ['run', 0.38 * 1171 / 1519]] // wake..run: 2026-10-14
        .map(([pose, h, left = true]) => [pose, art(`ch9/gryphon_${pose}`, h, left)])), 0.38),
      mockTurtle: new Puppet(Object.fromEntries([['sit', 1399, 0.231], ['sob', 1395, 0.239], ['count', 1399, 0.232], ['hide', 1442, 0.223],
        ['walk', 1356, 0.069, 'dance'], ['sing', 1370, 0.036], ['yawn', 1409, 0.227]]
        .map(([pose, px, drop, name = pose]) => [pose, { ...art(`ch9/mockturtle_${name}`, px * 0.4525 / 1399), drop }])), 0.35),
      puppy: new Puppet({ stand: art('ch4/puppy_look', 0.75), jump: art('ch4/puppy_jump', 0.62), tumble: art('ch4/puppy_tumble', 0.75), sit: art('ch4/puppy_sit', 0.8) }, 0.75), // after Tenniel's plate 4.4
    };
    return cast;
  },
};
