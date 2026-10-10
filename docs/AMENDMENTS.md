# Amendments

Changes to the original spec, newest first. Each entry has a date, a status (Proposed, Confirmed or Rejected), the change, and the reason.

## 2026-10-09: Art direction is 2.5D "pop-up book / toy theater"
Status: Proposed. To be confirmed in Gate A.

The art direction changes from fully explorable 3D to 2.5D "pop-up book / toy theater":
- Characters and scenery are hand-drawn, Tenniel-based 2D art in layered 3D sets, with a moving camera.
- Explore Mode keeps free movement within each diorama, with a constrained camera arc.

Reason: it's more faithful to the original illustrations, costs less and carries less risk, fits the Claude Code workflow better, and gives Library of Living Books a visual identity it can reuse.

See [ART_DIRECTION_ANALYSIS.md](ART_DIRECTION_ANALYSIS.md).

## 2026-10-09: A custom three.js engine is allowed as a Gate A candidate
Status: Proposed. To be confirmed in Gate A.

This amends the spec's caution against defaulting to a custom engine. A three.js-based engine may be chosen if Gate A shows it's the right choice. Gate A must still compare it honestly against Godot, covering the staging timeline, puppet animation, saves, UI, and Steam packaging.
