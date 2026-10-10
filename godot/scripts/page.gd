# The book page: the passage being read, with the spoken word underlined.
# Clicking a word seeks there. Port of src/narration.js.
# Layouts: "bottom"/"top" strips show one phrase; "side" shows the paragraph so far.
class_name Page
extends RefCounted

const FAINT := "#17140f6b"
const INK := "#17140f"

var label: RichTextLabel
var chunks: Array = []  # [{ "words": [...], "p": int, "first": bool, "start": int }]
var all_words: Array = []
var layout := "bottom"
var _cur := Vector2i(-1, -2)


static func _ends(w: String, chars: String) -> bool:
	var s := w.rstrip("”’)")
	return s.length() > 0 and chars.contains(s[s.length() - 1])


# Same chunking as the web build: break at sentence ends, and at phrase ends once long enough.
static func _chunk(words: Array, soft := 22, hard := 38) -> Array:
	var out: Array = []
	var cur: Array = []
	for w in words:
		cur.append(w)
		var n := cur.size()
		if _ends(w["t"], ".!?") or (n >= soft and _ends(w["t"], ",;:—")) or n >= hard:
			out.append(cur)
			cur = []
	if not cur.is_empty():
		out.append(cur)
	return out


func _init(rtl: RichTextLabel, words: Dictionary) -> void:
	label = rtl
	label.bbcode_enabled = true
	label.meta_underlined = false
	var paras: Array = words["paragraphs"]
	for p in paras.size():
		var cs := _chunk(paras[p])
		for k in cs.size():
			chunks.append({"words": cs[k], "p": p, "first": k == 0, "start": all_words.size()})
			all_words.append_array(cs[k])


func time_of(meta) -> float:
	return all_words[int(meta)]["s"]


func set_layout(l: String) -> void:
	layout = l
	_cur = Vector2i(-1, -2)


func update(t: float) -> void:
	var c := 0
	for k in chunks.size():
		if chunks[k]["words"][0]["s"] <= t + 0.05:
			c = k
	var w := -1
	var cw: Array = chunks[c]["words"]
	for i in cw.size():
		if cw[i]["s"] <= t:
			w = i
	if Vector2i(c, w) == _cur:
		return
	_cur = Vector2i(c, w)
	var shown: Array = [c]
	if layout == "side":
		shown = []
		for k in range(c + 1):
			if chunks[k]["p"] == chunks[c]["p"]:
				shown.append(k)
	var bb := ""
	for k in shown:
		var ch: Dictionary = chunks[k]
		if ch["first"]:
			bb += "      "
		for i in ch["words"].size():
			var said: bool = k < c or i < w
			var now: bool = k == c and i == w
			var txt: String = ch["words"][i]["t"].replace("[", "[lb]")
			var body := "[u]%s[/u]" % txt if now else txt
			bb += "[url=%d][color=%s]%s[/color][/url] " % [ch["start"] + i, INK if (said or now) else FAINT, body]
	label.text = bb
