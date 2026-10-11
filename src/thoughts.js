// Thought vignettes: oval pictures of what Alice is imagining, shown beside her
// while the narration speaks of it. Each pops open and closes like a paper card.
import { paperFlat } from './stage.js';
import { texture } from './ink.js';
import { smooth } from './track.js';

// list: [{ t0, t1, art (a canvas from props.js, or an AI drawing's texture) }]. Returns update(t, pos, size).
export function thoughts(group, list) {
  const cards = list.map(({ t0, t1, art }) => {
    const card = paperFlat(art.isTexture ? art : texture(art), 1.0, 0.7, { anchor: 'center' });
    card.visible = false;
    group.add(card);
    return { t0, t1, card };
  });
  // pos: { x, y, z } where the card's centre goes; size: its width in metres.
  return (t, pos, size = 1) => {
    for (const { t0, t1, card } of cards) {
      const open = smooth((t - t0) / 0.35) * (1 - smooth((t - t1 + 0.35) / 0.35));
      card.visible = open > 0.01;
      if (!card.visible) continue;
      card.position.set(pos.x, pos.y, pos.z);
      card.scale.setScalar(size * open);
    }
  };
}
