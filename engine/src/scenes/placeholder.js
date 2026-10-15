// A chapter whose scenes aren't built yet: its title page, engraved on paper, beside the book's own
// illustration for it if there is one (`ch.plate`, a name in the book's shared art), with a slow drift of
// the camera, so the chapter can still be read and heard in full.
// note: the two small lines under the title, e.g. ['This stave’s scenes are still being drawn.',
// 'Beside it, John Leech’s own picture (1843).'].
// theatre: the name of the book's toy-theatre front in the shared art; the chapter then opens in the
// theatre (src/theatre.js): a few seconds in a seat in the stalls, then into the stage as the reading begins.
import { paperFlat } from '../stage.js';
import { theatre as buildTheatre, openingKeys } from '../theatre.js';
import { cameraTrack } from '../track.js';
import { canvas, texture, hatch, grain, INK, PAPER } from '../ink.js';

function titlePage(ch, note) {
  const W = 1000, H = 1250;
  const { c, g } = canvas(W, H);
  g.fillStyle = PAPER; g.fillRect(0, 0, W, H);
  const frame = new Path2D(); frame.rect(50, 50, W - 100, H - 100);
  const band = new Path2D(); band.rect(50, 50, W - 100, H - 100); band.rect(76, 76, W - 152, H - 152);
  g.save(); g.clip(band, 'evenodd'); hatch(g, frame, { angle: 0.8, gap: 5, seed: 7, alpha: 0.8 }); g.restore();
  g.strokeStyle = INK; g.lineWidth = 3; g.stroke(frame); g.strokeRect(76, 76, W - 152, H - 152);
  g.fillStyle = INK; g.textAlign = 'center';
  g.font = 'italic 64px "IM Fell English", Georgia, serif';
  g.fillText(`${ch.label} ${ch.roman}`, W / 2, 420);
  // Long titles ("The Second of the Three Spirits") go on two lines.
  g.font = '86px "IM Fell English", Georgia, serif';
  const words = ch.title.split(' ');
  const half = Math.ceil(words.length / 2);
  const lines = words.length > 3 ? [words.slice(0, half).join(' '), words.slice(half).join(' ')] : [ch.title];
  lines.forEach((l, i) => g.fillText(l, W / 2, 560 + i * 100, W - 220));
  const y = 560 + lines.length * 100 - 20;
  g.lineWidth = 2;
  g.beginPath(); g.moveTo(330, y); g.lineTo(670, y); g.stroke();
  g.font = 'italic 34px "IM Fell English", Georgia, serif';
  note.forEach((l, i) => g.fillText(l, W / 2, y + 80 + i * 48, W - 220));
  grain(g, 0.04, 3);
  return c;
}

export function placeholder(ch, { note = [`This ${ch.label.toLowerCase()}’s scenes are still being drawn.`], theatre = null } = {}) {
  return {
    id: 'title',
    title: ch.title,
    start: () => 0,
    build({ group, cue, ai }) {
      const page = paperFlat(texture(titlePage(ch, note)), 2.4, 3, { anchor: 'center' });
      const plate = ch.plate ? ai[ch.plate] : null;
      // The title on the left and the plate on the right, raised so the text strip below leaves them clear.
      page.position.set(plate ? -1.3 : 0, 1.55, -3);
      group.add(page);
      if (plate) {
        const h = 3, flat = paperFlat(plate.tex, h * plate.aspect, h, { anchor: 'center' });
        flat.position.set(1.3, 1.55, -3);
        group.add(flat);
      }
      const end = cue.end;
      // A slow drift across the two cards for the whole chapter.
      const drift = (t) => {
        const k = Math.min(1, t / Math.max(1, end));
        return { pos: [Math.sin(k * Math.PI * 2) * 0.4, 1.5, 3.6 - k * 0.5], look: [0, 1.1, -3] };
      };
      let camera = drift;
      if (theatre && ai[theatre]) {
        buildTheatre(group, ai[theatre]);
        const DUR = 6.5, into = cue.start + DUR, opening = cameraTrack(openingKeys(cue.start, drift(into), { dur: DUR }));
        camera = (t) => (t < into ? opening(t) : drift(t));
      }
      return {
        T: {}, bg: PAPER, fog: [20, 60], bounds: null, hotspots: [],
        camera,
        actors: () => ({}),
      };
    },
  };
}
