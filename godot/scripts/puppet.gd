# A toy-theater puppet: a paper cutout that slides on the floor, hops when it
# moves, and turns partly toward the camera. Port of src/puppet.js.
class_name Puppet
extends Node3D

const MAX_TURN := 0.6  # radians the cutout may turn toward the camera

var height: float
var poses := {}
var pose := ""


# pose_defs: { name: { "tex": Texture2D, "faces_left": bool, "height"?: float } }
func _init(pose_defs: Dictionary, h: float) -> void:
	height = h
	for pose_name in pose_defs:
		var p: Dictionary = pose_defs[pose_name]
		var t: Texture2D = p["tex"]
		var ph: float = p.get("height", h)
		var f := Stage.flat(t, ph * float(t.get_width()) / t.get_height(), ph)
		f.visible = false
		f.set_meta("faces_left", p["faces_left"])
		add_child(f)
		poses[pose_name] = f


# s: { pose, x, z, visible?, moving?, dir? (+1 right / -1 left), sink? (0..1), phase? }
func apply(s: Dictionary, cam: Camera3D) -> void:
	visible = s.get("visible", true)
	if not visible:
		return
	if s["pose"] != pose:
		if pose != "":
			poses[pose].visible = false
		poses[s["pose"]].visible = true
		pose = s["pose"]
	var f: Node3D = poses[pose]
	var moving: bool = s.get("moving", false)
	var phase: float = s.get("phase", 0.0)
	var hop := absf(sin(phase * TAU)) * 0.12 * height if moving else 0.0
	var sink: float = s.get("sink", 0.0)
	position = Vector3(s["x"], hop - sink * height * 1.1, s["z"])
	# Mirror so the figure faces its direction of travel.
	var facing_left: bool = s.get("dir", -1) < 0
	f.scale.x = 1.0 if facing_left == f.get_meta("faces_left") else -1.0
	f.rotation.z = sin(phase * TAU) * 0.06 if moving else 0.0
	# Turn toward the camera, within limits.
	var to_cam := atan2(cam.global_position.x - s["x"], cam.global_position.z - s["z"])
	rotation.y = clampf(to_cam, -MAX_TURN, MAX_TURN)
