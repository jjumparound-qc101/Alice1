# The riverbank diorama: paper flats arranged in depth, like a Victorian toy theater.
# Port of src/stage.js. Units are metres; the audience looks down -Z.
class_name Stage
extends RefCounted

const PAPER := Color("#efe9da")
const INK := Color("#17140f")
const EDGE := Color("#8b8272")  # the cut paper edge seen behind each flat


static func tex(name: String) -> Texture2D:
	return load("res://art/%s.png" % name)


# A flat paper cutout with a visible paper thickness behind it.
static func flat(t: Texture2D, w: float, h: float, bottom := true, edge := true, opaque := false) -> Node3D:
	var root := Node3D.new()
	root.add_child(_quad(t, w, h, bottom, Color.WHITE, opaque))
	if edge:
		var back := _quad(t, w, h, bottom, EDGE, opaque)
		back.position = Vector3(0.012, -0.012, -0.018)
		root.add_child(back)
	return root


static func _quad(t: Texture2D, w: float, h: float, bottom: bool, tint: Color, opaque: bool) -> MeshInstance3D:
	var mesh := QuadMesh.new()
	mesh.size = Vector2(w, h)
	if bottom:
		mesh.center_offset = Vector3(0, h / 2.0, 0)
	var mat := StandardMaterial3D.new()
	mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	mat.albedo_texture = t
	mat.albedo_color = tint
	mat.cull_mode = BaseMaterial3D.CULL_DISABLED
	mat.texture_filter = BaseMaterial3D.TEXTURE_FILTER_LINEAR_WITH_MIPMAPS_ANISOTROPIC
	mat.texture_repeat = false  # clamp, so a flat's edge doesn't pick up its opposite edge
	if not opaque:
		mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA_SCISSOR
		mat.alpha_scissor_threshold = 0.5
	var mi := MeshInstance3D.new()
	mi.mesh = mesh
	mi.material_override = mat
	return mi


static func _at(node: Node3D, parent: Node, pos: Vector3) -> Node3D:
	parent.add_child(node)
	node.position = pos
	return node


static func build(parent: Node3D) -> Dictionary:
	var env := Environment.new()
	env.background_mode = Environment.BG_COLOR
	env.background_color = PAPER
	env.fog_enabled = true
	env.fog_mode = Environment.FOG_MODE_DEPTH
	env.fog_light_color = PAPER
	env.fog_density = 1.0
	env.fog_depth_begin = 9.0
	env.fog_depth_end = 34.0
	env.fog_depth_curve = 1.0
	var we := WorldEnvironment.new()
	we.environment = env
	parent.add_child(we)

	# The floor stops at the proscenium, like a real stage.
	var floor_mesh := PlaneMesh.new()
	floor_mesh.size = Vector2(40, 17.2)
	var fm := StandardMaterial3D.new()
	fm.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	fm.albedo_texture = tex("ground")
	fm.uv1_scale = Vector3(14, 6, 1)
	fm.texture_filter = BaseMaterial3D.TEXTURE_FILTER_LINEAR_WITH_MIPMAPS_ANISOTROPIC
	var floor_node := MeshInstance3D.new()
	floor_node.mesh = floor_mesh
	floor_node.material_override = fm
	_at(floor_node, parent, Vector3(0, 0, -6.4))

	# Back to front. Widths are generous so the 90-degree look arc never finds an edge.
	_at(flat(tex("sky"), 40, 14, false, false, true), parent, Vector3(0, -0.5 + 7, -11))
	_at(flat(tex("treeline"), 34, 8.5, true, false), parent, Vector3(0, 0, -8.5))

	var hole_fraction := 0.45
	var hedge_w := 9.0
	var hedge_x := 3.2
	var hedge_z := -4.6
	_at(flat(tex("hedge"), hedge_w, 2.8), parent, Vector3(hedge_x, 0, hedge_z))
	var hole_pos := Vector3(hedge_x + (hole_fraction - 0.5) * hedge_w, 0, hedge_z + 0.05)

	_at(flat(tex("tree"), 5, 6.8), parent, Vector3(-4.4, 0, -3.3))
	for wing in [[-7.2, 0.4, 1.0], [7.4, -1.2, -1.0], [-7.6, -5.6, 1.0], [7.8, -6.4, -1.0]]:
		var w := _at(flat(tex("tree"), 4.4, 6.2), parent, Vector3(wing[0], 0, wing[1]))
		w.scale.x = wing[2]
	_at(flat(tex("grass5"), 32, 0.55, true, false), parent, Vector3(0, 0, 1.0))
	_at(flat(tex("grass6"), 32, 0.55, true, false), parent, Vector3(0.5, 0, -0.9))
	_at(flat(tex("proscenium"), 12, 7.2), parent, Vector3(0, 0, 2.2))

	return {
		"hole_pos": hole_pos,
		"bounds": {"min_x": -4.8, "max_x": 4.8, "min_z": -3.6, "max_z": 1.6},
		"hotspots": [
			{"pos": Vector3(-3.25, 0.7, -2.6), "title": "Her sister’s book",
				"text": "“and what is the use of a book,” thought Alice, “without pictures or conversations?”"},
			{"pos": hole_pos + Vector3(0, 0.4, 0), "title": "The rabbit-hole",
				"text": "…just in time to see it pop down a large rabbit-hole under the hedge."},
		],
	}
