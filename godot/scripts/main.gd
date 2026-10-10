# Riverbank slice, Godot comparison build. Port of src/main.js and src/explore.js.
# Run with:  godot --path godot
# Screenshots: godot --path godot -- --smoke=/abs/out/dir
extends Node3D

const EYE := 1.35
const YAW_LIMIT := deg_to_rad(45.0)
const PITCH_LIMIT := deg_to_rad(14.0)
const SPEED := 1.6
const LAYOUTS := ["bottom", "top", "side"]

var cam := Camera3D.new()
var player := AudioStreamPlayer.new()
var tl: Timeline
var page: Page
var stage: Dictionary
var rabbit: Puppet
var alice: Puppet
var sister: Puppet

var mode := "watch"
var layout := "bottom"
var yaw := 0.0
var pitch := 0.0
var t_override := -1.0  # smoke mode drives time directly
var font_rm: FontFile
var font_it: FontFile

# UI nodes
var ui := Control.new()
var intro: Control
var page_panel: PanelContainer
var page_label: RichTextLabel
var play_btn: Button
var mode_btn: Button
var layout_btn: Button
var hint: Label
var prompt: Label
var card: PanelContainer
var card_title: Label
var card_text: Label
var fade_rect: ColorRect
var end_card: Control
var shown_hotspot = null


func _ready() -> void:
	font_rm = load("res://fonts/IMFeENrm28P.ttf")
	font_it = load("res://fonts/IMFeENit28P.ttf")
	stage = Stage.build(self)
	cam.fov = 45.0  # vertical, like three.js
	cam.near = 0.05
	cam.far = 80.0
	add_child(cam)
	cam.make_current()

	var words: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://data/ch01_slice_words.json"))
	tl = Timeline.new(words, stage["hole_pos"])
	rabbit = Puppet.new({"watch": {"tex": Stage.tex("rabbit_w01-1"), "faces_left": true}}, 0.85)
	alice = Puppet.new({
		"sit": {"tex": Stage.tex("alice_sit"), "faces_left": false, "height": 0.78},
		"stand": {"tex": Stage.tex("alice_stand"), "faces_left": false},
	}, 1.25)
	sister = Puppet.new({"read": {"tex": Stage.tex("sister_read"), "faces_left": false, "height": 0.95}}, 0.95)
	for p in [rabbit, alice, sister]:
		add_child(p)

	player.stream = load("res://audio/ch01_slice.mp3")
	add_child(player)
	player.finished.connect(func(): _paused_at = player.stream.get_length(); _refresh_buttons())
	_build_ui(words)
	_set_layout("bottom")

	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--smoke="):
			_smoke(arg.get_slice("=", 1))


# ---------------------------------------------------------------- time & modes

var _paused_at := 0.0


func now() -> float:
	if t_override >= 0.0:
		return t_override
	if player.stream_paused:
		return player.get_playback_position()
	if player.playing:
		return player.get_playback_position() + AudioServer.get_time_since_last_mix()
	return _paused_at


func seek(t: float) -> void:
	_paused_at = t
	if mode == "watch":
		player.play(t)
		player.stream_paused = false
	else:
		player.play(t)
		player.stream_paused = true


func toggle_play() -> void:
	if player.stream_paused:
		player.stream_paused = false
	elif player.playing:
		player.stream_paused = true
	else:
		player.play(_paused_at if _paused_at < player.stream.get_length() - 0.5 else 0.0)
	_refresh_buttons()


func set_mode(m: String) -> void:
	mode = m
	if m == "explore":
		player.stream_paused = true
		var p := cam.global_position
		cam.global_position = Vector3(clampf(p.x, stage.bounds.min_x, stage.bounds.max_x), EYE, clampf(p.z, stage.bounds.min_z, stage.bounds.max_z))
		var dir := -cam.global_basis.z
		yaw = clampf(atan2(-dir.x, -dir.z), -YAW_LIMIT, YAW_LIMIT)
		pitch = clampf(asin(clampf(dir.y, -1, 1)), -PITCH_LIMIT, PITCH_LIMIT)
	else:
		_close_card()
		if player.stream_paused:
			player.stream_paused = false
	_apply_view_offset()
	_refresh_buttons()


func _set_layout(l: String) -> void:
	layout = l
	page.set_layout(l)
	var vp := get_viewport().get_visible_rect().size
	match l:
		"bottom":
			_place(page_panel, 0.5, 1.0, Vector2(min(736.0, vp.x - 32), 0), Vector2(0, -64), true)
		"top":
			_place(page_panel, 0.5, 0.0, Vector2(min(736.0, vp.x - 32), 0), Vector2(0, 16), false)
		"side":
			page_panel.set_anchors_preset(Control.PRESET_RIGHT_WIDE)
			page_panel.offset_left = -min(384.0, vp.x * 0.34) - 16
			page_panel.offset_right = -16
			page_panel.offset_top = 16
			page_panel.offset_bottom = -64
	page_label.fit_content = l != "side"
	page_label.scroll_active = l == "side"
	layout_btn.text = "Text: %s" % l.capitalize()
	_apply_view_offset()


# Anchor a panel horizontally centred, to the top or bottom edge, sized to its content.
func _place(c: Control, ax: float, ay: float, size: Vector2, margin: Vector2, grow_up: bool) -> void:
	c.anchor_left = ax
	c.anchor_right = ax
	c.anchor_top = ay
	c.anchor_bottom = ay
	c.offset_left = -size.x / 2
	c.offset_right = size.x / 2
	c.offset_top = margin.y
	c.offset_bottom = margin.y
	c.grow_vertical = Control.GROW_DIRECTION_BEGIN if grow_up else Control.GROW_DIRECTION_END


# Keep shots framed away from the text (three.js uses a projection offset; this shifts the camera).
func _apply_view_offset() -> void:
	cam.h_offset = 0.0
	cam.v_offset = 0.0
	if mode != "watch":
		return
	if layout == "top":
		cam.v_offset = 0.32
	elif layout == "side":
		cam.h_offset = 0.45
		cam.v_offset = 0.12


# ---------------------------------------------------------------- per frame

func _process(dt: float) -> void:
	var t := now()
	if mode == "watch":
		var c := tl.camera_at(t)
		cam.global_position = c[0]
		cam.look_at(c[1], Vector3.UP)
	else:
		_explore(dt)
		var h = _facing()
		prompt.visible = h != null and h != shown_hotspot
		if h != null:
			prompt.text = "E: %s" % h["title"]
	rabbit.apply(tl.rabbit(t), cam)
	alice.apply(tl.alice(t), cam)
	sister.apply({"pose": "read", "x": -3.25, "z": -2.6, "dir": 1.0}, cam)
	page.update(t)
	var f := 1.0 if (not player.playing and not player.stream_paused and t >= tl.T.end) else tl.fade(t)
	fade_rect.color.a = f
	end_card.visible = f > 0.99


func _explore(dt: float) -> void:
	var fwd := int(Input.is_physical_key_pressed(KEY_W) or Input.is_physical_key_pressed(KEY_UP)) - int(Input.is_physical_key_pressed(KEY_S) or Input.is_physical_key_pressed(KEY_DOWN))
	var side := int(Input.is_physical_key_pressed(KEY_D)) - int(Input.is_physical_key_pressed(KEY_A))
	var turn := int(Input.is_physical_key_pressed(KEY_LEFT)) - int(Input.is_physical_key_pressed(KEY_RIGHT))
	_look(turn * 1.4 * dt, 0.0)
	_walk(fwd, side, dt)


func _look(d_yaw: float, d_pitch: float) -> void:
	yaw = clampf(yaw + d_yaw, -YAW_LIMIT, YAW_LIMIT)
	pitch = clampf(pitch + d_pitch, -PITCH_LIMIT, PITCH_LIMIT)


func _walk(fwd: float, side: float, dt: float) -> void:
	var b: Dictionary = stage.bounds
	var p := cam.global_position
	p.x += (-sin(yaw) * fwd + cos(yaw) * side) * SPEED * dt
	p.z += (-cos(yaw) * fwd - sin(yaw) * side) * SPEED * dt
	cam.global_position = Vector3(clampf(p.x, b.min_x, b.max_x), EYE, clampf(p.z, b.min_z, b.max_z))
	cam.rotation = Vector3(pitch, yaw, 0)


func _facing():
	var dir := -cam.global_basis.z
	var best = null
	var best_d := INF
	for h in stage.hotspots:
		var to: Vector3 = h["pos"] - cam.global_position
		var d := to.length()
		if d <= 2.6 and dir.angle_to(to) < 0.45 and d < best_d:
			best = h
			best_d = d
	return best


func _unhandled_input(e: InputEvent) -> void:
	if e is InputEventKey and e.pressed and not e.echo:
		match e.physical_keycode:
			KEY_TAB:
				set_mode("explore" if mode == "watch" else "watch")
			KEY_SPACE:
				if mode == "watch" and not intro.visible:
					toggle_play()
			KEY_L:
				_set_layout(LAYOUTS[(LAYOUTS.find(layout) + 1) % LAYOUTS.size()])
			KEY_E:
				if mode == "explore":
					var h = _facing()
					if h != null:
						_open_card(h)
					else:
						_close_card()
			KEY_ESCAPE:
				_close_card()
	elif e is InputEventMouseMotion and mode == "explore" and (e.button_mask & MOUSE_BUTTON_MASK_LEFT):
		_look(e.relative.x * -0.004, e.relative.y * -0.004)


# ---------------------------------------------------------------- UI

func _theme() -> Theme:
	var th := Theme.new()
	th.default_font = font_rm
	th.default_font_size = 19
	var ink := Color("#17140f")
	var paper := Stage.PAPER
	for state in ["normal", "hover", "pressed", "focus"]:
		var sb := StyleBoxFlat.new()
		sb.bg_color = ink if state == "hover" or state == "pressed" else paper
		sb.border_color = ink
		sb.set_border_width_all(2 if state != "focus" else 0)
		if state == "focus":
			sb.draw_center = false
		sb.content_margin_left = 14
		sb.content_margin_right = 14
		sb.content_margin_top = 4
		sb.content_margin_bottom = 4
		th.set_stylebox(state, "Button", sb)
	th.set_color("font_color", "Button", ink)
	th.set_color("font_hover_color", "Button", paper)
	th.set_color("font_pressed_color", "Button", paper)
	th.set_color("font_color", "Label", ink)
	th.set_color("default_color", "RichTextLabel", ink)
	th.set_font("italics_font", "RichTextLabel", font_it)
	return th


func _panel(bg: Color, border: Color, border_w := 1, pad := 14) -> StyleBoxFlat:
	var sb := StyleBoxFlat.new()
	sb.bg_color = bg
	sb.border_color = border
	sb.set_border_width_all(border_w)
	sb.set_content_margin_all(pad)
	return sb


func _build_ui(words: Dictionary) -> void:
	var layer := CanvasLayer.new()
	add_child(layer)
	ui.theme = _theme()
	ui.set_anchors_preset(Control.PRESET_FULL_RECT)
	ui.mouse_filter = Control.MOUSE_FILTER_IGNORE
	layer.add_child(ui)

	page_panel = PanelContainer.new()
	page_panel.add_theme_stylebox_override("panel", _panel(Color(Stage.PAPER, 0.92), Color("#17140f6b")))
	page_label = RichTextLabel.new()
	page_label.custom_minimum_size = Vector2(0, 30)
	page_label.add_theme_font_size_override("normal_font_size", 20)
	page_label.meta_clicked.connect(func(meta): seek(page.time_of(meta)))
	page_panel.add_child(page_label)
	ui.add_child(page_panel)
	page = Page.new(page_label, words)

	var bar := HBoxContainer.new()
	bar.add_theme_constant_override("separation", 8)
	play_btn = _button(bar, "Play", toggle_play)
	_button(bar, "Restart", func(): seek(0.0))
	mode_btn = _button(bar, "Explore", func(): set_mode("explore" if mode == "watch" else "watch"))
	layout_btn = _button(bar, "Text: Bottom", func(): _set_layout(LAYOUTS[(LAYOUTS.find(layout) + 1) % LAYOUTS.size()]))
	bar.set_anchors_and_offsets_preset(Control.PRESET_CENTER_BOTTOM, Control.PRESET_MODE_MINSIZE, 16)
	bar.grow_horizontal = Control.GROW_DIRECTION_BOTH
	ui.add_child(bar)

	hint = _label("Explore: W A S D to walk · drag or ← → to look · E to inspect · Tab to return", 17)
	hint.add_theme_stylebox_override("normal", _panel(Color(Stage.PAPER, 0.9), Color("#17140f6b"), 1, 6))
	hint.set_anchors_and_offsets_preset(Control.PRESET_CENTER_TOP, Control.PRESET_MODE_MINSIZE, 16)
	hint.grow_horizontal = Control.GROW_DIRECTION_BOTH
	prompt = _label("", 19)
	prompt.add_theme_font_override("font", font_it)
	prompt.add_theme_stylebox_override("normal", _panel(Color(Stage.PAPER, 0.9), Color("#17140f6b"), 1, 6))
	prompt.set_anchors_and_offsets_preset(Control.PRESET_CENTER_BOTTOM, Control.PRESET_MODE_MINSIZE, 70)
	prompt.grow_horizontal = Control.GROW_DIRECTION_BOTH
	prompt.visible = false

	card = PanelContainer.new()
	card.add_theme_stylebox_override("panel", _panel(Stage.PAPER, Color("#17140f"), 2, 22))
	var cv := VBoxContainer.new()
	card_title = _label("", 24, cv)
	card_title.add_theme_font_override("font", font_it)
	card_text = _label("", 20, cv)
	card_text.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	card_text.custom_minimum_size = Vector2(420, 0)
	_button(cv, "Close", _close_card)
	card.add_child(cv)
	card.set_anchors_and_offsets_preset(Control.PRESET_CENTER, Control.PRESET_MODE_MINSIZE)
	card.grow_horizontal = Control.GROW_DIRECTION_BOTH
	card.grow_vertical = Control.GROW_DIRECTION_BOTH
	card.visible = false
	ui.add_child(card)

	fade_rect = ColorRect.new()
	fade_rect.color = Color(0, 0, 0, 0)
	fade_rect.set_anchors_preset(Control.PRESET_FULL_RECT)
	fade_rect.mouse_filter = Control.MOUSE_FILTER_IGNORE
	ui.add_child(fade_rect)
	end_card = _centered_column([
		["“…never once considering how in the world she was to get out again.”", 26, font_rm, Stage.PAPER],
		["End of the riverbank slice", 20, font_it, Stage.PAPER],
	])
	end_card.visible = false

	intro = _centered_column([
		["Alice’s Adventures in Wonderland", 46, font_rm, Stage.INK],
		["Chapter I · Down the Rabbit-Hole", 22, font_it, Stage.INK],
		["Vertical slice: the riverbank (Godot build). Narration is the LibriVox full-cast reading.\nThe White Rabbit is Tenniel’s engraving; Alice, her sister and the set are placeholders.", 17, font_rm, Color("#17140f6b")],
	], true)
	var begin := _button(intro.get_meta("col"), "Begin", _begin)
	begin.size_flags_horizontal = Control.SIZE_SHRINK_CENTER


func _begin() -> void:
	intro.visible = false
	player.play(0.0)
	_refresh_buttons()


func _button(parent: Node, text: String, cb: Callable) -> Button:
	var b := Button.new()
	b.text = text
	b.pressed.connect(cb)
	parent.add_child(b)
	return b


func _label(text: String, size: int, parent: Node = null) -> Label:
	var l := Label.new()
	l.text = text
	l.add_theme_font_size_override("font_size", size)
	(parent if parent else ui).add_child(l)
	return l


func _centered_column(lines: Array, paper_bg := false) -> Control:
	var root := Control.new()
	root.set_anchors_preset(Control.PRESET_FULL_RECT)
	root.mouse_filter = Control.MOUSE_FILTER_IGNORE
	if paper_bg:
		var bg := ColorRect.new()
		bg.color = Stage.PAPER
		bg.set_anchors_preset(Control.PRESET_FULL_RECT)
		root.add_child(bg)
	var col := VBoxContainer.new()
	col.alignment = BoxContainer.ALIGNMENT_CENTER
	col.set_anchors_preset(Control.PRESET_FULL_RECT)
	col.add_theme_constant_override("separation", 14)
	root.add_child(col)
	root.set_meta("col", col)
	for line in lines:
		var l := Label.new()
		l.text = line[0]
		l.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		l.add_theme_font_size_override("font_size", line[1])
		l.add_theme_font_override("font", line[2])
		l.add_theme_color_override("font_color", line[3])
		col.add_child(l)
	ui.add_child(root)
	return root


func _refresh_buttons() -> void:
	play_btn.text = "Pause" if player.playing and not player.stream_paused else "Play"
	mode_btn.text = "Explore" if mode == "watch" else "Back to the story"
	hint.visible = mode == "explore"
	page_panel.visible = mode == "watch"


func _open_card(h: Dictionary) -> void:
	shown_hotspot = h
	card_title.text = h["title"]
	card_text.text = h["text"]
	card.visible = true


func _close_card() -> void:
	shown_hotspot = null
	card.visible = false


# ---------------------------------------------------------------- smoke test

func _shot(path: String) -> void:
	for i in 3:
		await get_tree().process_frame
	await RenderingServer.frame_post_draw
	get_viewport().get_texture().get_image().save_png(path)


func _smoke(out: String) -> void:
	DirAccess.make_dir_recursive_absolute(out)
	await get_tree().process_frame
	await _shot(out + "/00-intro.png")
	intro.visible = false
	_refresh_buttons()
	var T := tl.T
	var moments := [["01-wide", 1.0], ["02-alice-and-sister", T.alice + 7], ["03-book", T.book + 3],
		["04-rabbit-runs", T.ran_close], ["05-watch", T.watch + 2.5], ["06-alice-stands", T.started + 1.5],
		["07-chase", T.ran_across + 2.5], ["08-pop", T.pop + 0.2], ["09-end", T.end + 2]]
	for m in moments:
		t_override = m[1]
		await _shot("%s/%s.png" % [out, m[0]])
	for l in ["top", "side"]:
		_set_layout(l)
		t_override = T.watch + 2.5
		await _shot("%s/12-layout-%s.png" % [out, l])
	_set_layout("bottom")
	t_override = T.alice + 7
	await _shot(out + "/_pre-explore.png")
	set_mode("explore")
	_walk(1, 0, 0.6)
	await _shot(out + "/10-explore.png")
	_look(-10.0, 0.0)
	for i in 60:
		_walk(0, 1, 1.0 / 15.0)
	await _shot(out + "/11-explore-arc-limit.png")
	print("SMOKE_DONE cam=%s yaw_deg=%.1f" % [cam.global_position, rad_to_deg(yaw)])
	get_tree().quit()
