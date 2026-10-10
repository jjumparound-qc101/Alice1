# Staging for Watch mode: everything is a pure function of narration time t.
# Port of src/timeline.js; cue times come from words in the aligned text.
class_name Timeline
extends RefCounted

var T := {}
var flat_words: Array = []
var SIT := Vector2(-2.25, -2.05)
var MID := Vector2(0.35, -1.75)
var NEAR_HEDGE := Vector2(1.6, -3.7)
var HOLE: Vector2
var keys: Array = []


static func smooth(x: float) -> float:
	x = clampf(x, 0.0, 1.0)
	return x * x * (3.0 - 2.0 * x)


static func _norm(w: String) -> String:
	var out := ""
	for c in w:
		if c == "-" or c.to_lower() != c.to_upper():
			out += c.to_lower()
	return out


# Time of the n-th (1-based) word equal to `token`.
func at(token: String, n := 1) -> float:
	var hits := 0
	for w in flat_words:
		if _norm(w["t"]) == token.to_lower():
			hits += 1
			if hits == n:
				return w["s"]
	push_error("cue word not found: %s #%d" % [token, n])
	return 0.0


func _init(words: Dictionary, hole_pos: Vector3) -> void:
	for para in words["paragraphs"]:
		flat_words.append_array(para)
	HOLE = Vector2(hole_pos.x, hole_pos.z + 0.08)
	T = {
		"alice": at("alice"), "book": at("book"), "so": at("so"), "rabbit": at("rabbit"),
		"ran_close": at("ran", 1), "watch": at("watch"), "hurried": at("hurried"),
		"started": at("started"), "ran_across": at("ran", 2), "pop": at("pop"),
		"down_went": at("down", 2), "end": flat_words[-1]["e"],
	}
	keys = [
		[0.0, 0.0, Vector3(0, 2.1, 9.2), Vector3(0, 1.4, -3)],
		[T.alice, 6.0, Vector3(-1.5, 1.15, 0.3), Vector3(-2.75, 0.45, -2.35)],
		[T.book - 1, 3.0, Vector3(-3.05, 1.0, -0.8), Vector3(-3.3, 0.45, -2.6)],
		[T.so, 8.0, Vector3(-1.1, 1.35, 1.0), Vector3(-2.5, 0.5, -2.4)],
		[T.rabbit - 2.5, 2.5, Vector3(-0.6, 1.25, 1.2), Vector3(-2.6, 0.4, -2.0)],
		[T.ran_close + 0.4, 2.5, Vector3(-0.7, 1.15, 0.6), Vector3(-0.4, 0.35, -2.0)],
		[T.watch - 0.5, 2.5, Vector3(0.1, 0.85, -0.45), Vector3(0.35, 0.45, -1.75)],
		[T.hurried, 3.0, Vector3(-0.7, 1.45, 1.8), Vector3(0.2, 0.45, -3.0)],
		[T.ran_across, 4.0, Vector3(0.0, 1.3, 0.6), Vector3(1.4, 0.4, -3.6)],
		[T.pop - 1.5, 2.0, Vector3(1.15, 1.05, -1.5), Vector3(HOLE.x, 0.25, HOLE.y)],
	]


func _path(t: float, t0: float, t1: float, a: Vector2, b: Vector2) -> Dictionary:
	var p := a.lerp(b, smooth((t - t0) / (t1 - t0)))
	return {"x": p.x, "z": p.y, "moving": t > t0 and t < t1, "dir": signf(b.x - a.x) if b.x != a.x else -1.0}


func _still(p: Vector2, dir: float) -> Dictionary:
	return {"x": p.x, "z": p.y, "moving": false, "dir": dir}


func rabbit(t: float) -> Dictionary:
	var enter: float = T.rabbit - 0.4
	if t < enter:
		return {"visible": false, "pose": "watch", "x": -9.0, "z": -1.6}
	var s: Dictionary
	if t < T.ran_close + 1.4:
		s = _path(t, enter, T.ran_close + 1.4, Vector2(-8, -1.5), MID)
	elif t < T.hurried:
		s = _still(MID, -1)
	elif t < T.hurried + 5:
		s = _path(t, T.hurried, T.hurried + 5, MID, NEAR_HEDGE)
	elif t < T.pop - 1.4:
		s = _still(NEAR_HEDGE, -1)
	else:
		s = _path(t, T.pop - 1.4, T.pop, NEAR_HEDGE, HOLE)
	var sink := smooth((t - T.pop) / 0.6)
	s.merge({"pose": "watch", "phase": t * 2.6, "sink": sink, "visible": sink < 1.0}, true)
	return s


func alice(t: float) -> Dictionary:
	if t < T.started:
		return {"pose": "sit", "x": SIT.x, "z": SIT.y, "dir": 1.0}
	var stand := SIT + Vector2(0.3, 0.1)
	var waiting := Vector2(NEAR_HEDGE.x - 0.4, NEAR_HEDGE.y + 0.2)
	var s: Dictionary
	if t < T.ran_across:
		s = _still(stand, 1)
	elif t < T.ran_across + 4.5:
		s = _path(t, T.ran_across, T.ran_across + 4.5, stand, waiting)
	elif t < T.down_went:
		s = _still(waiting, 1)
	else:
		s = _path(t, T.down_went, T.down_went + 0.9, waiting, HOLE)
	var sink := smooth((t - T.down_went - 0.9) / 0.7)
	s.merge({"pose": "stand", "phase": t * 2.2, "sink": sink, "visible": sink < 1.0}, true)
	return s


# Camera: from the previous pose, ease to each key over its duration.
func camera_at(t: float) -> Array:
	var pos: Vector3 = keys[0][2]
	var look: Vector3 = keys[0][3]
	for i in range(1, keys.size()):
		var k: Array = keys[i]
		if t < k[0]:
			break
		var e := smooth((t - k[0]) / k[1])
		pos = pos.lerp(k[2], e)
		look = look.lerp(k[3], e)
	return [pos, look]


func fade(t: float) -> float:
	return smooth((t - T.end + 0.1) / 0.8)
